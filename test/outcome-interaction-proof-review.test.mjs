import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewInteractionProofs} from '../src/features/pattern/outcome-interaction-proof-review.js';
import {replayModeledCoverage,controls,routeControls} from '../scripts/lib/pattern-modeled-consequence-coverage.mjs';
for(const c of [...controls,...routeControls])for(const complete of [true,false]){
 test('interaction proof replay '+c.id+' '+complete,()=>{
  const r=replayModeledCoverage(c.pillars,complete,{includeSynthesisInputs:true}),q=r.interactionProofs;
  assert.deepEqual(r.invalid,[]);
  assert.deepEqual(q,reviewInteractionProofs(...r.interactionProofInputs));
  assert.equal(q.status,complete?'diagnostic':'partial');
  assert.equal(q.selectionAuthority,false);assert.equal(q.effective,null);
  assert.equal(q.summary.actualEffectsConfirmed,0);
  assert.deepEqual(Object.keys(q.graphs),['joint','generation','control']);
  for(const g of Object.values(q.graphs)){
   assert.equal(g.selectionAuthority,false);assert.equal(g.effective,null);
   if(!complete){assert.equal(g.status,'partial');assert.deepEqual(g.components,[]);continue;}
   if(g.status==='unavailable'){assert.equal(q.summary.cycles,null);continue;}
   assert.equal(g.status,'diagnostic');
   for(const c of g.components){
    assert.ok(c.groundedCount<=c.upperBoundReachableCount);
    if(c.classification==='structurally-seedless')assert.equal(c.groundedCount,0);
    if(c.classification==='grounded')assert.equal(c.groundedCount,c.members.length);
   }
  }
 });
}
test('reject altered joint and generation proof projections',()=>{
 const r=replayModeledCoverage(routeControls[0].pillars,true,{includeSynthesisInputs:true});
 const [prior,joint,modeled,generation,control]=r.interactionProofInputs;
 assert.equal(reviewInteractionProofs(prior,{...joint,scenario:{...joint.scenario,judgments:[]}},modeled,generation,control).status,'invalid-evidence');
 assert.equal(reviewInteractionProofs(prior,joint,modeled,{...generation,judgments:[]},control).status,'invalid-evidence');
});
