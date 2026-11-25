import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeStemForceEvidence,analyzePatternUsefulElementV8,analyzePatternUsefulElementV9,PATTERN_V9_VERSION} from '../src/index.js';
const pillar=text=>({stem:text[0],branch:text[1],text});
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?pillar(ps[i]):null]))});
test('life stage evidence is not a literal hidden root',()=>{
 const saju=chart(['신유','을유','을묘','정사']),r=analyzeStemForceEvidence({saju});
 const xin=r.occurrences.find(x=>x.id==='visible:year'),ding=r.occurrences.find(x=>x.id==='visible:hour');
 assert.equal(xin.seasonal.monthStage,'건록');assert.equal(ding.seasonal.monthStage,'장생');
 assert.ok(xin.rootBasis.monthRoots.length);assert.equal(ding.rootBasis.monthRoots.length,0);
 assert.equal(ding.effectiveForce,null);assert.equal(ding.forceClass,null);
});
test('missing hour leaves negative evidence unknown and all roles bind to actual occurrences',()=>{
 const saju=chart(['경인','을유','갑자',null]),r=analyzePatternUsefulElementV9({saju,birthBasis:'verified-chart',policy:PATTERN_V9_VERSION});
 const ids=new Set(r.stemForce.occurrences.map(o=>o.id));
 for(const o of r.stemForce.occurrences)for(const d of Object.values(o.diagnostics))assert.notEqual(d,false);
 for(const q of r.patternForce.routes)for(const p of q.routes)for(const l of p.links){assert.ok(ids.has(l.source.occurrenceId));assert.ok(ids.has(l.target.occurrenceId));assert.equal(l.effectConfirmed,null);}
 for(const q of r.patternForce.paths)for(const p of q.paths)for(const w of p.witnesses)for(const b of Object.values(w.roles))assert.ok(ids.has(b.occurrenceId));
 assert.equal(r.selectedPattern,null);assert.equal(r.assistantGod,null);
});
test('v9 is additive, no prior selection change',()=>{
 const saju=chart(['갑자','신미','신유','임진']),input={saju,birthBasis:'verified-chart'},a=analyzePatternUsefulElementV8({...input,policy:'pattern-useful-element-v8'}),b=analyzePatternUsefulElementV9({...input,policy:PATTERN_V9_VERSION});
 const {stemForce,patternForce,version,...rest}=b;assert.deepEqual(rest,(({version,...r})=>r)(a));assert.equal(patternForce.forceConfirmed,null);
 assert.equal(analyzePatternUsefulElementV9({...input,birthBasis:'provisional-chart',policy:PATTERN_V9_VERSION}).stemForce,null);
});
