import { describe, expect, it } from 'vitest';
import appSource from './App.tsx?raw';
import brokerSource from './paper/broker.ts?raw';
import { PaperBroker, type BrokerState, type PaperPosition } from './paper/broker';
import { ReplayGate, REPLAY_MAX_FAILS } from './lib/replayGate';
import { fmt } from './lib/format';
import { symInfo } from './lib/symbols';

/*
 * Round 9 (Jev Z9 + Z10). The harness mirrors App.tsx exactly where it matters:
 *  - the marks effect `useEffect(() => { if (last) setMarks(m => ({ ...m, [s.symbol]: last })) }, [last])` (Z9: fires on a
 *    NEW price only — a symbol switch alone does not; round 8 also listed s.symbol → `r8 = true` reproduces that);
 *  - the 4 s REST poll of the other exposed symbols (`setMarks(m => ({ ...m, [sym]: t.last }))`);
 *  - closePos (Z7 → Z9 / Z10 → closeFraction). `r8 = true` uses the round-8 price `marks[p.symbol] ?? last`.
 * useMarket keeps the previous symbol's ticker after a switch until the new symbol's first quote, so `last` still holds
 * the old symbol's price right after a switch.
 */
const T0 = Date.UTC(2026, 9, 9, 14, 0);
const BTC = 'BTCUSDT', ETH = 'ETHUSDT';
const pos = (symbol: string, price: number, qty: number): Parameters<PaperBroker['open']>[0] => ({
  symbol, side: 'long', qty, price, leverage: 10, sl: price * 0.98, targets: [{ price: price * 1.06, fraction: 1, label: 'TP' }], setup: 'MANUAL', liquidity: 'maker',
});

function app(opts: { active: string; state?: BrokerState; r8?: boolean }) {
  const r8 = !!opts.r8;
  const b = new PaperBroker(opts.state);
  b.slip = 0;
  const gate = new ReplayGate();
  let active = opts.active;
  let last = 0; // useMarket: no ticker / candles yet
  const marks: Record<string, number> = {};
  const toasts: Array<[string, string]> = [];
  const toast = (text: string, tone = 'info') => { toasts.push([text, tone]); };
  const marksEffect = () => { if (last) marks[active] = last; };
  return {
    b, gate, marks, toasts,
    get active() { return active; },
    get last() { return last; },
    /** a NEW quote for the on-screen symbol (WS ticker / REST): `last` changes → the effect runs */
    quote(price: number) { const changed = price !== last; last = price; if (changed) marksEffect(); },
    /** symbol switch: `last` keeps the previous symbol's price until the new symbol's first quote */
    switchTo(sym: string) { active = sym; if (r8) marksEffect(); /* round 8: deps [last, s.symbol] */ },
    /** 4 s REST poll of another exposed symbol */
    poll(sym: string, price: number) { marks[sym] = price; },
    closePos(p: PaperPosition, frac: number, why: string) {
      if (gate.replaying.has(p.symbol)) { toast('오프라인 구간 재생 중 – 잠시 후 다시 청산하세요', 'warn'); return null; } // Z7
      if (r8) return b.closeFraction(p.id, frac, marks[p.symbol] ?? last, why, T0);
      const stalePx = (gate.fails[p.symbol]?.n ?? 0) >= REPLAY_MAX_FAILS ? b.state.lastPx?.[p.symbol] : undefined;
      const px = marks[p.symbol] ?? stalePx; // Z9 / Z10
      if (!(px! > 0)) { toast(`${p.symbol} 현재가 확인 중 – 잠시 후 다시 청산하세요`, 'warn'); return null; }
      if (marks[p.symbol] === undefined) toast(`${p.symbol} 시세 조회 불가 – 마지막 처리 가격 ${fmt(px!, symInfo(p.symbol).dp)}로 청산`, 'warn');
      return b.closeFraction(p.id, frac, px!, why, T0);
    },
  };
}
/** a stored broker state with one ETH long (0.5 ETH, 10x) opened at 2500 (session 1), last processed ETH price 2490 */
const stored = (): BrokerState => {
  const b = new PaperBroker();
  b.slip = 0;
  expect(b.open(pos(ETH, 2500, 0.5), T0 - 600_000).ok).toBe(true);
  b.onPrice(ETH, 2490, T0 - 300_000);
  return JSON.parse(JSON.stringify(b.state)); // persisted (localStorage) → app restart
};
const ethPos = (a: ReturnType<typeof app>) => a.b.state.positions.find((p) => p.symbol === ETH)!;

describe('round 9 — Z9 manual close is priced only with that symbol\'s own quote', () => {
  it('Jev probe H: ETH position closed from the BTC tab never fills at the BTC price', () => {
    for (const r8 of [true, false]) {
      const a = app({ active: BTC, state: stored(), r8 });
      a.quote(60_000); // BTC tab live
      expect(a.marks).toEqual({ [BTC]: 60_000 }); // no ETH quote yet
      const f = a.closePos(ethPos(a), 1, '시장가 청산');
      if (r8) {
        // control: round 8 filled the ETH position at the BTC price — a fake ≈ +28 750 USDT
        expect(f!.exit).toBe(60_000);
        expect(f!.netPnl).toBeGreaterThan(20_000);
        continue;
      }
      expect(f).toBeNull(); // refused, no fill
      expect(a.b.state.fills).toEqual([]);
      expect(a.b.state.positions).toHaveLength(1);
      expect(a.toasts).toEqual([[`${ETH} 현재가 확인 중 – 잠시 후 다시 청산하세요`, 'warn']]);
      a.poll(ETH, 2510); // the ETH quote arrives (4 s poll)
      const g = a.closePos(ethPos(a), 1, '시장가 청산');
      expect(g!.exit).toBe(2510);
      expect(g!.netPnl).toBeLessThan(15);
      expect(a.b.state.fills.every((x) => x.exit < 3_000)).toBe(true);
    }
  });

  it('first 4 s after launch: no quote for the symbol yet → close refused (on-screen and other symbols)', () => {
    const st = stored();
    const b0 = new PaperBroker(st);
    b0.slip = 0;
    expect(b0.open(pos(BTC, 60_000, 0.001), T0 - 60_000).ok).toBe(true);
    const a = app({ active: BTC, state: JSON.parse(JSON.stringify(b0.state)) });
    const btcPos = a.b.state.positions.find((p) => p.symbol === BTC)!;
    // t = 0: no ticker, no candles (last = 0) → nothing recorded, both refused
    expect(a.closePos(btcPos, 1, '시장가 청산')).toBeNull();
    expect(a.closePos(ethPos(a), 1, '시장가 청산')).toBeNull();
    // t ≈ 0.5 s: the BTC quote → BTC can be closed, ETH (polled every 4 s) still refused
    a.quote(60_100);
    expect(a.closePos(ethPos(a), 1, '시장가 청산')).toBeNull();
    expect(a.b.state.positions).toHaveLength(2);
    expect(a.toasts.map((x) => x[0])).toEqual([`${BTC} 현재가 확인 중 – 잠시 후 다시 청산하세요`, `${ETH} 현재가 확인 중 – 잠시 후 다시 청산하세요`, `${ETH} 현재가 확인 중 – 잠시 후 다시 청산하세요`]);
    // t = 4 s: first poll of ETH → closes at the ETH price
    a.poll(ETH, 2495);
    expect(a.closePos(ethPos(a), 1, '시장가 청산')!.exit).toBe(2495);
    expect(a.closePos(btcPos, 0.5, '50% 청산')!.exit).toBe(60_100);
    expect(a.b.state.lastPx![ETH]).toBe(2490); // a manual close does not move the last processed price
  });

  it('right after switching coins: the previous coin\'s price is never recorded for the new coin', () => {
    for (const r8 of [true, false]) {
      const a = app({ active: BTC, state: stored(), r8 });
      a.quote(60_000);
      a.switchTo(ETH); // `last` is still the BTC quote until the first ETH quote
      if (r8) {
        expect(a.marks[ETH]).toBe(60_000); // control: round 8 copied the BTC price into marks.ETH on the switch
        expect(a.closePos(ethPos(a), 1, '시장가 청산')!.exit).toBe(60_000);
        continue;
      }
      expect(a.marks[ETH]).toBeUndefined(); // unchanged
      expect(a.closePos(ethPos(a), 1, '시장가 청산')).toBeNull();
      a.quote(2_505); // first ETH quote
      expect(a.marks).toEqual({ [BTC]: 60_000, [ETH]: 2_505 });
      expect(a.closePos(ethPos(a), 1, '시장가 청산')!.exit).toBe(2_505);
      a.switchTo(BTC); // and back: the ETH quote is not recorded for BTC either
      expect(a.marks[BTC]).toBe(60_000);
    }
  });

  it('App.tsx: the marks effect depends on [last] only; closePos never uses `last`', () => {
    expect(appSource).toContain('useEffect(() => { if (last) setMarks((m) => ({ ...m, [s.symbol]: last })); }, [last]); // eslint-disable-line react-hooks/exhaustive-deps -- Z9');
    expect(appSource).not.toContain('[last, s.symbol]');
    expect(appSource).not.toContain('marks[p.symbol] ?? last');
    expect(appSource).toContain("if (!(px > 0)) { toast(`${p.symbol} 현재가 확인 중 – 잠시 후 다시 청산하세요`, 'warn'); return; }");
  });
});

describe('round 9 — Z10 an unreachable symbol can be closed at its last processed price (with a warning)', () => {
  it('after the 3rd counted failure with no quote: closes at lastPx and warns; before that: refused', () => {
    const a = app({ active: BTC, state: stored() });
    a.quote(60_000);
    expect(a.b.state.lastPx![ETH]).toBe(2490); // persisted with the broker state
    for (let k = 1; k <= REPLAY_MAX_FAILS; k++) {
      a.gate.failed(ETH, T0 + k * 20_000); // ETH 1m candles / ticker fail (delisted, renamed …)
      if (k < REPLAY_MAX_FAILS) expect(a.closePos(ethPos(a), 1, '시장가 청산')).toBeNull();
    }
    expect(a.toasts.every(([t]) => t === `${ETH} 현재가 확인 중 – 잠시 후 다시 청산하세요`)).toBe(true);
    a.toasts.length = 0;
    const f = a.closePos(ethPos(a), 1, '시장가 청산');
    expect(f!.exit).toBe(2490); // ETH's own last processed price, never the BTC quote
    expect(a.toasts).toEqual([[`${ETH} 시세 조회 불가 – 마지막 처리 가격 ${fmt(2490, 2)}로 청산`, 'warn']]);
    expect(a.toasts[0][0]).toContain('2,490.00');
    expect(a.b.state.positions).toEqual([]);
  });

  it('a live quote wins over lastPx (no warning); uncounted clock failures never unlock it; Z7 still refuses during a replay', () => {
    const a = app({ active: BTC, state: stored() });
    for (let k = 1; k <= 5; k++) a.gate.failed(ETH, T0 + k, false); // Z5: clock unknown → not counted
    expect(a.closePos(ethPos(a), 1, '시장가 청산')).toBeNull();
    for (let k = 1; k <= 3; k++) a.gate.failed(ETH, T0 + 100 + k);
    a.gate.replaying.add(ETH);
    expect(a.closePos(ethPos(a), 1, '시장가 청산')).toBeNull();
    expect(a.toasts.at(-1)![0]).toBe('오프라인 구간 재생 중 – 잠시 후 다시 청산하세요');
    a.gate.release(ETH);
    a.poll(ETH, 2520);
    a.toasts.length = 0;
    expect(a.closePos(ethPos(a), 0.5, '50% 청산')!.exit).toBe(2520);
    expect(a.toasts).toEqual([]); // own live quote → no stale warning
  });

  it('broker: lastPx follows every processed price (live tick and offline replay)', () => {
    const b = new PaperBroker();
    b.onPrice(ETH, 2500, T0);
    expect(b.state.lastPx).toEqual({ [ETH]: 2500 });
    b.replayBars(ETH, [{ ts: T0 + 60_000, open: 2501, high: 2512, low: 2499, close: 2507 }]);
    expect(b.state.lastPx![ETH]).toBe(2507); // the bar close (end of its path)
    expect(b.state.lastPx![BTC]).toBeUndefined(); // per symbol
  });

  it('source: broker records lastPx in onPrice; App.tsx closePos uses the Z10 lines', () => {
    expect(brokerSource).toContain('lastPx?: Record<string, number>;');
    expect(brokerSource).toMatch(/lt\[symbol\] = Math\.max\(lt\[symbol\] \?\? 0, ts\);\n\s+\(this\.state\.lastPx \?\?= \{\}\)\[symbol\] = price;/);
    expect(appSource).toContain('const stalePx = (gate.current.fails[p.symbol]?.n ?? 0) >= REPLAY_MAX_FAILS ? broker.current.state.lastPx?.[p.symbol] : undefined;');
    expect(appSource).toMatch(/const px = marks\[p\.symbol\] \?\? stalePx;/);
    expect(appSource).toContain("if (marks[p.symbol] === undefined) toast(`${p.symbol} 시세 조회 불가 – 마지막 처리 가격 ${fmt(px, symInfo(p.symbol).dp)}로 청산`, 'warn');");
    expect(appSource).toMatch(/const f = broker\.current\.closeFraction\(p\.id, frac, px, why, mkt\.serverNow\(\)\);/);
  });
});
