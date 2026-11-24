import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateOrdinaryReferences} from '../scripts/ordinary-reference.mjs';
const read=name=>JSON.parse(readFileSync(new URL('./fixtures/'+name,import.meta.url),'utf8'));
const fixture=read('ordinary-xu-v1.json');
const baseline=read('ordinary-xu-v1-baseline.json');
const development=read('strength-ditiansui-v1.json');

test('new references preserve unique charts, source pointers, and disputed labels',()=>{
 assert.equal(fixture.cases.length,31);
 assert.equal(new Set(fixture.cases.map(c=>c.id)).size,31);
 const seen=new Set(development.cases.map(c=>c.pillars.join(' ')));
 const counts={};
 for(const c of fixture.cases){
  assert.ok(!seen.has(c.pillars.join(' ')),c.id);
  seen.add(c.pillars.join(' '));
  assert.ok(fixture.sources[c.chapter].url.startsWith('https://'));
  assert.equal(c.pillars.length,4);
  assert.equal(c.split,'reference-v1-v2-frozen');
  counts[c.reference]=(counts[c.reference]||0)+1;
  if(c.reference==='disputed'){
   assert.deepEqual(new Set(c.labels.map(l=>l.direction)),new Set(['strong','weak']));
  }
 }
 assert.deepEqual(counts,{strong:16,weak:11,balanced:2,disputed:2});
});
test('frozen comparison includes abstentions, misclassifications and sensitivity',()=>{
 const result=evaluateOrdinaryReferences(fixture);
 assert.deepEqual(result,baseline);
 for(const [key,expected] of Object.entries({
  v1:[27,4,1,3,23],v2:[27,12,8,4,15],
  v1Structural:[27,23,13,10,4],v2Structural:[27,27,10,17,0]
 })){
  const m=result.metrics[key];
  assert.deepEqual([m.n,m.classified,m.agrees,m.disagrees,m.abstained],expected);
 }
 const labelled=result.rows.filter(r=>['strong','weak'].includes(r.reference));
 assert.equal(labelled.filter(r=>r.formationSensitive).length,11);
 assert.equal(labelled.filter(r=>r.clashSensitive).length,0);
 for(const id of ['XU08','XU23']){
  const r=result.rows.find(r=>r.id===id);
  assert.equal(r.reference,'strong');
  assert.equal(r.v2,'weak');
  assert.equal(r.formationSensitive,false);
  assert.equal(r.clashSensitive,false);
 }
});
