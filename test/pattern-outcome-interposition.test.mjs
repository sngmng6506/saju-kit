import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {observeInterpositionReview} from '../src/features/pattern/outcome-interposition-review.js';
import {summarizeInterpositionReview} from '../scripts/lib/pattern-outcome-role-policy-triage.mjs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const chart=(ps,complete=true)=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))});
const build=(ps,complete=true)=>{
 const saju=chart(ps,complete),stemForce=analyzeStemForceEvidence({saju}),relativeForce=observeRelativeForce(stemForce);
 const prior={completeHour:complete,stemForce,relativeForce},root=observeRootContext(prior,analyzeFormationEvidence({saju}));
 const supply=observeGroundedSupply(prior,root),review=observeInterpositionReview(prior,root,supply);
 return {saju,prior,root,supply,review};
};
const xu08=['무술','갑자','정미','경술'];
const mediationChart=['경신','임자','갑인','병오'];
test('XU08 protection path preserves both controls and hidden branch access',()=>{
 const {review}=build(xu08);assert.equal(review.status,'diagnostic');
 const p=review.paths.find(x=>x.kind==='protection'&&x.helper==='day:branch:earth'&&x.threat==='month:branch:water'&&x.target==='day:stem');
 assert.ok(p);assert.deepEqual(p.edges.map(e=>[e.from,e.to,e.type]),[
  ['day:branch:earth','month:branch:water','control'],['month:branch:water','day:stem','control']]);
 assert.equal(p.chainLocal,true);assert.ok(p.blockers.includes('hidden-participant-access'));
 assert.equal(p.participants.helper.kind,'local-branch-constituents');
 assert.equal(p.participants.threat.kind,'local-branch-constituents');
 assert.equal(p.neutralizationConfirmed,null);assert.equal(p.effectiveProtection,null);
 assert.equal(review.selectionAuthority,false);assert.equal(review.effectConfirmed,null);
});
test('mediation chain may have a remote direct threat edge without misclassifying its local generation chain',()=>{
 const {review}=build(mediationChart);assert.equal(review.status,'diagnostic');
 const p=review.paths.find(x=>x.kind==='mediation'&&x.helper==='month:stem'&&x.threat==='year:stem'&&x.target==='day:stem');
 assert.ok(p);assert.equal(p.chainLocal,true);assert.equal(p.directThreatControlLocal,false);
 assert.ok(!p.blockers.includes('nonlocal-generation-chain'));
 assert.equal(p.edges[0].type,'generate');assert.equal(p.edges[1].type,'generate');assert.equal(p.edges[2].type,'control');
 assert.equal(p.neutralizationConfirmed,null);assert.equal(p.effectiveMediation,null);
});
test('helper pressure is retained and blocks a structural screen, never erases the route',()=>{
 const {review}=build(xu08);
 const p=review.paths.find(x=>x.kind==='protection'&&x.helper==='day:branch:earth'&&x.threat==='month:branch:water'&&x.target==='day:stem');
 assert.ok(p.pressure.helper.some(x=>x.controllerNodeId==='month:stem'&&x.donorState==='grounded-observation'));
 assert.ok(p.blockers.includes('helper-under-rooted-control'));
 assert.equal(p.pressure.threat.some(x=>x.controllerNodeId===p.helper),true);
 assert.equal(p.pressure.target.some(x=>x.controllerNodeId===p.threat),true);
});
test('target root is reported independently and is not a prerequisite for route observation',()=>{
 const {review}=build(mediationChart);
 for(const p of review.paths){
  assert.equal(p.targetRootRequiredForPathObservation,false);
  assert.ok(!p.blockers.some(x=>x.includes('target-root')));
 }
});
test('missing hour keeps all candidate paths partial and prevents structural screens',()=>{
 const {review}=build(xu08,false);assert.equal(review.status,'partial');
 assert.ok(review.paths.every(p=>p.blockers.includes('missing-hour')&&p.structuralScreen==='context-review'));
 assert.equal(review.summary.structuralScreensMet,0);
});
test('foreign edge identity, borrowed roots and duplicate donor nodes fail closed',()=>{
 const x=build(xu08);
 const badPath=structuredClone(x.prior);const a=badPath.stemForce.occurrences.find(o=>o.protectionAndMediation.length);
 a.protectionAndMediation[0].edges[0].distance+=1;
 assert.equal(observeInterpositionReview(badPath,x.root,x.supply).status,'invalid-evidence');
 const badSupply=structuredClone(x.supply),node=badSupply.nodes.find(n=>n.kind==='local-branch-constituents');
 node.groundedRootIds=['hidden:year:戊'];
 assert.equal(observeInterpositionReview(x.prior,x.root,badSupply).status,'invalid-evidence');
 const duplicate=structuredClone(x.supply);duplicate.nodes.push(duplicate.nodes[0]);
 assert.equal(observeInterpositionReview(x.prior,x.root,duplicate).status,'invalid-evidence');
});
test('audit counts candidates but rejects effect or authority leakage',()=>{
 const {review}=build(xu08),row=summarizeInterpositionReview({id:'xu08'},review,false);
 assert.equal(row.errors.length,0);assert.equal(row.counts.candidatePaths,review.paths.length);
 const bad=structuredClone(review);bad.paths[0].effectiveProtection=true;
 assert.ok(summarizeInterpositionReview({id:'xu08'},bad,false).errors.length);
});
test('native V10 composes interposition review without changing decision authority',()=>{
 const r=analyzePatternOutcomeV10({saju:chart(xu08),birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 const e=r.efficacyReview.mechanismReview.interpositionReview;
 assert.equal(e.status,'diagnostic');assert.equal(e.selectionAuthority,false);assert.equal(e.effectConfirmed,null);
 assert.equal(r.decisionReview.status,'abstained');assert.equal(r.selectionAuthority,false);
});

test('formation-contested roots remain clash-unexposed but do not become grounded access',()=>{
 const {prior,root,supply,review}=build(['무술','을묘','병오','을해']);
 const slot=root.slots.find(s=>s.state==='formation-contested'&&s.role!=='residual');
 assert.ok(slot);assert.deepEqual(slot.clashIds,[]);
 const nodeId=slot.position+':branch:'+slot.element,donor=supply.nodes.find(n=>n.nodeId===nodeId);
 assert.ok(donor.contestedRootIds.includes(slot.id));assert.equal(donor.state,'context-review');
 const route=review.paths.find(p=>[p.helper,p.threat,p.target].includes(nodeId));assert.ok(route);
 const raw=prior.stemForce.occurrences.flatMap(a=>a.protectionAndMediation).find(p=>
  p.kind===route.kind&&p.helper===route.helper&&p.threat===route.threat&&p.target===route.target);
 const edge=raw.edges.find(e=>e.from===nodeId||e.to===nodeId);
 const evidence=edge.from===nodeId?edge.sourceEvidence:edge.targetEvidence;
 assert.ok(evidence.unexposedSubstantialRootPositions.includes(slot.position));
 assert.equal(review.status,'diagnostic');
});

test('each evaluated path binds to exactly one original visible-target controller',()=>{
 for(const complete of [true,false])for(const chart of [xu08,mediationChart]){
  const {prior,review}=build(chart,complete);
  assert.equal(review.status,complete?'diagnostic':'partial');
  assert.equal(review.pressureContexts.length,complete?4:3);
  const refs=[];
  for(const t of review.pressureContexts){
   const actor=prior.stemForce.occurrences.find(a=>a.id===t.targetId);
   assert.deepEqual(t.controllers.map(c=>c.controllerNodeId).sort(),actor.controlReceived.map(e=>e.from).sort());
   for(const c of t.controllers){
    assert.equal(c.neutralizationConfirmed,null);assert.equal(c.remainingPressureConfirmed,null);
    for(const id of c.evaluatedPathIds){
     const p=review.paths.find(p=>p.id===id);
     assert.equal(p.target,t.targetNodeId);assert.equal(p.threat,c.controllerNodeId);refs.push(id);
    }
   }
  }
  assert.deepEqual(refs.sort(),review.paths.map(p=>p.id).sort());
  assert.equal(summarizeInterpositionReview({id:'chart'},review,!complete).errors.length,0);
 }
});
test('Zhou wealth pressure is an explicit out-of-scope context, not failed protection',()=>{
 const {review}=build(xu08),t=review.pressureContexts.find(t=>t.targetId==='visible:hour');
 assert.equal(t.targetScope,'outside-target-scope');
 assert.ok(t.controllers.some(c=>c.candidatePathIds.length>0));
 assert.ok(t.controllers.every(c=>c.coverage==='outside-target-scope'&&!c.evaluatedPathIds.length&&!c.screenedPathIds.length&&c.neutralizationConfirmed===null));
 assert.equal(t.allPressureResolved,null);
});
test('audit rejects cross-controller path reuse and missing pressure contexts',()=>{
 const {review}=build(xu08);
 const bad=structuredClone(review),t=bad.pressureContexts.find(t=>t.controllers.filter(c=>c.evaluatedPathIds.length).length>=2);
 assert.ok(t);
 const [a,b]=t.controllers.filter(c=>c.evaluatedPathIds.length);
 a.evaluatedPathIds.push(b.evaluatedPathIds[0]);
 assert.ok(summarizeInterpositionReview({id:'bad'},bad,false).errors.some(e=>e.startsWith('pressure-path-binding:')));
 const missing=structuredClone(review);missing.pressureContexts.pop();
 assert.ok(summarizeInterpositionReview({id:'bad'},missing,false).errors.includes('pressure-context-coverage'));
});
