import type { Target as DupontTarget } from '@bitget-sim/dupont';
import type { Target } from './broker';

const LABEL: Record<string, string> = { TP1: 'TP1 중앙선', TP2: 'TP2 반대편', TP: 'TP 1:3' };

/** Dupont targets (decimal strings, sizePct) → paper-broker targets (numbers, fraction of original size). */
export function toBrokerTargets(t: readonly DupontTarget[]): Target[] {
  return t.map((x) => ({ price: Number(x.price), fraction: x.sizePct / 100, label: LABEL[x.label] ?? x.label }));
}
