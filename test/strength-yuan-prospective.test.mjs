import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateYuanProspective,evaluateFrozenPressure} from '../scripts/evaluate-strength-yuan-prospective.mjs';
import {chartFromReference} from '../scripts/strength-reference.mjs';
test('frozen electronic controls replay without granting new authority',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-yuan-prospective-results.json',import.meta.url),'utf8'));
 const actual=await evaluateYuanProspective();
 for(const k of ['variants','metrics','rows'])assert.deepEqual(actual[k],expected[k]);
 assert.equal(actual.rows.filter(r=>r.eligible).length,0);
});
test('guards preserve exposed H01 and W09 contrast',()=>{
 const h=evaluateFrozenPressure(chartFromReference(['壬申','壬子','戊午','乙卯']));
 const w=evaluateFrozenPressure(chartFromReference(['癸未','甲子','丙戌','己亥']));
 assert.deepEqual(h.predictions,[null,'weak',null,null]);
 assert.deepEqual(w.predictions,[null,'weak','weak','weak']);
});
