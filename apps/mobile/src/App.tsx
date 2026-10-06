import { useEffect, useState } from 'react';
import Chart from './components/Chart';
import { fetchCandles, fetchTicker, GRAN, type TickerInfo } from './data/bitget';
import type { Bar } from './strategy/types';

const TABS = ['차트', '거래', '포지션', '기록', '설정'] as const;
const TFS = ['1m', '5m', '15m', '1h'];

export default function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('차트');
  const [symbol] = useState('BTCUSDT');
  const [tf, setTf] = useState('15m');
  const [bars, setBars] = useState<Bar[]>([]);
  const [tk, setTk] = useState<TickerInfo | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    setBars([]);
    const load = () => fetchCandles(symbol, tf).then((b) => { if (alive) { setBars(b); setErr(''); } }).catch((e) => alive && setErr(String(e)));
    const tick = () => fetchTicker(symbol).then((t) => {
      if (!alive || !t) return;
      setTk(t);
      setBars((prev) => {
        if (!prev.length) return prev;
        const sec = GRAN[tf].sec;
        const now = Math.floor(Date.now() / 1000 / sec) * sec;
        const last = prev[prev.length - 1];
        if (now > last.time) return [...prev, { time: now, open: last.close, high: Math.max(last.close, t.last), low: Math.min(last.close, t.last), close: t.last, volume: 0 }];
        const nb = { ...last, close: t.last, high: Math.max(last.high, t.last), low: Math.min(last.low, t.last) };
        return [...prev.slice(0, -1), nb];
      });
    }).catch(() => {});
    load(); tick();
    const a = setInterval(tick, 2000);
    const b = setInterval(load, 30000);
    return () => { alive = false; clearInterval(a); clearInterval(b); };
  }, [symbol, tf]);

  const up = (tk?.change24h ?? 0) >= 0;
  return (
    <div className="h-full flex flex-col pt-safe">
      <header className="px-3 py-2 border-b border-line flex items-end justify-between">
        <div>
          <div className="text-[13px] text-muted">{symbol} 무기한 · 모의</div>
          <div className={`text-2xl font-semibold num ${up ? 'text-up' : 'text-down'}`}>{tk ? tk.last.toLocaleString('en-US', { minimumFractionDigits: 1 }) : '—'}</div>
        </div>
        <div className="text-right text-[11px] text-muted num leading-5">
          <div>24h <span className={up ? 'text-up' : 'text-down'}>{tk ? (tk.change24h * 100).toFixed(2) + '%' : '—'}</span></div>
          <div>마크 {tk ? tk.mark.toLocaleString('en-US') : '—'}</div>
          <div>펀딩 {tk ? (tk.funding * 100).toFixed(4) + '%' : '—'}</div>
        </div>
      </header>
      <main className="flex-1 min-h-0 flex flex-col">
        {tab === '차트' ? (
          <>
            <div className="flex gap-2 px-3 py-2">
              {TFS.map((t) => (
                <button key={t} onClick={() => setTf(t)} className={`px-3 h-8 rounded-full text-sm ${tf === t ? 'bg-accent text-bg font-semibold' : 'bg-panel2 text-muted'}`}>{t}</button>
              ))}
            </div>
            <div className="flex-1 min-h-0">{bars.length ? <Chart bars={bars} /> : <div className="p-6 text-muted text-sm">{err ? `데이터 오류: ${err}` : '캔들 불러오는 중…'}</div>}</div>
            <div className="px-3 py-2 text-[11px] text-muted border-t border-line">듀퐁 스탠다드 박스/압력/신호 기능은 곧 업데이트됩니다 · 페이퍼 트레이딩 전용 · 시드 200 USDT</div>
          </>
        ) : (
          <div className="p-6 text-muted text-sm">{tab} 탭 – 준비 중 (곧 업데이트)</div>
        )}
      </main>
      <nav className="border-t border-line bg-panel pb-safe grid grid-cols-5">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`h-14 text-[13px] ${tab === t ? 'text-accent font-semibold' : 'text-muted'}`}>{t}</button>
        ))}
      </nav>
    </div>
  );
}
