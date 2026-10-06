import type { CandleInput, Num, Side } from './types';
import type { Box } from './box';
import type { SignalKind, SignalType } from './signals';
import { pressureFromOHLCV, type Pressure } from './pressure';
import { isBearishEngulfing, isBullishEngulfing } from './patterns';
import { dec, num, roundToTick, toBar } from './util';

/**
 * An open (paper) position managed by the Dupont rules. A {@link Signal} is assignable
 * (add `adds` once you pyramid).
 */
export interface DupontPosition {
  side: Side;
  entry: Num;
  sl?: Num;
  targets: ReadonlyArray<{ price: Num; sizePct?: number; label?: string }>;
  type?: SignalType;
  /** Inferred from `type` when omitted (BREAKOUT_* → 'breakout', else 'range'). */
  kind?: SignalKind;
  /** Number of pyramid adds already done. Default 0. */
  adds?: number;
  /** Override for the broken box level used by {@link pyramidSuggestion}. */
  brokenLevel?: Num;
  /** Open ts of the candle the position was entered in; that candle can never be the retest. */
  openedTs?: number;
  /** Open ts of the retest candle that triggered the last add; the next add needs a later candle. */
  lastAddTs?: number;
  /** Initial risk per unit |entry − initial SL|; default |entry − sl|. */
  risk?: Num;
}

function kindOf(pos: DupontPosition): SignalKind {
  if (pos.kind) return pos.kind;
  return pos.type?.startsWith('BREAKOUT') ? 'breakout' : 'range';
}

export interface FlipAlertOptions {
  /** Opposite-side volume must be ≥ k × its recent average. Default 2. */
  k?: number;
  /** Candles (before the last) used for the average. Default 20. */
  lookback?: number;
  /**
   * "Near target" when the favourable extreme of the last candle has covered at least
   * (1 − nearTargetPct) of the entry→target distance. Default 0.2 (i.e. 80% of the way).
   */
  nearTargetPct?: number;
  /**
   * Only alert when the last candle's pressure comes from the real trade tape (an OHLCV
   * approximation cannot show absorption). Default true.
   */
  requireTape?: boolean;
}

export interface FlipAlertDetail {
  /** true → recommend closing (absorption near target). */
  alert: boolean;
  nearTarget: boolean;
  /** Next unreached target price (or the last target if all were reached). */
  target: string | null;
  /** 0..1+ progress of the favourable extreme toward `target` from entry. */
  progress: number;
  oppositeVolume: number;
  averageOpposite: number;
  /** oppositeVolume / averageOpposite (Infinity when the average is 0). */
  multiple: number;
  reason: string;
}

/**
 * Detailed version of {@link pressureFlipAlert}. `pressures` aligns with `lastCandles`
 * (missing entries fall back to OHLCV pressure). Pass CLOSED candles only: the last element is
 * judged as a finished bar (absorption = opposite-volume spike on a closed candle near target).
 */
export function pressureFlipAlertDetail(
  position: DupontPosition,
  lastCandles: readonly CandleInput[],
  pressures: readonly (Pressure | undefined)[],
  opts: FlipAlertOptions = {},
): FlipAlertDetail {
  const k = opts.k ?? 2;
  const lookback = opts.lookback ?? 20;
  const nearPct = opts.nearTargetPct ?? 0.2;
  const none: FlipAlertDetail = {
    alert: false, nearTarget: false, target: null, progress: 0,
    oppositeVolume: 0, averageOpposite: 0, multiple: 0, reason: 'insufficient data',
  };
  const n = lastCandles.length;
  if (n < 2 || position.targets.length === 0) return none;
  if ((opts.requireTape ?? true) && (pressures[n - 1]?.source ?? 'ohlcv') !== 'trades') return { ...none, reason: 'tape required' };
  const long = position.side === 'long';
  const entry = num(position.entry);
  const last = toBar(lastCandles[n - 1]);
  const pr = (i: number) => pressures[i] ?? pressureFromOHLCV(lastCandles[i]);
  const opp = (x: Pressure) => (long ? x.sell : x.buy);

  const tps = position.targets.map((t) => num(t.price)).sort((a, b) => (long ? a - b : b - a));
  const ref = last.close;
  const next = tps.find((t) => (long ? t > ref : t < ref)) ?? tps[tps.length - 1];
  const extreme = long ? last.high : last.low;
  const span = next - entry;
  const progress = span === 0 ? 1 : (extreme - entry) / span;
  const nearTarget = progress >= 1 - nearPct;

  const from = Math.max(0, n - 1 - lookback);
  const hist: number[] = [];
  for (let i = from; i < n - 1; i++) hist.push(opp(pr(i)));
  const avg = hist.length ? hist.reduce((s, v) => s + v, 0) / hist.length : 0;
  const oppVol = opp(pr(n - 1));
  const multiple = avg > 0 ? oppVol / avg : oppVol > 0 ? Infinity : 0;
  const strongOpp = multiple >= k;
  const alert = nearTarget && strongOpp;
  return {
    alert,
    nearTarget,
    target: String(next),
    progress,
    oppositeVolume: oppVol,
    averageOpposite: avg,
    multiple,
    reason: alert
      ? `${long ? 'sell' : 'buy'} pressure ${multiple.toFixed(2)}x average near target ${next} — absorption, consider closing`
      : !nearTarget
        ? `not near target (${(progress * 100).toFixed(0)}% of the way)`
        : `opposite pressure only ${multiple.toFixed(2)}x average (< ${k}x)`,
  };
}

/**
 * Pressure-flip (absorption) alert: true when price is near the next target AND the last
 * candle's opposite-side pressure (sell for longs, buy for shorts) is ≥ k × its recent
 * average → recommend closing the position.
 */
export function pressureFlipAlert(
  position: DupontPosition,
  lastCandles: readonly CandleInput[],
  pressures: readonly (Pressure | undefined)[],
  opts: FlipAlertOptions = {},
): boolean {
  return pressureFlipAlertDetail(position, lastCandles, pressures, opts).alert;
}

export interface PyramidOptions {
  /** Maximum number of adds per position. Default 2. */
  maxAdds?: number;
  /** Retest tolerance (% of the level). Default `box.tolerancePct`. */
  retestTolPct?: number;
  /** Pressure ratio that counts as "strong" without an engulfing. Default 0.6. */
  strongDominance?: number;
  /** SL buffer % beyond the retest wick. Default 0.05. */
  slBufferPct?: number;
  /** Size of each add as % of the initial position. Default 50. */
  addSizePct?: number;
  tickSize?: Num;
}

export interface PyramidSuggestion {
  add: boolean;
  reason: string;
  /** 1-based number of this add (when `add`). */
  addNumber?: number;
  entry?: string;
  /** Suggested stop for the add (and trail for the whole position): beyond the retest wick. */
  sl?: string;
  sizePct?: number;
  level?: string;
}

/**
 * Pyramiding for BREAKOUT positions: suggest an add when the last candle retests the broken
 * box level (long: low ≤ top + tol and close > top; short mirrored) and confirms with an
 * engulfing candle or strong pressure (ratio ≥ strongDominance). Never more than `maxAdds`.
 * The retest must be a LATER candle than the entry candle (`openedTs`) and the last add
 * (`lastAddTs`), and price must first have moved ≥ 0.5 × initial risk away from the level in
 * between — so the breakout candle itself is never a "retest" and one candle never adds twice.
 */
export function pyramidSuggestion(
  position: DupontPosition,
  candles: readonly CandleInput[],
  pressures: readonly (Pressure | undefined)[],
  box: Box | null,
  opts: PyramidOptions = {},
): PyramidSuggestion {
  const maxAdds = opts.maxAdds ?? 2;
  const adds = position.adds ?? 0;
  if (kindOf(position) !== 'breakout') return { add: false, reason: 'pyramiding only applies to breakout positions' };
  if (adds >= maxAdds) return { add: false, reason: `max adds reached (${adds}/${maxAdds})` };
  if (candles.length < 2) return { add: false, reason: 'insufficient data' };
  const long = position.side === 'long';
  const levelSrc = position.brokenLevel ?? (box ? (long ? box.top : box.bottom) : undefined);
  if (levelSrc === undefined) return { add: false, reason: 'no broken level' };
  const level = num(levelSrc);
  const tolPct = opts.retestTolPct ?? box?.tolerancePct ?? 0.25;
  const tol = (level * tolPct) / 100;
  const strong = opts.strongDominance ?? 0.6;
  const n = candles.length;
  const c = toBar(candles[n - 1]);
  const pr = pressures[n - 1] ?? pressureFromOHLCV(candles[n - 1]);

  const lastTs = candles[n - 1].ts;
  const after = Math.max(position.openedTs ?? -Infinity, position.lastAddTs ?? -Infinity);
  if (lastTs <= after) return { add: false, reason: 'retest must be a later candle than entry/last add', level: String(levelSrc) };
  const risk = position.risk !== undefined ? num(position.risk) : Math.abs(num(position.entry) - num(position.sl ?? position.entry));
  const since = candles.filter((x) => x.ts > after && x.ts < lastTs).map(toBar);
  const movedAway = since.some((b) => (long ? b.high >= level + 0.5 * risk : b.low <= level - 0.5 * risk));
  if (!movedAway) return { add: false, reason: 'no move away from level yet', level: String(levelSrc) };

  const retest = long ? c.low <= level + tol && c.close > level : c.high >= level - tol && c.close < level;
  if (!retest) return { add: false, reason: `no retest of broken level ${levelSrc}`, level: String(levelSrc) };
  const engulf = long ? isBullishEngulfing(candles[n - 2], candles[n - 1]) : isBearishEngulfing(candles[n - 2], candles[n - 1]);
  const ratio = long ? pr.ratio : 1 - pr.ratio;
  if (!engulf && ratio < strong) {
    return { add: false, reason: `retest without confirmation (ratio ${ratio.toFixed(2)})`, level: String(levelSrc) };
  }
  const bufPct = opts.slBufferPct ?? 0.05;
  const ext = dec(long ? c.low : c.high);
  const buf = ext.times(bufPct).div(100);
  const sl = roundToTick(long ? ext.minus(buf) : ext.plus(buf), opts.tickSize, long ? 'down' : 'up');
  return {
    add: true,
    addNumber: adds + 1,
    entry: roundToTick(dec(candles[n - 1].close), opts.tickSize, 'nearest').toFixed(),
    sl: sl.toFixed(),
    sizePct: opts.addSizePct ?? 50,
    level: String(levelSrc),
    reason: `retest of ${levelSrc} confirmed by ${engulf ? 'engulfing' : `pressure ${ratio.toFixed(2)}`}`,
  };
}
