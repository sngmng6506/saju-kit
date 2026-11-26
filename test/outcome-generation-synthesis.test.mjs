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
  const modeled=r.generationSynthesisInputs[4],argument=r.generationSynthesisInputs[3];
  assert.deepEqual(q.evidence,modeled.evidence);
  assert.deepEqual(q.judgments.slice(0,modeled.judgments.length),modeled.judgments);
  assert.deepEqual(q.ruleResults.slice(0,modeled.ruleResults.length),modeled.ruleResults);
  assert.equal(new Set(q.propositions.map(p=>p.id)).size,q.propositions.length);
  assert.equal(q.summary.modeledReception,0);
  assert.equal(q.summary.actualReleaseConfirmed,0);
  assert.equal(q.summary.actualReceptionConfirmed,0);
  for(const a of q.actions){
   assert.equal(a.localContextState==='supported',expected.find(e=>e.edgeId===a.edgeId).structural.state==='supported');
   const edge=expected.find(e=>e.edgeId===a.edgeId);
   assert.equal(a.directReleasePropositionId,edge.direct.propositionId);
   assert.equal(a.jointReleasePropositionId,edge.combined.propositionId);
   assert.equal(a.directReleaseState,edge.direct.state);
   assert.equal(a.jointReleaseState,edge.combined.state);
   assert.equal(a.actualReleaseState,'unresolved');
   for(const id of a.sharedPremiseIds)assert.ok(argument.propositions.some(p=>p.id===id&&p.subject===a.edgeId));
   assert.equal(a.recipientCapacityState,'unresolved');
   assert.equal(a.recipientCapacityBridge.kind,'recipient-capacity');
   assert.deepEqual(a.recipientCapacityBridge.subject,[a.edgeId]);
   assert.equal(a.recipientCapacityBridge.state,'unresolved');
   assert.equal(a.recipientCapacityBridge.effective,null);
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

test('positive modeled release is not recipient capacity or actual release',()=>{
 const q=replayModeledCoverage(controls[0].pillars,true).generationSynthesis;
 assert.ok(q.summary.jointRelease>0);
 for(const a of q.actions.filter(a=>a.jointReleaseState==='supported')){
  assert.equal(a.directReleaseState,'supported');
  assert.equal(a.receptionState,'unresolved');
  assert.equal(a.actualReleaseState,'unresolved');
  assert.equal(a.actualReceptionState,'unresolved');
  const receptionRule=q.rules.find(r=>r.conclusion.propositionId===a.receptionPropositionId);
  assert.ok(!receptionRule.premises.some(p=>[a.directReleasePropositionId,a.jointReleasePropositionId].includes(p.propositionId)));
 }
});
test('release binding rejects coordinated projection substitutions',()=>{
 const r=replayModeledCoverage(controls[0].pillars,true,{includeSynthesisInputs:true});
 const [prior,root,supply,argument,modeled,synthesis]=r.generationSynthesisInputs;
 const a=synthesis.actions.find(a=>a.kind==='generate'),m=modeled.actions.find(x=>x.edgeId===a.edgeId);
 const reject=(mm,ss)=>assert.equal(reviewGenerationSynthesis(prior,root,supply,argument,mm,ss).status,'invalid-evidence');
 const change=(x)=>({...synthesis,actions:synthesis.actions.map(y=>y.edgeId===a.edgeId?{...y,...x}:y)});
 reject(modeled,change({direct:a.combined}));
 reject(modeled,change({combined:{...a.combined,alternatives:[]}}));
 reject({...modeled,actions:modeled.actions.map(y=>y===m?{...m,clauses:m.clauses.filter(c=>!c.directReleasePropositionId)}:y)},synthesis);
 reject({...modeled,actions:modeled.actions.map(y=>y===m?{...m,clauses:m.clauses.map(c=>c.directReleasePropositionId?{...c,directReleaseState:'conflicting'}:c)}:y)},synthesis);
});
