import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {observeInterpositionReview} from '../src/features/pattern/outcome-interposition-review.js';
import {summarizeScreenBottlenecks} from '../scripts/lib/pattern-outcome-screen-bottlenecks.mjs';
const build=(ps,complete=true)=>{
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour:complete,stemForce,relativeForce:observeRelativeForce(stemForce)};
 const root=observeRootContext(prior,analyzeFormationEvidence({saju})),supply=observeGroundedSupply(prior,root);
 return {supply,interposition:observeInterpositionReview(prior,root,supply)};
};
const report=(x,partial=false)=>summarizeScreenBottlenecks({id:'test'},x.supply,x.interposition,partial);
const zhou=['무술','갑자','정미','경술'],synthetic=['을묘','을묘','정묘','을묘'];
test('structural screen accounting preserves actual positive and negative controls',()=>{
 const r=report(build(synthetic));assert.deepEqual(r.errors,[]);
 assert.equal(r.generation.visible.total,3);assert.equal(r.generation.visible.screened,2);
 assert.equal(r.generation.visible.soleGroupCounts.locality,1);assert.equal(r.policyChanged,false);assert.equal(r.effectConfirmed,null);
});
test('all visible paths retain exact pressure references and no neutralization authority',()=>{
 const x=build(zhou),r=report(x);assert.deepEqual(r.errors,[]);
 assert.ok(r.generation.visibleRows.some(a=>a.sourcePressureRefs.length||a.targetPressureRefs.length));
 for(const a of r.generation.visibleRows)for(const ref of [...a.sourcePressureRefs,...a.targetPressureRefs])assert.equal(ref.neutralizationConfirmed,null);
 const row=r.generation.visibleRows.find(a=>a.reasons.includes('context:source-local-rooted-control'));
 if(row)assert.ok(row.groups.includes('source-pressure')&&!row.groups.includes('other-context'));
});
test('missing hour aliases are one category, not an extra context blocker',()=>{
 const r=report(build(zhou,false),true);assert.deepEqual(r.errors,[]);
 assert.equal(r.generation.visible.screened,0);assert.equal(r.interposition.visible.screened,0);
 for(const a of r.generation.visibleRows){assert.ok(a.groups.includes('missing-hour'));assert.ok(!a.groups.includes('other-context'));}
});
test('audit rejects fabricated generation screen and detached pressure reference',()=>{
 const x=build(zhou),e=x.supply.actions.find(a=>a.kind==='generate'&&a.sourcePressure.some(p=>p.donorState!=='no-substantial-root-observed')&&a.from.startsWith('visible:'));
 assert.ok(e);e.generationScreen='grounded-generation-context-screen-met';
 assert.ok(report(x).errors.includes('generation-screen-mismatch:'+e.edgeId));
 const p=e.sourcePressure.find(p=>p.donorState!=='no-substantial-root-observed');p.nodeId='foreign';
 assert.ok(report(x).errors.some(s=>s.startsWith('generation-pressure-binding:')));
});
test('audit rejects omitted interposition blocker and fabricated screen',()=>{
 const x=build(zhou),p=x.interposition.roleNeutral.paths.find(p=>p.blockers.length);assert.ok(p);
 p.blockers.pop();p.structuralScreen='grounded-structure-screen-met';
 assert.ok(report(x).errors.includes('interposition-screen-mismatch:'+p.id));
});
test('source packet 24 variants preserve screen denominators and non-authority',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
 let variants=0,visibleGen=0,visibleInter=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const r=report(build(c.pillars,complete),!complete);
  assert.deepEqual(r.errors,[],c.id);variants++;
  for(const k of ['generation','interposition']){
   assert.equal(r[k].all.total,r[k].visible.total+r[k].hidden.total,c.id);
   assert.equal(r[k].all.screened,r[k].visible.screened+r[k].hidden.screened,c.id);
  }
  if(complete){visibleGen+=r.generation.visible.total;visibleInter+=r.interposition.visible.total;assert.equal(r.generation.visible.screened,0);assert.equal(r.interposition.visible.screened,0);}
 }
 assert.equal(variants,24);assert.equal(visibleGen,34);assert.equal(visibleInter,28);
});
