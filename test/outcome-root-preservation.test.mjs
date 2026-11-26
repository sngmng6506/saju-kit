import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewRootPreservation} from '../src/features/pattern/outcome-root-preservation.js';
import {evaluateContextualStrength} from '../src/features/pattern/outcome-contextual-strength.js';
const key=(...xs)=>JSON.stringify(xs);
function fixture(completeHour=true){
 const visible=[{id:'visible:year',position:'year',stem:'갑',element:'wood',layer:'visible'},{id:'visible:day',position:'day',stem:'을',element:'wood',layer:'visible'}];
 const specs=[['year','갑','principal'],['month','을','middle'],['day','을','residual']];
 const hidden=specs.map(([position,stem,hiddenRole])=>({id:'hidden:'+position+':'+stem,position,stem,hiddenRole,element:'wood',layer:'hidden'}));
 const slots=hidden.map(a=>({id:a.id,position:a.position,stem:a.stem,element:a.element,role:a.hiddenRole,state:a.position==='month'?'clash-exposed':a.hiddenRole==='residual'?'residual-context':'uncontested-substantial-observation',
  clashIds:a.position==='month'?['clash']:[],reliefFormationIds:a.position==='month'?['relief']:[],formationIds:[],competingTargetFormationIds:[],effectiveRoot:null}));
 const actors=[...visible,...hidden];
 const root={status:completeHour?'diagnostic':'partial',completeHour,selectionAuthority:false,rootEffectConfirmed:null,slots,
  clashes:[{clashId:'clash',positions:['month','hour'],alternatives:[{formationId:'relief',reliefConfirmed:null}],reliefConfirmed:null}],
  occurrences:actors.map(a=>({id:a.id,uncontestedRootIds:[slots[0].id],contestedRootIds:[slots[1].id]}))};
 return {prior:{completeHour,stemForce:{occurrences:actors}},root,element:'wood'};
}
const query=(r,id)=>r.scenario.queries.find(q=>q.id===id);
test('physical retention variable shared across distinct actors and exact grades',()=>{
 const r=reviewRootPreservation(fixture());assert.equal(r.status,'diagnostic',r.reason);
 assert.equal(r.scenario.admissibleCount,4);assert.equal(r.slots.length,3);assert.equal(r.sharedSlots.length,3);
 assert.equal(r.substantialSlotIds.length,2);assert.equal(r.slots[2].retentionVariableId,null);
 assert.equal(query(r,'any-substantial-retained').supportCount,3);
 assert.equal(query(r,'all-substantial-unavailable').supportCount,1);
 assert.equal(query(r,'principal-retained').supportCount,2);
 assert.equal(query(r,'middle-retained').supportCount,2);
 const a=key('actor-retained-basis','visible:year','exact-stem'),b=key('actor-retained-basis','visible:day','same-element');
 assert.deepEqual(r.scenario.pairs.find(p=>p.leftId===a&&p.rightId===b).counts,{neither:2,rightOnly:0,leftOnly:0,both:2});
 assert.ok(r.slots.every(s=>s.actualPreservationState==='unresolved'&&s.actualDepthState==='unresolved'));
 assert.equal(r.slots[1].reliefCandidateIds[0],'relief');
 assert.equal(r.actors[1].roots[0].distance,2);
});
test('no structural root is not actual weakness; partial is not loss',()=>{
 const x=fixture();x.element='fire';const r=reviewRootPreservation(x);
 assert.equal(r.rootInventoryState,'no-substantial-slot-observed');
 assert.equal(query(r,'all-substantial-unavailable').supportCount,1);
 assert.equal(r.actualDepthState,'unresolved');
 const p=reviewRootPreservation(fixture(false));assert.equal(p.status,'partial');assert.equal(p.scenario.status,'partial');
});
test('reject duplicate, missing, forged contact and root coverage',()=>{
 let x=fixture();x.root.slots.push(x.root.slots[0]);assert.equal(reviewRootPreservation(x).status,'invalid-evidence');
 x=fixture();x.root.occurrences[0].contestedRootIds=[];assert.equal(reviewRootPreservation(x).reason,'root-coverage');
 x=fixture();x.root.slots[1].clashIds=[];assert.equal(reviewRootPreservation(x).reason,'clash-coverage');
 x=fixture();x.root.slots[1].reliefFormationIds=[];assert.equal(reviewRootPreservation(x).reason,'clash-coverage');
 x=fixture();x.root.slots[0].effectiveRoot=true;assert.equal(reviewRootPreservation(x).reason,'slot-binding');
});
test('conditional deep root needs a retained substantial slot but retention is not sufficient',()=>{
 const r=reviewRootPreservation(fixture()),axes={'visible':true,'substantial-root-basis':true,'controller-basis':true,'output-basis':true};
 const refs=Object.fromEntries(Object.keys(axes).map(k=>[k,[{owner:'fixture',id:k,field:'state'}]]));
 const q=evaluateContextualStrength({completeHour:true,element:'wood',axes,evidenceRefs:refs,rootSlotIds:r.substantialSlotIds});
 assert.equal(q.status,'diagnostic');assert.equal(q.scenario.scenarioCount,32);assert.equal(q.scenario.admissibleCount,28);
 const strong=q.scenario.targets.find(t=>t.id==='strong');
 assert.equal(strong.counts.supported,3);assert.equal(q.strongState,'unresolved');
 assert.ok(r.slots.filter(s=>s.retentionVariableId).some(s=>strong.witnesses.supported[s.retentionVariableId]));
 assert.equal(evaluateContextualStrength({completeHour:true,element:'wood',axes,evidenceRefs:refs,rootSlotIds:[]}).reason,'root-slot-contract');
});
