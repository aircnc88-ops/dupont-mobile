import { detectBox } from './box';
import { isBearishEngulfing, isBullishEngulfing } from './candles';
import { atr } from './indicators';
import { buyRatio } from './pressure';
import { planTargets, rewardRisk, slBuffer } from './risk';
import type { Bar, Box, Pressure, SetupKind, Side, Signal, StrategyParams } from './types';
import { DEFAULT_PARAMS } from './types';

const SETUP_LABEL: Record<SetupKind, string> = {
  range_reversal: '박스 반전',
  fake_breakout: '가짜 돌파',
  breakout: '진짜 돌파',
};
export function setupLabel(s: SetupKind | 'manual'): string {
  return s === 'manual' ? '수동' : SETUP_LABEL[s];
}

function make(
  setup: SetupKind,
  side: Side,
  bar: Bar,
  index: number,
  entry: number,
  sl: number,
  box: Box,
  br: number,
  reason: string,
  rr: number
): Signal | null {
  if (side === 'long' && !(sl < entry)) return null;
  if (side === 'short' && !(sl > entry)) return null;
  const targets = planTargets(setup, side, entry, sl, box, rr);
  // range trades need room to the midline
  if (setup !== 'breakout') {
    const t1 = targets[0].price;
    if (side === 'long' && !(t1 > entry)) return null;
    if (side === 'short' && !(t1 < entry)) return null;
  }
  const last = targets[targets.length - 1].price;
  return {
    id: `${setup}-${side}-${bar.time}`,
    time: bar.time,
    index,
    setup,
    side,
    entry,
    sl,
    targets,
    reason,
    buyRatio: br,
    box: { top: box.top, bottom: box.bottom, mid: box.mid },
    rr: rewardRisk(side, entry, sl, last),
  };
}

/**
 * Evaluate the CLOSED bar `i` against a box that was formed BEFORE it.
 * Priority: true breakout → fake breakout → range reversal (one signal per bar).
 */
export function evaluateBar(
  bars: Bar[],
  i: number,
  box: Box | null,
  pressures: Pressure[],
  params: Partial<StrategyParams> = {},
  atrSeries?: number[]
): Signal | null {
  const p = { ...DEFAULT_PARAMS, ...params };
  if (!box || i < 1 || i >= bars.length) return null;
  const cur = bars[i];
  const prev = bars[i - 1];
  const a = (atrSeries ?? atr(bars.slice(0, i + 1)))[i] || (box.top - box.bottom) / 4;
  const buf = slBuffer(cur.close, a, p.slBufferAtr, p.slBufferMinPct);
  const br = buyRatio(pressures[i]);
  const sr = 1 - br;
  const { top, bottom } = box;
  const height = top - bottom;
  const near = height * p.nearFrac;
  const pct = (x: number) => `${Math.round(x * 100)}%`;

  if (box.valid) {
    // 3) True breakout — first close outside the box with confirming pressure
    if (cur.close > top && prev.close <= top && br >= p.strongDominance) {
      return make('breakout', 'long', cur, i, cur.close, cur.low - buf, box, br,
        `저항 ${top.toFixed(2)} 상향 돌파 마감 · 매수압력 ${pct(br)}`, p.breakoutRR);
    }
    if (cur.close < bottom && prev.close >= bottom && sr >= p.strongDominance) {
      return make('breakout', 'short', cur, i, cur.close, cur.high + buf, box, br,
        `지지 ${bottom.toFixed(2)} 하향 이탈 마감 · 매도압력 ${pct(sr)}`, p.breakoutRR);
    }
    // 2) Fake breakout — wick outside, close back inside, strong opposite pressure
    if (cur.high > top && cur.close < top && cur.close > bottom && sr >= p.strongDominance) {
      return make('fake_breakout', 'short', cur, i, cur.close, cur.high + buf, box, br,
        `저항 위 꼬리 후 박스 안 마감 (가짜 돌파) · 매도압력 ${pct(sr)}`, p.breakoutRR);
    }
    if (cur.low < bottom && cur.close > bottom && cur.close < top && br >= p.strongDominance) {
      return make('fake_breakout', 'long', cur, i, cur.close, cur.low - buf, box, br,
        `지지 아래 꼬리 후 박스 안 마감 (가짜 이탈) · 매수압력 ${pct(br)}`, p.breakoutRR);
    }
  }

  if (box.isRange) {
    // 1) Range reversal — touch S/R + engulfing + dominant pressure
    const lo = Math.min(cur.low, prev.low);
    const hi = Math.max(cur.high, prev.high);
    if (lo <= bottom + near && cur.close > bottom && isBullishEngulfing(prev, cur) && br >= p.dominance) {
      return make('range_reversal', 'long', cur, i, cur.close, lo - buf, box, br,
        `지지선 터치 + 상승장악형 · 매수압력 ${pct(br)}`, p.breakoutRR);
    }
    if (hi >= top - near && cur.close < top && isBearishEngulfing(prev, cur) && sr >= p.dominance) {
      return make('range_reversal', 'short', cur, i, cur.close, hi + buf, box, br,
        `저항선 터치 + 하락장악형 · 매도압력 ${pct(sr)}`, p.breakoutRR);
    }
  }
  return null;
}

/**
 * Walk-forward scan for chart markers: at each bar the box is detected from bars strictly
 * before it (no look-ahead), unless a manual/locked box is supplied.
 */
export function scanSignals(
  bars: Bar[],
  pressures: Pressure[],
  params: Partial<StrategyParams> = {},
  fixedBox?: Box | null,
  from = 0
): Signal[] {
  const p = { ...DEFAULT_PARAMS, ...params };
  const out: Signal[] = [];
  const a = atr(bars);
  const start = Math.max(from, p.pivotLeft + p.pivotRight + 10);
  for (let i = start; i < bars.length; i++) {
    const box = fixedBox ?? detectBox(bars.slice(0, i), p);
    const s = evaluateBar(bars, i, box, pressures, p, a);
    if (s) out.push(s);
  }
  return out;
}
