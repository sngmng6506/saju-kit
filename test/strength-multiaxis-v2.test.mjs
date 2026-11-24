import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeMultiaxisStrengthV2,analyzeMultiaxisStrength} from '../src/index.js';
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(y,m,d,h=null)=>({pillars:{year:p(y),month:p(m),day:p(d),hour:h===null?null:p(h)}});
const run=saju=>analyzeMultiaxisStrengthV2({saju,policy:'strength-multiaxis-v2',birthBasis:'verified-chart'});
test('W24 concentrated output conflicts with root-first hypothesis',()=>{
 const r=run(chart('병신','병신','무술','경신'));
 assert.equal(r.baselineDirection,'strong');assert.equal(r.direction,null);
 assert.ok(r.decision.evidence.concentratedBurdenCategories.includes('output'));
});
test('W01 resource support adds a strong hypothesis without changing axes',()=>{
 const saju=chart('갑인','정묘','갑자','갑자'),r=run(saju);
 assert.equal(r.baselineDirection,null);assert.equal(r.direction,'strong');
 assert.deepEqual(r.axes,analyzeMultiaxisStrength({saju,policy:'strength-multiaxis-v1',birthBasis:'verified-chart'}).axes);
});
test('challenged resources do not qualify as unchallenged support',()=>{
 const r=run(chart('계묘','을묘','무자','정사'));
 assert.equal(r.decision.evidence.unchallengedResources.length,0);
 assert.ok(!r.decision.grounds.includes('local-resource-and-robust-support'));
});
test('partial and provisional remain without direction',()=>{
 const saju=chart('갑인','정묘','갑자');
 assert.equal(run(saju).direction,null);assert.equal(run(saju).decision,null);
 assert.equal(analyzeMultiaxisStrengthV2({saju,policy:'strength-multiaxis-v2',birthBasis:'provisional-chart'}).decision,null);
 assert.throws(()=>analyzeMultiaxisStrengthV2({saju}),{code:'strength-policy'});
});
