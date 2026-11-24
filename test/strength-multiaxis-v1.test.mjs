import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeMultiaxisStrength,analyzeQuantitativeStrength,getSaju} from '../src/index.js';
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(year,month,day,hour=null)=>({pillars:{year:p(year),month:p(month),day:p(day),hour:hour===null?null:p(hour)}});
const opts={policy:'strength-multiaxis-v1',birthBasis:'verified-chart'};
const run=saju=>analyzeMultiaxisStrength({saju,...opts});

test('literal root capacity is allocated once per branch and independent of support mass',()=>{
 const r=run(chart('기미','기사','갑인','병인'));
 assert.deepEqual(r.axes.rootCapacity,{min:64.75,max:70});
 assert.deepEqual(r.detail.root.centralPrincipal,['day']);
 assert.equal(r.direction,'strong');
 for(const profile of r.detail.root.profiles)assert.equal(profile.contributions.length,4);
});
test('central pressure and distant roots do not become strong merely from two roots',()=>{
 const r=run(chart('경술','무자','무자','병진'));
 assert.deepEqual(r.detail.environment.centralBurden,['month','day']);
 assert.equal(r.direction,null);
 assert.ok(r.axes.rootCapacity.max<40);
});
test('environment partitions original integer mass, excludes peer roots from external support',()=>{
 const saju=chart('무술','갑자','정미','경술'),r=run(saju);
 const q=analyzeQuantitativeStrength({saju,policy:'strength-quantitative-v3',birthBasis:'verified-chart'}).quantitative;
 for(const [i,row] of r.detail.environment.scenarios.entries()){
  const source=q.scenarios[i];
  assert.equal(Object.values(row.mass).reduce((a,b)=>a+b,0),source.totalUnits);
  assert.equal(row.mass.peerRoot+row.mass.peerStem,source.mass.peer);
  assert.equal(row.support,row.mass.peerStem+row.mass.resource);
  assert.equal(row.maxPressure,Math.max(row.mass.output,row.mass.wealth,row.mass.officer));
 }
 assert.ok(r.detail.interactions.length>0);
 assert.ok(r.detail.interactions.every(x=>!x.confirmed));
 assert.equal(new Set(r.detail.interactions.map(x=>x.threat)).size,r.detail.interactions.length);
});
test('rootless adverse chart yields weak hypothesis without special-pattern inference',()=>{
 const r=run(chart('경신','경신','갑신','경신'));
 assert.deepEqual(r.axes.rootCapacity,{min:0,max:0});
 assert.equal(r.direction,'weak');assert.equal(r.specialPatternAssessment,'not-assessed');
});
test('partial range covers all fixed-day completions, no chosen direction',()=>{
 const birth={y:1997,m:6,d:28,timezone:'Asia/Tokyo'};
 const partial=run(getSaju(birth));
 assert.equal(partial.direction,null);assert.equal(partial.detail,null);assert.equal(partial.completionCount,12);
 const full=Array.from({length:12},(_,i)=>run(getSaju({...birth,hh:i*2,mm:0})));
 for(const k of ['rootCapacity','externalSupport'])assert.deepEqual(partial.axes[k],{
  min:Math.min(...full.map(r=>r.axes[k].min)),max:Math.max(...full.map(r=>r.axes[k].max))});
 for(const k of ['output','wealth','officer'])assert.deepEqual(partial.axes.pressure[k],{
  min:Math.min(...full.map(r=>r.axes.pressure[k].min)),max:Math.max(...full.map(r=>r.axes.pressure[k].max))});
});
test('input, provisional and deterministic privacy contract',()=>{
 const saju=chart('갑인','을묘','갑진','임자');saju.privateMarker='private';
 const before=JSON.stringify(saju),a=run(saju);
 assert.deepEqual(run(saju),a);assert.equal(JSON.stringify(saju),before);
 assert.ok(!JSON.stringify(a).includes('privateMarker'));assert.equal('category' in a,false);
 assert.throws(()=>analyzeMultiaxisStrength({saju}),{code:'strength-policy'});
 assert.throws(()=>analyzeMultiaxisStrength({...opts,saju,birthBasis:'bad'}),{code:'strength-birth-basis'});
 assert.throws(()=>run(chart('갑축','을묘','갑진')));
 const r=analyzeMultiaxisStrength({...opts,saju,birthBasis:'provisional-chart'});
 assert.equal(r.status,'provisional');assert.equal(r.axes,null);assert.equal(r.direction,null);
});
