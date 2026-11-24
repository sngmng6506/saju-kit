import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateStrengthFactorial} from '../scripts/strength-factorial.mjs';
test('frozen factorial comparison',async()=>{
 const r=await evaluateStrengthFactorial();
 assert.equal(r.total,96);
 assert.deepEqual(r.totals,[[33,0,31],[36,0,28],[34,0,30],[37,0,27]]);
 assert.equal(r.agreementInteraction,0);
 assert.deepEqual(r.corpora.flatMap(c=>c.rows).filter(x=>x.results.some(y=>y!==x.results[0])).map(x=>x.id),['XU07','XU12','XU24','XU28','W10','DW03','R07']);
});
