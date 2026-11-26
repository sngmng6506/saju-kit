import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewGenerationSynthesis} from '../src/features/pattern/outcome-generation-synthesis.js';
import {replayModeledCoverage,controls,routeControls} from '../scripts/lib/pattern-modeled-consequence-coverage.mjs';
for(const c of [...controls,...routeControls])for(const complete of [true,false]){
 test('generation replay '+c.id+' '+complete,()=>{
  const r=replayModeledCoverage(c.pillars,complete,{includeSynthesisInputs:true});
  assert.deepEqual(r.invalid,[]);
  const q=r.generationSynthesis;
  assert.deepEqual(q,reviewGenerationSynthesis(...r.generationSynthesisInputs));
  assert.equal(q.status,complete?'diagnostic':'partial');
  assert.equal(q.selectionAuthority,false);
  assert.equal(q.effective,null);
  const expected=r.synthesis.actions.filter(a=>a.kind==='generate');
  assert.deepEqual(q.actions.map(a=>a.edgeId),expected.map(a=>a.edgeId));
  assert.equal(q.summary.modeledReception,0);
  assert.equal(q.summary.actualReceptionConfirmed,0);
  for(const a of q.actions){
   assert.equal(a.localContextState==='supported',expected.find(e=>e.edgeId===a.edgeId).structural.state==='supported');
   assert.equal(a.recipientCapacityState,'unresolved');
   assert.equal(a.receptionState,'unresolved');
   assert.equal(a.actualSupplyState,'unresolved');
   assert.equal(a.actualReceptionState,'unresolved');
   assert.equal(a.actualBenefitState,'unresolved');
   if(!complete)assert.equal(a.sourceContextState,'unresolved');
  }
 });
}
test('generation context never substitutes for reception capacity',()=>{
 const q=replayModeledCoverage(controls[0].pillars,true).generationSynthesis;
 assert.ok(q.summary.localContext>0);
 for(const a of q.actions.filter(a=>a.localContextState==='supported')){
  const rule=q.rules.find(r=>r.conclusion.propositionId===a.receptionPropositionId);
  assert.ok(rule.premises.some(p=>p.propositionId===a.recipientCapacityPropositionId));
  assert.equal(q.ruleResults.find(r=>r.id===rule.id).status,'premises-unresolved');
  assert.ok(!q.evidence.some(e=>e.propositionId===a.recipientCapacityPropositionId));
 }
});
test('reject omitted generation action, forged proof and altered supply',()=>{
 const r=replayModeledCoverage(controls[0].pillars,true,{includeSynthesisInputs:true});
 const [prior,root,supply,argument,modeled,synthesis]=r.generationSynthesisInputs;
 const a=synthesis.actions.find(a=>a.kind==='generate');
 assert.ok(a);
 const reject=(g,ss=synthesis)=>assert.equal(reviewGenerationSynthesis(prior,root,g,argument,modeled,ss).status,'invalid-evidence');
 reject(supply,{...synthesis,actions:synthesis.actions.filter(x=>x.edgeId!==a.edgeId)});
 reject(supply,{...synthesis,actions:synthesis.actions.map(x=>x.edgeId===a.edgeId?{...x,structural:{...x.structural,alternatives:[]}}:x)});
 reject({...supply,actions:supply.actions.filter(x=>x.edgeId!==a.edgeId)});
});
