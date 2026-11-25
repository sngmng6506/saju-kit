import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternUsefulElementV4,analyzePatternUsefulElementV5,PATTERN_V5_VERSION} from '../src/index.js';
import {resolvePatternPreference} from '../src/features/pattern-useful-element-v5/preference.js';
import {auditClassicalPatterns} from '../scripts/audit-classical-patterns.mjs';
const p={id:'principal:갑',kind:'month-principal',family:'peer',stems:['갑']};
const c=(id,family,kind='month-hidden-projection',stems=['병'])=>({id,family,kind,stems});
const principal=c('principal:신','officer','month-principal',['신']);
const run=(cs,m='유',hour=true)=>resolvePatternPreference({candidates:cs},m,hour);
test('month-family preference is explicit and abstains on unresolved alternatives',()=>{
 assert.equal(run([principal]).hypothesis.family,'officer');
 assert.equal(run([principal,c('projected:병','food')]).hypothesis.family,'food');
 assert.equal(run([principal,c('a','food'),c('b','wealth')]).reason,'competing-projected-families');
 assert.equal(run([principal], '진').reason,'mixed-month-without-projection');
 assert.equal(run([principal,c('storage:갑','wealth','month-storage-projection',['갑'])],'미').hypothesis.family,'wealth');
 assert.equal(run([principal], '유',false).reason,'missing-hour');
 assert.equal(run([principal,{id:'f',kind:'month-formation',possibleTenGods:['정관','편관']}]).reason,'competing-or-unresolved-month-formation');
 assert.equal(run([p,{id:'peer:lu',kind:'month-peer-class',family:'peer',peerClass:'established-lu',stems:[]}],'인').hypothesis.family,'peer');
 assert.equal(run([p,{id:'peer:lu',kind:'month-peer-class',family:'peer',peerClass:'established-lu',stems:[]},c('a','food')],'인').reason,'peer-class-versus-projection');
 assert.equal(run([principal]).selectionAuthority,false);
});
test('opt-in wrapper leaves all prior result fields and final selection untouched',()=>{
 const pillar=text=>({stem:text[0],branch:text[1],text});
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,pillar(['갑자','신미','신유','임진'][i])]))};
 const input={saju,birthBasis:'verified-chart'},a=analyzePatternUsefulElementV4({...input,policy:'pattern-useful-element-v4'}),b=analyzePatternUsefulElementV5({...input,policy:PATTERN_V5_VERSION});
 const {preference,version,...rest}=b;
 assert.deepEqual(rest,(({version,...r})=>r)(a));
 assert.equal(b.selectedPattern,null);assert.equal(b.assistantGod,null);
 assert.equal(preference.hypothesis?.family,'wealth');
 assert.equal(analyzePatternUsefulElementV5({...input,birthBasis:'provisional-chart',policy:PATTERN_V5_VERSION}).preference.reason,'unavailable-chart');
});
test('research preference has separate denominators and never increments final selection coverage',()=>{
 const r=auditClassicalPatterns(PATTERN_V5_VERSION);
 assert.equal(r.summary.selectionLabelled,13);
 assert.equal(r.summary.candidateHits,67);
 assert.equal(r.summary.coverage,0);
 assert.equal(r.summary.preference.proposed+r.summary.preference.abstained,13);
 assert.equal(r.summary.preference.correct+r.summary.preference.wrong,r.summary.preference.proposed);
});
