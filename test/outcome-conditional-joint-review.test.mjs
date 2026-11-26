import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewConditionalJoint} from '../src/features/pattern/outcome-conditional-joint-review.js';
import {compileJointScenario,evaluateJointScenario} from '../src/features/pattern/outcome-joint-constraints.js';
import {replayModeledCoverage,controls,routeControls} from '../scripts/lib/pattern-modeled-consequence-coverage.mjs';
for(const c of [...controls,...routeControls])for(const complete of [true,false]){
 test('conditional joint replay '+c.id+' '+complete,()=>{
  const r=replayModeledCoverage(c.pillars,complete,{includeSynthesisInputs:true}),q=r.conditionalJoint;
  assert.deepEqual(r.invalid,[]);
  assert.deepEqual(q,reviewConditionalJoint(...r.conditionalJointInputs));
  assert.equal(q.status,complete?'diagnostic':'partial');
  assert.equal(q.selectionAuthority,false);assert.equal(q.effective,null);
  assert.equal(q.summary.actualEffectsConfirmed,0);
  assert.ok(q.manifest.every(m=>m.actualEffectState==='unresolved'));
  const joint=r.conditionalJointInputs[1];
  assert.deepEqual(q.manifest.map(m=>m.id),joint.scenario.candidates.map(c=>c.id));
  if(!complete){assert.equal(q.analysis.status,'partial');assert.deepEqual(q.analysis.targets,[]);return;}
  if(q.analysis.status==='unavailable'){assert.equal(q.summary.possibleSupported,null);return;}
  assert.equal(q.analysis.status,'diagnostic');
  assert.equal(q.analysis.admissibleCount,q.analysis.scenarioCount);
  for(const t of q.analysis.targets)assert.equal(Object.values(t.counts).reduce((a,b)=>a+b,0),q.analysis.admissibleCount);
 });
}
const key=(...xs)=>JSON.stringify(xs);
const lit=(propositionId,sign='for')=>({propositionId,sign});
function fixture(completeHour=true){
 const scope=completeHour?'complete':'partial',status=completeHour?'diagnostic':'partial';
 const path=key('path','p'),leg=key('leg-ready','a'),pressure=key('pressure','q'),seed=key('leg-operation','a'),block=key('path-obstruction','p');
 const assumptions=[seed,block].map(id=>({id,state:'unresolved'}));
 const candidates=[{id:leg,alternatives:[{id:'leg',requires:[lit(seed)],undercutWhen:[]}]},{id:path,alternatives:[{id:'route',requires:[lit(leg),lit(block,'against')],undercutWhen:[lit(block)]}]},{id:pressure,alternatives:[{id:'relief',requires:[lit(path)],undercutWhen:[]}]}];
 const input={scope,assumptions,candidates},scenario={...input,...evaluateJointScenario(input)};
 const joint={status,completeHour,selectionAuthority:false,effective:null,scenario,paths:[{pathId:'p',scenarioPropositionId:path,actualEffectState:'unresolved'}]};
 return {prior:{completeHour},joint,path,leg,pressure,seed,block};
}
test('joint route requires explicit seed and clearance in same assignment',()=>{
 const {prior,joint,path,leg,pressure,seed,block}=fixture(),q=reviewConditionalJoint(prior,joint);
 assert.equal(q.status,'diagnostic');assert.equal(q.analysis.admissibleCount,4);
 const targets=new Map(q.analysis.targets.map(t=>[t.id,t]));
 assert.equal(targets.get(leg).counts.supported,2);
 assert.equal(targets.get(path).counts.supported,1);
 assert.equal(targets.get(pressure).counts.supported,1);
 assert.deepEqual(targets.get(path).witnesses.supported,{[seed]:true,[block]:false});
 assert.equal(q.analysis.sets.whole.supportCount,1);
});
test('conditional domain refuses altered base proof, path and assumption authority',()=>{
 const {prior,joint}=fixture();
 assert.equal(reviewConditionalJoint(prior,{...joint,paths:[]}).status,'invalid-evidence');
 assert.equal(reviewConditionalJoint(prior,{...joint,scenario:{...joint.scenario,judgments:[]}}).status,'invalid-evidence');
 assert.equal(reviewConditionalJoint(prior,{...joint,scenario:{...joint.scenario,assumptions:joint.scenario.assumptions.map(a=>({...a,state:'supported'}))}}).status,'invalid-evidence');
});
