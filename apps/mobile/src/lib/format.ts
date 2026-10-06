export const fmt = (v: number | string | undefined | null, dp = 2) => {
  const n = typeof v === 'string' ? Number(v) : v;
  if (n === undefined || n === null || !Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
};
export const pct = (v: number, dp = 2) => (Number.isFinite(v) ? `${v >= 0 ? '+' : ''}${(v * 100).toFixed(dp)}%` : '—');
export const signed = (v: number, dp = 2) => {
  if (!Number.isFinite(v)) return '—';
  const r = Number(v.toFixed(dp));
  return r === 0 ? (0).toFixed(dp) : `${r > 0 ? '+' : ''}${r.toFixed(dp)}`; // no "-0.00"
};
export const hhmm = (ms: number) => new Date(ms).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
export const mdhm = (ms: number) => {
  const d = new Date(ms);
  return `${d.getMonth() + 1}/${d.getDate()} ${hhmm(ms)}`;
};
