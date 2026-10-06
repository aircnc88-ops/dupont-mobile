import type { CandleInput } from './types';
import { detectPivots, atr, type Pivot } from './indicators';
import { dec, num, toBar } from './util';

export interface DetectBoxOptions {
  /** Number of most recent candles considered. Default 80. */
  lookback?: number;
  /** Touch tolerance as % of price (0.25 = 0.25%). Default 0.25. */
  tolerancePct?: number;
  /** Minimum pivot touches required on EACH boundary for `isRange`. Default 2. */
  minTouches?: number;
  /** Pivot left/right strength. Default 3 / 3. */
  pivotLeft?: number;
  pivotRight?: number;
  /** ATR period. Default 14. */
  atrPeriod?: number;
  /** Box height must be at least this many ATRs for `isRange`. Default 1.5. */
  minHeightAtr?: number;
  /** Box height must be at most this many ATRs for `isRange`. Default 15. */
  maxHeightAtr?: number;
  /** Minimum share (0..1) of window closes inside the box (± tolerance) for `isRange`. Default 0.7. */
  minInsideShare?: number;
  /**
   * Box height must be at least this % of the mid price for `isRange` (a box narrower than
   * round-trip fees + slippage cannot pay a 1R target). Default 0.6 (%).
   */
  minHeightPct?: number;
}

/** A detected trading box (range). Prices are decimal strings. */
export interface Box {
  top: string;
  bottom: string;
  /** (top + bottom) / 2 — the range TP1. */
  mid: string;
  /** top - bottom */
  height: string;
  /** ts of the earliest boundary touch (pivot) in the window. */
  startTime: number;
  /** ts of the last candle in the window. */
  endTime: number;
  /** Indices into the INPUT array. */
  startIndex: number;
  endIndex: number;
  touchesTop: number;
  touchesBottom: number;
  /** Pivot highs / lows that formed each boundary. */
  topPivots: Pivot[];
  bottomPivots: Pivot[];
  /** Wilder ATR(atrPeriod) over the window. */
  atr: number;
  /** height / atr */
  heightAtr: number;
  /** Share (0..1) of window closes inside [bottom - tol, top + tol]. */
  insideShare: number;
  /** Tolerance % used (carried so signals can reuse it). */
  tolerancePct: number;
  /** True when the box qualifies as a tradeable range (touches, height vs ATR and vs price, closes inside). */
  isRange: boolean;
}

/**
 * Pick a horizontal level from pivot prices.
 * Walk candidate levels from the extreme inwards (highest first for `top`, lowest first
 * for `bottom`) and take the first cluster (pivots within `tol` of the candidate) that has
 * at least `minTouches` members; if none does, take the largest cluster (ties → most
 * extreme). The level is the mean of the cluster members.
 */
function pickLevel(pivots: Pivot[], tolPct: number, minTouches: number, side: 'top' | 'bottom') {
  const sorted = [...pivots].sort((a, b) =>
    side === 'top' ? num(b.price) - num(a.price) : num(a.price) - num(b.price),
  );
  let best: Pivot[] | null = null;
  for (const cand of sorted) {
    const p = num(cand.price);
    const tol = (p * tolPct) / 100;
    const members = sorted.filter((q) => Math.abs(num(q.price) - p) <= tol);
    if (members.length >= minTouches) {
      best = members;
      break;
    }
    if (!best || members.length > best.length) best = members;
  }
  if (!best || best.length === 0) return null;
  const sum = best.reduce((s, q) => s.plus(dec(q.price)), dec(0));
  return { level: sum.div(best.length), members: best.sort((a, b) => a.index - b.index) };
}

/**
 * Detect the current box (support/resistance range) over the last `lookback` candles.
 *
 * Boundaries come from clustered pivot highs (top) and pivot lows (bottom) — see
 * `pickLevel`. Returns `null` when there is not enough data or no pivot on either side,
 * or when the clustered top is not above the bottom.
 *
 * Tip: to evaluate the latest candle for signals, detect the box on the candles BEFORE it
 * (`detectBox(candles.slice(0, -1))`) — {@link analyzeDupont} does this for you.
 */
export function detectBox(candles: readonly CandleInput[], opts: DetectBoxOptions = {}): Box | null {
  const lookback = opts.lookback ?? 80;
  const tolerancePct = opts.tolerancePct ?? 0.25;
  const minTouches = opts.minTouches ?? 2;
  const left = opts.pivotLeft ?? 3;
  const right = opts.pivotRight ?? 3;
  const atrPeriod = opts.atrPeriod ?? 14;
  const minHeightAtr = opts.minHeightAtr ?? 1.5;
  const maxHeightAtr = opts.maxHeightAtr ?? 15;
  const minInsideShare = opts.minInsideShare ?? 0.7;
  const minHeightPct = opts.minHeightPct ?? 0.6;

  const startIndex = Math.max(0, candles.length - lookback);
  const win = candles.slice(startIndex);
  if (win.length < Math.max(left + right + 1, atrPeriod)) return null;

  const piv = detectPivots(win, left, right);
  if (!piv.highs.length || !piv.lows.length) return null;
  const topPick = pickLevel(piv.highs, tolerancePct, minTouches, 'top');
  const botPick = pickLevel(piv.lows, tolerancePct, minTouches, 'bottom');
  if (!topPick || !botPick) return null;
  const top = topPick.level;
  const bottom = botPick.level;
  if (top.lte(bottom)) return null;

  // Re-base pivot indices to the input array.
  const rebase = (p: Pivot): Pivot => ({ ...p, index: p.index + startIndex });
  const topPivots = topPick.members.map(rebase);
  const bottomPivots = botPick.members.map(rebase);

  const height = top.minus(bottom);
  const a = atr(win, atrPeriod);
  const heightAtr = a > 0 ? height.toNumber() / a : Infinity;
  const topN = top.toNumber();
  const botN = bottom.toNumber();
  const tolTop = (topN * tolerancePct) / 100;
  const tolBot = (botN * tolerancePct) / 100;
  const bars = win.map(toBar);
  const inside = bars.filter((b) => b.close <= topN + tolTop && b.close >= botN - tolBot).length;
  const insideShare = inside / bars.length;

  const isRange =
    topPivots.length >= minTouches &&
    bottomPivots.length >= minTouches &&
    heightAtr >= minHeightAtr &&
    heightAtr <= maxHeightAtr &&
    insideShare >= minInsideShare &&
    height.div(top.plus(bottom).div(2)).times(100).gte(minHeightPct);

  const firstTouch = Math.min(topPivots[0].index, bottomPivots[0].index);
  return {
    top: top.toFixed(),
    bottom: bottom.toFixed(),
    mid: top.plus(bottom).div(2).toFixed(),
    height: height.toFixed(),
    startTime: candles[firstTouch].ts,
    endTime: candles[candles.length - 1].ts,
    startIndex: firstTouch,
    endIndex: candles.length - 1,
    touchesTop: topPivots.length,
    touchesBottom: bottomPivots.length,
    topPivots,
    bottomPivots,
    atr: a,
    heightAtr,
    insideShare,
    tolerancePct,
    isRange,
  };
}
