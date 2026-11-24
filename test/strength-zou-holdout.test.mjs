import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateZouHoldout} from '../scripts/evaluate-strength-zou-holdout.mjs';
test('prospective Zou scan comparison preserves all observed directions and diagnostics',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-zou-holdout-results.json',import.meta.url),'utf8'));
 const actual=await evaluateZouHoldout();
 assert.deepEqual(actual.variants,expected.variants);
 assert.deepEqual(actual.metrics,expected.metrics);
 assert.equal(actual.rows.length,8);
 for(const r of actual.rows){
  const {principal,localPeer,...e}=expected.rows.find(x=>x.id===r.id);
  assert.deepEqual(r,e,r.id);
 }
});
