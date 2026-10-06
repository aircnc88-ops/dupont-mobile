import type { Candle } from '@bitget-sim/shared';

export const MS15 = 15 * 60 * 1000;
export const T0 = Date.UTC(2026, 0, 1);

/** Build a shared-style (string) Candle. */
export function cdl(i: number, o: number, h: number, l: number, c: number, v = 100): Candle {
  return {
    symbol: 'BTCUSDT',
    interval: '15m',
    open: String(o),
    high: String(h),
    low: String(l),
    close: String(c),
    volume: String(v),
    ts: T0 + i * MS15,
  };
}

/**
 * Synthetic range: closes follow a triangle wave 101 → 109 → 101 (period 16).
 * Trough candles (k % 16 === 0) have low = 100, peak candles (k % 16 === 8) have high = 110,
 * so the box is exactly bottom 100 / top 110 / mid 105.
 * Length 96 ends descending at close 102; length 88 ends ascending at close 108.
 */
export function rangeCandles(len: number): Candle[] {
  const close = (k: number) => {
    const m = ((k % 16) + 16) % 16;
    return 101 + (m <= 8 ? m : 16 - m);
  };
  const out: Candle[] = [];
  for (let k = 0; k < len; k++) {
    const o = close(k - 1);
    const c = close(k);
    let h = Math.max(o, c) + 0.3;
    let l = Math.min(o, c) - 0.3;
    if (k % 16 === 8) h = 110;
    if (k % 16 === 0) l = 100;
    out.push(cdl(k, o, h, l, c));
  }
  return out;
}

/** Append candles [o,h,l,c] after `base`. */
export function extend(base: Candle[], ...bars: [number, number, number, number][]): Candle[] {
  const out = [...base];
  for (const [o, h, l, c] of bars) out.push(cdl(out.length, o, h, l, c));
  return out;
}
