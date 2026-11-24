import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateStructuralV3} from '../scripts/structural-v3-reference.mjs';
const read=name=>JSON.parse(readFileSync(new URL('./fixtures/'+name,import.meta.url),'utf8'));
test('v3 preserves development diagnostics including missed and false directions',()=>{
 const xu=evaluateStructuralV3(read('ordinary-xu-v1.json'));
 const di=evaluateStructuralV3(read('strength-ditiansui-v1.json'));
 assert.deepEqual(xu,read('structural-v3-xu-baseline.json'));
 assert.deepEqual(di,read('structural-v3-ditiansui-baseline.json'));
 assert.deepEqual(xu.metrics,{agrees:12,disagrees:1,abstained:14,matrix:{strong:{strong:9,weak:0,abstained:7},weak:{strong:1,weak:3,abstained:7}}});
 assert.equal(di.metrics.agrees,1);assert.equal(di.metrics.disagrees,0);assert.equal(di.metrics.abstained,3);
 assert.equal(xu.rows.find(r=>r.id==='XU14').direction,'strong');
 for(const id of ['XU08','XU23']){
  const r=xu.rows.find(r=>r.id===id);
  assert.equal(r.direction,null);assert.ok(r.strongGrounds.length);
  assert.ok(r.conflicts.includes('root-support-versus-concentrated-burden'));
 }
});
