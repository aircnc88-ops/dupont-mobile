import { useEffect, useRef, useState } from 'react';
import type { Pressure, Signal } from '@bitget-sim/dupont';
import type { Candle } from './data/bitget';
import type { BrokerState } from './paper/broker';
import type { TapeBuckets } from './lib/tape';
import { obFieldsFor, type ObSampler } from './lib/obPressure';
import { loadRaw, save } from './lib/storage';
import { openLogStore, signalKey, type LogStore } from './lib/logStore';
import { SheetsSync, type SyncStatus } from './lib/sheetsSync';
import { SKIP, type SignalRow } from './lib/sheetsSchema';
import { signalRowFor, tapeRowFor, tradesFromFills, type PosMeta } from './lib/journal';

/**
 * Journal + Google Sheets sync (logging only — never touches trading decisions):
 *  - tape_pressure: each CLOSED candle fully covered by the live trade tape → IndexedDB (deduped, capped) and the webhook queue;
 *    r13: the IndexedDB record also carries the candle's order-book pressure (ob_* fields, lib/obPressure.ts; exported in the CSV)
 *  - signals: every generated (live) signal → IndexedDB; sent once its outcome is final (taken, or no longer takeable
 *    after the next candle closed) because the sheet is append-only
 *  - trades: one row per closed paper position (sent once)
 * The webhook queue only accepts rows while BOTH the URL and the token are set; it is flushed after each candle close
 * and retried with backoff (lib/sheetsSync.ts).
 */
const K_Q = 'dupont.sheets.queue.v1', K_META = 'dupont.journal.posmeta.v1', K_SENT = 'dupont.journal.tradesSent.v1', K_PSIG = 'dupont.journal.pendingSignals.v1';
interface PendingSig { key: string; tsMs: number; intervalMs: number; row: SignalRow }

export interface JournalArgs {
  symbol: string; tf: string; intervalMs: number;
  closed: Candle[]; pressures: Pressure[]; live: Signal[];
  tape: React.MutableRefObject<TapeBuckets>; serverNow: () => number;
  /** r13: order-book pressure sampler (logging only); its ob_* fields are stored next to the tape row */
  ob?: React.MutableRefObject<ObSampler>;
  state: BrokerState; bv: number; autoPaper: boolean; url: string; token: string;
}

export function useJournal(a: JournalArgs) {
  const store = useRef<LogStore>(null as any);
  if (!store.current) store.current = openLogStore();
  const cfg = useRef({ url: a.url, token: a.token });
  cfg.current = { url: a.url, token: a.token };
  const sync = useRef<SheetsSync>(null as any);
  if (!sync.current) {
    sync.current = new SheetsSync(() => cfg.current, {
      fetch: (u, init) => fetch(u, init),
      now: () => Date.now(),
      load: () => loadRaw(K_Q),
      save: (p) => save(K_Q, p),
    });
  }
  const [status, setStatus] = useState<SyncStatus>(() => sync.current.status());
  useEffect(() => sync.current.subscribe(setStatus), []);
  const meta = useRef<Record<string, PosMeta>>(loadRaw<Record<string, PosMeta>>(K_META) ?? {});
  const logged = useRef(new Set<string>()); // tape/signal keys handled this session (no double insert from racing effects)
  const pending = useRef<PendingSig[]>(loadRaw<PendingSig[]>(K_PSIG) ?? []);
  const savePending = () => save(K_PSIG, pending.current);

  /** signals whose outcome is final (taken, or the next candle closed) → webhook */
  const finalizeSignals = () => {
    const now = a.serverNow();
    const done = pending.current.filter((p) => p.row.taken || now >= p.tsMs + 2 * p.intervalMs + 1500);
    if (!done.length) return;
    pending.current = pending.current.filter((p) => !done.includes(p));
    savePending();
    sync.current.enqueue('signals', done.map((p) => p.row));
  };

  const flushSoon = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleFlush = (ms = 3000) => {
    if (flushSoon.current) clearTimeout(flushSoon.current);
    flushSoon.current = setTimeout(() => { flushSoon.current = null; void sync.current.flush(); }, ms);
  };

  // ---- per closed candle: tape row(s) + new signals, then one flush (batched per closed candle) ----
  const last = a.closed[a.closed.length - 1];
  const closedKey = last ? `${a.symbol}|${a.tf}|${last.ts}` : '';
  useEffect(() => {
    if (!last) return;
    const n = a.closed.length;
    for (let i = Math.max(0, n - 3); i < n; i++) {
      const c = a.closed[i];
      // candles must belong to this timeframe (a tf switch renders once with the old candles)
      if (c.ts % a.intervalMs !== 0 || (i > 0 && c.ts - a.closed[i - 1].ts !== a.intervalMs)) continue;
      const key = `${a.symbol}|${a.tf}|${c.ts}`;
      if (logged.current.has(key)) continue;
      const row = tapeRowFor(a.symbol, a.tf, c, a.tape.current.stats(c.ts, a.intervalMs));
      if (!row) continue;
      logged.current.add(key);
      const obf = a.ob ? obFieldsFor(a.ob.current.buckets.stats(c.ts, a.intervalMs), a.intervalMs) : {}; // r13
      store.current.addTape(row, c.ts, { open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume, ...obf })
        .then((isNew) => { if (isNew) sync.current.enqueue('tape_pressure', [row]); })
        .catch(() => {});
    }
    for (const g of a.live) noteSignal(g);
    finalizeSignals();
    scheduleFlush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closedKey]);

  /** first sight of a live signal: stored with the default outcome (auto OFF → auto_paper_off) */
  const noteSignal = (g: Signal) => {
    const key = signalKey(a.symbol, a.tf, g.type, g.ts);
    if (logged.current.has(key)) return;
    logged.current.add(key);
    const row = signalRowFor(g, a.symbol, a.tf, false, a.autoPaper ? SKIP.notTaken : SKIP.autoOff);
    if (!pending.current.some((p) => p.key === key)) {
      // a signal seen in an earlier session is not stored/sent twice
      store.current.getSignal(a.symbol, a.tf, g.type, g.ts).then((prev) => {
        if (prev || pending.current.some((p) => p.key === key)) return;
        pending.current.push({ key, tsMs: g.ts, intervalMs: a.intervalMs, row });
        savePending();
        void store.current.putSignal(row, g.ts).catch(() => {});
      }).catch(() => {});
    }
  };

  /** App reports what happened to a signal (auto gate / entry). taken = a paper position was opened from it. */
  const signalOutcome = (g: Signal, taken: boolean, skip = '') => {
    const key = signalKey(a.symbol, a.tf, g.type, g.ts);
    logged.current.add(key);
    const p = pending.current.find((x) => x.key === key);
    const prevRow = p?.row;
    if (prevRow?.taken && !taken) return;
    const row = signalRowFor(g, a.symbol, a.tf, taken, skip || prevRow?.skip_reason || SKIP.notTaken);
    if (p) p.row = row;
    else pending.current.push({ key, tsMs: g.ts, intervalMs: a.intervalMs, row });
    savePending();
    void store.current.putSignal(row, g.ts).catch(() => {});
    if (taken) { finalizeSignals(); scheduleFlush(); }
  };

  // ---- trades: remember open positions' entry context; one row per newly closed position ----
  useEffect(() => {
    const st = a.state;
    const lastP = a.pressures[a.closed.length - 1];
    let dirty = false;
    for (const p of st.positions) {
      const m = meta.current[p.id];
      if (!m) {
        const here = p.symbol === a.symbol;
        meta.current[p.id] = { tf: here ? a.tf : '', slInitial: p.initialSl, tp1: p.targets[0]?.price, adds: p.adds, tapeRatio: here && lastP ? Math.round(lastP.ratio * 1e4) / 1e4 : undefined, tapeSource: here ? lastP?.source : undefined };
        dirty = true;
      } else if (m.adds !== p.adds) { m.adds = p.adds; dirty = true; }
    }
    const rows = tradesFromFills(st.fills, meta.current);
    let sent = loadRaw<string[]>(K_SENT);
    if (!sent) { sent = rows.map((r) => r.positionId); save(K_SENT, sent); } // first run: no backfill of older trades
    const seen = new Set(sent);
    const fresh = rows.filter((r) => !seen.has(r.positionId));
    if (fresh.length) {
      sync.current.enqueue('trades', fresh.map(({ positionId, ...r }) => r));
      save(K_SENT, [...sent, ...fresh.map((r) => r.positionId)].slice(-2000));
      scheduleFlush();
    }
    if (dirty) {
      const ids = Object.keys(meta.current);
      if (ids.length > 2000) for (const id of ids.slice(0, ids.length - 2000)) delete meta.current[id];
      save(K_META, meta.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a.bv, a.state]);

  // ---- retry timer + resume / back online ----
  useEffect(() => {
    const iv = setInterval(() => { finalizeSignals(); void sync.current.flush(); }, 30_000);
    const kick = () => { if (document.visibilityState === 'visible') { finalizeSignals(); void sync.current.flush(); } };
    document.addEventListener('visibilitychange', kick);
    window.addEventListener('online', kick);
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', kick); window.removeEventListener('online', kick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    store: store.current, sync: sync.current, status, meta: meta.current, signalOutcome,
  };
}
export type Journal = ReturnType<typeof useJournal>;
