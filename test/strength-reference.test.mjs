import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chartFromReference,evaluateReferences } from '../scripts/strength-reference.mjs';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/strength-ditiansui-v1.json',import.meta.url),'utf8'));
const baseline=JSON.parse(readFileSync(new URL('./fixtures/strength-ditiansui-v1-baseline.json',import.meta.url),'utf8'));

test('classical development set retains chapter sequence, label provenance and full pillars',()=>{
  assert.equal(fixture.cases.length,26);
  assert.equal(new Set(fixture.cases.map(c=>c.id)).size,26);
  const extreme=fixture.cases.filter(c=>c.source==='extreme');
  assert.equal(extreme.length,20);
  assert.deepEqual(extreme.map(c=>c.ordinal),Array.from({length:20},(_,i)=>i+1));
  assert.ok(extreme.every(c=>c.reference==='review-required'));
  for(const c of fixture.cases){
    assert.equal(c.split,'development');
    assert.ok(fixture.sources[c.source]?.url.startsWith('https://'));
    assert.ok(c.labelBasis);
    assert.equal(Object.keys(chartFromReference(c.pillars).pillars).length,4);
  }
  assert.throws(()=>chartFromReference(['子甲','甲子','甲子','甲子']));
});
test('reference evaluation preserves policy v1 baseline, including known misses',()=>{
  assert.deepEqual(evaluateReferences(fixture),baseline);
  assert.deepEqual(baseline.counts,{'review-missed-abstained':4,'review-detected':15,'review-missed-candidate':1,abstained:4,'descriptive-only':2});
  assert.equal(baseline.rows.find(r=>r.id==='DW09').outcome,'review-missed-candidate');
  assert.equal(baseline.rows.find(r=>r.id==='DX02').qualitative,'strong');
  assert.equal(baseline.rows.find(r=>r.id==='DX02').reference,'weak');
});
