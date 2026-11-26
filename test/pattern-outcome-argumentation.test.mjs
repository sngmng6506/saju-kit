import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateArguments} from '../src/features/pattern/outcome-argumentation.js';
import {observeArgumentReview} from '../src/features/pattern/outcome-argument-review.js';
import {summarizeArgumentReview} from '../scripts/lib/pattern-outcome-argument-audit.mjs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {observeInterpositionReview} from '../src/features/pattern/outcome-interposition-review.js';
import {observePressureDependencyReview} from '../src/features/pattern/outcome-pressure-dependency.js';
import {observeLocalityContext} from '../src/features/pattern/outcome-locality-context.js';
import {observeRoleCapacity} from '../src/features/pattern/outcome-role-capacity.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const p=(id,level='structural-hypothesis')=>({id,kind:'test',subject:id,level});
const lit=(propositionId,sign='for')=>({propositionId,sign});
const refs=[{owner:'fixture',id:'control',field:'state'}];
const f=(id,propositionId,sign='for',applicability='observed')=>({id,...lit(propositionId,sign),refs,applicability});
const rule=(id,conclusion,premises,applicability='observed')=>({id,policyId:'test-policy',conclusion,premises,refs,applicability});
const run=(propositions,evidence,rules,scope='complete')=>evaluateArguments({propositions,evidence,rules,scope});
const read=(r,id)=>r.judgments.find(x=>x.id===id);
test('four states retain independent proof signs without explosion or negation by failure',()=>{
 const r=run([p('a'),p('b'),p('c'),p('d'),p('e','effect-hypothesis')],[f('a+','a'),f('b-','b','against'),f('c+','c'),f('c-','c','against')],[]);
 assert.deepEqual(r.judgments.map(j=>j.state),['supported','opposed','conflicting','unresolved','unresolved']);
 assert.ok(r.judgments.every(j=>j.effective===null));assert.equal(r.selectionAuthority,false);
});
test('explicit conjunction, alternative rules and conflict are not votes',()=>{
 const r=run([p('a'),p('b'),p('c')],[f('1','a'),f('2','a'),f('3','b','against')],
  [rule('and',lit('c'),[lit('a'),lit('b')]),rule('alt',lit('c'),[lit('a')]),rule('counter',lit('c','against'),[lit('b','against')])]);
 assert.equal(read(r,'c').state,'conflicting');assert.equal(read(r,'c').support.rank,1);
 assert.deepEqual(read(r,'c').support.witnesses,[{kind:'rule',id:'alt'}]);
 assert.equal(r.ruleResults.find(q=>q.id==='and').status,'premises-unresolved');
});
test('unseeded cycles stay unresolved; seeded chains have strictly earlier proof ranks',()=>{
 const ps=[p('a'),p('b'),p('c')],rs=[rule('ab',lit('b'),[lit('a')]),rule('ba',lit('a'),[lit('b')]),rule('bc',lit('c'),[lit('b')])];
 assert.ok(run(ps,[],rs).judgments.every(j=>j.state==='unresolved'));
 const r=run(ps,[f('seed','a')],rs);assert.deepEqual(r.judgments.map(j=>j.support.rank),[0,1,2]);
 assert.equal(r.ruleResults.find(q=>q.id==='ba').firstRankWitness,false);
});
test('partial scope, malformed references and effect promotion fail safely',()=>{
 const ps=[p('a'),p('b'),p('effect','effect-hypothesis')],fs=[f('seed','a','for','complete-only')];
 assert.equal(read(run(ps,fs,[rule('ab',lit('b'),[lit('a')])],'partial'),'b').state,'unresolved');
 assert.equal(run(ps,[f('x','effect')],[]).status,'invalid-evidence');
 assert.equal(run(ps,[f('a','a')],[rule('x',lit('effect'),[lit('a')])]).status,'invalid-evidence');
 assert.equal(run(ps,[f('a','a')],[rule('x',lit('b'),[lit('foreign')])]).status,'invalid-evidence');
 assert.equal(run([null],[],[]).status,'invalid-evidence');
 assert.equal(run(ps,[],[rule('x',lit('b'),[])]).status,'invalid-evidence');
});
test('large input fails explicitly rather than returning a partial verdict',()=>{
 assert.equal(run(Array.from({length:12001},(_,i)=>p('p'+i)),[],[]).status,'unavailable');
});
const build=(ps,complete=true)=>{
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour:complete,stemForce,relativeForce:observeRelativeForce(stemForce)};
 const root=observeRootContext(prior,analyzeFormationEvidence({saju})),supply=observeGroundedSupply(prior,root),interposition=observeInterpositionReview(prior,root,supply);
 const pressure=observePressureDependencyReview(prior,root,supply,interposition),locality=observeLocalityContext(prior,supply,interposition,pressure);
 const review=observeArgumentReview(prior,supply,pressure,locality);
 return {saju,prior,supply,pressure,locality,review};
};
const audit=(x,partial=false)=>summarizeArgumentReview({id:'test'},{argumentReview:x.review,groundedSupply:x.supply,pressureDependencyReview:x.pressure,localityContext:x.locality,roleCapacity:observeRoleCapacity(x.prior)},partial);
test('positive structural generation does not become an effective action',()=>{
 const x=build(['을묘','을묘','정묘','을묘']);assert.deepEqual(audit(x).errors,[]);
 assert.equal(x.review.actions.filter(a=>read(x.review,a.structuralPropositionId).state==='supported').length,2);
 assert.ok(x.review.actions.every(a=>read(x.review,a.effectPropositionId).state==='unresolved'));
});
test('source variants preserve structural scope and all actual effects remain unresolved',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
 let n=0,actions=0,support=0,oppose=0,unknown=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete),a=audit(x,!complete);assert.deepEqual(a.errors,[],c.id);n++;
  assert.equal(a.counts.actions,a.counts.effectsUnresolved);
  if(complete){actions+=a.counts.actions;support+=a.counts.structural.supported;oppose+=a.counts.structural.opposed;unknown+=a.counts.structural.unresolved;}
  else assert.equal(a.counts.structural.unresolved,a.counts.actions);
 }
 assert.equal(n,24);assert.equal(actions,60);assert.equal(support,2);assert.equal(oppose,37);assert.equal(unknown,21);
});
test('audit rejects altered proof and contrast parity rejects forged dominance',()=>{
 const x=build(['무술','갑자','정미','경술']);assert.deepEqual(audit(x).errors,[]);
 x.review.judgments[0].state='supported';assert.ok(audit(x).errors.includes('argument-review-replay'));
 const y=build(['무술','갑자','정미','경술']),q=y.pressure.pressures.find(p=>p.comparison);
 q.contrast=q.contrast==='controller-evidence-dominance-stable'?'target-evidence-dominance-stable':'controller-evidence-dominance-stable';
 assert.equal(observeArgumentReview(y.prior,y.supply,y.pressure,y.locality).status,'invalid-evidence');
});
test('native V10 exposes argument review without decision authority',()=>{
 const {saju}=build(['무술','갑자','정미','경술']);
 const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 assert.notEqual(r.efficacyReview.status,'invalid-evidence');assert.equal(r.decisionReview.status,'abstained');
 assert.equal(r.efficacyReview.mechanismReview.argumentReview.status,'diagnostic');
});
