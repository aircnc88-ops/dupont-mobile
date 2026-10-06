import { useEffect, useRef } from 'react';
import { createChart, LineStyle, type IChartApi, type IPriceLine, type ISeriesApi, type SeriesMarker, type Time } from 'lightweight-charts';
import type { Box, Pressure, Signal } from '@bitget-sim/dupont';
import type { Candle } from '../data/bitget';
import type { PaperPosition } from '../paper/broker';

interface Props {
  candles: Candle[];
  pressures: Pressure[];
  box: Box | null;
  signals: Signal[];
  positions: PaperPosition[];
  dp: number;
  showHist: boolean;
  editBox: boolean;
  onBoxEdit?: (top: number, bottom: number) => void;
  /** changes on symbol/timeframe switch → re-fit the visible range */
  viewKey?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const SIG_TXT: Record<string, string> = { RANGE: '반전', FAKE: '가짜', BREAKOUT: '돌파' };

export default function Chart(p: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const el = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const series = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lines = useRef<IPriceLine[]>([]);
  const fitted = useRef(false);
  const fittedKey = useRef<string | undefined>(undefined);
  const props = useRef(p);
  props.current = p;
  const drag = useRef<null | 'top' | 'bottom'>(null);

  // overlay: box rectangle, 50% midline, pressure histogram anchored on the midline
  const lastSig = useRef('');
  const draw = (force = true) => {
    const c = chart.current, s = series.current, canvas = cv.current, w = wrap.current;
    if (!c || !s || !canvas || !w) return;
    // cheap per-frame signature: only repaint when the view (pan/zoom/autoscale/size) or data moved
    const { box: b0, candles: c0 } = props.current;
    const lr = c.timeScale().getVisibleLogicalRange();
    const sig = b0 && c0.length
      ? `${w.clientWidth}x${w.clientHeight}|${lr?.from.toFixed(3)}:${lr?.to.toFixed(3)}|${s.priceToCoordinate(Number(b0.top))?.toFixed(2)}|${s.priceToCoordinate(Number(b0.bottom))?.toFixed(2)}`
      : 'none';
    if (!force && sig === lastSig.current) return;
    lastSig.current = sig;
    const dpr = window.devicePixelRatio || 1;
    const W = w.clientWidth, H = w.clientHeight;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    }
    const g = canvas.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const { box, candles, pressures, showHist } = props.current;
    if (!box || !candles.length) return;
    const ts = c.timeScale();
    const priceW = s.priceScale().width();
    const plotW = W - priceW;
    const plotH = H - ts.height();
    const top = Number(box.top), bottom = Number(box.bottom), mid = Number(box.mid);
    const yT = s.priceToCoordinate(top), yB = s.priceToCoordinate(bottom), yM = s.priceToCoordinate(mid);
    if (yT === null || yB === null || yM === null) return;
    const startIdx = Math.max(0, Math.min(box.startIndex, candles.length - 1));
    let x0: number | null = ts.timeToCoordinate((candles[startIdx].ts / 1000) as Time);
    if (x0 === null) x0 = ts.logicalToCoordinate(0 as any) ?? 0;
    const lastX = ts.timeToCoordinate((candles[candles.length - 1].ts / 1000) as Time) ?? plotW;
    // actual on-screen bar spacing (options().barSpacing is the initial value, not the zoomed one)
    const prevX = candles.length > 1 ? ts.timeToCoordinate((candles[candles.length - 2].ts / 1000) as Time) : null;
    const spacing = prevX !== null && lastX !== null ? Math.max(0.5, lastX - prevX) : ts.options().barSpacing;
    const x1 = Math.min(plotW, lastX + spacing * 3);
    const left = Math.max(0, x0 - spacing / 2);
    if (x1 <= left) return;

    g.save();
    g.beginPath(); g.rect(0, 0, plotW, plotH); g.clip();
    g.fillStyle = 'rgba(0,194,203,0.06)';
    g.fillRect(left, yT, x1 - left, yB - yT);
    g.strokeStyle = 'rgba(0,194,203,0.75)'; g.lineWidth = 1.2;
    g.strokeRect(left, yT, x1 - left, yB - yT);

    if (showHist) {
      const half = Math.abs(yB - yT) / 2;
      // scale to the 90th percentile so one volume spike doesn't flatten every other bar
      const vals: number[] = [];
      for (let i = startIdx; i < candles.length; i++) {
        const pr = pressures[i];
        if (pr) vals.push(pr.buy, pr.sell);
      }
      vals.sort((a, b) => a - b);
      const maxV = vals.length ? vals[Math.min(vals.length - 1, Math.floor(vals.length * 0.9))] : 0;
      const bw = Math.max(1, spacing * 0.55);
      if (maxV > 0) {
        for (let i = startIdx; i < candles.length; i++) {
          const pr = pressures[i];
          const x = ts.timeToCoordinate((candles[i].ts / 1000) as Time);
          if (!pr || x === null) continue;
          const hb = Math.min(1, pr.buy / maxV) * half * 0.92;
          const hs = Math.min(1, pr.sell / maxV) * half * 0.92;
          g.fillStyle = pr.source === 'trades' ? 'rgba(46,189,133,0.75)' : 'rgba(46,189,133,0.4)';
          g.fillRect(x - bw / 2, yM - hb, bw, hb);
          g.fillStyle = pr.source === 'trades' ? 'rgba(246,70,93,0.75)' : 'rgba(246,70,93,0.38)';
          g.fillRect(x - bw / 2, yM, bw, hs);
        }
      }
    }
    g.setLineDash([6, 4]);
    g.strokeStyle = '#f6465d'; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(left, yM); g.lineTo(x1, yM); g.stroke();
    g.setLineDash([]);
    if (props.current.editBox) {
      for (const y of [yT, yB]) {
        g.fillStyle = '#f0b90b';
        g.beginPath(); g.arc(left + (x1 - left) / 2, y, 9, 0, Math.PI * 2); g.fill();
      }
    }
    g.restore();
  };

  useEffect(() => {
    if (!el.current) return;
    const c = createChart(el.current, {
      autoSize: true,
      layout: { background: { color: '#0b0e11' }, textColor: '#8a94a3', fontSize: 11 },
      grid: { vertLines: { color: '#141920' }, horzLines: { color: '#141920' } },
      rightPriceScale: { borderColor: '#262e38', scaleMargins: { top: 0.08, bottom: 0.08 } },
      timeScale: {
        borderColor: '#262e38', timeVisible: true, secondsVisible: false, rightOffset: 5,
        tickMarkFormatter: (t: number, type: number) => {
          const d = new Date(t * 1000);
          return type <= 2 ? `${d.getMonth() + 1}/${d.getDate()}` : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        },
      },
      crosshair: { mode: 0 },
      handleScale: { pinch: true, mouseWheel: true, axisPressedMouseMove: true },
      handleScroll: { horzTouchDrag: true, vertTouchDrag: false, mouseWheel: true, pressedMouseMove: true },
      localization: { timeFormatter: (t: number) => { const d = new Date(t * 1000); return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; } },
    });
    series.current = c.addCandlestickSeries({ upColor: '#2ebd85', downColor: '#f6465d', borderVisible: false, wickUpColor: '#2ebd85', wickDownColor: '#f6465d' });
    chart.current = c;
    // per-frame check keeps the overlay locked to candles during pan, pinch-zoom and price autoscale
    let raf = 0;
    const loop = () => { draw(false); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); c.remove(); chart.current = null; series.current = null; fitted.current = false; lines.current = []; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // data
  useEffect(() => {
    const s = series.current;
    if (!s) return;
    if (!p.candles.length) { s.setData([]); fitted.current = false; return; }
    s.applyOptions({ priceFormat: { type: 'price', precision: p.dp, minMove: 1 / 10 ** p.dp } });
    s.setData(p.candles.map((b) => ({ time: (b.ts / 1000) as Time, open: b.open, high: b.high, low: b.low, close: b.close })));
    if (fittedKey.current !== p.viewKey) fitted.current = false;
    if (!fitted.current) {
      fittedKey.current = p.viewKey;
      chart.current?.timeScale().setVisibleLogicalRange({ from: p.candles.length - 80, to: p.candles.length + 4 });
      fitted.current = true;
    }
    requestAnimationFrame(() => draw(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.candles, p.dp]);

  // price lines: S/R + position entry/SL/TP ; markers: signals
  useEffect(() => {
    const s = series.current;
    if (!s) return;
    for (const l of lines.current) s.removePriceLine(l);
    lines.current = [];
    const add = (price: number, color: string, title: string, style = LineStyle.Solid, width: 1 | 2 = 1) =>
      lines.current.push(s.createPriceLine({ price, color, title, lineStyle: style, lineWidth: width, axisLabelVisible: true }));
    if (p.box) {
      add(Number(p.box.top), '#00c2cb', '저항');
      add(Number(p.box.bottom), '#00c2cb', '지지');
      add(Number(p.box.mid), '#f6465d', '50%', LineStyle.Dashed);
    }
    for (const pos of p.positions) {
      add(pos.entry, '#eaecef', pos.side === 'long' ? '롱 진입' : '숏 진입', LineStyle.Dotted);
      add(pos.sl, '#f0b90b', pos.beMoved ? 'SL(본절)' : 'SL', LineStyle.Dashed);
      for (const t of pos.targets) if (!t.done) add(t.price, '#2ebd85', t.label.split(' ')[0], LineStyle.Dashed);
    }
    const markers: SeriesMarker<Time>[] = p.signals
      .map((sg) => ({
        time: (sg.ts / 1000) as Time,
        position: sg.side === 'long' ? ('belowBar' as const) : ('aboveBar' as const),
        color: sg.side === 'long' ? '#2ebd85' : '#f6465d',
        shape: sg.side === 'long' ? ('arrowUp' as const) : ('arrowDown' as const),
        text: SIG_TXT[sg.type.split('_')[0]] ?? '',
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));
    // de-clutter: neighbouring markers on the same side keep their arrow but drop the label (labels ~4 bars wide)
    const barSec = p.candles.length > 1 ? (p.candles[1].ts - p.candles[0].ts) / 1000 : 900;
    const lastLabel: Record<string, number> = {};
    for (const m of markers) {
      const t = m.time as number;
      if (lastLabel[m.position] !== undefined && t - lastLabel[m.position] < barSec * 4) m.text = '';
      else lastLabel[m.position] = t;
    }
    s.setMarkers(markers);
    requestAnimationFrame(() => draw(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.box, p.positions, p.signals, p.candles.length > 1 ? p.candles[1].ts - p.candles[0].ts : 0]);

  useEffect(() => { requestAnimationFrame(() => draw(true)); /* eslint-disable-next-line */ }, [p.pressures, p.showHist, p.editBox]);

  // manual box editing: drag top/bottom
  useEffect(() => {
    const c = chart.current;
    if (!c) return;
    c.applyOptions({ handleScroll: !p.editBox, handleScale: !p.editBox });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.editBox]);

  const onDown = (e: React.PointerEvent) => {
    const s = series.current, box = p.box;
    if (!p.editBox || !s || !box) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - r.top;
    const yT = s.priceToCoordinate(Number(box.top)) ?? -999, yB = s.priceToCoordinate(Number(box.bottom)) ?? -999;
    drag.current = Math.abs(y - yT) < Math.abs(y - yB) ? 'top' : 'bottom';
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = series.current, box = p.box;
    if (!drag.current || !s || !box) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const price = s.coordinateToPrice(e.clientY - r.top);
    if (price === null) return;
    const top = drag.current === 'top' ? Number(price) : Number(box.top);
    const bottom = drag.current === 'bottom' ? Number(price) : Number(box.bottom);
    p.onBoxEdit?.(top, bottom);
  };
  const onUp = () => { drag.current = null; };

  return (
    <div ref={wrap} className="relative w-full h-full">
      <div ref={el} className="absolute inset-0 z-0" />
      <canvas ref={cv} className="absolute inset-0 pointer-events-none z-10" />
      {p.editBox && (
        <div className="absolute inset-0 touch-none z-20" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
      )}
    </div>
  );
}
