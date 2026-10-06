import type { CandleInput } from './types';
import { toBar } from './util';

/** A swing pivot (fractal) found by {@link detectPivots}. `price` is the candle's high/low as a decimal string. */
export interface Pivot {
  index: number;
  ts: number;
  price: string;
  kind: 'high' | 'low';
}

export interface Pivots {
  highs: Pivot[];
  lows: Pivot[];
}

/**
 * Detect swing pivots (Williams-style fractals).
 *
 * A pivot high at `i` has a high strictly greater than the `left` previous highs and
 * greater-or-equal to the `right` following highs (so the FIRST bar of an equal-high
 * plateau wins). Pivot lows mirror this. The first `left` and last `right` candles can
 * never be pivots (not enough confirmation yet).
 */
export function detectPivots(candles: readonly CandleInput[], left = 3, right = 3): Pivots {
  const bars = candles.map(toBar);
  const highs: Pivot[] = [];
  const lows: Pivot[] = [];
  for (let i = left; i < bars.length - right; i++) {
    const b = bars[i];
    let isHigh = true;
    let isLow = true;
    for (let j = i - left; j < i; j++) {
      if (!(b.high > bars[j].high)) isHigh = false;
      if (!(b.low < bars[j].low)) isLow = false;
    }
    for (let j = i + 1; j <= i + right; j++) {
      if (!(b.high >= bars[j].high)) isHigh = false;
      if (!(b.low <= bars[j].low)) isLow = false;
    }
    if (isHigh) highs.push({ index: i, ts: b.ts, price: String(candles[i].high), kind: 'high' });
    if (isLow) lows.push({ index: i, ts: b.ts, price: String(candles[i].low), kind: 'low' });
  }
  return { highs, lows };
}

/** True range series (first bar uses high-low). */
export function trueRanges(candles: readonly CandleInput[]): number[] {
  const bars = candles.map(toBar);
  return bars.map((b, i) => {
    if (i === 0) return b.high - b.low;
    const pc = bars[i - 1].close;
    return Math.max(b.high - b.low, Math.abs(b.high - pc), Math.abs(b.low - pc));
  });
}

/**
 * Wilder ATR series. Entries before `period - 1` are NaN; index `period - 1` is the
 * SMA of the first `period` true ranges, then Wilder smoothing.
 */
export function atrSeries(candles: readonly CandleInput[], period = 14): number[] {
  const tr = trueRanges(candles);
  const out: number[] = new Array(tr.length).fill(NaN);
  if (tr.length < period || period <= 0) return out;
  let sum = 0;
  for (let i = 0; i < period; i++) sum += tr[i];
  let a = sum / period;
  out[period - 1] = a;
  for (let i = period; i < tr.length; i++) {
    a = (a * (period - 1) + tr[i]) / period;
    out[i] = a;
  }
  return out;
}

/** Latest Wilder ATR value (NaN when fewer than `period` candles). */
export function atr(candles: readonly CandleInput[], period = 14): number {
  const s = atrSeries(candles, period);
  return s.length ? s[s.length - 1] : NaN;
}
