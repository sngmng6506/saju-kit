import {inspectActionDiagnostics} from '../../src/features/pattern/outcome-action-diagnostic-contract.js';
import {buildActionDiagnostics} from '../../src/features/pattern/outcome-action-diagnostics.js';
import {analyzeStemForceEvidence} from '../../src/core/stem-force.js';
import {observeRelativeForce} from '../../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../../src/core/formation-evidence.js';
import {observeCombinationContext} from '../../src/features/pattern/outcome-combination-context.js';
export {controls,routeControls} from './pattern-action-controls.mjs';
// Test-only composition of production core/review owners. No calendar,
// strength projection, candidate decisions or V10 wrapper are exercised.
// Optional explicit direction hypothesis is a test assumption, not a projection.
export function replayModeledCoverage(pillars,completeHour,{strengthHypothesis=null,includeSynthesisInputs=false}={}){
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!completeHour&&i===3?null:{stem:pillars[i][0],branch:pillars[i][1],text:pillars[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour,stemForce,relativeForce:observeRelativeForce(stemForce)};
 const formation=analyzeFormationEvidence({saju}),combination=observeCombinationContext(prior,formation);
 const diagnosticFields=buildActionDiagnostics(prior,formation,combination,strengthHypothesis);
 const {rootContext:root,groundedSupply:supply,clashResidualContext:clashResidual,combinationResidualContext:combinationResidual,interpositionReview:interposition,pressureDependencyReview:pressure,localityContext:locality,argumentReview:argument,sourceEffectReview:source,combinationPolicyReview:cp,clashPolicyReview:cl,interpositionPolicyReview:ip,jointConstraintReview:joint,dayBalanceDirectionReview:day,elementContextReview:element,contactConstraintSensitivity:contact,modeledConsequenceReview:modeled,actionSynthesis:synthesis,controlSynthesis,generationSynthesis,interactionDependencies,interactionScenarios,interactionProofs,conditionalJoint,replenishmentReview,burdenReview,strengthSynthesis}=diagnosticFields;
 const expected=completeHour?'diagnostic':'partial';
 const invalid=inspectActionDiagnostics(diagnosticFields,completeHour);
 if(combination.status!==expected)invalid.unshift({owner:'combinationContext',status:combination.status,reason:combination.reason??'unexpected-status'});
 // Preserve upstream diagnostic failures even if a downstream report
 // cannot be projected. A projection exception is itself a failure.
 let rows=[];
 try{
  if(!Array.isArray(modeled?.judgments)||!Array.isArray(modeled?.actions))throw Error('modeled-inventory');
 const judgments=new Map((modeled?.judgments??[]).map(j=>[j.id,j.state]));
 rows=(modeled?.actions??[]).flatMap(a=>a.clauses.filter(c=>c.propositionId!==null).map(c=>{
  const modelState=judgments.get(c.modelPropositionId)??null,structuralState=judgments.get(c.structuralPropositionId)??null;
  const blockers=[...(modelState!=='supported'?['element-model']:[]),...(structuralState!=='supported'?['structural-screen']:[]),
   ...c.conditions.filter(q=>q.value!==true).map(q=>q.name)];
  const p=element?.elements?.find(e=>e.element===JSON.parse(c.modelPropositionId)[1]);
  return {edgeId:a.edgeId,clauseId:c.clauseId,kind:c.kind,state:c.state,modelState,structuralState,blockers,
   element:p?.element??null,axes:p?.axes??null,directInjuryState:c.directInjuryState??null,residualInjuryState:c.residualInjuryState??null,
   interpositionCandidates:c.interpositionCandidates??[],
   directReleaseState:c.directReleaseState??null,jointReleaseScreenState:c.jointReleaseScreenState??null,
   sourceScreen:c.sourceScreen??null,targetPressureScreenState:c.targetPressureScreenState??null,actualReceptionState:c.actualReceptionState??null,
   modelSupportRuleIds:p?.model.judgments.find(j=>j.id===JSON.parse(c.modelPropositionId)[2])?.support.witnesses.filter(w=>w.kind==='rule').map(w=>w.id)??[],
   resourceWitnesses:p?.resourceWitnesses??[],monthPrincipalRootIds:p?.monthPrincipalRootIds??[]};
 }));
 }catch(e){
  invalid.push({owner:'modeledConsequenceReview.projection',status:'invalid-evidence',reason:e instanceof Error?e.message:String(e)});
 }
 return {invalid,rows,contact,synthesis,controlSynthesis,generationSynthesis,interactionDependencies,interactionScenarios,interactionProofs,conditionalJoint,replenishmentReview,burdenReview,strengthSynthesis,diagnosticFields,...(includeSynthesisInputs?{synthesisInputs:[prior,argument,source,element,day,joint,modeled,contact],controlSynthesisInputs:[prior,root,pressure,argument,modeled,synthesis],generationSynthesisInputs:[prior,root,supply,argument,modeled,synthesis],interactionDependencyInputs:[prior,root,supply,pressure,argument,joint,modeled,synthesis,generationSynthesis,controlSynthesis],interactionScenarioInputs:[prior,root,pressure,argument,interactionDependencies],interactionProofInputs:[prior,joint,modeled,generationSynthesis,controlSynthesis],conditionalJointInputs:[prior,joint],replenishmentInputs:[prior,root,supply],burdenInputs:[prior,replenishmentReview],strengthSynthesisInput:{completeHour,nodes:replenishmentReview.nodes,targets:replenishmentReview.targets,burden:burdenReview.analysis}}:{}),interpositionRoutes:Array.isArray(modeled?.interpositionRoutes)?modeled.interpositionRoutes:[],actionCount:Array.isArray(modeled?.actions)?modeled.actions.length:0,actualEffectPromoted:(Array.isArray(modeled?.judgments)?modeled.judgments:[]).some(j=>j.level==='effect-hypothesis'&&j.state!=='unresolved')};
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
