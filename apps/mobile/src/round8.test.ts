import { describe, expect, it } from 'vitest';
import appSource from './App.tsx?raw';
import { PaperBroker, TAKER_FEE, MAKER_FEE } from './paper/broker';
import { ReplayGate, REPLAY_MAX_RETRY_MS, replayFrom } from './lib/replayGate';

/*
 * Round 8 (Jev Z8 = G1): an exposed gap is never given up. Jev's probe E — three (or more) REAL 1m-candle fetch
 * failures while live prices keep arriving, server clock measured — must not drop the offline window. The harness
 * mirrors App.tsx runReplay / liveTick / closePos (clock synced, phone = server).
 */
const M = 60_000;
const S = Date.UTC(2026, 9, 9, 6, 0); // server minute 0
type Bar = { ts: number; open: number; high: number; low: number; close: number };
const LONG: Parameters<PaperBroker['open']>[0] = { symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 10, sl: 99, targets: [{ price: 103, fraction: 1, label: 'TP' }], setup: 'MANUAL', liquidity: 'maker' };
/** offline 1m bars by server minute index; `rest` = every minute after 12 */
type Offline = Record<number, number[]> & { rest?: number[] };

function app() {
  let server = S;
  const b = new PaperBroker();
  b.slip = 0;
  const gate = new ReplayGate();
  const toasts: string[] = [];
  const special: Offline = {};
  let fetchFails = 0;
  let fetches = 0;
  const bars = (from: number, to: number): Bar[] => {
    const r: Bar[] = [];
    for (let ts = from; ts <= to; ts += M) {
      const i = (ts - S) / M;
      const [o, hi, lo, c] = special[i] ?? (i > 12 ? special.rest : undefined) ?? [100, 100.05, 99.95, 100];
      r.push({ ts, open: o, high: hi, low: lo, close: c });
    }
    return r;
  };
  const runReplay = () => {
    for (const sym of gate.begin(b.state, server)) {
      try {
        fetches += 1;
        if (fetchFails > 0) { fetchFails -= 1; throw new Error('candles 503'); } // real fetch failure (clock is fine)
        const start = Math.floor(replayFrom(b.state, sym) / M) * M;
        b.replayBars(sym, bars(start, server).filter((c) => c.ts >= start), server).forEach((e) => toasts.push(`[재생] ${e.kind}`));
        const lt = (b.state.lastTickTs ??= {});
        lt[sym] = Math.max(lt[sym] ?? 0, server);
        gate.succeeded(sym);
      } catch {
        const clockUnknown = false;
        if (gate.failed(sym, server, !clockUnknown)) toasts.push('3회 실패 – 계속 재시도');
      } finally {
        gate.release(sym);
      }
    }
  };
  return {
    b, gate, toasts, special,
    get fetches() { return fetches; },
    at(t: number) { server = t; },
    now: () => server,
    failNext(n: number) { fetchFails = n; },
    liveTick(price: number) {
      const g = gate.tick(b.state, 'X', server);
      if (g === 'replaying') return g;
      if (g === 'gap') { runReplay(); return g; }
      b.onPrice('X', price, server);
      return g;
    },
    ticksUntil(until: number, price: number) { const d: string[] = []; for (let t = server + 5_000; t <= until; t += 5_000) { server = t; d.push(this.liveTick(price)); } return d; },
    closePos() {
      const p = b.state.positions[0];
      if (gate.replaying.has(p.symbol)) { toasts.push('재생 중'); return null; } // Z7
      return b.closeFraction(p.id, 1, 100.42, '시장가 청산', server);
    },
  };
}

/** session 1 opens at 05:00 and is live until 10:00; app closed; reopened at 20:00 with `fails` candle-fetch failures. */
function probe(opts: { offline: Offline; live: number; fails: number; setup?: (a: ReturnType<typeof app>) => void }) {
  const a = app();
  a.at(S + 5 * M);
  if (opts.setup) opts.setup(a); else expect(a.b.open(LONG, a.now()).ok).toBe(true);
  a.ticksUntil(S + 10 * M, 100);
  Object.assign(a.special, opts.offline);
  a.at(S + 20 * M);
  a.failNext(opts.fails);
  const during = a.ticksUntil(S + 20 * M + 4 * M, opts.live); // 4 min of live prices while the candle fetch keeps failing
  return { a, during };
}
const net = (a: ReturnType<typeof app>) => a.b.state.fills.reduce((s, f) => s + f.netPnl, 0);

describe('round 8 — Z8 Jev probe E: real candle-fetch failures with a position open never drop the offline window', () => {
  it('SL touched offline, price recovered → after the replay the stop fills at the SL (−1.08), not missed', () => {
    const { a, during } = probe({ offline: { 12: [100, 100, 98.9, 99.9] }, live: 100, fails: 5 });
    // during the outage (5 failures: 15 s, 30 s, 60 s, 120 s backoff) every live price is refused, nothing is booked
    expect(during.slice(0, 40).every((x) => x === 'gap')).toBe(true);
    expect(a.gate.fails.X?.n ?? 0).toBeLessThanOrEqual(5);
    expect(a.toasts.filter((x) => x.startsWith('3회 실패'))).toHaveLength(1); // one warning at the 3rd failure
    a.ticksUntil(a.now() + 2 * (REPLAY_MAX_RETRY_MS + 5_000), 100); // 5th attempt fails (120 s backoff), the 6th succeeds
    expect(a.fetches).toBe(6);
    expect(a.b.state.positions).toEqual([]);
    const f = a.b.state.fills[0];
    expect(f.reason).toBe('손절 SL');
    expect(f.exit).toBe(99);
    expect(f.closedAt).toBe(S + 12 * M + 59_999); // booked at the offline touch
    expect(net(a)).toBeCloseTo(-1 - 100 * MAKER_FEE - 99 * TAKER_FEE, 9);
    expect(net(a)).toBeCloseTo(-1.08, 2);
    expect(a.toasts.filter((x) => x.startsWith('3회 실패'))).toHaveLength(1); // never a second warning
  });

  it('SL touched offline, price still below (97.6) → the stop fills at the SL 99 (≈ −1.08), not at the current price (−2.48)', () => {
    const { a, during } = probe({ offline: { 12: [100, 100, 98.9, 98.5], rest: [97.6, 97.7, 97.5, 97.6] }, live: 97.6, fails: 4 });
    expect(during.slice(0, 18).every((x) => x === 'gap')).toBe(true); // the live 97.6 never stops it during the outage
    a.ticksUntil(a.now() + 2 * (REPLAY_MAX_RETRY_MS + 5_000), 97.6);
    const f = a.b.state.fills[0];
    expect([f.reason, f.exit, f.closedAt]).toEqual(['손절 SL', 99, S + 12 * M + 59_999]);
    expect(net(a)).toBeCloseTo(-1.08, 2);
    expect(net(a)).toBeGreaterThan(-1.1); // round 7 give-up: live stop at 97.6, net −2.48
  });

  it('TP touched offline, price reverted → the TP fills at 103 (+2.92), not missed', () => {
    const { a } = probe({ offline: { 12: [100, 103.2, 99.95, 100] }, live: 100, fails: 4 });
    expect(a.b.state.fills).toEqual([]);
    a.ticksUntil(a.now() + 2 * (REPLAY_MAX_RETRY_MS + 5_000), 100);
    const f = a.b.state.fills[0];
    expect([f.reason, f.exit, f.closedAt]).toEqual(['TP', 103, S + 12 * M + 59_999]);
    expect(net(a)).toBeCloseTo(3 - 100 * MAKER_FEE - 103 * TAKER_FEE, 9);
    expect(net(a)).toBeCloseTo(2.92, 2);
  });

  it('a pending limit touched in the gap fills at its price (and its own SL is managed from then on)', () => {
    const { a, during } = probe({
      offline: { 12: [100, 100, 99.4, 99.9] }, live: 100,
      fails: 4,
      setup: (x) => { expect(x.b.placeLimit({ symbol: 'X', side: 'long', qty: 1, price: 99.5, leverage: 10, sl: 98, targets: [{ price: 103, fraction: 1, label: 'TP' }], setup: 'MANUAL' }, x.now()).ok).toBe(true); },
    });
    expect(during.slice(0, 18).every((x) => x === 'gap')).toBe(true); // a pending order alone is exposure too
    expect(a.b.state.pending).toHaveLength(1);
    a.ticksUntil(a.now() + 2 * (REPLAY_MAX_RETRY_MS + 5_000), 100);
    expect(a.b.state.pending).toEqual([]);
    expect(a.b.state.positions).toHaveLength(1);
    expect(a.b.state.positions[0].entry).toBe(99.5);
    expect(a.b.state.positions[0].openedAt).toBe(S + 12 * M + 59_999);
  });

  it('a liquidation in the gap is booked (realistic setup: SL removed / beyond liq via broker state; open() rejects that)', () => {
    // open() refuses an SL beyond the liquidation price, so from a normal entry the SL always triggers first (Jev r9 E2).
    // A liquidation in the gap therefore needs a position whose SL is gone or sits beyond liq — e.g. a stored position
    // edited in localStorage or written by an older build. The test sets that DIRECTLY on the broker state after open(),
    // documented here; the replayed bar itself is an ordinary red minute (open 99.9 → high 100 → low 84 → close 84.5).
    const crash = { 12: [99.9, 100, 84, 84.5], rest: [84.5, 84.6, 84.4, 84.5] };
    const probeWith = (sl: number | null) => probe({
      offline: crash, live: 84.5, fails: 4,
      setup: (x) => {
        expect(x.b.open({ ...LONG, sl: 85 }, x.now()).ok).toBe(false); // 'SL이 청산가 밖' — rejected at entry
        expect(x.b.open(LONG, x.now()).ok).toBe(true);
        if (sl !== null) x.b.state.positions[0].sl = sl; // direct state edit (see above)
      },
    }).a;
    for (const [sl, reason] of [[null, '손절 SL'], [0, '강제청산'], [85, '강제청산']] as const) {
      const a = probeWith(sl);
      const liq = a.b.state.positions[0].liqPrice;
      expect(liq).toBeGreaterThan(90);
      expect(liq).toBeLessThan(91);
      expect(a.b.state.fills).toEqual([]); // nothing booked from the live 84.5 during the outage
      a.ticksUntil(a.now() + 2 * (REPLAY_MAX_RETRY_MS + 5_000), 84.5);
      expect(a.b.state.positions).toEqual([]);
      const f = a.b.state.fills[0];
      expect([f.reason, f.closedAt]).toEqual([reason, S + 12 * M + 59_999]);
      if (sl === null) expect(f.exit).toBe(99); // normal entry: the SL at 99 fills first, on the way down
      else expect(f.exit).toBeCloseTo(90, 9); // SL removed (0) or beyond liq (85): liquidated at the bankruptcy price, whole margin lost
    }
  });

  it('manual close still works during the outage (replay pending, not running); SL / TP wait for the replay', () => {
    const { a } = probe({ offline: { 12: [100, 100, 98.9, 99.9] }, live: 100, fails: 50 });
    expect(a.b.state.fills).toEqual([]); // SL touched offline is NOT booked from a live price
    expect(a.gate.replaying.size).toBe(0);
    const f = a.closePos();
    expect(f?.reason).toBe('시장가 청산');
    expect(a.b.state.positions).toEqual([]);
    expect(a.gate.tick(a.b.state, 'X', a.now() + 1)).toBe('live'); // nothing exposed any more → no gap
  });
});

describe('round 8 — Z8 with nothing open: unchanged', () => {
  it('no position / order → no gap, no replay, live as before (even with stale lastTickTs and old failures)', () => {
    const g = new ReplayGate();
    const st = { lastTickTs: { X: S - 3_600_000 } as Record<string, number>, positions: [] as Array<{ symbol: string; openedAt: number }>, pending: [] as Array<{ symbol: string; createdAt: number }> };
    expect(g.needsReplay(st, 'X', S)).toBe(false);
    expect(g.tick(st, 'X', S)).toBe('live');
    expect(g.begin(st, S)).toEqual([]);
    for (let i = 1; i <= 5; i++) g.failed('X', S + i);
    expect(g.tick(st, 'X', S + 10)).toBe('live');
    expect(g.begin(st, S + 10)).toEqual([]);
  });
  it('a closed position (nothing exposed) never blocks live prices for that symbol', () => {
    const a = app();
    a.at(S + 5 * M);
    a.b.open(LONG, a.now());
    a.ticksUntil(S + 10 * M, 100);
    a.b.closeFraction(a.b.state.positions[0].id, 1, 100, '시장가 청산', a.now());
    a.at(S + 20 * M);
    a.failNext(10);
    expect(a.ticksUntil(S + 21 * M, 100).every((x) => x === 'live')).toBe(true);
    expect(a.fetches).toBe(0);
  });
});

describe('round 8 — Z8 source', () => {
  it('App.tsx: the 3rd-failure toast says retrying (SL/TP after the replay, manual close possible)', () => {
    expect(appSource).toContain("toast(`[재생] ${sym} 1분봉 조회 3회 실패 – 계속 재시도 중 (손절/익절은 재생 후 반영 · 수동 청산 가능)`, 'down');");
    expect(appSource).not.toContain('현재가로 계속');
  });
});
