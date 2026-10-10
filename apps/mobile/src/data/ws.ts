/**
 * Minimal Bitget PUBLIC WebSocket client (browser): ticker, books15, trade for one
 * USDT-FUTURES instrument. No auth, no keys. Auto-reconnect with backoff; "ping" every 25s and a
 * pong watchdog (no "pong" for 2 pings + 5s → reconnect).
 * Verified against live v2 messages (2026-10-06, twice): trade pushes carry `action` "snapshot" (50
 * recent prints on subscribe) then "update"; `data` is NEWEST-FIRST; side is lowercase buy/sell;
 * every print has a `tradeId` (used to drop repeats, C6).
 * r13 (logging only): also subscribes the full-depth `books` channel for order-book pressure logging (lib/obPressure.ts).
 * Verified live 2026-10-10: one `snapshot` (BTC/ETH 500, SOL 200 levels per side) then `update` pushes (~8/s) whose
 * `pseq` equals the previous push's `seq`; no checksum field; size "0" deletes a level.
 */
import { parseBooksPush, type BooksPush } from '../lib/obPressure';
export interface WsTicker { last: number; mark: number; funding: number; change24h: number; bid: number; ask: number }
export interface WsTrade { ts: number; price: number; qty: number; side: 'buy' | 'sell'; id?: string }
export interface WsBook { bids: Array<[number, number]>; asks: Array<[number, number]>; ts: number }
export type WsStatus = 'connecting' | 'live' | 'reconnecting' | 'closed';

export interface WsHandlers {
  ticker?: (t: WsTicker) => void;
  /** chronological (oldest → newest); `snapshot` = the initial history dump sent on subscribe */
  trades?: (t: WsTrade[], snapshot: boolean) => void;
  book?: (b: WsBook) => void;
  /** r13: full-depth `books` push (order-book pressure logging); return false to request a fresh snapshot */
  depth?: (p: BooksPush) => boolean | void;
  status?: (s: WsStatus) => void;
}

const URL = 'wss://ws.bitget.com/v2/ws/public';

/** Parse a v2 `trade` push: data is newest-first on the wire → returned chronological. */
export function parseTradePush(msg: any): { trades: WsTrade[]; snapshot: boolean } {
  const data: any[] = Array.isArray(msg?.data) ? msg.data : [];
  const trades: WsTrade[] = data.map((r) => ({ ts: +r.ts, price: +r.price, qty: +r.size, side: r.side === 'sell' ? 'sell' : 'buy', ...(r.tradeId !== undefined ? { id: String(r.tradeId) } : {}) }));
  trades.reverse();
  return { trades, snapshot: msg?.action === 'snapshot' };
}

/** C6: drops prints whose tradeId was already seen (re-sent snapshot / duplicate pushes). Bounded memory. */
export class TradeDedupe {
  private seen = new Set<string>();
  constructor(private max = 5000) {}
  filter(trades: readonly WsTrade[]): WsTrade[] {
    const out: WsTrade[] = [];
    for (const t of trades) {
      if (t.id === undefined) { out.push(t); continue; }
      if (this.seen.has(t.id)) continue;
      this.seen.add(t.id);
      out.push(t);
    }
    if (this.seen.size > this.max) {
      let drop = this.seen.size - this.max;
      for (const k of this.seen) { if (drop-- <= 0) break; this.seen.delete(k); } // Set keeps insertion order → oldest first
    }
    return out;
  }
}

export class BitgetPublicFeed {
  private ws: WebSocket | null = null;
  private closed = false;
  private attempt = 0;
  private ping: ReturnType<typeof setInterval> | null = null;
  private lastPong = 0;
  connectedAt = 0;
  /** local time of the last message on the current/last socket (N3: a disconnect gap starts here) */
  lastMsgAt = 0;

  constructor(private symbol: string, private h: WsHandlers) {}

  start(): void {
    this.closed = false;
    this.open();
  }

  stop(): void {
    this.closed = true;
    if (this.ping) clearInterval(this.ping);
    this.ws?.close();
    this.ws = null;
    this.h.status?.('closed');
  }

  private open(): void {
    if (this.closed) return;
    this.h.status?.(this.attempt ? 'reconnecting' : 'connecting');
    let ws: WebSocket;
    try {
      ws = new WebSocket(URL);
    } catch {
      return this.retry();
    }
    this.ws = ws;
    ws.onopen = () => {
      this.attempt = 0;
      this.connectedAt = Date.now();
      const args = ['ticker', 'books15', 'trade', 'books'].map((channel) => ({ instType: 'USDT-FUTURES', channel, instId: this.symbol }));
      ws.send(JSON.stringify({ op: 'subscribe', args }));
      this.lastPong = Date.now();
      this.ping = setInterval(() => {
        if (ws.readyState !== 1) return;
        if (Date.now() - this.lastPong > 2 * 25_000 + 5_000) { ws.close(); return; } // stale socket → reconnect
        ws.send('ping');
      }, 25_000);
      this.h.status?.('live');
    };
    ws.onmessage = (ev) => {
      this.lastMsgAt = Date.now();
      const raw = typeof ev.data === 'string' ? ev.data : '';
      if (raw === 'pong') { this.lastPong = Date.now(); return; }
      if (!raw) return;
      let msg: any;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }
      const ch = msg?.arg?.channel;
      const data = msg?.data;
      if (!ch || !Array.isArray(data) || !data.length) return;
      if (ch === 'ticker') {
        const r = data[0];
        this.h.ticker?.({ last: +r.lastPr, mark: +(r.markPrice ?? r.lastPr), funding: +(r.fundingRate ?? 0), change24h: +(r.change24h ?? 0), bid: +r.bidPr, ask: +r.askPr });
      } else if (ch === 'books15') {
        const r = data[0];
        this.h.book?.({ bids: (r.bids ?? []).map((x: string[]) => [+x[0], +x[1]]), asks: (r.asks ?? []).map((x: string[]) => [+x[0], +x[1]]), ts: +r.ts });
      } else if (ch === 'books') {
        const p = parseBooksPush(msg);
        if (p && this.h.depth?.(p) === false) this.resubscribe('books');
      } else if (ch === 'trade') {
        const t = parseTradePush(msg);
        this.h.trades?.(t.trades, t.snapshot);
      }
    };
    ws.onclose = () => {
      if (this.ping) clearInterval(this.ping);
      if (!this.closed) this.retry();
    };
    ws.onerror = () => ws.close();
  }

  /** r13: unsubscribe + subscribe one channel (a `books` sequence break → the server sends a fresh snapshot) */
  private resubAt = 0;
  resubscribe(channel: string): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== 1 || Date.now() - this.resubAt < 2000) return; // at most one resubscribe per 2 s
    this.resubAt = Date.now();
    const args = [{ instType: 'USDT-FUTURES', channel, instId: this.symbol }];
    ws.send(JSON.stringify({ op: 'unsubscribe', args }));
    ws.send(JSON.stringify({ op: 'subscribe', args }));
  }

  private retry(): void {
    this.h.status?.('reconnecting');
    const delay = Math.min(30_000, 1000 * 2 ** this.attempt++);
    setTimeout(() => this.open(), delay);
  }
}
