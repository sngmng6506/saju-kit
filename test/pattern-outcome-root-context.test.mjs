import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
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

test('native six source charts and missing-hour variants retain all physical root identities',()=>{
 const data=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-flow-source-v1.json',import.meta.url),'utf8'));
 for(const c of data.cases)for(const complete of [true,false]){
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const stemForce=analyzeStemForceEvidence({saju}),relativeForce=observeRelativeForce(stemForce),formation=analyzeFormationEvidence({saju});
  const r=observeRootContext({completeHour:complete,stemForce,relativeForce},formation);
  assert.equal(r.status,complete?'diagnostic':'partial',c.id);
  assert.deepEqual(r.slots.map(s=>s.id),stemForce.occurrences.filter(o=>o.layer==='hidden').map(o=>o.id));
  assert.equal(r.clashes.length,formation.clashes.length);
  assert.ok(r.occurrences.every(o=>o.rootPreservedConfirmed===null));
  assert.ok(r.comparisons.every(p=>p.forceComparison===null));
  if(!complete)assert.ok(r.comparisons.every(p=>p.sensitivity.relation==='unresolved'));
 }
});

test('formation-contested local generation is not retained as independent support',()=>{
 const x=sample(),a=x.prior.stemForce.occurrences.find(o=>o.id==='visible:year'),d=x.prior.stemForce.occurrences.find(o=>o.id==='visible:day');
 a.graphNodeId='year:stem';d.graphNodeId='day:stem';
 d.generationReceived=[{local:true,sourceEvidence:{id:'year:stem',position:'year',contacts:[]}}];
 x.prior.relativeForce.profiles[d.id].localGenerationNodes=['year:stem'];
 x.prior.relativeForce.profiles[d.id].axes.localRootedGeneration=true;
 assert.equal(run(x).occurrences.find(o=>o.id===d.id).sensitivityAxes.localRootedGeneration,true);
 x.formation.formations=[{id:'f',layer:'branch',classification:'complete-three',positions:['year','day','hour'],target:'fire',flags:{structurallyComplete:true}}];
 const r=run(x).occurrences.find(o=>o.id===d.id);
 assert.equal(r.sensitivityAxes.localRootedGeneration,null);
 assert.deepEqual(r.localSupply.generation.unresolvedIds,['year:stem']);
});
test('branch supply cannot borrow substantial roots from another branch',()=>{
 const x=sample(),a=x.prior.stemForce.occurrences.find(o=>o.id==='hidden:month:을'),d=x.prior.stemForce.occurrences.find(o=>o.id==='visible:day');
 a.graphNodeId='month:branch:wood';
 d.generationReceived=[{local:true,sourceEvidence:{id:a.graphNodeId,position:'month',contacts:[]}}];
 const r=run(x).occurrences.find(o=>o.id===d.id);
 assert.equal(r.sensitivityAxes.localRootedGeneration,null);
});
