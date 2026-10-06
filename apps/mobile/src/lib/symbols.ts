/** USDT-M perpetuals in the picker. qtyStep / price decimals verified against Bitget
 *  GET /api/v2/mix/market/contracts?productType=USDT-FUTURES (volumePlace / pricePlace, minTradeUSDT = 5). */
export const SYMBOLS: Array<{ symbol: string; qtyStep: number; dp: number }> = [
  { symbol: 'BTCUSDT', qtyStep: 0.0001, dp: 1 },
  { symbol: 'ETHUSDT', qtyStep: 0.01, dp: 2 },
  { symbol: 'SOLUSDT', qtyStep: 0.1, dp: 3 },
  { symbol: 'XRPUSDT', qtyStep: 1, dp: 4 },
  { symbol: 'DOGEUSDT', qtyStep: 1, dp: 5 },
  { symbol: 'BNBUSDT', qtyStep: 0.01, dp: 2 },
  { symbol: 'ADAUSDT', qtyStep: 1, dp: 4 },
  { symbol: 'LINKUSDT', qtyStep: 1, dp: 3 },
  { symbol: 'AVAXUSDT', qtyStep: 0.1, dp: 3 },
  { symbol: 'SUIUSDT', qtyStep: 0.1, dp: 4 },
];
export const MIN_NOTIONAL_USDT = 5;
const qdpOf = (step: number) => Math.max(0, Math.round(-Math.log10(step)));
export const symInfo = (s: string) => {
  const x = SYMBOLS.find((y) => y.symbol === s) ?? { symbol: s, qtyStep: 0.001, dp: 2 };
  return { ...x, qdp: qdpOf(x.qtyStep) };
};
/** floor a quantity to the contract step without float dust */
export const floorQty = (q: number, step: number) => {
  const d = qdpOf(step);
  return Number((Math.floor(q / step + 1e-9) * step).toFixed(d));
};
export const TIMEFRAMES = ['1m', '5m', '15m', '1h'] as const;
export const TF_MS: Record<string, number> = { '1m': 60_000, '5m': 300_000, '15m': 900_000, '1h': 3_600_000 };
