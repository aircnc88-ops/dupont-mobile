import type { Candle, PublicTrade } from '@bitget-sim/shared';

/** Numeric input accepted everywhere: decimal string (repo convention) or JS number. */
export type Num = string | number;

/**
 * Candle input. `Candle` from `@bitget-sim/shared` (string OHLCV) is assignable;
 * numeric OHLCV is accepted too. `ts` is the candle OPEN time in ms.
 */
export interface CandleInput {
  ts: number;
  open: Num;
  high: Num;
  low: Num;
  close: Num;
  volume: Num;
  symbol?: string;
  interval?: string;
}

/**
 * Public trade (tape print) input. `PublicTrade` from `@bitget-sim/shared` is assignable.
 * `side` is the AGGRESSOR (taker) side: 'buy' = market buy lifting the ask.
 */
export interface TradeInput {
  side: 'buy' | 'sell';
  qty: Num;
  price?: Num;
  ts: number;
}

/** Long or short direction of a signal / position. */
export type Side = 'long' | 'short';

// Compile-time check that the shared repo types fit our inputs (no runtime export).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _assertSharedTypesFit(c: Candle, t: PublicTrade): [CandleInput, TradeInput] {
  return [c, t];
}
