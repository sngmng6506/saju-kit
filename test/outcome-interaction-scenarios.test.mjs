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
  if(!complete){assert.equal(q.space.status,'partial');assert.deepEqual(q.space.pairs,[]);assert.equal(q.space.sets.status,'partial');assert.equal(q.space.sets.whole,null);return;}
  if(q.space.status==='unavailable'){assert.equal(q.summary.jointlyPossible,null);assert.equal(q.space.sets.whole,null);return;}
  assert.equal(q.space.status,'diagnostic');
  assert.equal(q.space.admissibleCount,q.space.scenarioCount);
  const sets=q.space.sets;
  assert.equal(sets.status,'diagnostic');
  assert.equal(q.summary.setAnalysisStatus,'diagnostic');
  assert.equal(q.summary.wholeConditionState,sets.whole.state);
  assert.deepEqual(sets.whole.queryIds,q.manifest.map(m=>m.id));
  assert.equal(q.summary.maximalFeasibleSets,sets.maximalFeasible.length);
  assert.equal(q.summary.minimalInfeasibleSets,sets.minimalInfeasible.length);
  const subset=(a,b)=>a.every(id=>b.includes(id));
  for(const m of sets.maximalFeasible){
   assert.ok(m.supportCount>0);assert.ok(m.witness);
   assert.ok(!sets.maximalFeasible.some(n=>n!==m&&subset(m.queryIds,n.queryIds)));
  }
  for(const m of sets.minimalInfeasible){
   assert.equal(m.supportCount,0);
   assert.equal(m.removals.length,m.queryIds.length);
   assert.ok(m.removals.every(x=>x.supportCount>0));
   assert.ok(!sets.maximalFeasible.some(n=>subset(m.queryIds,n.queryIds)));
  }
  assert.equal(sets.whole.supportCount>0,sets.minimalInfeasible.length===0);
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
