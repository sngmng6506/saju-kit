import {readFileSync} from 'node:fs';
import {controls,replayModeledCoverage,summarizeModeledCoverage} from './lib/pattern-modeled-consequence-coverage.mjs';
const packets=['pattern-outcome-role-policy-source-v1','pattern-modeled-consequence-source-contrast-v1'];
const cases=packets.flatMap(name=>JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8')).cases.map(c=>({...c,packet:name})));
const results=[],errors=[];
for(const c of [...cases,...controls])for(const completeHour of [true,false]){
 const synthetic=Object.hasOwn(c,'expected'),scope=completeHour?'complete':'partial';
 try{
  const r=replayModeledCoverage(c.pillars,completeHour);
  const exact=r.rows.find(a=>a.edgeId===(synthetic?'visible:month>visible:day':c.edgeId)&&
   (synthetic?a.kind===c.kind:a.clauseId===c.clauseId));
  const fail=reason=>errors.push({id:c.id,scope,reason});
  if(r.invalid.length)fail('invalid-contract');
  if(r.actualEffectPromoted)fail('actual-effect-promotion');
  if(!completeHour&&r.rows.some(q=>q.state!=='unresolved'||q.directInjuryState!==null&&q.directInjuryState!=='unresolved'))fail('partial-promotion');
  if(r.rows.some(q=>q.interpositionCandidates.some(p=>p.actualReliefState!=='unresolved')))fail('relief-promotion');
  if(r.rows.some(q=>q.kind==='modeled-source-release'&&(q.actualReceptionState!=='unresolved'||!completeHour&&q.directReleaseState!=='unresolved'||q.state==='supported'&&q.directReleaseState!=='supported')))fail('release-scope-invariant');
  if(r.rows.some(q=>q.kind==='modeled-target-injury'&&q.state==='supported'&&(q.directInjuryState!=='supported'||q.interpositionCandidates.length)))fail('residual-without-direct-and-clear-scope');
  if(synthetic&&c.kind==='modeled-target-injury'&&exact?.directInjuryState!==(completeHour?'supported':'unresolved'))fail('direct-control-mismatch');
  if(synthetic&&exact?.state!==(completeHour?c.expected:'unresolved'))fail('synthetic-control-mismatch');
  if(synthetic&&c.expectedModel&&exact?.modelState!==(completeHour?c.expectedModel:'unresolved'))fail('synthetic-model-mismatch');
  if(c.edgeId&&!exact)fail('missing-source-contrast');
  if(c.label==='explicit-opposition'&&exact?.state==='supported')fail('source-opposition-contradicted');
  results.push({id:c.id,scope,synthetic,packet:c.packet??null,label:c.label??null,expected:synthetic?(completeHour?c.expected:'unresolved'):null,
   exact:exact??null,...r});
 }catch(e){errors.push({id:c.id,scope,reason:e.message});}
}
const historical=results.filter(r=>!r.synthetic&&r.scope==='complete');
const coverage=summarizeModeledCoverage(historical.flatMap(r=>r.rows));
const chartSupported=historical.filter(r=>r.rows.some(q=>q.state==='supported')).length;
// A zero-coverage model is operationally valid but not ready for additional
// effect authority. Do not tune thresholds merely to pass this gate.
const readiness=errors.length?'invalid':coverage.supported===0?'blocked-zero-coverage':'coverage-observed-not-validated';
console.log(JSON.stringify({version:'modeled-coverage-v1',scope:'production-core-replay-not-public-v10-or-empirical-validation',
 cases:cases.length,syntheticControls:controls.length,replays:results.length,chartSupported,coverage,readiness,errors,results},null,2));
if(errors.length||process.argv.includes('--require-coverage')&&readiness!=='coverage-observed-not-validated')process.exitCode=1;
