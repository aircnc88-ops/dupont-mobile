import { useEffect, useRef, useState } from 'react';
import { fetchCandles, fetchClockOffset, fetchTicker, type Candle, type TickerInfo } from './data/bitget';
import { BitgetPublicFeed, TradeDedupe, type WsBook, type WsStatus } from './data/ws';
import { TF_MS } from './lib/symbols';
import { TapeBuckets } from './lib/tape';
import { ObSampler, OB_SAMPLE_MS } from './lib/obPressure';
import { extendCandles, needsCandleReload } from './lib/candles';

/**
 * Live market state for one symbol/timeframe:
 *  - REST candles (300, deduped by ts) refreshed every 20s; the forming candle is updated from
 *    WS trades / ticker and MERGED with REST on the boundary candle (max volume, never summed)
 *  - WS public trades aggregated on arrival into 1-minute aggressor buckets (`tape`), kept across
 *    reconnects with disconnect gaps recorded; the subscribe snapshot is skipped (its newest print
 *    anchors coverage on the server clock, N4), repeats are dropped by tradeId (C6), and a gap
 *    starts at the last message received on the dead socket (N3)
 *  - R3: a print that skips one or more candles (app backgrounded / WS down) does not synthesize a
 *    candle from the stale close (fake wick); REST is reloaded instead (throttled to 1 per 3 s)
 *  - server clock offset from trade timestamps (`serverNow`) so candle-close checks do not depend
 *    on the phone clock; Z1: `syncClock()` measures it from Bitget's public server time (before the
 *    first trade arrives, e.g. the resume replay right after a cold start) — every broker timestamp
 *    uses `serverNow`; Z3: the subscribe snapshot (history) never sets the offset; Z2: `clockSynced()`
 *    is false until one measurement succeeded (the replay then retries instead of stamping phone time)
 *  - books15 orderbook, ticker (mark / funding / 24h)
 *  - r13 (logging only): full-depth `books` → local book sampled once per second into 1-minute order-book
 *    buckets (`ob`, lib/obPressure.ts); read only by the journal, never by signals / entries / the broker
 */
export function useMarket(symbol: string, tf: string) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [ticker, setTicker] = useState<(TickerInfo & { sym?: string; at?: number }) | null>(null);
  /** Z12: when this symbol was (re)selected — a ticker received before that (left from an earlier visit to this symbol) is never shown */
  const since = useRef({ symbol, at: 0 });
  if (since.current.symbol !== symbol) since.current = { symbol, at: performance.now() };
  /** Z11: symbol the candles in state belong to (set when this symbol's REST candles land) */
  const candlesSym = useRef(symbol);
  /** Z11 (book): symbol the order book in state belongs to (set by that symbol's WS book handler) */
  const bookSym = useRef(symbol);
  const [book, setBook] = useState<WsBook | null>(null);
  const [status, setStatus] = useState<WsStatus>('connecting');
  const [err, setErr] = useState('');
  const [tapeVer, setTapeVer] = useState(0);
  const tape = useRef(new TapeBuckets());
  /** r13: order-book pressure sampler (logging only) */
  const ob = useRef(new ObSampler());
  const clockOffset = useRef(0);
  /** Z2: true once the offset was measured (a WS update print or a /time sync) — never phone-clock-only */
  const synced = useRef(false);
  const tfRef = useRef(tf);
  tfRef.current = tf;
  const candlesRef = useRef<Candle[]>([]);
  candlesRef.current = candles;
  const reloadRef = useRef<() => void>(() => {});
  const freshAt = useRef(0); // server time of the newest fresh data (applied print or REST load)

  // WS per symbol
  useEffect(() => {
    tape.current = new TapeBuckets();
    ob.current = new ObSampler();
    const obs = ob.current;
    setBook(null);
    let dirty = false;
    const dedupe = new TradeDedupe();
    const feed = new BitgetPublicFeed(symbol, {
      status: (s) => {
        setStatus(s);
        // N3: the gap starts at the last message on the dead socket (a half-open socket is only noticed ~55–80 s later)
        if (s === 'reconnecting' || s === 'closed') tape.current.disconnected((feed.lastMsgAt || Date.now()) + clockOffset.current);
        if (s === 'reconnecting') obs.onDisconnect(Date.now() + clockOffset.current); // r13: the book must be rebuilt from a new snapshot
      },
      ticker: (t) => setTicker((prev) => ({ ...(prev?.sym === symbol ? prev : t), ...t, sym: symbol, at: performance.now() })), // Z11: never merge into another symbol's ticker; Z12: stamp arrival
      book: (b) => { bookSym.current = symbol; setBook(b); }, // Z11 (book)
      depth: (p) => obs.onPush(p, Date.now(), Date.now() + clockOffset.current), // r13: logging only
      trades: (raw, snapshot) => {
        const ts = dedupe.filter(raw); // C6: repeats (by tradeId) never count twice
        if (!raw.length) return;
        const newest = raw[raw.length - 1];
        if (!snapshot) { clockOffset.current = newest.ts - Date.now(); synced.current = true; } // Z3: snapshot prints are history — they would pull serverNow back by their age
        // N4: coverage is anchored on the newest snapshot print (server clock); every later print arrives as an update.
        // The snapshot itself is history already inside the REST candle volume → not added.
        if (snapshot) { tape.current.connected(newest.ts); return; }
        if (tape.current.awaitingConnect) tape.current.connected(raw[0].ts); // no snapshot seen (defensive)
        if (!ts.length) return;
        tape.current.add(ts);
        dirty = true;
        // forming-candle update from the tape (chronological → last = newest print)
        const last = ts[ts.length - 1];
        applyPrice(last.price, ts.reduce((s, t) => s + t.qty, 0), last.ts);
      },
    });
    feed.start();
    const flush = setInterval(() => { if (dirty) { dirty = false; setTapeVer((v) => v + 1); } }, 1000);
    const obTick = setInterval(() => { obs.tick(Date.now(), Date.now() + clockOffset.current); }, OB_SAMPLE_MS); // r13
    return () => { feed.stop(); clearInterval(flush); clearInterval(obTick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  function applyPrice(price: number, vol: number, ts: number) {
    const ms = TF_MS[tfRef.current] ?? 900_000;
    // R3: one or more candles were missed (or the app slept across the boundary): never synthesize from a
    // stale close (fake wick) — reload REST instead
    if (needsCandleReload(candlesRef.current, ts, ms, freshAt.current)) { reloadRef.current(); return; }
    if (candlesRef.current.length) freshAt.current = Math.max(freshAt.current, ts);
    setCandles((prev) => extendCandles(prev, price, vol, ts, ms));
  }

  // REST candles per symbol/tf
  useEffect(() => {
    let alive = true;
    setCandles([]);
    const load = (initial: boolean) =>
      fetchCandles(symbol, tf)
        .then((c) => {
          if (!alive || !c.length) return;
          setErr('');
          freshAt.current = Math.max(freshAt.current, Date.now() + clockOffset.current);
          candlesSym.current = symbol; // Z11
          setCandles((prev) => {
            if (initial || !prev.length) return c;
            const lastRest = c[c.length - 1];
            const lastLocal = prev[prev.length - 1];
            // keep a locally-extended forming candle if REST hasn't caught up yet
            if (lastLocal.ts > lastRest.ts) return [...c, lastLocal];
            // same boundary candle: merge instead of re-adding WS volume on top of REST volume
            if (lastLocal.ts === lastRest.ts) {
              const m = { ...lastRest, high: Math.max(lastRest.high, lastLocal.high), low: Math.min(lastRest.low, lastLocal.low), close: lastLocal.close, volume: Math.max(lastRest.volume, lastLocal.volume) };
              return [...c.slice(0, -1), m];
            }
            return c;
          });
        })
        .catch((e) => alive && setErr(String(e?.message ?? e)));
    load(true);
    let lastReload = 0;
    reloadRef.current = () => { if (Date.now() - lastReload > 3_000) { lastReload = Date.now(); load(false); } };
    const iv = setInterval(() => load(false), 20_000);
    return () => { alive = false; clearInterval(iv); };
  }, [symbol, tf]);

  // REST ticker fallback/poll (also when WS is down)
  useEffect(() => {
    let alive = true;
    const poll = () => fetchTicker(symbol).then((t) => {
      if (!alive || !t) return;
      setTicker({ ...t, sym: symbol, at: performance.now() }); // Z11 / Z12
      if (status !== 'live') applyPrice(t.last, 0, Date.now() + clockOffset.current);
    }).catch(() => {});
    poll();
    const iv = setInterval(poll, status === 'live' ? 10_000 : 2_500);
    return () => { alive = false; clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, status]);

  // Z1: one public server-time request on mount; runReplay awaits a fresh one before stamping anything.
  // A failed / slow (> 4 s) request keeps the current offset; Z2: while nothing was ever measured, clockSynced() is
  // false and runReplay refuses to stamp (gate retry in 15 s) instead of using the phone clock; Z5: /time is retried
  // every 15 s until one measurement succeeds (also with nothing exposed, so a new entry is server-stamped).
  const syncing = useRef<Promise<void> | null>(null);
  const syncClock = (): Promise<void> =>
    (syncing.current ??= fetchClockOffset()
      .then((off) => { if (off !== null) { clockOffset.current = off; synced.current = true; } })
      .finally(() => { syncing.current = null; }));
  useEffect(() => {
    void syncClock();
    const iv = setInterval(() => { if (!synced.current) void syncClock(); }, 15_000); // Z5: keep measuring until it works (also with nothing exposed)
    return () => clearInterval(iv);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ms = TF_MS[tf] ?? 900_000;
  const serverNow = () => Date.now() + clockOffset.current;
  // Z11: right after a symbol switch the state still holds the previous symbol's ticker / candles — never expose them
  return { candles: candlesSym.current === symbol ? candles : [], ticker: ticker?.sym === symbol && (ticker.at ?? 0) >= since.current.at ? ticker : null, // Z12
    book: bookSym.current === symbol ? book : null, status, err, tape, ob, tapeVer, intervalMs: ms, serverNow, syncClock, clockSynced: () => synced.current };
}
