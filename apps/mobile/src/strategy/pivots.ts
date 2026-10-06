import type { Bar, Level, Pivot } from './types';

/**
 * Swing pivots: bar i is a pivot high if its high is strictly greater than the `left`
 * bars before and >= the `right` bars after (mirror for lows). Only confirmed pivots
 * (with `right` bars after them) are returned.
 */
export function findPivots(bars: Bar[], left = 3, right = 3): Pivot[] {
  const out: Pivot[] = [];
  for (let i = left; i < bars.length - right; i++) {
    const h = bars[i].high;
    const l = bars[i].low;
    let isHigh = true;
    let isLow = true;
    for (let k = 1; k <= left; k++) {
      if (bars[i - k].high >= h) isHigh = false;
      if (bars[i - k].low <= l) isLow = false;
    }
    for (let k = 1; k <= right; k++) {
      if (bars[i + k].high > h) isHigh = false;
      if (bars[i + k].low < l) isLow = false;
    }
    if (isHigh) out.push({ index: i, price: h, kind: 'high' });
    if (isLow) out.push({ index: i, price: l, kind: 'low' });
  }
  return out;
}

/**
 * Greedy clustering of pivot prices: pivots within `tolPct`% of the running cluster mean
 * merge into one level. Level price = mean of members (for highs we use max-of-members
 * so the box top hugs the wicks; lows use min) — controlled via `edge`.
 */
export function clusterLevels(pivots: Pivot[], tolPct: number, edge: 'max' | 'min' | 'mean' = 'mean'): Level[] {
  const sorted = [...pivots].sort((a, b) => a.price - b.price);
  const clusters: Pivot[][] = [];
  for (const p of sorted) {
    const cur = clusters[clusters.length - 1];
    if (cur) {
      const mean = cur.reduce((s, x) => s + x.price, 0) / cur.length;
      if (Math.abs(p.price - mean) / mean <= tolPct / 100) {
        cur.push(p);
        continue;
      }
    }
    clusters.push([p]);
  }
  return clusters.map((c) => {
    const prices = c.map((x) => x.price);
    const price =
      edge === 'max' ? Math.max(...prices) : edge === 'min' ? Math.min(...prices) : prices.reduce((s, x) => s + x, 0) / prices.length;
    return {
      price,
      touches: c.length,
      lastIndex: Math.max(...c.map((x) => x.index)),
      firstIndex: Math.min(...c.map((x) => x.index)),
    };
  });
}
