var vt=Object.defineProperty;var wt=(e,t,n)=>t in e?vt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var J=(e,t,n)=>wt(e,typeof t!="symbol"?t+"":t,n);import{jsxs as b,jsx as d,Fragment as kt}from"react/jsx-runtime";import Nt from"react-dom/client";import{useRef as G,useEffect as Y,useState as K,useMemo as ne,
useCallback as Ze}from"react";import et from"decimal.js";import{createChart as St,LineStyle as Pe}from"lightweight-charts";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[r\
el="modulepreload"]'))s(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="moduleprel\
oad"&&s(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=
o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(o){
if(o.ep)return;o.ep=!0;const r=n(o);fetch(o.href,r)}})();const qe=et.clone({precision:40,rounding:et.ROUND_HALF_UP});function Q(e){return typeof e=="number"?e:Number(
e)}function O(e){return new qe(e)}function Z(e){return{ts:e.ts,open:Q(e.open),high:Q(e.high),low:Q(e.low),close:Q(e.close),volume:Q(e.volume)}}function ke(e,t,n){
if(t===void 0)return e;const s=O(t);if(s.lte(0))return e;const o=e.div(s);return(n==="down"?o.floor():n==="up"?o.ceil():o.toDecimalPlaces(0,qe.ROUND_HALF_UP)).times(
s)}function Et(e,t=3,n=3){const s=e.map(Z),o=[],r=[];for(let i=t;i<s.length-n;i++){const a=s[i];let l=!0,f=!0;for(let C=i-t;C<i;C++)a.high>s[C].high||(l=!1),a.low<
s[C].low||(f=!1);for(let C=i+1;C<=i+n;C++)a.high>=s[C].high||(l=!1),a.low<=s[C].low||(f=!1);l&&o.push({index:i,ts:a.ts,price:String(e[i].high),kind:"high"}),f&&
r.push({index:i,ts:a.ts,price:String(e[i].low),kind:"low"})}return{highs:o,lows:r}}function Tt(e){const t=e.map(Z);return t.map((n,s)=>{if(s===0)return n.high-n.
low;const o=t[s-1].close;return Math.max(n.high-n.low,Math.abs(n.high-o),Math.abs(n.low-o))})}function Ft(e,t=14){const n=Tt(e),s=new Array(n.length).fill(NaN);
if(n.length<t||t<=0)return s;let o=0;for(let i=0;i<t;i++)o+=n[i];let r=o/t;s[t-1]=r;for(let i=t;i<n.length;i++)r=(r*(t-1)+n[i])/t,s[i]=r;return s}function Pt(e,t=14){
const n=Ft(e,t);return n.length?n[n.length-1]:NaN}function tt(e,t,n,s){const o=[...e].sort((a,l)=>s==="top"?Q(l.price)-Q(a.price):Q(a.price)-Q(l.price));let r=null;
for(const a of o){const l=Q(a.price),f=l*t/100,C=o.filter(c=>Math.abs(Q(c.price)-l)<=f);if(C.length>=n){r=C;break}(!r||C.length>r.length)&&(r=C)}return!r||r.length===
0?null:{level:r.reduce((a,l)=>a.plus(O(l.price)),O(0)).div(r.length),members:r.sort((a,l)=>a.index-l.index)}}function We(e,t={}){const n=t.lookback??80,s=t.tolerancePct??
.25,o=t.minTouches??2,r=t.pivotLeft??3,i=t.pivotRight??3,a=t.atrPeriod??14,l=t.minHeightAtr??1.5,f=t.maxHeightAtr??15,C=t.minInsideShare??.7,c=t.minHeightPct??.6,
h=Math.max(0,e.length-n),g=e.slice(h);if(g.length<Math.max(r+i+1,a))return null;const m=Et(g,r,i);if(!m.highs.length||!m.lows.length)return null;const D=tt(m.highs,
s,o,"top"),p=tt(m.lows,s,o,"bottom");if(!D||!p)return null;const B=D.level,k=p.level;if(B.lte(k))return null;const S=re=>({...re,index:re.index+h}),x=D.members.
map(S),v=p.members.map(S),T=B.minus(k),A=Pt(g,a),$=A>0?T.toNumber()/A:1/0,L=B.toNumber(),q=k.toNumber(),E=L*s/100,F=q*s/100,P=g.map(Z),Ce=P.filter(re=>re.close<=
L+E&&re.close>=q-F).length/P.length,me=x.length>=o&&v.length>=o&&$>=l&&$<=f&&Ce>=C&&T.div(B.plus(k).div(2)).times(100).gte(c),z=Math.min(x[0].index,v[0].index);
return{top:B.toFixed(),bottom:k.toFixed(),mid:B.plus(k).div(2).toFixed(),height:T.toFixed(),startTime:e[z].ts,endTime:e[e.length-1].ts,startIndex:z,endIndex:e.length-
1,touchesTop:x.length,touchesBottom:v.length,topPivots:x,bottomPivots:v,atr:A,heightAtr:$,insideShare:Ce,tolerancePct:s,isRange:me}}function $t(e,t,n){const s=e+
t;return{buy:e,sell:t,net:e-t,ratio:s>0?e/s:.5,source:n}}function _e(e){const t=Z(e),n=t.high-t.low,s=n>0?t.volume*(t.close-t.low)/n:t.volume/2;return $t(s,t.volume-
s,"ohlcv")}function ht(e,t){const n=Z(e),s=Z(t);return!(n.close<n.open)||!(s.close>s.open)?!1:s.open<=n.close&&s.close>=n.open&&s.close-s.open>n.open-n.close}function pt(e,t){
const n=Z(e),s=Z(t);return!(n.close>n.open)||!(s.close<s.open)?!1:s.open>=n.close&&s.close<=n.open&&s.open-s.close>n.close-n.open}const Mt=new qe(2);function nt(e,t,n,s={}){
if(!n||e.length<2)return[];if((s.requireRange??!0)&&!n.isRange)return[];const o=Math.max(1,s.fromIndex??e.length-1),r=[];let i=new Set;for(let a=o;a<e.length;a++){
const l=qt(e,t,n,s,a),f=l.filter(C=>!i.has(C.type));r.push(...f),i=new Set(l.map(C=>C.type))}return r}function qt(e,t,n,s,o){const r=s.nearPct??.2,i=s.dominance??
.55,a=s.strongDominance??.6,l=Math.max(1,s.setupCandles??2),f=s.breakTolPct??n.tolerancePct,C=Z(e[o]),c=Z(e[o-1]),h=t[o]??_e(e[o]),g=e.slice(Math.max(0,o-l+1),o+
1).map(Z),m=Math.min(...g.map(I=>I.low)),D=Math.max(...g.map(I=>I.high)),p=Number(n.top),B=Number(n.bottom),k=Number(n.mid),S=(p-B)*r,x=Math.min(p*f/100,(p-B)*(s.
breakTolBoxFrac??.1)),v=x,T=x,A=C.close>=B-T&&C.close<=p+v,$=1-h.ratio,L=(C.high+C.low)/2,q=n.isRange,E=[],F={candles:e,box:n,opts:s,i:o,pr:h},P=I=>{I&&E.push(I)};
return C.close>p+v?q&&c.close<=p+v&&C.close>C.open&&h.ratio>=a&&P(we(F,"BREAKOUT_LONG","long",st(e,o,s,"long"),`close ${C.close} broke above top ${n.top} with b\
uy ratio ${h.ratio.toFixed(2)}`)):A&&m<B-T?h.ratio>=a&&C.close>C.open&&C.close>=L&&(C.low<B-T||c.low<B-T)&&P(we(F,"FAKE_BREAKOUT_LONG","long",m,`wick ${m} below\
 bottom ${n.bottom}, bullish reversal back inside with buy ratio ${h.ratio.toFixed(2)}`)):A&&C.low<=B+S&&C.close<k&&ht(e[o-1],e[o])&&h.ratio>=i&&P(we(F,"RANGE_L\
ONG","long",m,`bullish engulfing at support ${n.bottom}, buy ratio ${h.ratio.toFixed(2)}`)),C.close<B-T?q&&c.close>=B-T&&C.close<C.open&&$>=a&&P(we(F,"BREAKOUT_\
SHORT","short",st(e,o,s,"short"),`close ${C.close} broke below bottom ${n.bottom} with sell ratio ${$.toFixed(2)}`)):A&&D>p+v?$>=a&&C.close<C.open&&C.close<=L&&
(C.high>p+v||c.high>p+v)&&P(we(F,"FAKE_BREAKOUT_SHORT","short",D,`wick ${D} above top ${n.top}, bearish reversal back inside with sell ratio ${$.toFixed(2)}`)):
A&&C.high>=p-S&&C.close>k&&pt(e[o-1],e[o])&&$>=i&&P(we(F,"RANGE_SHORT","short",D,`bearish engulfing at resistance ${n.top}, sell ratio ${$.toFixed(2)}`)),E}function st(e,t,n,s){
const o=Math.max(1,n.breakoutSetupCandles??1),r=e.slice(Math.max(0,t-o+1),t+1).map(Z);return s==="long"?Math.min(...r.map(i=>i.low)):Math.max(...r.map(i=>i.high))}
function we(e,t,n,s,o){const{candles:r,box:i,opts:a,i:l,pr:f}=e,C=t.startsWith("BREAKOUT")?"breakout":"range",c=a.feeRate??Qe,h=a.slippageBps??0,g=je({side:n,kind:C,
entry:r[l].close,extremeWick:String(s),box:i,slBufferPct:a.slBufferPct,atr:i.atr,atrBufferFrac:a.atrBufferFrac,breakoutRR:a.breakoutRR,tickSize:a.tickSize,feeRate:c,
slippageBps:h});return C==="range"&&ft({side:n,entry:g.entry,sl:g.sl,tp:g.targets[0].price,feeRate:c,slippageBps:h})<(a.minNetR1??1)?null:{type:t,side:n,kind:C,
index:l,ts:r[l].ts,...g,pressure:f,box:{top:i.top,bottom:i.bottom,mid:i.mid},reason:o}}const Qe=6e-4;function ft(e){const t=Number(e.entry),n=Number(e.sl),s=Number(
e.tp),o=e.feeRate??Qe,r=(e.slippageBps??0)/1e4,i=Math.abs(t-n)+(o+r)*(t+n),a=(e.side==="long"?s-t:t-s)-(o+r)*t-o*s;return i>0?a/i:0}function je(e){const t=e.side===
"long",n=e.slBufferPct??.03,s=e.breakoutRR??3,o=e.tickSize,r=O(e.feeRate??Qe),i=O(e.slippageBps??0).div(1e4),a=ke(O(e.entry),o,"nearest"),l=O(e.extremeWick),f=l.
abs().times(n).div(100),C=O(e.atr&&Number.isFinite(e.atr)?e.atr:0).times(e.atrBufferFrac??.1),c=qe.max(f,C),h=ke(t?l.minus(c):l.plus(c),o,t?"down":"up"),g=a.minus(
h).abs(),m=p=>g.isZero()?0:p.minus(a).abs().div(g).toNumber(),D=[];if(e.kind==="breakout"){const p=r.plus(i),B=g.plus(p.times(a.plus(h))),k=t?a.times(O(1).plus(
p)).plus(B.times(s)).div(O(1).minus(r)):a.times(O(1).minus(p)).minus(B.times(s)).div(O(1).plus(r)),S=ke(k,o,t?"up":"down");D.push({label:"TP",price:S.toFixed(),
sizePct:100,rr:m(S)})}else{const p=ke(O(e.box.top).plus(O(e.box.bottom)).div(Mt),o,"nearest"),B=O(t?e.box.top:e.box.bottom);(t?p.gt(a):p.lt(a))?(D.push({label:"\
TP1",price:p.toFixed(),sizePct:50,rr:m(p)}),D.push({label:"TP2",price:B.toFixed(),sizePct:50,rr:m(B)})):D.push({label:"TP2",price:B.toFixed(),sizePct:100,rr:m(B)})}
return{entry:a.toFixed(),sl:h.toFixed(),risk:g.toFixed(),targets:D}}function Rt(e){var t;return e.kind?e.kind:(t=e.type)!=null&&t.startsWith("BREAKOUT")?"breako\
ut":"range"}function Lt(e,t,n,s={}){var F;const o=s.k??2,r=s.lookback??20,i=s.nearTargetPct??.2,a={alert:!1,nearTarget:!1,target:null,progress:0,oppositeVolume:0,
averageOpposite:0,multiple:0,reason:"insufficient data"},l=t.length;if(l<2||e.targets.length===0)return a;if((s.requireTape??!0)&&(((F=n[l-1])==null?void 0:F.source)??
"ohlcv")!=="trades")return{...a,reason:"tape required"};const f=e.side==="long",C=Q(e.entry),c=Z(t[l-1]),h=P=>n[P]??_e(t[P]),g=P=>f?P.sell:P.buy,m=e.targets.map(
P=>Q(P.price)).sort((P,I)=>f?P-I:I-P),D=c.close,p=m.find(P=>f?P>D:P<D)??m[m.length-1],B=f?c.high:c.low,k=p-C,S=k===0?1:(B-C)/k,x=S>=1-i,v=Math.max(0,l-1-r),T=[];
for(let P=v;P<l-1;P++)T.push(g(h(P)));const A=T.length?T.reduce((P,I)=>P+I,0)/T.length:0,$=g(h(l-1)),L=A>0?$/A:$>0?1/0:0,q=L>=o,E=x&&q;return{alert:E,nearTarget:x,
target:String(p),progress:S,oppositeVolume:$,averageOpposite:A,multiple:L,reason:E?`${f?"sell":"buy"} pressure ${L.toFixed(2)}x average near target ${p} \u2014 absor\
ption, consider closing`:x?`opposite pressure only ${L.toFixed(2)}x average (< ${o}x)`:`not near target (${(S*100).toFixed(0)}% of the way)`}}function Ut(e,t,n,s,o={}){
const r=o.maxAdds??2,i=e.adds??0;if(Rt(e)!=="breakout")return{add:!1,reason:"pyramiding only applies to breakout positions"};if(i>=r)return{add:!1,reason:`max a\
dds reached (${i}/${r})`};if(t.length<2)return{add:!1,reason:"insufficient data"};const a=e.side==="long",l=e.brokenLevel??(s?a?s.top:s.bottom:void 0);if(l===void 0)
return{add:!1,reason:"no broken level"};const f=Q(l),C=o.retestTolPct??(s==null?void 0:s.tolerancePct)??.25,c=f*C/100,h=o.strongDominance??.6,g=t.length,m=Z(t[g-
1]),D=n[g-1]??_e(t[g-1]),p=t[g-1].ts,B=Math.max(e.openedTs??-1/0,e.lastAddTs??-1/0);if(p<=B)return{add:!1,reason:"retest must be a later candle than entry/last \
add",level:String(l)};const k=e.risk!==void 0?Q(e.risk):Math.abs(Q(e.entry)-Q(e.sl??e.entry));if(!t.filter(F=>F.ts>B&&F.ts<p).map(Z).some(F=>a?F.high>=f+.5*k:F.
low<=f-.5*k))return{add:!1,reason:"no move away from level yet",level:String(l)};if(!(a?m.low<=f+c&&m.close>f:m.high>=f-c&&m.close<f))return{add:!1,reason:`no r\
etest of broken level ${l}`,level:String(l)};const T=a?ht(t[g-2],t[g-1]):pt(t[g-2],t[g-1]),A=a?D.ratio:1-D.ratio;if(!T&&A<h)return{add:!1,reason:`retest without\
 confirmation (ratio ${A.toFixed(2)})`,level:String(l)};const $=o.slBufferPct??.05,L=O(a?m.low:m.high),q=L.times($).div(100),E=ke(a?L.minus(q):L.plus(q),o.tickSize,
a?"down":"up");return{add:!0,addNumber:i+1,entry:ke(O(t[g-1].close),o.tickSize,"nearest").toFixed(),sl:E.toFixed(),sizePct:o.addSizePct??50,level:String(l),reason:`\
retest of ${l} confirmed by ${T?"engulfing":`pressure ${A.toFixed(2)}`}`}}function Ot(e){const t=O(e.equity),n=e.riskPct??1,s=O(e.entry),o=O(e.sl),r=O(e.leverage??
1),i=O(e.feeRate??"0.0006");if(s.lte(0)||o.lte(0))throw new Error("entry and sl must be > 0");if(s.eq(o))throw new Error("entry and sl must differ");if(r.lte(0))
throw new Error("leverage must be > 0");const a=o.lt(s)?"long":"short",l=t.times(n).div(100),f=s.minus(o).abs(),C=O(e.slippageBps??0).div(1e4),c=e.includeFeesInRisk??
!0?f.plus(i.plus(C).times(s.plus(o))):f;let h=l.div(c),g=!1;const m=e.available!==void 0?O(e.available):t,D=qe.max(0,m).times(r).div(s.times(O(1).plus(r.times(i))));
if(h.gt(D)&&(h=D,g=!0),e.qtyStep!==void 0&&O(e.qtyStep).gt(0)){const T=O(e.qtyStep);h=h.div(T).floor().times(T)}let p;e.minQty!==void 0&&h.lt(O(e.minQty))?p="mi\
n_qty":e.minNotional!==void 0&&h.times(s).lt(O(e.minNotional))&&(p="min_notional"),p&&(h=O(0));const B=h.times(s),k=B.times(i),S=h.times(o).times(i),x=k.plus(S),
v=h.times(s.plus(o)).times(C);return{side:a,qty:h.toFixed(),notional:B.toFixed(),margin:B.div(r).toFixed(),riskAmount:l.toFixed(),riskPerUnit:f.toFixed(),entryFee:k.
toFixed(),exitFeeAtSl:S.toFixed(),estFees:x.toFixed(),lossAtSl:h.times(f).plus(x).plus(v).toFixed(),capped:g,...p?{belowMin:p}:{}}}const Le=e=>String(e).padStart(
2,"0"),It={RANGE:"\uBC18\uC804",FAKE:"\uAC00\uC9DC",BREAKOUT:"\uB3CC\uD30C"};function _t(e){const t=G(null),n=G(null),s=G(null),o=G(null),r=G(null),i=G([]),a=G(
!1),l=G(void 0),f=G(e);f.current=e;const C=G(null),c=G(""),h=(p=!0)=>{var u,y;const B=o.current,k=r.current,S=s.current,x=t.current;if(!B||!k||!S||!x)return;const{
box:v,candles:T}=f.current,A=B.timeScale().getVisibleLogicalRange(),$=v&&T.length?`${x.clientWidth}x${x.clientHeight}|${A==null?void 0:A.from.toFixed(3)}:${A==null?
void 0:A.to.toFixed(3)}|${(u=k.priceToCoordinate(Number(v.top)))==null?void 0:u.toFixed(2)}|${(y=k.priceToCoordinate(Number(v.bottom)))==null?void 0:y.toFixed(2)}`:
"none";if(!p&&$===c.current)return;c.current=$;const L=window.devicePixelRatio||1,q=x.clientWidth,E=x.clientHeight;(S.width!==q*L||S.height!==E*L)&&(S.width=q*L,
S.height=E*L,S.style.width=`${q}px`,S.style.height=`${E}px`);const F=S.getContext("2d");F.setTransform(L,0,0,L,0,0),F.clearRect(0,0,q,E);const{box:P,candles:I,pressures:Ce,
showHist:me}=f.current;if(!P||!I.length)return;const z=B.timeScale(),re=k.priceScale().width(),Be=q-re,He=E-z.height(),ye=Number(P.top),Re=Number(P.bottom),Se=Number(
P.mid),ae=k.priceToCoordinate(ye),fe=k.priceToCoordinate(Re),ge=k.priceToCoordinate(Se);if(ae===null||fe===null||ge===null)return;const De=Math.max(0,Math.min(P.
startIndex,I.length-1));let Ee=z.timeToCoordinate(I[De].ts/1e3);Ee===null&&(Ee=z.logicalToCoordinate(0)??0);const Ae=z.timeToCoordinate(I[I.length-1].ts/1e3)??Be,
Te=I.length>1?z.timeToCoordinate(I[I.length-2].ts/1e3):null,ve=Te!==null&&Ae!==null?Math.max(.5,Ae-Te):z.options().barSpacing,he=Math.min(Be,Ae+ve*3),ue=Math.max(
0,Ee-ve/2);if(!(he<=ue)){if(F.save(),F.beginPath(),F.rect(0,0,Be,He),F.clip(),F.fillStyle="rgba(0,194,203,0.06)",F.fillRect(ue,ae,he-ue,fe-ae),F.strokeStyle="rg\
ba(0,194,203,0.75)",F.lineWidth=1.2,F.strokeRect(ue,ae,he-ue,fe-ae),me){const w=Math.abs(fe-ae)/2,N=[];for(let U=De;U<I.length;U++){const H=Ce[U];H&&N.push(H.buy,
H.sell)}N.sort((U,H)=>U-H);const R=N.length?N[Math.min(N.length-1,Math.floor(N.length*.9))]:0,_=Math.max(1,ve*.55);if(R>0)for(let U=De;U<I.length;U++){const H=Ce[U],
te=z.timeToCoordinate(I[U].ts/1e3);if(!H||te===null)continue;const j=Math.min(1,H.buy/R)*w*.92,ce=Math.min(1,H.sell/R)*w*.92;F.fillStyle=H.source==="trades"?"rg\
ba(46,189,133,0.75)":"rgba(46,189,133,0.4)",F.fillRect(te-_/2,ge-j,_,j),F.fillStyle=H.source==="trades"?"rgba(246,70,93,0.75)":"rgba(246,70,93,0.38)",F.fillRect(
te-_/2,ge,_,ce)}}if(F.setLineDash([6,4]),F.strokeStyle="#f6465d",F.lineWidth=1.4,F.beginPath(),F.moveTo(ue,ge),F.lineTo(he,ge),F.stroke(),F.setLineDash([]),f.current.
editBox)for(const w of[ae,fe])F.fillStyle="#f0b90b",F.beginPath(),F.arc(ue+(he-ue)/2,w,9,0,Math.PI*2),F.fill();F.restore()}};Y(()=>{if(!n.current)return;const p=St(
n.current,{autoSize:!0,layout:{background:{color:"#0b0e11"},textColor:"#8a94a3",fontSize:11},grid:{vertLines:{color:"#141920"},horzLines:{color:"#141920"}},rightPriceScale:{
borderColor:"#262e38",scaleMargins:{top:.08,bottom:.08}},timeScale:{borderColor:"#262e38",timeVisible:!0,secondsVisible:!1,rightOffset:5,tickMarkFormatter:(S,x)=>{
const v=new Date(S*1e3);return x<=2?`${v.getMonth()+1}/${v.getDate()}`:`${Le(v.getHours())}:${Le(v.getMinutes())}`}},crosshair:{mode:0},handleScale:{pinch:!0,mouseWheel:!0,
axisPressedMouseMove:!0},handleScroll:{horzTouchDrag:!0,vertTouchDrag:!1,mouseWheel:!0,pressedMouseMove:!0},localization:{timeFormatter:S=>{const x=new Date(S*1e3);
return`${x.getMonth()+1}/${x.getDate()} ${Le(x.getHours())}:${Le(x.getMinutes())}`}}});r.current=p.addCandlestickSeries({upColor:"#2ebd85",downColor:"#f6465d",borderVisible:!1,
wickUpColor:"#2ebd85",wickDownColor:"#f6465d"}),o.current=p;let B=0;const k=()=>{h(!1),B=requestAnimationFrame(k)};return B=requestAnimationFrame(k),()=>{cancelAnimationFrame(
B),p.remove(),o.current=null,r.current=null,a.current=!1,i.current=[]}},[]),Y(()=>{var B;const p=r.current;if(p){if(!e.candles.length){p.setData([]),a.current=!1;
return}p.applyOptions({priceFormat:{type:"price",precision:e.dp,minMove:1/10**e.dp}}),p.setData(e.candles.map(k=>({time:k.ts/1e3,open:k.open,high:k.high,low:k.low,
close:k.close}))),l.current!==e.viewKey&&(a.current=!1),a.current||(l.current=e.viewKey,(B=o.current)==null||B.timeScale().setVisibleLogicalRange({from:e.candles.
length-80,to:e.candles.length+4}),a.current=!0),requestAnimationFrame(()=>h(!0))}},[e.candles,e.dp]),Y(()=>{const p=r.current;if(!p)return;for(const v of i.current)
p.removePriceLine(v);i.current=[];const B=(v,T,A,$=Pe.Solid,L=1)=>i.current.push(p.createPriceLine({price:v,color:T,title:A,lineStyle:$,lineWidth:L,axisLabelVisible:!0}));
e.box&&(B(Number(e.box.top),"#00c2cb","\uC800\uD56D"),B(Number(e.box.bottom),"#00c2cb","\uC9C0\uC9C0"),B(Number(e.box.mid),"#f6465d","50%",Pe.Dashed));for(const v of e.
positions){B(v.entry,"#eaecef",v.side==="long"?"\uB871 \uC9C4\uC785":"\uC20F \uC9C4\uC785",Pe.Dotted),B(v.sl,"#f0b90b",v.beMoved?"SL(\uBCF8\uC808)":"SL",Pe.Dashed);
for(const T of v.targets)T.done||B(T.price,"#2ebd85",T.label.split(" ")[0],Pe.Dashed)}const k=e.signals.map(v=>({time:v.ts/1e3,position:v.side==="long"?"belowBa\
r":"aboveBar",color:v.side==="long"?"#2ebd85":"#f6465d",shape:v.side==="long"?"arrowUp":"arrowDown",text:It[v.type.split("_")[0]]??""})).sort((v,T)=>v.time-T.time),
S=e.candles.length>1?(e.candles[1].ts-e.candles[0].ts)/1e3:900,x={};for(const v of k){const T=v.time;x[v.position]!==void 0&&T-x[v.position]<S*4?v.text="":x[v.position]=
T}p.setMarkers(k),requestAnimationFrame(()=>h(!0))},[e.box,e.positions,e.signals,e.candles.length>1?e.candles[1].ts-e.candles[0].ts:0]),Y(()=>{requestAnimationFrame(
()=>h(!0))},[e.pressures,e.showHist,e.editBox]),Y(()=>{const p=o.current;p&&p.applyOptions({handleScroll:!e.editBox,handleScale:!e.editBox})},[e.editBox]);const g=p=>{
const B=r.current,k=e.box;if(!e.editBox||!B||!k)return;const S=p.currentTarget.getBoundingClientRect(),x=p.clientY-S.top,v=B.priceToCoordinate(Number(k.top))??-999,
T=B.priceToCoordinate(Number(k.bottom))??-999;C.current=Math.abs(x-v)<Math.abs(x-T)?"top":"bottom",p.currentTarget.setPointerCapture(p.pointerId)},m=p=>{var A;const B=r.
current,k=e.box;if(!C.current||!B||!k)return;const S=p.currentTarget.getBoundingClientRect(),x=B.coordinateToPrice(p.clientY-S.top);if(x===null)return;const v=C.
current==="top"?Number(x):Number(k.top),T=C.current==="bottom"?Number(x):Number(k.bottom);(A=e.onBoxEdit)==null||A.call(e,v,T)},D=()=>{C.current=null};return b(
"div",{ref:t,className:"relative w-full h-full",children:[d("div",{ref:n,className:"absolute inset-0 z-0"}),d("canvas",{ref:s,className:"absolute inset-0 pointe\
r-events-none z-10"}),e.editBox&&d("div",{className:"absolute inset-0 touch-none z-20",onPointerDown:g,onPointerMove:m,onPointerUp:D,onPointerCancel:D})]})}const M=(e,t=2)=>{
const n=typeof e=="string"?Number(e):e;return n==null||!Number.isFinite(n)?"\u2014":n.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t})},
Ht=(e,t=2)=>Number.isFinite(e)?`${e>=0?"+":""}${(e*100).toFixed(t)}%`:"\u2014",ee=(e,t=2)=>{if(!Number.isFinite(e))return"\u2014";const n=Number(e.toFixed(t));return n===
0?0 .toFixed(t):`${n>0?"+":""}${n.toFixed(t)}`},zt=e=>new Date(e).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:!1}),Je=e=>{const t=new Date(
e);return`${t.getMonth()+1}/${t.getDate()} ${zt(e)}`},Kt=(e,t)=>M(e,e>=1e3?0:e>=100?Math.min(t,1):e>=10?Math.min(t,2):Math.min(t,4));function Wt({book:e,dp:t,qdp:n=3,
rows:s=6}){if(!e)return d("div",{className:"text-muted text-xs p-3",children:"\uD638\uAC00 \uC5F0\uACB0 \uC911\u2026"});const o=e.asks.slice(0,s).reverse(),r=e.
bids.slice(0,s),i=e.bids.reduce((c,h)=>c+h[1],0),a=e.asks.reduce((c,h)=>c+h[1],0),l=a+i>0?(i-a)/(a+i):0,f=Math.max(...o.map(c=>c[1]),...r.map(c=>c[1]),1e-9),C=(c,h)=>b(
"div",{className:"relative flex justify-between text-[12px] num h-5 items-center px-2",children:[d("div",{className:`absolute inset-y-0 right-0 ${h==="a"?"bg-do\
wn/15":"bg-up/15"}`,style:{width:`${c[1]/f*100}%`}}),d("span",{className:`relative ${h==="a"?"text-down":"text-up"}`,children:M(c[0],t)}),d("span",{className:"r\
elative text-muted",children:Kt(c[1],n)})]},`${h}${c[0]}`);return b("div",{children:[b("div",{className:"px-2 pb-1 text-[11px] text-muted flex justify-between",
children:[d("span",{children:"\uAC00\uACA9"}),d("span",{children:"\uC218\uB7C9"})]}),o.map(c=>C(c,"a")),d("div",{className:"h-px bg-line my-1"}),r.map(c=>C(c,"b")),
b("div",{className:"px-2 pt-2",children:[b("div",{className:"flex justify-between text-[11px] num",children:[b("span",{className:"text-up",children:["\uB9E4\uC218 ",
Math.round((l+1)/2*100),"%"]}),d("span",{className:"text-muted",children:"\uD638\uAC00 \uBD88\uADE0\uD615 (15)"}),b("span",{className:"text-down",children:["\uB9E4\uB3C4 ",
Math.round((1-l)/2*100),"%"]})]}),d("div",{className:"h-2 rounded-full bg-down/70 overflow-hidden mt-1",children:d("div",{className:"h-full bg-up",style:{width:`${(l+
1)/2*100}%`}})})]})]})}function oe({children:e,className:t=""}){return d("div",{className:`bg-panel rounded-xl border border-line ${t}`,children:e})}function X({
k:e,v:t,className:n=""}){return b("div",{className:`flex justify-between items-center text-[13px] py-1 ${n}`,children:[d("span",{className:"text-muted",children:e}),
d("span",{className:"num",children:t})]})}function le({children:e,onClick:t,tone:n="neutral",className:s="",disabled:o}){const r={up:"bg-up text-white",down:"bg\
-down text-white",accent:"bg-accent text-bg",neutral:"bg-panel2 text-txt",warn:"bg-warn text-bg"}[n];return d("button",{disabled:o,onClick:t,className:`h-11 px-\
4 rounded-lg font-semibold active:opacity-80 disabled:bg-panel2 disabled:text-muted disabled:opacity-60 ${r} ${s}`,children:e})}function V({label:e,value:t,onChange:n,
step:s="any",suffix:o}){return b("label",{className:"block",children:[d("span",{className:"text-[11px] text-muted",children:e}),b("div",{className:"flex items-c\
enter bg-panel2 rounded-lg border border-line h-11 px-3",children:[d("input",{inputMode:"decimal",type:"number",step:s,value:t,onChange:r=>n(r.target.value),className:"\
bg-transparent flex-1 min-w-0 outline-none num text-[15px]"}),o&&d("span",{className:"text-muted text-xs ml-1",children:o})]})]})}function $e({on:e,onChange:t,label:n,
hint:s}){return b("button",{onClick:()=>t(!e),className:"w-full flex items-center justify-between py-3 text-left",children:[b("span",{children:[d("span",{className:"\
block text-[14px]",children:n}),s&&d("span",{className:"block text-[11px] text-muted",children:s})]}),d("span",{className:`w-12 h-7 rounded-full relative transi\
tion ${e?"bg-accent":"bg-panel2 border border-line"}`,children:d("span",{className:`absolute top-1 w-5 h-5 rounded-full bg-white transition ${e?"left-6":"left-1"}`})})]})}
function Ve({items:e,value:t,onChange:n,fmt:s}){return d("div",{className:"flex gap-2 flex-wrap",children:e.map(o=>d("button",{onClick:()=>n(o),className:`px-3 \
h-8 rounded-full text-sm ${t===o?"bg-accent text-bg font-semibold":"bg-panel2 text-muted"}`,children:s?s(o):String(o)},String(o)))})}const ut="https://api.bitge\
t.com",ze="/dupont-mobile/bgapi";let it=!1;async function gt(e){const t=it?[ze,ut]:[ut,ze];let n;for(const s of t)try{const o=await fetch(s+e,{cache:"no-store"});
if(!o.ok)throw new Error(`HTTP ${o.status}`);const r=await o.json();if(r.code!=="00000")throw new Error(r.msg||"bitget error");return it=s===ze,r.data}catch(o){
n=o}throw n}const ot={"1m":{api:"1m",sec:60},"5m":{api:"5m",sec:300},"15m":{api:"15m",sec:900},"1h":{api:"1H",sec:3600}};async function jt(e,t,n=300){const s=ot[t]??
ot["15m"],o=await gt(`/api/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${e}&granularity=${s.api}&limit=${n}`),r=new Map;for(const i of o){const a={ts:Number(
i[0]),open:+i[1],high:+i[2],low:+i[3],close:+i[4],volume:+i[5]};Number.isFinite(a.ts)&&r.set(a.ts,a)}return[...r.values()].sort((i,a)=>i.ts-a.ts)}async function bt(e){
const t=await gt(`/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${e}`),n=Array.isArray(t)?t[0]:t;return n?{last:+n.lastPr,mark:+(n.markPrice??n.lastPr),
change24h:+(n.change24h??0),funding:+(n.fundingRate??0),bid:+n.bidPr,ask:+n.askPr}:null}const Vt="wss://ws.bitget.com/v2/ws/public";function Gt(e){const n=(Array.
isArray(e==null?void 0:e.data)?e.data:[]).map(s=>({ts:+s.ts,price:+s.price,qty:+s.size,side:s.side==="sell"?"sell":"buy"}));return n.reverse(),{trades:n,snapshot:(e==
null?void 0:e.action)==="snapshot"}}class Qt{constructor(t,n){J(this,"ws",null);J(this,"closed",!1);J(this,"attempt",0);J(this,"ping",null);J(this,"lastPong",0);
J(this,"connectedAt",0);this.symbol=t,this.h=n}start(){this.closed=!1,this.open()}stop(){var t,n,s;this.closed=!0,this.ping&&clearInterval(this.ping),(t=this.ws)==
null||t.close(),this.ws=null,(s=(n=this.h).status)==null||s.call(n,"closed")}open(){var n,s;if(this.closed)return;(s=(n=this.h).status)==null||s.call(n,this.attempt?
"reconnecting":"connecting");let t;try{t=new WebSocket(Vt)}catch{return this.retry()}this.ws=t,t.onopen=()=>{var r,i;this.attempt=0,this.connectedAt=Date.now();
const o=["ticker","books15","trade"].map(a=>({instType:"USDT-FUTURES",channel:a,instId:this.symbol}));t.send(JSON.stringify({op:"subscribe",args:o})),this.lastPong=
Date.now(),this.ping=setInterval(()=>{if(t.readyState===1){if(Date.now()-this.lastPong>2*25e3+5e3){t.close();return}t.send("ping")}},25e3),(i=(r=this.h).status)==
null||i.call(r,"live")},t.onmessage=o=>{var f,C,c,h,g,m,D;const r=typeof o.data=="string"?o.data:"";if(r==="pong"){this.lastPong=Date.now();return}if(!r)return;
let i;try{i=JSON.parse(r)}catch{return}const a=(f=i==null?void 0:i.arg)==null?void 0:f.channel,l=i==null?void 0:i.data;if(!(!a||!Array.isArray(l)||!l.length)){if(a===
"ticker"){const p=l[0];(c=(C=this.h).ticker)==null||c.call(C,{last:+p.lastPr,mark:+(p.markPrice??p.lastPr),funding:+(p.fundingRate??0),change24h:+(p.change24h??
0),bid:+p.bidPr,ask:+p.askPr})}else if(a==="books15"){const p=l[0];(g=(h=this.h).book)==null||g.call(h,{bids:(p.bids??[]).map(B=>[+B[0],+B[1]]),asks:(p.asks??[]).
map(B=>[+B[0],+B[1]]),ts:+p.ts})}else if(a==="trade"){const p=Gt(i);(D=(m=this.h).trades)==null||D.call(m,p.trades,p.snapshot)}}},t.onclose=()=>{this.ping&&clearInterval(
this.ping),this.closed||this.retry()},t.onerror=()=>t.close()}retry(){var n,s;(s=(n=this.h).status)==null||s.call(n,"reconnecting");const t=Math.min(3e4,1e3*2**
this.attempt++);setTimeout(()=>this.open(),t)}}const xt=[{symbol:"BTCUSDT",qtyStep:1e-4,dp:1},{symbol:"ETHUSDT",qtyStep:.01,dp:2},{symbol:"SOLUSDT",qtyStep:.1,dp:3},
{symbol:"XRPUSDT",qtyStep:1,dp:4},{symbol:"DOGEUSDT",qtyStep:1,dp:5},{symbol:"BNBUSDT",qtyStep:.01,dp:2},{symbol:"ADAUSDT",qtyStep:1,dp:4},{symbol:"LINKUSDT",qtyStep:1,
dp:3},{symbol:"AVAXUSDT",qtyStep:.1,dp:3},{symbol:"SUIUSDT",qtyStep:.1,dp:4}],xe=5,Bt=e=>Math.max(0,Math.round(-Math.log10(e))),se=e=>{const t=xt.find(n=>n.symbol===
e)??{symbol:e,qtyStep:.001,dp:2};return{...t,qdp:Bt(t.qtyStep)}},Jt=(e,t)=>{const n=Bt(t);return Number((Math.floor(e/t+1e-9)*t).toFixed(n))},Xt=["1m","5m","15m",
"1h"],rt={"1m":6e4,"5m":3e5,"15m":9e5,"1h":36e5},ie=6e4;class lt{constructor(t=1500){J(this,"b",new Map);J(this,"coverFrom",1/0);J(this,"gaps",[]);J(this,"downS\
ince",null);this.maxBuckets=t}reset(){this.b.clear(),this.coverFrom=1/0,this.gaps=[],this.downSince=null}connected(t){const n=Math.ceil(t/ie)*ie;Number.isFinite(
this.coverFrom)?this.downSince!==null&&this.gaps.push([Math.floor(this.downSince/ie)*ie,n]):this.coverFrom=n,this.downSince=null}disconnected(t){this.downSince===
null&&Number.isFinite(this.coverFrom)&&(this.downSince=t)}add(t){for(const n of t){const s=Math.floor(n.ts/ie)*ie,o=this.b.get(s)??{buy:0,sell:0,n:0};n.side==="\
buy"?o.buy+=n.qty:o.sell+=n.qty,o.n++,this.b.set(s,o)}if(this.b.size>this.maxBuckets){const n=[...this.b.keys()].sort((o,r)=>o-r);for(const o of n.slice(0,this.
b.size-this.maxBuckets))this.b.delete(o);const s=n[n.length-this.b.size];this.gaps=this.gaps.filter(([,o])=>o>s)}}covers(t,n){if(t<this.coverFrom)return!1;const s=t+
n;return this.downSince!==null&&s>Math.floor(this.downSince/ie)*ie?!1:!this.gaps.some(([o,r])=>t<r&&s>o)}pressure(t,n,s=1){if(!this.covers(t,n))return null;let o=0,
r=0,i=0;for(let l=Math.floor(t/ie)*ie;l<t+n;l+=ie){const f=this.b.get(l);f&&(o+=f.buy,r+=f.sell,i+=f.n)}if(i<s)return null;const a=o+r;return{buy:o,sell:r,net:o-
r,ratio:a>0?o/a:.5,source:"trades"}}}function Yt(e,t){const[n,s]=K([]),[o,r]=K(null),[i,a]=K(null),[l,f]=K("connecting"),[C,c]=K(""),[h,g]=K(0),m=G(new lt),D=G(
0),p=G(t);p.current=t,Y(()=>{m.current=new lt,a(null);let x=!1;const v=new Qt(e,{status:A=>{f(A),A==="live"&&m.current.connected(Date.now()+D.current),(A==="rec\
onnecting"||A==="closed")&&m.current.disconnected(Date.now()+D.current)},ticker:A=>r($=>({...$??A,...A})),book:A=>a(A),trades:(A,$)=>{if($||!A.length)return;const L=A[A.
length-1];D.current=L.ts-Date.now(),m.current.add(A),x=!0,B(L.price,A.reduce((q,E)=>q+E.qty,0),L.ts)}});v.start();const T=setInterval(()=>{x&&(x=!1,g(A=>A+1))},
1e3);return()=>{v.stop(),clearInterval(T)}},[e]);function B(x,v,T){s(A=>{if(!A.length)return A;const $=rt[p.current]??9e5,L=Math.floor(T/$)*$,q=A[A.length-1];if(L>
q.ts)return[...A.slice(-499),{ts:L,open:q.close,high:Math.max(q.close,x),low:Math.min(q.close,x),close:x,volume:v}];if(L<q.ts)return A;const E={...q,close:x,high:Math.
max(q.high,x),low:Math.min(q.low,x),volume:q.volume+v};return[...A.slice(0,-1),E]})}Y(()=>{let x=!0;s([]);const v=A=>jt(e,t).then($=>{!x||!$.length||(c(""),s(L=>{
if(A||!L.length)return $;const q=$[$.length-1],E=L[L.length-1];if(E.ts>q.ts)return[...$,E];if(E.ts===q.ts){const F={...q,high:Math.max(q.high,E.high),low:Math.min(
q.low,E.low),close:E.close,volume:Math.max(q.volume,E.volume)};return[...$.slice(0,-1),F]}return $}))}).catch($=>x&&c(String(($==null?void 0:$.message)??$)));v(
!0);const T=setInterval(()=>v(!1),2e4);return()=>{x=!1,clearInterval(T)}},[e,t]),Y(()=>{let x=!0;const v=()=>bt(e).then(A=>{!x||!A||(r(A),l!=="live"&&B(A.last,0,
Date.now()+D.current))}).catch(()=>{});v();const T=setInterval(v,l==="live"?1e4:2500);return()=>{x=!1,clearInterval(T)}},[e,l]);const k=rt[t]??9e5;return{candles:n,
ticker:o,book:i,status:l,err:C,tape:m,tapeVer:h,intervalMs:k,serverNow:()=>Date.now()+D.current}}const at={bitget_default:{spot:{maker:"0.001",taker:"0.001"},swap:{
maker:"0.0002",taker:"0.0006"},stock:{maker:"0.00015",taker:"0.00015",taxReserved:"0"}}};function yt(e,t,n){const o=(at[e]??at.bitget_default)[t];return n==="ma\
ker"?o.maker:o.taker}function Zt(e,t,n){return e*t/(n>0?n:1)}const Xe=200,W=Number(yt("bitget_default","swap","taker")),Dt=Number(yt("bitget_default","swap","ma\
ker")),be=2,Ne=be/1e4,en=5,Ue=8*36e5;function ct(e=Xe){return{wallet:e,bankroll:e,positions:[],fills:[],pending:[],equityCurve:[{t:Date.now(),equity:e}],seq:0}}
const de=e=>e==="long"?1:-1;function Ge(e,t){return de(e.side)*(t-e.entry)*e.qty}function dt(e,t,n,s){const o=1/(n||1);return e==="long"?t*(1-o+s):t*(1+o-s)}function Ke(e,t,n,s,o){
return Math.max(0,de(e)*(t-n))*s+o+s*n*(W+Ne)}function tn(e,t,n=W+Ne){const s=e.qty,o=e.side==="long"?(e.entry*s+e.entryFeeLeft)/(s*(1-n)):(e.entry*s-e.entryFeeLeft)/
(s*(1+n)),r=10**t;return e.side==="long"?Math.ceil(o*r-1e-9)/r:Math.floor(o*r+1e-9)/r}class nn{constructor(t){J(this,"state");J(this,"moveSlToBe",!0);J(this,"pr\
ecision",()=>({dp:2,qdp:4}));J(this,"slip",Ne);J(this,"minOrderUsdt",en);this.state=t?un(t):ct();for(const n of this.state.positions)n.initialEntry??(n.initialEntry=
n.entry),n.fundingAcc??(n.fundingAcc=0),n.riskUsd??(n.riskUsd=Ke(n.side,n.entry,n.initialSl,n.origQty,n.origQty*n.entry*W))}px(t,n){return n.toLocaleString("en-\
US",{minimumFractionDigits:this.precision(t).dp,maximumFractionDigits:this.precision(t).dp})}qx(t,n){return n.toFixed(this.precision(t).qdp)}step(t){return 10**
-this.precision(t).qdp}floorStep(t,n){const s=this.precision(t).qdp,o=this.step(t);return Number((Math.floor(n/o+1e-9)*o).toFixed(s))}nextId(t){return this.state.
seq+=1,`${t}${Date.now().toString(36)}${this.state.seq}`}reset(t=Xe){this.state=ct(t)}usedMargin(){return this.state.positions.reduce((t,n)=>t+n.margin,0)+this.
state.pending.reduce((t,n)=>t+n.qty*n.price/n.leverage,0)}available(){return this.state.wallet-this.usedMargin()}equity(t){return this.state.wallet+this.state.positions.
reduce((n,s)=>n+Ge(s,t[s.symbol]??s.entry),0)}open(t,n=Date.now()){const s=[];if(!(t.qty>0)||!(t.price>0))return{ok:!1,error:"\uC218\uB7C9/\uAC00\uACA9 \uC624\uB958",
events:s};const o=t.liquidity==="maker",r=o?Dt:W,i=o?t.price:(t.refPx&&t.refPx>0?t.refPx:t.price)*(1+de(t.side)*this.slip),l=t.qty*i*r,f=Zt(t.qty,i,t.leverage);
if(f+l>this.available()+1e-9)return{ok:!1,error:`\uC99D\uAC70\uAE08 \uBD80\uC871 (\uD544\uC694 ${(f+l).toFixed(2)} USDT)`,events:s};const C=t.mmr??.005,c=this.state.
positions.find(D=>D.symbol===t.symbol&&D.side===t.side);if(c&&!t.isAdd)return{ok:!1,error:"\uAC19\uC740 \uBC29\uD5A5 \uD3EC\uC9C0\uC158 \uBCF4\uC720 \uC911 (\uBD88\uD0C0\uAE30\uB294 \uBD88\uD0C0\uAE30 \uBC84\uD2BC \uC0AC\uC6A9)",
events:s};if(!c&&t.isAdd)return{ok:!1,error:"\uCD94\uAC00\uD560 \uD3EC\uC9C0\uC158 \uC5C6\uC74C",events:s};const h=t.side==="long";if(c){const D=c.qty+t.qty,p=(c.
entry*c.qty+i*t.qty)/D,B=h?Math.max(c.sl,t.sl):Math.min(c.sl,t.sl),k=dt(c.side,p,c.leverage,c.mmr);return(h?B<=k:B>=k)?{ok:!1,error:"SL\uC774 \uCCAD\uC0B0\uAC00 \uBC16 (\uCD94\uAC00 \uD6C4 \uCCAD\uC0B0\uAC00 \uAE30\uC900)",
events:s}:(this.state.wallet-=l,c.entry=p,c.qty=D,c.origQty+=t.qty,c.margin+=f,c.entryFeeLeft+=l,c.adds+=1,c.sl=B,c.liqPrice=k,c.riskUsd=(c.riskUsd??0)+Ke(t.side,
i,B,t.qty,l),t.candleTs!==void 0&&(c.lastAddTs=t.candleTs),s.push({kind:"add",positionId:c.id,message:`\uBD88\uD0C0\uAE30 \uCD94\uAC00 ${this.qx(t.symbol,t.qty)}\
 @ ${this.px(t.symbol,i)}`}),this.snapEquity({[t.symbol]:i},n),{ok:!0,position:c,fillPx:i,events:s})}const g=dt(t.side,i,t.leverage,C);if(h?t.sl<=g:t.sl>=g)return{
ok:!1,error:`SL\uC774 \uCCAD\uC0B0\uAC00(${this.px(t.symbol,g)}) \uBC16 \u2013 \uB808\uBC84\uB9AC\uC9C0\uB97C \uB0AE\uCD94\uC138\uC694`,events:s};this.state.wallet-=
l;const m={id:this.nextId("p"),symbol:t.symbol,side:t.side,qty:t.qty,origQty:t.qty,entry:i,leverage:t.leverage,margin:f,sl:t.sl,initialSl:t.sl,targets:t.targets.
map(D=>({...D,done:!1})),setup:t.setup,signalId:t.signalId,breakoutLevel:t.breakoutLevel,adds:0,entryFeeLeft:l,realizedNet:0,beMoved:!1,liqPrice:g,mmr:C,openedAt:n,
initialEntry:i,riskUsd:Ke(t.side,i,t.sl,t.qty,l),fundingAcc:0};return this.state.positions.push(m),s.push({kind:"open",positionId:m.id,message:`${t.side==="long"?
"\uB871":"\uC20F"} \uC9C4\uC785 ${this.qx(t.symbol,t.qty)} ${t.symbol} @ ${this.px(t.symbol,i)}`}),this.snapEquity({[t.symbol]:i},n),{ok:!0,position:m,fillPx:i,
events:s}}placeLimit(t,n=Date.now()){return t.qty*t.price/t.leverage>this.available()?{ok:!1,error:"\uC99D\uAC70\uAE08 \uBD80\uC871"}:(this.state.pending.push({
...t,id:this.nextId("o"),createdAt:n}),{ok:!0})}cancelLimit(t){this.state.pending=this.state.pending.filter(n=>n.id!==t)}close(t,n,s,o,r=Date.now()){const i=this.
state.positions.find(B=>B.id===t);if(!i)return null;const a=Math.min(n,i.qty);if(!(a>0))return null;const l=a/i.qty,f=de(i.side)*(s-i.entry)*a,C=a*s*W,c=i.entryFeeLeft*
l,h=i.margin*l,g=(i.fundingAcc??0)*l;i.entryFeeLeft-=c,i.margin-=h,i.fundingAcc=(i.fundingAcc??0)-g,i.qty=a>=i.qty-1e-12?0:i.qty-a,this.state.wallet+=f-C;const m=f-
C-c-g;i.realizedNet+=m+g;const D=i.qty<=1e-12,p={id:this.nextId("f"),positionId:i.id,symbol:i.symbol,side:i.side,setup:i.setup,qty:a,entry:i.entry,exit:s,grossPnl:f,
fees:C+c,netPnl:m,reason:o,openedAt:i.openedAt,closedAt:r,final:D,funding:g,r:i.riskUsd&&i.riskUsd>0?m/i.riskUsd:void 0};return this.state.fills.push(p),D&&(this.
state.positions=this.state.positions.filter(B=>B.id!==i.id)),this.snapEquity({[i.symbol]:s},r),p}partialQty(t,n,s){if(n>=t.qty-1e-12)return t.qty;const o=this.floorStep(
t.symbol,n);return!(o>0)||(t.qty-o)*s<this.minOrderUsdt?t.qty:o}closeFraction(t,n,s,o,r=Date.now()){const i=this.state.positions.find(l=>l.id===t);if(!i)return null;
const a=s*(1-de(i.side)*this.slip);return this.close(t,this.partialQty(i,i.qty*Math.min(1,n),a),a,o,r)}accrueFunding(t,n,s,o=Date.now()){const r=[];if(!Number.isFinite(
n)||!(s>0))return r;for(const i of this.state.positions){if(i.symbol!==t)continue;const a=i.lastFundingTs??i.openedAt;let l=Math.floor(a/Ue)*Ue+Ue,f=0;for(;l<=o;){
const C=de(i.side)*i.qty*s*n;this.state.wallet-=C,i.realizedNet-=C,i.fundingAcc=(i.fundingAcc??0)+C,i.lastFundingTs=l,f+=C,l+=Ue}f!==0&&r.push({kind:"funding",positionId:i.
id,message:`\uD380\uB529\uBE44 ${f>0?"\uC9C0\uBD88":"\uC218\uB839"} ${Math.abs(f).toFixed(4)} USDT (${(n*100).toFixed(4)}%)`})}return r.length&&this.snapEquity(
{[t]:s},o),r}onPrice(t,n,s=Date.now(),o){var a;const r=o&&o>0?o:n,i=[];for(const l of[...this.state.pending]){if(l.symbol!==t||!(l.side==="long"?n<=l.price:n>=l.
price))continue;this.state.pending=this.state.pending.filter(c=>c.id!==l.id);const C=this.open({...l,liquidity:"maker"},s);C.ok?i.push({kind:"limit_fill",positionId:(a=
C.position)==null?void 0:a.id,message:`\uC9C0\uC815\uAC00 \uCCB4\uACB0 ${l.side==="long"?"\uB871":"\uC20F"} @ ${this.px(l.symbol,l.price)}`}):i.push({kind:"clos\
e",message:`\uC9C0\uC815\uAC00 \uCCB4\uACB0 \uC2E4\uD328: ${C.error}`})}for(const l of[...this.state.positions]){if(l.symbol!==t)continue;const f=l.side==="long";
if(l.liqPrice>0&&(f?r<=l.liqPrice:r>=l.liqPrice)){this.close(l.id,l.qty,l.liqPrice,"\uAC15\uC81C\uCCAD\uC0B0",s),i.push({kind:"liq",positionId:l.id,message:`\uAC15\uC81C\uCCAD\
\uC0B0 @ ${this.px(l.symbol,l.liqPrice)}`});continue}if(f?n<=l.sl:n>=l.sl){const C=l.beMoved?"\uBCF8\uC808 SL":"\uC190\uC808 SL",c=(f?Math.min(l.sl,n):Math.max(
l.sl,n))*(1-de(l.side)*this.slip),h=this.close(l.id,l.qty,c,C,s);i.push({kind:"sl",positionId:l.id,message:`${C} \uCCB4\uACB0 @ ${this.px(l.symbol,c)} (\uC21C\uC190\uC775 ${h?
(h.netPnl>=0?"+":"")+h.netPnl.toFixed(2):"-"} USDT)`});continue}for(let C=0;C<l.targets.length;C++){const c=l.targets[C];if(c.done)continue;if(!(f?n>=c.price:n<=
c.price))break;c.done=!0;const g=l.targets.slice(C+1).every(p=>p.done)?l.qty:this.partialQty(l,Math.min(l.qty,l.origQty*c.fraction),c.price),m=this.close(l.id,g,
c.price,c.label,s);i.push({kind:"tp",positionId:l.id,message:`${c.label} \uCCB4\uACB0 @ ${this.px(l.symbol,c.price)} (\uC21C\uC190\uC775 ${m?(m.netPnl>=0?"+":"")+
m.netPnl.toFixed(2):"-"} USDT)`});const D=this.state.positions.find(p=>p.id===l.id);if(!D)break;C===0&&this.moveSlToBe&&!D.beMoved&&(D.sl=tn(D,this.precision(D.
symbol).dp,W+this.slip),D.beMoved=!0,i.push({kind:"be",positionId:l.id,message:`TP1 \uD6C4 SL \u2192 \uBCF8\uC808 ${this.px(D.symbol,D.sl)} (\uC218\uC218\uB8CC \uD3EC\uD568)`}))}}
return i}snapEquity(t,n=Date.now()){const s=this.equity(t),o=this.state.equityCurve;o.push({t:n,equity:s}),o.length>2e3&&o.splice(0,o.length-2e3)}}function sn(e,t){
const n=e.side==="long",s=t.slip??Ne,o=t.suggestedSl!==void 0&&Number.isFinite(t.suggestedSl)?n?Math.max(e.sl,t.suggestedSl):Math.min(e.sl,t.suggestedSl):e.sl,r=t.
last*(1+de(e.side)*s),i=Math.max(0,Math.round(-Math.log10(t.step))),a=C=>Number((Math.floor(C/t.step+1e-9)*t.step).toFixed(i)),l=C=>{const c=e.qty+C,h=(e.entry*
e.qty+r*C)/c;return de(e.side)*(h-o)*c+e.entryFeeLeft+C*r*W+c*o*(W+s)};let f=a(t.wantQty);for(let C=0;f>0&&C<1e5&&!(l(f)<=t.budget+1e-9);C++)f=a(f-t.step);return{
qty:Math.max(0,f),newSl:o,lossAtSl:l(Math.max(0,f))}}function un(e){return JSON.parse(JSON.stringify(e))}function on(e,t=[]){const n=new Set(t),s=new Map;let o=0,
r=0,i=0;for(const m of e){if(o+=m.fees,i+=m.funding??0,n.has(m.positionId)){r+=m.netPnl;continue}const D=s.get(m.positionId)??{net:0,r:0,hasR:!0};D.net+=m.netPnl,
m.r===void 0?D.hasR=!1:D.r+=m.r,s.set(m.positionId,D)}const a=[...s.values()],l=a.filter(m=>m.net>0).length,f=a.filter(m=>m.hasR).map(m=>m.r),C=f.filter(m=>m>0),
c=f.filter(m=>m<=0),h=m=>m.length?m.reduce((D,p)=>D+p,0)/m.length:0,g=f.length?C.length/f.length:0;return{trades:a.length,wins:l,winRate:a.length?l/a.length:0,net:a.
reduce((m,D)=>m+D.net,0)+r,fees:o,partialNet:r,funding:i,rTrades:f.length,avgR:h(f),avgWinR:h(C),avgLossR:h(c),expectancyR:g*h(C)+(1-g)*h(c)}}function rn(e,t){const n=new Set(
e.filter(s=>s.final&&s.closedAt>=t).map(s=>s.positionId));return e.filter(s=>n.has(s.positionId)).reduce((s,o)=>s+(o.r??0),0)}function ln(e){const t=["closedAt",
"symbol","side","setup","qty","entry","exit","grossPnl","fees","funding","netPnl","r","reason","positionId"],n=e.map(s=>[new Date(s.closedAt).toISOString(),s.symbol,
s.side,s.setup,s.qty,s.entry,s.exit,s.grossPnl.toFixed(4),s.fees.toFixed(4),(s.funding??0).toFixed(4),s.netPnl.toFixed(4),s.r===void 0?"":s.r.toFixed(3),`"${s.reason.
replace(/"/g,'""')}"`,s.positionId].join(","));return[t.join(","),...n].join(`
`)}function an(e,t,n){var a,l;const s=Math.max(e.top,e.bottom),o=Math.min(e.top,e.bottom);let r=t.findIndex(f=>f.ts>=e.startTs);r<0&&(r=Math.max(0,t.length-60));
const i=Math.max(0,t.length-1);return{top:String(s),bottom:String(o),mid:String((s+o)/2),height:String(s-o),startTime:((a=t[r])==null?void 0:a.ts)??e.startTs,endTime:((l=
t[i])==null?void 0:l.ts)??e.startTs,startIndex:r,endIndex:i,touchesTop:2,touchesBottom:2,topPivots:[],bottomPivots:[],atr:0,heightAtr:0,insideShare:1,tolerancePct:n,
isRange:!0}}const cn=150;function dn(e,t,n){return n??(e.length>11?We(e.slice(0,-1),t):null)}const Cn=1500;function mn(e,t,n,s,o,r,i,a){const l=ne(()=>({lookback:r.
lookback,tolerancePct:r.tolerancePct,pivotLeft:r.pivotLeft,pivotRight:r.pivotRight,minTouches:r.minTouches,minHeightPct:r.minHeightPct}),[r.lookback,r.tolerancePct,
r.pivotLeft,r.pivotRight,r.minTouches,r.minHeightPct]),f=ne(()=>({requireRange:r.requireRange,tickSize:(10**-a).toFixed(a),feeRate:W,slippageBps:be}),[r.requireRange,
a]),C=e[e.length-1],c=!!C&&o()<C.ts+t+Cn,h=ne(()=>c?e.slice(0,-1):e,[e,c]),g=ne(()=>e.map(T=>n.current.pressure(T.ts,t)??_e(T)),[e,s,t]),m=h.length?`${h[h.length-
1].ts}:${h.length}`:"",D=ne(()=>i?an(i,h,r.tolerancePct):null,[i,m,r.tolerancePct]),p=ne(()=>D??(h.length>10?We(h,l):null),[m,l,D]),B=ne(()=>dn(h,l,D),[m,l,D]),
k=ne(()=>{const T=[],A=h.length;let $=new Set;if(A<30)return{out:T,prevAtLast:$};const L=g.slice(0,A);for(let q=Math.max(25,A-cn);q<A-1;q++){const E=D??We(h.slice(
0,q),l);if(!E){$=new Set;continue}const F=nt(h.slice(0,q+1),L.slice(0,q+1),E,f);T.push(...F.filter(P=>!$.has(P.type))),$=new Set(F.map(P=>P.type))}return{out:T,
prevAtLast:$}},[m,l,f,D]),S=ne(()=>!B||h.length<3?[]:nt(h,g.slice(0,h.length),B,f).filter(T=>!k.prevAtLast.has(T.type)),[m,B,f,g,k]),x=ne(()=>[...k.out,...S],[k,
S]),v=g.filter(T=>T.source==="trades").length;return{closed:h,pressures:g,box:p,signalBox:B,live:S,history:x,tapeCandles:v}}const hn={TP1:"TP1 \uC911\uC559\uC120",
TP2:"TP2 \uBC18\uB300\uD3B8",TP:"TP 1:3"};function pn(e){return e.map(t=>({price:Number(t.price),fraction:t.sizePct/100,label:hn[t.label]??t.label}))}function fn(e,t){
try{const n=localStorage.getItem(e);return n?{...t,...JSON.parse(n)}:t}catch{return t}}function Oe(e){try{const t=localStorage.getItem(e);return t?JSON.parse(t):
null}catch{return null}}function pe(e,t){try{t==null?localStorage.removeItem(e):localStorage.setItem(e,JSON.stringify(t))}catch{}}const gn={symbol:"BTCUSDT",tf:"\
15m",riskPct:1,leverage:10,autoPaper:!1,moveSlToBe:!0,maxAdds:2,addSizePct:50,lookback:80,tolerancePct:.25,pivotLeft:3,pivotRight:3,minTouches:2,minHeightPct:.6,
requireRange:!0,notify:!1,showHist:!0},bn=["\uCC28\uD2B8","\uAC70\uB798","\uD3EC\uC9C0\uC158","\uAE30\uB85D","\uC124\uC815"],Me={RANGE_LONG:"\uBC15\uC2A4 \uBC18\uC804 \uB871",
RANGE_SHORT:"\uBC15\uC2A4 \uBC18\uC804 \uC20F",FAKE_BREAKOUT_LONG:"\uAC00\uC9DC \uC774\uD0C8 \uB871",FAKE_BREAKOUT_SHORT:"\uAC00\uC9DC \uB3CC\uD30C \uC20F",BREAKOUT_LONG:"\
\uC9C4\uC9DC \uB3CC\uD30C \uB871",BREAKOUT_SHORT:"\uC9C4\uC9DC \uC774\uD0C8 \uC20F"},At=e=>e==="MANUAL"?"\uC218\uB3D9":Me[e]??e,Ct="dupont.broker.v1",mt="dupont\
.settings.v1",Ie="dupont.seen.v1";function xn(e,t){const n=e.level?M(e.level,t):"";return e.add?`\uB3CC\uD30C \uB808\uBCA8 ${n} \uB9AC\uD14C\uC2A4\uD2B8 \uD655\uC778 \u2013 \uCD94\uAC00 \uC9C4\uC785 \uAC00\uB2A5`:
e.reason.startsWith("max adds")?"\uCD5C\uB300 \uCD94\uAC00 \uD69F\uC218 \uB3C4\uB2EC":e.reason.startsWith("no retest")?`\uB3CC\uD30C \uB808\uBCA8 ${n} \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:
e.reason.startsWith("retest without")?"\uB9AC\uD14C\uC2A4\uD2B8 \uC911 \u2013 \uC7A5\uC545\uD615/\uC555\uB825 \uD655\uC778 \uB300\uAE30":e.reason.startsWith("no\
 broken")?"\uB3CC\uD30C \uB808\uBCA8 \uC815\uBCF4 \uC5C6\uC74C":e.reason.startsWith("pyramiding only")?"\uB3CC\uD30C \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9":
e.reason.startsWith("retest must be")?"\uC9C4\uC785/\uC9C1\uC804 \uCD94\uAC00 \uC774\uD6C4\uC758 \uC0C8 \uCE94\uB4E4\uC5D0\uC11C \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30":
e.reason.startsWith("no move away")?`\uB3CC\uD30C \uB808\uBCA8 ${n}\uC5D0\uC11C 0.5R \uC774\uC0C1 \uC774\uD0C8 \uD6C4 \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:"\uB370\uC774\
\uD130 \uBD80\uC871"}function Bn(){var Te,ve,he,ue;const[e,t]=K("\uCC28\uD2B8"),[n,s]=K(()=>fn(mt,gn)),o=u=>s(y=>{const w={...y,...u};return pe(mt,w),w}),r=se(n.
symbol),i=Yt(n.symbol,n.tf),[a,l]=K(()=>Oe(`dupont.box.${n.symbol}`));Y(()=>l(Oe(`dupont.box.${n.symbol}`)),[n.symbol]);const[f,C]=K(!1),c=mn(i.candles,i.intervalMs,
i.tape,i.tapeVer,i.serverNow,n,a,r.dp),h=(10**-r.dp).toFixed(r.dp),g=G(null);g.current||(g.current=new nn(Oe(Ct)??void 0)),g.current.moveSlToBe=n.moveSlToBe,g.current.
precision=u=>{const y=se(u);return{dp:y.dp,qdp:y.qdp}};const[m,D]=K(0),p=()=>{pe(Ct,g.current.state),D(u=>u+1)},[B,k]=K([]),S=Ze((u,y="info")=>{const w=Date.now()+
Math.random();if(k(N=>[...N.slice(-1),{id:w,text:u,tone:y}]),setTimeout(()=>k(N=>N.filter(R=>R.id!==w)),4e3),n.notify&&"Notification"in window&&Notification.permission===
"granted"&&document.visibilityState!=="visible")try{new Notification("\uB4C0\uD401 \uC2A4\uD0E0\uB2E4\uB4DC",{body:u,icon:"/dupont-mobile/icons/icon.svg"})}catch{}},
[n.notify]),x=((Te=i.ticker)==null?void 0:Te.last)??((ve=i.candles[i.candles.length-1])==null?void 0:ve.close)??0,[v,T]=K({});Y(()=>{x&&T(u=>({...u,[n.symbol]:x}))},
[x,n.symbol]),Y(()=>{var y;if(!x)return;const u=g.current.onPrice(n.symbol,x,Date.now(),(y=i.ticker)==null?void 0:y.mark);i.ticker&&u.push(...g.current.accrueFunding(
n.symbol,i.ticker.funding,i.ticker.mark||x)),u.length&&(u.forEach(w=>S(w.message,w.kind==="sl"||w.kind==="liq"?"down":w.kind==="funding"?"info":"up")),p())},[x]),
Y(()=>{const u=setInterval(async()=>{const y=new Set([...g.current.state.positions.map(w=>w.symbol),...g.current.state.pending.map(w=>w.symbol)]);y.delete(n.symbol);
for(const w of y){const N=await bt(w).catch(()=>null);if(!N)continue;T(_=>({..._,[w]:N.last}));const R=[...g.current.onPrice(w,N.last,Date.now(),N.mark),...g.current.
accrueFunding(w,N.funding,N.mark||N.last)];R.length&&(R.forEach(_=>S(`${w} ${_.message}`)),p())}},4e3);return()=>clearInterval(u)},[n.symbol]);const A=g.current.
state,$=g.current.equity(v),L=g.current.available(),q=A.positions.filter(u=>u.symbol===n.symbol),E=G(new Set(Oe(Ie)??[])),F=u=>`${n.symbol}:${n.tf}:${u.type}:${u.
ts}`,P=c.live[c.live.length-1]??null,I=((he=c.closed[c.closed.length-1])==null?void 0:he.ts)??0,Ce=u=>u.ts<I?"\uC2E0\uD638 \uB9CC\uB8CC (\uCD5C\uADFC \uB9C8\uAC10 \uCE94\uB4E4 \uC544\uB2D8)":
Math.abs(x-Number(u.entry))>.3*Number(u.risk)?"\uAC00\uACA9 \uC774\uD0C8 (\uC2E0\uD638 \uC9C4\uC785\uAC00 \xB10.3R \uCD08\uACFC)":null,me=u=>{var w,N;const y=u===
"long"?(w=i.ticker)==null?void 0:w.ask:(N=i.ticker)==null?void 0:N.bid;return y&&x&&Math.abs(y-x)/x<.005?y:x},z=ne(()=>{var w;const u=((w=c.closed[c.closed.length-
3])==null?void 0:w.ts)??0,y=[...c.history].reverse().find(N=>N.ts>=u);return P??y??null},[P,c.history,c.closed]),re=(u,y)=>Ot({equity:String(A.wallet),available:String(
L),riskPct:n.riskPct,entry:String(u),sl:String(y),leverage:n.leverage,feeRate:String(W),slippageBps:be,qtyStep:String(r.qtyStep),minQty:String(r.qtyStep),minNotional:xe}),
Be=(u,y=!1)=>{if(A.positions.some(Fe=>Fe.symbol===n.symbol)){S("\uC774\uBBF8 \uD3EC\uC9C0\uC158 \uBCF4\uC720 \uC911","down");return}const w=x,N=Ce(u);if(N){S(`${N}\
 \u2013 \uC9C4\uC785 \uBD88\uAC00`,"down");return}const R=je({side:u.side,kind:u.kind,entry:String(w),extremeWick:u.sl,box:u.box,slBufferPct:0,tickSize:h,feeRate:W,
slippageBps:be});if(u.kind==="range"&&ft({side:u.side,entry:R.entry,sl:R.sl,tp:R.targets[0].price,feeRate:W,slippageBps:be})<1){S("\uD604\uC7AC\uAC00 \uAE30\uC900 TP1 \uC21C\uC190\uC775\uBE44 1 \uBBF8\uB9CC \u2013 \uC9C4\uC785 \uC0DD\uB7B5",
"down");return}const _=Number(R.sl),U=pn(R.targets),H=u.side==="long";if(H?!(_<w&&U[0].price>w):!(_>w&&U[0].price<w)){S("\uD604\uC7AC\uAC00\uAC00 \uC2E0\uD638 \uBC94\uC704\uB97C \uBC97\uC5B4\uB098 \uC9C4\uC785 \uBD88\uAC00 (SL/TP1 \uC0AC\uC774 \uC544\uB2D8)",
"down");return}const te=re(w,_),j=Number(te.qty);if(te.belowMin||!(j>0)){S(`\uB9AC\uC2A4\uD06C ${n.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${xe}\
 USDT / ${r.qtyStep}) \uBBF8\uB9CC`,"down");return}const ce=g.current.open({symbol:n.symbol,side:u.side,qty:j,price:w,refPx:me(u.side),leverage:n.leverage,sl:_,
targets:U,setup:u.type,signalId:F(u),breakoutLevel:u.kind==="breakout"?Number(H?u.box.top:u.box.bottom):void 0});if(!ce.ok){S(ce.error??"\uC9C4\uC785 \uC2E4\uD328",
"down");return}E.current.add(F(u)),pe(Ie,[...E.current].slice(-300)),S(`${y?"[\uC790\uB3D9] ":""}${Me[u.type]} \uBAA8\uC758 \uC9C4\uC785 ${M(j,r.qdp)} @ ${M(ce.
fillPx??w,r.dp)}`,"up"),p()},He=u=>{const y=A.fills.filter(R=>R.final&&R.symbol===n.symbol),w=y[y.length-1];if(w){const R=A.fills.filter(U=>U.positionId===w.positionId).
reduce((U,H)=>U+H.netPnl,0),_=Math.floor(w.closedAt/i.intervalMs)*i.intervalMs;if(R<0&&u.ts<=_+2*i.intervalMs)return"\uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30"}const N=new Date;
return N.setHours(0,0,0,0),rn(A.fills,N.getTime())<=-3?"\uC77C\uC77C \uC190\uC2E4 \uD55C\uB3C4 \u22123R \uB3C4\uB2EC":null};Y(()=>{if(!P)return;const u=F(P);if(!E.
current.has(`n:${u}`)&&(E.current.add(`n:${u}`),pe(Ie,[...E.current].slice(-300)),S(`\uC2E0\uD638: ${Me[P.type]} \xB7 SL ${M(P.sl,r.dp)} \xB7 ${P.targets.map(y=>`${y.
label} ${M(y.price,r.dp)}`).join(" / ")}`,P.side==="long"?"up":"down"),n.autoPaper&&!q.length)){const y=P.pressure.source!=="trades"?"\uC555\uB825\uC774 OHLCV \uADFC\uC0AC":
He(P);y?S(`[\uC790\uB3D9] \uC9C4\uC785 \uC0DD\uB7B5 \u2013 ${y}`,"info"):Be(P,!0)}},[P==null?void 0:P.ts,P==null?void 0:P.type]);const ye=ne(()=>q.map(u=>{const y=c.
pressures.slice(0,c.closed.length),w=Lt({side:u.side,entry:u.entry,sl:u.sl,targets:u.targets.filter(R=>!R.done).map(R=>({price:R.price}))},c.closed,y),N=u.setup.
startsWith("BREAKOUT")?Ut({side:u.side,entry:u.entry,sl:u.initialSl,targets:u.targets.map(R=>({price:R.price})),type:u.setup,adds:u.adds,brokenLevel:u.breakoutLevel,
openedTs:Math.floor(u.openedAt/i.intervalMs)*i.intervalMs,lastAddTs:u.lastAddTs,risk:Math.abs((u.initialEntry??u.entry)-u.initialSl)},c.closed,y,c.box,{maxAdds:n.
maxAdds,addSizePct:n.addSizePct,tickSize:h}):null;return{p:u,flip:w,pyr:N}}),[m,c.closed,c.pressures,c.box,n.maxAdds,n.addSizePct,n.symbol,i.intervalMs]),Re=G(new Set);
Y(()=>{for(const u of ye){const y=`${u.p.id}:${I}`;u.flip.alert&&!Re.current.has(y)&&(Re.current.add(y),S(`\uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (${u.
flip.multiple.toFixed(1)}\uBC30)`,"warn"))}},[ye]);const Se=(u,y,w)=>{const N=g.current.closeFraction(u.id,y,v[u.symbol]??x,w);N&&S(`${w} ${M(N.qty,se(u.symbol).
qdp)} @ ${M(N.exit,se(u.symbol).dp)} \xB7 \uC21C\uC190\uC775 ${ee(N.netPnl)} USDT`,N.netPnl>=0?"up":"down"),p()},ae=(u,y)=>{const w=u.origQty/(1+u.adds*(n.addSizePct/
100)),N=A.wallet*n.riskPct/100,R=sn(u,{last:me(u.side),suggestedSl:y.sl?Number(y.sl):void 0,budget:N,wantQty:w*(y.sizePct??n.addSizePct)/100,step:r.qtyStep});if(!(R.
qty>0)){S("\uCD94\uAC00 \uC2DC \uCD1D \uB9AC\uC2A4\uD06C\uAC00 \uD55C\uB3C4 \uCD08\uACFC","down");return}if(R.qty*x<xe){S(`\uCD94\uAC00 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561(${xe}\
 USDT) \uBBF8\uB9CC`,"down");return}const _=g.current.open({symbol:u.symbol,side:u.side,qty:R.qty,price:x,refPx:me(u.side),leverage:u.leverage,sl:R.newSl,targets:[],
setup:u.setup,isAdd:!0,candleTs:I});if(!_.ok){S(_.error??"\uCD94\uAC00 \uC2E4\uD328","down");return}S(`\uBD88\uD0C0\uAE30 #${u.adds+1}: ${M(R.qty,r.qdp)} @ ${M(
_.fillPx??x,r.dp)} \xB7 SL ${M(R.newSl,r.dp)}`,"up"),p()},fe=Ze(u=>{var U,H;const y=c.closed,w=y.length>=2?u==="long"?Math.min(y[y.length-1].low,y[y.length-2].low):
Math.max(y[y.length-1].high,y[y.length-2].high):x*(u==="long"?.995:1.005),N=c.box,R=N?x<Number(N.top)&&x>Number(N.bottom):!1;if(N){const te=R?"range":"breakout",
j=u==="long"?Math.min(w,x*.999):Math.max(w,x*1.001),ce=je({side:u,kind:te,entry:String(x),extremeWick:String(j),box:N,atr:N.atr,tickSize:h,feeRate:W,slippageBps:be}),
Fe=Ye=>Ye?Number(Ye).toFixed(r.dp):"";return{side:u,kind:te,sl:Fe(ce.sl),tp1:Fe((U=ce.targets[0])==null?void 0:U.price),tp2:Fe((H=ce.targets[1])==null?void 0:H.
price)}}const _=u==="long"?x*.995:x*1.005;return{side:u,kind:"breakout",sl:_.toFixed(r.dp),tp1:(x+(x-_)*3).toFixed(r.dp),tp2:""}},[c.closed,c.box,x,r.dp,h]),[ge,
De]=K(null),Ee=u=>{var w,N;const y=R=>R?Number(R).toFixed(r.dp):"";De({side:u.side,kind:u.kind,sl:y(u.sl),tp1:y((w=u.targets[0])==null?void 0:w.price),tp2:y((N=
u.targets[1])==null?void 0:N.price),signal:u}),t("\uAC70\uB798")},Ae=(((ue=i.ticker)==null?void 0:ue.change24h)??0)>=0;return b("div",{className:"h-full flex fl\
ex-col pt-safe",children:[d("header",{className:"px-3 pt-2 pb-1.5 border-b border-line",children:b("div",{className:"flex items-end justify-between",children:[b(
"div",{children:[b("div",{className:"flex items-center gap-2",children:[d("select",{value:n.symbol,onChange:u=>o({symbol:u.target.value}),className:"bg-transpar\
ent text-[15px] font-semibold outline-none",children:xt.map(u=>d("option",{value:u.symbol,className:"bg-panel",children:u.symbol},u.symbol))}),d("span",{className:"\
text-[10px] px-1.5 py-0.5 rounded bg-panel2 text-muted",children:"\uBB34\uAE30\uD55C \xB7 \uBAA8\uC758"}),d("span",{className:`w-2 h-2 rounded-full ${i.status===
"live"?"bg-up":"bg-warn"}`,title:i.status})]}),d("div",{className:`text-[26px] leading-8 font-semibold num ${Ae?"text-up":"text-down"}`,children:x?M(x,r.dp):"\u2014"})]}),
b("div",{className:"text-right text-[11px] text-muted num leading-[18px]",children:[b("div",{children:["24h ",d("span",{className:Ae?"text-up":"text-down",children:i.
ticker?Ht(i.ticker.change24h):"\u2014"})]}),b("div",{children:["\uB9C8\uD06C ",i.ticker?M(i.ticker.mark,r.dp):"\u2014"]}),b("div",{children:["\uD380\uB529 ",i.ticker?
`${(i.ticker.funding*100).toFixed(4)}%`:"\u2014"]})]})]})}),B.length>0&&d("div",{className:"px-3 py-1.5 space-y-1 border-b border-line bg-bg","aria-live":"polit\
e",children:B.map(u=>d("div",{className:`text-[12px] leading-4 px-2.5 py-1.5 rounded-md ${u.tone==="down"?"bg-down/20 text-down":u.tone==="up"?"bg-up/15 text-up":
u.tone==="warn"?"bg-warn/20 text-warn":"bg-panel2 text-txt"}`,children:u.text},u.id))}),b("main",{className:"flex-1 min-h-0 flex flex-col overflow-hidden",children:[
e==="\uCC28\uD2B8"&&b(kt,{children:[b("div",{className:"flex items-center justify-between px-3 py-1.5 gap-2",children:[d(Ve,{items:Xt,value:n.tf,onChange:u=>o({
tf:u})}),d("button",{onClick:()=>C(u=>!u),className:`h-8 px-3 rounded-full text-xs ${f?"bg-warn text-bg font-semibold":"bg-panel2 text-muted"}`,children:f?"\uD3B8\uC9D1 \uC644\
\uB8CC":"\uBC15\uC2A4 \uD3B8\uC9D1"})]}),d("div",{className:"flex-1 min-h-0",children:i.candles.length?d(_t,{viewKey:`${n.symbol}:${n.tf}`,candles:i.candles,pressures:c.
pressures,box:c.box,signals:c.history,positions:q,dp:r.dp,showHist:n.showHist,editBox:f,onBoxEdit:(u,y)=>{var N;const w={top:u,bottom:y,startTs:(a==null?void 0:
a.startTs)??((N=c.box)==null?void 0:N.startTime)??Date.now(),locked:!0};l(w),pe(`dupont.box.${n.symbol}`,w)}}):d("div",{className:"p-6 text-muted text-sm",children:i.
err?`\uB370\uC774\uD130 \uC624\uB958: ${i.err}`:"\uCE94\uB4E4 \uBD88\uB7EC\uC624\uB294 \uC911\u2026"})}),d(yn,{box:c.box,manual:a,dp:r.dp,tape:c.tapeCandles,onUnlock:()=>{
l(null),pe(`dupont.box.${n.symbol}`,null),C(!1)},onEdit:(u,y)=>{var N;const w={top:u,bottom:y,startTs:(a==null?void 0:a.startTs)??((N=c.box)==null?void 0:N.startTime)??
Date.now(),locked:!0};l(w),pe(`dupont.box.${n.symbol}`,w)}}),ye.filter(u=>u.flip.alert).map(u=>b("div",{className:"mx-3 mb-2 rounded-lg bg-warn/15 border border\
-warn px-3 py-2 flex items-center justify-between",children:[b("span",{className:"text-[13px] text-warn font-semibold",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",
u.flip.multiple.toFixed(1),"\uBC30)"]}),d(le,{tone:"warn",className:"h-9",onClick:()=>Se(u.p,1,"\uC555\uB825\uBC18\uC804 \uCCAD\uC0B0"),children:"\uCCAD\uC0B0"})]},
u.p.id)),d(Dn,{g:z,dp:r.dp,acted:z?E.current.has(F(z)):!1,stale:z?Ce(z):null,onEnter:()=>z&&Be(z),onEdit:()=>z&&Ee(z)})]}),e==="\uAC70\uB798"&&d(An,{s:n,set:o,last:x,
dp:r.dp,book:i.book,equity:$,available:L,qtyStep:r.qtyStep,draft:ge,setDraft:De,defaultDraft:fe,sizeFor:re,onSubmit:(u,y,w,N)=>{var te;const R=Number(u.sl),_=u.
kind==="breakout"||!u.tp2?[{price:Number(u.tp1),fraction:1,label:u.kind==="breakout"?"TP 1:3":"TP"}]:[{price:Number(u.tp1),fraction:.5,label:"TP1 \uC911\uC559\uC120"},
{price:Number(u.tp2),fraction:.5,label:"TP2 \uBC18\uB300\uD3B8"}],U=((te=u.signal)==null?void 0:te.type)??"MANUAL",H=u.kind==="breakout"&&c.box?Number(u.side===
"long"?c.box.top:c.box.bottom):void 0;if(y==="limit"){const j=g.current.placeLimit({symbol:n.symbol,side:u.side,qty:N,price:w,leverage:n.leverage,sl:R,targets:_,
setup:U,breakoutLevel:H});S(j.ok?`\uC9C0\uC815\uAC00 ${u.side==="long"?"\uB871":"\uC20F"} \uC8FC\uBB38 ${M(N,r.qdp)} @ ${M(w,r.dp)}`:j.error??"\uC8FC\uBB38 \uC2E4\uD328",
j.ok?"up":"down")}else{const j=g.current.open({symbol:n.symbol,side:u.side,qty:N,price:x,refPx:me(u.side),leverage:n.leverage,sl:R,targets:_,setup:U,breakoutLevel:H,
signalId:u.signal?F(u.signal):void 0});S(j.ok?`${u.side==="long"?"\uB871":"\uC20F"} \uBAA8\uC758 \uC9C4\uC785 ${M(N,r.qdp)} @ ${M(j.fillPx??x,r.dp)}`:j.error??"\
\uC9C4\uC785 \uC2E4\uD328",j.ok?"up":"down"),j.ok&&u.signal&&(E.current.add(F(u.signal)),pe(Ie,[...E.current].slice(-300)))}p()}},n.symbol),e==="\uD3EC\uC9C0\uC158"&&
b("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[b(oe,{className:"p-3",children:[d(X,{k:"\uC790\uC0B0 (Equity)",v:`${M($)} USDT`}),d(X,{k:"\uAC00\uC6A9",
v:`${M(L)} USDT`}),d(X,{k:"\uBBF8\uC2E4\uD604 \uC190\uC775 (\uC21C, \uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC)",v:(()=>{const u=A.positions.reduce((w,N)=>{const R=v[N.symbol]??
N.entry;return w+Ge(N,R)-N.entryFeeLeft-R*N.qty*W},0),y=Number(u.toFixed(2));return b("span",{className:y>0?"text-up":y<0?"text-down":"",children:[ee(u)," USDT"]})})()})]}),
!A.positions.length&&d("div",{className:"text-muted text-sm text-center py-8",children:"\uBCF4\uC720 \uD3EC\uC9C0\uC158 \uC5C6\uC74C"}),A.positions.map(u=>{var _;
const y=ye.find(U=>U.p.id===u.id),w=v[u.symbol]??u.entry,N=Ge(u,w)-u.entryFeeLeft-w*u.qty*W,R=se(u.symbol).dp;return b(oe,{className:"p-3",children:[b("div",{className:"\
flex justify-between items-center mb-1",children:[b("div",{className:"font-semibold",children:[d("span",{className:u.side==="long"?"text-up":"text-down",children:u.
side==="long"?"\uB871":"\uC20F"})," ",u.symbol," ",b("span",{className:"text-muted text-xs",children:[u.leverage,"x \xB7 ",At(u.setup)]})]}),b("div",{className:"\
text-right",children:[b("div",{className:`num font-semibold ${N>=0?"text-up":"text-down"}`,children:[ee(N)," USDT"]}),d("div",{className:"text-[10px] text-muted",
children:"\uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC \uC21C\uC190\uC775"})]})]}),d(X,{k:"\uC218\uB7C9 / \uC9C4\uC785\uAC00",v:`${M(u.qty,se(u.symbol).qdp)} / ${M(u.entry,
R)}`}),d(X,{k:"\uB9C8\uD06C / \uCCAD\uC0B0\uAC00",v:`${M(w,R)} / ${M(u.liqPrice,R)}`}),d(X,{k:`SL${u.beMoved?" (\uBCF8\uC808)":""}`,v:M(u.sl,R)}),u.targets.map(
(U,H)=>d(X,{k:U.label,v:b("span",{className:U.done?"text-up":"",children:[M(U.price,R)," \xB7 ",Math.round(U.fraction*100),"% ",U.done?"\u2713 \uCCB4\uACB0":"\uB300\uAE30"]})},
H)),d(X,{k:"\uACC4\uD68D \uB9AC\uC2A4\uD06C (1R)",v:u.riskUsd?`${M(u.riskUsd)} USDT`:"\u2014"}),(u.fundingAcc??0)!==0&&d(X,{k:"\uD380\uB529\uBE44 \uB204\uC801 (\uBBF8\uC815\uC0B0)",
v:b("span",{className:(u.fundingAcc??0)>0?"text-down":"text-up",children:[ee(-(u.fundingAcc??0),4)," USDT"]})}),d(X,{k:"\uC2E4\uD604 \uC190\uC775 (\uC21C, \uD380\uB529 \uD3EC\uD568)",
v:ee(u.realizedNet)}),(y==null?void 0:y.flip.alert)&&b("div",{className:"mt-2 text-[12px] text-warn",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",
y.flip.multiple.toFixed(1),"\uBC30, \uBAA9\uD45C \uC9C4\uD589 ",Math.round(y.flip.progress*100),"%)"]}),(y==null?void 0:y.pyr)&&b("div",{className:`mt-1 text-[1\
1px] ${y.pyr.add?"text-accent":"text-muted"}`,children:["\uBD88\uD0C0\uAE30 ",u.adds,"/",n.maxAdds,": ",xn(y.pyr,se(u.symbol).dp)]}),!(y!=null&&y.pyr)&&b("div",
{className:"mt-1 text-[11px] text-muted",children:["\uBD88\uD0C0\uAE30: \uB3CC\uD30C \uC2E0\uD638 \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 (\uCD5C\uB300 ",
n.maxAdds,"\uD68C)"]}),b("div",{className:"grid grid-cols-3 gap-2 mt-3",children:[d(le,{tone:"down",onClick:()=>Se(u,1,"\uC2DC\uC7A5\uAC00 \uCCAD\uC0B0"),children:"\
\uC804\uB7C9 \uCCAD\uC0B0"}),d(le,{onClick:()=>Se(u,.5,"50% \uCCAD\uC0B0"),children:"50% \uCCAD\uC0B0"}),d(le,{tone:"accent",disabled:!((_=y==null?void 0:y.pyr)!=
null&&_.add)||u.adds>=n.maxAdds||u.symbol!==n.symbol,onClick:()=>(y==null?void 0:y.pyr)&&ae(u,y.pyr),children:"\uBD88\uD0C0\uAE30"})]})]},u.id)}),A.pending.length>
0&&b(oe,{className:"p-3",children:[d("div",{className:"text-sm font-semibold mb-1",children:"\uBBF8\uCCB4\uACB0 \uC9C0\uC815\uAC00"}),A.pending.map(u=>b("div",{
className:"flex justify-between items-center py-1 text-[13px]",children:[b("span",{className:u.side==="long"?"text-up":"text-down",children:[u.side==="long"?"\uB871":
"\uC20F"," ",u.symbol," ",M(u.qty,se(u.symbol).qdp)," @ ",M(u.price,se(u.symbol).dp)]}),d("button",{className:"text-muted underline",onClick:()=>{g.current.cancelLimit(
u.id),p()},children:"\uCDE8\uC18C"})]},u.id))]})]}),e==="\uAE30\uB85D"&&d(vn,{broker:g.current}),e==="\uC124\uC815"&&b("div",{className:"flex-1 overflow-y-auto \
p-3 space-y-3",children:[b(oe,{className:"p-3",children:[d("div",{className:"text-sm font-semibold mb-2",children:"\uC790\uAE08"}),d(X,{k:"\uC2DC\uB4DC / \uC9C0\uAC11",
v:`${M(A.bankroll)} / ${M(A.wallet)} USDT`}),d(le,{tone:"down",className:"w-full mt-2",onClick:()=>{confirm("\uBAA8\uC758 \uC790\uAE08\uC744 200 USDT\uB85C \uCD08\uAE30\uD654\uD558\uACE0 \uD3EC\uC9C0\uC158\xB7\uAE30\uB85D\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?")&&
(g.current.reset(Xe),p(),S("200 USDT\uB85C \uCD08\uAE30\uD654"))},children:"\uC790\uAE08 \uCD08\uAE30\uD654 (200 USDT)"})]}),b(oe,{className:"p-3 space-y-3",children:[
d("div",{className:"text-sm font-semibold",children:"\uB9AC\uC2A4\uD06C"}),b("div",{className:"grid grid-cols-2 gap-2",children:[d(V,{label:"\uAC70\uB798\uB2F9 \uB9AC\uC2A4\uD06C %",
value:String(n.riskPct),onChange:u=>o({riskPct:Math.max(.1,Number(u)||1)}),suffix:"%"}),d(V,{label:"\uAE30\uBCF8 \uB808\uBC84\uB9AC\uC9C0",value:String(n.leverage),
onChange:u=>o({leverage:Math.min(125,Math.max(1,Math.round(Number(u)||1)))}),suffix:"x"}),d(V,{label:"\uBD88\uD0C0\uAE30 \uCD5C\uB300 \uD69F\uC218",value:String(
n.maxAdds),onChange:u=>o({maxAdds:Math.max(0,Math.round(Number(u)||0))})}),d(V,{label:"\uBD88\uD0C0\uAE30 \uD06C\uAE30 (\uCD08\uAE30 \uB300\uBE44)",value:String(
n.addSizePct),onChange:u=>o({addSizePct:Math.max(5,Number(u)||50)}),suffix:"%"})]}),d($e,{on:n.moveSlToBe,onChange:u=>o({moveSlToBe:u}),label:"TP1 \uCCB4\uACB0 \uD6C4 SL \uBCF8\uC808 \uC774\uB3D9",
hint:"\uBCF8\uC808\uAC00 = \uC9C4\uC785\uAC00 + \uB0A8\uC740 \uC9C4\uC785\xB7\uCCAD\uC0B0 \uC218\uC218\uB8CC (\uC190\uC2E4 \uC5C6\uC774 \uCCAD\uC0B0)"}),d($e,{on:n.
autoPaper,onChange:u=>o({autoPaper:u}),label:"\uC790\uB3D9 \uBAA8\uC758\uB9E4\uB9E4",hint:"\uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 \uC2E0\uD638\uB9CC \xB7 \uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30 \xB7 \uC77C\uC77C \u22123R \uC815\uC9C0 (\uAE30\uBCF8 OFF)"})]}),
b(oe,{className:"p-3 space-y-3",children:[d("div",{className:"text-sm font-semibold",children:"\uBC15\uC2A4 / \uD53C\uBD07"}),b("div",{className:"grid grid-cols\
-2 gap-2",children:[d(V,{label:"\uB8E9\uBC31 (\uCE94\uB4E4)",value:String(n.lookback),onChange:u=>o({lookback:Math.max(20,Math.round(Number(u)||80))})}),d(V,{label:"\
\uD130\uCE58 \uD5C8\uC6A9 %",value:String(n.tolerancePct),onChange:u=>o({tolerancePct:Math.max(.05,Number(u)||.25)}),suffix:"%"}),d(V,{label:"\uD53C\uBD07 \uC88C",
value:String(n.pivotLeft),onChange:u=>o({pivotLeft:Math.max(1,Math.round(Number(u)||3))})}),d(V,{label:"\uD53C\uBD07 \uC6B0",value:String(n.pivotRight),onChange:u=>o(
{pivotRight:Math.max(1,Math.round(Number(u)||3))})}),d(V,{label:"\uCD5C\uC18C \uD130\uCE58",value:String(n.minTouches),onChange:u=>o({minTouches:Math.max(1,Math.
round(Number(u)||2))})}),d(V,{label:"\uCD5C\uC18C \uBC15\uC2A4 \uB192\uC774 %",value:String(n.minHeightPct),onChange:u=>o({minHeightPct:Math.max(0,Number(u)||0)}),
suffix:"%"})]}),d($e,{on:n.requireRange,onChange:u=>o({requireRange:u}),label:"\uBC15\uC2A4\uAD8C(\uBE44\uCD94\uC138)\uC77C \uB54C\uB9CC \uC2E0\uD638"}),d($e,{on:n.
showHist,onChange:u=>o({showHist:u}),label:"\uC555\uB825 \uD788\uC2A4\uD1A0\uADF8\uB7A8 \uD45C\uC2DC"})]}),d(oe,{className:"p-3",children:d($e,{on:n.notify,onChange:async u=>{
u&&"Notification"in window&&Notification.permission!=="granted"&&await Notification.requestPermission(),o({notify:u})},label:"\uC54C\uB9BC",hint:"\uC2E0\uD638\xB7\uCCB4\uACB0\xB7\uC555\uB825\uBC18\uC804 (\uD648 \
\uD654\uBA74 \uC571\uC5D0\uC11C \uAD8C\uC7A5)"})}),b("div",{className:"text-[11px] text-muted px-1 pb-4 leading-5",children:["\uD398\uC774\uD37C(\uBAA8\uC758) \uD2B8\uB808\uC774\uB529 \uC804\uC6A9 \xB7 \uC2E4\uACC4\uC88C/API \uD0A4 \uC5C6\uC74C \xB7 B\
itget \uACF5\uAC1C \uC2DC\uC138 \uC0AC\uC6A9. \uC218\uC218\uB8CC: Bitget USDT-M \uD14C\uC774\uCEE4 0.06% / \uBA54\uC774\uCEE4 0.02% (TP\uB3C4 \uD14C\uC774\uCEE4\uB85C \uBCF4\uC218 \uACC4\uC0B0). \uC2AC\uB9AC\uD53C\uC9C0 ",
be,"bp (\uC2DC\uC7A5\uAC00\xB7\uC190\uC808). \uD380\uB529\uBE44: 00/08/16\uC2DC UTC\uB9C8\uB2E4 \uD604\uC7AC \uD380\uB529\uB960\uB85C \uADFC\uC0AC \uBC18\uC601. \uB3CC\uD30C TP 1:3\uC740 \uC218\uC218\uB8CC \uCC28\uAC10 \uC21C\uC190\uC775 \uAE30\uC900. \uC555\uB825: \uC2E4\uC2DC\uAC04 \uCCB4\uACB0(aggressor) \uC9D1\uACC4, \uC5F0\uACB0 \uC774\uC804 \uCE94\uB4E4\uC740 OHLCV \uADFC\uC0AC."]})]})]}),
d("nav",{className:"border-t border-line bg-panel pb-safe grid grid-cols-5",children:bn.map(u=>d("button",{onClick:()=>t(u),className:`h-14 text-[13px] relative\
 ${e===u?"text-accent font-semibold":"text-muted"}`,children:b("span",{className:"inline-flex items-center gap-1",children:[u,u==="\uD3EC\uC9C0\uC158"&&A.positions.
length>0&&d("span",{className:"min-w-4 h-4 px-1 rounded-full bg-accent text-bg text-[10px] leading-4 font-semibold",children:A.positions.length})]})},u))})]})}function yn({
box:e,manual:t,dp:n,tape:s,onUnlock:o,onEdit:r}){const[i,a]=K(!1),[l,f]=K(""),[C,c]=K("");return e?b("div",{className:"px-3 py-1.5 border-t border-line text-[12\
px]",children:[b("div",{className:"flex items-center justify-between gap-2",children:[b("div",{className:"num leading-5",children:[d("span",{className:"text-mut\
ed",children:"\uBC15\uC2A4 "}),d("span",{className:"text-down",children:M(e.bottom,n)})," \u2013 ",d("span",{className:"text-up",children:M(e.top,n)}),d("span",
{className:"text-muted",children:" \xB7 50% "}),M(e.mid,n)]}),b("div",{className:"flex gap-1.5 items-center",children:[d("span",{className:`px-1.5 py-0.5 rounde\
d text-[10px] ${e.isRange?"bg-up/20 text-up":"bg-warn/20 text-warn"}`,children:t?"\uC218\uB3D9\xB7\uACE0\uC815":e.isRange?"\uBC15\uC2A4\uAD8C":"\uCD94\uC138/\uC57D\uD568"}),
d("button",{className:"text-accent",onClick:()=>{f(String(Number(e.top))),c(String(Number(e.bottom))),a(h=>!h)},children:"\uC218\uC815"}),t&&d("button",{className:"\
text-muted",onClick:o,children:"\uC790\uB3D9"})]})]}),b("div",{className:"text-[10px] text-muted",children:["\uD130\uCE58 ",e.touchesTop,"/",e.touchesBottom," \xB7\
 \uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 ",s,"\uCE94\uB4E4 (\uADF8 \uC678 OHLCV \uADFC\uC0AC)"]}),i&&b("div",{className:"grid grid-cols-3 gap-2 mt-2 items-\
end",children:[d(V,{label:"\uC0C1\uB2E8(\uC800\uD56D)",value:l,onChange:f}),d(V,{label:"\uD558\uB2E8(\uC9C0\uC9C0)",value:C,onChange:c}),d(le,{tone:"accent",onClick:()=>{
const h=Number(l),g=Number(C);h>0&&g>0&&h!==g&&(r(h,g),a(!1))},children:"\uACE0\uC815"})]})]}):d("div",{className:"px-3 py-2 text-[12px] text-muted border-t bor\
der-line",children:"\uBC15\uC2A4 \uD0D0\uC9C0 \uC911\u2026 (\uD53C\uBD07 \uD130\uCE58 \uBD80\uC871)"})}function Dn({g:e,dp:t,acted:n,stale:s,onEnter:o,onEdit:r}){
if(!e)return d("div",{className:"mx-3 mb-2 px-3 py-2 rounded-lg bg-panel border border-line text-[12px] text-muted",children:"\uC2E0\uD638 \uB300\uAE30 \uC911 \xB7 \uBC15\uC2A4 \uC9C0\uC9C0/\uC800\uD56D + \uC7A5\uC545\uD615 + \uC555\uB825 \uD655\uC778 \uC2DC\
 \uD45C\uC2DC"});const i=e.side==="long";return b("div",{className:`mx-3 mb-2 rounded-xl border px-3 py-2 ${i?"border-up/60 bg-up/10":"border-down/60 bg-down/10"}`,
children:[b("div",{className:"flex justify-between items-center",children:[b("div",{className:`font-semibold ${i?"text-up":"text-down"}`,children:[Me[e.type]," ",
b("span",{className:"text-muted text-[11px] font-normal",children:[Je(e.ts)," \uB9C8\uAC10"]})]}),b("div",{className:"text-[11px] text-muted flex items-center g\
ap-1.5",children:[e.pressure.source==="ohlcv"&&d("span",{className:"px-1.5 py-0.5 rounded bg-warn/20 text-warn text-[10px]",children:"\uC555\uB825 \uADFC\uC0AC(OHLCV)"}),
b("span",{children:["\uB9E4\uC218\uC555\uB825 ",Math.round(e.pressure.ratio*100),"%"]})]})]}),b("div",{className:"grid grid-cols-4 gap-1 text-[11px] num mt-1",children:[
b("div",{children:[d("div",{className:"text-muted",children:"\uC9C4\uC785"}),M(e.entry,t)]}),b("div",{children:[d("div",{className:"text-muted",children:"SL"}),
d("span",{className:"text-warn",children:M(e.sl,t)})]}),e.targets.map(a=>b("div",{children:[b("div",{className:"text-muted",children:[a.label," ",a.sizePct,"%"]}),
d("span",{className:"text-up",children:M(a.price,t)})]},a.label))]}),b("div",{className:"flex gap-2 mt-2",children:[d(le,{tone:i?"up":"down",className:"flex-1 h\
-10 text-[13px]",disabled:n||!!s,onClick:o,children:n?"\uC9C4\uC785 \uC644\uB8CC/\uCC98\uB9AC\uB428":s??`\uD0ED\uD558\uC5EC \uBAA8\uC758 ${i?"\uB871":"\uC20F"} \
\uC9C4\uC785`}),d(le,{className:"h-10",onClick:r,children:"\uC218\uC815"})]})]})}function An(e){const[t,n]=K("market"),[s,o]=K(""),[r,i]=K(""),a=e.draft??e.defaultDraft(
"long");Y(()=>{!e.draft&&e.last&&e.setDraft(e.defaultDraft("long"))},[e.last>0]);const l=t==="limit"&&Number(s)>0?Number(s):e.last,f=Number(a.sl);let C=null;try{
C=l>0&&f>0&&f!==l?e.sizeFor(l,f):null}catch{C=null}const c=Math.max(0,Math.round(-Math.log10(e.qtyStep))),h=r?Jt(Number(r)||0,e.qtyStep):Number((C==null?void 0:
C.qty)??0),g=a.side==="long",m=Number(a.tp1),D=Number(a.tp2),p=g?f<l:f>l,B=m>0&&(g?m>l:m<l)&&(a.kind==="breakout"||!a.tp2||(g?D>m:D<m)),k=h*l,S=k>=xe,x=k/e.s.leverage,
v=t==="limit"?Dt:W,T=t==="limit"?0:Ne,A=Math.abs(l-f)*h+l*h*(v+T)+f*h*(W+Ne),$=p&&B&&S&&x+l*h*v<=e.available+1e-9,L=C!=null&&C.belowMin&&!r?`\uB9AC\uC2A4\uD06C ${e.
s.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${xe} USDT / ${e.qtyStep}) \uBBF8\uB9CC`:p?B?S?"\uAC00\uC6A9 \uC99D\uAC70\uAE08 \uBD80\uC871":
`\uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561 ${xe} USDT \uC774\uC0C1 \uD544\uC694`:`TP\uAC00 \uC9C4\uC785\uAC00 ${g?"\uC704":"\uC544\uB798"}(TP2\uB294 TP1 \uB108\uBA38)\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`:
`SL\uC774 \uC9C4\uC785\uAC00 ${g?"\uC544\uB798":"\uC704"}\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`,q=E=>e.setDraft({...a,...E});return b("div",{className:"f\
lex-1 overflow-y-auto px-3 pt-3",children:[b("div",{className:"grid grid-cols-[minmax(0,1fr)_124px] gap-2.5",children:[b("div",{className:"space-y-2.5",children:[
d("div",{className:"grid grid-cols-2 gap-1 bg-panel2 rounded-lg p-1",children:["long","short"].map(E=>d("button",{onClick:()=>{i(""),e.setDraft(a.signal&&a.side===
E?a:e.defaultDraft(E))},className:`h-9 rounded-md font-semibold text-sm ${a.side===E?E==="long"?"bg-up text-white":"bg-down text-white":"text-muted"}`,children:E===
"long"?"\uB871":"\uC20F"},E))}),d(Ve,{items:["market","limit"],value:t,onChange:E=>n(E),fmt:E=>E==="market"?"\uC2DC\uC7A5\uAC00":"\uC9C0\uC815\uAC00"}),t==="lim\
it"&&d(V,{label:"\uC9C0\uC815\uAC00",value:s,onChange:o}),b("div",{children:[d("span",{className:"text-[11px] text-muted",children:"\uB808\uBC84\uB9AC\uC9C0"}),
d(Ve,{items:[3,5,10,20],value:e.s.leverage,onChange:E=>e.set({leverage:E}),fmt:E=>`${E}x`})]}),d(V,{label:"\uB9AC\uC2A4\uD06C (\uC790\uC0B0 \uB300\uBE44)",value:String(
e.s.riskPct),onChange:E=>{i(""),e.set({riskPct:Math.max(.1,Number(E)||1)})},suffix:"%"}),d(V,{label:"\uC190\uC808 SL",value:String(a.sl),onChange:E=>q({sl:E})}),
d(V,{label:a.kind==="breakout"?"TP (\uC21C 1:3, 100%)":"TP1 \uC911\uC559\uC120 (50%)",value:String(a.tp1),onChange:E=>q({tp1:E})}),a.kind==="range"&&d(V,{label:"\
TP2 \uBC18\uB300\uD3B8 \uACBD\uACC4 (50%)",value:String(a.tp2),onChange:E=>q({tp2:E})}),d(V,{label:`\uC218\uB7C9 (\uB9AC\uC2A4\uD06C ${e.s.riskPct}%: ${C?M(C.qty,
c):"\u2014"})`,value:r||(C?Number(C.qty).toFixed(c):""),onChange:i})]}),d("div",{className:"bg-panel rounded-xl border border-line py-2",children:d(Wt,{book:e.book,
dp:e.dp,qdp:c,rows:7})})]}),a.signal&&b("div",{className:"mt-2 text-[11px] text-accent",children:["\uC2E0\uD638 \uC790\uB3D9 \uC785\uB825: ",Me[a.signal.type],"\
 (",Je(a.signal.ts)," \uB9C8\uAC10) \xB7 SL/TP \uC790\uB3D9"]}),b(oe,{className:"p-3 mt-3",children:[d(X,{k:"\uC9C4\uC785 \uAE30\uC900\uAC00",v:M(l,e.dp)}),d(X,
{k:"\uC99D\uAC70\uAE08 / \uBA85\uBAA9",v:h>0?`${M(x)} / ${M(k)} USDT`:"\u2014"}),d(X,{k:"SL \uC2DC \uC21C\uC190\uC2E4 (\uC218\uC218\uB8CC\xB7\uC2AC\uB9AC\uD53C\uC9C0)",
v:h>0&&p?b("span",{className:"text-down",children:["-",M(A)," USDT (",(A/Math.max(e.equity,1e-9)*100).toFixed(2),"%)"]}):"\u2014"}),h>0&&B&&d(X,{k:a.kind==="bre\
akout"||!a.tp2?"TP \uC2DC \uC21C\uC774\uC775":"TP1+TP2 \uC2DC \uC21C\uC774\uC775",v:b("span",{className:"text-up",children:["+",M((a.kind==="breakout"||!a.tp2?Math.
abs(m-l)*h-m*h*W:Math.abs(m-l)*h*.5+Math.abs(D-l)*h*.5-(m+D)*h*.5*W)-l*h*(v+T))," USDT"]})}),d(X,{k:"\uAC00\uC6A9 / \uC790\uC0B0",v:`${M(e.available)} / ${M(e.equity)}\
 USDT`})]}),b("div",{className:"sticky bottom-0 -mx-3 px-3 pt-2 pb-3 mt-1 bg-bg/95 backdrop-blur border-t border-line",children:[!$&&(h>0||(C==null?void 0:C.belowMin))&&
d("div",{className:"text-[11px] text-down mb-1",children:L}),d(le,{tone:a.side==="long"?"up":"down",className:"w-full h-12 text-[16px]",disabled:!$||!(h>0),onClick:()=>{
e.onSubmit(a,t,l,h),i("")},children:a.side==="long"?"\uB871 (\uB9E4\uC218) \uBAA8\uC758 \uC9C4\uC785":"\uC20F (\uB9E4\uB3C4) \uBAA8\uC758 \uC9C4\uC785"})]})]})}
function vn({broker:e}){var c,h,g;const t=e.state,n=on(t.fills,t.positions.map(m=>m.id)),s=t.equityCurve,o=360,r=120,i=s.map(m=>m.equity),a=Math.min(...i,t.bankroll),
l=Math.max(...i,t.bankroll),f=s.map((m,D)=>`${D?"L":"M"}${D/Math.max(1,s.length-1)*o},${r-(m.equity-a)/Math.max(1e-9,l-a)*(r-10)-5}`).join(" "),C=async()=>{var k;
const m=ln(t.fills),D=`dupont-paper-${new Date().toISOString().slice(0,10)}.csv`,p=new File([m],D,{type:"text/csv"});if((k=navigator.canShare)!=null&&k.call(navigator,
{files:[p]}))try{await navigator.share({files:[p],title:D});return}catch{}const B=document.createElement("a");B.href=URL.createObjectURL(p),B.download=D,B.click(),
setTimeout(()=>URL.revokeObjectURL(B.href),2e3)};return b("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[b(oe,{className:"p-3",children:[b("d\
iv",{className:"grid grid-cols-3 text-center",children:[b("div",{children:[d("div",{className:"text-[11px] text-muted",children:"\uAC70\uB798"}),d("div",{className:"\
num font-semibold",children:n.trades})]}),b("div",{children:[d("div",{className:"text-[11px] text-muted",children:"\uC2B9\uB960"}),d("div",{className:"num font-\
semibold",children:n.trades?`${(n.winRate*100).toFixed(0)}%`:"\u2014"})]}),b("div",{children:[d("div",{className:"text-[11px] text-muted",children:"\uC21C\uC190\uC775"}),
d("div",{className:`num font-semibold ${n.net>=0?"text-up":"text-down"}`,children:ee(n.net)})]})]}),b("div",{className:"text-[11px] text-muted text-center mt-1",
children:["\uC218\uC218\uB8CC \uD569\uACC4 ",M(n.fees,3)," USDT (\uC21C\uC190\uC775\uC5D0 \uBC18\uC601)",n.funding!==0?` \xB7 \uD380\uB529 ${ee(-n.funding,3)}`:
"",n.partialNet!==0?` \xB7 \uBCF4\uC720 \uC911 \uBD80\uBD84\uCCAD\uC0B0 ${ee(n.partialNet)} \uD3EC\uD568`:""]}),n.rTrades>0&&b("div",{className:"text-[11px] tex\
t-muted text-center num",children:["\uAE30\uB300\uAC12 ",b("span",{className:n.expectancyR>=0?"text-up":"text-down",children:[ee(n.expectancyR),"R"]})," \xB7 \uD3C9\uADE0 \uC2B9 ",
ee(n.avgWinR),"R / \uD328 ",ee(n.avgLossR),"R (",n.rTrades,"\uAC74)"]})]}),b(oe,{className:"p-3",children:[b("div",{className:"flex justify-between text-[12px] \
text-muted mb-1 num",children:[d("span",{children:"\uC790\uC0B0 \uACE1\uC120"}),b("span",{children:[M(((c=s[0])==null?void 0:c.equity)??t.bankroll)," \u2192 ",d(
"span",{className:(((h=s[s.length-1])==null?void 0:h.equity)??t.bankroll)>=t.bankroll?"text-up":"text-down",children:M(((g=s[s.length-1])==null?void 0:g.equity)??
t.bankroll)})," USDT"]})]}),b("svg",{viewBox:`0 0 ${o} ${r}`,className:"w-full h-[120px]",children:[d("line",{x1:"0",x2:o,y1:r-(t.bankroll-a)/Math.max(1e-9,l-a)*
(r-10)-5,y2:r-(t.bankroll-a)/Math.max(1e-9,l-a)*(r-10)-5,stroke:"#262e38",strokeDasharray:"4 4"}),d("path",{d:f,fill:"none",stroke:"#00c2cb",strokeWidth:"2"})]}),
t.positions.length>0&&d("div",{className:"text-[11px] text-muted mt-1",children:"\uC9C0\uAC11 \uAE30\uC900 \xB7 \uBCF4\uC720 \uD3EC\uC9C0\uC158\uC758 \uC9C4\uC785 \uC218\uC218\uB8CC\uB294 \uC774\uBBF8 \uCC28\uAC10\uB428 (\uBBF8\uC2E4\uD604 \uC190\uC775 \uC81C\uC678)"})]}),
d(le,{className:"w-full",onClick:C,disabled:!t.fills.length,children:"CSV \uB0B4\uBCF4\uB0B4\uAE30"}),[...t.fills].reverse().map(m=>b(oe,{className:"p-3",children:[
b("div",{className:"flex justify-between text-[13px]",children:[b("span",{children:[d("span",{className:m.side==="long"?"text-up":"text-down",children:m.side===
"long"?"\uB871":"\uC20F"})," ",m.symbol," \xB7 ",At(m.setup)]}),b("span",{className:`num font-semibold ${m.netPnl>=0?"text-up":"text-down"}`,children:[ee(m.netPnl),
" USDT"]})]}),b("div",{className:"text-[11px] text-muted num mt-0.5",children:[Je(m.closedAt)," \xB7 ",m.reason," \xB7 ",M(m.qty,se(m.symbol).qdp)," \xB7 ",M(m.
entry,se(m.symbol).dp)," \u2192 ",M(m.exit,se(m.symbol).dp)," \xB7 \uC218\uC218\uB8CC ",M(m.fees,3),m.funding?` \xB7 \uD380\uB529 ${ee(-m.funding,3)}`:"",m.r!==
void 0?` \xB7 ${ee(m.r)}R`:""]})]},m.id)),!t.fills.length&&d("div",{className:"text-muted text-sm text-center py-6",children:"\uAC70\uB798 \uAE30\uB85D \uC5C6\uC74C"})]})}
Nt.createRoot(document.getElementById("root")).render(d(Bn,{}));if("serviceWorker"in navigator){const e="/dupont-mobile/";window.addEventListener("load",()=>navigator.
serviceWorker.register(`${e}sw.js`,{scope:e}).catch(()=>{}))}
