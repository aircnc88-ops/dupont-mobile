var Lt=Object.defineProperty;var $t=(e,t,s)=>t in e?Lt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var m=(e,t,s)=>$t(e,typeof t!="symbol"?t+"":t,s);import{useState as U,useRef as v,useEffect as C,useMemo as L}from"react";import{p as Ct,d as ut,g as ft,a as Ut}from"./strategy-Cu9CvPGE.js";import{S as jt,T as Kt}from"./paper-D3VIHvZr.js";const ze=(e,t=2)=>{const s=typeof e=="string"?Number(e):e;return s==null||!Number.isFinite(s)?"\u2014":s.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t})},
Ge=(e,t=2)=>Number.isFinite(e)?`${e>=0?"+":""}${(e*100).toFixed(t)}%`:"\u2014",Je=(e,t=2)=>{if(!Number.isFinite(e))return"\u2014";const s=Number(e.toFixed(t));return s===
0?0 .toFixed(t):`${s>0?"+":""}${s.toFixed(t)}`},Ht=e=>new Date(e).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:!1}),Ye=e=>{const t=new Date(
e);return`${t.getMonth()+1}/${t.getDate()} ${Ht(e)}`},pt="https://api.bitget.com",it="/dupont-mobile/bgapi";let bt=!1;async function rt(e){const t=bt?[it,pt]:[pt,
it];let s;for(const n of t)try{const r=await fetch(n+e,{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);const o=await r.json();if(o.code!=="0000\
0")throw new Error(o.msg||"bitget error");return bt=n===it,o.data}catch(r){s=r}throw s}const mt={"1m":{api:"1m",sec:60},"5m":{api:"5m",sec:300},"15m":{api:"15m",
sec:900},"1h":{api:"1H",sec:3600}};async function Pt(e,t,s=300,n){const r=mt[t]??mt["15m"],o=n?`&startTime=${Math.floor(n.startTime)}&endTime=${Math.floor(n.endTime)}`:
"",i=await rt(`/api/v2/mix/market/candles?productType=USDT-FUTURES&symbol=${e}&granularity=${r.api}&limit=${s}${o}`),c=new Map;for(const a of i){const p={ts:Number(
a[0]),open:+a[1],high:+a[2],low:+a[3],close:+a[4],volume:+a[5]};Number.isFinite(p.ts)&&c.set(p.ts,p)}return[...c.values()].sort((a,p)=>a.ts-p.ts)}const zt=30*864e5-
36e5;async function Ve(e,t,s){const r=Math.floor(Math.max(t,s-zt)/6e4)*6e4,o=new Map;for(let i=r;i<=s;i+=6e7){const c=await Pt(e,"1m",1e3,{startTime:i,endTime:Math.
min(s,i+6e7-1)});for(const a of c)o.set(a.ts,a);i+6e7<=s&&await new Promise(a=>setTimeout(a,120))}return{bars:[...o.values()].sort((i,c)=>i.ts-c.ts),clampedFrom:r}}
const Gt=(e,t,s)=>e-(t+s)/2;async function Jt(e=4e3,t=Date.now){const s=t(),n=await Promise.race([rt("/api/v2/public/time"),new Promise(i=>setTimeout(()=>i(null),
e))]).catch(()=>null),r=t(),o=Number(n==null?void 0:n.serverTime);return!Number.isFinite(o)||r-s>e?null:Gt(o,s,r)}async function Xe(e,t=100){return(await rt(`/a\
pi/v2/mix/market/history-fund-rate?symbol=${e}&productType=usdt-futures&pageSize=${t}`)??[]).map(n=>({ts:Number(n.fundingTime),rate:Number(n.fundingRate)})).filter(
n=>Number.isFinite(n.ts)&&Number.isFinite(n.rate))}async function Yt(e){const t=await rt(`/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${e}`),s=Array.
isArray(t)?t[0]:t;return s?{last:+s.lastPr,mark:+(s.markPrice??s.lastPr),change24h:+(s.change24h??0),funding:+(s.fundingRate??0),bid:+s.bidPr,ask:+s.askPr}:null}
const gt="band10bps_notional_twa_1s",Ft=1e3,z=6e4,Vt=.9,Xt=5e3;function Wt(e){const t=Array.isArray(e==null?void 0:e.data)?e.data[0]:null;if(!t)return null;const s=n=>Array.
isArray(n)?n.map(r=>[+r[0],+r[1]]).filter(r=>Number.isFinite(r[0])&&Number.isFinite(r[1])):[];return{snapshot:(e==null?void 0:e.action)==="snapshot",bids:s(t.bids),
asks:s(t.asks),seq:+t.seq,pseq:+t.pseq,ts:+t.ts}}class Qt{constructor(){m(this,"bids",new Map);m(this,"asks",new Map);m(this,"seq",null);m(this,"depth",0);m(this,
"at",0)}get valid(){return this.seq!==null}invalidate(){this.bids.clear(),this.asks.clear(),this.seq=null}apply(t,s){if(t.snapshot)return this.bids=new Map(t.bids.
filter(n=>n[1]>0)),this.asks=new Map(t.asks.filter(n=>n[1]>0)),this.depth=Math.max(t.bids.length,t.asks.length),this.seq=t.seq,this.at=s,!0;if(this.seq===null)return!1;
if(t.pseq!==this.seq)return this.invalidate(),!1;for(const[n,r]of t.bids)r>0?this.bids.set(n,r):this.bids.delete(n);for(const[n,r]of t.asks)r>0?this.asks.set(n,
r):this.asks.delete(n);return this.seq=t.seq,this.at=s,!0}sorted(){let t=[...this.bids].sort((n,r)=>r[0]-n[0]),s=[...this.asks].sort((n,r)=>n[0]-r[0]);return this.
depth>0&&t.length>this.depth&&(t=t.slice(0,this.depth),this.bids=new Map(t)),this.depth>0&&s.length>this.depth&&(s=s.slice(0,this.depth),this.asks=new Map(s)),{
bids:t,asks:s}}}const at=["bid5","ask5","bid15","ask15","bidB5","askB5","bidB10","askB10"];function Zt(e,t){if(!e.length||!t.length||e[0][0]>=t[0][0])return null;
const s=(e[0][0]+t[0][0])/2,n=(o,i)=>{let c=0;for(let a=0;a<Math.min(i,o.length);a++)c+=o[a][1];return c},r=(o,i,c)=>{const a=s*(1+c*i/1e4);let p=0;for(const[b,
y]of o){if(c<0?b<a:b>a)break;p+=b*y}return p};return{bid5:n(e,5),ask5:n(t,5),bid15:n(e,15),ask15:n(t,15),bidB5:r(e,5,-1),askB5:r(t,5,1),bidB10:r(e,10,-1),askB10:r(
t,10,1)}}const te=(e,t)=>t+e>0?(e-t)/(t+e):0,X=()=>({bid5:0,ask5:0,bid15:0,ask15:0,bidB5:0,askB5:0,bidB10:0,askB10:0});class ee{constructor(t=1500){m(this,"b",new Map);
this.maxBuckets=t}reset(){this.b.clear()}bucket(t){const s=Math.floor(t/z)*z;let n=this.b.get(s);if(!n&&(n={n:0,sum:X(),imbSum:0,imbMin:1/0,imbMax:-1/0,last:0,lastTs:-1/0,
gap:!1},this.b.set(s,n),this.b.size>this.maxBuckets)){const r=[...this.b.keys()].sort((o,i)=>o-i);for(const o of r.slice(0,this.b.size-this.maxBuckets))this.b.delete(
o)}return n}add(t,s){const n=this.bucket(t);n.n++;for(const o of at)n.sum[o]+=s[o];const r=te(s.bidB10,s.askB10);n.imbSum+=r,n.imbMin=Math.min(n.imbMin,r),n.imbMax=
Math.max(n.imbMax,r),t>=n.lastTs&&(n.last=r,n.lastTs=t)}markGap(t){this.bucket(t).gap=!0}stats(t,s){let n=0,r=0,o=1/0,i=-1/0,c=0,a=-1/0,p=!1;const b=X();for(let u=Math.
floor(t/z)*z;u<t+s;u+=z){const f=this.b.get(u);if(f&&(p||(p=f.gap),!!f.n)){n+=f.n;for(const k of at)b[k]+=f.sum[k];r+=f.imbSum,o=Math.min(o,f.imbMin),i=Math.max(
i,f.imbMax),f.lastTs>=a&&(c=f.last,a=f.lastTs)}}if(!n)return p?{n:0,avg:X(),imbAvg:0,imbMin:0,imbMax:0,imbLast:0,gap:p}:null;const y=X();for(const u of at)y[u]=
b[u]/n;return{n,avg:y,imbAvg:r/n,imbMin:o,imbMax:i,imbLast:c,gap:p}}}const qt=["ob_def","ob_samples","ob_cov","ob_full","ob_bid","ob_ask","ob_ratio","ob_imb_avg",
"ob_imb_min","ob_imb_max","ob_imb_last","ob_bid5","ob_ask5","ob_bid15","ob_ask15","ob_bid_b5","ob_ask_b5"],W=e=>Math.round(e*100)/100,j=e=>Math.round(e*1e4)/1e4,
Q=e=>Math.round(e*1e8)/1e8;function se(e,t){const s=Object.fromEntries(qt.map(o=>[o,""]));if(!e||!e.n)return{...s,ob_def:gt,ob_samples:0,ob_cov:0,ob_full:!1};const n=Math.
min(1,e.n/(t/Ft)),r=e.avg;return{ob_def:gt,ob_samples:e.n,ob_cov:j(n),ob_full:n>=Vt&&!e.gap,ob_bid:W(r.bidB10),ob_ask:W(r.askB10),ob_ratio:r.bidB10+r.askB10>0?j(
r.bidB10/(r.bidB10+r.askB10)):.5,ob_imb_avg:j(e.imbAvg),ob_imb_min:j(e.imbMin),ob_imb_max:j(e.imbMax),ob_imb_last:j(e.imbLast),ob_bid5:Q(r.bid5),ob_ask5:Q(r.ask5),
ob_bid15:Q(r.bid15),ob_ask15:Q(r.ask15),ob_bid_b5:W(r.bidB5),ob_ask_b5:W(r.askB5)}}class yt{constructor(t=new ee){m(this,"book",new Qt);this.buckets=t}onPush(t,s,n){
const r=this.book.apply(t,s);return r||this.buckets.markGap(n),r}onDisconnect(t){this.book.valid&&this.buckets.markGap(t),this.book.invalidate()}tick(t,s){if(!this.
book.valid||t-this.book.at>Xt)return!1;const{bids:n,asks:r}=this.book.sorted(),o=Zt(n,r);return o?(this.buckets.add(s,o),!0):!1}}const ne="wss://ws.bitget.com/v\
2/ws/public";function re(e){const s=(Array.isArray(e==null?void 0:e.data)?e.data:[]).map(n=>({ts:+n.ts,price:+n.price,qty:+n.size,side:n.side==="sell"?"sell":"b\
uy",...n.tradeId!==void 0?{id:String(n.tradeId)}:{}}));return s.reverse(),{trades:s,snapshot:(e==null?void 0:e.action)==="snapshot"}}class oe{constructor(t=5e3){
m(this,"seen",new Set);this.max=t}filter(t){const s=[];for(const n of t){if(n.id===void 0){s.push(n);continue}this.seen.has(n.id)||(this.seen.add(n.id),s.push(n))}
if(this.seen.size>this.max){let n=this.seen.size-this.max;for(const r of this.seen){if(n--<=0)break;this.seen.delete(r)}}return s}}class ie{constructor(t,s){m(this,
"ws",null);m(this,"closed",!1);m(this,"attempt",0);m(this,"ping",null);m(this,"lastPong",0);m(this,"connectedAt",0);m(this,"lastMsgAt",0);m(this,"resubAt",0);this.
symbol=t,this.h=s}start(){this.closed=!1,this.open()}stop(){var t,s,n;this.closed=!0,this.ping&&clearInterval(this.ping),(t=this.ws)==null||t.close(),this.ws=null,
(n=(s=this.h).status)==null||n.call(s,"closed")}open(){var s,n;if(this.closed)return;(n=(s=this.h).status)==null||n.call(s,this.attempt?"reconnecting":"connecti\
ng");let t;try{t=new WebSocket(ne)}catch{return this.retry()}this.ws=t,t.onopen=()=>{var o,i;this.attempt=0,this.connectedAt=Date.now();const r=["ticker","books\
15","trade","books"].map(c=>({instType:"USDT-FUTURES",channel:c,instId:this.symbol}));t.send(JSON.stringify({op:"subscribe",args:r})),this.lastPong=Date.now(),this.
ping=setInterval(()=>{if(t.readyState===1){if(Date.now()-this.lastPong>2*25e3+5e3){t.close();return}t.send("ping")}},25e3),(i=(o=this.h).status)==null||i.call(o,
"live")},t.onmessage=r=>{var p,b,y,u,f,k,B,$,d;this.lastMsgAt=Date.now();const o=typeof r.data=="string"?r.data:"";if(o==="pong"){this.lastPong=Date.now();return}
if(!o)return;let i;try{i=JSON.parse(o)}catch{return}const c=(p=i==null?void 0:i.arg)==null?void 0:p.channel,a=i==null?void 0:i.data;if(!(!c||!Array.isArray(a)||
!a.length)){if(c==="ticker"){const l=a[0];(y=(b=this.h).ticker)==null||y.call(b,{last:+l.lastPr,mark:+(l.markPrice??l.lastPr),funding:+(l.fundingRate??0),change24h:+(l.
change24h??0),bid:+l.bidPr,ask:+l.askPr})}else if(c==="books15"){const l=a[0];(f=(u=this.h).book)==null||f.call(u,{bids:(l.bids??[]).map(h=>[+h[0],+h[1]]),asks:(l.
asks??[]).map(h=>[+h[0],+h[1]]),ts:+l.ts})}else if(c==="books"){const l=Wt(i);l&&((B=(k=this.h).depth)==null?void 0:B.call(k,l))===!1&&this.resubscribe("books")}else if(c===
"trade"){const l=re(i);(d=($=this.h).trades)==null||d.call($,l.trades,l.snapshot)}}},t.onclose=()=>{this.ping&&clearInterval(this.ping),this.closed||this.retry()},
t.onerror=()=>t.close()}resubscribe(t){const s=this.ws;if(!s||s.readyState!==1||Date.now()-this.resubAt<2e3)return;this.resubAt=Date.now();const n=[{instType:"U\
SDT-FUTURES",channel:t,instId:this.symbol}];s.send(JSON.stringify({op:"unsubscribe",args:n})),s.send(JSON.stringify({op:"subscribe",args:n}))}retry(){var s,n;(n=
(s=this.h).status)==null||n.call(s,"reconnecting");const t=Math.min(3e4,1e3*2**this.attempt++);setTimeout(()=>this.open(),t)}}const ae=[{symbol:"BTCUSDT",qtyStep:1e-4,
dp:1},{symbol:"ETHUSDT",qtyStep:.01,dp:2},{symbol:"SOLUSDT",qtyStep:.1,dp:3},{symbol:"XRPUSDT",qtyStep:1,dp:4},{symbol:"DOGEUSDT",qtyStep:1,dp:5},{symbol:"BNBUS\
DT",qtyStep:.01,dp:2},{symbol:"ADAUSDT",qtyStep:1,dp:4},{symbol:"LINKUSDT",qtyStep:1,dp:3},{symbol:"AVAXUSDT",qtyStep:.1,dp:3},{symbol:"SUIUSDT",qtyStep:.1,dp:4}],
We=5,Dt=e=>Math.max(0,Math.round(-Math.log10(e))),Qe=e=>{const t=ae.find(s=>s.symbol===e)??{symbol:e,qtyStep:.001,dp:2};return{...t,qdp:Dt(t.qtyStep)}},Ze=(e,t)=>{
const s=Dt(t);return Number((Math.floor(e/t+1e-9)*t).toFixed(s))},ts=["1m","5m","15m","1h"],kt={"1m":6e4,"5m":3e5,"15m":9e5,"1h":36e5},D=6e4;class St{constructor(t=1500){
m(this,"b",new Map);m(this,"coverFrom",1/0);m(this,"gaps",[]);m(this,"downSince",null);this.maxBuckets=t}reset(){this.b.clear(),this.coverFrom=1/0,this.gaps=[],
this.downSince=null}connected(t){const s=Math.ceil(t/D)*D;if(!Number.isFinite(this.coverFrom))this.coverFrom=s;else if(this.downSince!==null){const n=Math.floor(
this.downSince/D)*D;s>n&&this.gaps.push([n,s])}this.downSince=null}get awaitingConnect(){return!Number.isFinite(this.coverFrom)||this.downSince!==null}disconnected(t){
this.downSince===null&&Number.isFinite(this.coverFrom)&&(this.downSince=t)}add(t){for(const s of t){const n=Math.floor(s.ts/D)*D,r=this.b.get(n)??{buy:0,sell:0,
n:0};s.side==="buy"?r.buy+=s.qty:r.sell+=s.qty,r.n++,this.b.set(n,r)}if(this.b.size>this.maxBuckets){const s=[...this.b.keys()].sort((r,o)=>r-o);for(const r of s.
slice(0,this.b.size-this.maxBuckets))this.b.delete(r);const n=s[s.length-this.b.size];this.gaps=this.gaps.filter(([,r])=>r>n),this.coverFrom=Math.max(this.coverFrom,
n)}}covers(t,s){if(t<this.coverFrom)return!1;const n=t+s;return this.downSince!==null&&n>Math.floor(this.downSince/D)*D?!1:!this.gaps.some(([r,o])=>t<o&&n>r)}stats(t,s){
if(!this.covers(t,s))return null;let n=0,r=0,o=0;for(let i=Math.floor(t/D)*D;i<t+s;i+=D){const c=this.b.get(i);c&&(n+=c.buy,r+=c.sell,o+=c.n)}return{buy:n,sell:r,
n:o}}pressure(t,s,n=1){if(!this.covers(t,s))return null;let r=0,o=0,i=0;for(let a=Math.floor(t/D)*D;a<t+s;a+=D){const p=this.b.get(a);p&&(r+=p.buy,o+=p.sell,i+=
p.n)}if(i<n)return null;const c=r+o;return{buy:r,sell:o,net:r-o,ratio:c>0?r/c:.5,source:"trades"}}}function ce(e,t,s){return e.length?Math.floor(t/s)*s>e[e.length-
1].ts+s:!1}const le=3e4;function ue(e,t,s,n,r=le){if(!e.length)return!1;if(ce(e,t,s))return!0;const o=Math.floor(t/s)*s;return o>e[e.length-1].ts&&n<o-r}function he(e,t,s,n,r){
if(!e.length)return e;const o=Math.floor(n/r)*r,i=e[e.length-1];if(o>i.ts+r)return e;if(o>i.ts)return[...e.slice(-499),{ts:o,open:i.close,high:Math.max(i.close,
t),low:Math.min(i.close,t),close:t,volume:s}];if(o<i.ts)return e;const c={...i,close:t,high:Math.max(i.high,t),low:Math.min(i.low,t),volume:i.volume+s};return[...e.
slice(0,-1),c]}function es(e,t){const[s,n]=U([]),[r,o]=U(null),i=v({symbol:e,at:0});i.current.symbol!==e&&(i.current={symbol:e,at:performance.now()});const c=v(
e),a=v(e),[p,b]=U(null),[y,u]=U("connecting"),[f,k]=U(""),[B,$]=U(0),d=v(new St),l=v(new yt),h=v(0),M=v(!1),w=v(t);w.current=t;const g=v([]);g.current=s;const x=v(
()=>{}),P=v(0);C(()=>{d.current=new St,l.current=new yt;const A=l.current;b(null);let I=!1;const R=new oe,O=new ie(e,{status:_=>{u(_),(_==="reconnecting"||_==="\
closed")&&d.current.disconnected((O.lastMsgAt||Date.now())+h.current),_==="reconnecting"&&A.onDisconnect(Date.now()+h.current)},ticker:_=>o(q=>({...(q==null?void 0:
q.sym)===e?q:_,..._,sym:e,at:performance.now()})),book:_=>{a.current=e,b(_)},depth:_=>A.onPush(_,Date.now(),Date.now()+h.current),trades:(_,q)=>{const E=R.filter(
_);if(!_.length)return;const V=_[_.length-1];if(q||(h.current=V.ts-Date.now(),M.current=!0),q){d.current.connected(V.ts);return}if(d.current.awaitingConnect&&d.
current.connected(_[0].ts),!E.length)return;d.current.add(E),I=!0;const dt=E[E.length-1];S(dt.price,E.reduce((Nt,Rt)=>Nt+Rt.qty,0),dt.ts)}});O.start();const H=setInterval(
()=>{I&&(I=!1,$(_=>_+1))},1e3),F=setInterval(()=>{A.tick(Date.now(),Date.now()+h.current)},Ft);return()=>{O.stop(),clearInterval(H),clearInterval(F)}},[e]);function S(A,I,R){
const O=kt[w.current]??9e5;if(ue(g.current,R,O,P.current)){x.current();return}g.current.length&&(P.current=Math.max(P.current,R)),n(H=>he(H,A,I,R,O))}C(()=>{let A=!0;
n([]);const I=H=>Pt(e,t).then(F=>{!A||!F.length||(k(""),P.current=Math.max(P.current,Date.now()+h.current),c.current=e,n(_=>{if(H||!_.length)return F;const q=F[F.
length-1],E=_[_.length-1];if(E.ts>q.ts)return[...F,E];if(E.ts===q.ts){const V={...q,high:Math.max(q.high,E.high),low:Math.min(q.low,E.low),close:E.close,volume:Math.
max(q.volume,E.volume)};return[...F.slice(0,-1),V]}return F}))}).catch(F=>A&&k(String((F==null?void 0:F.message)??F)));I(!0);let R=0;x.current=()=>{Date.now()-R>
3e3&&(R=Date.now(),I(!1))};const O=setInterval(()=>I(!1),2e4);return()=>{A=!1,clearInterval(O)}},[e,t]),C(()=>{let A=!0;const I=()=>Yt(e).then(O=>{!A||!O||(o({...O,
sym:e,at:performance.now()}),y!=="live"&&S(O.last,0,Date.now()+h.current))}).catch(()=>{});I();const R=setInterval(I,y==="live"?1e4:2500);return()=>{A=!1,clearInterval(
R)}},[e,y]);const T=v(null),N=()=>T.current??(T.current=Jt().then(A=>{A!==null&&(h.current=A,M.current=!0)}).finally(()=>{T.current=null}));C(()=>{N();const A=setInterval(
()=>{M.current||N()},15e3);return()=>clearInterval(A)},[]);const Y=kt[t]??9e5,K=()=>Date.now()+h.current;return{candles:c.current===e?s:[],ticker:(r==null?void 0:
r.sym)===e&&(r.at??0)>=i.current.at?r:null,book:a.current===e?p:null,status:y,err:f,tape:d,ob:l,tapeVer:B,intervalMs:Y,serverNow:K,syncClock:N,clockSynced:()=>M.
current}}function de(e,t,s){var p,b;const n=Math.max(e.top,e.bottom),r=Math.min(e.top,e.bottom);let o=t.findIndex(y=>y.ts>=e.startTs);o<0&&(o=Math.max(0,t.length-
60));const i=Math.max(0,t.length-1),c=t.length>1?Ut(t.slice(-80),14):NaN,a=Number.isFinite(c)?c:0;return{top:String(n),bottom:String(r),mid:String((n+r)/2),height:String(
n-r),startTime:((p=t[o])==null?void 0:p.ts)??e.startTs,endTime:((b=t[i])==null?void 0:b.ts)??e.startTs,startIndex:o,endIndex:i,touchesTop:2,touchesBottom:2,topPivots:[],
bottomPivots:[],atr:a,heightAtr:a>0?(n-r)/a:0,insideShare:1,tolerancePct:s,isRange:!0}}const fe=150;function pe(e,t,s){return s??(e.length>11?ut(e.slice(0,-1),t):
null)}const be=1500,me=(e,t,s)=>s<e+t+be;function ss(e,t,s,n,r,o,i,c){const a=L(()=>({lookback:o.lookback,tolerancePct:o.tolerancePct,pivotLeft:o.pivotLeft,pivotRight:o.
pivotRight,minTouches:o.minTouches,minHeightPct:o.minHeightPct}),[o.lookback,o.tolerancePct,o.pivotLeft,o.pivotRight,o.minTouches,o.minHeightPct]),p=L(()=>({requireRange:o.
requireRange,tickSize:(10**-c).toFixed(c),feeRate:Kt,slippageBps:jt}),[o.requireRange,c]),b=e[e.length-1],y=!!b&&me(b.ts,t,r()),u=L(()=>y?e.slice(0,-1):e,[e,y]),
f=L(()=>e.map(g=>s.current.pressure(g.ts,t)??Ct(g)),[e,n,t]),k=u.length?`${u[u.length-1].ts}:${u.length}`:"",B=L(()=>i?de(i,u,o.tolerancePct):null,[i,k,o.tolerancePct]),
$=L(()=>B??(u.length>10?ut(u,a):null),[k,a,B]),d=L(()=>pe(u,a,B),[k,a,B]),l=L(()=>{const g=[],x=u.length;let P=new Set;if(x<30)return{out:g,prevAtLast:P};const S=f.
slice(0,x);for(let T=Math.max(25,x-fe);T<x-1;T++){const N=B??ut(u.slice(0,T),a);if(!N){P=new Set;continue}const Y=ft(u.slice(0,T+1),S.slice(0,T+1),N,p);g.push(...Y.
filter(K=>!P.has(K.type))),P=new Set(Y.map(K=>K.type))}return{out:g,prevAtLast:P}},[k,a,p,B]),h=L(()=>!d||u.length<3?[]:ft(u,f.slice(0,u.length),d,p).filter(g=>!l.
prevAtLast.has(g.type)),[k,d,p,f,l]),M=L(()=>[...l.out,...h],[l,h]),w=f.filter(g=>g.source==="trades").length;return{closed:u,pressures:f,box:$,signalBox:d,live:h,
history:M,tapeCandles:w}}function ns(e,t){try{const s=localStorage.getItem(e);return s?{...t,...JSON.parse(s)}:t}catch{return t}}function Z(e){try{const t=localStorage.
getItem(e);return t?JSON.parse(t):null}catch{return null}}function G(e,t){try{t==null?localStorage.removeItem(e):localStorage.setItem(e,JSON.stringify(t))}catch{}}
const rs={symbol:"BTCUSDT",tf:"15m",riskPct:1,leverage:10,autoPaper:!1,moveSlToBe:!0,maxAdds:2,addSizePct:50,lookback:80,tolerancePct:.25,pivotLeft:3,pivotRight:3,
minTouches:2,minHeightPct:.6,requireRange:!0,notify:!1,showHist:!0,sheetsUrl:"",sheetsToken:""},ge=3e4,ye=15e3,ke=3,Se=12e4,_e=e=>[...new Set([...e.positions.map(
t=>t.symbol),...e.pending.map(t=>t.symbol)])],we=(e,t)=>e.positions.some(s=>s.symbol===t)||e.pending.some(s=>s.symbol===t);function Me(e,t){var r;const s=Math.min(
...e.positions.filter(o=>o.symbol===t).map(o=>o.openedAt),...e.pending.filter(o=>o.symbol===t).map(o=>o.createdAt)),n=(r=e.lastTickTs)==null?void 0:r[t];return n===
void 0?s:Number.isFinite(s)?Math.max(n,s):n}class os{constructor(t=ge,s=ye,n=ke){m(this,"replaying",new Set);m(this,"fails",{});this.gapMs=t,this.retryMs=s,this.
maxFails=n}needsReplay(t,s,n){const r=Me(t,s);return we(t,s)&&Number.isFinite(r)&&n-r>this.gapMs}tick(t,s,n){return this.replaying.has(s)?"replaying":this.needsReplay(
t,s,n)?"gap":"live"}begin(t,s){const n=o=>{const i=this.fails[o];if(!i)return!0;const c=Math.min(this.retryMs*2**Math.max(0,i.n-1),Se);return s-i.at>c||i.at>s},
r=_e(t).filter(o=>!this.replaying.has(o)&&this.needsReplay(t,o,s)&&n(o));return r.forEach(o=>this.replaying.add(o)),r}succeeded(t){delete this.fails[t]}failed(t,s,n=!0){
var o;const r=(o=this.fails)[t]??(o[t]={n:0,at:0});return n&&(r.n+=1),r.at=s,n&&r.n===this.maxFails}release(t){this.replaying.delete(t)}}const ve={tape_pressure:5e4,
signals:2e4},Te=(e,t,s)=>`${e}|${t}|${s}`,et=(e,t,s,n)=>`${e}|${t}|${s}|${n}`;class Et{constructor(){m(this,"m",{tape_pressure:new Map,signals:new Map})}async get(t,s){
return this.m[t].get(s)}async put(t,s){this.m[t].set(s.key,s)}async count(t){return this.m[t].size}async deleteOldest(t,s){const n=[...this.m[t].values()].sort(
(r,o)=>r.tsMs-o.tsMs).slice(0,s);for(const r of n)this.m[t].delete(r.key)}async all(t){return[...this.m[t].values()].sort((s,n)=>s.tsMs-n.tsMs)}}const xe="dupon\
t-journal",Ae=1,tt=e=>new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)});class Be{constructor(t=indexedDB){m(this,"db");this.db=new Promise(
(s,n)=>{const r=t.open(xe,Ae);r.onupgradeneeded=()=>{for(const o of["tape_pressure","signals"])r.result.objectStoreNames.contains(o)||r.result.createObjectStore(
o,{keyPath:"key"}).createIndex("tsMs","tsMs")},r.onsuccess=()=>s(r.result),r.onerror=()=>n(r.error)})}async store(t,s){return(await this.db).transaction(t,s).objectStore(
t)}async get(t,s){return tt((await this.store(t,"readonly")).get(s))}async put(t,s){await tt((await this.store(t,"readwrite")).put(s))}async count(t){return tt(
(await this.store(t,"readonly")).count())}async deleteOldest(t,s){if(s<=0)return;const n=await this.store(t,"readwrite");await new Promise((r,o)=>{let i=s;const c=n.
index("tsMs").openCursor();c.onsuccess=()=>{const a=c.result;if(!a||i<=0)return r();a.delete(),i--,a.continue()},c.onerror=()=>o(c.error)})}async all(t){return tt(
(await this.store(t,"readonly")).index("tsMs").getAll())}}class _t{constructor(t=new Et,s=ve){this.backend=t,this.caps=s}async addTape(t,s,n={}){const r=Te(t.symbol,
t.tf,s);return await this.backend.get("tape_pressure",r)?!1:(await this.backend.put("tape_pressure",{...t,...n,key:r,tsMs:s}),await this.prune("tape_pressure"),
!0)}async putSignal(t,s){const n=et(t.symbol,t.tf,t.kind,s),r=await this.backend.get("signals",n),o=r!=null&&r.taken&&!t.taken?{...r}:{...t,key:n,tsMs:s};return await this.
backend.put("signals",o),r||await this.prune("signals"),!r}async getSignal(t,s,n,r){return this.backend.get("signals",et(t,s,n,r))}async prune(t){const n=await this.
backend.count(t)-this.caps[t];return n>0&&await this.backend.deleteOldest(t,n),Math.max(0,n)}all(t){return this.backend.all(t)}count(t){return this.backend.count(
t)}}function Pe(){try{if(typeof indexedDB<"u")return new _t(new Be(indexedDB))}catch{}return new _t(new Et)}const Fe="dupont-mobile/0.1.0-r12",ht=500,ot={trades:[
"ts_open","ts_close","symbol","tf","side","kind","entry","exit","qty","sl_initial","tp1","fees_usdt","pnl_usdt","r_multiple","exit_reason","adds","tape_ratio_at\
_entry","tape_source","app_version"],tape_pressure:["ts","symbol","tf","buy","sell","ratio","n_trades","source","gap"],signals:["ts","symbol","tf","kind","side",
"entry","sl","tp1","box_top","box_bottom","pressure_ratio","pressure_source","taken","skip_reason"]},wt=Object.keys(ot),ct={autoOff:"auto_paper_off",positionOpen:"\
position_open",pressureOhlcv:"pressure_ohlcv",lossCooldown:"loss_cooldown",dailyStop:"daily_stop",entryRefused:"entry_refused",notTaken:"not_taken"},st=e=>new Date(
e).toISOString(),qe=[...ot.tape_pressure,...qt];function It(e,t){const s={};for(const n of ot[e])s[n]=t[n]??"";return s}function De(e,t,s){if(s.length>ht)throw new Error(
`max ${ht} rows per call`);return JSON.stringify({token:e,tab:t,rows:s.map(n=>It(t,n))})}const Ot=e=>{if(e==null)return"";const t=String(e);return/[",\n\r]/.test(
t)?`"${t.replace(/"/g,'""')}"`:t};function Ee(e,t){return[e.join(","),...t.map(s=>e.map(n=>Ot(s[n])).join(","))].join(`
`)}const is=e=>Ee(qe,e);function as(e,t){const s=ot[e];return[s.join(","),...t.map(n=>s.map(r=>Ot(n[r])).join(","))].join(`
`)}const Ie=15e3,Oe=15*6e4,Ne=2e4,Re=e=>Math.min(Oe,Ie*2**Math.max(0,e-1)),Mt=e=>/^https:\/\/\S+$/.test(e.url.trim())&&e.token.trim().length>0,vt=()=>({trades:[],
tape_pressure:[],signals:[]});class Le{constructor(t,s){m(this,"p");m(this,"busy",!1);m(this,"listeners",new Set);this.config=t,this.deps=s;const n=s.load();this.
p={queue:{...vt(),...(n==null?void 0:n.queue)??{}},fails:(n==null?void 0:n.fails)??0,nextAt:(n==null?void 0:n.nextAt)??0,last:n==null?void 0:n.last}}get pending(){
return wt.reduce((t,s)=>t+this.p.queue[s].length,0)}status(){return{...this.p.last??{},fails:this.p.fails,nextAt:this.p.nextAt,pending:this.pending}}subscribe(t){
return this.listeners.add(t),()=>{this.listeners.delete(t)}}queued(t){return this.p.queue[t]}persist(){this.deps.save(this.p);const t=this.status();this.listeners.
forEach(s=>s(t))}enqueue(t,s){if(!Mt(this.config())||!s.length)return!1;this.p.queue[t].push(...s.map(r=>It(t,r)));let n=this.pending-Ne;for(const r of["tape_pr\
essure","signals","trades"]){if(n<=0)break;const o=Math.min(n,this.p.queue[r].length);this.p.queue[r].splice(0,o),n-=o}return this.persist(),!0}clear(){this.p.queue=
vt(),this.p.fails=0,this.p.nextAt=0,this.persist()}async flush(t=!1){const s=this.config();if(!Mt(s))return"off";if(this.busy)return"busy";if(!t&&this.deps.now()<
this.p.nextAt)return"wait";if(!this.pending)return"idle";this.busy=!0;try{for(const n of wt)for(;this.p.queue[n].length;){const r=this.p.queue[n].slice(0,ht);let o="",
i=0;try{const a=await this.deps.fetch(s.url.trim(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:De(s.token.trim(),n,r)}),p=await a.text().
catch(()=>"");let b=null;try{b=JSON.parse(p)}catch{}a.ok?!b||b.ok!==!0?o=b!=null&&b.error?String(b.error):"\uC751\uB2F5 \uD615\uC2DD \uC624\uB958":i=Number(b.appended??
r.length):o=`HTTP ${a.status}`}catch(a){o=String((a==null?void 0:a.message)??a??"network")}const c=this.deps.now();if(o)return this.p.fails+=1,this.p.nextAt=c+Re(
this.p.fails),this.p.last={at:c,ok:!1,tab:n,error:o},this.persist(),"fail";this.p.queue[n].splice(0,r.length),this.p.fails=0,this.p.nextAt=0,this.p.last={at:c,ok:!0,
tab:n,appended:i},this.persist()}return"ok"}finally{this.busy=!1}}}const nt=e=>Math.round(e*1e4)/1e4,J=e=>Math.round(e*1e8)/1e8;function $e(e,t,s,n){if(!n||n.n<
1)return null;const r=n.buy+n.sell;return{ts:st(s.ts),symbol:e,tf:t,buy:J(n.buy),sell:J(n.sell),ratio:r>0?nt(n.buy/r):.5,n_trades:n.n,source:"trades",gap:!1}}function Tt(e,t,s,n,r){
var o,i;return{ts:st(e.ts),symbol:t,tf:s,kind:e.type,side:e.side,entry:Number(e.entry),sl:Number(e.sl),tp1:e.targets[0]?Number(e.targets[0].price):"",box_top:(o=
e.box)!=null&&o.top?Number(e.box.top):"",box_bottom:(i=e.box)!=null&&i.bottom?Number(e.box.bottom):"",pressure_ratio:nt(e.pressure.ratio),pressure_source:e.pressure.
source==="trades"?"trades":"ohlcv",taken:n,skip_reason:n?"":r}}function Ce(e,t){const s=new Map;for(const r of e){const o=s.get(r.positionId)??[];o.push(r),s.set(
r.positionId,o)}const n=[];for(const[r,o]of s){const i=o.find(f=>f.final);if(!i)continue;const c=o.reduce((f,k)=>f+k.qty,0),a=f=>c>0?o.reduce((k,B)=>k+B[f]*B.qty,
0)/c:i[f],p=o.reduce((f,k)=>f+k.netPnl,0),b=i.riskUsd,y=[...new Set(o.map(f=>f.reason))],u=t[r];n.push({positionId:r,_t:i.closedAt,ts_open:st(Math.min(...o.map(
f=>f.openedAt))),ts_close:st(i.closedAt),symbol:i.symbol,tf:(u==null?void 0:u.tf)??"",side:i.side,kind:i.setup,entry:J(a("entry")),exit:J(a("exit")),qty:J(c),sl_initial:(u==
null?void 0:u.slInitial)??"",tp1:(u==null?void 0:u.tp1)??"",fees_usdt:nt(o.reduce((f,k)=>f+k.fees,0)),pnl_usdt:nt(p),r_multiple:b&&b>0?Math.round(p/b*1e3)/1e3:"",
exit_reason:y.join(" + "),adds:(u==null?void 0:u.adds)??0,tape_ratio_at_entry:(u==null?void 0:u.tapeRatio)??"",tape_source:(u==null?void 0:u.tapeSource)??"",app_version:Fe})}
return n.sort((r,o)=>r._t-o._t).map(({_t:r,...o})=>o)}const xt="dupont.sheets.queue.v1",At="dupont.journal.posmeta.v1",lt="dupont.journal.tradesSent.v1",Bt="dup\
ont.journal.pendingSignals.v1";function cs(e){const t=v(null);t.current||(t.current=Pe());const s=v({url:e.url,token:e.token});s.current={url:e.url,token:e.token};
const n=v(null);n.current||(n.current=new Le(()=>s.current,{fetch:(d,l)=>fetch(d,l),now:()=>Date.now(),load:()=>Z(xt),save:d=>G(xt,d)}));const[r,o]=U(()=>n.current.
status());C(()=>n.current.subscribe(o),[]);const i=v(Z(At)??{}),c=v(new Set),a=v(Z(Bt)??[]),p=()=>G(Bt,a.current),b=()=>{const d=e.serverNow(),l=a.current.filter(
h=>h.row.taken||d>=h.tsMs+2*h.intervalMs+1500);l.length&&(a.current=a.current.filter(h=>!l.includes(h)),p(),n.current.enqueue("signals",l.map(h=>h.row)))},y=v(null),
u=(d=3e3)=>{y.current&&clearTimeout(y.current),y.current=setTimeout(()=>{y.current=null,n.current.flush()},d)},f=e.closed[e.closed.length-1],k=f?`${e.symbol}|${e.
tf}|${f.ts}`:"";C(()=>{if(!f)return;const d=e.closed.length;for(let l=Math.max(0,d-3);l<d;l++){const h=e.closed[l];if(h.ts%e.intervalMs!==0||l>0&&h.ts-e.closed[l-
1].ts!==e.intervalMs)continue;const M=`${e.symbol}|${e.tf}|${h.ts}`;if(c.current.has(M))continue;const w=$e(e.symbol,e.tf,h,e.tape.current.stats(h.ts,e.intervalMs));
if(!w)continue;c.current.add(M);const g=e.ob?se(e.ob.current.buckets.stats(h.ts,e.intervalMs),e.intervalMs):{};t.current.addTape(w,h.ts,{open:h.open,high:h.high,
low:h.low,close:h.close,volume:h.volume,...g}).then(x=>{x&&n.current.enqueue("tape_pressure",[w])}).catch(()=>{})}for(const l of e.live)B(l);b(),u()},[k]);const B=d=>{
const l=et(e.symbol,e.tf,d.type,d.ts);if(c.current.has(l))return;c.current.add(l);const h=Tt(d,e.symbol,e.tf,!1,e.autoPaper?ct.notTaken:ct.autoOff);a.current.some(
M=>M.key===l)||t.current.getSignal(e.symbol,e.tf,d.type,d.ts).then(M=>{M||a.current.some(w=>w.key===l)||(a.current.push({key:l,tsMs:d.ts,intervalMs:e.intervalMs,
row:h}),p(),t.current.putSignal(h,d.ts).catch(()=>{}))}).catch(()=>{})},$=(d,l,h="")=>{const M=et(e.symbol,e.tf,d.type,d.ts);c.current.add(M);const w=a.current.
find(P=>P.key===M),g=w==null?void 0:w.row;if(g!=null&&g.taken&&!l)return;const x=Tt(d,e.symbol,e.tf,l,h||(g==null?void 0:g.skip_reason)||ct.notTaken);w?w.row=x:
a.current.push({key:M,tsMs:d.ts,intervalMs:e.intervalMs,row:x}),p(),t.current.putSignal(x,d.ts).catch(()=>{}),l&&(b(),u())};return C(()=>{var P;const d=e.state,
l=e.pressures[e.closed.length-1];let h=!1;for(const S of d.positions){const T=i.current[S.id];if(T)T.adds!==S.adds&&(T.adds=S.adds,h=!0);else{const N=S.symbol===
e.symbol;i.current[S.id]={tf:N?e.tf:"",slInitial:S.initialSl,tp1:(P=S.targets[0])==null?void 0:P.price,adds:S.adds,tapeRatio:N&&l?Math.round(l.ratio*1e4)/1e4:void 0,
tapeSource:N?l==null?void 0:l.source:void 0},h=!0}}const M=Ce(d.fills,i.current);let w=Z(lt);w||(w=M.map(S=>S.positionId),G(lt,w));const g=new Set(w),x=M.filter(
S=>!g.has(S.positionId));if(x.length&&(n.current.enqueue("trades",x.map(({positionId:S,...T})=>T)),G(lt,[...w,...x.map(S=>S.positionId)].slice(-2e3)),u()),h){const S=Object.
keys(i.current);if(S.length>2e3)for(const T of S.slice(0,S.length-2e3))delete i.current[T];G(At,i.current)}},[e.bv,e.state]),C(()=>{const d=setInterval(()=>{b(),
n.current.flush()},3e4),l=()=>{document.visibilityState==="visible"&&(b(),n.current.flush())};return document.addEventListener("visibilitychange",l),window.addEventListener(
"online",l),()=>{clearInterval(d),document.removeEventListener("visibilitychange",l),window.removeEventListener("online",l)}},[]),{store:t.current,sync:n.current,
status:r,meta:i.current,signalOutcome:$}}export{rs as D,We as M,os as R,ct as S,ts as T,Z as a,ss as b,Yt as c,cs as d,G as e,ze as f,ae as g,Je as h,Ve as i,ke as j,Ze as k,ns as l,Ye as m,Mt as n,Xe as o,
Ge as p,Ce as q,Me as r,Qe as s,as as t,es as u,is as v};
