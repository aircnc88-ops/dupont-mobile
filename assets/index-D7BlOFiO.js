import{jsxs as n,jsx as e,Fragment as ne}from"react/jsx-runtime";import re from"react-dom/client";import{useState as L,useEffect as J,useRef as nu,useCallback as _u,
useMemo as Iu}from"react";import{e as ae,f as ie,c as Ku,s as le,n as oe}from"./strategy-Cu9CvPGE.js";import{C as Nu,a as ce,B as U,b as H,R as M,N as F,T as iu,
O as de,c as Hu}from"./ui-DAqVswZh.js";import{l as Be,s as K,u as me,a as Au,b as De,R as pe,c as Ae,d as he,e as Y,f as B,S as lu,g as xe,p as be,T as ge,h as q,
r as fe,i as Wu,m as Cu,M as tu,j as ve,D as ye,k as Ee,n as Ne,o as ke,t as zu,q as we}from"./market-Cv86W7IQ.js";import{P as Se,n as $e,u as ju,T as j,D as Te,
S as ou,t as Fe,r as Me,s as Pe,a as Re,M as Le,b as Gu}from"./paper-D3VIHvZr.js";import"decimal.js";import"lightweight-charts";(function(){const h=document.createElement(
"link").relList;if(h&&h.supports&&h.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))x(l);new MutationObserver(
l=>{for(const o of l)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&x(r)}).observe(document,{childList:!0,subtree:!0});
function t(l){const o={};return l.integrity&&(o.integrity=l.integrity),l.referrerPolicy&&(o.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?o.
credentials="include":l.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function x(l){if(l.ep)return;l.ep=!0;const o=t(l);fetch(l.href,
o)}})();const qe=["\uCC28\uD2B8","\uAC70\uB798","\uD3EC\uC9C0\uC158","\uAE30\uB85D","\uC124\uC815"],cu={RANGE_LONG:"\uBC15\uC2A4 \uBC18\uC804 \uB871",RANGE_SHORT:"\
\uBC15\uC2A4 \uBC18\uC804 \uC20F",FAKE_BREAKOUT_LONG:"\uAC00\uC9DC \uC774\uD0C8 \uB871",FAKE_BREAKOUT_SHORT:"\uAC00\uC9DC \uB3CC\uD30C \uC20F",BREAKOUT_LONG:"\uC9C4\uC9DC\
 \uB3CC\uD30C \uB871",BREAKOUT_SHORT:"\uC9C4\uC9DC \uC774\uD0C8 \uC20F"},Ju=s=>s==="MANUAL"?"\uC218\uB3D9":cu[s]??s,Eu="dupont.broker.v1",Vu="dupont.settings.v1",
hu="dupont.seen.v1";function Ue(s,h){const t=s.level?B(s.level,h):"";return s.add?`\uB3CC\uD30C \uB808\uBCA8 ${t} \uB9AC\uD14C\uC2A4\uD2B8 \uD655\uC778 \u2013 \uCD94\uAC00 \uC9C4\uC785 \uAC00\uB2A5`:
s.reason.startsWith("max adds")?"\uCD5C\uB300 \uCD94\uAC00 \uD69F\uC218 \uB3C4\uB2EC":s.reason.startsWith("no retest")?`\uB3CC\uD30C \uB808\uBCA8 ${t} \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:
s.reason.startsWith("retest without")?"\uB9AC\uD14C\uC2A4\uD2B8 \uC911 \u2013 \uC7A5\uC545\uD615/\uC555\uB825 \uD655\uC778 \uB300\uAE30":s.reason.startsWith("no\
 broken")?"\uB3CC\uD30C \uB808\uBCA8 \uC815\uBCF4 \uC5C6\uC74C":s.reason.startsWith("pyramiding only")?"\uB3CC\uD30C \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9":
s.reason.startsWith("retest must be")?"\uC9C4\uC785/\uC9C1\uC804 \uCD94\uAC00 \uC774\uD6C4\uC758 \uC0C8 \uCE94\uB4E4\uC5D0\uC11C \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30":
s.reason.startsWith("no move away")?`\uB3CC\uD30C \uB808\uBCA8 ${t}\uC5D0\uC11C 0.5R \uC774\uC0C1 \uC774\uD0C8 \uD6C4 \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:"\uB370\uC774\
\uD130 \uBD80\uC871"}function Oe(){var Ru,Lu,qu,Uu;const[s,h]=L("\uCC28\uD2B8"),[t,x]=L(()=>Be(Vu,ye)),l=u=>x(C=>{const i={...C,...u};return Y(Vu,i),i}),o=K(t.symbol),
r=me(t.symbol,t.tf),[m,v]=L(()=>Au(`dupont.box.${t.symbol}`));J(()=>v(Au(`dupont.box.${t.symbol}`)),[t.symbol]);const[S,N]=L(!1),c=De(r.candles,r.intervalMs,r.tape,
r.tapeVer,r.serverNow,t,m,o.dp),y=(10**-o.dp).toFixed(o.dp),A=nu(null);A.current||(A.current=new Se(Au(Eu)??void 0)),A.current.moveSlToBe=t.moveSlToBe,A.current.
precision=u=>{const C=K(u);return{dp:C.dp,qdp:C.qdp}};const[R,G]=L(0),P=()=>{Y(Eu,A.current.state),G(u=>u+1)},[D,O]=L([]),g=_u((u,C="info")=>{const i=Date.now()+
Math.random();if(O(a=>[...a.slice(-1),{id:i,text:u,tone:C}]),setTimeout(()=>O(a=>a.filter(d=>d.id!==i)),4e3),t.notify&&"Notification"in window&&Notification.permission===
"granted"&&document.visibilityState!=="visible")try{new Notification("\uB4C0\uD401 \uC2A4\uD0E0\uB2E4\uB4DC",{body:u,icon:"/dupont-mobile/icons/icon.svg"})}catch{}},
[t.notify]),f=((Ru=r.ticker)==null?void 0:Ru.last)??((Lu=r.candles[r.candles.length-1])==null?void 0:Lu.close)??0,[V,ru]=L({});J(()=>{f&&ru(u=>({...u,[t.symbol]:f}))},
[f]);const du=18e4,au=nu({}),Bu=async(u,C=!1)=>{const i=Date.now();if(!C&&i-(au.current[u]??0)<3e4)return;au.current[u]=i;const a=await ke(u).catch(()=>null);a!=
null&&a.length&&(A.current.setSettledRates(u,a),Y(Eu,A.current.state))},_=nu(new pe),E=nu(!1),ku=(u,C,i,a)=>{const d=_.current.tick(A.current.state,u,r.serverNow());
if(d==="replaying")return[];if(d==="gap")return xu(),[];const p=r.serverNow(),b=A.current.onPrice(u,C,p,i);return A.current.needsSettledRate(u,p)&&Bu(u),b.push(
...A.current.accrueFunding(u,i||C,p,du)),a!==void 0&&A.current.noteTickerRate(u,a,p),b},xu=async()=>{var i;const u=A.current,C=_.current.begin(u.state,r.serverNow());
C.length&&await r.syncClock();for(const a of C)try{if(await Bu(a,!0),!r.clockSynced())throw new Error("server clock unknown");const d=r.serverNow(),p=Math.floor(
fe(u.state,a)/6e4)*6e4,{bars:b,clampedFrom:T}=await Wu(a,p,d),z=r.serverNow();if(Math.floor(z/6e4)>Math.floor(d/6e4)){const W=await Wu(a,Math.floor(d/6e4)*6e4,z),
Ou=new Map(b.map(eu=>[eu.ts,eu]));for(const eu of W.bars)Ou.set(eu.ts,eu);b.splice(0,b.length,...[...Ou.values()].sort((eu,se)=>eu.ts-se.ts))}const k=u.replayBars(
a,b.filter(W=>W.ts>=p),r.serverNow()),I=k.filter(W=>W.kind==="funding");(I.length>2?k.filter(W=>W.kind!=="funding"):k).forEach(W=>g(`[\uC7AC\uC0DD] ${a} ${W.message}`,
W.kind==="sl"||W.kind==="liq"?"down":W.kind==="funding"?"info":"up")),I.length>2&&g(`[\uC7AC\uC0DD] ${a} \uD380\uB529\uBE44 ${I.length}\uD68C \uBC18\uC601 (\uB9C8\uC9C0\uB9C9: ${I[I.
length-1].message})`,"info"),T>p&&g(`[\uC7AC\uC0DD] ${a} ${Cu(p)}~${Cu(T)} \uAD6C\uAC04\uC740 1\uBD84\uBD09 \uC81C\uACF5 \uBC94\uC704(30\uC77C) \uBC16 \u2013 \uC7AC\uC0DD \uC0DD\uB7B5`,
"warn");const uu=(i=u.state).lastTickTs??(i.lastTickTs={});uu[a]=Math.max(uu[a]??0,r.serverNow()),_.current.succeeded(a),P()}catch{const d=!r.clockSynced();_.current.
failed(a,r.serverNow(),!d)?g(`[\uC7AC\uC0DD] ${a} 1\uBD84\uBD09 \uC870\uD68C 3\uD68C \uC2E4\uD328 \u2013 \uACC4\uC18D \uC7AC\uC2DC\uB3C4 \uC911 (\uC190\uC808/\uC775\uC808\uC740 \uC7AC\uC0DD \uD6C4 \uBC18\uC601 \xB7 \uC218\uB3D9 \uCCAD\uC0B0 \uAC00\uB2A5)`,
"down"):d&&!E.current&&(E.current=!0,g("[\uC7AC\uC0DD] \uC11C\uBC84 \uC2DC\uAC04 \uD655\uC778 \uC2E4\uD328 \u2013 \uC7AC\uC2DC\uB3C4 \uC911 (\uC624\uD504\uB77C\uC778 \uAD6C\uAC04 \uBC18\uC601 \uB300\uAE30)",
"warn"))}finally{_.current.release(a)}};J(()=>{xu();const u=()=>{document.visibilityState==="visible"&&xu()};return document.addEventListener("visibilitychange",
u),()=>document.removeEventListener("visibilitychange",u)},[]),J(()=>{var C,i;if(!f||_.current.replaying.has(t.symbol))return;const u=ku(t.symbol,f,(C=r.ticker)==
null?void 0:C.mark,(i=r.ticker)==null?void 0:i.funding);u.length&&(u.forEach(a=>g(a.message,a.kind==="sl"||a.kind==="liq"?"down":a.kind==="funding"?"info":"up")),
P())},[f]),J(()=>{const u=setInterval(async()=>{const C=new Set([...A.current.state.positions.map(i=>i.symbol),...A.current.state.pending.map(i=>i.symbol)]);C.delete(
t.symbol);for(const i of C){if(_.current.replaying.has(i))continue;const a=await Ae(i).catch(()=>null);if(!a)continue;ru(p=>({...p,[i]:a.last}));const d=ku(i,a.
last,a.mark,a.funding);d.length&&(d.forEach(p=>g(`${i} ${p.message}`)),P())}},4e3);return()=>clearInterval(u)},[t.symbol]);const $=A.current.state,wu=A.current.
equity(V),bu=A.current.available(),gu=$.positions.filter(u=>u.symbol===t.symbol),Z=he({symbol:t.symbol,tf:t.tf,intervalMs:r.intervalMs,closed:c.closed,pressures:c.
pressures,live:c.live,tape:r.tape,serverNow:r.serverNow,state:$,bv:R,autoPaper:t.autoPaper,url:t.sheetsUrl,token:t.sheetsToken}),X=nu(new Set(Au(hu)??[])),su=u=>`${t.
symbol}:${t.tf}:${u.type}:${u.ts}`,w=c.live[c.live.length-1]??null,fu=((qu=c.closed[c.closed.length-1])==null?void 0:qu.ts)??0,Su=u=>u.ts<fu?"\uC2E0\uD638 \uB9CC\uB8CC (\uCD5C\uADFC \uB9C8\uAC10 \uCE94\uB4E4 \uC544\uB2D8\
)":Math.abs(f-Number(u.entry))>.3*Number(u.risk)?"\uAC00\uACA9 \uC774\uD0C8 (\uC2E0\uD638 \uC9C4\uC785\uAC00 \xB10.3R \uCD08\uACFC)":null,mu=u=>{var i,a;const C=u===
"long"?(i=r.ticker)==null?void 0:i.ask:(a=r.ticker)==null?void 0:a.bid;return C&&f&&Math.abs(C-f)/f<.005?C:f},Q=Iu(()=>{var i;const u=((i=c.closed[c.closed.length-
3])==null?void 0:i.ts)??0,C=[...c.history].reverse().find(a=>a.ts>=u);return w??C??null},[w,c.history,c.closed]),vu=()=>$.wallet*t.riskPct/100,$u=(u,C)=>le({equity:String(
$.wallet),available:String(bu),riskPct:t.riskPct,entry:String(u),sl:String(C),leverage:t.leverage,feeRate:String(j),slippageBps:ou,qtyStep:String(o.qtyStep),minQty:String(
o.qtyStep),minNotional:tu}),Tu=(u,C=!1)=>{if($.positions.some(uu=>uu.symbol===t.symbol)){g("\uC774\uBBF8 \uD3EC\uC9C0\uC158 \uBCF4\uC720 \uC911","down");return}
const i=f;if(!(i>0)){g("\uD604\uC7AC\uAC00 \uD655\uC778 \uC911 \u2013 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC9C4\uC785\uD558\uC138\uC694","warn");return}const a=Su(
u);if(a){g(`${a} \u2013 \uC9C4\uC785 \uBD88\uAC00`,"down");return}const d=Ku({side:u.side,kind:u.kind,entry:String(i),extremeWick:u.sl,box:u.box,slBufferPct:0,tickSize:y,
feeRate:j,slippageBps:ou});if(u.kind==="range"&&oe({side:u.side,entry:d.entry,sl:d.sl,tp:d.targets[0].price,feeRate:j,slippageBps:ou})<1){g("\uD604\uC7AC\uAC00 \uAE30\uC900 TP1 \uC21C\uC190\uC775\uBE44 1 \uBBF8\
\uB9CC \u2013 \uC9C4\uC785 \uC0DD\uB7B5","down");return}const p=Number(d.sl),b=Fe(d.targets),T=u.side==="long";if(T?!(p<i&&b[0].price>i):!(p>i&&b[0].price<i)){g(
"\uD604\uC7AC\uAC00\uAC00 \uC2E0\uD638 \uBC94\uC704\uB97C \uBC97\uC5B4\uB098 \uC9C4\uC785 \uBD88\uAC00 (SL/TP1 \uC0AC\uC774 \uC544\uB2D8)","down");return}const z=$u(
i,p),k=Number(z.qty);if(z.belowMin||!(k>0)){g(`\uB9AC\uC2A4\uD06C ${t.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${tu} USDT / ${o.qtyStep}\
) \uBBF8\uB9CC`,"down");return}const I=A.current.open({symbol:t.symbol,side:u.side,qty:k,price:i,refPx:mu(u.side),leverage:t.leverage,sl:p,targets:b,setup:u.type,
signalId:su(u),breakoutLevel:u.kind==="breakout"?Number(T?u.box.top:u.box.bottom):void 0,riskBudget:vu()},r.serverNow());if(!I.ok){g(I.error??"\uC9C4\uC785 \uC2E4\uD328",
"down");return}X.current.add(su(u)),Y(hu,[...X.current].slice(-300)),Z.signalOutcome(u,!0),g(`${C?"[\uC790\uB3D9] ":""}${cu[u.type]} \uBAA8\uC758 \uC9C4\uC785 ${B(
k,o.qdp)} @ ${B(I.fillPx??i,o.dp)}`,"up"),P()},Xu=u=>{const C=$.fills.filter(d=>d.final&&d.symbol===t.symbol),i=C[C.length-1];if(i){const d=$.fills.filter(b=>b.
positionId===i.positionId).reduce((b,T)=>b+T.netPnl,0),p=Math.floor(i.closedAt/r.intervalMs)*r.intervalMs;if(d<0&&u.ts<=p+2*r.intervalMs)return"\uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30"}
const a=new Date(r.serverNow());return a.setHours(0,0,0,0),Me($.fills,a.getTime())<=-3?"\uC77C\uC77C \uC190\uC2E4 \uD55C\uB3C4 \u22123R \uB3C4\uB2EC":null};J(()=>{
if(!w)return;const u=su(w);if(!X.current.has(`n:${u}`))if(X.current.add(`n:${u}`),Y(hu,[...X.current].slice(-300)),g(`\uC2E0\uD638: ${cu[w.type]} \xB7 SL ${B(w.
sl,o.dp)} \xB7 ${w.targets.map(C=>`${C.label} ${B(C.price,o.dp)}`).join(" / ")}`,w.side==="long"?"up":"down"),t.autoPaper&&!gu.length){const C=w.pressure.source!==
"trades"?"\uC555\uB825\uC774 OHLCV \uADFC\uC0AC":Xu(w);C?(g(`[\uC790\uB3D9] \uC9C4\uC785 \uC0DD\uB7B5 \u2013 ${C}`,"info"),Z.signalOutcome(w,!1,C==="\uC555\uB825\uC774 OHLCV \uADFC\
\uC0AC"?lu.pressureOhlcv:C.startsWith("\uC190\uC2E4 \uD6C4")?lu.lossCooldown:lu.dailyStop)):(Z.signalOutcome(w,!1,lu.entryRefused),Tu(w,!0))}else t.autoPaper&&Z.
signalOutcome(w,!1,lu.positionOpen)},[w==null?void 0:w.ts,w==null?void 0:w.type]);const Du=Iu(()=>gu.map(u=>{var d,p;const C=c.pressures.slice(0,c.closed.length),
i=ae({side:u.side,entry:u.entry,sl:u.sl,targets:u.targets.filter(b=>!b.done).map(b=>({price:b.price}))},c.closed,C),a=u.setup.startsWith("BREAKOUT")?ie({side:u.
side,entry:u.entry,sl:u.initialSl,targets:u.targets.map(b=>({price:b.price})),type:u.setup,adds:u.adds,brokenLevel:u.breakoutLevel,openedTs:Math.floor(u.openedAt/
r.intervalMs)*r.intervalMs,lastAddTs:u.lastAddTs,risk:Math.abs((u.initialEntry??u.entry)-u.initialSl)},c.closed,C,c.box,{maxAdds:t.maxAdds,addSizePct:t.addSizePct,
tickSize:y,atr:((d=c.signalBox)==null?void 0:d.atr)??((p=c.box)==null?void 0:p.atr)}):null;return{p:u,flip:i,pyr:a}}),[R,c.closed,c.pressures,c.box,c.signalBox,
t.maxAdds,t.addSizePct,t.symbol,r.intervalMs]),Fu=nu(new Set);J(()=>{for(const u of Du){const C=`${u.p.id}:${fu}`;u.flip.alert&&!Fu.current.has(C)&&(Fu.current.
add(C),g(`\uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (${u.flip.multiple.toFixed(1)}\uBC30)`,"warn"))}},[Du]);const yu=(u,C,i)=>{var b,T;if(_.current.
replaying.has(u.symbol)){g("\uC624\uD504\uB77C\uC778 \uAD6C\uAC04 \uC7AC\uC0DD \uC911 \u2013 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uCCAD\uC0B0\uD558\uC138\uC694","w\
arn");return}const a=(((b=_.current.fails[u.symbol])==null?void 0:b.n)??0)>=ve?(T=A.current.state.lastPx)==null?void 0:T[u.symbol]:void 0,d=V[u.symbol]??a;if(!(d>
0)){g(`${u.symbol} \uD604\uC7AC\uAC00 \uD655\uC778 \uC911 \u2013 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uCCAD\uC0B0\uD558\uC138\uC694`,"warn");return}V[u.symbol]===void 0&&
g(`${u.symbol} \uC2DC\uC138 \uC870\uD68C \uBD88\uAC00 \u2013 \uB9C8\uC9C0\uB9C9 \uCC98\uB9AC \uAC00\uACA9 ${B(d,K(u.symbol).dp)}\uB85C \uCCAD\uC0B0`,"warn");const p=A.
current.closeFraction(u.id,C,d,i,r.serverNow());p&&g(`${i} ${B(p.qty,K(u.symbol).qdp)} @ ${B(p.exit,K(u.symbol).dp)} \xB7 \uC21C\uC190\uC775 ${q(p.netPnl)} USDT`,
p.netPnl>=0?"up":"down"),P()},Zu=(u,C)=>{if(!(f>0)){g("\uD604\uC7AC\uAC00 \uD655\uC778 \uC911 \u2013 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uCD94\uAC00\uD558\uC138\uC694",
"warn");return}if(u.symbol!==t.symbol){g(`${u.symbol} \uBD88\uD0C0\uAE30\uB294 \uD574\uB2F9 \uC2EC\uBCFC \uD654\uBA74\uC5D0\uC11C\uB9CC \uAC00\uB2A5\uD569\uB2C8\uB2E4`,
"warn");return}const i=u.initialQty??u.origQty/(1+u.adds*(t.addSizePct/100)),a=u.riskBudget??$.wallet*t.riskPct/100,d=Pe(u,{last:mu(u.side),suggestedSl:C.sl?Number(
C.sl):void 0,budget:a,wantQty:i*(C.sizePct??t.addSizePct)/100,step:o.qtyStep});if(!(d.qty>0)){g("\uCD94\uAC00 \uC2DC \uCD1D \uB9AC\uC2A4\uD06C\uAC00 \uD55C\uB3C4 \uCD08\uACFC",
"down");return}if(d.qty*f<tu){g(`\uCD94\uAC00 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561(${tu} USDT) \uBBF8\uB9CC`,"down");return}const p=A.current.
open({symbol:u.symbol,side:u.side,qty:d.qty,price:f,refPx:mu(u.side),leverage:u.leverage,sl:d.newSl,targets:[],setup:u.setup,isAdd:!0,candleTs:fu},r.serverNow());
if(!p.ok){g(p.error??"\uCD94\uAC00 \uC2E4\uD328","down");return}g(`\uBD88\uD0C0\uAE30 #${u.adds+1}: ${B(d.qty,o.qdp)} @ ${B(p.fillPx??f,o.dp)} \xB7 SL ${B(d.newSl,
o.dp)}`,"up"),P()},ue=_u(u=>{var p,b;const C=c.closed,i=C.length>=2?u==="long"?Math.min(C[C.length-1].low,C[C.length-2].low):Math.max(C[C.length-1].high,C[C.length-
2].high):f*(u==="long"?.995:1.005),a=c.box,d=a?f<Number(a.top)&&f>Number(a.bottom):!1;if(a){const T=d?"range":"breakout",z=u==="long"?Math.min(i,f*.999):Math.max(
i,f*1.001),k=Ku({side:u,kind:T,entry:String(f),extremeWick:String(z),box:a,atr:a.atr,tickSize:y,feeRate:j,slippageBps:ou}),I=uu=>uu?Number(uu).toFixed(o.dp):"";
return{side:u,kind:T,sl:I(k.sl),tp1:I((p=k.targets[0])==null?void 0:p.price),tp2:I((b=k.targets[1])==null?void 0:b.price)}}return{side:u,kind:"breakout",...$e(u,
f,y,o.dp),tp2:""}},[c.closed,c.box,f,o.dp,y]),[pu,ee]=L(null),te=(pu==null?void 0:pu.sym)===t.symbol?pu:null,Mu=u=>ee(u&&{...u,sym:t.symbol}),Ce=u=>{var i,a;const C=d=>d?
Number(d).toFixed(o.dp):"";Mu({side:u.side,kind:u.kind,sl:C(u.sl),tp1:C((i=u.targets[0])==null?void 0:i.price),tp2:C((a=u.targets[1])==null?void 0:a.price),signal:u}),
h("\uAC70\uB798")},Pu=(((Uu=r.ticker)==null?void 0:Uu.change24h)??0)>=0;return n("div",{className:"h-full flex flex-col pt-safe",children:[e("header",{className:"\
px-3 pt-2 pb-1.5 border-b border-line",children:n("div",{className:"flex items-end justify-between",children:[n("div",{children:[n("div",{className:"flex items-\
center gap-2",children:[e("select",{value:t.symbol,onChange:u=>l({symbol:u.target.value}),className:"bg-transparent text-[15px] font-semibold outline-none",children:xe.
map(u=>e("option",{value:u.symbol,className:"bg-panel",children:u.symbol},u.symbol))}),e("span",{className:"text-[10px] px-1.5 py-0.5 rounded bg-panel2 text-mut\
ed",children:"\uBB34\uAE30\uD55C \xB7 \uBAA8\uC758"}),e("span",{className:`w-2 h-2 rounded-full ${r.status==="live"?"bg-up":"bg-warn"}`,title:r.status})]}),e("d\
iv",{className:`text-[26px] leading-8 font-semibold num ${Pu?"text-up":"text-down"}`,children:f?B(f,o.dp):"\u2014"})]}),n("div",{className:"text-right text-[11p\
x] text-muted num leading-[18px]",children:[n("div",{children:["24h ",e("span",{className:Pu?"text-up":"text-down",children:r.ticker?be(r.ticker.change24h):"\u2014"})]}),
n("div",{children:["\uB9C8\uD06C ",r.ticker?B(r.ticker.mark,o.dp):"\u2014"]}),n("div",{children:["\uD380\uB529 ",r.ticker?`${(r.ticker.funding*100).toFixed(4)}%`:
"\u2014"]})]})]})}),D.length>0&&e("div",{className:"px-3 py-1.5 space-y-1 border-b border-line bg-bg","aria-live":"polite",children:D.map(u=>e("div",{className:`\
text-[12px] leading-4 px-2.5 py-1.5 rounded-md ${u.tone==="down"?"bg-down/20 text-down":u.tone==="up"?"bg-up/15 text-up":u.tone==="warn"?"bg-warn/20 text-warn":
"bg-panel2 text-txt"}`,children:u.text},u.id))}),n("main",{className:"flex-1 min-h-0 flex flex-col overflow-hidden",children:[s==="\uCC28\uD2B8"&&n(ne,{children:[
n("div",{className:"flex items-center justify-between px-3 py-1.5 gap-2",children:[e(Nu,{items:ge,value:t.tf,onChange:u=>l({tf:u})}),e("button",{onClick:()=>N(u=>!u),
className:`h-8 px-3 rounded-full text-xs ${S?"bg-warn text-bg font-semibold":"bg-panel2 text-muted"}`,children:S?"\uD3B8\uC9D1 \uC644\uB8CC":"\uBC15\uC2A4 \uD3B8\uC9D1"})]}),
e("div",{className:"flex-1 min-h-0",children:r.candles.length?e(ce,{viewKey:`${t.symbol}:${t.tf}`,candles:r.candles,pressures:c.pressures,box:c.box,signals:c.history,
positions:gu,dp:o.dp,showHist:t.showHist,editBox:S,onBoxEdit:(u,C)=>{var a;const i={top:u,bottom:C,startTs:(m==null?void 0:m.startTs)??((a=c.box)==null?void 0:a.
startTime)??r.serverNow(),locked:!0};v(i),Y(`dupont.box.${t.symbol}`,i)}}):e("div",{className:"p-6 text-muted text-sm",children:r.err?`\uB370\uC774\uD130 \uC624\uB958: ${r.
err}`:"\uCE94\uB4E4 \uBD88\uB7EC\uC624\uB294 \uC911\u2026"})}),e(_e,{box:c.box,manual:m,dp:o.dp,tape:c.tapeCandles,onUnlock:()=>{v(null),Y(`dupont.box.${t.symbol}`,
null),N(!1)},onEdit:(u,C)=>{var a;const i={top:u,bottom:C,startTs:(m==null?void 0:m.startTs)??((a=c.box)==null?void 0:a.startTime)??r.serverNow(),locked:!0};v(i),
Y(`dupont.box.${t.symbol}`,i)}},t.symbol),Du.filter(u=>u.flip.alert).map(u=>n("div",{className:"mx-3 mb-2 rounded-lg bg-warn/15 border border-warn px-3 py-2 fle\
x items-center justify-between",children:[n("span",{className:"text-[13px] text-warn font-semibold",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",
u.flip.multiple.toFixed(1),"\uBC30)"]}),e(U,{tone:"warn",className:"h-9",onClick:()=>yu(u.p,1,"\uC555\uB825\uBC18\uC804 \uCCAD\uC0B0"),children:"\uCCAD\uC0B0"})]},
u.p.id)),e(Ie,{g:Q,dp:o.dp,acted:Q?X.current.has(su(Q)):!1,stale:Q?Su(Q):null,onEnter:()=>Q&&Tu(Q),onEdit:()=>Q&&Ce(Q)})]}),s==="\uAC70\uB798"&&e(Ke,{s:t,set:l,
last:f,dp:o.dp,book:r.book,equity:wu,available:bu,qtyStep:o.qtyStep,draft:te,setDraft:Mu,defaultDraft:ue,sizeFor:$u,onSubmit:(u,C,i,a)=>{var z;if(!(f>0)){g("\uD604\uC7AC\uAC00\
 \uD655\uC778 \uC911 \u2013 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC8FC\uBB38\uD558\uC138\uC694","warn");return}const d=Number(u.sl),p=u.kind==="breakout"||!u.tp2?[
{price:Number(u.tp1),fraction:1,label:u.kind==="breakout"?"TP 1:3":"TP"}]:[{price:Number(u.tp1),fraction:.5,label:"TP1 \uC911\uC559\uC120"},{price:Number(u.tp2),
fraction:.5,label:"TP2 \uBC18\uB300\uD3B8"}],b=((z=u.signal)==null?void 0:z.type)??"MANUAL",T=u.kind==="breakout"&&c.box?Number(u.side==="long"?c.box.top:c.box.
bottom):void 0;if(C==="limit"){if(u.side==="long"?i>=f:i<=f){g(`\uC9C0\uC815\uAC00\uAC00 \uD604\uC7AC\uAC00 ${u.side==="long"?"\uC774\uC0C1":"\uC774\uD558"} \u2013 \uC989\
\uC2DC \uCCB4\uACB0\uB418\uB294 \uC8FC\uBB38\uC740 \uC2DC\uC7A5\uAC00\uB85C \uB123\uC73C\uC138\uC694`,"down");return}const k=A.current.placeLimit({symbol:t.symbol,
side:u.side,qty:a,price:i,leverage:t.leverage,sl:d,targets:p,setup:b,breakoutLevel:T,riskBudget:vu()},r.serverNow());g(k.ok?`\uC9C0\uC815\uAC00 ${u.side==="long"?
"\uB871":"\uC20F"} \uC8FC\uBB38 ${B(a,o.qdp)} @ ${B(i,o.dp)}`:k.error??"\uC8FC\uBB38 \uC2E4\uD328",k.ok?"up":"down")}else{const k=A.current.open({symbol:t.symbol,
side:u.side,qty:a,price:f,refPx:mu(u.side),leverage:t.leverage,sl:d,targets:p,setup:b,breakoutLevel:T,signalId:u.signal?su(u.signal):void 0,riskBudget:vu()},r.serverNow());
g(k.ok?`${u.side==="long"?"\uB871":"\uC20F"} \uBAA8\uC758 \uC9C4\uC785 ${B(a,o.qdp)} @ ${B(k.fillPx??f,o.dp)}`:k.error??"\uC9C4\uC785 \uC2E4\uD328",k.ok?"up":"d\
own"),k.ok&&u.signal&&(X.current.add(su(u.signal)),Y(hu,[...X.current].slice(-300)),Z.signalOutcome(u.signal,!0))}P()}},t.symbol),s==="\uD3EC\uC9C0\uC158"&&n("d\
iv",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[n(H,{className:"p-3",children:[e(M,{k:"\uC790\uC0B0 (Equity)",v:`${B(wu)} USDT`}),e(M,{k:"\uAC00\uC6A9",
v:`${B(bu)} USDT`}),e(M,{k:"\uBBF8\uC2E4\uD604 \uC190\uC775 (\uC21C, \uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC)",v:(()=>{const u=$.positions.reduce((i,a)=>{const d=V[a.symbol]??
a.entry;return i+ju(a,d)-a.entryFeeLeft-d*a.qty*j},0),C=Number(u.toFixed(2));return n("span",{className:C>0?"text-up":C<0?"text-down":"",children:[q(u)," USDT"]})})()})]}),
!$.positions.length&&e("div",{className:"text-muted text-sm text-center py-8",children:"\uBCF4\uC720 \uD3EC\uC9C0\uC158 \uC5C6\uC74C"}),$.positions.map(u=>{var p;
const C=Du.find(b=>b.p.id===u.id),i=V[u.symbol]??u.entry,a=ju(u,i)-u.entryFeeLeft-i*u.qty*j,d=K(u.symbol).dp;return n(H,{className:"p-3",children:[n("div",{className:"\
flex justify-between items-center mb-1",children:[n("div",{className:"font-semibold",children:[e("span",{className:u.side==="long"?"text-up":"text-down",children:u.
side==="long"?"\uB871":"\uC20F"})," ",u.symbol," ",n("span",{className:"text-muted text-xs",children:[u.leverage,"x \xB7 ",Ju(u.setup)]})]}),n("div",{className:"\
text-right",children:[n("div",{className:`num font-semibold ${a>=0?"text-up":"text-down"}`,children:[q(a)," USDT"]}),e("div",{className:"text-[10px] text-muted",
children:"\uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC \uC21C\uC190\uC775"})]})]}),e(M,{k:"\uC218\uB7C9 / \uC9C4\uC785\uAC00",v:`${B(u.qty,K(u.symbol).qdp)} / ${B(u.entry,d)}`}),
e(M,{k:"\uB9C8\uD06C / \uCCAD\uC0B0\uAC00",v:`${B(i,d)} / ${B(u.liqPrice,d)}`}),e(M,{k:`SL${u.beMoved?" (\uBCF8\uC808)":""}`,v:B(u.sl,d)}),u.targets.map((b,T)=>e(
M,{k:b.label,v:n("span",{className:b.done?"text-up":"",children:[B(b.price,d)," \xB7 ",Math.round(b.fraction*100),"% ",b.done?"\u2713 \uCCB4\uACB0":"\uB300\uAE30"]})},
T)),e(M,{k:"\uACC4\uD68D \uB9AC\uC2A4\uD06C (1R)",v:u.riskUsd?`${B(u.riskUsd)} USDT`:"\u2014"}),u.riskBudget!==void 0&&e(M,{k:"\uB9AC\uC2A4\uD06C \uC608\uC0B0 (\uC9C4\uC785 \uC2DC \uACE0\uC815)",
v:`${B(u.riskBudget)} USDT`}),(u.fundingAcc??0)!==0&&e(M,{k:"\uD380\uB529\uBE44 \uB204\uC801 (\uBBF8\uC815\uC0B0)",v:n("span",{className:(u.fundingAcc??0)>0?"te\
xt-down":"text-up",children:[q(-(u.fundingAcc??0),4)," USDT"]})}),e(M,{k:"\uC2E4\uD604 \uC190\uC775 (\uC21C, \uD380\uB529 \uD3EC\uD568)",v:q(u.realizedNet)}),(C==
null?void 0:C.flip.alert)&&n("div",{className:"mt-2 text-[12px] text-warn",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",C.flip.
multiple.toFixed(1),"\uBC30, \uBAA9\uD45C \uC9C4\uD589 ",Math.round(C.flip.progress*100),"%)"]}),(C==null?void 0:C.pyr)&&n("div",{className:`mt-1 text-[11px] ${C.
pyr.add?"text-accent":"text-muted"}`,children:["\uBD88\uD0C0\uAE30 ",u.adds,"/",t.maxAdds,": ",Ue(C.pyr,K(u.symbol).dp)]}),!(C!=null&&C.pyr)&&n("div",{className:"\
mt-1 text-[11px] text-muted",children:["\uBD88\uD0C0\uAE30: \uB3CC\uD30C \uC2E0\uD638 \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 (\uCD5C\uB300 ",t.maxAdds,
"\uD68C)"]}),n("div",{className:"grid grid-cols-3 gap-2 mt-3",children:[e(U,{tone:"down",onClick:()=>yu(u,1,"\uC2DC\uC7A5\uAC00 \uCCAD\uC0B0"),children:"\uC804\uB7C9 \uCCAD\uC0B0"}),
e(U,{onClick:()=>yu(u,.5,"50% \uCCAD\uC0B0"),children:"50% \uCCAD\uC0B0"}),e(U,{tone:"accent",disabled:!((p=C==null?void 0:C.pyr)!=null&&p.add)||u.adds>=t.maxAdds||
u.symbol!==t.symbol,onClick:()=>(C==null?void 0:C.pyr)&&Zu(u,C.pyr),children:"\uBD88\uD0C0\uAE30"})]})]},u.id)}),$.pending.length>0&&n(H,{className:"p-3",children:[
e("div",{className:"text-sm font-semibold mb-1",children:"\uBBF8\uCCB4\uACB0 \uC9C0\uC815\uAC00"}),$.pending.map(u=>n("div",{className:"flex justify-between ite\
ms-center py-1 text-[13px]",children:[n("span",{className:u.side==="long"?"text-up":"text-down",children:[u.side==="long"?"\uB871":"\uC20F"," ",u.symbol," ",B(u.
qty,K(u.symbol).qdp)," @ ",B(u.price,K(u.symbol).dp)]}),e("button",{className:"text-muted underline",onClick:()=>{A.current.cancelLimit(u.id),P()},children:"\uCDE8\uC18C"})]},
u.id))]})]}),s==="\uAE30\uB85D"&&e(ze,{broker:A.current,journal:Z}),s==="\uC124\uC815"&&n("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[n(H,
{className:"p-3",children:[e("div",{className:"text-sm font-semibold mb-2",children:"\uC790\uAE08"}),e(M,{k:"\uC2DC\uB4DC / \uC9C0\uAC11",v:`${B($.bankroll)} / ${B(
$.wallet)} USDT`}),e(U,{tone:"down",className:"w-full mt-2",onClick:()=>{confirm("\uBAA8\uC758 \uC790\uAE08\uC744 200 USDT\uB85C \uCD08\uAE30\uD654\uD558\uACE0 \uD3EC\uC9C0\uC158\xB7\uAE30\uB85D\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?")&&
(A.current.reset(Te,r.serverNow()),P(),g("200 USDT\uB85C \uCD08\uAE30\uD654"))},children:"\uC790\uAE08 \uCD08\uAE30\uD654 (200 USDT)"})]}),n(H,{className:"p-3 s\
pace-y-3",children:[e("div",{className:"text-sm font-semibold",children:"\uB9AC\uC2A4\uD06C"}),n("div",{className:"grid grid-cols-2 gap-2",children:[e(F,{label:"\
\uAC70\uB798\uB2F9 \uB9AC\uC2A4\uD06C %",value:String(t.riskPct),onChange:u=>l({riskPct:Math.max(.1,Number(u)||1)}),suffix:"%"}),e(F,{label:"\uAE30\uBCF8 \uB808\uBC84\uB9AC\uC9C0",
value:String(t.leverage),onChange:u=>l({leverage:Math.min(125,Math.max(1,Math.round(Number(u)||1)))}),suffix:"x"}),e(F,{label:"\uBD88\uD0C0\uAE30 \uCD5C\uB300 \uD69F\uC218",
value:String(t.maxAdds),onChange:u=>l({maxAdds:Math.max(0,Math.round(Number(u)||0))})}),e(F,{label:"\uBD88\uD0C0\uAE30 \uD06C\uAE30 (\uCD08\uAE30 \uB300\uBE44)",
value:String(t.addSizePct),onChange:u=>l({addSizePct:Math.max(5,Number(u)||50)}),suffix:"%"})]}),e(iu,{on:t.moveSlToBe,onChange:u=>l({moveSlToBe:u}),label:"TP1 \
\uCCB4\uACB0 \uD6C4 SL \uBCF8\uC808 \uC774\uB3D9",hint:"\uBCF8\uC808\uAC00 = \uC9C4\uC785\uAC00 + \uB0A8\uC740 \uC9C4\uC785\xB7\uCCAD\uC0B0 \uC218\uC218\uB8CC (\uC190\uC2E4 \uC5C6\uC774 \uCCAD\uC0B0)"}),
e(iu,{on:t.autoPaper,onChange:u=>l({autoPaper:u}),label:"\uC790\uB3D9 \uBAA8\uC758\uB9E4\uB9E4",hint:"\uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 \uC2E0\uD638\uB9CC \xB7 \uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30 \xB7 \uC77C\uC77C \u22123R \uC815\uC9C0 (\uAE30\uBCF8 OFF)"})]}),
n(H,{className:"p-3 space-y-3",children:[e("div",{className:"text-sm font-semibold",children:"\uBC15\uC2A4 / \uD53C\uBD07"}),n("div",{className:"grid grid-cols-\
2 gap-2",children:[e(F,{label:"\uB8E9\uBC31 (\uCE94\uB4E4)",value:String(t.lookback),onChange:u=>l({lookback:Math.max(20,Math.round(Number(u)||80))})}),e(F,{label:"\
\uD130\uCE58 \uD5C8\uC6A9 %",value:String(t.tolerancePct),onChange:u=>l({tolerancePct:Math.max(.05,Number(u)||.25)}),suffix:"%"}),e(F,{label:"\uD53C\uBD07 \uC88C",
value:String(t.pivotLeft),onChange:u=>l({pivotLeft:Math.max(1,Math.round(Number(u)||3))})}),e(F,{label:"\uD53C\uBD07 \uC6B0",value:String(t.pivotRight),onChange:u=>l(
{pivotRight:Math.max(1,Math.round(Number(u)||3))})}),e(F,{label:"\uCD5C\uC18C \uD130\uCE58",value:String(t.minTouches),onChange:u=>l({minTouches:Math.max(1,Math.
round(Number(u)||2))})}),e(F,{label:"\uCD5C\uC18C \uBC15\uC2A4 \uB192\uC774 %",value:String(t.minHeightPct),onChange:u=>l({minHeightPct:Math.max(0,Number(u)||0)}),
suffix:"%"})]}),e(iu,{on:t.requireRange,onChange:u=>l({requireRange:u}),label:"\uBC15\uC2A4\uAD8C(\uBE44\uCD94\uC138)\uC77C \uB54C\uB9CC \uC2E0\uD638"}),e(iu,{on:t.
showHist,onChange:u=>l({showHist:u}),label:"\uC555\uB825 \uD788\uC2A4\uD1A0\uADF8\uB7A8 \uD45C\uC2DC"})]}),e(He,{s:t,set:l,journal:Z}),e(H,{className:"p-3",children:e(
iu,{on:t.notify,onChange:async u=>{u&&"Notification"in window&&Notification.permission!=="granted"&&await Notification.requestPermission(),l({notify:u})},label:"\
\uC54C\uB9BC",hint:"\uC2E0\uD638\xB7\uCCB4\uACB0\xB7\uC555\uB825\uBC18\uC804 (\uD648 \uD654\uBA74 \uC571\uC5D0\uC11C \uAD8C\uC7A5)"})}),n("div",{className:"text\
-[11px] text-muted px-1 pb-4 leading-5",children:["\uD398\uC774\uD37C(\uBAA8\uC758) \uD2B8\uB808\uC774\uB529 \uC804\uC6A9 \xB7 \uC2E4\uACC4\uC88C/API \uD0A4 \uC5C6\uC74C \xB7 Bitget \uACF5\uAC1C \uC2DC\uC138 \uC0AC\uC6A9. \uC218\uC218\uB8CC: Bitget USDT-M \uD14C\uC774\uCEE4 0.06% / \uBA54\uC774\uCEE4 0.02% (TP\uB3C4 \uD14C\uC774\uCEE4\uB85C \uBCF4\uC218 \uACC4\uC0B0). \
\uC2AC\uB9AC\uD53C\uC9C0 ",ou,"bp (\uC2DC\uC7A5\uAC00\xB7\uC190\uC808). \uD380\uB529\uBE44: 00/08/16\uC2DC UTC \uC815\uC0B0 \uD380\uB529\uB960(Bitget \uACF5\uAC1C \uC774\uB825, \uC5C6\uC73C\uBA74 \uC815\uC0B0 \uC9C1\uC804 \uD380\uB529\uB960). \uAC15\uC81C\uCCAD\uC0B0 = \uACA9\uB9AC \uC99D\uAC70\uAE08 \uC804\uC561 \uC190\uC2E4. \uB3CC\uD30C TP 1:3\uC740 \uC218\uC218\uB8CC \uCC28\uAC10 \uC21C\uC190\uC775 \uAE30\uC900. \uC571\uC774 \uAEBC\uC838 \uC788\uB358 \uB3D9\uC548\uC740 \
\uB2E4\uC2DC \uC5F4 \uB54C 1\uBD84\uBD09\uC73C\uB85C \uC7AC\uC0DD (SL\xB7TP \uB3D9\uC2DC \uD130\uCE58 \uC2DC SL \uC6B0\uC120). \uC555\uB825: \uC2E4\uC2DC\uAC04 \uCCB4\uACB0(aggressor) \uC9D1\uACC4, \uC5F0\uACB0 \uC774\uC804 \uCE94\uB4E4\uC740 OHLCV \uADFC\uC0AC."]})]})]}),
e("nav",{className:"border-t border-line bg-panel pb-safe grid grid-cols-5",children:qe.map(u=>e("button",{onClick:()=>h(u),className:`h-14 text-[13px] relative\
 ${s===u?"text-accent font-semibold":"text-muted"}`,children:n("span",{className:"inline-flex items-center gap-1",children:[u,u==="\uD3EC\uC9C0\uC158"&&$.positions.
length>0&&e("span",{className:"min-w-4 h-4 px-1 rounded-full bg-accent text-bg text-[10px] leading-4 font-semibold",children:$.positions.length})]})},u))})]})}function _e({
box:s,manual:h,dp:t,tape:x,onUnlock:l,onEdit:o}){const[r,m]=L(!1),[v,S]=L(""),[N,c]=L("");return s?n("div",{className:"px-3 py-1.5 border-t border-line text-[12\
px]",children:[n("div",{className:"flex items-center justify-between gap-2",children:[n("div",{className:"num leading-5",children:[e("span",{className:"text-mut\
ed",children:"\uBC15\uC2A4 "}),e("span",{className:"text-down",children:B(s.bottom,t)})," \u2013 ",e("span",{className:"text-up",children:B(s.top,t)}),e("span",
{className:"text-muted",children:" \xB7 50% "}),B(s.mid,t)]}),n("div",{className:"flex gap-1.5 items-center",children:[e("span",{className:`px-1.5 py-0.5 rounde\
d text-[10px] ${s.isRange?"bg-up/20 text-up":"bg-warn/20 text-warn"}`,children:h?"\uC218\uB3D9\xB7\uACE0\uC815":s.isRange?"\uBC15\uC2A4\uAD8C":"\uCD94\uC138/\uC57D\uD568"}),
e("button",{className:"text-accent",onClick:()=>{S(String(Number(s.top))),c(String(Number(s.bottom))),m(y=>!y)},children:"\uC218\uC815"}),h&&e("button",{className:"\
text-muted",onClick:l,children:"\uC790\uB3D9"})]})]}),n("div",{className:"text-[10px] text-muted",children:["\uD130\uCE58 ",s.touchesTop,"/",s.touchesBottom," \xB7\
 \uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 ",x,"\uCE94\uB4E4 (\uADF8 \uC678 OHLCV \uADFC\uC0AC)"]}),r&&n("div",{className:"grid grid-cols-3 gap-2 mt-2 items-\
end",children:[e(F,{label:"\uC0C1\uB2E8(\uC800\uD56D)",value:v,onChange:S}),e(F,{label:"\uD558\uB2E8(\uC9C0\uC9C0)",value:N,onChange:c}),e(U,{tone:"accent",onClick:()=>{
const y=Number(v),A=Number(N);y>0&&A>0&&y!==A&&(o(y,A),m(!1))},children:"\uACE0\uC815"})]})]}):e("div",{className:"px-3 py-2 text-[12px] text-muted border-t bor\
der-line",children:"\uBC15\uC2A4 \uD0D0\uC9C0 \uC911\u2026 (\uD53C\uBD07 \uD130\uCE58 \uBD80\uC871)"})}function Ie({g:s,dp:h,acted:t,stale:x,onEnter:l,onEdit:o}){
if(!s)return e("div",{className:"mx-3 mb-2 px-3 py-2 rounded-lg bg-panel border border-line text-[12px] text-muted",children:"\uC2E0\uD638 \uB300\uAE30 \uC911 \xB7 \uBC15\uC2A4 \uC9C0\uC9C0/\uC800\uD56D + \uC7A5\uC545\uD615 + \uC555\uB825 \uD655\uC778 \uC2DC\
 \uD45C\uC2DC"});const r=s.side==="long";return n("div",{className:`mx-3 mb-2 rounded-xl border px-3 py-2 ${r?"border-up/60 bg-up/10":"border-down/60 bg-down/10"}`,
children:[n("div",{className:"flex justify-between items-center",children:[n("div",{className:`font-semibold ${r?"text-up":"text-down"}`,children:[cu[s.type]," ",
n("span",{className:"text-muted text-[11px] font-normal",children:[Cu(s.ts)," \uB9C8\uAC10"]})]}),n("div",{className:"text-[11px] text-muted flex items-center g\
ap-1.5",children:[s.pressure.source==="ohlcv"&&e("span",{className:"px-1.5 py-0.5 rounded bg-warn/20 text-warn text-[10px]",children:"\uC555\uB825 \uADFC\uC0AC(OHLCV)"}),
n("span",{children:["\uB9E4\uC218\uC555\uB825 ",Math.round(s.pressure.ratio*100),"%"]})]})]}),n("div",{className:"grid grid-cols-4 gap-1 text-[11px] num mt-1",children:[
n("div",{children:[e("div",{className:"text-muted",children:"\uC9C4\uC785"}),B(s.entry,h)]}),n("div",{children:[e("div",{className:"text-muted",children:"SL"}),
e("span",{className:"text-warn",children:B(s.sl,h)})]}),s.targets.map(m=>n("div",{children:[n("div",{className:"text-muted",children:[m.label," ",m.sizePct,"%"]}),
e("span",{className:"text-up",children:B(m.price,h)})]},m.label))]}),n("div",{className:"flex gap-2 mt-2",children:[e(U,{tone:r?"up":"down",className:"flex-1 h-\
10 text-[13px]",disabled:t||!!x,onClick:l,children:t?"\uC9C4\uC785 \uC644\uB8CC/\uCC98\uB9AC\uB428":x??`\uD0ED\uD558\uC5EC \uBAA8\uC758 ${r?"\uB871":"\uC20F"} \uC9C4\
\uC785`}),e(U,{className:"h-10",onClick:o,children:"\uC218\uC815"})]})]})}function Ke(s){const[h,t]=L("market"),[x,l]=L(""),[o,r]=L(""),m=s.draft??s.defaultDraft(
"long");J(()=>{!s.draft&&s.last&&s.setDraft(s.defaultDraft("long"))},[s.last>0]);const v=h==="limit"&&Number(x)>0?Number(x):s.last,S=Number(m.sl);let N=null;try{
N=v>0&&S>0&&S!==v?s.sizeFor(v,S):null}catch{N=null}const c=Math.max(0,Math.round(-Math.log10(s.qtyStep))),y=o?Ee(Number(o)||0,s.qtyStep):Number((N==null?void 0:
N.qty)??0),A=m.side==="long",R=Number(m.tp1),G=Number(m.tp2),P=A?S<v:S>v,D=R>0&&(A?R>v:R<v)&&(m.kind==="breakout"||!m.tp2||(A?G>R:G<R)),O=y*v,g=O>=tu,f=O/s.s.leverage,
V=h==="limit"?Le:j,ru=h==="limit"?0:Gu,du=Math.abs(v-S)*y+v*y*(V+ru)+S*y*(j+Gu),au=P&&D&&g&&f+v*y*V<=s.available+1e-9,Bu=N!=null&&N.belowMin&&!o?`\uB9AC\uC2A4\uD06C ${s.
s.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${tu} USDT / ${s.qtyStep}) \uBBF8\uB9CC`:P?D?g?"\uAC00\uC6A9 \uC99D\uAC70\uAE08 \uBD80\uC871":
`\uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561 ${tu} USDT \uC774\uC0C1 \uD544\uC694`:`TP\uAC00 \uC9C4\uC785\uAC00 ${A?"\uC704":"\uC544\uB798"}(TP2\uB294 TP1 \uB108\uBA38)\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`:
`SL\uC774 \uC9C4\uC785\uAC00 ${A?"\uC544\uB798":"\uC704"}\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`,_=E=>s.setDraft({...m,...E});return n("div",{className:"f\
lex-1 overflow-y-auto px-3 pt-3",children:[n("div",{className:"grid grid-cols-[minmax(0,1fr)_124px] gap-2.5",children:[n("div",{className:"space-y-2.5",children:[
e("div",{className:"grid grid-cols-2 gap-1 bg-panel2 rounded-lg p-1",children:["long","short"].map(E=>e("button",{onClick:()=>{r(""),s.setDraft(m.signal&&m.side===
E?m:s.defaultDraft(E))},className:`h-9 rounded-md font-semibold text-sm ${m.side===E?E==="long"?"bg-up text-white":"bg-down text-white":"text-muted"}`,children:E===
"long"?"\uB871":"\uC20F"},E))}),e(Nu,{items:["market","limit"],value:h,onChange:E=>t(E),fmt:E=>E==="market"?"\uC2DC\uC7A5\uAC00":"\uC9C0\uC815\uAC00"}),h==="lim\
it"&&e(F,{label:"\uC9C0\uC815\uAC00",value:x,onChange:l}),n("div",{children:[e("span",{className:"text-[11px] text-muted",children:"\uB808\uBC84\uB9AC\uC9C0"}),
e(Nu,{items:[3,5,10,20],value:s.s.leverage,onChange:E=>s.set({leverage:E}),fmt:E=>`${E}x`})]}),e(F,{label:"\uB9AC\uC2A4\uD06C (\uC790\uC0B0 \uB300\uBE44)",value:String(
s.s.riskPct),onChange:E=>{r(""),s.set({riskPct:Math.max(.1,Number(E)||1)})},suffix:"%"}),e(F,{label:"\uC190\uC808 SL",value:String(m.sl),onChange:E=>_({sl:E})}),
e(F,{label:m.kind==="breakout"?"TP (\uC21C 1:3, 100%)":"TP1 \uC911\uC559\uC120 (50%)",value:String(m.tp1),onChange:E=>_({tp1:E})}),m.kind==="range"&&e(F,{label:"\
TP2 \uBC18\uB300\uD3B8 \uACBD\uACC4 (50%)",value:String(m.tp2),onChange:E=>_({tp2:E})}),e(F,{label:`\uC218\uB7C9 (\uB9AC\uC2A4\uD06C ${s.s.riskPct}%: ${N?B(N.qty,
c):"\u2014"})`,value:o||(N?Number(N.qty).toFixed(c):""),onChange:r})]}),e("div",{className:"bg-panel rounded-xl border border-line py-2",children:e(de,{book:s.book,
dp:s.dp,qdp:c,rows:7})})]}),m.signal&&n("div",{className:"mt-2 text-[11px] text-accent",children:["\uC2E0\uD638 \uC790\uB3D9 \uC785\uB825: ",cu[m.signal.type],"\
 (",Cu(m.signal.ts)," \uB9C8\uAC10) \xB7 SL/TP \uC790\uB3D9"]}),n(H,{className:"p-3 mt-3",children:[e(M,{k:"\uC9C4\uC785 \uAE30\uC900\uAC00",v:B(v,s.dp)}),e(M,{
k:"\uC99D\uAC70\uAE08 / \uBA85\uBAA9",v:y>0?`${B(f)} / ${B(O)} USDT`:"\u2014"}),e(M,{k:"SL \uC2DC \uC21C\uC190\uC2E4 (\uC218\uC218\uB8CC\xB7\uC2AC\uB9AC\uD53C\uC9C0)",
v:y>0&&P?n("span",{className:"text-down",children:["-",B(du)," USDT (",(du/Math.max(s.equity,1e-9)*100).toFixed(2),"%)"]}):"\u2014"}),y>0&&D&&e(M,{k:m.kind==="b\
reakout"||!m.tp2?"TP \uC2DC \uC21C\uC774\uC775":"TP1+TP2 \uC2DC \uC21C\uC774\uC775",v:n("span",{className:"text-up",children:["+",B((m.kind==="breakout"||!m.tp2?
Math.abs(R-v)*y-R*y*j:Math.abs(R-v)*y*.5+Math.abs(G-v)*y*.5-(R+G)*y*.5*j)-v*y*(V+ru))," USDT"]})}),e(M,{k:"\uAC00\uC6A9 / \uC790\uC0B0",v:`${B(s.available)} / ${B(
s.equity)} USDT`})]}),n("div",{className:"sticky bottom-0 -mx-3 px-3 pt-2 pb-3 mt-1 bg-bg/95 backdrop-blur border-t border-line",children:[!au&&(y>0||(N==null?void 0:
N.belowMin))&&e("div",{className:"text-[11px] text-down mb-1",children:Bu}),e(U,{tone:m.side==="long"?"up":"down",className:"w-full h-12 text-[16px]",disabled:!au||
!(y>0),onClick:()=>{s.onSubmit(m,h,v,y),r("")},children:m.side==="long"?"\uB871 (\uB9E4\uC218) \uBAA8\uC758 \uC9C4\uC785":"\uC20F (\uB9E4\uB3C4) \uBAA8\uC758 \uC9C4\uC785"})]})]})}
function He({s,set:h,journal:t}){const x=Ne({url:s.sheetsUrl,token:s.sheetsToken}),l=t.status,o=s.sheetsUrl.trim()!==""&&!/^https:\/\/\S+$/.test(s.sheetsUrl.trim());
return n(H,{className:"p-3 space-y-2",children:[e("div",{className:"text-sm font-semibold",children:"\uAD6C\uAE00 \uC2DC\uD2B8 \uC5F0\uB3D9 (\uC120\uD0DD)"}),e(
Hu,{label:"\uC6F9\uD6C5 URL",value:s.sheetsUrl,onChange:r=>h({sheetsUrl:r.trim()}),placeholder:"https://script.google.com/macros/s/\u2026/exec"}),e(Hu,{label:"\uD1A0\
\uD070",value:s.sheetsToken,onChange:r=>h({sheetsToken:r.trim()}),type:"password",placeholder:"Apps Script SHARED_TOKEN"}),o&&e("div",{className:"text-[11px] te\
xt-down",children:"https:// \uB85C \uC2DC\uC791\uD558\uB294 URL\uB9CC \uC0AC\uC6A9\uD569\uB2C8\uB2E4"}),e("div",{className:"text-[11px] text-muted leading-5","d\
ata-testid":"sheets-status",children:x?l.at===void 0?`\uB300\uAE30 ${l.pending}\uD589 \xB7 \uC544\uC9C1 \uC804\uC1A1 \uC5C6\uC74C`:l.ok?`\uB9C8\uC9C0\uB9C9 \uB3D9\uAE30\uD654 ${Cu(
l.at)} \uC131\uACF5 \xB7 ${l.tab} ${l.appended??0}\uD589 \uCD94\uAC00 \xB7 \uB300\uAE30 ${l.pending}\uD589`:`\uB9C8\uC9C0\uB9C9 \uB3D9\uAE30\uD654 ${Cu(l.at)} \uC2E4\
\uD328 (${l.error}) \xB7 ${l.nextAt?`${We(l.nextAt)} \uC7AC\uC2DC\uB3C4`:"\uC7AC\uC2DC\uB3C4 \uB300\uAE30"} \xB7 \uB300\uAE30 ${l.pending}\uD589`:"\uAEBC\uC9D0 \u2013 URL\uACFC \uD1A0\uD070\uC744\
 \uBAA8\uB450 \uC785\uB825\uD558\uBA74 \uCE94\uB4E4 \uB9C8\uAC10\uB9C8\uB2E4 \uC804\uC1A1\uD569\uB2C8\uB2E4 (\uAE30\uB85D\uC740 \uAE30\uAE30\uC5D0\uB9CC \uC800\uC7A5)"}),
n("div",{className:"grid grid-cols-2 gap-2",children:[e(U,{className:"h-9",disabled:!x||!l.pending,onClick:()=>{t.sync.flush(!0)},children:"\uC9C0\uAE08 \uC804\uC1A1"}),
e(U,{className:"h-9",disabled:!l.pending,onClick:()=>{confirm(`\uB300\uAE30 \uC911\uC778 ${l.pending}\uD589\uC744 \uBC84\uB9B4\uAE4C\uC694? (\uAE30\uAE30 \uAE30\uB85D\uC740 \uC720\uC9C0)`)&&
t.sync.clear()},children:"\uB300\uAE30\uC5F4 \uBE44\uC6B0\uAE30"})]}),e("div",{className:"text-[10px] text-muted leading-4",children:"\uBAA8\uC758 \uAC70\uB798\xB7\uD14C\uC774\uD504 \uC555\uB825\xB7\uC2E0\uD638\uB9CC \uC804\uC1A1 (\uAC70\uB798\uC18C \uD0A4\
 \uC5C6\uC74C). \uD1A0\uD070\uC740 \uC774 \uAE30\uAE30\uC5D0\uB9CC \uC800\uC7A5\uB429\uB2C8\uB2E4."})]})}const We=s=>{const h=new Date(s);return[h.getHours(),h.
getMinutes(),h.getSeconds()].map(t=>String(t).padStart(2,"0")).join(":")};function Qu(s,h){var o;const t=`dupont-paper-${new Date().toISOString().slice(0,10)}.c\
sv`.slice(13,-4),x=`${h}-${t}.csv`,l=new File([s],x,{type:"text/csv"});if((o=navigator.canShare)!=null&&o.call(navigator,{files:[l]}))return navigator.share({files:[
l],title:x}).catch(()=>Yu(l,x));Yu(l,x)}function Yu(s,h){const t=document.createElement("a");t.href=URL.createObjectURL(s),t.download=h,t.click(),setTimeout(()=>URL.
revokeObjectURL(t.href),2e3)}function ze({broker:s,journal:h}){var R,G,P;const t=s.state,x=Re(t.fills,t.positions.map(D=>D.id)),l=t.equityCurve,o=360,r=120,m=l.
map(D=>D.equity),v=Math.min(...m,t.bankroll),S=Math.max(...m,t.bankroll),N=l.map((D,O)=>`${O?"L":"M"}${O/Math.max(1,l.length-1)*o},${r-(D.equity-v)/Math.max(1e-9,
S-v)*(r-10)-5}`).join(" "),[c,y]=L(null);J(()=>{Promise.all([h.store.count("tape_pressure"),h.store.count("signals")]).then(([D,O])=>y({tape:D,sig:O})).catch(()=>y(
{tape:0,sig:0}))},[h.store]);const A=async D=>{if(D==="trades")return Qu(zu("trades",we(t.fills,h.meta)),"dupont-trades");const O=D==="tape_pressure"?await h.store.
all("tape_pressure"):await h.store.all("signals");Qu(zu(D,O),D==="tape_pressure"?"dupont-tape-pressure":"dupont-signals")};return n("div",{className:"flex-1 ove\
rflow-y-auto p-3 space-y-3",children:[n(H,{className:"p-3",children:[n("div",{className:"grid grid-cols-3 text-center",children:[n("div",{children:[e("div",{className:"\
text-[11px] text-muted",children:"\uAC70\uB798"}),e("div",{className:"num font-semibold",children:x.trades})]}),n("div",{children:[e("div",{className:"text-[11p\
x] text-muted",children:"\uC2B9\uB960"}),e("div",{className:"num font-semibold",children:x.trades?`${(x.winRate*100).toFixed(0)}%`:"\u2014"})]}),n("div",{children:[
e("div",{className:"text-[11px] text-muted",children:"\uC21C\uC190\uC775"}),e("div",{className:`num font-semibold ${x.net>=0?"text-up":"text-down"}`,children:q(
x.net)})]})]}),n("div",{className:"text-[11px] text-muted text-center mt-1",children:["\uC218\uC218\uB8CC \uD569\uACC4 ",B(x.fees,3)," USDT (\uC21C\uC190\uC775\uC5D0 \uBC18\uC601)",
x.funding!==0?` \xB7 \uD380\uB529 ${q(-x.funding,3)}`:"",x.partialNet!==0?` \xB7 \uBCF4\uC720 \uC911 \uBD80\uBD84\uCCAD\uC0B0 ${q(x.partialNet)} \uD3EC\uD568`:""]}),
x.rTrades>0&&n("div",{className:"text-[11px] text-muted text-center num",children:["\uAE30\uB300\uAC12 ",n("span",{className:x.expectancyR>=0?"text-up":"text-do\
wn",children:[q(x.expectancyR),"R"]})," \xB7 \uD3C9\uADE0 \uC2B9 ",q(x.avgWinR),"R / \uD328 ",q(x.avgLossR),"R (",x.rTrades,"\uAC74)"]})]}),n(H,{className:"p-3",
children:[n("div",{className:"flex justify-between text-[12px] text-muted mb-1 num",children:[e("span",{children:"\uC790\uC0B0 \uACE1\uC120"}),n("span",{children:[
B(((R=l[0])==null?void 0:R.equity)??t.bankroll)," \u2192 ",e("span",{className:(((G=l[l.length-1])==null?void 0:G.equity)??t.bankroll)>=t.bankroll?"text-up":"te\
xt-down",children:B(((P=l[l.length-1])==null?void 0:P.equity)??t.bankroll)})," USDT"]})]}),n("svg",{viewBox:`0 0 ${o} ${r}`,className:"w-full h-[120px]",children:[
e("line",{x1:"0",x2:o,y1:r-(t.bankroll-v)/Math.max(1e-9,S-v)*(r-10)-5,y2:r-(t.bankroll-v)/Math.max(1e-9,S-v)*(r-10)-5,stroke:"#262e38",strokeDasharray:"4 4"}),e(
"path",{d:N,fill:"none",stroke:"#00c2cb",strokeWidth:"2"})]}),t.positions.length>0&&e("div",{className:"text-[11px] text-muted mt-1",children:"\uC9C0\uAC11 \uAE30\uC900 \xB7 \uBCF4\uC720 \uD3EC\uC9C0\uC158\uC758 \uC9C4\
\uC785 \uC218\uC218\uB8CC\uB294 \uC774\uBBF8 \uCC28\uAC10\uB428 (\uBBF8\uC2E4\uD604 \uC190\uC775 \uC81C\uC678)"})]}),n(H,{className:"p-3",children:[e("div",{className:"\
text-sm font-semibold mb-2",children:"CSV \uB0B4\uBCF4\uB0B4\uAE30"}),n("div",{className:"grid grid-cols-3 gap-2",children:[e(U,{className:"h-10 px-2 text-[12px\
]",onClick:()=>A("trades"),disabled:!t.fills.some(D=>D.final),children:"\uAC70\uB798"}),e(U,{className:"h-10 px-2 text-[12px]",onClick:()=>A("tape_pressure"),disabled:!(c!=
null&&c.tape),children:"\uD14C\uC774\uD504 \uC555\uB825"}),e(U,{className:"h-10 px-2 text-[12px]",onClick:()=>A("signals"),disabled:!(c!=null&&c.sig),children:"\
\uC2E0\uD638"})]}),n("div",{className:"text-[10px] text-muted mt-1 num",children:["\uAE30\uAE30 \uAE30\uB85D: \uD14C\uC774\uD504 \uC555\uB825 ",(c==null?void 0:
c.tape)??"\u2026","\uCE94\uB4E4 \xB7 \uC2E0\uD638 ",(c==null?void 0:c.sig)??"\u2026","\uAC74 (\uCD5C\uB300 5\uB9CC/2\uB9CC, \uC624\uB798\uB41C \uAC83\uBD80\uD130 \uC0AD\uC81C)"]})]}),
[...t.fills].reverse().map(D=>n(H,{className:"p-3",children:[n("div",{className:"flex justify-between text-[13px]",children:[n("span",{children:[e("span",{className:D.
side==="long"?"text-up":"text-down",children:D.side==="long"?"\uB871":"\uC20F"})," ",D.symbol," \xB7 ",Ju(D.setup)]}),n("span",{className:`num font-semibold ${D.
netPnl>=0?"text-up":"text-down"}`,children:[q(D.netPnl)," USDT"]})]}),n("div",{className:"text-[11px] text-muted num mt-0.5",children:[Cu(D.closedAt)," \xB7 ",D.
reason," \xB7 ",B(D.qty,K(D.symbol).qdp)," \xB7 ",B(D.entry,K(D.symbol).dp)," \u2192 ",B(D.exit,K(D.symbol).dp)," \xB7 \uC218\uC218\uB8CC ",B(D.fees,3),D.funding?
` \xB7 \uD380\uB529 ${q(-D.funding,3)}`:"",D.r!==void 0?` \xB7 ${q(D.r)}R`:""]})]},D.id)),!t.fills.length&&e("div",{className:"text-muted text-sm text-center py\
-6",children:"\uAC70\uB798 \uAE30\uB85D \uC5C6\uC74C"})]})}re.createRoot(document.getElementById("root")).render(e(Oe,{}));if("serviceWorker"in navigator){const s="\
/dupont-mobile/";window.addEventListener("load",()=>navigator.serviceWorker.register(`${s}sw.js`,{scope:s}).catch(()=>{}))}
