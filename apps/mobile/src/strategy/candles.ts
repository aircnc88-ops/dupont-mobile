import type { Bar } from './types';

const body = (b: Bar) => Math.abs(b.close - b.open);

/** 상승장악형: prev bearish, current bullish, current body engulfs prev body. */
export function isBullishEngulfing(prev: Bar, cur: Bar): boolean {
  if (!(prev.close < prev.open)) return false;
  if (!(cur.close > cur.open)) return false;
  return cur.open <= prev.close && cur.close >= prev.open && body(cur) > body(prev);
}

/** 하락장악형: prev bullish, current bearish, current body engulfs prev body. */
export function isBearishEngulfing(prev: Bar, cur: Bar): boolean {
  if (!(prev.close > prev.open)) return false;
  if (!(cur.close < cur.open)) return false;
  return cur.open >= prev.close && cur.close <= prev.open && body(cur) > body(prev);
}
