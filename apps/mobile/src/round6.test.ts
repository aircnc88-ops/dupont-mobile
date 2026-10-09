import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import appSource from './App.tsx?raw';
import { PaperBroker } from './paper/broker';
import { ReplayGate, REPLAY_RETRY_MS, replayFrom } from './lib/replayGate';
import type { WsHandlers, WsTrade } from './data/ws';

/*
 * Round 6 (Jev Z2 / Z3). useMarket is driven for real with React's hooks stubbed (refs persist in the
 * closures, effects run at once): the node test env has no DOM renderer.
 */
const h = vi.hoisted(() => ({
  feeds: [] as Array<{ symbol: string; handlers: WsHandlers }>,
  clock: { next: null as number | null | Promise<number | null> },
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

const PHONE = Date.UTC(2026, 9, 9, 13, 0); // phone clock
const trade = (ts: number, id: string): WsTrade => ({ ts, price: 100, qty: 1, side: 'buy', id });
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('round 6 — Z3 the WS subscribe snapshot never sets the clock offset', () => {
  beforeEach(() => { h.feeds.length = 0; vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(PHONE); });
  afterEach(() => vi.useRealTimers());

  it('a 20 s old snapshot print after a reconnect does not pull serverNow back; the next update does set it', async () => {
    h.clock.next = 150_000; // /time: server = phone + 150 s
    const m = useMarket('BTCUSDT', '15m');
    await flush();
    expect(m.serverNow()).toBe(PHONE + 150_000);
    const feed = h.feeds[0].handlers;
    feed.trades!([trade(PHONE + 130_000, 'a')], true); // reconnect snapshot: newest print 20 s old (server time)
    expect(m.serverNow()).toBe(PHONE + 150_000); // round 5 would give PHONE + 130 000 (−20 s → fake-stop window)
    feed.trades!([trade(PHONE + 149_800, 'b')], false); // live update print
    expect(m.serverNow()).toBe(PHONE + 149_800);
  });

  it('a snapshot alone does not count as a clock measurement (Z2 + Z3)', async () => {
    h.clock.next = null; // /time failed
    const m = useMarket('BTCUSDT', '15m');
    await flush();
    h.feeds[0].handlers.trades!([trade(PHONE - 30_000, 'a')], true);
    expect(m.clockSynced()).toBe(false);
    expect(m.serverNow()).toBe(PHONE);
  });
});

describe('round 6 — Z2 clockSynced(): false until one measurement succeeded', () => {
  beforeEach(() => { h.feeds.length = 0; });
  it('cold start + /time failure (null = throw, hang cut at 4 s, or > 4 s round trip) → unsynced; a later sync or update print → synced', async () => {
    h.clock.next = null;
    const m = useMarket('ETHUSDT', '15m');
    await flush();
    expect(m.clockSynced()).toBe(false);
    h.clock.next = -90_000;
    await m.syncClock(); // the replay retry calls syncClock again
    expect(m.clockSynced()).toBe(true);
    expect(m.serverNow() - Date.now()).toBe(-90_000);

    h.clock.next = null;
    const m2 = useMarket('SOLUSDT', '15m');
    await flush();
    expect(m2.clockSynced()).toBe(false);
    const now = Date.now();
    h.feeds[h.feeds.length - 1].handlers.trades!([trade(now + 5_000, 'u')], false);
    expect(m2.clockSynced()).toBe(true);
  });
  it('a failed re-sync after a successful one keeps the measured offset and stays synced', async () => {
    h.clock.next = 42_000;
    const m = useMarket('XRPUSDT', '15m');
    await flush();
    h.clock.next = null;
    await m.syncClock();
    expect(m.clockSynced()).toBe(true);
    expect(m.serverNow() - Date.now()).toBe(42_000);
  });
});

describe('round 6 — Z2 runReplay refuses to stamp with an unmeasured clock (gate retry in 15 s)', () => {
  /** runReplay's per-symbol body as in App.tsx: syncFunding, Z2 check, bars, replayBars, lastTickTs, gate */
  function replayOnce(b: PaperBroker, gate: ReplayGate, now: number, synced: boolean, bars: Array<{ ts: number; open: number; high: number; low: number; close: number }>) {
    const syms = gate.begin(b.state, now);
    const failed: string[] = [];
    for (const sym of syms) {
      try {
        if (!synced) throw new Error('server clock unknown');
        const start = Math.floor(replayFrom(b.state, sym) / 60_000) * 60_000;
        b.replayBars(sym, bars.filter((c) => c.ts >= start), now);
        const lt = (b.state.lastTickTs ??= {});
        lt[sym] = Math.max(lt[sym] ?? 0, now);
        gate.succeeded(sym);
      } catch {
        gate.failed(sym, now);
        failed.push(sym);
      } finally {
        gate.release(sym);
      }
    }
    return { syms, failed };
  }
  it('cold start, phone 150 s ahead, /time failed, no trade yet → nothing stamped; retried after 15 s once synced', () => {
    const S = Date.UTC(2026, 9, 9, 6, 0);
    const b = new PaperBroker();
    b.slip = 0;
    b.open({ symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 10, sl: 99, targets: [{ price: 103, fraction: 1, label: 'TP' }], setup: 'MANUAL', liquidity: 'maker' }, S);
    b.onPrice('X', 100, S + 10 * 60_000); // last processed price (server time)
    const gate = new ReplayGate();
    const before = JSON.stringify(b.state);
    const phoneNow = S + 20 * 60_000 + 150_000; // unsynced serverNow() = phone clock
    const bars = [{ ts: S + 11 * 60_000, open: 100, high: 100, low: 98.9, close: 99.8 }];
    const r1 = replayOnce(b, gate, phoneNow, false, bars);
    expect(r1).toEqual({ syms: ['X'], failed: ['X'] });
    expect(JSON.stringify(b.state)).toBe(before); // lastTickTs / fills / positions untouched — never stamped in the future
    expect(gate.fails.X.n).toBe(1);
    expect(gate.begin(b.state, phoneNow + REPLAY_RETRY_MS - 1)).toEqual([]); // backoff
    // the failure was recorded at (unsynced) phone time, so with the phone AHEAD the retry waits skew + 15 s of
    // server time — live ticks stay refused meanwhile (gate 'gap'), nothing is stamped, the touch is still replayed
    expect(gate.begin(b.state, S + 20 * 60_000 + 16_000)).toEqual([]);
    const serverNow = phoneNow + REPLAY_RETRY_MS + 1_000; // synced (WS update print / /time on retry)
    const r2 = replayOnce(b, gate, serverNow, true, bars);
    expect(r2.failed).toEqual([]);
    expect(b.state.fills.map((f) => f.reason)).toEqual(['손절 SL']); // the minute-11 touch is not skipped
    expect(b.state.lastTickTs!.X).toBe(serverNow);
  });
  it('App.tsx: the Z2 check sits inside the try right after syncFunding, before any fetch / stamp', () => {
    expect(appSource).toMatch(/try \{\n\s+await syncFunding\(sym, true\);\n\s+if \(!mkt\.clockSynced\(\)\) throw new Error\('server clock unknown'\);[^\n]*\n\s+const now = mkt\.serverNow\(\);/);
    expect(appSource).toMatch(/catch \{\n\s+if \(gate\.current\.failed\(sym, mkt\.serverNow\(\)\)\)/);
  });
});
