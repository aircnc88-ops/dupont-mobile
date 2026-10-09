import { afterEach, describe, expect, it, vi } from 'vitest';
import appSource from './App.tsx?raw';
import marketSource from './useMarket.ts?raw';
import { PaperBroker, SLIP, sizeAdd, type Side } from './paper/broker';
import { noBoxBreakoutDraft } from './paper/fromSignal';
import type { WsHandlers } from './data/ws';

/*
 * Round 10 (Jev Z11): after a symbol switch useMarket must never expose the previous symbol's ticker / candles / book,
 * and App refuses entries (market, limit, pyramid add, signal) until the symbol's own price exists.
 * useMarket runs for real on a tiny hooks runtime with PERSISTENT state across renders (JEV1's probe runtime):
 * useState / useRef keep their slot, effects run after the render when their deps change (with cleanup).
 * The App harness mirrors App.tsx: `last`, refPx, the TradeTab onSubmit (market / limit), addOn and the draft tag.
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
const H = vi.hoisted(() => ({ feeds: {} as Record<string, WsHandlers>, tickers: {} as Record<string, any>, candles: {} as Record<string, any[]> }));
vi.mock('./data/ws', async (o) => ({
  ...(await o<typeof import('./data/ws')>()),
  BitgetPublicFeed: class { lastMsgAt = 0; constructor(s: string, h: WsHandlers) { H.feeds[s] = h; } start() {} stop() {} },
}));
vi.mock('./data/bitget', async (o) => ({
  ...(await o<typeof import('./data/bitget')>()),
  fetchClockOffset: vi.fn(async () => 0),
  fetchCandles: vi.fn(async (s: string) => { if (!H.candles[s]) throw new Error('HTTP 503'); return H.candles[s]; }),
  fetchTicker: vi.fn(async (s: string) => { if (!H.tickers[s]) throw new Error('HTTP 503'); return H.tickers[s]; }),
}));
const { useMarket } = await import('./useMarket');

const BTC = 'BTCUSDT', ETH = 'ETHUSDT';
type M = ReturnType<typeof useMarket>;
const render = (sym: string): M => { R.i = 0; const m = useMarket(sym, '15m'); R.pending.splice(0).forEach((f) => f()); return m; };
const flush = () => new Promise((r) => setTimeout(r, 0));
/** render → let fetches settle → render again (twice), like React re-rendering after state updates */
const settle = async (sym: string) => { let m = render(sym); await flush(); m = render(sym); await flush(); return render(sym); };
const BTC_T = { last: 60_000, mark: 60_000, change24h: 0, funding: 0.0001, bid: 59_999, ask: 60_001 };
const BTC_BOOK = { bids: [[59_999, 1]] as Array<[number, number]>, asks: [[60_001, 1]] as Array<[number, number]>, ts: 1 };
afterEach(() => {
  for (const s of R.slots) s?.cleanup?.(); // stop the hook's intervals
  R.slots = []; R.pending = [];
  H.feeds = {}; H.tickers = {}; H.candles = {};
});

/** App.tsx pieces that read the market (line refs: `last`, refPx, onSubmit, addOn) */
function app() {
  const b = new PaperBroker();
  b.slip = SLIP;
  const toasts: string[] = [];
  const toast = (t: string) => { toasts.push(t); };
  const last = (m: M) => m.ticker?.last ?? m.candles[m.candles.length - 1]?.close ?? 0;
  const refPx = (m: M, side: Side) => { const x = side === 'long' ? m.ticker?.ask : m.ticker?.bid; const l = last(m); return x && l && Math.abs(x - l) / l < 0.005 ? x : l; };
  return {
    b, toasts, last, refPx,
    /** TradeTab onSubmit (market / limit) with the Z11 guard and the R10 marketability check */
    submit(m: M, sym: string, side: Side, type: 'market' | 'limit', qty: number, sl: number, tp: number, limitPrice = 0, z11 = true) {
      const l = last(m);
      if (z11 && !(l > 0)) { toast('현재가 확인 중 – 잠시 후 다시 주문하세요'); return null; } // Z11
      const targets = [{ price: tp, fraction: 1, label: 'TP 1:3' }];
      if (type === 'limit') {
        if (side === 'long' ? limitPrice >= l : limitPrice <= l) { toast('지정가가 현재가 이상/이하 – 시장가로'); return null; }
        return b.placeLimit({ symbol: sym, side, qty, price: limitPrice, leverage: 10, sl, targets, setup: 'MANUAL' }, 0);
      }
      return b.open({ symbol: sym, side, qty, price: l, refPx: refPx(m, side), leverage: 10, sl, targets, setup: 'MANUAL' }, 0);
    },
    /** addOn with the Z11 guard (sizeAdd on refPx, open at `last`) */
    addOn(m: M, posId: string) {
      const l = last(m);
      if (!(l > 0)) { toast('현재가 확인 중 – 잠시 후 다시 추가하세요'); return null; } // Z11
      const p = b.state.positions.find((x) => x.id === posId)!;
      const a = sizeAdd(p, { last: refPx(m, p.side), budget: 1_000, wantQty: p.qty / 2, step: 0.01 });
      if (!(a.qty > 0)) return null;
      return b.open({ symbol: p.symbol, side: p.side, qty: a.qty, price: l, refPx: refPx(m, p.side), leverage: p.leverage, sl: a.newSl, targets: [], setup: p.setup, isAdd: true }, 0);
    },
  };
}
/** BTC live (REST ticker + candles + WS book), then a switch to ETH whose REST ticker and candles fail (outage) */
async function btcThenEthOutage() {
  H.tickers[BTC] = BTC_T;
  H.candles[BTC] = [{ ts: Date.now() - 900_000, open: 60_000, high: 60_100, low: 59_900, close: 60_050, volume: 1 }];
  let m = await settle(BTC);
  H.feeds[BTC].book!(BTC_BOOK);
  m = render(BTC);
  expect([m.ticker?.last, m.candles.length > 0, m.book?.asks[0][0]]).toEqual([60_000, true, 60_001]); // (the REST ticker poll may open the next forming candle)
  const right = render(ETH); // the very first render after the switch (effects have not cleared anything yet)
  const outage = await settle(ETH);
  return { right, outage };
}

describe('round 10 — Z11 useMarket never exposes another symbol\'s data', () => {
  it('right after BTC → ETH (and during an ETH outage): ticker null, candles [], book null → last 0', async () => {
    const { right, outage } = await btcThenEthOutage();
    for (const m of [right, outage]) {
      expect(m.ticker).toBeNull();
      expect(m.candles).toEqual([]);
      expect(m.book).toBeNull();
      expect(app().last(m)).toBe(0);
    }
  });

  it('the first ETH WS ticker is never merged into the BTC ticker object', async () => {
    await btcThenEthOutage();
    H.feeds[ETH].ticker!({ last: 2500, mark: 2500.5, funding: 0.0002, change24h: 0.01, bid: 2499.9, ask: 2500.1 });
    const m = render(ETH);
    expect(m.ticker).toMatchObject({ last: 2500, mark: 2500.5, funding: 0.0002, change24h: 0.01, bid: 2499.9, ask: 2500.1, sym: ETH });
    expect(app().refPx(m, 'long')).toBe(2500.1);
    // and back to BTC: the ETH ticker is not shown for BTC
    expect(render(BTC).ticker).toBeNull();
  });
});

describe('round 10 — Z11 Jev probe: ETH market order right after switching from BTC', () => {
  it('is refused (never filled at 60 001); the first ETH quote then fills at the ETH ask', async () => {
    const { right, outage } = await btcThenEthOutage();
    const a = app();
    for (const m of [right, outage]) expect(a.submit(m, ETH, 'long', 'market', 0.01, 2450, 2600)).toBeNull();
    expect(a.toasts).toEqual(['현재가 확인 중 – 잠시 후 다시 주문하세요', '현재가 확인 중 – 잠시 후 다시 주문하세요']);
    expect(a.b.state.positions).toEqual([]);
    expect(a.b.state.wallet).toBe(200);
    H.feeds[ETH].ticker!({ last: 2500, mark: 2500, funding: 0.0001, change24h: 0, bid: 2499.9, ask: 2500.1 });
    const r = a.submit(render(ETH), ETH, 'long', 'market', 0.01, 2450, 2600) as ReturnType<PaperBroker['open']>;
    expect(r.ok).toBe(true);
    expect(r.fillPx).toBeCloseTo(2500.1 * (1 + SLIP), 9);
    expect(r.fillPx!).toBeLessThan(3_000);
  });
  it('control: with the round-9 data (BTC ticker still exposed) the same order fills at 60 001 and the first ETH tick liquidates it', () => {
    const a = app();
    const stale = { ticker: { ...BTC_T }, candles: [], book: null } as unknown as M; // what round 9 exposed after the switch
    const r = a.submit(stale, ETH, 'long', 'market', 0.001, 59_000, 62_000, 0, false) as ReturnType<PaperBroker['open']>;
    expect(r.ok).toBe(true);
    expect(r.fillPx).toBeCloseTo(60_001 * (1 + SLIP), 6);
    expect(a.b.onPrice(ETH, 2500, 1).map((e) => e.kind)).toEqual(['liq']);
  });
});

describe('round 10 — Z11 pyramid adds when candles load before the price', () => {
  it('ETH candles land, no ETH ticker yet → the add uses the ETH candle close, never the BTC price; nothing at all → refused', async () => {
    const { outage } = await btcThenEthOutage();
    const a = app();
    // an ETH breakout long already open (e.g. from an earlier session)
    expect(a.b.open({ symbol: ETH, side: 'long', qty: 0.1, price: 2400, leverage: 10, sl: 2380, targets: [{ price: 2600, fraction: 1, label: 'TP 1:3' }], setup: 'BREAKOUT_LONG', liquidity: 'maker' }, 0).ok).toBe(true);
    const id = a.b.state.positions[0].id;
    expect(a.addOn(outage, id)).toBeNull(); // no ETH data at all
    expect(a.toasts).toEqual(['현재가 확인 중 – 잠시 후 다시 추가하세요']);
    H.candles[ETH] = [{ ts: Date.now() - 900_000, open: 2480, high: 2495, low: 2475, close: 2490, volume: 3 }];
    // the 20 s REST reload / the next load lands the ETH candles; the ETH ticker still fails
    R.slots.forEach((s) => s?.deps && s.deps[0] === ETH && s.deps[1] === '15m' && (s.cleanup?.(), s.deps = [])); // re-run the candle effect
    const m = await settle(ETH);
    expect(m.ticker).toBeNull();
    expect(m.candles.map((c) => c.close)).toEqual([2490]);
    expect(a.last(m)).toBe(2490);
    const r = a.addOn(m, id) as ReturnType<PaperBroker['open']>;
    expect(r.ok).toBe(true);
    expect(r.fillPx).toBeCloseTo(2490 * (1 + SLIP), 9);
    expect(a.b.state.positions[0].entry).toBeLessThan(2500);
  });
});

describe('round 10 — Z11 limit "would fill immediately" check uses only the current symbol\'s price', () => {
  it('right after the switch: refused (no price); with the ETH quote: a long limit at/above 2500 is refused, below it is placed', async () => {
    const { outage } = await btcThenEthOutage();
    const a = app();
    expect(a.submit(outage, ETH, 'long', 'limit', 0.01, 2550, 2700, 2600)).toBeNull();
    expect(a.toasts.at(-1)).toBe('현재가 확인 중 – 잠시 후 다시 주문하세요');
    H.feeds[ETH].ticker!({ last: 2500, mark: 2500, funding: 0.0001, change24h: 0, bid: 2499.9, ask: 2500.1 });
    const m = render(ETH);
    expect(a.submit(m, ETH, 'long', 'limit', 0.01, 2550, 2700, 2600)).toBeNull(); // marketable vs ETH 2500
    expect(a.toasts.at(-1)).toContain('시장가로');
    expect(a.submit(m, ETH, 'long', 'limit', 0.01, 2350, 2600, 2400)).toEqual({ ok: true });
    expect(a.b.state.pending.map((o) => o.price)).toEqual([2400]);
  });
  it('control: checked against the stale BTC 60 000 a marketable ETH long limit at 2600 was accepted', () => {
    const a = app();
    const stale = { ticker: { ...BTC_T }, candles: [], book: null } as unknown as M;
    expect(a.submit(stale, ETH, 'long', 'limit', 0.01, 2550, 2700, 2600, false)).toEqual({ ok: true });
  });
});

describe('round 10 — Z11 sizing / form defaults use only the current symbol', () => {
  it('no ETH price → no default draft (TradeTab waits for last > 0); with ETH 2500 the no-box default is ETH-based', async () => {
    const { outage } = await btcThenEthOutage();
    const a = app();
    expect(a.last(outage)).toBe(0); // TradeTab: `if (!p.draft && p.last) p.setDraft(defaultDraft('long'))` → nothing yet
    H.feeds[ETH].ticker!({ last: 2500, mark: 2500, funding: 0.0001, change24h: 0, bid: 2499.9, ask: 2500.1 });
    const d = noBoxBreakoutDraft('long', a.last(render(ETH)), '0.01', 2);
    expect(Number(d.sl)).toBeCloseTo(2487.5, 2);
    expect(Number(d.tp1)).toBeGreaterThan(2500);
    expect(Number(d.tp1)).toBeLessThan(2600);
    // round 9: the same default was built from the stale BTC 60 000
    expect(Number(noBoxBreakoutDraft('long', 60_000, '0.01', 2).sl)).toBeCloseTo(59_700, 2);
  });
  it('a draft made on BTC is not shown on ETH (Z11 draft tag) and comes back on BTC', () => {
    // mirrors App.tsx: draftRaw tagged with the symbol it was made on; draft = draftRaw?.sym === s.symbol ? draftRaw : null
    let draftRaw: any = null;
    let sym = BTC;
    const setDraft = (d: any) => { draftRaw = d && { ...d, sym }; };
    const draft = () => (draftRaw?.sym === sym ? draftRaw : null);
    setDraft({ side: 'long', sl: '59700.0', tp1: '61000.0', tp2: '', kind: 'breakout' });
    expect(draft().sl).toBe('59700.0');
    sym = ETH;
    expect(draft()).toBeNull(); // TradeTab falls back to defaultDraft (ETH) — never the BTC SL/TP
    sym = BTC;
    expect(draft().sl).toBe('59700.0');
  });
});

describe('round 10 — Z11 source', () => {
  it('useMarket.ts tags ticker / candles / book and exposes only matching data', () => {
    expect(marketSource).toContain('const [ticker, setTicker] = useState<(TickerInfo & { sym?: string; at?: number }) | null>(null);');
    expect(marketSource).toContain('ticker: (t) => setTicker((prev) => ({ ...(prev?.sym === symbol ? prev : t), ...t, sym: symbol, at: performance.now() })), // Z11');
    expect(marketSource).toContain('candlesSym.current = symbol; // Z11');
    expect(marketSource).toContain('setTicker({ ...t, sym: symbol, at: performance.now() }); // Z11');
    expect(marketSource).toContain('return { candles: candlesSym.current === symbol ? candles : [], ticker: ticker?.sym === symbol && (ticker.at ?? 0) >= since.current.at ? ticker : null, // Z12');
    expect(marketSource).toContain('book: bookSym.current === symbol ? book : null,');
  });
  it('App.tsx refuses enterSignal / addOn / TradeTab submit while last ≤ 0 and tags the draft', () => {
    expect(appSource).toMatch(/const price = last;\n\s+if \(!\(price > 0\)\) \{ toast\('현재가 확인 중 – 잠시 후 다시 진입하세요', 'warn'\); return; \} \/\/ Z11/);
    expect(appSource).toMatch(/const addOn = \(p: PaperPosition, sug: \{ sl\?: string; sizePct\?: number \}\) => \{\n\s+if \(!\(last > 0\)\) \{ toast\('현재가 확인 중 – 잠시 후 다시 추가하세요', 'warn'\); return; \} \/\/ Z11/);
    expect(appSource).toMatch(/onSubmit=\{\(d, orderType, limitPrice, qty\) => \{\n\s+if \(!\(last > 0\)\) \{ toast\('현재가 확인 중 – 잠시 후 다시 주문하세요', 'warn'\); return; \} \/\/ Z11/);
    expect(appSource).toContain('const draft = draftRaw?.sym === s.symbol ? draftRaw : null;');
  });
});
