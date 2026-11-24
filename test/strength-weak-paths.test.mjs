import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateWeakPaths,candidateDirections} from '../scripts/evaluate-strength-weak-paths.mjs';

test('candidate guards only abstain from weak, never promote or reverse',()=>{
 assert.deepEqual(candidateDirections('strong',null),Array(6).fill('strong'));
 assert.deepEqual(candidateDirections(null,null),Array(6).fill(null));
 assert.deepEqual(candidateDirections('weak',[true,false,true,false,false]),['weak',null,'weak',null,'weak','weak']);
 assert.throws(()=>candidateDirections('weak',null),/missing weak-path checks/);
});
test('native replay of primary weak-path diagnostics preserves counterexample',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-weak-path-results.json',import.meta.url),'utf8'));
 const actual=await evaluateWeakPaths();
 assert.equal(actual.rows.length,92);
 assert.deepEqual(actual.metrics,expected.metrics);
 const prior=new Map(expected.rows.map(r=>[r.id,r]));
 for(const r of actual.rows){
  assert.deepEqual(r.results,prior.get(r.id).results,r.id);
  // The earlier sensitivity table was derived from stored no-veto results.
  // This native replay additionally evaluates the full v4 no-veto engine.
  if(r.baseline==='weak')assert.deepEqual(r.checks,prior.get(r.id).checks,r.id);
 }
 for(const id of ['L82','XU19']){
  const r=actual.rows.find(r=>r.id===id);
  assert.deepEqual(r.checks,[true,true,true,false,false],id);
  assert.equal(r.results[1],null,id);
 }
});
