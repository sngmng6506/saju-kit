import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternUsefulElementV6,analyzePatternUsefulElementV7,PATTERN_V7_VERSION} from '../src/index.js';
import {auditClassicalPatterns} from '../scripts/audit-classical-patterns.mjs';
const pillar=text=>({stem:text[0],branch:text[1],text});
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?pillar(ps[i]):null]))});
const run=saju=>analyzePatternUsefulElementV7({saju,birthBasis:'verified-chart',policy:PATTERN_V7_VERSION});
const samples=[{"ps":["갑자","병인","신묘","계해"],"family":"wealth","secondary":"officer"},{"ps":["임자","무신","을묘","병오"],"family":"officer","secondary":"resource"},{"ps":["갑자","병인","계묘","을묘"],"family":"hurting-officer","secondary":null},{"ps":["갑오","경인","병술","임오"],"family":"resource","secondary":null},{"ps":["임오","무신","병진","갑오"],"family":"wealth","secondary":null}];
test('five scoped source cases preserve the original family; only two have explicit secondary families',()=>{
 for(const s of samples){const r=run(chart(s.ps));assert.equal(r.composition.primary.family,s.family);assert.equal(r.composition.secondary[0]?.family??null,s.secondary);
 assert.equal(r.preference.hypothesis.family,s.family);assert.equal(r.composition.reviews[0].preservationConfirmed,null);
 assert.equal(r.selectedPattern,null);assert.equal(r.assistantGod,null);
 assert.equal(run(chart([...s.ps.slice(0,3),null])).composition.primary,null);}
});
test('explicit source obstacle does not become a secondary pattern',()=>{
 const r=run(chart(['갑자','병인','계묘','무오']));assert.ok(r.composition.reviews[0].blocked.includes('source-explicit-obstacle'));assert.equal(r.composition.primary,null);assert.deepEqual(r.composition.secondary,[]);
});
test('v7 retains v6 data other than the experimental preference',()=>{
 const saju=chart(samples[0].ps),a=analyzePatternUsefulElementV6({saju,birthBasis:'verified-chart',policy:'pattern-useful-element-v6'}),b=run(saju);
 const {composition,preference,version,...rest}=b;assert.deepEqual(rest,(({preference,version,...r})=>r)(a));assert.equal(composition.confirmed,false);assert.equal(preference.selectionAuthority,false);
});
test('corpus comparison separates research hypotheses from final authority',()=>{
 const a=auditClassicalPatterns('pattern-useful-element-v6'),b=auditClassicalPatterns(PATTERN_V7_VERSION);
 assert.equal(b.summary.candidateHits,a.summary.candidateHits);assert.equal(b.summary.coverage,0);
 assert.equal(b.summary.preference.proposed,9);assert.equal(b.summary.preference.correct,9);
});
