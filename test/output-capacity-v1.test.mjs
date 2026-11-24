import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeOutputCapacity} from '../src/index.js';
import {capIncoming} from '../src/features/output-capacity-v1/index.js';
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(y,m,d,h=null)=>({pillars:{year:p(y),month:p(m),day:p(d),hour:h===null?null:p(h)}});
const run=saju=>analyzeOutputCapacity({saju,policy:'output-capacity-v1',birthBasis:'verified-chart'});
test('exact proportional cap conserves integers and rejects excess',()=>{
 const edges=[{source:'b',units:5},{source:'a',units:5}];
 assert.deepEqual(capIncoming(edges,3).map(e=>[e.accepted,e.rejected]),[[1,4],[2,3]]);
 assert.deepEqual(capIncoming(edges,0).map(e=>e.accepted),[0,0]);
 assert.deepEqual(capIncoming(edges,20).map(e=>e.accepted),[5,5]);
});
test('target and source limits, output partition, no cancellation claim',()=>{
 const r=run(chart('병신','병신','무술','경신'));
 for(const row of r.analysis.rows){
  for(const t of row.targetCaps)assert.ok(t.accepted<=t.capacity);
  for(const e of row.allocations)assert.equal(e.accepted+e.rejected,e.units);
  assert.equal(row.outputTotal,row.outputControlAccepted+row.outputResidualHypothesis);
  assert.ok(row.outputResidualHypothesis>=0);
 }
 assert.equal(r.effectsConfirmed,false);
});
test('remote output is retained and zero output is safe',()=>{
 const r=run(chart('병오','경자','갑인','임자'));
 assert.ok(r.analysis.rows.every(s=>s.outputs.some(n=>!n.local&&n.nominal>0)));
 const z=run(chart('신유','신유','을유','을유'));
 assert.equal(z.analysis.ranges.outputTotal.max,0);
});
test('partial/provisional no inference; deterministic',()=>{
 const saju=chart('경신','임자','갑인');
 assert.equal(run(saju).analysis,null);
 assert.equal(analyzeOutputCapacity({saju,policy:'output-capacity-v1',birthBasis:'provisional-chart'}).analysis,null);
 const full=chart('병신','병신','무술','경신');
 assert.deepEqual(run(full),run(full));
});
