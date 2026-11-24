import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateMultiaxis} from '../scripts/multiaxis-reference.mjs';
const read=name=>JSON.parse(readFileSync(new URL('./fixtures/'+name,import.meta.url),'utf8'));
test('development comparison retains both gains and abstentions',()=>{
 const xu=evaluateMultiaxis(read('ordinary-xu-v1.json'));
 const di=evaluateMultiaxis(read('strength-ditiansui-v1.json'));
 assert.equal(xu.total,31);assert.equal(di.total,26);
 assert.deepEqual(xu.matrix,{strong:{strong:8,weak:0,abstained:8},weak:{strong:0,weak:9,abstained:2}});
 assert.deepEqual([xu.agrees,xu.disagrees,xu.abstained],[17,0,10]);
 assert.deepEqual([di.agrees,di.disagrees,di.abstained],[0,0,4]);
 for(const [id,direction,range] of [['XU23','strong',{min:64.75,max:70}],['XU14',null,{min:35,max:35}],['XU08',null,{min:25.5,max:31.5}]]){
  const r=xu.rows.find(r=>r.id===id);
  assert.equal(r.direction,direction);assert.deepEqual(r.axes.rootCapacity,range);
 }
});
