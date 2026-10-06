import DecimalJs from 'decimal.js';
import type { CandleInput, Num } from './types';

/**
 * Package-local Decimal constructor configured exactly like `@bitget-sim/shared`
 * (precision 40, ROUND_HALF_UP) but isolated via `clone`, so results never depend on
 * module load order or on other code mutating the global decimal.js config.
 */
export const Decimal = DecimalJs.clone({ precision: 40, rounding: DecimalJs.ROUND_HALF_UP });
export type Decimal = DecimalJs;

/** Internal numeric bar. */
export interface Bar {
  ts: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function num(v: Num): number {
  return typeof v === 'number' ? v : Number(v);
}

export function dec(v: Num | Decimal): Decimal {
  return new Decimal(v);
}

export function toBar(c: CandleInput): Bar {
  return {
    ts: c.ts,
    open: num(c.open),
    high: num(c.high),
    low: num(c.low),
    close: num(c.close),
    volume: num(c.volume),
  };
}

/** Round to a tick. mode: 'down' | 'up' | 'nearest'. */
export function roundToTick(x: Decimal, tick: Num | undefined, mode: 'down' | 'up' | 'nearest'): Decimal {
  if (tick === undefined) return x;
  const t = dec(tick);
  if (t.lte(0)) return x;
  const q = x.div(t);
  const r = mode === 'down' ? q.floor() : mode === 'up' ? q.ceil() : q.toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  return r.times(t);
}

