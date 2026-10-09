import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import appSource from './App.tsx?raw';
import marketSource from './useMarket.ts?raw';
import { PaperBroker, SLIP, type Side } from './paper/broker';
import { ReplayGate } from './lib/replayGate';
import type { WsHandlers } from './data/ws';

/*
 * Round 11 (Jev Z12 / Z13 / Z14).
 * Z12: a ticker left from an EARLIER visit to a symbol is never exposed when the user comes back — each ticker is stamped
 *      with its arrival time and useMarket remembers (at render time) when the symbol was (re)selected.
 * Z13: addOn refuses a position of another symbol (last / refPx / tick / qtyStep / lastClosedTs are the SELECTED symbol's).
 * Z14: BoxBar is keyed by symbol, so an open '수정' form never carries BTC top/bottom into ETH's manual box.
 * useMarket runs for real on the persistent-state hooks runtime of round10.test.ts (JEV1's probe runtime);
 * performance.now() is a controlled clock so arrival / selection order is deterministic.
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
let PT = 1_000; // controlled performance.now()
const tickClock = (ms = 1) => { PT += ms; };
/** one React render + commit: render, then run the effects whose deps changed */
const render = (sym: string): M => { R.i = 0; tickClock(); const m = useMarket(sym, '15m'); R.pending.splice(0).forEach((f) => f()); return m; };
/** the render alone (effects not run yet) — what App's [last] effect sees in the switch commit */
const renderOnly = (sym: string) => { R.i = 0; tickClock(); const m = useMarket(sym, '15m'); const eff = R.pending.splice(0); return { m, commit: () => eff.forEach((f) => f()) }; };
const flush = () => new Promise((r) => setTimeout(r, 0));
const settle = async (sym: string) => { let m = render(sym); await flush(); m = render(sym); await flush(); return render(sym); };
const lastOf = (m: M) => m.ticker?.last ?? m.candles[m.candles.length - 1]?.close ?? 0; // App.tsx `last`
const BTC_T = { last: 60_000, mark: 60_000, change24h: 0, funding: 0.0001, bid: 59_999, ask: 60_001 };
beforeEach(() => { PT = 1_000; vi.spyOn(performance, 'now').mockImplementation(() => PT); });
afterEach(() => {
  for (const s of R.slots) s?.cleanup?.();
  R.slots = []; R.pending = [];
  H.feeds = {}; H.tickers = {}; H.candles = {};
  vi.restoreAllMocks();
});

/** BTC live at 60 000 (REST + WS ticker), then BTC data goes away and the user switches to ETH (ETH data blocked) */
async function btcThenEthVisit() {
  H.tickers[BTC] = BTC_T;
  H.candles[BTC] = [{ ts: Date.now() - 900_000, open: 60_000, high: 60_100, low: 59_900, close: 60_050, volume: 1 }];
  await settle(BTC);
  H.feeds[BTC].ticker!({ ...BTC_T });
  expect(lastOf(render(BTC))).toBe(60_000);
  delete H.tickers[BTC]; delete H.candles[BTC]; // useMarket no longer gets BTC (App's 4 s other-symbol poll still does)
  const eth = await settle(ETH);
  expect(lastOf(eth)).toBe(0);
  tickClock(600_000); // 10 minutes on ETH
}
/** App's liveTick (gate + broker) */
function rig() {
  const b = new PaperBroker();
  b.slip = SLIP;
  const gate = new ReplayGate();
  const liveTick = (sym: string, px: number, now: number) => (gate.tick(b.state, sym, now) === 'live' ? b.onPrice(sym, px, now) : []);
  return { b, liveTick };
}
/** App: useEffect([last]) → if (last) liveTick(s.symbol, last, …) in the switch commit */
const lastEffect = (L: number, liveTick: (s: string, p: number, n: number) => any[], now: number) => (L ? liveTick(BTC, L, now) : []);

describe('round 11 — Z12 Jev probe: BTC limit filled while ETH was on screen, return 10 min later', () => {
  it('the switch-back render exposes no stale 60 000 → no false TP @59 600; the first real BTC quote is 59 300', async () => {
    const T0 = Date.now();
    const { b, liveTick } = rig();
    liveTick(BTC, 60_000, T0);
    expect(b.placeLimit({ symbol: BTC, side: 'long', qty: 0.002, price: 59_000, leverage: 10, sl: 58_800, targets: [{ price: 59_600, fraction: 1, label: 'TP' }], setup: 'MANUAL' }, T0)).toEqual({ ok: true });
    await btcThenEthVisit();
    // App's 4 s other-symbol poll for BTC over the 10 min: dips to 58 950 (limit fills @59 000), then sits at 59 300
    const kinds: string[] = [];
    for (let s = 4; s <= 600; s += 4) kinds.push(...liveTick(BTC, s < 300 ? 60_000 - (s / 300) * 1_050 : 59_300, T0 + s * 1000).map((e) => e.kind));
    expect(kinds).toContain('limit_fill');
    expect(b.state.positions.map((p) => [p.symbol, p.entry])).toEqual([[BTC, 59_000]]);
    H.tickers[BTC] = { ...BTC_T, last: 59_300, mark: 59_300, bid: 59_299, ask: 59_301 }; // BTC reachable again
    const sw = renderOnly(BTC);
    expect(sw.m.ticker).toBeNull(); // the ticker left from the earlier BTC visit is not exposed (Z12)
    expect(lastOf(sw.m)).toBe(0);
    expect(lastEffect(lastOf(sw.m), liveTick, T0 + 601_000)).toEqual([]);
    sw.commit();
    expect(b.state.fills).toEqual([]); // no false TP
    expect(b.state.positions).toHaveLength(1);
    await flush();
    const m = render(BTC);
    expect(lastOf(m)).toBe(59_300); // the first real BTC quote
    expect(liveTick(BTC, 59_300, T0 + 602_000)).toEqual([]);
    expect(b.state.fills).toEqual([]);
  });
  it('control: fed the stale 60 000 (what round 10 exposed on the switch render) the same position books a false TP @59 600', async () => {
    const T0 = Date.now();
    const { b, liveTick } = rig();
    liveTick(BTC, 60_000, T0);
    b.placeLimit({ symbol: BTC, side: 'long', qty: 0.002, price: 59_000, leverage: 10, sl: 58_800, targets: [{ price: 59_600, fraction: 1, label: 'TP' }], setup: 'MANUAL' }, T0);
    for (let s = 4; s <= 600; s += 4) liveTick(BTC, s < 300 ? 60_000 - (s / 300) * 1_050 : 59_300, T0 + s * 1000);
    const ev = lastEffect(60_000, liveTick, T0 + 601_000);
    expect(ev.map((e) => e.kind)).toContain('tp');
    expect(b.state.fills[0].exit).toBe(59_600);
  });
});

describe('round 11 — Z12 stale-price false stop (SL moved to break-even while away)', () => {
  const openRange = (b: PaperBroker, T0: number) => b.open({ symbol: BTC, side: 'long', qty: 0.002, price: 60_000, leverage: 10, sl: 59_500,
    targets: [{ price: 61_000, fraction: 0.5, label: 'TP1' }, { price: 62_000, fraction: 0.5, label: 'TP2' }], setup: 'RANGE_LONG', liquidity: 'maker' }, T0);
  const away = (b: PaperBroker, liveTick: (s: string, p: number, n: number) => any[], T0: number) => {
    const kinds: string[] = [];
    for (let s = 4; s <= 600; s += 4) kinds.push(...liveTick(BTC, s < 300 ? 60_000 + (s / 300) * 1_050 : 61_500, T0 + s * 1000).map((e) => e.kind));
    return kinds;
  };
  it('TP1 fills while ETH is on screen and the SL moves to break-even above 60 000; on return the stale 60 000 is not exposed → no false stop', async () => {
    const T0 = Date.now();
    const { b, liveTick } = rig();
    liveTick(BTC, 60_000, T0);
    expect(openRange(b, T0).ok).toBe(true);
    await btcThenEthVisit();
    const kinds = away(b, liveTick, T0);
    expect(kinds).toContain('tp');
    const p = b.state.positions[0];
    expect(p.beMoved).toBe(true);
    expect(p.sl).toBeGreaterThan(60_000); // break-even incl. fees: the stale 60 000 would be below it
    const sw = renderOnly(BTC);
    expect(lastOf(sw.m)).toBe(0);
    expect(lastEffect(lastOf(sw.m), liveTick, T0 + 601_000)).toEqual([]);
    sw.commit();
    expect(b.state.positions).toHaveLength(1);
    expect(b.state.fills.map((f) => f.reason)).not.toContain('본절 SL');
  });
  it('control: the stale 60 000 stops the remaining half out at break-even although BTC is at 61 500', () => {
    const T0 = Date.now();
    const { b, liveTick } = rig();
    liveTick(BTC, 60_000, T0);
    openRange(b, T0);
    away(b, liveTick, T0);
    const ev = lastEffect(60_000, liveTick, T0 + 601_000);
    expect(ev.map((e) => e.kind)).toContain('sl');
    expect(b.state.positions).toHaveLength(0);
  });
});

describe('round 11 — Z12 stale market / limit orders on return while BTC is unreachable', () => {
  /** TradeTab onSubmit with the Z11 guard and the R10 marketability check (App.tsx) */
  const submit = (b: PaperBroker, m: M, side: Side, type: 'market' | 'limit', limitPrice = 0, toasts: string[] = []) => {
    const l = lastOf(m);
    if (!(l > 0)) { toasts.push('현재가 확인 중 – 잠시 후 다시 주문하세요'); return null; }
    const targets = [{ price: side === 'long' ? l * 1.02 : l * 0.98, fraction: 1, label: 'TP 1:3' }];
    if (type === 'limit') {
      if (side === 'long' ? limitPrice >= l : limitPrice <= l) { toasts.push('시장가로'); return null; }
      return b.placeLimit({ symbol: BTC, side, qty: 0.002, price: limitPrice, leverage: 10, sl: limitPrice * 0.99, targets, setup: 'MANUAL' }, 0);
    }
    const x = side === 'long' ? m.ticker?.ask : m.ticker?.bid;
    return b.open({ symbol: BTC, side, qty: 0.002, price: l, refPx: x && Math.abs(x - l) / l < 0.005 ? x : l, leverage: 10, sl: l * (side === 'long' ? 0.99 : 1.01), targets, setup: 'MANUAL' }, 0);
  };
  it('back on BTC with BTC REST + WS still blocked: market and limit orders are refused (never priced off the earlier visit)', async () => {
    await btcThenEthVisit();
    const b = new PaperBroker();
    const toasts: string[] = [];
    const sw = renderOnly(BTC);
    expect(submit(b, sw.m, 'long', 'market', 0, toasts)).toBeNull();
    sw.commit();
    const later = await settle(BTC); // still unreachable after the effects ran
    expect(later.ticker).toBeNull();
    expect(submit(b, later, 'long', 'market', 0, toasts)).toBeNull();
    expect(submit(b, later, 'long', 'limit', 59_000, toasts)).toBeNull(); // marketable vs a real ~58 000, but the stale 60 000 would have accepted it
    expect(toasts).toEqual(Array(3).fill('현재가 확인 중 – 잠시 후 다시 주문하세요'));
    expect(b.state.positions).toEqual([]);
    expect(b.state.pending).toEqual([]);
    expect(b.state.wallet).toBe(200);
  });
  it('control: priced off the stale 60 000 the market long fills at ~60 001 and a long limit at 59 000 is accepted', () => {
    const b = new PaperBroker();
    b.slip = SLIP;
    const stale = { ticker: { ...BTC_T, sym: BTC }, candles: [], book: null } as unknown as M;
    const r = submit(b, stale, 'long', 'market') as ReturnType<PaperBroker['open']>;
    expect(r.fillPx).toBeCloseTo(60_001 * (1 + SLIP), 6);
    expect(submit(b, stale, 'long', 'limit', 59_000)).toEqual({ ok: true }); // a long limit above the real ~58 000 market
  });
  it('a ticker that arrives AFTER the re-selection is shown at once (the stamp heals on the next push)', async () => {
    await btcThenEthVisit();
    render(BTC);
    H.feeds[BTC].ticker!({ ...BTC_T, last: 58_000, mark: 58_000, bid: 57_999, ask: 58_001 });
    const m = render(BTC);
    expect(m.ticker).toMatchObject({ last: 58_000, sym: BTC });
    expect(m.ticker!.at).toBeGreaterThan(0);
  });
});

describe('round 11 — Z14 BoxBar edit form resets on a symbol switch', () => {
  /** BoxBar's local form state (open / t / b) — a keyed element remounts with fresh state; an unkeyed one keeps it */
  function boxBarHarness(keyed: boolean) {
    let key = '';
    let state = { open: false, t: '', b: '' };
    const mount = (sym: string) => {
      const k = keyed ? sym : 'BoxBar'; // React reuses an element of the same type/position/key and remounts on a key change
      if (k !== key) { key = k; if (keyed || !state.open) state = { open: false, t: '', b: '' }; }
      return state;
    };
    return { mount };
  }
  it('a 수정 form opened on BTC (top/bottom filled with BTC levels) is closed and empty after switching to ETH', () => {
    const saved: Record<string, unknown> = {};
    for (const keyed of [true, false]) {
      const h = boxBarHarness(keyed);
      const f = h.mount(BTC);
      Object.assign(f, { open: true, t: '60500', b: '59500' }); // '수정' on BTC
      const g = h.mount(ETH);
      if (g.open && Number(g.t) > 0 && Number(g.b) > 0) saved[`${keyed}`] = { top: Number(g.t), bottom: Number(g.b) }; // '고정' on ETH → dupont.box.ETHUSDT
    }
    expect(saved).toEqual({ false: { top: 60_500, bottom: 59_500 } }); // only the unkeyed (round-10) BoxBar carried BTC levels into ETH's box
  });
  it('App.tsx keys BoxBar by symbol; BoxBar keeps its form in local state', () => {
    expect(appSource).toContain('<BoxBar key={s.symbol} box={dv.box} manual={manual} dp={info.dp} tape={dv.tapeCandles}');
    expect(appSource).toMatch(/function BoxBar\(.*\) \{\n\s+const \[open, setOpen\] = useState\(false\);\n\s+const \[t, setT\] = useState\(''\);\n\s+const \[b, setB\] = useState\(''\);/);
  });
});

describe('round 11 — Z13 addOn refuses another symbol\'s position', () => {
  /** App.tsx addOn guards (Z11, then Z13) */
  const addOnGuards = (last: number, selected: string, p: { symbol: string }, toasts: string[]) => {
    if (!(last > 0)) { toasts.push('현재가 확인 중 – 잠시 후 다시 추가하세요'); return false; }
    if (p.symbol !== selected) { toasts.push(`${p.symbol} 불타기는 해당 심볼 화면에서만 가능합니다`); return false; }
    return true;
  };
  it('an ETH position is never added at the BTC price; the same-symbol add passes the guards', () => {
    const b = new PaperBroker();
    expect(b.open({ symbol: ETH, side: 'long', qty: 0.1, price: 2400, leverage: 10, sl: 2380, targets: [{ price: 2600, fraction: 1, label: 'TP 1:3' }], setup: 'BREAKOUT_LONG', liquidity: 'maker' }, 0).ok).toBe(true);
    const p = b.state.positions[0];
    const toasts: string[] = [];
    expect(addOnGuards(60_000, BTC, p, toasts)).toBe(false);
    expect(toasts).toEqual(['ETHUSDT 불타기는 해당 심볼 화면에서만 가능합니다']);
    expect(b.state.positions[0].qty).toBe(0.1);
    expect(addOnGuards(2500, ETH, p, toasts)).toBe(true);
  });
  it('App.tsx: the Z13 line sits directly after the Z11 line in addOn', () => {
    expect(appSource).toMatch(/const addOn = \(p: PaperPosition, sug: \{ sl\?: string; sizePct\?: number \}\) => \{\n\s+if \(!\(last > 0\)\) \{ toast\('현재가 확인 중 – 잠시 후 다시 추가하세요', 'warn'\); return; \} \/\/ Z11\n\s+if \(p\.symbol !== s\.symbol\) \{ toast\(`\$\{p\.symbol\} 불타기는 해당 심볼 화면에서만 가능합니다`, 'warn'\); return; \} \/\/ Z13/);
  });
});

describe('round 11 — Z12 source', () => {
  it('useMarket.ts stamps arrival and hides tickers older than the (re)selection', () => {
    expect(marketSource).toContain('const since = useRef({ symbol, at: 0 });');
    expect(marketSource).toContain('if (since.current.symbol !== symbol) since.current = { symbol, at: performance.now() };');
    expect(marketSource).toContain('sym: symbol, at: performance.now() })), // Z11: never merge into another symbol\'s ticker; Z12: stamp arrival');
    expect(marketSource).toContain('setTicker({ ...t, sym: symbol, at: performance.now() }); // Z11 / Z12');
    expect(marketSource).toContain('ticker: ticker?.sym === symbol && (ticker.at ?? 0) >= since.current.at ? ticker : null, // Z12');
  });
});
