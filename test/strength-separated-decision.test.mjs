import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyzeStrengthDecision} from '../src/index.js';
import {collectStrengthEvidence,resolveStrengthEvidence} from '../src/features/strength-decision-v1/index.js';
import {evaluateSeparatedDecision} from '../scripts/evaluate-strength-separated-decision.mjs';
import {chartFromReference} from '../scripts/strength-reference.mjs';

const args=pillars=>({saju:chartFromReference(pillars),birthBasis:'verified-chart',policy:'strength-decision-v1'});
test('all 100 historical directions and full v4 decision contracts are reproduced',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-separated-decision-results.json',import.meta.url),'utf8'));
 const actual=await evaluateSeparatedDecision();
 assert.equal(actual.rows.length,100);
 assert.deepEqual(actual.rows,expected.rows);
 assert.deepEqual(actual.metrics,expected.metrics);
});
test('peripheral evidence never silently grants independent authority',()=>{
 const input=args(['丁丑','丙午','己亥','甲戌']);
 const evidence=collectStrengthEvidence(input);
 assert.equal(evidence.structure.peripheralCandidate,true);
 const fixed=resolveStrengthEvidence(evidence);
 assert.equal(fixed.direction,null);
 assert.equal(fixed.seasonRobustness.required,true);
 assert.equal(fixed.authority.peripheralRoot,false);
 const expanded=resolveStrengthEvidence(evidence,{peripheralAuthority:'independent-experimental'});
 assert.equal(expanded.direction,'strong');
 assert.ok(expanded.decision.grounds.includes('peripheral-root-capacity'));
 assert.ok(!expanded.decision.grounds.includes('central-root-capacity'));
 assert.equal(expanded.seasonRobustness.required,false);
 assert.equal(analyzeStrengthDecision({...input,peripheralAuthority:'independent-experimental'}).direction,null);
 assert.throws(()=>resolveStrengthEvidence(evidence,{peripheralAuthority:'unknown'}),{code:'strength-confirmation-policy'});
});
test('new authority cannot bypass concentrated pressure or an existing conflict',()=>{
 const evidence=collectStrengthEvidence(args(['己巳','甲戌','壬辰','庚子']));
 assert.equal(evidence.structure.peripheralCandidate,true);
 const expanded=resolveStrengthEvidence(evidence,{peripheralAuthority:'independent-experimental'});
 assert.equal(expanded.direction,null);
 assert.ok(expanded.decision.conflicts.includes('concentrated-pressure-versus-support'));
 const conflicted={...evidence,standard:{...evidence.standard,decision:{...evidence.standard.decision,conflicts:['existing-conflict']}}};
 const result=resolveStrengthEvidence(conflicted,{peripheralAuthority:'independent-experimental'});
 assert.equal(result.direction,null);
 assert.equal(result.authority.peripheralRoot,false);
 assert.ok(result.decision.conflicts.includes('existing-conflict'));
});
test('unknown grounds fail closed rather than granting strong authority',()=>{
 const evidence=collectStrengthEvidence(args(['丁丑','丙午','己亥','甲戌']));
 const invalid={...evidence,standard:{...evidence.standard,decision:{...evidence.standard.decision,grounds:['unregistered-ground']}}};
 assert.throws(()=>resolveStrengthEvidence(invalid),{code:'strength-ground-contract'});
});
test('provisional and missing hour remain non-directional',()=>{
 const input=args(['丁丑','丙午','己亥','甲戌']);
 for(const x of [{...input,birthBasis:'provisional-chart'},{...input,saju:{pillars:{...input.saju.pillars,hour:null}}}]){
  const r=analyzeStrengthDecision(x);
  assert.equal(r.direction,null);
  assert.equal(r.decision,null);
  assert.equal(r.observations.structure,null);
  assert.equal(r.seasonRobustness.required,false);
 }
});
