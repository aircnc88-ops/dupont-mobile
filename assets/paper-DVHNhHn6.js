var T=Object.defineProperty;var E=(d,t,i)=>t in d?T(d,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):d[t]=i;var B=(d,t,i)=>E(d,typeof t!="symbol"?t+"":t,i);import{b as F,c as R}from"./strategy-Cu9CvPGE.js";function I(d,t,i){return d*t/(i>0?i:1)}const P=200,D=Number(F("bitget_default","swap","taker")),L=Number(F("bitget_default","swap","maker")),M=2,k=M/1e4,$=5,q=8*
36e5;function x(d=P){return{wallet:d,bankroll:d,positions:[],fills:[],pending:[],equityCurve:[{t:Date.now(),equity:d}],seq:0}}const A=d=>d==="long"?1:-1;function N(d,t){
return A(d.side)*(t-d.entry)*d.qty}function b(d,t,i,e){const n=1/(i||1);return d==="long"?t*(1-n+e):t*(1+n-e)}function w(d,t,i,e,n=k,r=D){const l=d.qty+t,o=(d.entry*
d.qty+i*t)/l;return A(d.side)*(o-e)*l+d.entryFeeLeft+t*i*r+l*e*(D+n)}function v(d,t,i,e,n){return Math.max(0,A(d)*(t-i))*e+n+e*i*(D+k)}function U(d,t,i=D+k){const e=d.
qty,n=d.side==="long"?(d.entry*e+d.entryFeeLeft)/(e*(1-i)):(d.entry*e-d.entryFeeLeft)/(e*(1+i)),r=10**t;return d.side==="long"?Math.ceil(n*r-1e-9)/r:Math.floor(
n*r+1e-9)/r}class j{constructor(t){B(this,"state");B(this,"moveSlToBe",!0);B(this,"precision",()=>({dp:2,qdp:4}));B(this,"slip",k);B(this,"minOrderUsdt",$);var i,
e,n;this.state=t?_(t):x();for(const r of this.state.positions)r.initialEntry??(r.initialEntry=r.entry),r.fundingAcc??(r.fundingAcc=0),r.riskUsd??(r.riskUsd=v(r.
side,r.entry,r.initialSl,r.origQty,r.origQty*r.entry*D));(i=this.state).lastTickTs??(i.lastTickTs={}),(e=this.state).rateSeen??(e.rateSeen={}),(n=this.state).settledRates??
(n.settledRates={})}px(t,i){return i.toLocaleString("en-US",{minimumFractionDigits:this.precision(t).dp,maximumFractionDigits:this.precision(t).dp})}qx(t,i){return i.
toFixed(this.precision(t).qdp)}step(t){return 10**-this.precision(t).qdp}floorStep(t,i){const e=this.precision(t).qdp,n=this.step(t);return Number((Math.floor(i/
n+1e-9)*n).toFixed(e))}nextId(t){return this.state.seq+=1,`${t}${Date.now().toString(36)}${this.state.seq}`}reset(t=P){this.state=x(t)}usedMargin(){return this.
state.positions.reduce((t,i)=>t+i.margin,0)+this.state.pending.reduce((t,i)=>t+i.qty*i.price/i.leverage,0)}available(){return this.state.wallet-this.usedMargin()}equity(t){
return this.state.wallet+this.state.positions.reduce((i,e)=>i+N(e,t[e.symbol]??e.entry),0)}open(t,i=Date.now()){const e=[];if(!(t.qty>0)||!(t.price>0))return{ok:!1,
error:"\uC218\uB7C9/\uAC00\uACA9 \uC624\uB958",events:e};const n=t.liquidity==="maker",r=n?L:D,l=n?t.price:(t.refPx&&t.refPx>0?t.refPx:t.price)*(1+A(t.side)*this.
slip),u=t.qty*l*r,h=I(t.qty,l,t.leverage);if(h+u>this.available()+1e-9)return{ok:!1,error:`\uC99D\uAC70\uAE08 \uBD80\uC871 (\uD544\uC694 ${(h+u).toFixed(2)} USD\
T)`,events:e};const f=t.mmr??.005,s=this.state.positions.find(g=>g.symbol===t.symbol&&g.side===t.side);if(s&&!t.isAdd)return{ok:!1,error:"\uAC19\uC740 \uBC29\uD5A5 \uD3EC\uC9C0\uC158 \uBCF4\uC720 \uC911 (\uBD88\uD0C0\uAE30\uB294 \uBD88\
\uD0C0\uAE30 \uBC84\uD2BC \uC0AC\uC6A9)",events:e};if(!s&&t.isAdd)return{ok:!1,error:"\uCD94\uAC00\uD560 \uD3EC\uC9C0\uC158 \uC5C6\uC74C",events:e};const a=t.side===
"long";if(s){const g=s.qty+t.qty,m=(s.entry*s.qty+l*t.qty)/g,y=a?Math.max(s.sl,t.sl):Math.min(s.sl,t.sl),p=b(s.side,m,s.leverage,s.mmr);return(a?y<=p:y>=p)?{ok:!1,
error:"SL\uC774 \uCCAD\uC0B0\uAC00 \uBC16 (\uCD94\uAC00 \uD6C4 \uCCAD\uC0B0\uAC00 \uAE30\uC900)",events:e}:s.riskBudget!==void 0&&w(s,t.qty,l,y,this.slip,r)>s.riskBudget+
1e-9?{ok:!1,error:`\uCD94\uAC00 \uC2DC \uCD1D \uB9AC\uC2A4\uD06C\uAC00 \uC9C4\uC785 \uC2DC \uC608\uC0B0(${s.riskBudget.toFixed(2)} USDT) \uCD08\uACFC`,events:e}:
(this.state.wallet-=u,s.entry=m,s.qty=g,s.origQty+=t.qty,s.margin+=h,s.entryFeeLeft+=u,s.adds+=1,s.sl=y,s.liqPrice=p,s.riskUsd=(s.riskUsd??0)+v(t.side,l,y,t.qty,
u),t.candleTs!==void 0&&(s.lastAddTs=t.candleTs),e.push({kind:"add",positionId:s.id,message:`\uBD88\uD0C0\uAE30 \uCD94\uAC00 ${this.qx(t.symbol,t.qty)} @ ${this.
px(t.symbol,l)}`}),this.snapEquity({[t.symbol]:l},i),{ok:!0,position:s,fillPx:l,events:e})}const C=b(t.side,l,t.leverage,f);if(a?t.sl<=C:t.sl>=C)return{ok:!1,error:`\
SL\uC774 \uCCAD\uC0B0\uAC00(${this.px(t.symbol,C)}) \uBC16 \u2013 \uB808\uBC84\uB9AC\uC9C0\uB97C \uB0AE\uCD94\uC138\uC694`,events:e};this.state.wallet-=u;const c={
id:this.nextId("p"),symbol:t.symbol,side:t.side,qty:t.qty,origQty:t.qty,entry:l,leverage:t.leverage,margin:h,sl:t.sl,initialSl:t.sl,targets:t.targets.map(g=>({...g,
done:!1})),setup:t.setup,signalId:t.signalId,breakoutLevel:t.breakoutLevel,adds:0,entryFeeLeft:u,realizedNet:0,beMoved:!1,liqPrice:C,mmr:f,openedAt:i,initialEntry:l,
riskUsd:v(t.side,l,t.sl,t.qty,u),fundingAcc:0,initialQty:t.qty,riskBudget:t.riskBudget};return this.state.positions.push(c),e.push({kind:"open",positionId:c.id,
message:`${t.side==="long"?"\uB871":"\uC20F"} \uC9C4\uC785 ${this.qx(t.symbol,t.qty)} ${t.symbol} @ ${this.px(t.symbol,l)}`}),this.snapEquity({[t.symbol]:l},i),
{ok:!0,position:c,fillPx:l,events:e}}placeLimit(t,i=Date.now()){return t.qty*t.price/t.leverage>this.available()?{ok:!1,error:"\uC99D\uAC70\uAE08 \uBD80\uC871"}:
(this.state.pending.push({...t,id:this.nextId("o"),createdAt:i}),{ok:!0})}cancelLimit(t){this.state.pending=this.state.pending.filter(i=>i.id!==t)}close(t,i,e,n,r=Date.
now(),l=D){const o=this.state.positions.find(p=>p.id===t);if(!o)return null;const u=Math.min(i,o.qty);if(!(u>0))return null;this.accrueFunding(o.symbol,e,r,0);const h=u/
o.qty,f=A(o.side)*(e-o.entry)*u,s=u*e*l,a=o.entryFeeLeft*h,C=o.margin*h,c=(o.fundingAcc??0)*h;o.entryFeeLeft-=a,o.margin-=C,o.fundingAcc=(o.fundingAcc??0)-c,o.qty=
u>=o.qty-1e-12?0:o.qty-u,this.state.wallet+=f-s;const g=f-s-a-c;o.realizedNet+=g+c;const m=o.qty<=1e-12,y={id:this.nextId("f"),positionId:o.id,symbol:o.symbol,side:o.
side,setup:o.setup,qty:u,entry:o.entry,exit:e,grossPnl:f,fees:s+a,netPnl:g,reason:n,openedAt:o.openedAt,closedAt:r,final:m,funding:c,r:o.riskUsd&&o.riskUsd>0?g/
o.riskUsd:void 0};return this.state.fills.push(y),m&&(this.state.positions=this.state.positions.filter(p=>p.id!==o.id)),this.snapEquity({[o.symbol]:e},r),y}partialQty(t,i,e){
if(i>=t.qty-1e-12)return t.qty;const n=this.floorStep(t.symbol,i);return!(n>0)||(t.qty-n)*e<this.minOrderUsdt?t.qty:n}closeFraction(t,i,e,n,r=Date.now()){const l=this.
state.positions.find(u=>u.id===t);if(!l)return null;const o=e*(1-A(l.side)*this.slip);return this.close(t,this.partialQty(l,l.qty*Math.min(1,i),o),o,n,r)}needsSettledRate(t,i=Date.
now()){return this.state.positions.some(e=>{var r,l;if(e.symbol!==t)return!1;const n=Math.floor((e.lastFundingTs??e.openedAt)/q)*q+q;return n<=i&&((l=(r=this.state.
settledRates)==null?void 0:r[t])==null?void 0:l[String(n)])===void 0})}noteTickerRate(t,i,e=Date.now()){var o;if(!Number.isFinite(i))return;const n=(o=this.state).
rateSeen??(o.rateSeen={}),r=n[t]??(n[t]=[]),l=r[r.length-1];l&&l[1]===i&&Math.floor(l[0]/q)===Math.floor(e/q)||(r.push([e,i]),r.length>100&&r.splice(0,r.length-
100))}setSettledRates(t,i){var l;const e=(l=this.state).settledRates??(l.settledRates={}),n=e[t]??(e[t]={});for(const o of i)Number.isFinite(o.ts)&&Number.isFinite(
o.rate)&&(n[String(o.ts)]=o.rate);const r=Object.keys(n).map(Number).sort((o,u)=>o-u);for(const o of r.slice(0,Math.max(0,r.length-100)))delete n[String(o)]}fundingRateFor(t,i){
var r,l,o;const e=(l=(r=this.state.settledRates)==null?void 0:r[t])==null?void 0:l[String(i)];if(e!==void 0)return e;const n=((o=this.state.rateSeen)==null?void 0:
o[t])??[];for(let u=n.length-1;u>=0;u--)if(n[u][0]<i)return n[u][1]}accrueFunding(t,i,e=Date.now(),n=0){var l,o;const r=[];if(!(i>0))return r;for(const u of this.
state.positions){if(u.symbol!==t)continue;const h=u.lastFundingTs??u.openedAt;let f=Math.floor(h/q)*q+q,s=0,a=0;for(;f<=e&&!(((o=(l=this.state.settledRates)==null?
void 0:l[t])==null?void 0:o[String(f)])===void 0&&e-f<n);){const c=this.fundingRateFor(t,f);if(c===void 0)break;const g=A(u.side)*u.qty*i*c;this.state.wallet-=g,
u.realizedNet-=g,u.fundingAcc=(u.fundingAcc??0)+g,u.lastFundingTs=f,s+=g,a=c,f+=q}s!==0&&r.push({kind:"funding",positionId:u.id,message:`\uD380\uB529\uBE44 ${s>
0?"\uC9C0\uBD88":"\uC218\uB839"} ${Math.abs(s).toFixed(4)} USDT (${(a*100).toFixed(4)}%)`})}return r.length&&this.snapEquity({[t]:i},e),r}replayBars(t,i){const e=[];
for(const n of[...i].sort((r,l)=>r.ts-l.ts)){const r=n.ts+59999;e.push(...this.accrueFunding(t,n.open,n.ts));const l=()=>this.state.positions.filter(u=>u.symbol===
t&&u.openedAt<=n.ts);for(const u of l()){const h=u.side==="long",f=h?n.low<=u.sl:n.high>=u.sl,s=u.targets.some(a=>!a.done&&(h?n.high>=a.price:n.low<=a.price));f&&
s&&e.push(...this.onPrice(t,h?Math.min(n.open,u.sl):Math.max(n.open,u.sl),r,void 0,n.ts))}const o=n.close>=n.open?[n.open,n.low,n.high,n.close]:[n.open,n.high,n.
low,n.close];e.push(...this.onPrice(t,o[0],r,void 0,n.ts));for(let u=1;u<o.length;u++){const h=o[u-1],f=o[u],s=l().flatMap(a=>[a.sl,a.liqPrice,...a.targets.filter(
C=>!C.done).map(C=>C.price)]).filter(a=>a>0&&(a-h)*(a-f)<0).sort((a,C)=>f>h?a-C:C-a);for(const a of[...s,f])e.push(...this.onPrice(t,a,r,void 0,n.ts))}for(const u of this.
state.positions.filter(h=>h.symbol===t&&h.openedAt===r))(u.side==="long"?n.low<=u.sl:n.high>=u.sl)&&e.push(...this.onPrice(t,u.sl,r))}return e}onPrice(t,i,e=Date.
now(),n,r=1/0){var h,f;const l=n&&n>0?n:i,o=[],u=(h=this.state).lastTickTs??(h.lastTickTs={});u[t]=Math.max(u[t]??0,e);for(const s of[...this.state.pending]){if(s.
symbol!==t||s.createdAt>r||!(s.side==="long"?i<=s.price:i>=s.price))continue;this.state.pending=this.state.pending.filter(c=>c.id!==s.id);const C=this.open({...s,
liquidity:"maker"},e);C.ok?o.push({kind:"limit_fill",positionId:(f=C.position)==null?void 0:f.id,message:`\uC9C0\uC815\uAC00 \uCCB4\uACB0 ${s.side==="long"?"\uB871":
"\uC20F"} @ ${this.px(s.symbol,s.price)}`}):o.push({kind:"close",message:`\uC9C0\uC815\uAC00 \uCCB4\uACB0 \uC2E4\uD328: ${C.error}`})}for(const s of[...this.state.
positions]){if(s.symbol!==t||s.openedAt>r)continue;const a=s.side==="long";if(s.liqPrice>0&&(a?l<=s.liqPrice:l>=s.liqPrice)){const C=a?s.entry*(1-1/s.leverage):
s.entry*(1+1/s.leverage);this.close(s.id,s.qty,C,"\uAC15\uC81C\uCCAD\uC0B0",e,0),o.push({kind:"liq",positionId:s.id,message:`\uAC15\uC81C\uCCAD\uC0B0 @ ${this.px(
s.symbol,s.liqPrice)} (\uC99D\uAC70\uAE08 \uC804\uC561 \uC190\uC2E4)`});continue}if(a?i<=s.sl:i>=s.sl){const C=s.beMoved?"\uBCF8\uC808 SL":"\uC190\uC808 SL",c=(a?
Math.min(s.sl,i):Math.max(s.sl,i))*(1-A(s.side)*this.slip),g=this.close(s.id,s.qty,c,C,e);o.push({kind:"sl",positionId:s.id,message:`${C} \uCCB4\uACB0 @ ${this.
px(s.symbol,c)} (\uC21C\uC190\uC775 ${g?(g.netPnl>=0?"+":"")+g.netPnl.toFixed(2):"-"} USDT)`});continue}for(let C=0;C<s.targets.length;C++){const c=s.targets[C];
if(c.done)continue;if(!(a?i>=c.price:i<=c.price))break;c.done=!0;const m=s.targets.slice(C+1).every(S=>S.done)?s.qty:this.partialQty(s,Math.min(s.qty,s.origQty*
c.fraction),c.price),y=this.close(s.id,m,c.price,c.label,e);o.push({kind:"tp",positionId:s.id,message:`${c.label} \uCCB4\uACB0 @ ${this.px(s.symbol,c.price)} (\uC21C\
\uC190\uC775 ${y?(y.netPnl>=0?"+":"")+y.netPnl.toFixed(2):"-"} USDT)`});const p=this.state.positions.find(S=>S.id===s.id);if(!p)break;C===0&&this.moveSlToBe&&!p.
beMoved&&(p.sl=U(p,this.precision(p.symbol).dp,D+this.slip),p.beMoved=!0,o.push({kind:"be",positionId:s.id,message:`TP1 \uD6C4 SL \u2192 \uBCF8\uC808 ${this.px(
p.symbol,p.sl)} (\uC218\uC218\uB8CC \uD3EC\uD568)`}))}}return o}snapEquity(t,i=Date.now()){const e=this.equity(t),n=this.state.equityCurve;n.push({t:i,equity:e}),
n.length>2e3&&n.splice(0,n.length-2e3)}}function K(d,t){const i=d.side==="long",e=t.slip??k,n=t.suggestedSl!==void 0&&Number.isFinite(t.suggestedSl)?i?Math.max(
d.sl,t.suggestedSl):Math.min(d.sl,t.suggestedSl):d.sl,r=t.last*(1+A(d.side)*e),l=Math.max(0,Math.round(-Math.log10(t.step))),o=f=>Number((Math.floor(f/t.step+1e-9)*
t.step).toFixed(l)),u=f=>w(d,f,r,n,e);let h=o(t.wantQty);for(let f=0;h>0&&f<1e5&&!(u(h)<=t.budget+1e-9);f++)h=o(h-t.step);return{qty:Math.max(0,h),newSl:n,lossAtSl:u(
Math.max(0,h))}}function _(d){return JSON.parse(JSON.stringify(d))}function G(d,t=[]){const i=new Set(t),e=new Map;let n=0,r=0,l=0;for(const c of d){if(n+=c.fees,
l+=c.funding??0,i.has(c.positionId)){r+=c.netPnl;continue}const g=e.get(c.positionId)??{net:0,r:0,hasR:!0};g.net+=c.netPnl,c.r===void 0?g.hasR=!1:g.r+=c.r,e.set(
c.positionId,g)}const o=[...e.values()],u=o.filter(c=>c.net>0).length,h=o.filter(c=>c.hasR).map(c=>c.r),f=h.filter(c=>c>0),s=h.filter(c=>c<=0),a=c=>c.length?c.reduce(
(g,m)=>g+m,0)/c.length:0,C=h.length?f.length/h.length:0;return{trades:o.length,wins:u,winRate:o.length?u/o.length:0,net:o.reduce((c,g)=>c+g.net,0)+r,fees:n,partialNet:r,
funding:l,rTrades:h.length,avgR:a(h),avgWinR:a(f),avgLossR:a(s),expectancyR:C*a(f)+(1-C)*a(s)}}function H(d,t){const i=new Set(d.filter(e=>e.final&&e.closedAt>=
t).map(e=>e.positionId));return d.filter(e=>i.has(e.positionId)).reduce((e,n)=>e+(n.r??0),0)}function J(d){const t=["closedAt","symbol","side","setup","qty","en\
try","exit","grossPnl","fees","funding","netPnl","r","reason","positionId"],i=d.map(e=>[new Date(e.closedAt).toISOString(),e.symbol,e.side,e.setup,e.qty,e.entry,
e.exit,e.grossPnl.toFixed(4),e.fees.toFixed(4),(e.funding??0).toFixed(4),e.netPnl.toFixed(4),e.r===void 0?"":e.r.toFixed(3),`"${e.reason.replace(/"/g,'""')}"`,e.
positionId].join(","));return[t.join(","),...i].join(`
`)}const O={TP1:"TP1 \uC911\uC559\uC120",TP2:"TP2 \uBC18\uB300\uD3B8",TP:"TP 1:3"};function W(d){return d.map(t=>({price:Number(t.price),fraction:t.sizePct/100,
label:O[t.label]??t.label}))}function V(d,t,i,e){const n=d==="long"?t*.995:t*1.005,r=String(t),l=R({side:d,kind:"breakout",entry:r,extremeWick:String(n),box:{top:r,
bottom:r,mid:r},slBufferPct:0,tickSize:i,feeRate:D,slippageBps:M});return{sl:Number(l.sl).toFixed(e),tp1:Number(l.targets[0].price).toFixed(e)}}export{P as D,L as M,j as P,M as S,D as T,G as a,k as b,J as f,V as n,H as r,K as s,W as t,N as u};
