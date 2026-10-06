import { describe, expect, it } from 'vitest';
import { PaperBroker, tradeStats, realizedRSince, type ClosedFill } from './paper/broker';

const closeTo = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);
const M = 60_000;
const T = Date.UTC(2026, 9, 6, 6, 0);
const bar = (ts: number, o: number, h: number, l: number, c: number) => ({ ts, open: o, high: h, low: l, close: c });

describe('round 4 — Q1 the forming minute at resume is replayed "as of now"', () => {
  // long opened at T, last live tick T+10m, app resumes at T+60m+45s; SL 99 was touched at 98.9 inside the
  // still-forming 06:60 minute and price is back at 99.5 when live ticks resume
  const setup = () => {
    const b = new PaperBroker();
    b.slip = 0;
    b.open({ symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 10, sl: 99, targets: [{ price: 103, fraction: 1, label: 'TP' }], setup: 'MANUAL' }, T);
    b.onPrice('X', 100, T + 10 * M);
    const now = T + 60 * M + 45_000;
    const bars = [];
    for (let ts = T + 10 * M; ts <= T + 60 * M; ts += M) bars.push(ts === T + 60 * M ? bar(ts, 99.6, 99.65, 98.9, 99.5) : bar(ts, 100, 100.05, 99.95, 100));
    return { b, now, bars };
  };

  it('closed bars only (old filter) miss the stop; with the forming bar and nowTs the stop fills, stamped at now', () => {
    const old = setup();
    old.b.replayBars('X', old.bars.filter((c) => c.ts + M <= old.now));
    expect(old.b.state.positions.length).toBe(1); // the gap Jev found (probe B)

    const { b, now, bars } = setup();
    const ev = b.replayBars('X', bars, now);
    expect(ev.map((e) => e.kind)).toEqual(['sl']);
    expect(b.state.positions.length).toBe(0);
    expect(b.state.fills[0].exit).toBe(99);
    expect(b.state.fills[0].closedAt).toBe(now); // not T+60m+59.999s (the future)
    expect(b.state.lastTickTs!.X).toBe(now);
  });

  it('a limit filled in the forming bar opens at now and R5 still applies to it', () => {
    const b = new PaperBroker();
    b.slip = 0;
    b.placeLimit({ symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 10, sl: 99.5, targets: [{ price: 103, fraction: 1, label: 'TP' }], setup: 'MANUAL' }, T - 1);
    const now = T + 20_000;
    b.replayBars('X', [bar(T, 100.2, 100.3, 99.9, 100.1)], now); // fills 100, SL 99.5 not in range
    expect(b.state.positions[0].openedAt).toBe(now);
    const b2 = new PaperBroker();
    b2.slip = 0;
    b2.placeLimit({ symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 10, sl: 99.5, targets: [], setup: 'MANUAL' }, T - 1);
    b2.replayBars('X', [bar(T, 100.2, 100.3, 99.4, 100.1)], now); // SL inside the forming range → stopped
    expect(b2.state.positions.length).toBe(0);
    expect(b2.state.fills[0].closedAt).toBe(now);
  });
});

describe('round 4 — Q2 R11 funding is booked for the closing position only', () => {
  it('a close inside the settle wait charges only that position; the other one waits for the settled rate', () => {
    const b8 = Date.UTC(2026, 9, 6, 8, 0);
    const b = new PaperBroker();
    b.slip = 0;
    b.open({ symbol: 'X', side: 'long', qty: 2, price: 100, leverage: 10, sl: 98, targets: [{ price: 103, fraction: 1, label: 'TP' }], setup: 'MANUAL' }, b8 - 60 * M);
    b.open({ symbol: 'X', side: 'short', qty: 2, price: 100, leverage: 10, sl: 102, targets: [{ price: 99, fraction: 1, label: 'TP' }], setup: 'MANUAL' }, b8 - 60 * M);
    b.noteTickerRate('X', 0.0001, b8 - 5 * M);
    expect(b.accrueFunding('X', 99.5, b8 + 30_000, 180_000)).toEqual([]); // live: both wait
    b.onPrice('X', 98.99, b8 + M); // short TP inside the wait → R11 books the short at the fallback rate
    expect(b.state.positions.map((p) => p.side)).toEqual(['long']);
    closeTo(b.state.fills[0].funding!, -2 * 99 * 0.0001, 1e-12); // short (TP @ 99) receives at the fallback rate
    const long = b.state.positions[0];
    expect(long.fundingAcc ?? 0).toBe(0); // NOT charged at the fallback rate
    expect(long.lastFundingTs === b8).toBe(false);
    // settled rate published → the long is charged at it
    b.setSettledRates('X', [{ ts: b8, rate: 0.00012 }]);
    b.accrueFunding('X', 99, b8 + 2 * M, 180_000);
    closeTo(b.state.positions[0].fundingAcc!, 2 * 99 * 0.00012, 1e-12);
    expect(b.state.positions[0].lastFundingTs).toBe(b8);
  });
});

describe('round 4 — Q5 one R denominator per position', () => {
  it('a manual partial close before an add: position R = Σ net / final riskUsd (stats and daily stop agree)', () => {
    const b = new PaperBroker();
    b.slip = 0;
    b.open({ symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 10, sl: 98, targets: [], setup: 'BREAKOUT_LONG', riskBudget: 10 }, T);
    const id = b.state.positions[0].id;
    const r0 = b.state.positions[0].riskUsd!;
    b.closeFraction(id, 0.5, 101, '50% 청산', T + M);
    expect(b.open({ symbol: 'X', side: 'long', qty: 1, price: 103, leverage: 10, sl: 101, targets: [], setup: 'BREAKOUT_LONG', isAdd: true }, T + 2 * M).ok).toBe(true);
    const r1 = b.state.positions[0].riskUsd!;
    expect(r1).toBeGreaterThan(r0);
    b.closeFraction(id, 1, 104, '전량 청산', T + 3 * M);
    const fills = b.state.fills;
    expect(fills.map((f) => f.riskUsd)).toEqual([r0, r1]);
    const net = fills.reduce((s, f) => s + f.netPnl, 0);
    const mixed = fills.reduce((s, f) => s + f.r!, 0); // old: Σ per-fill R over different denominators
    expect(Math.abs(mixed - net / r1)).toBeGreaterThan(1e-3);
    const st = tradeStats(fills);
    expect(st.rTrades).toBe(1);
    closeTo(st.avgR, net / r1);
    closeTo(realizedRSince(fills, T), net / r1);
  });

  it('legacy fills without riskUsd keep summing per-fill R', () => {
    const f = (r: number, net: number, final: boolean): ClosedFill => ({ id: 'f', positionId: 'p', symbol: 'X', side: 'long', setup: 'MANUAL', qty: 1, entry: 1, exit: 1, grossPnl: net, fees: 0, netPnl: net, reason: '', openedAt: T, closedAt: T, final, r });
    const fills = [f(0.5, 1, false), f(-0.25, -0.5, true)];
    closeTo(tradeStats(fills).avgR, 0.25);
    closeTo(realizedRSince(fills, T), 0.25);
  });
});

describe('round 4 — R5 partial: the same-bar stop check is limited to the filled position', () => {
  it('a limit filled and stopped in one bar does not trigger another position filled later in that bar', () => {
    const b = new PaperBroker();
    b.slip = 0;
    b.placeLimit({ symbol: 'X', side: 'long', qty: 1, price: 99.8, leverage: 10, sl: 99.75, targets: [{ price: 103, fraction: 1, label: 'TP' }], setup: 'MANUAL' }, T - M);
    b.placeLimit({ symbol: 'X', side: 'short', qty: 1, price: 100.5, leverage: 10, sl: 101, targets: [{ price: 99.76, fraction: 1, label: 'TP' }], setup: 'RANGE_SHORT' }, T - M);
    // green bar O 100 → L 99.7 (long fills 99.8, trades through its SL 99.75) → H 100.6 (short fills 100.5) → C 100.55
    // the short's TP 99.76 was only traded BEFORE it existed — the old onPrice(99.75) also took that TP
    const ev = b.replayBars('X', [bar(T, 100, 100.6, 99.7, 100.55)]);
    expect(ev.map((e) => e.kind)).toEqual(['limit_fill', 'limit_fill', 'sl']);
    expect(b.state.positions.map((p) => `${p.side}:${p.setup}`)).toEqual(['short:RANGE_SHORT']);
    expect(b.state.fills.map((f) => `${f.side}@${f.exit} ${f.reason}`)).toEqual(['long@99.75 손절 SL']);
  });

  it('other positions whose own stops are in the bar are still stopped (by the path)', () => {
    const b = new PaperBroker();
    b.slip = 0;
    b.open({ symbol: 'X', side: 'short', qty: 1, price: 100, leverage: 10, sl: 100.58, targets: [{ price: 95, fraction: 1, label: 'TP' }], setup: 'MANUAL' }, T - 10 * M);
    b.placeLimit({ symbol: 'X', side: 'long', qty: 1, price: 99.8, leverage: 10, sl: 99.75, targets: [{ price: 103, fraction: 1, label: 'TP' }], setup: 'MANUAL' }, T - M);
    b.replayBars('X', [bar(T, 100, 100.6, 99.7, 100.55)]);
    expect(b.state.positions.length).toBe(0);
    expect(b.state.fills.map((f) => `${f.side}@${f.exit}`).sort()).toEqual(['long@99.75', 'short@100.58']);
  });
});
