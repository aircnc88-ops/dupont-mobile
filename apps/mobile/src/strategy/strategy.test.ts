import { describe, expect, it } from 'vitest';
import { detectBox, manualBox, midline } from './box';
import { isBearishEngulfing, isBullishEngulfing } from './candles';
import { clusterLevels, findPivots } from './pivots';
import { aggregateTrades, approxPressure, bookImbalance, buyRatio, pressureFor, pressureSeries } from './pressure';
import { evaluateBar, scanSignals } from './signals';
import { planTargets, pnlAtTargets, positionSize } from './risk';
import { pressureFlip } from './alerts';
import { canAdd, pyramidSuggestion } from './pyramid';
import { PaperBroker, TAKER_FEE, MAKER_FEE, tradeStats, fillsToCsv } from './broker';
import { mk, rangeSeries } from './testUtils';
import type { Bar } from './types';

function closeTo(a: number, b: number, eps = 1e-6) {
  expect(Math.abs(a - b)).toBeLessThan(eps);
}

describe('pivots & box', () => {
  const bars = rangeSeries(60);

  it('finds swing highs at the sine peaks and lows at the troughs', () => {
    const piv = findPivots(bars, 3, 3);
    const highs = piv.filter((p) => p.kind === 'high').map((p) => p.index);
    const lows = piv.filter((p) => p.kind === 'low').map((p) => p.index);
    expect(highs).toEqual([5, 25, 45]);
    expect(lows).toEqual([15, 35, 55]);
  });

  it('clusters pivots within tolerance and counts touches', () => {
    const lv = clusterLevels(
      [
        { index: 1, price: 100, kind: 'low' },
        { index: 5, price: 100.15, kind: 'low' },
        { index: 9, price: 103, kind: 'low' },
      ],
      0.2,
      'min'
    );
    expect(lv.length).toBe(2);
    expect(lv[0].touches).toBe(2);
    expect(lv[0].price).toBe(100);
  });

  it('detects box top/bottom with ≥2 touches, exact 50% midline and range regime', () => {
    const box = detectBox(bars)!;
    expect(box).not.toBeNull();
    closeTo(box.top, 110, 1e-6);
    closeTo(box.bottom, 100, 1e-6);
    expect(box.mid).toBe((box.top + box.bottom) / 2);
    expect(box.topTouches).toBeGreaterThanOrEqual(2);
    expect(box.bottomTouches).toBeGreaterThanOrEqual(2);
    expect(box.valid).toBe(true);
    expect(box.isRange).toBe(true);
  });

  it('midline is exactly 50%', () => {
    expect(midline(110, 100)).toBe(105);
    expect(midline(85123.4, 84011.2)).toBe((85123.4 + 84011.2) / 2);
  });

  it('flags a strong trend as non-range', () => {
    const trend: Bar[] = [];
    for (let i = 0; i < 80; i++) {
      const base = 100 + i * 1.2 + 1.5 * Math.sin(i);
      trend.push(mk(i * 900, base - 0.4, base + 1, base - 1, base + 0.4));
    }
    const box = detectBox(trend);
    expect(box === null || box.isRange === false).toBe(true);
  });

  it('manual box overrides and sorts top/bottom', () => {
    const b = manualBox(100, 112, bars[10].time, bars);
    expect(b.top).toBe(112);
    expect(b.bottom).toBe(100);
    expect(b.mid).toBe(106);
    expect(b.source).toBe('manual');
  });
});

describe('pressure', () => {
  it('approximates buy volume from OHLCV: vol × (close−low)/(high−low)', () => {
    const p = approxPressure(mk(0, 100, 110, 100, 107.5, 200));
    closeTo(p.buy, 150);
    closeTo(p.sell, 50);
    expect(p.source).toBe('ohlcv');
    const doji = approxPressure(mk(0, 100, 100, 100, 100, 10));
    expect(doji.buy).toBe(5);
  });

  it('aggregates public trades by aggressor side into candles and prefers live data', () => {
    const live = aggregateTrades(
      [
        { price: 1, qty: 2, side: 'buy', ts: 900_000 + 1 },
        { price: 1, qty: 1, side: 'sell', ts: 900_000 + 500_000 },
        { price: 1, qty: 4, side: 'sell', ts: 1_800_000 + 3 },
      ],
      900
    );
    expect(live.get(900)).toEqual({ buy: 2, sell: 1, source: 'trades' });
    expect(live.get(1800)).toEqual({ buy: 0, sell: 4, source: 'trades' });
    const b = mk(900, 1, 2, 0.5, 1.9, 999);
    expect(pressureFor(b, live).source).toBe('trades');
    expect(pressureSeries([b, mk(2700, 1, 2, 1, 2, 10)], live)[1].source).toBe('ohlcv');
    closeTo(buyRatio({ buy: 3, sell: 1, source: 'trades' }), 0.75);
  });

  it('computes order-book imbalance', () => {
    closeTo(bookImbalance([[100, 3]], [[101, 1]]), 0.5);
    expect(bookImbalance([], [])).toBe(0);
  });
});

describe('engulfing', () => {
  it('detects bullish engulfing (상승장악형)', () => {
    expect(isBullishEngulfing(mk(0, 101, 101.2, 99.8, 100), mk(1, 100, 102.5, 99.9, 102))).toBe(true);
    expect(isBullishEngulfing(mk(0, 101, 101.2, 99.8, 100), mk(1, 100, 101, 99.9, 100.6))).toBe(false);
    expect(isBullishEngulfing(mk(0, 100, 101.2, 99.8, 101), mk(1, 100, 102.5, 99.9, 102))).toBe(false);
  });
  it('detects bearish engulfing (하락장악형)', () => {
    expect(isBearishEngulfing(mk(0, 100, 101.2, 99.8, 101), mk(1, 101, 101.3, 98.9, 99.5))).toBe(true);
    expect(isBearishEngulfing(mk(0, 100, 101.2, 99.8, 101), mk(1, 101, 101.3, 100.2, 100.5))).toBe(false);
  });
});

function withTail(extra: Bar[]): Bar[] {
  const base = rangeSeries(60);
  const t0 = base[base.length - 1].time;
  return [...base, ...extra.map((b, k) => ({ ...b, time: t0 + (k + 1) * 900 }))];
}

function evalLast(bars: Bar[]) {
  const i = bars.length - 1;
  const box = detectBox(bars.slice(0, i));
  return { sig: evaluateBar(bars, i, box, pressureSeries(bars)), box: box! };
}

describe('signals', () => {
  it('1) range reversal long: support touch + bullish engulfing + buy pressure', () => {
    const bars = withTail([mk(0, 101.5, 101.8, 100.2, 100.6, 150), mk(0, 100.6, 102.4, 100.4, 102.2, 300)]);
    const { sig, box } = evalLast(bars);
    expect(sig).not.toBeNull();
    expect(sig!.setup).toBe('range_reversal');
    expect(sig!.side).toBe('long');
    expect(sig!.entry).toBe(102.2);
    expect(sig!.sl).toBeLessThan(100.2); // beyond the lowest wick of the 2-candle setup
    expect(sig!.sl).toBeGreaterThan(99.5);
    expect(sig!.targets.map((t) => t.price)).toEqual([box.mid, box.top]);
    expect(sig!.targets.map((t) => t.fraction)).toEqual([0.5, 0.5]);
  });

  it('1b) range reversal short at resistance (mirror)', () => {
    const bars = withTail([mk(0, 108.4, 109.8, 108.2, 109.4, 150), mk(0, 109.4, 109.6, 107.6, 107.8, 300)]);
    const { sig, box } = evalLast(bars);
    expect(sig?.setup).toBe('range_reversal');
    expect(sig?.side).toBe('short');
    expect(sig!.sl).toBeGreaterThan(109.8);
    expect(sig!.targets.map((t) => t.price)).toEqual([box.mid, box.bottom]);
  });

  it('2) fake breakout short: wick above top, close back inside with strong sell pressure', () => {
    const bars = withTail([mk(0, 108.0, 109.3, 107.9, 109.0, 120), mk(0, 109.0, 111.0, 108.5, 108.8, 400)]);
    const { sig, box } = evalLast(bars);
    expect(sig?.setup).toBe('fake_breakout');
    expect(sig?.side).toBe('short');
    expect(sig!.sl).toBeGreaterThan(111);
    expect(sig!.targets[0].price).toBe(box.mid);
    expect(sig!.targets[1].price).toBe(box.bottom);
  });

  it('2b) fake breakdown long: wick below bottom, close back inside with strong buy pressure', () => {
    const bars = withTail([mk(0, 102, 102.2, 100.8, 101, 120), mk(0, 101, 101.5, 99, 101.3, 400)]);
    const { sig } = evalLast(bars);
    expect(sig?.setup).toBe('fake_breakout');
    expect(sig?.side).toBe('long');
    expect(sig!.sl).toBeLessThan(99);
  });

  it('3) true breakout long: close above box with confirming buy pressure → 1:3 target', () => {
    const bars = withTail([mk(0, 108, 109.8, 107.9, 109.5, 120), mk(0, 109.5, 112.2, 109.4, 112, 500)]);
    const { sig } = evalLast(bars);
    expect(sig?.setup).toBe('breakout');
    expect(sig?.side).toBe('long');
    expect(sig!.targets.length).toBe(1);
    expect(sig!.targets[0].fraction).toBe(1);
    closeTo(sig!.targets[0].price, sig!.entry + 3 * (sig!.entry - sig!.sl));
    closeTo(sig!.rr, 3);
  });

  it('3b) true breakdown short', () => {
    const bars = withTail([mk(0, 102, 102.1, 100.2, 100.5, 120), mk(0, 100.5, 100.6, 97.8, 98, 500)]);
    const { sig } = evalLast(bars);
    expect(sig?.setup).toBe('breakout');
    expect(sig?.side).toBe('short');
    closeTo(sig!.targets[0].price, sig!.entry - 3 * (sig!.sl - sig!.entry));
  });

  it('no signal when pressure does not confirm', () => {
    // breakout close but weak buy pressure (long upper wick, close near low of range)
    const bars = withTail([mk(0, 108, 109.8, 107.9, 109.5, 120), mk(0, 109.5, 115, 109.4, 110.2, 500)]);
    const { sig } = evalLast(bars);
    expect(sig).toBeNull();
  });

  it('walk-forward scan finds the appended setup without look-ahead', () => {
    const bars = withTail([mk(0, 101.5, 101.8, 100.2, 100.6, 150), mk(0, 100.6, 102.4, 100.4, 102.2, 300)]);
    const sigs = scanSignals(bars, pressureSeries(bars));
    expect(sigs.some((s) => s.index === bars.length - 1 && s.setup === 'range_reversal')).toBe(true);
  });
});

describe('SL/TP math, sizing & broker', () => {
  it('range plan: 50% at midline, remaining 50% at opposite boundary', () => {
    const box = { top: 110, bottom: 100, mid: 105 };
    expect(planTargets('range_reversal', 'long', 101, 99.8, box)).toEqual([
      { price: 105, fraction: 0.5, label: 'TP1 중앙선' },
      { price: 110, fraction: 0.5, label: 'TP2 저항' },
    ]);
    const s = planTargets('fake_breakout', 'short', 109, 111.2, box);
    expect(s.map((t) => [t.price, t.fraction])).toEqual([[105, 0.5], [100, 0.5]]);
  });

  it('breakout plan: full exit at 1:3', () => {
    const t = planTargets('breakout', 'long', 112, 109, { top: 110, bottom: 100, mid: 105 });
    expect(t).toEqual([{ price: 121, fraction: 1, label: '1:3' }]);
    const s = planTargets('breakout', 'short', 98, 100, { top: 110, bottom: 100, mid: 105 });
    expect(s[0].price).toBe(92);
  });

  it('risk sizing: loss at SL incl. fees ≈ risk% of equity, capped by leverage', () => {
    const r = positionSize({ equity: 200, riskPct: 1, entry: 100, sl: 99, leverage: 10, feeRate: TAKER_FEE });
    closeTo(r.lossAtSl, 2, 1e-9);
    expect(r.capped).toBe(false);
    const c = positionSize({ equity: 200, riskPct: 5, entry: 100, sl: 99.99, leverage: 2, feeRate: TAKER_FEE });
    expect(c.capped).toBe(true);
    expect(c.margin).toBeLessThanOrEqual(200 * 0.95 + 1e-9);
  });

  it('broker: TP1 closes 50% at midline, SL→breakeven, TP2 closes rest; net PnL after fees', () => {
    const b = new PaperBroker();
    expect(b.state.wallet).toBe(200);
    const targets = planTargets('range_reversal', 'long', 101, 99.8, { top: 110, bottom: 100, mid: 105 });
    const r = b.open({ symbol: 'BTCUSDT', side: 'long', qty: 1, price: 101, leverage: 10, sl: 99.8, targets, setup: 'range_reversal' });
    expect(r.ok).toBe(true);
    const ev1 = b.onPrice('BTCUSDT', 105.2);
    expect(ev1.some((e) => e.kind === 'tp')).toBe(true);
    const p = b.state.positions[0];
    closeTo(p.qty, 0.5);
    expect(p.sl).toBe(101);
    expect(p.beMoved).toBe(true);
    b.onPrice('BTCUSDT', 110.1);
    expect(b.state.positions.length).toBe(0);
    const expected = pnlAtTargets('long', 101, 1, targets, TAKER_FEE);
    const net = b.state.fills.reduce((s, f) => s + f.netPnl, 0);
    closeTo(net, expected, 1e-9);
    closeTo(b.state.wallet, 200 + expected, 1e-9);
    expect(tradeStats(b.state.fills)).toMatchObject({ trades: 1, wins: 1, winRate: 1 });
    expect(fillsToCsv(b.state.fills).split('\n').length).toBe(3);
  });

  it('broker: breakout exits 100% at 1:3, stop-loss closes at SL', () => {
    const b = new PaperBroker();
    const t = planTargets('breakout', 'short', 98, 100, { top: 110, bottom: 100, mid: 105 });
    b.open({ symbol: 'ETHUSDT', side: 'short', qty: 2, price: 98, leverage: 5, sl: 100, targets: t, setup: 'breakout' });
    b.onPrice('ETHUSDT', 91.9);
    expect(b.state.positions.length).toBe(0);
    expect(b.state.fills[0].exit).toBe(92);
    closeTo(b.state.fills[0].grossPnl, 12);
    const b2 = new PaperBroker();
    b2.open({ symbol: 'BTCUSDT', side: 'long', qty: 1, price: 101, leverage: 10, sl: 99.8, targets: t, setup: 'manual' });
    b2.onPrice('BTCUSDT', 99.7);
    expect(b2.state.fills[0].reason).toContain('SL');
    closeTo(b2.state.fills[0].netPnl, -1.2 - 101 * TAKER_FEE - 99.8 * TAKER_FEE, 1e-9);
  });

  it('broker: limit order fills at maker fee; insufficient margin rejected', () => {
    const b = new PaperBroker();
    b.placeLimit({ symbol: 'BTCUSDT', side: 'long', qty: 1, price: 100, leverage: 10, sl: 98, targets: [], setup: 'manual' });
    b.onPrice('BTCUSDT', 100.5);
    expect(b.state.positions.length).toBe(0);
    b.onPrice('BTCUSDT', 99.9);
    expect(b.state.positions.length).toBe(1);
    closeTo(200 - b.state.wallet, 100 * MAKER_FEE);
    const big = b.open({ symbol: 'ETHUSDT', side: 'long', qty: 100, price: 100, leverage: 2, sl: 90, targets: [], setup: 'manual' });
    expect(big.ok).toBe(false);
  });
});

describe('pressure-flip alert', () => {
  const recent = Array.from({ length: 20 }, () => ({ buy: 100, sell: 50, source: 'ohlcv' as const }));
  it('alerts near target when opposite pressure ≫ recent average', () => {
    const r = pressureFlip({ side: 'long', entry: 100, target: 105, price: 104, current: { buy: 60, sell: 160, source: 'trades' }, recent });
    expect(r.alert).toBe(true);
    expect(r.message).toContain('압력 반전');
    closeTo(r.ratio, 3.2);
  });
  it('does not alert far from target or with normal pressure', () => {
    expect(pressureFlip({ side: 'long', entry: 100, target: 105, price: 101, current: { buy: 60, sell: 160, source: 'trades' }, recent }).alert).toBe(false);
    expect(pressureFlip({ side: 'long', entry: 100, target: 105, price: 104.5, current: { buy: 100, sell: 60, source: 'trades' }, recent }).alert).toBe(false);
  });
  it('mirrors for shorts (large buy pressure)', () => {
    const rs = Array.from({ length: 10 }, () => ({ buy: 50, sell: 100, source: 'ohlcv' as const }));
    expect(pressureFlip({ side: 'short', entry: 100, target: 95, price: 96, current: { buy: 200, sell: 40, source: 'trades' }, recent: rs }).alert).toBe(true);
  });
});

describe('pyramiding (불타기)', () => {
  const prev = mk(0, 111.5, 111.6, 110.6, 110.8);
  const cur = mk(1, 110.7, 112.4, 110.05, 112.2);
  it('suggests add-on on retest of broken level with engulfing/strong pressure', () => {
    const r = pyramidSuggestion({ side: 'long', level: 110, adds: 0, prev, cur, pressure: approxPressure(cur) });
    expect(r.ok).toBe(true);
  });
  it('rejects when no retest', () => {
    const far = mk(1, 113, 115, 112.8, 114.9);
    expect(pyramidSuggestion({ side: 'long', level: 110, adds: 0, prev, cur: far, pressure: approxPressure(far) }).ok).toBe(false);
  });
  it('enforces max 2 adds (configurable)', () => {
    expect(canAdd(0, 2)).toBe(true);
    expect(canAdd(1, 2)).toBe(true);
    expect(canAdd(2, 2)).toBe(false);
    const r = pyramidSuggestion({ side: 'long', level: 110, adds: 2, prev, cur, pressure: approxPressure(cur) });
    expect(r.ok).toBe(false);
    expect(r.reason).toContain('최대');
    expect(pyramidSuggestion({ side: 'long', level: 110, adds: 2, maxAdds: 3, prev, cur, pressure: approxPressure(cur) }).ok).toBe(true);
  });
  it('broker counts adds and averages entry', () => {
    const b = new PaperBroker();
    const t = planTargets('breakout', 'long', 112, 109, { top: 110, bottom: 100, mid: 105 });
    b.open({ symbol: 'BTCUSDT', side: 'long', qty: 0.5, price: 112, leverage: 10, sl: 109, targets: t, setup: 'breakout', breakoutLevel: 110 });
    b.open({ symbol: 'BTCUSDT', side: 'long', qty: 0.5, price: 111, leverage: 10, sl: 109, targets: t, setup: 'breakout' });
    expect(b.state.positions[0].adds).toBe(1);
    closeTo(b.state.positions[0].entry, 111.5);
    expect(canAdd(b.state.positions[0].adds, 2)).toBe(true);
  });
});
