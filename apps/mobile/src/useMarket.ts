import { useEffect, useRef, useState } from 'react';
import { fetchCandles, fetchTicker, type Candle, type TickerInfo } from './data/bitget';
import { BitgetPublicFeed, type WsBook, type WsStatus } from './data/ws';
import { TF_MS } from './lib/symbols';
import { TapeBuckets } from './lib/tape';

/**
 * Live market state for one symbol/timeframe:
 *  - REST candles (300, deduped by ts) refreshed every 20s; the forming candle is updated from
 *    WS trades / ticker and MERGED with REST on the boundary candle (max volume, never summed)
 *  - WS public trades aggregated on arrival into 1-minute aggressor buckets (`tape`), kept across
 *    reconnects with disconnect gaps recorded; the subscribe snapshot is skipped
 *  - server clock offset from trade timestamps (`serverNow`) so candle-close checks do not depend
 *    on the phone clock
 *  - books15 orderbook, ticker (mark / funding / 24h)
 */
export function useMarket(symbol: string, tf: string) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [ticker, setTicker] = useState<TickerInfo | null>(null);
  const [book, setBook] = useState<WsBook | null>(null);
  const [status, setStatus] = useState<WsStatus>('connecting');
  const [err, setErr] = useState('');
  const [tapeVer, setTapeVer] = useState(0);
  const tape = useRef(new TapeBuckets());
  const clockOffset = useRef(0);
  const tfRef = useRef(tf);
  tfRef.current = tf;

  // WS per symbol
  useEffect(() => {
    tape.current = new TapeBuckets();
    setBook(null);
    let dirty = false;
    const feed = new BitgetPublicFeed(symbol, {
      status: (s) => {
        setStatus(s);
        if (s === 'live') tape.current.connected(Date.now() + clockOffset.current);
        if (s === 'reconnecting' || s === 'closed') tape.current.disconnected(Date.now() + clockOffset.current);
      },
      ticker: (t) => setTicker((prev) => ({ ...(prev ?? t), ...t })),
      book: (b) => setBook(b),
      trades: (ts, snapshot) => {
        if (snapshot || !ts.length) return; // history dump: already inside the REST candle volume
        const last = ts[ts.length - 1];
        clockOffset.current = last.ts - Date.now();
        tape.current.add(ts);
        dirty = true;
        // forming-candle update from the tape (chronological → last = newest print)
        applyPrice(last.price, ts.reduce((s, t) => s + t.qty, 0), last.ts);
      },
    });
    feed.start();
    const flush = setInterval(() => { if (dirty) { dirty = false; setTapeVer((v) => v + 1); } }, 1000);
    return () => { feed.stop(); clearInterval(flush); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  function applyPrice(price: number, vol: number, ts: number) {
    setCandles((prev) => {
      if (!prev.length) return prev;
      const ms = TF_MS[tfRef.current] ?? 900_000;
      const start = Math.floor(ts / ms) * ms;
      const last = prev[prev.length - 1];
      if (start > last.ts) {
        return [...prev.slice(-499), { ts: start, open: last.close, high: Math.max(last.close, price), low: Math.min(last.close, price), close: price, volume: vol }];
      }
      if (start < last.ts) return prev;
      const nb = { ...last, close: price, high: Math.max(last.high, price), low: Math.min(last.low, price), volume: last.volume + vol };
      return [...prev.slice(0, -1), nb];
    });
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
    const iv = setInterval(() => load(false), 20_000);
    return () => { alive = false; clearInterval(iv); };
  }, [symbol, tf]);

  // REST ticker fallback/poll (also when WS is down)
  useEffect(() => {
    let alive = true;
    const poll = () => fetchTicker(symbol).then((t) => {
      if (!alive || !t) return;
      setTicker(t);
      if (status !== 'live') applyPrice(t.last, 0, Date.now() + clockOffset.current);
    }).catch(() => {});
    poll();
    const iv = setInterval(poll, status === 'live' ? 10_000 : 2_500);
    return () => { alive = false; clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, status]);

  const ms = TF_MS[tf] ?? 900_000;
  const serverNow = () => Date.now() + clockOffset.current;
  return { candles, ticker, book, status, err, tape, tapeVer, intervalMs: ms, serverNow };
}
