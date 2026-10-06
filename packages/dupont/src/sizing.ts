import type { Num } from './types';
import { Decimal, dec } from './util';

export interface SizeInput {
  /** Risk base. Pass REALIZED equity (wallet balance, excluding unrealized PnL). */
  equity: Num;
  /**
   * Free balance for the margin cap (margin + entry fee must fit). Default `equity`.
   */
  available?: Num;
  /** Slippage (bps) on the market entry and the stop exit, included in the risk per unit. Default 0. */
  slippageBps?: number;
  /** Exchange minimum order notional (e.g. 5 USDT); below it qty is 0 and `belowMin` is set. */
  minNotional?: Num;
  /** Exchange minimum order qty (e.g. 0.0001 BTC); below it qty is 0 and `belowMin` is set. */
  minQty?: Num;
  /** Risk per trade, % of equity. Default 1. */
  riskPct?: number;
  entry: Num;
  sl: Num;
  /** Default 1. */
  leverage?: number;
  /** Fee rate per side (taker). Default 0.0006 (Bitget USDT-M taker, matches FEE_PROFILES). */
  feeRate?: Num;
  /** Round qty DOWN to this step (e.g. '0.0001' for BTCUSDT perp). Default: no rounding. */
  qtyStep?: Num;
  /** Include entry + exit-at-SL fees in the risk budget. Default true. */
  includeFeesInRisk?: boolean;
}

export interface SizeResult {
  side: 'long' | 'short';
  qty: string;
  notional: string;
  /** notional / leverage */
  margin: string;
  riskAmount: string;
  riskPerUnit: string;
  entryFee: string;
  exitFeeAtSl: string;
  /** entryFee + exitFeeAtSl */
  estFees: string;
  /** Price loss at SL + estFees for the final qty. */
  lossAtSl: string;
  /** True when qty was reduced so margin + entry fee ≤ available. */
  capped: boolean;
  /** Set when the risk-sized qty is below the exchange minimum qty / notional (qty is then '0'). */
  belowMin?: 'min_qty' | 'min_notional';
}

/**
 * Fixed-fractional position sizing.
 * qty = equity·riskPct% / (|entry − sl| + (feeRate + slip)·(entry + sl))   (fees/slippage included by default),
 * then capped so margin + entry fee ≤ available (qty ≤ available·lev / (entry·(1 + lev·fee))),
 * then rounded down to `qtyStep`; below minQty / minNotional → qty 0 with `belowMin`.
 */
export function sizePosition(input: SizeInput): SizeResult {
  const equity = dec(input.equity);
  const riskPct = input.riskPct ?? 1;
  const entry = dec(input.entry);
  const sl = dec(input.sl);
  const lev = dec(input.leverage ?? 1);
  const fee = dec(input.feeRate ?? '0.0006');
  if (entry.lte(0) || sl.lte(0)) throw new Error('entry and sl must be > 0');
  if (entry.eq(sl)) throw new Error('entry and sl must differ');
  if (lev.lte(0)) throw new Error('leverage must be > 0');
  const side = sl.lt(entry) ? 'long' : 'short';
  const riskAmount = equity.times(riskPct).div(100);
  const perUnit = entry.minus(sl).abs();
  const slip = dec(input.slippageBps ?? 0).div(10_000);
  const costPerUnit = (input.includeFeesInRisk ?? true) ? perUnit.plus(fee.plus(slip).times(entry.plus(sl))) : perUnit;
  let qty = riskAmount.div(costPerUnit);
  let capped = false;
  const capBase = input.available !== undefined ? dec(input.available) : equity;
  const maxQty = Decimal.max(0, capBase).times(lev).div(entry.times(dec(1).plus(lev.times(fee))));
  if (qty.gt(maxQty)) {
    qty = maxQty;
    capped = true;
  }
  if (input.qtyStep !== undefined && dec(input.qtyStep).gt(0)) {
    const step = dec(input.qtyStep);
    qty = qty.div(step).floor().times(step);
  }
  let belowMin: SizeResult['belowMin'];
  if (input.minQty !== undefined && qty.lt(dec(input.minQty))) belowMin = 'min_qty';
  else if (input.minNotional !== undefined && qty.times(entry).lt(dec(input.minNotional))) belowMin = 'min_notional';
  if (belowMin) qty = dec(0);
  const notional = qty.times(entry);
  const entryFee = notional.times(fee);
  const exitFee = qty.times(sl).times(fee);
  const estFees = entryFee.plus(exitFee);
  const slipCost = qty.times(entry.plus(sl)).times(slip);
  return {
    side,
    qty: qty.toFixed(),
    notional: notional.toFixed(),
    margin: notional.div(lev).toFixed(),
    riskAmount: riskAmount.toFixed(),
    riskPerUnit: perUnit.toFixed(),
    entryFee: entryFee.toFixed(),
    exitFeeAtSl: exitFee.toFixed(),
    estFees: estFees.toFixed(),
    lossAtSl: qty.times(perUnit).plus(estFees).plus(slipCost).toFixed(),
    capped,
    ...(belowMin ? { belowMin } : {}),
  };
}

