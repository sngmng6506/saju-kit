// Research decision algebra: explicit truth, explicit falsity, unknown.
// A finite list of source motifs is not a complete classical doctrine.
export const OUTCOME_DECISION_VERSION='pattern-outcome-decision-v1';
const kinds=['support','damage','rescue'];
const truth=v=>{if(v!==true&&v!==false&&v!==null)throw Error('invalid truth value');return v;};
export function allOf(values){
 const xs=values.map(truth);
 return xs.some(x=>x===false)?false:xs.every(x=>x===true)?true:null;
}
export function anyOf(values){
 const xs=values.map(truth);
 return xs.some(x=>x===true)?true:xs.every(x=>x===false)?false:null;
}
export const not=v=>truth(v)===null?null:!v;
// Open-world aggregation: all listed alternatives being false does not
// exclude an unmodelled alternative. Exhaustiveness must be explicit.
export function alternatives(values,{exhaustive=false}={}){
 const v=anyOf(values);
 return v===false&&!exhaustive?null:v;
}
// Pure decision algebra, not an authority-granting API. "damage" describes
// damage before rescue; "unresolvedDamage" describes the net remaining threat.
// A successful rescue of one threat never erases another.
export function evaluateOutcomeLogic({support,threats,threatInventoryComplete=false}){
 truth(support);
 const ids=new Set();
 const evaluated=threats.map(t=>{
  if(typeof t.id!=='string'||!t.id||ids.has(t.id))throw Error('invalid or duplicate threat id');
  ids.add(t.id);
  const damage=truth(t.damage);
  const rescue=alternatives(t.rescues,{exhaustive:t.rescueInventoryComplete===true});
  return {id:t.id,damage,rescue,remainingDamage:allOf([damage,not(rescue)]),rescuedDamage:allOf([damage,rescue])};
 });
 const damage=alternatives(evaluated.map(t=>t.damage),{exhaustive:threatInventoryComplete});
 const unresolvedDamage=alternatives(evaluated.map(t=>t.remainingDamage),{exhaustive:threatInventoryComplete});
 const rescuedDamage=alternatives(evaluated.map(t=>t.rescuedDamage),{exhaustive:threatInventoryComplete});
 // A remaining damaging path does not by itself prove the whole pattern
 // broken. These are composition states conditional on supplied premises.
 const hypotheses={
  cleanFormation:allOf([support,not(damage)]),
  formationWithDamage:allOf([support,unresolvedDamage]),
  damageWithoutSupport:allOf([not(support),unresolvedDamage]),
  formationAfterRescue:allOf([support,damage,rescuedDamage,not(unresolvedDamage)])
 };
 const established=Object.keys(hypotheses).filter(k=>hypotheses[k]===true);
 return {support,damage,unresolvedDamage,rescuedDamage,threats:evaluated,hypotheses,
  status:established.length===1?'conditional-hypothesis':established.length>1?'conflicting-premises':'abstained',
  hypothesis:established.length===1?established[0]:null,formed:null,broken:null,rescued:null,selectionAuthority:false};
}
const unique=xs=>[...new Set(xs)].sort();
function inspectMotifs(raw){
 return raw.map(m=>{
  if(!kinds.includes(m.kind))throw Error('unknown motif kind');
  const clauses=m.clauses.map((c,i)=>({id:c.name??c.kind+':'+i,kind:c.kind,value:truth(c.matched)}));
  const predicate=allOf(clauses.map(c=>c.value));
  if(predicate!==m.predicate)throw Error('inconsistent motif predicate: '+m.id);
  return {id:m.id,kind:m.kind,source:m.source,predicate,clauses,
   missingConditions:clauses.filter(c=>c.value===null).map(c=>c.id),
   // A motif whose literal conditions all hold still lacks confirmed effect.
   effective:predicate===false?false:null};
 });
}
export function reviewOutcomeDecision(result,outcome,efficacy){
 const base={version:OUTCOME_DECISION_VERSION,selectionAuthority:false,selectedPattern:null,assistantGod:null};
 if(outcome.status==='unavailable'||efficacy.status==='unavailable')
  return {...base,status:'unavailable',candidates:[]};
 const candidates=outcome.candidates.map(c=>{
  const e=efficacy.candidates.find(x=>x.candidateId===c.candidateId);
  const raw=result.outcomes.find(x=>x.candidateId===c.candidateId);
  if(!e||!raw||e.family!==c.family||raw.family!==c.family)throw Error('unbound decision candidate: '+c.candidateId);
  const motifs=inspectMotifs(raw.motifs);
  const byKind=Object.fromEntries(kinds.map(k=>[k,motifs.filter(m=>m.kind===k)]));
  const summary=Object.fromEntries(kinds.map(k=>[k,{
   total:byKind[k].length,literalMatched:byKind[k].filter(m=>m.predicate===true).map(m=>m.id),
   excluded:byKind[k].filter(m=>m.predicate===false).map(m=>m.id),
   unresolved:byKind[k].filter(m=>m.predicate===null).map(m=>m.id),
   effective:alternatives(byKind[k].map(m=>m.effective))
  }]));
  const threats=e.threats.map((t,i)=>({
   id:JSON.stringify([t.routeId,t.damage.from,t.damage.to,i]),routeId:t.routeId,
   from:t.damage.from,to:t.damage.to,damage:truth(t.damage.effective),
   rescues:t.possibleRescues.map(w=>truth(w.neutralizesThreat)),rescueInventoryComplete:false,
   evidenceStatus:t.damage.status,possibleRescueCount:t.possibleRescues.length
  }));
  // No route screen, source annotation or motif match is promoted to truth.
  // Source coverage and rescue inventories remain open-world.
  const logic=evaluateOutcomeLogic({support:summary.support.effective,threats,threatInventoryComplete:false});
  const reviewReasons=unique([
   ...motifs.flatMap(m=>m.missingConditions.map(k=>'motif:'+m.id+':'+k)),
   ...e.routes.flatMap(r=>r.links.flatMap(l=>[...l.unresolved,...l.reviewReasons])),
   ...e.paths.flatMap(p=>p.witnesses.flatMap(w=>[...w.unresolved,...w.reviewReasons])),
   ...e.triads.flatMap(t=>[...t.unresolved,...t.reviewReasons]),
   'source-rule-coverage-not-exhaustive','effective-force-unadjudicated',
   ...(result.completeHour===true?[]:['missing-hour'])
  ]);
  return {candidateId:c.candidateId,family:c.family,motifs,summary,threatEvidence:threats,logic,reviewReasons,
   formed:null,broken:null,rescued:null,selectionAuthority:false};
 });
 return {...base,status:result.completeHour===true?'research-review':'partial',candidates};
}
export function summarizeOutcomeDecisions(reviews){
 const cs=reviews.flatMap(r=>r.candidates),motifs=cs.flatMap(c=>c.motifs);
 const backlog=new Map();
 for(const review of reviews)for(const c of review.candidates)for(const m of c.motifs){
  if(m.predicate===false)continue; // A refuted alternative does not block this chart.
  for(const clause of m.clauses.filter(x=>x.value===null&&x.kind==='contextual')){
   const key=clause.id;
   if(!backlog.has(key))backlog.set(key,{condition:key,occurrences:0,charts:new Set(),families:new Set(),motifs:new Set()});
   const b=backlog.get(key);b.occurrences++;b.charts.add(review);b.families.add(c.family);b.motifs.add(m.id);
  }
 }
 const conditionBacklog=[...backlog.values()].map(b=>({condition:b.condition,occurrences:b.occurrences,chartCount:b.charts.size,families:unique([...b.families]),motifs:unique([...b.motifs])}))
  .sort((a,b)=>b.chartCount-a.chartCount||b.occurrences-a.occurrences||a.condition.localeCompare(b.condition));
 return {conditionBacklog,charts:reviews.length,unavailable:reviews.filter(r=>r.status==='unavailable').length,partial:reviews.filter(r=>r.status==='partial').length,
  candidates:cs.length,motifCounts:Object.fromEntries(kinds.map(k=>[k,{
   total:motifs.filter(m=>m.kind===k).length,
   literalMatched:motifs.filter(m=>m.kind===k&&m.predicate===true).length,
   excluded:motifs.filter(m=>m.kind===k&&m.predicate===false).length,
   unresolved:motifs.filter(m=>m.kind===k&&m.predicate===null).length
  }])),
  conditionalHypotheses:cs.filter(c=>c.logic.status==='conditional-hypothesis').length,
  abstained:cs.filter(c=>c.logic.status==='abstained').length,conflicts:cs.filter(c=>c.logic.status==='conflicting-premises').length,
  finalDecisions:cs.filter(c=>c.formed!==null||c.broken!==null||c.rescued!==null).length,
  finalOutcomeAccuracy:null,selectionAuthority:false};
}
