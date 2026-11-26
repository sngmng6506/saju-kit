import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {observeInterpositionReview} from '../src/features/pattern/outcome-interposition-review.js';
import {observePressureDependencyReview} from '../src/features/pattern/outcome-pressure-dependency.js';
import {observeLocalityContext} from '../src/features/pattern/outcome-locality-context.js';
import {observeRoleCapacity} from '../src/features/pattern/outcome-role-capacity.js';
import {summarizeLocalityContext} from '../scripts/lib/pattern-outcome-locality-audit.mjs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const zhou=['무술','갑자','정미','경술'],synthetic=['을묘','을묘','정묘','을묘'];
const build=(ps,complete=true)=>{
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour:complete,stemForce,relativeForce:observeRelativeForce(stemForce)};
 const root=observeRootContext(prior,analyzeFormationEvidence({saju})),supply=observeGroundedSupply(prior,root),interposition=observeInterpositionReview(prior,root,supply),pressure=observePressureDependencyReview(prior,root,supply,interposition);
 const x={saju,prior,supply,interposition,pressure};
 return {...x,review:run(x)};
};
const run=x=>observeLocalityContext(x.prior,x.supply,x.interposition,x.pressure);
const audit=(x,partial=false)=>summarizeLocalityContext({id:'test'},{localityContext:x.review,groundedSupply:x.supply,roleCapacity:observeRoleCapacity(x.prior),interpositionReview:x.interposition,pressureDependencyReview:x.pressure},partial);
test('reverse nonadjacent control binds exact intervening protection, not neutralization',()=>{
 const x=build(zhou),r=x.review.relations.find(r=>r.edgeId==='visible:hour>visible:month');
 assert.equal(x.review.status,'diagnostic');assert.equal(r.order,'source-after-target');assert.equal(r.span,2);
 assert.equal(r.intervenors[0].id,'visible:day');assert.equal(r.intervenors[0].roles.intervenorToSourceControl.edgeId,'visible:day>visible:hour');
 const p=r.intervenors[0].routeRefs[0];assert.equal(p.kind,'protection');assert.equal(p.neutralizationConfirmed,null);
 assert.ok(r.originalContextBlockers.includes('nonadjacent'));assert.equal(r.effective,null);
});
test('two intervenors retain ordered identities and competing roles',()=>{
 const r=build(zhou).review.relations.find(r=>r.edgeId==='visible:year>visible:hour');
 assert.deepEqual(r.intervenors.map(m=>m.id),['visible:month','visible:day']);
 assert.ok(r.intervenors[0].motifs.includes('source-controller'));assert.ok(r.intervenors[1].motifs.includes('target-controller'));
 assert.equal(r.noninterferenceConfirmed,null);assert.equal(r.localityEffectConfirmed,null);
});
test('same-element peer does not replace nonadjacent supply or invent a chain',()=>{
 const r=build(synthetic).review.relations.find(r=>r.edgeId==='visible:year>visible:day');
 assert.ok(r.intervenors[0].motifs.includes('source-element-peer'));assert.equal(r.chains.length,0);
 assert.equal(r.originalGenerationScreen,'unresolved');assert.equal(r.effective,null);
});
test('deleted intermediate edge and detached protection route fail closed',()=>{
 const x=build(zhou);x.supply.actions=x.supply.actions.filter(e=>e.edgeId!=='visible:day>visible:hour');
 assert.equal(run(x).status,'invalid-evidence');
 const y=build(zhou);y.interposition.roleNeutral.paths=y.interposition.roleNeutral.paths.filter(p=>p.id!==JSON.stringify(['protection','day:stem','hour:stem','month:stem']));
 assert.equal(run(y).status,'invalid-evidence');
});
test('audit detects omitted intervenor and fabricated authority',()=>{
 const x=build(zhou);assert.deepEqual(audit(x).errors,[]);
 const r=x.review.relations.find(r=>r.edgeId==='visible:year>visible:hour');r.intervenors.pop();
 assert.ok(audit(x).errors.includes('locality-position:'+r.edgeId));
 const y=build(zhou);y.review.relations[0].effective=true;assert.ok(audit(y).errors.some(e=>e.startsWith('locality-edge:')));
});
test('24 source variants preserve literal relation and chain coverage',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
 let n=0,gen=0,ctl=0,chains=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete),a=audit(x,!complete);
  assert.deepEqual(a.errors,[],c.id);n++;
  if(complete){gen+=a.counts.nonadjacentGeneration;ctl+=a.counts.nonadjacentControl;chains+=a.counts.chains;}
  else assert.ok(x.review.relations.every(r=>r.contextState==='partial'));
 }
 assert.equal(n,24);assert.equal(gen,15);assert.equal(ctl,15);assert.equal(chains,7);
});
test('native V10 exposes locality context without decision authority',()=>{
 const {saju}=build(zhou),r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 assert.notEqual(r.efficacyReview.status,'invalid-evidence');assert.equal(r.decisionReview.status,'abstained');
 assert.equal(r.efficacyReview.mechanismReview.localityContext.status,'diagnostic');
});
