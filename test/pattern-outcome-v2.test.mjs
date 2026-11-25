import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternOutcome,analyzePatternOutcomeV2,PATTERN_OUTCOME_VERSION,PATTERN_OUTCOME_V2_VERSION} from '../src/index.js';
import {readFileSync} from 'node:fs';
import {mapOutcomeReferenceV2} from '../scripts/lib/pattern-outcome-v2-mapping.mjs';
import {evaluateOutcomeCase} from '../scripts/lib/pattern-outcome-reference.mjs';
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?{stem:ps[i][0],branch:ps[i][1],text:ps[i]}:null]))});
const run=(ps,birthBasis='verified-chart')=>analyzePatternOutcomeV2({saju:chart(ps),birthBasis,policy:PATTERN_OUTCOME_V2_VERSION});
const find=(r,f,id)=>r.reviews.filter(q=>q.family===f).flatMap(q=>q.rules).filter(q=>q.id===id).flatMap(q=>q.witnesses);
test('complete wood assembly injures the actual officer anchor and both resources extend that threat',()=>{
 const r=run(['기묘','신미','임인','신해']);
 const group=r.access.groups.find(g=>g.element==='wood'&&g.kind==='complete-three');
 assert.ok(group);assert.deepEqual(group.positions,['year','month','hour']);assert.equal(group.transformationConfirmed,null);
 const damage=find(r,'officer','officer-branch-output-damage'),rescue=find(r,'officer','officer-branch-resource-rescue');
 assert.ok(damage.some(w=>w.roles.obstacle===group.id&&w.roles.target==='visible:year'));
 for(const helper of ['visible:month','visible:hour'])assert.ok(rescue.some(w=>w.roles.helper===helper&&w.roles.target==='visible:year'&&damage.some(d=>d.id===w.threatWitnessId&&d.roles.obstacle===w.roles.obstacle)));
 assert.ok(!r.access.edges.some(e=>e.participantId.startsWith('hidden:')&&group.positions.includes(e.participantId.split(':')[1])&&e.formationId===group.formationId));
 assert.equal(r.broken,null);assert.equal(r.rescued,null);
});
test('incomplete group and partial hour never fabricate a complete formation or absence',()=>{
 const r=run(['기묘','신미','임인',null]);
 assert.ok(!r.access.groups.some(g=>g.kind==='complete-three'&&g.element==='wood'));
 const rules=r.reviews.filter(q=>q.family==='officer').flatMap(q=>q.rules).filter(q=>q.id==='officer-branch-output-damage');
 assert.ok(rules.length);assert.ok(rules.every(q=>q.observed===null));
});
test('hidden blade controller remains a branch occurrence; combination targets visible output, not hidden stem',()=>{
 const r=run(['갑오','계유','경인','무인']);
 const c=r.access.hidden.find(o=>o.id==='hidden:year:정');
 assert.equal(c.role,'principal');assert.equal(c.accessConfirmed,null);assert.equal(c.slot,'branch:year');
 const d=find(r,'blade','blade-hidden-controller-damage'),q=find(r,'blade','blade-hidden-controller-combine-output');
 assert.ok(d.some(w=>w.roles.controller===c.id&&w.roles.obstacle==='visible:month'));
 const w=q.find(w=>w.roles.controller===c.id&&w.roles.obstacle==='visible:month'&&w.roles.helper==='visible:hour');
 assert.ok(w);assert.ok(d.some(x=>x.id===w.threatWitnessId));
 assert.equal(w.edges[0].to,'visible:month');assert.equal(w.edges[0].effective,null);
});
test('repeated group alternatives share slots, not independent supply',()=>{
 const r=run(['임자','계축','경자','정해']);
 const full=r.access.groups.filter(g=>g.kind==='complete-seasonal');
 assert.equal(full.length,2);assert.ok(full.every(g=>g.slots.length===3&&g.alternativeOrOverlappingGroups.length));
});
test('old rules and witnesses remain exact; no authority and provisional chart unavailable',()=>{
 const saju=chart(['기묘','신미','임인','신해']),before=JSON.stringify(saju);
 const a=analyzePatternOutcome({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_VERSION}),b=analyzePatternOutcomeV2({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V2_VERSION});
 for(const q of a.reviews){const n=b.reviews.find(x=>x.candidateId===q.candidateId);assert.deepEqual(n.rules.slice(0,q.rules.length),q.rules);}
 assert.equal(JSON.stringify(saju),before);assert.equal(b.selectionAuthority,false);assert.equal(b.formed,null);
 assert.equal(run(['기묘','신미','임인','신해'],'provisional-chart').access,null);
 assert.throws(()=>analyzePatternOutcomeV2({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_VERSION}),{code:'pattern-policy'});
});
test('the five newly mapped source probes are retrieved without rewriting the reference fixture',()=>{
 const data=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));
 let count=0;
 for(const row of data.cases){
  const mapped=mapOutcomeReferenceV2(row);
  const newly=mapped.probes.filter((p,i)=>p.ruleId!==null&&row.probes[i].ruleId===null);
  if(!newly.length)continue;
  const results=evaluateOutcomeCase(mapped,run(row.pillars));
  for(const p of newly){assert.equal(results.probes.find(x=>x.id===p.id).status,'matched',p.id);count++;}
 }
 assert.equal(count,5);
});
