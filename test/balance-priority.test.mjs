import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyzeBalancePriority,BALANCE_PRIORITY_VERSION,analyzeBalanceUsefulElement} from '../src/index.js';
import {chartFromReference} from '../scripts/strength-reference.mjs';
import {evaluateBalancePriority} from '../scripts/evaluate-balance-priority.mjs';
import {reviewBalancePriority} from '../src/features/balance-priority-v1/evidence.js';
const input=pillars=>({saju:chartFromReference(pillars),birthBasis:'verified-chart',policy:BALANCE_PRIORITY_VERSION});
test('four explicit references and 200 historical branch diagnostics replay',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/balance-priority-results.json',import.meta.url),'utf8'));
 const actual=await evaluateBalancePriority();
 for(const k of ['counts','texts','rows'])assert.deepEqual(actual[k],expected[k]);
 assert.deepEqual(actual.texts.map(t=>t.outcome),['focus-excludes-reference','abstain','multiple-focus-includes','abstain']);
 assert.equal(actual.texts[0].review.dominantCategory,'wealth');
 assert.equal(actual.texts[0].referenceElement,'metal');
 assert.equal(actual.texts[0].review.reviewFocus[0].element,'water');
});
test('live wrapper preserves baseline hypotheses and no new useful element authority',async()=>{
 const rows=JSON.parse(await readFile(new URL('../docs/strength-separated-decision-results.json',import.meta.url),'utf8')).rows;
 const expected=JSON.parse(await readFile(new URL('../docs/balance-priority-results.json',import.meta.url),'utf8')).rows;
 const byId=new Map(expected.map(r=>[r.id,r]));
 for(const c of rows){
  const i=input(c.pillars),before=JSON.stringify(i);
  const r=analyzeBalancePriority(i);
  assert.deepEqual(r.balance,analyzeBalanceUsefulElement({...i,policy:'balance-useful-element-v1'}),c.id);
  assert.equal(r.balance.strength.direction,c.fixed,c.id);
  assert.deepEqual(r.reviews,byId.get(c.id).reviews.filter(x=>c.fixed===null||x.assumedDirection===c.fixed),c.id);
  assert.equal(r.usefulElement,null);assert.equal(r.ranking,null);assert.equal(r.confirmed,false);
  assert.equal(JSON.stringify(i),before);
 }
});
test('unavailable charts and invalid scenario grids fail closed',()=>{
 const i=input(['壬申','壬子','戊午','乙卯']);
 for(const x of [{...i,birthBasis:'provisional-chart'},{...i,saju:{pillars:{...i.saju.pillars,hour:null}}}]){
  const r=analyzeBalancePriority(x);assert.equal(r.status,'unavailable');assert.deepEqual(r.reviews,[]);assert.equal(r.usefulElement,null);
 }
 const r=analyzeBalancePriority(i),b=r.balance.branches[0];
 assert.throws(()=>reviewBalancePriority(b,[],[]),/scenario grid/);
 const row={positionProfile:'p',roleProfile:'r',rootProfile:'x',seasonProfile:'s',seasonBasis:'b',mass:{peer:1,resource:1,output:0,wealth:0,officer:0}};
 assert.throws(()=>reviewBalancePriority(b,[row],[{...row,seasonBasis:'other'}]),/unmatched/);
 const tie=reviewBalancePriority(b,[row],[row]);
 assert.equal(tie.status,'unstable-dominance');assert.deepEqual(tie.reviewFocus,[]);
 assert.throws(()=>analyzeBalancePriority({...i,policy:'unknown'}),{code:'balance-policy'});
});
