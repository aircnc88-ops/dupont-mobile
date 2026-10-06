/** Core strategy types (pure, framework-free). Times are UNIX seconds (candle open). */
export interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Pressure {
  buy: number;
  sell: number;
  /** 'trades' = aggregated Bitget public trades (aggressor side); 'ohlcv' = approximation */
  source: 'trades' | 'ohlcv';
}

export interface Pivot {
  index: number;
  price: number;
  kind: 'high' | 'low';
}

export interface Level {
  price: number;
  touches: number;
  lastIndex: number;
  firstIndex: number;
}

export interface Box {
  top: number;
  bottom: number;
  mid: number;
  topTouches: number;
  bottomTouches: number;
  /** index (in the bars array used for detection) where the box begins */
  startIndex: number;
  startTime: number;
  /** ≥ minTouches on both sides */
  valid: boolean;
  /** range (non-trend) regime */
  isRange: boolean;
  heightAtr: number;
  insideRatio: number;
  source: 'auto' | 'manual';
}

export type SetupKind = 'range_reversal' | 'fake_breakout' | 'breakout';
export type Side = 'long' | 'short';

export interface Target {
  price: number;
  /** fraction of the ORIGINAL position size closed at this target */
  fraction: number;
  label: string;
}

export interface Signal {
  id: string;
  time: number;
  index: number;
  setup: SetupKind;
  side: Side;
  entry: number;
  sl: number;
  targets: Target[];
  /** reason text (Korean) */
  reason: string;
  buyRatio: number;
  box: { top: number; bottom: number; mid: number };
  rr: number;
}

export interface StrategyParams {
  pivotLeft: number;
  pivotRight: number;
  lookback: number;
  /** cluster tolerance as % of price (0.2 = 0.2%) */
  clusterTolPct: number;
  minTouches: number;
  /** "near" support/resistance zone as a fraction of box height */
  nearFrac: number;
  /** dominant pressure threshold (buy share for longs, sell share for shorts) */
  dominance: number;
  /** stronger pressure for breakouts / fakeouts */
  strongDominance: number;
  /** SL buffer as fraction of ATR */
  slBufferAtr: number;
  /** minimum SL buffer as % of price */
  slBufferMinPct: number;
  breakoutRR: number;
  minBoxHeightAtr: number;
  maxBoxHeightAtr: number;
  minInsideRatio: number;
}

export const DEFAULT_PARAMS: StrategyParams = {
  pivotLeft: 3,
  pivotRight: 3,
  lookback: 80,
  clusterTolPct: 0.2,
  minTouches: 2,
  nearFrac: 0.15,
  dominance: 0.55,
  strongDominance: 0.6,
  slBufferAtr: 0.1,
  slBufferMinPct: 0.03,
  breakoutRR: 3,
  minBoxHeightAtr: 1.5,
  maxBoxHeightAtr: 14,
  minInsideRatio: 0.75,
};
