import { describe, expect, it } from 'vitest';
import { computeLevels, netRMultiple } from '@bitget-sim/dupont';
import { PaperBroker, feeBreakeven, sizeAdd, realizedRSince, TAKER_FEE, MAKER_FEE, DEFAULT_BANKROLL, SLIP, FUNDING_INTERVAL_MS, tradeStats, fillsToCsv } from './broker';
import { toBrokerTargets } from './fromSignal';

const closeTo = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);
const box = { top: '110', bottom: '100', mid: '105' };

describe('paper broker (USDT-M, Bitget swap fees)', () => {
  it('starts with a 200 USDT bankroll and Bitget taker/maker fees', () => {
    expect(DEFAULT_BANKROLL).toBe(200);
    expect(new PaperBroker().state.wallet).toBe(200);
    expect(TAKER_FEE).toBe(0.0006);
    expect(MAKER_FEE).toBe(0.0002);
  });

  it('range trade: TP1 closes 50% at midline, SL→breakeven, TP2 closes the rest; PnL net of fees', () => {
    const lv = computeLevels({ side: 'long', kind: 'range', entry: '101', extremeWick: '100', box });
    const targets = toBrokerTargets(lv.targets);
    expect(targets.map((t) => [t.price, t.fraction])).toEqual([[105, 0.5], [110, 0.5]]);
    const b = new PaperBroker();
    b.slip = 0;
    const sl = Number(lv.sl);
    expect(b.open({ symbol: 'BTCUSDT', side: 'long', qty: 1, price: 101, leverage: 10, sl, targets, setup: 'RANGE_LONG' }).ok).toBe(true);
    b.onPrice('BTCUSDT', 105.1);
    const p = b.state.positions[0];
    closeTo(p.qty, 0.5);
    // breakeven covers the leftover entry fee + taker exit fee, rounded outward to the tick
    expect(p.beMoved).toBe(true);
    expect(p.sl).toBe(feeBreakeven(p, 2, TAKER_FEE + b.slip));
    expect(p.sl).toBeGreaterThan(101);
    expect((p.sl - 101) * p.qty - p.entryFeeLeft - p.sl * p.qty * TAKER_FEE).toBeGreaterThanOrEqual(0);
    b.onPrice('BTCUSDT', 110.2);
    expect(b.state.positions.length).toBe(0);
    const expected = -101 * TAKER_FEE + (4 * 0.5 - 105 * 0.5 * TAKER_FEE) + (9 * 0.5 - 110 * 0.5 * TAKER_FEE);
    closeTo(b.state.fills.reduce((s, f) => s + f.netPnl, 0), expected);
    closeTo(b.state.wallet, 200 + expected);
    expect(tradeStats(b.state.fills)).toMatchObject({ trades: 1, wins: 1, winRate: 1 });
    expect(fillsToCsv(b.state.fills).split('\n').length).toBe(3);
  });

  it('breakout trade: single NET 1:3 target closes 100%; stop-loss closes at SL', () => {
    const lv = computeLevels({ side: 'short', kind: 'breakout', entry: '98', extremeWick: '99.95', box });
    const t = toBrokerTargets(lv.targets);
    expect(t.length).toBe(1);
    expect(t[0].fraction).toBe(1);
    const sl = Number(lv.sl);
    closeTo(netRMultiple({ side: 'short', entry: 98, sl, tp: t[0].price }), 3, 1e-9);
    const b = new PaperBroker();
    b.open({ symbol: 'ETHUSDT', side: 'short', qty: 2, price: 98, leverage: 5, sl, targets: t, setup: 'BREAKOUT_SHORT' });
    b.onPrice('ETHUSDT', t[0].price - 0.01);
    expect(b.state.positions.length).toBe(0);
    const b2 = new PaperBroker();
    b2.slip = 0;
    b2.open({ symbol: 'BTCUSDT', side: 'long', qty: 1, price: 101, leverage: 10, sl: 99.8, targets: t, setup: 'MANUAL' });
    b2.onPrice('BTCUSDT', 99.8);
    expect(b2.state.fills[0].reason).toContain('SL');
    closeTo(b2.state.fills[0].netPnl, -1.2 - 101 * TAKER_FEE - 99.8 * TAKER_FEE);
    // gap through the stop: stop-market fills at the worse traded price, not the trigger
    const b3 = new PaperBroker();
    b3.slip = 0;
    b3.open({ symbol: 'BTCUSDT', side: 'long', qty: 1, price: 101, leverage: 10, sl: 99.8, targets: t, setup: 'MANUAL' });
    b3.onPrice('BTCUSDT', 99.5);
    closeTo(b3.state.fills[0].exit, 99.5);
    closeTo(b3.state.fills[0].netPnl, -1.5 - 101 * TAKER_FEE - 99.5 * TAKER_FEE);
  });

  it('limit orders fill at maker fee; insufficient margin is rejected; adds average the entry', () => {
    const b = new PaperBroker();
    b.slip = 0;
    b.placeLimit({ symbol: 'BTCUSDT', side: 'long', qty: 1, price: 100, leverage: 10, sl: 98, targets: [], setup: 'MANUAL' });
    b.onPrice('BTCUSDT', 100.5);
    expect(b.state.positions.length).toBe(0);
    b.onPrice('BTCUSDT', 99.9);
    closeTo(200 - b.state.wallet, 100 * MAKER_FEE);
    expect(b.open({ symbol: 'ETHUSDT', side: 'long', qty: 100, price: 100, leverage: 2, sl: 90, targets: [], setup: 'MANUAL' }).ok).toBe(false);
    // A2: a same-side open without isAdd is rejected (no silent merge that drops the new SL/targets)
    const dup = b.open({ symbol: 'BTCUSDT', side: 'long', qty: 1, price: 102, leverage: 10, sl: 99, targets: [], setup: 'MANUAL' });
    expect(dup.ok).toBe(false);
    expect(b.state.positions[0].adds).toBe(0);
    // explicit pyramid add: averages the entry, never loosens the stop, records the retest candle
    b.open({ symbol: 'BTCUSDT', side: 'long', qty: 1, price: 102, leverage: 10, sl: 97, targets: [], setup: 'MANUAL', isAdd: true, candleTs: 123 });
    expect(b.state.positions[0].adds).toBe(1);
    closeTo(b.state.positions[0].entry, 101);
    expect(b.state.positions[0].sl).toBe(98);
    expect(b.state.positions[0].lastAddTs).toBe(123);
  });

  it('short breakeven is below entry by the round-trip fees and persists through JSON', () => {
    const b = new PaperBroker();
    b.slip = 0;
    b.open({ symbol: 'BTCUSDT', side: 'short', qty: 0.01, price: 85000, leverage: 10, sl: 85500, targets: [{ price: 84500, fraction: 0.5, label: 'TP1' }, { price: 84000, fraction: 0.5, label: 'TP2' }], setup: 'RANGE_SHORT' });
    b.precision = () => ({ dp: 1, qdp: 4 });
    b.onPrice('BTCUSDT', 84490);
    const p = b.state.positions[0];
    expect(p.sl).toBeLessThan(85000);
    expect((85000 - p.sl) * p.qty - p.entryFeeLeft - p.sl * p.qty * TAKER_FEE).toBeGreaterThanOrEqual(0);
    expect(Math.abs(p.sl * 10 - Math.round(p.sl * 10))).toBeLessThan(1e-6); // on the 0.1 tick
    const re = new PaperBroker(JSON.parse(JSON.stringify(b.state)));
    expect(re.state.positions[0]).toEqual(p);
    expect(re.state.wallet).toBe(b.state.wallet);
  });

  it('C2: slippage worsens market entries, manual closes and stop fills (not TP / limit fills)', () => {
    const b = new PaperBroker();
    const r = b.open({ symbol: 'BTCUSDT', side: 'long', qty: 0.01, price: 60000, refPx: 60000.1, leverage: 10, sl: 59000, targets: [{ price: 61000, fraction: 1, label: 'TP' }], setup: 'MANUAL' });
    closeTo(r.fillPx!, 60000.1 * (1 + SLIP), 1e-6);
    b.onPrice('BTCUSDT', 58990);
    closeTo(b.state.fills[0].exit, 58990 * (1 - SLIP), 1e-6);
    const s = new PaperBroker();
    s.open({ symbol: 'BTCUSDT', side: 'short', qty: 0.01, price: 60000, leverage: 10, sl: 61000, targets: [{ price: 59000, fraction: 1, label: 'TP' }], setup: 'MANUAL' });
    closeTo(s.state.positions[0].entry, 60000 * (1 - SLIP), 1e-6);
    s.onPrice('BTCUSDT', 58999);
    expect(s.state.fills[0].exit).toBe(59000); // TP at its price
    const m = new PaperBroker();
    m.open({ symbol: 'BTCUSDT', side: 'long', qty: 0.01, price: 60000, leverage: 10, sl: 59000, targets: [], setup: 'MANUAL' });
    m.closeFraction(m.state.positions[0].id, 1, 60500, 'manual');
    closeTo(m.state.fills[0].exit, 60500 * (1 - SLIP), 1e-6);
  });

  it('C5: SL beyond the liquidation price is rejected; liquidation is checked on mark', () => {
    const b = new PaperBroker();
    b.slip = 0;
    // 20x long @100: liq = 100 × (1 − 0.05 + 0.005) = 95.5
    expect(b.open({ symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 20, sl: 95, targets: [], setup: 'MANUAL' }).ok).toBe(false);
    expect(b.open({ symbol: 'X', side: 'long', qty: 1, price: 100, leverage: 20, sl: 96, targets: [], setup: 'MANUAL' }).ok).toBe(true);
    b.state.positions[0].sl = 90; // simulate a stale stop below liq
    b.onPrice('X', 96.5, Date.now(), 95.4); // last above liq, mark below → liquidated
    expect(b.state.fills[0].reason).toBe('강제청산');
  });

  it('C4: partial TP qty is floored to the step; a remainder under 5 USDT closes everything', () => {
    const b = new PaperBroker();
    b.slip = 0;
    b.precision = () => ({ dp: 1, qdp: 4 });
    b.open({ symbol: 'BTCUSDT', side: 'long', qty: 0.0007, price: 60000, leverage: 10, sl: 59000, targets: [{ price: 60500, fraction: 0.5, label: 'TP1' }, { price: 61000, fraction: 0.5, label: 'TP2' }], setup: 'RANGE_LONG' });
    b.onPrice('BTCUSDT', 60500);
    expect(b.state.fills[0].qty).toBe(0.0003); // floor(0.00035) on the 0.0001 step
    closeTo(b.state.positions[0].qty, 0.0004, 1e-12);
    const c = new PaperBroker();
    c.slip = 0;
    c.precision = () => ({ dp: 1, qdp: 4 });
    c.open({ symbol: 'BTCUSDT', side: 'long', qty: 0.0002, price: 60000, leverage: 10, sl: 59000, targets: [{ price: 60500, fraction: 0.5, label: 'TP1' }, { price: 61000, fraction: 0.5, label: 'TP2' }], setup: 'RANGE_LONG' });
    c.onPrice('BTCUSDT', 60500); // remainder 0.0001 × 60500 = 6.05 ≥ 5 → partial
    expect(c.state.fills[0].qty).toBe(0.0001);
    const d = new PaperBroker();
    d.slip = 0;
    d.precision = () => ({ dp: 2, qdp: 2 });
    d.open({ symbol: 'ETHUSDT', side: 'long', qty: 0.03, price: 300, leverage: 10, sl: 290, targets: [{ price: 310, fraction: 0.5, label: 'TP1' }, { price: 320, fraction: 0.5, label: 'TP2' }], setup: 'RANGE_LONG' });
    d.onPrice('ETHUSDT', 310); // floor(0.015)=0.01 → remainder 0.02 × 310 = 6.2 ok
    expect(d.state.fills[0].qty).toBe(0.01);
    d.closeFraction(d.state.positions[0].id, 0.5, 310, '50%'); // 0.01 leaves 0.01 × 310 = 3.1 < 5 → closes all
    expect(d.state.positions.length).toBe(0);
  });

  it('C3: funding is charged once per 00/08/16 UTC crossing, long pays a positive rate', () => {
    const t0 = Date.UTC(2026, 9, 6, 7, 0); // 07:00 UTC
    const b = new PaperBroker();
    b.slip = 0;
    b.open({ symbol: 'BTCUSDT', side: 'long', qty: 0.01, price: 60000, leverage: 10, sl: 59000, targets: [], setup: 'MANUAL' }, t0);
    b.open({ symbol: 'BTCUSDT', side: 'short', qty: 0.01, price: 60000, leverage: 10, sl: 61000, targets: [], setup: 'MANUAL' }, t0);
    const w0 = b.state.wallet;
    expect(b.accrueFunding('BTCUSDT', 0.0001, 60000, t0 + 30 * 60_000)).toEqual([]); // 07:30 – no boundary
    const ev = b.accrueFunding('BTCUSDT', 0.0001, 60000, Date.UTC(2026, 9, 6, 8, 0, 1));
    expect(ev.length).toBe(2);
    const [L, S] = b.state.positions;
    closeTo(L.fundingAcc!, 0.06, 1e-12); // 0.01 × 60000 × 0.0001
    closeTo(S.fundingAcc!, -0.06, 1e-12);
    closeTo(b.state.wallet, w0, 1e-12); // long pays, short receives
    expect(b.accrueFunding('BTCUSDT', 0.0001, 60000, Date.UTC(2026, 9, 6, 15, 59))).toEqual([]); // same window again → nothing
    b.accrueFunding('BTCUSDT', 0.0001, 60000, Date.UTC(2026, 9, 7, 0, 0)); // 16:00 + 00:00 → two more
    closeTo(L.fundingAcc!, 0.18, 1e-12);
    // attributed to the closing fill and included in its net PnL
    b.close(L.id, L.qty, 60000, 'x', Date.UTC(2026, 9, 7, 1));
    const f = b.state.fills[0];
    closeTo(f.funding!, 0.18, 1e-12);
    closeTo(f.netPnl, -0.36 - 0.36 - 0.18, 1e-9); // entry fee + exit fee + funding
    expect(FUNDING_INTERVAL_MS).toBe(8 * 3_600_000);
  });

  it('C9: R accounting — TP1 then breakeven stop ends at about +0.5 × R1 net', () => {
    const b = new PaperBroker();
    b.precision = () => ({ dp: 2, qdp: 3 });
    b.open({ symbol: 'X', side: 'long', qty: 10, price: 100, leverage: 10, sl: 99, targets: [{ price: 102, fraction: 0.5, label: 'TP1' }, { price: 104, fraction: 0.5, label: 'TP2' }], setup: 'RANGE_LONG' });
    b.onPrice('X', 102); // TP1 50%, SL → fee breakeven
    const be = b.state.positions[0].sl;
    b.onPrice('X', be - 0.001); // BE stop (with slippage)
    expect(b.state.positions.length).toBe(0);
    const st = tradeStats(b.state.fills);
    const r1 = netRMultiple({ side: 'long', entry: 100, sl: 99, tp: 102, slippageBps: 2 });
    expect(st.rTrades).toBe(1);
    expect(Math.abs(st.avgR - 0.5 * r1)).toBeLessThan(0.05);
    expect(b.state.fills[1].netPnl).toBeGreaterThan(-0.02); // BE leg ≈ flat after fees + slippage
    expect(st.expectancyR).toBeCloseTo(st.avgR, 12);
    expect(realizedRSince(b.state.fills, 0)).toBeCloseTo(st.avgR, 12);
    expect(fillsToCsv(b.state.fills).split('\n')[0]).toContain(',r,');
  });

  it('A3: an add never loosens the SL and the combined loss at SL stays within the risk budget', () => {
    const pos = { side: 'long' as const, qty: 0.002, entry: 60000, sl: 59400, entryFeeLeft: 0.002 * 60000 * TAKER_FEE };
    // suggestion below the current stop is ignored (no loosening)
    const loose = sizeAdd(pos, { last: 60600, suggestedSl: 59000, budget: 2, wantQty: 0.001, step: 0.0001 });
    expect(loose.newSl).toBe(59400);
    // tighter suggestion is taken; qty is cut until the combined loss ≤ budget
    const r = sizeAdd(pos, { last: 60600, suggestedSl: 60100, budget: 2, wantQty: 0.01, step: 0.0001 });
    expect(r.qty).toBeGreaterThan(0);
    expect(r.qty).toBeLessThan(0.01);
    expect(r.newSl).toBe(60100);
    expect(r.lossAtSl).toBeLessThanOrEqual(2 + 1e-9);
    const bigger = sizeAdd(pos, { last: 60600, suggestedSl: 60100, budget: 2, wantQty: r.qty + 0.0001, step: 0.0001 });
    expect(bigger.qty).toBe(r.qty);
    // budget already used by the open position → nothing fits
    expect(sizeAdd(pos, { last: 60600, budget: 1, wantQty: 0.001, step: 0.0001 }).qty).toBe(0);
  });
});
