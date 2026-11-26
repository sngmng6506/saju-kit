import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {observeCombinationContext} from '../src/features/pattern/outcome-combination-context.js';
import {observeCombinationResidualContext} from '../src/features/pattern/outcome-combination-residual.js';
import {observeRoleCapacity} from '../src/features/pattern/outcome-role-capacity.js';
import {summarizeCombinationResidual} from '../scripts/lib/pattern-outcome-combination-residual-audit.mjs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const build=(ps,complete=true)=>{
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour:complete,stemForce,relativeForce:observeRelativeForce(stemForce)};
 const formation=analyzeFormationEvidence({saju}),root=observeRootContext(prior,formation),supply=observeGroundedSupply(prior,root),combination=observeCombinationContext(prior,formation);
 const x={saju,prior,formation,root,supply,combination};return {...x,review:run(x)};
};
const run=x=>observeCombinationResidualContext(x.prior,x.formation,x.combination,x.root,x.supply);
const audit=(x,partial=false)=>summarizeCombinationResidual({id:'test'},{combinationResidualContext:x.review,combinationContext:x.combination,roleCapacity:observeRoleCapacity(x.prior),rootContext:x.root,groundedSupply:x.supply},partial);
// Source contrast cases from Xu's commentary, 论十干合而不合.
// These are structural regression controls, not independent effect labels.
const remote=['정묘','병오','병자','임진'],remoteCombine=['을유','갑신','정사','경술'],leave=['신유','병신','경자','병술'],self=['무술','갑자','기사','무진'],separated=['경오','을유','갑자','을해'],adjacent=['병술','임진','정미','임인'];
test('remote retained and remote still combined source examples are not forced into one effect',()=>{
 const a=build(remote).review,b=build(remoteCombine).review;
 assert.equal(a.pairs[0].span,3);assert.equal(b.pairs[0].span,3);
 assert.equal(a.pairs[0].contactHypothesis,'remote-contact-review');assert.equal(b.pairs[0].contactHypothesis,'intervening-control-review');
 assert.ok([a,b].every(r=>r.pairs.every(p=>p.restrictionConfirmed===null&&p.retentionConfirmed===null)));
});
test('self combination is not external removal, and original supply is retained as evidence',()=>{
 const r=build(self).review;assert.equal(r.pairs[0].scope,'self-combination-not-external-removal');
 assert.ok(r.participants.some(p=>p.dayReference&&p.incoming.length&&p.retentionConfirmed===null));
});
test('one retained role and separated versus adjacent competing pairs are not automatic allocation',()=>{
 const a=build(leave).review,b=build(separated).review,c=build(adjacent).review;
 assert.equal(a.pairs.length,2);assert.equal(b.pairs.length,2);assert.equal(c.pairs.length,2);
 assert.ok(b.pairs.some(p=>p.contactHypothesis==='local-contact-hypothesis'));
 assert.ok(c.pairs.every(p=>p.contactHypothesis==='competing-partner-review'));
 const m=a.participants.find(p=>p.id==='visible:month'),h=m.alternatives.find(p=>p.id==='visible:hour');
 assert.equal(h.access,'other-contact-review');assert.equal(h.substitutionConfirmed,null);
});
test('original action inventory is unchanged and missing pair or forged contact fails closed',()=>{
 const x=build(remote);assert.ok(x.review.actions.length);
 for(const e of x.review.actions){assert.equal(e.effective,null);assert.equal(e.originalGenerationScreen,x.supply.actions.find(q=>q.edgeId===e.edgeId).generationScreen);}
 x.combination.pairs.pop();assert.equal(run(x).status,'invalid-evidence');
 const y=build(separated);y.combination.pairs[0].competing=[];assert.equal(run(y).status,'invalid-evidence');
});
test('audit detects missing actions and false retention',()=>{
 const x=build(leave);assert.deepEqual(audit(x).errors,[]);x.review.actions.pop();assert.ok(audit(x).errors.includes('combination-residual-action-coverage'));
 const y=build(self);y.review.participants[0].retentionConfirmed=true;assert.ok(audit(y).errors.some(e=>e.startsWith('combination-residual-participant:')));
});
test('24 source variants and six commentary controls preserve exact evidence',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
 let n=0,pairs=0,participants=0,actions=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete),a=audit(x,!complete);assert.deepEqual(a.errors,[],c.id);n++;
  if(complete){pairs+=a.counts.pairs;participants+=a.counts.participants;actions+=a.counts.actions;}else assert.ok(x.review.participants.every(p=>p.retainedEvidence==='partial'));
 }
 assert.equal(n,24);assert.equal(pairs,5);assert.equal(participants,9);assert.equal(actions,98);
 for(const ps of [remote,remoteCombine,leave,self,separated,adjacent])assert.deepEqual(audit(build(ps)).errors,[]);
});
test('native V10 exposes residual combination context without decision authority',()=>{
 const {saju}=build(self),r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 assert.notEqual(r.efficacyReview.status,'invalid-evidence');assert.equal(r.decisionReview.status,'abstained');
 assert.equal(r.efficacyReview.mechanismReview.combinationResidualContext.status,'diagnostic');
});
