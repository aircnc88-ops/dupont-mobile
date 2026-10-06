/**
 * @bitget-sim/dupont — 차트슈타인 "듀퐁 스탠다드" (Dupont Standard) strategy toolkit.
 *
 * Box (range) detection from clustered pivots, per-candle buy/sell pressure (tape or OHLCV
 * approximation), engulfing patterns, typed entry signals with SL/TP, absorption
 * (pressure-flip) exit alert, breakout pyramiding and fixed-fractional sizing.
 *
 * Pure functions, no I/O, paper-trading only. Prices/qty/money are decimal strings
 * (decimal.js via @bitget-sim/shared); analytic metrics are numbers.
 * Default market: BTCUSDT perpetual, 15m candles.
 */
export type { Num, CandleInput, TradeInput, Side } from './types';
export { detectPivots, trueRanges, atrSeries, atr } from './indicators';
export type { Pivot, Pivots } from './indicators';
export { detectBox } from './box';
export type { Box, DetectBoxOptions } from './box';
export {
  pressureFromTrades,
  pressureFromOHLCV,
  buildPressures,
  intervalToMs,
  DEFAULT_INTERVAL,
  DEFAULT_INTERVAL_MS,
  DEFAULT_SYMBOL,
} from './pressure';
export type { Pressure, PressureSource, PressureFromTradesOptions, BuildPressuresOptions } from './pressure';
export { isBullishEngulfing, isBearishEngulfing } from './patterns';
export { generateSignals, computeLevels, netRMultiple, DEFAULT_FEE_RATE } from './signals';
export type { Signal, SignalType, SignalKind, SignalOptions, Target, LevelsInput, NetRInput } from './signals';
export { pressureFlipAlert, pressureFlipAlertDetail, pyramidSuggestion } from './management';
export type {
  DupontPosition,
  FlipAlertOptions,
  FlipAlertDetail,
  PyramidOptions,
  PyramidSuggestion,
} from './management';
export { sizePosition } from './sizing';
export type { SizeInput, SizeResult } from './sizing';
export { analyzeDupont } from './analyze';
export type { AnalyzeOptions, AnalyzeResult } from './analyze';
