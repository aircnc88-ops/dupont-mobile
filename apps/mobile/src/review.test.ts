import { describe, expect, it } from 'vitest';
import { analyzeDupont, buildPressures, generateSignals, netRMultiple } from '@bitget-sim/dupont';
import { signalBoxFor, isForming, manualToBox, CLOSE_GRACE_MS } from './useDupont';
import { noBoxBreakoutDraft } from './paper/fromSignal';
import { SLIPPAGE_BPS } from './paper/broker';
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

describe('round 2 (N9 a, N7, N8)', () => {
  it('B6 / N9a: candle close is judged on the SERVER clock — a fast phone clock cannot close it early', () => {
    const ts = Date.UTC(2026, 9, 6, 8, 0), M15 = 900_000;
    const phone = ts + M15 + 30_000; // phone clock 30 s ahead
    const serverNow = phone - 30_000; // offset from trade timestamps
    expect(isForming(ts, M15, serverNow)).toBe(true); // exactly at the end: still within the grace
    expect(isForming(ts, M15, ts + M15 + CLOSE_GRACE_MS - 1)).toBe(true);
    expect(isForming(ts, M15, ts + M15 + CLOSE_GRACE_MS)).toBe(false);
    // a slow phone clock does not keep it open: server time decides
    expect(isForming(ts, M15, ts + M15 + 5_000)).toBe(false);
  });

  it('N7: the manual no-box draft TP is a NET 1:3 (fees + slippage)', () => {
    for (const side of ['long', 'short'] as const) {
      const d = noBoxBreakoutDraft(side, 60000, '0.1', 1);
      const r = netRMultiple({ side, entry: 60000, sl: Number(d.sl), tp: Number(d.tp1), slippageBps: SLIPPAGE_BPS });
      expect(r).toBeGreaterThanOrEqual(3 - 1e-6);
      expect(r).toBeLessThan(3.01);
      expect(Number(d.sl)).toBeCloseTo(side === 'long' ? 59700 : 60300, 6);
    }
  });

  it('N8: a manual box carries the real ATR (signal SL buffer = max(0.03%, 0.1 × ATR))', () => {
    const closed = fixture();
    const b = manualToBox({ top: 110, bottom: 100, startTs: closed[20].ts, locked: true }, closed, 0.25);
    expect(b.atr).toBeGreaterThan(0);
    expect(b.heightAtr).toBeCloseTo(10 / b.atr, 9);
  });
});
