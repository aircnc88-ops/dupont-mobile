import type { Pressure, Signal } from '@bitget-sim/dupont';
import type { Candle } from '../data/bitget';
import type { ClosedFill } from '../paper/broker';
import { APP_VERSION, iso, type SignalRow, type TapeRow, type TradeRow } from './sheetsSchema';

/** Row builders for the journal / Sheets tabs (pure; no trading logic). */
const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
const r8 = (x: number) => Math.round(x * 1e8) / 1e8;

/** tape_pressure row for a fully covered CLOSED candle (null when not covered or no prints) */
export function tapeRowFor(symbol: string, tf: string, c: Candle, st: { buy: number; sell: number; n: number } | null): TapeRow | null {
  if (!st || st.n < 1) return null;
  const tot = st.buy + st.sell;
  return { ts: iso(c.ts), symbol, tf, buy: r8(st.buy), sell: r8(st.sell), ratio: tot > 0 ? r4(st.buy / tot) : 0.5, n_trades: st.n, source: 'trades', gap: false };
}

export function signalRowFor(g: Signal, symbol: string, tf: string, taken: boolean, skip: string): SignalRow {
  return {
    ts: iso(g.ts), symbol, tf, kind: g.type, side: g.side, entry: Number(g.entry), sl: Number(g.sl),
    tp1: g.targets[0] ? Number(g.targets[0].price) : '', box_top: g.box?.top ? Number(g.box.top) : '', box_bottom: g.box?.bottom ? Number(g.box.bottom) : '',
    pressure_ratio: r4(g.pressure.ratio), pressure_source: g.pressure.source === 'trades' ? 'trades' : 'ohlcv', taken, skip_reason: taken ? '' : skip,
  };
}

/** what the app knew about a position while it was open (positions are removed from the broker state once closed) */
export interface PosMeta { tf: string; slInitial?: number; tp1?: number; adds: number; tapeRatio?: number; tapeSource?: Pressure['source'] }

/** one trades row per CLOSED position (has a final fill), in close order */
export function tradesFromFills(fills: readonly ClosedFill[], meta: Record<string, PosMeta | undefined>): Array<TradeRow & { positionId: string }> {
  const by = new Map<string, ClosedFill[]>();
  for (const f of fills) { const a = by.get(f.positionId) ?? []; a.push(f); by.set(f.positionId, a); }
  const out: Array<TradeRow & { positionId: string; _t: number }> = [];
  for (const [pid, fs] of by) {
    const fin = fs.find((f) => f.final);
    if (!fin) continue;
    const qty = fs.reduce((a, f) => a + f.qty, 0);
    const wavg = (k: 'entry' | 'exit') => (qty > 0 ? fs.reduce((a, f) => a + f[k] * f.qty, 0) / qty : fin[k]);
    const net = fs.reduce((a, f) => a + f.netPnl, 0);
    const risk = fin.riskUsd;
    const reasons = [...new Set(fs.map((f) => f.reason))];
    const m = meta[pid];
    out.push({
      positionId: pid, _t: fin.closedAt,
      ts_open: iso(Math.min(...fs.map((f) => f.openedAt))), ts_close: iso(fin.closedAt), symbol: fin.symbol, tf: m?.tf ?? '', side: fin.side, kind: fin.setup,
      entry: r8(wavg('entry')), exit: r8(wavg('exit')), qty: r8(qty), sl_initial: m?.slInitial ?? '', tp1: m?.tp1 ?? '',
      fees_usdt: r4(fs.reduce((a, f) => a + f.fees, 0)), pnl_usdt: r4(net), r_multiple: risk && risk > 0 ? Math.round((net / risk) * 1000) / 1000 : '',
      exit_reason: reasons.join(' + '), adds: m?.adds ?? 0, tape_ratio_at_entry: m?.tapeRatio ?? '', tape_source: m?.tapeSource ?? '', app_version: APP_VERSION,
    });
  }
  return out.sort((a, b) => a._t - b._t).map(({ _t, ...r }) => r);
}
