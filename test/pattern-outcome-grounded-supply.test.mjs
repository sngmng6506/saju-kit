import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {summarizeGroundedSupplyReview} from '../scripts/lib/pattern-outcome-role-policy-triage.mjs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const chart=(ps,complete=true)=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))});
const build=(ps,complete=true)=>{
 const saju=chart(ps,complete),stemForce=analyzeStemForceEvidence({saju}),relativeForce=observeRelativeForce(stemForce);
 const prior={completeHour:complete,stemForce,relativeForce},root=observeRootContext(prior,analyzeFormationEvidence({saju}));
 return {prior,root,saju,result:observeGroundedSupply(prior,root)};
};
const zhou=['무술','갑자','정미','경술'],tuo=['임진','갑진','병술','무술'];
test('Zhou wealth indirect donor remains separate from direct roots and pressure',()=>{
 const {result}=build(zhou);
 assert.equal(result.status,'diagnostic');
 const a=result.occurrences.find(x=>x.id==='visible:hour');
 assert.equal(a.directRoot.state,false);assert.ok(a.groundedPathIds.length>0);
 assert.ok(a.paths.some(p=>p.upstream==='observed'&&p.donor.kind==='local-branch-constituents'&&p.donor.groundedRootIds.every(id=>id.startsWith('hidden:'+p.donor.position+':'))));
 assert.ok(a.paths.some(p=>p.concerns.includes('recipient-pressure-review')));
 assert.equal(a.screenedPathIds.length,0);
 const e=result.actions.find(e=>e.from===a.id&&e.to==='visible:month'&&e.kind==='control');
 assert.equal(e.sourceBasis,'indirect-path-context-review');assert.equal(e.controlComparison,'right-evidence-dominates');assert.equal(e.effective,null);
});
test('Tuo contested substantial roots cannot ground a new supply path',()=>{
 const {result}=build(tuo);assert.equal(result.status,'diagnostic');
 const a=result.occurrences.find(x=>x.id==='visible:hour');assert.equal(a.directRoot.state,null);
 assert.ok(a.directRoot.contestedRootIds.length);
 for(const p of result.occurrences.flatMap(x=>x.paths))if(p.donor.nodeId==='hour:stem')assert.notEqual(p.upstream,'observed');
});
test('every observed donor is grounded in literal own slots or visible root evidence; hidden recipients stay review-only',()=>{
 for(const ps of [zhou,tuo,['신유','병신','임신','신해'],['무술','을묘','병오','을해'],['병인','무술','임술','신축']]){
  const {result,root,prior}=build(ps);assert.equal(result.status,'diagnostic');
  assert.equal(result.actions.length,prior.relativeForce.edges.length);
  for(const a of result.occurrences)for(const p of a.paths){
   if(p.upstream==='observed')assert.ok(p.donor.groundedRootIds.length);
   if(p.donor.kind==='local-branch-constituents')assert.ok(p.donor.groundedRootIds.every(id=>id.startsWith('hidden:'+p.donor.position+':')));
   if(a.layer==='hidden')assert.equal(p.readiness,'context-review');
   assert.equal(p.effectiveSupply,null);assert.equal(p.donor.independentSupplyConfirmed,null);
  }
  for(const e of result.actions){assert.equal(e.effective,null);assert.equal(e.selectionAuthority,false);if(e.kind==='control')assert.equal(e.generationScreen,'unresolved');}
 }
});
test('missing hour never grants a screened supply path or generation screen',()=>{
 const {result}=build(zhou,false);assert.equal(result.status,'partial');
 assert.ok(result.occurrences.every(a=>!a.screenedPathIds.length&&a.id!=='visible:hour'));
 assert.ok(result.actions.every(e=>e.sourceBasis==='partial'&&e.generationScreen==='unresolved'));
});
test('foreign graph identity and duplicated root rows fail closed; input is not mutated',()=>{
 const {prior,root}=build(zhou),before=JSON.stringify({prior,root});
 assert.equal(observeGroundedSupply(prior,root).status,'diagnostic');assert.equal(JSON.stringify({prior,root}),before);
 const r=structuredClone(root);r.occurrences.push(r.occurrences[0]);assert.equal(observeGroundedSupply(prior,r).status,'invalid-evidence');
 const p=structuredClone(prior);p.stemForce.occurrences[0].graphNodeId='foreign';assert.equal(observeGroundedSupply(p,root).status,'invalid-evidence');
});
test('native V10 composes the new review without authorizing efficacy or selection',()=>{
 const r=analyzePatternOutcomeV10({saju:chart(zhou),birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 const s=r.efficacyReview.mechanismReview.groundedSupply;
 assert.equal(s.status,'diagnostic');assert.equal(s.selectionAuthority,false);assert.equal(s.effectiveSupply,null);
 assert.equal(r.decisionReview.status,'abstained');assert.equal(r.efficacyReview.status,'diagnostic');
});

test('synthetic receiving stem without substantial roots can pass the structural generation screen',()=>{
 // Synthetic independent pillars, not a claimed calendrically verified birth.
 const {result}=build(['을묘','을묘','정묘','을묘']);
 assert.equal(result.status,'diagnostic');
 const a=result.actions.find(e=>e.from==='visible:month'&&e.to==='visible:day'&&e.kind==='generate');
 assert.equal(a.targetDirectRootState,false);assert.equal(a.sourceBasis,'direct-root-observed');
 assert.equal(a.generationScreen,'grounded-generation-context-screen-met');assert.equal(a.effective,null);
});
test('audit reports supply paths without treating them as independent quantities',()=>{
 const {result}=build(zhou),r=summarizeGroundedSupplyReview({id:'zhou'},result,false);
 assert.equal(r.errors.length,0);assert.equal(r.counts.visibleIndirectWithoutDirectRoot,1);
 assert.equal(r.effectConfirmed,null);
 const bad=structuredClone(result);bad.occurrences.find(a=>a.id==='visible:hour').effectiveSupply=true;
 assert.ok(summarizeGroundedSupplyReview({id:'zhou'},bad,false).errors.length);
});
