import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateClassicalCase,summarizeClassical} from '../scripts/lib/classical-pattern-evaluation.mjs';
import {auditClassicalPatterns} from '../scripts/audit-classical-patterns.mjs';
test('dataset identity and source scope',async()=>{
 const d=JSON.parse(await readFile(new URL('./fixtures/pattern-classical-v2.json',import.meta.url),'utf8'));
 assert.equal(d.cases.length,81);assert.equal(new Set(d.cases.map(c=>c.pillars.join(''))).size,d.cases.length);
 assert.equal(d.cases.filter(c=>c.split==='development-known').length,12);
 for(const c of d.cases){assert.ok(c.source.url);assert.equal(c.annotation.selectedUsefulStem,null);assert.equal(c.annotation.selectedAssistantStem,null);if(!c.eligible)assert.equal(c.annotation.expectedFamily,null);}
});
test('selective accuracy does not reward abstention or candidate recall',()=>{
 const base={eligible:true,annotation:{expectedFamily:'officer',actors:[]},source:{transcription:'synthetic'},split:'control',id:'control'};
 const results=[null,{family:'officer'},{family:'wealth'}].map(selectedPattern=>evaluateClassicalCase(base,{selectedPattern,selection:{candidates:[{family:'officer'},{family:'wealth'}]}}));
 const s=summarizeClassical(results);
 assert.equal(s.candidateRecall,1);assert.equal(s.coverage,2/3);assert.equal(s.selectiveAccuracy,1/2);assert.equal(s.abstentionRate,1/3);
 assert.equal(summarizeClassical(results.slice(0,1)).selectiveAccuracy,null);
});
test('audit does not silently grant selection',()=>{
 const r=auditClassicalPatterns();assert.equal(r.summary.total,81);assert.equal(r.summary.coverage,0);assert.equal(r.summary.selectiveAccuracy,null);
});
