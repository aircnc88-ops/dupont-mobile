import type { CandleInput, TradeInput } from './types';
import { num, toBar } from './util';

export type PressureSource = 'trades' | 'ohlcv';

/**
 * Buy/sell pressure of one candle.
 * - `buy` / `sell`: aggressor volume (base qty, or quote notional with `useNotional`).
 * - `net` = buy - sell.
 * - `ratio` = buy / (buy + sell) in [0, 1] (0.5 = balanced; 0.5 when no volume).
 */
export interface Pressure {
  buy: number;
  sell: number;
  net: number;
  ratio: number;
  source: PressureSource;
}

function mk(buy: number, sell: number, source: PressureSource): Pressure {
  const total = buy + sell;
  return { buy, sell, net: buy - sell, ratio: total > 0 ? buy / total : 0.5, source };
}

export interface PressureFromTradesOptions {
  /** Weight by price*qty (quote volume) instead of qty. Requires `price`. Default false. */
  useNotional?: boolean;
}

/**
 * Pressure from the public tape for the candle `[candleStart, candleStart + intervalMs)`
 * using each trade's aggressor side (buy = taker buy). Trades outside the window are ignored.
 */
export function pressureFromTrades(
  trades: readonly TradeInput[],
  candleStart: number,
  intervalMs: number,
  opts: PressureFromTradesOptions = {},
): Pressure {
  const end = candleStart + intervalMs;
  let buy = 0;
  let sell = 0;
  for (const t of trades) {
    if (t.ts < candleStart || t.ts >= end) continue;
    const v = opts.useNotional && t.price !== undefined ? num(t.qty) * num(t.price) : num(t.qty);
    if (t.side === 'buy') buy += v;
    else sell += v;
  }
  return mk(buy, sell, 'trades');
}

/**
 * OHLCV approximation when no tape is available:
 * `buyVol = vol * (close - low) / (high - low)`, `sellVol = vol - buyVol`.
 * A zero-range candle is split 50/50.
 */
export function pressureFromOHLCV(c: CandleInput): Pressure {
  const b = toBar(c);
  const range = b.high - b.low;
  const buy = range > 0 ? (b.volume * (b.close - b.low)) / range : b.volume / 2;
  return mk(buy, b.volume - buy, 'ohlcv');
}

/**
 * Convert an interval string to ms. Accepts '1m','3m','5m','15m','30m','1h'/'1H','4H',
 * '1d'/'1D','1w'/'1W' (Bitget style) — case-insensitive except 'M' (month, unsupported).
 */
export function intervalToMs(interval: string): number {
  const m = /^(\d+)\s*([smhdwSHDW]|min)$/.exec(interval.trim());
  if (!m) throw new Error(`Unsupported interval: ${interval}`);
  const n = Number(m[1]);
  const unit = m[2] === 'min' ? 'm' : m[2].toLowerCase();
  const mult: Record<string, number> = { s: 1e3, m: 6e4, h: 36e5, d: 864e5, w: 6048e5 };
  return n * mult[unit];
}

/** Default timeframe of the strategy. */
export const DEFAULT_INTERVAL = '15m';
export const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;
export const DEFAULT_SYMBOL = 'BTCUSDT';

export interface BuildPressuresOptions extends PressureFromTradesOptions {
  /** Candle length; defaults to `intervalToMs(candles[0].interval)` or 15m. */
  intervalMs?: number;
  /** Minimum number of trades in a candle to trust the tape; else OHLCV fallback. Default 1. */
  minTrades?: number;
}

/**
 * Pressure for every candle (aligned by index): tape-based when enough trades fall inside
 * the candle, otherwise the OHLCV approximation.
 */
export function buildPressures(
  candles: readonly CandleInput[],
  trades: readonly TradeInput[] = [],
  opts: BuildPressuresOptions = {},
): Pressure[] {
  const intervalMs =
    opts.intervalMs ??
    (candles[0]?.interval ? safeInterval(candles[0].interval) : undefined) ??
    DEFAULT_INTERVAL_MS;
  const minTrades = opts.minTrades ?? 1;
  if (!trades.length) return candles.map(pressureFromOHLCV);
  const sorted = [...trades].sort((a, b) => a.ts - b.ts);
  return candles.map((c) => {
    const lo = lowerBound(sorted, c.ts);
    const hi = lowerBound(sorted, c.ts + intervalMs);
    if (hi - lo < minTrades) return pressureFromOHLCV(c);
    return pressureFromTrades(sorted.slice(lo, hi), c.ts, intervalMs, opts);
  });
}

function safeInterval(s: string): number | undefined {
  try {
    return intervalToMs(s);
  } catch {
    return undefined;
  }
}

function lowerBound(arr: readonly TradeInput[], ts: number): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid].ts < ts) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
