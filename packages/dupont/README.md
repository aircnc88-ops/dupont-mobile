# @bitget-sim/dupont

Pure-TypeScript implementation of the 차트슈타인 "듀퐁 스탠다드" (Dupont Standard)
box / pressure strategy for paper trading (default BTCUSDT perpetual, 15m).
No network, no keys, no side effects — feed it candles (and optionally public
trades) and it returns boxes, pressure bars, signals, management alerts and sizing.

```ts
import { analyzeDupont, sizePosition } from '@bitget-sim/dupont';

const { box, pressures, signals } = analyzeDupont(candles, { trades });
const sig = signals[0];
if (sig) {
  const size = sizePosition({ equity: 10_000, riskPct: 1, entry: sig.entry, sl: sig.sl, leverage: 10 });
}
```

Conventions (matching `@bitget-sim/shared`): prices / quantities / money are
decimal **strings** computed with decimal.js; analytic metrics (pressure volumes,
ratios, ATR, touch counts) are plain numbers. Inputs accept `Candle` /
`PublicTrade` from `@bitget-sim/shared` (numeric fields are also accepted).

Rules after review round 1 (TypeSafe Jev):
- Break tolerance = min(tolerancePct% of the edge, 10% of box height); a close within it is
  "inside" (no dead zone). Boxes need height ≥ 0.6% of price for `isRange`.
- FAKE_BREAKOUT_*: wick beyond the box on the trigger or previous candle (2-candle window) AND a
  reversal trigger candle (bullish/bearish, close beyond the candle midpoint).
- RANGE_* / FAKE_*: dropped when TP1's net R (fees + slippage) < `minNetR1` (default 1).
- BREAKOUT_*: always require `box.isRange`; SL beyond the breakout candle only; TP at NET 1:3
  (`netRMultiple(entry, sl, tp) = 3` with taker fees on both legs and `slippageBps`).
- SL buffer = max(0.03% of the wick, 0.1 × box ATR).
- `pressureFlipAlertDetail` needs real tape pressure on the (closed) last candle (`requireTape`).
- `pyramidSuggestion` never uses the entry candle or the last add's candle as a retest
  (`openedTs`, `lastAddTs`) and needs a ≥ 0.5R move away from the level first.
- `sizePosition`: margin cap on `available` incl. the entry fee, optional `slippageBps`,
  `minQty` / `minNotional` (→ qty 0 + `belowMin`). Pass realized equity (no uPnL).

Tests: `npm test -w @bitget-sim/dupont` (package-local vitest config).
