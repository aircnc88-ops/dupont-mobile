import { useEffect, useRef } from 'react';
import { createChart, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import type { Bar } from '../strategy/types';

export default function Chart({ bars }: { bars: Bar[] }) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const series = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const fitted = useRef(false);

  useEffect(() => {
    if (!el.current) return;
    const c = createChart(el.current, {
      autoSize: true,
      layout: { background: { color: '#0b0e11' }, textColor: '#8a94a3', fontSize: 11 },
      grid: { vertLines: { color: '#161b22' }, horzLines: { color: '#161b22' } },
      rightPriceScale: { borderColor: '#262e38' },
      timeScale: { borderColor: '#262e38', timeVisible: true, secondsVisible: false, rightOffset: 4 },
      crosshair: { mode: 0 },
      handleScale: { pinch: true, mouseWheel: true, axisPressedMouseMove: true },
      handleScroll: { horzTouchDrag: true, vertTouchDrag: false },
      localization: { timeFormatter: (t: number) => new Date(t * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) },
    });
    series.current = c.addCandlestickSeries({ upColor: '#2ebd85', downColor: '#f6465d', borderVisible: false, wickUpColor: '#2ebd85', wickDownColor: '#f6465d' });
    chart.current = c;
    return () => { c.remove(); chart.current = null; series.current = null; fitted.current = false; };
  }, []);

  useEffect(() => {
    if (!series.current || !bars.length) return;
    series.current.setData(bars.map((b) => ({ time: b.time as any, open: b.open, high: b.high, low: b.low, close: b.close })));
    if (!fitted.current) { chart.current?.timeScale().setVisibleLogicalRange({ from: bars.length - 70, to: bars.length + 3 }); fitted.current = true; }
  }, [bars]);

  return <div ref={el} className="w-full h-full" />;
}
