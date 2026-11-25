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


// Source-triage checks use actual core and mechanism evidence, not a
// fabricated explanation of a source label or a changed decision policy.
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {createEffectContext} from '../src/features/pattern/outcome-efficacy.js';
import {evaluateMechanismEdge} from '../src/features/pattern/outcome-mechanism.js';
import {diagnoseSourcePremise,summarizeRoleTriage} from '../scripts/lib/pattern-outcome-role-policy-triage.mjs';
function sourceEdge(id,from,to){
 const chart=packet.cases.find(c=>c.id===id);
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:chart.pillars[i][0],branch:chart.pillars[i][1],text:chart.pillars[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),relativeForce=observeRelativeForce(stemForce);
 const prior={stemForce,relativeForce,completeHour:true};
 const rootContext=observeRootContext(prior,analyzeFormationEvidence({saju}));
 const raw=relativeForce.edges.find(e=>e.from===from&&e.to===to);
 const edge=createEffectContext(prior,{groups:[],edges:[]}).assess({from,to,kind:raw.kind,edgeId:raw.id});
 const assessed=evaluateMechanismEdge(edge,true);
 const p={id:'control',state:assessed.status,evidence:{...assessed,edgeId:raw.id}};
 return diagnoseSourcePremise(p,{rootContext,roleCapacity:{occurrences:stemForce.occurrences},monthCommandReview:{status:'unresolved',reason:'missing-birth-instant'}});
}
test('Tuo conflict is contextual root uncertainty, not proof of failed control',()=>{
 const p=sourceEdge('tuo-killing-output','visible:month','visible:hour'),e=p.diagnostic.edge;
 assert.equal(p.state,'conflicting');
 assert.equal(e.comparison.original.relation,'mixed-evidence');assert.equal(e.comparison.sensitivity.relation,'unresolved');
 assert.ok(e.reasons.includes('contested-root-context'));assert.ok(e.reasons.includes('mixed-profile-with-contextual-root-uncertainty'));
 assert.equal(e.effectConfirmed,null);assert.equal(e.target.rootState,null);
});
test('Zhou resource/output conflict survives root sensitivity but seasonal and local evidence differ',()=>{
 const p=sourceEdge('zhou-killing','visible:month','visible:year'),e=p.diagnostic.edge;
 assert.equal(p.state,'conflicting');assert.equal(e.comparison.sensitivity.relation,'mixed-evidence');
 assert.equal(e.comparison.nonseason.relation,'right-evidence-dominates');assert.equal(e.comparison.seasonOnly.relation,'left-evidence-dominates');
 assert.ok(e.reasons.includes('season-versus-nonseason-profile-disagreement'));assert.equal(e.effectConfirmed,null);
});
test('Zhou wealth/resource opposition retains direction after reversing comparison orientation',()=>{
 const p=sourceEdge('zhou-killing','visible:hour','visible:month'),e=p.diagnostic.edge;
 assert.equal(p.state,'opposed');assert.equal(e.comparison.original.relation,'right-evidence-dominates');
 assert.equal(e.comparison.sensitivity.relation,'right-evidence-dominates');
 assert.ok(e.reasons.includes('source-direct-root-not-established'));
 assert.ok(e.reasons.includes('source-indirect-supply-observed-not-certified'));
 assert.ok(e.reasons.includes('source-pressure-unresolved'));
 assert.ok(e.reasons.includes('target-profile-dominance-preserved'));
 assert.ok(e.reasons.includes('command-not-assessed'));assert.equal(e.effectConfirmed,null);
});
test('triage distinguishes explicit hour endpoint loss from indirect dependency',()=>{
 const fixture={cases:[{id:'c',scope:'ordinary-review',probes:[{id:'explicit',match:{a:'visible:hour'}},{id:'indirect',match:{a:'visible:month'}}]}]};
 const rows=[{id:'c',partial:false,probes:['explicit','indirect'].map(id=>({id,coverage:'observed',rows:[]}))},
  {id:'c',partial:true,probes:['explicit','indirect'].map(id=>({id,coverage:'route-or-objective-gap',rows:[]}))}];
 const t=summarizeRoleTriage(fixture,rows);
 assert.deepEqual(t.gapRows.map(x=>x.classification),['explicit-hour-endpoint-removed','indirect-dependency-review']);
 assert.ok(t.gapRows.every(x=>x.causalLossConfirmed===null));
});
test('demand gap remains distinct from directional edge and never becomes a supported role',()=>{
 const p=diagnoseSourcePremise({id:'resource-abundance',state:'unresolved',evidence:null},{},false);
 assert.equal(p.state,'unresolved');assert.equal(p.diagnostic.kind,'classical-condition');
 assert.deepEqual(p.diagnostic.reasons,['role-demand-or-context-not-established']);
});
