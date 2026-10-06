export type FeeSide = { maker: string; taker: string; taxReserved?: string };
export type FeeProfile = {
  spot: FeeSide;
  swap: FeeSide;
  stock: FeeSide;
};

export const FEE_PROFILES: Record<string, FeeProfile> = {
  bitget_default: {
    spot: { maker: '0.001', taker: '0.001' },
    swap: { maker: '0.0002', taker: '0.0006' },
    stock: { maker: '0.00015', taker: '0.00015', taxReserved: '0' },
  },
};

export function getFeeRate(
  profileName: string,
  market: 'spot' | 'swap' | 'stock',
  liquidity: 'maker' | 'taker',
): string {
  const profile = FEE_PROFILES[profileName] ?? FEE_PROFILES.bitget_default;
  const rates = profile[market];
  return liquidity === 'maker' ? rates.maker : rates.taker;
}
