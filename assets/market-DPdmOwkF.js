var nt=Object.defineProperty;var st=(e,t,n)=>t in e?nt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var S=(e,t,n)=>st(e,typeof t!="symbol"?t+"":t,n);import{useState as B,useRef as v,useEffect as H,useMemo as A}from"react";import{p as rt,d as J,g as K,a as ot}from"./strategy-Cu9CvPGE.js";import{S as it,T as at}from"./paper-CzloH-28.js";const qt=(e,t=2)=>{const n=typeof e=="string"?Number(e):e;return n==null||!Number.isFinite(n)?"\u2014":n.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t})},
$t=(e,t=2)=>Number.isFinite(e)?`${e>=0?"+":""}${(e*100).toFixed(t)}%`:"\u2014",Ot=(e,t=2)=>{if(!Number.isFinite(e))return"\u2014";const n=Number(e.toFixed(t));return n===
0?0 .toFixed(t):`${n>0?"+":""}${n.toFixed(t)}`},ct=e=>new Date(e).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:!1}),Ct=e=>{const t=new Date(
e);return`${t.getMonth()+1}/${t.getDate()} ${ct(e)}`},W="https://api.bitget.com",G="/dupont-mobile/bgapi";let X=!1;async function Y(e){const t=X?[G,W]:[W,G];let n;
for(const s of t)try{const o=await fetch(s+e,{cache:"no-store"});if(!o.ok)throw new Error(`HTTP ${o.status}`);const r=await o.json();if(r.code!=="00000")throw new Error(
r.msg||"bitget error");return X=s===G,r.data}catch(o){n=o}throw n}const V={"1m":{api:"1m",sec:60},"5m":{api:"5m",sec:300},"15m":{api:"15m",sec:900},"1h":{api:"1\
H",sec:3600}};async function Z(e,t,n=300,s){const o=V[t]??V["15m"],r=s?`&startTime=${Math.floor(s.startTime)}&endTime=${Math.floor(s.endTime)}`:"",i=await Y(`/a\
pi/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${e}&granularity=${o.api}&limit=${n}${r}`),c=new Map;for(const a of i){const l={ts:Number(a[0]),open:+a[1],
high:+a[2],low:+a[3],close:+a[4],volume:+a[5]};Number.isFinite(l.ts)&&c.set(l.ts,l)}return[...c.values()].sort((a,l)=>a.ts-l.ts)}const lt=30*864e5-36e5;async function Ht(e,t,n){
const o=Math.floor(Math.max(t,n-lt)/6e4)*6e4,r=new Map;for(let i=o;i<=n;i+=6e7){const c=await Z(e,"1m",1e3,{startTime:i,endTime:Math.min(n,i+6e7-1)});for(const a of c)
r.set(a.ts,a);i+6e7<=n&&await new Promise(a=>setTimeout(a,120))}return{bars:[...r.values()].sort((i,c)=>i.ts-c.ts),clampedFrom:o}}const ut=(e,t,n)=>e-(t+n)/2;async function ht(e=4e3,t=Date.
now){const n=t(),s=await Promise.race([Y("/api/v2/public/time"),new Promise(i=>setTimeout(()=>i(null),e))]).catch(()=>null),o=t(),r=Number(s==null?void 0:s.serverTime);
return!Number.isFinite(r)||o-n>e?null:ut(r,n,o)}async function Yt(e,t=100){return(await Y(`/api/v2/mix/market/history-fund-rate?symbol=${e}&productType=usdt-fut\
ures&pageSize=${t}`)??[]).map(s=>({ts:Number(s.fundingTime),rate:Number(s.fundingRate)})).filter(s=>Number.isFinite(s.ts)&&Number.isFinite(s.rate))}async function ft(e){
const t=await Y(`/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${e}`),n=Array.isArray(t)?t[0]:t;return n?{last:+n.lastPr,mark:+(n.markPrice??n.lastPr),
change24h:+(n.change24h??0),funding:+(n.fundingRate??0),bid:+n.bidPr,ask:+n.askPr}:null}const dt="wss://ws.bitget.com/v2/ws/public";function mt(e){const n=(Array.
isArray(e==null?void 0:e.data)?e.data:[]).map(s=>({ts:+s.ts,price:+s.price,qty:+s.size,side:s.side==="sell"?"sell":"buy",...s.tradeId!==void 0?{id:String(s.tradeId)}:
{}}));return n.reverse(),{trades:n,snapshot:(e==null?void 0:e.action)==="snapshot"}}class pt{constructor(t=5e3){S(this,"seen",new Set);this.max=t}filter(t){const n=[];
for(const s of t){if(s.id===void 0){n.push(s);continue}this.seen.has(s.id)||(this.seen.add(s.id),n.push(s))}if(this.seen.size>this.max){let s=this.seen.size-this.
max;for(const o of this.seen){if(s--<=0)break;this.seen.delete(o)}}return n}}class gt{constructor(t,n){S(this,"ws",null);S(this,"closed",!1);S(this,"attempt",0);
S(this,"ping",null);S(this,"lastPong",0);S(this,"connectedAt",0);S(this,"lastMsgAt",0);this.symbol=t,this.h=n}start(){this.closed=!1,this.open()}stop(){var t,n,
s;this.closed=!0,this.ping&&clearInterval(this.ping),(t=this.ws)==null||t.close(),this.ws=null,(s=(n=this.h).status)==null||s.call(n,"closed")}open(){var n,s;if(this.
closed)return;(s=(n=this.h).status)==null||s.call(n,this.attempt?"reconnecting":"connecting");let t;try{t=new WebSocket(dt)}catch{return this.retry()}this.ws=t,
t.onopen=()=>{var r,i;this.attempt=0,this.connectedAt=Date.now();const o=["ticker","books15","trade"].map(c=>({instType:"USDT-FUTURES",channel:c,instId:this.symbol}));
t.send(JSON.stringify({op:"subscribe",args:o})),this.lastPong=Date.now(),this.ping=setInterval(()=>{if(t.readyState===1){if(Date.now()-this.lastPong>2*25e3+5e3){
t.close();return}t.send("ping")}},25e3),(i=(r=this.h).status)==null||i.call(r,"live")},t.onmessage=o=>{var l,b,D,h,w,x,M;this.lastMsgAt=Date.now();const r=typeof o.
data=="string"?o.data:"";if(r==="pong"){this.lastPong=Date.now();return}if(!r)return;let i;try{i=JSON.parse(r)}catch{return}const c=(l=i==null?void 0:i.arg)==null?
void 0:l.channel,a=i==null?void 0:i.data;if(!(!c||!Array.isArray(a)||!a.length)){if(c==="ticker"){const u=a[0];(D=(b=this.h).ticker)==null||D.call(b,{last:+u.lastPr,
mark:+(u.markPrice??u.lastPr),funding:+(u.fundingRate??0),change24h:+(u.change24h??0),bid:+u.bidPr,ask:+u.askPr})}else if(c==="books15"){const u=a[0];(w=(h=this.
h).book)==null||w.call(h,{bids:(u.bids??[]).map(p=>[+p[0],+p[1]]),asks:(u.asks??[]).map(p=>[+p[0],+p[1]]),ts:+u.ts})}else if(c==="trade"){const u=mt(i);(M=(x=this.
h).trades)==null||M.call(x,u.trades,u.snapshot)}}},t.onclose=()=>{this.ping&&clearInterval(this.ping),this.closed||this.retry()},t.onerror=()=>t.close()}retry(){
var n,s;(s=(n=this.h).status)==null||s.call(n,"reconnecting");const t=Math.min(3e4,1e3*2**this.attempt++);setTimeout(()=>this.open(),t)}}const St=[{symbol:"BTCU\
SDT",qtyStep:1e-4,dp:1},{symbol:"ETHUSDT",qtyStep:.01,dp:2},{symbol:"SOLUSDT",qtyStep:.1,dp:3},{symbol:"XRPUSDT",qtyStep:1,dp:4},{symbol:"DOGEUSDT",qtyStep:1,dp:5},
{symbol:"BNBUSDT",qtyStep:.01,dp:2},{symbol:"ADAUSDT",qtyStep:1,dp:4},{symbol:"LINKUSDT",qtyStep:1,dp:3},{symbol:"AVAXUSDT",qtyStep:.1,dp:3},{symbol:"SUIUSDT",qtyStep:.1,
dp:4}],zt=5,tt=e=>Math.max(0,Math.round(-Math.log10(e))),Gt=e=>{const t=St.find(n=>n.symbol===e)??{symbol:e,qtyStep:.001,dp:2};return{...t,qdp:tt(t.qtyStep)}},Jt=(e,t)=>{
const n=tt(t);return Number((Math.floor(e/t+1e-9)*t).toFixed(n))},Kt=["1m","5m","15m","1h"],j={"1m":6e4,"5m":3e5,"15m":9e5,"1h":36e5},k=6e4;class Q{constructor(t=1500){
S(this,"b",new Map);S(this,"coverFrom",1/0);S(this,"gaps",[]);S(this,"downSince",null);this.maxBuckets=t}reset(){this.b.clear(),this.coverFrom=1/0,this.gaps=[],
this.downSince=null}connected(t){const n=Math.ceil(t/k)*k;if(!Number.isFinite(this.coverFrom))this.coverFrom=n;else if(this.downSince!==null){const s=Math.floor(
this.downSince/k)*k;n>s&&this.gaps.push([s,n])}this.downSince=null}get awaitingConnect(){return!Number.isFinite(this.coverFrom)||this.downSince!==null}disconnected(t){
this.downSince===null&&Number.isFinite(this.coverFrom)&&(this.downSince=t)}add(t){for(const n of t){const s=Math.floor(n.ts/k)*k,o=this.b.get(s)??{buy:0,sell:0,
n:0};n.side==="buy"?o.buy+=n.qty:o.sell+=n.qty,o.n++,this.b.set(s,o)}if(this.b.size>this.maxBuckets){const n=[...this.b.keys()].sort((o,r)=>o-r);for(const o of n.
slice(0,this.b.size-this.maxBuckets))this.b.delete(o);const s=n[n.length-this.b.size];this.gaps=this.gaps.filter(([,o])=>o>s),this.coverFrom=Math.max(this.coverFrom,
s)}}covers(t,n){if(t<this.coverFrom)return!1;const s=t+n;return this.downSince!==null&&s>Math.floor(this.downSince/k)*k?!1:!this.gaps.some(([o,r])=>t<r&&s>o)}pressure(t,n,s=1){
if(!this.covers(t,n))return null;let o=0,r=0,i=0;for(let a=Math.floor(t/k)*k;a<t+n;a+=k){const l=this.b.get(a);l&&(o+=l.buy,r+=l.sell,i+=l.n)}if(i<s)return null;
const c=o+r;return{buy:o,sell:r,net:o-r,ratio:c>0?o/c:.5,source:"trades"}}}function yt(e,t,n){return e.length?Math.floor(t/n)*n>e[e.length-1].ts+n:!1}const bt=3e4;
function Tt(e,t,n,s,o=bt){if(!e.length)return!1;if(yt(e,t,n))return!0;const r=Math.floor(t/n)*n;return r>e[e.length-1].ts&&s<r-o}function wt(e,t,n,s,o){if(!e.length)
return e;const r=Math.floor(s/o)*o,i=e[e.length-1];if(r>i.ts+o)return e;if(r>i.ts)return[...e.slice(-499),{ts:r,open:i.close,high:Math.max(i.close,t),low:Math.min(
i.close,t),close:t,volume:n}];if(r<i.ts)return e;const c={...i,close:t,high:Math.max(i.high,t),low:Math.min(i.low,t),volume:i.volume+n};return[...e.slice(0,-1),
c]}function Wt(e,t){const[n,s]=B([]),[o,r]=B(null),i=v(e),c=v(e),[a,l]=B(null),[b,D]=B("connecting"),[h,w]=B(""),[x,M]=B(0),u=v(new Q),p=v(0),I=v(!1),_=v(t);_.current=
t;const q=v([]);q.current=n;const O=v(()=>{}),g=v(0);H(()=>{u.current=new Q,l(null);let f=!1;const y=new pt,T=new gt(e,{status:d=>{D(d),(d==="reconnecting"||d===
"closed")&&u.current.disconnected((T.lastMsgAt||Date.now())+p.current)},ticker:d=>r(m=>({...(m==null?void 0:m.sym)===e?m:d,...d,sym:e})),book:d=>{c.current=e,l(
d)},trades:(d,m)=>{const N=y.filter(d);if(!d.length)return;const E=d[d.length-1];if(m||(p.current=E.ts-Date.now(),I.current=!0),m){u.current.connected(E.ts);return}
if(u.current.awaitingConnect&&u.current.connected(d[0].ts),!N.length)return;u.current.add(N),f=!0;const P=N[N.length-1];U(P.price,N.reduce((z,et)=>z+et.qty,0),P.
ts)}});T.start();const F=setInterval(()=>{f&&(f=!1,M(d=>d+1))},1e3);return()=>{T.stop(),clearInterval(F)}},[e]);function U(f,y,T){const F=j[_.current]??9e5;if(Tt(
q.current,T,F,g.current)){O.current();return}q.current.length&&(g.current=Math.max(g.current,T)),s(d=>wt(d,f,y,T,F))}H(()=>{let f=!0;s([]);const y=d=>Z(e,t).then(
m=>{!f||!m.length||(w(""),g.current=Math.max(g.current,Date.now()+p.current),i.current=e,s(N=>{if(d||!N.length)return m;const E=m[m.length-1],P=N[N.length-1];if(P.
ts>E.ts)return[...m,P];if(P.ts===E.ts){const z={...E,high:Math.max(E.high,P.high),low:Math.min(E.low,P.low),close:P.close,volume:Math.max(E.volume,P.volume)};return[
...m.slice(0,-1),z]}return m}))}).catch(m=>f&&w(String((m==null?void 0:m.message)??m)));y(!0);let T=0;O.current=()=>{Date.now()-T>3e3&&(T=Date.now(),y(!1))};const F=setInterval(
()=>y(!1),2e4);return()=>{f=!1,clearInterval(F)}},[e,t]),H(()=>{let f=!0;const y=()=>ft(e).then(F=>{!f||!F||(r({...F,sym:e}),b!=="live"&&U(F.last,0,Date.now()+p.
current))}).catch(()=>{});y();const T=setInterval(y,b==="live"?1e4:2500);return()=>{f=!1,clearInterval(T)}},[e,b]);const R=v(null),$=()=>R.current??(R.current=ht().
then(f=>{f!==null&&(p.current=f,I.current=!0)}).finally(()=>{R.current=null}));H(()=>{$();const f=setInterval(()=>{I.current||$()},15e3);return()=>clearInterval(
f)},[]);const L=j[t]??9e5,C=()=>Date.now()+p.current;return{candles:i.current===e?n:[],ticker:(o==null?void 0:o.sym)===e?o:null,book:c.current===e?a:null,status:b,
err:h,tape:u,tapeVer:x,intervalMs:L,serverNow:C,syncClock:$,clockSynced:()=>I.current}}function Mt(e,t,n){var l,b;const s=Math.max(e.top,e.bottom),o=Math.min(e.
top,e.bottom);let r=t.findIndex(D=>D.ts>=e.startTs);r<0&&(r=Math.max(0,t.length-60));const i=Math.max(0,t.length-1),c=t.length>1?ot(t.slice(-80),14):NaN,a=Number.
isFinite(c)?c:0;return{top:String(s),bottom:String(o),mid:String((s+o)/2),height:String(s-o),startTime:((l=t[r])==null?void 0:l.ts)??e.startTs,endTime:((b=t[i])==
null?void 0:b.ts)??e.startTs,startIndex:r,endIndex:i,touchesTop:2,touchesBottom:2,topPivots:[],bottomPivots:[],atr:a,heightAtr:a>0?(s-o)/a:0,insideShare:1,tolerancePct:n,
isRange:!0}}const kt=150;function xt(e,t,n){return n??(e.length>11?J(e.slice(0,-1),t):null)}const Rt=1500,Ft=(e,t,n)=>n<e+t+Rt;function Xt(e,t,n,s,o,r,i,c){const a=A(
()=>({lookback:r.lookback,tolerancePct:r.tolerancePct,pivotLeft:r.pivotLeft,pivotRight:r.pivotRight,minTouches:r.minTouches,minHeightPct:r.minHeightPct}),[r.lookback,
r.tolerancePct,r.pivotLeft,r.pivotRight,r.minTouches,r.minHeightPct]),l=A(()=>({requireRange:r.requireRange,tickSize:(10**-c).toFixed(c),feeRate:at,slippageBps:it}),
[r.requireRange,c]),b=e[e.length-1],D=!!b&&Ft(b.ts,t,o()),h=A(()=>D?e.slice(0,-1):e,[e,D]),w=A(()=>e.map(g=>n.current.pressure(g.ts,t)??rt(g)),[e,s,t]),x=h.length?
`${h[h.length-1].ts}:${h.length}`:"",M=A(()=>i?Mt(i,h,r.tolerancePct):null,[i,x,r.tolerancePct]),u=A(()=>M??(h.length>10?J(h,a):null),[x,a,M]),p=A(()=>xt(h,a,M),
[x,a,M]),I=A(()=>{const g=[],U=h.length;let R=new Set;if(U<30)return{out:g,prevAtLast:R};const $=w.slice(0,U);for(let L=Math.max(25,U-kt);L<U-1;L++){const C=M??
J(h.slice(0,L),a);if(!C){R=new Set;continue}const f=K(h.slice(0,L+1),$.slice(0,L+1),C,l);g.push(...f.filter(y=>!R.has(y.type))),R=new Set(f.map(y=>y.type))}return{
out:g,prevAtLast:R}},[x,a,l,M]),_=A(()=>!p||h.length<3?[]:K(h,w.slice(0,h.length),p,l).filter(g=>!I.prevAtLast.has(g.type)),[x,p,l,w,I]),q=A(()=>[...I.out,..._],
[I,_]),O=w.filter(g=>g.source==="trades").length;return{closed:h,pressures:w,box:u,signalBox:p,live:_,history:q,tapeCandles:O}}function Vt(e,t){try{const n=localStorage.
getItem(e);return n?{...t,...JSON.parse(n)}:t}catch{return t}}function jt(e){try{const t=localStorage.getItem(e);return t?JSON.parse(t):null}catch{return null}}
function Qt(e,t){try{t==null?localStorage.removeItem(e):localStorage.setItem(e,JSON.stringify(t))}catch{}}const Zt={symbol:"BTCUSDT",tf:"15m",riskPct:1,leverage:10,
autoPaper:!1,moveSlToBe:!0,maxAdds:2,addSizePct:50,lookback:80,tolerancePct:.25,pivotLeft:3,pivotRight:3,minTouches:2,minHeightPct:.6,requireRange:!0,notify:!1,
showHist:!0},Pt=3e4,vt=15e3,At=3,Dt=12e4,It=e=>[...new Set([...e.positions.map(t=>t.symbol),...e.pending.map(t=>t.symbol)])],Nt=(e,t)=>e.positions.some(n=>n.symbol===
t)||e.pending.some(n=>n.symbol===t);function Et(e,t){var o;const n=Math.min(...e.positions.filter(r=>r.symbol===t).map(r=>r.openedAt),...e.pending.filter(r=>r.symbol===
t).map(r=>r.createdAt)),s=(o=e.lastTickTs)==null?void 0:o[t];return s===void 0?n:Number.isFinite(n)?Math.max(s,n):s}class te{constructor(t=Pt,n=vt,s=At){S(this,
"replaying",new Set);S(this,"fails",{});this.gapMs=t,this.retryMs=n,this.maxFails=s}needsReplay(t,n,s){const o=Et(t,n);return Nt(t,n)&&Number.isFinite(o)&&s-o>this.
gapMs}tick(t,n,s){return this.replaying.has(n)?"replaying":this.needsReplay(t,n,s)?"gap":"live"}begin(t,n){const s=r=>{const i=this.fails[r];if(!i)return!0;const c=Math.
min(this.retryMs*2**Math.max(0,i.n-1),Dt);return n-i.at>c||i.at>n},o=It(t).filter(r=>!this.replaying.has(r)&&this.needsReplay(t,r,n)&&s(r));return o.forEach(r=>this.
replaying.add(r)),o}succeeded(t){delete this.fails[t]}failed(t,n,s=!0){var r;const o=(r=this.fails)[t]??(r[t]={n:0,at:0});return s&&(o.n+=1),o.at=n,s&&o.n===this.
maxFails}release(t){this.replaying.delete(t)}}export{Zt as D,zt as M,te as R,St as S,Kt as T,jt as a,Xt as b,ft as c,Qt as d,Ot as e,qt as f,Ht as g,At as h,Jt as i,Yt as j,Vt as l,Ct as m,$t as p,Et as r,Gt as s,
Wt as u};
