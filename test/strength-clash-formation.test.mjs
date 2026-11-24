import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateClashFormation,patchDayRoot,patchVisibleRoot} from '../scripts/evaluate-strength-clash-formation.mjs';
test('diagnostic patches fail closed if source contract changes',()=>{
 assert.throws(()=>patchDayRoot(''),/patch target changed/);
 assert.throws(()=>patchVisibleRoot(''),/patch target changed/);
});
test('all 100 historical clash and formation diagnostics replay',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-clash-formation-results.json',import.meta.url),'utf8'));
 const actual=await evaluateClashFormation();
 for(const key of ['variants','metrics','formationCounts','rows'])assert.deepEqual(actual[key],expected[key]);
 for(const id of ['XU06','XU31'])assert.deepEqual(actual.rows.find(r=>r.id===id).results,['strong','weak','strong','weak']);
 assert.deepEqual(actual.rows.find(r=>r.id==='H01').results,[null,'weak',null,'weak']);
 assert.deepEqual(actual.rows.find(r=>r.id==='XU19').results,Array(4).fill('weak'));
});
