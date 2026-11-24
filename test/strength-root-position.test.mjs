import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateRootPosition,patchRootPosition} from '../scripts/evaluate-strength-root-position.mjs';
test('root-position patch fails closed on changed source',()=>{
 assert.throws(()=>patchRootPosition('',{equal:true,relax:false}),/patch target changed/);
 assert.throws(()=>patchRootPosition('',{equal:false,relax:true}),/patch target changed/);
 assert.equal(patchRootPosition('source',{equal:false,relax:false}),'source');
});
test('root-position factorial preserves all historical contrasts and gate interaction',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-root-position-results.json',import.meta.url),'utf8'));
 const actual=await evaluateRootPosition();
 assert.equal(actual.rows.length,100);
 assert.deepEqual(actual.variants,expected.variants);
 assert.deepEqual(actual.metrics,expected.metrics);
 assert.deepEqual(actual.rows,expected.rows);
 const byId=id=>actual.rows.find(r=>r.id===id);
 assert.deepEqual(byId('ZW03').v3,['strong','strong','strong','strong']);
 assert.deepEqual(byId('ZW03').v4,[null,null,'strong','strong']);
 assert.deepEqual(byId('ZN01').v4,[null,null,null,'strong']);
 assert.deepEqual(byId('L82').v4,['weak',null,'weak',null]);
});
