import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV2,analyzePatternOutcomeV3,PATTERN_OUTCOME_V2_VERSION,PATTERN_OUTCOME_V3_VERSION} from '../src/index.js';
import {mapOutcomeReferenceV2} from '../scripts/lib/pattern-outcome-v2-mapping.mjs';
import {mapOutcomeReferenceV3} from '../scripts/lib/pattern-outcome-v3-mapping.mjs';
import {evaluateOutcomeCase} from '../scripts/lib/pattern-outcome-reference.mjs';
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?{stem:ps[i][0],branch:ps[i][1],text:ps[i]}:null]))});
const run=(ps,birthBasis='verified-chart')=>analyzePatternOutcomeV3({saju:chart(ps),birthBasis,policy:PATTERN_OUTCOME_V3_VERSION});
const rules=(r,f,id)=>r.reviews.filter(q=>q.family===f).flatMap(q=>q.rules.filter(q=>q.id===id));
const witnesses=(r,f,id)=>rules(r,f,id).flatMap(q=>q.witnesses);
test('wealth protects a secondary hidden officer; same branch does not manufacture a generation edge',()=>{
 const r=run(['임진','을사','계사','신유']),d=witnesses(r,'wealth','wealth-secondary-officer-damage'),q=witnesses(r,'wealth','wealth-secondary-officer-resource-rescue');
 const w=q.find(w=>w.roles.target==='hidden:month:무'&&w.roles.helper==='visible:hour'&&w.roles.obstacle==='visible:month');
 assert.ok(w);assert.equal(w.targetAccessId,w.roles.target);assert.ok(d.some(t=>t.id===w.threatWitnessId));
 assert.ok(w.anchorBindings.some(b=>b.anchorId==='hidden:month:병'&&b.basis==='same-branch-constituent-context'&&b.edge===null&&!b.independentSlots));
 assert.equal(w.effective,null);
});
test('resource anchor may protect an officer without being counted as a second actor',()=>{
 const r=run(['병술','무술','신미','임진']),q=witnesses(r,'resource','resource-secondary-officer-resource-rescue');
 const w=q.find(w=>w.roles.target==='visible:year'&&w.roles.helper==='visible:month'&&w.roles.obstacle==='visible:hour');
 assert.ok(w);assert.equal(w.helperAnchorAlias,true);assert.ok(w.anchorBindings.some(b=>b.anchorId===w.roles.helper&&b.edge?.from===w.roles.target));
 assert.equal(new Set(Object.values(w.roles)).size,3);assert.equal(r.rescued,null);
});
test('officer support loss does not falsely turn a wealth-resource combination into direct officer injury',()=>{
 const r=run(['임술','정미','무신','을묘']);
 const q=rules(r,'officer','officer-wealth-resource-support-loss');
 const w=q.flatMap(x=>x.witnesses).find(w=>w.roles.target==='visible:hour'&&w.roles.wealth==='visible:year'&&w.roles.resource==='visible:month');
 assert.ok(w);assert.equal(w.directTargetInjury,null);assert.deepEqual(w.affectedSupportRoles,['wealth','resource']);
 assert.ok(q.every(x=>x.impact==='support-loss-not-direct-injury'));
 assert.ok(w.edges.some(e=>e.kind==='combine'&&e.from===w.roles.wealth&&e.to===w.roles.resource));
 assert.ok(!w.edges.some(e=>e.kind==='combine'&&[e.from,e.to].includes(w.roles.target)));
});
test('absence of the actual threat cannot yield secondary rescue; missing hour stays unresolved',()=>{
 const ps=['병술','무술','신미','무진'],r=run(ps);
 // No non-day visible output actor in this chart.
 assert.ok(rules(r,'resource','resource-secondary-officer-resource-rescue').length);
 assert.ok(rules(r,'resource','resource-secondary-officer-resource-rescue').every(q=>q.observed===false));
 const partial=run([...ps.slice(0,3),null]);
 assert.ok(rules(partial,'resource','resource-secondary-officer-resource-rescue').every(q=>q.observed===null));
});
test('V2 results are preserved and provisional/invalid inputs do not grant authority',()=>{
 const saju=chart(['병술','무술','신미','임진']),before=JSON.stringify(saju);
 const a=analyzePatternOutcomeV2({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V2_VERSION}),b=analyzePatternOutcomeV3({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V3_VERSION});
 for(const q of a.reviews){const n=b.reviews.find(x=>x.candidateId===q.candidateId);assert.deepEqual(n.rules.slice(0,q.rules.length),q.rules);}
 assert.deepEqual(b.access,a.access);assert.equal(JSON.stringify(saju),before);
 for(const key of ['formed','broken','rescued','selectedPattern','assistantGod','usefulElement'])assert.equal(b[key],null);
 assert.equal(b.selectionAuthority,false);assert.equal(run(['병술','무술','신미','임진'],'provisional-chart').access,null);
 assert.throws(()=>analyzePatternOutcomeV3({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V2_VERSION}),{code:'pattern-policy'});
});
test('three newly mapped role probes are recovered without changing source labels',()=>{
 const data=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));let count=0;
 for(const row of data.cases){
  const old=mapOutcomeReferenceV2(row),next=mapOutcomeReferenceV3(row);
  const added=next.probes.filter((p,i)=>p.ruleId!==null&&old.probes[i].ruleId===null);
  if(!added.length)continue;
  const result=evaluateOutcomeCase(next,run(row.pillars));
  for(const p of added){assert.equal(result.probes.find(x=>x.id===p.id).status,'matched',p.id);count++;}
 }
 assert.equal(count,3);
});
