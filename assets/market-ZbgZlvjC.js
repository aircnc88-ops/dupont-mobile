var tt=Object.defineProperty;var et=(s,t,e)=>t in s?tt(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var y=(s,t,e)=>et(s,typeof t!="symbol"?t+"":t,e);import{useState as q,useRef as I,useEffect as $,useMemo as R}from"react";import{p as st,d as z,g as Y,a as nt}from"./strategy-Cu9CvPGE.js";import{S as ot,T as rt}from"./paper-DgRiG6e_.js";const Lt=(s,t=2)=>{const e=typeof s=="string"?Number(s):s;return e==null||!Number.isFinite(e)?"\u2014":e.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t})},
Bt=(s,t=2)=>Number.isFinite(s)?`${s>=0?"+":""}${(s*100).toFixed(t)}%`:"\u2014",qt=(s,t=2)=>{if(!Number.isFinite(s))return"\u2014";const e=Number(s.toFixed(t));return e===
0?0 .toFixed(t):`${e>0?"+":""}${e.toFixed(t)}`},it=s=>new Date(s).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:!1}),_t=s=>{const t=new Date(
s);return`${t.getMonth()+1}/${t.getDate()} ${it(s)}`},J="https://api.bitget.com",H="/dupont-mobile/bgapi";let K=!1;async function O(s){const t=K?[H,J]:[J,H];let e;
for(const n of t)try{const r=await fetch(n+s,{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);const o=await r.json();if(o.code!=="00000")throw new Error(
o.msg||"bitget error");return K=n===H,o.data}catch(r){e=r}throw e}const W={"1m":{api:"1m",sec:60},"5m":{api:"5m",sec:300},"15m":{api:"15m",sec:900},"1h":{api:"1\
H",sec:3600}};async function j(s,t,e=300,n){const r=W[t]??W["15m"],o=n?`&startTime=${Math.floor(n.startTime)}&endTime=${Math.floor(n.endTime)}`:"",i=await O(`/a\
pi/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${s}&granularity=${r.api}&limit=${e}${o}`),c=new Map;for(const a of i){const l={ts:Number(a[0]),open:+a[1],
high:+a[2],low:+a[3],close:+a[4],volume:+a[5]};Number.isFinite(l.ts)&&c.set(l.ts,l)}return[...c.values()].sort((a,l)=>a.ts-l.ts)}const at=30*864e5-36e5;async function $t(s,t,e){
const r=Math.floor(Math.max(t,e-at)/6e4)*6e4,o=new Map;for(let i=r;i<=e;i+=6e7){const c=await j(s,"1m",1e3,{startTime:i,endTime:Math.min(e,i+6e7-1)});for(const a of c)
o.set(a.ts,a);i+6e7<=e&&await new Promise(a=>setTimeout(a,120))}return{bars:[...o.values()].sort((i,c)=>i.ts-c.ts),clampedFrom:r}}const ct=(s,t,e)=>s-(t+e)/2;async function lt(s=4e3,t=Date.
now){const e=t(),n=await Promise.race([O("/api/v2/public/time"),new Promise(i=>setTimeout(()=>i(null),s))]).catch(()=>null),r=t(),o=Number(n==null?void 0:n.serverTime);
return!Number.isFinite(o)||r-e>s?null:ct(o,e,r)}async function Ot(s,t=100){return(await O(`/api/v2/mix/market/history-fund-rate?symbol=${s}&productType=usdt-fut\
ures&pageSize=${t}`)??[]).map(n=>({ts:Number(n.fundingTime),rate:Number(n.fundingRate)})).filter(n=>Number.isFinite(n.ts)&&Number.isFinite(n.rate))}async function ut(s){
const t=await O(`/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${s}`),e=Array.isArray(t)?t[0]:t;return e?{last:+e.lastPr,mark:+(e.markPrice??e.lastPr),
change24h:+(e.change24h??0),funding:+(e.fundingRate??0),bid:+e.bidPr,ask:+e.askPr}:null}const ht="wss://ws.bitget.com/v2/ws/public";function ft(s){const e=(Array.
isArray(s==null?void 0:s.data)?s.data:[]).map(n=>({ts:+n.ts,price:+n.price,qty:+n.size,side:n.side==="sell"?"sell":"buy",...n.tradeId!==void 0?{id:String(n.tradeId)}:
{}}));return e.reverse(),{trades:e,snapshot:(s==null?void 0:s.action)==="snapshot"}}class dt{constructor(t=5e3){y(this,"seen",new Set);this.max=t}filter(t){const e=[];
for(const n of t){if(n.id===void 0){e.push(n);continue}this.seen.has(n.id)||(this.seen.add(n.id),e.push(n))}if(this.seen.size>this.max){let n=this.seen.size-this.
max;for(const r of this.seen){if(n--<=0)break;this.seen.delete(r)}}return e}}class mt{constructor(t,e){y(this,"ws",null);y(this,"closed",!1);y(this,"attempt",0);
y(this,"ping",null);y(this,"lastPong",0);y(this,"connectedAt",0);y(this,"lastMsgAt",0);this.symbol=t,this.h=e}start(){this.closed=!1,this.open()}stop(){var t,e,
n;this.closed=!0,this.ping&&clearInterval(this.ping),(t=this.ws)==null||t.close(),this.ws=null,(n=(e=this.h).status)==null||n.call(e,"closed")}open(){var e,n;if(this.
closed)return;(n=(e=this.h).status)==null||n.call(e,this.attempt?"reconnecting":"connecting");let t;try{t=new WebSocket(ht)}catch{return this.retry()}this.ws=t,
t.onopen=()=>{var o,i;this.attempt=0,this.connectedAt=Date.now();const r=["ticker","books15","trade"].map(c=>({instType:"USDT-FUTURES",channel:c,instId:this.symbol}));
t.send(JSON.stringify({op:"subscribe",args:r})),this.lastPong=Date.now(),this.ping=setInterval(()=>{if(t.readyState===1){if(Date.now()-this.lastPong>2*25e3+5e3){
t.close();return}t.send("ping")}},25e3),(i=(o=this.h).status)==null||i.call(o,"live")},t.onmessage=r=>{var l,x,F,h,v,p,g;this.lastMsgAt=Date.now();const o=typeof r.
data=="string"?r.data:"";if(o==="pong"){this.lastPong=Date.now();return}if(!o)return;let i;try{i=JSON.parse(o)}catch{return}const c=(l=i==null?void 0:i.arg)==null?
void 0:l.channel,a=i==null?void 0:i.data;if(!(!c||!Array.isArray(a)||!a.length)){if(c==="ticker"){const f=a[0];(F=(x=this.h).ticker)==null||F.call(x,{last:+f.lastPr,
mark:+(f.markPrice??f.lastPr),funding:+(f.fundingRate??0),change24h:+(f.change24h??0),bid:+f.bidPr,ask:+f.askPr})}else if(c==="books15"){const f=a[0];(v=(h=this.
h).book)==null||v.call(h,{bids:(f.bids??[]).map(w=>[+w[0],+w[1]]),asks:(f.asks??[]).map(w=>[+w[0],+w[1]]),ts:+f.ts})}else if(c==="trade"){const f=ft(i);(g=(p=this.
h).trades)==null||g.call(p,f.trades,f.snapshot)}}},t.onclose=()=>{this.ping&&clearInterval(this.ping),this.closed||this.retry()},t.onerror=()=>t.close()}retry(){
var e,n;(n=(e=this.h).status)==null||n.call(e,"reconnecting");const t=Math.min(3e4,1e3*2**this.attempt++);setTimeout(()=>this.open(),t)}}const pt=[{symbol:"BTCU\
SDT",qtyStep:1e-4,dp:1},{symbol:"ETHUSDT",qtyStep:.01,dp:2},{symbol:"SOLUSDT",qtyStep:.1,dp:3},{symbol:"XRPUSDT",qtyStep:1,dp:4},{symbol:"DOGEUSDT",qtyStep:1,dp:5},
{symbol:"BNBUSDT",qtyStep:.01,dp:2},{symbol:"ADAUSDT",qtyStep:1,dp:4},{symbol:"LINKUSDT",qtyStep:1,dp:3},{symbol:"AVAXUSDT",qtyStep:.1,dp:3},{symbol:"SUIUSDT",qtyStep:.1,
dp:4}],Ct=5,Q=s=>Math.max(0,Math.round(-Math.log10(s))),Ht=s=>{const t=pt.find(e=>e.symbol===s)??{symbol:s,qtyStep:.001,dp:2};return{...t,qdp:Q(t.qtyStep)}},zt=(s,t)=>{
const e=Q(t);return Number((Math.floor(s/t+1e-9)*t).toFixed(e))},Gt=["1m","5m","15m","1h"],V={"1m":6e4,"5m":3e5,"15m":9e5,"1h":36e5},k=6e4;class X{constructor(t=1500){
y(this,"b",new Map);y(this,"coverFrom",1/0);y(this,"gaps",[]);y(this,"downSince",null);this.maxBuckets=t}reset(){this.b.clear(),this.coverFrom=1/0,this.gaps=[],
this.downSince=null}connected(t){const e=Math.ceil(t/k)*k;if(!Number.isFinite(this.coverFrom))this.coverFrom=e;else if(this.downSince!==null){const n=Math.floor(
this.downSince/k)*k;e>n&&this.gaps.push([n,e])}this.downSince=null}get awaitingConnect(){return!Number.isFinite(this.coverFrom)||this.downSince!==null}disconnected(t){
this.downSince===null&&Number.isFinite(this.coverFrom)&&(this.downSince=t)}add(t){for(const e of t){const n=Math.floor(e.ts/k)*k,r=this.b.get(n)??{buy:0,sell:0,
n:0};e.side==="buy"?r.buy+=e.qty:r.sell+=e.qty,r.n++,this.b.set(n,r)}if(this.b.size>this.maxBuckets){const e=[...this.b.keys()].sort((r,o)=>r-o);for(const r of e.
slice(0,this.b.size-this.maxBuckets))this.b.delete(r);const n=e[e.length-this.b.size];this.gaps=this.gaps.filter(([,r])=>r>n),this.coverFrom=Math.max(this.coverFrom,
n)}}covers(t,e){if(t<this.coverFrom)return!1;const n=t+e;return this.downSince!==null&&n>Math.floor(this.downSince/k)*k?!1:!this.gaps.some(([r,o])=>t<o&&n>r)}pressure(t,e,n=1){
if(!this.covers(t,e))return null;let r=0,o=0,i=0;for(let a=Math.floor(t/k)*k;a<t+e;a+=k){const l=this.b.get(a);l&&(r+=l.buy,o+=l.sell,i+=l.n)}if(i<n)return null;
const c=r+o;return{buy:r,sell:o,net:r-o,ratio:c>0?r/c:.5,source:"trades"}}}function gt(s,t,e){return s.length?Math.floor(t/e)*e>s[s.length-1].ts+e:!1}const St=3e4;
function bt(s,t,e,n,r=St){if(!s.length)return!1;if(gt(s,t,e))return!0;const o=Math.floor(t/e)*e;return o>s[s.length-1].ts&&n<o-r}function yt(s,t,e,n,r){if(!s.length)
return s;const o=Math.floor(n/r)*r,i=s[s.length-1];if(o>i.ts+r)return s;if(o>i.ts)return[...s.slice(-499),{ts:o,open:i.close,high:Math.max(i.close,t),low:Math.min(
i.close,t),close:t,volume:e}];if(o<i.ts)return s;const c={...i,close:t,high:Math.max(i.high,t),low:Math.min(i.low,t),volume:i.volume+e};return[...s.slice(0,-1),
c]}function Yt(s,t){const[e,n]=q([]),[r,o]=q(null),[i,c]=q(null),[a,l]=q("connecting"),[x,F]=q(""),[h,v]=q(0),p=I(new X),g=I(0),f=I(!1),w=I(t);w.current=t;const N=I(
[]);N.current=e;const B=I(()=>{}),E=I(0);$(()=>{p.current=new X,c(null);let u=!1;const M=new dt,b=new mt(s,{status:d=>{l(d),(d==="reconnecting"||d==="closed")&&
p.current.disconnected((b.lastMsgAt||Date.now())+g.current)},ticker:d=>o(m=>({...m??d,...d})),book:d=>c(d),trades:(d,m)=>{const A=M.filter(d);if(!d.length)return;
const D=d[d.length-1];if(m||(g.current=D.ts-Date.now(),f.current=!0),m){p.current.connected(D.ts);return}if(p.current.awaitingConnect&&p.current.connected(d[0].
ts),!A.length)return;p.current.add(A),u=!0;const P=A[A.length-1];_(P.price,A.reduce((C,Z)=>C+Z.qty,0),P.ts)}});b.start();const T=setInterval(()=>{u&&(u=!1,v(d=>d+
1))},1e3);return()=>{b.stop(),clearInterval(T)}},[s]);function _(u,M,b){const T=V[w.current]??9e5;if(bt(N.current,b,T,E.current)){B.current();return}N.current.length&&
(E.current=Math.max(E.current,b)),n(d=>yt(d,u,M,b,T))}$(()=>{let u=!0;n([]);const M=d=>j(s,t).then(m=>{!u||!m.length||(F(""),E.current=Math.max(E.current,Date.now()+
g.current),n(A=>{if(d||!A.length)return m;const D=m[m.length-1],P=A[A.length-1];if(P.ts>D.ts)return[...m,P];if(P.ts===D.ts){const C={...D,high:Math.max(D.high,P.
high),low:Math.min(D.low,P.low),close:P.close,volume:Math.max(D.volume,P.volume)};return[...m.slice(0,-1),C]}return m}))}).catch(m=>u&&F(String((m==null?void 0:
m.message)??m)));M(!0);let b=0;B.current=()=>{Date.now()-b>3e3&&(b=Date.now(),M(!1))};const T=setInterval(()=>M(!1),2e4);return()=>{u=!1,clearInterval(T)}},[s,t]),
$(()=>{let u=!0;const M=()=>ut(s).then(T=>{!u||!T||(o(T),a!=="live"&&_(T.last,0,Date.now()+g.current))}).catch(()=>{});M();const b=setInterval(M,a==="live"?1e4:
2500);return()=>{u=!1,clearInterval(b)}},[s,a]);const S=I(null),U=()=>S.current??(S.current=lt().then(u=>{u!==null&&(g.current=u,f.current=!0)}).finally(()=>{S.
current=null}));$(()=>{U()},[]);const L=V[t]??9e5;return{candles:e,ticker:r,book:i,status:a,err:x,tape:p,tapeVer:h,intervalMs:L,serverNow:()=>Date.now()+g.current,
syncClock:U,clockSynced:()=>f.current}}function Tt(s,t,e){var l,x;const n=Math.max(s.top,s.bottom),r=Math.min(s.top,s.bottom);let o=t.findIndex(F=>F.ts>=s.startTs);
o<0&&(o=Math.max(0,t.length-60));const i=Math.max(0,t.length-1),c=t.length>1?nt(t.slice(-80),14):NaN,a=Number.isFinite(c)?c:0;return{top:String(n),bottom:String(
r),mid:String((n+r)/2),height:String(n-r),startTime:((l=t[o])==null?void 0:l.ts)??s.startTs,endTime:((x=t[i])==null?void 0:x.ts)??s.startTs,startIndex:o,endIndex:i,
touchesTop:2,touchesBottom:2,topPivots:[],bottomPivots:[],atr:a,heightAtr:a>0?(n-r)/a:0,insideShare:1,tolerancePct:e,isRange:!0}}const wt=150;function Mt(s,t,e){
return e??(s.length>11?z(s.slice(0,-1),t):null)}const kt=1500,xt=(s,t,e)=>e<s+t+kt;function Jt(s,t,e,n,r,o,i,c){const a=R(()=>({lookback:o.lookback,tolerancePct:o.
tolerancePct,pivotLeft:o.pivotLeft,pivotRight:o.pivotRight,minTouches:o.minTouches,minHeightPct:o.minHeightPct}),[o.lookback,o.tolerancePct,o.pivotLeft,o.pivotRight,
o.minTouches,o.minHeightPct]),l=R(()=>({requireRange:o.requireRange,tickSize:(10**-c).toFixed(c),feeRate:rt,slippageBps:ot}),[o.requireRange,c]),x=s[s.length-1],
F=!!x&&xt(x.ts,t,r()),h=R(()=>F?s.slice(0,-1):s,[s,F]),v=R(()=>s.map(S=>e.current.pressure(S.ts,t)??st(S)),[s,n,t]),p=h.length?`${h[h.length-1].ts}:${h.length}`:
"",g=R(()=>i?Tt(i,h,o.tolerancePct):null,[i,p,o.tolerancePct]),f=R(()=>g??(h.length>10?z(h,a):null),[p,a,g]),w=R(()=>Mt(h,a,g),[p,a,g]),N=R(()=>{const S=[],U=h.
length;let L=new Set;if(U<30)return{out:S,prevAtLast:L};const G=v.slice(0,U);for(let u=Math.max(25,U-wt);u<U-1;u++){const M=g??z(h.slice(0,u),a);if(!M){L=new Set;
continue}const b=Y(h.slice(0,u+1),G.slice(0,u+1),M,l);S.push(...b.filter(T=>!L.has(T.type))),L=new Set(b.map(T=>T.type))}return{out:S,prevAtLast:L}},[p,a,l,g]),
B=R(()=>!w||h.length<3?[]:Y(h,v.slice(0,h.length),w,l).filter(S=>!N.prevAtLast.has(S.type)),[p,w,l,v,N]),E=R(()=>[...N.out,...B],[N,B]),_=v.filter(S=>S.source===
"trades").length;return{closed:h,pressures:v,box:f,signalBox:w,live:B,history:E,tapeCandles:_}}function Kt(s,t){try{const e=localStorage.getItem(s);return e?{...t,
...JSON.parse(e)}:t}catch{return t}}function Wt(s){try{const t=localStorage.getItem(s);return t?JSON.parse(t):null}catch{return null}}function Vt(s,t){try{t==null?
localStorage.removeItem(s):localStorage.setItem(s,JSON.stringify(t))}catch{}}const Xt={symbol:"BTCUSDT",tf:"15m",riskPct:1,leverage:10,autoPaper:!1,moveSlToBe:!0,
maxAdds:2,addSizePct:50,lookback:80,tolerancePct:.25,pivotLeft:3,pivotRight:3,minTouches:2,minHeightPct:.6,requireRange:!0,notify:!1,showHist:!0},Ft=3e4,vt=15e3,
Pt=3,Rt=s=>[...new Set([...s.positions.map(t=>t.symbol),...s.pending.map(t=>t.symbol)])],At=(s,t)=>s.positions.some(e=>e.symbol===t)||s.pending.some(e=>e.symbol===
t);function Dt(s,t){var r;const e=Math.min(...s.positions.filter(o=>o.symbol===t).map(o=>o.openedAt),...s.pending.filter(o=>o.symbol===t).map(o=>o.createdAt)),n=(r=
s.lastTickTs)==null?void 0:r[t];return n===void 0?e:Number.isFinite(e)?Math.max(n,e):n}class jt{constructor(t=Ft,e=vt,n=Pt){y(this,"replaying",new Set);y(this,"\
fails",{});this.gapMs=t,this.retryMs=e,this.maxFails=n}needsReplay(t,e,n){var o;const r=Dt(t,e);return At(t,e)&&Number.isFinite(r)&&n-r>this.gapMs&&(((o=this.fails[e])==
null?void 0:o.n)??0)<this.maxFails}tick(t,e,n){var r;return this.replaying.has(e)?"replaying":this.needsReplay(t,e,n)?"gap":((((r=this.fails[e])==null?void 0:r.
n)??0)>=this.maxFails&&delete this.fails[e],"live")}begin(t,e){const n=Rt(t).filter(r=>{var o;return!this.replaying.has(r)&&this.needsReplay(t,r,e)&&e-(((o=this.
fails[r])==null?void 0:o.at)??0)>this.retryMs});return n.forEach(r=>this.replaying.add(r)),n}succeeded(t){delete this.fails[t]}failed(t,e){var r;const n=(r=this.
fails)[t]??(r[t]={n:0,at:0});return n.n+=1,n.at=e,n.n>=this.maxFails}release(t){this.replaying.delete(t)}}export{Xt as D,Ct as M,jt as R,pt as S,Gt as T,Wt as a,Jt as b,ut as c,Vt as d,qt as e,Lt as f,$t as g,zt as h,Ot as i,Kt as l,_t as m,Bt as p,Dt as r,Ht as s,Yt as u};
