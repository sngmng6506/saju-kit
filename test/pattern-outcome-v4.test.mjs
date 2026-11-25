import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV3,analyzePatternOutcomeV4,PATTERN_OUTCOME_V3_VERSION,PATTERN_OUTCOME_V4_VERSION,analyzeStrengthDecision} from '../src/index.js';
import {projectRegulationStrength,regulationConditions} from '../src/features/pattern/outcome-regulation-strength.js';
import {mapOutcomeReferenceV3} from '../scripts/lib/pattern-outcome-v3-mapping.mjs';
import {mapOutcomeReferenceV4} from '../scripts/lib/pattern-outcome-v4-mapping.mjs';
import {evaluateOutcomeCase} from '../scripts/lib/pattern-outcome-reference.mjs';
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?{stem:ps[i][0],branch:ps[i][1],text:ps[i]}:null]))});
const run=(ps,birthBasis='verified-chart')=>analyzePatternOutcomeV4({saju:chart(ps),birthBasis,policy:PATTERN_OUTCOME_V4_VERSION});
const rules=(r,f,id)=>r.reviews.filter(q=>q.family===f).flatMap(q=>q.rules.filter(q=>q.id===id));
const witnesses=(r,f,id)=>rules(r,f,id).flatMap(q=>q.witnesses);
test('strong and weak hypotheses never confirm excess, deficiency, or regulation',()=>{
 for(const direction of ['strong','weak',null]){
  const s=projectRegulationStrength({version:'strength-decision-v1',status:'hypothesis',direction,decision:{grounds:[],conflicts:[]}},true);
  const c=regulationConditions(s,{requiresStrong:true});
  assert.equal(c.dayCapacity,direction==='strong'?'supporting-hypothesis':direction==='weak'?'opposing-hypothesis':'unresolved');
  for(const key of ['excess','deficiency','effectiveRegulation','controllerPreserved'])assert.equal(c[key],null);
 }
 assert.equal(projectRegulationStrength(null,false).direction,null);
});
test('resource output drains day while preserving the distinct anchor relationship',()=>{
 const r=run(['무술','을묘','병오','을해']);
 const w=witnesses(r,'resource','resource-output-regulation').find(w=>w.roles.helper==='visible:year'&&w.roles.target==='visible:day');
 assert.ok(w);assert.ok(w.anchorBindings.length);assert.ok(w.anchorBindings.every(b=>b.edge.to==='visible:day'&&b.edge.kind==='generate'));
 assert.equal(w.regulation.conditions.excess,null);assert.equal(w.effective,null);
});
test('wealth control of resource retains both damage and conditional regulation interpretations',()=>{
 const r=run(['신유','병신','임신','신해']);
 const w=witnesses(r,'resource','resource-wealth-regulation').find(w=>w.roles.helper==='visible:month'&&w.roles.target==='hidden:month:경');
 assert.ok(w);
 assert.ok(witnesses(r,'resource',w.alternativeDamageRuleId).some(d=>d.roles.obstacle===w.roles.helper&&d.roles.target===w.roles.target));
 assert.equal(w.regulation.conditions.effectiveRegulation,null);assert.equal(r.broken,null);
});
test('blade food regulates each actual killing occurrence without summing shared roots',()=>{
 const r=run(['갑인','경오','무신','갑인']);
 const ws=witnesses(r,'blade','blade-food-regulation');
 for(const id of ['visible:year','visible:hour']){
  const w=ws.find(w=>w.roles.controller===id&&w.roles.helper==='visible:month'&&w.roles.day==='visible:day');
  assert.ok(w);assert.equal(w.edges.length,3);assert.ok(w.regulation.relatedVisibleIds.includes('visible:year')&&w.regulation.relatedVisibleIds.includes('visible:hour'));
  assert.equal(w.regulation.conditions.controllerPreserved,null);
 }
 assert.equal(r.rescued,null);
});
test('missing hour does not imply no regulation, and provisional chart does not run strength',()=>{
 const r=run(['갑인','무오','무신',null]);
 const q=rules(r,'blade','blade-food-regulation');assert.ok(q.length);assert.ok(q.every(x=>x.observed===null));
 assert.equal(r.regulationStrength.status,'partial-not-assessed');
 assert.equal(run(['갑인','경오','무신','갑인'],'provisional-chart').regulationStrength,null);
});
test('V3 witnesses and status stay unchanged; strength direction is delegated, not overridden',()=>{
 const saju=chart(['갑인','경오','무신','갑인']),birthBasis='verified-chart',before=JSON.stringify(saju);
 const a=analyzePatternOutcomeV3({saju,birthBasis,policy:PATTERN_OUTCOME_V3_VERSION});
 const b=analyzePatternOutcomeV4({saju,birthBasis,policy:PATTERN_OUTCOME_V4_VERSION,strength:{direction:'strong'}});
 const s=analyzeStrengthDecision({saju,birthBasis,policy:'strength-decision-v1'});
 assert.equal(b.regulationStrength.direction,s.direction);assert.deepEqual(b.access,a.access);
 for(const q of a.reviews){const n=b.reviews.find(x=>x.candidateId===q.candidateId);assert.deepEqual(n.rules.slice(0,q.rules.length),q.rules);assert.equal(n.status,q.status);assert.deepEqual(n.assistantCandidates,q.assistantCandidates);}
 assert.equal(JSON.stringify(saju),before);assert.equal(b.selectionAuthority,false);assert.equal(b.formed,null);
});
test('three newly mapped reference probes recover exact roles without changing labels',()=>{
 const data=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));let count=0;
 for(const row of data.cases){
  const old=mapOutcomeReferenceV3(row),next=mapOutcomeReferenceV4(row);
  const added=next.probes.filter((p,i)=>p.ruleId!==null&&old.probes[i].ruleId===null);
  if(!added.length)continue;
  const result=evaluateOutcomeCase(next,run(row.pillars));
  for(const p of added){assert.equal(result.probes.find(x=>x.id===p.id).status,'matched',p.id);count++;}
 }
 assert.equal(count,3);
});
