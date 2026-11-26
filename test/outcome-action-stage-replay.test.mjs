import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {reviewRootPreservation} from '../src/features/pattern/outcome-root-preservation.js';
import {reviewReplenishment} from '../src/features/pattern/outcome-replenishment-review.js';
import {reviewBurden} from '../src/features/pattern/outcome-burden-review.js';
import {synthesizeContextualStrength} from '../src/features/pattern/outcome-strength-synthesis.js';
import {inspectActionDiagnostics} from '../src/features/pattern/outcome-action-diagnostic-contract.js';
import {controls,routeControls} from '../scripts/lib/pattern-action-controls.mjs';
const base=completeHour=>({status:completeHour?'diagnostic':'partial',completeHour,selectionAuthority:false,effective:null});
test('diagnostic envelope checks every registered result and preserves original failure reason',()=>{
 const good=base(true);
 assert.deepEqual(inspectActionDiagnostics({good,bounded:{...good,summary:{analysisStatus:'unavailable'}}},true),[]);
 assert.deepEqual(inspectActionDiagnostics({newField:{...good,status:'unavailable',reason:'budget'}},true),[{owner:'newField',status:'unavailable',reason:'budget'}]);
 assert.deepEqual(inspectActionDiagnostics({x:{...good,status:'invalid-evidence',reason:'root-binding'}},true),[{owner:'x',status:'invalid-evidence',reason:'root-binding'}]);
 assert.deepEqual(inspectActionDiagnostics({x:{...good,completeHour:false}},true),[{owner:'x',status:'invalid-evidence',reason:'scope-mismatch'}]);
 assert.deepEqual(inspectActionDiagnostics({x:{...good,selectionAuthority:true}},true),[{owner:'x',status:'invalid-evidence',reason:'authority-violation'}]);
 assert.deepEqual(inspectActionDiagnostics({x:{...good,effectiveSupply:true}},true),[{owner:'x',status:'invalid-evidence',reason:'authority-violation'}]);
 assert.deepEqual(inspectActionDiagnostics({x:null},true),[{owner:'x',status:'invalid-evidence',reason:'missing-result'}]);
 assert.equal(inspectActionDiagnostics({},true)[0].reason,'inventory');
 assert.deepEqual(inspectActionDiagnostics({x:base(false)},false),[]);
});
function foundation(pillars,completeHour){
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!completeHour&&i===3?null:{stem:pillars[i][0],branch:pillars[i][1],text:pillars[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour,stemForce,relativeForce:observeRelativeForce(stemForce)};
 return {prior,root:observeRootContext(prior,analyzeFormationEvidence({saju}))};
}
function check(owner,value,completeHour){
 assert.deepEqual(inspectActionDiagnostics({[owner]:value},completeHour),[],owner+': '+JSON.stringify(inspectActionDiagnostics({[owner]:value},completeHour)));
 return value;
}
for(const c of [...controls,...routeControls])for(const completeHour of [true,false]){
 const suffix=c.id+' '+(completeHour?'complete':'partial');
 // Separate tests isolate real upstream contracts from downstream failures.
 test('literal chart root preservation '+suffix,()=>{
  const {prior,root}=foundation(c.pillars,completeHour);check('rootContext',root,completeHour);
  for(const element of ['wood','fire','earth','metal','water']){
   const r=check('rootPreservation:'+element,reviewRootPreservation({prior,root,element}),completeHour);
   assert.equal(r.actualDepthState,'unresolved');
   if(!completeHour)assert.equal(r.scenario.status,'partial');
  }
 });
 test('literal chart rooted supply and strength chain '+suffix,()=>{
  const {prior,root}=foundation(c.pillars,completeHour);check('rootContext',root,completeHour);
  const supply=check('groundedSupply',observeGroundedSupply(prior,root),completeHour);
  const r=check('replenishmentReview',reviewReplenishment(prior,root,supply),completeHour);
  const b=check('burdenReview',reviewBurden(prior,r),completeHour);
  const s=check('strengthSynthesis',synthesizeContextualStrength({completeHour,nodes:r.nodes,targets:r.targets,burden:b.analysis}),completeHour);
  assert.equal(s.actualStrengthState,'unresolved');
  assert.equal(s.rows.length,completeHour?4:3);
  assert.equal(s.summary.actualEffectsConfirmed,0);
  if(!completeHour)assert.equal(s.summary.analysisStatus,'partial');
 });
}
