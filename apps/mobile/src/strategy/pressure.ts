import type { Bar, Pressure } from './types';

/**
 * OHLCV approximation (used for history, where per-trade aggressor data isn't available):
 *   buyVol  = volume × (close − low) / (high − low)
 *   sellVol = volume − buyVol      (doji / zero range → 50/50)
 */
export function approxPressure(bar: Bar): Pressure {
  const range = bar.high - bar.low;
  const v = Math.max(0, bar.volume);
  if (!(range > 0)) return { buy: v / 2, sell: v / 2, source: 'ohlcv' };
  const buy = (v * (bar.close - bar.low)) / range;
  return { buy, sell: v - buy, source: 'ohlcv' };
}

export interface TradePrint {
  price: number;
  qty: number;
  side: 'buy' | 'sell';
  ts: number; // ms
}

/** Aggregate public trades (aggressor side) into per-candle buy/sell volume keyed by candle open (sec). */
export function aggregateTrades(trades: TradePrint[], intervalSec: number, into: Map<number, Pressure> = new Map()): Map<number, Pressure> {
  for (const t of trades) {
    const key = Math.floor(t.ts / 1000 / intervalSec) * intervalSec;
    const cur = into.get(key) ?? { buy: 0, sell: 0, source: 'trades' as const };
    if (t.side === 'buy') cur.buy += t.qty;
    else cur.sell += t.qty;
    cur.source = 'trades';
    into.set(key, cur);
  }
  return into;
}

/** Live trades if we have them for that candle, else OHLCV approximation. */
export function pressureFor(bar: Bar, live?: Map<number, Pressure>): Pressure {
  const p = live?.get(bar.time);
  if (p && p.buy + p.sell > 0) return p;
  return approxPressure(bar);
}

export function pressureSeries(bars: Bar[], live?: Map<number, Pressure>): Pressure[] {
  return bars.map((b) => pressureFor(b, live));
}

/** Buy share in [0,1]; 0.5 when no volume. */
export function buyRatio(p: Pressure): number {
  const t = p.buy + p.sell;
  return t > 0 ? p.buy / t : 0.5;
}

export function delta(p: Pressure): number {
  return p.buy - p.sell;
}

/** Order-book imbalance in [-1,1] (+ = bids heavier). Levels are [price, qty]. */
export function bookImbalance(bids: Array<[number, number]>, asks: Array<[number, number]>, depth = 15): number {
  const b = bids.slice(0, depth).reduce((s, x) => s + x[1], 0);
  const a = asks.slice(0, depth).reduce((s, x) => s + x[1], 0);
  return a + b > 0 ? (b - a) / (a + b) : 0;
}
