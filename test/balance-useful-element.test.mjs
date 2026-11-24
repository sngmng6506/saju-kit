import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyzeBalanceUsefulElement,BALANCE_USEFUL_ELEMENT_VERSION,analyzeMultiaxisStrengthV4,analyzeElementStructure} from '../src/index.js';
import {observeBalanceElements,buildBalanceBranch} from '../src/features/balance-useful-element-v1/evidence.js';
import {chartFromReference} from '../scripts/strength-reference.mjs';

const input=pillars=>({saju:chartFromReference(pillars),birthBasis:'verified-chart',policy:BALANCE_USEFUL_ELEMENT_VERSION});
const read=name=>readFile(new URL('../docs/'+name+'.json',import.meta.url),'utf8').then(JSON.parse);
const summarize=b=>({assumedDirection:b.assumedDirection,candidates:b.candidates.map(c=>({
 element:c.element,category:c.category,presence:c.presence,
 activeReviewRelations:c.interactions.filter(i=>i.candidatePresent&&i.counterpartPresent).map(i=>i.code)
}))});
test('both ordinary-chart hypotheses replay all 111 recorded structural candidate observations',async()=>{
 const [old,prospective,expected]=await Promise.all(['strength-separated-decision-results','strength-yuan-prospective-results','balance-useful-element-results'].map(read));
 const cases=[...old.rows,...prospective.rows.map(c=>({...c,fixed:c.predictions[0]}))];
 assert.equal(cases.length,111);
 const rows=cases.map(c=>{
  const saju=chartFromReference(c.pillars),s=analyzeElementStructure({saju}),obs=observeBalanceElements(s);
  assert.equal(obs.length,5);
  assert.equal(new Set(obs.map(o=>o.category)).size,5);
  assert.ok(obs.every(o=>o.visible.every(v=>v.position!=='day')));
  return {id:c.id,day:s.dayMaster.element,priorDirection:c.fixed,branches:['strong','weak'].map(d=>summarize(buildBalanceBranch(obs,d)))};
 });
 assert.deepEqual(rows,expected.rows);
});
test('live balance wrapper preserves existing v4 and never confirms useful elements',async()=>{
 const [old,prospective]=await Promise.all(['strength-separated-decision-results','strength-yuan-prospective-results'].map(read));
 const rows=[...old.rows,...prospective.rows.map(c=>({...c,fixed:c.predictions[0]}))];
 for(const c of rows){
  const i=input(c.pillars),before=JSON.stringify(i);
  const r=analyzeBalanceUsefulElement(i);
  const v4=analyzeMultiaxisStrengthV4({...i,policy:'strength-multiaxis-v4'});
  assert.equal(r.strength.direction,c.fixed,c.id);
  assert.equal(r.strength.direction,v4.direction,c.id);
  assert.deepEqual(r.strength.grounds,v4.decision.grounds,c.id);
  assert.deepEqual(r.strength.conflicts,v4.decision.conflicts,c.id);
  assert.equal(r.status,c.fixed===null?'conditional-branches':'directional-hypothesis',c.id);
  assert.deepEqual(r.branches.map(b=>b.assumedDirection),c.fixed===null?['strong','weak']:[c.fixed],c.id);
  for(const b of r.branches){
   assert.equal(b.selectedElement,null);assert.equal(b.ranking,null);
   assert.equal(b.candidates.length,b.assumedDirection==='strong'?3:2);
   for(const x of b.candidates){assert.equal(x.confirmed,false);assert.equal(x.priority,null);assert.ok(x.interactions.every(e=>e.effective===null));}
  }
  for(const key of ['usefulElement','favorableElements','unfavorableElements'])assert.equal(r[key],null,c.id);
  assert.equal(r.confirmed,false);assert.equal(r.specialPatternAssessment,'not-assessed');
  assert.equal(JSON.stringify(i),before);
 }
});
test('strength uncertainty keeps both branches; caller authority cannot choose one',()=>{
 const i=input(['壬申','壬子','戊午','乙卯']);
 const r=analyzeBalanceUsefulElement({...i,direction:'strong',strengthDirection:'strong',peripheralAuthority:'independent-experimental'});
 assert.equal(r.strength.direction,null);
 assert.deepEqual(r.branches.map(b=>b.candidates.map(c=>c.element)),[['metal','water','wood'],['fire','earth']]);
 assert.deepEqual(r,analyzeBalanceUsefulElement(i));
});
test('absent element is a hypothetical supplement, not a confirmed or excluded candidate',()=>{
 const r=analyzeBalanceUsefulElement(input(['壬午','庚戌','己酉','庚午']));
 const c=r.branches[0].candidates.find(c=>c.category==='officer');
 assert.equal(c.presence,'absent');assert.equal(c.confirmed,false);
 assert.ok(c.interactions.every(e=>!e.candidatePresent&&e.effective===null));
});
test('provisional or missing hour is unavailable; invalid policy fails closed',()=>{
 const i=input(['壬申','壬子','戊午','乙卯']);
 for(const x of [{...i,birthBasis:'provisional-chart'},{...i,saju:{pillars:{...i.saju.pillars,hour:null}}}]){
  const r=analyzeBalanceUsefulElement(x);
  assert.equal(r.status,'unavailable');assert.equal(r.strength,null);assert.deepEqual(r.branches,[]);assert.equal(r.usefulElement,null);
 }
 assert.throws(()=>analyzeBalanceUsefulElement({...i,policy:'unknown'}),{code:'balance-policy'});
 assert.throws(()=>analyzeBalanceUsefulElement({...i,birthBasis:'unknown'}),{code:'strength-birth-basis'});
});
