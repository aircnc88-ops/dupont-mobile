import{jsxs as s,jsx as u,Fragment as Ye}from"react/jsx-runtime";import Je from"react-dom/client";import{useState as q,useEffect as X,useRef as se,useCallback as qe,
useMemo as Le}from"react";import{e as Xe,f as Ze,c as Ue,s as eu,n as uu}from"./strategy-Cu9CvPGE.js";import{C as ve,a as tu,B as z,b as H,R as F,N as w,T as re,
O as Cu}from"./ui-DB4-kBwd.js";import{l as nu,s as _,u as su,a as me,b as ru,R as iu,c as au,d as Q,f as o,S as lu,p as ou,T as cu,e as R,r as du,g as Oe,m as ae,
M as ue,D as Bu,h as mu,i as pu}from"./market-ZbgZlvjC.js";import{P as Du,n as hu,u as _e,T as j,D as xu,S as ie,t as Au,r as bu,s as fu,a as gu,M as vu,b as Ie,
f as yu}from"./paper-DgRiG6e_.js";import"decimal.js";import"lightweight-charts";(function(){const D=document.createElement("link").relList;if(D&&D.supports&&D.supports(
"modulepreload"))return;for(const B of document.querySelectorAll('link[rel="modulepreload"]'))E(B);new MutationObserver(B=>{for(const l of B)if(l.type==="childL\
ist")for(const a of l.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&E(a)}).observe(document,{childList:!0,subtree:!0});function t(B){const l={};return B.
integrity&&(l.integrity=B.integrity),B.referrerPolicy&&(l.referrerPolicy=B.referrerPolicy),B.crossOrigin==="use-credentials"?l.credentials="include":B.crossOrigin===
"anonymous"?l.credentials="omit":l.credentials="same-origin",l}function E(B){if(B.ep)return;B.ep=!0;const l=t(B);fetch(B.href,l)}})();const Nu=["\uCC28\uD2B8","\
\uAC70\uB798","\uD3EC\uC9C0\uC158","\uAE30\uB85D","\uC124\uC815"],le={RANGE_LONG:"\uBC15\uC2A4 \uBC18\uC804 \uB871",RANGE_SHORT:"\uBC15\uC2A4 \uBC18\uC804 \uC20F",
FAKE_BREAKOUT_LONG:"\uAC00\uC9DC \uC774\uD0C8 \uB871",FAKE_BREAKOUT_SHORT:"\uAC00\uC9DC \uB3CC\uD30C \uC20F",BREAKOUT_LONG:"\uC9C4\uC9DC \uB3CC\uD30C \uB871",BREAKOUT_SHORT:"\
\uC9C4\uC9DC \uC774\uD0C8 \uC20F"},He=r=>r==="MANUAL"?"\uC218\uB3D9":le[r]??r,ge="dupont.broker.v1",Ke="dupont.settings.v1",pe="dupont.seen.v1";function Eu(r,D){
const t=r.level?o(r.level,D):"";return r.add?`\uB3CC\uD30C \uB808\uBCA8 ${t} \uB9AC\uD14C\uC2A4\uD2B8 \uD655\uC778 \u2013 \uCD94\uAC00 \uC9C4\uC785 \uAC00\uB2A5`:
r.reason.startsWith("max adds")?"\uCD5C\uB300 \uCD94\uAC00 \uD69F\uC218 \uB3C4\uB2EC":r.reason.startsWith("no retest")?`\uB3CC\uD30C \uB808\uBCA8 ${t} \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:
r.reason.startsWith("retest without")?"\uB9AC\uD14C\uC2A4\uD2B8 \uC911 \u2013 \uC7A5\uC545\uD615/\uC555\uB825 \uD655\uC778 \uB300\uAE30":r.reason.startsWith("no\
 broken")?"\uB3CC\uD30C \uB808\uBCA8 \uC815\uBCF4 \uC5C6\uC74C":r.reason.startsWith("pyramiding only")?"\uB3CC\uD30C \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9":
r.reason.startsWith("retest must be")?"\uC9C4\uC785/\uC9C1\uC804 \uCD94\uAC00 \uC774\uD6C4\uC758 \uC0C8 \uCE94\uB4E4\uC5D0\uC11C \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30":
r.reason.startsWith("no move away")?`\uB3CC\uD30C \uB808\uBCA8 ${t}\uC5D0\uC11C 0.5R \uC774\uC0C1 \uC774\uD0C8 \uD6C4 \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:"\uB370\uC774\
\uD130 \uBD80\uC871"}function ku(){var Te,Fe,Me,Pe;const[r,D]=q("\uCC28\uD2B8"),[t,E]=q(()=>nu(Ke,Bu)),B=e=>E(C=>{const i={...C,...e};return Q(Ke,i),i}),l=_(t.symbol),
a=su(t.symbol,t.tf),[c,g]=q(()=>me(`dupont.box.${t.symbol}`));X(()=>g(me(`dupont.box.${t.symbol}`)),[t.symbol]);const[M,N]=q(!1),m=ru(a.candles,a.intervalMs,a.tape,
a.tapeVer,a.serverNow,t,c,l.dp),f=(10**-l.dp).toFixed(l.dp),h=se(null);h.current||(h.current=new Du(me(ge)??void 0)),h.current.moveSlToBe=t.moveSlToBe,h.current.
precision=e=>{const C=_(e);return{dp:C.dp,qdp:C.qdp}};const[p,L]=q(0),S=()=>{Q(ge,h.current.state),L(e=>e+1)},[I,G]=q([]),v=qe((e,C="info")=>{const i=Date.now()+
Math.random();if(G(n=>[...n.slice(-1),{id:i,text:e,tone:C}]),setTimeout(()=>G(n=>n.filter(d=>d.id!==i)),4e3),t.notify&&"Notification"in window&&Notification.permission===
"granted"&&document.visibilityState!=="visible")try{new Notification("\uB4C0\uD401 \uC2A4\uD0E0\uB2E4\uB4DC",{body:e,icon:"/dupont-mobile/icons/icon.svg"})}catch{}},
[t.notify]),b=((Te=a.ticker)==null?void 0:Te.last)??((Fe=a.candles[a.candles.length-1])==null?void 0:Fe.close)??0,[Y,Ce]=q({});X(()=>{b&&Ce(e=>({...e,[t.symbol]:b}))},
[b,t.symbol]);const oe=18e4,ne=se({}),ce=async(e,C=!1)=>{const i=Date.now();if(!C&&i-(ne.current[e]??0)<3e4)return;ne.current[e]=i;const n=await pu(e).catch(()=>null);
n!=null&&n.length&&(h.current.setSettledRates(e,n),Q(ge,h.current.state))},K=se(new iu),y=(e,C,i,n)=>{const d=K.current.tick(h.current.state,e,a.serverNow());if(d===
"replaying")return[];if(d==="gap")return De(),[];const x=a.serverNow(),A=h.current.onPrice(e,C,x,i);return h.current.needsSettledRate(e,x)&&ce(e),A.push(...h.current.
accrueFunding(e,i||C,x,oe)),n!==void 0&&h.current.noteTickerRate(e,n,x),A},De=async()=>{var i;const e=h.current,C=K.current.begin(e.state,a.serverNow());C.length&&
await a.syncClock();for(const n of C)try{if(await ce(n,!0),!a.clockSynced())throw new Error("server clock unknown");const d=a.serverNow(),x=Math.floor(du(e.state,
n)/6e4)*6e4,{bars:A,clampedFrom:P}=await Oe(n,x,d),W=a.serverNow();if(Math.floor(W/6e4)>Math.floor(d/6e4)){const O=await Oe(n,Math.floor(d/6e4)*6e4,W),Re=new Map(
A.map(ee=>[ee.ts,ee]));for(const ee of O.bars)Re.set(ee.ts,ee);A.splice(0,A.length,...[...Re.values()].sort((ee,Qe)=>ee.ts-Qe.ts))}const k=e.replayBars(n,A.filter(
O=>O.ts>=x),a.serverNow()),U=k.filter(O=>O.kind==="funding");(U.length>2?k.filter(O=>O.kind!=="funding"):k).forEach(O=>v(`[\uC7AC\uC0DD] ${n} ${O.message}`,O.kind===
"sl"||O.kind==="liq"?"down":O.kind==="funding"?"info":"up")),U.length>2&&v(`[\uC7AC\uC0DD] ${n} \uD380\uB529\uBE44 ${U.length}\uD68C \uBC18\uC601 (\uB9C8\uC9C0\uB9C9: ${U[U.
length-1].message})`,"info"),P>x&&v(`[\uC7AC\uC0DD] ${n} ${ae(x)}~${ae(P)} \uAD6C\uAC04\uC740 1\uBD84\uBD09 \uC81C\uACF5 \uBC94\uC704(30\uC77C) \uBC16 \u2013 \uC7AC\uC0DD \uC0DD\uB7B5`,
"warn");const Z=(i=e.state).lastTickTs??(i.lastTickTs={});Z[n]=Math.max(Z[n]??0,a.serverNow()),K.current.succeeded(n),S()}catch{K.current.failed(n,a.serverNow())&&
v(`[\uC7AC\uC0DD] ${n} 1\uBD84\uBD09 \uC870\uD68C 3\uD68C \uC2E4\uD328 \u2013 \uD604\uC7AC\uAC00\uB85C \uACC4\uC18D (\uC624\uD504\uB77C\uC778 \uAD6C\uAC04 \uBBF8\uBC18\uC601)`,
"down")}finally{K.current.release(n)}};X(()=>{De();const e=()=>{document.visibilityState==="visible"&&De()};return document.addEventListener("visibilitychange",
e),()=>document.removeEventListener("visibilitychange",e)},[]),X(()=>{var C,i;if(!b||K.current.replaying.has(t.symbol))return;const e=y(t.symbol,b,(C=a.ticker)==
null?void 0:C.mark,(i=a.ticker)==null?void 0:i.funding);e.length&&(e.forEach(n=>v(n.message,n.kind==="sl"||n.kind==="liq"?"down":n.kind==="funding"?"info":"up")),
S())},[b]),X(()=>{const e=setInterval(async()=>{const C=new Set([...h.current.state.positions.map(i=>i.symbol),...h.current.state.pending.map(i=>i.symbol)]);C.delete(
t.symbol);for(const i of C){if(K.current.replaying.has(i))continue;const n=await au(i).catch(()=>null);if(!n)continue;Ce(x=>({...x,[i]:n.last}));const d=y(i,n.last,
n.mark,n.funding);d.length&&(d.forEach(x=>v(`${i} ${x.message}`)),S())}},4e3);return()=>clearInterval(e)},[t.symbol]);const $=h.current.state,ye=h.current.equity(
Y),he=h.current.available(),xe=$.positions.filter(e=>e.symbol===t.symbol),J=se(new Set(me(pe)??[])),te=e=>`${t.symbol}:${t.tf}:${e.type}:${e.ts}`,T=m.live[m.live.
length-1]??null,Ae=((Me=m.closed[m.closed.length-1])==null?void 0:Me.ts)??0,Ne=e=>e.ts<Ae?"\uC2E0\uD638 \uB9CC\uB8CC (\uCD5C\uADFC \uB9C8\uAC10 \uCE94\uB4E4 \uC544\uB2D8)":
Math.abs(b-Number(e.entry))>.3*Number(e.risk)?"\uAC00\uACA9 \uC774\uD0C8 (\uC2E0\uD638 \uC9C4\uC785\uAC00 \xB10.3R \uCD08\uACFC)":null,de=e=>{var i,n;const C=e===
"long"?(i=a.ticker)==null?void 0:i.ask:(n=a.ticker)==null?void 0:n.bid;return C&&b&&Math.abs(C-b)/b<.005?C:b},V=Le(()=>{var i;const e=((i=m.closed[m.closed.length-
3])==null?void 0:i.ts)??0,C=[...m.history].reverse().find(n=>n.ts>=e);return T??C??null},[T,m.history,m.closed]),be=()=>$.wallet*t.riskPct/100,Ee=(e,C)=>eu({equity:String(
$.wallet),available:String(he),riskPct:t.riskPct,entry:String(e),sl:String(C),leverage:t.leverage,feeRate:String(j),slippageBps:ie,qtyStep:String(l.qtyStep),minQty:String(
l.qtyStep),minNotional:ue}),ke=(e,C=!1)=>{if($.positions.some(Z=>Z.symbol===t.symbol)){v("\uC774\uBBF8 \uD3EC\uC9C0\uC158 \uBCF4\uC720 \uC911","down");return}const i=b,
n=Ne(e);if(n){v(`${n} \u2013 \uC9C4\uC785 \uBD88\uAC00`,"down");return}const d=Ue({side:e.side,kind:e.kind,entry:String(i),extremeWick:e.sl,box:e.box,slBufferPct:0,
tickSize:f,feeRate:j,slippageBps:ie});if(e.kind==="range"&&uu({side:e.side,entry:d.entry,sl:d.sl,tp:d.targets[0].price,feeRate:j,slippageBps:ie})<1){v("\uD604\uC7AC\uAC00 \uAE30\uC900 T\
P1 \uC21C\uC190\uC775\uBE44 1 \uBBF8\uB9CC \u2013 \uC9C4\uC785 \uC0DD\uB7B5","down");return}const x=Number(d.sl),A=Au(d.targets),P=e.side==="long";if(P?!(x<i&&A[0].
price>i):!(x>i&&A[0].price<i)){v("\uD604\uC7AC\uAC00\uAC00 \uC2E0\uD638 \uBC94\uC704\uB97C \uBC97\uC5B4\uB098 \uC9C4\uC785 \uBD88\uAC00 (SL/TP1 \uC0AC\uC774 \uC544\uB2D8)",
"down");return}const W=Ee(i,x),k=Number(W.qty);if(W.belowMin||!(k>0)){v(`\uB9AC\uC2A4\uD06C ${t.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${ue}\
 USDT / ${l.qtyStep}) \uBBF8\uB9CC`,"down");return}const U=h.current.open({symbol:t.symbol,side:e.side,qty:k,price:i,refPx:de(e.side),leverage:t.leverage,sl:x,targets:A,
setup:e.type,signalId:te(e),breakoutLevel:e.kind==="breakout"?Number(P?e.box.top:e.box.bottom):void 0,riskBudget:be()},a.serverNow());if(!U.ok){v(U.error??"\uC9C4\uC785 \uC2E4\
\uD328","down");return}J.current.add(te(e)),Q(pe,[...J.current].slice(-300)),v(`${C?"[\uC790\uB3D9] ":""}${le[e.type]} \uBAA8\uC758 \uC9C4\uC785 ${o(k,l.qdp)} @\
 ${o(U.fillPx??i,l.dp)}`,"up"),S()},We=e=>{const C=$.fills.filter(d=>d.final&&d.symbol===t.symbol),i=C[C.length-1];if(i){const d=$.fills.filter(A=>A.positionId===
i.positionId).reduce((A,P)=>A+P.netPnl,0),x=Math.floor(i.closedAt/a.intervalMs)*a.intervalMs;if(d<0&&e.ts<=x+2*a.intervalMs)return"\uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30"}
const n=new Date(a.serverNow());return n.setHours(0,0,0,0),bu($.fills,n.getTime())<=-3?"\uC77C\uC77C \uC190\uC2E4 \uD55C\uB3C4 \u22123R \uB3C4\uB2EC":null};X(()=>{
if(!T)return;const e=te(T);if(!J.current.has(`n:${e}`)&&(J.current.add(`n:${e}`),Q(pe,[...J.current].slice(-300)),v(`\uC2E0\uD638: ${le[T.type]} \xB7 SL ${o(T.sl,
l.dp)} \xB7 ${T.targets.map(C=>`${C.label} ${o(C.price,l.dp)}`).join(" / ")}`,T.side==="long"?"up":"down"),t.autoPaper&&!xe.length)){const C=T.pressure.source!==
"trades"?"\uC555\uB825\uC774 OHLCV \uADFC\uC0AC":We(T);C?v(`[\uC790\uB3D9] \uC9C4\uC785 \uC0DD\uB7B5 \u2013 ${C}`,"info"):ke(T,!0)}},[T==null?void 0:T.ts,T==null?
void 0:T.type]);const Be=Le(()=>xe.map(e=>{var d,x;const C=m.pressures.slice(0,m.closed.length),i=Xe({side:e.side,entry:e.entry,sl:e.sl,targets:e.targets.filter(
A=>!A.done).map(A=>({price:A.price}))},m.closed,C),n=e.setup.startsWith("BREAKOUT")?Ze({side:e.side,entry:e.entry,sl:e.initialSl,targets:e.targets.map(A=>({price:A.
price})),type:e.setup,adds:e.adds,brokenLevel:e.breakoutLevel,openedTs:Math.floor(e.openedAt/a.intervalMs)*a.intervalMs,lastAddTs:e.lastAddTs,risk:Math.abs((e.initialEntry??
e.entry)-e.initialSl)},m.closed,C,m.box,{maxAdds:t.maxAdds,addSizePct:t.addSizePct,tickSize:f,atr:((d=m.signalBox)==null?void 0:d.atr)??((x=m.box)==null?void 0:
x.atr)}):null;return{p:e,flip:i,pyr:n}}),[p,m.closed,m.pressures,m.box,m.signalBox,t.maxAdds,t.addSizePct,t.symbol,a.intervalMs]),we=se(new Set);X(()=>{for(const e of Be){
const C=`${e.p.id}:${Ae}`;e.flip.alert&&!we.current.has(C)&&(we.current.add(C),v(`\uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (${e.flip.multiple.
toFixed(1)}\uBC30)`,"warn"))}},[Be]);const fe=(e,C,i)=>{const n=h.current.closeFraction(e.id,C,Y[e.symbol]??b,i,a.serverNow());n&&v(`${i} ${o(n.qty,_(e.symbol).
qdp)} @ ${o(n.exit,_(e.symbol).dp)} \xB7 \uC21C\uC190\uC775 ${R(n.netPnl)} USDT`,n.netPnl>=0?"up":"down"),S()},je=(e,C)=>{const i=e.initialQty??e.origQty/(1+e.adds*
(t.addSizePct/100)),n=e.riskBudget??$.wallet*t.riskPct/100,d=fu(e,{last:de(e.side),suggestedSl:C.sl?Number(C.sl):void 0,budget:n,wantQty:i*(C.sizePct??t.addSizePct)/
100,step:l.qtyStep});if(!(d.qty>0)){v("\uCD94\uAC00 \uC2DC \uCD1D \uB9AC\uC2A4\uD06C\uAC00 \uD55C\uB3C4 \uCD08\uACFC","down");return}if(d.qty*b<ue){v(`\uCD94\uAC00 \uC218\uB7C9\uC774 \uCD5C\uC18C\
 \uC8FC\uBB38 \uAE08\uC561(${ue} USDT) \uBBF8\uB9CC`,"down");return}const x=h.current.open({symbol:e.symbol,side:e.side,qty:d.qty,price:b,refPx:de(e.side),leverage:e.
leverage,sl:d.newSl,targets:[],setup:e.setup,isAdd:!0,candleTs:Ae},a.serverNow());if(!x.ok){v(x.error??"\uCD94\uAC00 \uC2E4\uD328","down");return}v(`\uBD88\uD0C0\uAE30 #${e.
adds+1}: ${o(d.qty,l.qdp)} @ ${o(x.fillPx??b,l.dp)} \xB7 SL ${o(d.newSl,l.dp)}`,"up"),S()},ze=qe(e=>{var x,A;const C=m.closed,i=C.length>=2?e==="long"?Math.min(
C[C.length-1].low,C[C.length-2].low):Math.max(C[C.length-1].high,C[C.length-2].high):b*(e==="long"?.995:1.005),n=m.box,d=n?b<Number(n.top)&&b>Number(n.bottom):!1;
if(n){const P=d?"range":"breakout",W=e==="long"?Math.min(i,b*.999):Math.max(i,b*1.001),k=Ue({side:e,kind:P,entry:String(b),extremeWick:String(W),box:n,atr:n.atr,
tickSize:f,feeRate:j,slippageBps:ie}),U=Z=>Z?Number(Z).toFixed(l.dp):"";return{side:e,kind:P,sl:U(k.sl),tp1:U((x=k.targets[0])==null?void 0:x.price),tp2:U((A=k.
targets[1])==null?void 0:A.price)}}return{side:e,kind:"breakout",...hu(e,b,f,l.dp),tp2:""}},[m.closed,m.box,b,l.dp,f]),[Ge,Se]=q(null),Ve=e=>{var i,n;const C=d=>d?
Number(d).toFixed(l.dp):"";Se({side:e.side,kind:e.kind,sl:C(e.sl),tp1:C((i=e.targets[0])==null?void 0:i.price),tp2:C((n=e.targets[1])==null?void 0:n.price),signal:e}),
D("\uAC70\uB798")},$e=(((Pe=a.ticker)==null?void 0:Pe.change24h)??0)>=0;return s("div",{className:"h-full flex flex-col pt-safe",children:[u("header",{className:"\
px-3 pt-2 pb-1.5 border-b border-line",children:s("div",{className:"flex items-end justify-between",children:[s("div",{children:[s("div",{className:"flex items-\
center gap-2",children:[u("select",{value:t.symbol,onChange:e=>B({symbol:e.target.value}),className:"bg-transparent text-[15px] font-semibold outline-none",children:lu.
map(e=>u("option",{value:e.symbol,className:"bg-panel",children:e.symbol},e.symbol))}),u("span",{className:"text-[10px] px-1.5 py-0.5 rounded bg-panel2 text-mut\
ed",children:"\uBB34\uAE30\uD55C \xB7 \uBAA8\uC758"}),u("span",{className:`w-2 h-2 rounded-full ${a.status==="live"?"bg-up":"bg-warn"}`,title:a.status})]}),u("d\
iv",{className:`text-[26px] leading-8 font-semibold num ${$e?"text-up":"text-down"}`,children:b?o(b,l.dp):"\u2014"})]}),s("div",{className:"text-right text-[11p\
x] text-muted num leading-[18px]",children:[s("div",{children:["24h ",u("span",{className:$e?"text-up":"text-down",children:a.ticker?ou(a.ticker.change24h):"\u2014"})]}),
s("div",{children:["\uB9C8\uD06C ",a.ticker?o(a.ticker.mark,l.dp):"\u2014"]}),s("div",{children:["\uD380\uB529 ",a.ticker?`${(a.ticker.funding*100).toFixed(4)}%`:
"\u2014"]})]})]})}),I.length>0&&u("div",{className:"px-3 py-1.5 space-y-1 border-b border-line bg-bg","aria-live":"polite",children:I.map(e=>u("div",{className:`\
text-[12px] leading-4 px-2.5 py-1.5 rounded-md ${e.tone==="down"?"bg-down/20 text-down":e.tone==="up"?"bg-up/15 text-up":e.tone==="warn"?"bg-warn/20 text-warn":
"bg-panel2 text-txt"}`,children:e.text},e.id))}),s("main",{className:"flex-1 min-h-0 flex flex-col overflow-hidden",children:[r==="\uCC28\uD2B8"&&s(Ye,{children:[
s("div",{className:"flex items-center justify-between px-3 py-1.5 gap-2",children:[u(ve,{items:cu,value:t.tf,onChange:e=>B({tf:e})}),u("button",{onClick:()=>N(e=>!e),
className:`h-8 px-3 rounded-full text-xs ${M?"bg-warn text-bg font-semibold":"bg-panel2 text-muted"}`,children:M?"\uD3B8\uC9D1 \uC644\uB8CC":"\uBC15\uC2A4 \uD3B8\uC9D1"})]}),
u("div",{className:"flex-1 min-h-0",children:a.candles.length?u(tu,{viewKey:`${t.symbol}:${t.tf}`,candles:a.candles,pressures:m.pressures,box:m.box,signals:m.history,
positions:xe,dp:l.dp,showHist:t.showHist,editBox:M,onBoxEdit:(e,C)=>{var n;const i={top:e,bottom:C,startTs:(c==null?void 0:c.startTs)??((n=m.box)==null?void 0:n.
startTime)??a.serverNow(),locked:!0};g(i),Q(`dupont.box.${t.symbol}`,i)}}):u("div",{className:"p-6 text-muted text-sm",children:a.err?`\uB370\uC774\uD130 \uC624\uB958: ${a.
err}`:"\uCE94\uB4E4 \uBD88\uB7EC\uC624\uB294 \uC911\u2026"})}),u(wu,{box:m.box,manual:c,dp:l.dp,tape:m.tapeCandles,onUnlock:()=>{g(null),Q(`dupont.box.${t.symbol}`,
null),N(!1)},onEdit:(e,C)=>{var n;const i={top:e,bottom:C,startTs:(c==null?void 0:c.startTs)??((n=m.box)==null?void 0:n.startTime)??a.serverNow(),locked:!0};g(i),
Q(`dupont.box.${t.symbol}`,i)}}),Be.filter(e=>e.flip.alert).map(e=>s("div",{className:"mx-3 mb-2 rounded-lg bg-warn/15 border border-warn px-3 py-2 flex items-c\
enter justify-between",children:[s("span",{className:"text-[13px] text-warn font-semibold",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",
e.flip.multiple.toFixed(1),"\uBC30)"]}),u(z,{tone:"warn",className:"h-9",onClick:()=>fe(e.p,1,"\uC555\uB825\uBC18\uC804 \uCCAD\uC0B0"),children:"\uCCAD\uC0B0"})]},
e.p.id)),u(Su,{g:V,dp:l.dp,acted:V?J.current.has(te(V)):!1,stale:V?Ne(V):null,onEnter:()=>V&&ke(V),onEdit:()=>V&&Ve(V)})]}),r==="\uAC70\uB798"&&u($u,{s:t,set:B,
last:b,dp:l.dp,book:a.book,equity:ye,available:he,qtyStep:l.qtyStep,draft:Ge,setDraft:Se,defaultDraft:ze,sizeFor:Ee,onSubmit:(e,C,i,n)=>{var W;const d=Number(e.
sl),x=e.kind==="breakout"||!e.tp2?[{price:Number(e.tp1),fraction:1,label:e.kind==="breakout"?"TP 1:3":"TP"}]:[{price:Number(e.tp1),fraction:.5,label:"TP1 \uC911\uC559\uC120"},
{price:Number(e.tp2),fraction:.5,label:"TP2 \uBC18\uB300\uD3B8"}],A=((W=e.signal)==null?void 0:W.type)??"MANUAL",P=e.kind==="breakout"&&m.box?Number(e.side==="l\
ong"?m.box.top:m.box.bottom):void 0;if(C==="limit"){if(e.side==="long"?i>=b:i<=b){v(`\uC9C0\uC815\uAC00\uAC00 \uD604\uC7AC\uAC00 ${e.side==="long"?"\uC774\uC0C1":
"\uC774\uD558"} \u2013 \uC989\uC2DC \uCCB4\uACB0\uB418\uB294 \uC8FC\uBB38\uC740 \uC2DC\uC7A5\uAC00\uB85C \uB123\uC73C\uC138\uC694`,"down");return}const k=h.current.
placeLimit({symbol:t.symbol,side:e.side,qty:n,price:i,leverage:t.leverage,sl:d,targets:x,setup:A,breakoutLevel:P,riskBudget:be()},a.serverNow());v(k.ok?`\uC9C0\uC815\uAC00 ${e.
side==="long"?"\uB871":"\uC20F"} \uC8FC\uBB38 ${o(n,l.qdp)} @ ${o(i,l.dp)}`:k.error??"\uC8FC\uBB38 \uC2E4\uD328",k.ok?"up":"down")}else{const k=h.current.open({
symbol:t.symbol,side:e.side,qty:n,price:b,refPx:de(e.side),leverage:t.leverage,sl:d,targets:x,setup:A,breakoutLevel:P,signalId:e.signal?te(e.signal):void 0,riskBudget:be()},
a.serverNow());v(k.ok?`${e.side==="long"?"\uB871":"\uC20F"} \uBAA8\uC758 \uC9C4\uC785 ${o(n,l.qdp)} @ ${o(k.fillPx??b,l.dp)}`:k.error??"\uC9C4\uC785 \uC2E4\uD328",
k.ok?"up":"down"),k.ok&&e.signal&&(J.current.add(te(e.signal)),Q(pe,[...J.current].slice(-300)))}S()}},t.symbol),r==="\uD3EC\uC9C0\uC158"&&s("div",{className:"f\
lex-1 overflow-y-auto p-3 space-y-3",children:[s(H,{className:"p-3",children:[u(F,{k:"\uC790\uC0B0 (Equity)",v:`${o(ye)} USDT`}),u(F,{k:"\uAC00\uC6A9",v:`${o(he)}\
 USDT`}),u(F,{k:"\uBBF8\uC2E4\uD604 \uC190\uC775 (\uC21C, \uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC)",v:(()=>{const e=$.positions.reduce((i,n)=>{const d=Y[n.symbol]??n.entry;
return i+_e(n,d)-n.entryFeeLeft-d*n.qty*j},0),C=Number(e.toFixed(2));return s("span",{className:C>0?"text-up":C<0?"text-down":"",children:[R(e)," USDT"]})})()})]}),
!$.positions.length&&u("div",{className:"text-muted text-sm text-center py-8",children:"\uBCF4\uC720 \uD3EC\uC9C0\uC158 \uC5C6\uC74C"}),$.positions.map(e=>{var x;
const C=Be.find(A=>A.p.id===e.id),i=Y[e.symbol]??e.entry,n=_e(e,i)-e.entryFeeLeft-i*e.qty*j,d=_(e.symbol).dp;return s(H,{className:"p-3",children:[s("div",{className:"\
flex justify-between items-center mb-1",children:[s("div",{className:"font-semibold",children:[u("span",{className:e.side==="long"?"text-up":"text-down",children:e.
side==="long"?"\uB871":"\uC20F"})," ",e.symbol," ",s("span",{className:"text-muted text-xs",children:[e.leverage,"x \xB7 ",He(e.setup)]})]}),s("div",{className:"\
text-right",children:[s("div",{className:`num font-semibold ${n>=0?"text-up":"text-down"}`,children:[R(n)," USDT"]}),u("div",{className:"text-[10px] text-muted",
children:"\uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC \uC21C\uC190\uC775"})]})]}),u(F,{k:"\uC218\uB7C9 / \uC9C4\uC785\uAC00",v:`${o(e.qty,_(e.symbol).qdp)} / ${o(e.entry,d)}`}),
u(F,{k:"\uB9C8\uD06C / \uCCAD\uC0B0\uAC00",v:`${o(i,d)} / ${o(e.liqPrice,d)}`}),u(F,{k:`SL${e.beMoved?" (\uBCF8\uC808)":""}`,v:o(e.sl,d)}),e.targets.map((A,P)=>u(
F,{k:A.label,v:s("span",{className:A.done?"text-up":"",children:[o(A.price,d)," \xB7 ",Math.round(A.fraction*100),"% ",A.done?"\u2713 \uCCB4\uACB0":"\uB300\uAE30"]})},
P)),u(F,{k:"\uACC4\uD68D \uB9AC\uC2A4\uD06C (1R)",v:e.riskUsd?`${o(e.riskUsd)} USDT`:"\u2014"}),e.riskBudget!==void 0&&u(F,{k:"\uB9AC\uC2A4\uD06C \uC608\uC0B0 (\uC9C4\uC785 \uC2DC \uACE0\uC815)",
v:`${o(e.riskBudget)} USDT`}),(e.fundingAcc??0)!==0&&u(F,{k:"\uD380\uB529\uBE44 \uB204\uC801 (\uBBF8\uC815\uC0B0)",v:s("span",{className:(e.fundingAcc??0)>0?"te\
xt-down":"text-up",children:[R(-(e.fundingAcc??0),4)," USDT"]})}),u(F,{k:"\uC2E4\uD604 \uC190\uC775 (\uC21C, \uD380\uB529 \uD3EC\uD568)",v:R(e.realizedNet)}),(C==
null?void 0:C.flip.alert)&&s("div",{className:"mt-2 text-[12px] text-warn",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",C.flip.
multiple.toFixed(1),"\uBC30, \uBAA9\uD45C \uC9C4\uD589 ",Math.round(C.flip.progress*100),"%)"]}),(C==null?void 0:C.pyr)&&s("div",{className:`mt-1 text-[11px] ${C.
pyr.add?"text-accent":"text-muted"}`,children:["\uBD88\uD0C0\uAE30 ",e.adds,"/",t.maxAdds,": ",Eu(C.pyr,_(e.symbol).dp)]}),!(C!=null&&C.pyr)&&s("div",{className:"\
mt-1 text-[11px] text-muted",children:["\uBD88\uD0C0\uAE30: \uB3CC\uD30C \uC2E0\uD638 \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 (\uCD5C\uB300 ",t.maxAdds,
"\uD68C)"]}),s("div",{className:"grid grid-cols-3 gap-2 mt-3",children:[u(z,{tone:"down",onClick:()=>fe(e,1,"\uC2DC\uC7A5\uAC00 \uCCAD\uC0B0"),children:"\uC804\uB7C9 \uCCAD\uC0B0"}),
u(z,{onClick:()=>fe(e,.5,"50% \uCCAD\uC0B0"),children:"50% \uCCAD\uC0B0"}),u(z,{tone:"accent",disabled:!((x=C==null?void 0:C.pyr)!=null&&x.add)||e.adds>=t.maxAdds||
e.symbol!==t.symbol,onClick:()=>(C==null?void 0:C.pyr)&&je(e,C.pyr),children:"\uBD88\uD0C0\uAE30"})]})]},e.id)}),$.pending.length>0&&s(H,{className:"p-3",children:[
u("div",{className:"text-sm font-semibold mb-1",children:"\uBBF8\uCCB4\uACB0 \uC9C0\uC815\uAC00"}),$.pending.map(e=>s("div",{className:"flex justify-between ite\
ms-center py-1 text-[13px]",children:[s("span",{className:e.side==="long"?"text-up":"text-down",children:[e.side==="long"?"\uB871":"\uC20F"," ",e.symbol," ",o(e.
qty,_(e.symbol).qdp)," @ ",o(e.price,_(e.symbol).dp)]}),u("button",{className:"text-muted underline",onClick:()=>{h.current.cancelLimit(e.id),S()},children:"\uCDE8\uC18C"})]},
e.id))]})]}),r==="\uAE30\uB85D"&&u(Tu,{broker:h.current}),r==="\uC124\uC815"&&s("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[s(H,{className:"\
p-3",children:[u("div",{className:"text-sm font-semibold mb-2",children:"\uC790\uAE08"}),u(F,{k:"\uC2DC\uB4DC / \uC9C0\uAC11",v:`${o($.bankroll)} / ${o($.wallet)}\
 USDT`}),u(z,{tone:"down",className:"w-full mt-2",onClick:()=>{confirm("\uBAA8\uC758 \uC790\uAE08\uC744 200 USDT\uB85C \uCD08\uAE30\uD654\uD558\uACE0 \uD3EC\uC9C0\uC158\xB7\uAE30\uB85D\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?")&&
(h.current.reset(xu,a.serverNow()),S(),v("200 USDT\uB85C \uCD08\uAE30\uD654"))},children:"\uC790\uAE08 \uCD08\uAE30\uD654 (200 USDT)"})]}),s(H,{className:"p-3 s\
pace-y-3",children:[u("div",{className:"text-sm font-semibold",children:"\uB9AC\uC2A4\uD06C"}),s("div",{className:"grid grid-cols-2 gap-2",children:[u(w,{label:"\
\uAC70\uB798\uB2F9 \uB9AC\uC2A4\uD06C %",value:String(t.riskPct),onChange:e=>B({riskPct:Math.max(.1,Number(e)||1)}),suffix:"%"}),u(w,{label:"\uAE30\uBCF8 \uB808\uBC84\uB9AC\uC9C0",
value:String(t.leverage),onChange:e=>B({leverage:Math.min(125,Math.max(1,Math.round(Number(e)||1)))}),suffix:"x"}),u(w,{label:"\uBD88\uD0C0\uAE30 \uCD5C\uB300 \uD69F\uC218",
value:String(t.maxAdds),onChange:e=>B({maxAdds:Math.max(0,Math.round(Number(e)||0))})}),u(w,{label:"\uBD88\uD0C0\uAE30 \uD06C\uAE30 (\uCD08\uAE30 \uB300\uBE44)",
value:String(t.addSizePct),onChange:e=>B({addSizePct:Math.max(5,Number(e)||50)}),suffix:"%"})]}),u(re,{on:t.moveSlToBe,onChange:e=>B({moveSlToBe:e}),label:"TP1 \
\uCCB4\uACB0 \uD6C4 SL \uBCF8\uC808 \uC774\uB3D9",hint:"\uBCF8\uC808\uAC00 = \uC9C4\uC785\uAC00 + \uB0A8\uC740 \uC9C4\uC785\xB7\uCCAD\uC0B0 \uC218\uC218\uB8CC (\uC190\uC2E4 \uC5C6\uC774 \uCCAD\uC0B0)"}),
u(re,{on:t.autoPaper,onChange:e=>B({autoPaper:e}),label:"\uC790\uB3D9 \uBAA8\uC758\uB9E4\uB9E4",hint:"\uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 \uC2E0\uD638\uB9CC \xB7 \uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30 \xB7 \uC77C\uC77C \u22123R \uC815\uC9C0 (\uAE30\uBCF8 OFF)"})]}),
s(H,{className:"p-3 space-y-3",children:[u("div",{className:"text-sm font-semibold",children:"\uBC15\uC2A4 / \uD53C\uBD07"}),s("div",{className:"grid grid-cols-\
2 gap-2",children:[u(w,{label:"\uB8E9\uBC31 (\uCE94\uB4E4)",value:String(t.lookback),onChange:e=>B({lookback:Math.max(20,Math.round(Number(e)||80))})}),u(w,{label:"\
\uD130\uCE58 \uD5C8\uC6A9 %",value:String(t.tolerancePct),onChange:e=>B({tolerancePct:Math.max(.05,Number(e)||.25)}),suffix:"%"}),u(w,{label:"\uD53C\uBD07 \uC88C",
value:String(t.pivotLeft),onChange:e=>B({pivotLeft:Math.max(1,Math.round(Number(e)||3))})}),u(w,{label:"\uD53C\uBD07 \uC6B0",value:String(t.pivotRight),onChange:e=>B(
{pivotRight:Math.max(1,Math.round(Number(e)||3))})}),u(w,{label:"\uCD5C\uC18C \uD130\uCE58",value:String(t.minTouches),onChange:e=>B({minTouches:Math.max(1,Math.
round(Number(e)||2))})}),u(w,{label:"\uCD5C\uC18C \uBC15\uC2A4 \uB192\uC774 %",value:String(t.minHeightPct),onChange:e=>B({minHeightPct:Math.max(0,Number(e)||0)}),
suffix:"%"})]}),u(re,{on:t.requireRange,onChange:e=>B({requireRange:e}),label:"\uBC15\uC2A4\uAD8C(\uBE44\uCD94\uC138)\uC77C \uB54C\uB9CC \uC2E0\uD638"}),u(re,{on:t.
showHist,onChange:e=>B({showHist:e}),label:"\uC555\uB825 \uD788\uC2A4\uD1A0\uADF8\uB7A8 \uD45C\uC2DC"})]}),u(H,{className:"p-3",children:u(re,{on:t.notify,onChange:async e=>{
e&&"Notification"in window&&Notification.permission!=="granted"&&await Notification.requestPermission(),B({notify:e})},label:"\uC54C\uB9BC",hint:"\uC2E0\uD638\xB7\uCCB4\uACB0\xB7\uC555\uB825\uBC18\uC804 (\uD648 \
\uD654\uBA74 \uC571\uC5D0\uC11C \uAD8C\uC7A5)"})}),s("div",{className:"text-[11px] text-muted px-1 pb-4 leading-5",children:["\uD398\uC774\uD37C(\uBAA8\uC758) \uD2B8\uB808\uC774\uB529 \uC804\uC6A9 \xB7 \uC2E4\uACC4\uC88C/API \uD0A4 \uC5C6\uC74C \xB7 B\
itget \uACF5\uAC1C \uC2DC\uC138 \uC0AC\uC6A9. \uC218\uC218\uB8CC: Bitget USDT-M \uD14C\uC774\uCEE4 0.06% / \uBA54\uC774\uCEE4 0.02% (TP\uB3C4 \uD14C\uC774\uCEE4\uB85C \uBCF4\uC218 \uACC4\uC0B0). \uC2AC\uB9AC\uD53C\uC9C0 ",
ie,"bp (\uC2DC\uC7A5\uAC00\xB7\uC190\uC808). \uD380\uB529\uBE44: 00/08/16\uC2DC UTC \uC815\uC0B0 \uD380\uB529\uB960(Bitget \uACF5\uAC1C \uC774\uB825, \uC5C6\uC73C\uBA74 \uC815\uC0B0 \uC9C1\uC804 \uD380\uB529\uB960). \uAC15\uC81C\uCCAD\uC0B0 = \uACA9\uB9AC \uC99D\uAC70\uAE08 \uC804\uC561 \uC190\uC2E4. \uB3CC\uD30C TP 1:3\uC740 \uC218\uC218\uB8CC \uCC28\uAC10 \uC21C\uC190\uC775 \uAE30\uC900. \uC571\uC774 \uAEBC\uC838 \uC788\uB358 \uB3D9\uC548\uC740 \uB2E4\uC2DC \uC5F4 \uB54C 1\uBD84\uBD09\uC73C\uB85C \uC7AC\uC0DD (SL\xB7TP \uB3D9\uC2DC \uD130\
\uCE58 \uC2DC SL \uC6B0\uC120). \uC555\uB825: \uC2E4\uC2DC\uAC04 \uCCB4\uACB0(aggressor) \uC9D1\uACC4, \uC5F0\uACB0 \uC774\uC804 \uCE94\uB4E4\uC740 OHLCV \uADFC\uC0AC."]})]})]}),
u("nav",{className:"border-t border-line bg-panel pb-safe grid grid-cols-5",children:Nu.map(e=>u("button",{onClick:()=>D(e),className:`h-14 text-[13px] relative\
 ${r===e?"text-accent font-semibold":"text-muted"}`,children:s("span",{className:"inline-flex items-center gap-1",children:[e,e==="\uD3EC\uC9C0\uC158"&&$.positions.
length>0&&u("span",{className:"min-w-4 h-4 px-1 rounded-full bg-accent text-bg text-[10px] leading-4 font-semibold",children:$.positions.length})]})},e))})]})}function wu({
box:r,manual:D,dp:t,tape:E,onUnlock:B,onEdit:l}){const[a,c]=q(!1),[g,M]=q(""),[N,m]=q("");return r?s("div",{className:"px-3 py-1.5 border-t border-line text-[12\
px]",children:[s("div",{className:"flex items-center justify-between gap-2",children:[s("div",{className:"num leading-5",children:[u("span",{className:"text-mut\
ed",children:"\uBC15\uC2A4 "}),u("span",{className:"text-down",children:o(r.bottom,t)})," \u2013 ",u("span",{className:"text-up",children:o(r.top,t)}),u("span",
{className:"text-muted",children:" \xB7 50% "}),o(r.mid,t)]}),s("div",{className:"flex gap-1.5 items-center",children:[u("span",{className:`px-1.5 py-0.5 rounde\
d text-[10px] ${r.isRange?"bg-up/20 text-up":"bg-warn/20 text-warn"}`,children:D?"\uC218\uB3D9\xB7\uACE0\uC815":r.isRange?"\uBC15\uC2A4\uAD8C":"\uCD94\uC138/\uC57D\uD568"}),
u("button",{className:"text-accent",onClick:()=>{M(String(Number(r.top))),m(String(Number(r.bottom))),c(f=>!f)},children:"\uC218\uC815"}),D&&u("button",{className:"\
text-muted",onClick:B,children:"\uC790\uB3D9"})]})]}),s("div",{className:"text-[10px] text-muted",children:["\uD130\uCE58 ",r.touchesTop,"/",r.touchesBottom," \xB7\
 \uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 ",E,"\uCE94\uB4E4 (\uADF8 \uC678 OHLCV \uADFC\uC0AC)"]}),a&&s("div",{className:"grid grid-cols-3 gap-2 mt-2 items-\
end",children:[u(w,{label:"\uC0C1\uB2E8(\uC800\uD56D)",value:g,onChange:M}),u(w,{label:"\uD558\uB2E8(\uC9C0\uC9C0)",value:N,onChange:m}),u(z,{tone:"accent",onClick:()=>{
const f=Number(g),h=Number(N);f>0&&h>0&&f!==h&&(l(f,h),c(!1))},children:"\uACE0\uC815"})]})]}):u("div",{className:"px-3 py-2 text-[12px] text-muted border-t bor\
der-line",children:"\uBC15\uC2A4 \uD0D0\uC9C0 \uC911\u2026 (\uD53C\uBD07 \uD130\uCE58 \uBD80\uC871)"})}function Su({g:r,dp:D,acted:t,stale:E,onEnter:B,onEdit:l}){
if(!r)return u("div",{className:"mx-3 mb-2 px-3 py-2 rounded-lg bg-panel border border-line text-[12px] text-muted",children:"\uC2E0\uD638 \uB300\uAE30 \uC911 \xB7 \uBC15\uC2A4 \uC9C0\uC9C0/\uC800\uD56D + \uC7A5\uC545\uD615 + \uC555\uB825 \uD655\uC778 \uC2DC\
 \uD45C\uC2DC"});const a=r.side==="long";return s("div",{className:`mx-3 mb-2 rounded-xl border px-3 py-2 ${a?"border-up/60 bg-up/10":"border-down/60 bg-down/10"}`,
children:[s("div",{className:"flex justify-between items-center",children:[s("div",{className:`font-semibold ${a?"text-up":"text-down"}`,children:[le[r.type]," ",
s("span",{className:"text-muted text-[11px] font-normal",children:[ae(r.ts)," \uB9C8\uAC10"]})]}),s("div",{className:"text-[11px] text-muted flex items-center g\
ap-1.5",children:[r.pressure.source==="ohlcv"&&u("span",{className:"px-1.5 py-0.5 rounded bg-warn/20 text-warn text-[10px]",children:"\uC555\uB825 \uADFC\uC0AC(OHLCV)"}),
s("span",{children:["\uB9E4\uC218\uC555\uB825 ",Math.round(r.pressure.ratio*100),"%"]})]})]}),s("div",{className:"grid grid-cols-4 gap-1 text-[11px] num mt-1",children:[
s("div",{children:[u("div",{className:"text-muted",children:"\uC9C4\uC785"}),o(r.entry,D)]}),s("div",{children:[u("div",{className:"text-muted",children:"SL"}),
u("span",{className:"text-warn",children:o(r.sl,D)})]}),r.targets.map(c=>s("div",{children:[s("div",{className:"text-muted",children:[c.label," ",c.sizePct,"%"]}),
u("span",{className:"text-up",children:o(c.price,D)})]},c.label))]}),s("div",{className:"flex gap-2 mt-2",children:[u(z,{tone:a?"up":"down",className:"flex-1 h-\
10 text-[13px]",disabled:t||!!E,onClick:B,children:t?"\uC9C4\uC785 \uC644\uB8CC/\uCC98\uB9AC\uB428":E??`\uD0ED\uD558\uC5EC \uBAA8\uC758 ${a?"\uB871":"\uC20F"} \uC9C4\
\uC785`}),u(z,{className:"h-10",onClick:l,children:"\uC218\uC815"})]})]})}function $u(r){const[D,t]=q("market"),[E,B]=q(""),[l,a]=q(""),c=r.draft??r.defaultDraft(
"long");X(()=>{!r.draft&&r.last&&r.setDraft(r.defaultDraft("long"))},[r.last>0]);const g=D==="limit"&&Number(E)>0?Number(E):r.last,M=Number(c.sl);let N=null;try{
N=g>0&&M>0&&M!==g?r.sizeFor(g,M):null}catch{N=null}const m=Math.max(0,Math.round(-Math.log10(r.qtyStep))),f=l?mu(Number(l)||0,r.qtyStep):Number((N==null?void 0:
N.qty)??0),h=c.side==="long",p=Number(c.tp1),L=Number(c.tp2),S=h?M<g:M>g,I=p>0&&(h?p>g:p<g)&&(c.kind==="breakout"||!c.tp2||(h?L>p:L<p)),G=f*g,v=G>=ue,b=G/r.s.leverage,
Y=D==="limit"?vu:j,Ce=D==="limit"?0:Ie,oe=Math.abs(g-M)*f+g*f*(Y+Ce)+M*f*(j+Ie),ne=S&&I&&v&&b+g*f*Y<=r.available+1e-9,ce=N!=null&&N.belowMin&&!l?`\uB9AC\uC2A4\uD06C ${r.
s.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${ue} USDT / ${r.qtyStep}) \uBBF8\uB9CC`:S?I?v?"\uAC00\uC6A9 \uC99D\uAC70\uAE08 \uBD80\uC871":
`\uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561 ${ue} USDT \uC774\uC0C1 \uD544\uC694`:`TP\uAC00 \uC9C4\uC785\uAC00 ${h?"\uC704":"\uC544\uB798"}(TP2\uB294 TP1 \uB108\uBA38)\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`:
`SL\uC774 \uC9C4\uC785\uAC00 ${h?"\uC544\uB798":"\uC704"}\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`,K=y=>r.setDraft({...c,...y});return s("div",{className:"f\
lex-1 overflow-y-auto px-3 pt-3",children:[s("div",{className:"grid grid-cols-[minmax(0,1fr)_124px] gap-2.5",children:[s("div",{className:"space-y-2.5",children:[
u("div",{className:"grid grid-cols-2 gap-1 bg-panel2 rounded-lg p-1",children:["long","short"].map(y=>u("button",{onClick:()=>{a(""),r.setDraft(c.signal&&c.side===
y?c:r.defaultDraft(y))},className:`h-9 rounded-md font-semibold text-sm ${c.side===y?y==="long"?"bg-up text-white":"bg-down text-white":"text-muted"}`,children:y===
"long"?"\uB871":"\uC20F"},y))}),u(ve,{items:["market","limit"],value:D,onChange:y=>t(y),fmt:y=>y==="market"?"\uC2DC\uC7A5\uAC00":"\uC9C0\uC815\uAC00"}),D==="lim\
it"&&u(w,{label:"\uC9C0\uC815\uAC00",value:E,onChange:B}),s("div",{children:[u("span",{className:"text-[11px] text-muted",children:"\uB808\uBC84\uB9AC\uC9C0"}),
u(ve,{items:[3,5,10,20],value:r.s.leverage,onChange:y=>r.set({leverage:y}),fmt:y=>`${y}x`})]}),u(w,{label:"\uB9AC\uC2A4\uD06C (\uC790\uC0B0 \uB300\uBE44)",value:String(
r.s.riskPct),onChange:y=>{a(""),r.set({riskPct:Math.max(.1,Number(y)||1)})},suffix:"%"}),u(w,{label:"\uC190\uC808 SL",value:String(c.sl),onChange:y=>K({sl:y})}),
u(w,{label:c.kind==="breakout"?"TP (\uC21C 1:3, 100%)":"TP1 \uC911\uC559\uC120 (50%)",value:String(c.tp1),onChange:y=>K({tp1:y})}),c.kind==="range"&&u(w,{label:"\
TP2 \uBC18\uB300\uD3B8 \uACBD\uACC4 (50%)",value:String(c.tp2),onChange:y=>K({tp2:y})}),u(w,{label:`\uC218\uB7C9 (\uB9AC\uC2A4\uD06C ${r.s.riskPct}%: ${N?o(N.qty,
m):"\u2014"})`,value:l||(N?Number(N.qty).toFixed(m):""),onChange:a})]}),u("div",{className:"bg-panel rounded-xl border border-line py-2",children:u(Cu,{book:r.book,
dp:r.dp,qdp:m,rows:7})})]}),c.signal&&s("div",{className:"mt-2 text-[11px] text-accent",children:["\uC2E0\uD638 \uC790\uB3D9 \uC785\uB825: ",le[c.signal.type],"\
 (",ae(c.signal.ts)," \uB9C8\uAC10) \xB7 SL/TP \uC790\uB3D9"]}),s(H,{className:"p-3 mt-3",children:[u(F,{k:"\uC9C4\uC785 \uAE30\uC900\uAC00",v:o(g,r.dp)}),u(F,{
k:"\uC99D\uAC70\uAE08 / \uBA85\uBAA9",v:f>0?`${o(b)} / ${o(G)} USDT`:"\u2014"}),u(F,{k:"SL \uC2DC \uC21C\uC190\uC2E4 (\uC218\uC218\uB8CC\xB7\uC2AC\uB9AC\uD53C\uC9C0)",
v:f>0&&S?s("span",{className:"text-down",children:["-",o(oe)," USDT (",(oe/Math.max(r.equity,1e-9)*100).toFixed(2),"%)"]}):"\u2014"}),f>0&&I&&u(F,{k:c.kind==="b\
reakout"||!c.tp2?"TP \uC2DC \uC21C\uC774\uC775":"TP1+TP2 \uC2DC \uC21C\uC774\uC775",v:s("span",{className:"text-up",children:["+",o((c.kind==="breakout"||!c.tp2?
Math.abs(p-g)*f-p*f*j:Math.abs(p-g)*f*.5+Math.abs(L-g)*f*.5-(p+L)*f*.5*j)-g*f*(Y+Ce))," USDT"]})}),u(F,{k:"\uAC00\uC6A9 / \uC790\uC0B0",v:`${o(r.available)} / ${o(
r.equity)} USDT`})]}),s("div",{className:"sticky bottom-0 -mx-3 px-3 pt-2 pb-3 mt-1 bg-bg/95 backdrop-blur border-t border-line",children:[!ne&&(f>0||(N==null?void 0:
N.belowMin))&&u("div",{className:"text-[11px] text-down mb-1",children:ce}),u(z,{tone:c.side==="long"?"up":"down",className:"w-full h-12 text-[16px]",disabled:!ne||
!(f>0),onClick:()=>{r.onSubmit(c,D,g,f),a("")},children:c.side==="long"?"\uB871 (\uB9E4\uC218) \uBAA8\uC758 \uC9C4\uC785":"\uC20F (\uB9E4\uB3C4) \uBAA8\uC758 \uC9C4\uC785"})]})]})}
function Tu({broker:r}){var m,f,h;const D=r.state,t=gu(D.fills,D.positions.map(p=>p.id)),E=D.equityCurve,B=360,l=120,a=E.map(p=>p.equity),c=Math.min(...a,D.bankroll),
g=Math.max(...a,D.bankroll),M=E.map((p,L)=>`${L?"L":"M"}${L/Math.max(1,E.length-1)*B},${l-(p.equity-c)/Math.max(1e-9,g-c)*(l-10)-5}`).join(" "),N=async()=>{var G;
const p=yu(D.fills),L=`dupont-paper-${new Date().toISOString().slice(0,10)}.csv`,S=new File([p],L,{type:"text/csv"});if((G=navigator.canShare)!=null&&G.call(navigator,
{files:[S]}))try{await navigator.share({files:[S],title:L});return}catch{}const I=document.createElement("a");I.href=URL.createObjectURL(S),I.download=L,I.click(),
setTimeout(()=>URL.revokeObjectURL(I.href),2e3)};return s("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[s(H,{className:"p-3",children:[s("di\
v",{className:"grid grid-cols-3 text-center",children:[s("div",{children:[u("div",{className:"text-[11px] text-muted",children:"\uAC70\uB798"}),u("div",{className:"\
num font-semibold",children:t.trades})]}),s("div",{children:[u("div",{className:"text-[11px] text-muted",children:"\uC2B9\uB960"}),u("div",{className:"num font-\
semibold",children:t.trades?`${(t.winRate*100).toFixed(0)}%`:"\u2014"})]}),s("div",{children:[u("div",{className:"text-[11px] text-muted",children:"\uC21C\uC190\uC775"}),
u("div",{className:`num font-semibold ${t.net>=0?"text-up":"text-down"}`,children:R(t.net)})]})]}),s("div",{className:"text-[11px] text-muted text-center mt-1",
children:["\uC218\uC218\uB8CC \uD569\uACC4 ",o(t.fees,3)," USDT (\uC21C\uC190\uC775\uC5D0 \uBC18\uC601)",t.funding!==0?` \xB7 \uD380\uB529 ${R(-t.funding,3)}`:"",
t.partialNet!==0?` \xB7 \uBCF4\uC720 \uC911 \uBD80\uBD84\uCCAD\uC0B0 ${R(t.partialNet)} \uD3EC\uD568`:""]}),t.rTrades>0&&s("div",{className:"text-[11px] text-mu\
ted text-center num",children:["\uAE30\uB300\uAC12 ",s("span",{className:t.expectancyR>=0?"text-up":"text-down",children:[R(t.expectancyR),"R"]})," \xB7 \uD3C9\uADE0 \uC2B9 ",
R(t.avgWinR),"R / \uD328 ",R(t.avgLossR),"R (",t.rTrades,"\uAC74)"]})]}),s(H,{className:"p-3",children:[s("div",{className:"flex justify-between text-[12px] tex\
t-muted mb-1 num",children:[u("span",{children:"\uC790\uC0B0 \uACE1\uC120"}),s("span",{children:[o(((m=E[0])==null?void 0:m.equity)??D.bankroll)," \u2192 ",u("s\
pan",{className:(((f=E[E.length-1])==null?void 0:f.equity)??D.bankroll)>=D.bankroll?"text-up":"text-down",children:o(((h=E[E.length-1])==null?void 0:h.equity)??
D.bankroll)})," USDT"]})]}),s("svg",{viewBox:`0 0 ${B} ${l}`,className:"w-full h-[120px]",children:[u("line",{x1:"0",x2:B,y1:l-(D.bankroll-c)/Math.max(1e-9,g-c)*
(l-10)-5,y2:l-(D.bankroll-c)/Math.max(1e-9,g-c)*(l-10)-5,stroke:"#262e38",strokeDasharray:"4 4"}),u("path",{d:M,fill:"none",stroke:"#00c2cb",strokeWidth:"2"})]}),
D.positions.length>0&&u("div",{className:"text-[11px] text-muted mt-1",children:"\uC9C0\uAC11 \uAE30\uC900 \xB7 \uBCF4\uC720 \uD3EC\uC9C0\uC158\uC758 \uC9C4\uC785 \uC218\uC218\uB8CC\uB294 \uC774\uBBF8 \uCC28\uAC10\uB428 (\uBBF8\uC2E4\uD604 \uC190\uC775 \uC81C\uC678)"})]}),
u(z,{className:"w-full",onClick:N,disabled:!D.fills.length,children:"CSV \uB0B4\uBCF4\uB0B4\uAE30"}),[...D.fills].reverse().map(p=>s(H,{className:"p-3",children:[
s("div",{className:"flex justify-between text-[13px]",children:[s("span",{children:[u("span",{className:p.side==="long"?"text-up":"text-down",children:p.side===
"long"?"\uB871":"\uC20F"})," ",p.symbol," \xB7 ",He(p.setup)]}),s("span",{className:`num font-semibold ${p.netPnl>=0?"text-up":"text-down"}`,children:[R(p.netPnl),
" USDT"]})]}),s("div",{className:"text-[11px] text-muted num mt-0.5",children:[ae(p.closedAt)," \xB7 ",p.reason," \xB7 ",o(p.qty,_(p.symbol).qdp)," \xB7 ",o(p.entry,
_(p.symbol).dp)," \u2192 ",o(p.exit,_(p.symbol).dp)," \xB7 \uC218\uC218\uB8CC ",o(p.fees,3),p.funding?` \xB7 \uD380\uB529 ${R(-p.funding,3)}`:"",p.r!==void 0?` \
\xB7 ${R(p.r)}R`:""]})]},p.id)),!D.fills.length&&u("div",{className:"text-muted text-sm text-center py-6",children:"\uAC70\uB798 \uAE30\uB85D \uC5C6\uC74C"})]})}
Je.createRoot(document.getElementById("root")).render(u(ku,{}));if("serviceWorker"in navigator){const r="/dupont-mobile/";window.addEventListener("load",()=>navigator.
serviceWorker.register(`${r}sw.js`,{scope:r}).catch(()=>{}))}
