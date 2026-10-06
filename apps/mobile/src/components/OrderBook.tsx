import type { WsBook } from '../data/ws';
import { fmt } from '../lib/format';

/** Size in the contract's qty precision (volumePlace); large sizes trimmed so the column never overflows. */
const fmtSize = (q: number, qdp: number) => fmt(q, q >= 1000 ? 0 : q >= 100 ? Math.min(qdp, 1) : q >= 10 ? Math.min(qdp, 2) : Math.min(qdp, 4));

/** books15 mini ladder + bid/ask imbalance gauge. */
export default function OrderBook({ book, dp, qdp = 3, rows = 6 }: { book: WsBook | null; dp: number; qdp?: number; rows?: number }) {
  if (!book) return <div className="text-muted text-xs p-3">호가 연결 중…</div>;
  const asks = book.asks.slice(0, rows).reverse();
  const bids = book.bids.slice(0, rows);
  const sb = book.bids.reduce((s, x) => s + x[1], 0);
  const sa = book.asks.reduce((s, x) => s + x[1], 0);
  const imb = sa + sb > 0 ? (sb - sa) / (sa + sb) : 0;
  const maxQ = Math.max(...asks.map((x) => x[1]), ...bids.map((x) => x[1]), 1e-9);
  const row = (x: [number, number], side: 'a' | 'b') => (
    <div key={`${side}${x[0]}`} className="relative flex justify-between text-[12px] num h-5 items-center px-2">
      <div className={`absolute inset-y-0 right-0 ${side === 'a' ? 'bg-down/15' : 'bg-up/15'}`} style={{ width: `${(x[1] / maxQ) * 100}%` }} />
      <span className={`relative ${side === 'a' ? 'text-down' : 'text-up'}`}>{fmt(x[0], dp)}</span>
      <span className="relative text-muted">{fmtSize(x[1], qdp)}</span>
    </div>
  );
  return (
    <div>
      <div className="px-2 pb-1 text-[11px] text-muted flex justify-between"><span>가격</span><span>수량</span></div>
      {asks.map((x) => row(x, 'a'))}
      <div className="h-px bg-line my-1" />
      {bids.map((x) => row(x, 'b'))}
      <div className="px-2 pt-2">
        <div className="flex justify-between text-[11px] num"><span className="text-up">매수 {Math.round(((imb + 1) / 2) * 100)}%</span><span className="text-muted">호가 불균형 (15)</span><span className="text-down">매도 {Math.round(((1 - imb) / 2) * 100)}%</span></div>
        <div className="h-2 rounded-full bg-down/70 overflow-hidden mt-1">
          <div className="h-full bg-up" style={{ width: `${((imb + 1) / 2) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
