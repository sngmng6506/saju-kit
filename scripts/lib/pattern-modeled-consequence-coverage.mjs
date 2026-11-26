import {reviewInteractionScenarios} from '../../src/features/pattern/outcome-interaction-scenarios.js';
import {reviewInteractionDependencies} from '../../src/features/pattern/outcome-interaction-dependencies.js';
import {reviewGenerationSynthesis} from '../../src/features/pattern/outcome-generation-synthesis.js';
import {reviewControlSynthesis} from '../../src/features/pattern/outcome-control-synthesis.js';
import {analyzeStemForceEvidence} from '../../src/core/stem-force.js';
import {observeRelativeForce} from '../../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../../src/core/formation-evidence.js';
import {observeRootContext} from '../../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../../src/features/pattern/outcome-grounded-supply.js';
import {observeInterpositionReview} from '../../src/features/pattern/outcome-interposition-review.js';
import {observePressureDependencyReview} from '../../src/features/pattern/outcome-pressure-dependency.js';
import {observeLocalityContext} from '../../src/features/pattern/outcome-locality-context.js';
import {observeArgumentReview} from '../../src/features/pattern/outcome-argument-review.js';
import {reviewSourceEffectPolicy} from '../../src/features/pattern/outcome-source-effect-policy.js';
import {observeCombinationContext} from '../../src/features/pattern/outcome-combination-context.js';
import {observeCombinationResidualContext} from '../../src/features/pattern/outcome-combination-residual.js';
import {observeClashResidualContext} from '../../src/features/pattern/outcome-clash-residual.js';
import {reviewInterpositionPolicy} from '../../src/features/pattern/outcome-interposition-policy.js';
import {reviewCombinationPolicy} from '../../src/features/pattern/outcome-combination-policy.js';
import {reviewClashPolicy} from '../../src/features/pattern/outcome-clash-policy.js';
import {reviewJointConstraints} from '../../src/features/pattern/outcome-joint-constraints.js';
import {reviewElementContexts} from '../../src/features/pattern/outcome-element-context.js';
import {reviewContactConstraintSensitivity} from '../../src/features/pattern/outcome-contact-constraint-sensitivity.js';
import {synthesizeActionReview} from '../../src/features/pattern/outcome-action-synthesis.js';
import {reviewDayBalanceDirection} from '../../src/features/pattern/outcome-day-balance-direction.js';
import {reviewModeledConsequences} from '../../src/features/pattern/outcome-modeled-consequences.js';
// Synthetic literal-pillar controls, not calendar-verified births or
// independent classical labels. Each contrast changes one pillar.
export const controls=Object.freeze([
 {id:'release',pillars:['임자','임자','갑자','갑자'],kind:'modeled-source-release',expected:'supported'},
 {id:'injury',pillars:['임자','임자','병자','임자'],kind:'modeled-target-injury',expected:'supported'},
 {id:'release-contested-root',pillars:['임자','임자','갑오','갑자'],kind:'modeled-source-release',expected:'unresolved'},
 {id:'injury-interposition',pillars:['임자','임자','병자','무자'],kind:'modeled-target-injury',expected:'unresolved'},
 {id:'resource-backed-release',pillars:['기축','신유','계해','신유'],kind:'modeled-source-release',expected:'supported',expectedModel:'supported'},
 {id:'resource-basis-removed',pillars:['기유','신유','계해','신유'],kind:'modeled-source-release',expected:'unresolved',expectedModel:'unresolved'},
 {id:'resource-with-rooted-controller',pillars:['기축','신유','계해','병오'],kind:'modeled-source-release',expected:'unresolved',expectedModel:'unresolved'}
].map(c=>Object.freeze({...c,pillars:Object.freeze(c.pillars)})));
export const routeControls=Object.freeze([
 {id:'mediation-supported',pillars:['기축','경신','임자','기축'],route:['mediation','month:stem','year:stem','day:stem'],expectedRoute:'supported'},
 {id:'mediation-root-loss',pillars:['기축','경오','임자','기축'],route:['mediation','month:stem','year:stem','day:stem'],expectedRoute:'unresolved'},
 {id:'protection-supported',pillars:['을묘','기묘','계묘','기미'],route:['protection','year:stem','month:stem','day:stem'],expectedRoute:'supported'},
 {id:'protection-helper-pressure',pillars:['을묘','기묘','계묘','기축'],route:['protection','year:stem','month:stem','day:stem'],expectedRoute:'unresolved'}
].map(c=>Object.freeze({...c,pillars:Object.freeze(c.pillars),route:Object.freeze(c.route)})));
// Test-only composition of production core/review owners. No calendar,
// strength projection, candidate decisions or V10 wrapper are exercised.
// Optional explicit direction hypothesis is a test assumption, not a projection.
export function replayModeledCoverage(pillars,completeHour,{strengthHypothesis=null,includeSynthesisInputs=false}={}){
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!completeHour&&i===3?null:{stem:pillars[i][0],branch:pillars[i][1],text:pillars[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour,stemForce,relativeForce:observeRelativeForce(stemForce)};
 const formation=analyzeFormationEvidence({saju}),root=observeRootContext(prior,formation),supply=observeGroundedSupply(prior,root);
 const interposition=observeInterpositionReview(prior,root,supply),pressure=observePressureDependencyReview(prior,root,supply,interposition);
 const locality=observeLocalityContext(prior,supply,interposition,pressure),argument=observeArgumentReview(prior,supply,pressure,locality);
 const source=reviewSourceEffectPolicy(prior,argument,supply,strengthHypothesis),combination=observeCombinationContext(prior,formation);
 const combinationResidual=observeCombinationResidualContext(prior,formation,combination,root,supply),clashResidual=observeClashResidualContext(prior,formation,root,supply);
 const ip=reviewInterpositionPolicy(prior,supply,interposition,pressure,argument),cp=reviewCombinationPolicy(prior,combinationResidual,supply,argument),cl=reviewClashPolicy(prior,clashResidual,supply,argument);
 const joint=reviewJointConstraints(prior,supply,argument,source,ip,cp,cl),element=reviewElementContexts(prior,root,supply,source);
 const contact=reviewContactConstraintSensitivity(prior,root,supply,cp,cl,joint);
 const modeled=reviewModeledConsequences(prior,supply,argument,pressure,joint,element);
 const day=reviewDayBalanceDirection(prior,argument,joint,strengthHypothesis);
 const synthesis=synthesizeActionReview(prior,argument,source,element,day,joint,modeled,contact);
 const controlSynthesis=reviewControlSynthesis(prior,root,pressure,argument,modeled,synthesis);
 const generationSynthesis=reviewGenerationSynthesis(prior,root,supply,argument,modeled,synthesis);
 const interactionDependencies=reviewInteractionDependencies(prior,root,supply,pressure,argument,joint,modeled,synthesis,generationSynthesis,controlSynthesis);
 const interactionScenarios=reviewInteractionScenarios(prior,root,pressure,argument,interactionDependencies);
 const expected=completeHour?'diagnostic':'partial';
 const invalid=Object.entries({root,supply,interposition,pressure,locality,argument,source,combination,combinationResidual,clashResidual,ip,cp,cl,joint,element,modeled,contact,day,synthesis,controlSynthesis,generationSynthesis,interactionDependencies,interactionScenarios})
  .filter(([,r])=>r.status!==expected).map(([owner,r])=>({owner,status:r.status,reason:r.reason??null}));
 const judgments=new Map(modeled.judgments.map(j=>[j.id,j.state]));
 const rows=modeled.actions.flatMap(a=>a.clauses.filter(c=>c.propositionId!==null).map(c=>{
  const modelState=judgments.get(c.modelPropositionId)??null,structuralState=judgments.get(c.structuralPropositionId)??null;
  const blockers=[...(modelState!=='supported'?['element-model']:[]),...(structuralState!=='supported'?['structural-screen']:[]),
   ...c.conditions.filter(q=>q.value!==true).map(q=>q.name)];
  const p=element.elements.find(e=>e.element===JSON.parse(c.modelPropositionId)[1]);
  return {edgeId:a.edgeId,clauseId:c.clauseId,kind:c.kind,state:c.state,modelState,structuralState,blockers,
   element:p?.element??null,axes:p?.axes??null,directInjuryState:c.directInjuryState??null,residualInjuryState:c.residualInjuryState??null,
   interpositionCandidates:c.interpositionCandidates??[],
   directReleaseState:c.directReleaseState??null,jointReleaseScreenState:c.jointReleaseScreenState??null,
   sourceScreen:c.sourceScreen??null,targetPressureScreenState:c.targetPressureScreenState??null,actualReceptionState:c.actualReceptionState??null,
   modelSupportRuleIds:p?.model.judgments.find(j=>j.id===JSON.parse(c.modelPropositionId)[2])?.support.witnesses.filter(w=>w.kind==='rule').map(w=>w.id)??[],
   resourceWitnesses:p?.resourceWitnesses??[],monthPrincipalRootIds:p?.monthPrincipalRootIds??[]};
 }));
 return {invalid,rows,contact,synthesis,controlSynthesis,generationSynthesis,interactionDependencies,interactionScenarios,...(includeSynthesisInputs?{synthesisInputs:[prior,argument,source,element,day,joint,modeled,contact],controlSynthesisInputs:[prior,root,pressure,argument,modeled,synthesis],generationSynthesisInputs:[prior,root,supply,argument,modeled,synthesis],interactionDependencyInputs:[prior,root,supply,pressure,argument,joint,modeled,synthesis,generationSynthesis,controlSynthesis],interactionScenarioInputs:[prior,root,pressure,argument,interactionDependencies]}:{}),interpositionRoutes:modeled.interpositionRoutes,actionCount:modeled.actions.length,actualEffectPromoted:modeled.judgments.some(j=>j.level==='effect-hypothesis'&&j.state!=='unresolved')};
}
export function summarizeModeledCoverage(rows){
 const blockers={},singleBlockers={},families={};
 for(const r of rows){
  const f=families[r.kind]??={eligible:0,supported:0,modelSupported:0,structureSupported:0,bothSupported:0};
  f.eligible++;if(r.state==='supported')f.supported++;
  if(r.modelState==='supported')f.modelSupported++;if(r.structuralState==='supported')f.structureSupported++;
  if(r.modelState==='supported'&&r.structuralState==='supported')f.bothSupported++;
  for(const k of new Set(r.blockers))blockers[k]=(blockers[k]??0)+1;
  if(r.blockers.length===1)singleBlockers[r.blockers[0]]=(singleBlockers[r.blockers[0]]??0)+1;
 }
 return {eligible:rows.length,directReleaseSupported:rows.filter(r=>r.directReleaseState==='supported').length,
  directReleaseSupportedJointUnresolved:rows.filter(r=>r.directReleaseState==='supported'&&r.jointReleaseScreenState==='unresolved').length,directInjurySupported:rows.filter(r=>r.directInjuryState==='supported').length,
  directSupportedResidualUnresolved:rows.filter(r=>r.directInjuryState==='supported'&&r.residualInjuryState==='unresolved').length,supported:rows.filter(r=>r.state==='supported').length,
  unresolved:rows.filter(r=>r.state==='unresolved').length,modelSupported:rows.filter(r=>r.modelState==='supported').length,
  structureSupported:rows.filter(r=>r.structuralState==='supported').length,bothSupported:rows.filter(r=>r.modelState==='supported'&&r.structuralState==='supported').length,
  blockers,singleBlockers,families};
}
