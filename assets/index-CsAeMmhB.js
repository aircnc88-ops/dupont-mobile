import{jsxs as s,jsx as e,Fragment as Zu}from"react/jsx-runtime";import ue from"react-dom/client";import{useState as L,useEffect as J,useRef as Cu,useCallback as Uu,
useMemo as Ou}from"react";import{e as ee,f as te,c as _u,s as Ce,n as ne}from"./strategy-Cu9CvPGE.js";import{C as yu,a as se,B as z,b as W,R as M,N as S,T as ru,
O as re}from"./ui-BK3nFX_u.js";import{l as ie,s as _,u as ae,a as Du,b as le,R as oe,c as ce,d as Y,f as c,S as de,p as Be,T as me,e as R,r as De,g as Iu,m as au,
M as eu,h as pe,D as Ae,i as he,j as xe}from"./market-DPdmOwkF.js";import{P as be,n as fe,u as Ku,T as H,D as ge,S as iu,t as ve,r as ye,s as Ne,a as Ee,M as ke,
b as Wu,f as we}from"./paper-CzloH-28.js";import"decimal.js";import"lightweight-charts";(function(){const h=document.createElement("link").relList;if(h&&h.supports&&
h.supports("modulepreload"))return;for(const B of document.querySelectorAll('link[rel="modulepreload"]'))E(B);new MutationObserver(B=>{for(const l of B)if(l.type===
"childList")for(const a of l.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&E(a)}).observe(document,{childList:!0,subtree:!0});function t(B){const l={};
return B.integrity&&(l.integrity=B.integrity),B.referrerPolicy&&(l.referrerPolicy=B.referrerPolicy),B.crossOrigin==="use-credentials"?l.credentials="include":B.
crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function E(B){if(B.ep)return;B.ep=!0;const l=t(B);fetch(B.href,l)}})();const Se=["\uCC28\
\uD2B8","\uAC70\uB798","\uD3EC\uC9C0\uC158","\uAE30\uB85D","\uC124\uC815"],lu={RANGE_LONG:"\uBC15\uC2A4 \uBC18\uC804 \uB871",RANGE_SHORT:"\uBC15\uC2A4 \uBC18\uC804 \uC20F",
FAKE_BREAKOUT_LONG:"\uAC00\uC9DC \uC774\uD0C8 \uB871",FAKE_BREAKOUT_SHORT:"\uAC00\uC9DC \uB3CC\uD30C \uC20F",BREAKOUT_LONG:"\uC9C4\uC9DC \uB3CC\uD30C \uB871",BREAKOUT_SHORT:"\
\uC9C4\uC9DC \uC774\uD0C8 \uC20F"},Hu=r=>r==="MANUAL"?"\uC218\uB3D9":lu[r]??r,vu="dupont.broker.v1",ju="dupont.settings.v1",pu="dupont.seen.v1";function $e(r,h){
const t=r.level?c(r.level,h):"";return r.add?`\uB3CC\uD30C \uB808\uBCA8 ${t} \uB9AC\uD14C\uC2A4\uD2B8 \uD655\uC778 \u2013 \uCD94\uAC00 \uC9C4\uC785 \uAC00\uB2A5`:
r.reason.startsWith("max adds")?"\uCD5C\uB300 \uCD94\uAC00 \uD69F\uC218 \uB3C4\uB2EC":r.reason.startsWith("no retest")?`\uB3CC\uD30C \uB808\uBCA8 ${t} \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:
r.reason.startsWith("retest without")?"\uB9AC\uD14C\uC2A4\uD2B8 \uC911 \u2013 \uC7A5\uC545\uD615/\uC555\uB825 \uD655\uC778 \uB300\uAE30":r.reason.startsWith("no\
 broken")?"\uB3CC\uD30C \uB808\uBCA8 \uC815\uBCF4 \uC5C6\uC74C":r.reason.startsWith("pyramiding only")?"\uB3CC\uD30C \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9":
r.reason.startsWith("retest must be")?"\uC9C4\uC785/\uC9C1\uC804 \uCD94\uAC00 \uC774\uD6C4\uC758 \uC0C8 \uCE94\uB4E4\uC5D0\uC11C \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30":
r.reason.startsWith("no move away")?`\uB3CC\uD30C \uB808\uBCA8 ${t}\uC5D0\uC11C 0.5R \uC774\uC0C1 \uC774\uD0C8 \uD6C4 \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:"\uB370\uC774\
\uD130 \uBD80\uC871"}function Te(){var Mu,Pu,Ru,Lu;const[r,h]=L("\uCC28\uD2B8"),[t,E]=L(()=>ie(ju,Ae)),B=u=>E(C=>{const i={...C,...u};return Y(ju,i),i}),l=_(t.symbol),
a=ae(t.symbol,t.tf),[d,v]=L(()=>Du(`dupont.box.${t.symbol}`));J(()=>v(Du(`dupont.box.${t.symbol}`)),[t.symbol]);const[P,N]=L(!1),m=le(a.candles,a.intervalMs,a.tape,
a.tapeVer,a.serverNow,t,d,l.dp),g=(10**-l.dp).toFixed(l.dp),p=Cu(null);p.current||(p.current=new be(Du(vu)??void 0)),p.current.moveSlToBe=t.moveSlToBe,p.current.
precision=u=>{const C=_(u);return{dp:C.dp,qdp:C.qdp}};const[A,q]=L(0),$=()=>{Y(vu,p.current.state),q(u=>u+1)},[K,G]=L([]),b=Uu((u,C="info")=>{const i=Date.now()+
Math.random();if(G(n=>[...n.slice(-1),{id:i,text:u,tone:C}]),setTimeout(()=>G(n=>n.filter(o=>o.id!==i)),4e3),t.notify&&"Notification"in window&&Notification.permission===
"granted"&&document.visibilityState!=="visible")try{new Notification("\uB4C0\uD401 \uC2A4\uD0E0\uB2E4\uB4DC",{body:u,icon:"/dupont-mobile/icons/icon.svg"})}catch{}},
[t.notify]),f=((Mu=a.ticker)==null?void 0:Mu.last)??((Pu=a.candles[a.candles.length-1])==null?void 0:Pu.close)??0,[V,nu]=L({});J(()=>{f&&nu(u=>({...u,[t.symbol]:f}))},
[f]);const ou=18e4,su=Cu({}),cu=async(u,C=!1)=>{const i=Date.now();if(!C&&i-(su.current[u]??0)<3e4)return;su.current[u]=i;const n=await xe(u).catch(()=>null);n!=
null&&n.length&&(p.current.setSettledRates(u,n),Y(vu,p.current.state))},U=Cu(new oe),y=Cu(!1),Nu=(u,C,i,n)=>{const o=U.current.tick(p.current.state,u,a.serverNow());
if(o==="replaying")return[];if(o==="gap")return Au(),[];const D=a.serverNow(),x=p.current.onPrice(u,C,D,i);return p.current.needsSettledRate(u,D)&&cu(u),x.push(
...p.current.accrueFunding(u,i||C,D,ou)),n!==void 0&&p.current.noteTickerRate(u,n,D),x},Au=async()=>{var i;const u=p.current,C=U.current.begin(u.state,a.serverNow());
C.length&&await a.syncClock();for(const n of C)try{if(await cu(n,!0),!a.clockSynced())throw new Error("server clock unknown");const o=a.serverNow(),D=Math.floor(
De(u.state,n)/6e4)*6e4,{bars:x,clampedFrom:w}=await Iu(n,D,o),j=a.serverNow();if(Math.floor(j/6e4)>Math.floor(o/6e4)){const I=await Iu(n,Math.floor(o/6e4)*6e4,j),
qu=new Map(x.map(uu=>[uu.ts,uu]));for(const uu of I.bars)qu.set(uu.ts,uu);x.splice(0,x.length,...[...qu.values()].sort((uu,Ju)=>uu.ts-Ju.ts))}const k=u.replayBars(
n,x.filter(I=>I.ts>=D),a.serverNow()),O=k.filter(I=>I.kind==="funding");(O.length>2?k.filter(I=>I.kind!=="funding"):k).forEach(I=>b(`[\uC7AC\uC0DD] ${n} ${I.message}`,
I.kind==="sl"||I.kind==="liq"?"down":I.kind==="funding"?"info":"up")),O.length>2&&b(`[\uC7AC\uC0DD] ${n} \uD380\uB529\uBE44 ${O.length}\uD68C \uBC18\uC601 (\uB9C8\uC9C0\uB9C9: ${O[O.
length-1].message})`,"info"),w>D&&b(`[\uC7AC\uC0DD] ${n} ${au(D)}~${au(w)} \uAD6C\uAC04\uC740 1\uBD84\uBD09 \uC81C\uACF5 \uBC94\uC704(30\uC77C) \uBC16 \u2013 \uC7AC\uC0DD \uC0DD\uB7B5`,
"warn");const Z=(i=u.state).lastTickTs??(i.lastTickTs={});Z[n]=Math.max(Z[n]??0,a.serverNow()),U.current.succeeded(n),$()}catch{const o=!a.clockSynced();U.current.
failed(n,a.serverNow(),!o)?b(`[\uC7AC\uC0DD] ${n} 1\uBD84\uBD09 \uC870\uD68C 3\uD68C \uC2E4\uD328 \u2013 \uACC4\uC18D \uC7AC\uC2DC\uB3C4 \uC911 (\uC190\uC808/\uC775\uC808\uC740 \uC7AC\uC0DD \uD6C4 \uBC18\uC601 \xB7 \uC218\uB3D9 \uCCAD\uC0B0 \uAC00\uB2A5)`,
"down"):o&&!y.current&&(y.current=!0,b("[\uC7AC\uC0DD] \uC11C\uBC84 \uC2DC\uAC04 \uD655\uC778 \uC2E4\uD328 \u2013 \uC7AC\uC2DC\uB3C4 \uC911 (\uC624\uD504\uB77C\uC778 \uAD6C\uAC04 \uBC18\uC601 \uB300\uAE30)",
"warn"))}finally{U.current.release(n)}};J(()=>{Au();const u=()=>{document.visibilityState==="visible"&&Au()};return document.addEventListener("visibilitychange",
u),()=>document.removeEventListener("visibilitychange",u)},[]),J(()=>{var C,i;if(!f||U.current.replaying.has(t.symbol))return;const u=Nu(t.symbol,f,(C=a.ticker)==
null?void 0:C.mark,(i=a.ticker)==null?void 0:i.funding);u.length&&(u.forEach(n=>b(n.message,n.kind==="sl"||n.kind==="liq"?"down":n.kind==="funding"?"info":"up")),
$())},[f]),J(()=>{const u=setInterval(async()=>{const C=new Set([...p.current.state.positions.map(i=>i.symbol),...p.current.state.pending.map(i=>i.symbol)]);C.delete(
t.symbol);for(const i of C){if(U.current.replaying.has(i))continue;const n=await ce(i).catch(()=>null);if(!n)continue;nu(D=>({...D,[i]:n.last}));const o=Nu(i,n.
last,n.mark,n.funding);o.length&&(o.forEach(D=>b(`${i} ${D.message}`)),$())}},4e3);return()=>clearInterval(u)},[t.symbol]);const T=p.current.state,Eu=p.current.
equity(V),hu=p.current.available(),xu=T.positions.filter(u=>u.symbol===t.symbol),X=Cu(new Set(Du(pu)??[])),tu=u=>`${t.symbol}:${t.tf}:${u.type}:${u.ts}`,F=m.live[m.
live.length-1]??null,bu=((Ru=m.closed[m.closed.length-1])==null?void 0:Ru.ts)??0,ku=u=>u.ts<bu?"\uC2E0\uD638 \uB9CC\uB8CC (\uCD5C\uADFC \uB9C8\uAC10 \uCE94\uB4E4 \uC544\uB2D8)":
Math.abs(f-Number(u.entry))>.3*Number(u.risk)?"\uAC00\uACA9 \uC774\uD0C8 (\uC2E0\uD638 \uC9C4\uC785\uAC00 \xB10.3R \uCD08\uACFC)":null,du=u=>{var i,n;const C=u===
"long"?(i=a.ticker)==null?void 0:i.ask:(n=a.ticker)==null?void 0:n.bid;return C&&f&&Math.abs(C-f)/f<.005?C:f},Q=Ou(()=>{var i;const u=((i=m.closed[m.closed.length-
3])==null?void 0:i.ts)??0,C=[...m.history].reverse().find(n=>n.ts>=u);return F??C??null},[F,m.history,m.closed]),fu=()=>T.wallet*t.riskPct/100,wu=(u,C)=>Ce({equity:String(
T.wallet),available:String(hu),riskPct:t.riskPct,entry:String(u),sl:String(C),leverage:t.leverage,feeRate:String(H),slippageBps:iu,qtyStep:String(l.qtyStep),minQty:String(
l.qtyStep),minNotional:eu}),Su=(u,C=!1)=>{if(T.positions.some(Z=>Z.symbol===t.symbol)){b("\uC774\uBBF8 \uD3EC\uC9C0\uC158 \uBCF4\uC720 \uC911","down");return}const i=f;
if(!(i>0)){b("\uD604\uC7AC\uAC00 \uD655\uC778 \uC911 \u2013 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC9C4\uC785\uD558\uC138\uC694","warn");return}const n=ku(u);if(n){
b(`${n} \u2013 \uC9C4\uC785 \uBD88\uAC00`,"down");return}const o=_u({side:u.side,kind:u.kind,entry:String(i),extremeWick:u.sl,box:u.box,slBufferPct:0,tickSize:g,
feeRate:H,slippageBps:iu});if(u.kind==="range"&&ne({side:u.side,entry:o.entry,sl:o.sl,tp:o.targets[0].price,feeRate:H,slippageBps:iu})<1){b("\uD604\uC7AC\uAC00 \uAE30\uC900 TP1 \uC21C\uC190\uC775\uBE44 1 \uBBF8\
\uB9CC \u2013 \uC9C4\uC785 \uC0DD\uB7B5","down");return}const D=Number(o.sl),x=ve(o.targets),w=u.side==="long";if(w?!(D<i&&x[0].price>i):!(D>i&&x[0].price<i)){b(
"\uD604\uC7AC\uAC00\uAC00 \uC2E0\uD638 \uBC94\uC704\uB97C \uBC97\uC5B4\uB098 \uC9C4\uC785 \uBD88\uAC00 (SL/TP1 \uC0AC\uC774 \uC544\uB2D8)","down");return}const j=wu(
i,D),k=Number(j.qty);if(j.belowMin||!(k>0)){b(`\uB9AC\uC2A4\uD06C ${t.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${eu} USDT / ${l.qtyStep}\
) \uBBF8\uB9CC`,"down");return}const O=p.current.open({symbol:t.symbol,side:u.side,qty:k,price:i,refPx:du(u.side),leverage:t.leverage,sl:D,targets:x,setup:u.type,
signalId:tu(u),breakoutLevel:u.kind==="breakout"?Number(w?u.box.top:u.box.bottom):void 0,riskBudget:fu()},a.serverNow());if(!O.ok){b(O.error??"\uC9C4\uC785 \uC2E4\uD328",
"down");return}X.current.add(tu(u)),Y(pu,[...X.current].slice(-300)),b(`${C?"[\uC790\uB3D9] ":""}${lu[u.type]} \uBAA8\uC758 \uC9C4\uC785 ${c(k,l.qdp)} @ ${c(O.fillPx??
i,l.dp)}`,"up"),$()},zu=u=>{const C=T.fills.filter(o=>o.final&&o.symbol===t.symbol),i=C[C.length-1];if(i){const o=T.fills.filter(x=>x.positionId===i.positionId).
reduce((x,w)=>x+w.netPnl,0),D=Math.floor(i.closedAt/a.intervalMs)*a.intervalMs;if(o<0&&u.ts<=D+2*a.intervalMs)return"\uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30"}const n=new Date(
a.serverNow());return n.setHours(0,0,0,0),ye(T.fills,n.getTime())<=-3?"\uC77C\uC77C \uC190\uC2E4 \uD55C\uB3C4 \u22123R \uB3C4\uB2EC":null};J(()=>{if(!F)return;const u=tu(
F);if(!X.current.has(`n:${u}`)&&(X.current.add(`n:${u}`),Y(pu,[...X.current].slice(-300)),b(`\uC2E0\uD638: ${lu[F.type]} \xB7 SL ${c(F.sl,l.dp)} \xB7 ${F.targets.
map(C=>`${C.label} ${c(C.price,l.dp)}`).join(" / ")}`,F.side==="long"?"up":"down"),t.autoPaper&&!xu.length)){const C=F.pressure.source!=="trades"?"\uC555\uB825\uC774 OHLCV \uADFC\uC0AC":
zu(F);C?b(`[\uC790\uB3D9] \uC9C4\uC785 \uC0DD\uB7B5 \u2013 ${C}`,"info"):Su(F,!0)}},[F==null?void 0:F.ts,F==null?void 0:F.type]);const Bu=Ou(()=>xu.map(u=>{var o,
D;const C=m.pressures.slice(0,m.closed.length),i=ee({side:u.side,entry:u.entry,sl:u.sl,targets:u.targets.filter(x=>!x.done).map(x=>({price:x.price}))},m.closed,
C),n=u.setup.startsWith("BREAKOUT")?te({side:u.side,entry:u.entry,sl:u.initialSl,targets:u.targets.map(x=>({price:x.price})),type:u.setup,adds:u.adds,brokenLevel:u.
breakoutLevel,openedTs:Math.floor(u.openedAt/a.intervalMs)*a.intervalMs,lastAddTs:u.lastAddTs,risk:Math.abs((u.initialEntry??u.entry)-u.initialSl)},m.closed,C,m.
box,{maxAdds:t.maxAdds,addSizePct:t.addSizePct,tickSize:g,atr:((o=m.signalBox)==null?void 0:o.atr)??((D=m.box)==null?void 0:D.atr)}):null;return{p:u,flip:i,pyr:n}}),
[A,m.closed,m.pressures,m.box,m.signalBox,t.maxAdds,t.addSizePct,t.symbol,a.intervalMs]),$u=Cu(new Set);J(()=>{for(const u of Bu){const C=`${u.p.id}:${bu}`;u.flip.
alert&&!$u.current.has(C)&&($u.current.add(C),b(`\uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (${u.flip.multiple.toFixed(1)}\uBC30)`,"warn"))}},[Bu]);
const gu=(u,C,i)=>{var x,w;if(U.current.replaying.has(u.symbol)){b("\uC624\uD504\uB77C\uC778 \uAD6C\uAC04 \uC7AC\uC0DD \uC911 \u2013 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uCCAD\uC0B0\uD558\uC138\uC694",
"warn");return}const n=(((x=U.current.fails[u.symbol])==null?void 0:x.n)??0)>=pe?(w=p.current.state.lastPx)==null?void 0:w[u.symbol]:void 0,o=V[u.symbol]??n;if(!(o>
0)){b(`${u.symbol} \uD604\uC7AC\uAC00 \uD655\uC778 \uC911 \u2013 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uCCAD\uC0B0\uD558\uC138\uC694`,"warn");return}V[u.symbol]===void 0&&
b(`${u.symbol} \uC2DC\uC138 \uC870\uD68C \uBD88\uAC00 \u2013 \uB9C8\uC9C0\uB9C9 \uCC98\uB9AC \uAC00\uACA9 ${c(o,_(u.symbol).dp)}\uB85C \uCCAD\uC0B0`,"warn");const D=p.
current.closeFraction(u.id,C,o,i,a.serverNow());D&&b(`${i} ${c(D.qty,_(u.symbol).qdp)} @ ${c(D.exit,_(u.symbol).dp)} \xB7 \uC21C\uC190\uC775 ${R(D.netPnl)} USDT`,
D.netPnl>=0?"up":"down"),$()},Gu=(u,C)=>{if(!(f>0)){b("\uD604\uC7AC\uAC00 \uD655\uC778 \uC911 \u2013 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uCD94\uAC00\uD558\uC138\uC694",
"warn");return}const i=u.initialQty??u.origQty/(1+u.adds*(t.addSizePct/100)),n=u.riskBudget??T.wallet*t.riskPct/100,o=Ne(u,{last:du(u.side),suggestedSl:C.sl?Number(
C.sl):void 0,budget:n,wantQty:i*(C.sizePct??t.addSizePct)/100,step:l.qtyStep});if(!(o.qty>0)){b("\uCD94\uAC00 \uC2DC \uCD1D \uB9AC\uC2A4\uD06C\uAC00 \uD55C\uB3C4 \uCD08\uACFC",
"down");return}if(o.qty*f<eu){b(`\uCD94\uAC00 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561(${eu} USDT) \uBBF8\uB9CC`,"down");return}const D=p.current.
open({symbol:u.symbol,side:u.side,qty:o.qty,price:f,refPx:du(u.side),leverage:u.leverage,sl:o.newSl,targets:[],setup:u.setup,isAdd:!0,candleTs:bu},a.serverNow());
if(!D.ok){b(D.error??"\uCD94\uAC00 \uC2E4\uD328","down");return}b(`\uBD88\uD0C0\uAE30 #${u.adds+1}: ${c(o.qty,l.qdp)} @ ${c(D.fillPx??f,l.dp)} \xB7 SL ${c(o.newSl,
l.dp)}`,"up"),$()},Vu=Uu(u=>{var D,x;const C=m.closed,i=C.length>=2?u==="long"?Math.min(C[C.length-1].low,C[C.length-2].low):Math.max(C[C.length-1].high,C[C.length-
2].high):f*(u==="long"?.995:1.005),n=m.box,o=n?f<Number(n.top)&&f>Number(n.bottom):!1;if(n){const w=o?"range":"breakout",j=u==="long"?Math.min(i,f*.999):Math.max(
i,f*1.001),k=_u({side:u,kind:w,entry:String(f),extremeWick:String(j),box:n,atr:n.atr,tickSize:g,feeRate:H,slippageBps:iu}),O=Z=>Z?Number(Z).toFixed(l.dp):"";return{
side:u,kind:w,sl:O(k.sl),tp1:O((D=k.targets[0])==null?void 0:D.price),tp2:O((x=k.targets[1])==null?void 0:x.price)}}return{side:u,kind:"breakout",...fe(u,f,g,l.
dp),tp2:""}},[m.closed,m.box,f,l.dp,g]),[mu,Qu]=L(null),Yu=(mu==null?void 0:mu.sym)===t.symbol?mu:null,Tu=u=>Qu(u&&{...u,sym:t.symbol}),Xu=u=>{var i,n;const C=o=>o?
Number(o).toFixed(l.dp):"";Tu({side:u.side,kind:u.kind,sl:C(u.sl),tp1:C((i=u.targets[0])==null?void 0:i.price),tp2:C((n=u.targets[1])==null?void 0:n.price),signal:u}),
h("\uAC70\uB798")},Fu=(((Lu=a.ticker)==null?void 0:Lu.change24h)??0)>=0;return s("div",{className:"h-full flex flex-col pt-safe",children:[e("header",{className:"\
px-3 pt-2 pb-1.5 border-b border-line",children:s("div",{className:"flex items-end justify-between",children:[s("div",{children:[s("div",{className:"flex items-\
center gap-2",children:[e("select",{value:t.symbol,onChange:u=>B({symbol:u.target.value}),className:"bg-transparent text-[15px] font-semibold outline-none",children:de.
map(u=>e("option",{value:u.symbol,className:"bg-panel",children:u.symbol},u.symbol))}),e("span",{className:"text-[10px] px-1.5 py-0.5 rounded bg-panel2 text-mut\
ed",children:"\uBB34\uAE30\uD55C \xB7 \uBAA8\uC758"}),e("span",{className:`w-2 h-2 rounded-full ${a.status==="live"?"bg-up":"bg-warn"}`,title:a.status})]}),e("d\
iv",{className:`text-[26px] leading-8 font-semibold num ${Fu?"text-up":"text-down"}`,children:f?c(f,l.dp):"\u2014"})]}),s("div",{className:"text-right text-[11p\
x] text-muted num leading-[18px]",children:[s("div",{children:["24h ",e("span",{className:Fu?"text-up":"text-down",children:a.ticker?Be(a.ticker.change24h):"\u2014"})]}),
s("div",{children:["\uB9C8\uD06C ",a.ticker?c(a.ticker.mark,l.dp):"\u2014"]}),s("div",{children:["\uD380\uB529 ",a.ticker?`${(a.ticker.funding*100).toFixed(4)}%`:
"\u2014"]})]})]})}),K.length>0&&e("div",{className:"px-3 py-1.5 space-y-1 border-b border-line bg-bg","aria-live":"polite",children:K.map(u=>e("div",{className:`\
text-[12px] leading-4 px-2.5 py-1.5 rounded-md ${u.tone==="down"?"bg-down/20 text-down":u.tone==="up"?"bg-up/15 text-up":u.tone==="warn"?"bg-warn/20 text-warn":
"bg-panel2 text-txt"}`,children:u.text},u.id))}),s("main",{className:"flex-1 min-h-0 flex flex-col overflow-hidden",children:[r==="\uCC28\uD2B8"&&s(Zu,{children:[
s("div",{className:"flex items-center justify-between px-3 py-1.5 gap-2",children:[e(yu,{items:me,value:t.tf,onChange:u=>B({tf:u})}),e("button",{onClick:()=>N(u=>!u),
className:`h-8 px-3 rounded-full text-xs ${P?"bg-warn text-bg font-semibold":"bg-panel2 text-muted"}`,children:P?"\uD3B8\uC9D1 \uC644\uB8CC":"\uBC15\uC2A4 \uD3B8\uC9D1"})]}),
e("div",{className:"flex-1 min-h-0",children:a.candles.length?e(se,{viewKey:`${t.symbol}:${t.tf}`,candles:a.candles,pressures:m.pressures,box:m.box,signals:m.history,
positions:xu,dp:l.dp,showHist:t.showHist,editBox:P,onBoxEdit:(u,C)=>{var n;const i={top:u,bottom:C,startTs:(d==null?void 0:d.startTs)??((n=m.box)==null?void 0:n.
startTime)??a.serverNow(),locked:!0};v(i),Y(`dupont.box.${t.symbol}`,i)}}):e("div",{className:"p-6 text-muted text-sm",children:a.err?`\uB370\uC774\uD130 \uC624\uB958: ${a.
err}`:"\uCE94\uB4E4 \uBD88\uB7EC\uC624\uB294 \uC911\u2026"})}),e(Fe,{box:m.box,manual:d,dp:l.dp,tape:m.tapeCandles,onUnlock:()=>{v(null),Y(`dupont.box.${t.symbol}`,
null),N(!1)},onEdit:(u,C)=>{var n;const i={top:u,bottom:C,startTs:(d==null?void 0:d.startTs)??((n=m.box)==null?void 0:n.startTime)??a.serverNow(),locked:!0};v(i),
Y(`dupont.box.${t.symbol}`,i)}}),Bu.filter(u=>u.flip.alert).map(u=>s("div",{className:"mx-3 mb-2 rounded-lg bg-warn/15 border border-warn px-3 py-2 flex items-c\
enter justify-between",children:[s("span",{className:"text-[13px] text-warn font-semibold",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",
u.flip.multiple.toFixed(1),"\uBC30)"]}),e(z,{tone:"warn",className:"h-9",onClick:()=>gu(u.p,1,"\uC555\uB825\uBC18\uC804 \uCCAD\uC0B0"),children:"\uCCAD\uC0B0"})]},
u.p.id)),e(Me,{g:Q,dp:l.dp,acted:Q?X.current.has(tu(Q)):!1,stale:Q?ku(Q):null,onEnter:()=>Q&&Su(Q),onEdit:()=>Q&&Xu(Q)})]}),r==="\uAC70\uB798"&&e(Pe,{s:t,set:B,
last:f,dp:l.dp,book:a.book,equity:Eu,available:hu,qtyStep:l.qtyStep,draft:Yu,setDraft:Tu,defaultDraft:Vu,sizeFor:wu,onSubmit:(u,C,i,n)=>{var j;if(!(f>0)){b("\uD604\uC7AC\uAC00\
 \uD655\uC778 \uC911 \u2013 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC8FC\uBB38\uD558\uC138\uC694","warn");return}const o=Number(u.sl),D=u.kind==="breakout"||!u.tp2?[
{price:Number(u.tp1),fraction:1,label:u.kind==="breakout"?"TP 1:3":"TP"}]:[{price:Number(u.tp1),fraction:.5,label:"TP1 \uC911\uC559\uC120"},{price:Number(u.tp2),
fraction:.5,label:"TP2 \uBC18\uB300\uD3B8"}],x=((j=u.signal)==null?void 0:j.type)??"MANUAL",w=u.kind==="breakout"&&m.box?Number(u.side==="long"?m.box.top:m.box.
bottom):void 0;if(C==="limit"){if(u.side==="long"?i>=f:i<=f){b(`\uC9C0\uC815\uAC00\uAC00 \uD604\uC7AC\uAC00 ${u.side==="long"?"\uC774\uC0C1":"\uC774\uD558"} \u2013 \uC989\
\uC2DC \uCCB4\uACB0\uB418\uB294 \uC8FC\uBB38\uC740 \uC2DC\uC7A5\uAC00\uB85C \uB123\uC73C\uC138\uC694`,"down");return}const k=p.current.placeLimit({symbol:t.symbol,
side:u.side,qty:n,price:i,leverage:t.leverage,sl:o,targets:D,setup:x,breakoutLevel:w,riskBudget:fu()},a.serverNow());b(k.ok?`\uC9C0\uC815\uAC00 ${u.side==="long"?
"\uB871":"\uC20F"} \uC8FC\uBB38 ${c(n,l.qdp)} @ ${c(i,l.dp)}`:k.error??"\uC8FC\uBB38 \uC2E4\uD328",k.ok?"up":"down")}else{const k=p.current.open({symbol:t.symbol,
side:u.side,qty:n,price:f,refPx:du(u.side),leverage:t.leverage,sl:o,targets:D,setup:x,breakoutLevel:w,signalId:u.signal?tu(u.signal):void 0,riskBudget:fu()},a.serverNow());
b(k.ok?`${u.side==="long"?"\uB871":"\uC20F"} \uBAA8\uC758 \uC9C4\uC785 ${c(n,l.qdp)} @ ${c(k.fillPx??f,l.dp)}`:k.error??"\uC9C4\uC785 \uC2E4\uD328",k.ok?"up":"d\
own"),k.ok&&u.signal&&(X.current.add(tu(u.signal)),Y(pu,[...X.current].slice(-300)))}$()}},t.symbol),r==="\uD3EC\uC9C0\uC158"&&s("div",{className:"flex-1 overfl\
ow-y-auto p-3 space-y-3",children:[s(W,{className:"p-3",children:[e(M,{k:"\uC790\uC0B0 (Equity)",v:`${c(Eu)} USDT`}),e(M,{k:"\uAC00\uC6A9",v:`${c(hu)} USDT`}),e(
M,{k:"\uBBF8\uC2E4\uD604 \uC190\uC775 (\uC21C, \uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC)",v:(()=>{const u=T.positions.reduce((i,n)=>{const o=V[n.symbol]??n.entry;return i+
Ku(n,o)-n.entryFeeLeft-o*n.qty*H},0),C=Number(u.toFixed(2));return s("span",{className:C>0?"text-up":C<0?"text-down":"",children:[R(u)," USDT"]})})()})]}),!T.positions.
length&&e("div",{className:"text-muted text-sm text-center py-8",children:"\uBCF4\uC720 \uD3EC\uC9C0\uC158 \uC5C6\uC74C"}),T.positions.map(u=>{var D;const C=Bu.
find(x=>x.p.id===u.id),i=V[u.symbol]??u.entry,n=Ku(u,i)-u.entryFeeLeft-i*u.qty*H,o=_(u.symbol).dp;return s(W,{className:"p-3",children:[s("div",{className:"flex\
 justify-between items-center mb-1",children:[s("div",{className:"font-semibold",children:[e("span",{className:u.side==="long"?"text-up":"text-down",children:u.
side==="long"?"\uB871":"\uC20F"})," ",u.symbol," ",s("span",{className:"text-muted text-xs",children:[u.leverage,"x \xB7 ",Hu(u.setup)]})]}),s("div",{className:"\
text-right",children:[s("div",{className:`num font-semibold ${n>=0?"text-up":"text-down"}`,children:[R(n)," USDT"]}),e("div",{className:"text-[10px] text-muted",
children:"\uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC \uC21C\uC190\uC775"})]})]}),e(M,{k:"\uC218\uB7C9 / \uC9C4\uC785\uAC00",v:`${c(u.qty,_(u.symbol).qdp)} / ${c(u.entry,o)}`}),
e(M,{k:"\uB9C8\uD06C / \uCCAD\uC0B0\uAC00",v:`${c(i,o)} / ${c(u.liqPrice,o)}`}),e(M,{k:`SL${u.beMoved?" (\uBCF8\uC808)":""}`,v:c(u.sl,o)}),u.targets.map((x,w)=>e(
M,{k:x.label,v:s("span",{className:x.done?"text-up":"",children:[c(x.price,o)," \xB7 ",Math.round(x.fraction*100),"% ",x.done?"\u2713 \uCCB4\uACB0":"\uB300\uAE30"]})},
w)),e(M,{k:"\uACC4\uD68D \uB9AC\uC2A4\uD06C (1R)",v:u.riskUsd?`${c(u.riskUsd)} USDT`:"\u2014"}),u.riskBudget!==void 0&&e(M,{k:"\uB9AC\uC2A4\uD06C \uC608\uC0B0 (\uC9C4\uC785 \uC2DC \uACE0\uC815)",
v:`${c(u.riskBudget)} USDT`}),(u.fundingAcc??0)!==0&&e(M,{k:"\uD380\uB529\uBE44 \uB204\uC801 (\uBBF8\uC815\uC0B0)",v:s("span",{className:(u.fundingAcc??0)>0?"te\
xt-down":"text-up",children:[R(-(u.fundingAcc??0),4)," USDT"]})}),e(M,{k:"\uC2E4\uD604 \uC190\uC775 (\uC21C, \uD380\uB529 \uD3EC\uD568)",v:R(u.realizedNet)}),(C==
null?void 0:C.flip.alert)&&s("div",{className:"mt-2 text-[12px] text-warn",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",C.flip.
multiple.toFixed(1),"\uBC30, \uBAA9\uD45C \uC9C4\uD589 ",Math.round(C.flip.progress*100),"%)"]}),(C==null?void 0:C.pyr)&&s("div",{className:`mt-1 text-[11px] ${C.
pyr.add?"text-accent":"text-muted"}`,children:["\uBD88\uD0C0\uAE30 ",u.adds,"/",t.maxAdds,": ",$e(C.pyr,_(u.symbol).dp)]}),!(C!=null&&C.pyr)&&s("div",{className:"\
mt-1 text-[11px] text-muted",children:["\uBD88\uD0C0\uAE30: \uB3CC\uD30C \uC2E0\uD638 \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 (\uCD5C\uB300 ",t.maxAdds,
"\uD68C)"]}),s("div",{className:"grid grid-cols-3 gap-2 mt-3",children:[e(z,{tone:"down",onClick:()=>gu(u,1,"\uC2DC\uC7A5\uAC00 \uCCAD\uC0B0"),children:"\uC804\uB7C9 \uCCAD\uC0B0"}),
e(z,{onClick:()=>gu(u,.5,"50% \uCCAD\uC0B0"),children:"50% \uCCAD\uC0B0"}),e(z,{tone:"accent",disabled:!((D=C==null?void 0:C.pyr)!=null&&D.add)||u.adds>=t.maxAdds||
u.symbol!==t.symbol,onClick:()=>(C==null?void 0:C.pyr)&&Gu(u,C.pyr),children:"\uBD88\uD0C0\uAE30"})]})]},u.id)}),T.pending.length>0&&s(W,{className:"p-3",children:[
e("div",{className:"text-sm font-semibold mb-1",children:"\uBBF8\uCCB4\uACB0 \uC9C0\uC815\uAC00"}),T.pending.map(u=>s("div",{className:"flex justify-between ite\
ms-center py-1 text-[13px]",children:[s("span",{className:u.side==="long"?"text-up":"text-down",children:[u.side==="long"?"\uB871":"\uC20F"," ",u.symbol," ",c(u.
qty,_(u.symbol).qdp)," @ ",c(u.price,_(u.symbol).dp)]}),e("button",{className:"text-muted underline",onClick:()=>{p.current.cancelLimit(u.id),$()},children:"\uCDE8\uC18C"})]},
u.id))]})]}),r==="\uAE30\uB85D"&&e(Re,{broker:p.current}),r==="\uC124\uC815"&&s("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[s(W,{className:"\
p-3",children:[e("div",{className:"text-sm font-semibold mb-2",children:"\uC790\uAE08"}),e(M,{k:"\uC2DC\uB4DC / \uC9C0\uAC11",v:`${c(T.bankroll)} / ${c(T.wallet)}\
 USDT`}),e(z,{tone:"down",className:"w-full mt-2",onClick:()=>{confirm("\uBAA8\uC758 \uC790\uAE08\uC744 200 USDT\uB85C \uCD08\uAE30\uD654\uD558\uACE0 \uD3EC\uC9C0\uC158\xB7\uAE30\uB85D\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?")&&
(p.current.reset(ge,a.serverNow()),$(),b("200 USDT\uB85C \uCD08\uAE30\uD654"))},children:"\uC790\uAE08 \uCD08\uAE30\uD654 (200 USDT)"})]}),s(W,{className:"p-3 s\
pace-y-3",children:[e("div",{className:"text-sm font-semibold",children:"\uB9AC\uC2A4\uD06C"}),s("div",{className:"grid grid-cols-2 gap-2",children:[e(S,{label:"\
\uAC70\uB798\uB2F9 \uB9AC\uC2A4\uD06C %",value:String(t.riskPct),onChange:u=>B({riskPct:Math.max(.1,Number(u)||1)}),suffix:"%"}),e(S,{label:"\uAE30\uBCF8 \uB808\uBC84\uB9AC\uC9C0",
value:String(t.leverage),onChange:u=>B({leverage:Math.min(125,Math.max(1,Math.round(Number(u)||1)))}),suffix:"x"}),e(S,{label:"\uBD88\uD0C0\uAE30 \uCD5C\uB300 \uD69F\uC218",
value:String(t.maxAdds),onChange:u=>B({maxAdds:Math.max(0,Math.round(Number(u)||0))})}),e(S,{label:"\uBD88\uD0C0\uAE30 \uD06C\uAE30 (\uCD08\uAE30 \uB300\uBE44)",
value:String(t.addSizePct),onChange:u=>B({addSizePct:Math.max(5,Number(u)||50)}),suffix:"%"})]}),e(ru,{on:t.moveSlToBe,onChange:u=>B({moveSlToBe:u}),label:"TP1 \
\uCCB4\uACB0 \uD6C4 SL \uBCF8\uC808 \uC774\uB3D9",hint:"\uBCF8\uC808\uAC00 = \uC9C4\uC785\uAC00 + \uB0A8\uC740 \uC9C4\uC785\xB7\uCCAD\uC0B0 \uC218\uC218\uB8CC (\uC190\uC2E4 \uC5C6\uC774 \uCCAD\uC0B0)"}),
e(ru,{on:t.autoPaper,onChange:u=>B({autoPaper:u}),label:"\uC790\uB3D9 \uBAA8\uC758\uB9E4\uB9E4",hint:"\uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 \uC2E0\uD638\uB9CC \xB7 \uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30 \xB7 \uC77C\uC77C \u22123R \uC815\uC9C0 (\uAE30\uBCF8 OFF)"})]}),
s(W,{className:"p-3 space-y-3",children:[e("div",{className:"text-sm font-semibold",children:"\uBC15\uC2A4 / \uD53C\uBD07"}),s("div",{className:"grid grid-cols-\
2 gap-2",children:[e(S,{label:"\uB8E9\uBC31 (\uCE94\uB4E4)",value:String(t.lookback),onChange:u=>B({lookback:Math.max(20,Math.round(Number(u)||80))})}),e(S,{label:"\
\uD130\uCE58 \uD5C8\uC6A9 %",value:String(t.tolerancePct),onChange:u=>B({tolerancePct:Math.max(.05,Number(u)||.25)}),suffix:"%"}),e(S,{label:"\uD53C\uBD07 \uC88C",
value:String(t.pivotLeft),onChange:u=>B({pivotLeft:Math.max(1,Math.round(Number(u)||3))})}),e(S,{label:"\uD53C\uBD07 \uC6B0",value:String(t.pivotRight),onChange:u=>B(
{pivotRight:Math.max(1,Math.round(Number(u)||3))})}),e(S,{label:"\uCD5C\uC18C \uD130\uCE58",value:String(t.minTouches),onChange:u=>B({minTouches:Math.max(1,Math.
round(Number(u)||2))})}),e(S,{label:"\uCD5C\uC18C \uBC15\uC2A4 \uB192\uC774 %",value:String(t.minHeightPct),onChange:u=>B({minHeightPct:Math.max(0,Number(u)||0)}),
suffix:"%"})]}),e(ru,{on:t.requireRange,onChange:u=>B({requireRange:u}),label:"\uBC15\uC2A4\uAD8C(\uBE44\uCD94\uC138)\uC77C \uB54C\uB9CC \uC2E0\uD638"}),e(ru,{on:t.
showHist,onChange:u=>B({showHist:u}),label:"\uC555\uB825 \uD788\uC2A4\uD1A0\uADF8\uB7A8 \uD45C\uC2DC"})]}),e(W,{className:"p-3",children:e(ru,{on:t.notify,onChange:async u=>{
u&&"Notification"in window&&Notification.permission!=="granted"&&await Notification.requestPermission(),B({notify:u})},label:"\uC54C\uB9BC",hint:"\uC2E0\uD638\xB7\uCCB4\uACB0\xB7\uC555\uB825\uBC18\uC804 (\uD648 \
\uD654\uBA74 \uC571\uC5D0\uC11C \uAD8C\uC7A5)"})}),s("div",{className:"text-[11px] text-muted px-1 pb-4 leading-5",children:["\uD398\uC774\uD37C(\uBAA8\uC758) \uD2B8\uB808\uC774\uB529 \uC804\uC6A9 \xB7 \uC2E4\uACC4\uC88C/API \uD0A4 \uC5C6\uC74C \xB7 B\
itget \uACF5\uAC1C \uC2DC\uC138 \uC0AC\uC6A9. \uC218\uC218\uB8CC: Bitget USDT-M \uD14C\uC774\uCEE4 0.06% / \uBA54\uC774\uCEE4 0.02% (TP\uB3C4 \uD14C\uC774\uCEE4\uB85C \uBCF4\uC218 \uACC4\uC0B0). \uC2AC\uB9AC\uD53C\uC9C0 ",
iu,"bp (\uC2DC\uC7A5\uAC00\xB7\uC190\uC808). \uD380\uB529\uBE44: 00/08/16\uC2DC UTC \uC815\uC0B0 \uD380\uB529\uB960(Bitget \uACF5\uAC1C \uC774\uB825, \uC5C6\uC73C\uBA74 \uC815\uC0B0 \uC9C1\uC804 \uD380\uB529\uB960). \uAC15\uC81C\uCCAD\uC0B0 = \uACA9\uB9AC \uC99D\uAC70\uAE08 \uC804\uC561 \uC190\uC2E4. \uB3CC\uD30C TP 1:3\uC740 \uC218\uC218\uB8CC \uCC28\uAC10 \uC21C\uC190\uC775 \uAE30\uC900. \uC571\uC774 \uAEBC\uC838 \uC788\uB358 \uB3D9\uC548\uC740 \uB2E4\uC2DC \uC5F4 \uB54C 1\uBD84\uBD09\uC73C\uB85C \uC7AC\uC0DD (SL\xB7TP \uB3D9\uC2DC \uD130\
\uCE58 \uC2DC SL \uC6B0\uC120). \uC555\uB825: \uC2E4\uC2DC\uAC04 \uCCB4\uACB0(aggressor) \uC9D1\uACC4, \uC5F0\uACB0 \uC774\uC804 \uCE94\uB4E4\uC740 OHLCV \uADFC\uC0AC."]})]})]}),
e("nav",{className:"border-t border-line bg-panel pb-safe grid grid-cols-5",children:Se.map(u=>e("button",{onClick:()=>h(u),className:`h-14 text-[13px] relative\
 ${r===u?"text-accent font-semibold":"text-muted"}`,children:s("span",{className:"inline-flex items-center gap-1",children:[u,u==="\uD3EC\uC9C0\uC158"&&T.positions.
length>0&&e("span",{className:"min-w-4 h-4 px-1 rounded-full bg-accent text-bg text-[10px] leading-4 font-semibold",children:T.positions.length})]})},u))})]})}function Fe({
box:r,manual:h,dp:t,tape:E,onUnlock:B,onEdit:l}){const[a,d]=L(!1),[v,P]=L(""),[N,m]=L("");return r?s("div",{className:"px-3 py-1.5 border-t border-line text-[12\
px]",children:[s("div",{className:"flex items-center justify-between gap-2",children:[s("div",{className:"num leading-5",children:[e("span",{className:"text-mut\
ed",children:"\uBC15\uC2A4 "}),e("span",{className:"text-down",children:c(r.bottom,t)})," \u2013 ",e("span",{className:"text-up",children:c(r.top,t)}),e("span",
{className:"text-muted",children:" \xB7 50% "}),c(r.mid,t)]}),s("div",{className:"flex gap-1.5 items-center",children:[e("span",{className:`px-1.5 py-0.5 rounde\
d text-[10px] ${r.isRange?"bg-up/20 text-up":"bg-warn/20 text-warn"}`,children:h?"\uC218\uB3D9\xB7\uACE0\uC815":r.isRange?"\uBC15\uC2A4\uAD8C":"\uCD94\uC138/\uC57D\uD568"}),
e("button",{className:"text-accent",onClick:()=>{P(String(Number(r.top))),m(String(Number(r.bottom))),d(g=>!g)},children:"\uC218\uC815"}),h&&e("button",{className:"\
text-muted",onClick:B,children:"\uC790\uB3D9"})]})]}),s("div",{className:"text-[10px] text-muted",children:["\uD130\uCE58 ",r.touchesTop,"/",r.touchesBottom," \xB7\
 \uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 ",E,"\uCE94\uB4E4 (\uADF8 \uC678 OHLCV \uADFC\uC0AC)"]}),a&&s("div",{className:"grid grid-cols-3 gap-2 mt-2 items-\
end",children:[e(S,{label:"\uC0C1\uB2E8(\uC800\uD56D)",value:v,onChange:P}),e(S,{label:"\uD558\uB2E8(\uC9C0\uC9C0)",value:N,onChange:m}),e(z,{tone:"accent",onClick:()=>{
const g=Number(v),p=Number(N);g>0&&p>0&&g!==p&&(l(g,p),d(!1))},children:"\uACE0\uC815"})]})]}):e("div",{className:"px-3 py-2 text-[12px] text-muted border-t bor\
der-line",children:"\uBC15\uC2A4 \uD0D0\uC9C0 \uC911\u2026 (\uD53C\uBD07 \uD130\uCE58 \uBD80\uC871)"})}function Me({g:r,dp:h,acted:t,stale:E,onEnter:B,onEdit:l}){
if(!r)return e("div",{className:"mx-3 mb-2 px-3 py-2 rounded-lg bg-panel border border-line text-[12px] text-muted",children:"\uC2E0\uD638 \uB300\uAE30 \uC911 \xB7 \uBC15\uC2A4 \uC9C0\uC9C0/\uC800\uD56D + \uC7A5\uC545\uD615 + \uC555\uB825 \uD655\uC778 \uC2DC\
 \uD45C\uC2DC"});const a=r.side==="long";return s("div",{className:`mx-3 mb-2 rounded-xl border px-3 py-2 ${a?"border-up/60 bg-up/10":"border-down/60 bg-down/10"}`,
children:[s("div",{className:"flex justify-between items-center",children:[s("div",{className:`font-semibold ${a?"text-up":"text-down"}`,children:[lu[r.type]," ",
s("span",{className:"text-muted text-[11px] font-normal",children:[au(r.ts)," \uB9C8\uAC10"]})]}),s("div",{className:"text-[11px] text-muted flex items-center g\
ap-1.5",children:[r.pressure.source==="ohlcv"&&e("span",{className:"px-1.5 py-0.5 rounded bg-warn/20 text-warn text-[10px]",children:"\uC555\uB825 \uADFC\uC0AC(OHLCV)"}),
s("span",{children:["\uB9E4\uC218\uC555\uB825 ",Math.round(r.pressure.ratio*100),"%"]})]})]}),s("div",{className:"grid grid-cols-4 gap-1 text-[11px] num mt-1",children:[
s("div",{children:[e("div",{className:"text-muted",children:"\uC9C4\uC785"}),c(r.entry,h)]}),s("div",{children:[e("div",{className:"text-muted",children:"SL"}),
e("span",{className:"text-warn",children:c(r.sl,h)})]}),r.targets.map(d=>s("div",{children:[s("div",{className:"text-muted",children:[d.label," ",d.sizePct,"%"]}),
e("span",{className:"text-up",children:c(d.price,h)})]},d.label))]}),s("div",{className:"flex gap-2 mt-2",children:[e(z,{tone:a?"up":"down",className:"flex-1 h-\
10 text-[13px]",disabled:t||!!E,onClick:B,children:t?"\uC9C4\uC785 \uC644\uB8CC/\uCC98\uB9AC\uB428":E??`\uD0ED\uD558\uC5EC \uBAA8\uC758 ${a?"\uB871":"\uC20F"} \uC9C4\
\uC785`}),e(z,{className:"h-10",onClick:l,children:"\uC218\uC815"})]})]})}function Pe(r){const[h,t]=L("market"),[E,B]=L(""),[l,a]=L(""),d=r.draft??r.defaultDraft(
"long");J(()=>{!r.draft&&r.last&&r.setDraft(r.defaultDraft("long"))},[r.last>0]);const v=h==="limit"&&Number(E)>0?Number(E):r.last,P=Number(d.sl);let N=null;try{
N=v>0&&P>0&&P!==v?r.sizeFor(v,P):null}catch{N=null}const m=Math.max(0,Math.round(-Math.log10(r.qtyStep))),g=l?he(Number(l)||0,r.qtyStep):Number((N==null?void 0:
N.qty)??0),p=d.side==="long",A=Number(d.tp1),q=Number(d.tp2),$=p?P<v:P>v,K=A>0&&(p?A>v:A<v)&&(d.kind==="breakout"||!d.tp2||(p?q>A:q<A)),G=g*v,b=G>=eu,f=G/r.s.leverage,
V=h==="limit"?ke:H,nu=h==="limit"?0:Wu,ou=Math.abs(v-P)*g+v*g*(V+nu)+P*g*(H+Wu),su=$&&K&&b&&f+v*g*V<=r.available+1e-9,cu=N!=null&&N.belowMin&&!l?`\uB9AC\uC2A4\uD06C ${r.
s.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${eu} USDT / ${r.qtyStep}) \uBBF8\uB9CC`:$?K?b?"\uAC00\uC6A9 \uC99D\uAC70\uAE08 \uBD80\uC871":
`\uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561 ${eu} USDT \uC774\uC0C1 \uD544\uC694`:`TP\uAC00 \uC9C4\uC785\uAC00 ${p?"\uC704":"\uC544\uB798"}(TP2\uB294 TP1 \uB108\uBA38)\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`:
`SL\uC774 \uC9C4\uC785\uAC00 ${p?"\uC544\uB798":"\uC704"}\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`,U=y=>r.setDraft({...d,...y});return s("div",{className:"f\
lex-1 overflow-y-auto px-3 pt-3",children:[s("div",{className:"grid grid-cols-[minmax(0,1fr)_124px] gap-2.5",children:[s("div",{className:"space-y-2.5",children:[
e("div",{className:"grid grid-cols-2 gap-1 bg-panel2 rounded-lg p-1",children:["long","short"].map(y=>e("button",{onClick:()=>{a(""),r.setDraft(d.signal&&d.side===
y?d:r.defaultDraft(y))},className:`h-9 rounded-md font-semibold text-sm ${d.side===y?y==="long"?"bg-up text-white":"bg-down text-white":"text-muted"}`,children:y===
"long"?"\uB871":"\uC20F"},y))}),e(yu,{items:["market","limit"],value:h,onChange:y=>t(y),fmt:y=>y==="market"?"\uC2DC\uC7A5\uAC00":"\uC9C0\uC815\uAC00"}),h==="lim\
it"&&e(S,{label:"\uC9C0\uC815\uAC00",value:E,onChange:B}),s("div",{children:[e("span",{className:"text-[11px] text-muted",children:"\uB808\uBC84\uB9AC\uC9C0"}),
e(yu,{items:[3,5,10,20],value:r.s.leverage,onChange:y=>r.set({leverage:y}),fmt:y=>`${y}x`})]}),e(S,{label:"\uB9AC\uC2A4\uD06C (\uC790\uC0B0 \uB300\uBE44)",value:String(
r.s.riskPct),onChange:y=>{a(""),r.set({riskPct:Math.max(.1,Number(y)||1)})},suffix:"%"}),e(S,{label:"\uC190\uC808 SL",value:String(d.sl),onChange:y=>U({sl:y})}),
e(S,{label:d.kind==="breakout"?"TP (\uC21C 1:3, 100%)":"TP1 \uC911\uC559\uC120 (50%)",value:String(d.tp1),onChange:y=>U({tp1:y})}),d.kind==="range"&&e(S,{label:"\
TP2 \uBC18\uB300\uD3B8 \uACBD\uACC4 (50%)",value:String(d.tp2),onChange:y=>U({tp2:y})}),e(S,{label:`\uC218\uB7C9 (\uB9AC\uC2A4\uD06C ${r.s.riskPct}%: ${N?c(N.qty,
m):"\u2014"})`,value:l||(N?Number(N.qty).toFixed(m):""),onChange:a})]}),e("div",{className:"bg-panel rounded-xl border border-line py-2",children:e(re,{book:r.book,
dp:r.dp,qdp:m,rows:7})})]}),d.signal&&s("div",{className:"mt-2 text-[11px] text-accent",children:["\uC2E0\uD638 \uC790\uB3D9 \uC785\uB825: ",lu[d.signal.type],"\
 (",au(d.signal.ts)," \uB9C8\uAC10) \xB7 SL/TP \uC790\uB3D9"]}),s(W,{className:"p-3 mt-3",children:[e(M,{k:"\uC9C4\uC785 \uAE30\uC900\uAC00",v:c(v,r.dp)}),e(M,{
k:"\uC99D\uAC70\uAE08 / \uBA85\uBAA9",v:g>0?`${c(f)} / ${c(G)} USDT`:"\u2014"}),e(M,{k:"SL \uC2DC \uC21C\uC190\uC2E4 (\uC218\uC218\uB8CC\xB7\uC2AC\uB9AC\uD53C\uC9C0)",
v:g>0&&$?s("span",{className:"text-down",children:["-",c(ou)," USDT (",(ou/Math.max(r.equity,1e-9)*100).toFixed(2),"%)"]}):"\u2014"}),g>0&&K&&e(M,{k:d.kind==="b\
reakout"||!d.tp2?"TP \uC2DC \uC21C\uC774\uC775":"TP1+TP2 \uC2DC \uC21C\uC774\uC775",v:s("span",{className:"text-up",children:["+",c((d.kind==="breakout"||!d.tp2?
Math.abs(A-v)*g-A*g*H:Math.abs(A-v)*g*.5+Math.abs(q-v)*g*.5-(A+q)*g*.5*H)-v*g*(V+nu))," USDT"]})}),e(M,{k:"\uAC00\uC6A9 / \uC790\uC0B0",v:`${c(r.available)} / ${c(
r.equity)} USDT`})]}),s("div",{className:"sticky bottom-0 -mx-3 px-3 pt-2 pb-3 mt-1 bg-bg/95 backdrop-blur border-t border-line",children:[!su&&(g>0||(N==null?void 0:
N.belowMin))&&e("div",{className:"text-[11px] text-down mb-1",children:cu}),e(z,{tone:d.side==="long"?"up":"down",className:"w-full h-12 text-[16px]",disabled:!su||
!(g>0),onClick:()=>{r.onSubmit(d,h,v,g),a("")},children:d.side==="long"?"\uB871 (\uB9E4\uC218) \uBAA8\uC758 \uC9C4\uC785":"\uC20F (\uB9E4\uB3C4) \uBAA8\uC758 \uC9C4\uC785"})]})]})}
function Re({broker:r}){var m,g,p;const h=r.state,t=Ee(h.fills,h.positions.map(A=>A.id)),E=h.equityCurve,B=360,l=120,a=E.map(A=>A.equity),d=Math.min(...a,h.bankroll),
v=Math.max(...a,h.bankroll),P=E.map((A,q)=>`${q?"L":"M"}${q/Math.max(1,E.length-1)*B},${l-(A.equity-d)/Math.max(1e-9,v-d)*(l-10)-5}`).join(" "),N=async()=>{var G;
const A=we(h.fills),q=`dupont-paper-${new Date().toISOString().slice(0,10)}.csv`,$=new File([A],q,{type:"text/csv"});if((G=navigator.canShare)!=null&&G.call(navigator,
{files:[$]}))try{await navigator.share({files:[$],title:q});return}catch{}const K=document.createElement("a");K.href=URL.createObjectURL($),K.download=q,K.click(),
setTimeout(()=>URL.revokeObjectURL(K.href),2e3)};return s("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[s(W,{className:"p-3",children:[s("di\
v",{className:"grid grid-cols-3 text-center",children:[s("div",{children:[e("div",{className:"text-[11px] text-muted",children:"\uAC70\uB798"}),e("div",{className:"\
num font-semibold",children:t.trades})]}),s("div",{children:[e("div",{className:"text-[11px] text-muted",children:"\uC2B9\uB960"}),e("div",{className:"num font-\
semibold",children:t.trades?`${(t.winRate*100).toFixed(0)}%`:"\u2014"})]}),s("div",{children:[e("div",{className:"text-[11px] text-muted",children:"\uC21C\uC190\uC775"}),
e("div",{className:`num font-semibold ${t.net>=0?"text-up":"text-down"}`,children:R(t.net)})]})]}),s("div",{className:"text-[11px] text-muted text-center mt-1",
children:["\uC218\uC218\uB8CC \uD569\uACC4 ",c(t.fees,3)," USDT (\uC21C\uC190\uC775\uC5D0 \uBC18\uC601)",t.funding!==0?` \xB7 \uD380\uB529 ${R(-t.funding,3)}`:"",
t.partialNet!==0?` \xB7 \uBCF4\uC720 \uC911 \uBD80\uBD84\uCCAD\uC0B0 ${R(t.partialNet)} \uD3EC\uD568`:""]}),t.rTrades>0&&s("div",{className:"text-[11px] text-mu\
ted text-center num",children:["\uAE30\uB300\uAC12 ",s("span",{className:t.expectancyR>=0?"text-up":"text-down",children:[R(t.expectancyR),"R"]})," \xB7 \uD3C9\uADE0 \uC2B9 ",
R(t.avgWinR),"R / \uD328 ",R(t.avgLossR),"R (",t.rTrades,"\uAC74)"]})]}),s(W,{className:"p-3",children:[s("div",{className:"flex justify-between text-[12px] tex\
t-muted mb-1 num",children:[e("span",{children:"\uC790\uC0B0 \uACE1\uC120"}),s("span",{children:[c(((m=E[0])==null?void 0:m.equity)??h.bankroll)," \u2192 ",e("s\
pan",{className:(((g=E[E.length-1])==null?void 0:g.equity)??h.bankroll)>=h.bankroll?"text-up":"text-down",children:c(((p=E[E.length-1])==null?void 0:p.equity)??
h.bankroll)})," USDT"]})]}),s("svg",{viewBox:`0 0 ${B} ${l}`,className:"w-full h-[120px]",children:[e("line",{x1:"0",x2:B,y1:l-(h.bankroll-d)/Math.max(1e-9,v-d)*
(l-10)-5,y2:l-(h.bankroll-d)/Math.max(1e-9,v-d)*(l-10)-5,stroke:"#262e38",strokeDasharray:"4 4"}),e("path",{d:P,fill:"none",stroke:"#00c2cb",strokeWidth:"2"})]}),
h.positions.length>0&&e("div",{className:"text-[11px] text-muted mt-1",children:"\uC9C0\uAC11 \uAE30\uC900 \xB7 \uBCF4\uC720 \uD3EC\uC9C0\uC158\uC758 \uC9C4\uC785 \uC218\uC218\uB8CC\uB294 \uC774\uBBF8 \uCC28\uAC10\uB428 (\uBBF8\uC2E4\uD604 \uC190\uC775 \uC81C\uC678)"})]}),
e(z,{className:"w-full",onClick:N,disabled:!h.fills.length,children:"CSV \uB0B4\uBCF4\uB0B4\uAE30"}),[...h.fills].reverse().map(A=>s(W,{className:"p-3",children:[
s("div",{className:"flex justify-between text-[13px]",children:[s("span",{children:[e("span",{className:A.side==="long"?"text-up":"text-down",children:A.side===
"long"?"\uB871":"\uC20F"})," ",A.symbol," \xB7 ",Hu(A.setup)]}),s("span",{className:`num font-semibold ${A.netPnl>=0?"text-up":"text-down"}`,children:[R(A.netPnl),
" USDT"]})]}),s("div",{className:"text-[11px] text-muted num mt-0.5",children:[au(A.closedAt)," \xB7 ",A.reason," \xB7 ",c(A.qty,_(A.symbol).qdp)," \xB7 ",c(A.entry,
_(A.symbol).dp)," \u2192 ",c(A.exit,_(A.symbol).dp)," \xB7 \uC218\uC218\uB8CC ",c(A.fees,3),A.funding?` \xB7 \uD380\uB529 ${R(-A.funding,3)}`:"",A.r!==void 0?` \
\xB7 ${R(A.r)}R`:""]})]},A.id)),!h.fills.length&&e("div",{className:"text-muted text-sm text-center py-6",children:"\uAC70\uB798 \uAE30\uB85D \uC5C6\uC74C"})]})}
ue.createRoot(document.getElementById("root")).render(e(Te,{}));if("serviceWorker"in navigator){const r="/dupont-mobile/";window.addEventListener("load",()=>navigator.
serviceWorker.register(`${r}sw.js`,{scope:r}).catch(()=>{}))}
