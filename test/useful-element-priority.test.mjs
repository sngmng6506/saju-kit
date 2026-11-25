import test from 'node:test';
import assert from 'node:assert/strict';
import {observeSynthesisPriority} from '../src/features/useful-element/synthesis-priority.js';
import {analyzeUsefulElementSynthesis,USEFUL_ELEMENT_SYNTHESIS_VERSION} from '../src/index.js';
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?{stem:ps[i][0],branch:ps[i][1],text:ps[i]}:null]))});
const sample=()=>{
 const saju=chart(['정사','임자','신사','정유']);
 const contact={ruleId:'d',witnessId:'w',from:'visible:month',to:'visible:year',edgeKind:'control',scope:'mandatory',anchorId:null,climateStem:'정',climateOccurrenceId:'visible:year',effectConfirmed:null};
 const synthesis={status:'diagnostic',completeHour:true,balance:{directionComparison:'different-direction-hypotheses',branches:[{assumedDirection:'weak',candidates:[{element:'metal'}]},{assumedDirection:'strong',candidates:[{element:'fire'}]}]},climate:{groups:[{id:'baseline:0',stems:['정'],elements:['fire']}],alternatives:[{id:'alternative:0',stems:['병'],elements:['fire']}]},
 candidates:[{candidateId:'c',family:'hurting-officer',status:'diagnostic',participants:[{occurrenceId:'visible:year',element:'fire'}],routeContacts:[contact]}]};
 const pattern={access:{hidden:[]},reviews:[{candidateId:'c',rules:[{id:'d',kind:'damage',witnesses:[{id:'w',edges:[{from:contact.from,to:contact.to,kind:contact.edgeKind}]}]}]}],efficacyReview:{mechanismReview:{climate:{requirements:[{stem:'정',element:'fire',exactVisibleIds:['visible:year','visible:hour'],status:'visible-root-review'}]},candidates:[{candidateId:'c',status:'diagnostic',joint:{search:{observed:{status:'conditional-plan-found'}}}}]}}};
 return {saju,synthesis,pattern};
};
const run=x=>observeSynthesisPriority(x.saju,x.synthesis,x.pattern);
test('winter metal separates warming need from strong and weak balance scenarios',()=>{
 const x=sample(),before=JSON.stringify(x),r=run(x);
 assert.equal(r.clauses[0].clauseId,'winter-metal-hurting-warming');
 assert.equal(r.clauses[0].focus.adequacyConfirmed,null);
 assert.equal(r.candidates[0].scenarios[0].focusMembership[0].membership,'outside-candidates');
 assert.equal(r.candidates[0].scenarios[1].focusMembership[0].membership,'candidate');
 assert.equal(r.selectedMethod,null);assert.equal(r.precedenceConfirmed,null);assert.equal(JSON.stringify(x),before);
});
test('actual climate contact preserves alternative occurrence and separate conditional stem',()=>{
 const r=run(sample()),c=r.candidates[0].contacts[0];
 assert.deepEqual(c.otherExactIds,['visible:hour']);assert.deepEqual(c.baselineGroupIds,['baseline:0']);
 assert.deepEqual(c.conditionalAlternativeIds,[]);assert.equal(c.interferenceConfirmed,null);assert.equal(c.alternativeSupplyConfirmed,null);
});
test('clause is limited by month and candidate family, no universal climate priority',()=>{
 const x=sample();x.saju.pillars.month.branch='유';
 assert.equal(run(x).clauses.length,0);x.saju.pillars.month.branch='자';x.synthesis.candidates[0].family='wealth';assert.equal(run(x).clauses.length,0);
});
test('partial scope stays partial and missing evidence does not create priority',()=>{
 const x=sample();x.synthesis.completeHour=false;x.synthesis.status='partial';
 assert.equal(run(x).clauses[0].status,'partial-scope');
 x.synthesis.status='unavailable';assert.deepEqual(run(x).clauses,[]);
});
test('mismatched direction, scope and climate occurrence fail closed',()=>{
 const a=sample();a.synthesis.candidates[0].routeContacts[0].from='visible:hour';assert.equal(run(a).status,'invalid-evidence');
 const b=sample();b.synthesis.candidates[0].routeContacts[0].scope='anchor-alternative';assert.equal(run(b).status,'invalid-evidence');
 const c=sample();c.synthesis.candidates[0].routeContacts[0].climateOccurrenceId='visible:day';assert.equal(run(c).status,'invalid-evidence');
});
test('native winter wood resource chart preserves warming review without final priority',()=>{
 const saju=chart(['경인','무자','갑인','병인']);
 const r=analyzeUsefulElementSynthesis({saju,birthBasis:'verified-chart',policy:USEFUL_ELEMENT_SYNTHESIS_VERSION});
 assert.equal(r.status,'diagnostic');assert.ok(r.priorityReview.clauses.some(c=>c.clauseId==='winter-wood-resource-warming'));
 assert.equal(r.priorityReview.selectionAuthority,false);assert.equal(r.usefulElement,null);
});
