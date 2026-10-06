// Public subset of @bitget-sim/shared types used by @bitget-sim/dupont (type-only imports).
export type OrderSide = 'buy' | 'sell';

export interface Candle {
  symbol: string;
  interval: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  ts: number;
}

export interface PublicTrade {
  id: string;
  symbol: string;
  side: OrderSide;
  price: string;
  qty: string;
  ts: number;
}
