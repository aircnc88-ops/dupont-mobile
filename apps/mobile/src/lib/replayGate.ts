/**
 * R1 (Jev round 3): offline-replay gate, pure (no React) so it can be unit-tested.
 *  - a symbol with exposure (position or pending limit) whose last processed price is older than
 *    REPLAY_GAP_MS (30 s, Jev's pick) needs a replay; live ticks for it are REFUSED until the replay
 *    has closed the gap — a live price never jumps an offline gap;
 *  - `begin()` gates ALL symbols to be replayed synchronously, before the first network await;
 *  - Z8 (round 8, replaces R1's give-up): an exposed gap is NEVER given up — fetch failures back off
 *    15 s → 30 s → 60 s → 120 s (max) and retry forever; the caller warns once at the 3rd failure; live
 *    SL/TP stays deferred to the replay (booked SL-first at the exact level); manual close still works;
 *    Z5: failures while the server clock is unmeasured are retried but never counted;
 *  - Z6: a failure stamped in the future (on a fast, unmeasured phone clock) is due at once;
 *  - legacy state without `lastTickTs` replays from the oldest open / order time.
 */
export const REPLAY_GAP_MS = 30_000;
export const REPLAY_RETRY_MS = 15_000;
export const REPLAY_MAX_FAILS = 3;
export const REPLAY_MAX_RETRY_MS = 120_000;

export interface GateState {
  lastTickTs?: Record<string, number>;
  positions: ReadonlyArray<{ symbol: string; openedAt: number }>;
  pending: ReadonlyArray<{ symbol: string; createdAt: number }>;
}

export const exposedSymbols = (st: GateState): string[] => [...new Set([...st.positions.map((p) => p.symbol), ...st.pending.map((o) => o.symbol)])];
export const isExposed = (st: GateState, sym: string): boolean => st.positions.some((p) => p.symbol === sym) || st.pending.some((o) => o.symbol === sym);

/**
 * Time of the last processed price for `sym`. Legacy state without lastTickTs → oldest open / order time.
 * Never earlier than that oldest open / order time: bars before it cannot affect anything (replay only
 * manages positions/orders that existed at the bar), so a stale lastTickTs from before the first
 * exposure does not force a pointless replay.
 */
export function replayFrom(st: GateState, sym: string): number {
  const oldest = Math.min(...st.positions.filter((p) => p.symbol === sym).map((p) => p.openedAt), ...st.pending.filter((o) => o.symbol === sym).map((o) => o.createdAt));
  const lt = st.lastTickTs?.[sym];
  return lt === undefined ? oldest : Number.isFinite(oldest) ? Math.max(lt, oldest) : lt;
}

export type TickDecision = 'live' | 'replaying' | 'gap';

export class ReplayGate {
  readonly replaying = new Set<string>();
  readonly fails: Record<string, { n: number; at: number }> = {};
  constructor(public gapMs = REPLAY_GAP_MS, public retryMs = REPLAY_RETRY_MS, public maxFails = REPLAY_MAX_FAILS) {}

  needsReplay(st: GateState, sym: string, now: number): boolean {
    const from = replayFrom(st, sym);
    return isExposed(st, sym) && Number.isFinite(from) && now - from > this.gapMs; // Z8: an exposed gap is never given up
  }

  /** Decision for one live tick on `sym`: 'live' = process it; 'replaying' / 'gap' = refuse it ('gap' → start a replay). */
  tick(st: GateState, sym: string, now: number): TickDecision {
    if (this.replaying.has(sym)) return 'replaying';
    return this.needsReplay(st, sym, now) ? 'gap' : 'live';
  }

  /** Symbols to replay now (not already replaying, need it, not inside the retry backoff); ALL are gated before returning. */
  begin(st: GateState, now: number): string[] {
    const due = (sym: string) => {
      const f = this.fails[sym];
      if (!f) return true;
      const wait = Math.min(this.retryMs * 2 ** Math.max(0, f.n - 1), REPLAY_MAX_RETRY_MS); // Z8: 15 s, 30 s, 60 s, 120 s, 120 s …
      return now - f.at > wait || f.at > now; // Z6
    };
    const syms = exposedSymbols(st).filter((sym) => !this.replaying.has(sym) && this.needsReplay(st, sym, now) && due(sym));
    syms.forEach((sym) => this.replaying.add(sym));
    return syms;
  }

  succeeded(sym: string): void { delete this.fails[sym]; }

  /** Record a failed attempt; true exactly once, at the maxFails-th counted failure (caller warns; retries go on). `counts = false` (clock not measured yet, Z5): never counted. */
  failed(sym: string, now: number, counts = true): boolean {
    const f = (this.fails[sym] ??= { n: 0, at: 0 });
    if (counts) f.n += 1;
    f.at = now;
    return counts && f.n === this.maxFails;
  }

  release(sym: string): void { this.replaying.delete(sym); }
}
