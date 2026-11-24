import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {peerRootScenario,candidateDirection,evaluatePeerRootAccess} from '../scripts/evaluate-strength-peer-root-access.mjs';
test('peer branch mass is added once; stem premium subtraction is exact',()=>{
 const s={rootProfile:'mild',mass:{peer:19000,resource:4000,output:25000,wealth:1000,officer:2000},contributions:[
  {category:'peer',role:null,units:9000,weight:1,share:1,rootFactor:90,seasonFactor:100},
  {category:'peer',role:'principal',units:10000}
 ]};
 assert.deepEqual(peerRootScenario(s,{mild:80}),{stem:9000,root:10000,premium:1000,base:13000,pressure:25000,full:23000,discount:22000});
 assert.throws(()=>peerRootScenario({...s,mass:{...s.mass,peer:1}},{mild:80}),/accounting/);
});
test('research candidate never overwrites a direction or a conflict',()=>{
 const row={fixed:null,bucket:'no-ground-pressure-all',stats:{standard:{allPressure:[true,true,true]},neutral:{allPressure:[true,true,true]}}};
 assert.equal(candidateDirection(row,1),'weak');
 assert.equal(candidateDirection({...row,fixed:'strong'},1),'strong');
 assert.equal(candidateDirection({...row,bucket:'conflict'},1),null);
 assert.equal(candidateDirection({...row,stats:{...row.stats,neutral:{allPressure:[true,false,true]}}},1),null);
});
test('all 100 peer-root scenarios and candidate counterexamples replay',async()=>{
 const expected=JSON.parse(await readFile(new URL('../docs/strength-peer-root-access-results.json',import.meta.url),'utf8'));
 const actual=await evaluatePeerRootAccess();
 assert.equal(actual.rows.length,100);
 assert.deepEqual(actual.modes,expected.modes);
 assert.deepEqual(actual.summary,expected.summary);
 assert.deepEqual(actual.rows,expected.rows);
 assert.deepEqual(actual.candidates.metrics.primary,{fixed:{n:71,agree:38,disagree:1,abstain:32},p1:{n:71,agree:46,disagree:1,abstain:24},p2:{n:71,agree:46,disagree:1,abstain:24}});
 assert.deepEqual(actual.candidates.metrics.secondary,{fixed:{n:29,agree:10,disagree:1,abstain:18},p1:{n:29,agree:11,disagree:2,abstain:16},p2:{n:29,agree:11,disagree:2,abstain:16}});
 assert.ok(actual.candidates.changes.some(r=>r.id==='H01'&&r.reference==='strong'&&r.p1==='weak'));
});
