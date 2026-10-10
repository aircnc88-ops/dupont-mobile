import{jsxs as p,jsx as n}from"react/jsx-runtime";import{useRef as w,useEffect as H}from"react";import{createChart as be,LineStyle as j}from"lightweight-charts";
import{f as oe}from"./market-CHwasNOt.js";const K=e=>String(e).padStart(2,"0"),fe={RANGE:"\uBC18\uC804",FAKE:"\uAC00\uC9DC",BREAKOUT:"\uB3CC\uD30C"};function we(e){
const l=w(null),m=w(null),h=w(null),c=w(null),b=w(null),M=w([]),y=w(!1),k=w(void 0),F=w(e);F.current=e;const S=w(null),u=w(""),x=(s=!0)=>{var te,ne;const i=c.current,
o=b.current,d=h.current,a=l.current;if(!i||!o||!d||!a)return;const{box:t,candles:f}=F.current,g=i.timeScale().getVisibleLogicalRange(),V=t&&f.length?`${a.clientWidth}\
x${a.clientHeight}|${g==null?void 0:g.from.toFixed(3)}:${g==null?void 0:g.to.toFixed(3)}|${(te=o.priceToCoordinate(Number(t.top)))==null?void 0:te.toFixed(2)}|${(ne=
o.priceToCoordinate(Number(t.bottom)))==null?void 0:ne.toFixed(2)}`:"none";if(!s&&V===u.current)return;u.current=V;const T=window.devicePixelRatio||1,P=a.clientWidth,
R=a.clientHeight;(d.width!==P*T||d.height!==R*T)&&(d.width=P*T,d.height=R*T,d.style.width=`${P}px`,d.style.height=`${R}px`);const r=d.getContext("2d");r.setTransform(
T,0,0,T,0,0),r.clearRect(0,0,P,R);const{box:L,candles:C,pressures:Z,showHist:ae}=F.current;if(!L||!C.length)return;const B=i.timeScale(),le=o.priceScale().width(),
U=P-le,ce=R-B.height(),ue=Number(L.top),de=Number(L.bottom),me=Number(L.mid),D=o.priceToCoordinate(ue),z=o.priceToCoordinate(de),W=o.priceToCoordinate(me);if(D===
null||z===null||W===null)return;const X=Math.max(0,Math.min(L.startIndex,C.length-1));let G=B.timeToCoordinate(C[X].ts/1e3);G===null&&(G=B.logicalToCoordinate(0)??
0);const Y=B.timeToCoordinate(C[C.length-1].ts/1e3)??U,ee=C.length>1?B.timeToCoordinate(C[C.length-2].ts/1e3):null,_=ee!==null&&Y!==null?Math.max(.5,Y-ee):B.options().
barSpacing,E=Math.min(U,Y+_*3),$=Math.max(0,G-_/2);if(!(E<=$)){if(r.save(),r.beginPath(),r.rect(0,0,U,ce),r.clip(),r.fillStyle="rgba(0,194,203,0.06)",r.fillRect(
$,D,E-$,z-D),r.strokeStyle="rgba(0,194,203,0.75)",r.lineWidth=1.2,r.strokeRect($,D,E-$,z-D),ae){const O=Math.abs(z-D)/2,A=[];for(let v=X;v<C.length;v++){const N=Z[v];
N&&A.push(N.buy,N.sell)}A.sort((v,N)=>v-N);const Q=A.length?A[Math.min(A.length-1,Math.floor(A.length*.9))]:0,I=Math.max(1,_*.55);if(Q>0)for(let v=X;v<C.length;v++){
const N=Z[v],q=B.timeToCoordinate(C[v].ts/1e3);if(!N||q===null)continue;const re=Math.min(1,N.buy/Q)*O*.92,he=Math.min(1,N.sell/Q)*O*.92;r.fillStyle=N.source===
"trades"?"rgba(46,189,133,0.75)":"rgba(46,189,133,0.4)",r.fillRect(q-I/2,W-re,I,re),r.fillStyle=N.source==="trades"?"rgba(246,70,93,0.75)":"rgba(246,70,93,0.38)",
r.fillRect(q-I/2,W,I,he)}}if(r.setLineDash([6,4]),r.strokeStyle="#f6465d",r.lineWidth=1.4,r.beginPath(),r.moveTo($,W),r.lineTo(E,W),r.stroke(),r.setLineDash([]),
F.current.editBox)for(const O of[D,z])r.fillStyle="#f0b90b",r.beginPath(),r.arc($+(E-$)/2,O,9,0,Math.PI*2),r.fill();r.restore()}};H(()=>{if(!m.current)return;const s=be(
m.current,{autoSize:!0,layout:{background:{color:"#0b0e11"},textColor:"#8a94a3",fontSize:11},grid:{vertLines:{color:"#141920"},horzLines:{color:"#141920"}},rightPriceScale:{
borderColor:"#262e38",scaleMargins:{top:.08,bottom:.08}},timeScale:{borderColor:"#262e38",timeVisible:!0,secondsVisible:!1,rightOffset:5,tickMarkFormatter:(d,a)=>{
const t=new Date(d*1e3);return a<=2?`${t.getMonth()+1}/${t.getDate()}`:`${K(t.getHours())}:${K(t.getMinutes())}`}},crosshair:{mode:0},handleScale:{pinch:!0,mouseWheel:!0,
axisPressedMouseMove:!0},handleScroll:{horzTouchDrag:!0,vertTouchDrag:!1,mouseWheel:!0,pressedMouseMove:!0},localization:{timeFormatter:d=>{const a=new Date(d*1e3);
return`${a.getMonth()+1}/${a.getDate()} ${K(a.getHours())}:${K(a.getMinutes())}`}}});b.current=s.addCandlestickSeries({upColor:"#2ebd85",downColor:"#f6465d",borderVisible:!1,
wickUpColor:"#2ebd85",wickDownColor:"#f6465d"}),c.current=s;let i=0;const o=()=>{x(!1),i=requestAnimationFrame(o)};return i=requestAnimationFrame(o),()=>{cancelAnimationFrame(
i),s.remove(),c.current=null,b.current=null,y.current=!1,M.current=[]}},[]),H(()=>{var i;const s=b.current;if(s){if(!e.candles.length){s.setData([]),y.current=!1;
return}s.applyOptions({priceFormat:{type:"price",precision:e.dp,minMove:1/10**e.dp}}),s.setData(e.candles.map(o=>({time:o.ts/1e3,open:o.open,high:o.high,low:o.low,
close:o.close}))),k.current!==e.viewKey&&(y.current=!1),y.current||(k.current=e.viewKey,(i=c.current)==null||i.timeScale().setVisibleLogicalRange({from:e.candles.
length-80,to:e.candles.length+4}),y.current=!0),requestAnimationFrame(()=>x(!0))}},[e.candles,e.dp]),H(()=>{const s=b.current;if(!s)return;for(const t of M.current)
s.removePriceLine(t);M.current=[];const i=(t,f,g,V=j.Solid,T=1)=>M.current.push(s.createPriceLine({price:t,color:f,title:g,lineStyle:V,lineWidth:T,axisLabelVisible:!0}));
e.box&&(i(Number(e.box.top),"#00c2cb","\uC800\uD56D"),i(Number(e.box.bottom),"#00c2cb","\uC9C0\uC9C0"),i(Number(e.box.mid),"#f6465d","50%",j.Dashed));for(const t of e.
positions){i(t.entry,"#eaecef",t.side==="long"?"\uB871 \uC9C4\uC785":"\uC20F \uC9C4\uC785",j.Dotted),i(t.sl,"#f0b90b",t.beMoved?"SL(\uBCF8\uC808)":"SL",j.Dashed);
for(const f of t.targets)f.done||i(f.price,"#2ebd85",f.label.split(" ")[0],j.Dashed)}const o=e.signals.map(t=>({time:t.ts/1e3,position:t.side==="long"?"belowBar":
"aboveBar",color:t.side==="long"?"#2ebd85":"#f6465d",shape:t.side==="long"?"arrowUp":"arrowDown",text:fe[t.type.split("_")[0]]??""})).sort((t,f)=>t.time-f.time),
d=e.candles.length>1?(e.candles[1].ts-e.candles[0].ts)/1e3:900,a={};for(const t of o){const f=t.time;a[t.position]!==void 0&&f-a[t.position]<d*4?t.text="":a[t.position]=
f}s.setMarkers(o),requestAnimationFrame(()=>x(!0))},[e.box,e.positions,e.signals,e.candles.length>1?e.candles[1].ts-e.candles[0].ts:0]),H(()=>{requestAnimationFrame(
()=>x(!0))},[e.pressures,e.showHist,e.editBox]),H(()=>{const s=c.current;s&&s.applyOptions({handleScroll:!e.editBox,handleScale:!e.editBox})},[e.editBox]);const se=s=>{
const i=b.current,o=e.box;if(!e.editBox||!i||!o)return;const d=s.currentTarget.getBoundingClientRect(),a=s.clientY-d.top,t=i.priceToCoordinate(Number(o.top))??-999,
f=i.priceToCoordinate(Number(o.bottom))??-999;S.current=Math.abs(a-t)<Math.abs(a-f)?"top":"bottom",s.currentTarget.setPointerCapture(s.pointerId)},ie=s=>{var g;
const i=b.current,o=e.box;if(!S.current||!i||!o)return;const d=s.currentTarget.getBoundingClientRect(),a=i.coordinateToPrice(s.clientY-d.top);if(a===null)return;
const t=S.current==="top"?Number(a):Number(o.top),f=S.current==="bottom"?Number(a):Number(o.bottom);(g=e.onBoxEdit)==null||g.call(e,t,f)},J=()=>{S.current=null};
return p("div",{ref:l,className:"relative w-full h-full",children:[n("div",{ref:m,className:"absolute inset-0 z-0"}),n("canvas",{ref:h,className:"absolute inset\
-0 pointer-events-none z-10"}),e.editBox&&n("div",{className:"absolute inset-0 touch-none z-20",onPointerDown:se,onPointerMove:ie,onPointerUp:J,onPointerCancel:J})]})}
const pe=(e,l)=>oe(e,e>=1e3?0:e>=100?Math.min(l,1):e>=10?Math.min(l,2):Math.min(l,4));function ve({book:e,dp:l,qdp:m=3,rows:h=6}){if(!e)return n("div",{className:"\
text-muted text-xs p-3",children:"\uD638\uAC00 \uC5F0\uACB0 \uC911\u2026"});const c=e.asks.slice(0,h).reverse(),b=e.bids.slice(0,h),M=e.bids.reduce((u,x)=>u+x[1],
0),y=e.asks.reduce((u,x)=>u+x[1],0),k=y+M>0?(M-y)/(y+M):0,F=Math.max(...c.map(u=>u[1]),...b.map(u=>u[1]),1e-9),S=(u,x)=>p("div",{className:"relative flex justif\
y-between text-[12px] num h-5 items-center px-2",children:[n("div",{className:`absolute inset-y-0 right-0 ${x==="a"?"bg-down/15":"bg-up/15"}`,style:{width:`${u[1]/
F*100}%`}}),n("span",{className:`relative ${x==="a"?"text-down":"text-up"}`,children:oe(u[0],l)}),n("span",{className:"relative text-muted",children:pe(u[1],m)})]},
`${x}${u[0]}`);return p("div",{children:[p("div",{className:"px-2 pb-1 text-[11px] text-muted flex justify-between",children:[n("span",{children:"\uAC00\uACA9"}),
n("span",{children:"\uC218\uB7C9"})]}),c.map(u=>S(u,"a")),n("div",{className:"h-px bg-line my-1"}),b.map(u=>S(u,"b")),p("div",{className:"px-2 pt-2",children:[p(
"div",{className:"flex justify-between text-[11px] num",children:[p("span",{className:"text-up",children:["\uB9E4\uC218 ",Math.round((k+1)/2*100),"%"]}),n("span",
{className:"text-muted",children:"\uD638\uAC00 \uBD88\uADE0\uD615 (15)"}),p("span",{className:"text-down",children:["\uB9E4\uB3C4 ",Math.round((1-k)/2*100),"%"]})]}),
n("div",{className:"h-2 rounded-full bg-down/70 overflow-hidden mt-1",children:n("div",{className:"h-full bg-up",style:{width:`${(k+1)/2*100}%`}})})]})]})}function ye({
children:e,className:l=""}){return n("div",{className:`bg-panel rounded-xl border border-line ${l}`,children:e})}function Me({k:e,v:l,className:m=""}){return p(
"div",{className:`flex justify-between items-center text-[13px] py-1 ${m}`,children:[n("span",{className:"text-muted",children:e}),n("span",{className:"num",children:l})]})}
function Se({children:e,onClick:l,tone:m="neutral",className:h="",disabled:c}){const b={up:"bg-up text-white",down:"bg-down text-white",accent:"bg-accent text-b\
g",neutral:"bg-panel2 text-txt",warn:"bg-warn text-bg"}[m];return n("button",{disabled:c,onClick:l,className:`h-11 px-4 rounded-lg font-semibold active:opacity-\
80 disabled:bg-panel2 disabled:text-muted disabled:opacity-60 ${b} ${h}`,children:e})}function Te({label:e,value:l,onChange:m,step:h="any",suffix:c}){return p("\
label",{className:"block",children:[n("span",{className:"text-[11px] text-muted",children:e}),p("div",{className:"flex items-center bg-panel2 rounded-lg border \
border-line h-11 px-3",children:[n("input",{inputMode:"decimal",type:"number",step:h,value:l,onChange:b=>m(b.target.value),className:"bg-transparent flex-1 min-\
w-0 outline-none num text-[15px]"}),c&&n("span",{className:"text-muted text-xs ml-1",children:c})]})]})}function $e({label:e,value:l,onChange:m,type:h="text",placeholder:c}){
return p("label",{className:"block",children:[n("span",{className:"text-[11px] text-muted",children:e}),n("div",{className:"flex items-center bg-panel2 rounded-\
lg border border-line h-11 px-3",children:n("input",{type:h,value:l,placeholder:c,autoComplete:"off",autoCapitalize:"off",spellCheck:!1,onChange:b=>m(b.target.value),
className:"bg-transparent flex-1 min-w-0 outline-none text-[13px]"})})]})}function Be({on:e,onChange:l,label:m,hint:h}){return p("button",{onClick:()=>l(!e),className:"\
w-full flex items-center justify-between py-3 text-left",children:[p("span",{children:[n("span",{className:"block text-[14px]",children:m}),h&&n("span",{className:"\
block text-[11px] text-muted",children:h})]}),n("span",{className:`w-12 h-7 rounded-full relative transition ${e?"bg-accent":"bg-panel2 border border-line"}`,children:n(
"span",{className:`absolute top-1 w-5 h-5 rounded-full bg-white transition ${e?"left-6":"left-1"}`})})]})}function De({items:e,value:l,onChange:m,fmt:h}){return n(
"div",{className:"flex gap-2 flex-wrap",children:e.map(c=>n("button",{onClick:()=>m(c),className:`px-3 h-8 rounded-full text-sm ${l===c?"bg-accent text-bg font-\
semibold":"bg-panel2 text-muted"}`,children:h?h(c):String(c)},String(c)))})}export{Se as B,De as C,Te as N,ve as O,Me as R,Be as T,we as a,ye as b,$e as c};
