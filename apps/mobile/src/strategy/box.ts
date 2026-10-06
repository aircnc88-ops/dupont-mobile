import { atr, closeSlope } from './indicators';
import { clusterLevels, findPivots } from './pivots';
import type { Bar, Box, Level, StrategyParams } from './types';
import { DEFAULT_PARAMS } from './types';

export function midline(top: number, bottom: number): number {
  return (top + bottom) / 2;
}

function pickLevel(levels: Level[], minTouches: number): Level | null {
  const ok = levels.filter((l) => l.touches >= minTouches);
  const pool = ok.length ? ok : [];
  if (!pool.length) return null;
  // most touches, then most recent
  return [...pool].sort((a, b) => b.touches - a.touches || b.lastIndex - a.lastIndex)[0];
}

/**
 * Auto box (박스권) from swing pivots over the last `lookback` bars.
 *  - resistance = most-touched cluster of pivot highs (≥ minTouches), price = max of cluster
 *  - support    = most-touched cluster of pivot lows  (≥ minTouches), price = min of cluster
 *  - fallback (not enough touches) = extreme pivot high / low → valid=false
 *  - range regime: box height between [min,max]×ATR, ≥ minInsideRatio of closes inside,
 *    and regression drift over the window < 60% of box height.
 */
export function detectBox(bars: Bar[], params: Partial<StrategyParams> = {}): Box | null {
  const p = { ...DEFAULT_PARAMS, ...params };
  if (bars.length < p.pivotLeft + p.pivotRight + 5) return null;
  const startIdx = Math.max(0, bars.length - p.lookback);
  const win = bars.slice(startIdx);
  const pivots = findPivots(win, p.pivotLeft, p.pivotRight);
  const highs = pivots.filter((x) => x.kind === 'high');
  const lows = pivots.filter((x) => x.kind === 'low');
  if (!highs.length || !lows.length) return null;

  const hiLevels = clusterLevels(highs, p.clusterTolPct, 'max');
  const loLevels = clusterLevels(lows, p.clusterTolPct, 'min');
  let res = pickLevel(hiLevels, p.minTouches);
  let sup = pickLevel(loLevels, p.minTouches);
  let valid = !!res && !!sup;
  if (!res) res = [...hiLevels].sort((a, b) => b.price - a.price)[0];
  if (!sup) sup = [...loLevels].sort((a, b) => a.price - b.price)[0];
  if (res.price <= sup.price) {
    // degenerate: use extremes
    res = [...hiLevels].sort((a, b) => b.price - a.price)[0];
    sup = [...loLevels].sort((a, b) => a.price - b.price)[0];
    valid = false;
    if (res.price <= sup.price) return null;
  }
  const top = res.price;
  const bottom = sup.price;
  const firstLocal = Math.min(res.firstIndex, sup.firstIndex);

  const a = atr(bars, 14);
  const curAtr = a[a.length - 1] || (top - bottom) / 4;
  const heightAtr = (top - bottom) / curAtr;
  const span = win.slice(firstLocal);
  const tolAbs = (top - bottom) * 0.05;
  const inside = span.filter((b) => b.close <= top + tolAbs && b.close >= bottom - tolAbs).length;
  const insideRatio = span.length ? inside / span.length : 0;
  const drift = Math.abs(closeSlope(span) * span.length);
  const isRange =
    valid &&
    heightAtr >= p.minBoxHeightAtr &&
    heightAtr <= p.maxBoxHeightAtr &&
    insideRatio >= p.minInsideRatio &&
    drift < 0.6 * (top - bottom);

  const startIndex = startIdx + firstLocal;
  return {
    top,
    bottom,
    mid: midline(top, bottom),
    topTouches: res.touches,
    bottomTouches: sup.touches,
    startIndex,
    startTime: bars[startIndex].time,
    valid,
    isRange,
    heightAtr,
    insideRatio,
    source: 'auto',
  };
}

/** Build a manual / locked box from user-edited top & bottom. */
export function manualBox(top: number, bottom: number, startTime: number, bars: Bar[]): Box {
  const t = Math.max(top, bottom);
  const b = Math.min(top, bottom);
  let startIndex = bars.findIndex((x) => x.time >= startTime);
  if (startIndex < 0) startIndex = Math.max(0, bars.length - 60);
  return {
    top: t,
    bottom: b,
    mid: midline(t, b),
    topTouches: 0,
    bottomTouches: 0,
    startIndex,
    startTime: bars[startIndex]?.time ?? startTime,
    valid: true,
    isRange: true,
    heightAtr: 0,
    insideRatio: 1,
    source: 'manual',
  };
}
