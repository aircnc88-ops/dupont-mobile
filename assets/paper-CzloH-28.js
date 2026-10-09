var E=Object.defineProperty;var I=(d,t,i)=>t in d?E(d,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):d[t]=i;var B=(d,t,i)=>I(d,typeof t!="symbol"?t+"":t,i);import{b as P,c as R}from"./strategy-Cu9CvPGE.js";function L(d,t,i){return d*t/(i>0?i:1)}const M=200,k=Number(P("bitget_default","swap","taker")),$=Number(P("bitget_default","swap","maker")),w=2,S=w/1e4,U=5,q=8*
36e5;function b(d=M,t=Date.now()){return{wallet:d,bankroll:d,positions:[],fills:[],pending:[],equityCurve:[{t,equity:d}],seq:0}}const A=d=>d==="long"?1:-1;function N(d,t){
return A(d.side)*(t-d.entry)*d.qty}function F(d,t,i,e){const n=1/(i||1);return d==="long"?t*(1-n+e):t*(1+n-e)}function T(d,t,i,e,n=S,s=k){const r=d.qty+t,o=(d.entry*
d.qty+i*t)/r;return A(d.side)*(o-e)*r+d.entryFeeLeft+t*i*s+r*e*(k+n)}function x(d,t,i,e,n){return Math.max(0,A(d)*(t-i))*e+n+e*i*(k+S)}function O(d,t,i=k+S){const e=d.
qty,n=d.side==="long"?(d.entry*e+d.entryFeeLeft)/(e*(1-i)):(d.entry*e-d.entryFeeLeft)/(e*(1+i)),s=10**t;return d.side==="long"?Math.ceil(n*s-1e-9)/s:Math.floor(
n*s+1e-9)/s}class K{constructor(t){B(this,"state");B(this,"moveSlToBe",!0);B(this,"precision",()=>({dp:2,qdp:4}));B(this,"slip",S);B(this,"minOrderUsdt",U);var i,
e,n;this.state=t?_(t):b();for(const s of this.state.positions)s.initialEntry??(s.initialEntry=s.entry),s.fundingAcc??(s.fundingAcc=0),s.riskUsd??(s.riskUsd=x(s.
side,s.entry,s.initialSl,s.origQty,s.origQty*s.entry*k));(i=this.state).lastTickTs??(i.lastTickTs={}),(e=this.state).rateSeen??(e.rateSeen={}),(n=this.state).settledRates??
(n.settledRates={})}px(t,i){return i.toLocaleString("en-US",{minimumFractionDigits:this.precision(t).dp,maximumFractionDigits:this.precision(t).dp})}qx(t,i){return i.
toFixed(this.precision(t).qdp)}step(t){return 10**-this.precision(t).qdp}floorStep(t,i){const e=this.precision(t).qdp,n=this.step(t);return Number((Math.floor(i/
n+1e-9)*n).toFixed(e))}nextId(t){return this.state.seq+=1,`${t}${Date.now().toString(36)}${this.state.seq}`}reset(t=M,i=Date.now()){this.state=b(t,i)}usedMargin(){
return this.state.positions.reduce((t,i)=>t+i.margin,0)+this.state.pending.reduce((t,i)=>t+i.qty*i.price/i.leverage,0)}available(){return this.state.wallet-this.
usedMargin()}equity(t){return this.state.wallet+this.state.positions.reduce((i,e)=>i+N(e,t[e.symbol]??e.entry),0)}open(t,i=Date.now()){const e=[];if(!(t.qty>0)||
!(t.price>0))return{ok:!1,error:"\uC218\uB7C9/\uAC00\uACA9 \uC624\uB958",events:e};const n=t.liquidity==="maker",s=n?$:k,r=n?t.price:(t.refPx&&t.refPx>0?t.refPx:
t.price)*(1+A(t.side)*this.slip),h=t.qty*r*s,l=L(t.qty,r,t.leverage);if(l+h>this.available()+1e-9)return{ok:!1,error:`\uC99D\uAC70\uAE08 \uBD80\uC871 (\uD544\uC694 ${(l+
h).toFixed(2)} USDT)`,events:e};const g=t.mmr??.005,c=this.state.positions.find(f=>f.symbol===t.symbol&&f.side===t.side);if(c&&!t.isAdd)return{ok:!1,error:"\uAC19\uC740 \uBC29\
\uD5A5 \uD3EC\uC9C0\uC158 \uBCF4\uC720 \uC911 (\uBD88\uD0C0\uAE30\uB294 \uBD88\uD0C0\uAE30 \uBC84\uD2BC \uC0AC\uC6A9)",events:e};if(!c&&t.isAdd)return{ok:!1,error:"\
\uCD94\uAC00\uD560 \uD3EC\uC9C0\uC158 \uC5C6\uC74C",events:e};const u=t.side==="long";if(c){const f=c.qty+t.qty,p=(c.entry*c.qty+r*t.qty)/f,m=u?Math.max(c.sl,t.
sl):Math.min(c.sl,t.sl),y=F(c.side,p,c.leverage,c.mmr);return(u?m<=y:m>=y)?{ok:!1,error:"SL\uC774 \uCCAD\uC0B0\uAC00 \uBC16 (\uCD94\uAC00 \uD6C4 \uCCAD\uC0B0\uAC00 \uAE30\uC900)",
events:e}:c.riskBudget!==void 0&&T(c,t.qty,r,m,this.slip,s)>c.riskBudget+1e-9?{ok:!1,error:`\uCD94\uAC00 \uC2DC \uCD1D \uB9AC\uC2A4\uD06C\uAC00 \uC9C4\uC785 \uC2DC \uC608\uC0B0(${c.
riskBudget.toFixed(2)} USDT) \uCD08\uACFC`,events:e}:(this.state.wallet-=h,c.entry=p,c.qty=f,c.origQty+=t.qty,c.margin+=l,c.entryFeeLeft+=h,c.adds+=1,c.sl=m,c.liqPrice=
y,c.riskUsd=(c.riskUsd??0)+x(t.side,r,m,t.qty,h),t.candleTs!==void 0&&(c.lastAddTs=t.candleTs),e.push({kind:"add",positionId:c.id,message:`\uBD88\uD0C0\uAE30 \uCD94\uAC00 ${this.
qx(t.symbol,t.qty)} @ ${this.px(t.symbol,r)}`}),this.snapEquity({[t.symbol]:r},i),{ok:!0,position:c,fillPx:r,events:e})}const C=F(t.side,r,t.leverage,g);if(u?t.
sl<=C:t.sl>=C)return{ok:!1,error:`SL\uC774 \uCCAD\uC0B0\uAC00(${this.px(t.symbol,C)}) \uBC16 \u2013 \uB808\uBC84\uB9AC\uC9C0\uB97C \uB0AE\uCD94\uC138\uC694`,events:e};
this.state.wallet-=h;const a={id:this.nextId("p"),symbol:t.symbol,side:t.side,qty:t.qty,origQty:t.qty,entry:r,leverage:t.leverage,margin:l,sl:t.sl,initialSl:t.sl,
targets:t.targets.map(f=>({...f,done:!1})),setup:t.setup,signalId:t.signalId,breakoutLevel:t.breakoutLevel,adds:0,entryFeeLeft:h,realizedNet:0,beMoved:!1,liqPrice:C,
mmr:g,openedAt:i,initialEntry:r,riskUsd:x(t.side,r,t.sl,t.qty,h),fundingAcc:0,initialQty:t.qty,riskBudget:t.riskBudget};return this.state.positions.push(a),e.push(
{kind:"open",positionId:a.id,message:`${t.side==="long"?"\uB871":"\uC20F"} \uC9C4\uC785 ${this.qx(t.symbol,t.qty)} ${t.symbol} @ ${this.px(t.symbol,r)}`}),this.
snapEquity({[t.symbol]:r},i),{ok:!0,position:a,fillPx:r,events:e}}placeLimit(t,i=Date.now()){return t.qty*t.price/t.leverage>this.available()?{ok:!1,error:"\uC99D\uAC70\uAE08 \
\uBD80\uC871"}:(this.state.pending.push({...t,id:this.nextId("o"),createdAt:i}),{ok:!0})}cancelLimit(t){this.state.pending=this.state.pending.filter(i=>i.id!==t)}close(t,i,e,n,s=Date.
now(),r=k){const o=this.state.positions.find(y=>y.id===t);if(!o)return null;const h=Math.min(i,o.qty);if(!(h>0))return null;this.accrueFunding(o.symbol,e,s,0,o.
id);const l=h/o.qty,g=A(o.side)*(e-o.entry)*h,c=h*e*r,u=o.entryFeeLeft*l,C=o.margin*l,a=(o.fundingAcc??0)*l;o.entryFeeLeft-=u,o.margin-=C,o.fundingAcc=(o.fundingAcc??
0)-a,o.qty=h>=o.qty-1e-12?0:o.qty-h,this.state.wallet+=g-c;const f=g-c-u-a;o.realizedNet+=f+a;const p=o.qty<=1e-12,m={id:this.nextId("f"),positionId:o.id,symbol:o.
symbol,side:o.side,setup:o.setup,qty:h,entry:o.entry,exit:e,grossPnl:g,fees:c+u,netPnl:f,reason:n,openedAt:o.openedAt,closedAt:s,final:p,funding:a,r:o.riskUsd&&
o.riskUsd>0?f/o.riskUsd:void 0,riskUsd:o.riskUsd};return this.state.fills.push(m),p&&(this.state.positions=this.state.positions.filter(y=>y.id!==o.id)),this.snapEquity(
{[o.symbol]:e},s),m}partialQty(t,i,e){if(i>=t.qty-1e-12)return t.qty;const n=this.floorStep(t.symbol,i);return!(n>0)||(t.qty-n)*e<this.minOrderUsdt?t.qty:n}closeFraction(t,i,e,n,s=Date.
now()){const r=this.state.positions.find(h=>h.id===t);if(!r)return null;const o=e*(1-A(r.side)*this.slip);return this.close(t,this.partialQty(r,r.qty*Math.min(1,
i),o),o,n,s)}needsSettledRate(t,i=Date.now()){return this.state.positions.some(e=>{var s,r;if(e.symbol!==t)return!1;const n=Math.floor((e.lastFundingTs??e.openedAt)/
q)*q+q;return n<=i&&((r=(s=this.state.settledRates)==null?void 0:s[t])==null?void 0:r[String(n)])===void 0})}noteTickerRate(t,i,e=Date.now()){var o;if(!Number.isFinite(
i))return;const n=(o=this.state).rateSeen??(o.rateSeen={}),s=n[t]??(n[t]=[]),r=s[s.length-1];r&&r[1]===i&&Math.floor(r[0]/q)===Math.floor(e/q)||(s.push([e,i]),s.
length>100&&s.splice(0,s.length-100))}setSettledRates(t,i){var r;const e=(r=this.state).settledRates??(r.settledRates={}),n=e[t]??(e[t]={});for(const o of i)Number.
isFinite(o.ts)&&Number.isFinite(o.rate)&&(n[String(o.ts)]=o.rate);const s=Object.keys(n).map(Number).sort((o,h)=>o-h);for(const o of s.slice(0,Math.max(0,s.length-
100)))delete n[String(o)]}fundingRateFor(t,i){var s,r,o;const e=(r=(s=this.state.settledRates)==null?void 0:s[t])==null?void 0:r[String(i)];if(e!==void 0)return e;
const n=((o=this.state.rateSeen)==null?void 0:o[t])??[];for(let h=n.length-1;h>=0;h--)if(n[h][0]<i)return n[h][1]}accrueFunding(t,i,e=Date.now(),n=0,s){var o,h;
const r=[];if(!(i>0))return r;for(const l of this.state.positions){if(l.symbol!==t||s!==void 0&&l.id!==s)continue;const g=l.lastFundingTs??l.openedAt;let c=Math.
floor(g/q)*q+q,u=0,C=0;for(;c<=e&&!(((h=(o=this.state.settledRates)==null?void 0:o[t])==null?void 0:h[String(c)])===void 0&&e-c<n);){const f=this.fundingRateFor(
t,c);if(f===void 0)break;const p=A(l.side)*l.qty*i*f;this.state.wallet-=p,l.realizedNet-=p,l.fundingAcc=(l.fundingAcc??0)+p,l.lastFundingTs=c,u+=p,C=f,c+=q}u!==
0&&r.push({kind:"funding",positionId:l.id,message:`\uD380\uB529\uBE44 ${u>0?"\uC9C0\uBD88":"\uC218\uB839"} ${Math.abs(u).toFixed(4)} USDT (${(C*100).toFixed(4)}\
%)`})}return r.length&&this.snapEquity({[t]:i},e),r}replayBars(t,i,e=1/0){const n=[];for(const s of[...i].sort((r,o)=>r.ts-o.ts)){const r=Math.min(s.ts+59999,e);
n.push(...this.accrueFunding(t,s.open,s.ts));const o=()=>this.state.positions.filter(l=>l.symbol===t&&l.openedAt<=s.ts);for(const l of o()){const g=l.side==="lo\
ng",c=g?s.low<=l.sl:s.high>=l.sl,u=l.targets.some(C=>!C.done&&(g?s.high>=C.price:s.low<=C.price));c&&u&&n.push(...this.onPrice(t,g?Math.min(s.open,l.sl):Math.max(
s.open,l.sl),r,void 0,s.ts))}const h=s.close>=s.open?[s.open,s.low,s.high,s.close]:[s.open,s.high,s.low,s.close];n.push(...this.onPrice(t,h[0],r,void 0,s.ts));for(let l=1;l<
h.length;l++){const g=h[l-1],c=h[l],u=o().flatMap(C=>[C.sl,C.liqPrice,...C.targets.filter(a=>!a.done).map(a=>a.price)]).filter(C=>C>0&&(C-g)*(C-c)<0).sort((C,a)=>c>
g?C-a:a-C);for(const C of[...u,c])n.push(...this.onPrice(t,C,r,void 0,s.ts))}for(const l of this.state.positions.filter(g=>g.symbol===t&&g.openedAt===r))(l.side===
"long"?s.low<=l.sl:s.high>=l.sl)&&this.stopOut(l,l.sl,r,n)}return n}onPrice(t,i,e=Date.now(),n,s=1/0){var l,g,c;const r=n&&n>0?n:i,o=[],h=(l=this.state).lastTickTs??
(l.lastTickTs={});h[t]=Math.max(h[t]??0,e),((g=this.state).lastPx??(g.lastPx={}))[t]=i;for(const u of[...this.state.pending]){if(u.symbol!==t||u.createdAt>s||!(u.
side==="long"?i<=u.price:i>=u.price))continue;this.state.pending=this.state.pending.filter(f=>f.id!==u.id);const a=this.open({...u,liquidity:"maker"},e);a.ok?o.
push({kind:"limit_fill",positionId:(c=a.position)==null?void 0:c.id,message:`\uC9C0\uC815\uAC00 \uCCB4\uACB0 ${u.side==="long"?"\uB871":"\uC20F"} @ ${this.px(u.
symbol,u.price)}`}):o.push({kind:"close",message:`\uC9C0\uC815\uAC00 \uCCB4\uACB0 \uC2E4\uD328: ${a.error}`})}for(const u of[...this.state.positions]){if(u.symbol!==
t||u.openedAt>s)continue;const C=u.side==="long";if(u.liqPrice>0&&(C?r<=u.liqPrice:r>=u.liqPrice)){const a=C?u.entry*(1-1/u.leverage):u.entry*(1+1/u.leverage);this.
close(u.id,u.qty,a,"\uAC15\uC81C\uCCAD\uC0B0",e,0),o.push({kind:"liq",positionId:u.id,message:`\uAC15\uC81C\uCCAD\uC0B0 @ ${this.px(u.symbol,u.liqPrice)} (\uC99D\uAC70\uAE08 \uC804\
\uC561 \uC190\uC2E4)`});continue}if(C?i<=u.sl:i>=u.sl){this.stopOut(u,i,e,o);continue}for(let a=0;a<u.targets.length;a++){const f=u.targets[a];if(f.done)continue;
if(!(C?i>=f.price:i<=f.price))break;f.done=!0;const m=u.targets.slice(a+1).every(v=>v.done)?u.qty:this.partialQty(u,Math.min(u.qty,u.origQty*f.fraction),f.price),
y=this.close(u.id,m,f.price,f.label,e);o.push({kind:"tp",positionId:u.id,message:`${f.label} \uCCB4\uACB0 @ ${this.px(u.symbol,f.price)} (\uC21C\uC190\uC775 ${y?
(y.netPnl>=0?"+":"")+y.netPnl.toFixed(2):"-"} USDT)`});const D=this.state.positions.find(v=>v.id===u.id);if(!D)break;a===0&&this.moveSlToBe&&!D.beMoved&&(D.sl=O(
D,this.precision(D.symbol).dp,k+this.slip),D.beMoved=!0,o.push({kind:"be",positionId:u.id,message:`TP1 \uD6C4 SL \u2192 \uBCF8\uC808 ${this.px(D.symbol,D.sl)} (\
\uC218\uC218\uB8CC \uD3EC\uD568)`}))}}return o}stopOut(t,i,e,n){const s=t.side==="long",r=t.beMoved?"\uBCF8\uC808 SL":"\uC190\uC808 SL",o=(s?Math.min(t.sl,i):Math.
max(t.sl,i))*(1-A(t.side)*this.slip),h=this.close(t.id,t.qty,o,r,e);n.push({kind:"sl",positionId:t.id,message:`${r} \uCCB4\uACB0 @ ${this.px(t.symbol,o)} (\uC21C\uC190\uC775 ${h?
(h.netPnl>=0?"+":"")+h.netPnl.toFixed(2):"-"} USDT)`})}snapEquity(t,i=Date.now()){const e=this.equity(t),n=this.state.equityCurve;n.push({t:i,equity:e}),n.length>
2e3&&n.splice(0,n.length-2e3)}}function G(d,t){const i=d.side==="long",e=t.slip??S,n=t.suggestedSl!==void 0&&Number.isFinite(t.suggestedSl)?i?Math.max(d.sl,t.suggestedSl):
Math.min(d.sl,t.suggestedSl):d.sl,s=t.last*(1+A(d.side)*e),r=Math.max(0,Math.round(-Math.log10(t.step))),o=g=>Number((Math.floor(g/t.step+1e-9)*t.step).toFixed(
r)),h=g=>T(d,g,s,n,e);let l=o(t.wantQty);for(let g=0;l>0&&g<1e5&&!(h(l)<=t.budget+1e-9);g++)l=o(l-t.step);return{qty:Math.max(0,l),newSl:n,lossAtSl:h(Math.max(0,
l))}}function _(d){return JSON.parse(JSON.stringify(d))}function H(d,t=[]){const i=new Set(t),e=new Map;let n=0,s=0,r=0;for(const a of d){if(n+=a.fees,r+=a.funding??
0,i.has(a.positionId)){s+=a.netPnl;continue}const f=e.get(a.positionId)??{net:0,r:0,hasR:!1,risk:0};f.net+=a.netPnl,(a.r!==void 0||a.riskUsd)&&(f.hasR=!0),a.riskUsd&&
(f.risk=a.riskUsd),f.r=f.risk>0?f.net/f.risk:f.r+(a.r??0),e.set(a.positionId,f)}const o=[...e.values()],h=o.filter(a=>a.net>0).length,l=o.filter(a=>a.hasR).map(
a=>a.r),g=l.filter(a=>a>0),c=l.filter(a=>a<=0),u=a=>a.length?a.reduce((f,p)=>f+p,0)/a.length:0,C=l.length?g.length/l.length:0;return{trades:o.length,wins:h,winRate:o.
length?h/o.length:0,net:o.reduce((a,f)=>a+f.net,0)+s,fees:n,partialNet:s,funding:r,rTrades:l.length,avgR:u(l),avgWinR:u(g),avgLossR:u(c),expectancyR:C*u(g)+(1-C)*
u(c)}}function J(d,t){const i=new Set(d.filter(n=>n.final&&n.closedAt>=t).map(n=>n.positionId)),e=new Map;for(const n of d){if(!i.has(n.positionId))continue;const s=e.
get(n.positionId)??{net:0,r:0,risk:0};s.net+=n.netPnl,n.riskUsd&&(s.risk=n.riskUsd),s.r=s.risk>0?s.net/s.risk:s.r+(n.r??0),e.set(n.positionId,s)}return[...e.values()].
reduce((n,s)=>n+s.r,0)}function W(d){const t=["closedAt","symbol","side","setup","qty","entry","exit","grossPnl","fees","funding","netPnl","r","reason","positio\
nId"],i=d.map(e=>[new Date(e.closedAt).toISOString(),e.symbol,e.side,e.setup,e.qty,e.entry,e.exit,e.grossPnl.toFixed(4),e.fees.toFixed(4),(e.funding??0).toFixed(
4),e.netPnl.toFixed(4),e.r===void 0?"":e.r.toFixed(3),`"${e.reason.replace(/"/g,'""')}"`,e.positionId].join(","));return[t.join(","),...i].join(`
`)}const Q={TP1:"TP1 \uC911\uC559\uC120",TP2:"TP2 \uBC18\uB300\uD3B8",TP:"TP 1:3"};function V(d){return d.map(t=>({price:Number(t.price),fraction:t.sizePct/100,
label:Q[t.label]??t.label}))}function X(d,t,i,e){const n=d==="long"?t*.995:t*1.005,s=String(t),r=R({side:d,kind:"breakout",entry:s,extremeWick:String(n),box:{top:s,
bottom:s,mid:s},slBufferPct:0,tickSize:i,feeRate:k,slippageBps:w});return{sl:Number(r.sl).toFixed(e),tp1:Number(r.targets[0].price).toFixed(e)}}export{M as D,$ as M,K as P,w as S,k as T,H as a,S as b,W as f,X as n,J as r,G as s,V as t,N as u};
