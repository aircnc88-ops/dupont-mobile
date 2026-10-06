import K from"decimal.js";const L=K.clone({precision:40,rounding:K.ROUND_HALF_UP});function y(t){return typeof t=="number"?t:Number(t)}function d(t){return new L(
t)}function B(t){return{ts:t.ts,open:y(t.open),high:y(t.high),low:y(t.low),close:y(t.close),volume:y(t.volume)}}function H(t,e,s){if(e===void 0)return t;const o=d(
e);if(o.lte(0))return t;const n=t.div(o);return(s==="down"?n.floor():s==="up"?n.ceil():n.toDecimalPlaces(0,L.ROUND_HALF_UP)).times(o)}function C(t,e=3,s=3){const o=t.
map(B),n=[],l=[];for(let c=e;c<o.length-s;c++){const r=o[c];let a=!0,f=!0;for(let i=c-e;i<c;i++)r.high>o[i].high||(a=!1),r.low<o[i].low||(f=!1);for(let i=c+1;i<=
c+s;i++)r.high>=o[i].high||(a=!1),r.low<=o[i].low||(f=!1);a&&n.push({index:c,ts:r.ts,price:String(t[c].high),kind:"high"}),f&&l.push({index:c,ts:r.ts,price:String(
t[c].low),kind:"low"})}return{highs:n,lows:l}}function J(t){const e=t.map(B);return e.map((s,o)=>{if(o===0)return s.high-s.low;const n=e[o-1].close;return Math.
max(s.high-s.low,Math.abs(s.high-n),Math.abs(s.low-n))})}function Z(t,e=14){const s=J(t),o=new Array(s.length).fill(NaN);if(s.length<e||e<=0)return o;let n=0;for(let c=0;c<
e;c++)n+=s[c];let l=n/e;o[e-1]=l;for(let c=e;c<s.length;c++)l=(l*(e-1)+s[c])/e,o[c]=l;return o}function X(t,e=14){const s=Z(t,e);return s.length?s[s.length-1]:NaN}
function G(t,e,s,o){const n=[...t].sort((r,a)=>o==="top"?y(a.price)-y(r.price):y(r.price)-y(a.price));let l=null;for(const r of n){const a=y(r.price),f=a*e/100,
i=n.filter(p=>Math.abs(y(p.price)-a)<=f);if(i.length>=s){l=i;break}(!l||i.length>l.length)&&(l=i)}return!l||l.length===0?null:{level:l.reduce((r,a)=>r.plus(d(a.
price)),d(0)).div(l.length),members:l.sort((r,a)=>r.index-a.index)}}function it(t,e={}){const s=e.lookback??80,o=e.tolerancePct??.25,n=e.minTouches??2,l=e.pivotLeft??
3,c=e.pivotRight??3,r=e.atrPeriod??14,a=e.minHeightAtr??1.5,f=e.maxHeightAtr??15,i=e.minInsideShare??.7,p=e.minHeightPct??.6,m=Math.max(0,t.length-s),h=t.slice(
m);if(h.length<Math.max(l+c+1,r))return null;const b=C(h,l,c);if(!b.highs.length||!b.lows.length)return null;const k=G(b.highs,o,n,"top"),u=G(b.lows,o,n,"bottom");
if(!k||!u)return null;const g=k.level,v=u.level;if(g.lte(v))return null;const P=z=>({...z,index:z.index+m}),S=k.members.map(P),R=u.members.map(P),F=g.minus(v),T=X(
h,r),A=T>0?F.toNumber()/T:1/0,N=g.toNumber(),M=v.toNumber(),E=N*o/100,$=M*o/100,x=h.map(B),U=x.filter(z=>z.close<=N+E&&z.close>=M-$).length/x.length,w=S.length>=
n&&R.length>=n&&A>=a&&A<=f&&U>=i&&F.div(g.plus(v).div(2)).times(100).gte(p),_=Math.min(S[0].index,R[0].index);return{top:g.toFixed(),bottom:v.toFixed(),mid:g.plus(
v).div(2).toFixed(),height:F.toFixed(),startTime:t[_].ts,endTime:t[t.length-1].ts,startIndex:_,endIndex:t.length-1,touchesTop:S.length,touchesBottom:R.length,topPivots:S,
bottomPivots:R,atr:T,heightAtr:A,insideShare:U,tolerancePct:o,isRange:w}}function Y(t,e,s){const o=t+e;return{buy:t,sell:e,net:t-e,ratio:o>0?t/o:.5,source:s}}function I(t){
const e=B(t),s=e.high-e.low,o=s>0?e.volume*(e.close-e.low)/s:e.volume/2;return Y(o,e.volume-o,"ohlcv")}function Q(t,e){const s=B(t),o=B(e);return!(s.close<s.open)||
!(o.close>o.open)?!1:o.open<=s.close&&o.close>=s.open&&o.close-o.open>s.open-s.close}function j(t,e){const s=B(t),o=B(e);return!(s.close>s.open)||!(o.close<o.open)?
!1:o.open>=s.close&&o.close<=s.open&&o.open-o.close>s.close-s.open}const tt=new L(2);function ct(t,e,s,o={}){if(!s||t.length<2)return[];if((o.requireRange??!0)&&
!s.isRange)return[];const n=Math.max(1,o.fromIndex??t.length-1),l=[];let c=new Set;for(let r=n;r<t.length;r++){const a=et(t,e,s,o,r),f=a.filter(i=>!c.has(i.type));
l.push(...f),c=new Set(a.map(i=>i.type))}return l}function et(t,e,s,o,n){const l=o.nearPct??.2,c=o.dominance??.55,r=o.strongDominance??.6,a=Math.max(1,o.setupCandles??
2),f=o.breakTolPct??s.tolerancePct,i=B(t[n]),p=B(t[n-1]),m=e[n]??I(t[n]),h=t.slice(Math.max(0,n-a+1),n+1).map(B),b=Math.min(...h.map(O=>O.low)),k=Math.max(...h.
map(O=>O.high)),u=Number(s.top),g=Number(s.bottom),v=Number(s.mid),P=(u-g)*l,S=Math.min(u*f/100,(u-g)*(o.breakTolBoxFrac??.1)),R=S,F=S,T=i.close>=g-F&&i.close<=
u+R,A=1-m.ratio,N=(i.high+i.low)/2,M=s.isRange,E=[],$={candles:t,box:s,opts:o,i:n,pr:m},x=O=>{O&&E.push(O)};return i.close>u+R?M&&p.close<=u+R&&i.close>i.open&&
m.ratio>=r&&x(q($,"BREAKOUT_LONG","long",V(t,n,o,"long"),`close ${i.close} broke above top ${s.top} with buy ratio ${m.ratio.toFixed(2)}`)):T&&b<g-F?m.ratio>=r&&
i.close>i.open&&i.close>=N&&(i.low<g-F||p.low<g-F)&&x(q($,"FAKE_BREAKOUT_LONG","long",b,`wick ${b} below bottom ${s.bottom}, bullish reversal back inside with b\
uy ratio ${m.ratio.toFixed(2)}`)):T&&i.low<=g+P&&i.close<v&&Q(t[n-1],t[n])&&m.ratio>=c&&x(q($,"RANGE_LONG","long",b,`bullish engulfing at support ${s.bottom}, b\
uy ratio ${m.ratio.toFixed(2)}`)),i.close<g-F?M&&p.close>=g-F&&i.close<i.open&&A>=r&&x(q($,"BREAKOUT_SHORT","short",V(t,n,o,"short"),`close ${i.close} broke bel\
ow bottom ${s.bottom} with sell ratio ${A.toFixed(2)}`)):T&&k>u+R?A>=r&&i.close<i.open&&i.close<=N&&(i.high>u+R||p.high>u+R)&&x(q($,"FAKE_BREAKOUT_SHORT","short",
k,`wick ${k} above top ${s.top}, bearish reversal back inside with sell ratio ${A.toFixed(2)}`)):T&&i.high>=u-P&&i.close>v&&j(t[n-1],t[n])&&A>=c&&x(q($,"RANGE_S\
HORT","short",k,`bearish engulfing at resistance ${s.top}, sell ratio ${A.toFixed(2)}`)),E}function V(t,e,s,o){const n=Math.max(1,s.breakoutSetupCandles??1),l=t.
slice(Math.max(0,e-n+1),e+1).map(B);return o==="long"?Math.min(...l.map(c=>c.low)):Math.max(...l.map(c=>c.high))}function q(t,e,s,o,n){const{candles:l,box:c,opts:r,
i:a,pr:f}=t,i=e.startsWith("BREAKOUT")?"breakout":"range",p=r.feeRate??D,m=r.slippageBps??0,h=st({side:s,kind:i,entry:l[a].close,extremeWick:String(o),box:c,slBufferPct:r.
slBufferPct,atr:c.atr,atrBufferFrac:r.atrBufferFrac,breakoutRR:r.breakoutRR,tickSize:r.tickSize,feeRate:p,slippageBps:m});return i==="range"&&ot({side:s,entry:h.
entry,sl:h.sl,tp:h.targets[0].price,feeRate:p,slippageBps:m})<(r.minNetR1??1)?null:{type:e,side:s,kind:i,index:a,ts:l[a].ts,...h,pressure:f,box:{top:c.top,bottom:c.
bottom,mid:c.mid},reason:n}}const D=6e-4;function ot(t){const e=Number(t.entry),s=Number(t.sl),o=Number(t.tp),n=t.feeRate??D,l=(t.slippageBps??0)/1e4,c=Math.abs(
e-s)+(n+l)*(e+s),r=(t.side==="long"?o-e:e-o)-(n+l)*e-n*o;return c>0?r/c:0}function st(t){const e=t.side==="long",s=t.slBufferPct??.03,o=t.breakoutRR??3,n=t.tickSize,
l=d(t.feeRate??D),c=d(t.slippageBps??0).div(1e4),r=H(d(t.entry),n,"nearest"),a=d(t.extremeWick),f=a.abs().times(s).div(100),i=d(t.atr&&Number.isFinite(t.atr)?t.
atr:0).times(t.atrBufferFrac??.1),p=L.max(f,i),m=H(e?a.minus(p):a.plus(p),n,e?"down":"up"),h=r.minus(m).abs(),b=u=>h.isZero()?0:u.minus(r).abs().div(h).toNumber(),
k=[];if(t.kind==="breakout"){const u=l.plus(c),g=h.plus(u.times(r.plus(m))),v=e?r.times(d(1).plus(u)).plus(g.times(o)).div(d(1).minus(l)):r.times(d(1).minus(u)).
minus(g.times(o)).div(d(1).plus(l)),P=H(v,n,e?"up":"down");k.push({label:"TP",price:P.toFixed(),sizePct:100,rr:b(P)})}else{const u=H(d(t.box.top).plus(d(t.box.bottom)).
div(tt),n,"nearest"),g=d(e?t.box.top:t.box.bottom);(e?u.gt(r):u.lt(r))?(k.push({label:"TP1",price:u.toFixed(),sizePct:50,rr:b(u)}),k.push({label:"TP2",price:g.toFixed(),
sizePct:50,rr:b(g)})):k.push({label:"TP2",price:g.toFixed(),sizePct:100,rr:b(g)})}return{entry:r.toFixed(),sl:m.toFixed(),risk:h.toFixed(),targets:k}}function nt(t){
var e;return t.kind?t.kind:(e=t.type)!=null&&e.startsWith("BREAKOUT")?"breakout":"range"}function lt(t,e,s,o={}){var U;const n=o.k??2,l=o.lookback??20,c=o.nearTargetPct??
.2,r={alert:!1,nearTarget:!1,target:null,progress:0,oppositeVolume:0,averageOpposite:0,multiple:0,priceFailed:!1,reason:"insufficient data"},a=e.length;if(a<2||
t.targets.length===0)return r;if((o.requireTape??!0)&&(((U=s[a-1])==null?void 0:U.source)??"ohlcv")!=="trades")return{...r,reason:"tape required"};const f=t.side===
"long",i=y(t.entry),p=B(e[a-1]),m=w=>s[w]??I(e[w]),h=w=>f?w.sell:w.buy,b=t.targets.map(w=>y(w.price)).sort((w,_)=>f?w-_:_-w),k=p.close,u=b.find(w=>f?w>k:w<k)??b[b.
length-1],g=f?p.high:p.low,v=u-i,P=v===0?1:(g-i)/v,S=P>=1-c,R=Math.max(0,a-1-l),F=[];for(let w=R;w<a-1;w++)F.push(h(m(w)));const T=F.length?F.reduce((w,_)=>w+_,
0)/F.length:0,A=h(m(a-1)),N=T>0?A/T:A>0?1/0:0,M=N>=n,E=B(e[a-2]).close,$=f?p.close<=p.open||p.close<=E:p.close>=p.open||p.close>=E,x=o.requirePriceFailure??!0,O=S&&
M&&(!x||$);return{alert:O,nearTarget:S,target:String(u),progress:P,oppositeVolume:A,averageOpposite:T,multiple:N,priceFailed:$,reason:O?`${f?"sell":"buy"} press\
ure ${N.toFixed(2)}x average near target ${u} and price failed to progress \u2014 absorption, consider closing`:S?M?"opposite spike but price still progressing \
(no failure)":`opposite pressure only ${N.toFixed(2)}x average (< ${n}x)`:`not near target (${(P*100).toFixed(0)}% of the way)`}}function at(t,e,s,o,n={}){const l=n.
maxAdds??2,c=t.adds??0;if(nt(t)!=="breakout")return{add:!1,reason:"pyramiding only applies to breakout positions"};if(c>=l)return{add:!1,reason:`max adds reache\
d (${c}/${l})`};if(e.length<2)return{add:!1,reason:"insufficient data"};const r=t.side==="long",a=t.brokenLevel??(o?r?o.top:o.bottom:void 0);if(a===void 0)return{
add:!1,reason:"no broken level"};const f=y(a),i=n.retestTolPct??(o==null?void 0:o.tolerancePct)??.25,p=f*i/100,m=n.strongDominance??.6,h=e.length,b=B(e[h-1]),k=s[h-
1]??I(e[h-1]),u=e[h-1].ts,g=Math.max(t.openedTs??-1/0,t.lastAddTs??-1/0);if(u<=g)return{add:!1,reason:"retest must be a later candle than entry/last add",level:String(
a)};const v=t.risk!==void 0?y(t.risk):Math.abs(y(t.entry)-y(t.sl??t.entry));if(!e.filter(x=>x.ts>g&&x.ts<u).map(B).some(x=>r?x.high>=f+.5*v:x.low<=f-.5*v))return{
add:!1,reason:"no move away from level yet",level:String(a)};if(!(r?b.low<=f+p&&b.close>f:b.high>=f-p&&b.close<f))return{add:!1,reason:`no retest of broken leve\
l ${a}`,level:String(a)};const F=r?Q(e[h-2],e[h-1]):j(e[h-2],e[h-1]),T=r?k.ratio:1-k.ratio;if(!F&&T<m)return{add:!1,reason:`retest without confirmation (ratio ${T.
toFixed(2)})`,level:String(a)};const A=n.slBufferPct??.03,N=d(r?b.low:b.high),M=d(n.atr&&Number.isFinite(n.atr)?n.atr:0).times(n.atrBufferFrac??.1),E=L.max(N.times(
A).div(100),M),$=H(r?N.minus(E):N.plus(E),n.tickSize,r?"down":"up");return{add:!0,addNumber:c+1,entry:H(d(e[h-1].close),n.tickSize,"nearest").toFixed(),sl:$.toFixed(),
sizePct:n.addSizePct??50,level:String(a),reason:`retest of ${a} confirmed by ${F?"engulfing":`pressure ${T.toFixed(2)}`}`}}function ut(t){const e=d(t.equity),s=t.
riskPct??1,o=d(t.entry),n=d(t.sl),l=d(t.leverage??1),c=d(t.feeRate??"0.0006");if(o.lte(0)||n.lte(0))throw new Error("entry and sl must be > 0");if(o.eq(n))throw new Error(
"entry and sl must differ");if(l.lte(0))throw new Error("leverage must be > 0");const r=n.lt(o)?"long":"short",a=e.times(s).div(100),f=o.minus(n).abs(),i=d(t.slippageBps??
0).div(1e4),p=t.includeFeesInRisk??!0?f.plus(c.plus(i).times(o.plus(n))):f;let m=a.div(p),h=!1;const b=t.available!==void 0?d(t.available):e,k=L.max(0,b).times(
l).div(o.times(d(1).plus(l.times(c))));if(m.gt(k)&&(m=k,h=!0),t.qtyStep!==void 0&&d(t.qtyStep).gt(0)){const F=d(t.qtyStep);m=m.div(F).floor().times(F)}let u;t.minQty!==
void 0&&m.lt(d(t.minQty))?u="min_qty":t.minNotional!==void 0&&m.times(o).lt(d(t.minNotional))&&(u="min_notional"),u&&(m=d(0));const g=m.times(o),v=g.times(c),P=m.
times(n).times(c),S=v.plus(P),R=m.times(o.plus(n)).times(i);return{side:r,qty:m.toFixed(),notional:g.toFixed(),margin:g.div(l).toFixed(),riskAmount:a.toFixed(),
riskPerUnit:f.toFixed(),entryFee:v.toFixed(),exitFeeAtSl:P.toFixed(),estFees:S.toFixed(),lossAtSl:m.times(f).plus(S).plus(R).toFixed(),capped:h,...u?{belowMin:u}:
{}}}const W={bitget_default:{spot:{maker:"0.001",taker:"0.001"},swap:{maker:"0.0002",taker:"0.0006"},stock:{maker:"0.00015",taker:"0.00015",taxReserved:"0"}}};function mt(t,e,s){
const n=(W[t]??W.bitget_default)[e];return s=="maker"?n.maker:n.taker}export{X as a,mt as b,st as c,it as d,lt as e,at as f,ct as g,ot as n,I as p,ut as s};
