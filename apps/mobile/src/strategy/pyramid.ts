import { isBearishEngulfing, isBullishEngulfing } from './candles';
import { buyRatio } from './pressure';
import type { Bar, Pressure, Side } from './types';

export function canAdd(adds: number, maxAdds: number): boolean {
  return adds < maxAdds;
}

export interface PyramidInput {
  side: Side;
  /** broken box edge (top for long breakouts, bottom for short) */
  level: number;
  adds: number;
  maxAdds?: number;
  prev: Bar;
  cur: Bar;
  pressure: Pressure;
  /** retest tolerance in % of level; default 0.15 */
  tolPct?: number;
  strong?: number;
}

/**
 * 불타기: after a breakout, price retests the broken level (wick within tolerance) and holds
 * (close on the breakout side) with an engulfing candle OR strong pressure → add-on suggestion.
 */
export function pyramidSuggestion(i: PyramidInput): { ok: boolean; reason: string } {
  const maxAdds = i.maxAdds ?? 2;
  if (!canAdd(i.adds, maxAdds)) return { ok: false, reason: `최대 추가 ${maxAdds}회 도달` };
  const tol = (i.level * (i.tolPct ?? 0.15)) / 100;
  const strong = i.strong ?? 0.6;
  const br = buyRatio(i.pressure);
  if (i.side === 'long') {
    const retest = i.cur.low <= i.level + tol && i.cur.close > i.level;
    const confirm = isBullishEngulfing(i.prev, i.cur) || br >= strong;
    if (retest && confirm) return { ok: true, reason: `돌파선 ${i.level.toFixed(2)} 리테스트 지지 · 매수압력 ${Math.round(br * 100)}%` };
  } else {
    const retest = i.cur.high >= i.level - tol && i.cur.close < i.level;
    const confirm = isBearishEngulfing(i.prev, i.cur) || 1 - br >= strong;
    if (retest && confirm) return { ok: true, reason: `이탈선 ${i.level.toFixed(2)} 리테스트 저항 · 매도압력 ${Math.round((1 - br) * 100)}%` };
  }
  return { ok: false, reason: '' };
}
