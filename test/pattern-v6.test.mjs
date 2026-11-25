import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternUsefulElementV5,analyzePatternUsefulElementV6,PATTERN_V6_VERSION} from '../src/index.js';
import {auditClassicalPatterns} from '../scripts/audit-classical-patterns.mjs';
import {refineOfficerPreference} from '../src/features/pattern-useful-element-v6/officer.js';
const pillar=text=>({stem:text[0],branch:text[1],text});
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?pillar(ps[i]):null]))});
const run=saju=>analyzePatternUsefulElementV6({saju,birthBasis:'verified-chart',policy:PATTERN_V6_VERSION});
test('classical officer preservation is a hypothesis, not effective cancellation',()=>{
 const saju=chart(['경인','을유','갑자','무진']),a=analyzePatternUsefulElementV5({saju,birthBasis:'verified-chart',policy:'pattern-useful-element-v5'}),b=run(saju);
 assert.equal(a.preference.hypothesis.family,'killing');assert.equal(b.preference.hypothesis.family,'officer');
 assert.equal(b.preference.officerReview.effectiveCancellation,null);assert.equal(b.selectedPattern,null);
 assert.equal(b.preference.confirmed,false);
 const {preference,version,...rest}=b;assert.deepEqual(rest,(({preference,version,...x})=>x)(a));
});
test('non-combination and contested combinations abstain rather than assume removal',()=>{
 const p={status:'hypothesis',hypothesis:{family:'killing'},observations:{principalFamily:'officer',formations:[]},confirmed:false,selectionAuthority:false};
 const selection={candidates:[{id:'principal:신',kind:'month-principal',family:'officer',stems:['신']}]};
 const v=(position,stem)=>({position,stem}),s={dayMaster:{stem:'갑'},profiles:[{visible:[v('year','경'),v('month','을'),v('day','갑'),v('hour','을')]}],clashes:[]};
 const pair=(id,positions)=>({id,positions,type:'stem.combine'});
 const ref=formations=>refineOfficerPreference(p,selection,s,{formations});
 assert.equal(ref([]).reason,'officer-killing-preservation-unresolved');
 assert.equal(ref([pair('a',['year','month']),pair('b',['year','hour'])]).reason,'officer-killing-preservation-unresolved');
 assert.equal(ref([pair('a',['year','month'])]).hypothesis.family,'officer');
 assert.equal(refineOfficerPreference(p,selection,{...s,clashes:[{positions:['month','hour']}]},{formations:[pair('a',['year','month'])]}).hypothesis,null);
 assert.equal(run(chart(['경인','을유','갑자',null])).preference.reason,'missing-hour');
});
test('audit distinguishes proposal evaluation from final authority',()=>{
 const a=auditClassicalPatterns('pattern-useful-element-v5'),b=auditClassicalPatterns(PATTERN_V6_VERSION);
 assert.deepEqual(a.summary.preference,{labelled:13,proposed:9,correct:8,wrong:1,abstained:4,coverage:9/13,selectiveAccuracy:8/9});
 assert.equal(b.summary.coverage,0);assert.equal(b.summary.selectionLabelled,13);
 assert.equal(b.summary.preference.proposed+b.summary.preference.abstained,13);
 assert.equal(b.summary.candidateHits,a.summary.candidateHits);
});
