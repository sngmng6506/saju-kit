import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluatePressureControls,evaluateLivePressureCandidate} from '../scripts/evaluate-strength-pressure-controls.mjs';
import {chartFromReference} from '../scripts/strength-reference.mjs';
test('live pressure candidate reproduces frozen prospective and historical controls',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-pressure-controls-results.json',import.meta.url),'utf8'));
 assert.deepEqual(await evaluatePressureControls(),expected.rows);
});
test('provisional chart is never promoted',()=>{
 const r=evaluateLivePressureCandidate({saju:chartFromReference(['壬申','壬子','戊午','乙卯']),birthBasis:'provisional-chart'});
 assert.equal(r.fixed,null);assert.equal(r.p1,null);assert.equal(r.p2,null);assert.equal(r.eligible,false);
});
