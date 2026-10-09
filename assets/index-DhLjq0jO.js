import{jsxs as s,jsx as e,Fragment as Ju}from"react/jsx-runtime";import Xu from"react-dom/client";import{useState as q,useEffect as X,useRef as Cu,useCallback as Lu,
useMemo as Uu}from"react";import{e as Zu,f as ue,c as Ou,s as ee,n as te}from"./strategy-Cu9CvPGE.js";import{C as vu,a as Ce,B as z,b as W,R as F,N as w,T as ru,
O as ne}from"./ui-DFqqM4gE.js";import{l as se,s as I,u as re,a as mu,b as ie,R as ae,c as le,d as Q,f as c,S as oe,p as ce,T as de,e as R,r as Be,g as _u,m as au,
M as eu,D as me,h as pe,i as De}from"./market-Ukw8IquR.js";import{P as he,n as Ae,u as Iu,T as j,D as xe,S as iu,t as be,r as fe,s as ge,a as ve,M as ye,b as Ku,
f as Ne}from"./paper-DgRiG6e_.js";import"decimal.js";import"lightweight-charts";(function(){const D=document.createElement("link").relList;if(D&&D.supports&&D.supports(
"modulepreload"))return;for(const B of document.querySelectorAll('link[rel="modulepreload"]'))E(B);new MutationObserver(B=>{for(const l of B)if(l.type==="childL\
ist")for(const a of l.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&E(a)}).observe(document,{childList:!0,subtree:!0});function t(B){const l={};return B.
integrity&&(l.integrity=B.integrity),B.referrerPolicy&&(l.referrerPolicy=B.referrerPolicy),B.crossOrigin==="use-credentials"?l.credentials="include":B.crossOrigin===
"anonymous"?l.credentials="omit":l.credentials="same-origin",l}function E(B){if(B.ep)return;B.ep=!0;const l=t(B);fetch(B.href,l)}})();const Ee=["\uCC28\uD2B8","\
\uAC70\uB798","\uD3EC\uC9C0\uC158","\uAE30\uB85D","\uC124\uC815"],lu={RANGE_LONG:"\uBC15\uC2A4 \uBC18\uC804 \uB871",RANGE_SHORT:"\uBC15\uC2A4 \uBC18\uC804 \uC20F",
FAKE_BREAKOUT_LONG:"\uAC00\uC9DC \uC774\uD0C8 \uB871",FAKE_BREAKOUT_SHORT:"\uAC00\uC9DC \uB3CC\uD30C \uC20F",BREAKOUT_LONG:"\uC9C4\uC9DC \uB3CC\uD30C \uB871",BREAKOUT_SHORT:"\
\uC9C4\uC9DC \uC774\uD0C8 \uC20F"},Hu=r=>r==="MANUAL"?"\uC218\uB3D9":lu[r]??r,gu="dupont.broker.v1",Wu="dupont.settings.v1",pu="dupont.seen.v1";function ke(r,D){
const t=r.level?c(r.level,D):"";return r.add?`\uB3CC\uD30C \uB808\uBCA8 ${t} \uB9AC\uD14C\uC2A4\uD2B8 \uD655\uC778 \u2013 \uCD94\uAC00 \uC9C4\uC785 \uAC00\uB2A5`:
r.reason.startsWith("max adds")?"\uCD5C\uB300 \uCD94\uAC00 \uD69F\uC218 \uB3C4\uB2EC":r.reason.startsWith("no retest")?`\uB3CC\uD30C \uB808\uBCA8 ${t} \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:
r.reason.startsWith("retest without")?"\uB9AC\uD14C\uC2A4\uD2B8 \uC911 \u2013 \uC7A5\uC545\uD615/\uC555\uB825 \uD655\uC778 \uB300\uAE30":r.reason.startsWith("no\
 broken")?"\uB3CC\uD30C \uB808\uBCA8 \uC815\uBCF4 \uC5C6\uC74C":r.reason.startsWith("pyramiding only")?"\uB3CC\uD30C \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9":
r.reason.startsWith("retest must be")?"\uC9C4\uC785/\uC9C1\uC804 \uCD94\uAC00 \uC774\uD6C4\uC758 \uC0C8 \uCE94\uB4E4\uC5D0\uC11C \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30":
r.reason.startsWith("no move away")?`\uB3CC\uD30C \uB808\uBCA8 ${t}\uC5D0\uC11C 0.5R \uC774\uC0C1 \uC774\uD0C8 \uD6C4 \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:"\uB370\uC774\
\uD130 \uBD80\uC871"}function we(){var Fu,Mu,Pu,Ru;const[r,D]=q("\uCC28\uD2B8"),[t,E]=q(()=>se(Wu,me)),B=u=>E(C=>{const i={...C,...u};return Q(Wu,i),i}),l=I(t.symbol),
a=re(t.symbol,t.tf),[d,v]=q(()=>mu(`dupont.box.${t.symbol}`));X(()=>v(mu(`dupont.box.${t.symbol}`)),[t.symbol]);const[M,N]=q(!1),m=ie(a.candles,a.intervalMs,a.tape,
a.tapeVer,a.serverNow,t,d,l.dp),f=(10**-l.dp).toFixed(l.dp),h=Cu(null);h.current||(h.current=new he(mu(gu)??void 0)),h.current.moveSlToBe=t.moveSlToBe,h.current.
precision=u=>{const C=I(u);return{dp:C.dp,qdp:C.qdp}};const[p,L]=q(0),S=()=>{Q(gu,h.current.state),L(u=>u+1)},[K,G]=q([]),g=Lu((u,C="info")=>{const i=Date.now()+
Math.random();if(G(n=>[...n.slice(-1),{id:i,text:u,tone:C}]),setTimeout(()=>G(n=>n.filter(o=>o.id!==i)),4e3),t.notify&&"Notification"in window&&Notification.permission===
"granted"&&document.visibilityState!=="visible")try{new Notification("\uB4C0\uD401 \uC2A4\uD0E0\uB2E4\uB4DC",{body:u,icon:"/dupont-mobile/icons/icon.svg"})}catch{}},
[t.notify]),b=((Fu=a.ticker)==null?void 0:Fu.last)??((Mu=a.candles[a.candles.length-1])==null?void 0:Mu.close)??0,[Y,nu]=q({});X(()=>{b&&nu(u=>({...u,[t.symbol]:b}))},
[b,t.symbol]);const ou=18e4,su=Cu({}),cu=async(u,C=!1)=>{const i=Date.now();if(!C&&i-(su.current[u]??0)<3e4)return;su.current[u]=i;const n=await De(u).catch(()=>null);
n!=null&&n.length&&(h.current.setSettledRates(u,n),Q(gu,h.current.state))},O=Cu(new ae),y=Cu(!1),yu=(u,C,i,n)=>{const o=O.current.tick(h.current.state,u,a.serverNow());
if(o==="replaying")return[];if(o==="gap")return Du(),[];const A=a.serverNow(),x=h.current.onPrice(u,C,A,i);return h.current.needsSettledRate(u,A)&&cu(u),x.push(
...h.current.accrueFunding(u,i||C,A,ou)),n!==void 0&&h.current.noteTickerRate(u,n,A),x},Du=async()=>{var i;const u=h.current,C=O.current.begin(u.state,a.serverNow());
C.length&&await a.syncClock();for(const n of C)try{if(await cu(n,!0),!a.clockSynced())throw new Error("server clock unknown");const o=a.serverNow(),A=Math.floor(
Be(u.state,n)/6e4)*6e4,{bars:x,clampedFrom:P}=await _u(n,A,o),H=a.serverNow();if(Math.floor(H/6e4)>Math.floor(o/6e4)){const _=await _u(n,Math.floor(o/6e4)*6e4,H),
qu=new Map(x.map(uu=>[uu.ts,uu]));for(const uu of _.bars)qu.set(uu.ts,uu);x.splice(0,x.length,...[...qu.values()].sort((uu,Yu)=>uu.ts-Yu.ts))}const k=u.replayBars(
n,x.filter(_=>_.ts>=A),a.serverNow()),U=k.filter(_=>_.kind==="funding");(U.length>2?k.filter(_=>_.kind!=="funding"):k).forEach(_=>g(`[\uC7AC\uC0DD] ${n} ${_.message}`,
_.kind==="sl"||_.kind==="liq"?"down":_.kind==="funding"?"info":"up")),U.length>2&&g(`[\uC7AC\uC0DD] ${n} \uD380\uB529\uBE44 ${U.length}\uD68C \uBC18\uC601 (\uB9C8\uC9C0\uB9C9: ${U[U.
length-1].message})`,"info"),P>A&&g(`[\uC7AC\uC0DD] ${n} ${au(A)}~${au(P)} \uAD6C\uAC04\uC740 1\uBD84\uBD09 \uC81C\uACF5 \uBC94\uC704(30\uC77C) \uBC16 \u2013 \uC7AC\uC0DD \uC0DD\uB7B5`,
"warn");const Z=(i=u.state).lastTickTs??(i.lastTickTs={});Z[n]=Math.max(Z[n]??0,a.serverNow()),O.current.succeeded(n),S()}catch{const o=!a.clockSynced();O.current.
failed(n,a.serverNow(),!o)?g(`[\uC7AC\uC0DD] ${n} 1\uBD84\uBD09 \uC870\uD68C 3\uD68C \uC2E4\uD328 \u2013 \uD604\uC7AC\uAC00\uB85C \uACC4\uC18D (\uC624\uD504\uB77C\uC778 \uAD6C\uAC04 \uBBF8\uBC18\uC601)`,
"down"):o&&!y.current&&(y.current=!0,g("[\uC7AC\uC0DD] \uC11C\uBC84 \uC2DC\uAC04 \uD655\uC778 \uC2E4\uD328 \u2013 \uC7AC\uC2DC\uB3C4 \uC911 (\uC624\uD504\uB77C\uC778 \uAD6C\uAC04 \uBC18\uC601 \uB300\uAE30)",
"warn"))}finally{O.current.release(n)}};X(()=>{Du();const u=()=>{document.visibilityState==="visible"&&Du()};return document.addEventListener("visibilitychange",
u),()=>document.removeEventListener("visibilitychange",u)},[]),X(()=>{var C,i;if(!b||O.current.replaying.has(t.symbol))return;const u=yu(t.symbol,b,(C=a.ticker)==
null?void 0:C.mark,(i=a.ticker)==null?void 0:i.funding);u.length&&(u.forEach(n=>g(n.message,n.kind==="sl"||n.kind==="liq"?"down":n.kind==="funding"?"info":"up")),
S())},[b]),X(()=>{const u=setInterval(async()=>{const C=new Set([...h.current.state.positions.map(i=>i.symbol),...h.current.state.pending.map(i=>i.symbol)]);C.delete(
t.symbol);for(const i of C){if(O.current.replaying.has(i))continue;const n=await le(i).catch(()=>null);if(!n)continue;nu(A=>({...A,[i]:n.last}));const o=yu(i,n.
last,n.mark,n.funding);o.length&&(o.forEach(A=>g(`${i} ${A.message}`)),S())}},4e3);return()=>clearInterval(u)},[t.symbol]);const $=h.current.state,Nu=h.current.
equity(Y),hu=h.current.available(),Au=$.positions.filter(u=>u.symbol===t.symbol),J=Cu(new Set(mu(pu)??[])),tu=u=>`${t.symbol}:${t.tf}:${u.type}:${u.ts}`,T=m.live[m.
live.length-1]??null,xu=((Pu=m.closed[m.closed.length-1])==null?void 0:Pu.ts)??0,Eu=u=>u.ts<xu?"\uC2E0\uD638 \uB9CC\uB8CC (\uCD5C\uADFC \uB9C8\uAC10 \uCE94\uB4E4 \uC544\uB2D8)":
Math.abs(b-Number(u.entry))>.3*Number(u.risk)?"\uAC00\uACA9 \uC774\uD0C8 (\uC2E0\uD638 \uC9C4\uC785\uAC00 \xB10.3R \uCD08\uACFC)":null,du=u=>{var i,n;const C=u===
"long"?(i=a.ticker)==null?void 0:i.ask:(n=a.ticker)==null?void 0:n.bid;return C&&b&&Math.abs(C-b)/b<.005?C:b},V=Uu(()=>{var i;const u=((i=m.closed[m.closed.length-
3])==null?void 0:i.ts)??0,C=[...m.history].reverse().find(n=>n.ts>=u);return T??C??null},[T,m.history,m.closed]),bu=()=>$.wallet*t.riskPct/100,ku=(u,C)=>ee({equity:String(
$.wallet),available:String(hu),riskPct:t.riskPct,entry:String(u),sl:String(C),leverage:t.leverage,feeRate:String(j),slippageBps:iu,qtyStep:String(l.qtyStep),minQty:String(
l.qtyStep),minNotional:eu}),wu=(u,C=!1)=>{if($.positions.some(Z=>Z.symbol===t.symbol)){g("\uC774\uBBF8 \uD3EC\uC9C0\uC158 \uBCF4\uC720 \uC911","down");return}const i=b,
n=Eu(u);if(n){g(`${n} \u2013 \uC9C4\uC785 \uBD88\uAC00`,"down");return}const o=Ou({side:u.side,kind:u.kind,entry:String(i),extremeWick:u.sl,box:u.box,slBufferPct:0,
tickSize:f,feeRate:j,slippageBps:iu});if(u.kind==="range"&&te({side:u.side,entry:o.entry,sl:o.sl,tp:o.targets[0].price,feeRate:j,slippageBps:iu})<1){g("\uD604\uC7AC\uAC00 \uAE30\uC900 T\
P1 \uC21C\uC190\uC775\uBE44 1 \uBBF8\uB9CC \u2013 \uC9C4\uC785 \uC0DD\uB7B5","down");return}const A=Number(o.sl),x=be(o.targets),P=u.side==="long";if(P?!(A<i&&x[0].
price>i):!(A>i&&x[0].price<i)){g("\uD604\uC7AC\uAC00\uAC00 \uC2E0\uD638 \uBC94\uC704\uB97C \uBC97\uC5B4\uB098 \uC9C4\uC785 \uBD88\uAC00 (SL/TP1 \uC0AC\uC774 \uC544\uB2D8)",
"down");return}const H=ku(i,A),k=Number(H.qty);if(H.belowMin||!(k>0)){g(`\uB9AC\uC2A4\uD06C ${t.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${eu}\
 USDT / ${l.qtyStep}) \uBBF8\uB9CC`,"down");return}const U=h.current.open({symbol:t.symbol,side:u.side,qty:k,price:i,refPx:du(u.side),leverage:t.leverage,sl:A,targets:x,
setup:u.type,signalId:tu(u),breakoutLevel:u.kind==="breakout"?Number(P?u.box.top:u.box.bottom):void 0,riskBudget:bu()},a.serverNow());if(!U.ok){g(U.error??"\uC9C4\uC785 \uC2E4\
\uD328","down");return}J.current.add(tu(u)),Q(pu,[...J.current].slice(-300)),g(`${C?"[\uC790\uB3D9] ":""}${lu[u.type]} \uBAA8\uC758 \uC9C4\uC785 ${c(k,l.qdp)} @\
 ${c(U.fillPx??i,l.dp)}`,"up"),S()},ju=u=>{const C=$.fills.filter(o=>o.final&&o.symbol===t.symbol),i=C[C.length-1];if(i){const o=$.fills.filter(x=>x.positionId===
i.positionId).reduce((x,P)=>x+P.netPnl,0),A=Math.floor(i.closedAt/a.intervalMs)*a.intervalMs;if(o<0&&u.ts<=A+2*a.intervalMs)return"\uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30"}
const n=new Date(a.serverNow());return n.setHours(0,0,0,0),fe($.fills,n.getTime())<=-3?"\uC77C\uC77C \uC190\uC2E4 \uD55C\uB3C4 \u22123R \uB3C4\uB2EC":null};X(()=>{
if(!T)return;const u=tu(T);if(!J.current.has(`n:${u}`)&&(J.current.add(`n:${u}`),Q(pu,[...J.current].slice(-300)),g(`\uC2E0\uD638: ${lu[T.type]} \xB7 SL ${c(T.sl,
l.dp)} \xB7 ${T.targets.map(C=>`${C.label} ${c(C.price,l.dp)}`).join(" / ")}`,T.side==="long"?"up":"down"),t.autoPaper&&!Au.length)){const C=T.pressure.source!==
"trades"?"\uC555\uB825\uC774 OHLCV \uADFC\uC0AC":ju(T);C?g(`[\uC790\uB3D9] \uC9C4\uC785 \uC0DD\uB7B5 \u2013 ${C}`,"info"):wu(T,!0)}},[T==null?void 0:T.ts,T==null?
void 0:T.type]);const Bu=Uu(()=>Au.map(u=>{var o,A;const C=m.pressures.slice(0,m.closed.length),i=Zu({side:u.side,entry:u.entry,sl:u.sl,targets:u.targets.filter(
x=>!x.done).map(x=>({price:x.price}))},m.closed,C),n=u.setup.startsWith("BREAKOUT")?ue({side:u.side,entry:u.entry,sl:u.initialSl,targets:u.targets.map(x=>({price:x.
price})),type:u.setup,adds:u.adds,brokenLevel:u.breakoutLevel,openedTs:Math.floor(u.openedAt/a.intervalMs)*a.intervalMs,lastAddTs:u.lastAddTs,risk:Math.abs((u.initialEntry??
u.entry)-u.initialSl)},m.closed,C,m.box,{maxAdds:t.maxAdds,addSizePct:t.addSizePct,tickSize:f,atr:((o=m.signalBox)==null?void 0:o.atr)??((A=m.box)==null?void 0:
A.atr)}):null;return{p:u,flip:i,pyr:n}}),[p,m.closed,m.pressures,m.box,m.signalBox,t.maxAdds,t.addSizePct,t.symbol,a.intervalMs]),Su=Cu(new Set);X(()=>{for(const u of Bu){
const C=`${u.p.id}:${xu}`;u.flip.alert&&!Su.current.has(C)&&(Su.current.add(C),g(`\uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (${u.flip.multiple.
toFixed(1)}\uBC30)`,"warn"))}},[Bu]);const fu=(u,C,i)=>{if(O.current.replaying.has(u.symbol)){g("\uC624\uD504\uB77C\uC778 \uAD6C\uAC04 \uC7AC\uC0DD \uC911 \u2013 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uCCAD\uC0B0\uD558\uC138\uC694",
"warn");return}const n=h.current.closeFraction(u.id,C,Y[u.symbol]??b,i,a.serverNow());n&&g(`${i} ${c(n.qty,I(u.symbol).qdp)} @ ${c(n.exit,I(u.symbol).dp)} \xB7 \uC21C\uC190\uC775\
 ${R(n.netPnl)} USDT`,n.netPnl>=0?"up":"down"),S()},zu=(u,C)=>{const i=u.initialQty??u.origQty/(1+u.adds*(t.addSizePct/100)),n=u.riskBudget??$.wallet*t.riskPct/
100,o=ge(u,{last:du(u.side),suggestedSl:C.sl?Number(C.sl):void 0,budget:n,wantQty:i*(C.sizePct??t.addSizePct)/100,step:l.qtyStep});if(!(o.qty>0)){g("\uCD94\uAC00 \uC2DC \uCD1D \uB9AC\uC2A4\uD06C\uAC00\
 \uD55C\uB3C4 \uCD08\uACFC","down");return}if(o.qty*b<eu){g(`\uCD94\uAC00 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561(${eu} USDT) \uBBF8\uB9CC`,"d\
own");return}const A=h.current.open({symbol:u.symbol,side:u.side,qty:o.qty,price:b,refPx:du(u.side),leverage:u.leverage,sl:o.newSl,targets:[],setup:u.setup,isAdd:!0,
candleTs:xu},a.serverNow());if(!A.ok){g(A.error??"\uCD94\uAC00 \uC2E4\uD328","down");return}g(`\uBD88\uD0C0\uAE30 #${u.adds+1}: ${c(o.qty,l.qdp)} @ ${c(A.fillPx??
b,l.dp)} \xB7 SL ${c(o.newSl,l.dp)}`,"up"),S()},Gu=Lu(u=>{var A,x;const C=m.closed,i=C.length>=2?u==="long"?Math.min(C[C.length-1].low,C[C.length-2].low):Math.max(
C[C.length-1].high,C[C.length-2].high):b*(u==="long"?.995:1.005),n=m.box,o=n?b<Number(n.top)&&b>Number(n.bottom):!1;if(n){const P=o?"range":"breakout",H=u==="lo\
ng"?Math.min(i,b*.999):Math.max(i,b*1.001),k=Ou({side:u,kind:P,entry:String(b),extremeWick:String(H),box:n,atr:n.atr,tickSize:f,feeRate:j,slippageBps:iu}),U=Z=>Z?
Number(Z).toFixed(l.dp):"";return{side:u,kind:P,sl:U(k.sl),tp1:U((A=k.targets[0])==null?void 0:A.price),tp2:U((x=k.targets[1])==null?void 0:x.price)}}return{side:u,
kind:"breakout",...Ae(u,b,f,l.dp),tp2:""}},[m.closed,m.box,b,l.dp,f]),[Vu,$u]=q(null),Qu=u=>{var i,n;const C=o=>o?Number(o).toFixed(l.dp):"";$u({side:u.side,kind:u.
kind,sl:C(u.sl),tp1:C((i=u.targets[0])==null?void 0:i.price),tp2:C((n=u.targets[1])==null?void 0:n.price),signal:u}),D("\uAC70\uB798")},Tu=(((Ru=a.ticker)==null?
void 0:Ru.change24h)??0)>=0;return s("div",{className:"h-full flex flex-col pt-safe",children:[e("header",{className:"px-3 pt-2 pb-1.5 border-b border-line",children:s(
"div",{className:"flex items-end justify-between",children:[s("div",{children:[s("div",{className:"flex items-center gap-2",children:[e("select",{value:t.symbol,
onChange:u=>B({symbol:u.target.value}),className:"bg-transparent text-[15px] font-semibold outline-none",children:oe.map(u=>e("option",{value:u.symbol,className:"\
bg-panel",children:u.symbol},u.symbol))}),e("span",{className:"text-[10px] px-1.5 py-0.5 rounded bg-panel2 text-muted",children:"\uBB34\uAE30\uD55C \xB7 \uBAA8\uC758"}),
e("span",{className:`w-2 h-2 rounded-full ${a.status==="live"?"bg-up":"bg-warn"}`,title:a.status})]}),e("div",{className:`text-[26px] leading-8 font-semibold nu\
m ${Tu?"text-up":"text-down"}`,children:b?c(b,l.dp):"\u2014"})]}),s("div",{className:"text-right text-[11px] text-muted num leading-[18px]",children:[s("div",{children:[
"24h ",e("span",{className:Tu?"text-up":"text-down",children:a.ticker?ce(a.ticker.change24h):"\u2014"})]}),s("div",{children:["\uB9C8\uD06C ",a.ticker?c(a.ticker.
mark,l.dp):"\u2014"]}),s("div",{children:["\uD380\uB529 ",a.ticker?`${(a.ticker.funding*100).toFixed(4)}%`:"\u2014"]})]})]})}),K.length>0&&e("div",{className:"p\
x-3 py-1.5 space-y-1 border-b border-line bg-bg","aria-live":"polite",children:K.map(u=>e("div",{className:`text-[12px] leading-4 px-2.5 py-1.5 rounded-md ${u.tone===
"down"?"bg-down/20 text-down":u.tone==="up"?"bg-up/15 text-up":u.tone==="warn"?"bg-warn/20 text-warn":"bg-panel2 text-txt"}`,children:u.text},u.id))}),s("main",
{className:"flex-1 min-h-0 flex flex-col overflow-hidden",children:[r==="\uCC28\uD2B8"&&s(Ju,{children:[s("div",{className:"flex items-center justify-between px\
-3 py-1.5 gap-2",children:[e(vu,{items:de,value:t.tf,onChange:u=>B({tf:u})}),e("button",{onClick:()=>N(u=>!u),className:`h-8 px-3 rounded-full text-xs ${M?"bg-w\
arn text-bg font-semibold":"bg-panel2 text-muted"}`,children:M?"\uD3B8\uC9D1 \uC644\uB8CC":"\uBC15\uC2A4 \uD3B8\uC9D1"})]}),e("div",{className:"flex-1 min-h-0",
children:a.candles.length?e(Ce,{viewKey:`${t.symbol}:${t.tf}`,candles:a.candles,pressures:m.pressures,box:m.box,signals:m.history,positions:Au,dp:l.dp,showHist:t.
showHist,editBox:M,onBoxEdit:(u,C)=>{var n;const i={top:u,bottom:C,startTs:(d==null?void 0:d.startTs)??((n=m.box)==null?void 0:n.startTime)??a.serverNow(),locked:!0};
v(i),Q(`dupont.box.${t.symbol}`,i)}}):e("div",{className:"p-6 text-muted text-sm",children:a.err?`\uB370\uC774\uD130 \uC624\uB958: ${a.err}`:"\uCE94\uB4E4 \uBD88\uB7EC\uC624\uB294 \uC911\u2026"})}),
e(Se,{box:m.box,manual:d,dp:l.dp,tape:m.tapeCandles,onUnlock:()=>{v(null),Q(`dupont.box.${t.symbol}`,null),N(!1)},onEdit:(u,C)=>{var n;const i={top:u,bottom:C,startTs:(d==
null?void 0:d.startTs)??((n=m.box)==null?void 0:n.startTime)??a.serverNow(),locked:!0};v(i),Q(`dupont.box.${t.symbol}`,i)}}),Bu.filter(u=>u.flip.alert).map(u=>s(
"div",{className:"mx-3 mb-2 rounded-lg bg-warn/15 border border-warn px-3 py-2 flex items-center justify-between",children:[s("span",{className:"text-[13px] tex\
t-warn font-semibold",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",u.flip.multiple.toFixed(1),"\uBC30)"]}),e(z,{tone:"warn",className:"\
h-9",onClick:()=>fu(u.p,1,"\uC555\uB825\uBC18\uC804 \uCCAD\uC0B0"),children:"\uCCAD\uC0B0"})]},u.p.id)),e($e,{g:V,dp:l.dp,acted:V?J.current.has(tu(V)):!1,stale:V?
Eu(V):null,onEnter:()=>V&&wu(V),onEdit:()=>V&&Qu(V)})]}),r==="\uAC70\uB798"&&e(Te,{s:t,set:B,last:b,dp:l.dp,book:a.book,equity:Nu,available:hu,qtyStep:l.qtyStep,
draft:Vu,setDraft:$u,defaultDraft:Gu,sizeFor:ku,onSubmit:(u,C,i,n)=>{var H;const o=Number(u.sl),A=u.kind==="breakout"||!u.tp2?[{price:Number(u.tp1),fraction:1,label:u.
kind==="breakout"?"TP 1:3":"TP"}]:[{price:Number(u.tp1),fraction:.5,label:"TP1 \uC911\uC559\uC120"},{price:Number(u.tp2),fraction:.5,label:"TP2 \uBC18\uB300\uD3B8"}],
x=((H=u.signal)==null?void 0:H.type)??"MANUAL",P=u.kind==="breakout"&&m.box?Number(u.side==="long"?m.box.top:m.box.bottom):void 0;if(C==="limit"){if(u.side==="l\
ong"?i>=b:i<=b){g(`\uC9C0\uC815\uAC00\uAC00 \uD604\uC7AC\uAC00 ${u.side==="long"?"\uC774\uC0C1":"\uC774\uD558"} \u2013 \uC989\uC2DC \uCCB4\uACB0\uB418\uB294 \uC8FC\uBB38\uC740 \uC2DC\uC7A5\uAC00\uB85C \uB123\uC73C\uC138\uC694`,
"down");return}const k=h.current.placeLimit({symbol:t.symbol,side:u.side,qty:n,price:i,leverage:t.leverage,sl:o,targets:A,setup:x,breakoutLevel:P,riskBudget:bu()},
a.serverNow());g(k.ok?`\uC9C0\uC815\uAC00 ${u.side==="long"?"\uB871":"\uC20F"} \uC8FC\uBB38 ${c(n,l.qdp)} @ ${c(i,l.dp)}`:k.error??"\uC8FC\uBB38 \uC2E4\uD328",k.
ok?"up":"down")}else{const k=h.current.open({symbol:t.symbol,side:u.side,qty:n,price:b,refPx:du(u.side),leverage:t.leverage,sl:o,targets:A,setup:x,breakoutLevel:P,
signalId:u.signal?tu(u.signal):void 0,riskBudget:bu()},a.serverNow());g(k.ok?`${u.side==="long"?"\uB871":"\uC20F"} \uBAA8\uC758 \uC9C4\uC785 ${c(n,l.qdp)} @ ${c(
k.fillPx??b,l.dp)}`:k.error??"\uC9C4\uC785 \uC2E4\uD328",k.ok?"up":"down"),k.ok&&u.signal&&(J.current.add(tu(u.signal)),Q(pu,[...J.current].slice(-300)))}S()}},
t.symbol),r==="\uD3EC\uC9C0\uC158"&&s("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[s(W,{className:"p-3",children:[e(F,{k:"\uC790\uC0B0 (Equity)",
v:`${c(Nu)} USDT`}),e(F,{k:"\uAC00\uC6A9",v:`${c(hu)} USDT`}),e(F,{k:"\uBBF8\uC2E4\uD604 \uC190\uC775 (\uC21C, \uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC)",v:(()=>{const u=$.
positions.reduce((i,n)=>{const o=Y[n.symbol]??n.entry;return i+Iu(n,o)-n.entryFeeLeft-o*n.qty*j},0),C=Number(u.toFixed(2));return s("span",{className:C>0?"text-\
up":C<0?"text-down":"",children:[R(u)," USDT"]})})()})]}),!$.positions.length&&e("div",{className:"text-muted text-sm text-center py-8",children:"\uBCF4\uC720 \uD3EC\uC9C0\uC158 \uC5C6\uC74C"}),
$.positions.map(u=>{var A;const C=Bu.find(x=>x.p.id===u.id),i=Y[u.symbol]??u.entry,n=Iu(u,i)-u.entryFeeLeft-i*u.qty*j,o=I(u.symbol).dp;return s(W,{className:"p-\
3",children:[s("div",{className:"flex justify-between items-center mb-1",children:[s("div",{className:"font-semibold",children:[e("span",{className:u.side==="lo\
ng"?"text-up":"text-down",children:u.side==="long"?"\uB871":"\uC20F"})," ",u.symbol," ",s("span",{className:"text-muted text-xs",children:[u.leverage,"x \xB7 ",
Hu(u.setup)]})]}),s("div",{className:"text-right",children:[s("div",{className:`num font-semibold ${n>=0?"text-up":"text-down"}`,children:[R(n)," USDT"]}),e("di\
v",{className:"text-[10px] text-muted",children:"\uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC \uC21C\uC190\uC775"})]})]}),e(F,{k:"\uC218\uB7C9 / \uC9C4\uC785\uAC00",v:`${c(
u.qty,I(u.symbol).qdp)} / ${c(u.entry,o)}`}),e(F,{k:"\uB9C8\uD06C / \uCCAD\uC0B0\uAC00",v:`${c(i,o)} / ${c(u.liqPrice,o)}`}),e(F,{k:`SL${u.beMoved?" (\uBCF8\uC808)":
""}`,v:c(u.sl,o)}),u.targets.map((x,P)=>e(F,{k:x.label,v:s("span",{className:x.done?"text-up":"",children:[c(x.price,o)," \xB7 ",Math.round(x.fraction*100),"% ",
x.done?"\u2713 \uCCB4\uACB0":"\uB300\uAE30"]})},P)),e(F,{k:"\uACC4\uD68D \uB9AC\uC2A4\uD06C (1R)",v:u.riskUsd?`${c(u.riskUsd)} USDT`:"\u2014"}),u.riskBudget!==void 0&&
e(F,{k:"\uB9AC\uC2A4\uD06C \uC608\uC0B0 (\uC9C4\uC785 \uC2DC \uACE0\uC815)",v:`${c(u.riskBudget)} USDT`}),(u.fundingAcc??0)!==0&&e(F,{k:"\uD380\uB529\uBE44 \uB204\uC801 (\uBBF8\uC815\uC0B0)",
v:s("span",{className:(u.fundingAcc??0)>0?"text-down":"text-up",children:[R(-(u.fundingAcc??0),4)," USDT"]})}),e(F,{k:"\uC2E4\uD604 \uC190\uC775 (\uC21C, \uD380\uB529 \uD3EC\uD568)",
v:R(u.realizedNet)}),(C==null?void 0:C.flip.alert)&&s("div",{className:"mt-2 text-[12px] text-warn",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",
C.flip.multiple.toFixed(1),"\uBC30, \uBAA9\uD45C \uC9C4\uD589 ",Math.round(C.flip.progress*100),"%)"]}),(C==null?void 0:C.pyr)&&s("div",{className:`mt-1 text-[1\
1px] ${C.pyr.add?"text-accent":"text-muted"}`,children:["\uBD88\uD0C0\uAE30 ",u.adds,"/",t.maxAdds,": ",ke(C.pyr,I(u.symbol).dp)]}),!(C!=null&&C.pyr)&&s("div",{
className:"mt-1 text-[11px] text-muted",children:["\uBD88\uD0C0\uAE30: \uB3CC\uD30C \uC2E0\uD638 \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 (\uCD5C\uB300 ",
t.maxAdds,"\uD68C)"]}),s("div",{className:"grid grid-cols-3 gap-2 mt-3",children:[e(z,{tone:"down",onClick:()=>fu(u,1,"\uC2DC\uC7A5\uAC00 \uCCAD\uC0B0"),children:"\
\uC804\uB7C9 \uCCAD\uC0B0"}),e(z,{onClick:()=>fu(u,.5,"50% \uCCAD\uC0B0"),children:"50% \uCCAD\uC0B0"}),e(z,{tone:"accent",disabled:!((A=C==null?void 0:C.pyr)!=
null&&A.add)||u.adds>=t.maxAdds||u.symbol!==t.symbol,onClick:()=>(C==null?void 0:C.pyr)&&zu(u,C.pyr),children:"\uBD88\uD0C0\uAE30"})]})]},u.id)}),$.pending.length>
0&&s(W,{className:"p-3",children:[e("div",{className:"text-sm font-semibold mb-1",children:"\uBBF8\uCCB4\uACB0 \uC9C0\uC815\uAC00"}),$.pending.map(u=>s("div",{className:"\
flex justify-between items-center py-1 text-[13px]",children:[s("span",{className:u.side==="long"?"text-up":"text-down",children:[u.side==="long"?"\uB871":"\uC20F",
" ",u.symbol," ",c(u.qty,I(u.symbol).qdp)," @ ",c(u.price,I(u.symbol).dp)]}),e("button",{className:"text-muted underline",onClick:()=>{h.current.cancelLimit(u.id),
S()},children:"\uCDE8\uC18C"})]},u.id))]})]}),r==="\uAE30\uB85D"&&e(Fe,{broker:h.current}),r==="\uC124\uC815"&&s("div",{className:"flex-1 overflow-y-auto p-3 sp\
ace-y-3",children:[s(W,{className:"p-3",children:[e("div",{className:"text-sm font-semibold mb-2",children:"\uC790\uAE08"}),e(F,{k:"\uC2DC\uB4DC / \uC9C0\uAC11",
v:`${c($.bankroll)} / ${c($.wallet)} USDT`}),e(z,{tone:"down",className:"w-full mt-2",onClick:()=>{confirm("\uBAA8\uC758 \uC790\uAE08\uC744 200 USDT\uB85C \uCD08\uAE30\uD654\uD558\uACE0 \uD3EC\uC9C0\uC158\xB7\uAE30\uB85D\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?")&&
(h.current.reset(xe,a.serverNow()),S(),g("200 USDT\uB85C \uCD08\uAE30\uD654"))},children:"\uC790\uAE08 \uCD08\uAE30\uD654 (200 USDT)"})]}),s(W,{className:"p-3 s\
pace-y-3",children:[e("div",{className:"text-sm font-semibold",children:"\uB9AC\uC2A4\uD06C"}),s("div",{className:"grid grid-cols-2 gap-2",children:[e(w,{label:"\
\uAC70\uB798\uB2F9 \uB9AC\uC2A4\uD06C %",value:String(t.riskPct),onChange:u=>B({riskPct:Math.max(.1,Number(u)||1)}),suffix:"%"}),e(w,{label:"\uAE30\uBCF8 \uB808\uBC84\uB9AC\uC9C0",
value:String(t.leverage),onChange:u=>B({leverage:Math.min(125,Math.max(1,Math.round(Number(u)||1)))}),suffix:"x"}),e(w,{label:"\uBD88\uD0C0\uAE30 \uCD5C\uB300 \uD69F\uC218",
value:String(t.maxAdds),onChange:u=>B({maxAdds:Math.max(0,Math.round(Number(u)||0))})}),e(w,{label:"\uBD88\uD0C0\uAE30 \uD06C\uAE30 (\uCD08\uAE30 \uB300\uBE44)",
value:String(t.addSizePct),onChange:u=>B({addSizePct:Math.max(5,Number(u)||50)}),suffix:"%"})]}),e(ru,{on:t.moveSlToBe,onChange:u=>B({moveSlToBe:u}),label:"TP1 \
\uCCB4\uACB0 \uD6C4 SL \uBCF8\uC808 \uC774\uB3D9",hint:"\uBCF8\uC808\uAC00 = \uC9C4\uC785\uAC00 + \uB0A8\uC740 \uC9C4\uC785\xB7\uCCAD\uC0B0 \uC218\uC218\uB8CC (\uC190\uC2E4 \uC5C6\uC774 \uCCAD\uC0B0)"}),
e(ru,{on:t.autoPaper,onChange:u=>B({autoPaper:u}),label:"\uC790\uB3D9 \uBAA8\uC758\uB9E4\uB9E4",hint:"\uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 \uC2E0\uD638\uB9CC \xB7 \uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30 \xB7 \uC77C\uC77C \u22123R \uC815\uC9C0 (\uAE30\uBCF8 OFF)"})]}),
s(W,{className:"p-3 space-y-3",children:[e("div",{className:"text-sm font-semibold",children:"\uBC15\uC2A4 / \uD53C\uBD07"}),s("div",{className:"grid grid-cols-\
2 gap-2",children:[e(w,{label:"\uB8E9\uBC31 (\uCE94\uB4E4)",value:String(t.lookback),onChange:u=>B({lookback:Math.max(20,Math.round(Number(u)||80))})}),e(w,{label:"\
\uD130\uCE58 \uD5C8\uC6A9 %",value:String(t.tolerancePct),onChange:u=>B({tolerancePct:Math.max(.05,Number(u)||.25)}),suffix:"%"}),e(w,{label:"\uD53C\uBD07 \uC88C",
value:String(t.pivotLeft),onChange:u=>B({pivotLeft:Math.max(1,Math.round(Number(u)||3))})}),e(w,{label:"\uD53C\uBD07 \uC6B0",value:String(t.pivotRight),onChange:u=>B(
{pivotRight:Math.max(1,Math.round(Number(u)||3))})}),e(w,{label:"\uCD5C\uC18C \uD130\uCE58",value:String(t.minTouches),onChange:u=>B({minTouches:Math.max(1,Math.
round(Number(u)||2))})}),e(w,{label:"\uCD5C\uC18C \uBC15\uC2A4 \uB192\uC774 %",value:String(t.minHeightPct),onChange:u=>B({minHeightPct:Math.max(0,Number(u)||0)}),
suffix:"%"})]}),e(ru,{on:t.requireRange,onChange:u=>B({requireRange:u}),label:"\uBC15\uC2A4\uAD8C(\uBE44\uCD94\uC138)\uC77C \uB54C\uB9CC \uC2E0\uD638"}),e(ru,{on:t.
showHist,onChange:u=>B({showHist:u}),label:"\uC555\uB825 \uD788\uC2A4\uD1A0\uADF8\uB7A8 \uD45C\uC2DC"})]}),e(W,{className:"p-3",children:e(ru,{on:t.notify,onChange:async u=>{
u&&"Notification"in window&&Notification.permission!=="granted"&&await Notification.requestPermission(),B({notify:u})},label:"\uC54C\uB9BC",hint:"\uC2E0\uD638\xB7\uCCB4\uACB0\xB7\uC555\uB825\uBC18\uC804 (\uD648 \
\uD654\uBA74 \uC571\uC5D0\uC11C \uAD8C\uC7A5)"})}),s("div",{className:"text-[11px] text-muted px-1 pb-4 leading-5",children:["\uD398\uC774\uD37C(\uBAA8\uC758) \uD2B8\uB808\uC774\uB529 \uC804\uC6A9 \xB7 \uC2E4\uACC4\uC88C/API \uD0A4 \uC5C6\uC74C \xB7 B\
itget \uACF5\uAC1C \uC2DC\uC138 \uC0AC\uC6A9. \uC218\uC218\uB8CC: Bitget USDT-M \uD14C\uC774\uCEE4 0.06% / \uBA54\uC774\uCEE4 0.02% (TP\uB3C4 \uD14C\uC774\uCEE4\uB85C \uBCF4\uC218 \uACC4\uC0B0). \uC2AC\uB9AC\uD53C\uC9C0 ",
iu,"bp (\uC2DC\uC7A5\uAC00\xB7\uC190\uC808). \uD380\uB529\uBE44: 00/08/16\uC2DC UTC \uC815\uC0B0 \uD380\uB529\uB960(Bitget \uACF5\uAC1C \uC774\uB825, \uC5C6\uC73C\uBA74 \uC815\uC0B0 \uC9C1\uC804 \uD380\uB529\uB960). \uAC15\uC81C\uCCAD\uC0B0 = \uACA9\uB9AC \uC99D\uAC70\uAE08 \uC804\uC561 \uC190\uC2E4. \uB3CC\uD30C TP 1:3\uC740 \uC218\uC218\uB8CC \uCC28\uAC10 \uC21C\uC190\uC775 \uAE30\uC900. \uC571\uC774 \uAEBC\uC838 \uC788\uB358 \uB3D9\uC548\uC740 \uB2E4\uC2DC \uC5F4 \uB54C 1\uBD84\uBD09\uC73C\uB85C \uC7AC\uC0DD (SL\xB7TP \uB3D9\uC2DC \uD130\
\uCE58 \uC2DC SL \uC6B0\uC120). \uC555\uB825: \uC2E4\uC2DC\uAC04 \uCCB4\uACB0(aggressor) \uC9D1\uACC4, \uC5F0\uACB0 \uC774\uC804 \uCE94\uB4E4\uC740 OHLCV \uADFC\uC0AC."]})]})]}),
e("nav",{className:"border-t border-line bg-panel pb-safe grid grid-cols-5",children:Ee.map(u=>e("button",{onClick:()=>D(u),className:`h-14 text-[13px] relative\
 ${r===u?"text-accent font-semibold":"text-muted"}`,children:s("span",{className:"inline-flex items-center gap-1",children:[u,u==="\uD3EC\uC9C0\uC158"&&$.positions.
length>0&&e("span",{className:"min-w-4 h-4 px-1 rounded-full bg-accent text-bg text-[10px] leading-4 font-semibold",children:$.positions.length})]})},u))})]})}function Se({
box:r,manual:D,dp:t,tape:E,onUnlock:B,onEdit:l}){const[a,d]=q(!1),[v,M]=q(""),[N,m]=q("");return r?s("div",{className:"px-3 py-1.5 border-t border-line text-[12\
px]",children:[s("div",{className:"flex items-center justify-between gap-2",children:[s("div",{className:"num leading-5",children:[e("span",{className:"text-mut\
ed",children:"\uBC15\uC2A4 "}),e("span",{className:"text-down",children:c(r.bottom,t)})," \u2013 ",e("span",{className:"text-up",children:c(r.top,t)}),e("span",
{className:"text-muted",children:" \xB7 50% "}),c(r.mid,t)]}),s("div",{className:"flex gap-1.5 items-center",children:[e("span",{className:`px-1.5 py-0.5 rounde\
d text-[10px] ${r.isRange?"bg-up/20 text-up":"bg-warn/20 text-warn"}`,children:D?"\uC218\uB3D9\xB7\uACE0\uC815":r.isRange?"\uBC15\uC2A4\uAD8C":"\uCD94\uC138/\uC57D\uD568"}),
e("button",{className:"text-accent",onClick:()=>{M(String(Number(r.top))),m(String(Number(r.bottom))),d(f=>!f)},children:"\uC218\uC815"}),D&&e("button",{className:"\
text-muted",onClick:B,children:"\uC790\uB3D9"})]})]}),s("div",{className:"text-[10px] text-muted",children:["\uD130\uCE58 ",r.touchesTop,"/",r.touchesBottom," \xB7\
 \uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 ",E,"\uCE94\uB4E4 (\uADF8 \uC678 OHLCV \uADFC\uC0AC)"]}),a&&s("div",{className:"grid grid-cols-3 gap-2 mt-2 items-\
end",children:[e(w,{label:"\uC0C1\uB2E8(\uC800\uD56D)",value:v,onChange:M}),e(w,{label:"\uD558\uB2E8(\uC9C0\uC9C0)",value:N,onChange:m}),e(z,{tone:"accent",onClick:()=>{
const f=Number(v),h=Number(N);f>0&&h>0&&f!==h&&(l(f,h),d(!1))},children:"\uACE0\uC815"})]})]}):e("div",{className:"px-3 py-2 text-[12px] text-muted border-t bor\
der-line",children:"\uBC15\uC2A4 \uD0D0\uC9C0 \uC911\u2026 (\uD53C\uBD07 \uD130\uCE58 \uBD80\uC871)"})}function $e({g:r,dp:D,acted:t,stale:E,onEnter:B,onEdit:l}){
if(!r)return e("div",{className:"mx-3 mb-2 px-3 py-2 rounded-lg bg-panel border border-line text-[12px] text-muted",children:"\uC2E0\uD638 \uB300\uAE30 \uC911 \xB7 \uBC15\uC2A4 \uC9C0\uC9C0/\uC800\uD56D + \uC7A5\uC545\uD615 + \uC555\uB825 \uD655\uC778 \uC2DC\
 \uD45C\uC2DC"});const a=r.side==="long";return s("div",{className:`mx-3 mb-2 rounded-xl border px-3 py-2 ${a?"border-up/60 bg-up/10":"border-down/60 bg-down/10"}`,
children:[s("div",{className:"flex justify-between items-center",children:[s("div",{className:`font-semibold ${a?"text-up":"text-down"}`,children:[lu[r.type]," ",
s("span",{className:"text-muted text-[11px] font-normal",children:[au(r.ts)," \uB9C8\uAC10"]})]}),s("div",{className:"text-[11px] text-muted flex items-center g\
ap-1.5",children:[r.pressure.source==="ohlcv"&&e("span",{className:"px-1.5 py-0.5 rounded bg-warn/20 text-warn text-[10px]",children:"\uC555\uB825 \uADFC\uC0AC(OHLCV)"}),
s("span",{children:["\uB9E4\uC218\uC555\uB825 ",Math.round(r.pressure.ratio*100),"%"]})]})]}),s("div",{className:"grid grid-cols-4 gap-1 text-[11px] num mt-1",children:[
s("div",{children:[e("div",{className:"text-muted",children:"\uC9C4\uC785"}),c(r.entry,D)]}),s("div",{children:[e("div",{className:"text-muted",children:"SL"}),
e("span",{className:"text-warn",children:c(r.sl,D)})]}),r.targets.map(d=>s("div",{children:[s("div",{className:"text-muted",children:[d.label," ",d.sizePct,"%"]}),
e("span",{className:"text-up",children:c(d.price,D)})]},d.label))]}),s("div",{className:"flex gap-2 mt-2",children:[e(z,{tone:a?"up":"down",className:"flex-1 h-\
10 text-[13px]",disabled:t||!!E,onClick:B,children:t?"\uC9C4\uC785 \uC644\uB8CC/\uCC98\uB9AC\uB428":E??`\uD0ED\uD558\uC5EC \uBAA8\uC758 ${a?"\uB871":"\uC20F"} \uC9C4\
\uC785`}),e(z,{className:"h-10",onClick:l,children:"\uC218\uC815"})]})]})}function Te(r){const[D,t]=q("market"),[E,B]=q(""),[l,a]=q(""),d=r.draft??r.defaultDraft(
"long");X(()=>{!r.draft&&r.last&&r.setDraft(r.defaultDraft("long"))},[r.last>0]);const v=D==="limit"&&Number(E)>0?Number(E):r.last,M=Number(d.sl);let N=null;try{
N=v>0&&M>0&&M!==v?r.sizeFor(v,M):null}catch{N=null}const m=Math.max(0,Math.round(-Math.log10(r.qtyStep))),f=l?pe(Number(l)||0,r.qtyStep):Number((N==null?void 0:
N.qty)??0),h=d.side==="long",p=Number(d.tp1),L=Number(d.tp2),S=h?M<v:M>v,K=p>0&&(h?p>v:p<v)&&(d.kind==="breakout"||!d.tp2||(h?L>p:L<p)),G=f*v,g=G>=eu,b=G/r.s.leverage,
Y=D==="limit"?ye:j,nu=D==="limit"?0:Ku,ou=Math.abs(v-M)*f+v*f*(Y+nu)+M*f*(j+Ku),su=S&&K&&g&&b+v*f*Y<=r.available+1e-9,cu=N!=null&&N.belowMin&&!l?`\uB9AC\uC2A4\uD06C ${r.
s.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${eu} USDT / ${r.qtyStep}) \uBBF8\uB9CC`:S?K?g?"\uAC00\uC6A9 \uC99D\uAC70\uAE08 \uBD80\uC871":
`\uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561 ${eu} USDT \uC774\uC0C1 \uD544\uC694`:`TP\uAC00 \uC9C4\uC785\uAC00 ${h?"\uC704":"\uC544\uB798"}(TP2\uB294 TP1 \uB108\uBA38)\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`:
`SL\uC774 \uC9C4\uC785\uAC00 ${h?"\uC544\uB798":"\uC704"}\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`,O=y=>r.setDraft({...d,...y});return s("div",{className:"f\
lex-1 overflow-y-auto px-3 pt-3",children:[s("div",{className:"grid grid-cols-[minmax(0,1fr)_124px] gap-2.5",children:[s("div",{className:"space-y-2.5",children:[
e("div",{className:"grid grid-cols-2 gap-1 bg-panel2 rounded-lg p-1",children:["long","short"].map(y=>e("button",{onClick:()=>{a(""),r.setDraft(d.signal&&d.side===
y?d:r.defaultDraft(y))},className:`h-9 rounded-md font-semibold text-sm ${d.side===y?y==="long"?"bg-up text-white":"bg-down text-white":"text-muted"}`,children:y===
"long"?"\uB871":"\uC20F"},y))}),e(vu,{items:["market","limit"],value:D,onChange:y=>t(y),fmt:y=>y==="market"?"\uC2DC\uC7A5\uAC00":"\uC9C0\uC815\uAC00"}),D==="lim\
it"&&e(w,{label:"\uC9C0\uC815\uAC00",value:E,onChange:B}),s("div",{children:[e("span",{className:"text-[11px] text-muted",children:"\uB808\uBC84\uB9AC\uC9C0"}),
e(vu,{items:[3,5,10,20],value:r.s.leverage,onChange:y=>r.set({leverage:y}),fmt:y=>`${y}x`})]}),e(w,{label:"\uB9AC\uC2A4\uD06C (\uC790\uC0B0 \uB300\uBE44)",value:String(
r.s.riskPct),onChange:y=>{a(""),r.set({riskPct:Math.max(.1,Number(y)||1)})},suffix:"%"}),e(w,{label:"\uC190\uC808 SL",value:String(d.sl),onChange:y=>O({sl:y})}),
e(w,{label:d.kind==="breakout"?"TP (\uC21C 1:3, 100%)":"TP1 \uC911\uC559\uC120 (50%)",value:String(d.tp1),onChange:y=>O({tp1:y})}),d.kind==="range"&&e(w,{label:"\
TP2 \uBC18\uB300\uD3B8 \uACBD\uACC4 (50%)",value:String(d.tp2),onChange:y=>O({tp2:y})}),e(w,{label:`\uC218\uB7C9 (\uB9AC\uC2A4\uD06C ${r.s.riskPct}%: ${N?c(N.qty,
m):"\u2014"})`,value:l||(N?Number(N.qty).toFixed(m):""),onChange:a})]}),e("div",{className:"bg-panel rounded-xl border border-line py-2",children:e(ne,{book:r.book,
dp:r.dp,qdp:m,rows:7})})]}),d.signal&&s("div",{className:"mt-2 text-[11px] text-accent",children:["\uC2E0\uD638 \uC790\uB3D9 \uC785\uB825: ",lu[d.signal.type],"\
 (",au(d.signal.ts)," \uB9C8\uAC10) \xB7 SL/TP \uC790\uB3D9"]}),s(W,{className:"p-3 mt-3",children:[e(F,{k:"\uC9C4\uC785 \uAE30\uC900\uAC00",v:c(v,r.dp)}),e(F,{
k:"\uC99D\uAC70\uAE08 / \uBA85\uBAA9",v:f>0?`${c(b)} / ${c(G)} USDT`:"\u2014"}),e(F,{k:"SL \uC2DC \uC21C\uC190\uC2E4 (\uC218\uC218\uB8CC\xB7\uC2AC\uB9AC\uD53C\uC9C0)",
v:f>0&&S?s("span",{className:"text-down",children:["-",c(ou)," USDT (",(ou/Math.max(r.equity,1e-9)*100).toFixed(2),"%)"]}):"\u2014"}),f>0&&K&&e(F,{k:d.kind==="b\
reakout"||!d.tp2?"TP \uC2DC \uC21C\uC774\uC775":"TP1+TP2 \uC2DC \uC21C\uC774\uC775",v:s("span",{className:"text-up",children:["+",c((d.kind==="breakout"||!d.tp2?
Math.abs(p-v)*f-p*f*j:Math.abs(p-v)*f*.5+Math.abs(L-v)*f*.5-(p+L)*f*.5*j)-v*f*(Y+nu))," USDT"]})}),e(F,{k:"\uAC00\uC6A9 / \uC790\uC0B0",v:`${c(r.available)} / ${c(
r.equity)} USDT`})]}),s("div",{className:"sticky bottom-0 -mx-3 px-3 pt-2 pb-3 mt-1 bg-bg/95 backdrop-blur border-t border-line",children:[!su&&(f>0||(N==null?void 0:
N.belowMin))&&e("div",{className:"text-[11px] text-down mb-1",children:cu}),e(z,{tone:d.side==="long"?"up":"down",className:"w-full h-12 text-[16px]",disabled:!su||
!(f>0),onClick:()=>{r.onSubmit(d,D,v,f),a("")},children:d.side==="long"?"\uB871 (\uB9E4\uC218) \uBAA8\uC758 \uC9C4\uC785":"\uC20F (\uB9E4\uB3C4) \uBAA8\uC758 \uC9C4\uC785"})]})]})}
function Fe({broker:r}){var m,f,h;const D=r.state,t=ve(D.fills,D.positions.map(p=>p.id)),E=D.equityCurve,B=360,l=120,a=E.map(p=>p.equity),d=Math.min(...a,D.bankroll),
v=Math.max(...a,D.bankroll),M=E.map((p,L)=>`${L?"L":"M"}${L/Math.max(1,E.length-1)*B},${l-(p.equity-d)/Math.max(1e-9,v-d)*(l-10)-5}`).join(" "),N=async()=>{var G;
const p=Ne(D.fills),L=`dupont-paper-${new Date().toISOString().slice(0,10)}.csv`,S=new File([p],L,{type:"text/csv"});if((G=navigator.canShare)!=null&&G.call(navigator,
{files:[S]}))try{await navigator.share({files:[S],title:L});return}catch{}const K=document.createElement("a");K.href=URL.createObjectURL(S),K.download=L,K.click(),
setTimeout(()=>URL.revokeObjectURL(K.href),2e3)};return s("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[s(W,{className:"p-3",children:[s("di\
v",{className:"grid grid-cols-3 text-center",children:[s("div",{children:[e("div",{className:"text-[11px] text-muted",children:"\uAC70\uB798"}),e("div",{className:"\
num font-semibold",children:t.trades})]}),s("div",{children:[e("div",{className:"text-[11px] text-muted",children:"\uC2B9\uB960"}),e("div",{className:"num font-\
semibold",children:t.trades?`${(t.winRate*100).toFixed(0)}%`:"\u2014"})]}),s("div",{children:[e("div",{className:"text-[11px] text-muted",children:"\uC21C\uC190\uC775"}),
e("div",{className:`num font-semibold ${t.net>=0?"text-up":"text-down"}`,children:R(t.net)})]})]}),s("div",{className:"text-[11px] text-muted text-center mt-1",
children:["\uC218\uC218\uB8CC \uD569\uACC4 ",c(t.fees,3)," USDT (\uC21C\uC190\uC775\uC5D0 \uBC18\uC601)",t.funding!==0?` \xB7 \uD380\uB529 ${R(-t.funding,3)}`:"",
t.partialNet!==0?` \xB7 \uBCF4\uC720 \uC911 \uBD80\uBD84\uCCAD\uC0B0 ${R(t.partialNet)} \uD3EC\uD568`:""]}),t.rTrades>0&&s("div",{className:"text-[11px] text-mu\
ted text-center num",children:["\uAE30\uB300\uAC12 ",s("span",{className:t.expectancyR>=0?"text-up":"text-down",children:[R(t.expectancyR),"R"]})," \xB7 \uD3C9\uADE0 \uC2B9 ",
R(t.avgWinR),"R / \uD328 ",R(t.avgLossR),"R (",t.rTrades,"\uAC74)"]})]}),s(W,{className:"p-3",children:[s("div",{className:"flex justify-between text-[12px] tex\
t-muted mb-1 num",children:[e("span",{children:"\uC790\uC0B0 \uACE1\uC120"}),s("span",{children:[c(((m=E[0])==null?void 0:m.equity)??D.bankroll)," \u2192 ",e("s\
pan",{className:(((f=E[E.length-1])==null?void 0:f.equity)??D.bankroll)>=D.bankroll?"text-up":"text-down",children:c(((h=E[E.length-1])==null?void 0:h.equity)??
D.bankroll)})," USDT"]})]}),s("svg",{viewBox:`0 0 ${B} ${l}`,className:"w-full h-[120px]",children:[e("line",{x1:"0",x2:B,y1:l-(D.bankroll-d)/Math.max(1e-9,v-d)*
(l-10)-5,y2:l-(D.bankroll-d)/Math.max(1e-9,v-d)*(l-10)-5,stroke:"#262e38",strokeDasharray:"4 4"}),e("path",{d:M,fill:"none",stroke:"#00c2cb",strokeWidth:"2"})]}),
D.positions.length>0&&e("div",{className:"text-[11px] text-muted mt-1",children:"\uC9C0\uAC11 \uAE30\uC900 \xB7 \uBCF4\uC720 \uD3EC\uC9C0\uC158\uC758 \uC9C4\uC785 \uC218\uC218\uB8CC\uB294 \uC774\uBBF8 \uCC28\uAC10\uB428 (\uBBF8\uC2E4\uD604 \uC190\uC775 \uC81C\uC678)"})]}),
e(z,{className:"w-full",onClick:N,disabled:!D.fills.length,children:"CSV \uB0B4\uBCF4\uB0B4\uAE30"}),[...D.fills].reverse().map(p=>s(W,{className:"p-3",children:[
s("div",{className:"flex justify-between text-[13px]",children:[s("span",{children:[e("span",{className:p.side==="long"?"text-up":"text-down",children:p.side===
"long"?"\uB871":"\uC20F"})," ",p.symbol," \xB7 ",Hu(p.setup)]}),s("span",{className:`num font-semibold ${p.netPnl>=0?"text-up":"text-down"}`,children:[R(p.netPnl),
" USDT"]})]}),s("div",{className:"text-[11px] text-muted num mt-0.5",children:[au(p.closedAt)," \xB7 ",p.reason," \xB7 ",c(p.qty,I(p.symbol).qdp)," \xB7 ",c(p.entry,
I(p.symbol).dp)," \u2192 ",c(p.exit,I(p.symbol).dp)," \xB7 \uC218\uC218\uB8CC ",c(p.fees,3),p.funding?` \xB7 \uD380\uB529 ${R(-p.funding,3)}`:"",p.r!==void 0?` \
\xB7 ${R(p.r)}R`:""]})]},p.id)),!D.fills.length&&e("div",{className:"text-muted text-sm text-center py-6",children:"\uAC70\uB798 \uAE30\uB85D \uC5C6\uC74C"})]})}
Xu.createRoot(document.getElementById("root")).render(e(we,{}));if("serviceWorker"in navigator){const r="/dupont-mobile/";window.addEventListener("load",()=>navigator.
serviceWorker.register(`${r}sw.js`,{scope:r}).catch(()=>{}))}
