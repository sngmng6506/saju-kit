import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeResourceAccess,analyzeQuantitativeStrength} from '../src/index.js';
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(y,m,d,h=null)=>({pillars:{year:p(y),month:p(m),day:p(d),hour:h===null?null:p(h)}});
const opts={policy:'resource-access-v1',birthBasis:'verified-chart'};
const run=saju=>analyzeResourceAccess({saju,...opts});
test('resource occurrence mass is partitioned without duplicated routes',()=>{
 const saju=chart('경신','임자','갑인','병오'),r=run(saju);
 const q=analyzeQuantitativeStrength({saju,policy:'strength-quantitative-v3',birthBasis:'verified-chart'}).quantitative;
 for(const [i,s] of r.analysis.rows.entries()){
  assert.equal(s.totalResource,q.scenarios[i].mass.resource);
  assert.equal(s.local,s.routes.reduce((a,x)=>a+x.resource,0));
  assert.equal(s.accessible+s.exposed,s.local);
  assert.ok(s.anchoredLocal<=s.local&&s.local<=s.totalResource);
  assert.equal(new Set(s.routes.map(x=>x.id)).size,s.routes.length);
 }
});
test('no resource produces zero, not an invented route',()=>{
 const r=run(chart('신유','신유','을유','을유'));
 assert.equal(r.analysis.resources.length,0);
 assert.deepEqual(r.analysis.ranges.local,{min:0,max:0});
});
test('wealth and officer exposure are distinct and do not modify mass',()=>{
 const r=run(chart('기미','임신','갑인','병인'));
 assert.ok(r.analysis.resources.some(x=>x.wealth.includes('year:stem')));
 assert.ok(r.analysis.resources.some(x=>x.officer.length));
 assert.equal(r.effectsConfirmed,false);
 for(const s of r.analysis.rows)for(const x of s.routes)assert.equal(x.wealthExceedsResource,x.wealth>x.resource);
});
test('partial and provisional do not invent access; deterministic input preserved',()=>{
 const saju=chart('경신','임자','갑인');
 assert.equal(run(saju).analysis,null);
 assert.equal(analyzeResourceAccess({saju,...opts,birthBasis:'provisional-chart'}).analysis,null);
 assert.throws(()=>analyzeResourceAccess({saju}),{code:'strength-policy'});
 const c=chart('경신','임자','갑인','병오');c.privateMarker='secret';
 const before=JSON.stringify(c),a=run(c);
 assert.deepEqual(run(c),a);assert.equal(JSON.stringify(c),before);
 assert.ok(!JSON.stringify(a).includes('privateMarker'));
});
