import test from 'node:test';
import assert from 'node:assert/strict';
import {observeClashAlternatives,observeRootContext} from '../src/features/pattern/outcome-root-context.js';
const h=(position,stem,role='principal')=>({id:'hidden:'+position+':'+stem,position,stem,element:'wood',layer:'hidden',hiddenRole:role});
const sample=()=>{
 const year=h('year','갑'),month=h('month','을'),v={id:'visible:day',position:'day',stem:'갑',element:'wood',layer:'visible',dayReference:true};
 const a={id:'visible:year',position:'year',stem:'을',element:'wood',layer:'visible',dayReference:false};
 const actors=[year,month,v,a];
 for(const o of actors)o.roots=[year,month].map(r=>({position:r.position,stem:r.stem,role:r.hiddenRole,match:r.stem===o.stem?'exact-stem':'same-element',clashExposed:r.position==='month'}));
 const profiles=Object.fromEntries(actors.map(o=>[o.id,{occurrenceId:o.id,axes:{exactSubstantial:o.stem==='갑',anySubstantial:true,ownPillarSubstantial:o.position==='year',monthSubstantial:false,principalSupport:true,seasonSupport:true,localRootedGeneration:false,localRootedPeer:false},rootPositions:['year'],localGenerationNodes:[],localPeerNodes:[]}]));
 const f={completeHour:true,clashes:[{id:'c',positions:['month','hour']}],formations:[]};
 return {prior:{completeHour:true,stemForce:{occurrences:actors},relativeForce:{profiles}},formation:f};
};
const run=x=>observeRootContext(x.prior,x.formation);
test('contested exact root is unknown but unrelated substantial root remains observed',()=>{
 const x=sample(),before=JSON.stringify(x),r=run(x),o=r.occurrences.find(o=>o.id==='visible:year');
 assert.equal(o.rootAxes.exactSubstantial,null);assert.equal(o.rootAxes.anySubstantial,true);assert.equal(o.rootAxes.monthSubstantial,null);
 assert.equal(o.rootPreservedConfirmed,null);assert.equal(r.comparisons[0].sensitivity.relation,'unresolved');assert.equal(JSON.stringify(x),before);
});
test('clash relief requires one endpoint of complete eligible formation, no automatic restoration',()=>{
 const x=sample();x.formation.formations=[{id:'f',layer:'branch',classification:'six-harmony',positions:['month','day'],target:'wood',flags:{structurallyComplete:true}}];
 let r=run(x);assert.equal(r.clashes[0].alternatives[0].hypothesis,'relief-contact-review');assert.equal(r.clashes[0].reliefConfirmed,null);
 assert.equal(r.slots.find(s=>s.position==='month').state,'clash-exposed');
 x.formation.formations.push({id:'g',layer:'branch',classification:'complete-three',positions:['year','day','hour'],target:'fire',flags:{structurallyComplete:true}});
 r=run(x);assert.equal(r.clashes[0].alternatives[0].hypothesis,'competing-relief-review');
});
test('half group and same clash endpoints cannot act as relief alternatives',()=>{
 const x=sample();x.formation.formations=[{id:'f',layer:'branch',classification:'cardinal-three-pair',positions:['month','day'],flags:{structurallyComplete:false}},{id:'g',layer:'branch',classification:'six-harmony',positions:['month','hour'],flags:{structurallyComplete:true}}];
 assert.deepEqual(observeClashAlternatives(x.formation)[0].alternatives,[]);
});
test('hidden projection is literal, day reference is separate, competing target is not transformation',()=>{
 const x=sample();x.formation.formations=[{id:'f',layer:'branch',classification:'complete-three',positions:['year','day','hour'],target:'fire',flags:{structurallyComplete:true}}];
 const r=run(x),s=r.slots[0];assert.equal(s.dayReferenceMatches,true);assert.deepEqual(s.exactProjectionIds,[]);
 assert.equal(s.state,'formation-contested');assert.equal(s.accessConfirmed,null);assert.equal(r.occurrences.find(o=>o.id==='visible:day').rootAxes.anySubstantial,null);
});
test('partial and invalid literal root identities fail conservatively',()=>{
 const x=sample();x.prior.completeHour=false;x.formation.completeHour=false;assert.equal(run(x).status,'partial');
 x.prior.stemForce.occurrences[0].roots[0].stem='병';assert.equal(run(x).status,'invalid-evidence');
});
