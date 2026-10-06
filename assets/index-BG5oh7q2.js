import{jsxs as s,jsx as u,Fragment as je}from"react/jsx-runtime";import ze from"react-dom/client";import{useState as q,useEffect as Q,useRef as te,useCallback as Pe,
useMemo as Me}from"react";import{e as Ge,f as Ve,c as Re,s as Qe,n as Ye}from"./strategy-Cu9CvPGE.js";import{C as be,a as Je,B as K,b as _,R as F,N as w,T as ne,
O as Xe}from"./ui-CYxP46dv.js";import{l as Ze,s as U,u as eu,a as ce,b as uu,c as tu,d as j,f as c,S as nu,p as Cu,T as su,e as R,g as iu,M as J,D as au,m as Ae,
h as ru,i as lu}from"./market-CvLGEhFN.js";import{P as ou,n as cu,u as qe,T as I,D as du,S as Ce,t as mu,r as Bu,s as pu,a as Du,M as xu,b as Le,f as hu}from"./paper-DnVmL6eb.js";
import"decimal.js";import"lightweight-charts";(function(){const D=document.createElement("link").relList;if(D&&D.supports&&D.supports("modulepreload"))return;for(const m of document.
querySelectorAll('link[rel="modulepreload"]'))k(m);new MutationObserver(m=>{for(const r of m)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LI\
NK"&&l.rel==="modulepreload"&&k(l)}).observe(document,{childList:!0,subtree:!0});function t(m){const r={};return m.integrity&&(r.integrity=m.integrity),m.referrerPolicy&&
(r.referrerPolicy=m.referrerPolicy),m.crossOrigin==="use-credentials"?r.credentials="include":m.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="sa\
me-origin",r}function k(m){if(m.ep)return;m.ep=!0;const r=t(m);fetch(m.href,r)}})();const bu=["\uCC28\uD2B8","\uAC70\uB798","\uD3EC\uC9C0\uC158","\uAE30\uB85D",
"\uC124\uC815"],se={RANGE_LONG:"\uBC15\uC2A4 \uBC18\uC804 \uB871",RANGE_SHORT:"\uBC15\uC2A4 \uBC18\uC804 \uC20F",FAKE_BREAKOUT_LONG:"\uAC00\uC9DC \uC774\uD0C8 \uB871",
FAKE_BREAKOUT_SHORT:"\uAC00\uC9DC \uB3CC\uD30C \uC20F",BREAKOUT_LONG:"\uC9C4\uC9DC \uB3CC\uD30C \uB871",BREAKOUT_SHORT:"\uC9C4\uC9DC \uC774\uD0C8 \uC20F"},Oe=i=>i===
"MANUAL"?"\uC218\uB3D9":se[i]??i,he="dupont.broker.v1",Ue="dupont.settings.v1",de="dupont.seen.v1";function Au(i,D){const t=i.level?c(i.level,D):"";return i.add?
`\uB3CC\uD30C \uB808\uBCA8 ${t} \uB9AC\uD14C\uC2A4\uD2B8 \uD655\uC778 \u2013 \uCD94\uAC00 \uC9C4\uC785 \uAC00\uB2A5`:i.reason.startsWith("max adds")?"\uCD5C\uB300 \uCD94\uAC00 \uD69F\uC218 \uB3C4\
\uB2EC":i.reason.startsWith("no retest")?`\uB3CC\uD30C \uB808\uBCA8 ${t} \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:i.reason.startsWith("retest without")?"\uB9AC\uD14C\uC2A4\uD2B8 \uC911 \u2013 \
\uC7A5\uC545\uD615/\uC555\uB825 \uD655\uC778 \uB300\uAE30":i.reason.startsWith("no broken")?"\uB3CC\uD30C \uB808\uBCA8 \uC815\uBCF4 \uC5C6\uC74C":i.reason.startsWith(
"pyramiding only")?"\uB3CC\uD30C \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9":i.reason.startsWith("retest must be")?"\uC9C4\uC785/\uC9C1\uC804 \uCD94\uAC00 \uC774\uD6C4\uC758 \uC0C8 \uCE94\uB4E4\uC5D0\uC11C \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30":
i.reason.startsWith("no move away")?`\uB3CC\uD30C \uB808\uBCA8 ${t}\uC5D0\uC11C 0.5R \uC774\uC0C1 \uC774\uD0C8 \uD6C4 \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:"\uB370\uC774\
\uD130 \uBD80\uC871"}function fu(){var Se,Te,$e,Fe;const[i,D]=q("\uCC28\uD2B8"),[t,k]=q(()=>Ze(Ue,au)),m=e=>k(n=>{const a={...n,...e};return j(Ue,a),a}),r=U(t.symbol),
l=eu(t.symbol,t.tf),[d,v]=q(()=>ce(`dupont.box.${t.symbol}`));Q(()=>v(ce(`dupont.box.${t.symbol}`)),[t.symbol]);const[P,E]=q(!1),B=uu(l.candles,l.intervalMs,l.tape,
l.tapeVer,l.serverNow,t,d,r.dp),h=(10**-r.dp).toFixed(r.dp),x=te(null);x.current||(x.current=new ou(ce(he)??void 0)),x.current.moveSlToBe=t.moveSlToBe,x.current.
precision=e=>{const n=U(e);return{dp:n.dp,qdp:n.qdp}};const[p,L]=q(0),S=()=>{j(he,x.current.state),L(e=>e+1)},[O,H]=q([]),N=Pe((e,n="info")=>{const a=Date.now()+
Math.random();if(H(C=>[...C.slice(-1),{id:a,text:e,tone:n}]),setTimeout(()=>H(C=>C.filter(o=>o.id!==a)),4e3),t.notify&&"Notification"in window&&Notification.permission===
"granted"&&document.visibilityState!=="visible")try{new Notification("\uB4C0\uD401 \uC2A4\uD0E0\uB2E4\uB4DC",{body:e,icon:"/dupont-mobile/icons/icon.svg"})}catch{}},
[t.notify]),b=((Se=l.ticker)==null?void 0:Se.last)??((Te=l.candles[l.candles.length-1])==null?void 0:Te.close)??0,[z,ee]=q({});Q(()=>{b&&ee(e=>({...e,[t.symbol]:b}))},
[b,t.symbol]);const ie=18e4,ue=te({}),ae=async(e,n=!1)=>{const a=Date.now();if(!n&&a-(ue.current[e]??0)<3e4)return;ue.current[e]=a;const C=await lu(e).catch(()=>null);
C!=null&&C.length&&(x.current.setSettledRates(e,C),j(he,x.current.state))},X=(e,n,a,C)=>{const o=Date.now(),A=x.current.onPrice(e,n,o,a);return x.current.needsSettledRate(
e,o)&&ae(e),A.push(...x.current.accrueFunding(e,a||n,o,ie)),C!==void 0&&x.current.noteTickerRate(e,C,o),A},f=te(new Set),fe=async()=>{var a;const e=x.current,n=new Set(
[...e.state.positions.map(C=>C.symbol),...e.state.pending.map(C=>C.symbol)]);for(const C of n){const o=(a=e.state.lastTickTs)==null?void 0:a[C];if(!(!o||Date.now()-
o<=3e4||f.current.has(C))){f.current.add(C);try{await ae(C,!0);const A=l.serverNow(),g=Math.floor(o/6e4)*6e4,M=(await iu(C,g,A)).filter(y=>y.ts>=g&&y.ts+6e4<=A);
e.replayBars(C,M).forEach(y=>N(`[\uC7AC\uC0DD] ${C} ${y.message}`,y.kind==="sl"||y.kind==="liq"?"down":y.kind==="funding"?"info":"up")),S()}catch{}finally{f.current.
delete(C)}}}};Q(()=>{fe();const e=()=>{document.visibilityState==="visible"&&fe()};return document.addEventListener("visibilitychange",e),()=>document.removeEventListener(
"visibilitychange",e)},[]),Q(()=>{var n,a;if(!b||f.current.has(t.symbol))return;const e=X(t.symbol,b,(n=l.ticker)==null?void 0:n.mark,(a=l.ticker)==null?void 0:
a.funding);e.length&&(e.forEach(C=>N(C.message,C.kind==="sl"||C.kind==="liq"?"down":C.kind==="funding"?"info":"up")),S())},[b]),Q(()=>{const e=setInterval(async()=>{
const n=new Set([...x.current.state.positions.map(a=>a.symbol),...x.current.state.pending.map(a=>a.symbol)]);n.delete(t.symbol);for(const a of n){if(f.current.has(
a))continue;const C=await tu(a).catch(()=>null);if(!C)continue;ee(A=>({...A,[a]:C.last}));const o=X(a,C.last,C.mark,C.funding);o.length&&(o.forEach(A=>N(`${a} ${A.
message}`)),S())}},4e3);return()=>clearInterval(e)},[t.symbol]);const T=x.current.state,ge=x.current.equity(z),me=x.current.available(),Be=T.positions.filter(e=>e.
symbol===t.symbol),G=te(new Set(ce(de)??[])),Z=e=>`${t.symbol}:${t.tf}:${e.type}:${e.ts}`,$=B.live[B.live.length-1]??null,pe=(($e=B.closed[B.closed.length-1])==
null?void 0:$e.ts)??0,ve=e=>e.ts<pe?"\uC2E0\uD638 \uB9CC\uB8CC (\uCD5C\uADFC \uB9C8\uAC10 \uCE94\uB4E4 \uC544\uB2D8)":Math.abs(b-Number(e.entry))>.3*Number(e.risk)?
"\uAC00\uACA9 \uC774\uD0C8 (\uC2E0\uD638 \uC9C4\uC785\uAC00 \xB10.3R \uCD08\uACFC)":null,re=e=>{var a,C;const n=e==="long"?(a=l.ticker)==null?void 0:a.ask:(C=l.
ticker)==null?void 0:C.bid;return n&&b&&Math.abs(n-b)/b<.005?n:b},W=Me(()=>{var a;const e=((a=B.closed[B.closed.length-3])==null?void 0:a.ts)??0,n=[...B.history].
reverse().find(C=>C.ts>=e);return $??n??null},[$,B.history,B.closed]),De=()=>T.wallet*t.riskPct/100,ye=(e,n)=>Qe({equity:String(T.wallet),available:String(me),riskPct:t.
riskPct,entry:String(e),sl:String(n),leverage:t.leverage,feeRate:String(I),slippageBps:Ce,qtyStep:String(r.qtyStep),minQty:String(r.qtyStep),minNotional:J}),Ne=(e,n=!1)=>{
if(T.positions.some(oe=>oe.symbol===t.symbol)){N("\uC774\uBBF8 \uD3EC\uC9C0\uC158 \uBCF4\uC720 \uC911","down");return}const a=b,C=ve(e);if(C){N(`${C} \u2013 \uC9C4\uC785 \uBD88\uAC00`,
"down");return}const o=Re({side:e.side,kind:e.kind,entry:String(a),extremeWick:e.sl,box:e.box,slBufferPct:0,tickSize:h,feeRate:I,slippageBps:Ce});if(e.kind==="r\
ange"&&Ye({side:e.side,entry:o.entry,sl:o.sl,tp:o.targets[0].price,feeRate:I,slippageBps:Ce})<1){N("\uD604\uC7AC\uAC00 \uAE30\uC900 TP1 \uC21C\uC190\uC775\uBE44 1 \uBBF8\uB9CC \u2013 \uC9C4\uC785 \uC0DD\uB7B5",
"down");return}const A=Number(o.sl),g=mu(o.targets),M=e.side==="long";if(M?!(A<a&&g[0].price>a):!(A>a&&g[0].price<a)){N("\uD604\uC7AC\uAC00\uAC00 \uC2E0\uD638 \uBC94\uC704\uB97C \uBC97\uC5B4\uB098 \uC9C4\uC785 \uBD88\uAC00 (SL/TP1 \uC0AC\uC774 \uC544\uB2D8)",
"down");return}const V=ye(a,A),y=Number(V.qty);if(V.belowMin||!(y>0)){N(`\uB9AC\uC2A4\uD06C ${t.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${J}\
 USDT / ${r.qtyStep}) \uBBF8\uB9CC`,"down");return}const Y=x.current.open({symbol:t.symbol,side:e.side,qty:y,price:a,refPx:re(e.side),leverage:t.leverage,sl:A,targets:g,
setup:e.type,signalId:Z(e),breakoutLevel:e.kind==="breakout"?Number(M?e.box.top:e.box.bottom):void 0,riskBudget:De()});if(!Y.ok){N(Y.error??"\uC9C4\uC785 \uC2E4\uD328",
"down");return}G.current.add(Z(e)),j(de,[...G.current].slice(-300)),N(`${n?"[\uC790\uB3D9] ":""}${se[e.type]} \uBAA8\uC758 \uC9C4\uC785 ${c(y,r.qdp)} @ ${c(Y.fillPx??
a,r.dp)}`,"up"),S()},_e=e=>{const n=T.fills.filter(o=>o.final&&o.symbol===t.symbol),a=n[n.length-1];if(a){const o=T.fills.filter(g=>g.positionId===a.positionId).
reduce((g,M)=>g+M.netPnl,0),A=Math.floor(a.closedAt/l.intervalMs)*l.intervalMs;if(o<0&&e.ts<=A+2*l.intervalMs)return"\uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30"}const C=new Date;
return C.setHours(0,0,0,0),Bu(T.fills,C.getTime())<=-3?"\uC77C\uC77C \uC190\uC2E4 \uD55C\uB3C4 \u22123R \uB3C4\uB2EC":null};Q(()=>{if(!$)return;const e=Z($);if(!G.
current.has(`n:${e}`)&&(G.current.add(`n:${e}`),j(de,[...G.current].slice(-300)),N(`\uC2E0\uD638: ${se[$.type]} \xB7 SL ${c($.sl,r.dp)} \xB7 ${$.targets.map(n=>`${n.
label} ${c(n.price,r.dp)}`).join(" / ")}`,$.side==="long"?"up":"down"),t.autoPaper&&!Be.length)){const n=$.pressure.source!=="trades"?"\uC555\uB825\uC774 OHLCV \uADFC\uC0AC":
_e($);n?N(`[\uC790\uB3D9] \uC9C4\uC785 \uC0DD\uB7B5 \u2013 ${n}`,"info"):Ne($,!0)}},[$==null?void 0:$.ts,$==null?void 0:$.type]);const le=Me(()=>Be.map(e=>{var o,
A;const n=B.pressures.slice(0,B.closed.length),a=Ge({side:e.side,entry:e.entry,sl:e.sl,targets:e.targets.filter(g=>!g.done).map(g=>({price:g.price}))},B.closed,
n),C=e.setup.startsWith("BREAKOUT")?Ve({side:e.side,entry:e.entry,sl:e.initialSl,targets:e.targets.map(g=>({price:g.price})),type:e.setup,adds:e.adds,brokenLevel:e.
breakoutLevel,openedTs:Math.floor(e.openedAt/l.intervalMs)*l.intervalMs,lastAddTs:e.lastAddTs,risk:Math.abs((e.initialEntry??e.entry)-e.initialSl)},B.closed,n,B.
box,{maxAdds:t.maxAdds,addSizePct:t.addSizePct,tickSize:h,atr:((o=B.signalBox)==null?void 0:o.atr)??((A=B.box)==null?void 0:A.atr)}):null;return{p:e,flip:a,pyr:C}}),
[p,B.closed,B.pressures,B.box,B.signalBox,t.maxAdds,t.addSizePct,t.symbol,l.intervalMs]),Ee=te(new Set);Q(()=>{for(const e of le){const n=`${e.p.id}:${pe}`;e.flip.
alert&&!Ee.current.has(n)&&(Ee.current.add(n),N(`\uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (${e.flip.multiple.toFixed(1)}\uBC30)`,"warn"))}},[le]);
const xe=(e,n,a)=>{const C=x.current.closeFraction(e.id,n,z[e.symbol]??b,a);C&&N(`${a} ${c(C.qty,U(e.symbol).qdp)} @ ${c(C.exit,U(e.symbol).dp)} \xB7 \uC21C\uC190\uC775 ${R(
C.netPnl)} USDT`,C.netPnl>=0?"up":"down"),S()},Ie=(e,n)=>{const a=e.initialQty??e.origQty/(1+e.adds*(t.addSizePct/100)),C=e.riskBudget??T.wallet*t.riskPct/100,o=pu(
e,{last:re(e.side),suggestedSl:n.sl?Number(n.sl):void 0,budget:C,wantQty:a*(n.sizePct??t.addSizePct)/100,step:r.qtyStep});if(!(o.qty>0)){N("\uCD94\uAC00 \uC2DC \uCD1D \uB9AC\uC2A4\uD06C\uAC00 \uD55C\uB3C4 \uCD08\uACFC",
"down");return}if(o.qty*b<J){N(`\uCD94\uAC00 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561(${J} USDT) \uBBF8\uB9CC`,"down");return}const A=x.current.
open({symbol:e.symbol,side:e.side,qty:o.qty,price:b,refPx:re(e.side),leverage:e.leverage,sl:o.newSl,targets:[],setup:e.setup,isAdd:!0,candleTs:pe});if(!A.ok){N(
A.error??"\uCD94\uAC00 \uC2E4\uD328","down");return}N(`\uBD88\uD0C0\uAE30 #${e.adds+1}: ${c(o.qty,r.qdp)} @ ${c(A.fillPx??b,r.dp)} \xB7 SL ${c(o.newSl,r.dp)}`,"\
up"),S()},Ke=Pe(e=>{var A,g;const n=B.closed,a=n.length>=2?e==="long"?Math.min(n[n.length-1].low,n[n.length-2].low):Math.max(n[n.length-1].high,n[n.length-2].high):
b*(e==="long"?.995:1.005),C=B.box,o=C?b<Number(C.top)&&b>Number(C.bottom):!1;if(C){const M=o?"range":"breakout",V=e==="long"?Math.min(a,b*.999):Math.max(a,b*1.001),
y=Re({side:e,kind:M,entry:String(b),extremeWick:String(V),box:C,atr:C.atr,tickSize:h,feeRate:I,slippageBps:Ce}),Y=oe=>oe?Number(oe).toFixed(r.dp):"";return{side:e,
kind:M,sl:Y(y.sl),tp1:Y((A=y.targets[0])==null?void 0:A.price),tp2:Y((g=y.targets[1])==null?void 0:g.price)}}return{side:e,kind:"breakout",...cu(e,b,h,r.dp),tp2:""}},
[B.closed,B.box,b,r.dp,h]),[He,ke]=q(null),We=e=>{var a,C;const n=o=>o?Number(o).toFixed(r.dp):"";ke({side:e.side,kind:e.kind,sl:n(e.sl),tp1:n((a=e.targets[0])==
null?void 0:a.price),tp2:n((C=e.targets[1])==null?void 0:C.price),signal:e}),D("\uAC70\uB798")},we=(((Fe=l.ticker)==null?void 0:Fe.change24h)??0)>=0;return s("d\
iv",{className:"h-full flex flex-col pt-safe",children:[u("header",{className:"px-3 pt-2 pb-1.5 border-b border-line",children:s("div",{className:"flex items-en\
d justify-between",children:[s("div",{children:[s("div",{className:"flex items-center gap-2",children:[u("select",{value:t.symbol,onChange:e=>m({symbol:e.target.
value}),className:"bg-transparent text-[15px] font-semibold outline-none",children:nu.map(e=>u("option",{value:e.symbol,className:"bg-panel",children:e.symbol},
e.symbol))}),u("span",{className:"text-[10px] px-1.5 py-0.5 rounded bg-panel2 text-muted",children:"\uBB34\uAE30\uD55C \xB7 \uBAA8\uC758"}),u("span",{className:`\
w-2 h-2 rounded-full ${l.status==="live"?"bg-up":"bg-warn"}`,title:l.status})]}),u("div",{className:`text-[26px] leading-8 font-semibold num ${we?"text-up":"tex\
t-down"}`,children:b?c(b,r.dp):"\u2014"})]}),s("div",{className:"text-right text-[11px] text-muted num leading-[18px]",children:[s("div",{children:["24h ",u("sp\
an",{className:we?"text-up":"text-down",children:l.ticker?Cu(l.ticker.change24h):"\u2014"})]}),s("div",{children:["\uB9C8\uD06C ",l.ticker?c(l.ticker.mark,r.dp):
"\u2014"]}),s("div",{children:["\uD380\uB529 ",l.ticker?`${(l.ticker.funding*100).toFixed(4)}%`:"\u2014"]})]})]})}),O.length>0&&u("div",{className:"px-3 py-1.5 \
space-y-1 border-b border-line bg-bg","aria-live":"polite",children:O.map(e=>u("div",{className:`text-[12px] leading-4 px-2.5 py-1.5 rounded-md ${e.tone==="down"?
"bg-down/20 text-down":e.tone==="up"?"bg-up/15 text-up":e.tone==="warn"?"bg-warn/20 text-warn":"bg-panel2 text-txt"}`,children:e.text},e.id))}),s("main",{className:"\
flex-1 min-h-0 flex flex-col overflow-hidden",children:[i==="\uCC28\uD2B8"&&s(je,{children:[s("div",{className:"flex items-center justify-between px-3 py-1.5 ga\
p-2",children:[u(be,{items:su,value:t.tf,onChange:e=>m({tf:e})}),u("button",{onClick:()=>E(e=>!e),className:`h-8 px-3 rounded-full text-xs ${P?"bg-warn text-bg \
font-semibold":"bg-panel2 text-muted"}`,children:P?"\uD3B8\uC9D1 \uC644\uB8CC":"\uBC15\uC2A4 \uD3B8\uC9D1"})]}),u("div",{className:"flex-1 min-h-0",children:l.candles.
length?u(Je,{viewKey:`${t.symbol}:${t.tf}`,candles:l.candles,pressures:B.pressures,box:B.box,signals:B.history,positions:Be,dp:r.dp,showHist:t.showHist,editBox:P,
onBoxEdit:(e,n)=>{var C;const a={top:e,bottom:n,startTs:(d==null?void 0:d.startTs)??((C=B.box)==null?void 0:C.startTime)??Date.now(),locked:!0};v(a),j(`dupont.b\
ox.${t.symbol}`,a)}}):u("div",{className:"p-6 text-muted text-sm",children:l.err?`\uB370\uC774\uD130 \uC624\uB958: ${l.err}`:"\uCE94\uB4E4 \uBD88\uB7EC\uC624\uB294 \uC911\u2026"})}),
u(gu,{box:B.box,manual:d,dp:r.dp,tape:B.tapeCandles,onUnlock:()=>{v(null),j(`dupont.box.${t.symbol}`,null),E(!1)},onEdit:(e,n)=>{var C;const a={top:e,bottom:n,startTs:(d==
null?void 0:d.startTs)??((C=B.box)==null?void 0:C.startTime)??Date.now(),locked:!0};v(a),j(`dupont.box.${t.symbol}`,a)}}),le.filter(e=>e.flip.alert).map(e=>s("d\
iv",{className:"mx-3 mb-2 rounded-lg bg-warn/15 border border-warn px-3 py-2 flex items-center justify-between",children:[s("span",{className:"text-[13px] text-\
warn font-semibold",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",e.flip.multiple.toFixed(1),"\uBC30)"]}),u(K,{tone:"warn",className:"\
h-9",onClick:()=>xe(e.p,1,"\uC555\uB825\uBC18\uC804 \uCCAD\uC0B0"),children:"\uCCAD\uC0B0"})]},e.p.id)),u(vu,{g:W,dp:r.dp,acted:W?G.current.has(Z(W)):!1,stale:W?
ve(W):null,onEnter:()=>W&&Ne(W),onEdit:()=>W&&We(W)})]}),i==="\uAC70\uB798"&&u(yu,{s:t,set:m,last:b,dp:r.dp,book:l.book,equity:ge,available:me,qtyStep:r.qtyStep,
draft:He,setDraft:ke,defaultDraft:Ke,sizeFor:ye,onSubmit:(e,n,a,C)=>{var V;const o=Number(e.sl),A=e.kind==="breakout"||!e.tp2?[{price:Number(e.tp1),fraction:1,label:e.
kind==="breakout"?"TP 1:3":"TP"}]:[{price:Number(e.tp1),fraction:.5,label:"TP1 \uC911\uC559\uC120"},{price:Number(e.tp2),fraction:.5,label:"TP2 \uBC18\uB300\uD3B8"}],
g=((V=e.signal)==null?void 0:V.type)??"MANUAL",M=e.kind==="breakout"&&B.box?Number(e.side==="long"?B.box.top:B.box.bottom):void 0;if(n==="limit"){const y=x.current.
placeLimit({symbol:t.symbol,side:e.side,qty:C,price:a,leverage:t.leverage,sl:o,targets:A,setup:g,breakoutLevel:M,riskBudget:De()});N(y.ok?`\uC9C0\uC815\uAC00 ${e.
side==="long"?"\uB871":"\uC20F"} \uC8FC\uBB38 ${c(C,r.qdp)} @ ${c(a,r.dp)}`:y.error??"\uC8FC\uBB38 \uC2E4\uD328",y.ok?"up":"down")}else{const y=x.current.open({
symbol:t.symbol,side:e.side,qty:C,price:b,refPx:re(e.side),leverage:t.leverage,sl:o,targets:A,setup:g,breakoutLevel:M,signalId:e.signal?Z(e.signal):void 0,riskBudget:De()});
N(y.ok?`${e.side==="long"?"\uB871":"\uC20F"} \uBAA8\uC758 \uC9C4\uC785 ${c(C,r.qdp)} @ ${c(y.fillPx??b,r.dp)}`:y.error??"\uC9C4\uC785 \uC2E4\uD328",y.ok?"up":"d\
own"),y.ok&&e.signal&&(G.current.add(Z(e.signal)),j(de,[...G.current].slice(-300)))}S()}},t.symbol),i==="\uD3EC\uC9C0\uC158"&&s("div",{className:"flex-1 overflo\
w-y-auto p-3 space-y-3",children:[s(_,{className:"p-3",children:[u(F,{k:"\uC790\uC0B0 (Equity)",v:`${c(ge)} USDT`}),u(F,{k:"\uAC00\uC6A9",v:`${c(me)} USDT`}),u(
F,{k:"\uBBF8\uC2E4\uD604 \uC190\uC775 (\uC21C, \uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC)",v:(()=>{const e=T.positions.reduce((a,C)=>{const o=z[C.symbol]??C.entry;return a+
qe(C,o)-C.entryFeeLeft-o*C.qty*I},0),n=Number(e.toFixed(2));return s("span",{className:n>0?"text-up":n<0?"text-down":"",children:[R(e)," USDT"]})})()})]}),!T.positions.
length&&u("div",{className:"text-muted text-sm text-center py-8",children:"\uBCF4\uC720 \uD3EC\uC9C0\uC158 \uC5C6\uC74C"}),T.positions.map(e=>{var A;const n=le.
find(g=>g.p.id===e.id),a=z[e.symbol]??e.entry,C=qe(e,a)-e.entryFeeLeft-a*e.qty*I,o=U(e.symbol).dp;return s(_,{className:"p-3",children:[s("div",{className:"flex\
 justify-between items-center mb-1",children:[s("div",{className:"font-semibold",children:[u("span",{className:e.side==="long"?"text-up":"text-down",children:e.
side==="long"?"\uB871":"\uC20F"})," ",e.symbol," ",s("span",{className:"text-muted text-xs",children:[e.leverage,"x \xB7 ",Oe(e.setup)]})]}),s("div",{className:"\
text-right",children:[s("div",{className:`num font-semibold ${C>=0?"text-up":"text-down"}`,children:[R(C)," USDT"]}),u("div",{className:"text-[10px] text-muted",
children:"\uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC \uC21C\uC190\uC775"})]})]}),u(F,{k:"\uC218\uB7C9 / \uC9C4\uC785\uAC00",v:`${c(e.qty,U(e.symbol).qdp)} / ${c(e.entry,o)}`}),
u(F,{k:"\uB9C8\uD06C / \uCCAD\uC0B0\uAC00",v:`${c(a,o)} / ${c(e.liqPrice,o)}`}),u(F,{k:`SL${e.beMoved?" (\uBCF8\uC808)":""}`,v:c(e.sl,o)}),e.targets.map((g,M)=>u(
F,{k:g.label,v:s("span",{className:g.done?"text-up":"",children:[c(g.price,o)," \xB7 ",Math.round(g.fraction*100),"% ",g.done?"\u2713 \uCCB4\uACB0":"\uB300\uAE30"]})},
M)),u(F,{k:"\uACC4\uD68D \uB9AC\uC2A4\uD06C (1R)",v:e.riskUsd?`${c(e.riskUsd)} USDT`:"\u2014"}),e.riskBudget!==void 0&&u(F,{k:"\uB9AC\uC2A4\uD06C \uC608\uC0B0 (\uC9C4\uC785 \uC2DC \uACE0\uC815)",
v:`${c(e.riskBudget)} USDT`}),(e.fundingAcc??0)!==0&&u(F,{k:"\uD380\uB529\uBE44 \uB204\uC801 (\uBBF8\uC815\uC0B0)",v:s("span",{className:(e.fundingAcc??0)>0?"te\
xt-down":"text-up",children:[R(-(e.fundingAcc??0),4)," USDT"]})}),u(F,{k:"\uC2E4\uD604 \uC190\uC775 (\uC21C, \uD380\uB529 \uD3EC\uD568)",v:R(e.realizedNet)}),(n==
null?void 0:n.flip.alert)&&s("div",{className:"mt-2 text-[12px] text-warn",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",n.flip.
multiple.toFixed(1),"\uBC30, \uBAA9\uD45C \uC9C4\uD589 ",Math.round(n.flip.progress*100),"%)"]}),(n==null?void 0:n.pyr)&&s("div",{className:`mt-1 text-[11px] ${n.
pyr.add?"text-accent":"text-muted"}`,children:["\uBD88\uD0C0\uAE30 ",e.adds,"/",t.maxAdds,": ",Au(n.pyr,U(e.symbol).dp)]}),!(n!=null&&n.pyr)&&s("div",{className:"\
mt-1 text-[11px] text-muted",children:["\uBD88\uD0C0\uAE30: \uB3CC\uD30C \uC2E0\uD638 \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 (\uCD5C\uB300 ",t.maxAdds,
"\uD68C)"]}),s("div",{className:"grid grid-cols-3 gap-2 mt-3",children:[u(K,{tone:"down",onClick:()=>xe(e,1,"\uC2DC\uC7A5\uAC00 \uCCAD\uC0B0"),children:"\uC804\uB7C9 \uCCAD\uC0B0"}),
u(K,{onClick:()=>xe(e,.5,"50% \uCCAD\uC0B0"),children:"50% \uCCAD\uC0B0"}),u(K,{tone:"accent",disabled:!((A=n==null?void 0:n.pyr)!=null&&A.add)||e.adds>=t.maxAdds||
e.symbol!==t.symbol,onClick:()=>(n==null?void 0:n.pyr)&&Ie(e,n.pyr),children:"\uBD88\uD0C0\uAE30"})]})]},e.id)}),T.pending.length>0&&s(_,{className:"p-3",children:[
u("div",{className:"text-sm font-semibold mb-1",children:"\uBBF8\uCCB4\uACB0 \uC9C0\uC815\uAC00"}),T.pending.map(e=>s("div",{className:"flex justify-between ite\
ms-center py-1 text-[13px]",children:[s("span",{className:e.side==="long"?"text-up":"text-down",children:[e.side==="long"?"\uB871":"\uC20F"," ",e.symbol," ",c(e.
qty,U(e.symbol).qdp)," @ ",c(e.price,U(e.symbol).dp)]}),u("button",{className:"text-muted underline",onClick:()=>{x.current.cancelLimit(e.id),S()},children:"\uCDE8\uC18C"})]},
e.id))]})]}),i==="\uAE30\uB85D"&&u(Nu,{broker:x.current}),i==="\uC124\uC815"&&s("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[s(_,{className:"\
p-3",children:[u("div",{className:"text-sm font-semibold mb-2",children:"\uC790\uAE08"}),u(F,{k:"\uC2DC\uB4DC / \uC9C0\uAC11",v:`${c(T.bankroll)} / ${c(T.wallet)}\
 USDT`}),u(K,{tone:"down",className:"w-full mt-2",onClick:()=>{confirm("\uBAA8\uC758 \uC790\uAE08\uC744 200 USDT\uB85C \uCD08\uAE30\uD654\uD558\uACE0 \uD3EC\uC9C0\uC158\xB7\uAE30\uB85D\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?")&&
(x.current.reset(du),S(),N("200 USDT\uB85C \uCD08\uAE30\uD654"))},children:"\uC790\uAE08 \uCD08\uAE30\uD654 (200 USDT)"})]}),s(_,{className:"p-3 space-y-3",children:[
u("div",{className:"text-sm font-semibold",children:"\uB9AC\uC2A4\uD06C"}),s("div",{className:"grid grid-cols-2 gap-2",children:[u(w,{label:"\uAC70\uB798\uB2F9 \uB9AC\uC2A4\uD06C %",
value:String(t.riskPct),onChange:e=>m({riskPct:Math.max(.1,Number(e)||1)}),suffix:"%"}),u(w,{label:"\uAE30\uBCF8 \uB808\uBC84\uB9AC\uC9C0",value:String(t.leverage),
onChange:e=>m({leverage:Math.min(125,Math.max(1,Math.round(Number(e)||1)))}),suffix:"x"}),u(w,{label:"\uBD88\uD0C0\uAE30 \uCD5C\uB300 \uD69F\uC218",value:String(
t.maxAdds),onChange:e=>m({maxAdds:Math.max(0,Math.round(Number(e)||0))})}),u(w,{label:"\uBD88\uD0C0\uAE30 \uD06C\uAE30 (\uCD08\uAE30 \uB300\uBE44)",value:String(
t.addSizePct),onChange:e=>m({addSizePct:Math.max(5,Number(e)||50)}),suffix:"%"})]}),u(ne,{on:t.moveSlToBe,onChange:e=>m({moveSlToBe:e}),label:"TP1 \uCCB4\uACB0 \uD6C4 SL \uBCF8\uC808 \uC774\uB3D9",
hint:"\uBCF8\uC808\uAC00 = \uC9C4\uC785\uAC00 + \uB0A8\uC740 \uC9C4\uC785\xB7\uCCAD\uC0B0 \uC218\uC218\uB8CC (\uC190\uC2E4 \uC5C6\uC774 \uCCAD\uC0B0)"}),u(ne,{on:t.
autoPaper,onChange:e=>m({autoPaper:e}),label:"\uC790\uB3D9 \uBAA8\uC758\uB9E4\uB9E4",hint:"\uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 \uC2E0\uD638\uB9CC \xB7 \uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30 \xB7 \uC77C\uC77C \u22123R \uC815\uC9C0 (\uAE30\uBCF8 OFF)"})]}),
s(_,{className:"p-3 space-y-3",children:[u("div",{className:"text-sm font-semibold",children:"\uBC15\uC2A4 / \uD53C\uBD07"}),s("div",{className:"grid grid-cols-\
2 gap-2",children:[u(w,{label:"\uB8E9\uBC31 (\uCE94\uB4E4)",value:String(t.lookback),onChange:e=>m({lookback:Math.max(20,Math.round(Number(e)||80))})}),u(w,{label:"\
\uD130\uCE58 \uD5C8\uC6A9 %",value:String(t.tolerancePct),onChange:e=>m({tolerancePct:Math.max(.05,Number(e)||.25)}),suffix:"%"}),u(w,{label:"\uD53C\uBD07 \uC88C",
value:String(t.pivotLeft),onChange:e=>m({pivotLeft:Math.max(1,Math.round(Number(e)||3))})}),u(w,{label:"\uD53C\uBD07 \uC6B0",value:String(t.pivotRight),onChange:e=>m(
{pivotRight:Math.max(1,Math.round(Number(e)||3))})}),u(w,{label:"\uCD5C\uC18C \uD130\uCE58",value:String(t.minTouches),onChange:e=>m({minTouches:Math.max(1,Math.
round(Number(e)||2))})}),u(w,{label:"\uCD5C\uC18C \uBC15\uC2A4 \uB192\uC774 %",value:String(t.minHeightPct),onChange:e=>m({minHeightPct:Math.max(0,Number(e)||0)}),
suffix:"%"})]}),u(ne,{on:t.requireRange,onChange:e=>m({requireRange:e}),label:"\uBC15\uC2A4\uAD8C(\uBE44\uCD94\uC138)\uC77C \uB54C\uB9CC \uC2E0\uD638"}),u(ne,{on:t.
showHist,onChange:e=>m({showHist:e}),label:"\uC555\uB825 \uD788\uC2A4\uD1A0\uADF8\uB7A8 \uD45C\uC2DC"})]}),u(_,{className:"p-3",children:u(ne,{on:t.notify,onChange:async e=>{
e&&"Notification"in window&&Notification.permission!=="granted"&&await Notification.requestPermission(),m({notify:e})},label:"\uC54C\uB9BC",hint:"\uC2E0\uD638\xB7\uCCB4\uACB0\xB7\uC555\uB825\uBC18\uC804 (\uD648 \
\uD654\uBA74 \uC571\uC5D0\uC11C \uAD8C\uC7A5)"})}),s("div",{className:"text-[11px] text-muted px-1 pb-4 leading-5",children:["\uD398\uC774\uD37C(\uBAA8\uC758) \uD2B8\uB808\uC774\uB529 \uC804\uC6A9 \xB7 \uC2E4\uACC4\uC88C/API \uD0A4 \uC5C6\uC74C \xB7 B\
itget \uACF5\uAC1C \uC2DC\uC138 \uC0AC\uC6A9. \uC218\uC218\uB8CC: Bitget USDT-M \uD14C\uC774\uCEE4 0.06% / \uBA54\uC774\uCEE4 0.02% (TP\uB3C4 \uD14C\uC774\uCEE4\uB85C \uBCF4\uC218 \uACC4\uC0B0). \uC2AC\uB9AC\uD53C\uC9C0 ",
Ce,"bp (\uC2DC\uC7A5\uAC00\xB7\uC190\uC808). \uD380\uB529\uBE44: 00/08/16\uC2DC UTC \uC815\uC0B0 \uD380\uB529\uB960(Bitget \uACF5\uAC1C \uC774\uB825, \uC5C6\uC73C\uBA74 \uC815\uC0B0 \uC9C1\uC804 \uD380\uB529\uB960). \uAC15\uC81C\uCCAD\uC0B0 = \uACA9\uB9AC \uC99D\uAC70\uAE08 \uC804\uC561 \uC190\uC2E4. \uB3CC\uD30C TP 1:3\uC740 \uC218\uC218\uB8CC \uCC28\uAC10 \uC21C\uC190\uC775 \uAE30\uC900. \uC571\uC774 \uAEBC\uC838 \uC788\uB358 \uB3D9\uC548\uC740 \uB2E4\uC2DC \uC5F4 \uB54C 1\uBD84\uBD09\uC73C\uB85C \uC7AC\uC0DD (SL\xB7TP \uB3D9\uC2DC \uD130\
\uCE58 \uC2DC SL \uC6B0\uC120). \uC555\uB825: \uC2E4\uC2DC\uAC04 \uCCB4\uACB0(aggressor) \uC9D1\uACC4, \uC5F0\uACB0 \uC774\uC804 \uCE94\uB4E4\uC740 OHLCV \uADFC\uC0AC."]})]})]}),
u("nav",{className:"border-t border-line bg-panel pb-safe grid grid-cols-5",children:bu.map(e=>u("button",{onClick:()=>D(e),className:`h-14 text-[13px] relative\
 ${i===e?"text-accent font-semibold":"text-muted"}`,children:s("span",{className:"inline-flex items-center gap-1",children:[e,e==="\uD3EC\uC9C0\uC158"&&T.positions.
length>0&&u("span",{className:"min-w-4 h-4 px-1 rounded-full bg-accent text-bg text-[10px] leading-4 font-semibold",children:T.positions.length})]})},e))})]})}function gu({
box:i,manual:D,dp:t,tape:k,onUnlock:m,onEdit:r}){const[l,d]=q(!1),[v,P]=q(""),[E,B]=q("");return i?s("div",{className:"px-3 py-1.5 border-t border-line text-[12\
px]",children:[s("div",{className:"flex items-center justify-between gap-2",children:[s("div",{className:"num leading-5",children:[u("span",{className:"text-mut\
ed",children:"\uBC15\uC2A4 "}),u("span",{className:"text-down",children:c(i.bottom,t)})," \u2013 ",u("span",{className:"text-up",children:c(i.top,t)}),u("span",
{className:"text-muted",children:" \xB7 50% "}),c(i.mid,t)]}),s("div",{className:"flex gap-1.5 items-center",children:[u("span",{className:`px-1.5 py-0.5 rounde\
d text-[10px] ${i.isRange?"bg-up/20 text-up":"bg-warn/20 text-warn"}`,children:D?"\uC218\uB3D9\xB7\uACE0\uC815":i.isRange?"\uBC15\uC2A4\uAD8C":"\uCD94\uC138/\uC57D\uD568"}),
u("button",{className:"text-accent",onClick:()=>{P(String(Number(i.top))),B(String(Number(i.bottom))),d(h=>!h)},children:"\uC218\uC815"}),D&&u("button",{className:"\
text-muted",onClick:m,children:"\uC790\uB3D9"})]})]}),s("div",{className:"text-[10px] text-muted",children:["\uD130\uCE58 ",i.touchesTop,"/",i.touchesBottom," \xB7\
 \uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 ",k,"\uCE94\uB4E4 (\uADF8 \uC678 OHLCV \uADFC\uC0AC)"]}),l&&s("div",{className:"grid grid-cols-3 gap-2 mt-2 items-\
end",children:[u(w,{label:"\uC0C1\uB2E8(\uC800\uD56D)",value:v,onChange:P}),u(w,{label:"\uD558\uB2E8(\uC9C0\uC9C0)",value:E,onChange:B}),u(K,{tone:"accent",onClick:()=>{
const h=Number(v),x=Number(E);h>0&&x>0&&h!==x&&(r(h,x),d(!1))},children:"\uACE0\uC815"})]})]}):u("div",{className:"px-3 py-2 text-[12px] text-muted border-t bor\
der-line",children:"\uBC15\uC2A4 \uD0D0\uC9C0 \uC911\u2026 (\uD53C\uBD07 \uD130\uCE58 \uBD80\uC871)"})}function vu({g:i,dp:D,acted:t,stale:k,onEnter:m,onEdit:r}){
if(!i)return u("div",{className:"mx-3 mb-2 px-3 py-2 rounded-lg bg-panel border border-line text-[12px] text-muted",children:"\uC2E0\uD638 \uB300\uAE30 \uC911 \xB7 \uBC15\uC2A4 \uC9C0\uC9C0/\uC800\uD56D + \uC7A5\uC545\uD615 + \uC555\uB825 \uD655\uC778 \uC2DC\
 \uD45C\uC2DC"});const l=i.side==="long";return s("div",{className:`mx-3 mb-2 rounded-xl border px-3 py-2 ${l?"border-up/60 bg-up/10":"border-down/60 bg-down/10"}`,
children:[s("div",{className:"flex justify-between items-center",children:[s("div",{className:`font-semibold ${l?"text-up":"text-down"}`,children:[se[i.type]," ",
s("span",{className:"text-muted text-[11px] font-normal",children:[Ae(i.ts)," \uB9C8\uAC10"]})]}),s("div",{className:"text-[11px] text-muted flex items-center g\
ap-1.5",children:[i.pressure.source==="ohlcv"&&u("span",{className:"px-1.5 py-0.5 rounded bg-warn/20 text-warn text-[10px]",children:"\uC555\uB825 \uADFC\uC0AC(OHLCV)"}),
s("span",{children:["\uB9E4\uC218\uC555\uB825 ",Math.round(i.pressure.ratio*100),"%"]})]})]}),s("div",{className:"grid grid-cols-4 gap-1 text-[11px] num mt-1",children:[
s("div",{children:[u("div",{className:"text-muted",children:"\uC9C4\uC785"}),c(i.entry,D)]}),s("div",{children:[u("div",{className:"text-muted",children:"SL"}),
u("span",{className:"text-warn",children:c(i.sl,D)})]}),i.targets.map(d=>s("div",{children:[s("div",{className:"text-muted",children:[d.label," ",d.sizePct,"%"]}),
u("span",{className:"text-up",children:c(d.price,D)})]},d.label))]}),s("div",{className:"flex gap-2 mt-2",children:[u(K,{tone:l?"up":"down",className:"flex-1 h-\
10 text-[13px]",disabled:t||!!k,onClick:m,children:t?"\uC9C4\uC785 \uC644\uB8CC/\uCC98\uB9AC\uB428":k??`\uD0ED\uD558\uC5EC \uBAA8\uC758 ${l?"\uB871":"\uC20F"} \uC9C4\
\uC785`}),u(K,{className:"h-10",onClick:r,children:"\uC218\uC815"})]})]})}function yu(i){const[D,t]=q("market"),[k,m]=q(""),[r,l]=q(""),d=i.draft??i.defaultDraft(
"long");Q(()=>{!i.draft&&i.last&&i.setDraft(i.defaultDraft("long"))},[i.last>0]);const v=D==="limit"&&Number(k)>0?Number(k):i.last,P=Number(d.sl);let E=null;try{
E=v>0&&P>0&&P!==v?i.sizeFor(v,P):null}catch{E=null}const B=Math.max(0,Math.round(-Math.log10(i.qtyStep))),h=r?ru(Number(r)||0,i.qtyStep):Number((E==null?void 0:
E.qty)??0),x=d.side==="long",p=Number(d.tp1),L=Number(d.tp2),S=x?P<v:P>v,O=p>0&&(x?p>v:p<v)&&(d.kind==="breakout"||!d.tp2||(x?L>p:L<p)),H=h*v,N=H>=J,b=H/i.s.leverage,
z=D==="limit"?xu:I,ee=D==="limit"?0:Le,ie=Math.abs(v-P)*h+v*h*(z+ee)+P*h*(I+Le),ue=S&&O&&N&&b+v*h*z<=i.available+1e-9,ae=E!=null&&E.belowMin&&!r?`\uB9AC\uC2A4\uD06C ${i.
s.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${J} USDT / ${i.qtyStep}) \uBBF8\uB9CC`:S?O?N?"\uAC00\uC6A9 \uC99D\uAC70\uAE08 \uBD80\uC871":
`\uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561 ${J} USDT \uC774\uC0C1 \uD544\uC694`:`TP\uAC00 \uC9C4\uC785\uAC00 ${x?"\uC704":"\uC544\uB798"}(TP2\uB294 TP1 \uB108\uBA38)\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`:
`SL\uC774 \uC9C4\uC785\uAC00 ${x?"\uC544\uB798":"\uC704"}\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`,X=f=>i.setDraft({...d,...f});return s("div",{className:"f\
lex-1 overflow-y-auto px-3 pt-3",children:[s("div",{className:"grid grid-cols-[minmax(0,1fr)_124px] gap-2.5",children:[s("div",{className:"space-y-2.5",children:[
u("div",{className:"grid grid-cols-2 gap-1 bg-panel2 rounded-lg p-1",children:["long","short"].map(f=>u("button",{onClick:()=>{l(""),i.setDraft(d.signal&&d.side===
f?d:i.defaultDraft(f))},className:`h-9 rounded-md font-semibold text-sm ${d.side===f?f==="long"?"bg-up text-white":"bg-down text-white":"text-muted"}`,children:f===
"long"?"\uB871":"\uC20F"},f))}),u(be,{items:["market","limit"],value:D,onChange:f=>t(f),fmt:f=>f==="market"?"\uC2DC\uC7A5\uAC00":"\uC9C0\uC815\uAC00"}),D==="lim\
it"&&u(w,{label:"\uC9C0\uC815\uAC00",value:k,onChange:m}),s("div",{children:[u("span",{className:"text-[11px] text-muted",children:"\uB808\uBC84\uB9AC\uC9C0"}),
u(be,{items:[3,5,10,20],value:i.s.leverage,onChange:f=>i.set({leverage:f}),fmt:f=>`${f}x`})]}),u(w,{label:"\uB9AC\uC2A4\uD06C (\uC790\uC0B0 \uB300\uBE44)",value:String(
i.s.riskPct),onChange:f=>{l(""),i.set({riskPct:Math.max(.1,Number(f)||1)})},suffix:"%"}),u(w,{label:"\uC190\uC808 SL",value:String(d.sl),onChange:f=>X({sl:f})}),
u(w,{label:d.kind==="breakout"?"TP (\uC21C 1:3, 100%)":"TP1 \uC911\uC559\uC120 (50%)",value:String(d.tp1),onChange:f=>X({tp1:f})}),d.kind==="range"&&u(w,{label:"\
TP2 \uBC18\uB300\uD3B8 \uACBD\uACC4 (50%)",value:String(d.tp2),onChange:f=>X({tp2:f})}),u(w,{label:`\uC218\uB7C9 (\uB9AC\uC2A4\uD06C ${i.s.riskPct}%: ${E?c(E.qty,
B):"\u2014"})`,value:r||(E?Number(E.qty).toFixed(B):""),onChange:l})]}),u("div",{className:"bg-panel rounded-xl border border-line py-2",children:u(Xe,{book:i.book,
dp:i.dp,qdp:B,rows:7})})]}),d.signal&&s("div",{className:"mt-2 text-[11px] text-accent",children:["\uC2E0\uD638 \uC790\uB3D9 \uC785\uB825: ",se[d.signal.type],"\
 (",Ae(d.signal.ts)," \uB9C8\uAC10) \xB7 SL/TP \uC790\uB3D9"]}),s(_,{className:"p-3 mt-3",children:[u(F,{k:"\uC9C4\uC785 \uAE30\uC900\uAC00",v:c(v,i.dp)}),u(F,{
k:"\uC99D\uAC70\uAE08 / \uBA85\uBAA9",v:h>0?`${c(b)} / ${c(H)} USDT`:"\u2014"}),u(F,{k:"SL \uC2DC \uC21C\uC190\uC2E4 (\uC218\uC218\uB8CC\xB7\uC2AC\uB9AC\uD53C\uC9C0)",
v:h>0&&S?s("span",{className:"text-down",children:["-",c(ie)," USDT (",(ie/Math.max(i.equity,1e-9)*100).toFixed(2),"%)"]}):"\u2014"}),h>0&&O&&u(F,{k:d.kind==="b\
reakout"||!d.tp2?"TP \uC2DC \uC21C\uC774\uC775":"TP1+TP2 \uC2DC \uC21C\uC774\uC775",v:s("span",{className:"text-up",children:["+",c((d.kind==="breakout"||!d.tp2?
Math.abs(p-v)*h-p*h*I:Math.abs(p-v)*h*.5+Math.abs(L-v)*h*.5-(p+L)*h*.5*I)-v*h*(z+ee))," USDT"]})}),u(F,{k:"\uAC00\uC6A9 / \uC790\uC0B0",v:`${c(i.available)} / ${c(
i.equity)} USDT`})]}),s("div",{className:"sticky bottom-0 -mx-3 px-3 pt-2 pb-3 mt-1 bg-bg/95 backdrop-blur border-t border-line",children:[!ue&&(h>0||(E==null?void 0:
E.belowMin))&&u("div",{className:"text-[11px] text-down mb-1",children:ae}),u(K,{tone:d.side==="long"?"up":"down",className:"w-full h-12 text-[16px]",disabled:!ue||
!(h>0),onClick:()=>{i.onSubmit(d,D,v,h),l("")},children:d.side==="long"?"\uB871 (\uB9E4\uC218) \uBAA8\uC758 \uC9C4\uC785":"\uC20F (\uB9E4\uB3C4) \uBAA8\uC758 \uC9C4\uC785"})]})]})}
function Nu({broker:i}){var B,h,x;const D=i.state,t=Du(D.fills,D.positions.map(p=>p.id)),k=D.equityCurve,m=360,r=120,l=k.map(p=>p.equity),d=Math.min(...l,D.bankroll),
v=Math.max(...l,D.bankroll),P=k.map((p,L)=>`${L?"L":"M"}${L/Math.max(1,k.length-1)*m},${r-(p.equity-d)/Math.max(1e-9,v-d)*(r-10)-5}`).join(" "),E=async()=>{var H;
const p=hu(D.fills),L=`dupont-paper-${new Date().toISOString().slice(0,10)}.csv`,S=new File([p],L,{type:"text/csv"});if((H=navigator.canShare)!=null&&H.call(navigator,
{files:[S]}))try{await navigator.share({files:[S],title:L});return}catch{}const O=document.createElement("a");O.href=URL.createObjectURL(S),O.download=L,O.click(),
setTimeout(()=>URL.revokeObjectURL(O.href),2e3)};return s("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[s(_,{className:"p-3",children:[s("di\
v",{className:"grid grid-cols-3 text-center",children:[s("div",{children:[u("div",{className:"text-[11px] text-muted",children:"\uAC70\uB798"}),u("div",{className:"\
num font-semibold",children:t.trades})]}),s("div",{children:[u("div",{className:"text-[11px] text-muted",children:"\uC2B9\uB960"}),u("div",{className:"num font-\
semibold",children:t.trades?`${(t.winRate*100).toFixed(0)}%`:"\u2014"})]}),s("div",{children:[u("div",{className:"text-[11px] text-muted",children:"\uC21C\uC190\uC775"}),
u("div",{className:`num font-semibold ${t.net>=0?"text-up":"text-down"}`,children:R(t.net)})]})]}),s("div",{className:"text-[11px] text-muted text-center mt-1",
children:["\uC218\uC218\uB8CC \uD569\uACC4 ",c(t.fees,3)," USDT (\uC21C\uC190\uC775\uC5D0 \uBC18\uC601)",t.funding!==0?` \xB7 \uD380\uB529 ${R(-t.funding,3)}`:"",
t.partialNet!==0?` \xB7 \uBCF4\uC720 \uC911 \uBD80\uBD84\uCCAD\uC0B0 ${R(t.partialNet)} \uD3EC\uD568`:""]}),t.rTrades>0&&s("div",{className:"text-[11px] text-mu\
ted text-center num",children:["\uAE30\uB300\uAC12 ",s("span",{className:t.expectancyR>=0?"text-up":"text-down",children:[R(t.expectancyR),"R"]})," \xB7 \uD3C9\uADE0 \uC2B9 ",
R(t.avgWinR),"R / \uD328 ",R(t.avgLossR),"R (",t.rTrades,"\uAC74)"]})]}),s(_,{className:"p-3",children:[s("div",{className:"flex justify-between text-[12px] tex\
t-muted mb-1 num",children:[u("span",{children:"\uC790\uC0B0 \uACE1\uC120"}),s("span",{children:[c(((B=k[0])==null?void 0:B.equity)??D.bankroll)," \u2192 ",u("s\
pan",{className:(((h=k[k.length-1])==null?void 0:h.equity)??D.bankroll)>=D.bankroll?"text-up":"text-down",children:c(((x=k[k.length-1])==null?void 0:x.equity)??
D.bankroll)})," USDT"]})]}),s("svg",{viewBox:`0 0 ${m} ${r}`,className:"w-full h-[120px]",children:[u("line",{x1:"0",x2:m,y1:r-(D.bankroll-d)/Math.max(1e-9,v-d)*
(r-10)-5,y2:r-(D.bankroll-d)/Math.max(1e-9,v-d)*(r-10)-5,stroke:"#262e38",strokeDasharray:"4 4"}),u("path",{d:P,fill:"none",stroke:"#00c2cb",strokeWidth:"2"})]}),
D.positions.length>0&&u("div",{className:"text-[11px] text-muted mt-1",children:"\uC9C0\uAC11 \uAE30\uC900 \xB7 \uBCF4\uC720 \uD3EC\uC9C0\uC158\uC758 \uC9C4\uC785 \uC218\uC218\uB8CC\uB294 \uC774\uBBF8 \uCC28\uAC10\uB428 (\uBBF8\uC2E4\uD604 \uC190\uC775 \uC81C\uC678)"})]}),
u(K,{className:"w-full",onClick:E,disabled:!D.fills.length,children:"CSV \uB0B4\uBCF4\uB0B4\uAE30"}),[...D.fills].reverse().map(p=>s(_,{className:"p-3",children:[
s("div",{className:"flex justify-between text-[13px]",children:[s("span",{children:[u("span",{className:p.side==="long"?"text-up":"text-down",children:p.side===
"long"?"\uB871":"\uC20F"})," ",p.symbol," \xB7 ",Oe(p.setup)]}),s("span",{className:`num font-semibold ${p.netPnl>=0?"text-up":"text-down"}`,children:[R(p.netPnl),
" USDT"]})]}),s("div",{className:"text-[11px] text-muted num mt-0.5",children:[Ae(p.closedAt)," \xB7 ",p.reason," \xB7 ",c(p.qty,U(p.symbol).qdp)," \xB7 ",c(p.entry,
U(p.symbol).dp)," \u2192 ",c(p.exit,U(p.symbol).dp)," \xB7 \uC218\uC218\uB8CC ",c(p.fees,3),p.funding?` \xB7 \uD380\uB529 ${R(-p.funding,3)}`:"",p.r!==void 0?` \
\xB7 ${R(p.r)}R`:""]})]},p.id)),!D.fills.length&&u("div",{className:"text-muted text-sm text-center py-6",children:"\uAC70\uB798 \uAE30\uB85D \uC5C6\uC74C"})]})}
ze.createRoot(document.getElementById("root")).render(u(fu,{}));if("serviceWorker"in navigator){const i="/dupont-mobile/";window.addEventListener("load",()=>navigator.
serviceWorker.register(`${i}sw.js`,{scope:i}).catch(()=>{}))}
