import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {replayFrozenCommandIntervals,compareTextCommandAnnotations} from '../scripts/lib/pattern-outcome-command-replay.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('frozen astronomical intervals reproduce all recorded command hypotheses',()=>{
 const rows=replayFrozenCommandIntervals(read('docs/month-command-results.json'));
 assert.equal(rows.length,6);assert.equal(rows.reduce((n,r)=>n+r.actual.length,0),24);
 assert.ok(rows.every(r=>r.parity));
});
test('text nominal-day contrast retains mismatch without inferring exact birth',()=>{
 const rows=compareTextCommandAnnotations(read('test/fixtures/month-command-text-controls-v1.json'));
 assert.equal(rows.length,2);
 assert.ok(rows[0].variants.every(v=>v.stemMatch));
 assert.ok(rows[1].variants.every(v=>!v.stemMatch));
 assert.equal(rows[1].variants[0].elementMatch,false);
 assert.equal(rows[1].variants[1].elementMatch,true);
 assert.ok(rows.every(r=>r.effectAgreement===null));
});
