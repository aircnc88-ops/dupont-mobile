import { afterEach, describe, expect, it, vi } from 'vitest';
import appSource from './App.tsx?raw';
import { PaperBroker, tradeStats, realizedRSince, type ClosedFill } from './paper/broker';
import { ReplayGate, replayFrom } from './lib/replayGate';
import { fetchClockOffset, offsetFromServerTime } from './data/bitget';

const M = 60_000;
const S = Date.UTC(2026, 9, 6, 6, 0); // server minute 0
const closeTo = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);
const pos: Parameters<PaperBroker['open']>[0] = { symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 10, sl: 99, targets: [{ price: 103, fraction: 1, label: 'TP' }], setup: 'MANUAL', liquidity: 'maker' };
/** server-time 1m bars over [from, to]; `special` overrides by server minute index */
const bars = (from: number, to: number, special: Record<number, number[]>) => {
  const r = [];
  for (let ts = from; ts <= to; ts += M) {
    const [o, h, l, c] = special[(ts - S) / M] ?? [100, 100.05, 99.95, 100];
    r.push({ ts, open: o, high: h, low: l, close: c });
  }
  return r;
};

/**
 * The App's clock use, driven like App.tsx does it. `skew` = phone − server. `oneClock` = round 5 (every
 * broker / gate stamp is mkt.serverNow(), offset measured from Bitget's server time); false = the round-4
 * wiring Jev probed (open / onPrice / lastTickTs on Date.now(), replay window + nowTs on serverNow).
 */
function session(skew: number, oneClock: boolean) {
  let server = S;
  const phone = () => server + skew;
  // Z1 sync: one public /time request answered instantly at `server` (round trip 0)
  const offset = offsetFromServerTime(server, phone(), phone());
  const serverNow = () => phone() + offset;
  const stamp = oneClock ? serverNow : phone;
  const b = new PaperBroker();
  b.slip = 0;
  const gate = new ReplayGate();
  return {
    b,
    at(t: number) { server = t; },
    open() { return b.open(pos, stamp()); },
    placeLimit(price: number) { return b.placeLimit({ ...pos, price }, stamp()); },
    liveTick(price: number) { if (gate.tick(b.state, 'X', stamp()) === 'live') b.onPrice('X', price, stamp()); },
    /** live ticks every 5 s (server time) over (server, until] — the app in the foreground */
    ticksUntil(until: number, price = 100) { for (let t = server + 5_000; t <= until; t += 5_000) { server = t; this.liveTick(price); } },
    /** runReplay: gate, window from replayFrom, bars (server time) incl. the forming one, nowTs, lastTickTs */
    resume(special: Record<number, number[]>) {
      const syms = gate.begin(b.state, stamp());
      const now = serverNow();
      const start = Math.floor(replayFrom(b.state, 'X') / M) * M;
      const ev = syms.length ? b.replayBars('X', bars(start, now, special).filter((c) => c.ts >= start), serverNow()) : [];
      const lt = (b.state.lastTickTs ??= {});
      lt.X = Math.max(lt.X ?? 0, stamp());
      syms.forEach((s) => gate.release(s));
      return { ev, startMin: (start - S) / M, replayed: syms.length > 0 };
    },
  };
}

describe('round 5 — Z1 one server clock (Jev probe S9)', () => {
  it('phone 150 s AHEAD: the resume replay starts at the last tick minute — no minute skipped, the stop is not missed', () => {
    for (const oneClock of [false, true]) {
      const s = session(150_000, oneClock);
      s.at(S + 5 * M); s.open();
      s.ticksUntil(S + 10 * M + 10_000); // live ticks up to server 10:10
      // offline: SL 99 touched at server minute 11 (low 98.9), recovered; resume at server 20:00
      s.at(S + 20 * M);
      const r = s.resume({ 11: [100, 100, 98.9, 99.8] });
      if (!oneClock) {
        // control (round-4 wiring): the window starts at server minute 12 → minute 11 skipped, stop missed
        expect(r.startMin).toBe(12);
        expect(s.b.state.positions.length).toBe(1);
        continue;
      }
      expect(r.startMin).toBe(10); // the minute of the last processed price
      expect(r.ev.map((e) => e.kind)).toEqual(['sl']);
      expect(s.b.state.positions.length).toBe(0);
      expect(s.b.state.fills[0].exit).toBe(99);
      expect(s.b.state.fills[0].closedAt).toBe(S + 11 * M + 59_999); // stamped in the server minute it happened
      expect(s.b.state.lastTickTs!.X).toBe(S + 20 * M); // = server now, not phone now (+150 s)
    }
  });

  it('phone 90 s BEHIND: a wick from before the entry never stops the new position (or fills a new limit)', () => {
    for (const oneClock of [false, true]) {
      const s = session(-90_000, oneClock);
      s.at(S + 6 * M + 20_000); s.open(); // real entry at server 06:20; the 98.9 wick was in server minute 5
      s.ticksUntil(S + 6 * M + 40_000); // live ticks, then the app is backgrounded at server 06:40
      s.at(S + 15 * M);
      const r = s.resume({ 5: [100, 100, 98.9, 99.9] });
      if (!oneClock) {
        // control: openedAt is phone 04:50 → server bar 5 manages it → fake stop
        expect(s.b.state.fills.map((f) => f.reason)).toEqual(['손절 SL']);
        continue;
      }
      expect(s.b.state.positions[0].openedAt).toBe(S + 6 * M + 20_000);
      expect(r.startMin).toBeGreaterThanOrEqual(6);
      expect(s.b.state.fills).toEqual([]);
      expect(s.b.state.positions.length).toBe(1);
    }
    // same for a limit order (R4 createdAt check): a touch before the order existed must not fill it
    const s = session(-90_000, true);
    s.at(S + 6 * M + 20_000);
    expect(s.placeLimit(99).ok).toBe(true);
    s.at(S + 15 * M);
    s.resume({ 5: [100, 100, 98.9, 99.9] });
    expect(s.b.state.pending.length).toBe(1);
    expect(s.b.state.positions.length).toBe(0);
  });

  it('phone 150 s ahead, live ticks keep flowing: no gap is invented and lastTickTs never runs ahead of the server', () => {
    const s = session(150_000, true);
    s.at(S + 5 * M); s.open();
    s.ticksUntil(S + 8 * M);
    expect(s.b.state.lastTickTs!.X).toBe(S + 8 * M);
    s.at(S + 8 * M + 10_000);
    expect(s.resume({}).replayed).toBe(false); // 10 s since the last tick (server) → no replay
  });
});

describe('round 5 — Z1 server clock sync (public /api/v2/public/time)', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('offset = serverTime − request midpoint; phone +150 s / −90 s are measured from one request', async () => {
    expect(offsetFromServerTime(1_000_000, 1_150_000, 1_150_200)).toBe(-150_100);
    for (const skew of [150_000, -90_000]) {
      let phone = S + skew;
      vi.stubGlobal('fetch', async () => { phone += 80; return { ok: true, json: async () => ({ code: '00000', data: { serverTime: String(S + 40) } }) }; });
      const off = await fetchClockOffset(4_000, () => phone);
      expect(off).toBe(-skew); // midpoint of [S+skew, S+skew+80] ↔ server S+40
    }
  });
  it('a failed request keeps the caller on its current clock (null)', async () => {
    vi.stubGlobal('fetch', async () => { throw new Error('offline'); });
    expect(await fetchClockOffset(200)).toBeNull();
  });
});

describe('round 5 — Z1 App.tsx wiring guard', () => {
  const app: string = appSource;
  /** full argument text of every `name(` call */
  const calls = (name: string) => {
    const out: string[] = [];
    for (let i = app.indexOf(name + '('); i >= 0; i = app.indexOf(name + '(', i + 1)) {
      let d = 0, j = i + name.length;
      for (; j < app.length; j++) { if (app[j] === '(') d++; else if (app[j] === ')' && --d === 0) break; }
      out.push(app.slice(i, j + 1));
    }
    return out;
  };
  it('open / placeLimit / closeFraction / reset all pass mkt.serverNow() as their time argument', () => {
    const all = ['broker.current.open', 'broker.current.placeLimit', 'broker.current.closeFraction', 'broker.current.reset'].flatMap(calls);
    expect(all.length).toBe(6); // enterSignal, addOn, TradeTab market + limit, closePos, reset
    for (const c of all) expect(c.replace(/\s+/g, ' ')).toMatch(/, mkt\.serverNow\(\)\)$/);
  });
  it('gate / onPrice / funding / lastTickTs use the server clock; Date.now() is left only in UI / throttle code', () => {
    for (const c of [...calls('gate.current.tick'), ...calls('gate.current.begin'), ...calls('gate.current.failed')]) expect(c).toContain('mkt.serverNow()');
    expect(app).toContain('const now = mkt.serverNow(); // onPrice');
    expect(app).toContain('lt[sym] = Math.max(lt[sym] ?? 0, mkt.serverNow())');
    expect(app).toMatch(/begin\(b\.state, mkt\.serverNow\(\)\);[^]*?await mkt\.syncClock\(\);[^]*?fetchMinuteBars/);
    const dn = app.split('\n').filter((l) => l.includes('Date.now()')).map((l) => l.trim());
    expect(dn).toEqual([
      'const id = Date.now() + Math.random();', // toast key
      'const now = Date.now(); // request throttle only (not a broker timestamp) — the phone clock is fine here',
    ]);
    // Z4 (round 6): argument-less `new Date()` is phone time too — only the CSV filename may use it
    const nd = app.split('\n').filter((l) => /new Date\(\)/.test(l)).map((l) => l.trim());
    expect(nd).toEqual(["const name = `dupont-paper-${new Date().toISOString().slice(0, 10)}.csv`;"]);
  });
});

describe('round 5 — Q5 legacy positions count in tradeStats like in realizedRSince', () => {
  const f = (positionId: string, net: number, final: boolean, x: { r?: number; riskUsd?: number }): ClosedFill => ({
    id: `${positionId}${net}`, positionId, symbol: 'X', side: 'long', setup: 'MANUAL', qty: 1, entry: 1, exit: 1, grossPnl: net, fees: 0, netPnl: net,
    reason: '', openedAt: S, closedAt: S + M, final, ...x,
  });
  it('mixed legacy: first fill without r / riskUsd, final fill with riskUsd → included, R = Σ net / last riskUsd', () => {
    const fills = [f('a', -1, false, {}), f('a', -1.4395, true, { r: -0.2286, riskUsd: 6.2962 })];
    const st = tradeStats(fills);
    expect(st.rTrades).toBe(1); // round 4 dropped it (hasR = false)
    closeTo(st.avgR, -2.4395 / 6.2962);
    closeTo(realizedRSince(fills, S), st.avgR);
  });
  it('legacy per-fill R only (no riskUsd anywhere) → summed per-fill R in both', () => {
    const fills = [f('b', 1, false, { r: 0.5 }), f('b', -0.5, true, {})];
    closeTo(tradeStats(fills).avgR, 0.5);
    expect(tradeStats(fills).rTrades).toBe(1);
    closeTo(realizedRSince(fills, S), 0.5);
  });
  it('a position with no R info at all stays out of the R stats (it adds 0 R to the daily stop too)', () => {
    const fills = [f('c', 2, true, {}), f('d', -1, true, { r: -1, riskUsd: 1 })];
    const st = tradeStats(fills);
    expect(st.trades).toBe(2);
    expect(st.rTrades).toBe(1);
    closeTo(st.avgR, -1);
    closeTo(realizedRSince(fills, S), -1);
  });
});

describe('round 5 — broker reset takes the server clock', () => {
  it('reset(bankroll, ts) stamps the first equity point', () => {
    const b = new PaperBroker();
    b.reset(200, S + 7);
    expect(b.state.equityCurve).toEqual([{ t: S + 7, equity: 200 }]);
  });
});
