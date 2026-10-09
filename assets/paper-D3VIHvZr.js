var T=Object.defineProperty;var R=(a,t,s)=>t in a?T(a,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):a[t]=s;var B=(a,t,s)=>R(a,typeof t!="symbol"?t+"":t,s);import{b as M,c as L}from"./strategy-Cu9CvPGE.js";function I(a,t,s){return a*t/(s>0?s:1)}const P=200,k=Number(M("bitget_default","swap","taker")),$=Number(M("bitget_default","swap","maker")),w=2,S=w/1e4,U=5,q=8*
36e5;function x(a=P,t=Date.now()){return{wallet:a,bankroll:a,positions:[],fills:[],pending:[],equityCurve:[{t,equity:a}],seq:0}}const A=a=>a==="long"?1:-1;function N(a,t){
return A(a.side)*(t-a.entry)*a.qty}function F(a,t,s,i){const n=1/(s||1);return a==="long"?t*(1-n+i):t*(1+n-i)}function E(a,t,s,i,n=S,e=k){const r=a.qty+t,o=(a.entry*
a.qty+s*t)/r;return A(a.side)*(o-i)*r+a.entryFeeLeft+t*s*e+r*i*(k+n)}function b(a,t,s,i,n){return Math.max(0,A(a)*(t-s))*i+n+i*s*(k+S)}function O(a,t,s=k+S){const i=a.
qty,n=a.side==="long"?(a.entry*i+a.entryFeeLeft)/(i*(1-s)):(a.entry*i-a.entryFeeLeft)/(i*(1+s)),e=10**t;return a.side==="long"?Math.ceil(n*e-1e-9)/e:Math.floor(
n*e+1e-9)/e}class G{constructor(t){B(this,"state");B(this,"moveSlToBe",!0);B(this,"precision",()=>({dp:2,qdp:4}));B(this,"slip",S);B(this,"minOrderUsdt",U);var s,
i,n;this.state=t?_(t):x();for(const e of this.state.positions)e.initialEntry??(e.initialEntry=e.entry),e.fundingAcc??(e.fundingAcc=0),e.riskUsd??(e.riskUsd=b(e.
side,e.entry,e.initialSl,e.origQty,e.origQty*e.entry*k));(s=this.state).lastTickTs??(s.lastTickTs={}),(i=this.state).rateSeen??(i.rateSeen={}),(n=this.state).settledRates??
(n.settledRates={})}px(t,s){return s.toLocaleString("en-US",{minimumFractionDigits:this.precision(t).dp,maximumFractionDigits:this.precision(t).dp})}qx(t,s){return s.
toFixed(this.precision(t).qdp)}step(t){return 10**-this.precision(t).qdp}floorStep(t,s){const i=this.precision(t).qdp,n=this.step(t);return Number((Math.floor(s/
n+1e-9)*n).toFixed(i))}nextId(t){return this.state.seq+=1,`${t}${Date.now().toString(36)}${this.state.seq}`}reset(t=P,s=Date.now()){this.state=x(t,s)}usedMargin(){
return this.state.positions.reduce((t,s)=>t+s.margin,0)+this.state.pending.reduce((t,s)=>t+s.qty*s.price/s.leverage,0)}available(){return this.state.wallet-this.
usedMargin()}equity(t){return this.state.wallet+this.state.positions.reduce((s,i)=>s+N(i,t[i.symbol]??i.entry),0)}open(t,s=Date.now()){const i=[];if(!(t.qty>0)||
!(t.price>0))return{ok:!1,error:"\uC218\uB7C9/\uAC00\uACA9 \uC624\uB958",events:i};const n=t.liquidity==="maker",e=n?$:k,r=n?t.price:(t.refPx&&t.refPx>0?t.refPx:
t.price)*(1+A(t.side)*this.slip),h=t.qty*r*e,l=I(t.qty,r,t.leverage);if(l+h>this.available()+1e-9)return{ok:!1,error:`\uC99D\uAC70\uAE08 \uBD80\uC871 (\uD544\uC694 ${(l+
h).toFixed(2)} USDT)`,events:i};const g=t.mmr??.005,c=this.state.positions.find(f=>f.symbol===t.symbol&&f.side===t.side);if(c&&!t.isAdd)return{ok:!1,error:"\uAC19\uC740 \uBC29\
\uD5A5 \uD3EC\uC9C0\uC158 \uBCF4\uC720 \uC911 (\uBD88\uD0C0\uAE30\uB294 \uBD88\uD0C0\uAE30 \uBC84\uD2BC \uC0AC\uC6A9)",events:i};if(!c&&t.isAdd)return{ok:!1,error:"\
\uCD94\uAC00\uD560 \uD3EC\uC9C0\uC158 \uC5C6\uC74C",events:i};const u=t.side==="long";if(c){const f=c.qty+t.qty,p=(c.entry*c.qty+r*t.qty)/f,m=u?Math.max(c.sl,t.
sl):Math.min(c.sl,t.sl),y=F(c.side,p,c.leverage,c.mmr);return(u?m<=y:m>=y)?{ok:!1,error:"SL\uC774 \uCCAD\uC0B0\uAC00 \uBC16 (\uCD94\uAC00 \uD6C4 \uCCAD\uC0B0\uAC00 \uAE30\uC900)",
events:i}:c.riskBudget!==void 0&&E(c,t.qty,r,m,this.slip,e)>c.riskBudget+1e-9?{ok:!1,error:`\uCD94\uAC00 \uC2DC \uCD1D \uB9AC\uC2A4\uD06C\uAC00 \uC9C4\uC785 \uC2DC \uC608\uC0B0(${c.
riskBudget.toFixed(2)} USDT) \uCD08\uACFC`,events:i}:(this.state.wallet-=h,c.entry=p,c.qty=f,c.origQty+=t.qty,c.margin+=l,c.entryFeeLeft+=h,c.adds+=1,c.sl=m,c.liqPrice=
y,c.riskUsd=(c.riskUsd??0)+b(t.side,r,m,t.qty,h),t.candleTs!==void 0&&(c.lastAddTs=t.candleTs),i.push({kind:"add",positionId:c.id,message:`\uBD88\uD0C0\uAE30 \uCD94\uAC00 ${this.
qx(t.symbol,t.qty)} @ ${this.px(t.symbol,r)}`}),this.snapEquity({[t.symbol]:r},s),{ok:!0,position:c,fillPx:r,events:i})}const C=F(t.side,r,t.leverage,g);if(u?t.
sl<=C:t.sl>=C)return{ok:!1,error:`SL\uC774 \uCCAD\uC0B0\uAC00(${this.px(t.symbol,C)}) \uBC16 \u2013 \uB808\uBC84\uB9AC\uC9C0\uB97C \uB0AE\uCD94\uC138\uC694`,events:i};
this.state.wallet-=h;const d={id:this.nextId("p"),symbol:t.symbol,side:t.side,qty:t.qty,origQty:t.qty,entry:r,leverage:t.leverage,margin:l,sl:t.sl,initialSl:t.sl,
targets:t.targets.map(f=>({...f,done:!1})),setup:t.setup,signalId:t.signalId,breakoutLevel:t.breakoutLevel,adds:0,entryFeeLeft:h,realizedNet:0,beMoved:!1,liqPrice:C,
mmr:g,openedAt:s,initialEntry:r,riskUsd:b(t.side,r,t.sl,t.qty,h),fundingAcc:0,initialQty:t.qty,riskBudget:t.riskBudget};return this.state.positions.push(d),i.push(
{kind:"open",positionId:d.id,message:`${t.side==="long"?"\uB871":"\uC20F"} \uC9C4\uC785 ${this.qx(t.symbol,t.qty)} ${t.symbol} @ ${this.px(t.symbol,r)}`}),this.
snapEquity({[t.symbol]:r},s),{ok:!0,position:d,fillPx:r,events:i}}placeLimit(t,s=Date.now()){return t.qty*t.price/t.leverage>this.available()?{ok:!1,error:"\uC99D\uAC70\uAE08 \
\uBD80\uC871"}:(this.state.pending.push({...t,id:this.nextId("o"),createdAt:s}),{ok:!0})}cancelLimit(t){this.state.pending=this.state.pending.filter(s=>s.id!==t)}close(t,s,i,n,e=Date.
now(),r=k){const o=this.state.positions.find(y=>y.id===t);if(!o)return null;const h=Math.min(s,o.qty);if(!(h>0))return null;this.accrueFunding(o.symbol,i,e,0,o.
id);const l=h/o.qty,g=A(o.side)*(i-o.entry)*h,c=h*i*r,u=o.entryFeeLeft*l,C=o.margin*l,d=(o.fundingAcc??0)*l;o.entryFeeLeft-=u,o.margin-=C,o.fundingAcc=(o.fundingAcc??
0)-d,o.qty=h>=o.qty-1e-12?0:o.qty-h,this.state.wallet+=g-c;const f=g-c-u-d;o.realizedNet+=f+d;const p=o.qty<=1e-12,m={id:this.nextId("f"),positionId:o.id,symbol:o.
symbol,side:o.side,setup:o.setup,qty:h,entry:o.entry,exit:i,grossPnl:g,fees:c+u,netPnl:f,reason:n,openedAt:o.openedAt,closedAt:e,final:p,funding:d,r:o.riskUsd&&
o.riskUsd>0?f/o.riskUsd:void 0,riskUsd:o.riskUsd};return this.state.fills.push(m),p&&(this.state.positions=this.state.positions.filter(y=>y.id!==o.id)),this.snapEquity(
{[o.symbol]:i},e),m}partialQty(t,s,i){if(s>=t.qty-1e-12)return t.qty;const n=this.floorStep(t.symbol,s);return!(n>0)||(t.qty-n)*i<this.minOrderUsdt?t.qty:n}closeFraction(t,s,i,n,e=Date.
now()){const r=this.state.positions.find(h=>h.id===t);if(!r)return null;const o=i*(1-A(r.side)*this.slip);return this.close(t,this.partialQty(r,r.qty*Math.min(1,
s),o),o,n,e)}needsSettledRate(t,s=Date.now()){return this.state.positions.some(i=>{var e,r;if(i.symbol!==t)return!1;const n=Math.floor((i.lastFundingTs??i.openedAt)/
q)*q+q;return n<=s&&((r=(e=this.state.settledRates)==null?void 0:e[t])==null?void 0:r[String(n)])===void 0})}noteTickerRate(t,s,i=Date.now()){var o;if(!Number.isFinite(
s))return;const n=(o=this.state).rateSeen??(o.rateSeen={}),e=n[t]??(n[t]=[]),r=e[e.length-1];r&&r[1]===s&&Math.floor(r[0]/q)===Math.floor(i/q)||(e.push([i,s]),e.
length>100&&e.splice(0,e.length-100))}setSettledRates(t,s){var r;const i=(r=this.state).settledRates??(r.settledRates={}),n=i[t]??(i[t]={});for(const o of s)Number.
isFinite(o.ts)&&Number.isFinite(o.rate)&&(n[String(o.ts)]=o.rate);const e=Object.keys(n).map(Number).sort((o,h)=>o-h);for(const o of e.slice(0,Math.max(0,e.length-
100)))delete n[String(o)]}fundingRateFor(t,s){var e,r,o;const i=(r=(e=this.state.settledRates)==null?void 0:e[t])==null?void 0:r[String(s)];if(i!==void 0)return i;
const n=((o=this.state.rateSeen)==null?void 0:o[t])??[];for(let h=n.length-1;h>=0;h--)if(n[h][0]<s)return n[h][1]}accrueFunding(t,s,i=Date.now(),n=0,e){var o,h;
const r=[];if(!(s>0))return r;for(const l of this.state.positions){if(l.symbol!==t||e!==void 0&&l.id!==e)continue;const g=l.lastFundingTs??l.openedAt;let c=Math.
floor(g/q)*q+q,u=0,C=0;for(;c<=i&&!(((h=(o=this.state.settledRates)==null?void 0:o[t])==null?void 0:h[String(c)])===void 0&&i-c<n);){const f=this.fundingRateFor(
t,c);if(f===void 0)break;const p=A(l.side)*l.qty*s*f;this.state.wallet-=p,l.realizedNet-=p,l.fundingAcc=(l.fundingAcc??0)+p,l.lastFundingTs=c,u+=p,C=f,c+=q}u!==
0&&r.push({kind:"funding",positionId:l.id,message:`\uD380\uB529\uBE44 ${u>0?"\uC9C0\uBD88":"\uC218\uB839"} ${Math.abs(u).toFixed(4)} USDT (${(C*100).toFixed(4)}\
%)`})}return r.length&&this.snapEquity({[t]:s},i),r}replayBars(t,s,i=1/0){const n=[];for(const e of[...s].sort((r,o)=>r.ts-o.ts)){const r=Math.min(e.ts+59999,i);
n.push(...this.accrueFunding(t,e.open,e.ts));const o=()=>this.state.positions.filter(l=>l.symbol===t&&l.openedAt<=e.ts);for(const l of o()){const g=l.side==="lo\
ng",c=g?e.low<=l.sl:e.high>=l.sl,u=l.targets.some(C=>!C.done&&(g?e.high>=C.price:e.low<=C.price));c&&u&&n.push(...this.onPrice(t,g?Math.min(e.open,l.sl):Math.max(
e.open,l.sl),r,void 0,e.ts))}const h=e.close>=e.open?[e.open,e.low,e.high,e.close]:[e.open,e.high,e.low,e.close];n.push(...this.onPrice(t,h[0],r,void 0,e.ts));for(let l=1;l<
h.length;l++){const g=h[l-1],c=h[l],u=o().flatMap(C=>[C.sl,C.liqPrice,...C.targets.filter(d=>!d.done).map(d=>d.price)]).filter(C=>C>0&&(C-g)*(C-c)<0).sort((C,d)=>c>
g?C-d:d-C);for(const C of[...u,c])n.push(...this.onPrice(t,C,r,void 0,e.ts))}for(const l of this.state.positions.filter(g=>g.symbol===t&&g.openedAt===r))(l.side===
"long"?e.low<=l.sl:e.high>=l.sl)&&this.stopOut(l,l.sl,r,n)}return n}onPrice(t,s,i=Date.now(),n,e=1/0){var l,g,c;const r=n&&n>0?n:s,o=[],h=(l=this.state).lastTickTs??
(l.lastTickTs={});h[t]=Math.max(h[t]??0,i),((g=this.state).lastPx??(g.lastPx={}))[t]=s;for(const u of[...this.state.pending]){if(u.symbol!==t||u.createdAt>e||!(u.
side==="long"?s<=u.price:s>=u.price))continue;this.state.pending=this.state.pending.filter(f=>f.id!==u.id);const d=this.open({...u,liquidity:"maker"},i);d.ok?o.
push({kind:"limit_fill",positionId:(c=d.position)==null?void 0:c.id,message:`\uC9C0\uC815\uAC00 \uCCB4\uACB0 ${u.side==="long"?"\uB871":"\uC20F"} @ ${this.px(u.
symbol,u.price)}`}):o.push({kind:"close",message:`\uC9C0\uC815\uAC00 \uCCB4\uACB0 \uC2E4\uD328: ${d.error}`})}for(const u of[...this.state.positions]){if(u.symbol!==
t||u.openedAt>e)continue;const C=u.side==="long";if(u.liqPrice>0&&(C?r<=u.liqPrice:r>=u.liqPrice)){const d=C?u.entry*(1-1/u.leverage):u.entry*(1+1/u.leverage);this.
close(u.id,u.qty,d,"\uAC15\uC81C\uCCAD\uC0B0",i,0),o.push({kind:"liq",positionId:u.id,message:`\uAC15\uC81C\uCCAD\uC0B0 @ ${this.px(u.symbol,u.liqPrice)} (\uC99D\uAC70\uAE08 \uC804\
\uC561 \uC190\uC2E4)`});continue}if(C?s<=u.sl:s>=u.sl){this.stopOut(u,s,i,o);continue}for(let d=0;d<u.targets.length;d++){const f=u.targets[d];if(f.done)continue;
if(!(C?s>=f.price:s<=f.price))break;f.done=!0;const m=u.targets.slice(d+1).every(v=>v.done)?u.qty:this.partialQty(u,Math.min(u.qty,u.origQty*f.fraction),f.price),
y=this.close(u.id,m,f.price,f.label,i);o.push({kind:"tp",positionId:u.id,message:`${f.label} \uCCB4\uACB0 @ ${this.px(u.symbol,f.price)} (\uC21C\uC190\uC775 ${y?
(y.netPnl>=0?"+":"")+y.netPnl.toFixed(2):"-"} USDT)`});const D=this.state.positions.find(v=>v.id===u.id);if(!D)break;d===0&&this.moveSlToBe&&!D.beMoved&&(D.sl=O(
D,this.precision(D.symbol).dp,k+this.slip),D.beMoved=!0,o.push({kind:"be",positionId:u.id,message:`TP1 \uD6C4 SL \u2192 \uBCF8\uC808 ${this.px(D.symbol,D.sl)} (\
\uC218\uC218\uB8CC \uD3EC\uD568)`}))}}return o}stopOut(t,s,i,n){const e=t.side==="long",r=t.beMoved?"\uBCF8\uC808 SL":"\uC190\uC808 SL",o=(e?Math.min(t.sl,s):Math.
max(t.sl,s))*(1-A(t.side)*this.slip),h=this.close(t.id,t.qty,o,r,i);n.push({kind:"sl",positionId:t.id,message:`${r} \uCCB4\uACB0 @ ${this.px(t.symbol,o)} (\uC21C\uC190\uC775 ${h?
(h.netPnl>=0?"+":"")+h.netPnl.toFixed(2):"-"} USDT)`})}snapEquity(t,s=Date.now()){const i=this.equity(t),n=this.state.equityCurve;n.push({t:s,equity:i}),n.length>
2e3&&n.splice(0,n.length-2e3)}}function H(a,t){const s=a.side==="long",i=t.slip??S,n=t.suggestedSl!==void 0&&Number.isFinite(t.suggestedSl)?s?Math.max(a.sl,t.suggestedSl):
Math.min(a.sl,t.suggestedSl):a.sl,e=t.last*(1+A(a.side)*i),r=Math.max(0,Math.round(-Math.log10(t.step))),o=g=>Number((Math.floor(g/t.step+1e-9)*t.step).toFixed(
r)),h=g=>E(a,g,e,n,i);let l=o(t.wantQty);for(let g=0;l>0&&g<1e5&&!(h(l)<=t.budget+1e-9);g++)l=o(l-t.step);return{qty:Math.max(0,l),newSl:n,lossAtSl:h(Math.max(0,
l))}}function _(a){return JSON.parse(JSON.stringify(a))}function J(a,t=[]){const s=new Set(t),i=new Map;let n=0,e=0,r=0;for(const d of a){if(n+=d.fees,r+=d.funding??
0,s.has(d.positionId)){e+=d.netPnl;continue}const f=i.get(d.positionId)??{net:0,r:0,hasR:!1,risk:0};f.net+=d.netPnl,(d.r!==void 0||d.riskUsd)&&(f.hasR=!0),d.riskUsd&&
(f.risk=d.riskUsd),f.r=f.risk>0?f.net/f.risk:f.r+(d.r??0),i.set(d.positionId,f)}const o=[...i.values()],h=o.filter(d=>d.net>0).length,l=o.filter(d=>d.hasR).map(
d=>d.r),g=l.filter(d=>d>0),c=l.filter(d=>d<=0),u=d=>d.length?d.reduce((f,p)=>f+p,0)/d.length:0,C=l.length?g.length/l.length:0;return{trades:o.length,wins:h,winRate:o.
length?h/o.length:0,net:o.reduce((d,f)=>d+f.net,0)+e,fees:n,partialNet:e,funding:r,rTrades:l.length,avgR:u(l),avgWinR:u(g),avgLossR:u(c),expectancyR:C*u(g)+(1-C)*
u(c)}}function W(a,t){const s=new Set(a.filter(n=>n.final&&n.closedAt>=t).map(n=>n.positionId)),i=new Map;for(const n of a){if(!s.has(n.positionId))continue;const e=i.
get(n.positionId)??{net:0,r:0,risk:0};e.net+=n.netPnl,n.riskUsd&&(e.risk=n.riskUsd),e.r=e.risk>0?e.net/e.risk:e.r+(n.r??0),i.set(n.positionId,e)}return[...i.values()].
reduce((n,e)=>n+e.r,0)}const Q={TP1:"TP1 \uC911\uC559\uC120",TP2:"TP2 \uBC18\uB300\uD3B8",TP:"TP 1:3"};function j(a){return a.map(t=>({price:Number(t.price),fraction:t.
sizePct/100,label:Q[t.label]??t.label}))}function V(a,t,s,i){const n=a==="long"?t*.995:t*1.005,e=String(t),r=L({side:a,kind:"breakout",entry:e,extremeWick:String(
n),box:{top:e,bottom:e,mid:e},slBufferPct:0,tickSize:s,feeRate:k,slippageBps:w});return{sl:Number(r.sl).toFixed(i),tp1:Number(r.targets[0].price).toFixed(i)}}export{P as D,$ as M,G as P,w as S,k as T,J as a,S as b,V as n,W as r,H as s,j as t,N as u};
