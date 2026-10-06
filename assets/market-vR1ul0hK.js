var j=Object.defineProperty;var Q=(s,t,e)=>t in s?j(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var y=(s,t,e)=>Q(s,typeof t!="symbol"?t+"":t,e);import{useState as E,useRef as U,useEffect as _,useMemo as A}from"react";import{p as Z,d as O,g as H,a as tt}from"./strategy-Cu9CvPGE.js";import{S as et,T as st}from"./paper-DVHNhHn6.js";const Dt=(s,t=2)=>{const e=typeof s=="string"?Number(s):s;return e==null||!Number.isFinite(e)?"\u2014":e.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t})},
Nt=(s,t=2)=>Number.isFinite(s)?`${s>=0?"+":""}${(s*100).toFixed(t)}%`:"\u2014",It=(s,t=2)=>{if(!Number.isFinite(s))return"\u2014";const e=Number(s.toFixed(t));return e===
0?0 .toFixed(t):`${e>0?"+":""}${e.toFixed(t)}`},nt=s=>new Date(s).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:!1}),Et=s=>{const t=new Date(
s);return`${t.getMonth()+1}/${t.getDate()} ${nt(s)}`},z="https://api.bitget.com",$="/dupont-mobile/bgapi";let G=!1;async function C(s){const t=G?[$,z]:[z,$];let e;
for(const n of t)try{const i=await fetch(n+s,{cache:"no-store"});if(!i.ok)throw new Error(`HTTP ${i.status}`);const o=await i.json();if(o.code!=="00000")throw new Error(
o.msg||"bitget error");return G=n===$,o.data}catch(i){e=i}throw e}const Y={"1m":{api:"1m",sec:60},"5m":{api:"5m",sec:300},"15m":{api:"15m",sec:900},"1h":{api:"1\
H",sec:3600}};async function W(s,t,e=300,n){const i=Y[t]??Y["15m"],o=n?`&startTime=${Math.floor(n.startTime)}&endTime=${Math.floor(n.endTime)}`:"",r=await C(`/a\
pi/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${s}&granularity=${i.api}&limit=${e}${o}`),c=new Map;for(const a of r){const l={ts:Number(a[0]),open:+a[1],
high:+a[2],low:+a[3],close:+a[4],volume:+a[5]};Number.isFinite(l.ts)&&c.set(l.ts,l)}return[...c.values()].sort((a,l)=>a.ts-l.ts)}const ot=30*864e5-36e5;async function Ut(s,t,e){
const i=Math.floor(Math.max(t,e-ot)/6e4)*6e4,o=new Map;for(let r=i;r<=e;r+=6e7){const c=await W(s,"1m",1e3,{startTime:r,endTime:Math.min(e,r+6e7-1)});for(const a of c)
o.set(a.ts,a);r+6e7<=e&&await new Promise(a=>setTimeout(a,120))}return{bars:[...o.values()].sort((r,c)=>r.ts-c.ts),clampedFrom:i}}async function Lt(s,t=100){return(await C(
`/api/v2/mix/market/history-fund-rate?symbol=${s}&productType=usdt-futures&pageSize=${t}`)??[]).map(n=>({ts:Number(n.fundingTime),rate:Number(n.fundingRate)})).
filter(n=>Number.isFinite(n.ts)&&Number.isFinite(n.rate))}async function it(s){const t=await C(`/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${s}`),
e=Array.isArray(t)?t[0]:t;return e?{last:+e.lastPr,mark:+(e.markPrice??e.lastPr),change24h:+(e.change24h??0),funding:+(e.fundingRate??0),bid:+e.bidPr,ask:+e.askPr}:
null}const rt="wss://ws.bitget.com/v2/ws/public";function at(s){const e=(Array.isArray(s==null?void 0:s.data)?s.data:[]).map(n=>({ts:+n.ts,price:+n.price,qty:+n.
size,side:n.side==="sell"?"sell":"buy",...n.tradeId!==void 0?{id:String(n.tradeId)}:{}}));return e.reverse(),{trades:e,snapshot:(s==null?void 0:s.action)==="sna\
pshot"}}class ct{constructor(t=5e3){y(this,"seen",new Set);this.max=t}filter(t){const e=[];for(const n of t){if(n.id===void 0){e.push(n);continue}this.seen.has(
n.id)||(this.seen.add(n.id),e.push(n))}if(this.seen.size>this.max){let n=this.seen.size-this.max;for(const i of this.seen){if(n--<=0)break;this.seen.delete(i)}}
return e}}class lt{constructor(t,e){y(this,"ws",null);y(this,"closed",!1);y(this,"attempt",0);y(this,"ping",null);y(this,"lastPong",0);y(this,"connectedAt",0);y(
this,"lastMsgAt",0);this.symbol=t,this.h=e}start(){this.closed=!1,this.open()}stop(){var t,e,n;this.closed=!0,this.ping&&clearInterval(this.ping),(t=this.ws)==null||
t.close(),this.ws=null,(n=(e=this.h).status)==null||n.call(e,"closed")}open(){var e,n;if(this.closed)return;(n=(e=this.h).status)==null||n.call(e,this.attempt?"\
reconnecting":"connecting");let t;try{t=new WebSocket(rt)}catch{return this.retry()}this.ws=t,t.onopen=()=>{var o,r;this.attempt=0,this.connectedAt=Date.now();const i=[
"ticker","books15","trade"].map(c=>({instType:"USDT-FUTURES",channel:c,instId:this.symbol}));t.send(JSON.stringify({op:"subscribe",args:i})),this.lastPong=Date.
now(),this.ping=setInterval(()=>{if(t.readyState===1){if(Date.now()-this.lastPong>2*25e3+5e3){t.close();return}t.send("ping")}},25e3),(r=(o=this.h).status)==null||
r.call(o,"live")},t.onmessage=i=>{var l,F,R,h,P,p,b;this.lastMsgAt=Date.now();const o=typeof i.data=="string"?i.data:"";if(o==="pong"){this.lastPong=Date.now();
return}if(!o)return;let r;try{r=JSON.parse(o)}catch{return}const c=(l=r==null?void 0:r.arg)==null?void 0:l.channel,a=r==null?void 0:r.data;if(!(!c||!Array.isArray(
a)||!a.length)){if(c==="ticker"){const f=a[0];(R=(F=this.h).ticker)==null||R.call(F,{last:+f.lastPr,mark:+(f.markPrice??f.lastPr),funding:+(f.fundingRate??0),change24h:+(f.
change24h??0),bid:+f.bidPr,ask:+f.askPr})}else if(c==="books15"){const f=a[0];(P=(h=this.h).book)==null||P.call(h,{bids:(f.bids??[]).map(T=>[+T[0],+T[1]]),asks:(f.
asks??[]).map(T=>[+T[0],+T[1]]),ts:+f.ts})}else if(c==="trade"){const f=at(r);(b=(p=this.h).trades)==null||b.call(p,f.trades,f.snapshot)}}},t.onclose=()=>{this.
ping&&clearInterval(this.ping),this.closed||this.retry()},t.onerror=()=>t.close()}retry(){var e,n;(n=(e=this.h).status)==null||n.call(e,"reconnecting");const t=Math.
min(3e4,1e3*2**this.attempt++);setTimeout(()=>this.open(),t)}}const ut=[{symbol:"BTCUSDT",qtyStep:1e-4,dp:1},{symbol:"ETHUSDT",qtyStep:.01,dp:2},{symbol:"SOLUSD\
T",qtyStep:.1,dp:3},{symbol:"XRPUSDT",qtyStep:1,dp:4},{symbol:"DOGEUSDT",qtyStep:1,dp:5},{symbol:"BNBUSDT",qtyStep:.01,dp:2},{symbol:"ADAUSDT",qtyStep:1,dp:4},{
symbol:"LINKUSDT",qtyStep:1,dp:3},{symbol:"AVAXUSDT",qtyStep:.1,dp:3},{symbol:"SUIUSDT",qtyStep:.1,dp:4}],Bt=5,V=s=>Math.max(0,Math.round(-Math.log10(s))),qt=s=>{
const t=ut.find(e=>e.symbol===s)??{symbol:s,qtyStep:.001,dp:2};return{...t,qdp:V(t.qtyStep)}},_t=(s,t)=>{const e=V(t);return Number((Math.floor(s/t+1e-9)*t).toFixed(
e))},$t=["1m","5m","15m","1h"],J={"1m":6e4,"5m":3e5,"15m":9e5,"1h":36e5},x=6e4;class K{constructor(t=1500){y(this,"b",new Map);y(this,"coverFrom",1/0);y(this,"g\
aps",[]);y(this,"downSince",null);this.maxBuckets=t}reset(){this.b.clear(),this.coverFrom=1/0,this.gaps=[],this.downSince=null}connected(t){const e=Math.ceil(t/
x)*x;if(!Number.isFinite(this.coverFrom))this.coverFrom=e;else if(this.downSince!==null){const n=Math.floor(this.downSince/x)*x;e>n&&this.gaps.push([n,e])}this.
downSince=null}get awaitingConnect(){return!Number.isFinite(this.coverFrom)||this.downSince!==null}disconnected(t){this.downSince===null&&Number.isFinite(this.coverFrom)&&
(this.downSince=t)}add(t){for(const e of t){const n=Math.floor(e.ts/x)*x,i=this.b.get(n)??{buy:0,sell:0,n:0};e.side==="buy"?i.buy+=e.qty:i.sell+=e.qty,i.n++,this.
b.set(n,i)}if(this.b.size>this.maxBuckets){const e=[...this.b.keys()].sort((i,o)=>i-o);for(const i of e.slice(0,this.b.size-this.maxBuckets))this.b.delete(i);const n=e[e.
length-this.b.size];this.gaps=this.gaps.filter(([,i])=>i>n),this.coverFrom=Math.max(this.coverFrom,n)}}covers(t,e){if(t<this.coverFrom)return!1;const n=t+e;return this.
downSince!==null&&n>Math.floor(this.downSince/x)*x?!1:!this.gaps.some(([i,o])=>t<o&&n>i)}pressure(t,e,n=1){if(!this.covers(t,e))return null;let i=0,o=0,r=0;for(let a=Math.
floor(t/x)*x;a<t+e;a+=x){const l=this.b.get(a);l&&(i+=l.buy,o+=l.sell,r+=l.n)}if(r<n)return null;const c=i+o;return{buy:i,sell:o,net:i-o,ratio:c>0?i/c:.5,source:"\
trades"}}}function ht(s,t,e){return s.length?Math.floor(t/e)*e>s[s.length-1].ts+e:!1}const ft=3e4;function dt(s,t,e,n,i=ft){if(!s.length)return!1;if(ht(s,t,e))return!0;
const o=Math.floor(t/e)*e;return o>s[s.length-1].ts&&n<o-i}function mt(s,t,e,n,i){if(!s.length)return s;const o=Math.floor(n/i)*i,r=s[s.length-1];if(o>r.ts+i)return s;
if(o>r.ts)return[...s.slice(-499),{ts:o,open:r.close,high:Math.max(r.close,t),low:Math.min(r.close,t),close:t,volume:e}];if(o<r.ts)return s;const c={...r,close:t,
high:Math.max(r.high,t),low:Math.min(r.low,t),volume:r.volume+e};return[...s.slice(0,-1),c]}function Ot(s,t){const[e,n]=E([]),[i,o]=E(null),[r,c]=E(null),[a,l]=E(
"connecting"),[F,R]=E(""),[h,P]=E(0),p=U(new K),b=U(0),f=U(t);f.current=t;const T=U([]);T.current=e;const I=U(()=>{}),D=U(0);_(()=>{p.current=new K,c(null);let m=!1;
const g=new ct,w=new lt(s,{status:u=>{l(u),(u==="reconnecting"||u==="closed")&&p.current.disconnected((w.lastMsgAt||Date.now())+b.current)},ticker:u=>o(d=>({...d??
u,...u})),book:u=>c(u),trades:(u,d)=>{const M=g.filter(u);if(!u.length)return;const N=u[u.length-1];if(b.current=N.ts-Date.now(),d){p.current.connected(N.ts);return}
if(p.current.awaitingConnect&&p.current.connected(u[0].ts),!M.length)return;p.current.add(M),m=!0;const v=M[M.length-1];L(v.price,M.reduce((q,X)=>q+X.qty,0),v.ts)}});
w.start();const S=setInterval(()=>{m&&(m=!1,P(u=>u+1))},1e3);return()=>{w.stop(),clearInterval(S)}},[s]);function L(m,g,w){const S=J[f.current]??9e5;if(dt(T.current,
w,S,D.current)){I.current();return}T.current.length&&(D.current=Math.max(D.current,w)),n(u=>mt(u,m,g,w,S))}_(()=>{let m=!0;n([]);const g=u=>W(s,t).then(d=>{!m||
!d.length||(R(""),D.current=Math.max(D.current,Date.now()+b.current),n(M=>{if(u||!M.length)return d;const N=d[d.length-1],v=M[M.length-1];if(v.ts>N.ts)return[...d,
v];if(v.ts===N.ts){const q={...N,high:Math.max(N.high,v.high),low:Math.min(N.low,v.low),close:v.close,volume:Math.max(N.volume,v.volume)};return[...d.slice(0,-1),
q]}return d}))}).catch(d=>m&&R(String((d==null?void 0:d.message)??d)));g(!0);let w=0;I.current=()=>{Date.now()-w>3e3&&(w=Date.now(),g(!1))};const S=setInterval(
()=>g(!1),2e4);return()=>{m=!1,clearInterval(S)}},[s,t]),_(()=>{let m=!0;const g=()=>it(s).then(S=>{!m||!S||(o(S),a!=="live"&&L(S.last,0,Date.now()+b.current))}).
catch(()=>{});g();const w=setInterval(g,a==="live"?1e4:2500);return()=>{m=!1,clearInterval(w)}},[s,a]);const B=J[t]??9e5;return{candles:e,ticker:i,book:r,status:a,
err:F,tape:p,tapeVer:h,intervalMs:B,serverNow:()=>Date.now()+b.current}}function pt(s,t,e){var l,F;const n=Math.max(s.top,s.bottom),i=Math.min(s.top,s.bottom);let o=t.
findIndex(R=>R.ts>=s.startTs);o<0&&(o=Math.max(0,t.length-60));const r=Math.max(0,t.length-1),c=t.length>1?tt(t.slice(-80),14):NaN,a=Number.isFinite(c)?c:0;return{
top:String(n),bottom:String(i),mid:String((n+i)/2),height:String(n-i),startTime:((l=t[o])==null?void 0:l.ts)??s.startTs,endTime:((F=t[r])==null?void 0:F.ts)??s.
startTs,startIndex:o,endIndex:r,touchesTop:2,touchesBottom:2,topPivots:[],bottomPivots:[],atr:a,heightAtr:a>0?(n-i)/a:0,insideShare:1,tolerancePct:e,isRange:!0}}
const gt=150;function St(s,t,e){return e??(s.length>11?O(s.slice(0,-1),t):null)}const bt=1500,yt=(s,t,e)=>e<s+t+bt;function Ct(s,t,e,n,i,o,r,c){const a=A(()=>({
lookback:o.lookback,tolerancePct:o.tolerancePct,pivotLeft:o.pivotLeft,pivotRight:o.pivotRight,minTouches:o.minTouches,minHeightPct:o.minHeightPct}),[o.lookback,
o.tolerancePct,o.pivotLeft,o.pivotRight,o.minTouches,o.minHeightPct]),l=A(()=>({requireRange:o.requireRange,tickSize:(10**-c).toFixed(c),feeRate:st,slippageBps:et}),
[o.requireRange,c]),F=s[s.length-1],R=!!F&&yt(F.ts,t,i()),h=A(()=>R?s.slice(0,-1):s,[s,R]),P=A(()=>s.map(k=>e.current.pressure(k.ts,t)??Z(k)),[s,n,t]),p=h.length?
`${h[h.length-1].ts}:${h.length}`:"",b=A(()=>r?pt(r,h,o.tolerancePct):null,[r,p,o.tolerancePct]),f=A(()=>b??(h.length>10?O(h,a):null),[p,a,b]),T=A(()=>St(h,a,b),
[p,a,b]),I=A(()=>{const k=[],m=h.length;let g=new Set;if(m<30)return{out:k,prevAtLast:g};const w=P.slice(0,m);for(let S=Math.max(25,m-gt);S<m-1;S++){const u=b??
O(h.slice(0,S),a);if(!u){g=new Set;continue}const d=H(h.slice(0,S+1),w.slice(0,S+1),u,l);k.push(...d.filter(M=>!g.has(M.type))),g=new Set(d.map(M=>M.type))}return{
out:k,prevAtLast:g}},[p,a,l,b]),D=A(()=>!T||h.length<3?[]:H(h,P.slice(0,h.length),T,l).filter(k=>!I.prevAtLast.has(k.type)),[p,T,l,P,I]),L=A(()=>[...I.out,...D],
[I,D]),B=P.filter(k=>k.source==="trades").length;return{closed:h,pressures:P,box:f,signalBox:T,live:D,history:L,tapeCandles:B}}function Ht(s,t){try{const e=localStorage.
getItem(s);return e?{...t,...JSON.parse(e)}:t}catch{return t}}function zt(s){try{const t=localStorage.getItem(s);return t?JSON.parse(t):null}catch{return null}}
function Gt(s,t){try{t==null?localStorage.removeItem(s):localStorage.setItem(s,JSON.stringify(t))}catch{}}const Yt={symbol:"BTCUSDT",tf:"15m",riskPct:1,leverage:10,
autoPaper:!1,moveSlToBe:!0,maxAdds:2,addSizePct:50,lookback:80,tolerancePct:.25,pivotLeft:3,pivotRight:3,minTouches:2,minHeightPct:.6,requireRange:!0,notify:!1,
showHist:!0},Tt=3e4,wt=15e3,Mt=3,kt=s=>[...new Set([...s.positions.map(t=>t.symbol),...s.pending.map(t=>t.symbol)])],xt=(s,t)=>s.positions.some(e=>e.symbol===t)||
s.pending.some(e=>e.symbol===t);function Ft(s,t){var i;const e=Math.min(...s.positions.filter(o=>o.symbol===t).map(o=>o.openedAt),...s.pending.filter(o=>o.symbol===
t).map(o=>o.createdAt)),n=(i=s.lastTickTs)==null?void 0:i[t];return n===void 0?e:Number.isFinite(e)?Math.max(n,e):n}class Jt{constructor(t=Tt,e=wt,n=Mt){y(this,
"replaying",new Set);y(this,"fails",{});this.gapMs=t,this.retryMs=e,this.maxFails=n}needsReplay(t,e,n){var o;const i=Ft(t,e);return xt(t,e)&&Number.isFinite(i)&&
n-i>this.gapMs&&(((o=this.fails[e])==null?void 0:o.n)??0)<this.maxFails}tick(t,e,n){var i;return this.replaying.has(e)?"replaying":this.needsReplay(t,e,n)?"gap":
((((i=this.fails[e])==null?void 0:i.n)??0)>=this.maxFails&&delete this.fails[e],"live")}begin(t,e){const n=kt(t).filter(i=>{var o;return!this.replaying.has(i)&&
this.needsReplay(t,i,e)&&e-(((o=this.fails[i])==null?void 0:o.at)??0)>this.retryMs});return n.forEach(i=>this.replaying.add(i)),n}succeeded(t){delete this.fails[t]}failed(t,e){
var i;const n=(i=this.fails)[t]??(i[t]={n:0,at:0});return n.n+=1,n.at=e,n.n>=this.maxFails}release(t){this.replaying.delete(t)}}export{Yt as D,Bt as M,Jt as R,ut as S,$t as T,zt as a,Ct as b,it as c,Gt as d,It as e,Dt as f,Ut as g,_t as h,Lt as i,Ht as l,Et as m,Nt as p,Ft as r,qt as s,Ot as u};
