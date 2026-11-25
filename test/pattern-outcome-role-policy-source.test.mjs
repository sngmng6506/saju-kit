import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeNatalStructure} from '../src/core/natal.js';
import {validateRoleSourcePacket,evaluateRoleSourceCase,summarizeRoleSourceReplay,inspectLiteralSourceChart} from '../scripts/lib/pattern-outcome-role-policy-source.mjs';
const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
const c=packet.cases.find(c=>c.id==='li-resource-output');
function sample(){
 const decision={authorized:false,value:null,blockers:['no-validated-policy']};
 const q={candidateId:'c',family:'resource',status:'support-observed',rules:[]};
 const o={id:'drain-resource-supported-strong-day',conditionalStatus:'unresolved',premises:[{id:'day-capacity-hypothesis',state:'supported'},{id:'resource-abundance',state:'unresolved'}],effectConfirmed:null,actualDemand:null};
 const r={candidateId:'c',rolePriority:{resourceStrategies:{outputDrain:[{anchorId:'visible:month',outputId:'visible:year',objectives:[o]}]}}};
 return {selectionAuthority:false,formed:null,broken:null,rescued:null,selectedPattern:null,assistantGod:null,patternUsefulGod:null,usefulElement:null,
  regulationStrength:{direction:'strong'},reviews:[q],efficacyReview:{status:'diagnostic',mechanismReview:{candidates:[r]}},
  decisionReview:{status:'abstained',selectionAuthority:false,pattern:decision,purity:decision,candidates:[],release:{axes:{pattern:{authorized:false}}}}};
}
test('source packet exact unique charts and claim scope, not independent gold',()=>{
 assert.deepEqual(validateRoleSourcePacket(packet),[]);
 const bad=structuredClone(packet);bad.cases.push({...bad.cases[0],id:'different'});
 assert.ok(validateRoleSourcePacket(bad).length);
});
test('source objective presence does not turn unresolved condition into agreement',()=>{
 const r=evaluateRoleSourceCase(c,sample());assert.equal(r.probes[0].coverage,'observed');
 assert.deepEqual(r.probes[0].states,['unresolved']);assert.equal(r.probes[0].conditionalAgreement,null);assert.equal(r.effectAgreement,null);
 assert.equal(r.directionStatus,'aligned-direction');assert.deepEqual(r.errors,[]);
});
test('wrong endpoint is a gap, never a negative verdict or silently successful probe',()=>{
 const s=sample();s.efficacyReview.mechanismReview.candidates[0].rolePriority.resourceStrategies.outputDrain[0].anchorId='visible:hour';
 const r=evaluateRoleSourceCase(c,s);assert.equal(r.probes[0].coverage,'route-or-objective-gap');assert.deepEqual(r.probes[0].states,[]);
 s.reviews[0].family='food';assert.equal(evaluateRoleSourceCase(c,s).probes[0].coverage,'family-scope-gap');
});
test('missing hour rejects promoted day capacity and leaked authority',()=>{
 const s=sample(),r=evaluateRoleSourceCase(c,s,{partial:true});assert.ok(r.errors.includes('drain:partial-day-promotion'));
 s.decisionReview.pattern.authorized=true;assert.ok(evaluateRoleSourceCase(c,s).errors.includes('authority-leak'));
});
test('different candidates retain conflicting statuses instead of a selected best result',()=>{
 const s=sample(),q=structuredClone(s.reviews[0]),m=structuredClone(s.efficacyReview.mechanismReview.candidates[0]);q.candidateId=m.candidateId='c2';
 m.rolePriority.resourceStrategies.outputDrain[0].objectives[0].conditionalStatus='opposed';
 s.reviews.push(q);s.efficacyReview.mechanismReview.candidates.push(m);
 const r=evaluateRoleSourceCase(c,s);assert.deepEqual(r.probes[0].states,['opposed','unresolved']);assert.equal(r.probes[0].rows.length,2);
});
test('summary requires both variants and exact probe denominators',()=>{
 const p={...packet,cases:[c]},a=evaluateRoleSourceCase(c,sample()),s=sample();
 s.efficacyReview.mechanismReview.candidates[0].rolePriority.resourceStrategies.outputDrain[0].objectives[0].premises[0].state='unresolved';
 const b=evaluateRoleSourceCase(c,s,{partial:true});
 const r=summarizeRoleSourceReplay(p,[a,b]);assert.deepEqual(r.errors,[]);assert.equal(r.expectedVariants,2);assert.equal(r.effectAccuracy,null);
 assert.ok(summarizeRoleSourceReplay(p,[a,a]).errors.includes('case-variant-coverage'));
 b.probes=[];assert.ok(summarizeRoleSourceReplay(p,[a,b]).errors.includes(c.id+':probe-coverage'));
});

test('all 24 chart variants pass literal core role validation, preserving scope distinction',()=>{
 const rows=[];
 for(const c of packet.cases)for(const partial of [false,true]){
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,partial&&i===3?null:{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  rows.push(inspectLiteralSourceChart(c,analyzeNatalStructure({saju}),{partial}));
 }
 assert.equal(rows.length,24);assert.ok(rows.every(r=>r.errors.length===0));
 const tuo=rows.find(r=>r.id==='tuo-killing-output'&&!r.partial);
 assert.equal(tuo.monthPrincipal,'식신');assert.equal(tuo.sourceFamily,'killing');
 const zhou=rows.find(r=>r.id==='zhou-killing'&&!r.partial);
 assert.ok(zhou.probes.some(p=>p.endpoints.some(e=>e.field==='outputId'&&e.tenGod==='상관')));
 assert.ok(rows.some(r=>r.partial&&r.probes.some(p=>p.endpoints.some(e=>e.status==='omitted-hour'))));
});
