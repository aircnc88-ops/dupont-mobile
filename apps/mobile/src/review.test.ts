import { describe, expect, it } from 'vitest';
import { analyzeDupont, buildPressures, generateSignals } from '@bitget-sim/dupont';
import { signalBoxFor } from './useDupont';
import type { Candle } from './data/bitget';

// synthetic 100–110 range (same shape as the dupont package fixtures) + a RANGE_LONG trigger
function fixture(): Candle[] {
  const close = (k: number) => { const m = ((k % 16) + 16) % 16; return 101 + (m <= 8 ? m : 16 - m); };
  const out: Candle[] = [];
  const T0 = Date.UTC(2026, 0, 1);
  for (let k = 0; k < 96; k++) {
    const o = close(k - 1), c = close(k);
    out.push({ ts: T0 + k * 900_000, open: o, high: k % 16 === 8 ? 110 : Math.max(o, c) + 0.3, low: k % 16 === 0 ? 100 : Math.min(o, c) - 0.3, close: c, volume: 100 });
  }
  const add = (o: number, h: number, l: number, c: number) => out.push({ ts: out[out.length - 1].ts + 900_000, open: o, high: h, low: l, close: c, volume: 100 });
  add(102, 102.1, 100.6, 101);
  add(100.9, 102.6, 100.8, 102.5);
  return out;
}

describe('useDupont signal box (review B5)', () => {
  it('live signals use a box detected WITHOUT the trigger candle, matching analyzeDupont', () => {
    const closed = fixture();
    const box = signalBoxFor(closed, {}, null)!;
    const live = generateSignals(closed, buildPressures(closed), box, {});
    const ref = analyzeDupont(closed);
    expect(live.map((s) => s.type)).toEqual(['RANGE_LONG']);
    expect(live).toEqual(ref.signals);
    expect(box.endIndex).toBe(closed.length - 2);
  });
});
