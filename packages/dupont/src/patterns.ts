import type { CandleInput } from './types';
import { toBar } from './util';

/**
 * Bullish engulfing: `prev` is bearish, `curr` is bullish, and `curr`'s real body covers
 * `prev`'s body (curr.open <= prev.close && curr.close >= prev.open) with a strictly
 * larger body. Equality at the open is allowed because 24/7 crypto candles usually open
 * exactly at the previous close.
 */
export function isBullishEngulfing(prev: CandleInput, curr: CandleInput): boolean {
  const p = toBar(prev);
  const c = toBar(curr);
  if (!(p.close < p.open) || !(c.close > c.open)) return false;
  return c.open <= p.close && c.close >= p.open && c.close - c.open > p.open - p.close;
}

/** Bearish engulfing: mirror of {@link isBullishEngulfing}. */
export function isBearishEngulfing(prev: CandleInput, curr: CandleInput): boolean {
  const p = toBar(prev);
  const c = toBar(curr);
  if (!(p.close > p.open) || !(c.close < c.open)) return false;
  return c.open >= p.close && c.close <= p.open && c.open - c.close > p.close - p.open;
}
