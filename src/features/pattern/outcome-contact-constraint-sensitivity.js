import {evaluateArguments} from './outcome-argumentation.js';
import {stemCombination} from '../../core/relations.js';
export const CONTACT_CONSTRAINT_VERSION='p1-4d-contact-constraint-sensitivity-v1';
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const eq=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
const key=(...xs)=>JSON.stringify(xs);
const ref=(owner,id,field)=>({owner,id,field});
const lit=(propositionId,sign='for')=>({propositionId,sign});
const states=['supported','opposed','conflicting','unresolved'];
const signs=s=>s==='supported'?['for']:s==='opposed'?['against']:s==='conflicting'?['for','against']:[];
const clean='uncontested-substantial-observation';
const unconfirmed=x=>x&&x.effective===null&&x.selectionAuthority===false;

// Explicit hypothetical slot availability. One surviving substantial slot
// supports the literal direct-root basis; loss of EVERY slot opposes it.
// A conflicting slot cannot witness survival. A missing/unknown slot
// cannot witness universal loss. This says nothing about actual force.
export function evaluateRootAvailabilityScenario({completeHour,actorId,slotIds,availability}={}){
 const empty=()=>({status:'invalid-evidence',state:'unresolved',actualCapacityState:'unresolved',effective:null,judgments:[],ruleResults:[]});
 if(typeof completeHour!=='boolean'||typeof actorId!=='string'||!actorId||
  !Array.isArray(slotIds)||new Set(slotIds).size!==slotIds.length||slotIds.some(id=>typeof id!=='string'||!id)||
  !availability||!eq(Object.keys(availability),slotIds)||slotIds.some(id=>!states.includes(availability[id])))return empty();
 const id=key('remaining-direct-root-basis',actorId);
 const propositions=[{id,subject:actorId,kind:'hypothetical-direct-root-basis',level:'structural-hypothesis'}],evidence=[],rules=[];
 const mk=(id,sign,premises,under)=>({id,policyId:CONTACT_CONSTRAINT_VERSION,conclusion:lit(key('remaining-direct-root-basis',actorId),sign),
  premises,...(under?{undercutWhen:under}:{}),refs:[ref('contact-constraint-scenario',actorId,'slot-availability')],applicability:'complete-only'});
 for(const slotId of slotIds){
  const p=key('slot-available',slotId);
  propositions.push({id:p,subject:slotId,kind:'explicit-hypothetical-slot-availability',level:'observation'});
  for(const sign of signs(availability[slotId]))evidence.push({id:key(p,sign),...lit(p,sign),refs:[ref('contact-constraint-scenario',slotId,'availability')],applicability:'complete-only'});
  rules.push(mk(key('surviving-root',slotId),'for',[lit(p)],[lit(p,'against')]));
 }
 if(slotIds.length){
  const ps=slotIds.map(s=>key('slot-available',s));
  rules.push(mk('all-roots-unavailable','against',ps.map(p=>lit(p,'against')),ps.map(p=>lit(p))));
 }else{
  const p=key('no-literal-substantial-slot',actorId);
  propositions.push({id:p,subject:actorId,kind:'complete-literal-root-inventory-empty',level:'observation'});
  evidence.push({id:key(p,'for'),...lit(p),refs:[ref('contact-constraint-scenario',actorId,'slotIds')],applicability:'complete-only'});
  rules.push(mk('no-substantial-root-inventory','against',[lit(p)]));
 }
 const r=evaluateArguments({scope:completeHour?'complete':'partial',propositions,evidence,rules});
 if(!['diagnostic','partial'].includes(r.status))return empty();
 const j=r.judgments.find(x=>x.id===id);
 return {status:r.status,state:j.state,propositionId:id,proof:{support:j.support,opposition:j.opposition},actualCapacityState:'unresolved',effective:null,
  propositions,evidence,rules,judgments:r.judgments,ruleResults:r.ruleResults};
}

// Production sensitivity uses the physical root inventory, not the
// number of references to it. It does not assume actual damage or
// preservation. Only the explicitly named hypothetical loss is varied.
export function reviewContactConstraintSensitivity(prior,root,supply,combination,clash,joint){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:CONTACT_CONSTRAINT_VERSION,completeHour:complete,selectionAuthority:false,effective:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,actions:[],occurrences:[],pairs:[],reliefs:[]});
 if(typeof complete!=='boolean'||[root,supply,combination,clash,joint].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  root.rootEffectConfirmed!==null||supply.effectiveSupply!==null||[combination,clash,joint].some(x=>!unconfirmed(x)))return empty('upstream');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),slots=index(root.slots,s=>s.id),roots=index(root.occurrences,o=>o.id),
  sup=index(supply.occurrences,o=>o.id),pairs=index(combination.pairs,p=>p.pairId),cs=index(clash.slots,s=>s.slotId),
  reliefs=index(clash.reliefs,r=>r.id),actions=index(joint.actions,a=>a.edgeId),ca=index(combination.actions,a=>a.edgeId),cl=index(clash.actions,a=>a.edgeId);
 if([actors,slots,roots,sup,pairs,cs,reliefs,actions,ca,cl].some(x=>!x)||roots.size!==actors.size||sup.size!==actors.size)return empty('identity');
 const hidden=[...actors.values()].filter(a=>a.layer==='hidden'),visible=[...actors.values()].filter(a=>a.layer==='visible');
 if(!eq([...slots.keys()],hidden.map(a=>a.id))||!eq([...cs.keys()],[...slots.values()].filter(s=>s.clashIds?.length).map(s=>s.id)))return empty('slot-inventory');
 for(const a of hidden){
  const s=slots.get(a.id),c=cs.get(a.id);
  if(s.position!==a.position||s.element!==a.element||s.role!==a.hiddenRole||s.effectiveRoot!==null||
   !Array.isArray(s.clashIds)||!Array.isArray(s.competingTargetFormationIds)||
   s.state!==(s.clashIds.length?'clash-exposed':s.competingTargetFormationIds.length?'formation-contested':s.role==='residual'?'residual-context':clean)||
   c&&(!eq(c.clashIds,s.clashIds)||c.substantial!==(s.role!=='residual')||c.actualDamageState!=='unresolved'||c.actualPreservationState!=='unresolved'||c.actualRestorationState!=='unresolved'))return empty('slot-binding');
 }
 const pairRows=[],expectedPairs=[];
 for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){
  const a=visible[i],b=visible[j],literal=stemCombination(a.stem,b.stem);
  if(!literal)continue;
  const id=key(...[a.id,b.id].sort()),p=pairs.get(id),self=!!(a.dayReference||b.dayReference);
  if(!p||!eq(p.participantIds,[a.id,b.id])||p.associatedElement!==literal.associatedElement||
   !Array.isArray(p.sourceCases)||p.sourceCases.includes('self-combination-external-removal-exception')!==self||
   !Array.isArray(p.conditionals)||p.actualRestrictionState!=='unresolved'||p.actualRetentionState!=='unresolved'||p.actualTransformationState!=='unresolved')return empty('pair-binding');
  const external=p.conditionals.find(q=>q.policyId==='external-role-restriction');
  if(!external||external.actualEffectState!=='unresolved'||external.applicability!==(!complete?'unresolved':self?'opposed':'unresolved'))return empty('pair-source-scope');
  expectedPairs.push(id);
  pairRows.push({pairId:id,participantIds:[a.id,b.id],contactHypothesis:p.contactHypothesis,
   externalRemovalApplicability:external.applicability,externalRemovalScope:!complete?'partial':self?'outside-external-removal-scope':'external-removal-review',
   actualRestrictionState:'unresolved',actualRetentionState:'unresolved',actualTransformationState:'unresolved'});
 }
 if(!eq([...pairs.keys()],expectedPairs))return empty('pair-inventory');
 const occRows=[];
 for(const a of visible){
  const r=roots.get(a.id),o=sup.get(a.id);
  if(!r||!o||!Array.isArray(a.roots)||!Array.isArray(r.roots)||!o.directRoot||o.directRoot.preservationConfirmed!==null)return empty('root-contract');
  const ids=a.roots.map(x=>'hidden:'+x.position+':'+x.stem);
  if(!eq(ids,r.roots.map(x=>x.id))||ids.some(id=>slots.get(id)?.element!==a.element))return empty('literal-root-binding');
  const all=ids.filter(id=>slots.get(id).role!=='residual'),exposed=all.filter(id=>cs.has(id)),residual=ids.filter(id=>slots.get(id).role==='residual'&&cs.has(id));
  const intact=all.filter(id=>slots.get(id).state===clean),contested=all.filter(id=>slots.get(id).state!==clean);
  if(!eq(o.directRoot.uncontestedRootIds,intact)||!eq(o.directRoot.contestedRootIds,contested)||!eq(r.uncontestedRootIds,intact)||!eq(r.contestedRootIds,contested))return empty('direct-root-binding');
  // In this counterfactual, clean slots are retained and every exposed
  // substantial slot is removed; other contested slots stay unknown.
  const availability=Object.fromEntries(all.map(id=>[id,intact.includes(id)?'supported':exposed.includes(id)?'opposed':'unresolved']));
  const loss=evaluateRootAvailabilityScenario({completeHour:complete,actorId:a.id,slotIds:all,availability});
  if(loss.status!==status)return empty('root-scenario');
  occRows.push({actorId:a.id,substantialRootIds:all,exposedSubstantialRootIds:exposed,exposedResidualRootIds:residual,
   unexposedObservedRootIds:intact,otherContestedRootIds:contested.filter(id=>!exposed.includes(id)),lossAllExposedScenario:loss,
   actualRootLossState:'unresolved',actualRootPreservationState:'unresolved',actualCapacityState:'unresolved'});
 }
 const om=new Map(occRows.map(o=>[o.actorId,o])),actionRows=[];
 for(const a of actions.values()){
  const x=om.get(a.from),y=om.get(a.to),c=ca.get(a.edgeId),l=cl.get(a.edgeId);
  if(!x||!y||a.actualEffectState!=='unresolved'||a.effective!==null)return empty('action-binding');
  const relevant=pairRows.filter(p=>p.participantIds.includes(a.from)||p.participantIds.includes(a.to));
  const exp=[...new Set([...x.exposedSubstantialRootIds,...y.exposedSubstantialRootIds,...x.exposedResidualRootIds,...y.exposedResidualRootIds])];
  if(!eq(a.combinationPairIds,relevant.map(p=>p.pairId))||!eq(a.exposedRootIds,exp)||!!c!==!!relevant.length||!!l!==!!exp.length||
   c&&(!eq(c.fromPairIds,relevant.filter(p=>p.participantIds.includes(a.from)).map(p=>p.pairId))||!eq(c.toPairIds,relevant.filter(p=>p.participantIds.includes(a.to)).map(p=>p.pairId))||c.originalEffectPropositionId!==a.effectPropositionId)||
   l&&(!eq([...l.substantialRootIds,...l.residualRootIds],exp)||l.originalEffectPropositionId!==a.effectPropositionId))return empty('action-contact-binding');
  if(!relevant.length&&!exp.length)continue;
  actionRows.push({edgeId:a.edgeId,originalEffectPropositionId:a.effectPropositionId,
   pairIds:relevant.map(p=>p.pairId),exposedRootIds:exp,
   sourceLossAllExposedBasisState:x.lossAllExposedScenario.state,targetLossAllExposedBasisState:y.lossAllExposedScenario.state,
   sourceSurvivingRootIds:[...x.unexposedObservedRootIds],targetSurvivingRootIds:[...y.unexposedObservedRootIds],
   actualRestrictionState:'unresolved',actualEffectState:'unresolved',effective:null});
 }
 if([...ca.keys(),...cl.keys()].some(id=>!actions.has(id)))return empty('action-inventory');
 const reliefRows=[];
 for(const r of reliefs.values()){
  if(r.actualReliefState!=='unresolved'||r.effective!==null||![r.otherClashIds,r.remainingClashIds,r.competingFormationIds].every(Array.isArray))return empty('relief-contract');
  const related=[...cs.values()].flatMap(s=>s.reliefAlternatives.filter(a=>a.reliefId===r.id).map(a=>({slotId:s.slotId,side:a.side,
   rootPositionParticipates:a.rootPositionParticipates,rootElementDiffersFromTarget:a.rootElementDiffersFromTarget,actualRestorationState:'unresolved'})));
  if(!related.length)return empty('relief-coverage');
  reliefRows.push({reliefId:r.id,clashId:r.clashId,formationId:r.formationId,scope:!complete?'partial':
   r.otherClashIds.length||r.remainingClashIds.length||r.competingFormationIds.length?'competing-context':'isolated-contact-context',
   relatedSlots:related,actualReliefState:'unresolved',actualRestorationState:'unresolved'});
 }
 return {...base,status,reason:null,actions:actionRows,occurrences:occRows,pairs:pairRows,reliefs:reliefRows,
  limitations:['counterfactual-not-observed-loss','surviving-root-basis-not-retained-operation','self-exception-not-retention','relief-contact-not-restoration','no-actual-effect-or-selection-authority']};
}
