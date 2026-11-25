import test from 'node:test';
import assert from 'node:assert/strict';
import { scanSymbols,auditDeadCode } from '../scripts/audit-dead-code.mjs';

test('symbol audit separates unreferenced locals from external research references',()=>{
 const sources={
  'src/core/example.js':"import { unusedImport, used } from './other.js';\nfunction unusedFunction(){}\nconst unusedValue=1;\nexport function researchOnly(){return used;}\nexport function unresolvedExport(){}\nexport function publicFunction(){return 1;}\n",
  'src/index.js':"export { publicFunction } from './core/example.js';\n",
 };
 const result=scanSymbols(sources,{'scripts/research.mjs':"import { researchOnly } from '../src/core/example.js';\nresearchOnly();"});
 assert.deepEqual(result.localCandidates.map(x=>x.name).sort(),['unusedFunction','unusedImport','unusedValue']);
 assert.deepEqual(result.exportCandidates.map(x=>[x.name,x.classification]),[['researchOnly','research-or-test-reference'],['unresolvedExport','unresolved-export']]);
 assert.deepEqual(result.exportCandidates[0].references,['scripts/research.mjs']);
});
test('runtime reachability audit separates compatibility shims from implementation files',()=>{
 const r=auditDeadCode();
 assert.ok(r.compatibility.totalShims>0);
 assert.ok(r.compatibility.unreachableCompatibility.length>0);
 assert.deepEqual(r.compatibility.unreachableNonShims,[]);
 assert.deepEqual(r.architecture.missing,[]);
 assert.deepEqual(r.architecture.violations,[]);
 assert.deepEqual(r.architecture.cycles,[]);
 for(const name of ['analyzeMultihopInteraction','evaluateBalanceRoutes']){
  const c=r.exportCandidates.find(x=>x.name===name);
  assert.ok(c?.references.some(p=>p.startsWith('scripts/')),name);
 }
});
