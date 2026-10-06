# 듀퐁 스탠다드 모바일 페이퍼 트레이딩 (모의투자 전용)

Bitget USDT-M 무기한 선물 **모의(페이퍼) 트레이딩** 모바일 PWA. 실제 주문/API 키 없음 — Bitget **공개** 시세 데이터만 사용합니다.

- Live: https://aircnc88-ops.github.io/dupont-mobile/
- 시드 200 USDT, 자동매매 기본 OFF

## 구조
- `apps/mobile` — Vite + React + TS + Tailwind 앱 (dev :5174)
  - `src/data/bitget.ts` — Bitget public REST (캔들/티커/호가)
  - `src/strategy/*` — 박스권(피봇 클러스터), 50% 중앙선, 압력(체결 aggressor / OHLCV 근사), 장악형, 3가지 신호, SL/TP, 압력반전 경고, 불타기, 페이퍼 브로커 (임시 스텁 — 추후 `packages/dupont`로 교체)
- `packages/shared/src/fees.ts` — 모노레포(bitget-trading-sim)의 Bitget 수수료 모델 사본

## 명령
```
npm install
npm run test -w @bitget-sim/mobile
npm run dev -w @bitget-sim/mobile          # http://localhost:5174 (--host)
npm run build:pages -w @bitget-sim/mobile  # GitHub Pages 빌드 (base /dupont-mobile/, React/차트는 esm.sh CDN)
```

⚠️ 투자 조언 아님. 모의투자 전용.
