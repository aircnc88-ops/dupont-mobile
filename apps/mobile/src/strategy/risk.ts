import type { Box, SetupKind, Side, Target } from './types';

/** SL buffer beyond the setup wick: max(k×ATR, minPct% of price). */
export function slBuffer(price: number, atrValue: number, k = 0.1, minPct = 0.03): number {
  return Math.max(atrValue * k, (price * minPct) / 100);
}

/**
 * Take-profit plan.
 *  - range trades (range_reversal / fake_breakout): 50% at the box midline, 50% at the opposite boundary
 *  - breakout: 100% at entry ± rr × risk (default 1:3)
 */
export function planTargets(
  setup: SetupKind,
  side: Side,
  entry: number,
  sl: number,
  box: Pick<Box, 'top' | 'bottom' | 'mid'>,
  rr = 3
): Target[] {
  if (setup === 'breakout') {
    const risk = Math.abs(entry - sl);
    const price = side === 'long' ? entry + rr * risk : entry - rr * risk;
    return [{ price, fraction: 1, label: `1:${rr}` }];
  }
  const opposite = side === 'long' ? box.top : box.bottom;
  return [
    { price: box.mid, fraction: 0.5, label: 'TP1 중앙선' },
    { price: opposite, fraction: 0.5, label: side === 'long' ? 'TP2 저항' : 'TP2 지지' },
  ];
}

export interface SizeInput {
  equity: number;
  riskPct: number;
  entry: number;
  sl: number;
  leverage: number;
  /** taker fee rate, e.g. 0.0006 */
  feeRate: number;
  /** max share of equity usable as initial margin */
  maxMarginFrac?: number;
  qtyStep?: number;
}

export interface SizeResult {
  qty: number;
  notional: number;
  margin: number;
  riskUsd: number;
  /** loss if SL is hit incl. round-trip fees */
  lossAtSl: number;
  capped: boolean;
}

/**
 * Risk-% sizing: qty = equity×risk% / (|entry−sl| + fees(entry) + fees(sl)),
 * capped so that initial margin (notional / leverage) ≤ maxMarginFrac × equity.
 */
export function positionSize(i: SizeInput): SizeResult {
  const riskUsd = (i.equity * i.riskPct) / 100;
  const perUnit = Math.abs(i.entry - i.sl) + i.entry * i.feeRate + i.sl * i.feeRate;
  let qty = perUnit > 0 ? riskUsd / perUnit : 0;
  const maxFrac = i.maxMarginFrac ?? 0.95;
  const maxQty = (i.equity * maxFrac * i.leverage) / i.entry;
  let capped = false;
  if (qty > maxQty) {
    qty = maxQty;
    capped = true;
  }
  if (i.qtyStep && i.qtyStep > 0) qty = Math.floor(qty / i.qtyStep + 1e-9) * i.qtyStep;
  const notional = qty * i.entry;
  return {
    qty,
    notional,
    margin: notional / Math.max(1, i.leverage),
    riskUsd,
    lossAtSl: qty * perUnit,
    capped,
  };
}

/** Net PnL if every target is hit in order (fees: taker on entry & each exit). */
export function pnlAtTargets(side: Side, entry: number, qty: number, targets: Target[], feeRate: number): number {
  const dir = side === 'long' ? 1 : -1;
  let pnl = -entry * qty * feeRate;
  for (const t of targets) {
    const q = qty * t.fraction;
    pnl += dir * (t.price - entry) * q - t.price * q * feeRate;
  }
  return pnl;
}

export function rewardRisk(side: Side, entry: number, sl: number, target: number): number {
  const risk = Math.abs(entry - sl);
  if (risk <= 0) return 0;
  return ((side === 'long' ? target - entry : entry - target) / risk);
}
