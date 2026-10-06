/** Bitget PUBLIC market data (no keys). Direct fetch first (CORS allowed), same-origin /bgapi proxy fallback. */
/** Numeric candle; ts = candle OPEN time (ms). Assignable to @bitget-sim/dupont CandleInput. */
export interface Candle { ts: number; open: number; high: number; low: number; close: number; volume: number }

const DIRECT = 'https://api.bitget.com';
// same-origin proxy only exists on the Vite dev/preview server (KSHUN :5174); harmless 404 on static hosting
const PROXY = `${import.meta.env.BASE_URL}bgapi`;
let useProxy = false;

async function getJson(path: string): Promise<any> {
  const bases = useProxy ? [PROXY, DIRECT] : [DIRECT, PROXY];
  let lastErr: unknown;
  for (const base of bases) {
    try {
      const res = await fetch(base + path, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      if (j.code !== '00000') throw new Error(j.msg || 'bitget error');
      useProxy = base === PROXY;
      return j.data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

export const GRAN: Record<string, { api: string; sec: number }> = {
  '1m': { api: '1m', sec: 60 },
  '5m': { api: '5m', sec: 300 },
  '15m': { api: '15m', sec: 900 },
  '1h': { api: '1H', sec: 3600 },
};

/** `range` (ms, N1 replay): Bitget returns the NEWEST ≤ limit bars inside [startTime, endTime]. */
export async function fetchCandles(symbol: string, tf: string, limit = 300, range?: { startTime: number; endTime: number }): Promise<Candle[]> {
  const g = GRAN[tf] ?? GRAN['15m'];
  const win = range ? `&startTime=${Math.floor(range.startTime)}&endTime=${Math.floor(range.endTime)}` : '';
  const data = await getJson(`/api/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${symbol}&granularity=${g.api}&limit=${limit}${win}`);
  // dedupe by open ts (last row wins), then chronological
  const byTs = new Map<number, Candle>();
  for (const r of data as string[][]) {
    const c = { ts: Number(r[0]), open: +r[1], high: +r[2], low: +r[3], close: +r[4], volume: +r[5] };
    if (Number.isFinite(c.ts)) byTs.set(c.ts, c);
  }
  return [...byTs.values()].sort((a, b) => a.ts - b.ts);
}

/** Bitget serves 1m `candles` only ~30 days back (probe 2026-10-06: 35 / 60 days → 0 rows). */
export const MINUTE_HISTORY_MS = 30 * 86_400_000 - 3_600_000;
/** 1m bars over [from, to] oldest first, paging forward in 1000-minute windows (≤ 44 sequential requests);
 *  `from` is clamped to the endpoint's history depth — `clampedFrom` > from means the older part is not replayable. */
export async function fetchMinuteBars(symbol: string, from: number, to: number): Promise<{ bars: Candle[]; clampedFrom: number }> {
  const W = 1000 * 60_000;
  const start = Math.floor(Math.max(from, to - MINUTE_HISTORY_MS) / 60_000) * 60_000;
  const out = new Map<number, Candle>();
  for (let s = start; s <= to; s += W) {
    const rows = await fetchCandles(symbol, '1m', 1000, { startTime: s, endTime: Math.min(to, s + W - 1) });
    for (const c of rows) out.set(c.ts, c);
    if (s + W <= to) await new Promise((r) => setTimeout(r, 120)); // stay far below the public rate limit
  }
  return { bars: [...out.values()].sort((a, b) => a.ts - b.ts), clampedFrom: start };
}

/** Settled funding rates (public, no keys): fundingTime = the 00/08/16 UTC boundary ts. R6: 100 records ≈ 33 days (covers the 30-day replay). */
export async function fetchFundingHistory(symbol: string, pageSize = 100): Promise<Array<{ ts: number; rate: number }>> {
  const data = await getJson(`/api/v2/mix/market/history-fund-rate?symbol=${symbol}&productType=usdt-futures&pageSize=${pageSize}`);
  return ((data ?? []) as Array<{ fundingRate: string; fundingTime: string }>)
    .map((r) => ({ ts: Number(r.fundingTime), rate: Number(r.fundingRate) }))
    .filter((x) => Number.isFinite(x.ts) && Number.isFinite(x.rate));
}

export interface TickerInfo {
  last: number;
  mark: number;
  change24h: number;
  funding: number;
  bid: number;
  ask: number;
}

export async function fetchTicker(symbol: string): Promise<TickerInfo | null> {
  const data = await getJson(`/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${symbol}`);
  const r = Array.isArray(data) ? data[0] : data;
  if (!r) return null;
  return { last: +r.lastPr, mark: +(r.markPrice ?? r.lastPr), change24h: +(r.change24h ?? 0), funding: +(r.fundingRate ?? 0), bid: +r.bidPr, ask: +r.askPr };
}

export async function fetchBook(symbol: string): Promise<{ bids: Array<[number, number]>; asks: Array<[number, number]> }> {
  const d = await getJson(`/api/v2/mix/market/merge-depth?productType=USDT-FUTURES&symbol=${symbol}&limit=15`);
  return { bids: (d.bids ?? []).map((x: string[]) => [+x[0], +x[1]]), asks: (d.asks ?? []).map((x: string[]) => [+x[0], +x[1]]) };
}
