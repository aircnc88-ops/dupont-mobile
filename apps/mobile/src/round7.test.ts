import { afterEach, describe, expect, it, vi } from 'vitest';
import appSource from './App.tsx?raw';
import marketSource from './useMarket.ts?raw';
import { PaperBroker } from './paper/broker';
import { ReplayGate, REPLAY_RETRY_MS, replayFrom } from './lib/replayGate';
import type { WsHandlers } from './data/ws';

/*
 * Round 7 (Jev Z5 / Z6 / Z7). The App harness below mirrors App.tsx runReplay / liveTick / closePos; useMarket is
 * driven for real with React's hooks stubbed (as in round6.test.ts).
 */
const h = vi.hoisted(() => ({
  feeds: [] as Array<{ symbol: string; handlers: WsHandlers }>,
  clock: { next: null as number | null },
}));
vi.mock('react', () => ({
  useRef: (v: unknown) => ({ current: v }),
  useState: (v: unknown) => [typeof v === 'function' ? (v as () => unknown)() : v, () => {}],
  useEffect: (fn: () => unknown) => { fn(); },
}));
vi.mock('./data/ws', async (orig) => ({
  ...(await orig<typeof import('./data/ws')>()),
  BitgetPublicFeed: class {
    lastMsgAt = 0;
    constructor(symbol: string, handlers: WsHandlers) { h.feeds.push({ symbol, handlers }); }
    start() {}
    stop() {}
  },
}));
vi.mock('./data/bitget', async (orig) => ({
  ...(await orig<typeof import('./data/bitget')>()),
  fetchClockOffset: vi.fn(async () => h.clock.next),
  fetchCandles: vi.fn(async () => []),
  fetchTicker: vi.fn(async () => null),
}));
const { useMarket } = await import('./useMarket');
const { fetchClockOffset } = await import('./data/bitget');

const M = 60_000;
const S = Date.UTC(2026, 9, 9, 6, 0); // server minute 0
const POS: Parameters<PaperBroker['open']>[0] = { symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 10, sl: 99, targets: [{ price: 103, fraction: 1, label: 'TP' }], setup: 'MANUAL', liquidity: 'maker' };
/** server-time 1m bars over [from, to] (incl. the forming one); `special` overrides by server minute index */
const bars = (from: number, to: number, special: Record<number, number[]>) => {
  const r = [];
  for (let ts = from; ts <= to; ts += M) {
    const [o, hi, lo, c] = special[(ts - S) / M] ?? [100, 100.05, 99.95, 100];
    r.push({ ts, open: o, high: hi, low: lo, close: c });
  }
  return r;
};

/**
 * App.tsx clock + replay wiring. Session 1 (clock synced) opens at server 05:00 and ticks to 10:00; the app is then
 * closed. `restart(skew)` = cold start: new gate, clock unmeasured (serverNow = phone clock) until `sync()`.
 * `z5 = false` reproduces round 6 (clock failures count toward the 3-failure give-up).
 */
function app(z5 = true) {
  let server = S, skew = 0, offset = 0, synced = true;
  const phone = () => server + skew;
  const serverNow = () => phone() + offset;
  const b = new PaperBroker();
  b.slip = 0;
  let gate = new ReplayGate();
  const toasts: string[] = [];
  let warned = false;
  const special: Record<number, number[]> = {};
  const runReplay = () => {
    for (const sym of gate.begin(b.state, serverNow())) {
      try {
        if (!synced) throw new Error('server clock unknown'); // Z2
        const now = serverNow();
        const start = Math.floor(replayFrom(b.state, sym) / M) * M;
        b.replayBars(sym, bars(start, now, special).filter((c) => c.ts >= start), serverNow());
        const lt = (b.state.lastTickTs ??= {});
        lt[sym] = Math.max(lt[sym] ?? 0, serverNow());
        gate.succeeded(sym);
      } catch {
        const clockUnknown = !synced;
        if (gate.failed(sym, serverNow(), z5 ? !clockUnknown : true)) toasts.push('3회 실패');
        else if (clockUnknown && !warned) { warned = true; toasts.push('서버 시간 확인 실패'); }
      } finally {
        gate.release(sym);
      }
    }
  };
  return {
    b, toasts, special,
    get gate() { return gate; },
    at(t: number) { server = t; },
    serverNow,
    open() { return b.open(POS, serverNow()); },
    liveTick(price = 100) {
      const g = gate.tick(b.state, 'X', serverNow());
      if (g === 'replaying') return g;
      if (g === 'gap') { runReplay(); return g; }
      b.onPrice('X', price, serverNow());
      return g;
    },
    /** live prices every 5 s (server time) over (server, until] */
    ticksUntil(until: number, price = 100) { const d: string[] = []; for (let t = server + 5_000; t <= until; t += 5_000) { server = t; d.push(this.liveTick(price)); } return d; },
    restart(s: number) { skew = s; offset = 0; synced = false; gate = new ReplayGate(); },
    sync() { offset = -skew; synced = true; },
    closePos(frac = 1) {
      const p = b.state.positions[0];
      if (gate.replaying.has(p.symbol)) { toasts.push('재생 중'); return null; } // Z7
      return b.closeFraction(p.id, frac, 100, '시장가 청산', serverNow());
    },
  };
}

describe('round 7 — Z5 clock failures never give a gap up (fix F1)', () => {
  it('gate: uncounted failures keep n = 0 and the gap closed; counted ones warn at the 3rd and (Z8) never give up', () => {
    const st = { positions: [{ symbol: 'X', openedAt: S }], pending: [], lastTickTs: { X: S } };
    const g = new ReplayGate();
    for (let i = 1; i <= 5; i++) {
      const t = S + M + i * 20_000;
      expect(g.begin(st, t)).toEqual(['X']);
      expect(g.failed('X', t, false)).toBe(false);
      g.release('X');
      expect(g.fails.X).toEqual({ n: 0, at: t });
      expect(g.tick(st, 'X', t + 1)).toBe('gap');
    }
    for (let i = 1; i <= 3; i++) expect(g.failed('X', S + 10 * M + i * 20_000)).toBe(i === 3);
    expect(g.tick(st, 'X', S + 11 * M)).toBe('gap'); // Z8 (round 8): still refused after 3 counted failures
  });

  for (const skew of [0, 150_000, -90_000]) {
    it(`Jev probe B (phone ${skew / 1000} s): 3+ /time failures then live prices → the offline stop is not missed`, () => {
      for (const z5 of [false, true]) {
        const a = app(z5);
        a.at(S + 5 * M); a.open();
        a.ticksUntil(S + 10 * M);
        a.special[12] = [100, 100, 98.9, 99.9]; // offline: SL 99 touched at server minute 12, recovered
        a.restart(skew);
        a.at(S + 20 * M);
        const d = a.ticksUntil(S + 21 * M + 30_000); // 90 s of live prices, /time keeps failing (5+ replay attempts)
        if (!z5) {
          // control (clock failures counted, as in round 6): round 6/7 gave the gap up here and missed the stop;
          // with Z8 (round 8) the 3rd failure only warns — live stays refused and the replay books the stop after sync
          expect(a.toasts).toEqual(['서버 시간 확인 실패', '3회 실패']); // one clock warning, one 3rd-failure warning
          expect(d.every((x) => x === 'gap')).toBe(true);
          a.sync();
          a.ticksUntil(a.serverNow() + 120_000 + 5_000); // at most one capped backoff (120 s) + one tick
          expect(a.b.state.fills.map((f) => f.reason)).toEqual(['손절 SL']);
          expect(a.b.state.fills[0].closedAt).toBe(S + 12 * M + 59_999);
          continue;
        }
        expect(d.every((x) => x === 'gap')).toBe(true); // live refused the whole time
        expect(a.gate.fails.X.n).toBe(0);
        expect(a.toasts).toEqual(['서버 시간 확인 실패']); // warned once, never "3회 실패"
        expect(a.b.state.fills).toEqual([]);
        expect(a.b.state.lastTickTs!.X).toBe(S + 10 * M); // nothing stamped meanwhile
        a.sync(); // first WS update print (or /time answers)
        const syncedAt = a.serverNow();
        // first live price after sync: replays at once when the last failure is stamped ahead (Z6) / long ago;
        // with skew 0 the normal 15 s backoff from the last attempt applies → within 15 s + one tick
        a.ticksUntil(syncedAt + REPLAY_RETRY_MS + 5_000);
        expect(a.b.state.fills.map((f) => f.reason)).toEqual(['손절 SL']);
        expect(a.b.state.fills[0].closedAt).toBe(S + 12 * M + 59_999);
        expect(a.b.state.lastTickTs!.X).toBe(syncedAt + REPLAY_RETRY_MS + 5_000); // = server now (error 0)
      }
    });
  }

  it('App.tsx: the catch passes !clockUnknown as `counts` and warns once', () => {
    expect(appSource).toContain('const clockWarned = useRef(false);');
    expect(appSource).toMatch(/const clockUnknown = !mkt\.clockSynced\(\);[^\n]*\n\s+if \(gate\.current\.failed\(sym, mkt\.serverNow\(\), !clockUnknown\)\)[^\n]*\n\s+else if \(clockUnknown && !clockWarned\.current\) \{ clockWarned\.current = true;/);
  });
});

describe('round 7 — Z5 /time resync every 15 s until it works (also with nothing exposed)', () => {
  afterEach(() => vi.useRealTimers());
  it('Jev probe A: nothing open, /time fails → retried every 15 s; once measured, a new entry is server-stamped', async () => {
    vi.useFakeTimers();
    const PHONE = Date.UTC(2026, 9, 9, 13, 0);
    vi.setSystemTime(PHONE);
    const calls = () => vi.mocked(fetchClockOffset).mock.calls.length;
    h.clock.next = null;
    const c0 = calls();
    const m = useMarket('BTCUSDT', '15m');
    await vi.advanceTimersByTimeAsync(0);
    expect(calls()).toBe(c0 + 1);
    expect(m.clockSynced()).toBe(false);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(calls()).toBe(c0 + 2); // retried with no exposure at all
    expect(m.clockSynced()).toBe(false);
    h.clock.next = 150_000; // server = phone + 150 s
    await vi.advanceTimersByTimeAsync(15_000);
    expect(calls()).toBe(c0 + 3);
    expect(m.clockSynced()).toBe(true);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(calls()).toBe(c0 + 3); // stops once measured
    const b = new PaperBroker();
    b.slip = 0;
    expect(b.open(POS, m.serverNow()).ok).toBe(true); // App: every open passes mkt.serverNow()
    expect(b.state.positions[0].openedAt).toBe(Date.now() + 150_000); // server time, not phone time
  });
  it('useMarket.ts: the mount effect keeps an interval that re-syncs only while unsynced', () => {
    expect(marketSource).toMatch(/setInterval\(\(\) => \{ if \(!synced\.current\) void syncClock\(\); \}, 15_000\)/);
  });
});

describe('round 7 — Z6 a retry stamped in the future is due at once', () => {
  it('Jev probe C: phone 1 h ahead, one /time failure, synced 3 s later → the replay runs ~5 s after sync (not 61 min)', () => {
    const a = app();
    a.at(S + 5 * M); a.open();
    a.ticksUntil(S + 10 * M);
    a.special[12] = [100, 100, 98.9, 99.9];
    a.restart(3_600_000);
    a.at(S + 20 * M);
    expect(a.liveTick()).toBe('gap'); // one attempt fails at phone time (server + 1 h)
    expect(a.gate.fails.X.at).toBe(S + 20 * M + 3_600_000);
    a.at(S + 20 * M + 3_000);
    a.sync();
    a.ticksUntil(S + 20 * M + 8_000); // next live price 5 s after sync
    expect(a.b.state.fills.map((f) => f.reason)).toEqual(['손절 SL']);
    expect(a.b.state.lastTickTs!.X).toBe(S + 20 * M + 8_000);
  });
  it('normal backoff on one clock is unchanged', () => {
    const st = { positions: [{ symbol: 'X', openedAt: S }], pending: [], lastTickTs: { X: S } };
    const g = new ReplayGate();
    const t = S + 10 * M;
    g.begin(st, t); g.failed('X', t); g.release('X');
    expect(g.begin(st, t + REPLAY_RETRY_MS - 1)).toEqual([]);
    expect(g.begin(st, t + REPLAY_RETRY_MS + 1)).toEqual(['X']);
  });
});

describe('round 7 — Z7 manual close is refused only while a replay is running', () => {
  it('while waiting for the clock (gap, not replaying) manual close works; while replaying it is refused', () => {
    const a = app();
    a.at(S + 5 * M); a.open();
    a.ticksUntil(S + 10 * M);
    a.restart(150_000);
    a.at(S + 20 * M);
    a.liveTick(); // clock failure → waiting
    expect(a.gate.replaying.size).toBe(0);
    a.gate.replaying.add('X'); // a replay is running
    expect(a.closePos()).toBeNull();
    expect(a.toasts).toContain('재생 중');
    expect(a.b.state.positions.length).toBe(1);
    a.gate.release('X');
    expect(a.closePos()).not.toBeNull(); // waiting for the clock: the user can still close
    expect(a.b.state.positions.length).toBe(0);
  });
  it('App.tsx: closePos checks gate.current.replaying before closeFraction', () => {
    expect(appSource).toMatch(/const closePos = \(p: PaperPosition, frac: number, why: string\) => \{\n\s+if \(gate\.current\.replaying\.has\(p\.symbol\)\) \{ toast\('[^']+', 'warn'\); return; \} \/\/ Z7\n\s+const f = broker\.current\.closeFraction\(/);
  });
});
