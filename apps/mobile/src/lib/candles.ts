import type { Candle } from '../data/bitget';

/**
 * R3: true when a print at `ts` belongs to a candle that is NOT contiguous with the last known one
 * (one or more candles were missed, e.g. app backgrounded / WS down). Such a print must not
 * synthesize a candle from the stale close (that would draw a fake wick spanning the whole gap).
 */
export function isCandleGap(prev: ReadonlyArray<Candle>, ts: number, ms: number): boolean {
  if (!prev.length) return false;
  const start = Math.floor(ts / ms) * ms;
  return start > prev[prev.length - 1].ts + ms;
}

/** R3 (contiguous variant): how recent the data before a candle boundary must be to open the next candle from its close. */
export const CANDLE_STALE_MS = 30_000;

/**
 * R3: should this print trigger a REST reload instead of a local candle update?
 *  - a gap of one or more missed candles ({@link isCandleGap}), or
 *  - the print opens the NEXT candle but nothing fresh (print / REST load) was seen in the last
 *    {@link CANDLE_STALE_MS} before its start (app slept across the boundary) — its open would be a stale close.
 */
export function needsCandleReload(prev: ReadonlyArray<Candle>, ts: number, ms: number, freshAt: number, staleMs = CANDLE_STALE_MS): boolean {
  if (!prev.length) return false;
  if (isCandleGap(prev, ts, ms)) return true;
  const start = Math.floor(ts / ms) * ms;
  return start > prev[prev.length - 1].ts && freshAt < start - staleMs;
}

/**
 * Forming-candle update from one live print (pure; used by useMarket.applyPrice):
 *  - same candle → extend high/low/close, add volume;
 *  - the NEXT contiguous candle → open it at the previous close;
 *  - a non-contiguous candle (gap) or an older print → unchanged (caller reloads REST on a gap).
 */
export function extendCandles(prev: Candle[], price: number, vol: number, ts: number, ms: number): Candle[] {
  if (!prev.length) return prev;
  const start = Math.floor(ts / ms) * ms;
  const last = prev[prev.length - 1];
  if (start > last.ts + ms) return prev; // R3: never synthesize from a stale close (fake wick)
  if (start > last.ts) return [...prev.slice(-499), { ts: start, open: last.close, high: Math.max(last.close, price), low: Math.min(last.close, price), close: price, volume: vol }];
  if (start < last.ts) return prev;
  const nb = { ...last, close: price, high: Math.max(last.high, price), low: Math.min(last.low, price), volume: last.volume + vol };
  return [...prev.slice(0, -1), nb];
}
