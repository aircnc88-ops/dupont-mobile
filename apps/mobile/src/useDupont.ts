import { useMemo } from 'react';
import { atr as atrOf, detectBox, generateSignals, pressureFromOHLCV, type Box, type DetectBoxOptions, type Pressure, type Signal, type SignalType } from '@bitget-sim/dupont';
import type { Candle } from './data/bitget';
import type { TapeBuckets } from './lib/tape';
import { SLIPPAGE_BPS, TAKER_FEE } from './paper/broker';
import type { Settings } from './lib/storage';

export interface ManualBox { top: number; bottom: number; startTs: number; locked: boolean }

/** A manual/locked box adapted to the @bitget-sim/dupont Box shape. */
export function manualToBox(m: ManualBox, candles: readonly Candle[], tolerancePct: number): Box {
  const top = Math.max(m.top, m.bottom);
  const bottom = Math.min(m.top, m.bottom);
  let startIndex = candles.findIndex((c) => c.ts >= m.startTs);
  if (startIndex < 0) startIndex = Math.max(0, candles.length - 60);
  const endIndex = Math.max(0, candles.length - 1);
  // N8: real ATR so manual-box signal SLs get the same max(0.03%, 0.1 × ATR) buffer as detected boxes
  const a = candles.length > 1 ? atrOf(candles.slice(-80), 14) : NaN;
  const atr = Number.isFinite(a) ? a : 0;
  return {
    top: String(top), bottom: String(bottom), mid: String((top + bottom) / 2), height: String(top - bottom),
    startTime: candles[startIndex]?.ts ?? m.startTs, endTime: candles[endIndex]?.ts ?? m.startTs,
    startIndex, endIndex, touchesTop: 2, touchesBottom: 2, topPivots: [], bottomPivots: [],
    atr, heightAtr: atr > 0 ? (top - bottom) / atr : 0, insideShare: 1, tolerancePct, isRange: true,
  };
}

export interface DupontView {
  closed: Candle[];
  /** pressures aligned with `candles` (incl. the forming candle) */
  pressures: Pressure[];
  /** display box: detected on all CLOSED candles */
  box: Box | null;
  /** signal box for the latest closed candle: detected WITHOUT the trigger candle (= analyzeDupont) */
  signalBox: Box | null;
  /** signals on the most recent CLOSED candle */
  live: Signal[];
  /** walk-forward signals over recent history (box re-detected per bar, no look-ahead, no same-type repeats) */
  history: Signal[];
  tapeCandles: number;
}

const HISTORY_BARS = 150;

/** Box used to judge the latest closed candle: detected WITHOUT that trigger candle (same as analyzeDupont). */
export function signalBoxFor(closed: readonly Candle[], boxOpts: DetectBoxOptions, manualBox: Box | null): Box | null {
  return manualBox ?? (closed.length > 11 ? detectBox(closed.slice(0, -1), boxOpts) : null);
}
/** a candle counts as closed only once the SERVER clock is this far past its end (late prints) */
export const CLOSE_GRACE_MS = 1500;
/** B6: the last candle is still forming until the SERVER clock passes its end + grace (phone clock skew cannot close it early). */
export const isForming = (lastTs: number, intervalMs: number, serverNow: number) => serverNow < lastTs + intervalMs + CLOSE_GRACE_MS;

export function useDupont(
  candles: Candle[],
  intervalMs: number,
  tape: React.MutableRefObject<TapeBuckets>,
  tapeVer: number,
  serverNow: () => number,
  s: Settings,
  manual: ManualBox | null,
  dp: number
): DupontView {
  const boxOpts = useMemo(
    () => ({ lookback: s.lookback, tolerancePct: s.tolerancePct, pivotLeft: s.pivotLeft, pivotRight: s.pivotRight, minTouches: s.minTouches, minHeightPct: s.minHeightPct }),
    [s.lookback, s.tolerancePct, s.pivotLeft, s.pivotRight, s.minTouches, s.minHeightPct]
  );
  const sigOpts = useMemo(
    () => ({ requireRange: s.requireRange, tickSize: (10 ** -dp).toFixed(dp), feeRate: TAKER_FEE, slippageBps: SLIPPAGE_BPS }),
    [s.requireRange, dp]
  );

  // closed = the server clock is past the candle end (+grace); phone clock skew cannot repaint
  const last = candles[candles.length - 1];
  const forming = !!last && isForming(last.ts, intervalMs, serverNow());
  const closed = useMemo(() => (forming ? candles.slice(0, -1) : candles), [candles, forming]);

  const pressures = useMemo(
    () => candles.map((c) => tape.current.pressure(c.ts, intervalMs) ?? pressureFromOHLCV(c)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [candles, tapeVer, intervalMs]
  );

  const closedKey = closed.length ? `${closed[closed.length - 1].ts}:${closed.length}` : '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const manualBox = useMemo(() => (manual ? manualToBox(manual, closed, s.tolerancePct) : null), [manual, closedKey, s.tolerancePct]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const box = useMemo(() => manualBox ?? (closed.length > 10 ? detectBox(closed, boxOpts) : null), [closedKey, boxOpts, manualBox]);
  const signalBox = useMemo(
    () => signalBoxFor(closed, boxOpts, manualBox),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [closedKey, boxOpts, manualBox]
  );

  const hist = useMemo(() => {
    const out: Signal[] = [];
    const n = closed.length;
    let prev = new Set<SignalType>();
    if (n < 30) return { out, prevAtLast: prev };
    const pr = pressures.slice(0, n);
    for (let i = Math.max(25, n - HISTORY_BARS); i < n - 1; i++) {
      const b = manualBox ?? detectBox(closed.slice(0, i), boxOpts);
      if (!b) { prev = new Set(); continue; }
      const raw = generateSignals(closed.slice(0, i + 1), pr.slice(0, i + 1), b, sigOpts);
      // same rule as generateSignals' scan mode: a type that fired on the previous bar is not repeated
      out.push(...raw.filter((g) => !prev.has(g.type)));
      prev = new Set(raw.map((g) => g.type));
    }
    return { out, prevAtLast: prev };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closedKey, boxOpts, sigOpts, manualBox]);

  const live = useMemo(() => {
    if (!signalBox || closed.length < 3) return [];
    return generateSignals(closed, pressures.slice(0, closed.length), signalBox, sigOpts).filter((g) => !hist.prevAtLast.has(g.type));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closedKey, signalBox, sigOpts, pressures, hist]);

  const history = useMemo(() => [...hist.out, ...live], [hist, live]);
  const tapeCandles = pressures.filter((p) => p.source === 'trades').length;
  return { closed, pressures, box, signalBox, live, history, tapeCandles };
}
