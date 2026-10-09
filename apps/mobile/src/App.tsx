import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computeLevels, netRMultiple, pressureFlipAlertDetail, pyramidSuggestion, sizePosition, type Signal, type SignalType } from '@bitget-sim/dupont';
import Chart from './components/Chart';
import OrderBook from './components/OrderBook';
import { Btn, Card, Chips, NumField, Row, Toggle } from './components/ui';
import { fetchFundingHistory, fetchMinuteBars, fetchTicker } from './data/bitget';
import { useMarket } from './useMarket';
import { useDupont, type ManualBox } from './useDupont';
import { PaperBroker, DEFAULT_BANKROLL, TAKER_FEE, MAKER_FEE, SLIP, SLIPPAGE_BPS, tradeStats, realizedRSince, fillsToCsv, upnl, sizeAdd, type PaperPosition, type Side, type Target } from './paper/broker';
import { noBoxBreakoutDraft, toBrokerTargets } from './paper/fromSignal';
import { DEFAULT_SETTINGS, load, loadRaw, save, type Settings } from './lib/storage';
import { SYMBOLS, TIMEFRAMES, symInfo, floorQty, MIN_NOTIONAL_USDT } from './lib/symbols';
import { fmt, mdhm, pct, signed } from './lib/format';
import { ReplayGate, replayFrom } from './lib/replayGate';

const TABS = ['차트', '거래', '포지션', '기록', '설정'] as const;
type Tab = (typeof TABS)[number];
const TYPE_KO: Record<SignalType, string> = {
  RANGE_LONG: '박스 반전 롱', RANGE_SHORT: '박스 반전 숏',
  FAKE_BREAKOUT_LONG: '가짜 이탈 롱', FAKE_BREAKOUT_SHORT: '가짜 돌파 숏',
  BREAKOUT_LONG: '진짜 돌파 롱', BREAKOUT_SHORT: '진짜 이탈 숏',
};
const setupKo = (s: string) => (s === 'MANUAL' ? '수동' : TYPE_KO[s as SignalType] ?? s);
const K_BROKER = 'dupont.broker.v1', K_SET = 'dupont.settings.v1', K_SEEN = 'dupont.seen.v1';

function pyrKo(r: { add: boolean; reason: string; level?: string }, dp: number): string {
  const lv = r.level ? fmt(r.level, dp) : '';
  if (r.add) return `돌파 레벨 ${lv} 리테스트 확인 – 추가 진입 가능`;
  if (r.reason.startsWith('max adds')) return '최대 추가 횟수 도달';
  if (r.reason.startsWith('no retest')) return `돌파 레벨 ${lv} 리테스트 대기`;
  if (r.reason.startsWith('retest without')) return `리테스트 중 – 장악형/압력 확인 대기`;
  if (r.reason.startsWith('no broken')) return '돌파 레벨 정보 없음';
  if (r.reason.startsWith('pyramiding only')) return '돌파 포지션에서만 사용';
  if (r.reason.startsWith('retest must be')) return '진입/직전 추가 이후의 새 캔들에서 리테스트 대기';
  if (r.reason.startsWith('no move away')) return `돌파 레벨 ${lv}에서 0.5R 이상 이탈 후 리테스트 대기`;
  return '데이터 부족';
}

interface Draft { side: Side; sl: string; tp1: string; tp2: string; kind: 'range' | 'breakout'; signal?: Signal }

export default function App() {
  const [tab, setTab] = useState<Tab>('차트');
  const [s, setS] = useState<Settings>(() => load(K_SET, DEFAULT_SETTINGS));
  const set = (patch: Partial<Settings>) => setS((p) => { const n = { ...p, ...patch }; save(K_SET, n); return n; });
  const info = symInfo(s.symbol);
  const mkt = useMarket(s.symbol, s.tf);
  const [manual, setManual] = useState<ManualBox | null>(() => loadRaw<ManualBox>(`dupont.box.${s.symbol}`));
  useEffect(() => setManual(loadRaw<ManualBox>(`dupont.box.${s.symbol}`)), [s.symbol]);
  const [editBox, setEditBox] = useState(false);
  const dv = useDupont(mkt.candles, mkt.intervalMs, mkt.tape, mkt.tapeVer, mkt.serverNow, s, manual, info.dp);
  const tick = (10 ** -info.dp).toFixed(info.dp);

  // ---- paper broker ----
  const broker = useRef<PaperBroker>(null as any);
  if (!broker.current) broker.current = new PaperBroker(loadRaw(K_BROKER) ?? undefined);
  broker.current.moveSlToBe = s.moveSlToBe;
  broker.current.precision = (sym) => { const i = symInfo(sym); return { dp: i.dp, qdp: i.qdp }; };
  const [bv, setBv] = useState(0);
  const commit = () => { save(K_BROKER, broker.current.state); setBv((v) => v + 1); };
  const [toasts, setToasts] = useState<Array<{ id: number; text: string; tone: string }>>([]);
  const toast = useCallback((text: string, tone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-1), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    if (s.notify && 'Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
      try { new Notification('듀퐁 스탠다드', { body: text, icon: `${import.meta.env.BASE_URL}icons/icon.svg` }); } catch { /* ignore */ }
    }
  }, [s.notify]);

  const last = mkt.ticker?.last ?? mkt.candles[mkt.candles.length - 1]?.close ?? 0;
  const [marks, setMarks] = useState<Record<string, number>>({});
  useEffect(() => { if (last) setMarks((m) => ({ ...m, [s.symbol]: last })); }, [last, s.symbol]);

  // ---- funding (N5 / owner decision 3): settled rate from Bitget history, fallback = last ticker rate seen BEFORE the boundary ----
  const FUNDING_WAIT_MS = 180_000; // live: wait up to 3 min after a boundary for the settled rate to be published
  const fundSync = useRef<Record<string, number>>({});
  const syncFunding = async (sym: string, force = false) => {
    const now = Date.now(); // request throttle only (not a broker timestamp) — the phone clock is fine here
    if (!force && now - (fundSync.current[sym] ?? 0) < 30_000) return;
    fundSync.current[sym] = now;
    const h = await fetchFundingHistory(sym).catch(() => null);
    if (h?.length) { broker.current.setSettledRates(sym, h); save(K_BROKER, broker.current.state); }
  };
  // ---- N1 offline replay + R1 gate: on open / resume (and on any tick that finds a gap), replay 1m bars (incl. the forming one)
  // since the last processed price; live ticks never jump an offline gap (lib/replayGate.ts) ----
  const gate = useRef(new ReplayGate());
  /** one live price for `sym`: triggers, then funding for crossed boundaries, then remember the ticker rate */
  const liveTick = (sym: string, price: number, mark: number | undefined, rate: number | undefined) => {
    const g = gate.current.tick(broker.current.state, sym, mkt.serverNow()); // Z1: one (server) clock for every broker / gate timestamp
    if (g === 'replaying') return [];
    if (g === 'gap') { void runReplay(); return []; } // never jump an offline gap with a live price
    const now = mkt.serverNow(); // onPrice / needsSettledRate / accrueFunding / noteTickerRate
    const ev = broker.current.onPrice(sym, price, now, mark);
    if (broker.current.needsSettledRate(sym, now)) void syncFunding(sym);
    ev.push(...broker.current.accrueFunding(sym, mark || price, now, FUNDING_WAIT_MS));
    if (rate !== undefined) broker.current.noteTickerRate(sym, rate, now);
    return ev;
  };
  const runReplay = async () => {
    const b = broker.current;
    const syms = gate.current.begin(b.state, mkt.serverNow()); // gates ALL of them before the first await
    // Z1: measure the server clock before stamping anything (a cold start has no trade-based offset yet)
    if (syms.length) await mkt.syncClock();
    for (const sym of syms) {
      try {
        await syncFunding(sym, true);
        const now = mkt.serverNow();
        const start = Math.floor(replayFrom(b.state, sym) / 60_000) * 60_000;
        const { bars, clampedFrom } = await fetchMinuteBars(sym, start, now);
        // Q1: a long replay can run into the next minute — top up the tail so no minute up to "now" is skipped
        const end = mkt.serverNow();
        if (Math.floor(end / 60_000) > Math.floor(now / 60_000)) {
          const tail = await fetchMinuteBars(sym, Math.floor(now / 60_000) * 60_000, end);
          const byTs = new Map(bars.map((c) => [c.ts, c]));
          for (const c of tail.bars) byTs.set(c.ts, c);
          bars.splice(0, bars.length, ...[...byTs.values()].sort((x, y) => x.ts - y.ts));
        }
        // Q1: include the still-forming minute (Bitget returns it with its high/low so far): the time between the
        // last closed bar and the end of the replay must not be skipped (live ticks were refused meanwhile)
        const ev = b.replayBars(sym, bars.filter((c) => c.ts >= start), mkt.serverNow());
        // only the last 2 toasts stay visible: fold long funding runs into one line, show the clamp warning last
        const fund = ev.filter((e) => e.kind === 'funding');
        (fund.length > 2 ? ev.filter((e) => e.kind !== 'funding') : ev).forEach((e) => toast(`[재생] ${sym} ${e.message}`, e.kind === 'sl' || e.kind === 'liq' ? 'down' : e.kind === 'funding' ? 'info' : 'up'));
        if (fund.length > 2) toast(`[재생] ${sym} 펀딩비 ${fund.length}회 반영 (마지막: ${fund[fund.length - 1].message})`, 'info');
        if (clampedFrom > start) toast(`[재생] ${sym} ${mdhm(start)}~${mdhm(clampedFrom)} 구간은 1분봉 제공 범위(30일) 밖 – 재생 생략`, 'warn');
        const lt = (b.state.lastTickTs ??= {});
        lt[sym] = Math.max(lt[sym] ?? 0, mkt.serverNow()); // gap closed (forming minute replayed up to now, Q1); live continues
        gate.current.succeeded(sym);
        commit();
      } catch {
        if (gate.current.failed(sym, mkt.serverNow())) toast(`[재생] ${sym} 1분봉 조회 3회 실패 – 현재가로 계속 (오프라인 구간 미반영)`, 'down');
      } finally {
        gate.current.release(sym);
      }
    }
  };
  useEffect(() => {
    void runReplay();
    const onVis = () => { if (document.visibilityState === 'visible') void runReplay(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // tick-driven SL/TP/limit triggers for the active symbol
  useEffect(() => {
    if (!last || gate.current.replaying.has(s.symbol)) return;
    const ev = liveTick(s.symbol, last, mkt.ticker?.mark, mkt.ticker?.funding);
    if (ev.length) { ev.forEach((e) => toast(e.message, e.kind === 'sl' || e.kind === 'liq' ? 'down' : e.kind === 'funding' ? 'info' : 'up')); commit(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last]);
  // other symbols with open positions / orders: REST poll
  useEffect(() => {
    const iv = setInterval(async () => {
      const syms = new Set([...broker.current.state.positions.map((p) => p.symbol), ...broker.current.state.pending.map((o) => o.symbol)]);
      syms.delete(s.symbol);
      for (const sym of syms) {
        if (gate.current.replaying.has(sym)) continue;
        const t = await fetchTicker(sym).catch(() => null);
        if (!t) continue;
        setMarks((m) => ({ ...m, [sym]: t.last }));
        const ev = liveTick(sym, t.last, t.mark, t.funding);
        if (ev.length) { ev.forEach((e) => toast(`${sym} ${e.message}`)); commit(); }
      }
    }, 4000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.symbol]);

  const st = broker.current.state;
  const equity = broker.current.equity(marks);
  const available = broker.current.available();
  const myPositions = st.positions.filter((p) => p.symbol === s.symbol);

  // ---- signals ----
  const seen = useRef<Set<string>>(new Set(loadRaw<string[]>(K_SEEN) ?? []));
  const sigId = (g: Signal) => `${s.symbol}:${s.tf}:${g.type}:${g.ts}`;
  const latest = dv.live[dv.live.length - 1] ?? null;
  const lastClosedTs = dv.closed[dv.closed.length - 1]?.ts ?? 0;
  /** why a signal can no longer be taken (B4): not on the latest closed candle, or price moved > 0.3R from its entry */
  const staleWhy = (g: Signal): string | null =>
    g.ts < lastClosedTs ? '신호 만료 (최근 마감 캔들 아님)' : Math.abs(last - Number(g.entry)) > 0.3 * Number(g.risk) ? '가격 이탈 (신호 진입가 ±0.3R 초과)' : null;
  /** market reference: ask for longs / bid for shorts when the ticker has them (close to last) */
  const refPx = (side: Side) => {
    const x = side === 'long' ? mkt.ticker?.ask : mkt.ticker?.bid;
    return x && last && Math.abs(x - last) / last < 0.005 ? x : last;
  };
  const recentSignal = useMemo(() => {
    const cutoff = (dv.closed[dv.closed.length - 3]?.ts ?? 0);
    const h = [...dv.history].reverse().find((g) => g.ts >= cutoff);
    return latest ?? h ?? null;
  }, [latest, dv.history, dv.closed]);

  /** A3 / owner decision 5: the position's risk budget, fixed at entry = wallet × risk% at open */
  const riskBudgetNow = () => (st.wallet * s.riskPct) / 100;
  // risk on REALIZED equity (wallet, no unrealized PnL); margin cap on available incl. entry fee; slippage + exchange minimums inside sizing
  const sizeFor = (entry: number, sl: number) =>
    sizePosition({
      equity: String(st.wallet), available: String(available), riskPct: s.riskPct, entry: String(entry), sl: String(sl), leverage: s.leverage,
      feeRate: String(TAKER_FEE), slippageBps: SLIPPAGE_BPS, qtyStep: String(info.qtyStep), minQty: String(info.qtyStep), minNotional: MIN_NOTIONAL_USDT,
    });

  const enterSignal = (g: Signal, auto = false) => {
    if (st.positions.some((p) => p.symbol === s.symbol)) { toast('이미 포지션 보유 중', 'down'); return; }
    const price = last;
    const why = staleWhy(g);
    if (why) { toast(`${why} – 진입 불가`, 'down'); return; }
    // re-anchor targets to the live entry (same SL); breakout TP stays NET 1:3 from the live price
    const lv = computeLevels({ side: g.side, kind: g.kind, entry: String(price), extremeWick: g.sl, box: g.box, slBufferPct: 0, tickSize: tick, feeRate: TAKER_FEE, slippageBps: SLIPPAGE_BPS });
    if (g.kind === 'range' && netRMultiple({ side: g.side, entry: lv.entry, sl: lv.sl, tp: lv.targets[0].price, feeRate: TAKER_FEE, slippageBps: SLIPPAGE_BPS }) < 1) {
      toast('현재가 기준 TP1 순손익비 1 미만 – 진입 생략', 'down'); return;
    }
    const sl = Number(lv.sl);
    const targets = toBrokerTargets(lv.targets);
    const long = g.side === 'long';
    if (long ? !(sl < price && targets[0].price > price) : !(sl > price && targets[0].price < price)) {
      toast('현재가가 신호 범위를 벗어나 진입 불가 (SL/TP1 사이 아님)', 'down');
      return;
    }
    const sz = sizeFor(price, sl);
    const qty = Number(sz.qty);
    if (sz.belowMin || !(qty > 0)) { toast(`리스크 ${s.riskPct}% 기준 수량이 최소 주문(${MIN_NOTIONAL_USDT} USDT / ${info.qtyStep}) 미만`, 'down'); return; }
    const r = broker.current.open({
      symbol: s.symbol, side: g.side, qty, price, refPx: refPx(g.side), leverage: s.leverage, sl, targets, setup: g.type, signalId: sigId(g),
      breakoutLevel: g.kind === 'breakout' ? Number(long ? g.box.top : g.box.bottom) : undefined, riskBudget: riskBudgetNow(),
    }, mkt.serverNow());
    if (!r.ok) { toast(r.error ?? '진입 실패', 'down'); return; }
    seen.current.add(sigId(g)); save(K_SEEN, [...seen.current].slice(-300));
    toast(`${auto ? '[자동] ' : ''}${TYPE_KO[g.type]} 모의 진입 ${fmt(qty, info.qdp)} @ ${fmt(r.fillPx ?? price, info.dp)}`, 'up');
    commit();
  };

  /** auto-paper gate (C8): pause 2 bars after a losing trade on this symbol; daily stop at −3R (local day) */
  const autoGate = (g: Signal): string | null => {
    const finals = st.fills.filter((f) => f.final && f.symbol === s.symbol);
    const lastFinal = finals[finals.length - 1];
    if (lastFinal) {
      const net = st.fills.filter((f) => f.positionId === lastFinal.positionId).reduce((a, f) => a + f.netPnl, 0);
      const lossBar = Math.floor(lastFinal.closedAt / mkt.intervalMs) * mkt.intervalMs;
      if (net < 0 && g.ts <= lossBar + 2 * mkt.intervalMs) return '손실 후 2봉 대기';
    }
    const day0 = new Date(mkt.serverNow()); day0.setHours(0, 0, 0, 0); // Z1: local day of the server instant (fills are server-stamped)
    if (realizedRSince(st.fills, day0.getTime()) <= -3) return '일일 손실 한도 −3R 도달';
    return null;
  };

  // new-signal notification + optional auto-paper (default OFF)
  useEffect(() => {
    if (!latest) return;
    const id = sigId(latest);
    if (seen.current.has(`n:${id}`)) return;
    seen.current.add(`n:${id}`); save(K_SEEN, [...seen.current].slice(-300));
    toast(`신호: ${TYPE_KO[latest.type]} · SL ${fmt(latest.sl, info.dp)} · ${latest.targets.map((x) => `${x.label} ${fmt(x.price, info.dp)}`).join(' / ')}`, latest.side === 'long' ? 'up' : 'down');
    if (s.autoPaper && !myPositions.length) {
      // owner decision 7 / B3: auto-paper only acts on real trade-tape pressure
      const gate = latest.pressure.source !== 'trades' ? '압력이 OHLCV 근사' : autoGate(latest);
      if (gate) toast(`[자동] 진입 생략 – ${gate}`, 'info');
      else enterSignal(latest, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latest?.ts, latest?.type]);

  // ---- flip alert & pyramiding for active-symbol positions ----
  const mgmt = useMemo(() => myPositions.map((p) => {
    // closed candles only (B7): absorption is judged on a finished bar with real tape pressure
    const closedP = dv.pressures.slice(0, dv.closed.length);
    const flip = pressureFlipAlertDetail(
      { side: p.side, entry: p.entry, sl: p.sl, targets: p.targets.filter((t) => !t.done).map((t) => ({ price: t.price })) },
      dv.closed, closedP
    );
    const pyr = p.setup.startsWith('BREAKOUT')
      ? pyramidSuggestion({
          side: p.side, entry: p.entry, sl: p.initialSl, targets: p.targets.map((t) => ({ price: t.price })), type: p.setup as SignalType, adds: p.adds, brokenLevel: p.breakoutLevel,
          openedTs: Math.floor(p.openedAt / mkt.intervalMs) * mkt.intervalMs, lastAddTs: p.lastAddTs, risk: Math.abs((p.initialEntry ?? p.entry) - p.initialSl),
        }, dv.closed, closedP, dv.box, { maxAdds: s.maxAdds, addSizePct: s.addSizePct, tickSize: tick, atr: dv.signalBox?.atr ?? dv.box?.atr })
      : null;
    return { p, flip, pyr };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [bv, dv.closed, dv.pressures, dv.box, dv.signalBox, s.maxAdds, s.addSizePct, s.symbol, mkt.intervalMs]);
  const flipSeen = useRef(new Set<string>());
  useEffect(() => {
    for (const m of mgmt) {
      const key = `${m.p.id}:${lastClosedTs}`;
      if (m.flip.alert && !flipSeen.current.has(key)) { flipSeen.current.add(key); toast(`압력 반전 – 청산 권고 (${m.flip.multiple.toFixed(1)}배)`, 'warn'); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mgmt]);

  const closePos = (p: PaperPosition, frac: number, why: string) => {
    const f = broker.current.closeFraction(p.id, frac, marks[p.symbol] ?? last, why, mkt.serverNow());
    if (f) toast(`${why} ${fmt(f.qty, symInfo(p.symbol).qdp)} @ ${fmt(f.exit, symInfo(p.symbol).dp)} · 순손익 ${signed(f.netPnl)} USDT`, f.netPnl >= 0 ? 'up' : 'down');
    commit();
  };
  const addOn = (p: PaperPosition, sug: { sl?: string; sizePct?: number }) => {
    // N6: base the add on the real first fill (adds may have been risk-capped below addSizePct)
    const initial = p.initialQty ?? p.origQty / (1 + p.adds * (s.addSizePct / 100));
    // combined loss at the (never loosened) SL must stay within the budget FIXED AT ENTRY (A3 / owner decision 5)
    const budget = p.riskBudget ?? (st.wallet * s.riskPct) / 100;
    const a = sizeAdd(p, { last: refPx(p.side), suggestedSl: sug.sl ? Number(sug.sl) : undefined, budget, wantQty: (initial * (sug.sizePct ?? s.addSizePct)) / 100, step: info.qtyStep });
    if (!(a.qty > 0)) { toast('추가 시 총 리스크가 한도 초과', 'down'); return; }
    if (a.qty * last < MIN_NOTIONAL_USDT) { toast(`추가 수량이 최소 주문 금액(${MIN_NOTIONAL_USDT} USDT) 미만`, 'down'); return; }
    const r = broker.current.open({ symbol: p.symbol, side: p.side, qty: a.qty, price: last, refPx: refPx(p.side), leverage: p.leverage, sl: a.newSl, targets: [], setup: p.setup, isAdd: true, candleTs: lastClosedTs }, mkt.serverNow());
    if (!r.ok) { toast(r.error ?? '추가 실패', 'down'); return; }
    toast(`불타기 #${p.adds + 1}: ${fmt(a.qty, info.qdp)} @ ${fmt(r.fillPx ?? last, info.dp)} · SL ${fmt(a.newSl, info.dp)}`, 'up');
    commit();
  };

  // ---- trade draft ----
  const defaultDraft = useCallback((side: Side): Draft => {
    const c = dv.closed;
    const ext = c.length >= 2 ? (side === 'long' ? Math.min(c[c.length - 1].low, c[c.length - 2].low) : Math.max(c[c.length - 1].high, c[c.length - 2].high)) : last * (side === 'long' ? 0.995 : 1.005);
    const b = dv.box;
    const inside = b ? last < Number(b.top) && last > Number(b.bottom) : false;
    if (b) {
      const kind = inside ? 'range' : 'breakout';
      const wick = side === 'long' ? Math.min(ext, last * 0.999) : Math.max(ext, last * 1.001);
      const lv = computeLevels({ side, kind, entry: String(last), extremeWick: String(wick), box: b, atr: b.atr, tickSize: tick, feeRate: TAKER_FEE, slippageBps: SLIPPAGE_BPS });
      const r = (x?: string) => (x ? Number(x).toFixed(info.dp) : '');
      return { side, kind, sl: r(lv.sl), tp1: r(lv.targets[0]?.price), tp2: r(lv.targets[1]?.price) };
    }
    // N7: no box → still a NET 1:3 TP (owner decision 2)
    return { side, kind: 'breakout', ...noBoxBreakoutDraft(side, last, tick, info.dp), tp2: '' };
  }, [dv.closed, dv.box, last, info.dp, tick]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const openDraftFromSignal = (g: Signal) => {
    const r = (x?: string) => (x ? Number(x).toFixed(info.dp) : '');
    setDraft({ side: g.side, kind: g.kind, sl: r(g.sl), tp1: r(g.targets[0]?.price), tp2: r(g.targets[1]?.price), signal: g });
    setTab('거래');
  };

  const up = (mkt.ticker?.change24h ?? 0) >= 0;
  return (
    <div className="h-full flex flex-col pt-safe">
      <header className="px-3 pt-2 pb-1.5 border-b border-line">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <select value={s.symbol} onChange={(e) => set({ symbol: e.target.value })} className="bg-transparent text-[15px] font-semibold outline-none">
                {SYMBOLS.map((x) => <option key={x.symbol} value={x.symbol} className="bg-panel">{x.symbol}</option>)}
              </select>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-panel2 text-muted">무기한 · 모의</span>
              <span className={`w-2 h-2 rounded-full ${mkt.status === 'live' ? 'bg-up' : 'bg-warn'}`} title={mkt.status} />
            </div>
            <div className={`text-[26px] leading-8 font-semibold num ${up ? 'text-up' : 'text-down'}`}>{last ? fmt(last, info.dp) : '—'}</div>
          </div>
          <div className="text-right text-[11px] text-muted num leading-[18px]">
            <div>24h <span className={up ? 'text-up' : 'text-down'}>{mkt.ticker ? pct(mkt.ticker.change24h) : '—'}</span></div>
            <div>마크 {mkt.ticker ? fmt(mkt.ticker.mark, info.dp) : '—'}</div>
            <div>펀딩 {mkt.ticker ? `${(mkt.ticker.funding * 100).toFixed(4)}%` : '—'}</div>
          </div>
        </div>
      </header>
      {/* notifications live in their own row (in normal flow) so they never cover inputs or buttons */}
      {toasts.length > 0 && (
        <div className="px-3 py-1.5 space-y-1 border-b border-line bg-bg" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`text-[12px] leading-4 px-2.5 py-1.5 rounded-md ${t.tone === 'down' ? 'bg-down/20 text-down' : t.tone === 'up' ? 'bg-up/15 text-up' : t.tone === 'warn' ? 'bg-warn/20 text-warn' : 'bg-panel2 text-txt'}`}>{t.text}</div>
          ))}
        </div>
      )}

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {tab === '차트' && (
          <>
            <div className="flex items-center justify-between px-3 py-1.5 gap-2">
              <Chips items={TIMEFRAMES} value={s.tf as any} onChange={(v) => set({ tf: v })} />
              <button onClick={() => setEditBox((v) => !v)} className={`h-8 px-3 rounded-full text-xs ${editBox ? 'bg-warn text-bg font-semibold' : 'bg-panel2 text-muted'}`}>{editBox ? '편집 완료' : '박스 편집'}</button>
            </div>
            <div className="flex-1 min-h-0">
              {mkt.candles.length ? (
                <Chart viewKey={`${s.symbol}:${s.tf}`} candles={mkt.candles} pressures={dv.pressures} box={dv.box} signals={dv.history} positions={myPositions} dp={info.dp} showHist={s.showHist} editBox={editBox}
                  onBoxEdit={(top, bottom) => { const m = { top, bottom, startTs: manual?.startTs ?? dv.box?.startTime ?? mkt.serverNow(), locked: true }; setManual(m); save(`dupont.box.${s.symbol}`, m); }} />
              ) : <div className="p-6 text-muted text-sm">{mkt.err ? `데이터 오류: ${mkt.err}` : '캔들 불러오는 중…'}</div>}
            </div>
            <BoxBar box={dv.box} manual={manual} dp={info.dp} tape={dv.tapeCandles} onUnlock={() => { setManual(null); save(`dupont.box.${s.symbol}`, null); setEditBox(false); }}
              onEdit={(top, bottom) => { const m = { top, bottom, startTs: manual?.startTs ?? dv.box?.startTime ?? mkt.serverNow(), locked: true }; setManual(m); save(`dupont.box.${s.symbol}`, m); }} />
            {mgmt.filter((m) => m.flip.alert).map((m) => (
              <div key={m.p.id} className="mx-3 mb-2 rounded-lg bg-warn/15 border border-warn px-3 py-2 flex items-center justify-between">
                <span className="text-[13px] text-warn font-semibold">⚠ 압력 반전 – 청산 권고 ({m.flip.multiple.toFixed(1)}배)</span>
                <Btn tone="warn" className="h-9" onClick={() => closePos(m.p, 1, '압력반전 청산')}>청산</Btn>
              </div>
            ))}
            <SignalCard g={recentSignal} dp={info.dp} acted={recentSignal ? seen.current.has(sigId(recentSignal)) : false} stale={recentSignal ? staleWhy(recentSignal) : null} onEnter={() => recentSignal && enterSignal(recentSignal)} onEdit={() => recentSignal && openDraftFromSignal(recentSignal)} />
          </>
        )}

        {tab === '거래' && (
          <TradeTab
            key={s.symbol}
            s={s} set={set} last={last} dp={info.dp} book={mkt.book} equity={equity} available={available} qtyStep={info.qtyStep}
            draft={draft} setDraft={setDraft} defaultDraft={defaultDraft} sizeFor={sizeFor}
            onSubmit={(d, orderType, limitPrice, qty) => {
              const sl = Number(d.sl);
              const targets: Target[] = d.kind === 'breakout' || !d.tp2
                ? [{ price: Number(d.tp1), fraction: 1, label: d.kind === 'breakout' ? 'TP 1:3' : 'TP' }]
                : [{ price: Number(d.tp1), fraction: 0.5, label: 'TP1 중앙선' }, { price: Number(d.tp2), fraction: 0.5, label: 'TP2 반대편' }];
              const setup = d.signal?.type ?? 'MANUAL';
              const breakoutLevel = d.kind === 'breakout' && dv.box ? Number(d.side === 'long' ? dv.box.top : dv.box.bottom) : undefined;
              if (orderType === 'limit') {
                // R10: a limit on the wrong side of the market would be marketable (taker on Bitget) → refuse
                if (d.side === 'long' ? limitPrice >= last : limitPrice <= last) {
                  toast(`지정가가 현재가 ${d.side === 'long' ? '이상' : '이하'} – 즉시 체결되는 주문은 시장가로 넣으세요`, 'down');
                  return;
                }
                const r = broker.current.placeLimit({ symbol: s.symbol, side: d.side, qty, price: limitPrice, leverage: s.leverage, sl, targets, setup, breakoutLevel, riskBudget: riskBudgetNow() }, mkt.serverNow());
                toast(r.ok ? `지정가 ${d.side === 'long' ? '롱' : '숏'} 주문 ${fmt(qty, info.qdp)} @ ${fmt(limitPrice, info.dp)}` : r.error ?? '주문 실패', r.ok ? 'up' : 'down');
              } else {
                const r = broker.current.open({ symbol: s.symbol, side: d.side, qty, price: last, refPx: refPx(d.side), leverage: s.leverage, sl, targets, setup, breakoutLevel, signalId: d.signal ? sigId(d.signal) : undefined, riskBudget: riskBudgetNow() }, mkt.serverNow());
                toast(r.ok ? `${d.side === 'long' ? '롱' : '숏'} 모의 진입 ${fmt(qty, info.qdp)} @ ${fmt(r.fillPx ?? last, info.dp)}` : r.error ?? '진입 실패', r.ok ? 'up' : 'down');
                if (r.ok && d.signal) { seen.current.add(sigId(d.signal)); save(K_SEEN, [...seen.current].slice(-300)); }
              }
              commit();
            }}
          />
        )}

        {tab === '포지션' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <Card className="p-3">
              <Row k="자산 (Equity)" v={`${fmt(equity)} USDT`} />
              <Row k="가용" v={`${fmt(available)} USDT`} />
              <Row k="미실현 손익 (순, 지금 청산 시)" v={(() => { const n = st.positions.reduce((a, x) => { const mk = marks[x.symbol] ?? x.entry; return a + upnl(x, mk) - x.entryFeeLeft - mk * x.qty * TAKER_FEE; }, 0); const r = Number(n.toFixed(2)); return <span className={r > 0 ? 'text-up' : r < 0 ? 'text-down' : ''}>{signed(n)} USDT</span>; })()} />
            </Card>
            {!st.positions.length && <div className="text-muted text-sm text-center py-8">보유 포지션 없음</div>}
            {st.positions.map((p) => {
              const m = mgmt.find((x) => x.p.id === p.id);
              const mk = marks[p.symbol] ?? p.entry;
              // net of the entry fee already paid on the open qty and a taker fee to close it now
              const u = upnl(p, mk) - p.entryFeeLeft - mk * p.qty * TAKER_FEE;
              const dp = symInfo(p.symbol).dp;
              return (
                <Card key={p.id} className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-semibold"><span className={p.side === 'long' ? 'text-up' : 'text-down'}>{p.side === 'long' ? '롱' : '숏'}</span> {p.symbol} <span className="text-muted text-xs">{p.leverage}x · {setupKo(p.setup)}</span></div>
                    <div className="text-right"><div className={`num font-semibold ${u >= 0 ? 'text-up' : 'text-down'}`}>{signed(u)} USDT</div><div className="text-[10px] text-muted">지금 청산 시 순손익</div></div>
                  </div>
                  <Row k="수량 / 진입가" v={`${fmt(p.qty, symInfo(p.symbol).qdp)} / ${fmt(p.entry, dp)}`} />
                  <Row k="마크 / 청산가" v={`${fmt(mk, dp)} / ${fmt(p.liqPrice, dp)}`} />
                  <Row k={`SL${p.beMoved ? ' (본절)' : ''}`} v={fmt(p.sl, dp)} />
                  {p.targets.map((t, i) => <Row key={i} k={t.label} v={<span className={t.done ? 'text-up' : ''}>{fmt(t.price, dp)} · {Math.round(t.fraction * 100)}% {t.done ? '✓ 체결' : '대기'}</span>} />)}
                  <Row k="계획 리스크 (1R)" v={p.riskUsd ? `${fmt(p.riskUsd)} USDT` : '—'} />
                  {p.riskBudget !== undefined && <Row k="리스크 예산 (진입 시 고정)" v={`${fmt(p.riskBudget)} USDT`} />}
                  {(p.fundingAcc ?? 0) !== 0 && <Row k="펀딩비 누적 (미정산)" v={<span className={(p.fundingAcc ?? 0) > 0 ? 'text-down' : 'text-up'}>{signed(-(p.fundingAcc ?? 0), 4)} USDT</span>} />}
                  <Row k="실현 손익 (순, 펀딩 포함)" v={signed(p.realizedNet)} />
                  {m?.flip.alert && <div className="mt-2 text-[12px] text-warn">⚠ 압력 반전 – 청산 권고 ({m.flip.multiple.toFixed(1)}배, 목표 진행 {Math.round(m.flip.progress * 100)}%)</div>}
                  {m?.pyr && <div className={`mt-1 text-[11px] ${m.pyr.add ? 'text-accent' : 'text-muted'}`}>불타기 {p.adds}/{s.maxAdds}: {pyrKo(m.pyr, symInfo(p.symbol).dp)}</div>}
                  {!m?.pyr && <div className="mt-1 text-[11px] text-muted">불타기: 돌파 신호 포지션에서만 사용 (최대 {s.maxAdds}회)</div>}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <Btn tone="down" onClick={() => closePos(p, 1, '시장가 청산')}>전량 청산</Btn>
                    <Btn onClick={() => closePos(p, 0.5, '50% 청산')}>50% 청산</Btn>
                    <Btn tone="accent" disabled={!m?.pyr?.add || p.adds >= s.maxAdds || p.symbol !== s.symbol} onClick={() => m?.pyr && addOn(p, m.pyr)}>불타기</Btn>
                  </div>
                </Card>
              );
            })}
            {st.pending.length > 0 && (
              <Card className="p-3">
                <div className="text-sm font-semibold mb-1">미체결 지정가</div>
                {st.pending.map((o) => (
                  <div key={o.id} className="flex justify-between items-center py-1 text-[13px]">
                    <span className={o.side === 'long' ? 'text-up' : 'text-down'}>{o.side === 'long' ? '롱' : '숏'} {o.symbol} {fmt(o.qty, symInfo(o.symbol).qdp)} @ {fmt(o.price, symInfo(o.symbol).dp)}</span>
                    <button className="text-muted underline" onClick={() => { broker.current.cancelLimit(o.id); commit(); }}>취소</button>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {tab === '기록' && <HistoryTab broker={broker.current} />}

        {tab === '설정' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <Card className="p-3">
              <div className="text-sm font-semibold mb-2">자금</div>
              <Row k="시드 / 지갑" v={`${fmt(st.bankroll)} / ${fmt(st.wallet)} USDT`} />
              <Btn tone="down" className="w-full mt-2" onClick={() => { if (confirm('모의 자금을 200 USDT로 초기화하고 포지션·기록을 삭제할까요?')) { broker.current.reset(DEFAULT_BANKROLL, mkt.serverNow()); commit(); toast('200 USDT로 초기화'); } }}>자금 초기화 (200 USDT)</Btn>
            </Card>
            <Card className="p-3 space-y-3">
              <div className="text-sm font-semibold">리스크</div>
              <div className="grid grid-cols-2 gap-2">
                <NumField label="거래당 리스크 %" value={String(s.riskPct)} onChange={(v) => set({ riskPct: Math.max(0.1, Number(v) || 1) })} suffix="%" />
                <NumField label="기본 레버리지" value={String(s.leverage)} onChange={(v) => set({ leverage: Math.min(125, Math.max(1, Math.round(Number(v) || 1))) })} suffix="x" />
                <NumField label="불타기 최대 횟수" value={String(s.maxAdds)} onChange={(v) => set({ maxAdds: Math.max(0, Math.round(Number(v) || 0)) })} />
                <NumField label="불타기 크기 (초기 대비)" value={String(s.addSizePct)} onChange={(v) => set({ addSizePct: Math.max(5, Number(v) || 50) })} suffix="%" />
              </div>
              <Toggle on={s.moveSlToBe} onChange={(v) => set({ moveSlToBe: v })} label="TP1 체결 후 SL 본절 이동" hint="본절가 = 진입가 + 남은 진입·청산 수수료 (손실 없이 청산)" />
              <Toggle on={s.autoPaper} onChange={(v) => set({ autoPaper: v })} label="자동 모의매매" hint="실시간 체결 압력 신호만 · 손실 후 2봉 대기 · 일일 −3R 정지 (기본 OFF)" />
            </Card>
            <Card className="p-3 space-y-3">
              <div className="text-sm font-semibold">박스 / 피봇</div>
              <div className="grid grid-cols-2 gap-2">
                <NumField label="룩백 (캔들)" value={String(s.lookback)} onChange={(v) => set({ lookback: Math.max(20, Math.round(Number(v) || 80)) })} />
                <NumField label="터치 허용 %" value={String(s.tolerancePct)} onChange={(v) => set({ tolerancePct: Math.max(0.05, Number(v) || 0.25) })} suffix="%" />
                <NumField label="피봇 좌" value={String(s.pivotLeft)} onChange={(v) => set({ pivotLeft: Math.max(1, Math.round(Number(v) || 3)) })} />
                <NumField label="피봇 우" value={String(s.pivotRight)} onChange={(v) => set({ pivotRight: Math.max(1, Math.round(Number(v) || 3)) })} />
                <NumField label="최소 터치" value={String(s.minTouches)} onChange={(v) => set({ minTouches: Math.max(1, Math.round(Number(v) || 2)) })} />
                <NumField label="최소 박스 높이 %" value={String(s.minHeightPct)} onChange={(v) => set({ minHeightPct: Math.max(0, Number(v) || 0) })} suffix="%" />
              </div>
              <Toggle on={s.requireRange} onChange={(v) => set({ requireRange: v })} label="박스권(비추세)일 때만 신호" />
              <Toggle on={s.showHist} onChange={(v) => set({ showHist: v })} label="압력 히스토그램 표시" />
            </Card>
            <Card className="p-3">
              <Toggle on={s.notify} onChange={async (v) => { if (v && 'Notification' in window && Notification.permission !== 'granted') await Notification.requestPermission(); set({ notify: v }); }} label="알림" hint="신호·체결·압력반전 (홈 화면 앱에서 권장)" />
            </Card>
            <div className="text-[11px] text-muted px-1 pb-4 leading-5">
              페이퍼(모의) 트레이딩 전용 · 실계좌/API 키 없음 · Bitget 공개 시세 사용. 수수료: Bitget USDT-M 테이커 0.06% / 메이커 0.02% (TP도 테이커로 보수 계산). 슬리피지 {SLIPPAGE_BPS}bp (시장가·손절). 펀딩비: 00/08/16시 UTC 정산 펀딩률(Bitget 공개 이력, 없으면 정산 직전 펀딩률). 강제청산 = 격리 증거금 전액 손실. 돌파 TP 1:3은 수수료 차감 순손익 기준. 앱이 꺼져 있던 동안은 다시 열 때 1분봉으로 재생 (SL·TP 동시 터치 시 SL 우선).
              압력: 실시간 체결(aggressor) 집계, 연결 이전 캔들은 OHLCV 근사.
            </div>
          </div>
        )}
      </main>


      <nav className="border-t border-line bg-panel pb-safe grid grid-cols-5">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`h-14 text-[13px] relative ${tab === t ? 'text-accent font-semibold' : 'text-muted'}`}>
            <span className="inline-flex items-center gap-1">{t}{t === '포지션' && st.positions.length > 0 && <span className="min-w-4 h-4 px-1 rounded-full bg-accent text-bg text-[10px] leading-4 font-semibold">{st.positions.length}</span>}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function BoxBar({ box, manual, dp, tape, onUnlock, onEdit }: { box: any; manual: ManualBox | null; dp: number; tape: number; onUnlock: () => void; onEdit: (t: number, b: number) => void }) {
  const [open, setOpen] = useState(false);
  const [t, setT] = useState('');
  const [b, setB] = useState('');
  if (!box) return <div className="px-3 py-2 text-[12px] text-muted border-t border-line">박스 탐지 중… (피봇 터치 부족)</div>;
  return (
    <div className="px-3 py-1.5 border-t border-line text-[12px]">
      <div className="flex items-center justify-between gap-2">
        <div className="num leading-5">
          <span className="text-muted">박스 </span>
          <span className="text-down">{fmt(box.bottom, dp)}</span> – <span className="text-up">{fmt(box.top, dp)}</span>
          <span className="text-muted"> · 50% </span>{fmt(box.mid, dp)}
        </div>
        <div className="flex gap-1.5 items-center">
          <span className={`px-1.5 py-0.5 rounded text-[10px] ${box.isRange ? 'bg-up/20 text-up' : 'bg-warn/20 text-warn'}`}>{manual ? '수동·고정' : box.isRange ? '박스권' : '추세/약함'}</span>
          <button className="text-accent" onClick={() => { setT(String(Number(box.top))); setB(String(Number(box.bottom))); setOpen((v) => !v); }}>수정</button>
          {manual && <button className="text-muted" onClick={onUnlock}>자동</button>}
        </div>
      </div>
      <div className="text-[10px] text-muted">터치 {box.touchesTop}/{box.touchesBottom} · 실시간 체결 압력 {tape}캔들 (그 외 OHLCV 근사)</div>
      {open && (
        <div className="grid grid-cols-3 gap-2 mt-2 items-end">
          <NumField label="상단(저항)" value={t} onChange={setT} />
          <NumField label="하단(지지)" value={b} onChange={setB} />
          <Btn tone="accent" onClick={() => { const tt = Number(t), bb = Number(b); if (tt > 0 && bb > 0 && tt !== bb) { onEdit(tt, bb); setOpen(false); } }}>고정</Btn>
        </div>
      )}
    </div>
  );
}

function SignalCard({ g, dp, acted, stale, onEnter, onEdit }: { g: Signal | null; dp: number; acted: boolean; stale: string | null; onEnter: () => void; onEdit: () => void }) {
  if (!g) return <div className="mx-3 mb-2 px-3 py-2 rounded-lg bg-panel border border-line text-[12px] text-muted">신호 대기 중 · 박스 지지/저항 + 장악형 + 압력 확인 시 표시</div>;
  const long = g.side === 'long';
  return (
    <div className={`mx-3 mb-2 rounded-xl border px-3 py-2 ${long ? 'border-up/60 bg-up/10' : 'border-down/60 bg-down/10'}`}>
      <div className="flex justify-between items-center">
        <div className={`font-semibold ${long ? 'text-up' : 'text-down'}`}>{TYPE_KO[g.type]} <span className="text-muted text-[11px] font-normal">{mdhm(g.ts)} 마감</span></div>
        <div className="text-[11px] text-muted flex items-center gap-1.5">
          {g.pressure.source === 'ohlcv' && <span className="px-1.5 py-0.5 rounded bg-warn/20 text-warn text-[10px]">압력 근사(OHLCV)</span>}
          <span>매수압력 {Math.round(g.pressure.ratio * 100)}%</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1 text-[11px] num mt-1">
        <div><div className="text-muted">진입</div>{fmt(g.entry, dp)}</div>
        <div><div className="text-muted">SL</div><span className="text-warn">{fmt(g.sl, dp)}</span></div>
        {g.targets.map((t) => <div key={t.label}><div className="text-muted">{t.label} {t.sizePct}%</div><span className="text-up">{fmt(t.price, dp)}</span></div>)}
      </div>
      <div className="flex gap-2 mt-2">
        <Btn tone={long ? 'up' : 'down'} className="flex-1 h-10 text-[13px]" disabled={acted || !!stale} onClick={onEnter}>{acted ? '진입 완료/처리됨' : stale ?? `탭하여 모의 ${long ? '롱' : '숏'} 진입`}</Btn>
        <Btn className="h-10" onClick={onEdit}>수정</Btn>
      </div>
    </div>
  );
}

function TradeTab(p: {
  s: Settings; set: (x: Partial<Settings>) => void; last: number; dp: number; book: any; equity: number; available: number; qtyStep: number;
  draft: Draft | null; setDraft: (d: Draft | null) => void; defaultDraft: (side: Side) => Draft;
  sizeFor: (entry: number, sl: number) => ReturnType<typeof sizePosition>;
  onSubmit: (d: Draft, orderType: 'market' | 'limit', limitPrice: number, qty: number) => void;
}) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limit, setLimit] = useState('');
  const [qtyOverride, setQtyOverride] = useState('');
  const d = p.draft ?? p.defaultDraft('long');
  useEffect(() => { if (!p.draft && p.last) p.setDraft(p.defaultDraft('long')); /* eslint-disable-next-line */ }, [p.last > 0]);
  const entry = orderType === 'limit' && Number(limit) > 0 ? Number(limit) : p.last;
  const sl = Number(d.sl);
  let sz: ReturnType<typeof sizePosition> | null = null;
  try { sz = entry > 0 && sl > 0 && sl !== entry ? p.sizeFor(entry, sl) : null; } catch { sz = null; }
  const qdp = Math.max(0, Math.round(-Math.log10(p.qtyStep)));
  const qty = qtyOverride ? floorQty(Number(qtyOverride) || 0, p.qtyStep) : Number(sz?.qty ?? 0);
  const long = d.side === 'long';
  const tp1 = Number(d.tp1), tp2 = Number(d.tp2);
  const slOk = long ? sl < entry : sl > entry;
  const tpOk = tp1 > 0 && (long ? tp1 > entry : tp1 < entry) && (d.kind === 'breakout' || !d.tp2 || (long ? tp2 > tp1 : tp2 < tp1));
  const notional = qty * entry;
  const minOk = notional >= MIN_NOTIONAL_USDT;
  const margin = notional / p.s.leverage;
  const entryFeeRate = orderType === 'limit' ? MAKER_FEE : TAKER_FEE;
  const entrySlip = orderType === 'limit' ? 0 : SLIP; // market entries and stop exits carry paper slippage
  const lossAtSl = Math.abs(entry - sl) * qty + entry * qty * (entryFeeRate + entrySlip) + sl * qty * (TAKER_FEE + SLIP);
  const valid = slOk && tpOk && minOk && margin + entry * qty * entryFeeRate <= p.available + 1e-9;
  const why = sz?.belowMin && !qtyOverride ? `리스크 ${p.s.riskPct}% 기준 수량이 최소 주문(${MIN_NOTIONAL_USDT} USDT / ${p.qtyStep}) 미만` : !slOk ? `SL이 진입가 ${long ? '아래' : '위'}에 있어야 합니다` : !tpOk ? `TP가 진입가 ${long ? '위' : '아래'}(TP2는 TP1 너머)에 있어야 합니다` : !minOk ? `최소 주문 금액 ${MIN_NOTIONAL_USDT} USDT 이상 필요` : '가용 증거금 부족';
  const upd = (patch: Partial<Draft>) => p.setDraft({ ...d, ...patch });
  return (
    <div className="flex-1 overflow-y-auto px-3 pt-3">
      <div className="grid grid-cols-[minmax(0,1fr)_124px] gap-2.5">
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-1 bg-panel2 rounded-lg p-1">
            {(['long', 'short'] as const).map((sd) => (
              <button key={sd} onClick={() => { setQtyOverride(''); p.setDraft(d.signal && d.side === sd ? d : p.defaultDraft(sd)); }}
                className={`h-9 rounded-md font-semibold text-sm ${d.side === sd ? (sd === 'long' ? 'bg-up text-white' : 'bg-down text-white') : 'text-muted'}`}>{sd === 'long' ? '롱' : '숏'}</button>
            ))}
          </div>
          <Chips<'market' | 'limit'> items={['market', 'limit']} value={orderType} onChange={(v) => setOrderType(v)} fmt={(v) => (v === 'market' ? '시장가' : '지정가')} />
          {orderType === 'limit' && <NumField label="지정가" value={limit} onChange={setLimit} />}
          <div>
            <span className="text-[11px] text-muted">레버리지</span>
            <Chips items={[3, 5, 10, 20] as const} value={p.s.leverage as any} onChange={(v) => p.set({ leverage: v })} fmt={(v) => `${v}x`} />
          </div>
          <NumField label="리스크 (자산 대비)" value={String(p.s.riskPct)} onChange={(v) => { setQtyOverride(''); p.set({ riskPct: Math.max(0.1, Number(v) || 1) }); }} suffix="%" />
          <NumField label="손절 SL" value={String(d.sl)} onChange={(v) => upd({ sl: v })} />
          <NumField label={d.kind === 'breakout' ? 'TP (순 1:3, 100%)' : 'TP1 중앙선 (50%)'} value={String(d.tp1)} onChange={(v) => upd({ tp1: v })} />
          {d.kind === 'range' && <NumField label="TP2 반대편 경계 (50%)" value={String(d.tp2)} onChange={(v) => upd({ tp2: v })} />}
          <NumField label={`수량 (리스크 ${p.s.riskPct}%: ${sz ? fmt(sz.qty, qdp) : '—'})`} value={qtyOverride || (sz ? Number(sz.qty).toFixed(qdp) : '')} onChange={setQtyOverride} />
        </div>
        <div className="bg-panel rounded-xl border border-line py-2">
          <OrderBook book={p.book} dp={p.dp} qdp={qdp} rows={7} />
        </div>
      </div>
      {d.signal && <div className="mt-2 text-[11px] text-accent">신호 자동 입력: {TYPE_KO[d.signal.type]} ({mdhm(d.signal.ts)} 마감) · SL/TP 자동</div>}
      <Card className="p-3 mt-3">
        <Row k="진입 기준가" v={fmt(entry, p.dp)} />
        <Row k="증거금 / 명목" v={qty > 0 ? `${fmt(margin)} / ${fmt(notional)} USDT` : '—'} />
        <Row k="SL 시 순손실 (수수료·슬리피지)" v={qty > 0 && slOk ? <span className="text-down">-{fmt(lossAtSl)} USDT ({((lossAtSl / Math.max(p.equity, 1e-9)) * 100).toFixed(2)}%)</span> : '—'} />
        {qty > 0 && tpOk && <Row k={d.kind === 'breakout' || !d.tp2 ? 'TP 시 순이익' : 'TP1+TP2 시 순이익'} v={<span className="text-up">+{fmt(
          (d.kind === 'breakout' || !d.tp2
            ? Math.abs(tp1 - entry) * qty - tp1 * qty * TAKER_FEE
            : Math.abs(tp1 - entry) * qty * 0.5 + Math.abs(tp2 - entry) * qty * 0.5 - (tp1 + tp2) * qty * 0.5 * TAKER_FEE) - entry * qty * (entryFeeRate + entrySlip))} USDT</span>} />}
        <Row k="가용 / 자산" v={`${fmt(p.available)} / ${fmt(p.equity)} USDT`} />
      </Card>
      {/* submit stays pinned to the bottom of the scroll area so it is always reachable */}
      <div className="sticky bottom-0 -mx-3 px-3 pt-2 pb-3 mt-1 bg-bg/95 backdrop-blur border-t border-line">
        {!valid && (qty > 0 || sz?.belowMin) && <div className="text-[11px] text-down mb-1">{why}</div>}
        <Btn tone={d.side === 'long' ? 'up' : 'down'} className="w-full h-12 text-[16px]" disabled={!valid || !(qty > 0)}
          onClick={() => { p.onSubmit(d, orderType, entry, qty); setQtyOverride(''); }}>
          {d.side === 'long' ? '롱 (매수) 모의 진입' : '숏 (매도) 모의 진입'}
        </Btn>
      </div>
    </div>
  );
}

function HistoryTab({ broker }: { broker: PaperBroker }) {
  const st = broker.state;
  const stats = tradeStats(st.fills, st.positions.map((x) => x.id));
  const curve = st.equityCurve;
  const W = 360, H = 120;
  const ys = curve.map((c) => c.equity);
  const lo = Math.min(...ys, st.bankroll), hi = Math.max(...ys, st.bankroll);
  const path = curve.map((c, i) => `${i ? 'L' : 'M'}${(i / Math.max(1, curve.length - 1)) * W},${H - ((c.equity - lo) / Math.max(1e-9, hi - lo)) * (H - 10) - 5}`).join(' ');
  const exportCsv = async () => {
    const csv = fillsToCsv(st.fills);
    const name = `dupont-paper-${new Date().toISOString().slice(0, 10)}.csv`;
    const file = new File([csv], name, { type: 'text/csv' });
    if ((navigator as any).canShare?.({ files: [file] })) { try { await (navigator as any).share({ files: [file], title: name }); return; } catch { /* fallthrough */ } }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      <Card className="p-3">
        <div className="grid grid-cols-3 text-center">
          <div><div className="text-[11px] text-muted">거래</div><div className="num font-semibold">{stats.trades}</div></div>
          <div><div className="text-[11px] text-muted">승률</div><div className="num font-semibold">{stats.trades ? `${(stats.winRate * 100).toFixed(0)}%` : '—'}</div></div>
          <div><div className="text-[11px] text-muted">순손익</div><div className={`num font-semibold ${stats.net >= 0 ? 'text-up' : 'text-down'}`}>{signed(stats.net)}</div></div>
        </div>
        <div className="text-[11px] text-muted text-center mt-1">수수료 합계 {fmt(stats.fees, 3)} USDT (순손익에 반영){stats.funding !== 0 ? ` · 펀딩 ${signed(-stats.funding, 3)}` : ''}{stats.partialNet !== 0 ? ` · 보유 중 부분청산 ${signed(stats.partialNet)} 포함` : ''}</div>
        {stats.rTrades > 0 && <div className="text-[11px] text-muted text-center num">기대값 <span className={stats.expectancyR >= 0 ? 'text-up' : 'text-down'}>{signed(stats.expectancyR)}R</span> · 평균 승 {signed(stats.avgWinR)}R / 패 {signed(stats.avgLossR)}R ({stats.rTrades}건)</div>}
      </Card>
      <Card className="p-3">
        <div className="flex justify-between text-[12px] text-muted mb-1 num"><span>자산 곡선</span><span>{fmt(curve[0]?.equity ?? st.bankroll)} → <span className={(curve[curve.length - 1]?.equity ?? st.bankroll) >= st.bankroll ? 'text-up' : 'text-down'}>{fmt(curve[curve.length - 1]?.equity ?? st.bankroll)}</span> USDT</span></div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[120px]">
          <line x1="0" x2={W} y1={H - ((st.bankroll - lo) / Math.max(1e-9, hi - lo)) * (H - 10) - 5} y2={H - ((st.bankroll - lo) / Math.max(1e-9, hi - lo)) * (H - 10) - 5} stroke="#262e38" strokeDasharray="4 4" />
          <path d={path} fill="none" stroke="#00c2cb" strokeWidth="2" />
        </svg>
        {st.positions.length > 0 && <div className="text-[11px] text-muted mt-1">지갑 기준 · 보유 포지션의 진입 수수료는 이미 차감됨 (미실현 손익 제외)</div>}
      </Card>
      <Btn className="w-full" onClick={exportCsv} disabled={!st.fills.length}>CSV 내보내기</Btn>
      {[...st.fills].reverse().map((f) => (
        <Card key={f.id} className="p-3">
          <div className="flex justify-between text-[13px]">
            <span><span className={f.side === 'long' ? 'text-up' : 'text-down'}>{f.side === 'long' ? '롱' : '숏'}</span> {f.symbol} · {setupKo(f.setup)}</span>
            <span className={`num font-semibold ${f.netPnl >= 0 ? 'text-up' : 'text-down'}`}>{signed(f.netPnl)} USDT</span>
          </div>
          <div className="text-[11px] text-muted num mt-0.5">{mdhm(f.closedAt)} · {f.reason} · {fmt(f.qty, symInfo(f.symbol).qdp)} · {fmt(f.entry, symInfo(f.symbol).dp)} → {fmt(f.exit, symInfo(f.symbol).dp)} · 수수료 {fmt(f.fees, 3)}{f.funding ? ` · 펀딩 ${signed(-f.funding, 3)}` : ''}{f.r !== undefined ? ` · ${signed(f.r)}R` : ''}</div>
        </Card>
      ))}
      {!st.fills.length && <div className="text-muted text-sm text-center py-6">거래 기록 없음</div>}
    </div>
  );
}
