import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {observeOutcomeAccess} from '../src/features/pattern/outcome-access.js';
import {observeBranchAccessContext} from '../src/features/pattern/outcome-branch-context.js';
import {observeHiddenAccessContext} from '../src/features/pattern/outcome-hidden-access.js';
import {observeRoleCapacity} from '../src/features/pattern/outcome-role-capacity.js';
import {summarizeHiddenAccess} from '../scripts/lib/pattern-outcome-hidden-access-audit.mjs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const zhou=['무술','갑자','정미','경술'],synthetic=['갑인','경신','병오','을묘'];
const run=x=>observeHiddenAccessContext(x.prior,x.branch,x.root,x.supply);
const build=(ps,complete=true)=>{
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour:complete,stemForce,relativeForce:observeRelativeForce(stemForce)};
 const formation=analyzeFormationEvidence({saju}),root=observeRootContext(prior,formation),supply=observeGroundedSupply(prior,root);
 const branch=observeBranchAccessContext(prior,observeOutcomeAccess(prior,formation),formation);
 const x={saju,prior,root,supply,branch};return {...x,review:run(x)};
};
const audit=(x,partial=false)=>summarizeHiddenAccess({id:'test'},{hiddenAccessContext:x.review,rootContext:x.root,groundedSupply:x.supply,branchContext:x.branch,roleCapacity:observeRoleCapacity(x.prior)},partial);
test('day-master root is not an external exact projection; same element does not substitute',()=>{
 const x=build(synthetic),r=x.review;
 const wood=r.slots.find(s=>s.id==='hidden:year:갑'),fire=r.slots.find(s=>s.id==='hidden:year:병');
 assert.equal(r.status,'diagnostic');assert.deepEqual(wood.projections.map(p=>p.visibleId),['visible:year']);
 assert.ok(wood.sameElementOtherStemIds.includes('visible:hour'));
 assert.equal(fire.dayReferenceMatches,true);assert.equal(fire.projections.length,0);
 assert.equal(wood.accessConfirmed,null);
});
test('local branch donor never borrows outside same-element root',()=>{
 const r=build(synthetic).review,s=r.slots.find(s=>s.id==='hidden:year:갑'),n=r.branchNodes.find(n=>n.nodeId===s.nodeId);
 assert.ok(s.externalRootIds.includes('hidden:hour:을'));assert.ok(!n.groundedRootIds.includes('hidden:hour:을'));
 assert.ok(n.contestedRootIds.includes(s.id));assert.equal(n.independentSupplyConfirmed,null);
});
test('co-constituents remain non-action relations; graph edges retain literal identities',()=>{
 const x=build(zhou),r=x.review;
 assert.ok(r.withinBranch.length);assert.ok(r.withinBranch.every(e=>e.graphEdge===false&&e.effective===null&&!x.supply.actions.some(a=>a.edgeId===e.from+'>'+e.to)));
 assert.ok(r.relations.some(e=>e.literalActionIds.length>1));
 assert.equal(new Set(r.relations.flatMap(e=>e.literalActionIds)).size,r.relations.reduce((n,e)=>n+e.literalActionIds.length,0));
 assert.ok(r.relations.every(e=>e.effective===null));
});
test('omitted local roots, forged projection and missing actions fail closed',()=>{
 const x=build(synthetic);x.branch.hidden.find(s=>s.occurrenceId==='hidden:year:갑').exactProjectionIds.push('visible:hour');assert.equal(run(x).status,'invalid-evidence');
 const y=build(synthetic);y.supply.nodes.find(n=>n.nodeId==='year:branch:wood').groundedRootIds.push('hidden:hour:을');assert.equal(run(y).status,'invalid-evidence');
 const z=build(zhou);z.supply.actions.pop();assert.equal(run(z).status,'invalid-evidence');
});
test('audit rejects detached projection alternative and false within-branch action',()=>{
 const x=build(zhou);assert.deepEqual(audit(x).errors,[]);
 const r=x.review.relations.find(e=>e.alternativeVisibleActionIds.length);assert.ok(r);r.alternativeVisibleActionIds=[];
 assert.ok(audit(x).errors.some(e=>e.startsWith('hidden-access-relation-provenance:')));
 const y=build(zhou);y.review.withinBranch[0].graphEdge=true;assert.ok(audit(y).errors.includes('hidden-access-within-branch'));
});
test('24 source variants preserve exact graph and projection coverage',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
 let n=0,slots=0,nodes=0,relations=0,actions=0,within=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete),a=audit(x,!complete);assert.deepEqual(a.errors,[],c.id);n++;
  if(complete){slots+=a.counts.slots;nodes+=a.counts.branchNodes;relations+=a.counts.relations;actions+=a.counts.literalActions;within+=a.counts.withinBranch;}
  else assert.ok(x.review.slots.every(s=>s.accessContext==='partial'));
 }
 assert.equal(n,24);assert.equal(slots,132);assert.equal(nodes,118);assert.equal(relations,725);assert.equal(actions,859);assert.equal(within,106);
});
test('native V10 exposes hidden access without decision authority',()=>{
 const {saju}=build(zhou),r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 assert.notEqual(r.efficacyReview.status,'invalid-evidence');assert.equal(r.decisionReview.status,'abstained');
 assert.equal(r.efficacyReview.mechanismReview.hiddenAccessContext.status,'diagnostic');
});
