import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {strengthGuardIds} from '../src/features/pattern/outcome-strength-guard-contract.js';
import {claimReviewTemplate,adjudicateClaims} from '../scripts/lib/pattern-outcome-claim-evaluation.mjs';
import {buildStrengthGuardPacket,retrospectiveGuardIntake,compileReviewedGuardRestrictions,replayReviewedGuards,surveyGuardSensitivity} from '../scripts/lib/pattern-strength-guard-review.mjs';
import {compileReplenishmentNetwork} from '../src/features/pattern/outcome-replenishment-network.js';
import {compareReplenishmentBurden} from '../src/features/pattern/outcome-burden-comparison.js';
import {synthesizeContextualStrength} from '../src/features/pattern/outcome-strength-synthesis.js';
const source={work:'synthetic',commentator:'synthetic',edition:'synthetic',chapter:'synthetic',passage:'synthetic',url:'https://example.test'};
const intake={version:'p1-5b-intake-v1',candidates:[{id:'fixture',pillars:['갑자','병인','무진','기미'],source}]};
const packet=buildStrengthGuardPacket(intake),digest='synthetic-digest';
function review(id,values={},scope='ordinary'){
 const t=claimReviewTemplate(packet,digest);
 return {...t,reviewerId:id,noEngineOutputConsulted:true,noPriorLabelsConsulted:true,priorExposure:'none-declared',
  charts:t.charts.map(c=>({...c,scope,rationale:'synthetic scope'})),
  responses:t.responses.map((r,i)=>({...r,label:values[strengthGuardIds[i]]??'undetermined',sourceLocator:'synthetic locator',rationale:'synthetic evidence',
   evidenceBasis:Object.hasOwn(values,strengthGuardIds[i])?'explicit-condition':'source-silent',sourceExcerpt:Object.hasOwn(values,strengthGuardIds[i])?'synthetic exact premise':''}))};
}
const input=()=>{
 const x={completeHour:true,nodes:[{id:'day:stem',rootIds:['r']},{id:'month:stem',rootIds:['s']}],links:[],targets:['day:stem']};
 return {...x,burden:compareReplenishmentBurden({...x,actions:[{id:JSON.stringify(['control','month:stem','day:stem']),kind:'control',from:'month:stem',to:'day:stem',actualOperationState:'unresolved'}],replenishmentPacket:compileReplenishmentNetwork(x).packet})};
};
test('retrospective queue contains all five exact predicates per primary case, not prior verdicts',()=>{
 const audit=JSON.parse(readFileSync(new URL('./fixtures/strength-audit-v1.json',import.meta.url),'utf8'));
 const q=buildStrengthGuardPacket(retrospectiveGuardIntake(audit));
 assert.equal(q.charts.length,53);assert.equal(q.tasks.length,265);
 assert.equal(q.scope,'source-guard-review-not-independent-gold');
 assert.ok(q.charts.every(c=>!Object.hasOwn(c,'reference')&&!Object.hasOwn(c.source,'evidence')));
 assert.ok(q.tasks.every(t=>t.target.actor==='visible:day'&&strengthGuardIds.includes(t.target.guard)));
});
test('determinate guard claims cannot be declared on verdict, proxy, silence or wrong scope alone',()=>{
 const a=review('A',{'deep-root-available':'yes'}),b=review('B',{'deep-root-available':'yes'});
 for(const basis of ['verdict-only','structural-proxy','scope-mismatch','source-silent','ambiguous']){
  const c={...b,responses:b.responses.map((r,i)=>i?r:{...r,evidenceBasis:basis})};
  assert.equal(adjudicateClaims(packet,digest,[a,c]).status,'invalid-review');
 }
 const no=review('B',{'deep-root-available':'no'});
 assert.deepEqual(compileReviewedGuardRestrictions(packet,digest,[a,no]).rows[0].restrictions,[]);
 assert.deepEqual(compileReviewedGuardRestrictions(packet,digest,[a,review('B',{'deep-root-available':'yes'},'uncertain')]).rows[0].restrictions,[]);
 assert.equal(compileReviewedGuardRestrictions(packet,digest,[a]).status,'pending');
});
test('agreement fixes only exact guard polarity and never inserts facts into the original packet',()=>{
 const values={'deep-root-available':'yes','control-exceeds-support':'no'};
 const result=replayReviewedGuards(packet,digest,[review('A',values),review('B',values)],input);
 assert.equal(result.status,'diagnostic-unverified-review',JSON.stringify(result.rows));
 const r=result.rows[0];assert.equal(r.baseline.strongPossible,true);assert.equal(r.baseline.weakPossible,true);
 assert.equal(r.restricted.strongPossible,true);assert.equal(r.restricted.weakPossible,false);
 assert.equal(r.actualStrengthState,'unresolved');assert.equal(result.summary.reducedAmbiguity,1);
 assert.equal(result.independentGoldCases,0);assert.equal(result.actualAccuracy,null);
 assert.deepEqual(r.restrictions,[{targetId:'day:stem',guard:'deep-root-available',value:true},{targetId:'day:stem',guard:'control-exceeds-support',value:false}]);
});
test('unsupported positive constraint is incompatible rather than proof of weakness',()=>{
 const values={'indirect-support-sufficient':'yes'};
 const r=replayReviewedGuards(packet,digest,[review('A',values),review('B',values)],input);
 assert.equal(r.rows[0].status,'incompatible-constraints',JSON.stringify(r.rows));
 assert.equal(r.rows[0].restricted.strongPossible,null);assert.equal(r.rows[0].restricted.weakPossible,null);
 assert.equal(r.summary.incompatible,1);assert.equal(r.rows[0].actualStrengthState,'unresolved');
});
test('guard restrictions reject unknown actor, policy predicate and contradictory duplicate',()=>{
 const x=input(),r={targetId:'day:stem',guard:'deep-root-available',value:true};
 for(const restrictions of [[{...r,targetId:'fake'}],[{...r,guard:'fake'}],[r,{...r,value:false}]]){
  assert.equal(synthesizeContextualStrength({...x,scenarioRestrictions:restrictions}).reason,'scenario-restriction-contract');
 }
 assert.equal(synthesizeContextualStrength({...x,scenarioRestrictions:[{...r,guard:'indirect-support-sufficient'}]}).reason,'scenario-restriction-contract');
});
test('source silence and reviewer disagreement never restrict a hypothesis',()=>{
 const r=replayReviewedGuards(packet,digest,[review('A',{'deep-root-available':'yes'}),review('B',{'deep-root-available':'no'})],input);
 assert.equal(r.status,'diagnostic-unverified-review');assert.deepEqual(r.rows[0].restrictions,[]);
 assert.deepEqual(r.rows[0].baseline,r.rows[0].restricted);
 assert.equal(compileReviewedGuardRestrictions({...packet,tasks:packet.tasks.slice(1)},digest,[review('A'),review('B')]).status,'invalid-review');
});

test('single-guard sensitivity enumerates both signs without consulting source verdicts',()=>{
 const r=surveyGuardSensitivity(input());
 assert.equal(r.status,'diagnostic',r.reason);assert.equal(r.rows.length,10);
 assert.equal(r.baseline.strongPossible,true);assert.equal(r.baseline.weakPossible,true);
 const c=r.rows.find(x=>x.guard==='control-exceeds-support'&&x.value);
 assert.equal(c.weakPossible,true);assert.equal(c.strongPossible,false);assert.equal(c.reducesDirectionAmbiguity,true);
 const n=r.rows.find(x=>x.guard==='control-exceeds-support'&&!x.value);
 assert.equal(n.weakPossible,false);assert.equal(n.strongPossible,true);
 assert.equal(r.rows.find(x=>x.guard==='indirect-support-sufficient'&&x.value).status,'incompatible-constraints');
 assert.equal(r.actualAccuracy,null);assert.equal(r.actualStrengthState,'unresolved');
});
