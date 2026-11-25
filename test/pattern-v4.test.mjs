import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternUsefulElementV3,analyzePatternUsefulElementV4,PATTERN_V4_VERSION} from '../src/index.js';
import {auditClassicalPatterns} from '../scripts/audit-classical-patterns.mjs';
import {observeRolePaths} from '../src/features/pattern-useful-element-v4/extension.js';
const pillar=text=>({stem:text[0],branch:text[1],text});
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?pillar(ps[i]):null]))});
const run=saju=>analyzePatternUsefulElementV4({saju,birthBasis:'verified-chart',policy:PATTERN_V4_VERSION});
test('storage is a separate hypothesis, not a hidden-stem mutation',()=>{
 const saju=chart(['갑자','신미','신유','임진']),r=run(saju),a=analyzePatternUsefulElementV3({saju,birthBasis:'verified-chart',policy:'pattern-useful-element-v3'});
 assert.deepEqual(r.selection.monthHidden,a.selection.monthHidden);
 assert.ok(r.selection.candidates.some(c=>c.id==='storage:갑'&&c.family==='wealth'));
 assert.ok(!a.selection.candidates.some(c=>c.family==='wealth'));
 assert.equal(r.storageReview.candidates.find(c=>c.id==='storage:갑').rootEffective,null);
 assert.equal(r.selectedPattern,null);
 assert.ok(r.roleReview.find(q=>q.candidateId==='storage:갑').paths.find(p=>p.id==='wealth-output-mediates-peer').witnesses.some(w=>w.roles.helper==='visible:hour'));
});
test('four storage branches, exact projection excluded, day reference excluded, partial absence unknown',()=>{
 const samples=[['임자','무진','갑인','병인','임'],['병자','무술','갑인','갑인','병'],['경자','기축','갑인','갑인','경'],['갑자','기미','신유','임진','갑']];
 for(const [y,m,d,h,s] of samples)assert.ok(run(chart([y,m,d,h])).storageReview.candidates.some(c=>c.stems[0]===s));
 assert.equal(run(chart(['갑자','병인','갑인','갑인'])).storageReview.candidates.length,0);
 assert.equal(run(chart(['계축','무진','갑인','갑인'])).storageReview.candidates.length,0);
 assert.equal(run(chart(['갑자','기미','갑인',null])).storageReview.candidates.length,1);
 assert.equal(run(chart(['병자','기미','갑인',null])).storageReview.projectionObserved,null);
});
test('food and resource separation requires a visible intervening peer/day, not just coexistence',()=>{
 const selection={candidates:[{id:'wealth',family:'wealth',stems:['계']}]};
 const x=(id,position,stem,element,tenGod,dayReference=false,layer='visible')=>({id,position,stem,element,tenGod,dayReference,layer});
 const occurrences=[x('food','year','경','metal','식신'),x('peer','month','무','earth','비견'),x('day','day','무','earth','비견',true),x('resource','hour','병','fire','편인'),x('wealth','month','계','water','정재',false,'hidden')];
 const observe=(o,complete=true)=>observeRolePaths(selection,o,{formations:[]},complete)[0].paths.find(p=>p.id==='wealth-resource-separated');
 assert.equal(observe(occurrences).observed,true);
 const adjacent=occurrences.map(o=>o.id==='resource'?{...o,position:'month'}:o);
 assert.equal(observe(adjacent).observed,false);
 assert.equal(observe(adjacent,false).observed,null);
});
test('v4 preserves original candidates and no authority on the 81-reference audit',()=>{
 const a=auditClassicalPatterns(),b=auditClassicalPatterns(PATTERN_V4_VERSION);
 assert.equal(a.summary.total,81);assert.equal(b.summary.total,81);
 for(const [i,r] of a.rows.entries()){assert.equal(r.id,b.rows[i].id);assert.ok(r.candidateFamilies.every(f=>b.rows[i].candidateFamilies.includes(f)));}
 assert.equal(b.summary.candidateHits,67);assert.equal(b.summary.coverage,0);assert.equal(b.summary.selectiveAccuracy,null);
});
