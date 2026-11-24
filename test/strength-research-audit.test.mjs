import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FIXTURES,REPORTS,auditResearchRecords,auditResearchFiles} from '../scripts/audit-strength-research.mjs';

const load=async(path,names)=>Object.fromEntries(await Promise.all(names.map(async n=>[n,JSON.parse(await readFile(new URL(path+n+'.json',import.meta.url),'utf8'))])));
test('research fixture identities, baseline joins and metrics agree',async()=>{
 const r=await auditResearchFiles();
 assert.deepEqual(r.issues,[]);
 assert.equal(r.ok,true);
 // Frozen experiment cohort size; new fixture expansion is deliberate.
 assert.equal(r.baselineCount,100);
 assert.equal(r.abstentionCount,50);
 assert.equal(r.referenceCount,135);
 assert.equal(r.uniqueCharts,r.referenceCount);
 assert.equal(r.uniqueIds,r.referenceCount);
 assert.equal(r.metricChecks,42);
});
test('audit rejects missing or duplicate rows, relabeling, changed metrics and candidate flags',async()=>{
 const [fixtures,reports]=await Promise.all([load('./fixtures/',FIXTURES),load('../docs/',REPORTS)]);
 const corruptions=[
  ['report-id-set-mismatch',r=>r['strength-multihop-results'].rows.pop()],
  ['duplicate-report-id',r=>r['formation-evidence-results'].rows.push(r['formation-evidence-results'].rows[0])],
  ['reference-mismatch',r=>{const x=r['strength-peer-root-access-results'].rows[0];x.reference=x.reference==='strong'?'weak':'strong';}],
  ['agree-metric-mismatch',r=>r['strength-separated-decision-results'].metrics.all.fixed.agree++],
  ['pressure-candidate-mismatch',r=>{const x=r['strength-resource-route-sensitivity-results'].rows[0];x.candidate=!x.candidate;}]
 ];
 for(const [reason,mutate] of corruptions){
  const r=structuredClone(reports);mutate(r);
  const a=auditResearchRecords(fixtures,r);
  assert.equal(a.ok,false,reason);
  assert.ok(a.issues.some(i=>i.reason===reason),reason);
 }
});
