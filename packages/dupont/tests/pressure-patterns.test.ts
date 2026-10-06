import { describe, expect, it } from 'vitest';
import type { PublicTrade } from '@bitget-sim/shared';
import {
  buildPressures,
  intervalToMs,
  isBearishEngulfing,
  isBullishEngulfing,
  pressureFromOHLCV,
  pressureFromTrades,
} from '../src';
import { cdl, MS15, T0 } from './helpers';

const tr = (side: 'buy' | 'sell', qty: string, ts: number): PublicTrade => ({
  id: `${ts}-${side}`, symbol: 'BTCUSDT', side, price: '100', qty, ts,
});

describe('pressureFromOHLCV', () => {
  it('splits volume by close location in the range', () => {
    const p = pressureFromOHLCV(cdl(0, 100, 110, 100, 107.5, 100));
    expect(p.buy).toBeCloseTo(75);
    expect(p.sell).toBeCloseTo(25);
    expect(p.net).toBeCloseTo(50);
    expect(p.ratio).toBeCloseTo(0.75);
    expect(p.source).toBe('ohlcv');
  });
  it('zero-range candle is 50/50; numeric input accepted', () => {
    const p = pressureFromOHLCV({ ts: 0, open: 5, high: 5, low: 5, close: 5, volume: 10 });
    expect(p).toEqual({ buy: 5, sell: 5, net: 0, ratio: 0.5, source: 'ohlcv' });
  });
});

describe('pressureFromTrades', () => {
  it('sums aggressor volume inside [start, start+interval)', () => {
    const trades = [
      tr('buy', '1', T0),
      tr('buy', '2', T0 + 1000),
      tr('sell', '1', T0 + MS15 - 1),
      tr('sell', '50', T0 + MS15), // next candle — excluded
      tr('buy', '50', T0 - 1), // previous candle — excluded
    ];
    const p = pressureFromTrades(trades, T0, MS15);
    expect(p).toEqual({ buy: 3, sell: 1, net: 2, ratio: 0.75, source: 'trades' });
  });
  it('supports quote-notional weighting and empty windows', () => {
    const p = pressureFromTrades([{ side: 'sell', qty: 2, price: 50, ts: T0 }], T0, MS15, { useNotional: true });
    expect(p.sell).toBe(100);
    expect(pressureFromTrades([], T0, MS15).ratio).toBe(0.5);
  });
});

describe('buildPressures', () => {
  it('uses the tape where available and OHLCV otherwise', () => {
    const candles = [cdl(0, 100, 110, 100, 107.5), cdl(1, 100, 110, 100, 102.5)];
    const ps = buildPressures(candles, [tr('sell', '4', T0 + 5), tr('buy', '1', T0 + 6)]);
    expect(ps[0].source).toBe('trades');
    expect(ps[0].ratio).toBeCloseTo(0.2);
    expect(ps[1].source).toBe('ohlcv');
    expect(ps[1].ratio).toBeCloseTo(0.25);
    expect(buildPressures(candles).every((p) => p.source === 'ohlcv')).toBe(true);
  });
  it('intervalToMs parses Bitget intervals', () => {
    expect(intervalToMs('15m')).toBe(MS15);
    expect(intervalToMs('1H')).toBe(3_600_000);
    expect(intervalToMs('4h')).toBe(14_400_000);
    expect(intervalToMs('1D')).toBe(86_400_000);
    expect(() => intervalToMs('1M')).toThrow();
  });
});

describe('engulfing', () => {
  const bear = cdl(0, 102, 102.2, 100.8, 101);
  const bull = cdl(0, 101, 102.2, 100.8, 102);
  it('bullish engulfing', () => {
    expect(isBullishEngulfing(bear, cdl(1, 100.9, 102.6, 100.2, 102.5))).toBe(true);
    expect(isBullishEngulfing(bear, cdl(1, 101, 102.6, 100.2, 102.1))).toBe(true); // open == prev close
    expect(isBullishEngulfing(bear, cdl(1, 101, 101.9, 100.8, 101.8))).toBe(false); // does not cover prev open
    expect(isBullishEngulfing(bull, cdl(1, 100.5, 103, 100.4, 103))).toBe(false); // prev not bearish
    expect(isBullishEngulfing(bear, cdl(1, 102.5, 102.6, 100, 100.5))).toBe(false); // curr bearish
  });
  it('bearish engulfing', () => {
    expect(isBearishEngulfing(bull, cdl(1, 102.1, 102.3, 100.4, 100.5))).toBe(true);
    expect(isBearishEngulfing(bull, cdl(1, 102, 102.3, 101.2, 101.3))).toBe(false); // does not cover
    expect(isBearishEngulfing(bear, cdl(1, 102.5, 102.6, 100, 100.5))).toBe(false); // prev not bullish
  });
});
