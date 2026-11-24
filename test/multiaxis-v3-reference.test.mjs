import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateMultiaxisV3} from '../scripts/multiaxis-v3-reference.mjs';
test('integrated development policy preserves observed direction parity',()=>{
 for(const [name,n,expected,extra] of [
 ['ordinary-xu-v1',31,[15,0,12],2],
 ['ordinary-wei-v1',26,[13,0,10],6],
 ['strength-ditiansui-v1',26,[0,0,4],6],
 ['ordinary-ran-yuan-v1',13,[5,0,5],0]]){
 const fixture=JSON.parse(readFileSync(new URL('./fixtures/'+name+'.json',import.meta.url),'utf8'));
 const r=evaluateMultiaxisV3(fixture);
 assert.equal(r.rows.length,n);
 assert.deepEqual(r.old,expected);assert.deepEqual(r.new,expected);
 assert.ok(r.rows.every(x=>x.old===x.new));
 assert.equal(r.rows.filter(x=>x.grounds.includes('bounded-route-support')).length,extra);
 }
});
