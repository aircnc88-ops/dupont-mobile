var st=Object.defineProperty;var rt=(e,t,n)=>t in e?st(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var g=(e,t,n)=>rt(e,typeof t!="symbol"?t+"":t,n);import{useState as q,useRef as x,useEffect as Y,useMemo as I}from"react";import{p as ot,d as K,g as W,a as it}from"./strategy-Cu9CvPGE.js";import{S as at,T as ct}from"./paper-CzloH-28.js";const $t=(e,t=2)=>{const n=typeof e=="string"?Number(e):e;return n==null||!Number.isFinite(n)?"\u2014":n.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t})},
Ot=(e,t=2)=>Number.isFinite(e)?`${e>=0?"+":""}${(e*100).toFixed(t)}%`:"\u2014",Ct=(e,t=2)=>{if(!Number.isFinite(e))return"\u2014";const n=Number(e.toFixed(t));return n===
0?0 .toFixed(t):`${n>0?"+":""}${n.toFixed(t)}`},lt=e=>new Date(e).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:!1}),Ht=e=>{const t=new Date(
e);return`${t.getMonth()+1}/${t.getDate()} ${lt(e)}`},X="https://api.bitget.com",J="/dupont-mobile/bgapi";let V=!1;async function z(e){const t=V?[J,X]:[X,J];let n;
for(const s of t)try{const o=await fetch(s+e,{cache:"no-store"});if(!o.ok)throw new Error(`HTTP ${o.status}`);const r=await o.json();if(r.code!=="00000")throw new Error(
r.msg||"bitget error");return V=s===J,r.data}catch(o){n=o}throw n}const j={"1m":{api:"1m",sec:60},"5m":{api:"5m",sec:300},"15m":{api:"15m",sec:900},"1h":{api:"1\
H",sec:3600}};async function tt(e,t,n=300,s){const o=j[t]??j["15m"],r=s?`&startTime=${Math.floor(s.startTime)}&endTime=${Math.floor(s.endTime)}`:"",i=await z(`/\
api/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${e}&granularity=${o.api}&limit=${n}${r}`),c=new Map;for(const a of i){const l={ts:Number(a[0]),open:+a[1],
high:+a[2],low:+a[3],close:+a[4],volume:+a[5]};Number.isFinite(l.ts)&&c.set(l.ts,l)}return[...c.values()].sort((a,l)=>a.ts-l.ts)}const ut=30*864e5-36e5;async function Yt(e,t,n){
const o=Math.floor(Math.max(t,n-ut)/6e4)*6e4,r=new Map;for(let i=o;i<=n;i+=6e7){const c=await tt(e,"1m",1e3,{startTime:i,endTime:Math.min(n,i+6e7-1)});for(const a of c)
r.set(a.ts,a);i+6e7<=n&&await new Promise(a=>setTimeout(a,120))}return{bars:[...r.values()].sort((i,c)=>i.ts-c.ts),clampedFrom:o}}const ht=(e,t,n)=>e-(t+n)/2;async function ft(e=4e3,t=Date.
now){const n=t(),s=await Promise.race([z("/api/v2/public/time"),new Promise(i=>setTimeout(()=>i(null),e))]).catch(()=>null),o=t(),r=Number(s==null?void 0:s.serverTime);
return!Number.isFinite(r)||o-n>e?null:ht(r,n,o)}async function zt(e,t=100){return(await z(`/api/v2/mix/market/history-fund-rate?symbol=${e}&productType=usdt-fut\
ures&pageSize=${t}`)??[]).map(s=>({ts:Number(s.fundingTime),rate:Number(s.fundingRate)})).filter(s=>Number.isFinite(s.ts)&&Number.isFinite(s.rate))}async function dt(e){
const t=await z(`/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${e}`),n=Array.isArray(t)?t[0]:t;return n?{last:+n.lastPr,mark:+(n.markPrice??n.lastPr),
change24h:+(n.change24h??0),funding:+(n.fundingRate??0),bid:+n.bidPr,ask:+n.askPr}:null}const mt="wss://ws.bitget.com/v2/ws/public";function pt(e){const n=(Array.
isArray(e==null?void 0:e.data)?e.data:[]).map(s=>({ts:+s.ts,price:+s.price,qty:+s.size,side:s.side==="sell"?"sell":"buy",...s.tradeId!==void 0?{id:String(s.tradeId)}:
{}}));return n.reverse(),{trades:n,snapshot:(e==null?void 0:e.action)==="snapshot"}}class gt{constructor(t=5e3){g(this,"seen",new Set);this.max=t}filter(t){const n=[];
for(const s of t){if(s.id===void 0){n.push(s);continue}this.seen.has(s.id)||(this.seen.add(s.id),n.push(s))}if(this.seen.size>this.max){let s=this.seen.size-this.
max;for(const o of this.seen){if(s--<=0)break;this.seen.delete(o)}}return n}}class St{constructor(t,n){g(this,"ws",null);g(this,"closed",!1);g(this,"attempt",0);
g(this,"ping",null);g(this,"lastPong",0);g(this,"connectedAt",0);g(this,"lastMsgAt",0);this.symbol=t,this.h=n}start(){this.closed=!1,this.open()}stop(){var t,n,
s;this.closed=!0,this.ping&&clearInterval(this.ping),(t=this.ws)==null||t.close(),this.ws=null,(s=(n=this.h).status)==null||s.call(n,"closed")}open(){var n,s;if(this.
closed)return;(s=(n=this.h).status)==null||s.call(n,this.attempt?"reconnecting":"connecting");let t;try{t=new WebSocket(mt)}catch{return this.retry()}this.ws=t,
t.onopen=()=>{var r,i;this.attempt=0,this.connectedAt=Date.now();const o=["ticker","books15","trade"].map(c=>({instType:"USDT-FUTURES",channel:c,instId:this.symbol}));
t.send(JSON.stringify({op:"subscribe",args:o})),this.lastPong=Date.now(),this.ping=setInterval(()=>{if(t.readyState===1){if(Date.now()-this.lastPong>2*25e3+5e3){
t.close();return}t.send("ping")}},25e3),(i=(r=this.h).status)==null||i.call(r,"live")},t.onmessage=o=>{var l,T,y,h,F,w,M;this.lastMsgAt=Date.now();const r=typeof o.
data=="string"?o.data:"";if(r==="pong"){this.lastPong=Date.now();return}if(!r)return;let i;try{i=JSON.parse(r)}catch{return}const c=(l=i==null?void 0:i.arg)==null?
void 0:l.channel,a=i==null?void 0:i.data;if(!(!c||!Array.isArray(a)||!a.length)){if(c==="ticker"){const m=a[0];(y=(T=this.h).ticker)==null||y.call(T,{last:+m.lastPr,
mark:+(m.markPrice??m.lastPr),funding:+(m.fundingRate??0),change24h:+(m.change24h??0),bid:+m.bidPr,ask:+m.askPr})}else if(c==="books15"){const m=a[0];(F=(h=this.
h).book)==null||F.call(h,{bids:(m.bids??[]).map(p=>[+p[0],+p[1]]),asks:(m.asks??[]).map(p=>[+p[0],+p[1]]),ts:+m.ts})}else if(c==="trade"){const m=pt(i);(M=(w=this.
h).trades)==null||M.call(w,m.trades,m.snapshot)}}},t.onclose=()=>{this.ping&&clearInterval(this.ping),this.closed||this.retry()},t.onerror=()=>t.close()}retry(){
var n,s;(s=(n=this.h).status)==null||s.call(n,"reconnecting");const t=Math.min(3e4,1e3*2**this.attempt++);setTimeout(()=>this.open(),t)}}const yt=[{symbol:"BTCU\
SDT",qtyStep:1e-4,dp:1},{symbol:"ETHUSDT",qtyStep:.01,dp:2},{symbol:"SOLUSDT",qtyStep:.1,dp:3},{symbol:"XRPUSDT",qtyStep:1,dp:4},{symbol:"DOGEUSDT",qtyStep:1,dp:5},
{symbol:"BNBUSDT",qtyStep:.01,dp:2},{symbol:"ADAUSDT",qtyStep:1,dp:4},{symbol:"LINKUSDT",qtyStep:1,dp:3},{symbol:"AVAXUSDT",qtyStep:.1,dp:3},{symbol:"SUIUSDT",qtyStep:.1,
dp:4}],Gt=5,et=e=>Math.max(0,Math.round(-Math.log10(e))),Jt=e=>{const t=yt.find(n=>n.symbol===e)??{symbol:e,qtyStep:.001,dp:2};return{...t,qdp:et(t.qtyStep)}},Kt=(e,t)=>{
const n=et(t);return Number((Math.floor(e/t+1e-9)*t).toFixed(n))},Wt=["1m","5m","15m","1h"],Q={"1m":6e4,"5m":3e5,"15m":9e5,"1h":36e5},R=6e4;class Z{constructor(t=1500){
g(this,"b",new Map);g(this,"coverFrom",1/0);g(this,"gaps",[]);g(this,"downSince",null);this.maxBuckets=t}reset(){this.b.clear(),this.coverFrom=1/0,this.gaps=[],
this.downSince=null}connected(t){const n=Math.ceil(t/R)*R;if(!Number.isFinite(this.coverFrom))this.coverFrom=n;else if(this.downSince!==null){const s=Math.floor(
this.downSince/R)*R;n>s&&this.gaps.push([s,n])}this.downSince=null}get awaitingConnect(){return!Number.isFinite(this.coverFrom)||this.downSince!==null}disconnected(t){
this.downSince===null&&Number.isFinite(this.coverFrom)&&(this.downSince=t)}add(t){for(const n of t){const s=Math.floor(n.ts/R)*R,o=this.b.get(s)??{buy:0,sell:0,
n:0};n.side==="buy"?o.buy+=n.qty:o.sell+=n.qty,o.n++,this.b.set(s,o)}if(this.b.size>this.maxBuckets){const n=[...this.b.keys()].sort((o,r)=>o-r);for(const o of n.
slice(0,this.b.size-this.maxBuckets))this.b.delete(o);const s=n[n.length-this.b.size];this.gaps=this.gaps.filter(([,o])=>o>s),this.coverFrom=Math.max(this.coverFrom,
s)}}covers(t,n){if(t<this.coverFrom)return!1;const s=t+n;return this.downSince!==null&&s>Math.floor(this.downSince/R)*R?!1:!this.gaps.some(([o,r])=>t<r&&s>o)}pressure(t,n,s=1){
if(!this.covers(t,n))return null;let o=0,r=0,i=0;for(let a=Math.floor(t/R)*R;a<t+n;a+=R){const l=this.b.get(a);l&&(o+=l.buy,r+=l.sell,i+=l.n)}if(i<s)return null;
const c=o+r;return{buy:o,sell:r,net:o-r,ratio:c>0?o/c:.5,source:"trades"}}}function bt(e,t,n){return e.length?Math.floor(t/n)*n>e[e.length-1].ts+n:!1}const Tt=3e4;
function wt(e,t,n,s,o=Tt){if(!e.length)return!1;if(bt(e,t,n))return!0;const r=Math.floor(t/n)*n;return r>e[e.length-1].ts&&s<r-o}function Mt(e,t,n,s,o){if(!e.length)
return e;const r=Math.floor(s/o)*o,i=e[e.length-1];if(r>i.ts+o)return e;if(r>i.ts)return[...e.slice(-499),{ts:r,open:i.close,high:Math.max(i.close,t),low:Math.min(
i.close,t),close:t,volume:n}];if(r<i.ts)return e;const c={...i,close:t,high:Math.max(i.high,t),low:Math.min(i.low,t),volume:i.volume+n};return[...e.slice(0,-1),
c]}function Xt(e,t){const[n,s]=q([]),[o,r]=q(null),i=x({symbol:e,at:0});i.current.symbol!==e&&(i.current={symbol:e,at:performance.now()});const c=x(e),a=x(e),[l,
T]=q(null),[y,h]=q("connecting"),[F,w]=q(""),[M,m]=q(0),p=x(new Z),k=x(0),L=x(!1),O=x(t);O.current=t;const $=x([]);$.current=n;const S=x(()=>{}),P=x(0);Y(()=>{p.
current=new Z,T(null);let u=!1;const v=new gt,b=new St(e,{status:f=>{h(f),(f==="reconnecting"||f==="closed")&&p.current.disconnected((b.lastMsgAt||Date.now())+k.
current)},ticker:f=>r(d=>({...(d==null?void 0:d.sym)===e?d:f,...f,sym:e,at:performance.now()})),book:f=>{a.current=e,T(f)},trades:(f,d)=>{const E=v.filter(f);if(!f.
length)return;const U=f[f.length-1];if(d||(k.current=U.ts-Date.now(),L.current=!0),d){p.current.connected(U.ts);return}if(p.current.awaitingConnect&&p.current.connected(
f[0].ts),!E.length)return;p.current.add(E),u=!0;const D=E[E.length-1];_(D.price,E.reduce((G,nt)=>G+nt.qty,0),D.ts)}});b.start();const A=setInterval(()=>{u&&(u=!1,
m(f=>f+1))},1e3);return()=>{b.stop(),clearInterval(A)}},[e]);function _(u,v,b){const A=Q[O.current]??9e5;if(wt($.current,b,A,P.current)){S.current();return}$.current.
length&&(P.current=Math.max(P.current,b)),s(f=>Mt(f,u,v,b,A))}Y(()=>{let u=!0;s([]);const v=f=>tt(e,t).then(d=>{!u||!d.length||(w(""),P.current=Math.max(P.current,
Date.now()+k.current),c.current=e,s(E=>{if(f||!E.length)return d;const U=d[d.length-1],D=E[E.length-1];if(D.ts>U.ts)return[...d,D];if(D.ts===U.ts){const G={...U,
high:Math.max(U.high,D.high),low:Math.min(U.low,D.low),close:D.close,volume:Math.max(U.volume,D.volume)};return[...d.slice(0,-1),G]}return d}))}).catch(d=>u&&w(
String((d==null?void 0:d.message)??d)));v(!0);let b=0;S.current=()=>{Date.now()-b>3e3&&(b=Date.now(),v(!1))};const A=setInterval(()=>v(!1),2e4);return()=>{u=!1,
clearInterval(A)}},[e,t]),Y(()=>{let u=!0;const v=()=>dt(e).then(A=>{!u||!A||(r({...A,sym:e,at:performance.now()}),y!=="live"&&_(A.last,0,Date.now()+k.current))}).
catch(()=>{});v();const b=setInterval(v,y==="live"?1e4:2500);return()=>{u=!1,clearInterval(b)}},[e,y]);const B=x(null),N=()=>B.current??(B.current=ft().then(u=>{
u!==null&&(k.current=u,L.current=!0)}).finally(()=>{B.current=null}));Y(()=>{N();const u=setInterval(()=>{L.current||N()},15e3);return()=>clearInterval(u)},[]);
const C=Q[t]??9e5,H=()=>Date.now()+k.current;return{candles:c.current===e?n:[],ticker:(o==null?void 0:o.sym)===e&&(o.at??0)>=i.current.at?o:null,book:a.current===
e?l:null,status:y,err:F,tape:p,tapeVer:M,intervalMs:C,serverNow:H,syncClock:N,clockSynced:()=>L.current}}function kt(e,t,n){var l,T;const s=Math.max(e.top,e.bottom),
o=Math.min(e.top,e.bottom);let r=t.findIndex(y=>y.ts>=e.startTs);r<0&&(r=Math.max(0,t.length-60));const i=Math.max(0,t.length-1),c=t.length>1?it(t.slice(-80),14):
NaN,a=Number.isFinite(c)?c:0;return{top:String(s),bottom:String(o),mid:String((s+o)/2),height:String(s-o),startTime:((l=t[r])==null?void 0:l.ts)??e.startTs,endTime:((T=
t[i])==null?void 0:T.ts)??e.startTs,startIndex:r,endIndex:i,touchesTop:2,touchesBottom:2,topPivots:[],bottomPivots:[],atr:a,heightAtr:a>0?(s-o)/a:0,insideShare:1,
tolerancePct:n,isRange:!0}}const xt=150;function Rt(e,t,n){return n??(e.length>11?K(e.slice(0,-1),t):null)}const Ft=1500,Pt=(e,t,n)=>n<e+t+Ft;function Vt(e,t,n,s,o,r,i,c){
const a=I(()=>({lookback:r.lookback,tolerancePct:r.tolerancePct,pivotLeft:r.pivotLeft,pivotRight:r.pivotRight,minTouches:r.minTouches,minHeightPct:r.minHeightPct}),
[r.lookback,r.tolerancePct,r.pivotLeft,r.pivotRight,r.minTouches,r.minHeightPct]),l=I(()=>({requireRange:r.requireRange,tickSize:(10**-c).toFixed(c),feeRate:ct,
slippageBps:at}),[r.requireRange,c]),T=e[e.length-1],y=!!T&&Pt(T.ts,t,o()),h=I(()=>y?e.slice(0,-1):e,[e,y]),F=I(()=>e.map(S=>n.current.pressure(S.ts,t)??ot(S)),
[e,s,t]),w=h.length?`${h[h.length-1].ts}:${h.length}`:"",M=I(()=>i?kt(i,h,r.tolerancePct):null,[i,w,r.tolerancePct]),m=I(()=>M??(h.length>10?K(h,a):null),[w,a,M]),
p=I(()=>Rt(h,a,M),[w,a,M]),k=I(()=>{const S=[],P=h.length;let _=new Set;if(P<30)return{out:S,prevAtLast:_};const B=F.slice(0,P);for(let N=Math.max(25,P-xt);N<P-
1;N++){const C=M??K(h.slice(0,N),a);if(!C){_=new Set;continue}const H=W(h.slice(0,N+1),B.slice(0,N+1),C,l);S.push(...H.filter(u=>!_.has(u.type))),_=new Set(H.map(
u=>u.type))}return{out:S,prevAtLast:_}},[w,a,l,M]),L=I(()=>!p||h.length<3?[]:W(h,F.slice(0,h.length),p,l).filter(S=>!k.prevAtLast.has(S.type)),[w,p,l,F,k]),O=I(
()=>[...k.out,...L],[k,L]),$=F.filter(S=>S.source==="trades").length;return{closed:h,pressures:F,box:m,signalBox:p,live:L,history:O,tapeCandles:$}}function jt(e,t){
try{const n=localStorage.getItem(e);return n?{...t,...JSON.parse(n)}:t}catch{return t}}function Qt(e){try{const t=localStorage.getItem(e);return t?JSON.parse(t):
null}catch{return null}}function Zt(e,t){try{t==null?localStorage.removeItem(e):localStorage.setItem(e,JSON.stringify(t))}catch{}}const te={symbol:"BTCUSDT",tf:"\
15m",riskPct:1,leverage:10,autoPaper:!1,moveSlToBe:!0,maxAdds:2,addSizePct:50,lookback:80,tolerancePct:.25,pivotLeft:3,pivotRight:3,minTouches:2,minHeightPct:.6,
requireRange:!0,notify:!1,showHist:!0},vt=3e4,At=15e3,Dt=3,It=12e4,Nt=e=>[...new Set([...e.positions.map(t=>t.symbol),...e.pending.map(t=>t.symbol)])],Et=(e,t)=>e.
positions.some(n=>n.symbol===t)||e.pending.some(n=>n.symbol===t);function Ut(e,t){var o;const n=Math.min(...e.positions.filter(r=>r.symbol===t).map(r=>r.openedAt),
...e.pending.filter(r=>r.symbol===t).map(r=>r.createdAt)),s=(o=e.lastTickTs)==null?void 0:o[t];return s===void 0?n:Number.isFinite(n)?Math.max(s,n):s}class ee{constructor(t=vt,n=At,s=Dt){
g(this,"replaying",new Set);g(this,"fails",{});this.gapMs=t,this.retryMs=n,this.maxFails=s}needsReplay(t,n,s){const o=Ut(t,n);return Et(t,n)&&Number.isFinite(o)&&
s-o>this.gapMs}tick(t,n,s){return this.replaying.has(n)?"replaying":this.needsReplay(t,n,s)?"gap":"live"}begin(t,n){const s=r=>{const i=this.fails[r];if(!i)return!0;
const c=Math.min(this.retryMs*2**Math.max(0,i.n-1),It);return n-i.at>c||i.at>n},o=Nt(t).filter(r=>!this.replaying.has(r)&&this.needsReplay(t,r,n)&&s(r));return o.
forEach(r=>this.replaying.add(r)),o}succeeded(t){delete this.fails[t]}failed(t,n,s=!0){var r;const o=(r=this.fails)[t]??(r[t]={n:0,at:0});return s&&(o.n+=1),o.at=
n,s&&o.n===this.maxFails}release(t){this.replaying.delete(t)}}export{te as D,Gt as M,ee as R,yt as S,Wt as T,Qt as a,Vt as b,dt as c,Zt as d,Ct as e,$t as f,Yt as g,Dt as h,Kt as i,zt as j,jt as l,Ht as m,Ot as p,Ut as r,Jt as s,
Xt as u};
