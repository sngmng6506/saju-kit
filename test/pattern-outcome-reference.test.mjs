import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateOutcomeProbe,evaluateOutcomeCase,summarizeOutcome} from '../scripts/lib/pattern-outcome-reference.mjs';
import {outcomeRules} from '../src/features/pattern/outcome-rules.js';
import {analyzePatternOutcome,PATTERN_OUTCOME_VERSION} from '../src/index.js';
const read=name=>JSON.parse(readFileSync(new URL('./fixtures/'+name,import.meta.url),'utf8'));
const data=read('pattern-outcome-reference-v1.json'),corpus=read('pattern-classical-v2.json');
test('source labels are separate from frozen corpus and refer to valid scoped rules',()=>{
 const seen=new Set();
 for(const row of data.cases){
  assert.ok(!seen.has(row.caseId));seen.add(row.caseId);
  const c=corpus.cases.find(x=>x.id===row.caseId);
  assert.ok(c?.eligible);assert.deepEqual(row.pillars,c.pillars);assert.equal(row.family,c.annotation.expectedFamily);
  assert.equal(row.finalOutcome,null);assert.ok(row.source.length&&row.interpretation);
  for(const p of row.probes){
   assert.equal(p.expected,'present');
   if(p.ruleId===null)assert.ok(p.gap);else assert.ok(outcomeRules(row.family).some(r=>r.id===p.ruleId&&r.kind===p.kind),p.id);
  }
 }
 assert.equal(new Set(data.cases.map(r=>r.family)).size,8);
});
test('evaluation distinguishes exact role hit, different role, missing mapping and unavailable candidate',()=>{
 const p={ruleId:'x',kind:'rescue',roles:{helper:'a',obstacle:'b'},expected:'present'};
 const q={candidateId:'c',status:'diagnostic',rules:[{id:'x',kind:'rescue',observed:true,witnesses:[{id:'w',roles:{helper:'a',obstacle:'b'}}]}]};
 assert.equal(evaluateOutcomeProbe([q],p).status,'matched');
 assert.equal(evaluateOutcomeProbe([q],{...p,roles:{helper:'c'}}).status,'mismatch');
 assert.equal(evaluateOutcomeProbe([{...q,status:'partial'}],{...p,roles:{helper:'c'}}).status,'unresolved');
 assert.equal(evaluateOutcomeProbe([q],{...p,ruleId:null}).status,'unmapped');
 assert.equal(evaluateOutcomeProbe([],p).status,'unavailable');
 assert.equal(evaluateOutcomeProbe([q],{...p,expected:'absent',roles:{helper:'c'}}).status,'matched');
 assert.equal(summarizeOutcome([]).positiveProbeRecall,null);
});
test('synthetic positive, negative and unknown-hour controls are not classical accuracy labels',()=>{
 for(const c of data.controls){
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))};
  const row=evaluateOutcomeCase(c,analyzePatternOutcome({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_VERSION}));
  for(const p of row.probes)assert.equal(p.status,'matched',c.id+' '+p.id);
 }
});
