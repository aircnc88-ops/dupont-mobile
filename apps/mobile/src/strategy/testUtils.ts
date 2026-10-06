import type { Bar } from './types';

export const mk = (time: number, open: number, high: number, low: number, close: number, volume = 100): Bar => ({ time, open, high, low, close, volume });

/** Sideways sine range: highs touch exactly 110, lows exactly 100 (period 20 bars). */
export function rangeSeries(n = 60, step = 900): Bar[] {
  const out: Bar[] = [];
  let prevClose = 105;
  for (let i = 0; i < n; i++) {
    const c = 105 + 4.5 * Math.sin((2 * Math.PI * i) / 20);
    const open = prevClose;
    const high = Math.max(open, c) + 0.5 - Math.abs(open - c) * 0; // wick 0.5 above body max
    const low = Math.min(open, c) - 0.5;
    out.push(mk(i * step, open, Math.round(Math.max(high, c + 0.5) * 1e6) / 1e6, Math.round(Math.min(low, c - 0.5) * 1e6) / 1e6, c, 100));
    prevClose = c;
  }
  return out;
}
