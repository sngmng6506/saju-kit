import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeQuantitativeStrength, getSaju, analyzeDayMasterStrength } from '../src/index.js';
const opts={policy:'strength-quantitative-v3',birthBasis:'verified-chart'};
const run=saju=>analyzeQuantitativeStrength({saju,...opts});
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(year,month,day,hour=null)=>({pillars:{year:p(year),month:p(month),day:p(day),hour:hour===null?null:p(hour)}});

test('scenario contributions partition each slot and conserve model mass',()=>{
 const r=run(chart('갑인','을묘','갑진','임자'));
 assert.equal(r.quantitative.scenarioCount,24);
 for(const s of r.quantitative.scenarios){
  assert.equal(Object.values(s.mass).reduce((a,b)=>a+b,0),s.totalUnits);
  assert.equal(s.mass.peer+s.mass.resource,s.supportUnits);
  assert.equal(s.contributions.reduce((a,b)=>a+b.units,0),s.totalUnits);
  const slots=new Map();
  for(const c of s.contributions){slots.set(c.slot,(slots.get(c.slot)||0)+c.share);assert.equal(c.units,c.weight*c.share*c.rootFactor*c.seasonFactor);}
  assert.equal(slots.size,7);assert.ok([...slots.values()].every(x=>x===100));
  assert.ok(!slots.has('dayStem'));assert.ok(s.index>=r.quantitative.min&&s.index<=r.quantitative.max);
 }
});
test('independent arithmetic verifies seasonal order and role allocation',()=>{
 const s=run(chart('갑인','을묘','갑진','임자')).quantitative.baseline;
 const year=s.contributions.find(c=>c.slot==='yearStem');
 assert.equal(year.rootFactor,100);assert.equal(year.seasonFactor,120);
 const hour=s.contributions.find(c=>c.slot==='hourStem');
 assert.equal(hour.rootFactor,100);assert.equal(hour.seasonFactor,100);
 const day=s.contributions.filter(c=>c.slot==='dayBranch');
 assert.deepEqual(day.map(c=>[c.element,c.share,c.seasonFactor]).sort(),[['earth',60,80],['water',30,100],['wood',10,120]].sort());
 assert.equal(year.units,12000000);assert.equal(hour.units,10000000);
});
test('rootless stems are attenuated and distant roots use best match',()=>{
 const s=run(chart('갑신','경자','갑자','경신')).quantitative.baseline;
 assert.equal(s.contributions.find(c=>c.slot==='yearStem').rootFactor,80);
 assert.equal(s.contributions.find(c=>c.slot==='monthStem').rootFactor,97);
});
test('transition month retains both seasonal bases',()=>{
 const r=run(chart('갑신','임진','병자','무인'));
 assert.equal(r.quantitative.scenarioCount,48);
 assert.deepEqual([...new Set(r.quantitative.scenarios.map(s=>s.seasonElement))],['wood','earth']);
 assert.ok(r.caveats.includes('month-command-unresolved'));
});
test('missing hour range covers all twelve fixed-day completions',()=>{
 const birth={y:1997,m:6,d:28,timezone:'Asia/Tokyo'};
 const r=run(getSaju(birth));
 assert.equal(r.status,'partial');assert.equal(r.direction,null);assert.equal(r.quantitative.completionCount,12);
 assert.equal(r.quantitative.scenarioCount,288);assert.equal(r.quantitative.baseline,null);
 const full=Array.from({length:12},(_,i)=>run(getSaju({...birth,hh:i*2,mm:0})).quantitative);
 assert.equal(r.quantitative.min,Math.min(...full.map(q=>q.min)));
 assert.equal(r.quantitative.max,Math.max(...full.map(q=>q.max)));
});
test('provisional and invalid inputs, deterministic and unchanged v1',()=>{
 const saju=chart('경신','임자','갑인','병오');saju.privateMarker='private';
 const before=JSON.stringify(saju),old=()=>analyzeDayMasterStrength({saju,policy:'strength-hybrid-v1',birthBasis:'verified-chart'});
 const v1=old(),r=run(saju);
 assert.deepEqual(run(saju),r);assert.deepEqual(old(),v1);assert.equal(JSON.stringify(saju),before);
 assert.ok(!JSON.stringify(r).includes('privateMarker'));assert.equal('category' in r,false);
 assert.equal(r.specialPatternAssessment,'not-assessed');
 assert.equal(analyzeQuantitativeStrength({saju,...opts,birthBasis:'provisional-chart'}).quantitative,null);
 assert.throws(()=>analyzeQuantitativeStrength({saju}),{code:'strength-policy'});
 assert.throws(()=>analyzeQuantitativeStrength({...opts,saju,birthBasis:'unknown'}),{code:'strength-birth-basis'});
});
test('thresholds use exact ratios rather than rounded output',()=>{
 for(const saju of [chart('갑인','을묘','갑인','임자'),chart('경신','경신','갑신','경신'),chart('무술','갑자','정미','경술')]){
  const q=run(saju).quantitative;
  for(const t of q.thresholdSensitivity){
   const expected=q.scenarios.every(s=>100*s.supportUnits>=t.strong*s.totalUnits)?'strong':
     q.scenarios.every(s=>100*s.supportUnits<=t.weak*s.totalUnits)?'weak':null;
   assert.equal(t.direction,expected);
  }
 }
});
