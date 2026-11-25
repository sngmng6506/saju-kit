import test from 'node:test';
import assert from 'node:assert/strict';
import {composeOutcomeSynthesis} from '../src/features/useful-element/outcome-synthesis.js';
import {analyzeUsefulElementSynthesis,USEFUL_ELEMENT_SYNTHESIS_VERSION} from '../src/index.js';
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?{stem:ps[i][0],branch:ps[i][1],text:ps[i]}:null]))});
const sample=()=>{
 const saju=chart(['갑자','병인','경진','임오']);
 const balance={version:'balance-useful-element-v1',status:'directional-hypothesis',strength:{direction:'strong'},branches:[{assumedDirection:'strong',candidates:[{element:'water'}]}]};
 const w={id:'w',roles:{helper:'visible:year',target:'visible:hour'},edges:[{from:'visible:hour',to:'visible:month',kind:'control'}]};
 const q={candidateId:'c',family:'wealth',status:'diagnostic',anchorIds:['visible:hour'],rules:[{id:'s',kind:'support',witnesses:[w]}]};
 const mechanism={candidateId:'c',status:'diagnostic',routes:[{ruleId:'s',witnessId:'w',status:'unresolved',unresolvedClassicalConditions:['supply']}],joint:{search:{observed:{status:'conditional-plan-found'}}}};
 const climate={policy:'climate-useful-element-v5',status:'diagnostic',requirements:[{stem:'병',exactVisibleIds:['visible:month']},{stem:'을',exactVisibleIds:[]}],groups:[{stems:['병','을'],allExactVisibleAndRootObserved:false}],alternatives:[{when:'conditional',stems:['임']}]};
 const pattern={version:'pattern-outcome-decision-v10',completeHour:true,access:{hidden:[],groups:[]},integrity:{status:'consistent'},regulationStrength:{policy:'strength-decision-v1',direction:'weak'},reviews:[q],
 assistantReview:[{candidateId:'c',status:'diagnostic',candidates:[{occurrenceId:'visible:year',classification:'observed-route-dependent',anchorAlias:false,roles:[{role:'helper',kind:'support',ruleId:'s',witnessId:'w'}]}]}],
 efficacyReview:{status:'diagnostic',mechanismReview:{selectionAuthority:false,effective:null,climate,candidates:[mechanism]}},decisionReview:{status:'abstained',pattern:{evidence:{hypothesis:null}},candidates:[{candidateId:'c',status:'abstained'}]}};
 return {saju,balance,pattern};
};
const run=x=>composeOutcomeSynthesis(x.saju,x.balance,x.pattern);
test('different strength policies remain different hypotheses and anchor is not assistant',()=>{
 const x=sample(),before=JSON.stringify(x),r=run(x);
 assert.equal(r.balance.directionComparison,'different-direction-hypotheses');
 assert.equal(r.elements.find(e=>e.element==='water').patternAnchorRefs.length,1);
 assert.equal(r.elements.find(e=>e.element==='water').patternParticipantRefs.length,0);
 assert.equal(r.candidates[0].participants[0].balance[0].membership,'outside-candidates');
 assert.equal(r.usefulElement,null);assert.equal(JSON.stringify(x),before);
});
test('exact climate stem differs from elemental membership and preserves multi-stem group',()=>{
 const r=run(sample()),a=r.candidates[0].participants[0];
 assert.deepEqual(a.climate.baselineGroupIds,['baseline:0']);assert.equal(a.climate.exactRequirementStem,null);
 assert.deepEqual(r.climate.groups[0].stems,['병','을']);
 assert.equal(r.climate.alternatives[0].conditionResolved,false);
});
test('route control of actual climate actor is not an automatic veto',()=>{
 const r=run(sample()),c=r.candidates[0].routeContacts[0];
 assert.equal(c.climateOccurrenceId,'visible:month');assert.equal(c.effectConfirmed,null);
 assert.equal(r.candidates[0].participants[0].roles[0].mechanismHypothesis,'unresolved');
 assert.equal(r.favorableElements,null);
});
test('mismatched route or exact stem identity fails closed',()=>{
 const x=sample();x.pattern.assistantReview[0].candidates[0].roles[0].witnessId='bad';
 assert.equal(run(x).status,'invalid-evidence');assert.deepEqual(run(x).candidates,[]);
 const y=sample();y.pattern.efficacyReview.mechanismReview.climate.requirements[0].exactVisibleIds=['visible:year'];
 assert.equal(run(y).status,'invalid-evidence');
});
test('partial and provisional scope do not fabricate balance direction',()=>{
 const x=sample();x.pattern.completeHour=false;x.balance.branches=[];x.balance.strength=null;
 assert.equal(run(x).status,'partial');assert.equal(run(x).balance.direction,null);
 x.pattern.access=null;assert.equal(run(x).status,'unavailable');
});
test('native synthesis fixed policies, prior chart unchanged and caller approval ignored',()=>{
 const saju=chart(['무술','갑자','정미','경술']),before=JSON.stringify(saju);
 const r=analyzeUsefulElementSynthesis({saju,birthBasis:'verified-chart',policy:USEFUL_ELEMENT_SYNTHESIS_VERSION,authorized:true,usefulElement:'wood'});
 assert.equal(r.status,'diagnostic');assert.equal(r.selectionAuthority,false);assert.equal(r.usefulElement,null);assert.equal(r.elements.length,5);assert.equal(JSON.stringify(saju),before);
 const p=analyzeUsefulElementSynthesis({saju,birthBasis:'provisional-chart',policy:USEFUL_ELEMENT_SYNTHESIS_VERSION});assert.equal(p.status,'unavailable');
});

test('duplicate candidate projections and duplicate climate requirements fail closed',()=>{
 for(const k of ['assistantReview','decision','mechanism']){
  const x=sample(),rows=k==='assistantReview'?x.pattern.assistantReview:k==='decision'?x.pattern.decisionReview.candidates:x.pattern.efficacyReview.mechanismReview.candidates;
  rows.push({...rows[0]});assert.equal(run(x).status,'invalid-evidence');
 }
 const x=sample(),rs=x.pattern.efficacyReview.mechanismReview.climate.requirements;
 rs.push({...rs[0]});assert.equal(run(x).status,'invalid-evidence');
});
test('duplicate witnesses and incompatible assistant role kind cannot be silently accepted',()=>{
 const x=sample(),ws=x.pattern.reviews[0].rules[0].witnesses;
 ws.push({...ws[0]});assert.equal(run(x).status,'invalid-evidence');
 const y=sample();y.pattern.assistantReview[0].candidates[0].roles[0].kind='rescue';assert.equal(run(y).status,'invalid-evidence');
});
