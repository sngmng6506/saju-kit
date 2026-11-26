import {readFileSync} from 'node:fs';
import {controls,routeControls,replayModeledCoverage,summarizeModeledCoverage} from './lib/pattern-modeled-consequence-coverage.mjs';
const packets=['pattern-outcome-role-policy-source-v1','pattern-modeled-consequence-source-contrast-v1'];
const cases=packets.flatMap(name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8')).cases.map(c=>({...c,packet:name})));
const results=[],errors=[];
for(const c of [...cases,...controls,...routeControls])for(const completeHour of [true,false]){
 const routeControl=Object.hasOwn(c,'expectedRoute'),synthetic=Object.hasOwn(c,'expected')||routeControl,scope=completeHour?'complete':'partial';
 try{
  const r=replayModeledCoverage(c.pillars,completeHour);
  const exact=r.rows.find(a=>a.edgeId===(synthetic?'visible:month>visible:day':c.edgeId)&&
   (synthetic?a.kind===c.kind:a.clauseId===c.clauseId));
  const fail=reason=>errors.push({id:c.id,scope,reason});
  if(r.invalid.length)fail('invalid-contract');
  if(r.actualEffectPromoted)fail('actual-effect-promotion');
  if(r.synthesis.status!==(completeHour?'diagnostic':'partial')||r.synthesis.actions.length!==r.actionCount||
   r.synthesis.actions.some(a=>a.actualEffect.state!=='unresolved'||a.actualBenefitState!=='unresolved'||a.actualReceptionState!=='unresolved'||
    a.selectionAuthority!==false||a.effective!==null||!completeHour&&(a.disposition!=='partial'||a.supportedKinds.length)||
    a.combined.state==='supported'&&a.direct.state!=='supported'))fail('synthesis-authority-invariant');
  if(r.rows.some(q=>{const a=r.synthesis.actions.find(a=>a.edgeId===q.edgeId);return !a||a.combined.state!==q.state||
   a.direct.state!==(q.kind==='modeled-source-release'?q.directReleaseState:q.directInjuryState);}))fail('synthesis-projection-parity');
  if(r.contact.occurrences.some(o=>o.actualRootLossState!=='unresolved'||o.actualRootPreservationState!=='unresolved'||o.actualCapacityState!=='unresolved'||!completeHour&&o.lossAllExposedScenario.state!=='unresolved')||
   r.contact.pairs.some(p=>p.actualRestrictionState!=='unresolved'||p.actualRetentionState!=='unresolved'||p.actualTransformationState!=='unresolved')||
   r.contact.actions.some(a=>a.actualRestrictionState!=='unresolved'||a.actualEffectState!=='unresolved'||!completeHour&&a.lossAllExposedActionScreen.state!=='unresolved'||Object.values(a.pairRestrictionAssumptions).some(s=>s!=='unresolved'))||
   r.contact.reliefs.some(r=>r.actualReliefState!=='unresolved'||r.actualRestorationState!=='unresolved'))fail('contact-authority-invariant');
  if(!completeHour&&r.rows.some(q=>q.state!=='unresolved'||q.directInjuryState!==null&&q.directInjuryState!=='unresolved'))fail('partial-promotion');
  if(r.rows.some(q=>q.interpositionCandidates.some(p=>p.actualReliefState!=='unresolved')))fail('relief-promotion');
  if(r.rows.some(q=>q.kind==='modeled-source-release'&&(q.actualReceptionState!=='unresolved'||!completeHour&&q.directReleaseState!=='unresolved'||q.state==='supported'&&q.directReleaseState!=='supported')))fail('release-scope-invariant');
  if(r.rows.some(q=>q.kind==='modeled-target-injury'&&q.state==='supported'&&(q.directInjuryState!=='supported'||q.interpositionCandidates.length)))fail('residual-without-direct-and-clear-scope');
  if(synthetic&&c.kind==='modeled-target-injury'&&exact?.directInjuryState!==(completeHour?'supported':'unresolved'))fail('direct-control-mismatch');
  if(synthetic&&!routeControl&&exact?.state!==(completeHour?c.expected:'unresolved'))fail('synthetic-control-mismatch');
  if(synthetic&&c.expectedModel&&exact?.modelState!==(completeHour?c.expectedModel:'unresolved'))fail('synthetic-model-mismatch');
  if(routeControl&&r.interpositionRoutes.find(q=>q.pathId===JSON.stringify(c.route))?.state!==(completeHour?c.expectedRoute:'unresolved'))fail('route-control-mismatch');
  if(r.interpositionRoutes.some(q=>q.actualReliefState!=='unresolved'||q.actualReceptionState!=='unresolved'||q.sourceApplicability!=='unresolved'||!completeHour&&q.state!=='unresolved'||q.state==='supported'&&q.missingPremiseIds.length))fail('route-scope-invariant');
  if(c.edgeId&&!exact)fail('missing-source-contrast');
  if(c.label==='explicit-opposition'&&exact?.state==='supported')fail('source-opposition-contradicted');
  results.push({id:c.id,scope,synthetic,packet:c.packet??null,label:c.label??null,expected:synthetic?(completeHour?c.expected:'unresolved'):null,
   exact:exact??null,...r});
 }catch(e){errors.push({id:c.id,scope,reason:e.message});}
}
const historical=results.filter(r=>!r.synthetic&&r.scope==='complete');
const coverage=summarizeModeledCoverage(historical.flatMap(r=>r.rows));
const chartSupported=historical.filter(r=>r.rows.some(q=>q.state==='supported')).length;
const synthesisCoverage=Object.fromEntries(['actions','directSupported','combinedSupported','withSupportedRoute','withDirectionFit','actualEffectsConfirmed']
 .map(k=>[k,historical.reduce((n,r)=>n+r.synthesis.summary[k],0)]));
const exposedOccurrences=historical.flatMap(r=>r.contact.occurrences).filter(o=>o.exposedSubstantialRootIds.length>0);
const contactActions=historical.flatMap(r=>r.contact.actions),contactPairs=historical.flatMap(r=>r.contact.pairs);
const countStates=(rows,read)=>Object.fromEntries(['supported','opposed','conflicting','unresolved'].map(state=>[state,rows.filter(r=>read(r)===state).length]));
const contactCoverage={exposedOccurrences:exposedOccurrences.length,remainingRootBasis:countStates(exposedOccurrences,o=>o.lossAllExposedScenario.state),
 affectedActions:contactActions.length,hypotheticalRootAndPairScreen:countStates(contactActions,a=>a.lossAllExposedActionScreen.state),
 pairCount:contactPairs.length,selfScopeCount:contactPairs.filter(p=>p.externalRemovalScope==='outside-external-removal-scope').length,
 reliefCandidateCount:historical.flatMap(r=>r.contact.reliefs).length};
// A zero-coverage model is operationally valid but not ready for additional
// effect authority. Do not tune thresholds merely to pass this gate.
const readiness=errors.length?'invalid':coverage.supported===0?'blocked-zero-coverage':'coverage-observed-not-validated';
console.log(JSON.stringify({version:'modeled-coverage-v1',scope:'production-core-replay-not-public-v10-or-empirical-validation',
 cases:cases.length,syntheticControls:controls.length+routeControls.length,replays:results.length,chartSupported,coverage,contactCoverage,synthesisCoverage,routeCoverage:{eligible:historical.flatMap(r=>r.interpositionRoutes).length,supported:historical.flatMap(r=>r.interpositionRoutes).filter(q=>q.state==='supported').length},readiness,errors,results},null,2));
if(errors.length||process.argv.includes('--require-coverage')&&readiness!=='coverage-observed-not-validated')process.exitCode=1;
