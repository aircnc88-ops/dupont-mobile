import{jsxs as p,jsx as s}from"react/jsx-runtime";import{useRef as N,useEffect as H}from"react";import{createChart as be,LineStyle as j}from"lightweight-charts";
import{f as oe}from"./market-DPdmOwkF.js";const K=e=>String(e).padStart(2,"0"),fe={RANGE:"\uBC18\uC804",FAKE:"\uAC00\uC9DC",BREAKOUT:"\uB3CC\uD30C"};function Ne(e){
const l=N(null),h=N(null),b=N(null),c=N(null),f=N(null),M=N([]),y=N(!1),F=N(void 0),k=N(e);k.current=e;const S=N(null),u=N(""),g=(o=!0)=>{var te,ne;const i=c.current,
r=f.current,d=b.current,a=l.current;if(!i||!r||!d||!a)return;const{box:t,candles:m}=k.current,x=i.timeScale().getVisibleLogicalRange(),V=t&&m.length?`${a.clientWidth}\
x${a.clientHeight}|${x==null?void 0:x.from.toFixed(3)}:${x==null?void 0:x.to.toFixed(3)}|${(te=r.priceToCoordinate(Number(t.top)))==null?void 0:te.toFixed(2)}|${(ne=
r.priceToCoordinate(Number(t.bottom)))==null?void 0:ne.toFixed(2)}`:"none";if(!o&&V===u.current)return;u.current=V;const $=window.devicePixelRatio||1,P=a.clientWidth,
R=a.clientHeight;(d.width!==P*$||d.height!==R*$)&&(d.width=P*$,d.height=R*$,d.style.width=`${P}px`,d.style.height=`${R}px`);const n=d.getContext("2d");n.setTransform(
$,0,0,$,0,0),n.clearRect(0,0,P,R);const{box:L,candles:C,pressures:Z,showHist:ae}=k.current;if(!L||!C.length)return;const T=i.timeScale(),le=r.priceScale().width(),
U=P-le,ce=R-T.height(),ue=Number(L.top),de=Number(L.bottom),me=Number(L.mid),D=r.priceToCoordinate(ue),W=r.priceToCoordinate(de),z=r.priceToCoordinate(me);if(D===
null||W===null||z===null)return;const X=Math.max(0,Math.min(L.startIndex,C.length-1));let G=T.timeToCoordinate(C[X].ts/1e3);G===null&&(G=T.logicalToCoordinate(0)??
0);const Y=T.timeToCoordinate(C[C.length-1].ts/1e3)??U,ee=C.length>1?T.timeToCoordinate(C[C.length-2].ts/1e3):null,_=ee!==null&&Y!==null?Math.max(.5,Y-ee):T.options().
barSpacing,E=Math.min(U,Y+_*3),B=Math.max(0,G-_/2);if(!(E<=B)){if(n.save(),n.beginPath(),n.rect(0,0,U,ce),n.clip(),n.fillStyle="rgba(0,194,203,0.06)",n.fillRect(
B,D,E-B,W-D),n.strokeStyle="rgba(0,194,203,0.75)",n.lineWidth=1.2,n.strokeRect(B,D,E-B,W-D),ae){const O=Math.abs(W-D)/2,A=[];for(let v=X;v<C.length;v++){const w=Z[v];
w&&A.push(w.buy,w.sell)}A.sort((v,w)=>v-w);const Q=A.length?A[Math.min(A.length-1,Math.floor(A.length*.9))]:0,I=Math.max(1,_*.55);if(Q>0)for(let v=X;v<C.length;v++){
const w=Z[v],q=T.timeToCoordinate(C[v].ts/1e3);if(!w||q===null)continue;const re=Math.min(1,w.buy/Q)*O*.92,he=Math.min(1,w.sell/Q)*O*.92;n.fillStyle=w.source===
"trades"?"rgba(46,189,133,0.75)":"rgba(46,189,133,0.4)",n.fillRect(q-I/2,z-re,I,re),n.fillStyle=w.source==="trades"?"rgba(246,70,93,0.75)":"rgba(246,70,93,0.38)",
n.fillRect(q-I/2,z,I,he)}}if(n.setLineDash([6,4]),n.strokeStyle="#f6465d",n.lineWidth=1.4,n.beginPath(),n.moveTo(B,z),n.lineTo(E,z),n.stroke(),n.setLineDash([]),
k.current.editBox)for(const O of[D,W])n.fillStyle="#f0b90b",n.beginPath(),n.arc(B+(E-B)/2,O,9,0,Math.PI*2),n.fill();n.restore()}};H(()=>{if(!h.current)return;const o=be(
h.current,{autoSize:!0,layout:{background:{color:"#0b0e11"},textColor:"#8a94a3",fontSize:11},grid:{vertLines:{color:"#141920"},horzLines:{color:"#141920"}},rightPriceScale:{
borderColor:"#262e38",scaleMargins:{top:.08,bottom:.08}},timeScale:{borderColor:"#262e38",timeVisible:!0,secondsVisible:!1,rightOffset:5,tickMarkFormatter:(d,a)=>{
const t=new Date(d*1e3);return a<=2?`${t.getMonth()+1}/${t.getDate()}`:`${K(t.getHours())}:${K(t.getMinutes())}`}},crosshair:{mode:0},handleScale:{pinch:!0,mouseWheel:!0,
axisPressedMouseMove:!0},handleScroll:{horzTouchDrag:!0,vertTouchDrag:!1,mouseWheel:!0,pressedMouseMove:!0},localization:{timeFormatter:d=>{const a=new Date(d*1e3);
return`${a.getMonth()+1}/${a.getDate()} ${K(a.getHours())}:${K(a.getMinutes())}`}}});f.current=o.addCandlestickSeries({upColor:"#2ebd85",downColor:"#f6465d",borderVisible:!1,
wickUpColor:"#2ebd85",wickDownColor:"#f6465d"}),c.current=o;let i=0;const r=()=>{g(!1),i=requestAnimationFrame(r)};return i=requestAnimationFrame(r),()=>{cancelAnimationFrame(
i),o.remove(),c.current=null,f.current=null,y.current=!1,M.current=[]}},[]),H(()=>{var i;const o=f.current;if(o){if(!e.candles.length){o.setData([]),y.current=!1;
return}o.applyOptions({priceFormat:{type:"price",precision:e.dp,minMove:1/10**e.dp}}),o.setData(e.candles.map(r=>({time:r.ts/1e3,open:r.open,high:r.high,low:r.low,
close:r.close}))),F.current!==e.viewKey&&(y.current=!1),y.current||(F.current=e.viewKey,(i=c.current)==null||i.timeScale().setVisibleLogicalRange({from:e.candles.
length-80,to:e.candles.length+4}),y.current=!0),requestAnimationFrame(()=>g(!0))}},[e.candles,e.dp]),H(()=>{const o=f.current;if(!o)return;for(const t of M.current)
o.removePriceLine(t);M.current=[];const i=(t,m,x,V=j.Solid,$=1)=>M.current.push(o.createPriceLine({price:t,color:m,title:x,lineStyle:V,lineWidth:$,axisLabelVisible:!0}));
e.box&&(i(Number(e.box.top),"#00c2cb","\uC800\uD56D"),i(Number(e.box.bottom),"#00c2cb","\uC9C0\uC9C0"),i(Number(e.box.mid),"#f6465d","50%",j.Dashed));for(const t of e.
positions){i(t.entry,"#eaecef",t.side==="long"?"\uB871 \uC9C4\uC785":"\uC20F \uC9C4\uC785",j.Dotted),i(t.sl,"#f0b90b",t.beMoved?"SL(\uBCF8\uC808)":"SL",j.Dashed);
for(const m of t.targets)m.done||i(m.price,"#2ebd85",m.label.split(" ")[0],j.Dashed)}const r=e.signals.map(t=>({time:t.ts/1e3,position:t.side==="long"?"belowBar":
"aboveBar",color:t.side==="long"?"#2ebd85":"#f6465d",shape:t.side==="long"?"arrowUp":"arrowDown",text:fe[t.type.split("_")[0]]??""})).sort((t,m)=>t.time-m.time),
d=e.candles.length>1?(e.candles[1].ts-e.candles[0].ts)/1e3:900,a={};for(const t of r){const m=t.time;a[t.position]!==void 0&&m-a[t.position]<d*4?t.text="":a[t.position]=
m}o.setMarkers(r),requestAnimationFrame(()=>g(!0))},[e.box,e.positions,e.signals,e.candles.length>1?e.candles[1].ts-e.candles[0].ts:0]),H(()=>{requestAnimationFrame(
()=>g(!0))},[e.pressures,e.showHist,e.editBox]),H(()=>{const o=c.current;o&&o.applyOptions({handleScroll:!e.editBox,handleScale:!e.editBox})},[e.editBox]);const se=o=>{
const i=f.current,r=e.box;if(!e.editBox||!i||!r)return;const d=o.currentTarget.getBoundingClientRect(),a=o.clientY-d.top,t=i.priceToCoordinate(Number(r.top))??-999,
m=i.priceToCoordinate(Number(r.bottom))??-999;S.current=Math.abs(a-t)<Math.abs(a-m)?"top":"bottom",o.currentTarget.setPointerCapture(o.pointerId)},ie=o=>{var x;
const i=f.current,r=e.box;if(!S.current||!i||!r)return;const d=o.currentTarget.getBoundingClientRect(),a=i.coordinateToPrice(o.clientY-d.top);if(a===null)return;
const t=S.current==="top"?Number(a):Number(r.top),m=S.current==="bottom"?Number(a):Number(r.bottom);(x=e.onBoxEdit)==null||x.call(e,t,m)},J=()=>{S.current=null};
return p("div",{ref:l,className:"relative w-full h-full",children:[s("div",{ref:h,className:"absolute inset-0 z-0"}),s("canvas",{ref:b,className:"absolute inset\
-0 pointer-events-none z-10"}),e.editBox&&s("div",{className:"absolute inset-0 touch-none z-20",onPointerDown:se,onPointerMove:ie,onPointerUp:J,onPointerCancel:J})]})}
const pe=(e,l)=>oe(e,e>=1e3?0:e>=100?Math.min(l,1):e>=10?Math.min(l,2):Math.min(l,4));function ve({book:e,dp:l,qdp:h=3,rows:b=6}){if(!e)return s("div",{className:"\
text-muted text-xs p-3",children:"\uD638\uAC00 \uC5F0\uACB0 \uC911\u2026"});const c=e.asks.slice(0,b).reverse(),f=e.bids.slice(0,b),M=e.bids.reduce((u,g)=>u+g[1],
0),y=e.asks.reduce((u,g)=>u+g[1],0),F=y+M>0?(M-y)/(y+M):0,k=Math.max(...c.map(u=>u[1]),...f.map(u=>u[1]),1e-9),S=(u,g)=>p("div",{className:"relative flex justif\
y-between text-[12px] num h-5 items-center px-2",children:[s("div",{className:`absolute inset-y-0 right-0 ${g==="a"?"bg-down/15":"bg-up/15"}`,style:{width:`${u[1]/
k*100}%`}}),s("span",{className:`relative ${g==="a"?"text-down":"text-up"}`,children:oe(u[0],l)}),s("span",{className:"relative text-muted",children:pe(u[1],h)})]},
`${g}${u[0]}`);return p("div",{children:[p("div",{className:"px-2 pb-1 text-[11px] text-muted flex justify-between",children:[s("span",{children:"\uAC00\uACA9"}),
s("span",{children:"\uC218\uB7C9"})]}),c.map(u=>S(u,"a")),s("div",{className:"h-px bg-line my-1"}),f.map(u=>S(u,"b")),p("div",{className:"px-2 pt-2",children:[p(
"div",{className:"flex justify-between text-[11px] num",children:[p("span",{className:"text-up",children:["\uB9E4\uC218 ",Math.round((F+1)/2*100),"%"]}),s("span",
{className:"text-muted",children:"\uD638\uAC00 \uBD88\uADE0\uD615 (15)"}),p("span",{className:"text-down",children:["\uB9E4\uB3C4 ",Math.round((1-F)/2*100),"%"]})]}),
s("div",{className:"h-2 rounded-full bg-down/70 overflow-hidden mt-1",children:s("div",{className:"h-full bg-up",style:{width:`${(F+1)/2*100}%`}})})]})]})}function ye({
children:e,className:l=""}){return s("div",{className:`bg-panel rounded-xl border border-line ${l}`,children:e})}function Me({k:e,v:l,className:h=""}){return p(
"div",{className:`flex justify-between items-center text-[13px] py-1 ${h}`,children:[s("span",{className:"text-muted",children:e}),s("span",{className:"num",children:l})]})}
function Se({children:e,onClick:l,tone:h="neutral",className:b="",disabled:c}){const f={up:"bg-up text-white",down:"bg-down text-white",accent:"bg-accent text-b\
g",neutral:"bg-panel2 text-txt",warn:"bg-warn text-bg"}[h];return s("button",{disabled:c,onClick:l,className:`h-11 px-4 rounded-lg font-semibold active:opacity-\
80 disabled:bg-panel2 disabled:text-muted disabled:opacity-60 ${f} ${b}`,children:e})}function $e({label:e,value:l,onChange:h,step:b="any",suffix:c}){return p("\
label",{className:"block",children:[s("span",{className:"text-[11px] text-muted",children:e}),p("div",{className:"flex items-center bg-panel2 rounded-lg border \
border-line h-11 px-3",children:[s("input",{inputMode:"decimal",type:"number",step:b,value:l,onChange:f=>h(f.target.value),className:"bg-transparent flex-1 min-\
w-0 outline-none num text-[15px]"}),c&&s("span",{className:"text-muted text-xs ml-1",children:c})]})]})}function Be({on:e,onChange:l,label:h,hint:b}){return p("\
button",{onClick:()=>l(!e),className:"w-full flex items-center justify-between py-3 text-left",children:[p("span",{children:[s("span",{className:"block text-[14\
px]",children:h}),b&&s("span",{className:"block text-[11px] text-muted",children:b})]}),s("span",{className:`w-12 h-7 rounded-full relative transition ${e?"bg-a\
ccent":"bg-panel2 border border-line"}`,children:s("span",{className:`absolute top-1 w-5 h-5 rounded-full bg-white transition ${e?"left-6":"left-1"}`})})]})}function Te({
items:e,value:l,onChange:h,fmt:b}){return s("div",{className:"flex gap-2 flex-wrap",children:e.map(c=>s("button",{onClick:()=>h(c),className:`px-3 h-8 rounded-f\
ull text-sm ${l===c?"bg-accent text-bg font-semibold":"bg-panel2 text-muted"}`,children:b?b(c):String(c)},String(c)))})}export{Se as B,Te as C,$e as N,ve as O,Me as R,Be as T,Ne as a,ye as b};
