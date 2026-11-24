import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateQuantitativeV3} from '../scripts/quantitative-v3-reference.mjs';
const read=name=>JSON.parse(readFileSync(new URL('./fixtures/'+name,import.meta.url),'utf8'));
test('development comparison retains numerical errors and low intersection coverage',()=>{
 const xu=evaluateQuantitativeV3(read('ordinary-xu-v1.json'));
 const di=evaluateQuantitativeV3(read('strength-ditiansui-v1.json'));
 assert.equal(xu.total,31);assert.equal(di.total,26);
 const values=m=>[m.agrees,m.disagrees,m.abstained];
 assert.deepEqual(Object.values(xu.metrics).map(values),[[9,2,16],[12,1,14],[10,3,14],[4,0,23]]);
 assert.deepEqual(Object.values(di.metrics).map(values),[[1,0,3],[1,0,3],[1,0,3],[0,0,4]]);
 assert.deepEqual(xu.metrics.quantitative.matrix,{strong:{strong:1,weak:3,abstained:12},weak:{strong:0,weak:9,abstained:2}});
 const expected={XU08:[[22.91,34.61],'weak'],XU14:[[21.05,35.72],null],XU16:[[19.45,34.22],'weak'],XU23:[[17.44,25.81],'weak']};
 for(const [id,[range,direction]] of Object.entries(expected)){
   const row=xu.rows.find(r=>r.id===id);
   assert.deepEqual(row.newRange,range);assert.equal(row.quantitative,direction);assert.equal(row.intersection,null);
 }
});
