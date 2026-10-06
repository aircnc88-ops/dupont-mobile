import { describe, expect, it } from 'vitest';
import { TapeBuckets, TAPE_BUCKET_MS } from './tape';
import { parseTradePush } from '../data/ws';

const M15 = 15 * 60_000;
const T = Date.UTC(2026, 9, 6, 6, 0);

describe('tape buckets (review A5 / C7)', () => {
  it('keeps full-candle buy/sell totals past 60k trades (aggregated on arrival)', () => {
    const tb = new TapeBuckets();
    tb.connected(T - 1);
    const trades = Array.from({ length: 70_000 }, (_, i) => ({ ts: T + (i % 900) * 1000, qty: 0.001, side: (i % 4 === 0 ? 'sell' : 'buy') as 'buy' | 'sell' }));
    for (let i = 0; i < trades.length; i += 500) tb.add(trades.slice(i, i + 500));
    const p = tb.pressure(T, M15)!;
    expect(p.source).toBe('trades');
    expect(p.buy + p.sell).toBeCloseTo(70, 9);
    expect(p.sell).toBeCloseTo(17.5, 9);
    expect(p.ratio).toBeCloseTo(0.75, 12);
  });

  it('a candle that started before the first connect, or overlaps a disconnect gap, is not tape-covered', () => {
    const tb = new TapeBuckets();
    tb.connected(T + 30_000); // coverage from T + 1 min
    tb.add([{ ts: T + 2 * TAPE_BUCKET_MS, qty: 1, side: 'buy' }]);
    expect(tb.pressure(T, M15)).toBeNull();
    expect(tb.pressure(T + TAPE_BUCKET_MS, TAPE_BUCKET_MS * 5)?.buy).toBe(1);
    tb.disconnected(T + M15 + 5 * 60_000 + 10_000);
    expect(tb.covers(T + M15, M15)).toBe(false); // gap still open
    tb.connected(T + M15 + 7 * 60_000 + 1);
    expect(tb.gaps).toEqual([[T + M15 + 5 * 60_000, T + M15 + 8 * 60_000]]);
    expect(tb.covers(T + M15, M15)).toBe(false);
    expect(tb.covers(T + 2 * M15, M15)).toBe(true); // buckets kept, later candle fully covered
  });

  it('bounded memory: oldest minutes are pruned', () => {
    const tb = new TapeBuckets(10);
    tb.connected(T - 1);
    for (let i = 0; i < 30; i++) tb.add([{ ts: T + i * TAPE_BUCKET_MS, qty: 1, side: 'buy' }]);
    expect(tb.pressure(T, TAPE_BUCKET_MS)).toBeNull();
    expect(tb.pressure(T + 29 * TAPE_BUCKET_MS, TAPE_BUCKET_MS)?.buy).toBe(1);
  });
});

describe('ws trade push (C6 partial, verified against a live v2 message)', () => {
  it('flags the subscribe snapshot and returns prints chronologically', () => {
    const msg = {
      action: 'snapshot', arg: { instType: 'USDT-FUTURES', channel: 'trade', instId: 'BTCUSDT' },
      data: [
        { ts: '1791271269292', price: '85301.3', size: '0.0609', side: 'buy', tradeId: '2' },
        { ts: '1791271269095', price: '85308.2', size: '0.0001', side: 'sell', tradeId: '1' },
      ],
    };
    const r = parseTradePush(msg);
    expect(r.snapshot).toBe(true);
    expect(r.trades.map((t) => t.ts)).toEqual([1791271269095, 1791271269292]);
    expect(r.trades[1]).toEqual({ ts: 1791271269292, price: 85301.3, qty: 0.0609, side: 'buy' });
    expect(parseTradePush({ ...msg, action: 'update' }).snapshot).toBe(false);
  });
});
