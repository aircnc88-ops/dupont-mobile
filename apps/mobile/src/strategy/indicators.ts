import type { Bar } from './types';

/** Wilder ATR; returns per-bar array (NaN until enough data → falls back to simple TR mean). */
export function atr(bars: Bar[], period = 14): number[] {
  const out: number[] = new Array(bars.length).fill(NaN);
  let prev = NaN;
  let sum = 0;
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const pc = i > 0 ? bars[i - 1].close : b.close;
    const tr = Math.max(b.high - b.low, Math.abs(b.high - pc), Math.abs(b.low - pc));
    if (i < period) {
      sum += tr;
      out[i] = sum / (i + 1);
      if (i === period - 1) prev = sum / period;
    } else {
      prev = (prev * (period - 1) + tr) / period;
      out[i] = prev;
    }
  }
  return out;
}

export function lastAtr(bars: Bar[], period = 14): number {
  if (!bars.length) return 0;
  const a = atr(bars, period);
  return a[a.length - 1] || 0;
}

/** Least-squares slope of closes (price units per bar). */
export function closeSlope(bars: Bar[]): number {
  const n = bars.length;
  if (n < 2) return 0;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) {
    sx += i; sy += bars[i].close; sxy += i * bars[i].close; sxx += i * i;
  }
  const den = n * sxx - sx * sx;
  return den === 0 ? 0 : (n * sxy - sx * sy) / den;
}
