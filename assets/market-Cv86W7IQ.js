var Tt=Object.defineProperty;var vt=(e,t,s)=>t in e?Tt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var T=(e,t,s)=>vt(e,typeof t!="symbol"?t+"":t,s);import{useState as j,useRef as P,useEffect as C,useMemo as $}from"react";import{p as xt,d as st,g as ot,a as At}from"./strategy-Cu9CvPGE.js";import{S as Pt,T as Ft}from"./paper-D3VIHvZr.js";const Me=(e,t=2)=>{const s=typeof e=="string"?Number(e):e;return s==null||!Number.isFinite(s)?"\u2014":s.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t})},
_e=(e,t=2)=>Number.isFinite(e)?`${e>=0?"+":""}${(e*100).toFixed(t)}%`:"\u2014",Te=(e,t=2)=>{if(!Number.isFinite(e))return"\u2014";const s=Number(e.toFixed(t));return s===
0?0 .toFixed(t):`${s>0?"+":""}${s.toFixed(t)}`},Rt=e=>new Date(e).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:!1}),ve=e=>{const t=new Date(
e);return`${t.getMonth()+1}/${t.getDate()} ${Rt(e)}`},it="https://api.bitget.com",Z="/dupont-mobile/bgapi";let at=!1;async function W(e){const t=at?[Z,it]:[it,Z];
let s;for(const n of t)try{const r=await fetch(n+e,{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);const o=await r.json();if(o.code!=="00000")throw new Error(
o.msg||"bitget error");return at=n===Z,o.data}catch(r){s=r}throw s}const ct={"1m":{api:"1m",sec:60},"5m":{api:"5m",sec:300},"15m":{api:"15m",sec:900},"1h":{api:"\
1H",sec:3600}};async function St(e,t,s=300,n){const r=ct[t]??ct["15m"],o=n?`&startTime=${Math.floor(n.startTime)}&endTime=${Math.floor(n.endTime)}`:"",i=await W(
`/api/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${e}&granularity=${r.api}&limit=${s}${o}`),c=new Map;for(const a of i){const f={ts:Number(a[0]),open:+a[1],
high:+a[2],low:+a[3],close:+a[4],volume:+a[5]};Number.isFinite(f.ts)&&c.set(f.ts,f)}return[...c.values()].sort((a,f)=>a.ts-f.ts)}const Et=30*864e5-36e5;async function xe(e,t,s){
const r=Math.floor(Math.max(t,s-Et)/6e4)*6e4,o=new Map;for(let i=r;i<=s;i+=6e7){const c=await St(e,"1m",1e3,{startTime:i,endTime:Math.min(s,i+6e7-1)});for(const a of c)
o.set(a.ts,a);i+6e7<=s&&await new Promise(a=>setTimeout(a,120))}return{bars:[...o.values()].sort((i,c)=>i.ts-c.ts),clampedFrom:r}}const It=(e,t,s)=>e-(t+s)/2;async function Dt(e=4e3,t=Date.
now){const s=t(),n=await Promise.race([W("/api/v2/public/time"),new Promise(i=>setTimeout(()=>i(null),e))]).catch(()=>null),r=t(),o=Number(n==null?void 0:n.serverTime);
return!Number.isFinite(o)||r-s>e?null:It(o,s,r)}async function Ae(e,t=100){return(await W(`/api/v2/mix/market/history-fund-rate?symbol=${e}&productType=usdt-fut\
ures&pageSize=${t}`)??[]).map(n=>({ts:Number(n.fundingTime),rate:Number(n.fundingRate)})).filter(n=>Number.isFinite(n.ts)&&Number.isFinite(n.rate))}async function Nt(e){
const t=await W(`/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${e}`),s=Array.isArray(t)?t[0]:t;return s?{last:+s.lastPr,mark:+(s.markPrice??s.lastPr),
change24h:+(s.change24h??0),funding:+(s.fundingRate??0),bid:+s.bidPr,ask:+s.askPr}:null}const qt="wss://ws.bitget.com/v2/ws/public";function Ot(e){const s=(Array.
isArray(e==null?void 0:e.data)?e.data:[]).map(n=>({ts:+n.ts,price:+n.price,qty:+n.size,side:n.side==="sell"?"sell":"buy",...n.tradeId!==void 0?{id:String(n.tradeId)}:
{}}));return s.reverse(),{trades:s,snapshot:(e==null?void 0:e.action)==="snapshot"}}class $t{constructor(t=5e3){T(this,"seen",new Set);this.max=t}filter(t){const s=[];
for(const n of t){if(n.id===void 0){s.push(n);continue}this.seen.has(n.id)||(this.seen.add(n.id),s.push(n))}if(this.seen.size>this.max){let n=this.seen.size-this.
max;for(const r of this.seen){if(n--<=0)break;this.seen.delete(r)}}return s}}class Bt{constructor(t,s){T(this,"ws",null);T(this,"closed",!1);T(this,"attempt",0);
T(this,"ping",null);T(this,"lastPong",0);T(this,"connectedAt",0);T(this,"lastMsgAt",0);this.symbol=t,this.h=s}start(){this.closed=!1,this.open()}stop(){var t,s,
n;this.closed=!0,this.ping&&clearInterval(this.ping),(t=this.ws)==null||t.close(),this.ws=null,(n=(s=this.h).status)==null||n.call(s,"closed")}open(){var s,n;if(this.
closed)return;(n=(s=this.h).status)==null||n.call(s,this.attempt?"reconnecting":"connecting");let t;try{t=new WebSocket(qt)}catch{return this.retry()}this.ws=t,
t.onopen=()=>{var o,i;this.attempt=0,this.connectedAt=Date.now();const r=["ticker","books15","trade"].map(c=>({instType:"USDT-FUTURES",channel:c,instId:this.symbol}));
t.send(JSON.stringify({op:"subscribe",args:r})),this.lastPong=Date.now(),this.ping=setInterval(()=>{if(t.readyState===1){if(Date.now()-this.lastPong>2*25e3+5e3){
t.close();return}t.send("ping")}},25e3),(i=(o=this.h).status)==null||i.call(o,"live")},t.onmessage=r=>{var f,p,v,h,m,S,R;this.lastMsgAt=Date.now();const o=typeof r.
data=="string"?r.data:"";if(o==="pong"){this.lastPong=Date.now();return}if(!o)return;let i;try{i=JSON.parse(o)}catch{return}const c=(f=i==null?void 0:i.arg)==null?
void 0:f.channel,a=i==null?void 0:i.data;if(!(!c||!Array.isArray(a)||!a.length)){if(c==="ticker"){const k=a[0];(v=(p=this.h).ticker)==null||v.call(p,{last:+k.lastPr,
mark:+(k.markPrice??k.lastPr),funding:+(k.fundingRate??0),change24h:+(k.change24h??0),bid:+k.bidPr,ask:+k.askPr})}else if(c==="books15"){const k=a[0];(m=(h=this.
h).book)==null||m.call(h,{bids:(k.bids??[]).map(u=>[+u[0],+u[1]]),asks:(k.asks??[]).map(u=>[+u[0],+u[1]]),ts:+k.ts})}else if(c==="trade"){const k=Ot(i);(R=(S=this.
h).trades)==null||R.call(S,k.trades,k.snapshot)}}},t.onclose=()=>{this.ping&&clearInterval(this.ping),this.closed||this.retry()},t.onerror=()=>t.close()}retry(){
var s,n;(n=(s=this.h).status)==null||n.call(s,"reconnecting");const t=Math.min(3e4,1e3*2**this.attempt++);setTimeout(()=>this.open(),t)}}const Lt=[{symbol:"BTCU\
SDT",qtyStep:1e-4,dp:1},{symbol:"ETHUSDT",qtyStep:.01,dp:2},{symbol:"SOLUSDT",qtyStep:.1,dp:3},{symbol:"XRPUSDT",qtyStep:1,dp:4},{symbol:"DOGEUSDT",qtyStep:1,dp:5},
{symbol:"BNBUSDT",qtyStep:.01,dp:2},{symbol:"ADAUSDT",qtyStep:1,dp:4},{symbol:"LINKUSDT",qtyStep:1,dp:3},{symbol:"AVAXUSDT",qtyStep:.1,dp:3},{symbol:"SUIUSDT",qtyStep:.1,
dp:4}],Pe=5,wt=e=>Math.max(0,Math.round(-Math.log10(e))),Fe=e=>{const t=Lt.find(s=>s.symbol===e)??{symbol:e,qtyStep:.001,dp:2};return{...t,qdp:wt(t.qtyStep)}},Re=(e,t)=>{
const s=wt(t);return Number((Math.floor(e/t+1e-9)*t).toFixed(s))},Ee=["1m","5m","15m","1h"],ut={"1m":6e4,"5m":3e5,"15m":9e5,"1h":36e5},E=6e4;class lt{constructor(t=1500){
T(this,"b",new Map);T(this,"coverFrom",1/0);T(this,"gaps",[]);T(this,"downSince",null);this.maxBuckets=t}reset(){this.b.clear(),this.coverFrom=1/0,this.gaps=[],
this.downSince=null}connected(t){const s=Math.ceil(t/E)*E;if(!Number.isFinite(this.coverFrom))this.coverFrom=s;else if(this.downSince!==null){const n=Math.floor(
this.downSince/E)*E;s>n&&this.gaps.push([n,s])}this.downSince=null}get awaitingConnect(){return!Number.isFinite(this.coverFrom)||this.downSince!==null}disconnected(t){
this.downSince===null&&Number.isFinite(this.coverFrom)&&(this.downSince=t)}add(t){for(const s of t){const n=Math.floor(s.ts/E)*E,r=this.b.get(n)??{buy:0,sell:0,
n:0};s.side==="buy"?r.buy+=s.qty:r.sell+=s.qty,r.n++,this.b.set(n,r)}if(this.b.size>this.maxBuckets){const s=[...this.b.keys()].sort((r,o)=>r-o);for(const r of s.
slice(0,this.b.size-this.maxBuckets))this.b.delete(r);const n=s[s.length-this.b.size];this.gaps=this.gaps.filter(([,r])=>r>n),this.coverFrom=Math.max(this.coverFrom,
n)}}covers(t,s){if(t<this.coverFrom)return!1;const n=t+s;return this.downSince!==null&&n>Math.floor(this.downSince/E)*E?!1:!this.gaps.some(([r,o])=>t<o&&n>r)}stats(t,s){
if(!this.covers(t,s))return null;let n=0,r=0,o=0;for(let i=Math.floor(t/E)*E;i<t+s;i+=E){const c=this.b.get(i);c&&(n+=c.buy,r+=c.sell,o+=c.n)}return{buy:n,sell:r,
n:o}}pressure(t,s,n=1){if(!this.covers(t,s))return null;let r=0,o=0,i=0;for(let a=Math.floor(t/E)*E;a<t+s;a+=E){const f=this.b.get(a);f&&(r+=f.buy,o+=f.sell,i+=
f.n)}if(i<n)return null;const c=r+o;return{buy:r,sell:o,net:r-o,ratio:c>0?r/c:.5,source:"trades"}}}function Ut(e,t,s){return e.length?Math.floor(t/s)*s>e[e.length-
1].ts+s:!1}const Ct=3e4;function jt(e,t,s,n,r=Ct){if(!e.length)return!1;if(Ut(e,t,s))return!0;const o=Math.floor(t/s)*s;return o>e[e.length-1].ts&&n<o-r}function Ht(e,t,s,n,r){
if(!e.length)return e;const o=Math.floor(n/r)*r,i=e[e.length-1];if(o>i.ts+r)return e;if(o>i.ts)return[...e.slice(-499),{ts:o,open:i.close,high:Math.max(i.close,
t),low:Math.min(i.close,t),close:t,volume:s}];if(o<i.ts)return e;const c={...i,close:t,high:Math.max(i.high,t),low:Math.min(i.low,t),volume:i.volume+s};return[...e.
slice(0,-1),c]}function Ie(e,t){const[s,n]=j([]),[r,o]=j(null),i=P({symbol:e,at:0});i.current.symbol!==e&&(i.current={symbol:e,at:performance.now()});const c=P(
e),a=P(e),[f,p]=j(null),[v,h]=j("connecting"),[m,S]=j(""),[R,k]=j(0),u=P(new lt),l=P(0),d=P(!1),x=P(t);x.current=t;const b=P([]);b.current=s;const y=P(()=>{}),A=P(
0);C(()=>{u.current=new lt,p(null);let w=!1;const N=new $t,D=new Bt(e,{status:M=>{h(M),(M==="reconnecting"||M==="closed")&&u.current.disconnected((D.lastMsgAt||
Date.now())+l.current)},ticker:M=>o(_=>({...(_==null?void 0:_.sym)===e?_:M,...M,sym:e,at:performance.now()})),book:M=>{a.current=e,p(M)},trades:(M,_)=>{const B=N.
filter(M);if(!M.length)return;const L=M[M.length-1];if(_||(l.current=L.ts-Date.now(),d.current=!0),_){u.current.connected(L.ts);return}if(u.current.awaitingConnect&&
u.current.connected(M[0].ts),!B.length)return;u.current.add(B),w=!0;const O=B[B.length-1];I(O.price,B.reduce((Q,_t)=>Q+_t.qty,0),O.ts)}});D.start();const q=setInterval(
()=>{w&&(w=!1,k(M=>M+1))},1e3);return()=>{D.stop(),clearInterval(q)}},[e]);function I(w,N,D){const q=ut[x.current]??9e5;if(jt(b.current,D,q,A.current)){y.current();
return}b.current.length&&(A.current=Math.max(A.current,D)),n(M=>Ht(M,w,N,D,q))}C(()=>{let w=!0;n([]);const N=M=>St(e,t).then(_=>{!w||!_.length||(S(""),A.current=
Math.max(A.current,Date.now()+l.current),c.current=e,n(B=>{if(M||!B.length)return _;const L=_[_.length-1],O=B[B.length-1];if(O.ts>L.ts)return[..._,O];if(O.ts===
L.ts){const Q={...L,high:Math.max(L.high,O.high),low:Math.min(L.low,O.low),close:O.close,volume:Math.max(L.volume,O.volume)};return[..._.slice(0,-1),Q]}return _}))}).
catch(_=>w&&S(String((_==null?void 0:_.message)??_)));N(!0);let D=0;y.current=()=>{Date.now()-D>3e3&&(D=Date.now(),N(!1))};const q=setInterval(()=>N(!1),2e4);return()=>{
w=!1,clearInterval(q)}},[e,t]),C(()=>{let w=!0;const N=()=>Nt(e).then(q=>{!w||!q||(o({...q,sym:e,at:performance.now()}),v!=="live"&&I(q.last,0,Date.now()+l.current))}).
catch(()=>{});N();const D=setInterval(N,v==="live"?1e4:2500);return()=>{w=!1,clearInterval(D)}},[e,v]);const g=P(null),F=()=>g.current??(g.current=Dt().then(w=>{
w!==null&&(l.current=w,d.current=!0)}).finally(()=>{g.current=null}));C(()=>{F();const w=setInterval(()=>{d.current||F()},15e3);return()=>clearInterval(w)},[]);
const U=ut[t]??9e5,z=()=>Date.now()+l.current;return{candles:c.current===e?s:[],ticker:(r==null?void 0:r.sym)===e&&(r.at??0)>=i.current.at?r:null,book:a.current===
e?f:null,status:v,err:m,tape:u,tapeVer:R,intervalMs:U,serverNow:z,syncClock:F,clockSynced:()=>d.current}}function Kt(e,t,s){var f,p;const n=Math.max(e.top,e.bottom),
r=Math.min(e.top,e.bottom);let o=t.findIndex(v=>v.ts>=e.startTs);o<0&&(o=Math.max(0,t.length-60));const i=Math.max(0,t.length-1),c=t.length>1?At(t.slice(-80),14):
NaN,a=Number.isFinite(c)?c:0;return{top:String(n),bottom:String(r),mid:String((n+r)/2),height:String(n-r),startTime:((f=t[o])==null?void 0:f.ts)??e.startTs,endTime:((p=
t[i])==null?void 0:p.ts)??e.startTs,startIndex:o,endIndex:i,touchesTop:2,touchesBottom:2,topPivots:[],bottomPivots:[],atr:a,heightAtr:a>0?(n-r)/a:0,insideShare:1,
tolerancePct:s,isRange:!0}}const zt=150;function Gt(e,t,s){return s??(e.length>11?st(e.slice(0,-1),t):null)}const Yt=1500,Jt=(e,t,s)=>s<e+t+Yt;function De(e,t,s,n,r,o,i,c){
const a=$(()=>({lookback:o.lookback,tolerancePct:o.tolerancePct,pivotLeft:o.pivotLeft,pivotRight:o.pivotRight,minTouches:o.minTouches,minHeightPct:o.minHeightPct}),
[o.lookback,o.tolerancePct,o.pivotLeft,o.pivotRight,o.minTouches,o.minHeightPct]),f=$(()=>({requireRange:o.requireRange,tickSize:(10**-c).toFixed(c),feeRate:Ft,
slippageBps:Pt}),[o.requireRange,c]),p=e[e.length-1],v=!!p&&Jt(p.ts,t,r()),h=$(()=>v?e.slice(0,-1):e,[e,v]),m=$(()=>e.map(y=>s.current.pressure(y.ts,t)??xt(y)),
[e,n,t]),S=h.length?`${h[h.length-1].ts}:${h.length}`:"",R=$(()=>i?Kt(i,h,o.tolerancePct):null,[i,S,o.tolerancePct]),k=$(()=>R??(h.length>10?st(h,a):null),[S,a,
R]),u=$(()=>Gt(h,a,R),[S,a,R]),l=$(()=>{const y=[],A=h.length;let I=new Set;if(A<30)return{out:y,prevAtLast:I};const g=m.slice(0,A);for(let F=Math.max(25,A-zt);F<
A-1;F++){const U=R??st(h.slice(0,F),a);if(!U){I=new Set;continue}const z=ot(h.slice(0,F+1),g.slice(0,F+1),U,f);y.push(...z.filter(w=>!I.has(w.type))),I=new Set(
z.map(w=>w.type))}return{out:y,prevAtLast:I}},[S,a,f,R]),d=$(()=>!u||h.length<3?[]:ot(h,m.slice(0,h.length),u,f).filter(y=>!l.prevAtLast.has(y.type)),[S,u,f,m,l]),
x=$(()=>[...l.out,...d],[l,d]),b=m.filter(y=>y.source==="trades").length;return{closed:h,pressures:m,box:k,signalBox:u,live:d,history:x,tapeCandles:b}}function Ne(e,t){
try{const s=localStorage.getItem(e);return s?{...t,...JSON.parse(s)}:t}catch{return t}}function G(e){try{const t=localStorage.getItem(e);return t?JSON.parse(t):
null}catch{return null}}function H(e,t){try{t==null?localStorage.removeItem(e):localStorage.setItem(e,JSON.stringify(t))}catch{}}const qe={symbol:"BTCUSDT",tf:"\
15m",riskPct:1,leverage:10,autoPaper:!1,moveSlToBe:!0,maxAdds:2,addSizePct:50,lookback:80,tolerancePct:.25,pivotLeft:3,pivotRight:3,minTouches:2,minHeightPct:.6,
requireRange:!0,notify:!1,showHist:!0,sheetsUrl:"",sheetsToken:""},Xt=3e4,Vt=15e3,Wt=3,Qt=12e4,Zt=e=>[...new Set([...e.positions.map(t=>t.symbol),...e.pending.map(
t=>t.symbol)])],te=(e,t)=>e.positions.some(s=>s.symbol===t)||e.pending.some(s=>s.symbol===t);function ee(e,t){var r;const s=Math.min(...e.positions.filter(o=>o.
symbol===t).map(o=>o.openedAt),...e.pending.filter(o=>o.symbol===t).map(o=>o.createdAt)),n=(r=e.lastTickTs)==null?void 0:r[t];return n===void 0?s:Number.isFinite(
s)?Math.max(n,s):n}class Oe{constructor(t=Xt,s=Vt,n=Wt){T(this,"replaying",new Set);T(this,"fails",{});this.gapMs=t,this.retryMs=s,this.maxFails=n}needsReplay(t,s,n){
const r=ee(t,s);return te(t,s)&&Number.isFinite(r)&&n-r>this.gapMs}tick(t,s,n){return this.replaying.has(s)?"replaying":this.needsReplay(t,s,n)?"gap":"live"}begin(t,s){
const n=o=>{const i=this.fails[o];if(!i)return!0;const c=Math.min(this.retryMs*2**Math.max(0,i.n-1),Qt);return s-i.at>c||i.at>s},r=Zt(t).filter(o=>!this.replaying.
has(o)&&this.needsReplay(t,o,s)&&n(o));return r.forEach(o=>this.replaying.add(o)),r}succeeded(t){delete this.fails[t]}failed(t,s,n=!0){var o;const r=(o=this.fails)[t]??
(o[t]={n:0,at:0});return n&&(r.n+=1),r.at=s,n&&r.n===this.maxFails}release(t){this.replaying.delete(t)}}const se={tape_pressure:5e4,signals:2e4},ne=(e,t,s)=>`${e}\
|${t}|${s}`,J=(e,t,s,n)=>`${e}|${t}|${s}|${n}`;class kt{constructor(){T(this,"m",{tape_pressure:new Map,signals:new Map})}async get(t,s){return this.m[t].get(s)}async put(t,s){
this.m[t].set(s.key,s)}async count(t){return this.m[t].size}async deleteOldest(t,s){const n=[...this.m[t].values()].sort((r,o)=>r.tsMs-o.tsMs).slice(0,s);for(const r of n)
this.m[t].delete(r.key)}async all(t){return[...this.m[t].values()].sort((s,n)=>s.tsMs-n.tsMs)}}const re="dupont-journal",oe=1,Y=e=>new Promise((t,s)=>{e.onsuccess=
()=>t(e.result),e.onerror=()=>s(e.error)});class ie{constructor(t=indexedDB){T(this,"db");this.db=new Promise((s,n)=>{const r=t.open(re,oe);r.onupgradeneeded=()=>{
for(const o of["tape_pressure","signals"])r.result.objectStoreNames.contains(o)||r.result.createObjectStore(o,{keyPath:"key"}).createIndex("tsMs","tsMs")},r.onsuccess=
()=>s(r.result),r.onerror=()=>n(r.error)})}async store(t,s){return(await this.db).transaction(t,s).objectStore(t)}async get(t,s){return Y((await this.store(t,"r\
eadonly")).get(s))}async put(t,s){await Y((await this.store(t,"readwrite")).put(s))}async count(t){return Y((await this.store(t,"readonly")).count())}async deleteOldest(t,s){
if(s<=0)return;const n=await this.store(t,"readwrite");await new Promise((r,o)=>{let i=s;const c=n.index("tsMs").openCursor();c.onsuccess=()=>{const a=c.result;
if(!a||i<=0)return r();a.delete(),i--,a.continue()},c.onerror=()=>o(c.error)})}async all(t){return Y((await this.store(t,"readonly")).index("tsMs").getAll())}}class ht{constructor(t=new kt,s=se){
this.backend=t,this.caps=s}async addTape(t,s,n={}){const r=ne(t.symbol,t.tf,s);return await this.backend.get("tape_pressure",r)?!1:(await this.backend.put("tape\
_pressure",{...t,...n,key:r,tsMs:s}),await this.prune("tape_pressure"),!0)}async putSignal(t,s){const n=J(t.symbol,t.tf,t.kind,s),r=await this.backend.get("sign\
als",n),o=r!=null&&r.taken&&!t.taken?{...r}:{...t,key:n,tsMs:s};return await this.backend.put("signals",o),r||await this.prune("signals"),!r}async getSignal(t,s,n,r){
return this.backend.get("signals",J(t,s,n,r))}async prune(t){const n=await this.backend.count(t)-this.caps[t];return n>0&&await this.backend.deleteOldest(t,n),Math.
max(0,n)}all(t){return this.backend.all(t)}count(t){return this.backend.count(t)}}function ae(){try{if(typeof indexedDB<"u")return new ht(new ie(indexedDB))}catch{}
return new ht(new kt)}const ce="dupont-mobile/0.1.0-r12",nt=500,rt={trades:["ts_open","ts_close","symbol","tf","side","kind","entry","exit","qty","sl_initial","\
tp1","fees_usdt","pnl_usdt","r_multiple","exit_reason","adds","tape_ratio_at_entry","tape_source","app_version"],tape_pressure:["ts","symbol","tf","buy","sell",
"ratio","n_trades","source","gap"],signals:["ts","symbol","tf","kind","side","entry","sl","tp1","box_top","box_bottom","pressure_ratio","pressure_source","taken",
"skip_reason"]},dt=Object.keys(rt),tt={autoOff:"auto_paper_off",positionOpen:"position_open",pressureOhlcv:"pressure_ohlcv",lossCooldown:"loss_cooldown",dailyStop:"\
daily_stop",entryRefused:"entry_refused",notTaken:"not_taken"},X=e=>new Date(e).toISOString();function Mt(e,t){const s={};for(const n of rt[e])s[n]=t[n]??"";return s}
function ue(e,t,s){if(s.length>nt)throw new Error(`max ${nt} rows per call`);return JSON.stringify({token:e,tab:t,rows:s.map(n=>Mt(t,n))})}const le=e=>{if(e==null)
return"";const t=String(e);return/[",\n\r]/.test(t)?`"${t.replace(/"/g,'""')}"`:t};function $e(e,t){const s=rt[e];return[s.join(","),...t.map(n=>s.map(r=>le(n[r])).
join(","))].join(`
`)}const he=15e3,de=15*6e4,fe=2e4,pe=e=>Math.min(de,he*2**Math.max(0,e-1)),ft=e=>/^https:\/\/\S+$/.test(e.url.trim())&&e.token.trim().length>0,pt=()=>({trades:[],
tape_pressure:[],signals:[]});class me{constructor(t,s){T(this,"p");T(this,"busy",!1);T(this,"listeners",new Set);this.config=t,this.deps=s;const n=s.load();this.
p={queue:{...pt(),...(n==null?void 0:n.queue)??{}},fails:(n==null?void 0:n.fails)??0,nextAt:(n==null?void 0:n.nextAt)??0,last:n==null?void 0:n.last}}get pending(){
return dt.reduce((t,s)=>t+this.p.queue[s].length,0)}status(){return{...this.p.last??{},fails:this.p.fails,nextAt:this.p.nextAt,pending:this.pending}}subscribe(t){
return this.listeners.add(t),()=>{this.listeners.delete(t)}}queued(t){return this.p.queue[t]}persist(){this.deps.save(this.p);const t=this.status();this.listeners.
forEach(s=>s(t))}enqueue(t,s){if(!ft(this.config())||!s.length)return!1;this.p.queue[t].push(...s.map(r=>Mt(t,r)));let n=this.pending-fe;for(const r of["tape_pr\
essure","signals","trades"]){if(n<=0)break;const o=Math.min(n,this.p.queue[r].length);this.p.queue[r].splice(0,o),n-=o}return this.persist(),!0}clear(){this.p.queue=
pt(),this.p.fails=0,this.p.nextAt=0,this.persist()}async flush(t=!1){const s=this.config();if(!ft(s))return"off";if(this.busy)return"busy";if(!t&&this.deps.now()<
this.p.nextAt)return"wait";if(!this.pending)return"idle";this.busy=!0;try{for(const n of dt)for(;this.p.queue[n].length;){const r=this.p.queue[n].slice(0,nt);let o="",
i=0;try{const a=await this.deps.fetch(s.url.trim(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:ue(s.token.trim(),n,r)}),f=await a.text().
catch(()=>"");let p=null;try{p=JSON.parse(f)}catch{}a.ok?!p||p.ok!==!0?o=p!=null&&p.error?String(p.error):"\uC751\uB2F5 \uD615\uC2DD \uC624\uB958":i=Number(p.appended??
r.length):o=`HTTP ${a.status}`}catch(a){o=String((a==null?void 0:a.message)??a??"network")}const c=this.deps.now();if(o)return this.p.fails+=1,this.p.nextAt=c+pe(
this.p.fails),this.p.last={at:c,ok:!1,tab:n,error:o},this.persist(),"fail";this.p.queue[n].splice(0,r.length),this.p.fails=0,this.p.nextAt=0,this.p.last={at:c,ok:!0,
tab:n,appended:i},this.persist()}return"ok"}finally{this.busy=!1}}}const V=e=>Math.round(e*1e4)/1e4,K=e=>Math.round(e*1e8)/1e8;function ge(e,t,s,n){if(!n||n.n<1)
return null;const r=n.buy+n.sell;return{ts:X(s.ts),symbol:e,tf:t,buy:K(n.buy),sell:K(n.sell),ratio:r>0?V(n.buy/r):.5,n_trades:n.n,source:"trades",gap:!1}}function mt(e,t,s,n,r){
var o,i;return{ts:X(e.ts),symbol:t,tf:s,kind:e.type,side:e.side,entry:Number(e.entry),sl:Number(e.sl),tp1:e.targets[0]?Number(e.targets[0].price):"",box_top:(o=
e.box)!=null&&o.top?Number(e.box.top):"",box_bottom:(i=e.box)!=null&&i.bottom?Number(e.box.bottom):"",pressure_ratio:V(e.pressure.ratio),pressure_source:e.pressure.
source==="trades"?"trades":"ohlcv",taken:n,skip_reason:n?"":r}}function ye(e,t){const s=new Map;for(const r of e){const o=s.get(r.positionId)??[];o.push(r),s.set(
r.positionId,o)}const n=[];for(const[r,o]of s){const i=o.find(m=>m.final);if(!i)continue;const c=o.reduce((m,S)=>m+S.qty,0),a=m=>c>0?o.reduce((S,R)=>S+R[m]*R.qty,
0)/c:i[m],f=o.reduce((m,S)=>m+S.netPnl,0),p=i.riskUsd,v=[...new Set(o.map(m=>m.reason))],h=t[r];n.push({positionId:r,_t:i.closedAt,ts_open:X(Math.min(...o.map(m=>m.
openedAt))),ts_close:X(i.closedAt),symbol:i.symbol,tf:(h==null?void 0:h.tf)??"",side:i.side,kind:i.setup,entry:K(a("entry")),exit:K(a("exit")),qty:K(c),sl_initial:(h==
null?void 0:h.slInitial)??"",tp1:(h==null?void 0:h.tp1)??"",fees_usdt:V(o.reduce((m,S)=>m+S.fees,0)),pnl_usdt:V(f),r_multiple:p&&p>0?Math.round(f/p*1e3)/1e3:"",
exit_reason:v.join(" + "),adds:(h==null?void 0:h.adds)??0,tape_ratio_at_entry:(h==null?void 0:h.tapeRatio)??"",tape_source:(h==null?void 0:h.tapeSource)??"",app_version:ce})}
return n.sort((r,o)=>r._t-o._t).map(({_t:r,...o})=>o)}const gt="dupont.sheets.queue.v1",yt="dupont.journal.posmeta.v1",et="dupont.journal.tradesSent.v1",bt="dup\
ont.journal.pendingSignals.v1";function Be(e){const t=P(null);t.current||(t.current=ae());const s=P({url:e.url,token:e.token});s.current={url:e.url,token:e.token};
const n=P(null);n.current||(n.current=new me(()=>s.current,{fetch:(u,l)=>fetch(u,l),now:()=>Date.now(),load:()=>G(gt),save:u=>H(gt,u)}));const[r,o]=j(()=>n.current.
status());C(()=>n.current.subscribe(o),[]);const i=P(G(yt)??{}),c=P(new Set),a=P(G(bt)??[]),f=()=>H(bt,a.current),p=()=>{const u=e.serverNow(),l=a.current.filter(
d=>d.row.taken||u>=d.tsMs+2*d.intervalMs+1500);l.length&&(a.current=a.current.filter(d=>!l.includes(d)),f(),n.current.enqueue("signals",l.map(d=>d.row)))},v=P(null),
h=(u=3e3)=>{v.current&&clearTimeout(v.current),v.current=setTimeout(()=>{v.current=null,n.current.flush()},u)},m=e.closed[e.closed.length-1],S=m?`${e.symbol}|${e.
tf}|${m.ts}`:"";C(()=>{if(!m)return;const u=e.closed.length;for(let l=Math.max(0,u-3);l<u;l++){const d=e.closed[l];if(d.ts%e.intervalMs!==0||l>0&&d.ts-e.closed[l-
1].ts!==e.intervalMs)continue;const x=`${e.symbol}|${e.tf}|${d.ts}`;if(c.current.has(x))continue;const b=ge(e.symbol,e.tf,d,e.tape.current.stats(d.ts,e.intervalMs));
b&&(c.current.add(x),t.current.addTape(b,d.ts,{open:d.open,high:d.high,low:d.low,close:d.close,volume:d.volume}).then(y=>{y&&n.current.enqueue("tape_pressure",[
b])}).catch(()=>{}))}for(const l of e.live)R(l);p(),h()},[S]);const R=u=>{const l=J(e.symbol,e.tf,u.type,u.ts);if(c.current.has(l))return;c.current.add(l);const d=mt(
u,e.symbol,e.tf,!1,e.autoPaper?tt.notTaken:tt.autoOff);a.current.some(x=>x.key===l)||t.current.getSignal(e.symbol,e.tf,u.type,u.ts).then(x=>{x||a.current.some(b=>b.
key===l)||(a.current.push({key:l,tsMs:u.ts,intervalMs:e.intervalMs,row:d}),f(),t.current.putSignal(d,u.ts).catch(()=>{}))}).catch(()=>{})},k=(u,l,d="")=>{const x=J(
e.symbol,e.tf,u.type,u.ts);c.current.add(x);const b=a.current.find(I=>I.key===x),y=b==null?void 0:b.row;if(y!=null&&y.taken&&!l)return;const A=mt(u,e.symbol,e.tf,
l,d||(y==null?void 0:y.skip_reason)||tt.notTaken);b?b.row=A:a.current.push({key:x,tsMs:u.ts,intervalMs:e.intervalMs,row:A}),f(),t.current.putSignal(A,u.ts).catch(
()=>{}),l&&(p(),h())};return C(()=>{var I;const u=e.state,l=e.pressures[e.closed.length-1];let d=!1;for(const g of u.positions){const F=i.current[g.id];if(F)F.adds!==
g.adds&&(F.adds=g.adds,d=!0);else{const U=g.symbol===e.symbol;i.current[g.id]={tf:U?e.tf:"",slInitial:g.initialSl,tp1:(I=g.targets[0])==null?void 0:I.price,adds:g.
adds,tapeRatio:U&&l?Math.round(l.ratio*1e4)/1e4:void 0,tapeSource:U?l==null?void 0:l.source:void 0},d=!0}}const x=ye(u.fills,i.current);let b=G(et);b||(b=x.map(
g=>g.positionId),H(et,b));const y=new Set(b),A=x.filter(g=>!y.has(g.positionId));if(A.length&&(n.current.enqueue("trades",A.map(({positionId:g,...F})=>F)),H(et,
[...b,...A.map(g=>g.positionId)].slice(-2e3)),h()),d){const g=Object.keys(i.current);if(g.length>2e3)for(const F of g.slice(0,g.length-2e3))delete i.current[F];
H(yt,i.current)}},[e.bv,e.state]),C(()=>{const u=setInterval(()=>{p(),n.current.flush()},3e4),l=()=>{document.visibilityState==="visible"&&(p(),n.current.flush())};
return document.addEventListener("visibilitychange",l),window.addEventListener("online",l),()=>{clearInterval(u),document.removeEventListener("visibilitychange",
l),window.removeEventListener("online",l)}},[]),{store:t.current,sync:n.current,status:r,meta:i.current,signalOutcome:k}}export{qe as D,Pe as M,Oe as R,tt as S,Ee as T,G as a,De as b,Nt as c,Be as d,H as e,Me as f,Lt as g,Te as h,xe as i,Wt as j,Re as k,Ne as l,ve as m,ft as n,Ae as o,
_e as p,ye as q,ee as r,Fe as s,$e as t,Ie as u};
