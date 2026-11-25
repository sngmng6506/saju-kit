import {allOf} from './pattern-outcome-decision.mjs';
export const CONTEXT_REVIEW_VERSION='pattern-context-review-v1';
const strengthPolicy='strength-decision-v1';
const unique=xs=>[...new Set(xs)].sort();
const dayConditions=new Set(['day-strong','day-and-resource-strong']);
const resourceConditions=new Set(['resource-light','resource-heavy-wealth-light-root','day-and-resource-strong','resource-effective','resource-wealth-noninterference']);
const burdenConditions=new Set(['wealth-light-peer-heavy','wealth-light','peer-strong','output-effective','food-controls-killing-effect','day-capacity','food-killing-balance','killing-uncontrolled','resource-blocks-food-effect','wealth-controls-resource-preserves-food','hurting-strong-resource-rooted']);
const validStrength=s=>s?.version===strengthPolicy&&s.scope==='ordinary-chart-assumption'&&s.completeHour===true&&s.status==='hypothesis'&&['strong','weak'].includes(s.direction)&&s.decision?.direction===s.direction&&Array.isArray(s.decision.conflicts)&&s.decision.conflicts.length===0&&Array.isArray(s.decision.grounds)&&s.decision.grounds.length>0;
const integer=v=>Number.isSafeInteger(v)&&v>=0;
// Matched rows only. Marginal minima/maxima from distinct scenarios are not compared.
export function compareScenarioRows(rows,left,right){
 if(!Array.isArray(rows)||!rows.length)return {status:'unavailable',rows:0,greater:0,equal:0,less:0};
 let greater=0,equal=0,less=0;
 for(const r of rows){
  const a=left(r),b=right(r);
  if(!integer(a)||!integer(b))throw Error('invalid scenario mass');
  if(a>b)greater++;else if(a<b)less++;else equal++;
 }
 return {rows:rows.length,greater,equal,less,status:greater===rows.length?'left-dominates-all':less===rows.length?'right-dominates-all':equal===rows.length?'equal-all':'scenario-sensitive'};
}
export function observeStrengthContext(strength,complete){
 const available=complete&&strength?.version===strengthPolicy&&strength.scope==='ordinary-chart-assumption'&&strength.completeHour===true;
 const direction=available&&validStrength(strength)?strength.direction:null;
 const rows=available?strength.observations?.interaction?.rows??[]:[];
 const byBurden=Object.fromEntries(['output','wealth','officer'].map(k=>[k,compareScenarioRows(rows,r=>r.support,r=>r.burden[k])]));
 const resourceVsWealth=compareScenarioRows(rows,r=>r.conditionalResource,r=>r.burden.wealth);
 const peerVsWealth=compareScenarioRows(rows,r=>r.peerStem,r=>r.burden.wealth);
 const resourceVsOutput=compareScenarioRows(rows,r=>r.conditionalResource,r=>r.burden.output);
 return {policy:strengthPolicy,scope:'ordinary-chart-assumption',direction,dayStrongHypothesis:direction===null?null:direction==='strong',
  grounds:available?[...(strength.decision?.grounds??[])]:[],conflicts:available?[...(strength.decision?.conflicts??[])]:[],
  rootCapacity:available&&strength.axes?.rootCapacity?{...strength.axes.rootCapacity}:null,
  seasonRobustness:available?strength.seasonRobustness?.passed??null:null,
  comparisons:{supportVsBurden:byBurden,conditionalResourceVsNominalWealth:resourceVsWealth,visiblePeerVsNominalWealth:peerVsWealth,conditionalResourceVsResidualOutput:resourceVsOutput},
  actualDayCapacity:null,resourceExcess:null,resourceDeficiency:null,selectionAuthority:false};
}
const category=(god)=>['정인','편인'].includes(god)?'resource':['정재','편재'].includes(god)?'wealth':['비견','겁재'].includes(god)?'peer':god==='식신'?'food':god==='편관'?'killing':god==='정관'?'officer':god==='상관'?'output':null;
function candidateEvidence(result,c,e){
 const occurrences=new Map(result.routeReview.occurrences.map(o=>[o.id,o]));
 const anchors=new Set(c.anchorIds);
 const graph=result.relativeForce.edges;
 const pairs=graph.filter(x=>anchors.has(x.from)||anchors.has(x.to)).map(x=>{
  const a=occurrences.get(x.from),b=occurrences.get(x.to);
  if(!a||!b)throw Error('unbound contextual edge');
  return {id:x.id,from:x.from,to:x.to,fromCategory:a.dayReference?'day':category(a.tenGod),toCategory:b.dayReference?'day':category(b.tenGod),kind:x.kind,
   comparison:x.relative.relation,screen:x.screen,blockers:[...x.blockers]};
 });
 return {anchorIds:[...anchors],resourceWealth:pairs.filter(p=>p.fromCategory==='wealth'&&p.toCategory==='resource'&&p.kind==='control'),
  peerWealth:pairs.filter(p=>p.fromCategory==='peer'&&p.toCategory==='wealth'&&p.kind==='control'),
  foodKilling:pairs.filter(p=>p.fromCategory==='food'&&p.toCategory==='killing'&&p.kind==='control'),
  triads:e.triads.map(t=>({id:t.id,day:t.day,food:t.food,killing:t.killing,dayRootEvidence:t.dayRootEvidence,concerns:[...t.concerns],status:t.status})),
  combinationOrOrderLinks:e.routes.flatMap(r=>r.links.filter(l=>l.kind==='combine'||l.reviewReasons.includes('nonadjacent')||l.reviewReasons.includes('participant-combination-or-group')).map(l=>({routeId:r.id,from:l.from,to:l.to,kind:l.kind,status:l.status}))),
  effective:null};
}
function condition(name,ctx){
 const evidence=[];
 if(dayConditions.has(name)||burdenConditions.has(name))evidence.push('ordinary-day-strength','matched-support-burden');
 if(resourceConditions.has(name))evidence.push('matched-resource-wealth-output','anchor-resource-wealth');
 if(name==='wealth-light-peer-heavy'||name==='wealth-light'||name==='peer-strong')evidence.push('matched-visible-peer-wealth','anchor-peer-wealth');
 if(name==='food-controls-killing-effect'||name==='food-killing-balance'||name==='day-capacity')evidence.push('anchor-food-killing','food-killing-day-triad');
 if(name.includes('combin')||name.includes('noninterference')||name.includes('placement')||name.includes('preserv'))evidence.push('combination-and-order-links');
 // Only the explicit day-strong condition has an implemented proxy.
 // A weak ordinary-chart hypothesis is not proof of weak actual capacity.
 // For compound predicates the known conjunct may refute the *proxy*,
 // but a strong hypothesis cannot resolve resource strength.
 let proxy=null;
 if(name==='day-strong')proxy=ctx.dayStrongHypothesis;
 if(name==='day-and-resource-strong'&&ctx.dayStrongHypothesis===false)proxy=false;
 return {condition:name,evidenceRefs:unique(evidence),proxyValue:proxy,
  proxyStatus:proxy!==null?'conditional-ordinary-strength':evidence.length?'evidence-only':'not-mapped',
  doctrinalValue:null,effective:null};
}
export function reviewPatternContext(result,outcome,efficacy,decision,strength){
 const base={version:CONTEXT_REVIEW_VERSION,selectionAuthority:false,selectedPattern:null,assistantGod:null};
 if(outcome.status==='unavailable'||efficacy.status==='unavailable'||decision.status==='unavailable')return {...base,status:'unavailable',strength:null,candidates:[]};
 const complete=result.completeHour===true&&efficacy.status!=='partial';
 const ctx=observeStrengthContext(strength,complete);
 const candidates=decision.candidates.map(c=>{
  const o=outcome.candidates.find(x=>x.candidateId===c.candidateId),e=efficacy.candidates.find(x=>x.candidateId===c.candidateId);
  if(!o||!e||o.family!==c.family||e.family!==c.family)throw Error('unbound contextual candidate');
  const ev=candidateEvidence(result,o,e);
  const motifs=c.motifs.map(m=>{
   const clauses=m.clauses.map(k=>{
    const review=k.kind==='contextual'&&k.value===null?condition(k.id,ctx):null;
    return {...k,context:review,conditionalValue:review?.proxyValue??k.value};
   });
   return {id:m.id,kind:m.kind,source:m.source,baselinePredicate:m.predicate,conditionalPredicate:allOf(clauses.map(k=>k.conditionalValue)),clauses,effective:m.effective};
  });
  return {candidateId:c.candidateId,family:c.family,evidence:ev,motifs,formed:null,broken:null,rescued:null,selectionAuthority:false};
 });
 return {...base,status:complete?'research-review':'partial',strength:ctx,candidates};
}
export function summarizePatternContexts(reviews){
 const cs=reviews.flatMap(r=>r.candidates),ms=cs.flatMap(c=>c.motifs);
 const clauses=ms.filter(m=>m.baselinePredicate!==false).flatMap(m=>m.clauses.filter(k=>k.context!==null).map(k=>k.context));
 const names=unique(clauses.map(c=>c.condition));
 const conditions=names.map(name=>{
  const xs=clauses.filter(x=>x.condition===name);
  return {condition:name,occurrences:xs.length,proxyTrue:xs.filter(x=>x.proxyValue===true).length,proxyFalse:xs.filter(x=>x.proxyValue===false).length,unresolved:xs.filter(x=>x.proxyValue===null).length,doctrinalResolved:0};
 });
 return {charts:reviews.length,partial:reviews.filter(r=>r.status==='partial').length,
  ordinaryStrength:{strong:reviews.filter(r=>r.strength?.direction==='strong').length,weak:reviews.filter(r=>r.strength?.direction==='weak').length,unresolved:reviews.filter(r=>r.strength?.direction==null).length},
  candidates:cs.length,conditions,conditionalMotifChanges:ms.filter(m=>m.conditionalPredicate!==m.baselinePredicate).length,
  conditionalMotifExcluded:ms.filter(m=>m.baselinePredicate===null&&m.conditionalPredicate===false).length,
  conditionalMotifMatched:ms.filter(m=>m.baselinePredicate===null&&m.conditionalPredicate===true).length,
  doctrinalConditionsResolved:0,finalDecisions:0,selectionAuthority:false};
}
