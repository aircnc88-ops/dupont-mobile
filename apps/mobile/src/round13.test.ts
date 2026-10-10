import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import live from './lib/__fixtures__/books_btc_live_20261010.json';
import {
  LocalBook, ObBuckets, ObSampler, OB_COLUMNS, OB_DEF, obFieldsFor, parseBooksPush, sampleBook, type BooksPush,
} from './lib/obPressure';
import { buildBody, SHEETS_COLUMNS, TAPE_CSV_COLUMNS, toTapeCsv } from './lib/sheetsSchema';
import { LogStore, MemoryBackend } from './lib/logStore';
import { TapeBuckets } from './lib/tape';
import { PaperBroker } from './paper/broker';
import { BitgetPublicFeed } from './data/ws';
import useMarketSource from './useMarket.ts?raw';
import appSource from './App.tsx?raw';
import dupontSource from '../../../packages/dupont/src/index.ts?raw';

/*
 * Round 13 (logging only): per-candle ORDER-BOOK pressure (Jev design D2/S1/1 s): local full-depth `books` book,
 * 1 s samples, top-5/top-15 base and ±5/±10 bps notional, primary ±10 bps notional TWA + min/max/last imbalance,
 * stored next to the tape row (IndexedDB + CSV). Webhook still sends exactly K_BOT's columns.
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

const M1 = 60_000, M15 = 900_000;
const T0 = Date.UTC(2026, 9, 10, 0, 0);
const snap = (bids: Array<[number, number]>, asks: Array<[number, number]>, seq = 10): BooksPush => ({ snapshot: true, bids, asks, seq, pseq: 0, ts: T0 });
const upd = (bids: Array<[number, number]>, asks: Array<[number, number]>, seq: number, pseq: number): BooksPush => ({ snapshot: false, bids, asks, seq, pseq, ts: T0 });

describe('round 13 — Bitget v2 `books` parsing against a live capture (BTCUSDT, 2026-10-10)', () => {
  it('snapshot then seq-chained updates; the rebuilt book stays uncrossed and samples are non-zero', () => {
    const msgs = live as any[];
    expect(msgs[0].action).toBe('snapshot');
    expect(msgs[0].arg).toEqual({ instType: 'USDT-FUTURES', channel: 'books', instId: 'BTCUSDT' });
    const first = parseBooksPush(msgs[0])!;
    expect(first.snapshot).toBe(true);
    expect(first.bids.length).toBe(500);
    expect(first.asks.length).toBe(500);
    expect(first.bids[0][0]).toBeLessThan(first.asks[0][0]);
    const b = new LocalBook();
    for (const [i, m] of msgs.entries()) {
      const p = parseBooksPush(m)!;
      if (i > 0) { expect(m.action).toBe('update'); expect(p.pseq).toBe(+msgs[i - 1].data[0].seq); }
      expect(b.apply(p, i)).toBe(true);
    }
    const { bids, asks } = b.sorted();
    expect(bids[0][0]).toBeLessThan(asks[0][0]);
    const s = sampleBook(bids, asks)!;
    for (const v of Object.values(s)) expect(v).toBeGreaterThan(0);
    expect(s.bidB10).toBeGreaterThanOrEqual(s.bidB5);
    expect(s.askB10).toBeGreaterThanOrEqual(s.askB5);
    expect(s.bid15).toBeGreaterThanOrEqual(s.bid5);
  });
});

describe('round 13 — LocalBook', () => {
  it('applies updates (size 0 deletes), detects a sequence break and refuses updates until a new snapshot', () => {
    const b = new LocalBook();
    expect(b.apply(upd([[99, 1]], [], 11, 10), 0)).toBe(false); // update before any snapshot
    b.apply(snap([[100, 1], [99, 2]], [[101, 1], [102, 3]]), 0);
    expect(b.apply(upd([[100, 0], [99.5, 4]], [[101, 2]], 11, 10), 1)).toBe(true);
    expect(b.sorted()).toEqual({ bids: [[99.5, 4], [99, 2]], asks: [[101, 2], [102, 3]] });
    expect(b.apply(upd([[98, 1]], [], 13, 12), 2)).toBe(false); // missed seq 12
    expect(b.valid).toBe(false);
    expect(b.apply(upd([[98, 1]], [], 14, 13), 3)).toBe(false); // still invalid
    expect(b.apply(snap([[100, 1]], [[101, 1]], 20), 4)).toBe(true);
    expect(b.valid).toBe(true);
  });
  it('trims each side to the snapshot depth (levels that left the exchange window get no delete)', () => {
    const b = new LocalBook();
    b.apply(snap([[100, 1], [99, 1]], [[101, 1], [102, 1]]), 0); // depth 2
    b.apply(upd([[100.5, 1]], [[100.8, 1]], 11, 10), 1);
    expect(b.sorted()).toEqual({ bids: [[100.5, 1], [100, 1]], asks: [[100.8, 1], [101, 1]] });
    expect(b.bids.has(99)).toBe(false);
  });
});

describe('round 13 — sampleBook definitions', () => {
  it('top-5 / top-15 base sums and ±5 / ±10 bps USDT notional around mid', () => {
    // mid = 10000; 5 bps = 5, 10 bps = 10
    const bids: Array<[number, number]> = Array.from({ length: 20 }, (_, i) => [9999.5 - i, 1]); // 9999.5, 9998.5, ...
    const asks: Array<[number, number]> = Array.from({ length: 20 }, (_, i) => [10000.5 + i, 2]);
    const s = sampleBook(bids, asks)!;
    expect(s.bid5).toBe(5); expect(s.ask5).toBe(10); expect(s.bid15).toBe(15); expect(s.ask15).toBe(30);
    // bids ≥ 9995: 9999.5..9995.5 (5 levels); ≥ 9990: 9999.5..9990.5 (10 levels)
    expect(s.bidB5).toBeCloseTo([0, 1, 2, 3, 4].reduce((a, i) => a + (9999.5 - i), 0), 6);
    expect(s.bidB10).toBeCloseTo(Array.from({ length: 10 }, (_, i) => 9999.5 - i).reduce((a, x) => a + x, 0), 6);
    expect(s.askB5).toBeCloseTo([0, 1, 2, 3, 4].reduce((a, i) => a + 2 * (10000.5 + i), 0), 6);
    expect(s.askB10).toBeCloseTo(Array.from({ length: 10 }, (_, i) => 2 * (10000.5 + i)).reduce((a, x) => a + x, 0), 6);
  });
  it('no sample from an empty or crossed book', () => {
    expect(sampleBook([], [[1, 1]])).toBeNull();
    expect(sampleBook([[101, 1]], [[100, 1]])).toBeNull();
  });
});

const S = (bid: number, ask: number) => ({ bid5: 1, ask5: 1, bid15: 2, ask15: 2, bidB5: bid / 2, askB5: ask / 2, bidB10: bid, askB10: ask });

describe('round 13 — ObBuckets / obFieldsFor (per candle, any timeframe)', () => {
  it('a fully sampled 15m candle: time-weighted averages, imbalance mean/min/max/last, coverage 1, ob_full', () => {
    const o = new ObBuckets();
    for (let i = 0; i < 900; i++) o.add(T0 + i * 1000, i < 450 ? S(300, 100) : S(100, 300));
    o.add(T0 + M15, S(1, 1_000_000)); // next candle: not counted
    const f = obFieldsFor(o.stats(T0, M15), M15);
    expect(f).toMatchObject({ ob_def: OB_DEF, ob_samples: 900, ob_cov: 1, ob_full: true, ob_bid: 200, ob_ask: 200, ob_ratio: 0.5, ob_imb_avg: 0, ob_imb_min: -0.5, ob_imb_max: 0.5, ob_imb_last: -0.5,
      ob_bid5: 1, ob_ask5: 1, ob_bid15: 2, ob_ask15: 2, ob_bid_b5: 100, ob_ask_b5: 100 });
    expect(Object.keys(f)).toEqual([...OB_COLUMNS]);
  });
  it('partial coverage (< 90 %) or a book gap → ob_full false; no samples → ob_samples 0 and empty values', () => {
    const o = new ObBuckets();
    for (let i = 0; i < 700; i++) o.add(T0 + i * 1000, S(1, 1));
    expect(obFieldsFor(o.stats(T0, M15), M15)).toMatchObject({ ob_samples: 700, ob_cov: 0.7778, ob_full: false });
    const g = new ObBuckets();
    for (let i = 0; i < 900; i++) g.add(T0 + i * 1000, S(1, 1));
    g.markGap(T0 + 300_000);
    expect(obFieldsFor(g.stats(T0, M15), M15)).toMatchObject({ ob_samples: 900, ob_full: false });
    expect(obFieldsFor(g.stats(T0 + M15, M15), M15)).toMatchObject({ ob_def: OB_DEF, ob_samples: 0, ob_cov: 0, ob_full: false, ob_bid: '', ob_imb_avg: '' });
  });
  it('1m and 1h candles are sums of their minutes', () => {
    const o = new ObBuckets();
    for (let i = 0; i < 3600; i++) o.add(T0 + i * 1000, S(i < 60 ? 3 : 1, 1));
    expect(obFieldsFor(o.stats(T0, M1), M1)).toMatchObject({ ob_samples: 60, ob_full: true, ob_bid: 3, ob_ratio: 0.75, ob_imb_avg: 0.5 });
    expect(obFieldsFor(o.stats(T0, 3_600_000), 3_600_000)).toMatchObject({ ob_samples: 3600, ob_cov: 1, ob_full: true });
  });
});

describe('round 13 — ObSampler: samples only a valid, fresh book', () => {
  it('no sample before the snapshot, after a seq break, after a disconnect, or with a stale book (> 5 s)', () => {
    const s = new ObSampler();
    expect(s.tick(0, T0)).toBe(false);
    s.onPush(snap([[100, 1]], [[100.05, 1]]), 0, T0);
    expect(s.tick(500, T0 + 1000)).toBe(true);
    expect(s.onPush(upd([], [], 13, 12), 600, T0 + 1100)).toBe(false); // break → gap minute
    expect(s.tick(1000, T0 + 2000)).toBe(false);
    s.onPush(snap([[100, 1]], [[100.05, 1]], 30), 1100, T0 + 2100);
    expect(s.tick(1500, T0 + 3000)).toBe(true);
    expect(s.tick(7000, T0 + 8000)).toBe(false); // stale
    s.onDisconnect(T0 + 9000);
    expect(s.book.valid).toBe(false);
    expect(s.buckets.stats(T0, M1)).toMatchObject({ n: 2, gap: true });
  });
});

describe('round 13 — WS client subscribes `books` and resubscribes on a sequence break', () => {
  let sent: string[] = [];
  let sock: any;
  beforeEach(() => {
    sent = [];
    vi.stubGlobal('WebSocket', class { readyState = 1; onopen: any; onmessage: any; onclose: any; onerror: any; constructor() { sock = this; } send(x: string) { sent.push(x); } close() {} });
  });
  afterEach(() => vi.unstubAllGlobals());
  it('subscribe args include books; depth handler gets parsed pushes; returning false → unsubscribe + subscribe books', () => {
    const got: BooksPush[] = [];
    const f = new BitgetPublicFeed('BTCUSDT', { depth: (p) => { got.push(p); return got.length < 2; } });
    f.start();
    sock.onopen();
    expect(JSON.parse(sent[0]).args.map((a: any) => a.channel)).toEqual(['ticker', 'books15', 'trade', 'books']);
    const msgs = live as any[];
    sock.onmessage({ data: JSON.stringify(msgs[0]) });
    expect(got[0].snapshot).toBe(true);
    sock.onmessage({ data: JSON.stringify(msgs[1]) });
    expect(sent.slice(1).map((x) => JSON.parse(x))).toEqual([
      { op: 'unsubscribe', args: [{ instType: 'USDT-FUTURES', channel: 'books', instId: 'BTCUSDT' }] },
      { op: 'subscribe', args: [{ instType: 'USDT-FUTURES', channel: 'books', instId: 'BTCUSDT' }] },
    ]);
    f.stop();
  });
});

describe('round 13 — storage: IndexedDB record + CSV carry ob_*; webhook keeps K_BOT columns', () => {
  const tapeRow = { ts: new Date(T0).toISOString(), symbol: 'BTCUSDT', tf: '15m', buy: 3, sell: 1, ratio: 0.75, n_trades: 40, source: 'trades' as const, gap: false };
  it('CSV header = K_BOT tape_pressure columns + ob_*; rows stored before r13 export empty ob cells', async () => {
    expect(TAPE_CSV_COLUMNS).toEqual([...SHEETS_COLUMNS.tape_pressure, ...OB_COLUMNS]);
    const st = new LogStore(new MemoryBackend());
    const o = new ObBuckets();
    for (let i = 0; i < 900; i++) o.add(T0 + i * 1000, S(250, 150));
    await st.addTape(tapeRow, T0, { open: 1, ...obFieldsFor(o.stats(T0, M15), M15) });
    await st.addTape({ ...tapeRow, ts: new Date(T0 + M15).toISOString() }, T0 + M15);
    const rows = await st.all('tape_pressure');
    expect(rows[0]).toMatchObject({ ob_bid: 250, ob_ask: 150, ob_ratio: 0.625, ob_full: true, ob_samples: 900 });
    const csv = toTapeCsv(rows).split('\n');
    expect(csv[0]).toBe(TAPE_CSV_COLUMNS.join(','));
    expect(csv[1]).toBe('2026-10-10T00:00:00.000Z,BTCUSDT,15m,3,1,0.75,40,trades,false,band10bps_notional_twa_1s,900,1,true,250,150,0.625,0.25,0.25,0.25,0.25,1,1,2,2,125,75');
    expect(csv[2]).toBe('2026-10-10T00:15:00.000Z,BTCUSDT,15m,3,1,0.75,40,trades,false' + ','.repeat(OB_COLUMNS.length));
    // the webhook body is unchanged (K_BOT's Code.gs maps only its SCHEMA columns)
    expect(Object.keys(JSON.parse(buildBody('t', 'tape_pressure', rows)).rows[0])).toEqual([...SHEETS_COLUMNS.tape_pressure]);
  });
});

describe('round 13 — useJournal stores the closed candle\'s order-book pressure next to the tape row', () => {
  const ls = new Map<string, string>();
  beforeEach(() => {
    vi.useFakeTimers({ now: T0 });
    ls.clear();
    vi.stubGlobal('localStorage', { getItem: (k: string) => ls.get(k) ?? null, setItem: (k: string, v: string) => { ls.set(k, v); }, removeItem: (k: string) => { ls.delete(k); } });
    vi.stubGlobal('document', { visibilityState: 'prerender', addEventListener() {}, removeEventListener() {} });
    vi.stubGlobal('window', { addEventListener() {}, removeEventListener() {} });
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, text: async () => '{"ok":true,"appended":1}' })));
  });
  afterEach(() => { for (const s of R.slots) s?.cleanup?.(); R.slots = []; R.pending = []; vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('ob_* fields are stored with the tape row; the webhook queue row keeps K_BOT columns', async () => {
    const tape = { current: new TapeBuckets() };
    tape.current.connected(T0 - 1);
    tape.current.add([{ ts: T0 + 5_000, qty: 2, side: 'buy' }, { ts: T0 + 400_000, qty: 1, side: 'sell' }]);
    const ob = { current: new ObSampler() };
    for (let i = 0; i < 890; i++) ob.current.buckets.add(T0 + i * 1000, S(120, 80));
    const b = new PaperBroker();
    const candle = (ts: number) => ({ ts, open: 1, high: 2, low: 0.5, close: 1.5, volume: 5 });
    const closed = [candle(T0)];
    R.i = 0;
    const j = useJournal({ symbol: 'BTCUSDT', tf: '15m', intervalMs: M15, closed, pressures: [], live: [], tape, ob, serverNow: () => T0 + M15 + 2000,
      state: b.state, bv: 0, autoPaper: false, url: 'https://script.google.com/macros/s/TEST/exec', token: 'tok' });
    R.pending.splice(0).forEach((f) => f());
    await vi.advanceTimersByTimeAsync(0);
    const rows = await j.store.all('tape_pressure');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ buy: 2, sell: 1, ob_def: OB_DEF, ob_samples: 890, ob_cov: 0.9889, ob_full: true, ob_bid: 120, ob_ask: 80, ob_ratio: 0.6, ob_imb_avg: 0.2 });
    expect(Object.keys(j.sync.queued('tape_pressure')[0])).toEqual([...SHEETS_COLUMNS.tape_pressure]);
  });
});

describe('round 13 — logging only: order-book data never reaches trading logic', () => {
  it('ob is read only by the journal (App passes it to useJournal only); the strategy package does not reference it', () => {
    const uses = appSource.match(/mkt\.ob\b/g) ?? [];
    expect(uses).toHaveLength(1);
    expect(appSource).toMatch(/useJournal\(\{[^)]*ob: mkt\.ob/);
    expect(dupontSource).not.toMatch(/obPressure|ObSampler/);
    expect(useMarketSource).toMatch(/depth: \(p\) => obs\.onPush/);
  });
});
