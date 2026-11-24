import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateAbstentions,abstentionBucket} from '../scripts/evaluate-strength-abstentions.mjs';
test('abstention classification gives conflicts precedence and rejects directional inputs',()=>{
 assert.equal(abstentionBucket({direction:null,grounds:[],conflicts:['x']},{pressureAll:true,rootLow:true}),'conflict');
 assert.equal(abstentionBucket({direction:null,grounds:[],conflicts:[]},{pressureAll:true,rootLow:true}),'no-ground-pressure-all');
 assert.equal(abstentionBucket({direction:null,grounds:['x'],conflicts:[]},{}),'unresolved-other');
 assert.throws(()=>abstentionBucket({direction:'weak',grounds:[],conflicts:[]},{}),/expected abstention/);
});
test('all 50 historical abstentions reproduce their diagnostics',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-abstention-results.json',import.meta.url),'utf8'));
 const actual=await evaluateAbstentions();
 assert.equal(actual.rows.length,50);
 assert.deepEqual(actual.metrics,expected.metrics);
 assert.deepEqual(actual.rows,expected.rows);
});
