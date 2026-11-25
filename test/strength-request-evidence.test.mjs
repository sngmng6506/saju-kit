import test from 'node:test';
import assert from 'node:assert/strict';
import {getSaju,analyzeQuantitativeStrength,analyzeRootDynamics,analyzeSupportNetwork} from '../src/index.js';
import {createStrengthEvidenceProvider} from '../src/features/strength/request-evidence.js';
import {contributionMasses} from '../src/features/strength/scenario-mass.js';

test('request-local evidence reuses only the same chart and policy basis',()=>{
 const saju=getSaju({y:2000,m:2,d:9,hh:12,mm:0});
 const standard=createStrengthEvidenceProvider(),neutral=createStrengthEvidenceProvider({seasonMode:'neutral'});
 const q=standard.quantitative(saju,'verified-chart');
 assert.equal(q,standard.quantitative(saju,'verified-chart'));
 assert.notEqual(q,createStrengthEvidenceProvider().quantitative(saju,'verified-chart'));
 assert.deepEqual(q,analyzeQuantitativeStrength({saju,birthBasis:'verified-chart',policy:'strength-quantitative-v3'}));
 assert.notEqual(q,standard.quantitative(saju,'provisional-chart'));
 assert.equal(standard.quantitative(saju,'provisional-chart').quantitative,null);
 const n=neutral.quantitative(saju,'verified-chart');
 assert.ok(n.quantitative.scenarios.every(s=>s.contributions.every(c=>c.seasonFactor===100)));
 assert.ok(q.quantitative.scenarios.some(s=>s.contributions.some(c=>c.seasonFactor!==100)));
 assert.deepEqual(standard.dynamics(saju),analyzeRootDynamics({saju}));
 assert.deepEqual(standard.network(saju),analyzeSupportNetwork({saju}));
 assert.equal(standard.network(saju),standard.network(saju));
 const partial={pillars:{...saju.pillars,hour:null}};
 assert.equal(standard.quantitative(partial,'verified-chart').completeHour,false);
 assert.equal(standard.quantitative(saju,'verified-chart').completeHour,true);
});
test('scenario mass projection conserves integer contributions',()=>{
 const saju=getSaju({y:2000,m:2,d:9,hh:12,mm:0});
 const q=createStrengthEvidenceProvider().quantitative(saju,'verified-chart').quantitative;
 for(const s of q.scenarios){
  const masses=contributionMasses(s);
  assert.equal([...masses.values()].reduce((a,b)=>a+b,0),s.totalUnits);
  assert.ok(!masses.has('day:stem'));
 }
});
