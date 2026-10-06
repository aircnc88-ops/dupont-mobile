/** localStorage persistence (sync, small JSON). */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}
export function loadRaw<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
export function save(key: string, v: unknown): void {
  try {
    if (v === null || v === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* quota */
  }
}

export interface Settings {
  symbol: string;
  tf: string;
  riskPct: number;
  leverage: number;
  autoPaper: boolean;
  moveSlToBe: boolean;
  maxAdds: number;
  addSizePct: number;
  lookback: number;
  tolerancePct: number;
  pivotLeft: number;
  pivotRight: number;
  minTouches: number;
  /** minimum box height, % of price, for a tradeable range */
  minHeightPct: number;
  requireRange: boolean;
  notify: boolean;
  showHist: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  symbol: 'BTCUSDT',
  tf: '15m',
  riskPct: 1,
  leverage: 10,
  autoPaper: false,
  moveSlToBe: true,
  maxAdds: 2,
  addSizePct: 50,
  lookback: 80,
  tolerancePct: 0.25,
  pivotLeft: 3,
  pivotRight: 3,
  minTouches: 2,
  minHeightPct: 0.6,
  requireRange: true,
  notify: false,
  showHist: true,
};
