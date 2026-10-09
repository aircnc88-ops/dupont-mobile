import type { Pressure } from '@bitget-sim/dupont';

/** Tape aggregation granularity: 1-minute buckets, summed per candle for any timeframe. */
export const TAPE_BUCKET_MS = 60_000;

interface Bucket { buy: number; sell: number; n: number }
export interface TapeTrade { ts: number; qty: number; side: 'buy' | 'sell' }

/**
 * Per-minute aggressor buy/sell totals built ON ARRIVAL (item A5): memory is bounded by the
 * number of minutes kept, not by the trade count, so a busy candle is never truncated.
 *
 * Coverage (items A5 + C7 + N2–N4): a candle counts as tape-sourced only when it starts at/after
 * the first full minute after the first connect (`coverFrom`, anchored on the newest snapshot
 * print's server ts) and after the oldest kept minute, and does not overlap a disconnect gap
 * `[floor(last message), ceil(newest print on reconnect))`. Buckets survive reconnects.
 */
export class TapeBuckets {
  private b = new Map<number, Bucket>();
  coverFrom = Infinity;
  gaps: Array<[number, number]> = [];
  private downSince: number | null = null;

  constructor(private maxBuckets = 1500) {}

  reset(): void {
    this.b.clear();
    this.coverFrom = Infinity;
    this.gaps = [];
    this.downSince = null;
  }

  connected(ts: number): void {
    const start = Math.ceil(ts / TAPE_BUCKET_MS) * TAPE_BUCKET_MS;
    if (!Number.isFinite(this.coverFrom)) this.coverFrom = start;
    else if (this.downSince !== null) {
      const from = Math.floor(this.downSince / TAPE_BUCKET_MS) * TAPE_BUCKET_MS;
      if (start > from) this.gaps.push([from, start]);
    }
    this.downSince = null;
  }

  /** true until the first connect, and while a disconnect is open (no reconnect anchor yet) */
  get awaitingConnect(): boolean {
    return !Number.isFinite(this.coverFrom) || this.downSince !== null;
  }

  disconnected(ts: number): void {
    if (this.downSince === null && Number.isFinite(this.coverFrom)) this.downSince = ts;
  }

  add(trades: readonly TapeTrade[]): void {
    for (const t of trades) {
      const k = Math.floor(t.ts / TAPE_BUCKET_MS) * TAPE_BUCKET_MS;
      const x = this.b.get(k) ?? { buy: 0, sell: 0, n: 0 };
      if (t.side === 'buy') x.buy += t.qty;
      else x.sell += t.qty;
      x.n++;
      this.b.set(k, x);
    }
    if (this.b.size > this.maxBuckets) {
      const keys = [...this.b.keys()].sort((a, z) => a - z);
      for (const k of keys.slice(0, this.b.size - this.maxBuckets)) this.b.delete(k);
      const oldest = keys[keys.length - this.b.size];
      this.gaps = this.gaps.filter(([, to]) => to > oldest);
      // N2: a candle starting before the oldest kept minute is no longer fully covered
      this.coverFrom = Math.max(this.coverFrom, oldest);
    }
  }

  /** true when [ts, ts + intervalMs) is fully inside tape coverage */
  covers(ts: number, intervalMs: number): boolean {
    if (ts < this.coverFrom) return false;
    const end = ts + intervalMs;
    if (this.downSince !== null && end > Math.floor(this.downSince / TAPE_BUCKET_MS) * TAPE_BUCKET_MS) return false;
    return !this.gaps.some(([a, z]) => ts < z && end > a);
  }

  /** Raw aggressor totals + trade count for a fully covered candle, or null when not covered (journal logging). */
  stats(ts: number, intervalMs: number): { buy: number; sell: number; n: number } | null {
    if (!this.covers(ts, intervalMs)) return null;
    let buy = 0, sell = 0, n = 0;
    for (let k = Math.floor(ts / TAPE_BUCKET_MS) * TAPE_BUCKET_MS; k < ts + intervalMs; k += TAPE_BUCKET_MS) {
      const x = this.b.get(k);
      if (x) { buy += x.buy; sell += x.sell; n += x.n; }
    }
    return { buy, sell, n };
  }

  /** Tape pressure for the candle, or null when not covered / no trades (→ OHLCV fallback). */
  pressure(ts: number, intervalMs: number, minTrades = 1): Pressure | null {
    if (!this.covers(ts, intervalMs)) return null;
    let buy = 0, sell = 0, n = 0;
    for (let k = Math.floor(ts / TAPE_BUCKET_MS) * TAPE_BUCKET_MS; k < ts + intervalMs; k += TAPE_BUCKET_MS) {
      const x = this.b.get(k);
      if (x) { buy += x.buy; sell += x.sell; n += x.n; }
    }
    if (n < minTrades) return null;
    const tot = buy + sell;
    return { buy, sell, net: buy - sell, ratio: tot > 0 ? buy / tot : 0.5, source: 'trades' };
  }
}
