# 듀퐁 스탠다드 모바일 페이퍼 트레이딩 (모의투자 전용)

Bitget USDT-M 무기한 선물 **모의(페이퍼) 트레이딩** 모바일 PWA. 실제 주문/API 키 없음 — Bitget **공개** 시세 데이터(REST/WS)만 사용합니다.

- Live: https://aircnc88-ops.github.io/dupont-mobile/
- 시드 200 USDT, 자동매매 기본 OFF

## 구조
- `packages/dupont` — 듀퐁 스탠다드 전략 라이브러리 (순수 TS, decimal.js): 박스권(피봇 클러스터), 50% 중앙선, 압력(체결 aggressor / OHLCV 근사), 장악형, 신호 3종(박스 반전 / 가짜 이탈 / 진짜 돌파), SL/TP(돌파 TP는 수수료·슬리피지 차감 순 1:3), 압력반전 경고, 불타기, 포지션 사이징
- `apps/mobile` — Vite + React + TS + Tailwind 앱 (dev :5174)
  - `src/data/bitget.ts`, `src/data/ws.ts` — Bitget public REST / WebSocket (캔들·티커·호가·체결)
  - `src/lib/tape.ts` — 실시간 체결을 1분 버킷으로 집계 (재연결 시 공백 구간은 OHLCV 근사로 대체)
  - `src/useDupont.ts` — 마감 캔들 기준 신호 (서버 시계), 신호 박스는 트리거 캔들 제외
  - `src/lib/logStore.ts`, `src/lib/sheetsSync.ts`, `src/lib/sheetsSchema.ts`, `src/useJournal.ts` — 일지(IndexedDB)와 구글 시트 웹훅 대기열
  - `src/paper/broker.ts` — 페이퍼 브로커 (격리 마진, 테이커 0.06% / 메이커 0.02%, 슬리피지 2bp, 8시간 펀딩 근사, 마크가 청산, R 통계)
- `packages/shared` — 모노레포(bitget-trading-sim)의 공개 타입·Bitget 수수료 모델 사본 (최소 부분집합)

## 일지 · 구글 시트 연동 (선택)
- **테이프 압력 로그**: 실시간 체결로 완전히 커버된 마감 캔들마다 매수/매도 체결량·비율·체결 수를 IndexedDB(`dupont-journal`)에 저장. 심볼+TF+시각으로 중복 제거하고, 5만 행을 넘으면 오래된 것부터 삭제. 생성된 모든 신호도 진입 여부와 생략 사유를 함께 저장 (2만 건).
- **CSV 내보내기** (기록 탭): 거래 / 테이프 압력 / 신호. 열 구성은 시트 탭과 같음.
- **구글 시트 웹훅** (설정 → 구글 시트 연동): `웹훅 URL`과 `토큰`이 **둘 다** 입력된 경우에만 `{"token","tab","rows"}` JSON을 `Content-Type: text/plain`으로 POST (프리플라이트 없음, 1회 최대 500행, 캔들 마감마다 묶어서 전송). `{ok:true}`가 아닌 응답은 실패로 보고 기기에 대기열로 보관했다가 백오프 재시도(15초 → 최대 15분). 마지막 동기화 상태는 설정에 표시.
- 탭: `trades`, `tape_pressure`, `signals`. 열 정의는 [`SHEETS_WEBHOOK.md`](SHEETS_WEBHOOK.md), 코드는 `apps/mobile/src/lib/sheetsSchema.ts` (K_BOT Apps Script `Code.gs`와 동일).
- 모의투자 데이터만 전송. 거래소 키·구글 자격증명 없음. 토큰은 이 기기에만 저장.

## 명령
```
npm install
npm test                                    # packages/dupont + apps/mobile 테스트
npm run dev -w @bitget-sim/mobile          # http://localhost:5174 (--host)
npm run build:pages -w @bitget-sim/mobile  # GitHub Pages 빌드 (base /dupont-mobile/, React/차트는 esm.sh CDN)
```

⚠️ 투자 조언 아님. 모의투자 전용.
