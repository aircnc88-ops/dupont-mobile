var T=Object.defineProperty;var E=(c,t,i)=>t in c?T(c,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):c[t]=i;var D=(c,t,i)=>E(c,typeof t!="symbol"?t+"":t,i);import{b as F,c as I}from"./strategy-Cu9CvPGE.js";function R(c,t,i){return c*t/(i>0?i:1)}const P=200,k=Number(F("bitget_default","swap","taker")),L=Number(F("bitget_default","swap","maker")),M=2,B=M/1e4,$=5,q=8*
36e5;function b(c=P,t=Date.now()){return{wallet:c,bankroll:c,positions:[],fills:[],pending:[],equityCurve:[{t,equity:c}],seq:0}}const A=c=>c==="long"?1:-1;function U(c,t){
return A(c.side)*(t-c.entry)*c.qty}function x(c,t,i,e){const o=1/(i||1);return c==="long"?t*(1-o+e):t*(1+o-e)}function w(c,t,i,e,o=B,s=k){const u=c.qty+t,r=(c.entry*
c.qty+i*t)/u;return A(c.side)*(r-e)*u+c.entryFeeLeft+t*i*s+u*e*(k+o)}function v(c,t,i,e,o){return Math.max(0,A(c)*(t-i))*e+o+e*i*(k+B)}function N(c,t,i=k+B){const e=c.
qty,o=c.side==="long"?(c.entry*e+c.entryFeeLeft)/(e*(1-i)):(c.entry*e-c.entryFeeLeft)/(e*(1+i)),s=10**t;return c.side==="long"?Math.ceil(o*s-1e-9)/s:Math.floor(
o*s+1e-9)/s}class j{constructor(t){D(this,"state");D(this,"moveSlToBe",!0);D(this,"precision",()=>({dp:2,qdp:4}));D(this,"slip",B);D(this,"minOrderUsdt",$);var i,
e,o;this.state=t?O(t):b();for(const s of this.state.positions)s.initialEntry??(s.initialEntry=s.entry),s.fundingAcc??(s.fundingAcc=0),s.riskUsd??(s.riskUsd=v(s.
side,s.entry,s.initialSl,s.origQty,s.origQty*s.entry*k));(i=this.state).lastTickTs??(i.lastTickTs={}),(e=this.state).rateSeen??(e.rateSeen={}),(o=this.state).settledRates??
(o.settledRates={})}px(t,i){return i.toLocaleString("en-US",{minimumFractionDigits:this.precision(t).dp,maximumFractionDigits:this.precision(t).dp})}qx(t,i){return i.
toFixed(this.precision(t).qdp)}step(t){return 10**-this.precision(t).qdp}floorStep(t,i){const e=this.precision(t).qdp,o=this.step(t);return Number((Math.floor(i/
o+1e-9)*o).toFixed(e))}nextId(t){return this.state.seq+=1,`${t}${Date.now().toString(36)}${this.state.seq}`}reset(t=P,i=Date.now()){this.state=b(t,i)}usedMargin(){
return this.state.positions.reduce((t,i)=>t+i.margin,0)+this.state.pending.reduce((t,i)=>t+i.qty*i.price/i.leverage,0)}available(){return this.state.wallet-this.
usedMargin()}equity(t){return this.state.wallet+this.state.positions.reduce((i,e)=>i+U(e,t[e.symbol]??e.entry),0)}open(t,i=Date.now()){const e=[];if(!(t.qty>0)||
!(t.price>0))return{ok:!1,error:"\uC218\uB7C9/\uAC00\uACA9 \uC624\uB958",events:e};const o=t.liquidity==="maker",s=o?L:k,u=o?t.price:(t.refPx&&t.refPx>0?t.refPx:
t.price)*(1+A(t.side)*this.slip),a=t.qty*u*s,l=R(t.qty,u,t.leverage);if(l+a>this.available()+1e-9)return{ok:!1,error:`\uC99D\uAC70\uAE08 \uBD80\uC871 (\uD544\uC694 ${(l+
a).toFixed(2)} USDT)`,events:e};const f=t.mmr??.005,n=this.state.positions.find(C=>C.symbol===t.symbol&&C.side===t.side);if(n&&!t.isAdd)return{ok:!1,error:"\uAC19\uC740 \uBC29\
\uD5A5 \uD3EC\uC9C0\uC158 \uBCF4\uC720 \uC911 (\uBD88\uD0C0\uAE30\uB294 \uBD88\uD0C0\uAE30 \uBC84\uD2BC \uC0AC\uC6A9)",events:e};if(!n&&t.isAdd)return{ok:!1,error:"\
\uCD94\uAC00\uD560 \uD3EC\uC9C0\uC158 \uC5C6\uC74C",events:e};const g=t.side==="long";if(n){const C=n.qty+t.qty,y=(n.entry*n.qty+u*t.qty)/C,m=g?Math.max(n.sl,t.
sl):Math.min(n.sl,t.sl),p=x(n.side,y,n.leverage,n.mmr);return(g?m<=p:m>=p)?{ok:!1,error:"SL\uC774 \uCCAD\uC0B0\uAC00 \uBC16 (\uCD94\uAC00 \uD6C4 \uCCAD\uC0B0\uAC00 \uAE30\uC900)",
events:e}:n.riskBudget!==void 0&&w(n,t.qty,u,m,this.slip,s)>n.riskBudget+1e-9?{ok:!1,error:`\uCD94\uAC00 \uC2DC \uCD1D \uB9AC\uC2A4\uD06C\uAC00 \uC9C4\uC785 \uC2DC \uC608\uC0B0(${n.
riskBudget.toFixed(2)} USDT) \uCD08\uACFC`,events:e}:(this.state.wallet-=a,n.entry=y,n.qty=C,n.origQty+=t.qty,n.margin+=l,n.entryFeeLeft+=a,n.adds+=1,n.sl=m,n.liqPrice=
p,n.riskUsd=(n.riskUsd??0)+v(t.side,u,m,t.qty,a),t.candleTs!==void 0&&(n.lastAddTs=t.candleTs),e.push({kind:"add",positionId:n.id,message:`\uBD88\uD0C0\uAE30 \uCD94\uAC00 ${this.
qx(t.symbol,t.qty)} @ ${this.px(t.symbol,u)}`}),this.snapEquity({[t.symbol]:u},i),{ok:!0,position:n,fillPx:u,events:e})}const h=x(t.side,u,t.leverage,f);if(g?t.
sl<=h:t.sl>=h)return{ok:!1,error:`SL\uC774 \uCCAD\uC0B0\uAC00(${this.px(t.symbol,h)}) \uBC16 \u2013 \uB808\uBC84\uB9AC\uC9C0\uB97C \uB0AE\uCD94\uC138\uC694`,events:e};
this.state.wallet-=a;const d={id:this.nextId("p"),symbol:t.symbol,side:t.side,qty:t.qty,origQty:t.qty,entry:u,leverage:t.leverage,margin:l,sl:t.sl,initialSl:t.sl,
targets:t.targets.map(C=>({...C,done:!1})),setup:t.setup,signalId:t.signalId,breakoutLevel:t.breakoutLevel,adds:0,entryFeeLeft:a,realizedNet:0,beMoved:!1,liqPrice:h,
mmr:f,openedAt:i,initialEntry:u,riskUsd:v(t.side,u,t.sl,t.qty,a),fundingAcc:0,initialQty:t.qty,riskBudget:t.riskBudget};return this.state.positions.push(d),e.push(
{kind:"open",positionId:d.id,message:`${t.side==="long"?"\uB871":"\uC20F"} \uC9C4\uC785 ${this.qx(t.symbol,t.qty)} ${t.symbol} @ ${this.px(t.symbol,u)}`}),this.
snapEquity({[t.symbol]:u},i),{ok:!0,position:d,fillPx:u,events:e}}placeLimit(t,i=Date.now()){return t.qty*t.price/t.leverage>this.available()?{ok:!1,error:"\uC99D\uAC70\uAE08 \
\uBD80\uC871"}:(this.state.pending.push({...t,id:this.nextId("o"),createdAt:i}),{ok:!0})}cancelLimit(t){this.state.pending=this.state.pending.filter(i=>i.id!==t)}close(t,i,e,o,s=Date.
now(),u=k){const r=this.state.positions.find(p=>p.id===t);if(!r)return null;const a=Math.min(i,r.qty);if(!(a>0))return null;this.accrueFunding(r.symbol,e,s,0,r.
id);const l=a/r.qty,f=A(r.side)*(e-r.entry)*a,n=a*e*u,g=r.entryFeeLeft*l,h=r.margin*l,d=(r.fundingAcc??0)*l;r.entryFeeLeft-=g,r.margin-=h,r.fundingAcc=(r.fundingAcc??
0)-d,r.qty=a>=r.qty-1e-12?0:r.qty-a,this.state.wallet+=f-n;const C=f-n-g-d;r.realizedNet+=C+d;const y=r.qty<=1e-12,m={id:this.nextId("f"),positionId:r.id,symbol:r.
symbol,side:r.side,setup:r.setup,qty:a,entry:r.entry,exit:e,grossPnl:f,fees:n+g,netPnl:C,reason:o,openedAt:r.openedAt,closedAt:s,final:y,funding:d,r:r.riskUsd&&
r.riskUsd>0?C/r.riskUsd:void 0,riskUsd:r.riskUsd};return this.state.fills.push(m),y&&(this.state.positions=this.state.positions.filter(p=>p.id!==r.id)),this.snapEquity(
{[r.symbol]:e},s),m}partialQty(t,i,e){if(i>=t.qty-1e-12)return t.qty;const o=this.floorStep(t.symbol,i);return!(o>0)||(t.qty-o)*e<this.minOrderUsdt?t.qty:o}closeFraction(t,i,e,o,s=Date.
now()){const u=this.state.positions.find(a=>a.id===t);if(!u)return null;const r=e*(1-A(u.side)*this.slip);return this.close(t,this.partialQty(u,u.qty*Math.min(1,
i),r),r,o,s)}needsSettledRate(t,i=Date.now()){return this.state.positions.some(e=>{var s,u;if(e.symbol!==t)return!1;const o=Math.floor((e.lastFundingTs??e.openedAt)/
q)*q+q;return o<=i&&((u=(s=this.state.settledRates)==null?void 0:s[t])==null?void 0:u[String(o)])===void 0})}noteTickerRate(t,i,e=Date.now()){var r;if(!Number.isFinite(
i))return;const o=(r=this.state).rateSeen??(r.rateSeen={}),s=o[t]??(o[t]=[]),u=s[s.length-1];u&&u[1]===i&&Math.floor(u[0]/q)===Math.floor(e/q)||(s.push([e,i]),s.
length>100&&s.splice(0,s.length-100))}setSettledRates(t,i){var u;const e=(u=this.state).settledRates??(u.settledRates={}),o=e[t]??(e[t]={});for(const r of i)Number.
isFinite(r.ts)&&Number.isFinite(r.rate)&&(o[String(r.ts)]=r.rate);const s=Object.keys(o).map(Number).sort((r,a)=>r-a);for(const r of s.slice(0,Math.max(0,s.length-
100)))delete o[String(r)]}fundingRateFor(t,i){var s,u,r;const e=(u=(s=this.state.settledRates)==null?void 0:s[t])==null?void 0:u[String(i)];if(e!==void 0)return e;
const o=((r=this.state.rateSeen)==null?void 0:r[t])??[];for(let a=o.length-1;a>=0;a--)if(o[a][0]<i)return o[a][1]}accrueFunding(t,i,e=Date.now(),o=0,s){var r,a;
const u=[];if(!(i>0))return u;for(const l of this.state.positions){if(l.symbol!==t||s!==void 0&&l.id!==s)continue;const f=l.lastFundingTs??l.openedAt;let n=Math.
floor(f/q)*q+q,g=0,h=0;for(;n<=e&&!(((a=(r=this.state.settledRates)==null?void 0:r[t])==null?void 0:a[String(n)])===void 0&&e-n<o);){const C=this.fundingRateFor(
t,n);if(C===void 0)break;const y=A(l.side)*l.qty*i*C;this.state.wallet-=y,l.realizedNet-=y,l.fundingAcc=(l.fundingAcc??0)+y,l.lastFundingTs=n,g+=y,h=C,n+=q}g!==
0&&u.push({kind:"funding",positionId:l.id,message:`\uD380\uB529\uBE44 ${g>0?"\uC9C0\uBD88":"\uC218\uB839"} ${Math.abs(g).toFixed(4)} USDT (${(h*100).toFixed(4)}\
%)`})}return u.length&&this.snapEquity({[t]:i},e),u}replayBars(t,i,e=1/0){const o=[];for(const s of[...i].sort((u,r)=>u.ts-r.ts)){const u=Math.min(s.ts+59999,e);
o.push(...this.accrueFunding(t,s.open,s.ts));const r=()=>this.state.positions.filter(l=>l.symbol===t&&l.openedAt<=s.ts);for(const l of r()){const f=l.side==="lo\
ng",n=f?s.low<=l.sl:s.high>=l.sl,g=l.targets.some(h=>!h.done&&(f?s.high>=h.price:s.low<=h.price));n&&g&&o.push(...this.onPrice(t,f?Math.min(s.open,l.sl):Math.max(
s.open,l.sl),u,void 0,s.ts))}const a=s.close>=s.open?[s.open,s.low,s.high,s.close]:[s.open,s.high,s.low,s.close];o.push(...this.onPrice(t,a[0],u,void 0,s.ts));for(let l=1;l<
a.length;l++){const f=a[l-1],n=a[l],g=r().flatMap(h=>[h.sl,h.liqPrice,...h.targets.filter(d=>!d.done).map(d=>d.price)]).filter(h=>h>0&&(h-f)*(h-n)<0).sort((h,d)=>n>
f?h-d:d-h);for(const h of[...g,n])o.push(...this.onPrice(t,h,u,void 0,s.ts))}for(const l of this.state.positions.filter(f=>f.symbol===t&&f.openedAt===u))(l.side===
"long"?s.low<=l.sl:s.high>=l.sl)&&this.stopOut(l,l.sl,u,o)}return o}onPrice(t,i,e=Date.now(),o,s=1/0){var l,f;const u=o&&o>0?o:i,r=[],a=(l=this.state).lastTickTs??
(l.lastTickTs={});a[t]=Math.max(a[t]??0,e);for(const n of[...this.state.pending]){if(n.symbol!==t||n.createdAt>s||!(n.side==="long"?i<=n.price:i>=n.price))continue;
this.state.pending=this.state.pending.filter(d=>d.id!==n.id);const h=this.open({...n,liquidity:"maker"},e);h.ok?r.push({kind:"limit_fill",positionId:(f=h.position)==
null?void 0:f.id,message:`\uC9C0\uC815\uAC00 \uCCB4\uACB0 ${n.side==="long"?"\uB871":"\uC20F"} @ ${this.px(n.symbol,n.price)}`}):r.push({kind:"close",message:`\uC9C0\
\uC815\uAC00 \uCCB4\uACB0 \uC2E4\uD328: ${h.error}`})}for(const n of[...this.state.positions]){if(n.symbol!==t||n.openedAt>s)continue;const g=n.side==="long";if(n.
liqPrice>0&&(g?u<=n.liqPrice:u>=n.liqPrice)){const h=g?n.entry*(1-1/n.leverage):n.entry*(1+1/n.leverage);this.close(n.id,n.qty,h,"\uAC15\uC81C\uCCAD\uC0B0",e,0),
r.push({kind:"liq",positionId:n.id,message:`\uAC15\uC81C\uCCAD\uC0B0 @ ${this.px(n.symbol,n.liqPrice)} (\uC99D\uAC70\uAE08 \uC804\uC561 \uC190\uC2E4)`});continue}
if(g?i<=n.sl:i>=n.sl){this.stopOut(n,i,e,r);continue}for(let h=0;h<n.targets.length;h++){const d=n.targets[h];if(d.done)continue;if(!(g?i>=d.price:i<=d.price))break;
d.done=!0;const y=n.targets.slice(h+1).every(S=>S.done)?n.qty:this.partialQty(n,Math.min(n.qty,n.origQty*d.fraction),d.price),m=this.close(n.id,y,d.price,d.label,
e);r.push({kind:"tp",positionId:n.id,message:`${d.label} \uCCB4\uACB0 @ ${this.px(n.symbol,d.price)} (\uC21C\uC190\uC775 ${m?(m.netPnl>=0?"+":"")+m.netPnl.toFixed(
2):"-"} USDT)`});const p=this.state.positions.find(S=>S.id===n.id);if(!p)break;h===0&&this.moveSlToBe&&!p.beMoved&&(p.sl=N(p,this.precision(p.symbol).dp,k+this.
slip),p.beMoved=!0,r.push({kind:"be",positionId:n.id,message:`TP1 \uD6C4 SL \u2192 \uBCF8\uC808 ${this.px(p.symbol,p.sl)} (\uC218\uC218\uB8CC \uD3EC\uD568)`}))}}
return r}stopOut(t,i,e,o){const s=t.side==="long",u=t.beMoved?"\uBCF8\uC808 SL":"\uC190\uC808 SL",r=(s?Math.min(t.sl,i):Math.max(t.sl,i))*(1-A(t.side)*this.slip),
a=this.close(t.id,t.qty,r,u,e);o.push({kind:"sl",positionId:t.id,message:`${u} \uCCB4\uACB0 @ ${this.px(t.symbol,r)} (\uC21C\uC190\uC775 ${a?(a.netPnl>=0?"+":"")+
a.netPnl.toFixed(2):"-"} USDT)`})}snapEquity(t,i=Date.now()){const e=this.equity(t),o=this.state.equityCurve;o.push({t:i,equity:e}),o.length>2e3&&o.splice(0,o.length-
2e3)}}function K(c,t){const i=c.side==="long",e=t.slip??B,o=t.suggestedSl!==void 0&&Number.isFinite(t.suggestedSl)?i?Math.max(c.sl,t.suggestedSl):Math.min(c.sl,
t.suggestedSl):c.sl,s=t.last*(1+A(c.side)*e),u=Math.max(0,Math.round(-Math.log10(t.step))),r=f=>Number((Math.floor(f/t.step+1e-9)*t.step).toFixed(u)),a=f=>w(c,f,
s,o,e);let l=r(t.wantQty);for(let f=0;l>0&&f<1e5&&!(a(l)<=t.budget+1e-9);f++)l=r(l-t.step);return{qty:Math.max(0,l),newSl:o,lossAtSl:a(Math.max(0,l))}}function O(c){
return JSON.parse(JSON.stringify(c))}function G(c,t=[]){const i=new Set(t),e=new Map;let o=0,s=0,u=0;for(const d of c){if(o+=d.fees,u+=d.funding??0,i.has(d.positionId)){
s+=d.netPnl;continue}const C=e.get(d.positionId)??{net:0,r:0,hasR:!1,risk:0};C.net+=d.netPnl,(d.r!==void 0||d.riskUsd)&&(C.hasR=!0),d.riskUsd&&(C.risk=d.riskUsd),
C.r=C.risk>0?C.net/C.risk:C.r+(d.r??0),e.set(d.positionId,C)}const r=[...e.values()],a=r.filter(d=>d.net>0).length,l=r.filter(d=>d.hasR).map(d=>d.r),f=l.filter(
d=>d>0),n=l.filter(d=>d<=0),g=d=>d.length?d.reduce((C,y)=>C+y,0)/d.length:0,h=l.length?f.length/l.length:0;return{trades:r.length,wins:a,winRate:r.length?a/r.length:
0,net:r.reduce((d,C)=>d+C.net,0)+s,fees:o,partialNet:s,funding:u,rTrades:l.length,avgR:g(l),avgWinR:g(f),avgLossR:g(n),expectancyR:h*g(f)+(1-h)*g(n)}}function H(c,t){
const i=new Set(c.filter(o=>o.final&&o.closedAt>=t).map(o=>o.positionId)),e=new Map;for(const o of c){if(!i.has(o.positionId))continue;const s=e.get(o.positionId)??
{net:0,r:0,risk:0};s.net+=o.netPnl,o.riskUsd&&(s.risk=o.riskUsd),s.r=s.risk>0?s.net/s.risk:s.r+(o.r??0),e.set(o.positionId,s)}return[...e.values()].reduce((o,s)=>o+
s.r,0)}function J(c){const t=["closedAt","symbol","side","setup","qty","entry","exit","grossPnl","fees","funding","netPnl","r","reason","positionId"],i=c.map(e=>[
new Date(e.closedAt).toISOString(),e.symbol,e.side,e.setup,e.qty,e.entry,e.exit,e.grossPnl.toFixed(4),e.fees.toFixed(4),(e.funding??0).toFixed(4),e.netPnl.toFixed(
4),e.r===void 0?"":e.r.toFixed(3),`"${e.reason.replace(/"/g,'""')}"`,e.positionId].join(","));return[t.join(","),...i].join(`
`)}const _={TP1:"TP1 \uC911\uC559\uC120",TP2:"TP2 \uBC18\uB300\uD3B8",TP:"TP 1:3"};function W(c){return c.map(t=>({price:Number(t.price),fraction:t.sizePct/100,
label:_[t.label]??t.label}))}function V(c,t,i,e){const o=c==="long"?t*.995:t*1.005,s=String(t),u=I({side:c,kind:"breakout",entry:s,extremeWick:String(o),box:{top:s,
bottom:s,mid:s},slBufferPct:0,tickSize:i,feeRate:k,slippageBps:M});return{sl:Number(u.sl).toFixed(e),tp1:Number(u.targets[0].price).toFixed(e)}}export{P as D,L as M,j as P,M as S,k as T,G as a,B as b,J as f,V as n,H as r,K as s,W as t,U as u};
