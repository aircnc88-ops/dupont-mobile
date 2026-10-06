import { describe, expect, it } from 'vitest';
import { atr, detectBox, detectPivots } from '../src';
import { cdl, rangeCandles } from './helpers';

describe('detectPivots', () => {
  it('finds a pivot high and low with left=right=3', () => {
    const highs = [10, 11, 12, 15, 12, 11, 10, 9, 8, 7, 9, 10, 11];
    const lows = highs.map((h) => h - 2);
    lows[9] = 1; // clear pivot low at 9
    const candles = highs.map((h, i) => cdl(i, h - 1, h, lows[i], h - 0.5));
    const p = detectPivots(candles);
    expect(p.highs.map((x) => x.index)).toEqual([3]);
    expect(p.highs[0].price).toBe('15');
    expect(p.highs[0].kind).toBe('high');
    expect(p.lows.map((x) => x.index)).toEqual([9]);
    expect(p.lows[0].price).toBe('1');
  });

  it('never marks the first `left` / last `right` candles and respects custom strength', () => {
    const hs = [20, 10, 11, 12, 13, 14, 30];
    const candles = hs.map((h, i) => cdl(i, h - 1, h, h - 2, h - 0.5));
    expect(detectPivots(candles).highs).toEqual([]);
    const hs2 = [1, 5, 2, 3, 4];
    const c2 = hs2.map((h, i) => cdl(i, h - 0.5, h, h - 1, h - 0.2));
    expect(detectPivots(c2, 1, 1).highs.map((x) => x.index)).toEqual([1]);
  });

  it('first bar of an equal-high plateau wins', () => {
    const hs = [1, 2, 3, 9, 9, 3, 2, 1, 0];
    const candles = hs.map((h, i) => cdl(i, h - 0.5, h, h - 1, h - 0.2));
    expect(detectPivots(candles).highs.map((x) => x.index)).toEqual([3]);
  });
});

describe('detectBox', () => {
  it('detects the 100/110 range with mid 105', () => {
    const candles = rangeCandles(96);
    const box = detectBox(candles)!;
    expect(box).not.toBeNull();
    expect(box.top).toBe('110');
    expect(box.bottom).toBe('100');
    expect(box.mid).toBe('105');
    expect(box.height).toBe('10');
    expect(box.touchesTop).toBeGreaterThanOrEqual(4);
    expect(box.touchesBottom).toBeGreaterThanOrEqual(4);
    expect(box.insideShare).toBe(1);
    expect(box.heightAtr).toBeGreaterThan(1.5);
    expect(box.isRange).toBe(true);
    expect(box.endTime).toBe(candles[95].ts);
    expect(box.startTime).toBe(candles[box.startIndex].ts);
    expect(box.startIndex).toBeGreaterThanOrEqual(96 - 80);
    expect(box.atr).toBeCloseTo(atr(candles.slice(16), 14), 10);
  });

  it('mid is the exact decimal average of top and bottom', () => {
    const candles = rangeCandles(96).map((c) => ({
      ...c,
      high: c.high === '110' ? '110.3' : c.high,
      low: c.low === '100' ? '100.1' : c.low,
    }));
    const box = detectBox(candles)!;
    expect(box.top).toBe('110.3');
    expect(box.bottom).toBe('100.1');
    expect(box.mid).toBe('105.2');
  });

  it('a single fake-breakout wick does not move the top (cluster ≥ minTouches wins)', () => {
    const candles = rangeCandles(96);
    candles[56] = { ...candles[56], high: '113' }; // one peak spikes far above
    const box = detectBox(candles)!;
    expect(box.top).toBe('110');
    expect(box.isRange).toBe(true);
  });

  it('trend is not a range', () => {
    const candles = Array.from({ length: 100 }, (_, i) => {
      const base = 100 + i * 0.8 + (i % 5 === 0 ? 1.5 : 0);
      return cdl(i, base, base + 1, base - 1, base + 0.6);
    });
    const box = detectBox(candles);
    expect(box === null || box.isRange === false).toBe(true);
  });

  it('box too narrow vs ATR is not a range', () => {
    const candles = rangeCandles(96);
    expect(detectBox(candles, { minHeightAtr: 50 })!.isRange).toBe(false);
  });

  it('returns null with too little data', () => {
    expect(detectBox(rangeCandles(5))).toBeNull();
  });

  it('C1: isRange requires a minimum box height as % of price (default 0.6%)', () => {
    const c = rangeCandles(96);
    expect(detectBox(c)?.isRange).toBe(true); // 10 / 105 ≈ 9.5%
    expect(detectBox(c, { minHeightPct: 12 })?.isRange).toBe(false);
  });
});
