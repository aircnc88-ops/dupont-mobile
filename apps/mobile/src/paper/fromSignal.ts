import { computeLevels, type Target as DupontTarget } from '@bitget-sim/dupont';
import { SLIPPAGE_BPS, TAKER_FEE, type Side, type Target } from './broker';

const LABEL: Record<string, string> = { TP1: 'TP1 중앙선', TP2: 'TP2 반대편', TP: 'TP 1:3' };

/** Dupont targets (decimal strings, sizePct) → paper-broker targets (numbers, fraction of original size). */
export function toBrokerTargets(t: readonly DupontTarget[]): Target[] {
  return t.map((x) => ({ price: Number(x.price), fraction: x.sizePct / 100, label: LABEL[x.label] ?? x.label }));
}

/**
 * N7: manual draft when no box is detected — SL 0.5% away, TP at a NET 1:3 (owner decision 2:
 * fees + slippage included) via the same computeLevels as signals (degenerate box at the price).
 */
export function noBoxBreakoutDraft(side: Side, last: number, tick: string, dp: number): { sl: string; tp1: string } {
  const sl = side === 'long' ? last * 0.995 : last * 1.005;
  const px = String(last);
  const lv = computeLevels({ side, kind: 'breakout', entry: px, extremeWick: String(sl), box: { top: px, bottom: px, mid: px }, slBufferPct: 0, tickSize: tick, feeRate: TAKER_FEE, slippageBps: SLIPPAGE_BPS });
  return { sl: Number(lv.sl).toFixed(dp), tp1: Number(lv.targets[0].price).toFixed(dp) };
}
