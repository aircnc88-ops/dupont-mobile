var tt=Object.defineProperty;var et=(s,t,e)=>t in s?tt(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var b=(s,t,e)=>et(s,typeof t!="symbol"?t+"":t,e);import{useState as B,useRef as E,useEffect as $,useMemo as P}from"react";import{p as st,d as Y,g as G,a as nt}from"./strategy-Cu9CvPGE.js";import{S as rt,T as ot}from"./paper-DgRiG6e_.js";const _t=(s,t=2)=>{const e=typeof s=="string"?Number(s):s;return e==null||!Number.isFinite(e)?"\u2014":e.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t})},
Bt=(s,t=2)=>Number.isFinite(s)?`${s>=0?"+":""}${(s*100).toFixed(t)}%`:"\u2014",qt=(s,t=2)=>{if(!Number.isFinite(s))return"\u2014";const e=Number(s.toFixed(t));return e===
0?0 .toFixed(t):`${e>0?"+":""}${e.toFixed(t)}`},it=s=>new Date(s).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:!1}),$t=s=>{const t=new Date(
s);return`${t.getMonth()+1}/${t.getDate()} ${it(s)}`},J="https://api.bitget.com",H="/dupont-mobile/bgapi";let K=!1;async function O(s){const t=K?[H,J]:[J,H];let e;
for(const n of t)try{const o=await fetch(n+s,{cache:"no-store"});if(!o.ok)throw new Error(`HTTP ${o.status}`);const r=await o.json();if(r.code!=="00000")throw new Error(
r.msg||"bitget error");return K=n===H,r.data}catch(o){e=o}throw e}const W={"1m":{api:"1m",sec:60},"5m":{api:"5m",sec:300},"15m":{api:"15m",sec:900},"1h":{api:"1\
H",sec:3600}};async function j(s,t,e=300,n){const o=W[t]??W["15m"],r=n?`&startTime=${Math.floor(n.startTime)}&endTime=${Math.floor(n.endTime)}`:"",i=await O(`/a\
pi/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${s}&granularity=${o.api}&limit=${e}${r}`),c=new Map;for(const a of i){const l={ts:Number(a[0]),open:+a[1],
high:+a[2],low:+a[3],close:+a[4],volume:+a[5]};Number.isFinite(l.ts)&&c.set(l.ts,l)}return[...c.values()].sort((a,l)=>a.ts-l.ts)}const at=30*864e5-36e5;async function Ot(s,t,e){
const o=Math.floor(Math.max(t,e-at)/6e4)*6e4,r=new Map;for(let i=o;i<=e;i+=6e7){const c=await j(s,"1m",1e3,{startTime:i,endTime:Math.min(e,i+6e7-1)});for(const a of c)
r.set(a.ts,a);i+6e7<=e&&await new Promise(a=>setTimeout(a,120))}return{bars:[...r.values()].sort((i,c)=>i.ts-c.ts),clampedFrom:o}}const ct=(s,t,e)=>s-(t+e)/2;async function lt(s=4e3,t=Date.
now){const e=t(),n=await Promise.race([O("/api/v2/public/time"),new Promise(i=>setTimeout(()=>i(null),s))]).catch(()=>null),o=t(),r=Number(n==null?void 0:n.serverTime);
return!Number.isFinite(r)||o-e>s?null:ct(r,e,o)}async function Ct(s,t=100){return(await O(`/api/v2/mix/market/history-fund-rate?symbol=${s}&productType=usdt-fut\
ures&pageSize=${t}`)??[]).map(n=>({ts:Number(n.fundingTime),rate:Number(n.fundingRate)})).filter(n=>Number.isFinite(n.ts)&&Number.isFinite(n.rate))}async function ut(s){
const t=await O(`/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${s}`),e=Array.isArray(t)?t[0]:t;return e?{last:+e.lastPr,mark:+(e.markPrice??e.lastPr),
change24h:+(e.change24h??0),funding:+(e.fundingRate??0),bid:+e.bidPr,ask:+e.askPr}:null}const ht="wss://ws.bitget.com/v2/ws/public";function ft(s){const e=(Array.
isArray(s==null?void 0:s.data)?s.data:[]).map(n=>({ts:+n.ts,price:+n.price,qty:+n.size,side:n.side==="sell"?"sell":"buy",...n.tradeId!==void 0?{id:String(n.tradeId)}:
{}}));return e.reverse(),{trades:e,snapshot:(s==null?void 0:s.action)==="snapshot"}}class dt{constructor(t=5e3){b(this,"seen",new Set);this.max=t}filter(t){const e=[];
for(const n of t){if(n.id===void 0){e.push(n);continue}this.seen.has(n.id)||(this.seen.add(n.id),e.push(n))}if(this.seen.size>this.max){let n=this.seen.size-this.
max;for(const o of this.seen){if(n--<=0)break;this.seen.delete(o)}}return e}}class mt{constructor(t,e){b(this,"ws",null);b(this,"closed",!1);b(this,"attempt",0);
b(this,"ping",null);b(this,"lastPong",0);b(this,"connectedAt",0);b(this,"lastMsgAt",0);this.symbol=t,this.h=e}start(){this.closed=!1,this.open()}stop(){var t,e,
n;this.closed=!0,this.ping&&clearInterval(this.ping),(t=this.ws)==null||t.close(),this.ws=null,(n=(e=this.h).status)==null||n.call(e,"closed")}open(){var e,n;if(this.
closed)return;(n=(e=this.h).status)==null||n.call(e,this.attempt?"reconnecting":"connecting");let t;try{t=new WebSocket(ht)}catch{return this.retry()}this.ws=t,
t.onopen=()=>{var r,i;this.attempt=0,this.connectedAt=Date.now();const o=["ticker","books15","trade"].map(c=>({instType:"USDT-FUTURES",channel:c,instId:this.symbol}));
t.send(JSON.stringify({op:"subscribe",args:o})),this.lastPong=Date.now(),this.ping=setInterval(()=>{if(t.readyState===1){if(Date.now()-this.lastPong>2*25e3+5e3){
t.close();return}t.send("ping")}},25e3),(i=(r=this.h).status)==null||i.call(r,"live")},t.onmessage=o=>{var l,v,x,f,R,p,g;this.lastMsgAt=Date.now();const r=typeof o.
data=="string"?o.data:"";if(r==="pong"){this.lastPong=Date.now();return}if(!r)return;let i;try{i=JSON.parse(r)}catch{return}const c=(l=i==null?void 0:i.arg)==null?
void 0:l.channel,a=i==null?void 0:i.data;if(!(!c||!Array.isArray(a)||!a.length)){if(c==="ticker"){const h=a[0];(x=(v=this.h).ticker)==null||x.call(v,{last:+h.lastPr,
mark:+(h.markPrice??h.lastPr),funding:+(h.fundingRate??0),change24h:+(h.change24h??0),bid:+h.bidPr,ask:+h.askPr})}else if(c==="books15"){const h=a[0];(R=(f=this.
h).book)==null||R.call(f,{bids:(h.bids??[]).map(w=>[+w[0],+w[1]]),asks:(h.asks??[]).map(w=>[+w[0],+w[1]]),ts:+h.ts})}else if(c==="trade"){const h=ft(i);(g=(p=this.
h).trades)==null||g.call(p,h.trades,h.snapshot)}}},t.onclose=()=>{this.ping&&clearInterval(this.ping),this.closed||this.retry()},t.onerror=()=>t.close()}retry(){
var e,n;(n=(e=this.h).status)==null||n.call(e,"reconnecting");const t=Math.min(3e4,1e3*2**this.attempt++);setTimeout(()=>this.open(),t)}}const pt=[{symbol:"BTCU\
SDT",qtyStep:1e-4,dp:1},{symbol:"ETHUSDT",qtyStep:.01,dp:2},{symbol:"SOLUSDT",qtyStep:.1,dp:3},{symbol:"XRPUSDT",qtyStep:1,dp:4},{symbol:"DOGEUSDT",qtyStep:1,dp:5},
{symbol:"BNBUSDT",qtyStep:.01,dp:2},{symbol:"ADAUSDT",qtyStep:1,dp:4},{symbol:"LINKUSDT",qtyStep:1,dp:3},{symbol:"AVAXUSDT",qtyStep:.1,dp:3},{symbol:"SUIUSDT",qtyStep:.1,
dp:4}],Ht=5,Q=s=>Math.max(0,Math.round(-Math.log10(s))),Yt=s=>{const t=pt.find(e=>e.symbol===s)??{symbol:s,qtyStep:.001,dp:2};return{...t,qdp:Q(t.qtyStep)}},zt=(s,t)=>{
const e=Q(t);return Number((Math.floor(s/t+1e-9)*t).toFixed(e))},Gt=["1m","5m","15m","1h"],X={"1m":6e4,"5m":3e5,"15m":9e5,"1h":36e5},k=6e4;class V{constructor(t=1500){
b(this,"b",new Map);b(this,"coverFrom",1/0);b(this,"gaps",[]);b(this,"downSince",null);this.maxBuckets=t}reset(){this.b.clear(),this.coverFrom=1/0,this.gaps=[],
this.downSince=null}connected(t){const e=Math.ceil(t/k)*k;if(!Number.isFinite(this.coverFrom))this.coverFrom=e;else if(this.downSince!==null){const n=Math.floor(
this.downSince/k)*k;e>n&&this.gaps.push([n,e])}this.downSince=null}get awaitingConnect(){return!Number.isFinite(this.coverFrom)||this.downSince!==null}disconnected(t){
this.downSince===null&&Number.isFinite(this.coverFrom)&&(this.downSince=t)}add(t){for(const e of t){const n=Math.floor(e.ts/k)*k,o=this.b.get(n)??{buy:0,sell:0,
n:0};e.side==="buy"?o.buy+=e.qty:o.sell+=e.qty,o.n++,this.b.set(n,o)}if(this.b.size>this.maxBuckets){const e=[...this.b.keys()].sort((o,r)=>o-r);for(const o of e.
slice(0,this.b.size-this.maxBuckets))this.b.delete(o);const n=e[e.length-this.b.size];this.gaps=this.gaps.filter(([,o])=>o>n),this.coverFrom=Math.max(this.coverFrom,
n)}}covers(t,e){if(t<this.coverFrom)return!1;const n=t+e;return this.downSince!==null&&n>Math.floor(this.downSince/k)*k?!1:!this.gaps.some(([o,r])=>t<r&&n>o)}pressure(t,e,n=1){
if(!this.covers(t,e))return null;let o=0,r=0,i=0;for(let a=Math.floor(t/k)*k;a<t+e;a+=k){const l=this.b.get(a);l&&(o+=l.buy,r+=l.sell,i+=l.n)}if(i<n)return null;
const c=o+r;return{buy:o,sell:r,net:o-r,ratio:c>0?o/c:.5,source:"trades"}}}function gt(s,t,e){return s.length?Math.floor(t/e)*e>s[s.length-1].ts+e:!1}const St=3e4;
function yt(s,t,e,n,o=St){if(!s.length)return!1;if(gt(s,t,e))return!0;const r=Math.floor(t/e)*e;return r>s[s.length-1].ts&&n<r-o}function bt(s,t,e,n,o){if(!s.length)
return s;const r=Math.floor(n/o)*o,i=s[s.length-1];if(r>i.ts+o)return s;if(r>i.ts)return[...s.slice(-499),{ts:r,open:i.close,high:Math.max(i.close,t),low:Math.min(
i.close,t),close:t,volume:e}];if(r<i.ts)return s;const c={...i,close:t,high:Math.max(i.high,t),low:Math.min(i.low,t),volume:i.volume+e};return[...s.slice(0,-1),
c]}function Jt(s,t){const[e,n]=B([]),[o,r]=B(null),[i,c]=B(null),[a,l]=B("connecting"),[v,x]=B(""),[f,R]=B(0),p=E(new V),g=E(0),h=E(!1),w=E(t);w.current=t;const N=E(
[]);N.current=e;const _=E(()=>{}),U=E(0);$(()=>{p.current=new V,c(null);let u=!1;const M=new dt,y=new mt(s,{status:d=>{l(d),(d==="reconnecting"||d==="closed")&&
p.current.disconnected((y.lastMsgAt||Date.now())+g.current)},ticker:d=>r(m=>({...m??d,...d})),book:d=>c(d),trades:(d,m)=>{const A=M.filter(d);if(!d.length)return;
const D=d[d.length-1];if(m||(g.current=D.ts-Date.now(),h.current=!0),m){p.current.connected(D.ts);return}if(p.current.awaitingConnect&&p.current.connected(d[0].
ts),!A.length)return;p.current.add(A),u=!0;const F=A[A.length-1];q(F.price,A.reduce((C,Z)=>C+Z.qty,0),F.ts)}});y.start();const T=setInterval(()=>{u&&(u=!1,R(d=>d+
1))},1e3);return()=>{y.stop(),clearInterval(T)}},[s]);function q(u,M,y){const T=X[w.current]??9e5;if(yt(N.current,y,T,U.current)){_.current();return}N.current.length&&
(U.current=Math.max(U.current,y)),n(d=>bt(d,u,M,y,T))}$(()=>{let u=!0;n([]);const M=d=>j(s,t).then(m=>{!u||!m.length||(x(""),U.current=Math.max(U.current,Date.now()+
g.current),n(A=>{if(d||!A.length)return m;const D=m[m.length-1],F=A[A.length-1];if(F.ts>D.ts)return[...m,F];if(F.ts===D.ts){const C={...D,high:Math.max(D.high,F.
high),low:Math.min(D.low,F.low),close:F.close,volume:Math.max(D.volume,F.volume)};return[...m.slice(0,-1),C]}return m}))}).catch(m=>u&&x(String((m==null?void 0:
m.message)??m)));M(!0);let y=0;_.current=()=>{Date.now()-y>3e3&&(y=Date.now(),M(!1))};const T=setInterval(()=>M(!1),2e4);return()=>{u=!1,clearInterval(T)}},[s,t]),
$(()=>{let u=!0;const M=()=>ut(s).then(T=>{!u||!T||(r(T),a!=="live"&&q(T.last,0,Date.now()+g.current))}).catch(()=>{});M();const y=setInterval(M,a==="live"?1e4:
2500);return()=>{u=!1,clearInterval(y)}},[s,a]);const S=E(null),I=()=>S.current??(S.current=lt().then(u=>{u!==null&&(g.current=u,h.current=!0)}).finally(()=>{S.
current=null}));$(()=>{I();const u=setInterval(()=>{h.current||I()},15e3);return()=>clearInterval(u)},[]);const L=X[t]??9e5;return{candles:e,ticker:o,book:i,status:a,
err:v,tape:p,tapeVer:f,intervalMs:L,serverNow:()=>Date.now()+g.current,syncClock:I,clockSynced:()=>h.current}}function Tt(s,t,e){var l,v;const n=Math.max(s.top,
s.bottom),o=Math.min(s.top,s.bottom);let r=t.findIndex(x=>x.ts>=s.startTs);r<0&&(r=Math.max(0,t.length-60));const i=Math.max(0,t.length-1),c=t.length>1?nt(t.slice(
-80),14):NaN,a=Number.isFinite(c)?c:0;return{top:String(n),bottom:String(o),mid:String((n+o)/2),height:String(n-o),startTime:((l=t[r])==null?void 0:l.ts)??s.startTs,
endTime:((v=t[i])==null?void 0:v.ts)??s.startTs,startIndex:r,endIndex:i,touchesTop:2,touchesBottom:2,topPivots:[],bottomPivots:[],atr:a,heightAtr:a>0?(n-o)/a:0,
insideShare:1,tolerancePct:e,isRange:!0}}const wt=150;function Mt(s,t,e){return e??(s.length>11?Y(s.slice(0,-1),t):null)}const kt=1500,vt=(s,t,e)=>e<s+t+kt;function Kt(s,t,e,n,o,r,i,c){
const a=P(()=>({lookback:r.lookback,tolerancePct:r.tolerancePct,pivotLeft:r.pivotLeft,pivotRight:r.pivotRight,minTouches:r.minTouches,minHeightPct:r.minHeightPct}),
[r.lookback,r.tolerancePct,r.pivotLeft,r.pivotRight,r.minTouches,r.minHeightPct]),l=P(()=>({requireRange:r.requireRange,tickSize:(10**-c).toFixed(c),feeRate:ot,
slippageBps:rt}),[r.requireRange,c]),v=s[s.length-1],x=!!v&&vt(v.ts,t,o()),f=P(()=>x?s.slice(0,-1):s,[s,x]),R=P(()=>s.map(S=>e.current.pressure(S.ts,t)??st(S)),
[s,n,t]),p=f.length?`${f[f.length-1].ts}:${f.length}`:"",g=P(()=>i?Tt(i,f,r.tolerancePct):null,[i,p,r.tolerancePct]),h=P(()=>g??(f.length>10?Y(f,a):null),[p,a,g]),
w=P(()=>Mt(f,a,g),[p,a,g]),N=P(()=>{const S=[],I=f.length;let L=new Set;if(I<30)return{out:S,prevAtLast:L};const z=R.slice(0,I);for(let u=Math.max(25,I-wt);u<I-
1;u++){const M=g??Y(f.slice(0,u),a);if(!M){L=new Set;continue}const y=G(f.slice(0,u+1),z.slice(0,u+1),M,l);S.push(...y.filter(T=>!L.has(T.type))),L=new Set(y.map(
T=>T.type))}return{out:S,prevAtLast:L}},[p,a,l,g]),_=P(()=>!w||f.length<3?[]:G(f,R.slice(0,f.length),w,l).filter(S=>!N.prevAtLast.has(S.type)),[p,w,l,R,N]),U=P(
()=>[...N.out,..._],[N,_]),q=R.filter(S=>S.source==="trades").length;return{closed:f,pressures:R,box:h,signalBox:w,live:_,history:U,tapeCandles:q}}function Wt(s,t){
try{const e=localStorage.getItem(s);return e?{...t,...JSON.parse(e)}:t}catch{return t}}function Xt(s){try{const t=localStorage.getItem(s);return t?JSON.parse(t):
null}catch{return null}}function Vt(s,t){try{t==null?localStorage.removeItem(s):localStorage.setItem(s,JSON.stringify(t))}catch{}}const jt={symbol:"BTCUSDT",tf:"\
15m",riskPct:1,leverage:10,autoPaper:!1,moveSlToBe:!0,maxAdds:2,addSizePct:50,lookback:80,tolerancePct:.25,pivotLeft:3,pivotRight:3,minTouches:2,minHeightPct:.6,
requireRange:!0,notify:!1,showHist:!0},xt=3e4,Rt=15e3,Ft=3,Pt=12e4,At=s=>[...new Set([...s.positions.map(t=>t.symbol),...s.pending.map(t=>t.symbol)])],Dt=(s,t)=>s.
positions.some(e=>e.symbol===t)||s.pending.some(e=>e.symbol===t);function Nt(s,t){var o;const e=Math.min(...s.positions.filter(r=>r.symbol===t).map(r=>r.openedAt),
...s.pending.filter(r=>r.symbol===t).map(r=>r.createdAt)),n=(o=s.lastTickTs)==null?void 0:o[t];return n===void 0?e:Number.isFinite(e)?Math.max(n,e):n}class Qt{constructor(t=xt,e=Rt,n=Ft){
b(this,"replaying",new Set);b(this,"fails",{});this.gapMs=t,this.retryMs=e,this.maxFails=n}needsReplay(t,e,n){const o=Nt(t,e);return Dt(t,e)&&Number.isFinite(o)&&
n-o>this.gapMs}tick(t,e,n){return this.replaying.has(e)?"replaying":this.needsReplay(t,e,n)?"gap":"live"}begin(t,e){const n=r=>{const i=this.fails[r];if(!i)return!0;
const c=Math.min(this.retryMs*2**Math.max(0,i.n-1),Pt);return e-i.at>c||i.at>e},o=At(t).filter(r=>!this.replaying.has(r)&&this.needsReplay(t,r,e)&&n(r));return o.
forEach(r=>this.replaying.add(r)),o}succeeded(t){delete this.fails[t]}failed(t,e,n=!0){var r;const o=(r=this.fails)[t]??(r[t]={n:0,at:0});return n&&(o.n+=1),o.at=
e,n&&o.n===this.maxFails}release(t){this.replaying.delete(t)}}export{jt as D,Ht as M,Qt as R,pt as S,Gt as T,Xt as a,Kt as b,ut as c,Vt as d,qt as e,_t as f,Ot as g,zt as h,Ct as i,Wt as l,$t as m,Bt as p,Nt as r,Yt as s,Jt as u};
