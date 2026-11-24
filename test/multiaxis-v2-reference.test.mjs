import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateMultiaxisV2} from '../scripts/multiaxis-v2-reference.mjs';
test('development comparison preserves improvements and lost coverage',()=>{
 const read=name=>JSON.parse(readFileSync(new URL('./fixtures/'+name,import.meta.url),'utf8'));
 for(const [name,old,next,total] of [
 ['ordinary-xu-v1.json',[17,0,10],[15,0,12],31],
 ['ordinary-wei-v1.json',[11,1,11],[13,0,10],26],
 ['strength-ditiansui-v1.json',[0,0,4],[0,0,4],26]]){
 const r=evaluateMultiaxisV2(read(name));
 assert.equal(r.total,total);assert.deepEqual(r.old,old);assert.deepEqual(r.new,next);
 if(name==='ordinary-wei-v1.json'){
 for(const id of ['W01','W02','W20'])assert.equal(r.rows.find(x=>x.id===id).new,'strong');
 assert.equal(r.rows.find(x=>x.id==='W24').new,null);
 assert.equal(r.rows.find(x=>x.id==='W10').new,null);
 }
 }
});
