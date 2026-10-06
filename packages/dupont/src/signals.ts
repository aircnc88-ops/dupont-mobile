import type { CandleInput, Num, Side } from './types';
import type { Box } from './box';
import { pressureFromOHLCV, type Pressure } from './pressure';
import { isBearishEngulfing, isBullishEngulfing } from './patterns';
import { Decimal, dec, roundToTick, toBar } from './util';

export type SignalType =
  | 'RANGE_LONG'
  | 'RANGE_SHORT'
  | 'FAKE_BREAKOUT_LONG'
  | 'FAKE_BREAKOUT_SHORT'
  | 'BREAKOUT_LONG'
  | 'BREAKOUT_SHORT';

/**
 * Target management style.
 * - 'range': TP1 = box mid (50%), TP2 = opposite boundary (remaining 50%). Used by RANGE_* and FAKE_BREAKOUT_*.
 * - 'breakout': single TP at `breakoutRR` (default 1:3). Used by BREAKOUT_*.
 */
export type SignalKind = 'range' | 'breakout';

export interface Target {
  label: 'TP1' | 'TP2' | 'TP';
  /** Decimal string. */
  price: string;
  /** % of the position to close at this target (targets sum to 100). */
  sizePct: number;
  /** Reward/risk multiple of this target vs entry/SL. */
  rr: number;
}

export interface Signal {
  type: SignalType;
  side: Side;
  kind: SignalKind;
  /** Index of the trigger candle in the `candles` array and its open ts. */
  index: number;
  ts: number;
  /** Entry = trigger candle close (decimal string). */
  entry: string;
  /** Stop = beyond the extreme wick of the setup candles + buffer (decimal string). */
  sl: string;
  /** |entry - sl| per unit (decimal string). */
  risk: string;
  targets: Target[];
  pressure: Pressure;
  /** Box levels the signal was built from. */
  box: Pick<Box, 'top' | 'bottom' | 'mid'>;
  /** Human-readable rationale. */
  reason: string;
}

export interface SignalOptions {
  /** "Near" a boundary = within this fraction of box height from it. Default 0.2. */
  nearPct?: number;
  /** Pressure ratio (dominant side share, 0..1) required for range signals. Default 0.55. */
  dominance?: number;
  /** Dominant side share required for fake-breakout and breakout confirmation. Default 0.6. */
  strongDominance?: number;
  /** Minimum SL buffer beyond the extreme wick, % of that wick price. Default 0.03 (%). */
  slBufferPct?: number;
  /** ATR-based SL buffer: buffer = max(wick × slBufferPct%, atrBufferFrac × box.atr). Default 0.1. */
  atrBufferFrac?: number;
  /**
   * Number of candles (ending at the trigger) whose extreme wick defines SL for RANGE_* and the
   * pierce window for FAKE_BREAKOUT_* (wick on the trigger or the previous candle). Default 2.
   */
  setupCandles?: number;
  /** Candles whose extreme defines the BREAKOUT_* SL (the breakout candle itself). Default 1. */
  breakoutSetupCandles?: number;
  /** NET R multiple for the breakout TP (net reward = breakoutRR × net risk, fees/slippage included). Default 3. */
  breakoutRR?: number;
  /**
   * Pierce / break tolerance as % of the boundary. A wick/close must exceed the boundary by
   * more than this to count as outside. Default `box.tolerancePct`, capped at
   * `breakTolBoxFrac × box height` so the tolerance never swallows a narrow box.
   */
  breakTolPct?: number;
  /** Cap for the break tolerance as a fraction of box height. Default 0.1. */
  breakTolBoxFrac?: number;
  /**
   * Only emit RANGE_* / FAKE_BREAKOUT_* signals when `box.isRange` is true. Default true.
   * BREAKOUT_* signals ALWAYS require a valid prior range (`box.isRange`), regardless of this flag.
   */
  requireRange?: boolean;
  /** Range signals are dropped when TP1's net reward/risk (after fees + slippage) is below this. Default 1. */
  minNetR1?: number;
  /** Taker fee rate per side used for net R math. Default 0.0006 (Bitget USDT-M taker). */
  feeRate?: number;
  /** Market/stop slippage in basis points used for net R math. Default 0. */
  slippageBps?: number;
  /** Optional tick size; SL is rounded outward, entry/targets to the nearest tick. */
  tickSize?: Num;
  /** Evaluate candles from this index to the end. Default: only the last candle. */
  fromIndex?: number;
}

const D2 = new Decimal(2);

/**
 * Generate Dupont Standard signals for the trigger candle(s) against `box`.
 *
 * `pressures[i]` must correspond to `candles[i]` (missing entries fall back to
 * {@link pressureFromOHLCV}). By default only the last candle is evaluated; pass
 * `fromIndex` to scan (a type that fired on the previous candle is not repeated).
 *
 * Rules (t = min(tolPct% of the boundary, breakTolBoxFrac × height), zone = nearPct × box height,
 * setup = last `setupCandles` bars, "inside" = close within [bottom − t, top + t] — no dead zone):
 * - RANGE_LONG: setup low ≥ bottom − t, trigger low ≤ bottom + zone, close inside and below
 *   mid, bullish engulfing, buy ratio ≥ dominance, TP1 net R ≥ minNetR1. RANGE_SHORT mirrors.
 * - FAKE_BREAKOUT_LONG: a wick below bottom − t on the trigger or the previous candle, close back
 *   inside, bullish reversal trigger (close > open and close ≥ candle midpoint),
 *   buy ratio ≥ strongDominance, TP1 net R ≥ minNetR1. FAKE_BREAKOUT_SHORT mirrors at the top.
 * - BREAKOUT_LONG: valid range (isRange), close > top + t, previous close ≤ top + t (fresh break),
 *   bullish candle, buy ratio ≥ strongDominance; SL beyond the breakout candle, TP at NET 1:3.
 *   BREAKOUT_SHORT mirrors below the bottom.
 */
export function generateSignals(
  candles: readonly CandleInput[],
  pressures: readonly (Pressure | undefined)[],
  box: Box | null,
  opts: SignalOptions = {},
): Signal[] {
  if (!box || candles.length < 2) return [];
  // breakouts always need a valid range; requireRange only gates range / fake-breakout setups
  if ((opts.requireRange ?? true) && !box.isRange) return [];
  const from = Math.max(1, opts.fromIndex ?? candles.length - 1);
  const out: Signal[] = [];
  let prevTypes = new Set<SignalType>();
  for (let i = from; i < candles.length; i++) {
    const sigs = evaluateAt(candles, pressures, box, opts, i);
    const fresh = sigs.filter((s) => !prevTypes.has(s.type));
    out.push(...fresh);
    prevTypes = new Set(sigs.map((s) => s.type));
  }
  return out;
}

function evaluateAt(
  candles: readonly CandleInput[],
  pressures: readonly (Pressure | undefined)[],
  box: Box,
  opts: SignalOptions,
  i: number,
): Signal[] {
  const nearPct = opts.nearPct ?? 0.2;
  const dominance = opts.dominance ?? 0.55;
  const strong = opts.strongDominance ?? 0.6;
  const setupN = Math.max(1, opts.setupCandles ?? 2);
  const tolPct = opts.breakTolPct ?? box.tolerancePct;

  const c = toBar(candles[i]);
  const p = toBar(candles[i - 1]);
  const pr = pressures[i] ?? pressureFromOHLCV(candles[i]);
  const setup = candles.slice(Math.max(0, i - setupN + 1), i + 1).map(toBar);
  const setupLow = Math.min(...setup.map((b) => b.low));
  const setupHigh = Math.max(...setup.map((b) => b.high));

  const top = Number(box.top);
  const bottom = Number(box.bottom);
  const mid = Number(box.mid);
  const zone = (top - bottom) * nearPct;
  // one absolute tolerance for both edges, capped by box height (no dead zone, no swallowed box)
  const tAbs = Math.min((top * tolPct) / 100, (top - bottom) * (opts.breakTolBoxFrac ?? 0.1));
  const tTop = tAbs;
  const tBot = tAbs;
  const inside = c.close >= bottom - tBot && c.close <= top + tTop;
  const sellRatio = 1 - pr.ratio;
  const cMidBar = (c.high + c.low) / 2;
  const canBreak = box.isRange;

  const out: Signal[] = [];
  const ctx = { candles, box, opts, i, pr };
  const push = (s: Signal | null) => { if (s) out.push(s); };

  // ---- long side ----
  if (c.close > top + tTop) {
    if (canBreak && p.close <= top + tTop && c.close > c.open && pr.ratio >= strong) {
      push(build(ctx, 'BREAKOUT_LONG', 'long', breakoutExtreme(candles, i, opts, 'long'), `close ${c.close} broke above top ${box.top} with buy ratio ${pr.ratio.toFixed(2)}`));
    }
  } else if (inside && setupLow < bottom - tBot) {
    // fake breakout needs a bullish reversal trigger and the wick on the trigger or previous candle
    if (pr.ratio >= strong && c.close > c.open && c.close >= cMidBar && (c.low < bottom - tBot || p.low < bottom - tBot)) {
      push(build(ctx, 'FAKE_BREAKOUT_LONG', 'long', setupLow, `wick ${setupLow} below bottom ${box.bottom}, bullish reversal back inside with buy ratio ${pr.ratio.toFixed(2)}`));
    }
  } else if (inside && c.low <= bottom + zone && c.close < mid) {
    if (isBullishEngulfing(candles[i - 1], candles[i]) && pr.ratio >= dominance) {
      push(build(ctx, 'RANGE_LONG', 'long', setupLow, `bullish engulfing at support ${box.bottom}, buy ratio ${pr.ratio.toFixed(2)}`));
    }
  }

  // ---- short side ----
  if (c.close < bottom - tBot) {
    if (canBreak && p.close >= bottom - tBot && c.close < c.open && sellRatio >= strong) {
      push(build(ctx, 'BREAKOUT_SHORT', 'short', breakoutExtreme(candles, i, opts, 'short'), `close ${c.close} broke below bottom ${box.bottom} with sell ratio ${sellRatio.toFixed(2)}`));
    }
  } else if (inside && setupHigh > top + tTop) {
    if (sellRatio >= strong && c.close < c.open && c.close <= cMidBar && (c.high > top + tTop || p.high > top + tTop)) {
      push(build(ctx, 'FAKE_BREAKOUT_SHORT', 'short', setupHigh, `wick ${setupHigh} above top ${box.top}, bearish reversal back inside with sell ratio ${sellRatio.toFixed(2)}`));
    }
  } else if (inside && c.high >= top - zone && c.close > mid) {
    if (isBearishEngulfing(candles[i - 1], candles[i]) && sellRatio >= dominance) {
      push(build(ctx, 'RANGE_SHORT', 'short', setupHigh, `bearish engulfing at resistance ${box.top}, sell ratio ${sellRatio.toFixed(2)}`));
    }
  }
  return out;
}

/** BREAKOUT_* SL extreme: the breakout candle(s) only (default 1), not the 2-candle setup. */
function breakoutExtreme(candles: readonly CandleInput[], i: number, opts: SignalOptions, side: Side): number {
  const n = Math.max(1, opts.breakoutSetupCandles ?? 1);
  const bars = candles.slice(Math.max(0, i - n + 1), i + 1).map(toBar);
  return side === 'long' ? Math.min(...bars.map((b) => b.low)) : Math.max(...bars.map((b) => b.high));
}

interface Ctx {
  candles: readonly CandleInput[];
  box: Box;
  opts: SignalOptions;
  i: number;
  pr: Pressure;
}

function build(ctx: Ctx, type: SignalType, side: Side, extreme: number, reason: string): Signal | null {
  const { candles, box, opts, i, pr } = ctx;
  const kind: SignalKind = type.startsWith('BREAKOUT') ? 'breakout' : 'range';
  const feeRate = opts.feeRate ?? DEFAULT_FEE_RATE;
  const slippageBps = opts.slippageBps ?? 0;
  const levels = computeLevels({
    side,
    kind,
    entry: candles[i].close,
    extremeWick: String(extreme),
    box,
    slBufferPct: opts.slBufferPct,
    atr: box.atr,
    atrBufferFrac: opts.atrBufferFrac,
    breakoutRR: opts.breakoutRR,
    tickSize: opts.tickSize,
    feeRate,
    slippageBps,
  });
  if (kind === 'range') {
    // TP1 must pay at least minNetR1 × the net risk after fees + slippage
    const r1 = netRMultiple({ side, entry: levels.entry, sl: levels.sl, tp: levels.targets[0].price, feeRate, slippageBps });
    if (r1 < (opts.minNetR1 ?? 1)) return null;
  }
  return {
    type,
    side,
    kind,
    index: i,
    ts: candles[i].ts,
    ...levels,
    pressure: pr,
    box: { top: box.top, bottom: box.bottom, mid: box.mid },
    reason,
  };
}

export interface LevelsInput {
  side: Side;
  kind: SignalKind;
  entry: Num;
  /** Lowest low (long) / highest high (short) of the setup candles. */
  extremeWick: Num;
  box: Pick<Box, 'top' | 'bottom' | 'mid'>;
  /** Minimum SL buffer, % of the wick price. Default 0.03. */
  slBufferPct?: number;
  /** ATR of the box window; buffer = max(wick × slBufferPct%, atrBufferFrac × atr). Default 0 (no ATR term). */
  atr?: number;
  /** Default 0.1. */
  atrBufferFrac?: number;
  /** NET breakout R multiple. Default 3. */
  breakoutRR?: number;
  tickSize?: Num;
  /** Taker fee per side for the net breakout TP. Default 0.0006. */
  feeRate?: number;
  /** Slippage (bps) on the market entry and the stop exit. Default 0. */
  slippageBps?: number;
}

export const DEFAULT_FEE_RATE = 0.0006;

export interface NetRInput {
  side: Side;
  entry: Num;
  sl: Num;
  tp: Num;
  /** Taker fee per side. Default 0.0006. */
  feeRate?: number;
  /** Slippage (bps) on the market entry and stop exit (TP exits fill at the target). Default 0. */
  slippageBps?: number;
}

/**
 * Net reward / net risk of a target, per unit, fees (taker on both legs) and slippage included:
 * risk = |entry − sl| + (fee + slip)·(entry + sl);  reward = |tp − entry| − (fee + slip)·entry − fee·tp.
 */
export function netRMultiple(x: NetRInput): number {
  const e = Number(x.entry), sl = Number(x.sl), tp = Number(x.tp);
  const f = x.feeRate ?? DEFAULT_FEE_RATE;
  const s = (x.slippageBps ?? 0) / 10_000;
  const risk = Math.abs(e - sl) + (f + s) * (e + sl);
  const reward = (x.side === 'long' ? tp - e : e - tp) - (f + s) * e - f * tp;
  return risk > 0 ? reward / risk : 0;
}

/**
 * Entry / SL / targets math used by every signal (exported for UI previews & tests).
 * - SL = extremeWick ∓ max(extremeWick × slBufferPct/100, atrBufferFrac × atr), rounded outward.
 * - range: TP1 = mid (50%), TP2 = opposite boundary (50%). If entry is already at/through
 *   mid, a single 100% target at the opposite boundary is returned.
 * - breakout: single TP (100%) placed so the NET reward = breakoutRR × NET risk, with taker fees
 *   on both legs and `slippageBps` on the entry and stop (owner decision: 1:3 is net of fees).
 *   Long:  TP = (E(1+f+s) + R·(E − SL + (f+s)(E+SL))) / (1 − f); short mirrored. Rounded away from entry.
 */
export function computeLevels(input: LevelsInput): Pick<Signal, 'entry' | 'sl' | 'risk' | 'targets'> {
  const long = input.side === 'long';
  const bufPct = input.slBufferPct ?? 0.03;
  const rrB = input.breakoutRR ?? 3;
  const tick = input.tickSize;
  const f = dec(input.feeRate ?? DEFAULT_FEE_RATE);
  const sl$ = dec(input.slippageBps ?? 0).div(10_000);
  const entry = roundToTick(dec(input.entry), tick, 'nearest');
  const ext = dec(input.extremeWick);
  const pctBuf = ext.abs().times(bufPct).div(100);
  const atrBuf = dec(input.atr && Number.isFinite(input.atr) ? input.atr : 0).times(input.atrBufferFrac ?? 0.1);
  const buf = Decimal.max(pctBuf, atrBuf);
  const sl = roundToTick(long ? ext.minus(buf) : ext.plus(buf), tick, long ? 'down' : 'up');
  const risk = entry.minus(sl).abs();
  const rr = (tp: Decimal) => (risk.isZero() ? 0 : tp.minus(entry).abs().div(risk).toNumber());
  const targets: Target[] = [];
  if (input.kind === 'breakout') {
    const fs = f.plus(sl$);
    const netRisk = risk.plus(fs.times(entry.plus(sl)));
    const raw = long
      ? entry.times(dec(1).plus(fs)).plus(netRisk.times(rrB)).div(dec(1).minus(f))
      : entry.times(dec(1).minus(fs)).minus(netRisk.times(rrB)).div(dec(1).plus(f));
    const tp = roundToTick(raw, tick, long ? 'up' : 'down');
    targets.push({ label: 'TP', price: tp.toFixed(), sizePct: 100, rr: rr(tp) });
  } else {
    const mid = roundToTick(dec(input.box.top).plus(dec(input.box.bottom)).div(D2), tick, 'nearest');
    const opp = dec(long ? input.box.top : input.box.bottom);
    const midAhead = long ? mid.gt(entry) : mid.lt(entry);
    if (midAhead) {
      targets.push({ label: 'TP1', price: mid.toFixed(), sizePct: 50, rr: rr(mid) });
      targets.push({ label: 'TP2', price: opp.toFixed(), sizePct: 50, rr: rr(opp) });
    } else {
      targets.push({ label: 'TP2', price: opp.toFixed(), sizePct: 100, rr: rr(opp) });
    }
  }
  return { entry: entry.toFixed(), sl: sl.toFixed(), risk: risk.toFixed(), targets };
}
