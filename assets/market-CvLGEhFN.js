var W=Object.defineProperty;var X=(e,t,s)=>t in e?W(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var k=(e,t,s)=>X(e,typeof t!="symbol"?t+"":t,s);import{useState as R,useRef as B,useEffect as E,useMemo as D}from"react";import{p as Y,d as $,g as O,a as j}from"./strategy-Cu9CvPGE.js";import{S as Q,T as Z}from"./paper-DnVmL6eb.js";const gt=(e,t=2)=>{const s=typeof e=="string"?Number(e):e;return s==null||!Number.isFinite(s)?"\u2014":s.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t})},
St=(e,t=2)=>Number.isFinite(e)?`${e>=0?"+":""}${(e*100).toFixed(t)}%`:"\u2014",yt=(e,t=2)=>{if(!Number.isFinite(e))return"\u2014";const s=Number(e.toFixed(t));return s===
0?0 .toFixed(t):`${s>0?"+":""}${s.toFixed(t)}`},tt=e=>new Date(e).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:!1}),bt=e=>{const t=new Date(
e);return`${t.getMonth()+1}/${t.getDate()} ${tt(e)}`},C="https://api.bitget.com",q="/dupont-mobile/bgapi";let H=!1;async function L(e){const t=H?[q,C]:[C,q];let s;
for(const n of t)try{const i=await fetch(n+e,{cache:"no-store"});if(!i.ok)throw new Error(`HTTP ${i.status}`);const o=await i.json();if(o.code!=="00000")throw new Error(
o.msg||"bitget error");return H=n===q,o.data}catch(i){s=i}throw s}const _={"1m":{api:"1m",sec:60},"5m":{api:"5m",sec:300},"15m":{api:"15m",sec:900},"1h":{api:"1\
H",sec:3600}};async function G(e,t,s=300,n){const i=_[t]??_["15m"],o=n?`&startTime=${Math.floor(n.startTime)}&endTime=${Math.floor(n.endTime)}`:"",c=await L(`/a\
pi/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${e}&granularity=${i.api}&limit=${s}${o}`),u=new Map;for(const a of c){const h={ts:Number(a[0]),open:+a[1],
high:+a[2],low:+a[3],close:+a[4],volume:+a[5]};Number.isFinite(h.ts)&&u.set(h.ts,h)}return[...u.values()].sort((a,h)=>a.ts-h.ts)}async function wt(e,t,s,n=10){const o=new Map;
for(let c=Math.floor(t/6e4)*6e4,u=0;c<=s&&u<n;c+=6e7,u++){const a=await G(e,"1m",1e3,{startTime:c,endTime:Math.min(s,c+6e7-1)});for(const h of a)o.set(h.ts,h)}return[
...o.values()].sort((c,u)=>c.ts-u.ts)}async function Tt(e,t=20){return(await L(`/api/v2/mix/market/history-fund-rate?symbol=${e}&productType=usdt-futures&pageSi\
ze=${t}`)??[]).map(n=>({ts:Number(n.fundingTime),rate:Number(n.fundingRate)})).filter(n=>Number.isFinite(n.ts)&&Number.isFinite(n.rate))}async function et(e){const t=await L(
`/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${e}`),s=Array.isArray(t)?t[0]:t;return s?{last:+s.lastPr,mark:+(s.markPrice??s.lastPr),change24h:+(s.
change24h??0),funding:+(s.fundingRate??0),bid:+s.bidPr,ask:+s.askPr}:null}const st="wss://ws.bitget.com/v2/ws/public";function nt(e){const s=(Array.isArray(e==null?
void 0:e.data)?e.data:[]).map(n=>({ts:+n.ts,price:+n.price,qty:+n.size,side:n.side==="sell"?"sell":"buy",...n.tradeId!==void 0?{id:String(n.tradeId)}:{}}));return s.
reverse(),{trades:s,snapshot:(e==null?void 0:e.action)==="snapshot"}}class ot{constructor(t=5e3){k(this,"seen",new Set);this.max=t}filter(t){const s=[];for(const n of t){
if(n.id===void 0){s.push(n);continue}this.seen.has(n.id)||(this.seen.add(n.id),s.push(n))}if(this.seen.size>this.max){let n=this.seen.size-this.max;for(const i of this.
seen){if(n--<=0)break;this.seen.delete(i)}}return s}}class it{constructor(t,s){k(this,"ws",null);k(this,"closed",!1);k(this,"attempt",0);k(this,"ping",null);k(this,
"lastPong",0);k(this,"connectedAt",0);k(this,"lastMsgAt",0);this.symbol=t,this.h=s}start(){this.closed=!1,this.open()}stop(){var t,s,n;this.closed=!0,this.ping&&
clearInterval(this.ping),(t=this.ws)==null||t.close(),this.ws=null,(n=(s=this.h).status)==null||n.call(s,"closed")}open(){var s,n;if(this.closed)return;(n=(s=this.
h).status)==null||n.call(s,this.attempt?"reconnecting":"connecting");let t;try{t=new WebSocket(st)}catch{return this.retry()}this.ws=t,t.onopen=()=>{var o,c;this.
attempt=0,this.connectedAt=Date.now();const i=["ticker","books15","trade"].map(u=>({instType:"USDT-FUTURES",channel:u,instId:this.symbol}));t.send(JSON.stringify(
{op:"subscribe",args:i})),this.lastPong=Date.now(),this.ping=setInterval(()=>{if(t.readyState===1){if(Date.now()-this.lastPong>2*25e3+5e3){t.close();return}t.send(
"ping")}},25e3),(c=(o=this.h).status)==null||c.call(o,"live")},t.onmessage=i=>{var h,P,x,f,F,S,b;this.lastMsgAt=Date.now();const o=typeof i.data=="string"?i.data:
"";if(o==="pong"){this.lastPong=Date.now();return}if(!o)return;let c;try{c=JSON.parse(o)}catch{return}const u=(h=c==null?void 0:c.arg)==null?void 0:h.channel,a=c==
null?void 0:c.data;if(!(!u||!Array.isArray(a)||!a.length)){if(u==="ticker"){const p=a[0];(x=(P=this.h).ticker)==null||x.call(P,{last:+p.lastPr,mark:+(p.markPrice??
p.lastPr),funding:+(p.fundingRate??0),change24h:+(p.change24h??0),bid:+p.bidPr,ask:+p.askPr})}else if(u==="books15"){const p=a[0];(F=(f=this.h).book)==null||F.call(
f,{bids:(p.bids??[]).map(w=>[+w[0],+w[1]]),asks:(p.asks??[]).map(w=>[+w[0],+w[1]]),ts:+p.ts})}else if(u==="trade"){const p=nt(c);(b=(S=this.h).trades)==null||b.
call(S,p.trades,p.snapshot)}}},t.onclose=()=>{this.ping&&clearInterval(this.ping),this.closed||this.retry()},t.onerror=()=>t.close()}retry(){var s,n;(n=(s=this.
h).status)==null||n.call(s,"reconnecting");const t=Math.min(3e4,1e3*2**this.attempt++);setTimeout(()=>this.open(),t)}}const rt=[{symbol:"BTCUSDT",qtyStep:1e-4,dp:1},
{symbol:"ETHUSDT",qtyStep:.01,dp:2},{symbol:"SOLUSDT",qtyStep:.1,dp:3},{symbol:"XRPUSDT",qtyStep:1,dp:4},{symbol:"DOGEUSDT",qtyStep:1,dp:5},{symbol:"BNBUSDT",qtyStep:.01,
dp:2},{symbol:"ADAUSDT",qtyStep:1,dp:4},{symbol:"LINKUSDT",qtyStep:1,dp:3},{symbol:"AVAXUSDT",qtyStep:.1,dp:3},{symbol:"SUIUSDT",qtyStep:.1,dp:4}],kt=5,K=e=>Math.
max(0,Math.round(-Math.log10(e))),vt=e=>{const t=rt.find(s=>s.symbol===e)??{symbol:e,qtyStep:.001,dp:2};return{...t,qdp:K(t.qtyStep)}},Mt=(e,t)=>{const s=K(t);return Number(
(Math.floor(e/t+1e-9)*t).toFixed(s))},Pt=["1m","5m","15m","1h"],z={"1m":6e4,"5m":3e5,"15m":9e5,"1h":36e5},M=6e4;class J{constructor(t=1500){k(this,"b",new Map);
k(this,"coverFrom",1/0);k(this,"gaps",[]);k(this,"downSince",null);this.maxBuckets=t}reset(){this.b.clear(),this.coverFrom=1/0,this.gaps=[],this.downSince=null}connected(t){
const s=Math.ceil(t/M)*M;if(!Number.isFinite(this.coverFrom))this.coverFrom=s;else if(this.downSince!==null){const n=Math.floor(this.downSince/M)*M;s>n&&this.gaps.
push([n,s])}this.downSince=null}get awaitingConnect(){return!Number.isFinite(this.coverFrom)||this.downSince!==null}disconnected(t){this.downSince===null&&Number.
isFinite(this.coverFrom)&&(this.downSince=t)}add(t){for(const s of t){const n=Math.floor(s.ts/M)*M,i=this.b.get(n)??{buy:0,sell:0,n:0};s.side==="buy"?i.buy+=s.qty:
i.sell+=s.qty,i.n++,this.b.set(n,i)}if(this.b.size>this.maxBuckets){const s=[...this.b.keys()].sort((i,o)=>i-o);for(const i of s.slice(0,this.b.size-this.maxBuckets))
this.b.delete(i);const n=s[s.length-this.b.size];this.gaps=this.gaps.filter(([,i])=>i>n),this.coverFrom=Math.max(this.coverFrom,n)}}covers(t,s){if(t<this.coverFrom)
return!1;const n=t+s;return this.downSince!==null&&n>Math.floor(this.downSince/M)*M?!1:!this.gaps.some(([i,o])=>t<o&&n>i)}pressure(t,s,n=1){if(!this.covers(t,s))
return null;let i=0,o=0,c=0;for(let a=Math.floor(t/M)*M;a<t+s;a+=M){const h=this.b.get(a);h&&(i+=h.buy,o+=h.sell,c+=h.n)}if(c<n)return null;const u=i+o;return{buy:i,
sell:o,net:i-o,ratio:u>0?i/u:.5,source:"trades"}}}function xt(e,t){const[s,n]=R([]),[i,o]=R(null),[c,u]=R(null),[a,h]=R("connecting"),[P,x]=R(""),[f,F]=R(0),S=B(
new J),b=B(0),p=B(t);p.current=t,E(()=>{S.current=new J,u(null);let g=!1;const v=new ot,m=new it(e,{status:r=>{h(r),(r==="reconnecting"||r==="closed")&&S.current.
disconnected((m.lastMsgAt||Date.now())+b.current)},ticker:r=>o(T=>({...T??r,...r})),book:r=>u(r),trades:(r,T)=>{const l=v.filter(r);if(!r.length)return;const y=r[r.
length-1];if(b.current=y.ts-Date.now(),T){S.current.connected(y.ts);return}if(S.current.awaitingConnect&&S.current.connected(r[0].ts),!l.length)return;S.current.
add(l),g=!0;const N=l[l.length-1];w(N.price,l.reduce((A,V)=>A+V.qty,0),N.ts)}});m.start();const d=setInterval(()=>{g&&(g=!1,F(r=>r+1))},1e3);return()=>{m.stop(),
clearInterval(d)}},[e]);function w(g,v,m){n(d=>{if(!d.length)return d;const r=z[p.current]??9e5,T=Math.floor(m/r)*r,l=d[d.length-1];if(T>l.ts)return[...d.slice(
-499),{ts:T,open:l.close,high:Math.max(l.close,g),low:Math.min(l.close,g),close:g,volume:v}];if(T<l.ts)return d;const y={...l,close:g,high:Math.max(l.high,g),low:Math.
min(l.low,g),volume:l.volume+v};return[...d.slice(0,-1),y]})}E(()=>{let g=!0;n([]);const v=d=>G(e,t).then(r=>{!g||!r.length||(x(""),n(T=>{if(d||!T.length)return r;
const l=r[r.length-1],y=T[T.length-1];if(y.ts>l.ts)return[...r,y];if(y.ts===l.ts){const N={...l,high:Math.max(l.high,y.high),low:Math.min(l.low,y.low),close:y.close,
volume:Math.max(l.volume,y.volume)};return[...r.slice(0,-1),N]}return r}))}).catch(r=>g&&x(String((r==null?void 0:r.message)??r)));v(!0);const m=setInterval(()=>v(
!1),2e4);return()=>{g=!1,clearInterval(m)}},[e,t]),E(()=>{let g=!0;const v=()=>et(e).then(d=>{!g||!d||(o(d),a!=="live"&&w(d.last,0,Date.now()+b.current))}).catch(
()=>{});v();const m=setInterval(v,a==="live"?1e4:2500);return()=>{g=!1,clearInterval(m)}},[e,a]);const I=z[t]??9e5;return{candles:s,ticker:i,book:c,status:a,err:P,
tape:S,tapeVer:f,intervalMs:I,serverNow:()=>Date.now()+b.current}}function at(e,t,s){var h,P;const n=Math.max(e.top,e.bottom),i=Math.min(e.top,e.bottom);let o=t.
findIndex(x=>x.ts>=e.startTs);o<0&&(o=Math.max(0,t.length-60));const c=Math.max(0,t.length-1),u=t.length>1?j(t.slice(-80),14):NaN,a=Number.isFinite(u)?u:0;return{
top:String(n),bottom:String(i),mid:String((n+i)/2),height:String(n-i),startTime:((h=t[o])==null?void 0:h.ts)??e.startTs,endTime:((P=t[c])==null?void 0:P.ts)??e.
startTs,startIndex:o,endIndex:c,touchesTop:2,touchesBottom:2,topPivots:[],bottomPivots:[],atr:a,heightAtr:a>0?(n-i)/a:0,insideShare:1,tolerancePct:s,isRange:!0}}
const ct=150;function lt(e,t,s){return s??(e.length>11?$(e.slice(0,-1),t):null)}const ut=1500,ht=(e,t,s)=>s<e+t+ut;function Ft(e,t,s,n,i,o,c,u){const a=D(()=>({
lookback:o.lookback,tolerancePct:o.tolerancePct,pivotLeft:o.pivotLeft,pivotRight:o.pivotRight,minTouches:o.minTouches,minHeightPct:o.minHeightPct}),[o.lookback,
o.tolerancePct,o.pivotLeft,o.pivotRight,o.minTouches,o.minHeightPct]),h=D(()=>({requireRange:o.requireRange,tickSize:(10**-u).toFixed(u),feeRate:Z,slippageBps:Q}),
[o.requireRange,u]),P=e[e.length-1],x=!!P&&ht(P.ts,t,i()),f=D(()=>x?e.slice(0,-1):e,[e,x]),F=D(()=>e.map(m=>s.current.pressure(m.ts,t)??Y(m)),[e,n,t]),S=f.length?
`${f[f.length-1].ts}:${f.length}`:"",b=D(()=>c?at(c,f,o.tolerancePct):null,[c,S,o.tolerancePct]),p=D(()=>b??(f.length>10?$(f,a):null),[S,a,b]),w=D(()=>lt(f,a,b),
[S,a,b]),I=D(()=>{const m=[],d=f.length;let r=new Set;if(d<30)return{out:m,prevAtLast:r};const T=F.slice(0,d);for(let l=Math.max(25,d-ct);l<d-1;l++){const y=b??
$(f.slice(0,l),a);if(!y){r=new Set;continue}const N=O(f.slice(0,l+1),T.slice(0,l+1),y,h);m.push(...N.filter(A=>!r.has(A.type))),r=new Set(N.map(A=>A.type))}return{
out:m,prevAtLast:r}},[S,a,h,b]),U=D(()=>!w||f.length<3?[]:O(f,F.slice(0,f.length),w,h).filter(m=>!I.prevAtLast.has(m.type)),[S,w,h,F,I]),g=D(()=>[...I.out,...U],
[I,U]),v=F.filter(m=>m.source==="trades").length;return{closed:f,pressures:F,box:p,signalBox:w,live:U,history:g,tapeCandles:v}}function Dt(e,t){try{const s=localStorage.
getItem(e);return s?{...t,...JSON.parse(s)}:t}catch{return t}}function Nt(e){try{const t=localStorage.getItem(e);return t?JSON.parse(t):null}catch{return null}}
function It(e,t){try{t==null?localStorage.removeItem(e):localStorage.setItem(e,JSON.stringify(t))}catch{}}const Rt={symbol:"BTCUSDT",tf:"15m",riskPct:1,leverage:10,
autoPaper:!1,moveSlToBe:!0,maxAdds:2,addSizePct:50,lookback:80,tolerancePct:.25,pivotLeft:3,pivotRight:3,minTouches:2,minHeightPct:.6,requireRange:!0,notify:!1,
showHist:!0};export{Rt as D,kt as M,rt as S,Pt as T,Nt as a,Ft as b,et as c,It as d,yt as e,gt as f,wt as g,Mt as h,Tt as i,Dt as l,bt as m,St as p,vt as s,xt as u};
