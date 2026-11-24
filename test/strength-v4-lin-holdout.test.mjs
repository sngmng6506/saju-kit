import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateV4LinHoldout} from '../scripts/evaluate-strength-v4-lin-holdout.mjs';
test('frozen prospective Lin results preserve disagreements and abstentions',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-v4-lin-holdout-results.json',import.meta.url),'utf8'));
 const actual=await evaluateV4LinHoldout();
 assert.deepEqual(actual.metrics,expected.metrics);
 assert.deepEqual(actual.rows,expected.rows);
});
