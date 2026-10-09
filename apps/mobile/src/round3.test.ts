import { afterEach, describe, expect, it, vi } from 'vitest';
import { PaperBroker, feeBreakeven, TAKER_FEE } from './paper/broker';
import { fetchFundingHistory, fetchMinuteBars, MINUTE_HISTORY_MS, type Candle } from './data/bitget';
import { ReplayGate, replayFrom, REPLAY_GAP_MS, REPLAY_MAX_RETRY_MS } from './lib/replayGate';
import { extendCandles, isCandleGap, needsCandleReload, CANDLE_STALE_MS } from './lib/candles';

const closeTo = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);
const T = Date.UTC(2026, 9, 6, 6, 0);
const bar = (i: number, o: number, h: number, l: number, c: number, t0 = T) => ({ ts: t0 + i * 60_000, open: o, high: h, low: l, close: c });

describe('round 3 — replay limits (R4, R5)', () => {
  it('R4: a limit created inside a replayed minute is not filled by that minute (its prices may predate the order)', () => {
    const b = new PaperBroker();
    b.slip = 0;
    b.placeLimit({ symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 10, sl: 98, targets: [], setup: 'MANUAL' }, T + 30_000);
    b.replayBars('X', [bar(0, 101, 101.2, 99.5, 100.8)]); // dips below 100, but the order did not exist at 06:00:00
    expect(b.state.positions.length).toBe(0);
    expect(b.state.pending.length).toBe(1);
    b.replayBars('X', [bar(1, 100.8, 101, 99.8, 100.5)]); // next minute: order exists → filled at the limit
    expect(b.state.positions.length).toBe(1);
    expect(b.state.positions[0].entry).toBe(100);
    expect(b.state.positions[0].openedAt).toBe(T + 60_000 + 59_999);
  });

  it('R5: a limit filled inside a replayed bar is stopped when its SL lies inside the same bar (conservative)', () => {
    const mk = () => {
      const b = new PaperBroker();
      b.slip = 0;
      b.placeLimit({ symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 10, sl: 99, targets: [{ price: 103, fraction: 1, label: 'TP' }], setup: 'MANUAL' }, T - 1);
      return b;
    };
    // green bar O 100.5 → L 98.5 (fills 100, then trades through SL 99) → H 101 → C 100.8 (recovers above SL)
    const a = mk();
    a.replayBars('X', [bar(0, 100.5, 101, 98.5, 100.8)]);
    expect(a.state.positions.length).toBe(0);
    expect(a.state.fills.map((f) => f.reason)).toEqual(['손절 SL']);
    closeTo(a.state.fills[0].exit, 99);
    // SL outside the bar's range → the filled position survives
    const c = mk();
    c.replayBars('X', [bar(0, 100.5, 101, 99.5, 100.8)]);
    expect(c.state.positions.length).toBe(1);
    expect(c.state.fills.length).toBe(0);
  });

  it('R8c: funding boundary, TP1 and the breakeven stop in consecutive replayed bars', () => {
    const t0 = Date.UTC(2026, 9, 6, 7, 58);
    const b = new PaperBroker();
    b.slip = 0;
    b.precision = () => ({ dp: 2, qdp: 3 });
    b.open({ symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 10, sl: 98, targets: [{ price: 102, fraction: 0.5, label: 'TP1' }, { price: 106, fraction: 0.5, label: 'TP2' }], setup: 'RANGE_LONG' }, t0);
    b.noteTickerRate('X', 0.0001, t0 + 10_000); // last ticker rate before the 08:00 boundary
    const ev = b.replayBars('X', [
      bar(1, 100.2, 100.4, 100.1, 100.3, t0), // 07:59 quiet
      bar(2, 100.5, 100.7, 100.4, 100.6, t0), // 08:00 → funding at the bar open: 1 × 100.5 × 0.0001
      bar(3, 100.6, 102.2, 100.4, 102, t0), // 08:01 green: TP1 102, SL → fee breakeven
      bar(4, 101.5, 101.6, 99.5, 99.6, t0), // 08:02 red: down through the breakeven stop
    ]);
    expect(ev.map((e) => e.kind)).toEqual(['funding', 'tp', 'be', 'sl']);
    expect(b.state.positions.length).toBe(0);
    const [tp1, be] = b.state.fills;
    expect(tp1.reason).toBe('TP1');
    expect(be.reason).toBe('본절 SL');
    closeTo(tp1.funding! + be.funding!, 0.01005, 1e-12);
    closeTo(tp1.funding!, 0.005025, 1e-12); // pro rata
    expect(be.exit).toBeGreaterThan(100); // breakeven covers fees
    closeTo(be.exit, feeBreakeven({ ...b.state.fills[0], side: 'long', qty: 0.5, entry: 100, entryFeeLeft: 0.5 * 100 * TAKER_FEE } as any, 2, TAKER_FEE), 1e-9);
  });
});

describe('round 3 — R11 funding booked on a close during the settle wait', () => {
  it('a position closed within 3 min after a boundary still pays that boundary (pre-boundary ticker rate)', () => {
    const t0 = Date.UTC(2026, 9, 6, 7, 0), b8 = Date.UTC(2026, 9, 6, 8, 0);
    const b = new PaperBroker();
    b.slip = 0;
    b.open({ symbol: 'X', side: 'long', qty: 2, price: 100, leverage: 10, sl: 98, targets: [], setup: 'MANUAL' }, t0);
    b.noteTickerRate('X', 0.0003, b8 - 60_000);
    expect(b.accrueFunding('X', 100, b8 + 10_000, 180_000)).toEqual([]); // live: still waiting for the settled rate
    b.onPrice('X', 97.9, b8 + 60_000); // SL inside the wait window
    expect(b.state.positions.length).toBe(0);
    const f = b.state.fills[0];
    expect(f.exit).toBe(97.9); // gapped through SL 98
    closeTo(f.funding!, 2 * 97.9 * 0.0003, 1e-12); // booked at close (mark = exit price)
    closeTo(f.netPnl, -2 * 2.1 - 200 * TAKER_FEE - 195.8 * TAKER_FEE - 2 * 97.9 * 0.0003, 1e-9);
  });
});

describe('round 3 — R2 / R6 Bitget paging (mocked fetch)', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
  const mockCandles = () => {
    const urls: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      urls.push(url);
      const q = new URL(url, 'https://x').searchParams;
      let data: unknown = [];
      if (url.includes('/candles')) {
        const s = Number(q.get('startTime')), e = Number(q.get('endTime'));
        const rows: string[][] = [];
        for (let t = Math.ceil(s / 60_000) * 60_000; t <= e; t += 60_000) rows.push([String(t), '1', '1', '1', '1', '1']);
        data = rows.slice(-1000).reverse(); // newest ≤1000, newest first like Bitget
      } else if (url.includes('history-fund-rate')) {
        data = [{ fundingTime: String(Date.UTC(2026, 9, 6, 8)), fundingRate: '0.0001' }];
      }
      return { ok: true, json: async () => ({ code: '00000', data }) } as Response;
    }));
    return urls;
  };

  it('R2: a 9-day gap is paged in 13 windows of 1000 minutes, every minute once, oldest first', async () => {
    vi.useFakeTimers();
    const urls = mockCandles();
    const to = Date.UTC(2026, 9, 6, 6, 0), from = to - 9 * 86_400_000;
    const pr = fetchMinuteBars('BTCUSDT', from, to);
    await vi.runAllTimersAsync();
    const { bars, clampedFrom } = await pr;
    expect(urls.length).toBe(13);
    expect(clampedFrom).toBe(from);
    expect(bars.length).toBe(9 * 1440 + 1);
    expect(bars[0].ts).toBe(from);
    expect(bars.every((c: Candle, i) => i === 0 || c.ts - bars[i - 1].ts === 60_000)).toBe(true);
  });

  it('R2: a gap older than the 30-day 1m history is clamped (≤ 44 requests) and reported via clampedFrom', async () => {
    vi.useFakeTimers();
    const urls = mockCandles();
    const to = Date.UTC(2026, 9, 6, 6, 0), from = to - 40 * 86_400_000;
    const pr = fetchMinuteBars('BTCUSDT', from, to);
    await vi.runAllTimersAsync();
    const { bars, clampedFrom } = await pr;
    expect(clampedFrom).toBe(Math.floor((to - MINUTE_HISTORY_MS) / 60_000) * 60_000);
    expect(clampedFrom).toBeGreaterThan(from);
    expect(urls.length).toBe(44);
    expect(bars[0].ts).toBe(clampedFrom);
  });

  it('R6: funding history asks for 100 records', async () => {
    const urls = mockCandles();
    const h = await fetchFundingHistory('BTCUSDT');
    expect(urls[0]).toContain('pageSize=100');
    expect(h).toEqual([{ ts: Date.UTC(2026, 9, 6, 8), rate: 0.0001 }]);
  });
});

describe('round 3 — R1 replay gate', () => {
  const now = Date.UTC(2026, 9, 6, 9, 0);
  const st = () => ({
    lastTickTs: { A: now - 3_600_000, B: now - 3_600_000, C: now - 1_000 } as Record<string, number>,
    positions: [{ symbol: 'A', openedAt: now - 7_200_000 }, { symbol: 'B', openedAt: now - 7_200_000 }],
    pending: [] as Array<{ symbol: string; createdAt: number }>,
  });

  it('gates ALL exposed symbols before the first await: a tick on the 2nd symbol is refused while the 1st replays', () => {
    const g = new ReplayGate();
    const s = st();
    expect(g.tick(s, 'B', now)).toBe('gap'); // a live tick never jumps the gap
    expect(g.begin(s, now)).toEqual(['A', 'B']);
    expect(g.replaying.has('B')).toBe(true);
    expect(g.tick(s, 'B', now)).toBe('replaying'); // e.g. the 4 s REST poll while A is still fetching
    expect(g.begin(s, now)).toEqual([]); // no double replay
    expect(g.tick(s, 'C', now)).toBe('live'); // no exposure → live
    // A done: gap closed → live again
    s.lastTickTs.A = now;
    g.succeeded('A');
    g.release('A');
    expect(g.tick(s, 'A', now + 1_000)).toBe('live');
  });

  it('30 s threshold; legacy state without lastTickTs replays from the oldest open / order time', () => {
    const g = new ReplayGate();
    const s = { positions: [{ symbol: 'A', openedAt: now - 40_000 }], pending: [{ symbol: 'A', createdAt: now - 90_000 }] };
    expect(replayFrom(s, 'A')).toBe(now - 90_000);
    expect(g.needsReplay(s, 'A', now)).toBe(true);
    const fresh = { lastTickTs: { A: now - REPLAY_GAP_MS + 1 }, positions: [{ symbol: 'A', openedAt: now - 9e6 }], pending: [] };
    expect(g.needsReplay(fresh, 'A', now)).toBe(false);
    // a stale lastTickTs from before the first exposure does not force a replay of irrelevant bars
    const opened = { lastTickTs: { A: now - 9e6 }, positions: [{ symbol: 'A', openedAt: now - 5_000 }], pending: [] };
    expect(replayFrom(opened, 'A')).toBe(now - 5_000);
    expect(g.needsReplay(opened, 'A', now)).toBe(false);
  });

  it('Z8 (round 8): fetch failures back off 15 s → 30 s → 60 s → 120 s (max) and an exposed gap is never given up', () => {
    const g = new ReplayGate();
    const s = st();
    const waits = [15_000, 30_000, 60_000, 120_000, 120_000, 120_000, 120_000];
    expect(waits[3]).toBe(REPLAY_MAX_RETRY_MS);
    let t = now;
    waits.forEach((wait, i) => {
      const k = i + 1;
      expect(g.begin(s, t)).toContain('A');
      const warn = g.failed('A', t);
      g.failed('B', t);
      g.release('A'); g.release('B');
      expect(warn).toBe(k === 3); // true exactly once, at the 3rd counted failure (caller warns; retries go on)
      expect(g.fails.A.n).toBe(k);
      expect(g.tick(s, 'A', t + 1_000)).toBe('gap'); // still refused — never given up (was 'live' after 3 in round 3)
      expect(g.begin(s, t + wait)).toEqual([]); // inside the backoff
      t += wait + 1;
    });
    expect(g.tick(s, 'A', t)).toBe('gap');
    expect(g.fails.A.n).toBe(7);
    // success closes the gap and resets the backoff
    expect(g.begin(s, t)).toEqual(['A', 'B']);
    s.lastTickTs.A = t;
    g.succeeded('A'); g.release('A'); g.release('B');
    expect(g.fails.A).toBeUndefined();
    expect(g.tick(s, 'A', t + 1_000)).toBe('live');
  });
});

describe('round 3 — R3 no fake-wick candle after a gap', () => {
  const M = 900_000, T0 = Date.UTC(2026, 9, 6, 6, 0);
  const prev: Candle[] = [{ ts: T0, open: 100, high: 101, low: 99, close: 100.5, volume: 10 }];

  it('a print that skips one or more candles never synthesizes a candle from the stale close', () => {
    const ts = T0 + 3 * M + 5_000; // two candles missed
    expect(isCandleGap(prev, ts, M)).toBe(true);
    expect(extendCandles(prev, 110, 1, ts, M)).toBe(prev); // unchanged → caller reloads REST
    expect(needsCandleReload(prev, ts, M, T0 + M - 1_000)).toBe(true);
  });

  it('the next contiguous candle opens at the previous close only when data right before the boundary was fresh', () => {
    const ts = T0 + M + 2_000;
    expect(needsCandleReload(prev, ts, M, T0 + M - 1_000)).toBe(false);
    const out = extendCandles(prev, 100.7, 2, ts, M);
    expect(out[1]).toEqual({ ts: T0 + M, open: 100.5, high: 100.7, low: 100.5, close: 100.7, volume: 2 });
    // app slept across the boundary (nothing fresh in the last 30 s of the previous candle) → reload instead
    expect(needsCandleReload(prev, ts, M, T0 + M - CANDLE_STALE_MS - 1)).toBe(true);
    // same-candle prints always extend (real traded prices)
    expect(needsCandleReload(prev, T0 + 60_000, M, 0)).toBe(false);
    expect(extendCandles(prev, 102, 1, T0 + 60_000, M)[0]).toMatchObject({ high: 102, close: 102, volume: 11 });
  });
});
