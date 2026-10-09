var Z=Object.defineProperty;var tt=(s,t,e)=>t in s?Z(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var y=(s,t,e)=>tt(s,typeof t!="symbol"?t+"":t,e);import{useState as q,useRef as E,useEffect as $,useMemo as R}from"react";import{p as et,d as z,g as G,a as st}from"./strategy-Cu9CvPGE.js";import{S as nt,T as ot}from"./paper-DgRiG6e_.js";const Ut=(s,t=2)=>{const e=typeof s=="string"?Number(s):s;return e==null||!Number.isFinite(e)?"\u2014":e.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t})},
Lt=(s,t=2)=>Number.isFinite(s)?`${s>=0?"+":""}${(s*100).toFixed(t)}%`:"\u2014",Bt=(s,t=2)=>{if(!Number.isFinite(s))return"\u2014";const e=Number(s.toFixed(t));return e===
0?0 .toFixed(t):`${e>0?"+":""}${e.toFixed(t)}`},it=s=>new Date(s).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:!1}),qt=s=>{const t=new Date(
s);return`${t.getMonth()+1}/${t.getDate()} ${it(s)}`},Y="https://api.bitget.com",H="/dupont-mobile/bgapi";let J=!1;async function O(s){const t=J?[H,Y]:[Y,H];let e;
for(const n of t)try{const i=await fetch(n+s,{cache:"no-store"});if(!i.ok)throw new Error(`HTTP ${i.status}`);const o=await i.json();if(o.code!=="00000")throw new Error(
o.msg||"bitget error");return J=n===H,o.data}catch(i){e=i}throw e}const K={"1m":{api:"1m",sec:60},"5m":{api:"5m",sec:300},"15m":{api:"15m",sec:900},"1h":{api:"1\
H",sec:3600}};async function X(s,t,e=300,n){const i=K[t]??K["15m"],o=n?`&startTime=${Math.floor(n.startTime)}&endTime=${Math.floor(n.endTime)}`:"",r=await O(`/a\
pi/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${s}&granularity=${i.api}&limit=${e}${o}`),c=new Map;for(const a of r){const u={ts:Number(a[0]),open:+a[1],
high:+a[2],low:+a[3],close:+a[4],volume:+a[5]};Number.isFinite(u.ts)&&c.set(u.ts,u)}return[...c.values()].sort((a,u)=>a.ts-u.ts)}const rt=30*864e5-36e5;async function _t(s,t,e){
const i=Math.floor(Math.max(t,e-rt)/6e4)*6e4,o=new Map;for(let r=i;r<=e;r+=6e7){const c=await X(s,"1m",1e3,{startTime:r,endTime:Math.min(e,r+6e7-1)});for(const a of c)
o.set(a.ts,a);r+6e7<=e&&await new Promise(a=>setTimeout(a,120))}return{bars:[...o.values()].sort((r,c)=>r.ts-c.ts),clampedFrom:i}}const at=(s,t,e)=>s-(t+e)/2;async function ct(s=4e3,t=Date.
now){const e=t(),n=await Promise.race([O("/api/v2/public/time"),new Promise(r=>setTimeout(()=>r(null),s))]).catch(()=>null),i=t(),o=Number(n==null?void 0:n.serverTime);
return!Number.isFinite(o)||i-e>s?null:at(o,e,i)}async function $t(s,t=100){return(await O(`/api/v2/mix/market/history-fund-rate?symbol=${s}&productType=usdt-fut\
ures&pageSize=${t}`)??[]).map(n=>({ts:Number(n.fundingTime),rate:Number(n.fundingRate)})).filter(n=>Number.isFinite(n.ts)&&Number.isFinite(n.rate))}async function lt(s){
const t=await O(`/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${s}`),e=Array.isArray(t)?t[0]:t;return e?{last:+e.lastPr,mark:+(e.markPrice??e.lastPr),
change24h:+(e.change24h??0),funding:+(e.fundingRate??0),bid:+e.bidPr,ask:+e.askPr}:null}const ut="wss://ws.bitget.com/v2/ws/public";function ht(s){const e=(Array.
isArray(s==null?void 0:s.data)?s.data:[]).map(n=>({ts:+n.ts,price:+n.price,qty:+n.size,side:n.side==="sell"?"sell":"buy",...n.tradeId!==void 0?{id:String(n.tradeId)}:
{}}));return e.reverse(),{trades:e,snapshot:(s==null?void 0:s.action)==="snapshot"}}class ft{constructor(t=5e3){y(this,"seen",new Set);this.max=t}filter(t){const e=[];
for(const n of t){if(n.id===void 0){e.push(n);continue}this.seen.has(n.id)||(this.seen.add(n.id),e.push(n))}if(this.seen.size>this.max){let n=this.seen.size-this.
max;for(const i of this.seen){if(n--<=0)break;this.seen.delete(i)}}return e}}class dt{constructor(t,e){y(this,"ws",null);y(this,"closed",!1);y(this,"attempt",0);
y(this,"ping",null);y(this,"lastPong",0);y(this,"connectedAt",0);y(this,"lastMsgAt",0);this.symbol=t,this.h=e}start(){this.closed=!1,this.open()}stop(){var t,e,
n;this.closed=!0,this.ping&&clearInterval(this.ping),(t=this.ws)==null||t.close(),this.ws=null,(n=(e=this.h).status)==null||n.call(e,"closed")}open(){var e,n;if(this.
closed)return;(n=(e=this.h).status)==null||n.call(e,this.attempt?"reconnecting":"connecting");let t;try{t=new WebSocket(ut)}catch{return this.retry()}this.ws=t,
t.onopen=()=>{var o,r;this.attempt=0,this.connectedAt=Date.now();const i=["ticker","books15","trade"].map(c=>({instType:"USDT-FUTURES",channel:c,instId:this.symbol}));
t.send(JSON.stringify({op:"subscribe",args:i})),this.lastPong=Date.now(),this.ping=setInterval(()=>{if(t.readyState===1){if(Date.now()-this.lastPong>2*25e3+5e3){
t.close();return}t.send("ping")}},25e3),(r=(o=this.h).status)==null||r.call(o,"live")},t.onmessage=i=>{var u,x,F,h,v,m,p;this.lastMsgAt=Date.now();const o=typeof i.
data=="string"?i.data:"";if(o==="pong"){this.lastPong=Date.now();return}if(!o)return;let r;try{r=JSON.parse(o)}catch{return}const c=(u=r==null?void 0:r.arg)==null?
void 0:u.channel,a=r==null?void 0:r.data;if(!(!c||!Array.isArray(a)||!a.length)){if(c==="ticker"){const f=a[0];(F=(x=this.h).ticker)==null||F.call(x,{last:+f.lastPr,
mark:+(f.markPrice??f.lastPr),funding:+(f.fundingRate??0),change24h:+(f.change24h??0),bid:+f.bidPr,ask:+f.askPr})}else if(c==="books15"){const f=a[0];(v=(h=this.
h).book)==null||v.call(h,{bids:(f.bids??[]).map(T=>[+T[0],+T[1]]),asks:(f.asks??[]).map(T=>[+T[0],+T[1]]),ts:+f.ts})}else if(c==="trade"){const f=ht(r);(p=(m=this.
h).trades)==null||p.call(m,f.trades,f.snapshot)}}},t.onclose=()=>{this.ping&&clearInterval(this.ping),this.closed||this.retry()},t.onerror=()=>t.close()}retry(){
var e,n;(n=(e=this.h).status)==null||n.call(e,"reconnecting");const t=Math.min(3e4,1e3*2**this.attempt++);setTimeout(()=>this.open(),t)}}const mt=[{symbol:"BTCU\
SDT",qtyStep:1e-4,dp:1},{symbol:"ETHUSDT",qtyStep:.01,dp:2},{symbol:"SOLUSDT",qtyStep:.1,dp:3},{symbol:"XRPUSDT",qtyStep:1,dp:4},{symbol:"DOGEUSDT",qtyStep:1,dp:5},
{symbol:"BNBUSDT",qtyStep:.01,dp:2},{symbol:"ADAUSDT",qtyStep:1,dp:4},{symbol:"LINKUSDT",qtyStep:1,dp:3},{symbol:"AVAXUSDT",qtyStep:.1,dp:3},{symbol:"SUIUSDT",qtyStep:.1,
dp:4}],Ot=5,j=s=>Math.max(0,Math.round(-Math.log10(s))),Ct=s=>{const t=mt.find(e=>e.symbol===s)??{symbol:s,qtyStep:.001,dp:2};return{...t,qdp:j(t.qtyStep)}},Ht=(s,t)=>{
const e=j(t);return Number((Math.floor(s/t+1e-9)*t).toFixed(e))},zt=["1m","5m","15m","1h"],W={"1m":6e4,"5m":3e5,"15m":9e5,"1h":36e5},k=6e4;class V{constructor(t=1500){
y(this,"b",new Map);y(this,"coverFrom",1/0);y(this,"gaps",[]);y(this,"downSince",null);this.maxBuckets=t}reset(){this.b.clear(),this.coverFrom=1/0,this.gaps=[],
this.downSince=null}connected(t){const e=Math.ceil(t/k)*k;if(!Number.isFinite(this.coverFrom))this.coverFrom=e;else if(this.downSince!==null){const n=Math.floor(
this.downSince/k)*k;e>n&&this.gaps.push([n,e])}this.downSince=null}get awaitingConnect(){return!Number.isFinite(this.coverFrom)||this.downSince!==null}disconnected(t){
this.downSince===null&&Number.isFinite(this.coverFrom)&&(this.downSince=t)}add(t){for(const e of t){const n=Math.floor(e.ts/k)*k,i=this.b.get(n)??{buy:0,sell:0,
n:0};e.side==="buy"?i.buy+=e.qty:i.sell+=e.qty,i.n++,this.b.set(n,i)}if(this.b.size>this.maxBuckets){const e=[...this.b.keys()].sort((i,o)=>i-o);for(const i of e.
slice(0,this.b.size-this.maxBuckets))this.b.delete(i);const n=e[e.length-this.b.size];this.gaps=this.gaps.filter(([,i])=>i>n),this.coverFrom=Math.max(this.coverFrom,
n)}}covers(t,e){if(t<this.coverFrom)return!1;const n=t+e;return this.downSince!==null&&n>Math.floor(this.downSince/k)*k?!1:!this.gaps.some(([i,o])=>t<o&&n>i)}pressure(t,e,n=1){
if(!this.covers(t,e))return null;let i=0,o=0,r=0;for(let a=Math.floor(t/k)*k;a<t+e;a+=k){const u=this.b.get(a);u&&(i+=u.buy,o+=u.sell,r+=u.n)}if(r<n)return null;
const c=i+o;return{buy:i,sell:o,net:i-o,ratio:c>0?i/c:.5,source:"trades"}}}function pt(s,t,e){return s.length?Math.floor(t/e)*e>s[s.length-1].ts+e:!1}const gt=3e4;
function St(s,t,e,n,i=gt){if(!s.length)return!1;if(pt(s,t,e))return!0;const o=Math.floor(t/e)*e;return o>s[s.length-1].ts&&n<o-i}function bt(s,t,e,n,i){if(!s.length)
return s;const o=Math.floor(n/i)*i,r=s[s.length-1];if(o>r.ts+i)return s;if(o>r.ts)return[...s.slice(-499),{ts:o,open:r.close,high:Math.max(r.close,t),low:Math.min(
r.close,t),close:t,volume:e}];if(o<r.ts)return s;const c={...r,close:t,high:Math.max(r.high,t),low:Math.min(r.low,t),volume:r.volume+e};return[...s.slice(0,-1),
c]}function Gt(s,t){const[e,n]=q([]),[i,o]=q(null),[r,c]=q(null),[a,u]=q("connecting"),[x,F]=q(""),[h,v]=q(0),m=E(new V),p=E(0),f=E(t);f.current=t;const T=E([]);
T.current=e;const I=E(()=>{}),A=E(0);$(()=>{m.current=new V,c(null);let d=!1;const g=new ft,b=new dt(s,{status:l=>{u(l),(l==="reconnecting"||l==="closed")&&m.current.
disconnected((b.lastMsgAt||Date.now())+p.current)},ticker:l=>o(S=>({...S??l,...l})),book:l=>c(l),trades:(l,S)=>{const D=g.filter(l);if(!l.length)return;const N=l[l.
length-1];if(p.current=N.ts-Date.now(),S){m.current.connected(N.ts);return}if(m.current.awaitingConnect&&m.current.connected(l[0].ts),!D.length)return;m.current.
add(D),d=!0;const P=D[D.length-1];_(P.price,D.reduce((C,Q)=>C+Q.qty,0),P.ts)}});b.start();const M=setInterval(()=>{d&&(d=!1,v(l=>l+1))},1e3);return()=>{b.stop(),
clearInterval(M)}},[s]);function _(d,g,b){const M=W[f.current]??9e5;if(St(T.current,b,M,A.current)){I.current();return}T.current.length&&(A.current=Math.max(A.current,
b)),n(l=>bt(l,d,g,b,M))}$(()=>{let d=!0;n([]);const g=l=>X(s,t).then(S=>{!d||!S.length||(F(""),A.current=Math.max(A.current,Date.now()+p.current),n(D=>{if(l||!D.
length)return S;const N=S[S.length-1],P=D[D.length-1];if(P.ts>N.ts)return[...S,P];if(P.ts===N.ts){const C={...N,high:Math.max(N.high,P.high),low:Math.min(N.low,
P.low),close:P.close,volume:Math.max(N.volume,P.volume)};return[...S.slice(0,-1),C]}return S}))}).catch(S=>d&&F(String((S==null?void 0:S.message)??S)));g(!0);let b=0;
I.current=()=>{Date.now()-b>3e3&&(b=Date.now(),g(!1))};const M=setInterval(()=>g(!1),2e4);return()=>{d=!1,clearInterval(M)}},[s,t]),$(()=>{let d=!0;const g=()=>lt(
s).then(M=>{!d||!M||(o(M),a!=="live"&&_(M.last,0,Date.now()+p.current))}).catch(()=>{});g();const b=setInterval(g,a==="live"?1e4:2500);return()=>{d=!1,clearInterval(
b)}},[s,a]);const U=E(null),w=()=>U.current??(U.current=ct().then(d=>{d!==null&&(p.current=d)}).finally(()=>{U.current=null}));$(()=>{w()},[]);const L=W[t]??9e5;
return{candles:e,ticker:i,book:r,status:a,err:x,tape:m,tapeVer:h,intervalMs:L,serverNow:()=>Date.now()+p.current,syncClock:w}}function yt(s,t,e){var u,x;const n=Math.
max(s.top,s.bottom),i=Math.min(s.top,s.bottom);let o=t.findIndex(F=>F.ts>=s.startTs);o<0&&(o=Math.max(0,t.length-60));const r=Math.max(0,t.length-1),c=t.length>
1?st(t.slice(-80),14):NaN,a=Number.isFinite(c)?c:0;return{top:String(n),bottom:String(i),mid:String((n+i)/2),height:String(n-i),startTime:((u=t[o])==null?void 0:
u.ts)??s.startTs,endTime:((x=t[r])==null?void 0:x.ts)??s.startTs,startIndex:o,endIndex:r,touchesTop:2,touchesBottom:2,topPivots:[],bottomPivots:[],atr:a,heightAtr:a>
0?(n-i)/a:0,insideShare:1,tolerancePct:e,isRange:!0}}const Tt=150;function wt(s,t,e){return e??(s.length>11?z(s.slice(0,-1),t):null)}const Mt=1500,kt=(s,t,e)=>e<
s+t+Mt;function Yt(s,t,e,n,i,o,r,c){const a=R(()=>({lookback:o.lookback,tolerancePct:o.tolerancePct,pivotLeft:o.pivotLeft,pivotRight:o.pivotRight,minTouches:o.minTouches,
minHeightPct:o.minHeightPct}),[o.lookback,o.tolerancePct,o.pivotLeft,o.pivotRight,o.minTouches,o.minHeightPct]),u=R(()=>({requireRange:o.requireRange,tickSize:(10**
-c).toFixed(c),feeRate:ot,slippageBps:nt}),[o.requireRange,c]),x=s[s.length-1],F=!!x&&kt(x.ts,t,i()),h=R(()=>F?s.slice(0,-1):s,[s,F]),v=R(()=>s.map(w=>e.current.
pressure(w.ts,t)??et(w)),[s,n,t]),m=h.length?`${h[h.length-1].ts}:${h.length}`:"",p=R(()=>r?yt(r,h,o.tolerancePct):null,[r,m,o.tolerancePct]),f=R(()=>p??(h.length>
10?z(h,a):null),[m,a,p]),T=R(()=>wt(h,a,p),[m,a,p]),I=R(()=>{const w=[],L=h.length;let B=new Set;if(L<30)return{out:w,prevAtLast:B};const d=v.slice(0,L);for(let g=Math.
max(25,L-Tt);g<L-1;g++){const b=p??z(h.slice(0,g),a);if(!b){B=new Set;continue}const M=G(h.slice(0,g+1),d.slice(0,g+1),b,u);w.push(...M.filter(l=>!B.has(l.type))),
B=new Set(M.map(l=>l.type))}return{out:w,prevAtLast:B}},[m,a,u,p]),A=R(()=>!T||h.length<3?[]:G(h,v.slice(0,h.length),T,u).filter(w=>!I.prevAtLast.has(w.type)),[
m,T,u,v,I]),_=R(()=>[...I.out,...A],[I,A]),U=v.filter(w=>w.source==="trades").length;return{closed:h,pressures:v,box:f,signalBox:T,live:A,history:_,tapeCandles:U}}
function Jt(s,t){try{const e=localStorage.getItem(s);return e?{...t,...JSON.parse(e)}:t}catch{return t}}function Kt(s){try{const t=localStorage.getItem(s);return t?
JSON.parse(t):null}catch{return null}}function Wt(s,t){try{t==null?localStorage.removeItem(s):localStorage.setItem(s,JSON.stringify(t))}catch{}}const Vt={symbol:"\
BTCUSDT",tf:"15m",riskPct:1,leverage:10,autoPaper:!1,moveSlToBe:!0,maxAdds:2,addSizePct:50,lookback:80,tolerancePct:.25,pivotLeft:3,pivotRight:3,minTouches:2,minHeightPct:.6,
requireRange:!0,notify:!1,showHist:!0},xt=3e4,Ft=15e3,vt=3,Pt=s=>[...new Set([...s.positions.map(t=>t.symbol),...s.pending.map(t=>t.symbol)])],Rt=(s,t)=>s.positions.
some(e=>e.symbol===t)||s.pending.some(e=>e.symbol===t);function At(s,t){var i;const e=Math.min(...s.positions.filter(o=>o.symbol===t).map(o=>o.openedAt),...s.pending.
filter(o=>o.symbol===t).map(o=>o.createdAt)),n=(i=s.lastTickTs)==null?void 0:i[t];return n===void 0?e:Number.isFinite(e)?Math.max(n,e):n}class Xt{constructor(t=xt,e=Ft,n=vt){
y(this,"replaying",new Set);y(this,"fails",{});this.gapMs=t,this.retryMs=e,this.maxFails=n}needsReplay(t,e,n){var o;const i=At(t,e);return Rt(t,e)&&Number.isFinite(
i)&&n-i>this.gapMs&&(((o=this.fails[e])==null?void 0:o.n)??0)<this.maxFails}tick(t,e,n){var i;return this.replaying.has(e)?"replaying":this.needsReplay(t,e,n)?"\
gap":((((i=this.fails[e])==null?void 0:i.n)??0)>=this.maxFails&&delete this.fails[e],"live")}begin(t,e){const n=Pt(t).filter(i=>{var o;return!this.replaying.has(
i)&&this.needsReplay(t,i,e)&&e-(((o=this.fails[i])==null?void 0:o.at)??0)>this.retryMs});return n.forEach(i=>this.replaying.add(i)),n}succeeded(t){delete this.fails[t]}failed(t,e){
var i;const n=(i=this.fails)[t]??(i[t]={n:0,at:0});return n.n+=1,n.at=e,n.n>=this.maxFails}release(t){this.replaying.delete(t)}}export{Vt as D,Ot as M,Xt as R,mt as S,zt as T,Kt as a,Yt as b,lt as c,Wt as d,Bt as e,Ut as f,_t as g,Ht as h,$t as i,Jt as l,qt as m,Lt as p,At as r,Ct as s,Gt as u};
