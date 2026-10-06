/** Bitget PUBLIC market data (no keys). Direct fetch first (CORS allowed), same-origin /bgapi proxy fallback. */
import type { Bar } from '../strategy/types';

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

export async function fetchCandles(symbol: string, tf: string, limit = 300): Promise<Bar[]> {
  const g = GRAN[tf] ?? GRAN['15m'];
  const data = await getJson(`/api/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${symbol}&granularity=${g.api}&limit=${limit}`);
  return (data as string[][])
    .map((r) => ({ time: Math.floor(Number(r[0]) / 1000), open: +r[1], high: +r[2], low: +r[3], close: +r[4], volume: +r[5] }))
    .sort((a, b) => a.time - b.time);
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
