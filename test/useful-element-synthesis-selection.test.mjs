import test from 'node:test';
import assert from 'node:assert/strict';
import {observeSynthesisSelection} from '../src/features/useful-element/synthesis-selection.js';
const sample=()=>({status:'diagnostic',completeHour:true,selectionAuthority:false,usefulElement:null,favorableElements:null,unfavorableElements:null,
 balance:{directionComparison:'different-direction-hypotheses',branches:[{assumedDirection:'weak',candidates:[{element:'wood'}]},{assumedDirection:'strong',candidates:[{element:'fire'}]}]},
 climate:{status:'diagnostic',groups:[{id:'baseline:0',elements:['fire']}],alternatives:[{id:'alternative:0',elements:['wood']}]},
 candidates:[{candidateId:'c',family:'resource',status:'diagnostic',anchors:[{id:'visible:year',element:'wood'}],participants:[{occurrenceId:'visible:hour',element:'fire',climate:{exactRequirementStem:'병'},roles:[{kind:'support',ruleId:'s',witnessId:'w',mechanismHypothesis:'supported'}]}],jointPlanStatus:'conditional-plan-found'}],
 priorityReview:{selectionAuthority:false,candidates:[{candidateId:'c',obligations:['reconcile-strength-hypotheses'],contacts:[]}]},
 supplementaryMethods:{selectionAuthority:false,mediation:{pairs:[{from:'water',to:'fire',via:'wood',routeCount:1}]},remedy:{motifs:[{id:'r',remedyElement:'wood'}]}},
 climateTiming:{selectionAuthority:false}});
test('selection keeps directions, method roles and exact climate stem separate',()=>{
 const r=observeSynthesisSelection(sample());assert.equal(r.status,'abstained');assert.equal(r.scenarios.length,2);
 const w=r.scenarios[0].rows.find(x=>x.element==='wood'),f=r.scenarios[0].rows.find(x=>x.element==='fire');
 assert.deepEqual(w.pattern.anchorIds,['visible:year']);assert.deepEqual(w.pattern.participantRoles,[]);
 assert.equal(w.balance.membership,'candidate');assert.equal(w.mediation.pairRefs.length,1);assert.deepEqual(w.remedy.motifIds,['r']);
 assert.deepEqual(f.climate.exactParticipantIds,['visible:hour']);assert.equal(f.balance.membership,'outside-candidates');
 assert.equal(r.selectedElement,null);assert.equal(r.release.authorized,false);assert.equal(r.scenarios[0].methodOrder,null);
});
test('missing direction does not turn all elements into negative evidence',()=>{
 const x=sample();x.balance.branches=[];x.completeHour=false;const r=observeSynthesisSelection(x);
 assert.equal(r.scenarios[0].assumedDirection,null);assert.ok(r.scenarios[0].rows.every(x=>x.balance.membership==='unknown'));
 assert.ok(r.blockers.includes('missing-hour'));
});
test('invalid or duplicate upstream candidate coverage suppresses scenarios',()=>{
 const x=sample();x.priorityReview.candidates.push(x.priorityReview.candidates[0]);assert.equal(observeSynthesisSelection(x).status,'invalid-evidence');
 const y=sample();y.usefulElement='wood';assert.equal(observeSynthesisSelection(y).status,'invalid-evidence');
 const z=sample();z.status='unavailable';assert.deepEqual(observeSynthesisSelection(z).scenarios,[]);
});
test('full method overlap and supported route never unlock release authority',()=>{
 const x=sample();x.release={authorized:true};x.selectedElement='fire';x.authorized=true;
 const r=observeSynthesisSelection(x);assert.equal(r.release.authorized,false);assert.equal(r.selectionAuthority,false);assert.equal(r.selectedElement,null);
});
