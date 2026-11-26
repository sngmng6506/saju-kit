import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {observeClashResidualContext} from '../src/features/pattern/outcome-clash-residual.js';
import {observeBranchPressure} from '../src/features/pattern/outcome-command-context.js';
import {observeRoleCapacity} from '../src/features/pattern/outcome-role-capacity.js';
import {summarizeClashResidual} from '../scripts/lib/pattern-outcome-clash-residual-audit.mjs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const mixed=['갑인','경신','병오','을묘'],three=['갑인','경신','병자','무진'],six=['갑인','경신','기사','을묘'],multi=['갑인','경신','병인','기사'];
const build=(ps,complete=true)=>{
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour:complete,stemForce,relativeForce:observeRelativeForce(stemForce)};
 const formation=analyzeFormationEvidence({saju}),root=observeRootContext(prior,formation),supply=observeGroundedSupply(prior,root);
 const x={saju,prior,formation,root,supply};return {...x,review:run(x)};
};
const run=x=>observeClashResidualContext(x.prior,x.formation,x.root,x.supply);
const audit=(x,partial=false)=>summarizeClashResidual({id:'test'},{clashResidualContext:x.review,rootContext:x.root,groundedSupply:x.supply,
 roleCapacity:observeRoleCapacity(x.prior),branchPressure:observeBranchPressure(x.prior,x.root,x.formation)},partial);
test('clash exposure does not erase distinct outside substantial roots',()=>{
 const r=build(mixed).review,a=r.occurrences.find(a=>a.id==='visible:year');
 assert.equal(r.status,'diagnostic');assert.equal(a.context,'exposed-and-uncontested-substantial-roots');
 assert.deepEqual(a.exposedSubstantialRootIds,['hidden:year:갑']);assert.deepEqual(a.outsideIncidentClashRootIds,['hidden:hour:을']);
 assert.ok(r.sharedExposedRoots.some(s=>s.rootId==='hidden:year:갑'&&s.actorIds.includes('visible:hour')));
 assert.equal(a.preservationConfirmed,null);
});
test('relief via complete three harmony is side specific and may compete with original root element',()=>{
 const r=build(three).review,c=r.clashes[0];
 assert.equal(c.alternatives[0].classification,'complete-three');assert.equal(c.alternatives[0].sharedPosition,'month');
 const opposite=r.slots.find(s=>s.id==='hidden:year:갑').reliefAlternatives[0].options[0];
 const same=r.slots.find(s=>s.id==='hidden:month:경').reliefAlternatives[0].options[0];
 assert.equal(opposite.side,'opposite-side');assert.equal(opposite.rootPositionParticipates,false);
 assert.equal(same.side,'root-side');assert.equal(same.rootElementDiffersFromTarget,true);assert.equal(same.reliefConfirmed,null);
 const residual=r.occurrences.find(s=>s.id==='visible:hour');assert.equal(residual.context,'residual-only-exposure');assert.equal(residual.exposedSubstantialRootIds.length,0);
});
test('six harmony candidate and repeated clash coverage are not joint allocation',()=>{
 const a=build(six).review,b=build(multi).review;
 assert.equal(a.clashes[0].alternatives[0].classification,'six-harmony');
 const slot=b.slots.find(s=>s.id==='hidden:month:경');assert.equal(slot.clashIds.length,2);
 assert.equal(slot.allIncidentClashesHaveCandidate,true);assert.equal(slot.reliefConfirmed,null);
 assert.equal(new Set(slot.reliefAlternatives.flatMap(r=>r.options.map(o=>o.formationId))).size,1);
 assert.ok(b.clashes.every(c=>c.alternatives[0].hypothesis==='competing-relief-review'));
});
test('missing or altered relief and hidden-slot identity fail closed',()=>{
 const x=build(six);x.root.clashes[0].alternatives=[];assert.equal(run(x).status,'invalid-evidence');
 const y=build(multi);y.root.slots.find(s=>s.id==='hidden:month:경').clashIds.pop();assert.equal(run(y).status,'invalid-evidence');
 const z=build(six);z.root.clashes[0].alternatives[0].sharedPosition='year';assert.equal(run(z).status,'invalid-evidence');
});
test('audit rejects omitted affected actions and forged restoration',()=>{
 const x=build(mixed);assert.deepEqual(audit(x).errors,[]);x.review.actions.pop();assert.ok(audit(x).errors.includes('clash-residual-action-coverage'));
 const y=build(three);y.review.slots[0].reliefConfirmed=true;assert.ok(audit(y).errors.some(e=>e.startsWith('clash-residual-slot:')));
});
test('24 source variants and four constructed controls preserve exact coverage',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
 let n=0,clashes=0,slots=0,substantial=0,actions=0,reliefs=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete),a=audit(x,!complete);assert.deepEqual(a.errors,[],c.id);n++;
  if(complete){clashes+=a.counts.clashes;slots+=a.counts.slots;substantial+=a.counts.substantialSlots;actions+=a.counts.actions;reliefs+=a.counts.reliefAlternatives;}
  else assert.ok(x.review.occurrences.every(a=>a.context==='partial'));
 }
 assert.equal(n,24);assert.equal(clashes,11);assert.equal(slots,40);assert.equal(substantial,25);assert.equal(actions,22);assert.equal(reliefs,0);
 for(const ps of [mixed,three,six,multi])assert.deepEqual(audit(build(ps)).errors,[]);
});
test('native V10 exposes clash residual context without decision authority',()=>{
 const {saju}=build(mixed),r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 assert.notEqual(r.efficacyReview.status,'invalid-evidence');assert.equal(r.decisionReview.status,'abstained');
 const c=r.efficacyReview.mechanismReview.clashResidualContext;assert.equal(c.status,'diagnostic');assert.equal(c.effective,null);
});
