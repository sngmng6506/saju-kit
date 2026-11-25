import {stemCombination} from '../../core/relations.js';
const unique=xs=>[...new Set(xs)].sort();
const ORDER=['year','month','day','hour'];
const key=(r,w)=>JSON.stringify([r,w]);
// Screens describe evidence readiness, never physical efficacy.
// A conjunction of screens is not a sufficient classical condition.
export function createEffectContext(prior,access){
 const actors=new Map(prior.stemForce.occurrences.map(o=>[o.id,o]));
 const groups=new Map(access.groups.map(g=>[g.id,g]));
 const edges=new Map([...prior.relativeForce.edges,...access.edges].map(e=>[e.id,e]));
 const profiles=prior.relativeForce.profiles;
 const actor=id=>{
  const o=actors.get(id),p=profiles[id],g=groups.get(id);
  if(g)return {id,kind:'group',formationId:g.formationId,slots:[...g.slots],limitations:[...g.limitations],clashIds:[...g.clashIds],competingContacts:[...g.competingContacts],transformationConfirmed:null};
  if(!o||!p)return null;
  return {id,kind:o.layer,position:o.position,stem:o.stem,tenGod:o.tenGod,axes:{...p.axes},rootPositions:[...p.rootPositions],
   rootClashExposed:[...p.rootClashExposed],localGenerationNodes:[...p.localGenerationNodes],localControlNodes:[...p.localControlNodes],
   contacts:[...p.contacts],effectiveForce:null};
 };
 const assess=e=>{
  const from=actor(e.from),to=actor(e.to),blockers=[],observations=[];
  const base={from:e.from,to:e.to,kind:e.kind,edgeId:e.edgeId??null,source:from,target:to,effective:null};
  const invalid=reason=>({...base,status:'invalid-evidence',blockers:[reason],observations:[],relative:null});
  if(!from||!to||e.from===e.to||!['generate','control','combine'].includes(e.kind))return invalid('unknown-or-invalid-endpoint');
  if(!prior.completeHour)blockers.push('missing-hour');
  if(e.kind==='combine'){
   if(from.kind!=='visible'||to.kind!=='visible'||!stemCombination(from.stem,to.stem))return invalid('combination-not-supported');
   const partners=x=>[...actors.values()].filter(y=>y.layer==='visible'&&y.id!==x.id&&stemCombination(x.stem,y.stem)).map(y=>y.id).sort();
   const a=partners(from),b=partners(to),adjacent=Math.abs(ORDER.indexOf(from.position)-ORDER.indexOf(to.position))===1;
   if(a.length>1||b.length>1)blockers.push('competing-combination');
   if(!adjacent)blockers.push('nonadjacent');
   if(from.rootClashExposed.length||to.rootClashExposed.length)blockers.push('root-clash-exposure');
   if(from.axes.anySubstantial!==true||to.axes.anySubstantial!==true)blockers.push('substantial-root-not-established');
   return {...base,status:'requires-review',blockers:unique([...blockers,'combination-effect-unresolved']),observations,relative:null,
    combination:{fromPartners:a,toPartners:b,adjacent,exclusiveObserved:a.length===1&&b.length===1,removalConfirmed:null,transformationConfirmed:null}};
  }
  const raw=edges.get(e.edgeId??e.from+'>'+e.to);
  if(!raw||raw.from!==e.from||raw.to!==e.to||raw.kind!==e.kind)return invalid('directed-edge-not-supported');
  blockers.push(...raw.blockers);
  if(from.kind==='group'||to.kind==='group')blockers.push('formation-transformation-unresolved');
  if(from.kind==='hidden'||to.kind==='hidden')blockers.push('hidden-participant-access-unresolved');
  const relative=raw.relative?{...raw.relative}:null;
  if(relative){
   if(relative.relation==='mixed-evidence')blockers.push('relative-evidence-conflict');
   if(relative.relation==='unresolved'||relative.relation==='not-comparable')blockers.push('relative-evidence-unresolved');
   // Generating a stronger target is not a contradiction. For control,
   // target-dominant evidence warrants review, not a failed control verdict.
   if(e.kind==='control'&&relative.relation==='right-evidence-dominates')blockers.push('target-evidence-dominates-control-source');
   if(relative.sharedRootPositions.length||relative.sharedGenerationNodes.length||relative.sharedPeerNodes.length)observations.push('shared-supply-evidence-not-independent');
  }
  const status=blockers.length?'requires-review':raw.screen==='root-and-locality-screen-met'?'root-locality-screen-met':'requires-review';
  return {...base,status,blockers:unique(blockers),observations,relative,possibleLocalProtection:raw.possibleLocalProtection??[],sourceLocalControlNodes:raw.sourceLocalControlNodes??[]};
 };
 return {assess};
}
export function observeWitnessEfficacy(review,integrity,compound,context,completeHour){
 const base={candidateId:review.candidateId,completeHour,selectionAuthority:false,effective:null,formed:null,broken:null,rescued:null};
 if(review.status==='out-of-scope')return {...base,status:'out-of-scope',witnesses:[],threats:[]};
 if(!integrity||integrity.status!=='consistent'||!compound||compound.violations.length)return {...base,status:'invalid-evidence',witnesses:[],threats:[]};
 const rows=review.rules.flatMap(r=>r.witnesses.map(w=>{
  const edges=w.edges.map(context.assess),anchorAlternatives=(w.anchorBindings??[]).map(b=>({
   anchorId:b.anchorId,targetId:b.targetId??null,basis:b.basis??null,
   identityOnly:b.basis==='target-is-anchor'&&b.anchorId===b.targetId&&w.roles.target===b.targetId&&b.edge===null&&b.independentSlots===false,
   edge:b.edge?context.assess(b.edge):null,effective:null}));
  const invalid=edges.some(e=>e.status==='invalid-evidence')||anchorAlternatives.some(a=>a.edge?.status==='invalid-evidence');
  const mandatoryScreen=edges.length>0&&edges.every(e=>e.status==='root-locality-screen-met');
  const anchorScreen=!anchorAlternatives.length||anchorAlternatives.some(a=>a.identityOnly||a.edge?.status==='root-locality-screen-met');
  const flags=[];
  if(!completeHour)flags.push('missing-hour');
  if(review.storageProjection)flags.push('storage-access-and-family-unresolved');
  if(!edges.length)flags.push('co-presence-only');
  if(w.regulation?.conditions?.dayCapacity==='opposing-hypothesis')flags.push('day-capacity-opposing-hypothesis');
  if(w.regulation?.conditions?.dayCapacity==='unresolved')flags.push('day-capacity-unresolved');
  if(r.kind==='exception')flags.push('exception-applicability-unresolved');
  if(r.kind==='support'&&r.impact==='conditional-regulation-not-confirmed-support')flags.push('excess-or-deficiency-unresolved');
  const status=invalid?'invalid-evidence':mandatoryScreen&&anchorScreen&&!flags.length?'edge-screens-met':'requires-review';
  return {ruleId:r.id,witnessId:w.id,kind:r.kind,roles:{...w.roles},status,edges,anchorAlternatives,flags,
   unresolvedConditions:[...r.unresolvedConditions],threatWitnessId:w.threatWitnessId??null,effective:null};
 }));
 const byKey=new Map(rows.map(w=>[key(w.ruleId,w.witnessId),w]));
 const threats=compound.threatCoverage.map(t=>{
  const read=r=>byKey.get(key(r.ruleId,r.witnessId));
  const threat=read(t.threat),alternatives=t.alternatives.map(r=>({ ...r,status:read(r)?.status??'invalid-evidence',effective:null}));
  return {threat:t.threat,threatStatus:threat?.status??'invalid-evidence',alternatives,
   coverage:t.coverage,resolutionConfirmed:null};
 });
 const invalid=rows.some(w=>w.status==='invalid-evidence')||threats.some(t=>t.threatStatus==='invalid-evidence'||t.alternatives.some(a=>a.status==='invalid-evidence'));
 return {...base,status:invalid?'invalid-evidence':completeHour?'diagnostic':'partial',witnesses:rows,threats,
  limitations:['screen-not-effective-force','unresolved-classical-conditions-retained','no-cancellation','no-validated-decision-authority']};
}
