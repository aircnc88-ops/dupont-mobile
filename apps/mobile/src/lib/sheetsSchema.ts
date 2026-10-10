/**
 * Google Sheets journal schema — matches K_BOT's Apps Script (dupont_sheet/Code.gs, append-only webhook).
 *
 * POST <webhook URL>, Content-Type: text/plain (no CORS preflight; Apps Script reads e.postData.contents)
 *   body: {"token":"<settings 토큰>","tab":"trades"|"tape_pressure"|"signals","rows":[{<column>: value, ...}, ...]}
 *   at most 500 rows per call; response {ok:true, appended:n} | {ok:false, error}
 * Every row object carries exactly the columns below (in this order); the CSV exports use the same columns.
 * Timestamps are ISO-8601 UTC strings (e.g. 2026-10-10T00:15:00.000Z); booleans are JSON true/false.
 * Paper trading only — no exchange credentials anywhere. The token is the shared secret the user types in Settings.
 */
import { OB_COLUMNS } from './obPressure';

export const APP_VERSION = 'dupont-mobile/0.1.0-r12';
export const MAX_ROWS_PER_POST = 500;

export const SHEETS_COLUMNS = {
  trades: ['ts_open', 'ts_close', 'symbol', 'tf', 'side', 'kind', 'entry', 'exit', 'qty', 'sl_initial', 'tp1', 'fees_usdt', 'pnl_usdt', 'r_multiple', 'exit_reason', 'adds', 'tape_ratio_at_entry', 'tape_source', 'app_version'],
  tape_pressure: ['ts', 'symbol', 'tf', 'buy', 'sell', 'ratio', 'n_trades', 'source', 'gap'],
  signals: ['ts', 'symbol', 'tf', 'kind', 'side', 'entry', 'sl', 'tp1', 'box_top', 'box_bottom', 'pressure_ratio', 'pressure_source', 'taken', 'skip_reason'],
} as const;
export type SheetTab = keyof typeof SHEETS_COLUMNS;
export const SHEET_TABS = Object.keys(SHEETS_COLUMNS) as SheetTab[];

type Cell = string | number | boolean | '';
/** one closed position (all its fills): entry/exit qty-weighted, fees/pnl summed (net, funding included), r = Σ net / 1R */
export interface TradeRow {
  ts_open: string; ts_close: string; symbol: string; tf: string; side: 'long' | 'short'; kind: string;
  entry: number; exit: number; qty: number; sl_initial: Cell; tp1: Cell; fees_usdt: number; pnl_usdt: number; r_multiple: Cell;
  exit_reason: string; adds: number; tape_ratio_at_entry: Cell; tape_source: Cell; app_version: string;
}
/** one CLOSED candle; buy/sell = aggressor base-coin volume from the live trade tape */
export interface TapeRow { ts: string; symbol: string; tf: string; buy: number; sell: number; ratio: number; n_trades: number; source: 'trades' | 'ohlcv'; gap: boolean }
/** one generated signal (trigger candle open time); taken = a paper position was opened from it */
export interface SignalRow {
  ts: string; symbol: string; tf: string; kind: string; side: 'long' | 'short'; entry: number; sl: number; tp1: Cell;
  box_top: Cell; box_bottom: Cell; pressure_ratio: number; pressure_source: 'trades' | 'ohlcv'; taken: boolean; skip_reason: string;
}
export type RowOf<T extends SheetTab> = T extends 'trades' ? TradeRow : T extends 'tape_pressure' ? TapeRow : SignalRow;

/** skip_reason values (signals) */
export const SKIP = {
  autoOff: 'auto_paper_off', // auto-paper OFF and not entered manually while the signal was valid
  positionOpen: 'position_open',
  pressureOhlcv: 'pressure_ohlcv', // auto-paper only acts on live tape pressure
  lossCooldown: 'loss_cooldown',
  dailyStop: 'daily_stop',
  entryRefused: 'entry_refused', // auto entry attempted but refused (price moved, size below minimum, …)
  notTaken: 'not_taken',
} as const;

export const iso = (ms: number) => new Date(ms).toISOString();

/**
 * r13: the tape_pressure CSV export = K_BOT's tape_pressure columns + the order-book pressure columns (lib/obPressure.ts).
 * The webhook still sends exactly K_BOT's columns (SHEETS_COLUMNS) — K_BOT's Code.gs maps only its SCHEMA columns,
 * so the ob_* columns reach the sheet only after Code.gs adds them (proposed: TAPE_SHEET_COLUMNS_V2) and the app's
 * SHEETS_COLUMNS.tape_pressure is switched to it in the same change.
 */
export const TAPE_CSV_COLUMNS = [...SHEETS_COLUMNS.tape_pressure, ...OB_COLUMNS] as const;
export const TAPE_SHEET_COLUMNS_V2 = TAPE_CSV_COLUMNS;

/** keep exactly the tab's columns, in order (missing → '') */
export function project<T extends SheetTab>(tab: T, row: object): RowOf<T> {
  const o: Record<string, unknown> = {};
  for (const c of SHEETS_COLUMNS[tab]) o[c] = (row as Record<string, unknown>)[c] ?? '';
  return o as unknown as RowOf<T>;
}

/** the exact POST body K_BOT's Apps Script expects */
export function buildBody(token: string, tab: SheetTab, rows: ReadonlyArray<object>): string {
  if (rows.length > MAX_ROWS_PER_POST) throw new Error(`max ${MAX_ROWS_PER_POST} rows per call`);
  return JSON.stringify({ token, tab, rows: rows.map((r) => project(tab, r)) });
}

const csvCell = (v: unknown): string => {
  if (v === undefined || v === null) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
/** CSV with explicit columns */
export function toCsvCols(cols: readonly string[], rows: ReadonlyArray<object>): string {
  return [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell((r as Record<string, unknown>)[c])).join(','))].join('\n');
}
/** r13: tape_pressure CSV with the order-book columns appended (rows stored before r13 have empty ob_* cells) */
export const toTapeCsv = (rows: ReadonlyArray<object>) => toCsvCols(TAPE_CSV_COLUMNS, rows);
/** CSV with the same columns as the sheet tab */
export function toCsv(tab: SheetTab, rows: ReadonlyArray<object>): string {
  const cols = SHEETS_COLUMNS[tab];
  return [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell((r as Record<string, unknown>)[c])).join(','))].join('\n');
}
