import {evaluateArguments} from './outcome-argumentation.js';
import {elementRelation} from '../../core/elements.js';
import {sourceEffectClauses} from './outcome-source-effect-policy.js';

export const ACTION_SYNTHESIS_VERSION='p1-4e-action-synthesis-v1';
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const eq=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const key=(...xs)=>JSON.stringify(xs);
const unresolved=x=>x==='unresolved';
const definitions=new Map(sourceEffectClauses().map(c=>[c.id,c]));
const graph=(owner,scope)=>{
 if(!owner||![owner.propositions,owner.evidence,owner.rules,owner.judgments,owner.ruleResults].every(Array.isArray))return null;
 const r=evaluateArguments({scope,propositions:owner.propositions,evidence:owner.evidence,rules:owner.rules});
 if(r.status!==(scope==='complete'?'diagnostic':'partial')||!same(r.judgments,owner.judgments)||!same(r.ruleResults,owner.ruleResults))return null;
 const judgments=index(r.judgments,j=>j.id),results=index(r.ruleResults,x=>x.id);
 if(!judgments||!results||r.judgments.some(j=>j.level==='effect-hypothesis'&&!unresolved(j.state)))return null;
 return {judgments,rules:owner.rules,results};
};
// References retain exact owner and proposition identity. Alternatives
// remain separate conjunctions, including opposition and undercut paths.
// Missing premises are proof obligations, not negative effect evidence.
function describe(g,id,owner){
 const j=g?.judgments.get(id);if(!j)return null;
 const alternatives=g.rules.filter(r=>r.conclusion.propositionId===id).map(r=>{
  const q=g.results.get(r.id);
  return {ruleId:r.id,sign:r.conclusion.sign,status:q.status,missing:q.missing.map(p=>({propositionId:p.propositionId,sign:p.sign,
   kind:g.judgments.get(p.propositionId).kind,state:g.judgments.get(p.propositionId).state})),undercuts:q.undercuts??[]};
 });
 return {owner,propositionId:id,kind:j.kind,subject:j.subject,level:j.level,state:j.state,proof:{support:j.support,opposition:j.opposition},alternatives};
}
function directionRole(a){
 return a.kind==='generate'&&a.to==='visible:day'?'support':a.kind==='generate'&&a.from==='visible:day'?'release':
  a.kind==='control'&&a.to==='visible:day'?'restraint':null;
}
export function synthesizeActionReview(prior,argument,source,element,day,joint,modeled,contact){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial',scope=complete?'complete':'partial';
 const base={version:ACTION_SYNTHESIS_VERSION,completeHour:complete,selectionAuthority:false,effective:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,actions:[],summary:null});
 if(typeof complete!=='boolean'||[argument,source,element,day,joint,modeled,contact].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  source.effectConfirmed!==null||[argument,element,day,joint,modeled,contact].some(x=>x.effective!==null))return empty('upstream');
 const ag=graph(argument,scope),mg=graph(modeled,scope),dg=graph(day,scope);
 if(!ag||!mg||!dg)return empty('proof-replay');
 // Original structural/effect proofs must survive incorporation unchanged.
 if([...ag.judgments].some(([id,j])=>!same(j,mg.judgments.get(id))))return empty('original-proof-parity');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),aa=index(argument.actions,a=>a.edgeId),ss=index(source.actions,a=>a.edgeId),
  ee=index(element.actions,a=>a.edgeId),jj=index(joint.actions,a=>a.edgeId),mm=index(modeled.actions,a=>a.edgeId),
  dd=index(day.actions,a=>a.edgeId),cc=index(contact.actions,a=>a.edgeId),paths=index(joint.paths,p=>p.pathId),routes=index(modeled.interpositionRoutes,p=>p.pathId);
 if([actors,aa,ss,ee,jj,mm,dd,cc,paths,routes].some(x=>!x)||[ss,ee,jj,mm].some(m=>!eq([...m.keys()],[...aa.keys()]))||
  !eq([...paths.keys()],[...routes.keys()]))return empty('inventory');
 const visible=[...actors.values()].filter(a=>a.layer==='visible');
 const expected=visible.flatMap(a=>visible.filter(b=>a.id!==b.id&&elementRelation(a.element,b.element).direction==='left-to-right').map(b=>a.id+'>'+b.id));
 if(!eq([...aa.keys()],expected)||!eq([...dd.keys()],[...aa.values()].filter(directionRole).map(a=>a.edgeId)))return empty('visible-scope');
 const result=[],seenContacts=new Set(),seenRoutes=new Set();
 for(const a of aa.values()){
  const s=ss.get(a.edgeId),e=ee.get(a.edgeId),j=jj.get(a.edgeId),m=mm.get(a.edgeId),d=dd.get(a.edgeId),c=cc.get(a.edgeId);
  const effect=describe(ag,a.effectPropositionId,'argumentReview'),structural=describe(ag,a.structuralPropositionId,'argumentReview');
  if(!effect||effect.kind!=='actual-action-effective'||effect.subject!==a.edgeId||effect.level!=='effect-hypothesis'||!unresolved(effect.state)||
   !structural||structural.subject!==a.edgeId||structural.kind!==(a.kind==='generate'?'existing-generation-screen-met':'stable-source-profile-dominance')||
   [s,j,m].some(q=>q.from!==a.from||q.to!==a.to||q.kind!==a.kind)||s.structuralPropositionId!==structural.propositionId||
   s.actualEffectPropositionId!==effect.propositionId||[e,m].some(q=>q.originalEffectPropositionId!==effect.propositionId)||
   j.effectPropositionId!==effect.propositionId||[s,e,j,m].some(q=>!unresolved(q.actualEffectState)))return empty('action-binding');
  const sc=index(s.clauses,q=>q.clauseId),ec=index(e.clauses,q=>q.clauseId),mc=index(m.clauses,q=>q.clauseId);
  const defs=[...definitions.values()].filter(q=>q.kind===a.kind&&q.fromElement===actors.get(a.from).element&&q.toElement===actors.get(a.to).element);
  if(!sc||!ec||!mc||[sc,ec,mc].some(x=>!eq([...x.keys()],defs.map(q=>q.id)))||!eq(j.sourceClauseIds,defs.map(q=>q.id)))return empty('clause-coverage');
  const clauses=[];let direct=null,combined=null;
  for(const def of defs){
   const x=sc.get(def.id),y=ec.get(def.id),z=mc.get(def.id);
   if(x.predicate!==def.predicate||!unresolved(x.predicateState)||!unresolved(x.applicability)||x.effectConfirmed!==null||
    y.predicate!==def.predicate||!unresolved(y.actualPredicateState)||!unresolved(y.actualEffectState)||
    y.authority!=='experimental-model-assumption-only')return empty('source-authority');
   const row={clauseId:def.id,predicate:def.predicate,predicateActorId:x.predicateActorId,
    classicalApplicability:x.applicability,modeledApplicability:y.modeledApplicability,modeledPredicateState:y.modelPredicateState,actualPredicateState:'unresolved'};
   const eligible=def.family==='generation-strong-source-release'||def.family==='control-weak-target';
   if(eligible){
    if(direct||combined)return empty('duplicate-consequence');
    const mid=describe(mg,z.modelPropositionId,'modeledConsequenceReview');
    direct=describe(mg,a.kind==='generate'?z.directReleasePropositionId:z.directInjuryPropositionId,'modeledConsequenceReview');
    combined=describe(mg,z.propositionId,'modeledConsequenceReview');
    if(!mid||!direct||!combined||mid.state!==y.modelPredicateState||z.structuralPropositionId!==a.structuralPropositionId||
     direct.kind!==(a.kind==='generate'?'modeled-direct-release-tendency':'modeled-direct-injury-tendency')||
     combined.kind!==(a.kind==='generate'?'modeled-source-release':'modeled-target-injury')||
     direct.subject!==key(a.edgeId,def.id)||combined.subject!==direct.subject||
     direct.state!==(a.kind==='generate'?z.directReleaseState:z.directInjuryState)||combined.state!==z.state||
     !unresolved(z.actualEffectState)||combined.state==='supported'&&direct.state!=='supported'||
     a.kind==='generate'&&!unresolved(z.actualReceptionState))return empty('consequence-proof');
    row.modelProof=mid;
   }else if(z.propositionId!==null||!unresolved(z.state))return empty('unmodeled-clause');
   clauses.push(row);
  }
  if(!direct||!combined)return empty('missing-consequence');
  let objective=null;
  if(d){
   const fit=describe(dg,d.directionPropositionId,'dayBalanceDirectionReview'),candidate=describe(dg,d.candidatePropositionId,'dayBalanceDirectionReview');
   if(!fit||!candidate||fit.kind!=='ordinary-balance-direction-fit'||candidate.kind!=='direction-aligned-structural-candidate'||
    fit.subject!==a.edgeId||candidate.subject!==a.edgeId||fit.state!==d.directionFit||candidate.state!==d.candidateState||
    d.role!==directionRole(a)||d.originalEffectPropositionId!==effect.propositionId||!unresolved(d.actualEffectState))return empty('direction-binding');
   objective={role:d.role,desiredDirection:d.desiredDirection,fit,candidate,actualBenefitState:'unresolved'};
  }
  const routeRows=[];
  if(!Array.isArray(j.interpositionPathIds)||!Array.isArray(j.combinationPairIds)||!Array.isArray(j.exposedRootIds))return empty('joint-contract');
  for(const id of j.interpositionPathIds){
   const p=paths.get(id),r=routes.get(id),proof=describe(mg,r?.propositionId,'modeledConsequenceReview');
   if(seenRoutes.has(id)||!p||!r||!proof||p.controlEdgeId!==a.edgeId||r.controlEdgeId!==a.edgeId||
    proof.kind!==r.kind||proof.subject!==key('interposition-operation',id)||proof.state!==r.state||
    !eq(p.requiredLegIds,r.legProofs?.map(q=>q.edgeId))||!eq(p.dependencyIds,r.dependencyIds)||
    !unresolved(r.actualReliefState)||!unresolved(r.actualReceptionState)||!unresolved(r.sourceApplicability))return empty('route-binding');
   seenRoutes.add(id);routeRows.push({pathId:id,legIds:[...p.requiredLegIds],dependencyIds:[...p.dependencyIds],proof,actualReliefState:'unresolved'});
  }
  const controlClause=a.kind==='control'?m.clauses.find(q=>q.directInjuryPropositionId):null;
  const observedCandidates=controlClause?.interpositionCandidates??[];
  if(!Array.isArray(observedCandidates)||!j.interpositionPathIds.every(id=>observedCandidates.some(q=>q.pathId===id))||
   observedCandidates.some(q=>!unresolved(q.actualReliefState)))return empty('candidate-inventory');
  let sensitivity=null;
  if(!!c!==!!(j.combinationPairIds.length||j.exposedRootIds.length))return empty('contact-coverage');
  if(c){
   const cg=graph(c.lossAllExposedActionScreen,scope),p=describe(cg,c.lossAllExposedActionScreen.propositionId,'contactConstraintSensitivity');
   if(!p||p.subject!==a.edgeId||p.kind!=='hypothetical-direct-root-and-pair-clearance'||p.state!==c.lossAllExposedActionScreen.state||
    c.originalEffectPropositionId!==effect.propositionId||!eq(c.pairIds,j.combinationPairIds)||!eq(c.exposedRootIds,j.exposedRootIds)||
    !eq(Object.keys(c.pairRestrictionAssumptions??{}),c.pairIds)||Object.values(c.pairRestrictionAssumptions).some(x=>!unresolved(x))||
    !unresolved(c.actualEffectState)||!unresolved(c.actualRestrictionState))return empty('contact-binding');
   seenContacts.add(a.edgeId);
   sensitivity={scope:'counterfactual-all-exposed-substantial-roots-lost',proof:p,pairIds:c.pairIds,exposedRootIds:c.exposedRootIds,
    sourceSurvivingRootIds:c.sourceSurvivingRootIds,actualRestrictionState:'unresolved'};
  }
  // Orthogonal results, not a vote or an effectiveness ranking.
  const supportedKinds=[...(direct.state==='supported'?[direct.kind]:[]),...(combined.state==='supported'?[combined.kind]:[]),
   ...routeRows.filter(r=>r.proof.state==='supported').map(r=>r.proof.kind)];
  const disposition=!complete?'partial':combined.state==='supported'?'joint-screen-supported':direct.state==='supported'?'direct-tendency-supported':'no-consequence-support';
  result.push({edgeId:a.edgeId,from:a.from,to:a.to,kind:a.kind,structural,clauses,direct,combined,objective,
   constraints:{pairIds:j.combinationPairIds,exposedRootIds:j.exposedRootIds,counterfactual:sensitivity},
   interposition:{observedCandidateIds:observedCandidates.map(q=>q.pathId),visibleRoutes:routeRows,
    unassessedCandidateIds:observedCandidates.filter(q=>!seenRoutes.has(q.pathId)).map(q=>q.pathId),actualReliefState:'unresolved'},
   disposition,supportedKinds:[...new Set(supportedKinds)],actualEffect:effect,actualReceptionState:'unresolved',actualBenefitState:'unresolved',
   selectionAuthority:false,effective:null});
 }
 if(seenRoutes.size!==routes.size||seenContacts.size!==cc.size)return empty('unbound-review');
 const summary={actions:result.length,directSupported:result.filter(a=>a.direct.state==='supported').length,
  combinedSupported:result.filter(a=>a.combined.state==='supported').length,
  withSupportedRoute:result.filter(a=>a.interposition.visibleRoutes.some(r=>r.proof.state==='supported')).length,
  withDirectionFit:result.filter(a=>a.objective?.fit.state==='supported').length,
  actualEffectsConfirmed:0};
 return {...base,status,reason:null,actions:result,summary,limitations:['orthogonal-hypotheses-not-net-effect','direction-fit-not-benefit','counterfactual-not-observed-clearance','route-not-relief','no-selection-authority']};
}
