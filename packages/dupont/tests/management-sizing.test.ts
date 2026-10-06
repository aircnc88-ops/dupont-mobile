import { describe, expect, it } from 'vitest';
import {
  detectBox,
  pressureFlipAlert,
  pressureFlipAlertDetail,
  pyramidSuggestion,
  sizePosition,
  type DupontPosition,
  type Pressure,
} from '../src';
import { cdl, rangeCandles, MS15, T0 } from './helpers';
const T0ts = (i: number) => T0 + i * MS15;

const P = (buy: number, sell: number): Pressure => ({
  buy, sell, net: buy - sell, ratio: buy + sell ? buy / (buy + sell) : 0.5, source: 'trades',
});

describe('pressureFlipAlert', () => {
  const longPos: DupontPosition = {
    side: 'long', entry: '101', sl: '99.9', type: 'RANGE_LONG',
    targets: [{ price: '105', sizePct: 50 }, { price: '110', sizePct: 50 }],
  };
  const hist = Array.from({ length: 20 }, (_, i) => cdl(i, 105 + i * 0.2, 105.5 + i * 0.2, 104.8 + i * 0.2, 105.2 + i * 0.2));
  const histP = hist.map(() => P(12, 10));

  it('fires near target when opposite (sell) pressure ≥ k× average', () => {
    const candles = [...hist, cdl(20, 109.2, 109.8, 109.1, 109.5)];
    const ps = [...histP, P(10, 25)];
    expect(pressureFlipAlert(longPos, candles, ps)).toBe(true);
    const d = pressureFlipAlertDetail(longPos, candles, ps);
    expect(d.target).toBe('110');
    expect(d.multiple).toBeCloseTo(2.5);
    expect(d.nearTarget).toBe(true);
  });

  it('does not fire when the opposite bar is not big enough', () => {
    const candles = [...hist, cdl(20, 109.2, 109.8, 109.1, 109.5)];
    expect(pressureFlipAlert(longPos, candles, [...histP, P(10, 15)])).toBe(false);
    expect(pressureFlipAlert(longPos, candles, [...histP, P(10, 15)], { k: 1.5 })).toBe(true);
  });

  it('does not fire far from the target even with huge opposite pressure', () => {
    const candles = [...hist.slice(0, 5), cdl(5, 102.5, 103, 102.4, 102.8)];
    const d = pressureFlipAlertDetail(longPos, candles, [...histP.slice(0, 5), P(1, 100)]);
    expect(d.target).toBe('105');
    expect(d.nearTarget).toBe(false);
    expect(d.alert).toBe(false);
  });

  it('B7: requires real tape pressure on the (closed) last candle unless requireTape = false', () => {
    const candles = [...hist, cdl(20, 109.2, 109.8, 109.1, 109.5, 1000)];
    const d = pressureFlipAlertDetail(longPos, candles, [...histP, undefined]);
    expect(d.alert).toBe(false);
    expect(d.reason).toBe('tape required');
    const ohlcv = { ...P(10, 25), source: 'ohlcv' as const };
    expect(pressureFlipAlert(longPos, candles, [...histP, ohlcv])).toBe(false);
    expect(pressureFlipAlert(longPos, candles, [...histP, ohlcv], { requireTape: false })).toBe(true);
  });

  it('short positions watch BUY pressure', () => {
    const shortPos: DupontPosition = { side: 'short', entry: '109', targets: [{ price: '105' }, { price: '100' }] };
    const h = Array.from({ length: 10 }, (_, i) => cdl(i, 104 - i * 0.3, 104.2 - i * 0.3, 103.6 - i * 0.3, 103.8 - i * 0.3));
    const candles = [...h, cdl(10, 101, 101.1, 100.6, 100.9)];
    const ps = [...h.map(() => P(5, 6)), P(20, 4)];
    expect(pressureFlipAlert(shortPos, candles, ps)).toBe(true);
    expect(pressureFlipAlert(shortPos, candles, [...h.map(() => P(5, 6)), P(6, 20)])).toBe(false);
  });
});

describe('pyramidSuggestion', () => {
  const box = detectBox(rangeCandles(96))!; // top 110
  // c0 = entry candle, c1 = move away (high ≥ 110 + 0.5 × 4.2), c2/c3 = retest + bullish engulfing
  const entryC = cdl(0, 110.5, 112.2, 110.2, 112);
  const away = cdl(1, 112, 112.6, 111.4, 111.5);
  const retest = [entryC, away, cdl(2, 111.5, 111.6, 110.7, 110.8), cdl(3, 110.7, 111.9, 110.1, 111.8)];
  const pos: DupontPosition = { side: 'long', entry: '112', sl: '107.8', type: 'BREAKOUT_LONG', targets: [{ price: '124.4' }], openedTs: entryC.ts };

  it('suggests an add on a retest of the broken top with engulfing', () => {
    const s = pyramidSuggestion(pos, retest, [], box);
    expect(s.add).toBe(true);
    expect(s.addNumber).toBe(1);
    expect(s.entry).toBe('111.8');
    expect(s.sl).toBe('110.04495'); // 110.1 − 0.05%
    expect(s.level).toBe('110');
  });

  it('honours maxAdds', () => {
    expect(pyramidSuggestion({ ...pos, adds: 1 }, retest, [], box).addNumber).toBe(2);
    const s = pyramidSuggestion({ ...pos, adds: 2 }, retest, [], box);
    expect(s.add).toBe(false);
    expect(s.reason).toMatch(/max adds/);
    expect(pyramidSuggestion({ ...pos, adds: 1 }, retest, [], box, { maxAdds: 1 }).add).toBe(false);
    expect(pyramidSuggestion({ ...pos, adds: 2 }, retest, [], box, { maxAdds: 3 }).add).toBe(true);
  });

  it('accepts strong pressure instead of engulfing; rejects unconfirmed retests', () => {
    const noEngulf = [entryC, away, cdl(2, 110.5, 111, 110.4, 110.9), cdl(3, 110.9, 111.2, 110.2, 111)];
    expect(pyramidSuggestion(pos, noEngulf, [undefined, undefined, undefined, P(1, 5)], box).add).toBe(false);
    expect(pyramidSuggestion(pos, noEngulf, [undefined, undefined, undefined, P(8, 2)], box).add).toBe(true);
  });

  it('only for breakout positions and only on an actual retest', () => {
    expect(pyramidSuggestion({ ...pos, type: 'RANGE_LONG' }, retest, [], box).add).toBe(false);
    const far = [entryC, away, cdl(2, 114, 114.2, 113, 113.2), cdl(3, 113.1, 115, 113, 114.9)];
    expect(pyramidSuggestion(pos, far, [], box).add).toBe(false);
  });

  it('A1: never fires on the entry candle, never twice on the same candle, needs a move away first', () => {
    // the breakout/entry candle itself looks like a retest (low ≤ top + tol, close > top) → rejected
    const entryOnly = [cdl(0, 111.5, 111.6, 110.7, 110.8), cdl(1, 110.7, 111.9, 110.1, 111.8)];
    const r0 = pyramidSuggestion({ ...pos, openedTs: entryOnly[1].ts }, entryOnly, [], box);
    expect(r0.add).toBe(false);
    expect(r0.reason).toMatch(/later candle/);
    // add #1 done on candle 3 → the same candle cannot give add #2
    const r1 = pyramidSuggestion({ ...pos, adds: 1, lastAddTs: retest[3].ts }, retest, [], box);
    expect(r1.add).toBe(false);
    // no candle between entry and retest moved ≥ 0.5R away from the level
    const noAway = [entryC, cdl(1, 112, 112, 111.4, 111.5), retest[2], retest[3]];
    const r2 = pyramidSuggestion(pos, noAway, [], box);
    expect(r2.add).toBe(false);
    expect(r2.reason).toMatch(/move away/);
  });

  it('short breakout retest of the broken bottom', () => {
    const shortPos: DupontPosition = { side: 'short', entry: '98', sl: '100.6', type: 'BREAKOUT_SHORT', targets: [{ price: '85.5' }], openedTs: T0ts(0) };
    const c = [cdl(0, 100.5, 100.6, 97.9, 98), cdl(1, 98, 98.5, 98.5 - 0.9, 98.2), cdl(2, 98.6, 99.3, 98.5, 99.2), cdl(3, 99.3, 99.8, 98.1, 98.2)];
    const s = pyramidSuggestion(shortPos, c, [], box);
    expect(s.add).toBe(true);
    expect(s.sl).toBe('99.8499');
  });
});

describe('sizePosition', () => {
  it('risk-based qty without fees; margin = notional / leverage; qtyStep rounds down', () => {
    const r = sizePosition({ equity: 10000, riskPct: 1, entry: 60000, sl: 59400, leverage: 10, feeRate: '0.0006', qtyStep: '0.001', includeFeesInRisk: false });
    expect(r.side).toBe('long');
    expect(r.riskAmount).toBe('100');
    expect(r.riskPerUnit).toBe('600');
    expect(r.qty).toBe('0.166');
    expect(r.notional).toBe('9960');
    expect(r.margin).toBe('996');
    expect(r.entryFee).toBe('5.976');
    expect(r.exitFeeAtSl).toBe('5.91624');
    expect(r.estFees).toBe('11.89224');
    expect(r.capped).toBe(false);
  });

  it('fees included in the risk budget by default (loss at SL ≈ risk amount)', () => {
    const r = sizePosition({ equity: '10000', entry: '60000', sl: '59400', leverage: 5 });
    // qty = 100 / (600 + 0.0006 * 119400) = 100 / 671.64
    expect(Number(r.qty)).toBeCloseTo(100 / 671.64, 12);
    expect(Number(r.lossAtSl)).toBeCloseTo(100, 8);
  });

  it('short side and margin cap (margin + entry fee ≤ available)', () => {
    const s = sizePosition({ equity: 1000, riskPct: 2, entry: 100, sl: 102, leverage: 2, includeFeesInRisk: false });
    expect(s.side).toBe('short');
    expect(s.qty).toBe('10');
    const c = sizePosition({ equity: 1000, riskPct: 5, entry: 100, sl: 99.9, leverage: 1, qtyStep: '0.0001' });
    expect(c.capped).toBe(true);
    expect(c.qty).toBe('9.994');
    expect(Number(c.margin) + Number(c.entryFee)).toBeLessThanOrEqual(1000);
  });

  it('A4: capped qty uses `available` and leaves room for the entry fee (200 USDT probe)', () => {
    // 200 USDT, 10x, very tight SL → risk qty far above the cap
    const r = sizePosition({ equity: 200, available: 150, riskPct: 1, entry: 60000, sl: 59999, leverage: 10, qtyStep: '0.0001' });
    expect(r.capped).toBe(true);
    expect(Number(r.margin) + Number(r.entryFee)).toBeLessThanOrEqual(150 + 1e-9);
    const nx = (Number(r.qty) + 0.0001) * 60000;
    expect(nx / 10 + nx * 0.0006).toBeGreaterThan(150); // one more step would not fit
  });

  it('slippage is part of the risk; min qty / min notional are enforced inside sizing', () => {
    const a = sizePosition({ equity: 200, entry: 60000, sl: 59400, leverage: 10 });
    const b = sizePosition({ equity: 200, entry: 60000, sl: 59400, leverage: 10, slippageBps: 2 });
    expect(Number(b.qty)).toBeLessThan(Number(a.qty));
    expect(Number(b.lossAtSl)).toBeCloseTo(2, 8);
    const tiny = sizePosition({ equity: 200, riskPct: 0.2, entry: 30000, sl: 27000, leverage: 10, qtyStep: '0.0001', minQty: '0.0001', minNotional: 5 });
    expect(tiny.qty).toBe('0');
    expect(tiny.belowMin).toBe('min_notional');
    const q = sizePosition({ equity: 200, riskPct: 0.01, entry: 60000, sl: 50000, qtyStep: '0.0001', minQty: '0.0001' });
    expect(q.belowMin).toBe('min_qty');
  });

  it('rejects invalid input', () => {
    expect(() => sizePosition({ equity: 1000, entry: 100, sl: 100 })).toThrow();
    expect(() => sizePosition({ equity: 1000, entry: 100, sl: 99, leverage: 0 })).toThrow();
  });
});
