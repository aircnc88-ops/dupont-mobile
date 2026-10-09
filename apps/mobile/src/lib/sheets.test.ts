import { describe, expect, it, vi } from 'vitest';
import { LogStore, MemoryBackend, tapeKey } from './logStore';
import { buildBody, MAX_ROWS_PER_POST, SHEETS_COLUMNS, toCsv, type SignalRow, type TapeRow } from './sheetsSchema';
import { SheetsSync, backoffMs, configured, QUEUE_CAP, type SyncDeps } from './sheetsSync';
import { signalRowFor, tapeRowFor, tradesFromFills } from './journal';
import { TapeBuckets } from './tape';
import { PaperBroker } from '../paper/broker';
import { DEFAULT_SETTINGS } from './storage';

/* Round 12: tape-pressure / signal journal + Google Sheets webhook (K_BOT schema, dupont_sheet/Code.gs). */
const KBOT = { // K_BOT's Apps Script SCHEMA, verbatim
  trades: ['ts_open', 'ts_close', 'symbol', 'tf', 'side', 'kind', 'entry', 'exit', 'qty', 'sl_initial', 'tp1', 'fees_usdt', 'pnl_usdt', 'r_multiple', 'exit_reason', 'adds', 'tape_ratio_at_entry', 'tape_source', 'app_version'],
  tape_pressure: ['ts', 'symbol', 'tf', 'buy', 'sell', 'ratio', 'n_trades', 'source', 'gap'],
  signals: ['ts', 'symbol', 'tf', 'kind', 'side', 'entry', 'sl', 'tp1', 'box_top', 'box_bottom', 'pressure_ratio', 'pressure_source', 'taken', 'skip_reason'],
};
const T0 = Date.UTC(2026, 9, 10, 0, 0);
const tape = (ts: number, tf = '15m', symbol = 'BTCUSDT'): TapeRow => ({ ts: new Date(ts).toISOString(), symbol, tf, buy: 3, sell: 1, ratio: 0.75, n_trades: 40, source: 'trades', gap: false });
const sig = (over: Partial<SignalRow> = {}): SignalRow => ({ ts: new Date(T0).toISOString(), symbol: 'BTCUSDT', tf: '15m', kind: 'RANGE_LONG', side: 'long', entry: 60_000, sl: 59_800, tp1: 60_500,
  box_top: 61_000, box_bottom: 59_700, pressure_ratio: 0.62, pressure_source: 'trades', taken: false, skip_reason: 'auto_paper_off', ...over });

describe('round 12 — journal store: dedupe + pruning', () => {
  it('a candle is stored once per symbol+tf+ts (first write wins); other tf / symbol are separate rows', async () => {
    const st = new LogStore(new MemoryBackend());
    expect(await st.addTape(tape(T0), T0)).toBe(true);
    expect(await st.addTape({ ...tape(T0), buy: 99 }, T0)).toBe(false);
    expect(await st.addTape(tape(T0, '1h'), T0)).toBe(true);
    expect(await st.addTape(tape(T0, '15m', 'ETHUSDT'), T0)).toBe(true);
    expect(await st.count('tape_pressure')).toBe(3);
    const rows = await st.all('tape_pressure');
    expect(rows.find((r) => r.key === tapeKey('BTCUSDT', '15m', T0))!.buy).toBe(3);
  });
  it('signals are upserted by symbol+tf+kind+ts and a taken signal is never downgraded', async () => {
    const st = new LogStore(new MemoryBackend());
    expect(await st.putSignal(sig(), T0)).toBe(true);
    expect(await st.putSignal(sig({ taken: true, skip_reason: '' }), T0)).toBe(false);
    await st.putSignal(sig({ skip_reason: 'entry_refused' }), T0);
    expect((await st.all('signals')).map((r) => [r.taken, r.skip_reason])).toEqual([[true, '']]);
    await st.putSignal(sig({ kind: 'RANGE_SHORT', side: 'short' }), T0);
    expect(await st.count('signals')).toBe(2);
  });
  it('the cap prunes the OLDEST candles (by candle time, not insert order)', async () => {
    const st = new LogStore(new MemoryBackend(), { tape_pressure: 3, signals: 2 });
    for (const k of [5, 1, 4, 2, 3, 6]) await st.addTape(tape(T0 + k * 900_000), T0 + k * 900_000);
    expect((await st.all('tape_pressure')).map((r) => (r.tsMs - T0) / 900_000)).toEqual([4, 5, 6]);
    for (const k of [3, 1, 2]) await st.putSignal(sig({ ts: new Date(T0 + k).toISOString() }), T0 + k);
    expect((await st.all('signals')).map((r) => r.tsMs - T0)).toEqual([2, 3]);
  });
  it('default caps: 50 000 candles / 20 000 signals', async () => {
    const { LOG_CAPS } = await import('./logStore');
    expect(LOG_CAPS).toEqual({ tape_pressure: 50_000, signals: 20_000 });
  });
});

describe('round 12 — rows + CSV columns = K_BOT schema', () => {
  it('schema columns are exactly K_BOT\'s Apps Script columns, in order', () => {
    expect(SHEETS_COLUMNS).toEqual(KBOT);
  });
  it('CSV headers use the same columns; internal fields (key, tsMs, OHLCV) are not exported; quotes are escaped', async () => {
    const st = new LogStore(new MemoryBackend());
    await st.addTape(tape(T0), T0, { open: 1, high: 2, low: 0.5, close: 1.5, volume: 4 });
    await st.putSignal(sig({ skip_reason: 'a,"b"' }), T0);
    const tcsv = toCsv('tape_pressure', await st.all('tape_pressure')).split('\n');
    expect(tcsv[0]).toBe(KBOT.tape_pressure.join(','));
    expect(tcsv[1]).toBe('2026-10-10T00:00:00.000Z,BTCUSDT,15m,3,1,0.75,40,trades,false');
    const scsv = toCsv('signals', await st.all('signals')).split('\n');
    expect(scsv[0]).toBe(KBOT.signals.join(','));
    expect(scsv[1]).toBe('2026-10-10T00:00:00.000Z,BTCUSDT,15m,RANGE_LONG,long,60000,59800,60500,61000,59700,0.62,trades,false,"a,""b"""');
    expect(toCsv('trades', []).split('\n')).toEqual([KBOT.trades.join(',')]);
  });
  it('tape row comes only from a fully covered candle (TapeBuckets coverage), with the trade count', () => {
    const tb = new TapeBuckets();
    tb.connected(T0 - 1); // coverage from T0
    tb.add([{ ts: T0 + 1_000, qty: 2, side: 'buy' }, { ts: T0 + 61_000, qty: 1, side: 'sell' }, { ts: T0 + 120_000, qty: 1, side: 'buy' }]);
    const c = { ts: T0, open: 1, high: 1, low: 1, close: 1, volume: 4 };
    expect(tapeRowFor('BTCUSDT', '15m', c, tb.stats(T0, 900_000))).toEqual({ ts: '2026-10-10T00:00:00.000Z', symbol: 'BTCUSDT', tf: '15m', buy: 3, sell: 1, ratio: 0.75, n_trades: 3, source: 'trades', gap: false });
    expect(tb.stats(T0 - 900_000, 900_000)).toBeNull(); // before coverage
    tb.disconnected(T0 + 300_000); tb.connected(T0 + 400_000);
    expect(tapeRowFor('BTCUSDT', '15m', c, tb.stats(T0, 900_000))).toBeNull(); // overlaps a gap → never logged
  });
  it('signal row from a dupont Signal', () => {
    const g: any = { type: 'BREAKOUT_SHORT', side: 'short', kind: 'breakout', index: 0, ts: T0, entry: '59000.5', sl: '59300', risk: '299.5', targets: [{ label: 'TP', price: '58100', sizePct: 100, rr: 3 }],
      pressure: { buy: 1, sell: 3, net: -2, ratio: 0.25, source: 'ohlcv' }, box: { top: '61000', bottom: '59500', mid: '60250' }, reason: '' };
    expect(signalRowFor(g, 'BTCUSDT', '5m', false, 'auto_paper_off')).toEqual({ ts: '2026-10-10T00:00:00.000Z', symbol: 'BTCUSDT', tf: '5m', kind: 'BREAKOUT_SHORT', side: 'short', entry: 59000.5, sl: 59300, tp1: 58100,
      box_top: 61000, box_bottom: 59500, pressure_ratio: 0.25, pressure_source: 'ohlcv', taken: false, skip_reason: 'auto_paper_off' });
    expect(signalRowFor(g, 'BTCUSDT', '5m', true, 'x').skip_reason).toBe('');
  });
  it('trades: one row per closed position (partial TP + final), entry context from the position meta', () => {
    const b = new PaperBroker();
    b.open({ symbol: 'BTCUSDT', side: 'long', qty: 0.002, price: 60_000, leverage: 10, sl: 59_500, targets: [{ price: 61_000, fraction: 0.5, label: 'TP1' }, { price: 62_000, fraction: 0.5, label: 'TP2' }], setup: 'RANGE_LONG', liquidity: 'maker' }, T0);
    const pid = b.state.positions[0].id;
    b.onPrice('BTCUSDT', 61_000, T0 + 60_000);
    b.onPrice('BTCUSDT', 62_000, T0 + 120_000);
    expect(b.state.positions).toEqual([]);
    const rows = tradesFromFills(b.state.fills, { [pid]: { tf: '15m', slInitial: 59_500, tp1: 61_000, adds: 0, tapeRatio: 0.61, tapeSource: 'trades' } });
    expect(rows).toHaveLength(1);
    const r = rows[0];
    expect(Object.keys(r).filter((k) => k !== 'positionId')).toEqual(KBOT.trades);
    expect(r).toMatchObject({ ts_open: '2026-10-10T00:00:00.000Z', ts_close: '2026-10-10T00:02:00.000Z', symbol: 'BTCUSDT', tf: '15m', side: 'long', kind: 'RANGE_LONG', entry: 60_000, exit: 61_500, qty: 0.002,
      sl_initial: 59_500, tp1: 61_000, adds: 0, tape_ratio_at_entry: 0.61, tape_source: 'trades' });
    const net = b.state.fills.reduce((a, f) => a + f.netPnl, 0);
    expect(r.pnl_usdt).toBeCloseTo(net, 4);
    expect(r.fees_usdt).toBeCloseTo(b.state.fills.reduce((a, f) => a + f.fees, 0), 4);
    expect(typeof r.r_multiple).toBe('number');
    expect(toCsv('trades', rows).split('\n')[0]).toBe(KBOT.trades.join(','));
    expect(tradesFromFills(b.state.fills.slice(0, 1), {})).toEqual([]); // still open (no final fill) → no row
  });
});

/** in-memory persistence + mocked fetch */
function rig(url = 'https://script.google.com/macros/s/TEST/exec', token = 'tok-123') {
  let now = T0;
  let saved: any = null;
  const cfg = { url, token };
  const replies: Array<() => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>> = [];
  const fetch = vi.fn<SyncDeps['fetch']>(async () => (replies.shift() ?? (async () => ({ ok: true, status: 200, text: async () => '{"ok":true,"appended":1}' })))());
  const deps: SyncDeps = { fetch, now: () => now, load: () => (saved ? JSON.parse(saved) : null), save: (p) => { saved = JSON.stringify(p); } };
  const make = () => new SheetsSync(() => cfg, deps);
  const reply = (status: number, body: string) => replies.push(async () => ({ ok: status >= 200 && status < 300, status, text: async () => body }));
  return { cfg, fetch, deps, make, reply, tick: (ms: number) => { now += ms; }, now: () => now, saved: () => saved };
}

describe('round 12 — webhook queue (mocked fetch)', () => {
  it('request: POST, Content-Type text/plain, body exactly {token, tab, rows} with the tab columns', async () => {
    const r = rig();
    const s = r.make();
    expect(s.enqueue('tape_pressure', [{ ...tape(T0), key: 'x', tsMs: T0, open: 1 } as any])).toBe(true);
    r.reply(200, JSON.stringify({ ok: true, appended: 1 }));
    expect(await s.flush()).toBe('ok');
    expect(r.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = r.fetch.mock.calls[0];
    expect(url).toBe('https://script.google.com/macros/s/TEST/exec');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'text/plain;charset=utf-8' });
    const body = JSON.parse(init.body);
    expect(Object.keys(body)).toEqual(['token', 'tab', 'rows']);
    expect(body).toEqual({ token: 'tok-123', tab: 'tape_pressure', rows: [{ ts: '2026-10-10T00:00:00.000Z', symbol: 'BTCUSDT', tf: '15m', buy: 3, sell: 1, ratio: 0.75, n_trades: 40, source: 'trades', gap: false }] });
    expect(Object.keys(body.rows[0])).toEqual(KBOT.tape_pressure);
    expect(s.status()).toMatchObject({ ok: true, tab: 'tape_pressure', appended: 1, pending: 0, fails: 0 });
  });
  it('at most 500 rows per call: 1 200 queued rows → 500 / 500 / 200', async () => {
    const r = rig();
    const s = r.make();
    s.enqueue('signals', Array.from({ length: 1200 }, (_, i) => sig({ entry: i })));
    expect(await s.flush()).toBe('ok');
    expect(r.fetch.mock.calls.map(([, i]) => JSON.parse(i.body).rows.length)).toEqual([500, 500, 200]);
    expect(MAX_ROWS_PER_POST).toBe(500);
    expect(() => buildBody('t', 'signals', Array(501).fill(sig()))).toThrow();
  });
  it('failures keep the rows and back off (HTTP error, {ok:false}, network error, non-JSON); persisted; then success drains', async () => {
    const r = rig();
    let s = r.make();
    s.enqueue('trades', [{ symbol: 'BTCUSDT', side: 'long' }]);
    s.enqueue('signals', [sig()]);
    r.reply(500, 'oops');
    expect(await s.flush()).toBe('fail');
    expect(s.status()).toMatchObject({ ok: false, error: 'HTTP 500', fails: 1, nextAt: T0 + 15_000, pending: 2 });
    expect(await s.flush()).toBe('wait'); // backoff not over → no request
    expect(r.fetch).toHaveBeenCalledTimes(1);
    r.tick(15_000);
    r.reply(200, '{"ok":false,"error":"bad token"}');
    expect(await s.flush()).toBe('fail');
    expect(s.status()).toMatchObject({ error: 'bad token', fails: 2, nextAt: r.now() + 30_000, pending: 2 });
    // reload: queue + backoff survive
    s = r.make();
    expect(s.status()).toMatchObject({ fails: 2, pending: 2, nextAt: r.now() + 30_000 });
    r.tick(30_000);
    r.deps.fetch = r.fetch; r.fetch.mockImplementationOnce(async () => { throw new TypeError('Failed to fetch'); });
    expect(await s.flush()).toBe('fail');
    expect(s.status()).toMatchObject({ error: 'Failed to fetch', fails: 3, nextAt: r.now() + 60_000 });
    r.tick(60_000);
    r.reply(200, '<html>login</html>');
    expect(await s.flush()).toBe('fail');
    expect(s.status().error).toBe('응답 형식 오류');
    r.tick(backoffMs(4));
    r.reply(200, '{"ok":true,"appended":1}');
    r.reply(200, '{"ok":true,"appended":1}');
    expect(await s.flush()).toBe('ok');
    expect(s.status()).toMatchObject({ ok: true, fails: 0, nextAt: 0, pending: 0 });
    const tabs = r.fetch.mock.calls.map(([, i]) => JSON.parse(i.body).tab);
    expect(tabs.slice(-2)).toEqual(['trades', 'signals']);
    expect(JSON.parse(r.saved()).queue).toEqual({ trades: [], tape_pressure: [], signals: [] });
  });
  it('backoff doubles from 15 s and is capped at 15 min; a forced send ignores the wait', async () => {
    expect([1, 2, 3, 4, 7, 20].map(backoffMs)).toEqual([15_000, 30_000, 60_000, 120_000, 900_000, 900_000]);
    const r = rig();
    const s = r.make();
    s.enqueue('signals', [sig()]);
    r.reply(503, '');
    await s.flush();
    expect(await s.flush()).toBe('wait');
    expect(await s.flush(true)).toBe('ok');
  });
  it('queue cap drops the oldest tape rows first', () => {
    const r = rig();
    const s = r.make();
    s.enqueue('trades', [{ symbol: 'A' }]);
    s.enqueue('tape_pressure', Array.from({ length: QUEUE_CAP }, (_, i) => tape(T0 + i)));
    expect(s.pending).toBe(QUEUE_CAP);
    expect(s.queued('trades')).toHaveLength(1);
    expect((s.queued('tape_pressure')[0] as any).ts).toBe(new Date(T0 + 1).toISOString());
  });
});

describe('round 12 — nothing is sent unless BOTH URL and token are set', () => {
  for (const [name, url, token] of [['empty URL', '', 'tok'], ['empty token', 'https://script.google.com/macros/s/X/exec', ''], ['both empty', '', ''], ['non-https URL', 'http://example.com/hook', 'tok']] as const) {
    it(`${name}: enqueue is ignored, flush makes no request`, async () => {
      const r = rig(url, token);
      const s = r.make();
      expect(s.enqueue('tape_pressure', [tape(T0)])).toBe(false);
      expect(s.pending).toBe(0);
      expect(await s.flush(true)).toBe('off');
      expect(r.fetch).not.toHaveBeenCalled();
    });
  }
  it('rows queued earlier are not sent after the token is cleared', async () => {
    const r = rig();
    const s = r.make();
    s.enqueue('signals', [sig()]);
    r.cfg.token = '';
    expect(await s.flush(true)).toBe('off');
    expect(r.fetch).not.toHaveBeenCalled();
    expect(s.pending).toBe(1);
  });
  it('defaults: URL and token empty, auto-paper OFF', () => {
    expect(DEFAULT_SETTINGS).toMatchObject({ sheetsUrl: '', sheetsToken: '', autoPaper: false });
    expect(configured({ url: DEFAULT_SETTINGS.sheetsUrl, token: DEFAULT_SETTINGS.sheetsToken })).toBe(false);
  });
});
