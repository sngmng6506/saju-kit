import test from 'node:test';
import assert from 'node:assert/strict';
import {createDependencyGraph,sharedDependencyUses} from '../src/features/pattern/outcome-dependency-graph.js';
import {reviewInteractionDependencies} from '../src/features/pattern/outcome-interaction-dependencies.js';
import {replayModeledCoverage,controls,routeControls} from '../scripts/lib/pattern-modeled-consequence-coverage.mjs';
test('typed identity, distinct consumers and idempotent links',()=>{
 const g=createDependencyGraph(),a=g.node('action','x'),b=g.node('action','y'),r=g.node('root-slot','x');
 assert.notEqual(a,r);assert.equal(r,g.node('root-slot','x'));
 g.link(a,r,'root-reference','source');g.link(a,r,'root-reference','source');g.link(a,r,'root-reference','target');
 const opts={consumerKind:'action',resourceKind:'root-slot',linkKinds:['root-reference']};
 assert.equal(g.finish().links.length,2);
 assert.deepEqual(sharedDependencyUses(g.finish(),opts),[]);
 g.link(b,r,'root-reference','source');
 const shared=sharedDependencyUses(g.finish(),opts);
 assert.equal(shared.length,1);assert.equal(shared[0].consumers.length,2);
 assert.equal(shared[0].exclusiveConfirmed,null);assert.equal(shared[0].independentCapacityConfirmed,null);
 assert.throws(()=>g.link(a,'missing','root-reference'));
});
for(const c of [...controls,...routeControls])for(const complete of [true,false]){
 test('interaction replay '+c.id+' '+complete,()=>{
  const r=replayModeledCoverage(c.pillars,complete,{includeSynthesisInputs:true}),q=r.interactionDependencies;
  assert.deepEqual(r.invalid,[]);
  assert.deepEqual(q,reviewInteractionDependencies(...r.interactionDependencyInputs));
  assert.equal(q.status,complete?'diagnostic':'partial');
  assert.equal(q.selectionAuthority,false);assert.equal(q.effective,null);
  assert.equal(q.summary.actualEffectsConfirmed,0);
  const ids=new Set(q.nodes.map(n=>n.id));assert.equal(ids.size,q.nodes.length);
  assert.equal(new Set(q.links.map(l=>l.id)).size,q.links.length);
  assert.ok(q.links.every(l=>ids.has(l.from)&&ids.has(l.to)));
  assert.equal(q.summary.actions,r.synthesis.actions.length);
  for(const group of Object.values(q.shared))for(const s of group){
   assert.ok(s.consumers.length>=2);
   assert.equal(new Set(s.consumers.map(x=>x.consumerId)).size,s.consumers.length);
   assert.equal(s.exclusiveConfirmed,null);assert.equal(s.independentCapacityConfirmed,null);
  }
 });
}
test('reject missing action root and forged generation projection',()=>{
 const r=replayModeledCoverage(controls[0].pillars,true,{includeSynthesisInputs:true});
 const [prior,root,supply,pressure,argument,joint,modeled,synthesis,generation,control]=r.interactionDependencyInputs;
 const a=joint.actions.find(a=>a.rootIds.length);
 assert.ok(a);
 const altered={...joint,actions:joint.actions.map(x=>x===a?{...x,rootIds:[]}:x)};
 assert.equal(reviewInteractionDependencies(prior,root,supply,pressure,argument,altered,modeled,synthesis,generation,control).status,'invalid-evidence');
 assert.equal(reviewInteractionDependencies(prior,root,supply,pressure,argument,joint,modeled,synthesis,{...generation,actions:[]},control).status,'invalid-evidence');
});
test('route legs are references rather than assumed effective actions',()=>{
 const r=replayModeledCoverage(routeControls[0].pillars,true),q=r.interactionDependencies;
 const nodes=new Map(q.nodes.map(n=>[n.id,n]));
 const legs=q.links.filter(l=>l.kind==='required-leg');
 assert.ok(legs.length>0);
 assert.ok(legs.every(l=>nodes.get(l.from).kind==='route'&&nodes.get(l.to).kind==='action'));
 assert.equal(q.summary.actualEffectsConfirmed,0);
});
