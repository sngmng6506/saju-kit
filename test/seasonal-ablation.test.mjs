import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateSeasonalAblation} from '../scripts/seasonal-ablation.mjs';
test('neutral season recomputes frozen reference directions',async()=>{
 const r=await evaluateSeasonalAblation();
 assert.equal(r.total,96);assert.equal(r.scenarioCount,2712);
 assert.deepEqual(r.totals,[[[26,3,35],[33,0,31],[33,0,31]],[[24,2,38],[34,0,30],[34,0,30]]]);
 assert.deepEqual(r.corpora.flatMap(c=>c.rows).filter(x=>x.results[0][2]!==x.results[1][2]).map(x=>x.id),['XU12','XU28','DW03','R07']);
});
