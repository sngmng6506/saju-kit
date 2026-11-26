import {evaluateArguments} from './outcome-argumentation.js';
import {diagnoseControlContrast} from './outcome-pressure-dependency.js';
import {buildSharedForceBasis,compareSharedForceBasis} from './outcome-shared-force-basis.js';
import {elementRelation} from '../../core/elements.js';
export const CONTROL_SYNTHESIS_VERSION='p1-relative-control-synthesis-v1';
const key=(...xs)=>JSON.stringify(xs);
const same=(a,b)=>key(a)===key(b);
const eq=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const signed=['supported','opposed','conflicting','unresolved'];
const left='left-evidence-dominates';
const replay=(owner,scope)=>{
 if(!owner||![owner.propositions,owner.evidence,owner.rules,owner.judgments,owner.ruleResults].every(Array.isArray))return null;
 const r=evaluateArguments({scope,propositions:owner.propositions,evidence:owner.evidence,rules:owner.rules});
 if(r.status!==(scope==='complete'?'diagnostic':'partial')||!same(r.judgments,owner.judgments)||!same(r.ruleResults,owner.ruleResults))return null;
 return index(r.judgments,j=>j.id);
};
// Composition of model-scoped propositions only. A positive conjunction
// does not establish actual injury; neither a contrary order nor a route
// candidate proves control ineffective. Counterfactual contact and route
// outcomes are deliberately not used as clearance premises.
export function reviewControlSynthesis(prior,root,pressure,argument,modeled,synthesis){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial',scope=complete?'complete':'partial';
 const base={version:CONTROL_SYNTHESIS_VERSION,completeHour:complete,selectionAuthority:false,effective:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,actions:[],propositions:[],evidence:[],rules:[],judgments:[],ruleResults:[],summary:null});
 if(typeof complete!=='boolean'||[root,pressure,argument,modeled,synthesis].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  root.rootEffectConfirmed!==null||[pressure,argument,modeled,synthesis].some(x=>x.effective!==null))return empty('upstream');
 const ag=replay(argument,scope),mg=replay(modeled,scope),actors=index(prior.stemForce?.occurrences,a=>a.id),rr=index(root.occurrences,a=>a.id),
  pairs=index(root.comparisons,p=>key(p.left,p.right)),pressures=index(pressure.pressures,p=>p.id),aa=index(argument.actions,a=>a.edgeId),
  mm=index(modeled.actions,a=>a.edgeId),ss=index(synthesis.actions,a=>a.edgeId),routes=index(modeled.interpositionRoutes,r=>r.pathId);
 if([ag,mg,actors,rr,pairs,pressures,aa,mm,ss,routes].some(x=>!x)||!eq([...aa.keys()],[...ss.keys()])||!eq([...aa.keys()],[...mm.keys()])||
  [...ag].some(([id,j])=>!same(j,mg.get(id))))return empty('inventory-or-proof');
 const visible=[...actors.values()].filter(a=>a.layer==='visible');
 const expected=visible.flatMap(a=>visible.filter(b=>a.id!==b.id&&elementRelation(a.element,b.element).direction==='left-to-right').map(b=>({id:a.id+'>'+b.id,kind:elementRelation(a.element,b.element).type})));
 if(!eq([...aa.keys()],expected.map(a=>a.id))||expected.some(e=>aa.get(e.id).kind!==e.kind))return empty('action-coverage');
 const basis=buildSharedForceBasis(prior,root);
 if(basis.status!==status||!same(basis,pressure.sharedForceBasis))return empty('basis-replay');
 const props=[],facts=[],rules=[],rows=[],seen=new Set(),seenRoutes=new Set();
 const readProof=(g,p,owner,kind,subject)=>{
  const j=g.get(p?.propositionId);
  return !!j&&p.owner===owner&&p.kind===kind&&p.subject===subject&&p.level===j.level&&j.kind===kind&&j.subject===subject&&p.state===j.state&&
   same(p.proof,{support:j.support,opposition:j.opposition});
 };
 for(const a of aa.values()){
  if(a.kind!=='control')continue;
  const from=actors.get(a.from),to=actors.get(a.to),m=mm.get(a.edgeId),s=ss.get(a.edgeId),p=pressures.get(key(from.graphNodeId,to.graphNodeId));
  if(!p||p.controllerNodeId!==from.graphNodeId||p.targetNodeId!==to.graphNodeId||p.effective!==null||p.neutralizationConfirmed!==null||
   !s||s.kind!=='control'||s.from!==a.from||s.to!==a.to||s.selectionAuthority!==false||s.effective!==null||
   m.kind!=='control'||m.from!==a.from||m.to!==a.to||m.actualEffectState!=='unresolved'||s.actualEffect?.state!=='unresolved'||
   s.actualReceptionState!=='unresolved'||s.actualBenefitState!=='unresolved'||s.actualEffect?.propositionId!==a.effectPropositionId)return empty('edge-binding');
  const forward=pairs.get(key(a.from,a.to)),reverse=pairs.get(key(a.to,a.from)),pair=forward??reverse;
  if(!pair||forward&&reverse||seen.has(p.id))return empty('pair-identity');
  seen.add(p.id);
  const diagnostic=diagnoseControlContrast({completeHour:complete,originalLeft:prior.relativeForce.profiles[a.from]?.axes,
   originalRight:prior.relativeForce.profiles[a.to]?.axes,sensitivityLeft:rr.get(a.from)?.sensitivityAxes,sensitivityRight:rr.get(a.to)?.sensitivityAxes,
   pair,reversed:!forward,pressureId:p.id});
  if(!diagnostic||diagnostic.contrast!==p.contrast)return empty('contrast');
  const shared=compareSharedForceBasis(basis,a.from,a.to);
  if(![status,'unavailable'].includes(shared.status)||!same({...diagnostic,sharedBasis:shared},p.comparisonDiagnostics))return empty('diagnostic-replay');
  const clause=m.clauses?.filter(q=>q.directInjuryPropositionId);
  if(clause?.length!==1)return empty('injury-clause');
  const c=clause[0],subject=key(a.edgeId,c.clauseId);
  if(!readProof(ag,s.structural,'argumentReview','stable-source-profile-dominance',a.edgeId)||
   s.structural.propositionId!==a.structuralPropositionId||!readProof(ag,s.actualEffect,'argumentReview','actual-action-effective',a.edgeId)||
   !readProof(mg,s.direct,'modeledConsequenceReview','modeled-direct-injury-tendency',subject)||
   !readProof(mg,s.combined,'modeledConsequenceReview','modeled-target-injury',subject)||
   s.direct.propositionId!==c.directInjuryPropositionId||s.combined.propositionId!==c.propositionId||
   !Array.isArray(s.interposition?.visibleRoutes)||!Array.isArray(s.interposition.observedCandidateIds)||
   !eq(s.interposition.observedCandidateIds,p.candidatePathIds)||s.interposition.actualReliefState!=='unresolved')return empty('proof-binding');
  const make=(kind,level)=>{const id=key(a.edgeId,kind);props.push({id,kind,level,subject:a.edgeId});return id;};
  const observation=(kind,state,owner,id,field)=>{
   if(!signed.includes(state))throw Error('state');
   const prop=make(kind,'observation');
   if(complete)for(const sign of state==='conflicting'?['for','against']:state==='supported'?['for']:state==='opposed'?['against']:[])
    facts.push({id:key(prop,sign),propositionId:prop,sign,refs:[{owner,id,field}],applicability:'complete-only'});
   return prop;
  };
  // A signed report describes the exact existing model property, not
  // the actual action. Invariance is opposed when exhaustive abstract
  // assignments include a different order; budget/partial is unknown.
  const state=x=>x===null?'unresolved':x?'supported':'opposed';
  const available=shared.status==='diagnostic';
  const possible=observation('controller-profile-order-possible',state(available?shared.possibleRelations.includes(left):null),'pressureDependencyReview',p.id,'comparisonDiagnostics.sharedBasis.possibleRelations');
  const invariant=observation('controller-profile-order-invariant',state(available?shared.invariantRelation===left:null),'pressureDependencyReview',p.id,'comparisonDiagnostics.sharedBasis.invariantRelation');
  const stable=observation('stable-controller-profile-screen',s.structural.state,'argumentReview',s.structural.propositionId,'judgment');
  const direct=observation('direct-injury-model-screen',s.direct.state,'modeledConsequenceReview',s.direct.propositionId,'judgment');
  const residual=observation('residual-injury-model-screen',s.combined.state,'modeledConsequenceReview',s.combined.propositionId,'judgment');
  const sideReports=diagnostic.contextual.sides.map(q=>({side:q.side,propositionId:observation(q.side+'-season-order-challenge',q.challengeState,'pressureDependencyReview',q.challengePropositionId,'contextual.judgment')}));
  const routeReports=[];
  for(const q of s.interposition.visibleRoutes){
   const r=routes.get(q.pathId);
   if(!r||seenRoutes.has(q.pathId)||r.controlEdgeId!==a.edgeId||!p.candidatePathIds.includes(q.pathId)||
    !readProof(mg,q.proof,'modeledConsequenceReview',r.kind,key('interposition-operation',q.pathId))||
    q.proof.propositionId!==r.propositionId||q.actualReliefState!=='unresolved'||r.actualReliefState!=='unresolved')return empty('route-binding');
   seenRoutes.add(q.pathId);
   routeReports.push({pathId:q.pathId,propositionId:observation('route-model-screen:'+q.pathId,q.proof.state,'modeledConsequenceReview',q.proof.propositionId,'judgment'),actualReliefState:'unresolved'});
  }
  if(!eq(s.interposition.visibleRoutes.map(q=>q.pathId),[...routes.values()].filter(q=>q.controlEdgeId===a.edgeId).map(q=>q.pathId)))return empty('route-coverage');
  const contact=s.constraints?.counterfactual;
  if(!Array.isArray(s.constraints?.pairIds)||!Array.isArray(s.constraints?.exposedRootIds)||
   !!contact!==!!(s.constraints.pairIds.length||s.constraints.exposedRootIds.length)||contact&&contact.actualRestrictionState!=='unresolved')return empty('contact-scope');
  const conjunction=(kind,premises)=>{
   const id=make(kind,'structural-hypothesis');
   rules.push({id:key(id,'for'),policyId:CONTROL_SYNTHESIS_VERSION,conclusion:{propositionId:id,sign:'for'},
    premises:premises.map(propositionId=>({propositionId,sign:'for'})),refs:[{owner:'control-synthesis-policy',id:CONTROL_SYNTHESIS_VERSION,field:kind}],applicability:'complete-only'});
   return id;
  };
  const directContext=conjunction('direct-injury-with-invariant-profile-order',[stable,invariant,direct]);
  const residualContext=conjunction('residual-injury-with-invariant-profile-order',[directContext,residual]);
  const actual=make('actual-control-synthesis','effect-hypothesis');
  rows.push({edgeId:a.edgeId,pressureId:p.id,from:a.from,to:a.to,possiblePropositionId:possible,invariantPropositionId:invariant,
   directContextPropositionId:directContext,residualContextPropositionId:residualContext,actualPropositionId:actual,
   sideReports,routeReports,observedCandidateIds:[...s.interposition.observedCandidateIds],
   unassessedCandidateIds:s.interposition.observedCandidateIds.filter(id=>!routeReports.some(q=>q.pathId===id)),
   contact:contact?{scope:contact.scope,proof:contact.proof,actualRestrictionState:'unresolved'}:null,
   originalEffectPropositionId:a.effectPropositionId,actualControlState:'unresolved',actualReliefState:'unresolved',selectionAuthority:false,effective:null});
 }
 const expectedControls=expected.filter(a=>a.kind==='control');
 if(rows.length!==expectedControls.length||seenRoutes.size!==routes.size||
  !eq([...seen],[...pressures.values()].filter(p=>p.controllerNodeId.endsWith(':stem')&&p.targetNodeId.endsWith(':stem')).map(p=>p.id)))return empty('control-coverage');
 const r=evaluateArguments({scope,propositions:props,evidence:facts,rules});
 if(r.status!==status)return empty('argument-evaluation');
 const js=index(r.judgments,j=>j.id);
 const actions=rows.map(q=>({...q,possibleState:js.get(q.possiblePropositionId).state,invariantState:js.get(q.invariantPropositionId).state,
  directContextState:js.get(q.directContextPropositionId).state,residualContextState:js.get(q.residualContextPropositionId).state}));
 if(actions.some(q=>js.get(q.actualPropositionId).state!=='unresolved'||!complete&&(q.possibleState!=='unresolved'||q.invariantState!=='unresolved'||q.directContextState!=='unresolved'||q.residualContextState!=='unresolved')))return empty('authority');
 const summary={controls:actions.length,possible:actions.filter(q=>q.possibleState==='supported').length,invariant:actions.filter(q=>q.invariantState==='supported').length,
  directContext:actions.filter(q=>q.directContextState==='supported').length,residualContext:actions.filter(q=>q.residualContextState==='supported').length,actualControlConfirmed:0};
 return {...base,status,reason:null,actions,summary,propositions:props,evidence:facts,rules,judgments:r.judgments,ruleResults:r.ruleResults,
  limitations:['profile-order-not-force','model-conjunction-not-actual-injury','counterfactual-not-clearance','route-not-relief','no-selection-authority']};
}
