# Google Sheets 웹훅 (모의투자 일지) — schema

The app's journal can append rows to a Google Sheet through K_BOT's Apps Script web app (`dupont_sheet/Code.gs`, append-only).
The schema lives in code at `apps/mobile/src/lib/sheetsSchema.ts`; this document mirrors it. Paper trading only: no exchange
keys, no Google credentials in the app. The only secret is the shared **토큰** that the user types in Settings, and it is stored on the device only.

## Settings (설정 → 구글 시트 연동)
| field | default | meaning |
|---|---|---|
| 웹훅 URL | `''` | Apps Script web-app URL (`https://script.google.com/macros/s/…/exec`); must start with `https://` |
| 토큰 | `''` | must equal `SHARED_TOKEN` in Code.gs |

**Nothing is queued or sent until both are set.** Clearing either field stops sending; rows already queued stay queued but are not sent.
Rows are only sent from the moment both are set: there is no backfill. Older data can be exported as CSV from 기록.

## Request
```
POST <웹훅 URL>
Content-Type: text/plain;charset=utf-8      (a "simple" request, so the browser sends no CORS preflight; Apps Script reads e.postData.contents)

{"token":"<토큰>","tab":"trades"|"tape_pressure"|"signals","rows":[{<column>: value, ...}, ...]}
```
- At most **500 rows** per call, one call per tab. The queue is flushed ~3 s after every closed candle ("batched per closed candle"), every 30 s while rows are waiting, and when the app becomes visible or comes back online.
- Each row object has **exactly** the tab's columns below, in order. Times are ISO-8601 UTC strings (`2026-10-10T00:15:00.000Z`); booleans are JSON `true`/`false`; numbers are JSON numbers; unknown values are `""`.

## Response
`{"ok":true,"appended":n}` means success, and the rows are removed from the queue.
Anything else is a failure, and the rows stay queued:
- an HTTP error
- `{"ok":false,"error":"…"}` (e.g. `bad token`, `unknown tab`)
- a non-JSON body (e.g. a Google login page)
- a network error

Retries back off exponentially (15 s, 30 s, 1 min … capped at 15 min). The queue and the backoff are persisted in localStorage (`dupont.sheets.queue.v1`) and survive reloads.
The queue is capped at 20 000 rows; the oldest `tape_pressure` rows are dropped first.
Settings shows the last attempt (time, ok/error, rows appended), the next retry time, and the queued row count. It also has **지금 전송** (send now, ignores the backoff) and **대기열 비우기** (clear queue).

Note: the sheet is append-only. If a request reaches Apps Script but its response is lost (network drop), the retry appends those rows again.
Dedupe in the sheet if needed:
- tape_pressure: by `ts+symbol+tf`
- signals: by `ts+symbol+tf+kind`
- trades: by `ts_open+ts_close+symbol+side`

## Tabs and columns

### `trades`: one row per **closed** paper position (sent once, when its final fill happens)
| column | type | meaning |
|---|---|---|
| ts_open | ISO UTC | position open time (first fill) |
| ts_close | ISO UTC | final close time |
| symbol | string | e.g. `BTCUSDT` |
| tf | string | chart timeframe selected when the position was opened (`1m`/`5m`/`15m`/`1h`; `''` if unknown) |
| side | `long`/`short` | |
| kind | string | setup: `RANGE_LONG`, `RANGE_SHORT`, `FAKE_BREAKOUT_LONG`, `FAKE_BREAKOUT_SHORT`, `BREAKOUT_LONG`, `BREAKOUT_SHORT`, `MANUAL` |
| entry | number | qty-weighted average entry over the position's fills (adds included) |
| exit | number | qty-weighted average exit |
| qty | number | total closed quantity (base coin) |
| sl_initial | number | initial stop loss |
| tp1 | number | first take-profit target |
| fees_usdt | number | total fees (entry + exit) |
| pnl_usdt | number | net PnL after fees, slippage and funding |
| r_multiple | number | net PnL / position 1R (`''` if no R) |
| exit_reason | string | fill reasons joined with ` + ` (e.g. `TP1 중앙선 + 본절 SL`) |
| adds | number | pyramid adds (불타기) |
| tape_ratio_at_entry | number | buy-pressure ratio (0–1) of the last closed candle when the position appeared |
| tape_source | `trades`/`ohlcv` | source of that ratio (live trade tape or OHLCV approximation) |
| app_version | string | `dupont-mobile/0.1.0-r12` |

### `tape_pressure`: one row per **closed** candle that was fully covered by the live trade tape
| column | type | meaning |
|---|---|---|
| ts | ISO UTC | candle open time |
| symbol | string | |
| tf | string | `1m`/`5m`/`15m`/`1h` (the timeframe on screen) |
| buy | number | aggressor-buy volume (base coin) |
| sell | number | aggressor-sell volume (base coin) |
| ratio | number | buy / (buy + sell), 4 dp |
| n_trades | number | number of public trades aggregated |
| source | `trades` | always `trades` here: candles without full tape coverage are not logged |
| gap | boolean | always `false`: a candle overlapping a WS disconnect gap is not logged |

### `signals`: one row per generated signal, sent once its outcome is final
A signal's outcome is final when it is **taken**, or when the next candle has closed (the signal can no longer be entered).
| column | type | meaning |
|---|---|---|
| ts | ISO UTC | trigger candle open time |
| symbol, tf | string | |
| kind | string | signal type (`RANGE_LONG` … `BREAKOUT_SHORT`) |
| side | `long`/`short` | |
| entry, sl, tp1 | number | signal entry (trigger close), stop, first target |
| box_top, box_bottom | number | box the signal was built from |
| pressure_ratio | number | buy-pressure ratio of the trigger candle |
| pressure_source | `trades`/`ohlcv` | |
| taken | boolean | a paper position was opened from this signal (auto or manual) |
| skip_reason | string | `''` when taken; otherwise one of `auto_paper_off`, `position_open`, `pressure_ohlcv`, `loss_cooldown`, `daily_stop`, `entry_refused`, `not_taken` |

## On the device
- IndexedDB `dupont-journal`, with stores `tape_pressure` (cap 50 000) and `signals` (cap 20 000).
- Keys:
  - tape: `symbol|tf|ts`; the first write wins
  - signals: `symbol|tf|kind|ts`; upserted, and a taken signal is never set back to not taken
- When a store is over its cap, the oldest records by candle/signal time are pruned.
- tape records also keep the candle OHLCV (open/high/low/close/volume) on the device. These fields are not sent and not exported.
- 기록 → CSV 내보내기 has 거래 / 테이프 압력 / 신호. Each file uses exactly the columns above.
