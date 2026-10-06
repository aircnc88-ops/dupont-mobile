/**
 * USDT-M futures PAPER broker (isolated margin, one-way per symbol+side).
 * Reuses the repo's fee model (@bitget-sim/shared fees → Bitget swap maker/taker).
 * Initial margin / isolated liquidation use the SAME formulas as
 * packages/engine/src/risk/futures.ts (calcInitialMargin / calcLiqPrice), mirrored here so the
 * mobile bundle doesn't pull the whole shared index (which re-exports unrelated monorepo modules).
 * The core Engine class only matches spot orders, so futures accounting lives here.
 */
import { getFeeRate } from '@bitget-sim/shared/fees';

/** = engine calcInitialMargin: qty × price / leverage */
function calcInitialMargin(qty: number, price: number, leverage: number): number {
  return (qty * price) / (leverage > 0 ? leverage : 1);
}
import type { SignalType } from '@bitget-sim/dupont';

export type Side = 'long' | 'short';
/** Dupont signal type that opened the position, or MANUAL. */
export type SetupKind = SignalType | 'MANUAL';
export interface Target {
  price: number;
  /** fraction of the ORIGINAL position size closed at this target */
  fraction: number;
  label: string;
}

export const DEFAULT_BANKROLL = 200;
export const TAKER_FEE = Number(getFeeRate('bitget_default', 'swap', 'taker'));
export const MAKER_FEE = Number(getFeeRate('bitget_default', 'swap', 'maker'));
/** Paper slippage on market entries/closes and stop fills (TP and limit fills execute at their price). */
export const SLIPPAGE_BPS = 2;
export const SLIP = SLIPPAGE_BPS / 10_000;
/** Bitget USDT-M minimum order value */
export const MIN_ORDER_USDT = 5;
/** Funding settles every 8h at 00:00 / 08:00 / 16:00 UTC (epoch multiples of 8h). */
export const FUNDING_INTERVAL_MS = 8 * 3_600_000;

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
  setup: SetupKind;
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
  /** first fill price (entry is averaged by adds) */
  initialEntry?: number;
  /** planned loss at SL in USDT incl. fees + slippage, summed over the entry and each add (R denominator) */
  riskUsd?: number;
  /** open ts of the retest candle used by the last pyramid add */
  lastAddTs?: number;
  /** funding paid (+) / received (−) and not yet attributed to a close */
  fundingAcc?: number;
  /** last funding boundary charged */
  lastFundingTs?: number;
  /** qty of the first fill (N6: base for pyramid add sizing) */
  initialQty?: number;
  /** A3 / owner decision 5: risk budget fixed at entry (wallet × risk% at open); adds keep the combined loss at SL within it */
  riskBudget?: number;
}

export interface ClosedFill {
  id: string;
  positionId: string;
  symbol: string;
  side: Side;
  setup: SetupKind;
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
  /** funding attributed to this fill (included in netPnl) */
  funding?: number;
  /** netPnl / position riskUsd (R multiple of this fill) */
  r?: number;
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
  setup: SetupKind;
  signalId?: string;
  breakoutLevel?: number;
  /** risk budget captured when the order was placed (becomes the position's riskBudget on fill) */
  riskBudget?: number;
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
  /** ts of the last price processed per symbol (live tick or offline replay) — N1 */
  lastTickTs?: Record<string, number>;
  /** ticker funding rates seen per symbol as [ts, rate] (appended on change / new period) — N5 fallback */
  rateSeen?: Record<string, Array<[number, number]>>;
  /** settled funding rates per symbol keyed by boundary ts (Bitget history-fund-rate) — N5 primary */
  settledRates?: Record<string, Record<string, number>>;
}

export interface OpenArgs {
  symbol: string;
  side: Side;
  qty: number;
  price: number;
  leverage: number;
  sl: number;
  targets: Target[];
  setup: SetupKind;
  signalId?: string;
  breakoutLevel?: number;
  liquidity?: 'maker' | 'taker';
  mmr?: number;
  /** pyramid add to an existing same-side position (otherwise a same-side open is rejected) */
  isAdd?: boolean;
  /** open ts of the retest candle for an add */
  candleTs?: number;
  /** market reference price (ask for longs / bid for shorts) before slippage; default `price` */
  refPx?: number;
  /** risk budget (USDT) fixed for the position at entry; adds are rejected when the combined loss at SL would exceed it */
  riskBudget?: number;
}

export interface BrokerEvent {
  kind: 'open' | 'add' | 'tp' | 'sl' | 'liq' | 'close' | 'limit_fill' | 'be' | 'funding';
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

/**
 * Combined loss at `newSl` (USDT, signed: negative = SL already in profit) if `addQty` is added at `fill`:
 * price distance on the averaged entry + leftover entry fees + the add's taker entry fee + taker exit fee + stop slippage.
 */
export function lossAtSlAfterAdd(p: Pick<PaperPosition, 'side' | 'qty' | 'entry' | 'entryFeeLeft'>, addQty: number, fill: number, newSl: number, slip = SLIP, addFeeRate = TAKER_FEE): number {
  const nq = p.qty + addQty;
  const avg = (p.entry * p.qty + fill * addQty) / nq;
  return dir(p.side) * (avg - newSl) * nq + p.entryFeeLeft + addQty * fill * addFeeRate + nq * newSl * (TAKER_FEE + slip);
}

/** Planned loss at SL (USDT) for `qty` filled at `fill`: price distance + entry fee + taker exit fee + stop slippage. */
export function plannedRisk(side: Side, fill: number, sl: number, qty: number, entryFee: number): number {
  return Math.max(0, dir(side) * (fill - sl)) * qty + entryFee + qty * sl * (TAKER_FEE + SLIP);
}

/** Price at which closing the remaining qty nets exactly 0 after the leftover entry fee and a taker exit fee
 *  (+ stop slippage by default, since the BE stop fills as a stop-market), rounded away from entry to the
 *  price tick so it never closes at a net loss. */
export function feeBreakeven(p: PaperPosition, dp: number, exitFee = TAKER_FEE + SLIP): number {
  const q = p.qty;
  const raw = p.side === 'long' ? (p.entry * q + p.entryFeeLeft) / (q * (1 - exitFee)) : (p.entry * q - p.entryFeeLeft) / (q * (1 + exitFee));
  const m = 10 ** dp;
  return p.side === 'long' ? Math.ceil(raw * m - 1e-9) / m : Math.floor(raw * m + 1e-9) / m;
}

export class PaperBroker {
  state: BrokerState;
  moveSlToBe = true;
  /** display precision per symbol (price decimals, qty decimals) for event messages */
  precision: (symbol: string) => { dp: number; qdp: number } = () => ({ dp: 2, qdp: 4 });
  private px(symbol: string, v: number): string { return v.toLocaleString('en-US', { minimumFractionDigits: this.precision(symbol).dp, maximumFractionDigits: this.precision(symbol).dp }); }
  private qx(symbol: string, v: number): string { return v.toFixed(this.precision(symbol).qdp); }

  slip = SLIP;
  minOrderUsdt = MIN_ORDER_USDT;
  private step(symbol: string): number { return 10 ** -this.precision(symbol).qdp; }
  private floorStep(symbol: string, q: number): number {
    const d = this.precision(symbol).qdp, st = this.step(symbol);
    return Number((Math.floor(q / st + 1e-9) * st).toFixed(d));
  }

  constructor(state?: BrokerState) {
    this.state = state ? structuredCloneSafe(state) : newBrokerState();
    // migrate positions persisted before R/funding accounting existed
    for (const p of this.state.positions) {
      p.initialEntry ??= p.entry;
      p.fundingAcc ??= 0;
      p.riskUsd ??= plannedRisk(p.side, p.entry, p.initialSl, p.origQty, p.origQty * p.entry * TAKER_FEE);
    }
    this.state.lastTickTs ??= {};
    this.state.rateSeen ??= {};
    this.state.settledRates ??= {};
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

  open(a: OpenArgs, ts = Date.now()): { ok: boolean; error?: string; position?: PaperPosition; fillPx?: number; events: BrokerEvent[] } {
    const events: BrokerEvent[] = [];
    if (!(a.qty > 0) || !(a.price > 0)) return { ok: false, error: '수량/가격 오류', events };
    const maker = a.liquidity === 'maker';
    const feeRate = maker ? MAKER_FEE : TAKER_FEE;
    // market fills: book side (if given) worsened by slippage; limit fills at the limit price
    const fillPx = maker ? a.price : (a.refPx && a.refPx > 0 ? a.refPx : a.price) * (1 + dir(a.side) * this.slip);
    const notional = a.qty * fillPx;
    const fee = notional * feeRate;
    const im = calcInitialMargin(a.qty, fillPx, a.leverage);
    if (im + fee > this.available() + 1e-9) return { ok: false, error: `증거금 부족 (필요 ${(im + fee).toFixed(2)} USDT)`, events };
    const mmr = a.mmr ?? 0.005;
    const existing = this.state.positions.find((p) => p.symbol === a.symbol && p.side === a.side);
    if (existing && !a.isAdd) return { ok: false, error: '같은 방향 포지션 보유 중 (불타기는 불타기 버튼 사용)', events };
    if (!existing && a.isAdd) return { ok: false, error: '추가할 포지션 없음', events };
    const long = a.side === 'long';
    if (existing) {
      const newQty = existing.qty + a.qty;
      const avg = (existing.entry * existing.qty + fillPx * a.qty) / newQty;
      const sl = long ? Math.max(existing.sl, a.sl) : Math.min(existing.sl, a.sl); // an add never loosens the stop
      const liq = liqOf(existing.side, avg, existing.leverage, existing.mmr);
      if (long ? sl <= liq : sl >= liq) return { ok: false, error: 'SL이 청산가 밖 (추가 후 청산가 기준)', events };
      // A3 / owner decision 5: combined loss at the (never loosened) SL must stay within the budget fixed at entry
      if (existing.riskBudget !== undefined && lossAtSlAfterAdd(existing, a.qty, fillPx, sl, this.slip, feeRate) > existing.riskBudget + 1e-9) {
        return { ok: false, error: `추가 시 총 리스크가 진입 시 예산(${existing.riskBudget.toFixed(2)} USDT) 초과`, events };
      }
      this.state.wallet -= fee;
      existing.entry = avg;
      existing.qty = newQty;
      existing.origQty += a.qty;
      existing.margin += im;
      existing.entryFeeLeft += fee;
      existing.adds += 1;
      existing.sl = sl;
      existing.liqPrice = liq;
      existing.riskUsd = (existing.riskUsd ?? 0) + plannedRisk(a.side, fillPx, sl, a.qty, fee);
      if (a.candleTs !== undefined) existing.lastAddTs = a.candleTs;
      events.push({ kind: 'add', positionId: existing.id, message: `불타기 추가 ${this.qx(a.symbol, a.qty)} @ ${this.px(a.symbol, fillPx)}` });
      this.snapEquity({ [a.symbol]: fillPx }, ts);
      return { ok: true, position: existing, fillPx, events };
    }
    const liq = liqOf(a.side, fillPx, a.leverage, mmr);
    if (long ? a.sl <= liq : a.sl >= liq) return { ok: false, error: `SL이 청산가(${this.px(a.symbol, liq)}) 밖 – 레버리지를 낮추세요`, events };
    this.state.wallet -= fee;
    const pos: PaperPosition = {
      id: this.nextId('p'),
      symbol: a.symbol,
      side: a.side,
      qty: a.qty,
      origQty: a.qty,
      entry: fillPx,
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
      liqPrice: liq,
      mmr,
      openedAt: ts,
      initialEntry: fillPx,
      riskUsd: plannedRisk(a.side, fillPx, a.sl, a.qty, fee),
      fundingAcc: 0,
      initialQty: a.qty,
      riskBudget: a.riskBudget,
    };
    this.state.positions.push(pos);
    events.push({ kind: 'open', positionId: pos.id, message: `${a.side === 'long' ? '롱' : '숏'} 진입 ${this.qx(a.symbol, a.qty)} ${a.symbol} @ ${this.px(a.symbol, fillPx)}` });
    this.snapEquity({ [a.symbol]: fillPx }, ts);
    return { ok: true, position: pos, fillPx, events };
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

  /** Close `qty` of a position at `price` (already the execution price). Fees: taker per Bitget swap profile
   *  (TP exits too — conservative). Funding accrued since the last close is attributed pro rata. */
  close(positionId: string, qty: number, price: number, reason: string, ts = Date.now(), exitFeeRate = TAKER_FEE): ClosedFill | null {
    const p = this.state.positions.find((x) => x.id === positionId);
    if (!p) return null;
    const q = Math.min(qty, p.qty);
    if (!(q > 0)) return null;
    // R11: settle any boundary still waiting for its settled rate before qty shrinks
    // (fallback rate = last ticker rate before the boundary) — the position WAS held at that boundary
    this.accrueFunding(p.symbol, price, ts, 0);
    const share = q / p.qty;
    const gross = dir(p.side) * (price - p.entry) * q;
    const exitFee = q * price * exitFeeRate;
    const entryFeeShare = p.entryFeeLeft * share;
    const marginShare = p.margin * share;
    const fundingShare = (p.fundingAcc ?? 0) * share;
    p.entryFeeLeft -= entryFeeShare;
    p.margin -= marginShare;
    p.fundingAcc = (p.fundingAcc ?? 0) - fundingShare;
    p.qty = q >= p.qty - 1e-12 ? 0 : p.qty - q;
    this.state.wallet += gross - exitFee; // funding was already debited from the wallet when it settled
    const net = gross - exitFee - entryFeeShare - fundingShare;
    p.realizedNet += net + fundingShare; // realizedNet already carries the funding (debited at settlement)
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
      funding: fundingShare,
      r: p.riskUsd && p.riskUsd > 0 ? net / p.riskUsd : undefined,
    };
    this.state.fills.push(fill);
    if (final) this.state.positions = this.state.positions.filter((x) => x.id !== p.id);
    this.snapEquity({ [p.symbol]: price }, ts);
    return fill;
  }

  /** Qty for a partial close: floored to the contract step; if the remainder would be under the
   *  minimum order value (or nothing is left after flooring), the whole position is closed. */
  partialQty(p: PaperPosition, want: number, price: number): number {
    if (want >= p.qty - 1e-12) return p.qty;
    const q = this.floorStep(p.symbol, want);
    if (!(q > 0) || (p.qty - q) * price < this.minOrderUsdt) return p.qty;
    return q;
  }

  /** Market close of a fraction (manual): step-floored, slippage applied to the reference price. */
  closeFraction(positionId: string, fraction: number, price: number, reason: string, ts = Date.now()): ClosedFill | null {
    const p = this.state.positions.find((x) => x.id === positionId);
    if (!p) return null;
    const exec = price * (1 - dir(p.side) * this.slip);
    return this.close(positionId, this.partialQty(p, p.qty * Math.min(1, fraction), exec), exec, reason, ts);
  }

  /** true when a position on `symbol` has crossed a funding boundary whose settled rate is not cached yet */
  needsSettledRate(symbol: string, ts = Date.now()): boolean {
    return this.state.positions.some((p) => {
      if (p.symbol !== symbol) return false;
      const b = Math.floor((p.lastFundingTs ?? p.openedAt) / FUNDING_INTERVAL_MS) * FUNDING_INTERVAL_MS + FUNDING_INTERVAL_MS;
      return b <= ts && this.state.settledRates?.[symbol]?.[String(b)] === undefined;
    });
  }

  /** Record the ticker funding rate seen at `ts` (call AFTER accrueFunding for the same tick). */
  noteTickerRate(symbol: string, rate: number, ts = Date.now()): void {
    if (!Number.isFinite(rate)) return;
    const seen = (this.state.rateSeen ??= {});
    const arr = (seen[symbol] ??= []);
    const prev = arr[arr.length - 1];
    if (prev && prev[1] === rate && Math.floor(prev[0] / FUNDING_INTERVAL_MS) === Math.floor(ts / FUNDING_INTERVAL_MS)) return;
    arr.push([ts, rate]);
    if (arr.length > 100) arr.splice(0, arr.length - 100);
  }

  /** Merge settled funding rates (Bitget public history-fund-rate: fundingTime = boundary ts). */
  setSettledRates(symbol: string, list: ReadonlyArray<{ ts: number; rate: number }>): void {
    const all = (this.state.settledRates ??= {});
    const m = (all[symbol] ??= {});
    for (const x of list) if (Number.isFinite(x.ts) && Number.isFinite(x.rate)) m[String(x.ts)] = x.rate;
    const keys = Object.keys(m).map(Number).sort((a, b) => a - b);
    // keep 100 boundaries (≈33 days of 8 h funding) so the 30-day replay (R2/R6) has settled rates throughout
    for (const k of keys.slice(0, Math.max(0, keys.length - 100))) delete m[String(k)];
  }

  /**
   * Funding rate for the boundary `b` (owner decision 3): the SETTLED rate from Bitget's history
   * when known, else the last ticker rate seen BEFORE the boundary (the ticker shows the next
   * period's rate right after settlement), else undefined.
   */
  fundingRateFor(symbol: string, b: number): number | undefined {
    const settled = this.state.settledRates?.[symbol]?.[String(b)];
    if (settled !== undefined) return settled;
    const arr = this.state.rateSeen?.[symbol] ?? [];
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i][0] < b) return arr[i][1];
    return undefined;
  }

  /**
   * Funding at each 00/08/16 UTC boundary crossed since the last charge (or the open):
   * pay = dir × qty × mark × rate (long pays a positive rate). Debited from the wallet and
   * realizedNet now; attributed to fills (netPnl) when the position is closed.
   * Rate per boundary = {@link fundingRateFor}; while the settled rate is unknown and the boundary
   * is younger than `waitMs`, charging waits (live: give the history endpoint time to publish).
   */
  accrueFunding(symbol: string, mark: number, ts = Date.now(), waitMs = 0): BrokerEvent[] {
    const ev: BrokerEvent[] = [];
    if (!(mark > 0)) return ev;
    for (const p of this.state.positions) {
      if (p.symbol !== symbol) continue;
      const from = p.lastFundingTs ?? p.openedAt;
      let b = Math.floor(from / FUNDING_INTERVAL_MS) * FUNDING_INTERVAL_MS + FUNDING_INTERVAL_MS;
      let paid = 0;
      let lastRate = 0;
      while (b <= ts) {
        const settled = this.state.settledRates?.[symbol]?.[String(b)];
        if (settled === undefined && ts - b < waitMs) break;
        const rate = this.fundingRateFor(symbol, b);
        if (rate === undefined) break;
        const pay = dir(p.side) * p.qty * mark * rate;
        this.state.wallet -= pay;
        p.realizedNet -= pay;
        p.fundingAcc = (p.fundingAcc ?? 0) + pay;
        p.lastFundingTs = b;
        paid += pay;
        lastRate = rate;
        b += FUNDING_INTERVAL_MS;
      }
      if (paid !== 0) ev.push({ kind: 'funding', positionId: p.id, message: `펀딩비 ${paid > 0 ? '지불' : '수령'} ${Math.abs(paid).toFixed(4)} USDT (${(lastRate * 100).toFixed(4)}%)` });
    }
    if (ev.length) this.snapEquity({ [symbol]: mark }, ts);
    return ev;
  }

  /**
   * N1 offline replay over CLOSED 1-minute bars (owner decision 1):
   *  - a bar that touches BOTH a position's SL and one of its open TPs is assumed to hit the SL
   *    first (conservative);
   *  - otherwise levels are processed in path order (green bar: open→low→high→close, red bar:
   *    open→high→low→close), every crossed SL / liquidation / TP level at its exact price;
   *  - a position is only managed by bars that start at/after its open (`openedBefore`), and only
   *    while it is open; funding is charged at the bar open for boundaries crossed;
   *  - R4: a pending limit only fills on bars that start at/after its creation;
   *  - R5: a limit filled inside a bar whose SL lies inside that bar's range is stopped in the same bar.
   */
  replayBars(symbol: string, bars: ReadonlyArray<{ ts: number; open: number; high: number; low: number; close: number }>): BrokerEvent[] {
    const ev: BrokerEvent[] = [];
    for (const b of [...bars].sort((x, y) => x.ts - y.ts)) {
      const t = b.ts + 59_999;
      ev.push(...this.accrueFunding(symbol, b.open, b.ts));
      const managed = () => this.state.positions.filter((p) => p.symbol === symbol && p.openedAt <= b.ts);
      // SL-first when the same bar spans the SL and an open TP of a position
      for (const p of managed()) {
        const long = p.side === 'long';
        const slHit = long ? b.low <= p.sl : b.high >= p.sl;
        const tpHit = p.targets.some((x) => !x.done && (long ? b.high >= x.price : b.low <= x.price));
        // trigger at the SL (or at the open when the bar gapped through it — stop-market fills worse)
        if (slHit && tpHit) ev.push(...this.onPrice(symbol, long ? Math.min(b.open, p.sl) : Math.max(b.open, p.sl), t, undefined, b.ts));
      }
      const path = b.close >= b.open ? [b.open, b.low, b.high, b.close] : [b.open, b.high, b.low, b.close];
      ev.push(...this.onPrice(symbol, path[0], t, undefined, b.ts));
      for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], z = path[i];
        const lv = managed()
          .flatMap((p) => [p.sl, p.liqPrice, ...p.targets.filter((x) => !x.done).map((x) => x.price)])
          .filter((x) => x > 0 && (x - a) * (x - z) < 0)
          .sort((x, y) => (z > a ? x - y : y - x));
        for (const px of [...lv, z]) ev.push(...this.onPrice(symbol, px, t, undefined, b.ts));
      }
      // R5: a limit filled inside this bar: assume an SL touch in the same bar came after the fill (conservative, like D1)
      for (const p of this.state.positions.filter((x) => x.symbol === symbol && x.openedAt === t)) {
        if (p.side === 'long' ? b.low <= p.sl : b.high >= p.sl) ev.push(...this.onPrice(symbol, p.sl, t));
      }
    }
    return ev;
  }

  /** Tick-driven triggers: limit fills, liquidation (on mark when given), SL (last price, filled with
   *  slippage), TP1/TP2 (+ breakeven move). */
  onPrice(symbol: string, price: number, ts = Date.now(), mark?: number, openedBefore = Infinity): BrokerEvent[] {
    const liqRef = mark && mark > 0 ? mark : price;
    const ev: BrokerEvent[] = [];
    const lt = (this.state.lastTickTs ??= {});
    lt[symbol] = Math.max(lt[symbol] ?? 0, ts);
    for (const o of [...this.state.pending]) {
      if (o.symbol !== symbol || o.createdAt > openedBefore) continue; // R4 replay: the order must exist before the bar
      const hit = o.side === 'long' ? price <= o.price : price >= o.price;
      if (!hit) continue;
      this.state.pending = this.state.pending.filter((x) => x.id !== o.id);
      const r = this.open({ ...o, liquidity: 'maker' }, ts);
      if (r.ok) ev.push({ kind: 'limit_fill', positionId: r.position?.id, message: `지정가 체결 ${o.side === 'long' ? '롱' : '숏'} @ ${this.px(o.symbol, o.price)}` });
      else ev.push({ kind: 'close', message: `지정가 체결 실패: ${r.error}` });
    }
    for (const p of [...this.state.positions]) {
      if (p.symbol !== symbol || p.openedAt > openedBefore) continue;
      const long = p.side === 'long';
      if (p.liqPrice > 0 && (long ? liqRef <= p.liqPrice : liqRef >= p.liqPrice)) {
        // N10 / owner decision 2: isolated liquidation loses the WHOLE position margin — closed at the
        // bankruptcy price entry·(1 ∓ 1/lev) with no extra exit fee (Bitget keeps the maintenance remainder)
        const bk = long ? p.entry * (1 - 1 / p.leverage) : p.entry * (1 + 1 / p.leverage);
        this.close(p.id, p.qty, bk, '강제청산', ts, 0);
        ev.push({ kind: 'liq', positionId: p.id, message: `강제청산 @ ${this.px(p.symbol, p.liqPrice)} (증거금 전액 손실)` });
        continue;
      }
      if (long ? price <= p.sl : price >= p.sl) {
        const why = p.beMoved ? '본절 SL' : '손절 SL';
        // stop-market: fills at the trigger or worse if price gapped through it, plus slippage
        const fillPx = (long ? Math.min(p.sl, price) : Math.max(p.sl, price)) * (1 - dir(p.side) * this.slip);
        const f = this.close(p.id, p.qty, fillPx, why, ts);
        ev.push({ kind: 'sl', positionId: p.id, message: `${why} 체결 @ ${this.px(p.symbol, fillPx)} (순손익 ${f ? (f.netPnl >= 0 ? '+' : '') + f.netPnl.toFixed(2) : '-'} USDT)` });
        continue;
      }
      for (let k = 0; k < p.targets.length; k++) {
        const t = p.targets[k];
        if (t.done) continue;
        if (!(long ? price >= t.price : price <= t.price)) break;
        t.done = true;
        const isLast = p.targets.slice(k + 1).every((x) => x.done);
        const q = isLast ? p.qty : this.partialQty(p, Math.min(p.qty, p.origQty * t.fraction), t.price);
        const f = this.close(p.id, q, t.price, t.label, ts);
        ev.push({ kind: 'tp', positionId: p.id, message: `${t.label} 체결 @ ${this.px(p.symbol, t.price)} (순손익 ${f ? (f.netPnl >= 0 ? '+' : '') + f.netPnl.toFixed(2) : '-'} USDT)` });
        const still = this.state.positions.find((x) => x.id === p.id);
        if (!still) break;
        if (k === 0 && this.moveSlToBe && !still.beMoved) {
          still.sl = feeBreakeven(still, this.precision(still.symbol).dp, TAKER_FEE + this.slip);
          still.beMoved = true;
          ev.push({ kind: 'be', positionId: p.id, message: `TP1 후 SL → 본절 ${this.px(still.symbol, still.sl)} (수수료 포함)` });
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

/**
 * Pyramid add sizing (review A3, owner decision 5): the add never loosens the stop
 * (new SL = tighter of current SL and the suggestion) and the COMBINED loss at the new SL —
 * price distance on the averaged entry + leftover entry fees + the add's entry fee + taker exit
 * fee + stop slippage — stays within `budget` (the position's risk budget fixed at entry). Steps
 * the add qty down by the contract step until it fits; qty 0 when nothing fits.
 */
export function sizeAdd(p: Pick<PaperPosition, 'side' | 'qty' | 'entry' | 'sl' | 'entryFeeLeft'>, a: {
  last: number; suggestedSl?: number; budget: number; wantQty: number; step: number; slip?: number;
}): { qty: number; newSl: number; lossAtSl: number } {
  const long = p.side === 'long';
  const slip = a.slip ?? SLIP;
  const newSl = a.suggestedSl !== undefined && Number.isFinite(a.suggestedSl) ? (long ? Math.max(p.sl, a.suggestedSl) : Math.min(p.sl, a.suggestedSl)) : p.sl;
  const fill = a.last * (1 + dir(p.side) * slip);
  const qdp = Math.max(0, Math.round(-Math.log10(a.step)));
  const floor = (q: number) => Number((Math.floor(q / a.step + 1e-9) * a.step).toFixed(qdp));
  const lossAt = (q: number) => lossAtSlAfterAdd(p, q, fill, newSl, slip);
  let qty = floor(a.wantQty);
  for (let guard = 0; qty > 0 && guard < 100_000; guard++) {
    if (lossAt(qty) <= a.budget + 1e-9) break;
    qty = floor(qty - a.step);
  }
  return { qty: Math.max(0, qty), newSl, lossAtSl: lossAt(Math.max(0, qty)) };
}

function structuredCloneSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export interface TradeStats {
  trades: number; wins: number; winRate: number; net: number; fees: number; partialNet: number;
  /** funding paid (+) / received (−) on closed fills */
  funding: number;
  /** trades that carry R accounting */
  rTrades: number;
  /** mean R per closed trade (= expectancy in R) */
  avgR: number;
  avgWinR: number;
  avgLossR: number;
  /** winRate × avgWinR + (1 − winRate) × avgLossR over the R-tracked trades */
  expectancyR: number;
}

/** Aggregate stats over position-level results (fills grouped by positionId). */
export function tradeStats(fills: ClosedFill[], openIds: Iterable<string> = []): TradeStats {
  // partial closes of still-open positions count toward net PnL but not toward trade count / win rate
  const open = new Set(openIds);
  const byPos = new Map<string, { net: number; r: number; hasR: boolean }>();
  let fees = 0;
  let partialNet = 0;
  let funding = 0;
  for (const f of fills) {
    fees += f.fees;
    funding += f.funding ?? 0;
    if (open.has(f.positionId)) { partialNet += f.netPnl; continue; }
    const x = byPos.get(f.positionId) ?? { net: 0, r: 0, hasR: true };
    x.net += f.netPnl;
    if (f.r === undefined) x.hasR = false;
    else x.r += f.r;
    byPos.set(f.positionId, x);
  }
  const results = [...byPos.values()];
  const wins = results.filter((x) => x.net > 0).length;
  const rs = results.filter((x) => x.hasR).map((x) => x.r);
  const w = rs.filter((r) => r > 0), l = rs.filter((r) => r <= 0);
  const mean = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
  const wr = rs.length ? w.length / rs.length : 0;
  return {
    trades: results.length,
    wins,
    winRate: results.length ? wins / results.length : 0,
    net: results.reduce((s, x) => s + x.net, 0) + partialNet,
    fees,
    partialNet,
    funding,
    rTrades: rs.length,
    avgR: mean(rs),
    avgWinR: mean(w),
    avgLossR: mean(l),
    expectancyR: wr * mean(w) + (1 - wr) * mean(l),
  };
}

/** Sum of R over positions whose FINAL fill closed at/after `since` (for the daily auto-paper stop). */
export function realizedRSince(fills: ClosedFill[], since: number): number {
  const finals = new Set(fills.filter((f) => f.final && f.closedAt >= since).map((f) => f.positionId));
  return fills.filter((f) => finals.has(f.positionId)).reduce((s, f) => s + (f.r ?? 0), 0);
}

export function fillsToCsv(fills: ClosedFill[]): string {
  const head = ['closedAt', 'symbol', 'side', 'setup', 'qty', 'entry', 'exit', 'grossPnl', 'fees', 'funding', 'netPnl', 'r', 'reason', 'positionId'];
  const rows = fills.map((f) => [
    new Date(f.closedAt).toISOString(), f.symbol, f.side, f.setup, f.qty, f.entry, f.exit,
    f.grossPnl.toFixed(4), f.fees.toFixed(4), (f.funding ?? 0).toFixed(4), f.netPnl.toFixed(4), f.r === undefined ? '' : f.r.toFixed(3),
    `"${f.reason.replace(/"/g, '""')}"`, f.positionId,
  ].join(','));
  return [head.join(','), ...rows].join('\n');
}
