import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import appSource from './App.tsx?raw';
import { TapeBuckets } from './lib/tape';
import { PaperBroker } from './paper/broker';
import type { Signal } from '@bitget-sim/dupont';

/*
 * Round 12: useJournal on the persistent-state hooks runtime (as round10/11): per-closed-candle tape logging (deduped),
 * signal outcome rows (sent once final), trades rows (no backfill), webhook flush per closed candle; nothing queued
 * or POSTed while the URL / token is empty. IndexedDB is absent in node → the in-memory journal backend.
 */
const R = vi.hoisted(() => ({ slots: [] as any[], i: 0, pending: [] as Array<() => void> }));
vi.mock('react', () => ({
  useRef: (v: unknown) => { const k = R.i++; return (R.slots[k] ??= { current: v }); },
  useState: (v: unknown) => {
    const k = R.i++;
    if (!R.slots[k]) R.slots[k] = { v: typeof v === 'function' ? (v as () => unknown)() : v };
    const s = R.slots[k];
    return [s.v, (n: any) => { s.v = typeof n === 'function' ? n(s.v) : n; }];
  },
  useEffect: (fn: () => any, deps?: unknown[]) => {
    const k = R.i++;
    const s = R.slots[k];
    if (!s || !deps || deps.some((d, j) => d !== s.deps[j])) R.pending.push(() => { s?.cleanup?.(); R.slots[k] = { deps: deps ?? [], cleanup: fn() }; });
  },
}));
const { useJournal } = await import('./useJournal');

const M15 = 900_000;
const T0 = Date.UTC(2026, 9, 10, 0, 0);
const URL_ = 'https://script.google.com/macros/s/TEST/exec';
let now = 0;
const ls = new Map<string, string>();
const fetchMock = vi.fn(async (_u: string, _i: any) => ({ ok: true, status: 200, text: async () => '{"ok":true,"appended":1}' }));
beforeEach(() => {
  vi.useFakeTimers({ now: T0 });
  ls.clear();
  vi.stubGlobal('localStorage', { getItem: (k: string) => ls.get(k) ?? null, setItem: (k: string, v: string) => { ls.set(k, v); }, removeItem: (k: string) => { ls.delete(k); } });
  vi.stubGlobal('document', { visibilityState: 'prerender', addEventListener() {}, removeEventListener() {} });
  vi.stubGlobal('window', { addEventListener() {}, removeEventListener() {} });
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockClear();
});
afterEach(() => {
  for (const s of R.slots) s?.cleanup?.();
  R.slots = []; R.pending = [];
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const candle = (ts: number, close = 60_000) => ({ ts, open: close, high: close + 50, low: close - 50, close, volume: 5 });
const sig = (ts: number, type = 'RANGE_LONG'): Signal => ({ type, side: 'long', kind: 'range', index: 0, ts, entry: '60000', sl: '59800', risk: '200', targets: [{ label: 'TP1', price: '60500', sizePct: 50, rr: 2.5 }],
  pressure: { buy: 3, sell: 1, net: 2, ratio: 0.75, source: 'trades' }, box: { top: '61000', bottom: '59700', mid: '60350' }, reason: '' } as any);

function setup(url = URL_, token = 'tok') {
  const tape = { current: new TapeBuckets() };
  tape.current.connected(T0 - 1); // covered from T0
  tape.current.add([{ ts: T0 + 5_000, qty: 2, side: 'buy' }, { ts: T0 + 400_000, qty: 1, side: 'sell' }]);
  const b = new PaperBroker();
  let bv = 0;
  const args = (closed: any[], live: Signal[] = []) => ({ symbol: 'BTCUSDT', tf: '15m', intervalMs: M15, closed, pressures: closed.map(() => ({ buy: 3, sell: 1, net: 2, ratio: 0.75, source: 'trades' as const })), live,
    tape, serverNow: () => now, state: b.state, bv, autoPaper: false, url, token });
  const render = (closed: any[], live: Signal[] = []) => { R.i = 0; const j = useJournal(args(closed, live)); R.pending.splice(0).forEach((f) => f()); return j; };
  return { tape, b, render, bump: () => { bv++; } };
}
const settle = () => vi.advanceTimersByTimeAsync(0);

describe('round 12 — useJournal: tape pressure per closed candle', () => {
  it('logs only the fully covered closed candle, once (re-renders / repeat closes do not duplicate), and flushes it ~3 s after the close', async () => {
    const { render } = setup();
    now = T0 + M15 + 2_000;
    const closed = [candle(T0 - M15), candle(T0)]; // T0 - 15m is before coverage
    let j = render(closed);
    await settle();
    j = render([...closed]);
    j = render(closed.map((c) => ({ ...c })));
    await settle();
    const rows = await j.store.all('tape_pressure');
    expect(rows.map((r) => [r.ts, r.buy, r.sell, r.ratio, r.n_trades, r.source, r.gap, r.close])).toEqual([['2026-10-10T00:00:00.000Z', 2, 1, 0.6667, 2, 'trades', false, 60_000]]);
    expect(j.sync.queued('tape_pressure')).toHaveLength(1);
    expect(fetchMock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(3_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [u, init] = fetchMock.mock.calls[0];
    expect(u).toBe(URL_);
    expect(init.headers).toEqual({ 'Content-Type': 'text/plain;charset=utf-8' });
    expect(JSON.parse(init.body)).toEqual({ token: 'tok', tab: 'tape_pressure', rows: [{ ts: '2026-10-10T00:00:00.000Z', symbol: 'BTCUSDT', tf: '15m', buy: 2, sell: 1, ratio: 0.6667, n_trades: 2, source: 'trades', gap: false }] });
    expect(j.sync.pending).toBe(0);
  });
  it('a candle set whose spacing is not the timeframe (tf switch render with old candles) is not logged', async () => {
    const { render } = setup();
    now = T0 + M15 + 2_000;
    const j = render([candle(T0 - 60_000), candle(T0)]); // 1m spacing under a 15m tf
    await settle();
    expect(await j.store.count('tape_pressure')).toBe(0);
  });
});

describe('round 12 — useJournal: signals (append-only sheet → one row per signal, once final)', () => {
  it('untaken signal is stored at once and sent after the next candle closes with its skip reason', async () => {
    const { render } = setup();
    now = T0 + M15 + 2_000;
    let j = render([candle(T0 - M15), candle(T0)], [sig(T0)]);
    await settle();
    j.signalOutcome(sig(T0), false, 'pressure_ohlcv');
    await settle();
    expect(j.sync.queued('signals')).toHaveLength(0); // still takeable
    expect((await j.store.all('signals')).map((r) => [r.kind, r.taken, r.skip_reason])).toEqual([['RANGE_LONG', false, 'pressure_ohlcv']]);
    now = T0 + 2 * M15 + 2_000;
    j = render([candle(T0 - M15), candle(T0), candle(T0 + M15)], []);
    await settle();
    expect(j.sync.queued('signals').map((r: any) => [r.ts, r.kind, r.taken, r.skip_reason, r.box_top, r.pressure_source])).toEqual([['2026-10-10T00:00:00.000Z', 'RANGE_LONG', false, 'pressure_ohlcv', 61000, 'trades']]);
  });
  it('auto-paper OFF and never entered → skip_reason auto_paper_off', async () => {
    const { render } = setup();
    now = T0 + M15 + 2_000;
    let j = render([candle(T0)], [sig(T0)]);
    await settle();
    now = T0 + 2 * M15 + 2_000;
    j = render([candle(T0), candle(T0 + M15)]);
    await settle();
    expect(j.sync.queued('signals').map((r: any) => [r.taken, r.skip_reason])).toEqual([[false, 'auto_paper_off']]);
  });
  it('a taken signal is sent immediately (taken true, no skip reason) and only once', async () => {
    const { render } = setup();
    now = T0 + M15 + 2_000;
    let j = render([candle(T0)], [sig(T0, 'BREAKOUT_LONG')]);
    await settle();
    j.signalOutcome(sig(T0, 'BREAKOUT_LONG'), false, 'entry_refused');
    j.signalOutcome(sig(T0, 'BREAKOUT_LONG'), true);
    await settle();
    expect(j.sync.queued('signals').map((r: any) => [r.kind, r.taken, r.skip_reason])).toEqual([['BREAKOUT_LONG', true, '']]);
    now = T0 + 3 * M15;
    j = render([candle(T0), candle(T0 + M15), candle(T0 + 2 * M15)]);
    await settle();
    expect(j.sync.queued('signals')).toHaveLength(1);
  });
});

describe('round 12 — useJournal: trades', () => {
  it('positions closed before the first run are not backfilled; a newly closed position is queued once with its entry context', async () => {
    const { render, b, bump } = setup();
    now = T0;
    b.open({ symbol: 'BTCUSDT', side: 'long', qty: 0.002, price: 60_000, leverage: 10, sl: 59_500, targets: [{ price: 60_600, fraction: 1, label: 'TP' }], setup: 'MANUAL' }, T0);
    b.onPrice('BTCUSDT', 60_600, T0 + 1_000); // closed before the journal ran
    let j = render([candle(T0 - M15)]);
    expect(j.sync.queued('trades')).toHaveLength(0);
    b.open({ symbol: 'BTCUSDT', side: 'short', qty: 0.002, price: 60_000, leverage: 10, sl: 60_300, targets: [{ price: 59_100, fraction: 1, label: 'TP 1:3' }], setup: 'BREAKOUT_SHORT' }, T0 + 2_000);
    bump(); j = render([candle(T0 - M15)]);
    b.onPrice('BTCUSDT', 60_400, T0 + 3_000); // stopped out
    bump(); j = render([candle(T0 - M15)]);
    bump(); j = render([candle(T0 - M15)]);
    const q = j.sync.queued('trades') as any[];
    expect(q).toHaveLength(1);
    expect(q[0]).toMatchObject({ symbol: 'BTCUSDT', tf: '15m', side: 'short', kind: 'BREAKOUT_SHORT', sl_initial: 60_300, tp1: 59_100, adds: 0, tape_ratio_at_entry: 0.75, tape_source: 'trades', app_version: 'dupont-mobile/0.1.0-r12' });
    expect(q[0].pnl_usdt).toBeLessThan(0);
  });
});

describe('round 12 — useJournal with the URL or token empty', () => {
  it('still journals locally, but queues nothing and never POSTs', async () => {
    for (const [u, t] of [['', 'tok'], [URL_, ''], ['', '']]) {
      const { render } = setup(u, t);
      now = T0 + M15 + 2_000;
      let j = render([candle(T0)], [sig(T0)]);
      j.signalOutcome(sig(T0), true);
      await vi.advanceTimersByTimeAsync(60_000);
      now = T0 + 3 * M15;
      j = render([candle(T0), candle(T0 + M15)]);
      await vi.advanceTimersByTimeAsync(60_000);
      expect(await j.store.count('tape_pressure')).toBe(1);
      expect(await j.store.count('signals')).toBe(1);
      expect(j.sync.pending).toBe(0);
      for (const s of R.slots) s?.cleanup?.();
      R.slots = []; R.pending = [];
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('round 12 — App wiring is logging only', () => {
  it('journal calls sit beside (never inside) the trading decisions; auto-paper stays OFF by default', () => {
    expect(appSource).toContain("journal.signalOutcome(g, true); // journal: signal taken");
    expect(appSource).toContain("else { journal.signalOutcome(latest, false, SKIP.entryRefused); enterSignal(latest, true); }");
    expect(appSource).toContain("if (r.ok && d.signal) { seen.current.add(sigId(d.signal)); save(K_SEEN, [...seen.current].slice(-300)); journal.signalOutcome(d.signal, true); }");
    expect(appSource).toContain('<SheetsCard s={s} set={set} journal={journal} />');
    expect(appSource.match(/journal\.signalOutcome\(/g)).toHaveLength(5);
  });
});
