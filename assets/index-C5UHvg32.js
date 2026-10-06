var bt=Object.defineProperty;var xt=(e,t,n)=>t in e?bt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var ae=(e,t,n)=>xt(e,typeof t!="symbol"?t+"":t,n);import{jsxs as g,jsx as d,Fragment as yt}from"react/jsx-runtime";import vt from"react-dom/client";import{useRef as z,useEffect as J,useState as E,useMemo as oe,
useCallback as _e}from"react";import ze from"decimal.js";import{createChart as Nt,LineStyle as we}from"lightweight-charts";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[r\
el="modulepreload"]'))i(l);new MutationObserver(l=>{for(const r of l)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="moduleprel\
oad"&&i(s)}).observe(document,{childList:!0,subtree:!0});function n(l){const r={};return l.integrity&&(r.integrity=l.integrity),l.referrerPolicy&&(r.referrerPolicy=
l.referrerPolicy),l.crossOrigin==="use-credentials"?r.credentials="include":l.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(l){
if(l.ep)return;l.ep=!0;const r=n(l);fetch(l.href,r)}})();const Be=ze.clone({precision:40,rounding:ze.ROUND_HALF_UP});function j(e){return typeof e=="number"?e:Number(
e)}function K(e){return new Be(e)}function Z(e){return{ts:e.ts,open:j(e.open),high:j(e.high),low:j(e.low),close:j(e.close),volume:j(e.volume)}}function xe(e,t,n){
if(t===void 0)return e;const i=K(t);if(i.lte(0))return e;const l=e.div(i);return(n==="down"?l.floor():n==="up"?l.ceil():l.toDecimalPlaces(0,Be.ROUND_HALF_UP)).times(
i)}function wt(e,t=3,n=3){const i=e.map(Z),l=[],r=[];for(let s=t;s<i.length-n;s++){const a=i[s];let c=!0,m=!0;for(let u=s-t;u<s;u++)a.high>i[u].high||(c=!1),a.low<
i[u].low||(m=!1);for(let u=s+1;u<=s+n;u++)a.high>=i[u].high||(c=!1),a.low<=i[u].low||(m=!1);c&&l.push({index:s,ts:a.ts,price:String(e[s].high),kind:"high"}),m&&
r.push({index:s,ts:a.ts,price:String(e[s].low),kind:"low"})}return{highs:l,lows:r}}function kt(e){const t=e.map(Z);return t.map((n,i)=>{if(i===0)return n.high-n.
low;const l=t[i-1].close;return Math.max(n.high-n.low,Math.abs(n.high-l),Math.abs(n.low-l))})}function St(e,t=14){const n=kt(e),i=new Array(n.length).fill(NaN);
if(n.length<t||t<=0)return i;let l=0;for(let s=0;s<t;s++)l+=n[s];let r=l/t;i[t-1]=r;for(let s=t;s<n.length;s++)r=(r*(t-1)+n[s])/t,i[s]=r;return i}function Tt(e,t=14){
const n=St(e,t);return n.length?n[n.length-1]:NaN}function He(e,t,n,i){const l=[...e].sort((a,c)=>i==="top"?j(c.price)-j(a.price):j(a.price)-j(c.price));let r=null;
for(const a of l){const c=j(a.price),m=c*t/100,u=l.filter(p=>Math.abs(j(p.price)-c)<=m);if(u.length>=n){r=u;break}(!r||u.length>r.length)&&(r=u)}return!r||r.length===
0?null:{level:r.reduce((a,c)=>a.plus(K(c.price)),K(0)).div(r.length),members:r.sort((a,c)=>a.index-c.index)}}function Ke(e,t={}){const n=t.lookback??80,i=t.tolerancePct??
.25,l=t.minTouches??2,r=t.pivotLeft??3,s=t.pivotRight??3,a=t.atrPeriod??14,c=t.minHeightAtr??1.5,m=t.maxHeightAtr??15,u=t.minInsideShare??.7,p=Math.max(0,e.length-
n),h=e.slice(p);if(h.length<Math.max(r+s+1,a))return null;const S=wt(h,r,s);if(!S.highs.length||!S.lows.length)return null;const f=He(S.highs,i,l,"top"),q=He(S.
lows,i,l,"bottom");if(!f||!q)return null;const b=f.level,w=q.level;if(b.lte(w))return null;const N=W=>({...W,index:W.index+p}),x=f.members.map(N),v=q.members.map(
N),F=b.minus(w),R=Tt(h,a),k=R>0?F.toNumber()/R:1/0,L=b.toNumber(),A=w.toNumber(),$=L*i/100,U=A*i/100,T=h.map(Z),_=T.filter(W=>W.close<=L+$&&W.close>=A-U).length/
T.length,he=x.length>=l&&v.length>=l&&k>=c&&k<=m&&_>=u,le=Math.min(x[0].index,v[0].index);return{top:b.toFixed(),bottom:w.toFixed(),mid:b.plus(w).div(2).toFixed(),
height:F.toFixed(),startTime:e[le].ts,endTime:e[e.length-1].ts,startIndex:le,endIndex:e.length-1,touchesTop:x.length,touchesBottom:v.length,topPivots:x,bottomPivots:v,
atr:R,heightAtr:k,insideShare:_,tolerancePct:i,isRange:he}}function st(e,t,n){const i=e+t;return{buy:e,sell:t,net:e-t,ratio:i>0?e/i:.5,source:n}}function $t(e,t,n,i={}){
const l=t+n;let r=0,s=0;for(const a of e){if(a.ts<t||a.ts>=l)continue;const c=i.useNotional&&a.price!==void 0?j(a.qty)*j(a.price):j(a.qty);a.side==="buy"?r+=c:s+=
c}return st(r,s,"trades")}function Se(e){const t=Z(e),n=t.high-t.low,i=n>0?t.volume*(t.close-t.low)/n:t.volume/2;return st(i,t.volume-i,"ohlcv")}function Pt(e){
const t=/^(\d+)\s*([smhdwSHDW]|min)$/.exec(e.trim());if(!t)throw new Error(`Unsupported interval: ${e}`);const n=Number(t[1]),i=t[2]==="min"?"m":t[2].toLowerCase();
return n*{s:1e3,m:6e4,h:36e5,d:864e5,w:6048e5}[i]}const qt=15*60*1e3;function Mt(e,t=[],n={}){var s;const i=n.intervalMs??((s=e[0])!=null&&s.interval?Ft(e[0].interval):
void 0)??qt,l=n.minTrades??1;if(!t.length)return e.map(Se);const r=[...t].sort((a,c)=>a.ts-c.ts);return e.map(a=>{const c=je(r,a.ts),m=je(r,a.ts+i);return m-c<l?
Se(a):$t(r.slice(c,m),a.ts,i,n)})}function Ft(e){try{return Pt(e)}catch{return}}function je(e,t){let n=0,i=e.length;for(;n<i;){const l=n+i>>1;e[l].ts<t?n=l+1:i=
l}return n}function ot(e,t){const n=Z(e),i=Z(t);return!(n.close<n.open)||!(i.close>i.open)?!1:i.open<=n.close&&i.close>=n.open&&i.close-i.open>n.open-n.close}function it(e,t){
const n=Z(e),i=Z(t);return!(n.close>n.open)||!(i.close<i.open)?!1:i.open>=n.close&&i.close<=n.open&&i.open-i.close>n.close-n.open}const Dt=new Be(2);function We(e,t,n,i={}){
if(!n||e.length<2)return[];if((i.requireRange??!0)&&!n.isRange)return[];const l=Math.max(1,i.fromIndex??e.length-1),r=[];let s=new Set;for(let a=l;a<e.length;a++){
const c=Rt(e,t,n,i,a),m=c.filter(u=>!s.has(u.type));r.push(...m),s=new Set(c.map(u=>u.type))}return r}function Rt(e,t,n,i,l){const r=i.nearPct??.2,s=i.dominance??
.55,a=i.strongDominance??.6,c=Math.max(1,i.setupCandles??2),m=i.breakTolPct??n.tolerancePct,u=Z(e[l]),p=Z(e[l-1]),h=t[l]??Se(e[l]),S=e.slice(Math.max(0,l-c+1),l+
1).map(Z),f=Math.min(...S.map($=>$.low)),q=Math.max(...S.map($=>$.high)),b=Number(n.top),w=Number(n.bottom),N=Number(n.mid),x=(b-w)*r,v=b*m/100,F=w*m/100,R=u.close>=
w&&u.close<=b,k=1-h.ratio,L=[],A={candles:e,box:n,opts:i,i:l,pr:h};return u.close>b+v?p.close<=b+v&&u.close>u.open&&h.ratio>=a&&L.push(be(A,"BREAKOUT_LONG","lon\
g",f,`close ${u.close} broke above top ${n.top} with buy ratio ${h.ratio.toFixed(2)}`)):R&&f<w-F?h.ratio>=a&&L.push(be(A,"FAKE_BREAKOUT_LONG","long",f,`wick ${f}\
 below bottom ${n.bottom}, closed back inside with buy ratio ${h.ratio.toFixed(2)}`)):R&&u.low<=w+x&&u.close<N&&ot(e[l-1],e[l])&&h.ratio>=s&&L.push(be(A,"RANGE_\
LONG","long",f,`bullish engulfing at support ${n.bottom}, buy ratio ${h.ratio.toFixed(2)}`)),u.close<w-F?p.close>=w-F&&u.close<u.open&&k>=a&&L.push(be(A,"BREAKO\
UT_SHORT","short",q,`close ${u.close} broke below bottom ${n.bottom} with sell ratio ${k.toFixed(2)}`)):R&&q>b+v?k>=a&&L.push(be(A,"FAKE_BREAKOUT_SHORT","short",
q,`wick ${q} above top ${n.top}, closed back inside with sell ratio ${k.toFixed(2)}`)):R&&u.high>=b-x&&u.close>N&&it(e[l-1],e[l])&&k>=s&&L.push(be(A,"RANGE_SHOR\
T","short",q,`bearish engulfing at resistance ${n.top}, sell ratio ${k.toFixed(2)}`)),L}function be(e,t,n,i,l){const{candles:r,box:s,opts:a,i:c,pr:m}=e,u=t.startsWith(
"BREAKOUT")?"breakout":"range",p=rt({side:n,kind:u,entry:r[c].close,extremeWick:String(i),box:s,slBufferPct:a.slBufferPct,breakoutRR:a.breakoutRR,tickSize:a.tickSize});
return{type:t,side:n,kind:u,index:c,ts:r[c].ts,...p,pressure:m,box:{top:s.top,bottom:s.bottom,mid:s.mid},reason:l}}function rt(e){const t=e.side==="long",n=e.slBufferPct??
.05,i=e.breakoutRR??3,l=e.tickSize,r=xe(K(e.entry),l,"nearest"),s=K(e.extremeWick),a=s.abs().times(n).div(100),c=xe(t?s.minus(a):s.plus(a),l,t?"down":"up"),m=r.
minus(c).abs(),u=h=>m.isZero()?0:h.minus(r).abs().div(m).toNumber(),p=[];if(e.kind==="breakout"){const h=xe(t?r.plus(m.times(i)):r.minus(m.times(i)),l,"nearest");
p.push({label:"TP",price:h.toFixed(),sizePct:100,rr:u(h)})}else{const h=xe(K(e.box.top).plus(K(e.box.bottom)).div(Dt),l,"nearest"),S=K(t?e.box.top:e.box.bottom);
(t?h.gt(r):h.lt(r))?(p.push({label:"TP1",price:h.toFixed(),sizePct:50,rr:u(h)}),p.push({label:"TP2",price:S.toFixed(),sizePct:50,rr:u(S)})):p.push({label:"TP2",
price:S.toFixed(),sizePct:100,rr:u(S)})}return{entry:r.toFixed(),sl:c.toFixed(),risk:m.toFixed(),targets:p}}function Lt(e){var t;return e.kind?e.kind:(t=e.type)!=
null&&t.startsWith("BREAKOUT")?"breakout":"range"}function At(e,t,n,i={}){const l=i.k??2,r=i.lookback??20,s=i.nearTargetPct??.2,a={alert:!1,nearTarget:!1,target:null,
progress:0,oppositeVolume:0,averageOpposite:0,multiple:0,reason:"insufficient data"},c=t.length;if(c<2||e.targets.length===0)return a;const m=e.side==="long",u=j(
e.entry),p=Z(t[c-1]),h=T=>n[T]??Se(t[T]),S=T=>m?T.sell:T.buy,f=e.targets.map(T=>j(T.price)).sort((T,O)=>m?T-O:O-T),q=p.close,b=f.find(T=>m?T>q:T<q)??f[f.length-
1],w=m?p.high:p.low,N=b-u,x=N===0?1:(w-u)/N,v=x>=1-s,F=Math.max(0,c-1-r),R=[];for(let T=F;T<c-1;T++)R.push(S(h(T)));const k=R.length?R.reduce((T,O)=>T+O,0)/R.length:
0,L=S(h(c-1)),A=k>0?L/k:L>0?1/0:0,$=A>=l,U=v&&$;return{alert:U,nearTarget:v,target:String(b),progress:x,oppositeVolume:L,averageOpposite:k,multiple:A,reason:U?`${m?
"sell":"buy"} pressure ${A.toFixed(2)}x average near target ${b} — absorption, consider closing`:v?`opposite pressure only ${A.toFixed(2)}x average (< ${l}x)`:
`not near target (${(x*100).toFixed(0)}% of the way)`}}function Ct(e,t,n,i,l={}){const r=l.maxAdds??2,s=e.adds??0;if(Lt(e)!=="breakout")return{add:!1,reason:"py\
ramiding only applies to breakout positions"};if(s>=r)return{add:!1,reason:`max adds reached (${s}/${r})`};if(t.length<2)return{add:!1,reason:"insufficient data"};
const a=e.side==="long",c=e.brokenLevel??(i?a?i.top:i.bottom:void 0);if(c===void 0)return{add:!1,reason:"no broken level"};const m=j(c),u=l.retestTolPct??(i==null?
void 0:i.tolerancePct)??.25,p=m*u/100,h=l.strongDominance??.6,S=t.length,f=Z(t[S-1]),q=n[S-1]??Se(t[S-1]);if(!(a?f.low<=m+p&&f.close>m:f.high>=m-p&&f.close<m))return{
add:!1,reason:`no retest of broken level ${c}`,level:String(c)};const w=a?ot(t[S-2],t[S-1]):it(t[S-2],t[S-1]),N=a?q.ratio:1-q.ratio;if(!w&&N<h)return{add:!1,reason:`\
retest without confirmation (ratio ${N.toFixed(2)})`,level:String(c)};const x=l.slBufferPct??.05,v=K(a?f.low:f.high),F=v.times(x).div(100),R=xe(a?v.minus(F):v.plus(
F),l.tickSize,a?"down":"up");return{add:!0,addNumber:s+1,entry:xe(K(t[S-1].close),l.tickSize,"nearest").toFixed(),sl:R.toFixed(),sizePct:l.addSizePct??50,level:String(
c),reason:`retest of ${c} confirmed by ${w?"engulfing":`pressure ${N.toFixed(2)}`}`}}function Ut(e){const t=K(e.equity),n=e.riskPct??1,i=K(e.entry),l=K(e.sl),r=K(
e.leverage??1),s=K(e.feeRate??"0.0006");if(i.lte(0)||l.lte(0))throw new Error("entry and sl must be > 0");if(i.eq(l))throw new Error("entry and sl must differ");
if(r.lte(0))throw new Error("leverage must be > 0");const a=l.lt(i)?"long":"short",c=t.times(n).div(100),m=i.minus(l).abs(),u=e.includeFeesInRisk??!0?m.plus(s.times(
i.plus(l))):m;let p=c.div(u),h=!1;const S=t.times(r).div(i);if(p.gt(S)&&(p=S,h=!0),e.qtyStep!==void 0&&K(e.qtyStep).gt(0)){const N=K(e.qtyStep);p=p.div(N).floor().
times(N)}const f=p.times(i),q=f.times(s),b=p.times(l).times(s),w=q.plus(b);return{side:a,qty:p.toFixed(),notional:f.toFixed(),margin:f.div(r).toFixed(),riskAmount:c.
toFixed(),riskPerUnit:m.toFixed(),entryFee:q.toFixed(),exitFeeAtSl:b.toFixed(),estFees:w.toFixed(),lossAtSl:p.times(m).plus(w).toFixed(),capped:h}}const Pe=e=>String(
e).padStart(2,"0"),Bt={RANGE:"반전",FAKE:"가짜",BREAKOUT:"돌파"};function Et(e){const t=z(null),n=z(null),i=z(null),l=z(null),r=z(null),s=z([]),a=z(!1),c=z(
void 0),m=z(e);m.current=e;const u=z(null),p=z(""),h=(b=!0)=>{var I,G;const w=l.current,N=r.current,x=i.current,v=t.current;if(!w||!N||!x||!v)return;const{box:F,
candles:R}=m.current,k=w.timeScale().getVisibleLogicalRange(),L=F&&R.length?`${v.clientWidth}x${v.clientHeight}|${k==null?void 0:k.from.toFixed(3)}:${k==null?void 0:
k.to.toFixed(3)}|${(I=N.priceToCoordinate(Number(F.top)))==null?void 0:I.toFixed(2)}|${(G=N.priceToCoordinate(Number(F.bottom)))==null?void 0:G.toFixed(2)}`:"no\
ne";if(!b&&L===p.current)return;p.current=L;const A=window.devicePixelRatio||1,$=v.clientWidth,U=v.clientHeight;(x.width!==$*A||x.height!==U*A)&&(x.width=$*A,x.
height=U*A,x.style.width=`${$}px`,x.style.height=`${U}px`);const T=x.getContext("2d");T.setTransform(A,0,0,A,0,0),T.clearRect(0,0,$,U);const{box:O,candles:_,pressures:he,
showHist:le}=m.current;if(!O||!_.length)return;const W=w.timeScale(),ve=N.priceScale().width(),Ne=$-ve,Fe=U-W.height(),De=Number(O.top),$e=Number(O.bottom),Re=Number(
O.mid),se=N.priceToCoordinate(De),ce=N.priceToCoordinate($e),de=N.priceToCoordinate(Re);if(se===null||ce===null||de===null)return;const fe=Math.max(0,Math.min(O.
startIndex,_.length-1));let o=W.timeToCoordinate(_[fe].ts/1e3);o===null&&(o=W.logicalToCoordinate(0)??0);const y=W.timeToCoordinate(_[_.length-1].ts/1e3)??Ne,M=_.
length>1?W.timeToCoordinate(_[_.length-2].ts/1e3):null,P=M!==null&&y!==null?Math.max(.5,y-M):W.options().barSpacing,C=Math.min(Ne,y+P*3),B=Math.max(0,o-P/2);if(!(C<=
B)){if(T.save(),T.beginPath(),T.rect(0,0,Ne,Fe),T.clip(),T.fillStyle="rgba(0,194,203,0.06)",T.fillRect(B,se,C-B,ce-se),T.strokeStyle="rgba(0,194,203,0.75)",T.lineWidth=
1.2,T.strokeRect(B,se,C-B,ce-se),le){const X=Math.abs(ce-se)/2,V=[];for(let Y=fe;Y<_.length;Y++){const te=he[Y];te&&V.push(te.buy,te.sell)}V.sort((Y,te)=>Y-te);
const pe=V.length?V[Math.min(V.length-1,Math.floor(V.length*.9))]:0,ue=Math.max(1,P*.55);if(pe>0)for(let Y=fe;Y<_.length;Y++){const te=he[Y],Le=W.timeToCoordinate(
_[Y].ts/1e3);if(!te||Le===null)continue;const Ie=Math.min(1,te.buy/pe)*X*.92,ft=Math.min(1,te.sell/pe)*X*.92;T.fillStyle=te.source==="trades"?"rgba(46,189,133,0\
.75)":"rgba(46,189,133,0.4)",T.fillRect(Le-ue/2,de-Ie,ue,Ie),T.fillStyle=te.source==="trades"?"rgba(246,70,93,0.75)":"rgba(246,70,93,0.38)",T.fillRect(Le-ue/2,de,
ue,ft)}}if(T.setLineDash([6,4]),T.strokeStyle="#f6465d",T.lineWidth=1.4,T.beginPath(),T.moveTo(B,de),T.lineTo(C,de),T.stroke(),T.setLineDash([]),m.current.editBox)
for(const X of[se,ce])T.fillStyle="#f0b90b",T.beginPath(),T.arc(B+(C-B)/2,X,9,0,Math.PI*2),T.fill();T.restore()}};J(()=>{if(!n.current)return;const b=Nt(n.current,
{autoSize:!0,layout:{background:{color:"#0b0e11"},textColor:"#8a94a3",fontSize:11},grid:{vertLines:{color:"#141920"},horzLines:{color:"#141920"}},rightPriceScale:{
borderColor:"#262e38",scaleMargins:{top:.08,bottom:.08}},timeScale:{borderColor:"#262e38",timeVisible:!0,secondsVisible:!1,rightOffset:5,tickMarkFormatter:(x,v)=>{
const F=new Date(x*1e3);return v<=2?`${F.getMonth()+1}/${F.getDate()}`:`${Pe(F.getHours())}:${Pe(F.getMinutes())}`}},crosshair:{mode:0},handleScale:{pinch:!0,mouseWheel:!0,
axisPressedMouseMove:!0},handleScroll:{horzTouchDrag:!0,vertTouchDrag:!1,mouseWheel:!0,pressedMouseMove:!0},localization:{timeFormatter:x=>{const v=new Date(x*1e3);
return`${v.getMonth()+1}/${v.getDate()} ${Pe(v.getHours())}:${Pe(v.getMinutes())}`}}});r.current=b.addCandlestickSeries({upColor:"#2ebd85",downColor:"#f6465d",borderVisible:!1,
wickUpColor:"#2ebd85",wickDownColor:"#f6465d"}),l.current=b;let w=0;const N=()=>{h(!1),w=requestAnimationFrame(N)};return w=requestAnimationFrame(N),()=>{cancelAnimationFrame(
w),b.remove(),l.current=null,r.current=null,a.current=!1,s.current=[]}},[]),J(()=>{var w;const b=r.current;if(b){if(!e.candles.length){b.setData([]),a.current=!1;
return}b.applyOptions({priceFormat:{type:"price",precision:e.dp,minMove:1/10**e.dp}}),b.setData(e.candles.map(N=>({time:N.ts/1e3,open:N.open,high:N.high,low:N.low,
close:N.close}))),c.current!==e.viewKey&&(a.current=!1),a.current||(c.current=e.viewKey,(w=l.current)==null||w.timeScale().setVisibleLogicalRange({from:e.candles.
length-80,to:e.candles.length+4}),a.current=!0),requestAnimationFrame(()=>h(!0))}},[e.candles,e.dp]),J(()=>{const b=r.current;if(!b)return;for(const x of s.current)
b.removePriceLine(x);s.current=[];const w=(x,v,F,R=we.Solid,k=1)=>s.current.push(b.createPriceLine({price:x,color:v,title:F,lineStyle:R,lineWidth:k,axisLabelVisible:!0}));
e.box&&(w(Number(e.box.top),"#00c2cb","저항"),w(Number(e.box.bottom),"#00c2cb","지지"),w(Number(e.box.mid),"#f6465d","50%",we.Dashed));for(const x of e.positions){
w(x.entry,"#eaecef",x.side==="long"?"롱 진입":"숏 진입",we.Dotted),w(x.sl,"#f0b90b",x.beMoved?"SL(본절)":"SL",we.Dashed);for(const v of x.targets)v.done||
w(v.price,"#2ebd85",v.label.split(" ")[0],we.Dashed)}const N=e.signals.map(x=>({time:x.ts/1e3,position:x.side==="long"?"belowBar":"aboveBar",color:x.side==="lon\
g"?"#2ebd85":"#f6465d",shape:x.side==="long"?"arrowUp":"arrowDown",text:Bt[x.type.split("_")[0]]??""})).sort((x,v)=>x.time-v.time);b.setMarkers(N),requestAnimationFrame(
()=>h(!0))},[e.box,e.positions,e.signals]),J(()=>{requestAnimationFrame(()=>h(!0))},[e.pressures,e.showHist,e.editBox]),J(()=>{const b=l.current;b&&b.applyOptions(
{handleScroll:!e.editBox,handleScale:!e.editBox})},[e.editBox]);const S=b=>{const w=r.current,N=e.box;if(!e.editBox||!w||!N)return;const x=b.currentTarget.getBoundingClientRect(),
v=b.clientY-x.top,F=w.priceToCoordinate(Number(N.top))??-999,R=w.priceToCoordinate(Number(N.bottom))??-999;u.current=Math.abs(v-F)<Math.abs(v-R)?"top":"bottom",
b.currentTarget.setPointerCapture(b.pointerId)},f=b=>{var k;const w=r.current,N=e.box;if(!u.current||!w||!N)return;const x=b.currentTarget.getBoundingClientRect(),
v=w.coordinateToPrice(b.clientY-x.top);if(v===null)return;const F=u.current==="top"?Number(v):Number(N.top),R=u.current==="bottom"?Number(v):Number(N.bottom);(k=
e.onBoxEdit)==null||k.call(e,F,R)},q=()=>{u.current=null};return g("div",{ref:t,className:"relative w-full h-full",children:[d("div",{ref:n,className:"absolute \
inset-0 z-0"}),d("canvas",{ref:i,className:"absolute inset-0 pointer-events-none z-10"}),e.editBox&&d("div",{className:"absolute inset-0 touch-none z-20",onPointerDown:S,
onPointerMove:f,onPointerUp:q,onPointerCancel:q})]})}const D=(e,t=2)=>{const n=typeof e=="string"?Number(e):e;return n==null||!Number.isFinite(n)?"—":n.toLocaleString(
"en-US",{minimumFractionDigits:t,maximumFractionDigits:t})},Ot=(e,t=2)=>Number.isFinite(e)?`${e>=0?"+":""}${(e*100).toFixed(t)}%`:"—",ge=(e,t=2)=>{if(!Number.
isFinite(e))return"—";const n=Number(e.toFixed(t));return n===0?0 .toFixed(t):`${n>0?"+":""}${n.toFixed(t)}`},It=e=>new Date(e).toLocaleTimeString("ko-KR",{hour:"\
2-digit",minute:"2-digit",hour12:!1}),Ee=e=>{const t=new Date(e);return`${t.getMonth()+1}/${t.getDate()} ${It(e)}`};function _t({book:e,dp:t,rows:n=6}){if(!e)return d(
"div",{className:"text-muted text-xs p-3",children:"호가 연결 중…"});const i=e.asks.slice(0,n).reverse(),l=e.bids.slice(0,n),r=e.bids.reduce((u,p)=>u+p[1],
0),s=e.asks.reduce((u,p)=>u+p[1],0),a=s+r>0?(r-s)/(s+r):0,c=Math.max(...i.map(u=>u[1]),...l.map(u=>u[1]),1e-9),m=(u,p)=>g("div",{className:"relative flex justif\
y-between text-[12px] num h-5 items-center px-2",children:[d("div",{className:`absolute inset-y-0 right-0 ${p==="a"?"bg-down/15":"bg-up/15"}`,style:{width:`${u[1]/
c*100}%`}}),d("span",{className:`relative ${p==="a"?"text-down":"text-up"}`,children:D(u[0],t)}),d("span",{className:"relative text-muted",children:u[1]>=100?D(
u[1],0):D(u[1],3)})]},`${p}${u[0]}`);return g("div",{children:[g("div",{className:"px-2 pb-1 text-[11px] text-muted flex justify-between",children:[d("span",{children:"\
가격"}),d("span",{children:"수량"})]}),i.map(u=>m(u,"a")),d("div",{className:"h-px bg-line my-1"}),l.map(u=>m(u,"b")),g("div",{className:"px-2 pt-2",children:[
g("div",{className:"flex justify-between text-[11px] num",children:[g("span",{className:"text-up",children:["매수 ",Math.round((a+1)/2*100),"%"]}),d("span",{className:"\
text-muted",children:"호가 불균형 (15)"}),g("span",{className:"text-down",children:["매도 ",Math.round((1-a)/2*100),"%"]})]}),d("div",{className:"h-2 rou\
nded-full bg-down/70 overflow-hidden mt-1",children:d("div",{className:"h-full bg-up",style:{width:`${(a+1)/2*100}%`}})})]})]})}function ne({children:e,className:t=""}){
return d("div",{className:`bg-panel rounded-xl border border-line ${t}`,children:e})}function Q({k:e,v:t,className:n=""}){return g("div",{className:`flex justif\
y-between items-center text-[13px] py-1 ${n}`,children:[d("span",{className:"text-muted",children:e}),d("span",{className:"num",children:t})]})}function ie({children:e,
onClick:t,tone:n="neutral",className:i="",disabled:l}){const r={up:"bg-up text-white",down:"bg-down text-white",accent:"bg-accent text-bg",neutral:"bg-panel2 te\
xt-txt",warn:"bg-warn text-bg"}[n];return d("button",{disabled:l,onClick:t,className:`h-11 px-4 rounded-lg font-semibold active:opacity-80 disabled:bg-panel2 di\
sabled:text-muted disabled:opacity-60 ${r} ${i}`,children:e})}function H({label:e,value:t,onChange:n,step:i="any",suffix:l}){return g("label",{className:"block",
children:[d("span",{className:"text-[11px] text-muted",children:e}),g("div",{className:"flex items-center bg-panel2 rounded-lg border border-line h-11 px-3",children:[
d("input",{inputMode:"decimal",type:"number",step:i,value:t,onChange:r=>n(r.target.value),className:"bg-transparent flex-1 min-w-0 outline-none num text-[15px]"}),
l&&d("span",{className:"text-muted text-xs ml-1",children:l})]})]})}function ke({on:e,onChange:t,label:n,hint:i}){return g("button",{onClick:()=>t(!e),className:"\
w-full flex items-center justify-between py-3 text-left",children:[g("span",{children:[d("span",{className:"block text-[14px]",children:n}),i&&d("span",{className:"\
block text-[11px] text-muted",children:i})]}),d("span",{className:`w-12 h-7 rounded-full relative transition ${e?"bg-accent":"bg-panel2 border border-line"}`,children:d(
"span",{className:`absolute top-1 w-5 h-5 rounded-full bg-white transition ${e?"left-6":"left-1"}`})})]})}function Ce({items:e,value:t,onChange:n,fmt:i}){return d(
"div",{className:"flex gap-2 flex-wrap",children:e.map(l=>d("button",{onClick:()=>n(l),className:`px-3 h-8 rounded-full text-sm ${t===l?"bg-accent text-bg font-\
semibold":"bg-panel2 text-muted"}`,children:i?i(l):String(l)},String(l)))})}const Ve="https://api.bitget.com",Ae="/dupont-mobile/bgapi";let Ge=!1;async function lt(e){
const t=Ge?[Ae,Ve]:[Ve,Ae];let n;for(const i of t)try{const l=await fetch(i+e,{cache:"no-store"});if(!l.ok)throw new Error(`HTTP ${l.status}`);const r=await l.json();
if(r.code!=="00000")throw new Error(r.msg||"bitget error");return Ge=i===Ae,r.data}catch(l){n=l}throw n}const Je={"1m":{api:"1m",sec:60},"5m":{api:"5m",sec:300},
"15m":{api:"15m",sec:900},"1h":{api:"1H",sec:3600}};async function zt(e,t,n=300){const i=Je[t]??Je["15m"];return(await lt(`/api/v2/mix/market/candles?productTyp\
e=USDT-FUTURES&symbol=${e}&granularity=${i.api}&limit=${n}`)).map(r=>({ts:Number(r[0]),open:+r[1],high:+r[2],low:+r[3],close:+r[4],volume:+r[5]})).sort((r,s)=>r.
ts-s.ts)}async function at(e){const t=await lt(`/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${e}`),n=Array.isArray(t)?t[0]:t;return n?{last:+n.lastPr,
mark:+(n.markPrice??n.lastPr),change24h:+(n.change24h??0),funding:+(n.fundingRate??0),bid:+n.bidPr,ask:+n.askPr}:null}const Ht="wss://ws.bitget.com/v2/ws/public";
class Kt{constructor(t,n){ae(this,"ws",null);ae(this,"closed",!1);ae(this,"attempt",0);ae(this,"ping",null);ae(this,"connectedAt",0);this.symbol=t,this.h=n}start(){
this.closed=!1,this.open()}stop(){var t,n,i;this.closed=!0,this.ping&&clearInterval(this.ping),(t=this.ws)==null||t.close(),this.ws=null,(i=(n=this.h).status)==
null||i.call(n,"closed")}open(){var n,i;if(this.closed)return;(i=(n=this.h).status)==null||i.call(n,this.attempt?"reconnecting":"connecting");let t;try{t=new WebSocket(
Ht)}catch{return this.retry()}this.ws=t,t.onopen=()=>{var r,s;this.attempt=0,this.connectedAt=Date.now();const l=["ticker","books15","trade"].map(a=>({instType:"\
USDT-FUTURES",channel:a,instId:this.symbol}));t.send(JSON.stringify({op:"subscribe",args:l})),this.ping=setInterval(()=>t.readyState===1&&t.send("ping"),25e3),(s=
(r=this.h).status)==null||s.call(r,"live")},t.onmessage=l=>{var m,u,p,h,S,f,q;const r=typeof l.data=="string"?l.data:"";if(!r||r==="pong")return;let s;try{s=JSON.
parse(r)}catch{return}const a=(m=s==null?void 0:s.arg)==null?void 0:m.channel,c=s==null?void 0:s.data;if(!(!a||!Array.isArray(c)||!c.length))if(a==="ticker"){const b=c[0];
(p=(u=this.h).ticker)==null||p.call(u,{last:+b.lastPr,mark:+(b.markPrice??b.lastPr),funding:+(b.fundingRate??0),change24h:+(b.change24h??0),bid:+b.bidPr,ask:+b.
askPr})}else if(a==="books15"){const b=c[0];(S=(h=this.h).book)==null||S.call(h,{bids:(b.bids??[]).map(w=>[+w[0],+w[1]]),asks:(b.asks??[]).map(w=>[+w[0],+w[1]]),
ts:+b.ts})}else a==="trade"&&((q=(f=this.h).trades)==null||q.call(f,c.map(b=>({ts:+b.ts,price:+b.price,qty:+b.size,side:b.side==="sell"?"sell":"buy"}))))},t.onclose=
()=>{this.ping&&clearInterval(this.ping),this.closed||this.retry()},t.onerror=()=>t.close()}retry(){var n,i;(i=(n=this.h).status)==null||i.call(n,"reconnecting");
const t=Math.min(3e4,1e3*2**this.attempt++);setTimeout(()=>this.open(),t)}}const ct=[{symbol:"BTCUSDT",qtyStep:1e-4,dp:1},{symbol:"ETHUSDT",qtyStep:.01,dp:2},{symbol:"\
SOLUSDT",qtyStep:.1,dp:3},{symbol:"XRPUSDT",qtyStep:1,dp:4},{symbol:"DOGEUSDT",qtyStep:1,dp:5},{symbol:"BNBUSDT",qtyStep:.01,dp:2},{symbol:"ADAUSDT",qtyStep:1,dp:4},
{symbol:"LINKUSDT",qtyStep:1,dp:3},{symbol:"AVAXUSDT",qtyStep:.1,dp:3},{symbol:"SUIUSDT",qtyStep:.1,dp:4}],ye=5,dt=e=>Math.max(0,Math.round(-Math.log10(e))),ee=e=>{
const t=ct.find(n=>n.symbol===e)??{symbol:e,qtyStep:.001,dp:2};return{...t,qdp:dt(t.qtyStep)}},ut=(e,t)=>{const n=dt(t);return Number((Math.floor(e/t+1e-9)*t).toFixed(
n))},jt=["1m","5m","15m","1h"],Qe={"1m":6e4,"5m":3e5,"15m":9e5,"1h":36e5},Xe=6e4;function Wt(e,t){const[n,i]=E([]),[l,r]=E(null),[s,a]=E(null),[c,m]=E("connecti\
ng"),[u,p]=E(""),[h,S]=E(0),f=z([]),q=z(0),b=z(t);b.current=t,J(()=>{f.current=[],q.current=0,a(null);let v=!1;const F=new Kt(e,{status:k=>{m(k),k==="live"&&(q.
current=Date.now()),k==="reconnecting"&&(f.current=[],q.current=0)},ticker:k=>r(L=>({...L??k,...k})),book:k=>a(k),trades:k=>{const L=f.current;for(const $ of k)
L.push($);L.length>Xe&&L.splice(0,L.length-Xe),v=!0;const A=k[k.length-1];A&&w(A.price,k.reduce(($,U)=>$+U.qty,0),A.ts)}});F.start();const R=setInterval(()=>{v&&
(v=!1,S(k=>k+1))},1e3);return()=>{F.stop(),clearInterval(R)}},[e]);function w(v,F,R){i(k=>{if(!k.length)return k;const L=Qe[b.current]??9e5,A=Math.floor(R/L)*L,
$=k[k.length-1];if(A>$.ts)return[...k.slice(-499),{ts:A,open:$.close,high:Math.max($.close,v),low:Math.min($.close,v),close:v,volume:F}];if(A<$.ts)return k;const U={
...$,close:v,high:Math.max($.high,v),low:Math.min($.low,v),volume:$.volume+F};return[...k.slice(0,-1),U]})}J(()=>{let v=!0;i([]);const F=k=>zt(e,t).then(L=>{v&&
(p(""),i(A=>{if(k||!A.length)return L;const $=L[L.length-1],U=A[A.length-1];return U.ts>$.ts?[...L,U]:L}))}).catch(L=>v&&p(String((L==null?void 0:L.message)??L)));
F(!0);const R=setInterval(()=>F(!1),2e4);return()=>{v=!1,clearInterval(R)}},[e,t]),J(()=>{let v=!0;const F=()=>at(e).then(k=>{!v||!k||(r(k),c!=="live"&&w(k.last,
0,Date.now()))}).catch(()=>{});F();const R=setInterval(F,c==="live"?1e4:2500);return()=>{v=!1,clearInterval(R)}},[e,c]);const N=Qe[t]??9e5,x=q.current?Math.ceil(
q.current/N)*N:1/0;return{candles:n,ticker:l,book:s,status:c,err:u,trades:f,tapeFrom:x,tapeVer:h,intervalMs:N}}function Vt(e,t,n){var a,c;const i=Math.max(e.top,
e.bottom),l=Math.min(e.top,e.bottom);let r=t.findIndex(m=>m.ts>=e.startTs);r<0&&(r=Math.max(0,t.length-60));const s=Math.max(0,t.length-1);return{top:String(i),
bottom:String(l),mid:String((i+l)/2),height:String(i-l),startTime:((a=t[r])==null?void 0:a.ts)??e.startTs,endTime:((c=t[s])==null?void 0:c.ts)??e.startTs,startIndex:r,
endIndex:s,touchesTop:2,touchesBottom:2,topPivots:[],bottomPivots:[],atr:0,heightAtr:0,insideShare:1,tolerancePct:n,isRange:!0}}const Gt=150;function Jt(e,t,n,i,l,r,s){
const a=oe(()=>({lookback:r.lookback,tolerancePct:r.tolerancePct,pivotLeft:r.pivotLeft,pivotRight:r.pivotRight,minTouches:r.minTouches}),[r.lookback,r.tolerancePct,
r.pivotLeft,r.pivotRight,r.minTouches]),c=oe(()=>({requireRange:r.requireRange}),[r.requireRange]),m=Date.now(),u=e[e.length-1],p=!!u&&u.ts+t>m,h=oe(()=>p?e.slice(
0,-1):e,[e,p]),S=oe(()=>{const v=Number.isFinite(i)?n.current.filter(F=>F.ts>=i):[];return Mt(e,v,{intervalMs:t})},[e,l,i,t]),f=h.length?`${h[h.length-1].ts}:${h.
length}`:"",q=oe(()=>s?Vt(s,h,r.tolerancePct):null,[s,f,r.tolerancePct]),b=oe(()=>q??(h.length>10?Ke(h,a):null),[f,a,q]),w=oe(()=>!b||h.length<3?[]:We(h,S.slice(
0,h.length),b,c),[f,b,c,S]),N=oe(()=>{const v=[],F=h.length;if(F<30)return v;const R=S.slice(0,F);for(let k=Math.max(25,F-Gt);k<F;k++){const L=q??Ke(h.slice(0,k),
a);L&&v.push(...We(h.slice(0,k+1),R.slice(0,k+1),L,c))}return v},[f,a,c,q]),x=S.filter(v=>v.source==="trades").length;return{closed:h,pressures:S,box:b,live:w,history:N,
tapeCandles:x}}const Ye={bitget_default:{spot:{maker:"0.001",taker:"0.001"},swap:{maker:"0.0002",taker:"0.0006"},stock:{maker:"0.00015",taker:"0.00015",taxReserved:"\
0"}}};function mt(e,t,n){const l=(Ye[e]??Ye.bitget_default)[t];return n==="maker"?l.maker:l.taker}function Qt(e,t,n){return e*t/(n>0?n:1)}const Oe=200,re=Number(
mt("bitget_default","swap","taker")),ht=Number(mt("bitget_default","swap","maker"));function Ze(e=Oe){return{wallet:e,bankroll:e,positions:[],fills:[],pending:[],
equityCurve:[{t:Date.now(),equity:e}],seq:0}}const pt=e=>e==="long"?1:-1;function Ue(e,t){return pt(e.side)*(t-e.entry)*e.qty}function et(e,t,n,i){const l=1/(n||
1);return e==="long"?t*(1-l+i):t*(1+l-i)}function Xt(e,t,n=re){const i=e.qty,l=e.side==="long"?(e.entry*i+e.entryFeeLeft)/(i*(1-n)):(e.entry*i-e.entryFeeLeft)/(i*
(1+n)),r=10**t;return e.side==="long"?Math.ceil(l*r-1e-9)/r:Math.floor(l*r+1e-9)/r}class Yt{constructor(t){ae(this,"state");ae(this,"moveSlToBe",!0);ae(this,"pr\
ecision",()=>({dp:2,qdp:4}));this.state=t?Zt(t):Ze()}px(t,n){return n.toLocaleString("en-US",{minimumFractionDigits:this.precision(t).dp,maximumFractionDigits:this.
precision(t).dp})}qx(t,n){return n.toFixed(this.precision(t).qdp)}nextId(t){return this.state.seq+=1,`${t}${Date.now().toString(36)}${this.state.seq}`}reset(t=Oe){
this.state=Ze(t)}usedMargin(){return this.state.positions.reduce((t,n)=>t+n.margin,0)+this.state.pending.reduce((t,n)=>t+n.qty*n.price/n.leverage,0)}available(){
return this.state.wallet-this.usedMargin()}equity(t){return this.state.wallet+this.state.positions.reduce((n,i)=>n+Ue(i,t[i.symbol]??i.entry),0)}open(t,n=Date.now()){
const i=[];if(!(t.qty>0)||!(t.price>0))return{ok:!1,error:"수량/가격 오류",events:i};const l=t.liquidity==="maker"?ht:re,s=t.qty*t.price*l,a=Qt(t.qty,t.price,
t.leverage);if(a+s>this.available()+1e-9)return{ok:!1,error:`증거금 부족 (필요 ${(a+s).toFixed(2)} USDT)`,events:i};const c=t.mmr??.005,m=this.state.positions.
find(p=>p.symbol===t.symbol&&p.side===t.side);if(this.state.wallet-=s,m){const p=m.qty+t.qty;return m.entry=(m.entry*m.qty+t.price*t.qty)/p,m.qty=p,m.origQty+=t.
qty,m.margin+=a,m.entryFeeLeft+=s,m.adds+=1,m.liqPrice=et(m.side,m.entry,m.leverage,m.mmr),i.push({kind:"add",positionId:m.id,message:`불타기 추가 ${this.qx(
t.symbol,t.qty)} @ ${this.px(t.symbol,t.price)}`}),this.snapEquity({[t.symbol]:t.price},n),{ok:!0,position:m,events:i}}const u={id:this.nextId("p"),symbol:t.symbol,
side:t.side,qty:t.qty,origQty:t.qty,entry:t.price,leverage:t.leverage,margin:a,sl:t.sl,initialSl:t.sl,targets:t.targets.map(p=>({...p,done:!1})),setup:t.setup,signalId:t.
signalId,breakoutLevel:t.breakoutLevel,adds:0,entryFeeLeft:s,realizedNet:0,beMoved:!1,liqPrice:et(t.side,t.price,t.leverage,c),mmr:c,openedAt:n};return this.state.
positions.push(u),i.push({kind:"open",positionId:u.id,message:`${t.side==="long"?"롱":"숏"} 진입 ${this.qx(t.symbol,t.qty)} ${t.symbol} @ ${this.px(t.symbol,
t.price)}`}),this.snapEquity({[t.symbol]:t.price},n),{ok:!0,position:u,events:i}}placeLimit(t,n=Date.now()){return t.qty*t.price/t.leverage>this.available()?{ok:!1,
error:"증거금 부족"}:(this.state.pending.push({...t,id:this.nextId("o"),createdAt:n}),{ok:!0})}cancelLimit(t){this.state.pending=this.state.pending.filter(
n=>n.id!==t)}close(t,n,i,l,r=Date.now()){const s=this.state.positions.find(q=>q.id===t);if(!s)return null;const a=Math.min(n,s.qty);if(!(a>0))return null;const c=pt(
s.side)*(i-s.entry)*a,m=a*i*re,u=s.entryFeeLeft*(a/s.qty),p=s.margin*(a/s.qty);s.entryFeeLeft-=u,s.margin-=p,s.qty-=a,this.state.wallet+=c-m;const h=c-m-u;s.realizedNet+=
h;const S=s.qty<=1e-12,f={id:this.nextId("f"),positionId:s.id,symbol:s.symbol,side:s.side,setup:s.setup,qty:a,entry:s.entry,exit:i,grossPnl:c,fees:m+u,netPnl:h,
reason:l,openedAt:s.openedAt,closedAt:r,final:S};return this.state.fills.push(f),S&&(this.state.positions=this.state.positions.filter(q=>q.id!==s.id)),this.snapEquity(
{[s.symbol]:i},r),f}closeFraction(t,n,i,l,r=Date.now()){const s=this.state.positions.find(a=>a.id===t);return s?this.close(t,n>=1?s.qty:s.qty*n,i,l,r):null}onPrice(t,n,i=Date.
now()){var r;const l=[];for(const s of[...this.state.pending]){if(s.symbol!==t||!(s.side==="long"?n<=s.price:n>=s.price))continue;this.state.pending=this.state.
pending.filter(m=>m.id!==s.id);const c=this.open({...s,liquidity:"maker"},i);c.ok?l.push({kind:"limit_fill",positionId:(r=c.position)==null?void 0:r.id,message:`\
지정가 체결 ${s.side==="long"?"롱":"숏"} @ ${this.px(s.symbol,s.price)}`}):l.push({kind:"close",message:`지정가 체결 실패: ${c.error}`})}for(const s of[
...this.state.positions]){if(s.symbol!==t)continue;const a=s.side==="long";if(s.liqPrice>0&&(a?n<=s.liqPrice:n>=s.liqPrice)){this.close(s.id,s.qty,s.liqPrice,"강\
제청산",i),l.push({kind:"liq",positionId:s.id,message:`강제청산 @ ${this.px(s.symbol,s.liqPrice)}`});continue}if(a?n<=s.sl:n>=s.sl){const c=s.beMoved?"본절\
 SL":"손절 SL",m=a?Math.min(s.sl,n):Math.max(s.sl,n),u=this.close(s.id,s.qty,m,c,i);l.push({kind:"sl",positionId:s.id,message:`${c} 체결 @ ${this.px(s.symbol,
m)} (순손익 ${u?(u.netPnl>=0?"+":"")+u.netPnl.toFixed(2):"-"} USDT)`});continue}for(let c=0;c<s.targets.length;c++){const m=s.targets[c];if(m.done)continue;if(!(a?
n>=m.price:n<=m.price))break;m.done=!0;const p=s.targets.slice(c+1).every(f=>f.done)?s.qty:Math.min(s.qty,s.origQty*m.fraction),h=this.close(s.id,p,m.price,m.label,
i);l.push({kind:"tp",positionId:s.id,message:`${m.label} 체결 @ ${this.px(s.symbol,m.price)} (순손익 ${h?(h.netPnl>=0?"+":"")+h.netPnl.toFixed(2):"-"} USDT\
)`});const S=this.state.positions.find(f=>f.id===s.id);if(!S)break;c===0&&this.moveSlToBe&&!S.beMoved&&(S.sl=Xt(S,this.precision(S.symbol).dp),S.beMoved=!0,l.push(
{kind:"be",positionId:s.id,message:`TP1 후 SL → 본절 ${this.px(S.symbol,S.sl)} (수수료 포함)`}))}}return l}snapEquity(t,n=Date.now()){const i=this.equity(
t),l=this.state.equityCurve;l.push({t:n,equity:i}),l.length>2e3&&l.splice(0,l.length-2e3)}}function Zt(e){return JSON.parse(JSON.stringify(e))}function en(e,t=[]){
const n=new Set(t),i=new Map;let l=0,r=0;for(const c of e){if(l+=c.fees,n.has(c.positionId)){r+=c.netPnl;continue}i.set(c.positionId,(i.get(c.positionId)??0)+c.
netPnl)}const s=[...i.values()],a=s.filter(c=>c>0).length;return{trades:s.length,wins:a,winRate:s.length?a/s.length:0,net:s.reduce((c,m)=>c+m,0)+r,fees:l,partialNet:r}}
function tn(e){const t=["closedAt","symbol","side","setup","qty","entry","exit","grossPnl","fees","netPnl","reason","positionId"],n=e.map(i=>[new Date(i.closedAt).
toISOString(),i.symbol,i.side,i.setup,i.qty,i.entry,i.exit,i.grossPnl.toFixed(4),i.fees.toFixed(4),i.netPnl.toFixed(4),`"${i.reason.replace(/"/g,'""')}"`,i.positionId].
join(","));return[t.join(","),...n].join(`
`)}const nn={TP1:"TP1 중앙선",TP2:"TP2 반대편",TP:"TP 1:3"};function sn(e){return e.map(t=>({price:Number(t.price),fraction:t.sizePct/100,label:nn[t.label]??
t.label}))}function on(e,t){try{const n=localStorage.getItem(e);return n?{...t,...JSON.parse(n)}:t}catch{return t}}function qe(e){try{const t=localStorage.getItem(
e);return t?JSON.parse(t):null}catch{return null}}function me(e,t){try{t==null?localStorage.removeItem(e):localStorage.setItem(e,JSON.stringify(t))}catch{}}const rn={
symbol:"BTCUSDT",tf:"15m",riskPct:1,leverage:10,autoPaper:!1,moveSlToBe:!0,maxAdds:2,addSizePct:50,lookback:80,tolerancePct:.25,pivotLeft:3,pivotRight:3,minTouches:2,
requireRange:!0,notify:!1,showHist:!0},ln=["차트","거래","포지션","기록","설정"],Te={RANGE_LONG:"박스 반전 롱",RANGE_SHORT:"박스 반전 숏",FAKE_BREAKOUT_LONG:"\
가짜 이탈 롱",FAKE_BREAKOUT_SHORT:"가짜 돌파 숏",BREAKOUT_LONG:"진짜 돌파 롱",BREAKOUT_SHORT:"진짜 이탈 숏"},gt=e=>e==="MANUAL"?"수동":Te[e]??
e,tt="dupont.broker.v1",nt="dupont.settings.v1",Me="dupont.seen.v1";function an(e,t){const n=e.level?D(e.level,t):"";return e.add?`돌파 레벨 ${n} 리테스트 확인 – \
추가 진입 가능`:e.reason.startsWith("max adds")?"최대 추가 횟수 도달":e.reason.startsWith("no retest")?`돌파 레벨 ${n} 리테스트 대기`:e.
reason.startsWith("retest without")?"리테스트 중 – 장악형/압력 확인 대기":e.reason.startsWith("no broken")?"돌파 레벨 정보 없음":e.reason.
startsWith("pyramiding only")?"돌파 포지션에서만 사용":"데이터 부족"}function cn(){var ce,de,fe;const[e,t]=E("차트"),[n,i]=E(()=>on(nt,rn)),l=o=>i(
y=>{const M={...y,...o};return me(nt,M),M}),r=ee(n.symbol),s=Wt(n.symbol,n.tf),[a,c]=E(()=>qe(`dupont.box.${n.symbol}`));J(()=>c(qe(`dupont.box.${n.symbol}`)),[
n.symbol]);const[m,u]=E(!1),p=Jt(s.candles,s.intervalMs,s.trades,s.tapeFrom,s.tapeVer,n,a),h=z(null);h.current||(h.current=new Yt(qe(tt)??void 0)),h.current.moveSlToBe=
n.moveSlToBe,h.current.precision=o=>{const y=ee(o);return{dp:y.dp,qdp:y.qdp}};const[S,f]=E(0),q=()=>{me(tt,h.current.state),f(o=>o+1)},[b,w]=E([]),N=_e((o,y="in\
fo")=>{const M=Date.now()+Math.random();if(w(P=>[...P.slice(-1),{id:M,text:o,tone:y}]),setTimeout(()=>w(P=>P.filter(C=>C.id!==M)),4e3),n.notify&&"Notification"in
window&&Notification.permission==="granted"&&document.visibilityState!=="visible")try{new Notification("듀퐁 스탠다드",{body:o,icon:"/dupont-mobile/icons/\
icon.svg"})}catch{}},[n.notify]),x=((ce=s.ticker)==null?void 0:ce.last)??((de=s.candles[s.candles.length-1])==null?void 0:de.close)??0,[v,F]=E({});J(()=>{x&&F(o=>({
...o,[n.symbol]:x}))},[x,n.symbol]),J(()=>{if(!x)return;const o=h.current.onPrice(n.symbol,x);o.length&&(o.forEach(y=>N(y.message,y.kind==="sl"||y.kind==="liq"?
"down":"up")),q())},[x]),J(()=>{const o=setInterval(async()=>{const y=new Set([...h.current.state.positions.map(M=>M.symbol),...h.current.state.pending.map(M=>M.
symbol)]);y.delete(n.symbol);for(const M of y){const P=await at(M).catch(()=>null);if(!P)continue;F(B=>({...B,[M]:P.last}));const C=h.current.onPrice(M,P.last);
C.length&&(C.forEach(B=>N(`${M} ${B.message}`)),q())}},4e3);return()=>clearInterval(o)},[n.symbol]);const R=h.current.state,k=h.current.equity(v),L=h.current.available(),
A=R.positions.filter(o=>o.symbol===n.symbol),$=z(new Set(qe(Me)??[])),U=o=>`${n.symbol}:${n.tf}:${o.type}:${o.ts}`,T=p.live[p.live.length-1]??null,O=oe(()=>{var M;
const o=((M=p.closed[p.closed.length-3])==null?void 0:M.ts)??0,y=[...p.history].reverse().find(P=>P.ts>=o);return T??y??null},[T,p.history,p.closed]),_=(o,y)=>Ut(
{equity:String(k),riskPct:n.riskPct,entry:String(o),sl:String(y),leverage:n.leverage,feeRate:String(re),qtyStep:String(r.qtyStep)}),he=(o,y=!1)=>{const M=x,P=Number(
o.sl),C=sn(o.targets),B=o.side==="long";if(B?!(P<M&&C[0].price>M):!(P>M&&C[0].price<M)){N("현재가가 신호 범위를 벗어나 진입 불가 (SL/TP1 사이 아님)",
"down");return}const I=_(M,P),G=Number(I.qty);if(!(G>0)||G*M<ye){N(`주문 금액이 최소 ${ye} USDT 미만 – 리스크/SL 거리 확인`,"down");return}const X=h.
current.open({symbol:n.symbol,side:o.side,qty:G,price:M,leverage:n.leverage,sl:P,targets:C,setup:o.type,signalId:U(o),breakoutLevel:o.kind==="breakout"?Number(B?
o.box.top:o.box.bottom):void 0});if($.current.add(U(o)),me(Me,[...$.current].slice(-300)),!X.ok){N(X.error??"진입 실패","down");return}N(`${y?"[자동] ":""}${Te[o.
type]} 모의 진입 ${D(G,r.qdp)} @ ${D(M,r.dp)}`,"up"),q()};J(()=>{if(!T)return;const o=U(T);$.current.has(`n:${o}`)||($.current.add(`n:${o}`),me(Me,[...$.current].
slice(-300)),N(`신호: ${Te[T.type]} · SL ${D(T.sl,r.dp)} · ${T.targets.map(y=>`${y.label} ${D(y.price,r.dp)}`).join(" / ")}`,T.side==="long"?"up":"down"),n.
autoPaper&&!A.length&&he(T,!0))},[T==null?void 0:T.ts,T==null?void 0:T.type]);const le=oe(()=>A.map(o=>{const y=At({side:o.side,entry:o.entry,sl:o.sl,targets:o.
targets.filter(P=>!P.done).map(P=>({price:P.price}))},s.candles,p.pressures),M=o.setup.startsWith("BREAKOUT")?Ct({side:o.side,entry:o.entry,targets:o.targets.map(
P=>({price:P.price})),type:o.setup,adds:o.adds,brokenLevel:o.breakoutLevel},p.closed,p.pressures.slice(0,p.closed.length),p.box,{maxAdds:n.maxAdds,addSizePct:n.
addSizePct}):null;return{p:o,flip:y,pyr:M}}),[S,s.candles,p.pressures,p.box,n.maxAdds,n.addSizePct,n.symbol]),W=z(new Set);J(()=>{var o;for(const y of le){const M=`${y.
p.id}:${(o=s.candles[s.candles.length-1])==null?void 0:o.ts}`;y.flip.alert&&!W.current.has(M)&&(W.current.add(M),N(`압력 반전 – 청산 권고 (${y.flip.multiple.
toFixed(1)}배)`,"warn"))}},[le]);const ve=(o,y,M)=>{const P=h.current.closeFraction(o.id,y,v[o.symbol]??x,M);P&&N(`${M} ${D(P.qty,ee(o.symbol).qdp)} @ ${D(P.exit,
ee(o.symbol).dp)} · 순손익 ${ge(P.netPnl)} USDT`,P.netPnl>=0?"up":"down"),q()},Ne=(o,y)=>{const M=o.origQty/(1+o.adds*(n.addSizePct/100)),P=ut(M*(y.sizePct??
n.addSizePct)/100,r.qtyStep);if(P*x<ye){N(`추가 수량이 최소 주문 금액(${ye} USDT) 미만`,"down");return}const C=h.current.open({symbol:o.symbol,side:o.
side,qty:P,price:x,leverage:o.leverage,sl:o.sl,targets:[],setup:o.setup});if(!C.ok){N(C.error??"추가 실패","down");return}y.sl&&C.position&&(C.position.sl=Number(
y.sl)),N(`불타기 #${o.adds+1}: ${D(P,r.qdp)} @ ${D(x,r.dp)}`,"up"),q()},Fe=_e(o=>{var I,G;const y=p.closed,M=y.length>=2?o==="long"?Math.min(y[y.length-1].low,
y[y.length-2].low):Math.max(y[y.length-1].high,y[y.length-2].high):x*(o==="long"?.995:1.005),P=p.box,C=P?x<Number(P.top)&&x>Number(P.bottom):!1;if(P){const X=C?
"range":"breakout",V=o==="long"?Math.min(M,x*.999):Math.max(M,x*1.001),pe=rt({side:o,kind:X,entry:String(x),extremeWick:String(V),box:P}),ue=Y=>Y?Number(Y).toFixed(
r.dp):"";return{side:o,kind:X,sl:ue(pe.sl),tp1:ue((I=pe.targets[0])==null?void 0:I.price),tp2:ue((G=pe.targets[1])==null?void 0:G.price)}}const B=o==="long"?x*.995:
x*1.005;return{side:o,kind:"breakout",sl:B.toFixed(r.dp),tp1:(x+(x-B)*3).toFixed(r.dp),tp2:""}},[p.closed,p.box,x,r.dp]),[De,$e]=E(null),Re=o=>{var M,P;const y=C=>C?
Number(C).toFixed(r.dp):"";$e({side:o.side,kind:o.kind,sl:y(o.sl),tp1:y((M=o.targets[0])==null?void 0:M.price),tp2:y((P=o.targets[1])==null?void 0:P.price),signal:o}),
t("거래")},se=(((fe=s.ticker)==null?void 0:fe.change24h)??0)>=0;return g("div",{className:"h-full flex flex-col pt-safe",children:[d("header",{className:"px-3\
 pt-2 pb-1.5 border-b border-line",children:g("div",{className:"flex items-end justify-between",children:[g("div",{children:[g("div",{className:"flex items-cent\
er gap-2",children:[d("select",{value:n.symbol,onChange:o=>l({symbol:o.target.value}),className:"bg-transparent text-[15px] font-semibold outline-none",children:ct.
map(o=>d("option",{value:o.symbol,className:"bg-panel",children:o.symbol},o.symbol))}),d("span",{className:"text-[10px] px-1.5 py-0.5 rounded bg-panel2 text-mut\
ed",children:"무기한 · 모의"}),d("span",{className:`w-2 h-2 rounded-full ${s.status==="live"?"bg-up":"bg-warn"}`,title:s.status})]}),d("div",{className:`t\
ext-[26px] leading-8 font-semibold num ${se?"text-up":"text-down"}`,children:x?D(x,r.dp):"—"})]}),g("div",{className:"text-right text-[11px] text-muted num le\
ading-[18px]",children:[g("div",{children:["24h ",d("span",{className:se?"text-up":"text-down",children:s.ticker?Ot(s.ticker.change24h):"—"})]}),g("div",{children:[
"마크 ",s.ticker?D(s.ticker.mark,r.dp):"—"]}),g("div",{children:["펀딩 ",s.ticker?`${(s.ticker.funding*100).toFixed(4)}%`:"—"]})]})]})}),b.length>0&&d("\
div",{className:"px-3 py-1.5 space-y-1 border-b border-line bg-bg","aria-live":"polite",children:b.map(o=>d("div",{className:`text-[12px] leading-4 px-2.5 py-1.\
5 rounded-md ${o.tone==="down"?"bg-down/20 text-down":o.tone==="up"?"bg-up/15 text-up":o.tone==="warn"?"bg-warn/20 text-warn":"bg-panel2 text-txt"}`,children:o.
text},o.id))}),g("main",{className:"flex-1 min-h-0 flex flex-col overflow-hidden",children:[e==="차트"&&g(yt,{children:[g("div",{className:"flex items-center \
justify-between px-3 py-1.5 gap-2",children:[d(Ce,{items:jt,value:n.tf,onChange:o=>l({tf:o})}),d("button",{onClick:()=>u(o=>!o),className:`h-8 px-3 rounded-full\
 text-xs ${m?"bg-warn text-bg font-semibold":"bg-panel2 text-muted"}`,children:m?"편집 완료":"박스 편집"})]}),d("div",{className:"flex-1 min-h-0",children:s.
candles.length?d(Et,{viewKey:`${n.symbol}:${n.tf}`,candles:s.candles,pressures:p.pressures,box:p.box,signals:p.history,positions:A,dp:r.dp,showHist:n.showHist,editBox:m,
onBoxEdit:(o,y)=>{var P;const M={top:o,bottom:y,startTs:(a==null?void 0:a.startTs)??((P=p.box)==null?void 0:P.startTime)??Date.now(),locked:!0};c(M),me(`dupont.\
box.${n.symbol}`,M)}}):d("div",{className:"p-6 text-muted text-sm",children:s.err?`데이터 오류: ${s.err}`:"캔들 불러오는 중…"})}),d(dn,{box:p.box,
manual:a,dp:r.dp,tape:p.tapeCandles,onUnlock:()=>{c(null),me(`dupont.box.${n.symbol}`,null),u(!1)},onEdit:(o,y)=>{var P;const M={top:o,bottom:y,startTs:(a==null?
void 0:a.startTs)??((P=p.box)==null?void 0:P.startTime)??Date.now(),locked:!0};c(M),me(`dupont.box.${n.symbol}`,M)}}),le.filter(o=>o.flip.alert).map(o=>g("div",
{className:"mx-3 mb-2 rounded-lg bg-warn/15 border border-warn px-3 py-2 flex items-center justify-between",children:[g("span",{className:"text-[13px] text-warn\
 font-semibold",children:["⚠ 압력 반전 – 청산 권고 (",o.flip.multiple.toFixed(1),"배)"]}),d(ie,{tone:"warn",className:"h-9",onClick:()=>ve(o.p,1,"압\
력반전 청산"),children:"청산"})]},o.p.id)),d(un,{g:O,dp:r.dp,acted:O?$.current.has(U(O)):!1,onEnter:()=>O&&he(O),onEdit:()=>O&&Re(O)})]}),e==="거래"&&d(
mn,{s:n,set:l,last:x,dp:r.dp,book:s.book,equity:k,available:L,qtyStep:r.qtyStep,draft:De,setDraft:$e,defaultDraft:Fe,sizeFor:_,onSubmit:(o,y,M,P)=>{var X;const C=Number(
o.sl),B=o.kind==="breakout"||!o.tp2?[{price:Number(o.tp1),fraction:1,label:"TP 1:3"}]:[{price:Number(o.tp1),fraction:.5,label:"TP1 중앙선"},{price:Number(o.tp2),
fraction:.5,label:"TP2 반대편"}],I=((X=o.signal)==null?void 0:X.type)??"MANUAL",G=o.kind==="breakout"&&p.box?Number(o.side==="long"?p.box.top:p.box.bottom):void 0;
if(y==="limit"){const V=h.current.placeLimit({symbol:n.symbol,side:o.side,qty:P,price:M,leverage:n.leverage,sl:C,targets:B,setup:I,breakoutLevel:G});N(V.ok?`지정가\
 ${o.side==="long"?"롱":"숏"} 주문 ${D(P,r.qdp)} @ ${D(M,r.dp)}`:V.error??"주문 실패",V.ok?"up":"down")}else{const V=h.current.open({symbol:n.symbol,side:o.
side,qty:P,price:x,leverage:n.leverage,sl:C,targets:B,setup:I,breakoutLevel:G,signalId:o.signal?U(o.signal):void 0});N(V.ok?`${o.side==="long"?"롱":"숏"} 모의 진\
입 ${D(P,r.qdp)} @ ${D(x,r.dp)}`:V.error??"진입 실패",V.ok?"up":"down"),o.signal&&($.current.add(U(o.signal)),me(Me,[...$.current].slice(-300)))}q()}},n.symbol),
e==="포지션"&&g("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[g(ne,{className:"p-3",children:[d(Q,{k:"자산 (Equity)",v:`${D(k)} USDT`}),
d(Q,{k:"가용",v:`${D(L)} USDT`}),d(Q,{k:"미실현 손익 (순, 지금 청산 시)",v:(()=>{const o=R.positions.reduce((M,P)=>{const C=v[P.symbol]??P.entry;return M+
Ue(P,C)-P.entryFeeLeft-C*P.qty*re},0),y=Number(o.toFixed(2));return g("span",{className:y>0?"text-up":y<0?"text-down":"",children:[ge(o)," USDT"]})})()})]}),!R.
positions.length&&d("div",{className:"text-muted text-sm text-center py-8",children:"보유 포지션 없음"}),R.positions.map(o=>{var B;const y=le.find(I=>I.p.
id===o.id),M=v[o.symbol]??o.entry,P=Ue(o,M)-o.entryFeeLeft-M*o.qty*re,C=ee(o.symbol).dp;return g(ne,{className:"p-3",children:[g("div",{className:"flex justify-\
between items-center mb-1",children:[g("div",{className:"font-semibold",children:[d("span",{className:o.side==="long"?"text-up":"text-down",children:o.side==="l\
ong"?"롱":"숏"})," ",o.symbol," ",g("span",{className:"text-muted text-xs",children:[o.leverage,"x · ",gt(o.setup)]})]}),g("div",{className:"text-right",children:[
g("div",{className:`num font-semibold ${P>=0?"text-up":"text-down"}`,children:[ge(P)," USDT"]}),d("div",{className:"text-[10px] text-muted",children:"지금 청산 시 순손\
익"})]})]}),d(Q,{k:"수량 / 진입가",v:`${D(o.qty,ee(o.symbol).qdp)} / ${D(o.entry,C)}`}),d(Q,{k:"마크 / 청산가",v:`${D(M,C)} / ${D(o.liqPrice,C)}`}),d(
Q,{k:`SL${o.beMoved?" (본절)":""}`,v:D(o.sl,C)}),o.targets.map((I,G)=>d(Q,{k:I.label,v:g("span",{className:I.done?"text-up":"",children:[D(I.price,C)," · ",Math.
round(I.fraction*100),"% ",I.done?"✓ 체결":"대기"]})},G)),d(Q,{k:"실현 손익 (순)",v:ge(o.realizedNet)}),(y==null?void 0:y.flip.alert)&&g("div",{className:"\
mt-2 text-[12px] text-warn",children:["⚠ 압력 반전 – 청산 권고 (",y.flip.multiple.toFixed(1),"배, 목표 진행 ",Math.round(y.flip.progress*100),"\
%)"]}),(y==null?void 0:y.pyr)&&g("div",{className:`mt-1 text-[11px] ${y.pyr.add?"text-accent":"text-muted"}`,children:["불타기 ",o.adds,"/",n.maxAdds,": ",an(
y.pyr,ee(o.symbol).dp)]}),!(y!=null&&y.pyr)&&g("div",{className:"mt-1 text-[11px] text-muted",children:["불타기: 돌파 신호 포지션에서만 사용 (최대 ",
n.maxAdds,"회)"]}),g("div",{className:"grid grid-cols-3 gap-2 mt-3",children:[d(ie,{tone:"down",onClick:()=>ve(o,1,"시장가 청산"),children:"전량 청산"}),
d(ie,{onClick:()=>ve(o,.5,"50% 청산"),children:"50% 청산"}),d(ie,{tone:"accent",disabled:!((B=y==null?void 0:y.pyr)!=null&&B.add)||o.adds>=n.maxAdds||o.symbol!==
n.symbol,onClick:()=>(y==null?void 0:y.pyr)&&Ne(o,y.pyr),children:"불타기"})]})]},o.id)}),R.pending.length>0&&g(ne,{className:"p-3",children:[d("div",{className:"\
text-sm font-semibold mb-1",children:"미체결 지정가"}),R.pending.map(o=>g("div",{className:"flex justify-between items-center py-1 text-[13px]",children:[
g("span",{className:o.side==="long"?"text-up":"text-down",children:[o.side==="long"?"롱":"숏"," ",o.symbol," ",D(o.qty,ee(o.symbol).qdp)," @ ",D(o.price,ee(o.
symbol).dp)]}),d("button",{className:"text-muted underline",onClick:()=>{h.current.cancelLimit(o.id),q()},children:"취소"})]},o.id))]})]}),e==="기록"&&d(hn,
{broker:h.current}),e==="설정"&&g("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[g(ne,{className:"p-3",children:[d("div",{className:"text-s\
m font-semibold mb-2",children:"자금"}),d(Q,{k:"시드 / 지갑",v:`${D(R.bankroll)} / ${D(R.wallet)} USDT`}),d(ie,{tone:"down",className:"w-full mt-2",onClick:()=>{
confirm("모의 자금을 200 USDT로 초기화하고 포지션·기록을 삭제할까요?")&&(h.current.reset(Oe),q(),N("200 USDT로 초기화"))},children:"자\
금 초기화 (200 USDT)"})]}),g(ne,{className:"p-3 space-y-3",children:[d("div",{className:"text-sm font-semibold",children:"리스크"}),g("div",{className:"g\
rid grid-cols-2 gap-2",children:[d(H,{label:"거래당 리스크 %",value:String(n.riskPct),onChange:o=>l({riskPct:Math.max(.1,Number(o)||1)}),suffix:"%"}),d(H,
{label:"기본 레버리지",value:String(n.leverage),onChange:o=>l({leverage:Math.min(125,Math.max(1,Math.round(Number(o)||1)))}),suffix:"x"}),d(H,{label:"불타기 \
최대 횟수",value:String(n.maxAdds),onChange:o=>l({maxAdds:Math.max(0,Math.round(Number(o)||0))})}),d(H,{label:"불타기 크기 (초기 대비)",value:String(
n.addSizePct),onChange:o=>l({addSizePct:Math.max(5,Number(o)||50)}),suffix:"%"})]}),d(ke,{on:n.moveSlToBe,onChange:o=>l({moveSlToBe:o}),label:"TP1 체결 후 SL 본절 이동",
hint:"본절가 = 진입가 + 남은 진입·청산 수수료 (손실 없이 청산)"}),d(ke,{on:n.autoPaper,onChange:o=>l({autoPaper:o}),label:"자동 모의매매",
hint:"신호 발생 시 자동으로 모의 진입 (기본 OFF)"})]}),g(ne,{className:"p-3 space-y-3",children:[d("div",{className:"text-sm font-semibold",children:"\
박스 / 피봇"}),g("div",{className:"grid grid-cols-2 gap-2",children:[d(H,{label:"룩백 (캔들)",value:String(n.lookback),onChange:o=>l({lookback:Math.max(
20,Math.round(Number(o)||80))})}),d(H,{label:"터치 허용 %",value:String(n.tolerancePct),onChange:o=>l({tolerancePct:Math.max(.05,Number(o)||.25)}),suffix:"%"}),
d(H,{label:"피봇 좌",value:String(n.pivotLeft),onChange:o=>l({pivotLeft:Math.max(1,Math.round(Number(o)||3))})}),d(H,{label:"피봇 우",value:String(n.pivotRight),
onChange:o=>l({pivotRight:Math.max(1,Math.round(Number(o)||3))})}),d(H,{label:"최소 터치",value:String(n.minTouches),onChange:o=>l({minTouches:Math.max(1,Math.
round(Number(o)||2))})})]}),d(ke,{on:n.requireRange,onChange:o=>l({requireRange:o}),label:"박스권(비추세)일 때만 신호"}),d(ke,{on:n.showHist,onChange:o=>l(
{showHist:o}),label:"압력 히스토그램 표시"})]}),d(ne,{className:"p-3",children:d(ke,{on:n.notify,onChange:async o=>{o&&"Notification"in window&&Notification.
permission!=="granted"&&await Notification.requestPermission(),l({notify:o})},label:"알림",hint:"신호·체결·압력반전 (홈 화면 앱에서 권장)"})}),
d("div",{className:"text-[11px] text-muted px-1 pb-4 leading-5",children:"페이퍼(모의) 트레이딩 전용 · 실계좌/API 키 없음 · Bitget 공개 시세 사용. 수수료: Bitget USDT-M 테이커 0.06% / 메이커 0\
.02%. 펀딩비는 미반영. 압력: 실시간 체결(aggressor) 집계, 연결 이전 캔들은 OHLCV 근사."})]})]}),d("nav",{className:"border-t border-lin\
e bg-panel pb-safe grid grid-cols-5",children:ln.map(o=>d("button",{onClick:()=>t(o),className:`h-14 text-[13px] relative ${e===o?"text-accent font-semibold":"t\
ext-muted"}`,children:g("span",{className:"inline-flex items-center gap-1",children:[o,o==="포지션"&&R.positions.length>0&&d("span",{className:"min-w-4 h-4 p\
x-1 rounded-full bg-accent text-bg text-[10px] leading-4 font-semibold",children:R.positions.length})]})},o))})]})}function dn({box:e,manual:t,dp:n,tape:i,onUnlock:l,
onEdit:r}){const[s,a]=E(!1),[c,m]=E(""),[u,p]=E("");return e?g("div",{className:"px-3 py-1.5 border-t border-line text-[12px]",children:[g("div",{className:"fle\
x items-center justify-between gap-2",children:[g("div",{className:"num leading-5",children:[d("span",{className:"text-muted",children:"박스 "}),d("span",{className:"\
text-down",children:D(e.bottom,n)})," – ",d("span",{className:"text-up",children:D(e.top,n)}),d("span",{className:"text-muted",children:" · 50% "}),D(e.mid,n)]}),
g("div",{className:"flex gap-1.5 items-center",children:[d("span",{className:`px-1.5 py-0.5 rounded text-[10px] ${e.isRange?"bg-up/20 text-up":"bg-warn/20 text-\
warn"}`,children:t?"수동·고정":e.isRange?"박스권":"추세/약함"}),d("button",{className:"text-accent",onClick:()=>{m(String(Number(e.top))),p(String(Number(
e.bottom))),a(h=>!h)},children:"수정"}),t&&d("button",{className:"text-muted",onClick:l,children:"자동"})]})]}),g("div",{className:"text-[10px] text-muted",
children:["터치 ",e.touchesTop,"/",e.touchesBottom," · 실시간 체결 압력 ",i,"캔들 (그 외 OHLCV 근사)"]}),s&&g("div",{className:"grid grid-cols-3\
 gap-2 mt-2 items-end",children:[d(H,{label:"상단(저항)",value:c,onChange:m}),d(H,{label:"하단(지지)",value:u,onChange:p}),d(ie,{tone:"accent",onClick:()=>{
const h=Number(c),S=Number(u);h>0&&S>0&&h!==S&&(r(h,S),a(!1))},children:"고정"})]})]}):d("div",{className:"px-3 py-2 text-[12px] text-muted border-t border-li\
ne",children:"박스 탐지 중… (피봇 터치 부족)"})}function un({g:e,dp:t,acted:n,onEnter:i,onEdit:l}){if(!e)return d("div",{className:"mx-3 mb-2 px-3 \
py-2 rounded-lg bg-panel border border-line text-[12px] text-muted",children:"신호 대기 중 · 박스 지지/저항 + 장악형 + 압력 확인 시 표시"});
const r=e.side==="long";return g("div",{className:`mx-3 mb-2 rounded-xl border px-3 py-2 ${r?"border-up/60 bg-up/10":"border-down/60 bg-down/10"}`,children:[g("\
div",{className:"flex justify-between items-center",children:[g("div",{className:`font-semibold ${r?"text-up":"text-down"}`,children:[Te[e.type]," ",g("span",{className:"\
text-muted text-[11px] font-normal",children:[Ee(e.ts)," 마감"]})]}),g("div",{className:"text-[11px] text-muted",children:["매수압력 ",Math.round(e.pressure.
ratio*100),"%"]})]}),g("div",{className:"grid grid-cols-4 gap-1 text-[11px] num mt-1",children:[g("div",{children:[d("div",{className:"text-muted",children:"진입"}),
D(e.entry,t)]}),g("div",{children:[d("div",{className:"text-muted",children:"SL"}),d("span",{className:"text-warn",children:D(e.sl,t)})]}),e.targets.map(s=>g("d\
iv",{children:[g("div",{className:"text-muted",children:[s.label," ",s.sizePct,"%"]}),d("span",{className:"text-up",children:D(s.price,t)})]},s.label))]}),g("di\
v",{className:"flex gap-2 mt-2",children:[d(ie,{tone:r?"up":"down",className:"flex-1 h-10",disabled:n,onClick:i,children:n?"진입 완료/처리됨":`탭하여 모의 ${r?
"롱":"숏"} 진입`}),d(ie,{className:"h-10",onClick:l,children:"수정"})]})]})}function mn(e){const[t,n]=E("market"),[i,l]=E(""),[r,s]=E(""),a=e.draft??e.defaultDraft(
"long");J(()=>{!e.draft&&e.last&&e.setDraft(e.defaultDraft("long"))},[e.last>0]);const c=t==="limit"&&Number(i)>0?Number(i):e.last,m=Number(a.sl);let u=null;try{
u=c>0&&m>0&&m!==c?e.sizeFor(c,m):null}catch{u=null}const p=Math.max(0,Math.round(-Math.log10(e.qtyStep))),h=r?ut(Number(r)||0,e.qtyStep):Number((u==null?void 0:
u.qty)??0),S=a.side==="long",f=Number(a.tp1),q=Number(a.tp2),b=S?m<c:m>c,w=f>0&&(S?f>c:f<c)&&(a.kind==="breakout"||!a.tp2||(S?q>f:q<f)),N=h*c,x=N>=ye,v=N/e.s.leverage,
F=t==="limit"?ht:re,R=Math.abs(c-m)*h+c*h*F+m*h*re,k=b&&w&&x&&v+c*h*F<=e.available+1e-9,L=b?w?x?"가용 증거금 부족":`최소 주문 금액 ${ye} USDT 이상 필요`:
`TP가 진입가 ${S?"위":"아래"}(TP2는 TP1 너머)에 있어야 합니다`:`SL이 진입가 ${S?"아래":"위"}에 있어야 합니다`,A=$=>e.setDraft({...a,
...$});return g("div",{className:"flex-1 overflow-y-auto px-3 pt-3",children:[g("div",{className:"grid grid-cols-[minmax(0,1fr)_124px] gap-2.5",children:[g("div",
{className:"space-y-2.5",children:[d("div",{className:"grid grid-cols-2 gap-1 bg-panel2 rounded-lg p-1",children:["long","short"].map($=>d("button",{onClick:()=>{
s(""),e.setDraft(a.signal&&a.side===$?a:e.defaultDraft($))},className:`h-9 rounded-md font-semibold text-sm ${a.side===$?$==="long"?"bg-up text-white":"bg-down \
text-white":"text-muted"}`,children:$==="long"?"롱":"숏"},$))}),d(Ce,{items:["market","limit"],value:t,onChange:$=>n($),fmt:$=>$==="market"?"시장가":"지정가"}),
t==="limit"&&d(H,{label:"지정가",value:i,onChange:l}),g("div",{children:[d("span",{className:"text-[11px] text-muted",children:"레버리지"}),d(Ce,{items:[
3,5,10,20],value:e.s.leverage,onChange:$=>e.set({leverage:$}),fmt:$=>`${$}x`})]}),d(H,{label:"리스크 (자산 대비)",value:String(e.s.riskPct),onChange:$=>{
s(""),e.set({riskPct:Math.max(.1,Number($)||1)})},suffix:"%"}),d(H,{label:"손절 SL",value:String(a.sl),onChange:$=>A({sl:$})}),d(H,{label:a.kind==="breakout"?
"TP (1:3, 100%)":"TP1 중앙선 (50%)",value:String(a.tp1),onChange:$=>A({tp1:$})}),a.kind==="range"&&d(H,{label:"TP2 반대편 경계 (50%)",value:String(a.tp2),
onChange:$=>A({tp2:$})}),d(H,{label:`수량 (리스크 ${e.s.riskPct}%: ${u?D(u.qty,p):"—"})`,value:r||(u?Number(u.qty).toFixed(p):""),onChange:s})]}),d("div",
{className:"bg-panel rounded-xl border border-line py-2",children:d(_t,{book:e.book,dp:e.dp,rows:7})})]}),a.signal&&g("div",{className:"mt-2 text-[11px] text-ac\
cent",children:["신호 자동 입력: ",Te[a.signal.type]," (",Ee(a.signal.ts)," 마감) · SL/TP 자동"]}),g(ne,{className:"p-3 mt-3",children:[d(Q,{k:"진입 기준\
가",v:D(c,e.dp)}),d(Q,{k:"증거금 / 명목",v:h>0?`${D(v)} / ${D(N)} USDT`:"—"}),d(Q,{k:"SL 시 순손실 (수수료 포함)",v:h>0&&b?g("span",{className:"\
text-down",children:["-",D(R)," USDT (",(R/Math.max(e.equity,1e-9)*100).toFixed(2),"%)"]}):"—"}),h>0&&w&&d(Q,{k:a.kind==="breakout"||!a.tp2?"TP 시 순이익":
"TP1+TP2 시 순이익",v:g("span",{className:"text-up",children:["+",D((a.kind==="breakout"||!a.tp2?Math.abs(f-c)*h-f*h*re:Math.abs(f-c)*h*.5+Math.abs(q-c)*h*.5-
(f+q)*h*.5*re)-c*h*F)," USDT"]})}),d(Q,{k:"가용 / 자산",v:`${D(e.available)} / ${D(e.equity)} USDT`})]}),g("div",{className:"sticky bottom-0 -mx-3 px-3 pt-2\
 pb-3 mt-1 bg-bg/95 backdrop-blur border-t border-line",children:[!k&&h>0&&d("div",{className:"text-[11px] text-down mb-1",children:L}),d(ie,{tone:a.side==="lon\
g"?"up":"down",className:"w-full h-12 text-[16px]",disabled:!k||!(h>0),onClick:()=>{e.onSubmit(a,t,c,h),s("")},children:a.side==="long"?"롱 (매수) 모의 진입":
"숏 (매도) 모의 진입"})]})]})}function hn({broker:e}){var p,h,S;const t=e.state,n=en(t.fills,t.positions.map(f=>f.id)),i=t.equityCurve,l=360,r=120,s=i.map(
f=>f.equity),a=Math.min(...s,t.bankroll),c=Math.max(...s,t.bankroll),m=i.map((f,q)=>`${q?"L":"M"}${q/Math.max(1,i.length-1)*l},${r-(f.equity-a)/Math.max(1e-9,c-
a)*(r-10)-5}`).join(" "),u=async()=>{var N;const f=tn(t.fills),q=`dupont-paper-${new Date().toISOString().slice(0,10)}.csv`,b=new File([f],q,{type:"text/csv"});
if((N=navigator.canShare)!=null&&N.call(navigator,{files:[b]}))try{await navigator.share({files:[b],title:q});return}catch{}const w=document.createElement("a");
w.href=URL.createObjectURL(b),w.download=q,w.click(),setTimeout(()=>URL.revokeObjectURL(w.href),2e3)};return g("div",{className:"flex-1 overflow-y-auto p-3 spac\
e-y-3",children:[g(ne,{className:"p-3",children:[g("div",{className:"grid grid-cols-3 text-center",children:[g("div",{children:[d("div",{className:"text-[11px] \
text-muted",children:"거래"}),d("div",{className:"num font-semibold",children:n.trades})]}),g("div",{children:[d("div",{className:"text-[11px] text-muted",children:"\
승률"}),g("div",{className:"num font-semibold",children:[(n.winRate*100).toFixed(0),"%"]})]}),g("div",{children:[d("div",{className:"text-[11px] text-muted",children:"\
순손익"}),d("div",{className:`num font-semibold ${n.net>=0?"text-up":"text-down"}`,children:ge(n.net)})]})]}),g("div",{className:"text-[11px] text-muted text\
-center mt-1",children:["수수료 합계 ",D(n.fees,3)," USDT (순손익에 반영)",n.partialNet!==0?` · 보유 중 부분청산 ${ge(n.partialNet)} 포함`:
""]})]}),g(ne,{className:"p-3",children:[g("div",{className:"flex justify-between text-[12px] text-muted mb-1 num",children:[d("span",{children:"자산 곡선"}),
g("span",{children:[D(((p=i[0])==null?void 0:p.equity)??t.bankroll)," → ",d("span",{className:(((h=i[i.length-1])==null?void 0:h.equity)??t.bankroll)>=t.bankroll?
"text-up":"text-down",children:D(((S=i[i.length-1])==null?void 0:S.equity)??t.bankroll)})," USDT"]})]}),g("svg",{viewBox:`0 0 ${l} ${r}`,className:"w-full h-[12\
0px]",children:[d("line",{x1:"0",x2:l,y1:r-(t.bankroll-a)/Math.max(1e-9,c-a)*(r-10)-5,y2:r-(t.bankroll-a)/Math.max(1e-9,c-a)*(r-10)-5,stroke:"#262e38",strokeDasharray:"\
4 4"}),d("path",{d:m,fill:"none",stroke:"#00c2cb",strokeWidth:"2"})]})]}),d(ie,{className:"w-full",onClick:u,disabled:!t.fills.length,children:"CSV 내보내기"}),
[...t.fills].reverse().map(f=>g(ne,{className:"p-3",children:[g("div",{className:"flex justify-between text-[13px]",children:[g("span",{children:[d("span",{className:f.
side==="long"?"text-up":"text-down",children:f.side==="long"?"롱":"숏"})," ",f.symbol," · ",gt(f.setup)]}),g("span",{className:`num font-semibold ${f.netPnl>=
0?"text-up":"text-down"}`,children:[ge(f.netPnl)," USDT"]})]}),g("div",{className:"text-[11px] text-muted num mt-0.5",children:[Ee(f.closedAt)," · ",f.reason,"\
 · ",D(f.qty,ee(f.symbol).qdp)," · ",D(f.entry,ee(f.symbol).dp)," → ",D(f.exit,ee(f.symbol).dp)," · 수수료 ",D(f.fees,3)]})]},f.id)),!t.fills.length&&d(
"div",{className:"text-muted text-sm text-center py-6",children:"거래 기록 없음"})]})}vt.createRoot(document.getElementById("root")).render(d(cn,{}));if("\
serviceWorker"in navigator){const e="/dupont-mobile/";window.addEventListener("load",()=>navigator.serviceWorker.register(`${e}sw.js`,{scope:e}).catch(()=>{}))}
