/**
 * USDT-M futures PAPER broker (isolated margin, one-way per symbol+side).
 * Reuses the repo's fee model (@bitget-sim/shared fees → Bitget swap maker/taker).
 * Initial margin / isolated liquidation use the SAME formulas as
 * packages/engine/src/risk/futures.ts (calcInitialMargin / calcLiqPrice), mirrored here so the
 * mobile bundle doesn't pull the whole shared index (which re-exports scalper internals).
 * The core Engine class only matches spot orders, so futures accounting lives here.
 */
import { getFeeRate } from '@bitget-sim/shared/fees';

/** = engine calcInitialMargin: qty × price / leverage */
function calcInitialMargin(qty: number, price: number, leverage: number): number {
  return (qty * price) / (leverage > 0 ? leverage : 1);
}
import type { SetupKind, Side, Target } from './types';

export const DEFAULT_BANKROLL = 200;
export const TAKER_FEE = Number(getFeeRate('bitget_default', 'swap', 'taker'));
export const MAKER_FEE = Number(getFeeRate('bitget_default', 'swap', 'maker'));

export interface PaperTarget extends Target {
  done: boolean;
}

export interface PaperPosition {
  id: string;
  symbol: string;
  side: Side;
  qty: number;
  origQty: number;
  entry: number;
  leverage: number;
  margin: number;
  sl: number;
  initialSl: number;
  targets: PaperTarget[];
  setup: SetupKind | 'manual';
  signalId?: string;
  /** broken box edge for breakout positions (pyramiding retest level) */
  breakoutLevel?: number;
  adds: number;
  entryFeeLeft: number;
  realizedNet: number;
  beMoved: boolean;
  liqPrice: number;
  mmr: number;
  openedAt: number;
}

export interface ClosedFill {
  id: string;
  positionId: string;
  symbol: string;
  side: Side;
  setup: SetupKind | 'manual';
  qty: number;
  entry: number;
  exit: number;
  grossPnl: number;
  fees: number;
  netPnl: number;
  reason: string;
  openedAt: number;
  closedAt: number;
  /** true when this fill fully closed the position */
  final: boolean;
}

export interface PendingOrder {
  id: string;
  symbol: string;
  side: Side;
  qty: number;
  price: number;
  leverage: number;
  sl: number;
  targets: Target[];
  setup: SetupKind | 'manual';
  signalId?: string;
  breakoutLevel?: number;
  createdAt: number;
}

export interface BrokerState {
  wallet: number;
  bankroll: number;
  positions: PaperPosition[];
  fills: ClosedFill[];
  pending: PendingOrder[];
  equityCurve: Array<{ t: number; equity: number }>;
  seq: number;
}

export interface OpenArgs {
  symbol: string;
  side: Side;
  qty: number;
  price: number;
  leverage: number;
  sl: number;
  targets: Target[];
  setup: SetupKind | 'manual';
  signalId?: string;
  breakoutLevel?: number;
  liquidity?: 'maker' | 'taker';
  mmr?: number;
}

export interface BrokerEvent {
  kind: 'open' | 'add' | 'tp' | 'sl' | 'liq' | 'close' | 'limit_fill' | 'be';
  message: string;
  positionId?: string;
}

export function newBrokerState(bankroll = DEFAULT_BANKROLL): BrokerState {
  return { wallet: bankroll, bankroll, positions: [], fills: [], pending: [], equityCurve: [{ t: Date.now(), equity: bankroll }], seq: 0 };
}

const dir = (s: Side) => (s === 'long' ? 1 : -1);

export function upnl(p: PaperPosition, mark: number): number {
  return dir(p.side) * (mark - p.entry) * p.qty;
}

/** = engine calcLiqPrice (isolated): long entry×(1−1/lev+mmr), short entry×(1+1/lev−mmr) */
function liqOf(side: Side, entry: number, leverage: number, mmr: number): number {
  const inv = 1 / (leverage || 1);
  return side === 'long' ? entry * (1 - inv + mmr) : entry * (1 + inv - mmr);
}

export class PaperBroker {
  state: BrokerState;
  moveSlToBe = true;

  constructor(state?: BrokerState) {
    this.state = state ? structuredCloneSafe(state) : newBrokerState();
  }

  private nextId(prefix: string): string {
    this.state.seq += 1;
    return `${prefix}${Date.now().toString(36)}${this.state.seq}`;
  }

  reset(bankroll = DEFAULT_BANKROLL): void {
    this.state = newBrokerState(bankroll);
  }

  usedMargin(): number {
    return this.state.positions.reduce((s, p) => s + p.margin, 0) +
      this.state.pending.reduce((s, o) => s + (o.qty * o.price) / o.leverage, 0);
  }

  available(): number {
    return this.state.wallet - this.usedMargin();
  }

  equity(marks: Record<string, number>): number {
    return this.state.wallet + this.state.positions.reduce((s, p) => s + upnl(p, marks[p.symbol] ?? p.entry), 0);
  }

  open(a: OpenArgs, ts = Date.now()): { ok: boolean; error?: string; position?: PaperPosition; events: BrokerEvent[] } {
    const events: BrokerEvent[] = [];
    if (!(a.qty > 0) || !(a.price > 0)) return { ok: false, error: '수량/가격 오류', events };
    const feeRate = a.liquidity === 'maker' ? MAKER_FEE : TAKER_FEE;
    const notional = a.qty * a.price;
    const fee = notional * feeRate;
    const im = calcInitialMargin(a.qty, a.price, a.leverage);
    if (im + fee > this.available() + 1e-9) return { ok: false, error: `증거금 부족 (필요 ${(im + fee).toFixed(2)} USDT)`, events };
    const mmr = a.mmr ?? 0.005;
    const existing = this.state.positions.find((p) => p.symbol === a.symbol && p.side === a.side);
    this.state.wallet -= fee;
    if (existing) {
      const newQty = existing.qty + a.qty;
      existing.entry = (existing.entry * existing.qty + a.price * a.qty) / newQty;
      existing.qty = newQty;
      existing.origQty += a.qty;
      existing.margin += im;
      existing.entryFeeLeft += fee;
      existing.adds += 1;
      existing.liqPrice = liqOf(existing.side, existing.entry, existing.leverage, existing.mmr);
      events.push({ kind: 'add', positionId: existing.id, message: `불타기 추가 ${a.qty.toFixed(4)} @ ${a.price.toFixed(2)}` });
      this.snapEquity({ [a.symbol]: a.price }, ts);
      return { ok: true, position: existing, events };
    }
    const pos: PaperPosition = {
      id: this.nextId('p'),
      symbol: a.symbol,
      side: a.side,
      qty: a.qty,
      origQty: a.qty,
      entry: a.price,
      leverage: a.leverage,
      margin: im,
      sl: a.sl,
      initialSl: a.sl,
      targets: a.targets.map((t) => ({ ...t, done: false })),
      setup: a.setup,
      signalId: a.signalId,
      breakoutLevel: a.breakoutLevel,
      adds: 0,
      entryFeeLeft: fee,
      realizedNet: 0,
      beMoved: false,
      liqPrice: liqOf(a.side, a.price, a.leverage, mmr),
      mmr,
      openedAt: ts,
    };
    this.state.positions.push(pos);
    events.push({ kind: 'open', positionId: pos.id, message: `${a.side === 'long' ? '롱' : '숏'} 진입 ${a.qty.toFixed(4)} ${a.symbol} @ ${a.price.toFixed(2)}` });
    this.snapEquity({ [a.symbol]: a.price }, ts);
    return { ok: true, position: pos, events };
  }

  placeLimit(a: Omit<PendingOrder, 'id' | 'createdAt'>, ts = Date.now()): { ok: boolean; error?: string } {
    const im = (a.qty * a.price) / a.leverage;
    if (im > this.available()) return { ok: false, error: '증거금 부족' };
    this.state.pending.push({ ...a, id: this.nextId('o'), createdAt: ts });
    return { ok: true };
  }

  cancelLimit(id: string): void {
    this.state.pending = this.state.pending.filter((o) => o.id !== id);
  }

  /** Close `qty` of a position at `price`. Fees: taker (market/stop) per Bitget swap profile. */
  close(positionId: string, qty: number, price: number, reason: string, ts = Date.now()): ClosedFill | null {
    const p = this.state.positions.find((x) => x.id === positionId);
    if (!p) return null;
    const q = Math.min(qty, p.qty);
    if (!(q > 0)) return null;
    const gross = dir(p.side) * (price - p.entry) * q;
    const exitFee = q * price * TAKER_FEE;
    const entryFeeShare = p.entryFeeLeft * (q / p.qty);
    const marginShare = p.margin * (q / p.qty);
    p.entryFeeLeft -= entryFeeShare;
    p.margin -= marginShare;
    p.qty -= q;
    this.state.wallet += gross - exitFee;
    const net = gross - exitFee - entryFeeShare;
    p.realizedNet += net;
    const final = p.qty <= 1e-12;
    const fill: ClosedFill = {
      id: this.nextId('f'),
      positionId: p.id,
      symbol: p.symbol,
      side: p.side,
      setup: p.setup,
      qty: q,
      entry: p.entry,
      exit: price,
      grossPnl: gross,
      fees: exitFee + entryFeeShare,
      netPnl: net,
      reason,
      openedAt: p.openedAt,
      closedAt: ts,
      final,
    };
    this.state.fills.push(fill);
    if (final) this.state.positions = this.state.positions.filter((x) => x.id !== p.id);
    this.snapEquity({ [p.symbol]: price }, ts);
    return fill;
  }

  closeFraction(positionId: string, fraction: number, price: number, reason: string, ts = Date.now()): ClosedFill | null {
    const p = this.state.positions.find((x) => x.id === positionId);
    if (!p) return null;
    return this.close(positionId, fraction >= 1 ? p.qty : p.qty * fraction, price, reason, ts);
  }

  /** Tick-driven triggers: limit fills, liquidation, SL, TP1/TP2 (+ breakeven move). */
  onPrice(symbol: string, price: number, ts = Date.now()): BrokerEvent[] {
    const ev: BrokerEvent[] = [];
    for (const o of [...this.state.pending]) {
      if (o.symbol !== symbol) continue;
      const hit = o.side === 'long' ? price <= o.price : price >= o.price;
      if (!hit) continue;
      this.state.pending = this.state.pending.filter((x) => x.id !== o.id);
      const r = this.open({ ...o, liquidity: 'maker' }, ts);
      if (r.ok) ev.push({ kind: 'limit_fill', positionId: r.position?.id, message: `지정가 체결 ${o.side === 'long' ? '롱' : '숏'} @ ${o.price.toFixed(2)}` });
      else ev.push({ kind: 'close', message: `지정가 체결 실패: ${r.error}` });
    }
    for (const p of [...this.state.positions]) {
      if (p.symbol !== symbol) continue;
      const long = p.side === 'long';
      if (p.liqPrice > 0 && (long ? price <= p.liqPrice : price >= p.liqPrice)) {
        this.close(p.id, p.qty, p.liqPrice, '강제청산', ts);
        ev.push({ kind: 'liq', positionId: p.id, message: `강제청산 @ ${p.liqPrice.toFixed(2)}` });
        continue;
      }
      if (long ? price <= p.sl : price >= p.sl) {
        const why = p.beMoved ? '본절 SL' : '손절 SL';
        this.close(p.id, p.qty, p.sl, why, ts);
        ev.push({ kind: 'sl', positionId: p.id, message: `${why} 체결 @ ${p.sl.toFixed(2)}` });
        continue;
      }
      for (let k = 0; k < p.targets.length; k++) {
        const t = p.targets[k];
        if (t.done) continue;
        if (!(long ? price >= t.price : price <= t.price)) break;
        t.done = true;
        const isLast = p.targets.slice(k + 1).every((x) => x.done);
        const q = isLast ? p.qty : Math.min(p.qty, p.origQty * t.fraction);
        const f = this.close(p.id, q, t.price, t.label, ts);
        ev.push({ kind: 'tp', positionId: p.id, message: `${t.label} 체결 @ ${t.price.toFixed(2)} (순손익 ${f?.netPnl.toFixed(2)} USDT)` });
        const still = this.state.positions.find((x) => x.id === p.id);
        if (!still) break;
        if (k === 0 && this.moveSlToBe && !still.beMoved) {
          still.sl = still.entry;
          still.beMoved = true;
          ev.push({ kind: 'be', positionId: p.id, message: 'TP1 후 SL → 본절 이동' });
        }
      }
    }
    return ev;
  }

  snapEquity(marks: Record<string, number>, ts = Date.now()): void {
    const eq = this.equity(marks);
    const c = this.state.equityCurve;
    c.push({ t: ts, equity: eq });
    if (c.length > 2000) c.splice(0, c.length - 2000);
  }
}

function structuredCloneSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

/** Aggregate stats over position-level results (fills grouped by positionId). */
export function tradeStats(fills: ClosedFill[]): { trades: number; wins: number; winRate: number; net: number; fees: number } {
  const byPos = new Map<string, number>();
  let fees = 0;
  for (const f of fills) {
    byPos.set(f.positionId, (byPos.get(f.positionId) ?? 0) + f.netPnl);
    fees += f.fees;
  }
  const results = [...byPos.values()];
  const wins = results.filter((x) => x > 0).length;
  return {
    trades: results.length,
    wins,
    winRate: results.length ? wins / results.length : 0,
    net: results.reduce((s, x) => s + x, 0),
    fees,
  };
}

export function fillsToCsv(fills: ClosedFill[]): string {
  const head = ['closedAt', 'symbol', 'side', 'setup', 'qty', 'entry', 'exit', 'grossPnl', 'fees', 'netPnl', 'reason', 'positionId'];
  const rows = fills.map((f) => [
    new Date(f.closedAt).toISOString(), f.symbol, f.side, f.setup, f.qty, f.entry, f.exit,
    f.grossPnl.toFixed(4), f.fees.toFixed(4), f.netPnl.toFixed(4), `"${f.reason.replace(/"/g, '""')}"`, f.positionId,
  ].join(','));
  return [head.join(','), ...rows].join('\n');
}
