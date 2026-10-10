/**
 * Order-book pressure logging (r13, LOGGING ONLY — never read by signals, entries or the broker).
 *
 * Video definition (차트슈타인 Dupont Standard): per candle, buy pressure vs sell pressure from RESTING order-book depth
 * (bids vs asks), drawn as a green up bar / red down bar; "dominant" = the bigger side. The exact formula is not disclosed,
 * so the design picked by TypeSafe Jev (2026-10-10, D2/S1/1 s) collects several definitions at once:
 *  - a local full-depth book from Bitget v2 `books` (snapshot + incremental updates, seq/pseq chained; a break → resubscribe)
 *  - one sample per second (time-weighted average): top-5 / top-15 base size and USDT notional within ±5 / ±10 bps of mid
 *  - PRIMARY = ±10 bps notional (ob_bid / ob_ask), plus mean / min / max / last per-sample imbalance of the primary
 * Samples are accumulated in 1-minute buckets (like the trade tape), so any timeframe's candle is a sum of its minutes.
 */
export const OB_DEF = 'band10bps_notional_twa_1s';
export const OB_SAMPLE_MS = 1000;
export const OB_BUCKET_MS = 60_000;
/** a candle is "fully covered" when ≥ 90 % of its seconds were sampled and no book gap / disconnect touched it */
export const OB_FULL_COV = 0.9;
/** a book with no message for this long is not sampled (stale socket) */
export const OB_STALE_MS = 5000;

type Level = [number, number];
export interface BooksPush { snapshot: boolean; bids: Level[]; asks: Level[]; seq: number; pseq: number; ts: number }

/** Parse a v2 `books` push (verified live 2026-10-10: data[0] = {asks, bids, ts, seq, pseq}; strings; size "0" = delete). */
export function parseBooksPush(msg: any): BooksPush | null {
  const d = Array.isArray(msg?.data) ? msg.data[0] : null;
  if (!d) return null;
  const lv = (a: any): Level[] => (Array.isArray(a) ? a.map((x: any) => [+x[0], +x[1]] as Level).filter((x) => Number.isFinite(x[0]) && Number.isFinite(x[1])) : []);
  return { snapshot: msg?.action === 'snapshot', bids: lv(d.bids), asks: lv(d.asks), seq: +d.seq, pseq: +d.pseq, ts: +d.ts };
}

/** Local full-depth book. apply() returns false on a sequence break (the caller resubscribes for a fresh snapshot). */
export class LocalBook {
  bids = new Map<number, number>();
  asks = new Map<number, number>();
  seq: number | null = null;
  /** levels per side in the last snapshot (Bitget keeps a window of this many; levels that leave it get no delete) */
  depth = 0;
  /** local receive time of the last applied push */
  at = 0;
  get valid(): boolean { return this.seq !== null; }
  invalidate(): void { this.bids.clear(); this.asks.clear(); this.seq = null; }
  apply(p: BooksPush, now: number): boolean {
    if (p.snapshot) {
      this.bids = new Map(p.bids.filter((x) => x[1] > 0));
      this.asks = new Map(p.asks.filter((x) => x[1] > 0));
      this.depth = Math.max(p.bids.length, p.asks.length);
      this.seq = p.seq;
      this.at = now;
      return true;
    }
    if (this.seq === null) return false; // update before any snapshot
    if (p.pseq !== this.seq) { this.invalidate(); return false; } // missed a push → book no longer trustworthy
    for (const [px, q] of p.bids) { if (q > 0) this.bids.set(px, q); else this.bids.delete(px); }
    for (const [px, q] of p.asks) { if (q > 0) this.asks.set(px, q); else this.asks.delete(px); }
    this.seq = p.seq;
    this.at = now;
    return true;
  }
  /**
   * bids high→low, asks low→high, trimmed to the snapshot depth: a level that drifted out of the exchange's window
   * never gets a delete, so keeping it could later put a stale size back inside the ±bps band.
   */
  sorted(): { bids: Level[]; asks: Level[] } {
    let bids = [...this.bids].sort((a, z) => z[0] - a[0]);
    let asks = [...this.asks].sort((a, z) => a[0] - z[0]);
    if (this.depth > 0 && bids.length > this.depth) { bids = bids.slice(0, this.depth); this.bids = new Map(bids); }
    if (this.depth > 0 && asks.length > this.depth) { asks = asks.slice(0, this.depth); this.asks = new Map(asks); }
    return { bids, asks };
  }
}

/** one 1-second sample: base sums of the top-N levels, USDT notional within ±bps of mid */
export interface ObSample { bid5: number; ask5: number; bid15: number; ask15: number; bidB5: number; askB5: number; bidB10: number; askB10: number }
const SAMPLE_KEYS: Array<keyof ObSample> = ['bid5', 'ask5', 'bid15', 'ask15', 'bidB5', 'askB5', 'bidB10', 'askB10'];

export function sampleBook(bids: readonly Level[], asks: readonly Level[]): ObSample | null {
  if (!bids.length || !asks.length || bids[0][0] >= asks[0][0]) return null; // empty / crossed → no sample
  const mid = (bids[0][0] + asks[0][0]) / 2;
  const top = (s: readonly Level[], n: number) => { let q = 0; for (let i = 0; i < Math.min(n, s.length); i++) q += s[i][1]; return q; };
  const band = (s: readonly Level[], bps: number, side: 1 | -1) => {
    const lim = mid * (1 + (side * bps) / 1e4);
    let v = 0;
    for (const [px, q] of s) { if (side < 0 ? px < lim : px > lim) break; v += px * q; }
    return v;
  };
  return {
    bid5: top(bids, 5), ask5: top(asks, 5), bid15: top(bids, 15), ask15: top(asks, 15),
    bidB5: band(bids, 5, -1), askB5: band(asks, 5, 1), bidB10: band(bids, 10, -1), askB10: band(asks, 10, 1),
  };
}

const imbOf = (b: number, a: number) => (a + b > 0 ? (b - a) / (a + b) : 0);

interface ObBucket { n: number; sum: ObSample; imbSum: number; imbMin: number; imbMax: number; last: number; lastTs: number; gap: boolean }
export interface ObStats { n: number; avg: ObSample; imbAvg: number; imbMin: number; imbMax: number; imbLast: number; gap: boolean }
const zero = (): ObSample => ({ bid5: 0, ask5: 0, bid15: 0, ask15: 0, bidB5: 0, askB5: 0, bidB10: 0, askB10: 0 });

/** Per-minute order-book sample accumulator (bounded like TapeBuckets). Timestamps are server time. */
export class ObBuckets {
  private b = new Map<number, ObBucket>();
  constructor(private maxBuckets = 1500) {}
  reset(): void { this.b.clear(); }
  private bucket(ts: number): ObBucket {
    const k = Math.floor(ts / OB_BUCKET_MS) * OB_BUCKET_MS;
    let x = this.b.get(k);
    if (!x) {
      x = { n: 0, sum: zero(), imbSum: 0, imbMin: Infinity, imbMax: -Infinity, last: 0, lastTs: -Infinity, gap: false };
      this.b.set(k, x);
      if (this.b.size > this.maxBuckets) {
        const keys = [...this.b.keys()].sort((a, z) => a - z);
        for (const old of keys.slice(0, this.b.size - this.maxBuckets)) this.b.delete(old);
      }
    }
    return x;
  }
  add(ts: number, s: ObSample): void {
    const x = this.bucket(ts);
    x.n++;
    for (const k of SAMPLE_KEYS) x.sum[k] += s[k];
    const imb = imbOf(s.bidB10, s.askB10);
    x.imbSum += imb;
    x.imbMin = Math.min(x.imbMin, imb);
    x.imbMax = Math.max(x.imbMax, imb);
    if (ts >= x.lastTs) { x.last = imb; x.lastTs = ts; }
  }
  /** a book sequence break / disconnect at `ts` → that minute (hence its candle) is not fully covered */
  markGap(ts: number): void { this.bucket(ts).gap = true; }
  stats(ts: number, intervalMs: number): ObStats | null {
    let n = 0, imbSum = 0, imbMin = Infinity, imbMax = -Infinity, last = 0, lastTs = -Infinity, gap = false;
    const sum = zero();
    for (let k = Math.floor(ts / OB_BUCKET_MS) * OB_BUCKET_MS; k < ts + intervalMs; k += OB_BUCKET_MS) {
      const x = this.b.get(k);
      if (!x) continue;
      gap ||= x.gap;
      if (!x.n) continue;
      n += x.n;
      for (const key of SAMPLE_KEYS) sum[key] += x.sum[key];
      imbSum += x.imbSum;
      imbMin = Math.min(imbMin, x.imbMin);
      imbMax = Math.max(imbMax, x.imbMax);
      if (x.lastTs >= lastTs) { last = x.last; lastTs = x.lastTs; }
    }
    if (!n) return gap ? { n: 0, avg: zero(), imbAvg: 0, imbMin: 0, imbMax: 0, imbLast: 0, gap } : null;
    const avg = zero();
    for (const key of SAMPLE_KEYS) avg[key] = sum[key] / n;
    return { n, avg, imbAvg: imbSum / n, imbMin, imbMax, imbLast: last, gap };
  }
}

/** the ob_* columns (appended after K_BOT's tape_pressure columns in the IndexedDB record and the CSV) */
export const OB_COLUMNS = ['ob_def', 'ob_samples', 'ob_cov', 'ob_full', 'ob_bid', 'ob_ask', 'ob_ratio', 'ob_imb_avg', 'ob_imb_min', 'ob_imb_max', 'ob_imb_last',
  'ob_bid5', 'ob_ask5', 'ob_bid15', 'ob_ask15', 'ob_bid_b5', 'ob_ask_b5'] as const;
export type ObCell = string | number | boolean;
export type ObFields = Record<(typeof OB_COLUMNS)[number], ObCell>;

const r2 = (x: number) => Math.round(x * 100) / 100;
const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
const r8 = (x: number) => Math.round(x * 1e8) / 1e8;

/**
 * ob_* fields for a closed candle. ob_bid / ob_ask = PRIMARY (avg USDT notional within ±10 bps of mid);
 * ob_bid5/ask5/bid15/ask15 = avg base size of the top 5 / 15 levels; ob_bid_b5/ask_b5 = avg USDT notional within ±5 bps.
 * ob_cov = samples / candle seconds; ob_full = cov ≥ 0.9 and no book gap. No samples at all → every ob_* is '' and ob_full false.
 */
export function obFieldsFor(st: ObStats | null, intervalMs: number): ObFields {
  const e = Object.fromEntries(OB_COLUMNS.map((c) => [c, ''])) as ObFields;
  if (!st || !st.n) return { ...e, ob_def: OB_DEF, ob_samples: 0, ob_cov: 0, ob_full: false };
  const cov = Math.min(1, st.n / (intervalMs / OB_SAMPLE_MS));
  const a = st.avg;
  return {
    ob_def: OB_DEF, ob_samples: st.n, ob_cov: r4(cov), ob_full: cov >= OB_FULL_COV && !st.gap,
    ob_bid: r2(a.bidB10), ob_ask: r2(a.askB10), ob_ratio: a.bidB10 + a.askB10 > 0 ? r4(a.bidB10 / (a.bidB10 + a.askB10)) : 0.5,
    ob_imb_avg: r4(st.imbAvg), ob_imb_min: r4(st.imbMin), ob_imb_max: r4(st.imbMax), ob_imb_last: r4(st.imbLast),
    ob_bid5: r8(a.bid5), ob_ask5: r8(a.ask5), ob_bid15: r8(a.bid15), ob_ask15: r8(a.ask15), ob_bid_b5: r2(a.bidB5), ob_ask_b5: r2(a.askB5),
  };
}

/**
 * Sampler glue (used by useMarket): feeds `books` pushes into the local book, takes one sample per second while the
 * book is valid and fresh, and marks gaps on a sequence break / disconnect. Returns false from onPush when the caller
 * must resubscribe `books` to get a fresh snapshot.
 */
export class ObSampler {
  book = new LocalBook();
  constructor(public buckets: ObBuckets = new ObBuckets()) {}
  onPush(p: BooksPush, nowLocal: number, serverNow: number): boolean {
    const ok = this.book.apply(p, nowLocal);
    if (!ok) this.buckets.markGap(serverNow);
    return ok;
  }
  onDisconnect(serverNow: number): void { if (this.book.valid) this.buckets.markGap(serverNow); this.book.invalidate(); }
  /** one tick of the 1 s timer; returns true when a sample was taken */
  tick(nowLocal: number, serverNow: number): boolean {
    if (!this.book.valid || nowLocal - this.book.at > OB_STALE_MS) return false;
    const { bids, asks } = this.book.sorted();
    const s = sampleBook(bids, asks);
    if (!s) return false;
    this.buckets.add(serverNow, s);
    return true;
  }
}
