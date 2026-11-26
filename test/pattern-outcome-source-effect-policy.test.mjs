import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {elementRelation} from '../src/core/elements.js';
import {sourceEffectClauses,evaluateSourceClauseScenario,reviewSourceEffectPolicy} from '../src/features/pattern/outcome-source-effect-policy.js';
import {summarizeSourceEffectPolicy} from '../scripts/lib/pattern-outcome-source-effect-audit.mjs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const registry=sourceEffectClauses();
test('five textual families cover exactly the five directed element pairs each',()=>{
 assert.equal(registry.length,25);assert.equal(new Set(registry.map(c=>c.id)).size,25);
 assert.equal(new Set(registry.map(c=>c.family)).size,5);
 for(const c of registry){
  const r=elementRelation(c.fromElement,c.toElement);
  assert.equal(r.direction,'left-to-right');assert.equal(r.type,c.kind);
  assert.equal(c.actualEffectRule,false);assert.equal(c.authority,'source-conditional-only');
  assert.ok(c.source.startsWith('https://'));assert.ok(c.quote.length);
  assert.equal(c.premiseScope,'element-context-not-occurrence-profile');
  assert.ok(Object.isFrozen(c));
 }
 for(const family of new Set(registry.map(c=>c.family)))assert.equal(registry.filter(c=>c.family===family).length,5);
 assert.ok(Object.isFrozen(registry));
});
test('all source clauses use signed assumption logic without effect promotion',()=>{
 for(const c of registry){
  for(const [predicateState,applicability,consequenceState] of [
   ['supported','supported','follows-under-explicit-assumptions'],
   ['opposed','opposed','not-established'],
   ['conflicting','conflicting','assumptions-conflict'],
   ['unresolved','unresolved','not-established']]){
   const r=evaluateSourceClauseScenario(c.id,{relationState:'supported',predicateState});
   assert.equal(r.applicability,applicability,c.id);assert.equal(r.consequenceState,consequenceState,c.id);
   assert.equal(r.conditionalConsequence,c.consequence);
   assert.equal(r.actualEffectState,'unresolved');assert.equal(r.effectConfirmed,null);assert.equal(r.selectionAuthority,false);
  }
  const partial=evaluateSourceClauseScenario(c.id,{relationState:'supported',predicateState:'supported',scope:'partial'});
  assert.equal(partial.applicability,'unresolved');
  const noRelation=evaluateSourceClauseScenario(c.id,{relationState:'opposed',predicateState:'supported'});
  assert.equal(noRelation.applicability,'opposed');assert.equal(noRelation.actualEffectState,'unresolved');
 }
 assert.equal(evaluateSourceClauseScenario('unknown',{relationState:'supported',predicateState:'supported'}).status,'invalid-evidence');
 assert.equal(evaluateSourceClauseScenario(registry[0].id,{relationState:'supported',predicateState:'yes'}).status,'invalid-evidence');
});
const make=(kind='generate',complete=true)=>{
 const from={id:'visible:month',position:'month',layer:'visible',element:'wood',dayReference:false};
 const to={id:'visible:day',position:'day',layer:'visible',element:kind==='generate'?'fire':'earth',dayReference:true};
 const edgeId=from.id+'>'+to.id,base={status:complete?'diagnostic':'partial',completeHour:complete,selectionAuthority:false};
 const e={edgeId,from:from.id,to:to.id,kind,effective:null,selectionAuthority:false};
 const structural={id:'structural',subject:edgeId,level:'structural-hypothesis',kind:kind==='generate'?'existing-generation-screen-met':'stable-source-profile-dominance',state:complete?'opposed':'unresolved',effective:null};
 const effect={id:'effect',subject:edgeId,level:'effect-hypothesis',kind:'actual-action-effective',state:'unresolved',effective:null,support:{rank:null},opposition:{rank:null}};
 const argument={...base,effective:null,actions:[{...e,structuralPropositionId:structural.id,effectPropositionId:effect.id,expectedStructuralState:structural.state}],judgments:[structural,effect]};
 const supply={...base,effectiveSupply:null,actions:[e]};
 const prior={completeHour:complete,stemForce:{occurrences:[from,to]}};
 return {prior,argument,supply,strength:{direction:'weak',policy:'fixture'}};
};
const review=x=>reviewSourceEffectPolicy(x.prior,x.argument,x.supply,x.strength);
const audit=(x,r)=>summarizeSourceEffectPolicy({id:'fixture'},{sourceEffectReview:r,argumentReview:x.argument,groundedSupply:x.supply,roleCapacity:{occurrences:x.prior.stemForce.occurrences}},x.strength,!x.prior.completeHour);
test('production structural opposition and day weakness do not establish an element predicate',()=>{
 const x=make('control'),r=review(x),a=r.actions[0];
 assert.equal(r.status,'diagnostic');assert.equal(a.clauses.length,2);
 assert.equal(a.structuralUndercuts[0].actualEffectRebuttal,false);
 const weak=a.clauses.find(c=>c.predicate==='weak');
 assert.equal(weak.dayHypothesisContext.fit,'aligned');assert.equal(weak.dayHypothesisContext.substitutionConfirmed,null);
 assert.equal(weak.predicateState,'unresolved');assert.equal(weak.applicability,'unresolved');
 assert.equal(a.actualEffectState,'unresolved');assert.deepEqual(audit(x,r).errors,[]);
});
test('partial hour and unsupported strength never become negative evidence',()=>{
 const x=make('control',false),r=review(x),a=r.actions[0];
 assert.equal(r.status,'partial');assert.equal(a.structuralUndercuts.length,0);
 assert.equal(a.clauses.find(c=>c.predicate==='weak').dayHypothesisContext.fit,'unresolved');
 assert.ok(a.clauses.every(c=>c.applicability==='unresolved'));assert.deepEqual(audit(x,r).errors,[]);
});
test('invalid binding and manufactured effect proof fail closed',()=>{
 const x=make();x.argument.judgments[1].support.rank=0;assert.equal(review(x).status,'invalid-evidence');
 const y=make();y.argument.actions[0].effectPropositionId='structural';assert.equal(review(y).status,'invalid-evidence');
 const z=make();z.argument.judgments[0].kind='actual-action-effective';assert.equal(review(z).status,'invalid-evidence');
});
test('audit detects fabricated premise satisfaction and omitted source clause',()=>{
 const x=make(),r=review(x);assert.deepEqual(audit(x,r).errors,[]);
 r.actions[0].clauses[0].predicateState='supported';r.actions[0].clauses.pop();
 assert.ok(audit(x,r).errors.includes('source-effect-replay'));
});
test('native V10 source packet binds all 24 variants and preserves abstention',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
 let n=0,actions=0,clauses=0,undercuts=0;
 for(const c of packet.cases)for(const partial of [false,true]){
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,partial&&i===3?null:{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  const a=summarizeSourceEffectPolicy(c,r.efficacyReview?.mechanismReview,r.regulationStrength,partial);
  assert.deepEqual(a.errors,[],c.id);assert.equal(r.decisionReview.status,'abstained');n++;
  if(!partial){actions+=a.counts.actions;clauses+=a.counts.clauses;undercuts+=a.counts.undercuts;}
 }
 assert.equal(n,24);assert.equal(actions,60);assert.equal(clauses,154);assert.equal(undercuts,37);
});
