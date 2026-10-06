import type { CandleInput, TradeInput } from './types';
import { detectBox, type Box, type DetectBoxOptions } from './box';
import { buildPressures, type BuildPressuresOptions, type Pressure } from './pressure';
import { generateSignals, type Signal, type SignalOptions } from './signals';

export interface AnalyzeOptions {
  trades?: readonly TradeInput[];
  pressure?: BuildPressuresOptions;
  box?: DetectBoxOptions;
  signals?: SignalOptions;
}

export interface AnalyzeResult {
  /** Box detected on all candles EXCEPT the last (the trigger candle). */
  box: Box | null;
  pressures: Pressure[];
  signals: Signal[];
}

/**
 * One-call pipeline for UIs: pressures for every candle (tape if available, else OHLCV),
 * box on `candles[0..n-2]`, signals for the last candle (or `signals.fromIndex`).
 */
export function analyzeDupont(candles: readonly CandleInput[], opts: AnalyzeOptions = {}): AnalyzeResult {
  const pressures = buildPressures(candles, opts.trades ?? [], opts.pressure);
  const box = candles.length > 1 ? detectBox(candles.slice(0, -1), opts.box) : null;
  const signals = generateSignals(candles, pressures, box, opts.signals);
  return { box, pressures, signals };
}
