import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV4,analyzePatternOutcomeV5,PATTERN_OUTCOME_V4_VERSION,PATTERN_OUTCOME_V5_VERSION} from '../src/index.js';
import {mapOutcomeReferenceV5} from '../scripts/lib/pattern-outcome-v5-mapping.mjs';
import {evaluateOutcomeCase} from '../scripts/lib/pattern-outcome-reference.mjs';
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?{stem:ps[i][0],branch:ps[i][1],text:ps[i]}:null]))});
const run=(ps,birthBasis='verified-chart')=>analyzePatternOutcomeV5({saju:chart(ps),birthBasis,policy:PATTERN_OUTCOME_V5_VERSION});
const rules=(r,f,id)=>r.reviews.filter(q=>q.family===f).flatMap(q=>q.rules.filter(q=>q.id===id));
const witnesses=(r,f,id)=>rules(r,f,id).flatMap(q=>q.witnesses);
test('storage projection binds only actual visible stem and reuses wealth mediation without fabricating a root',()=>{
 const r=run(['갑자','신미','신유','임진']),q=r.reviews.find(q=>q.candidateId==='storage:갑');
 assert.ok(q);assert.deepEqual(q.anchorIds,['visible:year']);assert.equal(q.storageProjection.literalMonthHidden,false);
 assert.equal(q.storageProjection.rootEffective,null);
 assert.ok(!r.access.hidden.some(o=>o.id==='hidden:month:갑'));
 const rule=q.rules.find(x=>x.id==='wealth-food-mediation');
 const w=rule.witnesses.find(w=>w.roles.target==='visible:year'&&w.roles.obstacle==='visible:month'&&w.roles.helper==='visible:hour');
 assert.ok(w);assert.ok(q.rules.find(x=>x.id===rule.threatRuleId).witnesses.some(d=>d.id===w.threatWitnessId));
 assert.ok(rule.unresolvedConditions.includes('storage-anchor-access'));
});
test('all four storage elements admit a visible projection only in its own month storage context',()=>{
 for(const [y,m,d,h,s] of [['임자','무진','갑인','병인','임'],['병자','무술','갑인','갑인','병'],['경자','기축','갑인','갑인','경'],['갑자','기미','신유','임진','갑']]){
  const q=run([y,m,d,h]).reviews.find(q=>q.candidateId==='storage:'+s);
  assert.ok(q?.storageProjection);assert.ok(q.anchorIds.includes('visible:year'));
 }
 assert.ok(!run(['갑자','병인','갑인','갑인']).reviews.some(q=>q.storageProjection));
 assert.ok(!run(['계축','무진','갑인','갑인']).reviews.some(q=>q.storageProjection));
});
test('combine-killing preserves the exact officer role and exposes nonadjacency without granting effect',()=>{
 const r=run(['신축','경인','갑진','을해']);
 const w=witnesses(r,'peer','peer-combine-killing-preserve-officer').find(w=>w.roles.controller==='visible:year'&&w.roles.obstacle==='visible:month'&&w.roles.helper==='visible:hour');
 assert.ok(w);assert.equal(w.clearing.adjacent,false);assert.equal(w.clearing.officerPreserved,null);
 assert.ok(witnesses(r,'peer','peer-officer-killing-mix').some(d=>d.id===w.threatWitnessId&&d.roles.controller===w.roles.controller));
});
test('food-control route exposes collateral control of the officer, not automatic selective removal',()=>{
 const r=run(['신해','경인','갑신','병인']);
 const w=witnesses(r,'peer','peer-food-controls-killing-preserve-officer').find(w=>w.roles.controller==='visible:year'&&w.roles.obstacle==='visible:month'&&w.roles.helper==='visible:hour');
 assert.ok(w);assert.equal(w.clearing.officerCollateralControl.to,'visible:year');assert.equal(w.clearing.killingRemoved,null);
 assert.equal(r.selectedPattern,null);assert.equal(r.rescued,null);
});
test('no visible officer or no killing means no clearing witness; partial absence unresolved',()=>{
 const r=run(['계해','경인','갑신','병인']);
 assert.ok(rules(r,'peer','peer-officer-killing-mix').length);
 assert.ok(rules(r,'peer','peer-officer-killing-mix').every(q=>q.observed===false));
 const p=run(['신축','경인','갑진',null]);
 assert.ok(rules(p,'peer','peer-combine-killing-preserve-officer').every(q=>q.observed===null));
});
test('V4 witnesses and strength stay frozen except newly admitted storage reviews',()=>{
 const saju=chart(['갑자','신미','신유','임진']),before=JSON.stringify(saju),birthBasis='verified-chart';
 const a=analyzePatternOutcomeV4({saju,birthBasis,policy:PATTERN_OUTCOME_V4_VERSION}),b=analyzePatternOutcomeV5({saju,birthBasis,policy:PATTERN_OUTCOME_V5_VERSION});
 for(const q of a.reviews){const n=b.reviews.find(x=>x.candidateId===q.candidateId);assert.deepEqual(n.rules.slice(0,q.rules.length),q.rules);}
 assert.deepEqual(a.access,b.access);assert.deepEqual(a.regulationStrength,b.regulationStrength);assert.equal(JSON.stringify(saju),before);
 assert.equal(b.selectionAuthority,false);assert.equal(run(['갑자','신미','신유','임진'],'provisional-chart').access,null);
 assert.throws(()=>analyzePatternOutcomeV5({saju,birthBasis,policy:PATTERN_OUTCOME_V4_VERSION}),{code:'pattern-policy'});
});
test('three targeted frozen source probes recover actual roles, including pre-mapped storage gap',()=>{
 const data=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));let count=0;
 for(const row of data.cases){
  const mapped=mapOutcomeReferenceV5(row),target=mapped.probes.filter(p=>['storage-anchor-excluded','peer-officer-killing-clear'].includes(p.gap));
  if(!target.length)continue;
  const evaluated=evaluateOutcomeCase(mapped,run(row.pillars));
  for(const p of target){assert.equal(evaluated.probes.find(x=>x.id===p.id).status,'matched',p.id);count++;}
 }
 assert.equal(count,3);
});
