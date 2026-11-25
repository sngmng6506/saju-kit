import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternUsefulElementV7,analyzePatternUsefulElementV8,PATTERN_V8_VERSION} from '../src/index.js';
import {observeMixedUse} from '../src/features/pattern-useful-element-v8/review.js';
import {auditClassicalPatterns} from '../scripts/audit-classical-patterns.mjs';
const pillar=text=>({stem:text[0],branch:text[1],text});
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?pillar(ps[i]):null]))});
const run=saju=>analyzePatternUsefulElementV8({saju,birthBasis:'verified-chart',policy:PATTERN_V8_VERSION});
const samples=[["jia-chen-resource-aligned",["계유","병진","갑신","갑자"]],["bing-chen-officer-resource",["계유","무진","병오","을묘"]],["jia-chou-wealth-officer-projected",["신유","기축","갑인","병인"]],["jia-chou-wealth-officer-group",["기유","을축","갑인","정사"]],["ren-wei-officer-hurting-group",["기해","정미","임인","계묘"]],["jia-chen-wealth-resource-combine",["계축","무진","갑자","병인"]],["jia-chen-wealth-resource-control",["무인","임진","갑자","병인"]],["jia-chen-resource-output-risk",["임인","병진","갑오","갑인"]],["jia-chen-resource-output-protected",["임신","병진","갑자","갑인"]],["jia-chen-resource-clash",["임술","병진","갑인","갑자"]],["gui-chen-officer-regulates-peer-group",["무신","병진","계축","임자"]],["bing-chen-food-regulates-killing",["무인","임진","병오","갑인"]]];
test('source motifs match literal requirements, not a final outcome',()=>{
 for(const [id,ps] of samples){const r=run(chart(ps));assert.equal(r.mixedUse.reviews.find(x=>x.id===id).matched,true,id);
 assert.equal(r.mixedUse.confirmed,false);assert.equal(r.selectedPattern,null);assert.equal(r.assistantGod,null);
 assert.equal(run(chart([...ps.slice(0,3),null])).mixedUse.hypothesis,null);}
});
test('source schematic with incompatible full-chart parity is not a fabricated historical chart',()=>{
 const r=observeMixedUse({"candidates":[]},{"month":{"branch":"술"},"dayMaster":{"stem":"갑"},"completeHour":true,"profiles":[{"visible":[{"position":"year","stem":"신"},{"position":"hour","stem":"정"}]}],"clashes":[]},{"formations":[{"id":"fire","type":"branch.threeHarmony","layer":"branch","complete":true,"associatedElement":"fire","positions":["year","month","day"],"members":["인","오","술"],"disruptions":[]}]});
 assert.equal(r.reviews.find(q=>q.id==='jia-xu-officer-hurting-group').matched,true);
 assert.equal(r.hypothesis,null);
});
test('v8 preserves v7 outputs except research preference, and never gains authority',()=>{
 const saju=chart(samples[0][1]),a=analyzePatternUsefulElementV7({saju,birthBasis:'verified-chart',policy:'pattern-useful-element-v7'}),b=run(saju);
 const {mixedUse,preference,version,...rest}=b;assert.deepEqual(rest,(({preference,version,...r})=>r)(a));
 assert.equal(mixedUse.selectionAuthority,false);assert.equal(preference.selectionAuthority,false);
 assert.equal(run(chart(['갑자','병인','신묘','계해'])).mixedUse.status,'not-applicable');
});
test('reference audit preserves candidate retrieval and measures preference separately',()=>{
 const a=auditClassicalPatterns('pattern-useful-element-v7'),b=auditClassicalPatterns(PATTERN_V8_VERSION);
 assert.equal(b.summary.candidateHits,a.summary.candidateHits);assert.equal(b.summary.coverage,0);
 assert.equal(b.summary.preference.proposed,9);assert.equal(b.summary.preference.correct,9);
});
