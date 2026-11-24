import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeMultiaxisStrengthV3,analyzeMultiaxisStrengthV4,analyzeQuantitativeStrength} from '../src/index.js';
import {assessSeasonRobustness} from '../src/features/strength-multiaxis-v4/index.js';
import {chartFromReference} from '../scripts/strength-reference.mjs';

const read=name=>JSON.parse(readFileSync(new URL('../docs/'+name+'.json',import.meta.url),'utf8'));
const rows=[...read('strength-audited-results').rows,...read('strength-zhang-holdout-results').rows];
const args=pillars=>({saju:chartFromReference(pillars),birthBasis:'verified-chart'});
const run=(input,version)=>version===3?analyzeMultiaxisStrengthV3({...input,policy:'strength-multiaxis-v3'}):analyzeMultiaxisStrengthV4({...input,policy:'strength-multiaxis-v4'});
test('v4 reproduces E4 on the historical corpus without changing v3',()=>{
 assert.equal(rows.length,86);
 const blocked=[];
 for(const row of rows){
  const input=args(row.pillars),v3=run(input,3),v4=run(input,4);
  assert.equal(v3.direction,row.results[0],row.id);
  assert.deepEqual(v4.baselineDecision,v3.decision,row.id);
  assert.deepEqual(v4.axes,v3.axes,row.id);
  if(['ZN01','ZN05'].includes(row.id)){
   assert.equal(v3.direction,'strong');assert.equal(v4.direction,null);
   assert.equal(v4.status,'unresolved');
   assert.equal(v4.seasonRobustness.passed,false);
   assert.ok(v4.decision.conflicts.includes('season-sensitive-resource-support'));
   blocked.push(row.id);
  }else assert.equal(v4.direction,v3.direction,row.id);
  if(v3.direction!=='strong'||v3.decision.grounds.includes('central-root-capacity'))assert.equal(v4.seasonRobustness.required,false);
 }
 assert.deepEqual(blocked.sort(),['ZN01','ZN05']);
});
test('neutral season diagnostic keeps matched scenario keys and all factors at 100',()=>{
 const input={...args(['乙丑','辛巳','己巳','庚午']),policy:'strength-quantitative-v3'};
 const standard=analyzeQuantitativeStrength(input).quantitative.scenarios;
 const neutral=analyzeQuantitativeStrength(input,{seasonMode:'neutral'}).quantitative.scenarios;
 const key=r=>[r.positionProfile,r.roleProfile,r.rootProfile,r.seasonProfile,r.seasonBasis];
 assert.deepEqual(neutral.map(key),standard.map(key));
 assert.ok(neutral.every(r=>r.contributions.every(c=>c.seasonFactor===100)));
 assert.ok(standard.some(r=>r.contributions.some(c=>c.seasonFactor!==100)));
 assert.throws(()=>analyzeQuantitativeStrength(input,{seasonMode:'bad'}),{code:'strength-season-mode'});
});
test('gate requires same resource ground, not only the same direction',()=>{
 const hypothesis=(direction,grounds)=>({direction,decision:{grounds,conflicts:[]}});
 const nominal=hypothesis('strong',['local-resource-and-robust-support']);
 assert.equal(assessSeasonRobustness(nominal,hypothesis('strong',['bounded-route-support'])).passed,false);
 assert.equal(assessSeasonRobustness(nominal,nominal).passed,true);
 assert.equal(assessSeasonRobustness(nominal,hypothesis(null,['local-resource-and-robust-support'])).passed,false);
 assert.equal(assessSeasonRobustness(hypothesis('strong',['central-root-capacity']),null).required,false);
});
test('provisional and partial charts cannot acquire a direction',()=>{
 const input=args(['乙丑','辛巳','己巳','庚午']);
 const provisional=run({...input,birthBasis:'provisional-chart'},4);
 const partial=run({...input,saju:{pillars:{...input.saju.pillars,hour:null}}},4);
 for(const r of [provisional,partial]){
  assert.equal(r.direction,null);assert.equal(r.decision,null);assert.equal(r.seasonRobustness.required,false);
 }
});
