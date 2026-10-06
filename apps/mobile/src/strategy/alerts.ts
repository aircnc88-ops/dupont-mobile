import type { Pressure, Side } from './types';

export interface FlipInput {
  side: Side;
  entry: number;
  /** next un-hit target */
  target: number;
  price: number;
  current: Pressure;
  /** recent CLOSED candles' pressure (excluding current) */
  recent: Pressure[];
  /** progress toward target (0..1) needed before alerting; default 0.6 */
  minProgress?: number;
  /** opposite-side volume must be ≥ mult × its recent average; default 2 */
  mult?: number;
}

export interface FlipResult {
  alert: boolean;
  progress: number;
  ratio: number;
  message: string;
}

/**
 * 압력 반전 – 청산 권고: near the target, an unusually large OPPOSITE pressure bar
 * (absorption) relative to its recent average, which also dominates the current candle.
 */
export function pressureFlip(i: FlipInput): FlipResult {
  const minProgress = i.minProgress ?? 0.6;
  const mult = i.mult ?? 2;
  const span = i.target - i.entry;
  const progress = span !== 0 ? (i.price - i.entry) / span : 0;
  const opp = (p: Pressure) => (i.side === 'long' ? p.sell : p.buy);
  const same = (p: Pressure) => (i.side === 'long' ? p.buy : p.sell);
  const rec = i.recent.filter((p) => p.buy + p.sell > 0);
  const avg = rec.length ? rec.reduce((s, p) => s + opp(p), 0) / rec.length : 0;
  const ratio = avg > 0 ? opp(i.current) / avg : 0;
  const alert = progress >= minProgress && avg > 0 && ratio >= mult && opp(i.current) > same(i.current);
  return {
    alert,
    progress,
    ratio,
    message: alert
      ? `압력 반전 – 청산 권고 (${i.side === 'long' ? '매도' : '매수'}압력 평균의 ${ratio.toFixed(1)}배, 목표 진행 ${Math.round(progress * 100)}%)`
      : '',
  };
}
