import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeMultiaxisStrengthV3,analyzeMultiaxisStrengthV2} from '../src/index.js';
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(y,m,d,h=null)=>({pillars:{year:p(y),month:p(m),day:p(d),hour:h===null?null:p(h)}});
const run=saju=>analyzeMultiaxisStrengthV3({saju,policy:'strength-multiaxis-v3',birthBasis:'verified-chart'});
test('existing conflicts remain and output pressure is retained',()=>{
 const r=run(chart('병신','병신','무술','경신'));
 assert.equal(r.direction,null);
 assert.ok(r.decision.conflicts.includes('concentrated-pressure-versus-support'));
 for(const row of r.decision.evidence.rows){
  assert.equal(row.support,row.peerStem+row.conditionalResource);
  assert.ok(row.burden.output<=row.nominalOutput);
 }
});
test('scenario matching preserves full wealth and officer pressure',()=>{
 const saju=chart('경신','임자','갑인','병오'),r=run(saju);
 const base=analyzeMultiaxisStrengthV2({saju,policy:'strength-multiaxis-v2',birthBasis:'verified-chart'});
 assert.deepEqual(r.axes,base.axes);
 for(const row of r.decision.evidence.rows){
  const e=base.detail.environment.scenarios.find(s=>JSON.stringify(s.profile)===JSON.stringify(row.profile));
  assert.equal(row.burden.wealth,e.mass.wealth);
  assert.equal(row.burden.officer,e.mass.officer);
 }
});
test('partial and provisional return no integrated decision',()=>{
 const saju=chart('경신','임자','갑인');
 assert.equal(run(saju).decision,null);
 assert.equal(analyzeMultiaxisStrengthV3({saju,policy:'strength-multiaxis-v3',birthBasis:'provisional-chart'}).decision,null);
 assert.throws(()=>analyzeMultiaxisStrengthV3({saju}),{code:'strength-policy'});
});
