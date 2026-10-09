import type { SignalRow, TapeRow } from './sheetsSchema';

/**
 * Local journal (IndexedDB): per-candle tape pressure and every generated signal.
 * Deduped by key (tape: symbol|tf|ts, signal: symbol|tf|kind|ts), capped (oldest candle/signal time pruned first).
 * The backend is pluggable: IndexedDB in the browser, an in-memory map in tests / when IndexedDB is unavailable.
 */
export type LogTab = 'tape_pressure' | 'signals';
/** a stored record: the sheet row + its dedupe key + numeric time (prune order) + optional extras (tape: candle OHLCV) */
export type Stored<R> = R & { key: string; tsMs: number; open?: number; high?: number; low?: number; close?: number; volume?: number };
export const LOG_CAPS: Record<LogTab, number> = { tape_pressure: 50_000, signals: 20_000 };

export const tapeKey = (symbol: string, tf: string, tsMs: number) => `${symbol}|${tf}|${tsMs}`;
export const signalKey = (symbol: string, tf: string, kind: string, tsMs: number) => `${symbol}|${tf}|${kind}|${tsMs}`;

export interface LogBackend {
  get(tab: LogTab, key: string): Promise<Stored<any> | undefined>;
  put(tab: LogTab, rec: Stored<any>): Promise<void>;
  count(tab: LogTab): Promise<number>;
  /** delete the n records with the smallest tsMs */
  deleteOldest(tab: LogTab, n: number): Promise<void>;
  /** all records, oldest first */
  all(tab: LogTab): Promise<Stored<any>[]>;
}

export class MemoryBackend implements LogBackend {
  private m: Record<LogTab, Map<string, Stored<any>>> = { tape_pressure: new Map(), signals: new Map() };
  async get(tab: LogTab, key: string) { return this.m[tab].get(key); }
  async put(tab: LogTab, rec: Stored<any>) { this.m[tab].set(rec.key, rec); }
  async count(tab: LogTab) { return this.m[tab].size; }
  async deleteOldest(tab: LogTab, n: number) {
    const old = [...this.m[tab].values()].sort((a, b) => a.tsMs - b.tsMs).slice(0, n);
    for (const r of old) this.m[tab].delete(r.key);
  }
  async all(tab: LogTab) { return [...this.m[tab].values()].sort((a, b) => a.tsMs - b.tsMs); }
}

const DB_NAME = 'dupont-journal', DB_VER = 1;
const req = <T,>(r: IDBRequest<T>) => new Promise<T>((ok, ko) => { r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });

export class IdbBackend implements LogBackend {
  private db: Promise<IDBDatabase>;
  constructor(idb: IDBFactory = indexedDB) {
    this.db = new Promise((ok, ko) => {
      const o = idb.open(DB_NAME, DB_VER);
      o.onupgradeneeded = () => {
        for (const t of ['tape_pressure', 'signals'] as LogTab[]) {
          if (!o.result.objectStoreNames.contains(t)) o.result.createObjectStore(t, { keyPath: 'key' }).createIndex('tsMs', 'tsMs');
        }
      };
      o.onsuccess = () => ok(o.result);
      o.onerror = () => ko(o.error);
    });
  }
  private async store(tab: LogTab, mode: IDBTransactionMode) { return (await this.db).transaction(tab, mode).objectStore(tab); }
  async get(tab: LogTab, key: string) { return req((await this.store(tab, 'readonly')).get(key)); }
  async put(tab: LogTab, rec: Stored<any>) { await req((await this.store(tab, 'readwrite')).put(rec)); }
  async count(tab: LogTab) { return req((await this.store(tab, 'readonly')).count()); }
  async deleteOldest(tab: LogTab, n: number) {
    if (n <= 0) return;
    const st = await this.store(tab, 'readwrite');
    await new Promise<void>((ok, ko) => {
      let left = n;
      const c = st.index('tsMs').openCursor();
      c.onsuccess = () => { const cur = c.result; if (!cur || left <= 0) return ok(); cur.delete(); left--; cur.continue(); };
      c.onerror = () => ko(c.error);
    });
  }
  async all(tab: LogTab) { return req((await this.store(tab, 'readonly')).index('tsMs').getAll()); }
}

export class LogStore {
  constructor(public backend: LogBackend = new MemoryBackend(), private caps: Record<LogTab, number> = LOG_CAPS) {}

  /** insert a closed candle's tape row once (first write wins); returns true when it was new */
  async addTape(row: TapeRow, tsMs: number, extra: { open?: number; high?: number; low?: number; close?: number; volume?: number } = {}): Promise<boolean> {
    const key = tapeKey(row.symbol, row.tf, tsMs);
    if (await this.backend.get('tape_pressure', key)) return false;
    await this.backend.put('tape_pressure', { ...row, ...extra, key, tsMs });
    await this.prune('tape_pressure');
    return true;
  }

  /** insert or update a signal (taken / skip_reason can change while the signal is still valid); returns true when it was new */
  async putSignal(row: SignalRow, tsMs: number): Promise<boolean> {
    const key = signalKey(row.symbol, row.tf, row.kind, tsMs);
    const prev = await this.backend.get('signals', key);
    // never downgrade a taken signal back to not-taken
    const merged = prev?.taken && !row.taken ? { ...prev } : { ...row, key, tsMs };
    await this.backend.put('signals', merged);
    if (!prev) await this.prune('signals');
    return !prev;
  }

  async getSignal(symbol: string, tf: string, kind: string, tsMs: number): Promise<Stored<SignalRow> | undefined> {
    return this.backend.get('signals', signalKey(symbol, tf, kind, tsMs));
  }

  async prune(tab: LogTab): Promise<number> {
    const n = await this.backend.count(tab);
    const over = n - this.caps[tab];
    if (over > 0) await this.backend.deleteOldest(tab, over);
    return Math.max(0, over);
  }

  all(tab: 'tape_pressure'): Promise<Stored<TapeRow>[]>;
  all(tab: 'signals'): Promise<Stored<SignalRow>[]>;
  all(tab: LogTab) { return this.backend.all(tab); }
  count(tab: LogTab) { return this.backend.count(tab); }
}

/** IndexedDB when available, else in-memory (rows then only live until the page closes) */
export function openLogStore(): LogStore {
  try {
    if (typeof indexedDB !== 'undefined') return new LogStore(new IdbBackend(indexedDB));
  } catch { /* private mode etc. */ }
  return new LogStore(new MemoryBackend());
}
