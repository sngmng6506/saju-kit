import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewInteractionScenarios} from '../src/features/pattern/outcome-interaction-scenarios.js';
import {replayModeledCoverage,controls,routeControls} from '../scripts/lib/pattern-modeled-consequence-coverage.mjs';
for(const c of [...controls,...routeControls])for(const complete of [true,false]){
 test('shared chart scenario '+c.id+' '+complete,()=>{
  const r=replayModeledCoverage(c.pillars,complete,{includeSynthesisInputs:true}),q=r.interactionScenarios;
  assert.deepEqual(r.invalid,[]);
  assert.deepEqual(q,reviewInteractionScenarios(...r.interactionScenarioInputs));
  assert.equal(q.status,complete?'diagnostic':'partial');
  assert.equal(q.selectionAuthority,false);assert.equal(q.effective,null);
  assert.equal(q.summary.actualEffectsConfirmed,0);
  assert.equal(q.manifest.length,r.synthesis.actions.length);
  assert.ok(q.manifest.every(m=>m.actualEffectState==='unresolved'));
  if(!complete){assert.equal(q.space.status,'partial');assert.deepEqual(q.space.pairs,[]);return;}
  if(q.space.status==='unavailable'){assert.equal(q.summary.jointlyPossible,null);return;}
  assert.equal(q.space.status,'diagnostic');
  assert.equal(q.space.admissibleCount,q.space.scenarioCount);
  const qs=new Map(q.space.queries.map(x=>[x.id,x]));
  assert.equal(qs.size,q.manifest.length);
  assert.equal(q.space.pairs.length,qs.size*(qs.size-1)/2);
  for(const p of q.space.pairs){
   assert.equal(Object.values(p.counts).reduce((a,b)=>a+b,0),q.space.admissibleCount);
   assert.equal(p.counts.leftOnly+p.counts.both,qs.get(p.leftId).supportCount);
   assert.equal(p.counts.rightOnly+p.counts.both,qs.get(p.rightId).supportCount);
   assert.equal(p.individuallyPossibleButJointImpossible,p.individuallyPossible&&p.counts.both===0);
  }
 });
}
test('reject a missing graph action or altered shared basis',()=>{
 const r=replayModeledCoverage(controls[0].pillars,true,{includeSynthesisInputs:true});
 const [prior,root,pressure,argument,graph]=r.interactionScenarioInputs;
 assert.equal(reviewInteractionScenarios(prior,root,pressure,argument,{...graph,nodes:graph.nodes.filter(n=>n.kind!=='action')}).status,'invalid-evidence');
 assert.equal(reviewInteractionScenarios(prior,root,{...pressure,sharedForceBasis:{...pressure.sharedForceBasis,profiles:[]}},argument,graph).status,'invalid-evidence');
});
