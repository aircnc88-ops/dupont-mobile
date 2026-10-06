import{jsxs as s,jsx as e,Fragment as ju}from"react/jsx-runtime";import zu from"react-dom/client";import{useState as L,useEffect as X,useRef as Cu,useCallback as Mu,
useMemo as Pu}from"react";import{e as Gu,f as Vu,c as Ru,s as Qu,n as Yu}from"./strategy-Cu9CvPGE.js";import{C as gu,a as Ju,B as z,b as H,R as F,N as w,T as nu,
O as Xu}from"./ui-D8ZQmuK7.js";import{l as Zu,s as O,u as ue,a as du,b as ee,R as te,c as Ce,d as Q,f as o,S as ne,p as se,T as ie,e as q,r as ae,g as re,m as iu,
M as Z,D as le,h as oe,i as ce}from"./market-vR1ul0hK.js";import{P as de,n as Be,u as qu,T as j,D as me,S as su,t as pe,r as De,s as he,a as xe,M as Ae,b as Lu,
f as be}from"./paper-DVHNhHn6.js";import"decimal.js";import"lightweight-charts";(function(){const D=document.createElement("link").relList;if(D&&D.supports&&D.supports(
"modulepreload"))return;for(const B of document.querySelectorAll('link[rel="modulepreload"]'))k(B);new MutationObserver(B=>{for(const r of B)if(r.type==="childL\
ist")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&k(l)}).observe(document,{childList:!0,subtree:!0});function t(B){const r={};return B.
integrity&&(r.integrity=B.integrity),B.referrerPolicy&&(r.referrerPolicy=B.referrerPolicy),B.crossOrigin==="use-credentials"?r.credentials="include":B.crossOrigin===
"anonymous"?r.credentials="omit":r.credentials="same-origin",r}function k(B){if(B.ep)return;B.ep=!0;const r=t(B);fetch(B.href,r)}})();const ge=["\uCC28\uD2B8","\
\uAC70\uB798","\uD3EC\uC9C0\uC158","\uAE30\uB85D","\uC124\uC815"],au={RANGE_LONG:"\uBC15\uC2A4 \uBC18\uC804 \uB871",RANGE_SHORT:"\uBC15\uC2A4 \uBC18\uC804 \uC20F",
FAKE_BREAKOUT_LONG:"\uAC00\uC9DC \uC774\uD0C8 \uB871",FAKE_BREAKOUT_SHORT:"\uAC00\uC9DC \uB3CC\uD30C \uC20F",BREAKOUT_LONG:"\uC9C4\uC9DC \uB3CC\uD30C \uB871",BREAKOUT_SHORT:"\
\uC9C4\uC9DC \uC774\uD0C8 \uC20F"},Ou=i=>i==="MANUAL"?"\uC218\uB3D9":au[i]??i,bu="dupont.broker.v1",Uu="dupont.settings.v1",Bu="dupont.seen.v1";function fe(i,D){
const t=i.level?o(i.level,D):"";return i.add?`\uB3CC\uD30C \uB808\uBCA8 ${t} \uB9AC\uD14C\uC2A4\uD2B8 \uD655\uC778 \u2013 \uCD94\uAC00 \uC9C4\uC785 \uAC00\uB2A5`:
i.reason.startsWith("max adds")?"\uCD5C\uB300 \uCD94\uAC00 \uD69F\uC218 \uB3C4\uB2EC":i.reason.startsWith("no retest")?`\uB3CC\uD30C \uB808\uBCA8 ${t} \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:
i.reason.startsWith("retest without")?"\uB9AC\uD14C\uC2A4\uD2B8 \uC911 \u2013 \uC7A5\uC545\uD615/\uC555\uB825 \uD655\uC778 \uB300\uAE30":i.reason.startsWith("no\
 broken")?"\uB3CC\uD30C \uB808\uBCA8 \uC815\uBCF4 \uC5C6\uC74C":i.reason.startsWith("pyramiding only")?"\uB3CC\uD30C \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9":
i.reason.startsWith("retest must be")?"\uC9C4\uC785/\uC9C1\uC804 \uCD94\uAC00 \uC774\uD6C4\uC758 \uC0C8 \uCE94\uB4E4\uC5D0\uC11C \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30":
i.reason.startsWith("no move away")?`\uB3CC\uD30C \uB808\uBCA8 ${t}\uC5D0\uC11C 0.5R \uC774\uC0C1 \uC774\uD0C8 \uD6C4 \uB9AC\uD14C\uC2A4\uD2B8 \uB300\uAE30`:"\uB370\uC774\
\uD130 \uBD80\uC871"}function ve(){var Su,$u,Tu,Fu;const[i,D]=L("\uCC28\uD2B8"),[t,k]=L(()=>Zu(Uu,le)),B=u=>k(C=>{const a={...C,...u};return Q(Uu,a),a}),r=O(t.symbol),
l=ue(t.symbol,t.tf),[c,f]=L(()=>du(`dupont.box.${t.symbol}`));X(()=>f(du(`dupont.box.${t.symbol}`)),[t.symbol]);const[M,N]=L(!1),m=ee(l.candles,l.intervalMs,l.tape,
l.tapeVer,l.serverNow,t,c,r.dp),b=(10**-r.dp).toFixed(r.dp),h=Cu(null);h.current||(h.current=new de(du(bu)??void 0)),h.current.moveSlToBe=t.moveSlToBe,h.current.
precision=u=>{const C=O(u);return{dp:C.dp,qdp:C.qdp}};const[p,U]=L(0),S=()=>{Q(bu,h.current.state),U(u=>u+1)},[_,G]=L([]),v=Mu((u,C="info")=>{const a=Date.now()+
Math.random();if(G(n=>[...n.slice(-1),{id:a,text:u,tone:C}]),setTimeout(()=>G(n=>n.filter(d=>d.id!==a)),4e3),t.notify&&"Notification"in window&&Notification.permission===
"granted"&&document.visibilityState!=="visible")try{new Notification("\uB4C0\uD401 \uC2A4\uD0E0\uB2E4\uB4DC",{body:u,icon:"/dupont-mobile/icons/icon.svg"})}catch{}},
[t.notify]),A=((Su=l.ticker)==null?void 0:Su.last)??(($u=l.candles[l.candles.length-1])==null?void 0:$u.close)??0,[Y,eu]=L({});X(()=>{A&&eu(u=>({...u,[t.symbol]:A}))},
[A,t.symbol]);const ru=18e4,tu=Cu({}),lu=async(u,C=!1)=>{const a=Date.now();if(!C&&a-(tu.current[u]??0)<3e4)return;tu.current[u]=a;const n=await ce(u).catch(()=>null);
n!=null&&n.length&&(h.current.setSettledRates(u,n),Q(bu,h.current.state))},I=Cu(new te),y=(u,C,a,n)=>{const d=I.current.tick(h.current.state,u,Date.now());if(d===
"replaying")return[];if(d==="gap")return mu(),[];const x=Date.now(),g=h.current.onPrice(u,C,x,a);return h.current.needsSettledRate(u,x)&&lu(u),g.push(...h.current.
accrueFunding(u,a||C,x,ru)),n!==void 0&&h.current.noteTickerRate(u,n,x),g},mu=async()=>{var a;const u=h.current,C=I.current.begin(u.state,Date.now());for(const n of C)
try{await lu(n,!0);const d=l.serverNow(),x=Math.floor(ae(u.state,n)/6e4)*6e4,{bars:g,clampedFrom:R}=await re(n,x,d),K=u.replayBars(n,g.filter(P=>P.ts>=x&&P.ts+6e4<=
d)),E=K.filter(P=>P.kind==="funding");(E.length>2?K.filter(P=>P.kind!=="funding"):K).forEach(P=>v(`[\uC7AC\uC0DD] ${n} ${P.message}`,P.kind==="sl"||P.kind==="li\
q"?"down":P.kind==="funding"?"info":"up")),E.length>2&&v(`[\uC7AC\uC0DD] ${n} \uD380\uB529\uBE44 ${E.length}\uD68C \uBC18\uC601 (\uB9C8\uC9C0\uB9C9: ${E[E.length-
1].message})`,"info"),R>x&&v(`[\uC7AC\uC0DD] ${n} ${iu(x)}~${iu(R)} \uAD6C\uAC04\uC740 1\uBD84\uBD09 \uC81C\uACF5 \uBC94\uC704(30\uC77C) \uBC16 \u2013 \uC7AC\uC0DD \uC0DD\uB7B5`,
"warn");const W=(a=u.state).lastTickTs??(a.lastTickTs={});W[n]=Math.max(W[n]??0,Date.now()),I.current.succeeded(n),S()}catch{I.current.failed(n,Date.now())&&v(`\
[\uC7AC\uC0DD] ${n} 1\uBD84\uBD09 \uC870\uD68C 3\uD68C \uC2E4\uD328 \u2013 \uD604\uC7AC\uAC00\uB85C \uACC4\uC18D (\uC624\uD504\uB77C\uC778 \uAD6C\uAC04 \uBBF8\uBC18\uC601)`,
"down")}finally{I.current.release(n)}};X(()=>{mu();const u=()=>{document.visibilityState==="visible"&&mu()};return document.addEventListener("visibilitychange",
u),()=>document.removeEventListener("visibilitychange",u)},[]),X(()=>{var C,a;if(!A||I.current.replaying.has(t.symbol))return;const u=y(t.symbol,A,(C=l.ticker)==
null?void 0:C.mark,(a=l.ticker)==null?void 0:a.funding);u.length&&(u.forEach(n=>v(n.message,n.kind==="sl"||n.kind==="liq"?"down":n.kind==="funding"?"info":"up")),
S())},[A]),X(()=>{const u=setInterval(async()=>{const C=new Set([...h.current.state.positions.map(a=>a.symbol),...h.current.state.pending.map(a=>a.symbol)]);C.delete(
t.symbol);for(const a of C){if(I.current.replaying.has(a))continue;const n=await Ce(a).catch(()=>null);if(!n)continue;eu(x=>({...x,[a]:n.last}));const d=y(a,n.last,
n.mark,n.funding);d.length&&(d.forEach(x=>v(`${a} ${x.message}`)),S())}},4e3);return()=>clearInterval(u)},[t.symbol]);const $=h.current.state,fu=h.current.equity(
Y),pu=h.current.available(),Du=$.positions.filter(u=>u.symbol===t.symbol),J=Cu(new Set(du(Bu)??[])),uu=u=>`${t.symbol}:${t.tf}:${u.type}:${u.ts}`,T=m.live[m.live.
length-1]??null,hu=((Tu=m.closed[m.closed.length-1])==null?void 0:Tu.ts)??0,vu=u=>u.ts<hu?"\uC2E0\uD638 \uB9CC\uB8CC (\uCD5C\uADFC \uB9C8\uAC10 \uCE94\uB4E4 \uC544\uB2D8)":
Math.abs(A-Number(u.entry))>.3*Number(u.risk)?"\uAC00\uACA9 \uC774\uD0C8 (\uC2E0\uD638 \uC9C4\uC785\uAC00 \xB10.3R \uCD08\uACFC)":null,ou=u=>{var a,n;const C=u===
"long"?(a=l.ticker)==null?void 0:a.ask:(n=l.ticker)==null?void 0:n.bid;return C&&A&&Math.abs(C-A)/A<.005?C:A},V=Pu(()=>{var a;const u=((a=m.closed[m.closed.length-
3])==null?void 0:a.ts)??0,C=[...m.history].reverse().find(n=>n.ts>=u);return T??C??null},[T,m.history,m.closed]),xu=()=>$.wallet*t.riskPct/100,yu=(u,C)=>Qu({equity:String(
$.wallet),available:String(pu),riskPct:t.riskPct,entry:String(u),sl:String(C),leverage:t.leverage,feeRate:String(j),slippageBps:su,qtyStep:String(r.qtyStep),minQty:String(
r.qtyStep),minNotional:Z}),Nu=(u,C=!1)=>{if($.positions.some(P=>P.symbol===t.symbol)){v("\uC774\uBBF8 \uD3EC\uC9C0\uC158 \uBCF4\uC720 \uC911","down");return}const a=A,
n=vu(u);if(n){v(`${n} \u2013 \uC9C4\uC785 \uBD88\uAC00`,"down");return}const d=Ru({side:u.side,kind:u.kind,entry:String(a),extremeWick:u.sl,box:u.box,slBufferPct:0,
tickSize:b,feeRate:j,slippageBps:su});if(u.kind==="range"&&Yu({side:u.side,entry:d.entry,sl:d.sl,tp:d.targets[0].price,feeRate:j,slippageBps:su})<1){v("\uD604\uC7AC\uAC00 \uAE30\uC900 T\
P1 \uC21C\uC190\uC775\uBE44 1 \uBBF8\uB9CC \u2013 \uC9C4\uC785 \uC0DD\uB7B5","down");return}const x=Number(d.sl),g=pe(d.targets),R=u.side==="long";if(R?!(x<a&&g[0].
price>a):!(x>a&&g[0].price<a)){v("\uD604\uC7AC\uAC00\uAC00 \uC2E0\uD638 \uBC94\uC704\uB97C \uBC97\uC5B4\uB098 \uC9C4\uC785 \uBD88\uAC00 (SL/TP1 \uC0AC\uC774 \uC544\uB2D8)",
"down");return}const K=yu(a,x),E=Number(K.qty);if(K.belowMin||!(E>0)){v(`\uB9AC\uC2A4\uD06C ${t.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${Z}\
 USDT / ${r.qtyStep}) \uBBF8\uB9CC`,"down");return}const W=h.current.open({symbol:t.symbol,side:u.side,qty:E,price:a,refPx:ou(u.side),leverage:t.leverage,sl:x,targets:g,
setup:u.type,signalId:uu(u),breakoutLevel:u.kind==="breakout"?Number(R?u.box.top:u.box.bottom):void 0,riskBudget:xu()});if(!W.ok){v(W.error??"\uC9C4\uC785 \uC2E4\uD328",
"down");return}J.current.add(uu(u)),Q(Bu,[...J.current].slice(-300)),v(`${C?"[\uC790\uB3D9] ":""}${au[u.type]} \uBAA8\uC758 \uC9C4\uC785 ${o(E,r.qdp)} @ ${o(W.fillPx??
a,r.dp)}`,"up"),S()},_u=u=>{const C=$.fills.filter(d=>d.final&&d.symbol===t.symbol),a=C[C.length-1];if(a){const d=$.fills.filter(g=>g.positionId===a.positionId).
reduce((g,R)=>g+R.netPnl,0),x=Math.floor(a.closedAt/l.intervalMs)*l.intervalMs;if(d<0&&u.ts<=x+2*l.intervalMs)return"\uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30"}const n=new Date;
return n.setHours(0,0,0,0),De($.fills,n.getTime())<=-3?"\uC77C\uC77C \uC190\uC2E4 \uD55C\uB3C4 \u22123R \uB3C4\uB2EC":null};X(()=>{if(!T)return;const u=uu(T);if(!J.
current.has(`n:${u}`)&&(J.current.add(`n:${u}`),Q(Bu,[...J.current].slice(-300)),v(`\uC2E0\uD638: ${au[T.type]} \xB7 SL ${o(T.sl,r.dp)} \xB7 ${T.targets.map(C=>`${C.
label} ${o(C.price,r.dp)}`).join(" / ")}`,T.side==="long"?"up":"down"),t.autoPaper&&!Du.length)){const C=T.pressure.source!=="trades"?"\uC555\uB825\uC774 OHLCV \uADFC\uC0AC":
_u(T);C?v(`[\uC790\uB3D9] \uC9C4\uC785 \uC0DD\uB7B5 \u2013 ${C}`,"info"):Nu(T,!0)}},[T==null?void 0:T.ts,T==null?void 0:T.type]);const cu=Pu(()=>Du.map(u=>{var d,
x;const C=m.pressures.slice(0,m.closed.length),a=Gu({side:u.side,entry:u.entry,sl:u.sl,targets:u.targets.filter(g=>!g.done).map(g=>({price:g.price}))},m.closed,
C),n=u.setup.startsWith("BREAKOUT")?Vu({side:u.side,entry:u.entry,sl:u.initialSl,targets:u.targets.map(g=>({price:g.price})),type:u.setup,adds:u.adds,brokenLevel:u.
breakoutLevel,openedTs:Math.floor(u.openedAt/l.intervalMs)*l.intervalMs,lastAddTs:u.lastAddTs,risk:Math.abs((u.initialEntry??u.entry)-u.initialSl)},m.closed,C,m.
box,{maxAdds:t.maxAdds,addSizePct:t.addSizePct,tickSize:b,atr:((d=m.signalBox)==null?void 0:d.atr)??((x=m.box)==null?void 0:x.atr)}):null;return{p:u,flip:a,pyr:n}}),
[p,m.closed,m.pressures,m.box,m.signalBox,t.maxAdds,t.addSizePct,t.symbol,l.intervalMs]),Eu=Cu(new Set);X(()=>{for(const u of cu){const C=`${u.p.id}:${hu}`;u.flip.
alert&&!Eu.current.has(C)&&(Eu.current.add(C),v(`\uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (${u.flip.multiple.toFixed(1)}\uBC30)`,"warn"))}},[cu]);
const Au=(u,C,a)=>{const n=h.current.closeFraction(u.id,C,Y[u.symbol]??A,a);n&&v(`${a} ${o(n.qty,O(u.symbol).qdp)} @ ${o(n.exit,O(u.symbol).dp)} \xB7 \uC21C\uC190\uC775 ${q(
n.netPnl)} USDT`,n.netPnl>=0?"up":"down"),S()},Iu=(u,C)=>{const a=u.initialQty??u.origQty/(1+u.adds*(t.addSizePct/100)),n=u.riskBudget??$.wallet*t.riskPct/100,d=he(
u,{last:ou(u.side),suggestedSl:C.sl?Number(C.sl):void 0,budget:n,wantQty:a*(C.sizePct??t.addSizePct)/100,step:r.qtyStep});if(!(d.qty>0)){v("\uCD94\uAC00 \uC2DC \uCD1D \uB9AC\uC2A4\uD06C\uAC00 \uD55C\uB3C4 \uCD08\uACFC",
"down");return}if(d.qty*A<Z){v(`\uCD94\uAC00 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561(${Z} USDT) \uBBF8\uB9CC`,"down");return}const x=h.current.
open({symbol:u.symbol,side:u.side,qty:d.qty,price:A,refPx:ou(u.side),leverage:u.leverage,sl:d.newSl,targets:[],setup:u.setup,isAdd:!0,candleTs:hu});if(!x.ok){v(
x.error??"\uCD94\uAC00 \uC2E4\uD328","down");return}v(`\uBD88\uD0C0\uAE30 #${u.adds+1}: ${o(d.qty,r.qdp)} @ ${o(x.fillPx??A,r.dp)} \xB7 SL ${o(d.newSl,r.dp)}`,"\
up"),S()},Ku=Mu(u=>{var x,g;const C=m.closed,a=C.length>=2?u==="long"?Math.min(C[C.length-1].low,C[C.length-2].low):Math.max(C[C.length-1].high,C[C.length-2].high):
A*(u==="long"?.995:1.005),n=m.box,d=n?A<Number(n.top)&&A>Number(n.bottom):!1;if(n){const R=d?"range":"breakout",K=u==="long"?Math.min(a,A*.999):Math.max(a,A*1.001),
E=Ru({side:u,kind:R,entry:String(A),extremeWick:String(K),box:n,atr:n.atr,tickSize:b,feeRate:j,slippageBps:su}),W=P=>P?Number(P).toFixed(r.dp):"";return{side:u,
kind:R,sl:W(E.sl),tp1:W((x=E.targets[0])==null?void 0:x.price),tp2:W((g=E.targets[1])==null?void 0:g.price)}}return{side:u,kind:"breakout",...Be(u,A,b,r.dp),tp2:""}},
[m.closed,m.box,A,r.dp,b]),[Hu,ku]=L(null),Wu=u=>{var a,n;const C=d=>d?Number(d).toFixed(r.dp):"";ku({side:u.side,kind:u.kind,sl:C(u.sl),tp1:C((a=u.targets[0])==
null?void 0:a.price),tp2:C((n=u.targets[1])==null?void 0:n.price),signal:u}),D("\uAC70\uB798")},wu=(((Fu=l.ticker)==null?void 0:Fu.change24h)??0)>=0;return s("d\
iv",{className:"h-full flex flex-col pt-safe",children:[e("header",{className:"px-3 pt-2 pb-1.5 border-b border-line",children:s("div",{className:"flex items-en\
d justify-between",children:[s("div",{children:[s("div",{className:"flex items-center gap-2",children:[e("select",{value:t.symbol,onChange:u=>B({symbol:u.target.
value}),className:"bg-transparent text-[15px] font-semibold outline-none",children:ne.map(u=>e("option",{value:u.symbol,className:"bg-panel",children:u.symbol},
u.symbol))}),e("span",{className:"text-[10px] px-1.5 py-0.5 rounded bg-panel2 text-muted",children:"\uBB34\uAE30\uD55C \xB7 \uBAA8\uC758"}),e("span",{className:`\
w-2 h-2 rounded-full ${l.status==="live"?"bg-up":"bg-warn"}`,title:l.status})]}),e("div",{className:`text-[26px] leading-8 font-semibold num ${wu?"text-up":"tex\
t-down"}`,children:A?o(A,r.dp):"\u2014"})]}),s("div",{className:"text-right text-[11px] text-muted num leading-[18px]",children:[s("div",{children:["24h ",e("sp\
an",{className:wu?"text-up":"text-down",children:l.ticker?se(l.ticker.change24h):"\u2014"})]}),s("div",{children:["\uB9C8\uD06C ",l.ticker?o(l.ticker.mark,r.dp):
"\u2014"]}),s("div",{children:["\uD380\uB529 ",l.ticker?`${(l.ticker.funding*100).toFixed(4)}%`:"\u2014"]})]})]})}),_.length>0&&e("div",{className:"px-3 py-1.5 \
space-y-1 border-b border-line bg-bg","aria-live":"polite",children:_.map(u=>e("div",{className:`text-[12px] leading-4 px-2.5 py-1.5 rounded-md ${u.tone==="down"?
"bg-down/20 text-down":u.tone==="up"?"bg-up/15 text-up":u.tone==="warn"?"bg-warn/20 text-warn":"bg-panel2 text-txt"}`,children:u.text},u.id))}),s("main",{className:"\
flex-1 min-h-0 flex flex-col overflow-hidden",children:[i==="\uCC28\uD2B8"&&s(ju,{children:[s("div",{className:"flex items-center justify-between px-3 py-1.5 ga\
p-2",children:[e(gu,{items:ie,value:t.tf,onChange:u=>B({tf:u})}),e("button",{onClick:()=>N(u=>!u),className:`h-8 px-3 rounded-full text-xs ${M?"bg-warn text-bg \
font-semibold":"bg-panel2 text-muted"}`,children:M?"\uD3B8\uC9D1 \uC644\uB8CC":"\uBC15\uC2A4 \uD3B8\uC9D1"})]}),e("div",{className:"flex-1 min-h-0",children:l.candles.
length?e(Ju,{viewKey:`${t.symbol}:${t.tf}`,candles:l.candles,pressures:m.pressures,box:m.box,signals:m.history,positions:Du,dp:r.dp,showHist:t.showHist,editBox:M,
onBoxEdit:(u,C)=>{var n;const a={top:u,bottom:C,startTs:(c==null?void 0:c.startTs)??((n=m.box)==null?void 0:n.startTime)??Date.now(),locked:!0};f(a),Q(`dupont.b\
ox.${t.symbol}`,a)}}):e("div",{className:"p-6 text-muted text-sm",children:l.err?`\uB370\uC774\uD130 \uC624\uB958: ${l.err}`:"\uCE94\uB4E4 \uBD88\uB7EC\uC624\uB294 \uC911\u2026"})}),
e(ye,{box:m.box,manual:c,dp:r.dp,tape:m.tapeCandles,onUnlock:()=>{f(null),Q(`dupont.box.${t.symbol}`,null),N(!1)},onEdit:(u,C)=>{var n;const a={top:u,bottom:C,startTs:(c==
null?void 0:c.startTs)??((n=m.box)==null?void 0:n.startTime)??Date.now(),locked:!0};f(a),Q(`dupont.box.${t.symbol}`,a)}}),cu.filter(u=>u.flip.alert).map(u=>s("d\
iv",{className:"mx-3 mb-2 rounded-lg bg-warn/15 border border-warn px-3 py-2 flex items-center justify-between",children:[s("span",{className:"text-[13px] text-\
warn font-semibold",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",u.flip.multiple.toFixed(1),"\uBC30)"]}),e(z,{tone:"warn",className:"\
h-9",onClick:()=>Au(u.p,1,"\uC555\uB825\uBC18\uC804 \uCCAD\uC0B0"),children:"\uCCAD\uC0B0"})]},u.p.id)),e(Ne,{g:V,dp:r.dp,acted:V?J.current.has(uu(V)):!1,stale:V?
vu(V):null,onEnter:()=>V&&Nu(V),onEdit:()=>V&&Wu(V)})]}),i==="\uAC70\uB798"&&e(Ee,{s:t,set:B,last:A,dp:r.dp,book:l.book,equity:fu,available:pu,qtyStep:r.qtyStep,
draft:Hu,setDraft:ku,defaultDraft:Ku,sizeFor:yu,onSubmit:(u,C,a,n)=>{var K;const d=Number(u.sl),x=u.kind==="breakout"||!u.tp2?[{price:Number(u.tp1),fraction:1,label:u.
kind==="breakout"?"TP 1:3":"TP"}]:[{price:Number(u.tp1),fraction:.5,label:"TP1 \uC911\uC559\uC120"},{price:Number(u.tp2),fraction:.5,label:"TP2 \uBC18\uB300\uD3B8"}],
g=((K=u.signal)==null?void 0:K.type)??"MANUAL",R=u.kind==="breakout"&&m.box?Number(u.side==="long"?m.box.top:m.box.bottom):void 0;if(C==="limit"){if(u.side==="l\
ong"?a>=A:a<=A){v(`\uC9C0\uC815\uAC00\uAC00 \uD604\uC7AC\uAC00 ${u.side==="long"?"\uC774\uC0C1":"\uC774\uD558"} \u2013 \uC989\uC2DC \uCCB4\uACB0\uB418\uB294 \uC8FC\uBB38\uC740 \uC2DC\uC7A5\uAC00\uB85C \uB123\uC73C\uC138\uC694`,
"down");return}const E=h.current.placeLimit({symbol:t.symbol,side:u.side,qty:n,price:a,leverage:t.leverage,sl:d,targets:x,setup:g,breakoutLevel:R,riskBudget:xu()});
v(E.ok?`\uC9C0\uC815\uAC00 ${u.side==="long"?"\uB871":"\uC20F"} \uC8FC\uBB38 ${o(n,r.qdp)} @ ${o(a,r.dp)}`:E.error??"\uC8FC\uBB38 \uC2E4\uD328",E.ok?"up":"down")}else{
const E=h.current.open({symbol:t.symbol,side:u.side,qty:n,price:A,refPx:ou(u.side),leverage:t.leverage,sl:d,targets:x,setup:g,breakoutLevel:R,signalId:u.signal?
uu(u.signal):void 0,riskBudget:xu()});v(E.ok?`${u.side==="long"?"\uB871":"\uC20F"} \uBAA8\uC758 \uC9C4\uC785 ${o(n,r.qdp)} @ ${o(E.fillPx??A,r.dp)}`:E.error??"\uC9C4\
\uC785 \uC2E4\uD328",E.ok?"up":"down"),E.ok&&u.signal&&(J.current.add(uu(u.signal)),Q(Bu,[...J.current].slice(-300)))}S()}},t.symbol),i==="\uD3EC\uC9C0\uC158"&&
s("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[s(H,{className:"p-3",children:[e(F,{k:"\uC790\uC0B0 (Equity)",v:`${o(fu)} USDT`}),e(F,{k:"\uAC00\uC6A9",
v:`${o(pu)} USDT`}),e(F,{k:"\uBBF8\uC2E4\uD604 \uC190\uC775 (\uC21C, \uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC)",v:(()=>{const u=$.positions.reduce((a,n)=>{const d=Y[n.symbol]??
n.entry;return a+qu(n,d)-n.entryFeeLeft-d*n.qty*j},0),C=Number(u.toFixed(2));return s("span",{className:C>0?"text-up":C<0?"text-down":"",children:[q(u)," USDT"]})})()})]}),
!$.positions.length&&e("div",{className:"text-muted text-sm text-center py-8",children:"\uBCF4\uC720 \uD3EC\uC9C0\uC158 \uC5C6\uC74C"}),$.positions.map(u=>{var x;
const C=cu.find(g=>g.p.id===u.id),a=Y[u.symbol]??u.entry,n=qu(u,a)-u.entryFeeLeft-a*u.qty*j,d=O(u.symbol).dp;return s(H,{className:"p-3",children:[s("div",{className:"\
flex justify-between items-center mb-1",children:[s("div",{className:"font-semibold",children:[e("span",{className:u.side==="long"?"text-up":"text-down",children:u.
side==="long"?"\uB871":"\uC20F"})," ",u.symbol," ",s("span",{className:"text-muted text-xs",children:[u.leverage,"x \xB7 ",Ou(u.setup)]})]}),s("div",{className:"\
text-right",children:[s("div",{className:`num font-semibold ${n>=0?"text-up":"text-down"}`,children:[q(n)," USDT"]}),e("div",{className:"text-[10px] text-muted",
children:"\uC9C0\uAE08 \uCCAD\uC0B0 \uC2DC \uC21C\uC190\uC775"})]})]}),e(F,{k:"\uC218\uB7C9 / \uC9C4\uC785\uAC00",v:`${o(u.qty,O(u.symbol).qdp)} / ${o(u.entry,d)}`}),
e(F,{k:"\uB9C8\uD06C / \uCCAD\uC0B0\uAC00",v:`${o(a,d)} / ${o(u.liqPrice,d)}`}),e(F,{k:`SL${u.beMoved?" (\uBCF8\uC808)":""}`,v:o(u.sl,d)}),u.targets.map((g,R)=>e(
F,{k:g.label,v:s("span",{className:g.done?"text-up":"",children:[o(g.price,d)," \xB7 ",Math.round(g.fraction*100),"% ",g.done?"\u2713 \uCCB4\uACB0":"\uB300\uAE30"]})},
R)),e(F,{k:"\uACC4\uD68D \uB9AC\uC2A4\uD06C (1R)",v:u.riskUsd?`${o(u.riskUsd)} USDT`:"\u2014"}),u.riskBudget!==void 0&&e(F,{k:"\uB9AC\uC2A4\uD06C \uC608\uC0B0 (\uC9C4\uC785 \uC2DC \uACE0\uC815)",
v:`${o(u.riskBudget)} USDT`}),(u.fundingAcc??0)!==0&&e(F,{k:"\uD380\uB529\uBE44 \uB204\uC801 (\uBBF8\uC815\uC0B0)",v:s("span",{className:(u.fundingAcc??0)>0?"te\
xt-down":"text-up",children:[q(-(u.fundingAcc??0),4)," USDT"]})}),e(F,{k:"\uC2E4\uD604 \uC190\uC775 (\uC21C, \uD380\uB529 \uD3EC\uD568)",v:q(u.realizedNet)}),(C==
null?void 0:C.flip.alert)&&s("div",{className:"mt-2 text-[12px] text-warn",children:["\u26A0 \uC555\uB825 \uBC18\uC804 \u2013 \uCCAD\uC0B0 \uAD8C\uACE0 (",C.flip.
multiple.toFixed(1),"\uBC30, \uBAA9\uD45C \uC9C4\uD589 ",Math.round(C.flip.progress*100),"%)"]}),(C==null?void 0:C.pyr)&&s("div",{className:`mt-1 text-[11px] ${C.
pyr.add?"text-accent":"text-muted"}`,children:["\uBD88\uD0C0\uAE30 ",u.adds,"/",t.maxAdds,": ",fe(C.pyr,O(u.symbol).dp)]}),!(C!=null&&C.pyr)&&s("div",{className:"\
mt-1 text-[11px] text-muted",children:["\uBD88\uD0C0\uAE30: \uB3CC\uD30C \uC2E0\uD638 \uD3EC\uC9C0\uC158\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 (\uCD5C\uB300 ",t.maxAdds,
"\uD68C)"]}),s("div",{className:"grid grid-cols-3 gap-2 mt-3",children:[e(z,{tone:"down",onClick:()=>Au(u,1,"\uC2DC\uC7A5\uAC00 \uCCAD\uC0B0"),children:"\uC804\uB7C9 \uCCAD\uC0B0"}),
e(z,{onClick:()=>Au(u,.5,"50% \uCCAD\uC0B0"),children:"50% \uCCAD\uC0B0"}),e(z,{tone:"accent",disabled:!((x=C==null?void 0:C.pyr)!=null&&x.add)||u.adds>=t.maxAdds||
u.symbol!==t.symbol,onClick:()=>(C==null?void 0:C.pyr)&&Iu(u,C.pyr),children:"\uBD88\uD0C0\uAE30"})]})]},u.id)}),$.pending.length>0&&s(H,{className:"p-3",children:[
e("div",{className:"text-sm font-semibold mb-1",children:"\uBBF8\uCCB4\uACB0 \uC9C0\uC815\uAC00"}),$.pending.map(u=>s("div",{className:"flex justify-between ite\
ms-center py-1 text-[13px]",children:[s("span",{className:u.side==="long"?"text-up":"text-down",children:[u.side==="long"?"\uB871":"\uC20F"," ",u.symbol," ",o(u.
qty,O(u.symbol).qdp)," @ ",o(u.price,O(u.symbol).dp)]}),e("button",{className:"text-muted underline",onClick:()=>{h.current.cancelLimit(u.id),S()},children:"\uCDE8\uC18C"})]},
u.id))]})]}),i==="\uAE30\uB85D"&&e(ke,{broker:h.current}),i==="\uC124\uC815"&&s("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[s(H,{className:"\
p-3",children:[e("div",{className:"text-sm font-semibold mb-2",children:"\uC790\uAE08"}),e(F,{k:"\uC2DC\uB4DC / \uC9C0\uAC11",v:`${o($.bankroll)} / ${o($.wallet)}\
 USDT`}),e(z,{tone:"down",className:"w-full mt-2",onClick:()=>{confirm("\uBAA8\uC758 \uC790\uAE08\uC744 200 USDT\uB85C \uCD08\uAE30\uD654\uD558\uACE0 \uD3EC\uC9C0\uC158\xB7\uAE30\uB85D\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?")&&
(h.current.reset(me),S(),v("200 USDT\uB85C \uCD08\uAE30\uD654"))},children:"\uC790\uAE08 \uCD08\uAE30\uD654 (200 USDT)"})]}),s(H,{className:"p-3 space-y-3",children:[
e("div",{className:"text-sm font-semibold",children:"\uB9AC\uC2A4\uD06C"}),s("div",{className:"grid grid-cols-2 gap-2",children:[e(w,{label:"\uAC70\uB798\uB2F9 \uB9AC\uC2A4\uD06C %",
value:String(t.riskPct),onChange:u=>B({riskPct:Math.max(.1,Number(u)||1)}),suffix:"%"}),e(w,{label:"\uAE30\uBCF8 \uB808\uBC84\uB9AC\uC9C0",value:String(t.leverage),
onChange:u=>B({leverage:Math.min(125,Math.max(1,Math.round(Number(u)||1)))}),suffix:"x"}),e(w,{label:"\uBD88\uD0C0\uAE30 \uCD5C\uB300 \uD69F\uC218",value:String(
t.maxAdds),onChange:u=>B({maxAdds:Math.max(0,Math.round(Number(u)||0))})}),e(w,{label:"\uBD88\uD0C0\uAE30 \uD06C\uAE30 (\uCD08\uAE30 \uB300\uBE44)",value:String(
t.addSizePct),onChange:u=>B({addSizePct:Math.max(5,Number(u)||50)}),suffix:"%"})]}),e(nu,{on:t.moveSlToBe,onChange:u=>B({moveSlToBe:u}),label:"TP1 \uCCB4\uACB0 \uD6C4 SL \uBCF8\uC808 \uC774\uB3D9",
hint:"\uBCF8\uC808\uAC00 = \uC9C4\uC785\uAC00 + \uB0A8\uC740 \uC9C4\uC785\xB7\uCCAD\uC0B0 \uC218\uC218\uB8CC (\uC190\uC2E4 \uC5C6\uC774 \uCCAD\uC0B0)"}),e(nu,{on:t.
autoPaper,onChange:u=>B({autoPaper:u}),label:"\uC790\uB3D9 \uBAA8\uC758\uB9E4\uB9E4",hint:"\uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 \uC2E0\uD638\uB9CC \xB7 \uC190\uC2E4 \uD6C4 2\uBD09 \uB300\uAE30 \xB7 \uC77C\uC77C \u22123R \uC815\uC9C0 (\uAE30\uBCF8 OFF)"})]}),
s(H,{className:"p-3 space-y-3",children:[e("div",{className:"text-sm font-semibold",children:"\uBC15\uC2A4 / \uD53C\uBD07"}),s("div",{className:"grid grid-cols-\
2 gap-2",children:[e(w,{label:"\uB8E9\uBC31 (\uCE94\uB4E4)",value:String(t.lookback),onChange:u=>B({lookback:Math.max(20,Math.round(Number(u)||80))})}),e(w,{label:"\
\uD130\uCE58 \uD5C8\uC6A9 %",value:String(t.tolerancePct),onChange:u=>B({tolerancePct:Math.max(.05,Number(u)||.25)}),suffix:"%"}),e(w,{label:"\uD53C\uBD07 \uC88C",
value:String(t.pivotLeft),onChange:u=>B({pivotLeft:Math.max(1,Math.round(Number(u)||3))})}),e(w,{label:"\uD53C\uBD07 \uC6B0",value:String(t.pivotRight),onChange:u=>B(
{pivotRight:Math.max(1,Math.round(Number(u)||3))})}),e(w,{label:"\uCD5C\uC18C \uD130\uCE58",value:String(t.minTouches),onChange:u=>B({minTouches:Math.max(1,Math.
round(Number(u)||2))})}),e(w,{label:"\uCD5C\uC18C \uBC15\uC2A4 \uB192\uC774 %",value:String(t.minHeightPct),onChange:u=>B({minHeightPct:Math.max(0,Number(u)||0)}),
suffix:"%"})]}),e(nu,{on:t.requireRange,onChange:u=>B({requireRange:u}),label:"\uBC15\uC2A4\uAD8C(\uBE44\uCD94\uC138)\uC77C \uB54C\uB9CC \uC2E0\uD638"}),e(nu,{on:t.
showHist,onChange:u=>B({showHist:u}),label:"\uC555\uB825 \uD788\uC2A4\uD1A0\uADF8\uB7A8 \uD45C\uC2DC"})]}),e(H,{className:"p-3",children:e(nu,{on:t.notify,onChange:async u=>{
u&&"Notification"in window&&Notification.permission!=="granted"&&await Notification.requestPermission(),B({notify:u})},label:"\uC54C\uB9BC",hint:"\uC2E0\uD638\xB7\uCCB4\uACB0\xB7\uC555\uB825\uBC18\uC804 (\uD648 \
\uD654\uBA74 \uC571\uC5D0\uC11C \uAD8C\uC7A5)"})}),s("div",{className:"text-[11px] text-muted px-1 pb-4 leading-5",children:["\uD398\uC774\uD37C(\uBAA8\uC758) \uD2B8\uB808\uC774\uB529 \uC804\uC6A9 \xB7 \uC2E4\uACC4\uC88C/API \uD0A4 \uC5C6\uC74C \xB7 B\
itget \uACF5\uAC1C \uC2DC\uC138 \uC0AC\uC6A9. \uC218\uC218\uB8CC: Bitget USDT-M \uD14C\uC774\uCEE4 0.06% / \uBA54\uC774\uCEE4 0.02% (TP\uB3C4 \uD14C\uC774\uCEE4\uB85C \uBCF4\uC218 \uACC4\uC0B0). \uC2AC\uB9AC\uD53C\uC9C0 ",
su,"bp (\uC2DC\uC7A5\uAC00\xB7\uC190\uC808). \uD380\uB529\uBE44: 00/08/16\uC2DC UTC \uC815\uC0B0 \uD380\uB529\uB960(Bitget \uACF5\uAC1C \uC774\uB825, \uC5C6\uC73C\uBA74 \uC815\uC0B0 \uC9C1\uC804 \uD380\uB529\uB960). \uAC15\uC81C\uCCAD\uC0B0 = \uACA9\uB9AC \uC99D\uAC70\uAE08 \uC804\uC561 \uC190\uC2E4. \uB3CC\uD30C TP 1:3\uC740 \uC218\uC218\uB8CC \uCC28\uAC10 \uC21C\uC190\uC775 \uAE30\uC900. \uC571\uC774 \uAEBC\uC838 \uC788\uB358 \uB3D9\uC548\uC740 \uB2E4\uC2DC \uC5F4 \uB54C 1\uBD84\uBD09\uC73C\uB85C \uC7AC\uC0DD (SL\xB7TP \uB3D9\uC2DC \uD130\
\uCE58 \uC2DC SL \uC6B0\uC120). \uC555\uB825: \uC2E4\uC2DC\uAC04 \uCCB4\uACB0(aggressor) \uC9D1\uACC4, \uC5F0\uACB0 \uC774\uC804 \uCE94\uB4E4\uC740 OHLCV \uADFC\uC0AC."]})]})]}),
e("nav",{className:"border-t border-line bg-panel pb-safe grid grid-cols-5",children:ge.map(u=>e("button",{onClick:()=>D(u),className:`h-14 text-[13px] relative\
 ${i===u?"text-accent font-semibold":"text-muted"}`,children:s("span",{className:"inline-flex items-center gap-1",children:[u,u==="\uD3EC\uC9C0\uC158"&&$.positions.
length>0&&e("span",{className:"min-w-4 h-4 px-1 rounded-full bg-accent text-bg text-[10px] leading-4 font-semibold",children:$.positions.length})]})},u))})]})}function ye({
box:i,manual:D,dp:t,tape:k,onUnlock:B,onEdit:r}){const[l,c]=L(!1),[f,M]=L(""),[N,m]=L("");return i?s("div",{className:"px-3 py-1.5 border-t border-line text-[12\
px]",children:[s("div",{className:"flex items-center justify-between gap-2",children:[s("div",{className:"num leading-5",children:[e("span",{className:"text-mut\
ed",children:"\uBC15\uC2A4 "}),e("span",{className:"text-down",children:o(i.bottom,t)})," \u2013 ",e("span",{className:"text-up",children:o(i.top,t)}),e("span",
{className:"text-muted",children:" \xB7 50% "}),o(i.mid,t)]}),s("div",{className:"flex gap-1.5 items-center",children:[e("span",{className:`px-1.5 py-0.5 rounde\
d text-[10px] ${i.isRange?"bg-up/20 text-up":"bg-warn/20 text-warn"}`,children:D?"\uC218\uB3D9\xB7\uACE0\uC815":i.isRange?"\uBC15\uC2A4\uAD8C":"\uCD94\uC138/\uC57D\uD568"}),
e("button",{className:"text-accent",onClick:()=>{M(String(Number(i.top))),m(String(Number(i.bottom))),c(b=>!b)},children:"\uC218\uC815"}),D&&e("button",{className:"\
text-muted",onClick:B,children:"\uC790\uB3D9"})]})]}),s("div",{className:"text-[10px] text-muted",children:["\uD130\uCE58 ",i.touchesTop,"/",i.touchesBottom," \xB7\
 \uC2E4\uC2DC\uAC04 \uCCB4\uACB0 \uC555\uB825 ",k,"\uCE94\uB4E4 (\uADF8 \uC678 OHLCV \uADFC\uC0AC)"]}),l&&s("div",{className:"grid grid-cols-3 gap-2 mt-2 items-\
end",children:[e(w,{label:"\uC0C1\uB2E8(\uC800\uD56D)",value:f,onChange:M}),e(w,{label:"\uD558\uB2E8(\uC9C0\uC9C0)",value:N,onChange:m}),e(z,{tone:"accent",onClick:()=>{
const b=Number(f),h=Number(N);b>0&&h>0&&b!==h&&(r(b,h),c(!1))},children:"\uACE0\uC815"})]})]}):e("div",{className:"px-3 py-2 text-[12px] text-muted border-t bor\
der-line",children:"\uBC15\uC2A4 \uD0D0\uC9C0 \uC911\u2026 (\uD53C\uBD07 \uD130\uCE58 \uBD80\uC871)"})}function Ne({g:i,dp:D,acted:t,stale:k,onEnter:B,onEdit:r}){
if(!i)return e("div",{className:"mx-3 mb-2 px-3 py-2 rounded-lg bg-panel border border-line text-[12px] text-muted",children:"\uC2E0\uD638 \uB300\uAE30 \uC911 \xB7 \uBC15\uC2A4 \uC9C0\uC9C0/\uC800\uD56D + \uC7A5\uC545\uD615 + \uC555\uB825 \uD655\uC778 \uC2DC\
 \uD45C\uC2DC"});const l=i.side==="long";return s("div",{className:`mx-3 mb-2 rounded-xl border px-3 py-2 ${l?"border-up/60 bg-up/10":"border-down/60 bg-down/10"}`,
children:[s("div",{className:"flex justify-between items-center",children:[s("div",{className:`font-semibold ${l?"text-up":"text-down"}`,children:[au[i.type]," ",
s("span",{className:"text-muted text-[11px] font-normal",children:[iu(i.ts)," \uB9C8\uAC10"]})]}),s("div",{className:"text-[11px] text-muted flex items-center g\
ap-1.5",children:[i.pressure.source==="ohlcv"&&e("span",{className:"px-1.5 py-0.5 rounded bg-warn/20 text-warn text-[10px]",children:"\uC555\uB825 \uADFC\uC0AC(OHLCV)"}),
s("span",{children:["\uB9E4\uC218\uC555\uB825 ",Math.round(i.pressure.ratio*100),"%"]})]})]}),s("div",{className:"grid grid-cols-4 gap-1 text-[11px] num mt-1",children:[
s("div",{children:[e("div",{className:"text-muted",children:"\uC9C4\uC785"}),o(i.entry,D)]}),s("div",{children:[e("div",{className:"text-muted",children:"SL"}),
e("span",{className:"text-warn",children:o(i.sl,D)})]}),i.targets.map(c=>s("div",{children:[s("div",{className:"text-muted",children:[c.label," ",c.sizePct,"%"]}),
e("span",{className:"text-up",children:o(c.price,D)})]},c.label))]}),s("div",{className:"flex gap-2 mt-2",children:[e(z,{tone:l?"up":"down",className:"flex-1 h-\
10 text-[13px]",disabled:t||!!k,onClick:B,children:t?"\uC9C4\uC785 \uC644\uB8CC/\uCC98\uB9AC\uB428":k??`\uD0ED\uD558\uC5EC \uBAA8\uC758 ${l?"\uB871":"\uC20F"} \uC9C4\
\uC785`}),e(z,{className:"h-10",onClick:r,children:"\uC218\uC815"})]})]})}function Ee(i){const[D,t]=L("market"),[k,B]=L(""),[r,l]=L(""),c=i.draft??i.defaultDraft(
"long");X(()=>{!i.draft&&i.last&&i.setDraft(i.defaultDraft("long"))},[i.last>0]);const f=D==="limit"&&Number(k)>0?Number(k):i.last,M=Number(c.sl);let N=null;try{
N=f>0&&M>0&&M!==f?i.sizeFor(f,M):null}catch{N=null}const m=Math.max(0,Math.round(-Math.log10(i.qtyStep))),b=r?oe(Number(r)||0,i.qtyStep):Number((N==null?void 0:
N.qty)??0),h=c.side==="long",p=Number(c.tp1),U=Number(c.tp2),S=h?M<f:M>f,_=p>0&&(h?p>f:p<f)&&(c.kind==="breakout"||!c.tp2||(h?U>p:U<p)),G=b*f,v=G>=Z,A=G/i.s.leverage,
Y=D==="limit"?Ae:j,eu=D==="limit"?0:Lu,ru=Math.abs(f-M)*b+f*b*(Y+eu)+M*b*(j+Lu),tu=S&&_&&v&&A+f*b*Y<=i.available+1e-9,lu=N!=null&&N.belowMin&&!r?`\uB9AC\uC2A4\uD06C ${i.
s.riskPct}% \uAE30\uC900 \uC218\uB7C9\uC774 \uCD5C\uC18C \uC8FC\uBB38(${Z} USDT / ${i.qtyStep}) \uBBF8\uB9CC`:S?_?v?"\uAC00\uC6A9 \uC99D\uAC70\uAE08 \uBD80\uC871":
`\uCD5C\uC18C \uC8FC\uBB38 \uAE08\uC561 ${Z} USDT \uC774\uC0C1 \uD544\uC694`:`TP\uAC00 \uC9C4\uC785\uAC00 ${h?"\uC704":"\uC544\uB798"}(TP2\uB294 TP1 \uB108\uBA38)\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`:
`SL\uC774 \uC9C4\uC785\uAC00 ${h?"\uC544\uB798":"\uC704"}\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4`,I=y=>i.setDraft({...c,...y});return s("div",{className:"f\
lex-1 overflow-y-auto px-3 pt-3",children:[s("div",{className:"grid grid-cols-[minmax(0,1fr)_124px] gap-2.5",children:[s("div",{className:"space-y-2.5",children:[
e("div",{className:"grid grid-cols-2 gap-1 bg-panel2 rounded-lg p-1",children:["long","short"].map(y=>e("button",{onClick:()=>{l(""),i.setDraft(c.signal&&c.side===
y?c:i.defaultDraft(y))},className:`h-9 rounded-md font-semibold text-sm ${c.side===y?y==="long"?"bg-up text-white":"bg-down text-white":"text-muted"}`,children:y===
"long"?"\uB871":"\uC20F"},y))}),e(gu,{items:["market","limit"],value:D,onChange:y=>t(y),fmt:y=>y==="market"?"\uC2DC\uC7A5\uAC00":"\uC9C0\uC815\uAC00"}),D==="lim\
it"&&e(w,{label:"\uC9C0\uC815\uAC00",value:k,onChange:B}),s("div",{children:[e("span",{className:"text-[11px] text-muted",children:"\uB808\uBC84\uB9AC\uC9C0"}),
e(gu,{items:[3,5,10,20],value:i.s.leverage,onChange:y=>i.set({leverage:y}),fmt:y=>`${y}x`})]}),e(w,{label:"\uB9AC\uC2A4\uD06C (\uC790\uC0B0 \uB300\uBE44)",value:String(
i.s.riskPct),onChange:y=>{l(""),i.set({riskPct:Math.max(.1,Number(y)||1)})},suffix:"%"}),e(w,{label:"\uC190\uC808 SL",value:String(c.sl),onChange:y=>I({sl:y})}),
e(w,{label:c.kind==="breakout"?"TP (\uC21C 1:3, 100%)":"TP1 \uC911\uC559\uC120 (50%)",value:String(c.tp1),onChange:y=>I({tp1:y})}),c.kind==="range"&&e(w,{label:"\
TP2 \uBC18\uB300\uD3B8 \uACBD\uACC4 (50%)",value:String(c.tp2),onChange:y=>I({tp2:y})}),e(w,{label:`\uC218\uB7C9 (\uB9AC\uC2A4\uD06C ${i.s.riskPct}%: ${N?o(N.qty,
m):"\u2014"})`,value:r||(N?Number(N.qty).toFixed(m):""),onChange:l})]}),e("div",{className:"bg-panel rounded-xl border border-line py-2",children:e(Xu,{book:i.book,
dp:i.dp,qdp:m,rows:7})})]}),c.signal&&s("div",{className:"mt-2 text-[11px] text-accent",children:["\uC2E0\uD638 \uC790\uB3D9 \uC785\uB825: ",au[c.signal.type],"\
 (",iu(c.signal.ts)," \uB9C8\uAC10) \xB7 SL/TP \uC790\uB3D9"]}),s(H,{className:"p-3 mt-3",children:[e(F,{k:"\uC9C4\uC785 \uAE30\uC900\uAC00",v:o(f,i.dp)}),e(F,{
k:"\uC99D\uAC70\uAE08 / \uBA85\uBAA9",v:b>0?`${o(A)} / ${o(G)} USDT`:"\u2014"}),e(F,{k:"SL \uC2DC \uC21C\uC190\uC2E4 (\uC218\uC218\uB8CC\xB7\uC2AC\uB9AC\uD53C\uC9C0)",
v:b>0&&S?s("span",{className:"text-down",children:["-",o(ru)," USDT (",(ru/Math.max(i.equity,1e-9)*100).toFixed(2),"%)"]}):"\u2014"}),b>0&&_&&e(F,{k:c.kind==="b\
reakout"||!c.tp2?"TP \uC2DC \uC21C\uC774\uC775":"TP1+TP2 \uC2DC \uC21C\uC774\uC775",v:s("span",{className:"text-up",children:["+",o((c.kind==="breakout"||!c.tp2?
Math.abs(p-f)*b-p*b*j:Math.abs(p-f)*b*.5+Math.abs(U-f)*b*.5-(p+U)*b*.5*j)-f*b*(Y+eu))," USDT"]})}),e(F,{k:"\uAC00\uC6A9 / \uC790\uC0B0",v:`${o(i.available)} / ${o(
i.equity)} USDT`})]}),s("div",{className:"sticky bottom-0 -mx-3 px-3 pt-2 pb-3 mt-1 bg-bg/95 backdrop-blur border-t border-line",children:[!tu&&(b>0||(N==null?void 0:
N.belowMin))&&e("div",{className:"text-[11px] text-down mb-1",children:lu}),e(z,{tone:c.side==="long"?"up":"down",className:"w-full h-12 text-[16px]",disabled:!tu||
!(b>0),onClick:()=>{i.onSubmit(c,D,f,b),l("")},children:c.side==="long"?"\uB871 (\uB9E4\uC218) \uBAA8\uC758 \uC9C4\uC785":"\uC20F (\uB9E4\uB3C4) \uBAA8\uC758 \uC9C4\uC785"})]})]})}
function ke({broker:i}){var m,b,h;const D=i.state,t=xe(D.fills,D.positions.map(p=>p.id)),k=D.equityCurve,B=360,r=120,l=k.map(p=>p.equity),c=Math.min(...l,D.bankroll),
f=Math.max(...l,D.bankroll),M=k.map((p,U)=>`${U?"L":"M"}${U/Math.max(1,k.length-1)*B},${r-(p.equity-c)/Math.max(1e-9,f-c)*(r-10)-5}`).join(" "),N=async()=>{var G;
const p=be(D.fills),U=`dupont-paper-${new Date().toISOString().slice(0,10)}.csv`,S=new File([p],U,{type:"text/csv"});if((G=navigator.canShare)!=null&&G.call(navigator,
{files:[S]}))try{await navigator.share({files:[S],title:U});return}catch{}const _=document.createElement("a");_.href=URL.createObjectURL(S),_.download=U,_.click(),
setTimeout(()=>URL.revokeObjectURL(_.href),2e3)};return s("div",{className:"flex-1 overflow-y-auto p-3 space-y-3",children:[s(H,{className:"p-3",children:[s("di\
v",{className:"grid grid-cols-3 text-center",children:[s("div",{children:[e("div",{className:"text-[11px] text-muted",children:"\uAC70\uB798"}),e("div",{className:"\
num font-semibold",children:t.trades})]}),s("div",{children:[e("div",{className:"text-[11px] text-muted",children:"\uC2B9\uB960"}),e("div",{className:"num font-\
semibold",children:t.trades?`${(t.winRate*100).toFixed(0)}%`:"\u2014"})]}),s("div",{children:[e("div",{className:"text-[11px] text-muted",children:"\uC21C\uC190\uC775"}),
e("div",{className:`num font-semibold ${t.net>=0?"text-up":"text-down"}`,children:q(t.net)})]})]}),s("div",{className:"text-[11px] text-muted text-center mt-1",
children:["\uC218\uC218\uB8CC \uD569\uACC4 ",o(t.fees,3)," USDT (\uC21C\uC190\uC775\uC5D0 \uBC18\uC601)",t.funding!==0?` \xB7 \uD380\uB529 ${q(-t.funding,3)}`:"",
t.partialNet!==0?` \xB7 \uBCF4\uC720 \uC911 \uBD80\uBD84\uCCAD\uC0B0 ${q(t.partialNet)} \uD3EC\uD568`:""]}),t.rTrades>0&&s("div",{className:"text-[11px] text-mu\
ted text-center num",children:["\uAE30\uB300\uAC12 ",s("span",{className:t.expectancyR>=0?"text-up":"text-down",children:[q(t.expectancyR),"R"]})," \xB7 \uD3C9\uADE0 \uC2B9 ",
q(t.avgWinR),"R / \uD328 ",q(t.avgLossR),"R (",t.rTrades,"\uAC74)"]})]}),s(H,{className:"p-3",children:[s("div",{className:"flex justify-between text-[12px] tex\
t-muted mb-1 num",children:[e("span",{children:"\uC790\uC0B0 \uACE1\uC120"}),s("span",{children:[o(((m=k[0])==null?void 0:m.equity)??D.bankroll)," \u2192 ",e("s\
pan",{className:(((b=k[k.length-1])==null?void 0:b.equity)??D.bankroll)>=D.bankroll?"text-up":"text-down",children:o(((h=k[k.length-1])==null?void 0:h.equity)??
D.bankroll)})," USDT"]})]}),s("svg",{viewBox:`0 0 ${B} ${r}`,className:"w-full h-[120px]",children:[e("line",{x1:"0",x2:B,y1:r-(D.bankroll-c)/Math.max(1e-9,f-c)*
(r-10)-5,y2:r-(D.bankroll-c)/Math.max(1e-9,f-c)*(r-10)-5,stroke:"#262e38",strokeDasharray:"4 4"}),e("path",{d:M,fill:"none",stroke:"#00c2cb",strokeWidth:"2"})]}),
D.positions.length>0&&e("div",{className:"text-[11px] text-muted mt-1",children:"\uC9C0\uAC11 \uAE30\uC900 \xB7 \uBCF4\uC720 \uD3EC\uC9C0\uC158\uC758 \uC9C4\uC785 \uC218\uC218\uB8CC\uB294 \uC774\uBBF8 \uCC28\uAC10\uB428 (\uBBF8\uC2E4\uD604 \uC190\uC775 \uC81C\uC678)"})]}),
e(z,{className:"w-full",onClick:N,disabled:!D.fills.length,children:"CSV \uB0B4\uBCF4\uB0B4\uAE30"}),[...D.fills].reverse().map(p=>s(H,{className:"p-3",children:[
s("div",{className:"flex justify-between text-[13px]",children:[s("span",{children:[e("span",{className:p.side==="long"?"text-up":"text-down",children:p.side===
"long"?"\uB871":"\uC20F"})," ",p.symbol," \xB7 ",Ou(p.setup)]}),s("span",{className:`num font-semibold ${p.netPnl>=0?"text-up":"text-down"}`,children:[q(p.netPnl),
" USDT"]})]}),s("div",{className:"text-[11px] text-muted num mt-0.5",children:[iu(p.closedAt)," \xB7 ",p.reason," \xB7 ",o(p.qty,O(p.symbol).qdp)," \xB7 ",o(p.entry,
O(p.symbol).dp)," \u2192 ",o(p.exit,O(p.symbol).dp)," \xB7 \uC218\uC218\uB8CC ",o(p.fees,3),p.funding?` \xB7 \uD380\uB529 ${q(-p.funding,3)}`:"",p.r!==void 0?` \
\xB7 ${q(p.r)}R`:""]})]},p.id)),!D.fills.length&&e("div",{className:"text-muted text-sm text-center py-6",children:"\uAC70\uB798 \uAE30\uB85D \uC5C6\uC74C"})]})}
zu.createRoot(document.getElementById("root")).render(e(ve,{}));if("serviceWorker"in navigator){const i="/dupont-mobile/";window.addEventListener("load",()=>navigator.
serviceWorker.register(`${i}sw.js`,{scope:i}).catch(()=>{}))}
