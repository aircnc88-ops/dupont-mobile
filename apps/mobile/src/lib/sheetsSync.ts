import { buildBody, MAX_ROWS_PER_POST, project, SHEET_TABS, type SheetTab } from './sheetsSchema';

/**
 * Google Sheets webhook queue (K_BOT's Apps Script). Nothing is queued or sent unless BOTH the URL and the token are set.
 * Rows are queued per tab (persisted), POSTed as text/plain JSON ({token, tab, rows}, ≤ 500 rows), and removed only on
 * a 2xx response whose JSON is {ok:true}. Anything else (network error, HTTP error, {ok:false}, unreadable body) keeps
 * the rows and retries with exponential backoff (15 s → 15 min), persisted across reloads.
 */
export interface SyncConfig { url: string; token: string }
export interface SyncStatus {
  /** last attempt (ms, device clock) */
  at?: number;
  ok?: boolean;
  tab?: SheetTab;
  /** rows appended by the last successful call */
  appended?: number;
  error?: string;
  fails: number;
  /** next attempt not before (ms) after a failure */
  nextAt: number;
  pending: number;
}
interface Persisted { queue: Record<SheetTab, Record<string, unknown>[]>; fails: number; nextAt: number; last?: Omit<SyncStatus, 'fails' | 'nextAt' | 'pending'> }
export interface SyncDeps {
  fetch: (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;
  now: () => number;
  load: () => Persisted | null;
  save: (p: Persisted) => void;
}

export const BACKOFF_BASE_MS = 15_000;
export const BACKOFF_MAX_MS = 15 * 60_000;
/** queue cap: beyond it the oldest tape rows are dropped first (then the oldest of any tab) */
export const QUEUE_CAP = 20_000;
export const backoffMs = (fails: number) => Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** Math.max(0, fails - 1));
export const configured = (c: SyncConfig) => /^https:\/\/\S+$/.test(c.url.trim()) && c.token.trim().length > 0;

const emptyQueue = (): Persisted['queue'] => ({ trades: [], tape_pressure: [], signals: [] });

export class SheetsSync {
  private p: Persisted;
  private busy = false;
  private listeners = new Set<(s: SyncStatus) => void>();

  constructor(private config: () => SyncConfig, private deps: SyncDeps) {
    const l = deps.load();
    this.p = { queue: { ...emptyQueue(), ...(l?.queue ?? {}) }, fails: l?.fails ?? 0, nextAt: l?.nextAt ?? 0, last: l?.last };
  }

  get pending(): number { return SHEET_TABS.reduce((a, t) => a + this.p.queue[t].length, 0); }
  status(): SyncStatus { return { ...(this.p.last ?? {}), fails: this.p.fails, nextAt: this.p.nextAt, pending: this.pending }; }
  subscribe(fn: (s: SyncStatus) => void): () => void { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  queued(tab: SheetTab): ReadonlyArray<Record<string, unknown>> { return this.p.queue[tab]; }

  private persist() { this.deps.save(this.p); const s = this.status(); this.listeners.forEach((f) => f(s)); }

  /** queue rows for a tab; ignored (returns false) while the URL or token is empty */
  enqueue(tab: SheetTab, rows: ReadonlyArray<object>): boolean {
    if (!configured(this.config()) || !rows.length) return false;
    this.p.queue[tab].push(...rows.map((r) => project(tab, r) as unknown as Record<string, unknown>));
    let over = this.pending - QUEUE_CAP;
    for (const t of ['tape_pressure', 'signals', 'trades'] as SheetTab[]) {
      if (over <= 0) break;
      const k = Math.min(over, this.p.queue[t].length);
      this.p.queue[t].splice(0, k);
      over -= k;
    }
    this.persist();
    return true;
  }

  /** drop everything queued (Settings) */
  clear(): void { this.p.queue = emptyQueue(); this.p.fails = 0; this.p.nextAt = 0; this.persist(); }

  /**
   * Send queued rows (one call per tab, ≤ 500 rows each, until empty or a failure).
   * 'off' = URL/token empty (no request), 'wait' = backoff not over, 'busy' = a flush is running.
   */
  async flush(force = false): Promise<'off' | 'wait' | 'busy' | 'idle' | 'ok' | 'fail'> {
    const cfg = this.config();
    if (!configured(cfg)) return 'off';
    if (this.busy) return 'busy';
    if (!force && this.deps.now() < this.p.nextAt) return 'wait';
    if (!this.pending) return 'idle';
    this.busy = true;
    try {
      for (const tab of SHEET_TABS) {
        while (this.p.queue[tab].length) {
          const batch = this.p.queue[tab].slice(0, MAX_ROWS_PER_POST);
          let error = '';
          let appended = 0;
          try {
            const res = await this.deps.fetch(cfg.url.trim(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: buildBody(cfg.token.trim(), tab, batch) });
            const text = await res.text().catch(() => '');
            let j: any = null;
            try { j = JSON.parse(text); } catch { /* not JSON */ }
            if (!res.ok) error = `HTTP ${res.status}`;
            else if (!j || j.ok !== true) error = j?.error ? String(j.error) : '응답 형식 오류';
            else appended = Number(j.appended ?? batch.length);
          } catch (e: any) {
            error = String(e?.message ?? e ?? 'network');
          }
          const at = this.deps.now();
          if (error) {
            this.p.fails += 1;
            this.p.nextAt = at + backoffMs(this.p.fails);
            this.p.last = { at, ok: false, tab, error };
            this.persist();
            return 'fail';
          }
          this.p.queue[tab].splice(0, batch.length);
          this.p.fails = 0;
          this.p.nextAt = 0;
          this.p.last = { at, ok: true, tab, appended };
          this.persist();
        }
      }
      return 'ok';
    } finally {
      this.busy = false;
    }
  }
}
