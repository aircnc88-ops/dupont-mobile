import { describe, expect, it } from 'vitest';
import { Decimal } from 'decimal.js';
import {
  analyzeDupont,
  buildPressures,
  computeLevels,
  detectBox,
  generateSignals,
  netRMultiple,
  pressureFromTrades,
  type Pressure,
  type Signal,
} from '../src';
import { cdl, extend, MS15, rangeCandles } from './helpers';

/** Box from all but the trigger candle, OHLCV pressures, evaluate last candle. */
function run(candles: ReturnType<typeof rangeCandles>, pressures?: Pressure[]): Signal[] {
  const box = detectBox(candles.slice(0, -1));
  expect(box?.isRange).toBe(true);
  return generateSignals(candles, pressures ?? buildPressures(candles), box);
}

const sub = (a: string, b: string) => new Decimal(a).minus(b);

describe('generateSignals', () => {
  // trigger low 100.8 (setup low 100.6) so TP1 pays ≥ 1R net of fees (item 12 / B8)
  const RL = () => extend(rangeCandles(96), [102, 102.1, 100.6, 101], [100.9, 102.6, 100.8, 102.5]);

  it('RANGE_LONG: bullish engulfing at support with buy pressure; TP1 = mid 50%, TP2 = top 50%', () => {
    const candles = RL();
    const sigs = run(candles);
    expect(sigs).toHaveLength(1);
    const s = sigs[0];
    expect(s.type).toBe('RANGE_LONG');
    expect(s.side).toBe('long');
    expect(s.kind).toBe('range');
    expect(s.index).toBe(candles.length - 1);
    expect(s.entry).toBe('102.5');
    // SL = setup low 100.6 − max(0.03% × 100.6, 0.1 × ATR)   (item 23 / C11)
    const box = detectBox(candles.slice(0, -1))!;
    const buf = Decimal.max(new Decimal('100.6').times('0.0003'), new Decimal(box.atr).times('0.1'));
    expect(s.sl).toBe(new Decimal('100.6').minus(buf).toFixed());
    expect(s.risk).toBe(sub('102.5', s.sl).toFixed());
    expect(s.targets).toEqual([
      { label: 'TP1', price: '105', sizePct: 50, rr: expect.any(Number) },
      { label: 'TP2', price: '110', sizePct: 50, rr: expect.any(Number) },
    ]);
    expect(s.targets[0].rr).toBeCloseTo(2.5 / Number(s.risk), 10);
    expect(netRMultiple({ side: 'long', entry: s.entry, sl: s.sl, tp: '105' })).toBeGreaterThanOrEqual(1);
    expect(s.pressure.ratio).toBeGreaterThan(0.9);
  });

  it('RANGE_LONG is suppressed when the tape shows sellers dominating', () => {
    const candles = RL();
    const last = candles[candles.length - 1];
    const ps = buildPressures(candles);
    ps[ps.length - 1] = pressureFromTrades(
      [
        { side: 'sell', qty: 9, ts: last.ts + 1 },
        { side: 'buy', qty: 1, ts: last.ts + 2 },
      ],
      last.ts,
      MS15,
    );
    expect(run(candles, ps)).toEqual([]);
  });

  it('RANGE_SHORT: bearish engulfing at resistance; TP1 = mid, TP2 = bottom', () => {
    const candles = extend(rangeCandles(88), [108, 109.4, 107.9, 109], [109.1, 109.2, 107.4, 107.5]);
    const [s, ...rest] = run(candles);
    expect(rest).toHaveLength(0);
    expect(s.type).toBe('RANGE_SHORT');
    expect(s.side).toBe('short');
    expect(s.entry).toBe('107.5');
    expect(Number(s.sl)).toBeGreaterThan(109.4); // beyond setup high 109.4 + buffer
    expect(s.targets.map((t) => [t.label, t.price, t.sizePct])).toEqual([
      ['TP1', '105', 50],
      ['TP2', '100', 50],
    ]);
  });

  it('FAKE_BREAKOUT_LONG: wick below box, close back inside, strong buy pressure', () => {
    const candles = extend(rangeCandles(96), [102, 102.1, 101, 101.2], [101.2, 101.6, 99, 101.5]);
    const [s, ...rest] = run(candles);
    expect(rest).toHaveLength(0);
    expect(s.type).toBe('FAKE_BREAKOUT_LONG');
    expect(s.kind).toBe('range');
    expect(Number(s.sl)).toBeLessThan(99); // beyond the 99 wick + buffer
    expect(s.targets.map((t) => t.price)).toEqual(['105', '110']);
  });

  it('FAKE_BREAKOUT_SHORT: wick above box, close back inside, strong sell pressure', () => {
    const candles = extend(rangeCandles(88), [108, 109, 107.9, 108.8], [108.8, 111, 108.4, 108.5]);
    const [s, ...rest] = run(candles);
    expect(rest).toHaveLength(0);
    expect(s.type).toBe('FAKE_BREAKOUT_SHORT');
    expect(Number(s.sl)).toBeGreaterThan(111);
    expect(s.targets.map((t) => t.price)).toEqual(['105', '100']);
  });

  it('FAKE_BREAKOUT_LONG needs strong opposite pressure', () => {
    // same wick, but close near the low → sellers dominate
    const candles = extend(rangeCandles(96), [102, 102.1, 101, 101.2], [101.2, 102, 99, 100.2]);
    expect(run(candles)).toEqual([]);
  });

  it('BREAKOUT_LONG: close above box with buy pressure; SL beyond the breakout candle; single TP at NET 1:3', () => {
    const candles = extend(rangeCandles(88), [108, 109.6, 107.9, 109.5], [109.5, 112.1, 109.4, 112]);
    const [s, ...rest] = run(candles);
    expect(rest).toHaveLength(0);
    expect(s.type).toBe('BREAKOUT_LONG');
    expect(s.kind).toBe('breakout');
    expect(s.entry).toBe('112');
    // item 19 / C10: SL from the breakout candle low (109.4), not the 2-candle low (107.9)
    expect(Number(s.sl)).toBeLessThan(109.4);
    expect(Number(s.sl)).toBeGreaterThan(109);
    expect(s.targets).toHaveLength(1);
    const tp = s.targets[0];
    expect(tp.label).toBe('TP');
    expect(tp.sizePct).toBe(100);
    // owner decision 2: net reward = 3 × net risk (taker fees both legs)
    expect(netRMultiple({ side: 'long', entry: s.entry, sl: s.sl, tp: tp.price })).toBeCloseTo(3, 9);
    expect(tp.rr).toBeGreaterThan(3);
  });

  it('BREAKOUT_SHORT: close below box with sell pressure; single TP at NET 1:3', () => {
    const candles = extend(rangeCandles(96), [102, 102.1, 100.4, 100.5], [100.5, 100.6, 97.9, 98]);
    const [s, ...rest] = run(candles);
    expect(rest).toHaveLength(0);
    expect(s.type).toBe('BREAKOUT_SHORT');
    expect(Number(s.sl)).toBeGreaterThan(100.6);
    expect(Number(s.sl)).toBeLessThan(101);
    expect(netRMultiple({ side: 'short', entry: s.entry, sl: s.sl, tp: s.targets[0].price })).toBeCloseTo(3, 9);
  });

  it('no breakout signal without confirming pressure or on a continuation candle', () => {
    // breakout candle closing near its low (weak buy ratio)
    const weak = extend(rangeCandles(88), [108, 109.6, 107.9, 109.5], [109.5, 114, 109.4, 110.5]);
    expect(run(weak)).toEqual([]);
    // previous candle already closed outside → not a fresh breakout
    const cont = extend(rangeCandles(88), [108, 111.2, 107.9, 111], [111, 113.1, 110.9, 113]);
    const box = detectBox(cont.slice(0, -2))!;
    expect(generateSignals(cont, buildPressures(cont), box)).toEqual([]);
  });

  it('respects requireRange and null boxes', () => {
    const candles = RL();
    const box = { ...detectBox(candles.slice(0, -1))!, isRange: false };
    expect(generateSignals(candles, buildPressures(candles), box)).toEqual([]);
    expect(generateSignals(candles, buildPressures(candles), box, { requireRange: false })).toHaveLength(1);
    expect(generateSignals(candles, [], null)).toEqual([]);
  });

  it('missing pressures fall back to OHLCV; analyzeDupont wires everything', () => {
    const candles = RL();
    const box = detectBox(candles.slice(0, -1));
    expect(generateSignals(candles, [], box)[0]?.type).toBe('RANGE_LONG');
    const res = analyzeDupont(candles);
    expect(res.box?.mid).toBe('105');
    expect(res.pressures).toHaveLength(candles.length);
    expect(res.signals.map((s) => s.type)).toEqual(['RANGE_LONG']);
  });

  it('scan mode (fromIndex) does not repeat the same type on consecutive candles', () => {
    const candles = extend(rangeCandles(96), [102, 102.1, 101, 101.2], [101.2, 101.6, 99, 101.5], [101.5, 101.9, 101.3, 101.85]);
    const box = detectBox(candles.slice(0, -2))!;
    const sigs = generateSignals(candles, buildPressures(candles), box, { fromIndex: candles.length - 2 });
    expect(sigs.filter((s) => s.type === 'FAKE_BREAKOUT_LONG')).toHaveLength(1);
  });
});

describe('computeLevels (SL/TP math)', () => {
  const box = { top: '110', bottom: '100', mid: '105' };
  it('range long: 50% at mid, remaining 50% at opposite boundary', () => {
    const l = computeLevels({ side: 'long', kind: 'range', entry: '101', extremeWick: '100', box, slBufferPct: 0 });
    expect(l.sl).toBe('100');
    expect(l.risk).toBe('1');
    expect(l.targets).toEqual([
      { label: 'TP1', price: '105', sizePct: 50, rr: 4 },
      { label: 'TP2', price: '110', sizePct: 50, rr: 9 },
    ]);
    expect(l.targets.reduce((a, t) => a + t.sizePct, 0)).toBe(100);
  });
  it('range short mirrors; entry beyond mid → single 100% target at boundary', () => {
    const s = computeLevels({ side: 'short', kind: 'range', entry: '109', extremeWick: '110', box, slBufferPct: 0 });
    expect(s.targets.map((t) => [t.price, t.sizePct, t.rr])).toEqual([['105', 50, 4], ['100', 50, 9]]);
    const late = computeLevels({ side: 'long', kind: 'range', entry: '106', extremeWick: '100', box });
    expect(late.targets).toEqual([{ label: 'TP2', price: '110', sizePct: 100, rr: expect.any(Number) }]);
  });
  it('breakout: TP at NET 1:3 by default (gross with feeRate 0), buffer and tick rounding', () => {
    const g = computeLevels({ side: 'long', kind: 'breakout', entry: '60000', extremeWick: '59800', box, slBufferPct: 0.05, feeRate: 0 });
    expect(g.sl).toBe('59770.1');
    expect(g.targets[0].price).toBe('60689.7');
    const l = computeLevels({ side: 'long', kind: 'breakout', entry: '60000', extremeWick: '59800', box, slBufferPct: 0.05 });
    expect(netRMultiple({ side: 'long', entry: l.entry, sl: l.sl, tp: l.targets[0].price })).toBeCloseTo(3, 9);
    expect(Number(l.targets[0].price)).toBeGreaterThan(60689.7);
    const ls = computeLevels({ side: 'long', kind: 'breakout', entry: '60000', extremeWick: '59800', box, slBufferPct: 0.05, slippageBps: 2, tickSize: '0.1' });
    expect(netRMultiple({ side: 'long', entry: ls.entry, sl: ls.sl, tp: ls.targets[0].price, slippageBps: 2 })).toBeGreaterThanOrEqual(3);
    const r2 = computeLevels({ side: 'short', kind: 'breakout', entry: '100', extremeWick: '101', box, slBufferPct: 0, breakoutRR: 2, feeRate: 0 });
    expect(r2.targets[0]).toEqual({ label: 'TP', price: '98', sizePct: 100, rr: 2 });
    const t = computeLevels({ side: 'long', kind: 'breakout', entry: '60000.04', extremeWick: '59800', box, tickSize: '0.1' });
    expect(t.entry).toBe('60000');
    expect(t.sl).toBe('59782'); // 59800 − 0.03% default buffer = 59782.06 → rounded DOWN (outward)
    const t2 = computeLevels({ side: 'short', kind: 'breakout', entry: '100', extremeWick: '100.33', box, tickSize: '0.1', slBufferPct: 0 });
    expect(t2.sl).toBe('100.4'); // rounded UP (outward) for shorts
  });
  it('SL buffer = max(slBufferPct% of the wick, atrBufferFrac × ATR)', () => {
    expect(computeLevels({ side: 'long', kind: 'range', entry: '101', extremeWick: '100', box }).sl).toBe('99.97'); // 0.03% default
    expect(computeLevels({ side: 'long', kind: 'range', entry: '101', extremeWick: '100', box, atr: 2 }).sl).toBe('99.8'); // 0.1 × ATR
    expect(computeLevels({ side: 'short', kind: 'range', entry: '109', extremeWick: '110', box, atr: 2, atrBufferFrac: 0.25 }).sl).toBe('110.5');
  });
});

describe('review round 1 — signal rules', () => {
  const ps = (candles: ReturnType<typeof rangeCandles>, last: Pressure) => {
    const p = buildPressures(candles);
    p[p.length - 1] = last;
    return p;
  };
  const T = (buy: number, sell: number): Pressure => ({ buy, sell, net: buy - sell, ratio: buy / (buy + sell), source: 'trades' });

  it('B1: a close inside the break tolerance (top, top + t] is not a dead zone', () => {
    // close 110.1 is above top 110 but within t = min(0.275, 1) → still "inside" → FAKE_BREAKOUT_SHORT
    const candles = extend(rangeCandles(88), [108, 109, 107.9, 108.8], [110.9, 111.5, 108.9, 110.1]);
    const box = detectBox(candles.slice(0, -1))!;
    const sigs = generateSignals(candles, ps(candles, T(1, 9)), box);
    expect(sigs.map((x) => x.type)).toEqual(['FAKE_BREAKOUT_SHORT']);
  });

  it('B1: the tolerance is capped at breakTolBoxFrac × box height (narrow box)', () => {
    const base = rangeCandles(88);
    const box = { ...detectBox(base)!, top: '100.5', bottom: '100', mid: '100.25', isRange: true };
    const candles = [...base.slice(0, -2), cdl(86, 100.3, 100.5, 100.25, 100.45), cdl(87, 100.45, 100.62, 100.44, 100.6)];
    // uncapped t = 0.25% × 100.5 ≈ 0.251 → 100.6 would be inside; capped t = 0.05 → breakout
    expect(generateSignals(candles, ps(candles, T(9, 1)), box, { breakTolBoxFrac: 10 }).map((x) => x.type)).toEqual([]);
    expect(generateSignals(candles, ps(candles, T(9, 1)), box).map((x) => x.type)).toEqual(['BREAKOUT_LONG']);
  });

  it('B2: FAKE_BREAKOUT_LONG rejects a bearish trigger even with strong buy tape; SHORT mirrors', () => {
    const bear = extend(rangeCandles(96), [102, 102.1, 101, 101.2], [101.8, 101.9, 99, 101.5]);
    expect(generateSignals(bear, ps(bear, T(9, 1)), detectBox(bear.slice(0, -1)))).toEqual([]);
    const bull = extend(rangeCandles(88), [108, 109, 107.9, 108.8], [108.4, 111, 108.3, 108.5]);
    expect(generateSignals(bull, ps(bull, T(1, 9)), detectBox(bull.slice(0, -1)))).toEqual([]);
  });

  it('owner decision 4: fake-breakout wick window = trigger or previous candle (2 candles)', () => {
    // wick on the previous candle, bullish reversal on the trigger → fires
    const prevWick = extend(rangeCandles(96), [102, 102.1, 101, 101.2], [101.2, 101.3, 99, 100.6], [100.6, 101.6, 100.5, 101.5]);
    const box = detectBox(prevWick.slice(0, -2))!;
    expect(generateSignals(prevWick, ps(prevWick, T(9, 1)), box).map((x) => x.type)).toEqual(['FAKE_BREAKOUT_LONG']);
    // wick three candles back → outside the window → nothing
    const old = extend(rangeCandles(96), [102, 102.1, 99, 101.2], [101.2, 101.3, 100.6, 100.9], [100.9, 101.6, 100.8, 101.5]);
    expect(generateSignals(old, ps(old, T(9, 1)), detectBox(old.slice(0, -3))!).map((x) => x.type)).not.toContain('FAKE_BREAKOUT_LONG');
  });

  it('B8: a range signal is dropped when TP1 net R < minNetR1', () => {
    // original fixture: setup low 100.2 → risk ≈ 2.5 vs TP1 reward 2.5 → net R1 < 1
    const candles = extend(rangeCandles(96), [102, 102.1, 100.6, 101], [100.9, 102.6, 100.2, 102.5]);
    const box = detectBox(candles.slice(0, -1))!;
    expect(generateSignals(candles, buildPressures(candles), box)).toEqual([]);
    expect(generateSignals(candles, buildPressures(candles), box, { minNetR1: 0.5 }).map((x) => x.type)).toEqual(['RANGE_LONG']);
  });

  it('owner decision 6: breakouts require a valid range even with requireRange = false', () => {
    const candles = extend(rangeCandles(88), [108, 109.6, 107.9, 109.5], [109.5, 112.1, 109.4, 112]);
    const box = { ...detectBox(candles.slice(0, -1))!, isRange: false };
    expect(generateSignals(candles, buildPressures(candles), box, { requireRange: false })).toEqual([]);
  });

  it('netRMultiple: fees and slippage reduce reward and add to risk', () => {
    expect(netRMultiple({ side: 'long', entry: 100, sl: 99, tp: 102, feeRate: 0 })).toBe(2);
    const n = netRMultiple({ side: 'long', entry: 100, sl: 99, tp: 102 });
    expect(n).toBeCloseTo((2 - 0.06 - 0.0612) / (1 + 0.0006 * 199), 12);
    expect(netRMultiple({ side: 'short', entry: 100, sl: 101, tp: 98, slippageBps: 2 })).toBeLessThan(n);
  });
});
