import test from 'node:test';
import assert from 'node:assert/strict';
import {getSaju,analyzeBalanceUsefulElement,analyzeBalancePriority,analyzeBalanceRouteReview,analyzeMediationUsefulElement,analyzeRemedyEvidence,analyzeUsefulElementReview} from '../src/index.js';
import {createMethodEvidence} from '../src/features/method-evidence.js';
import * as oldBalance from '../src/features/balance-useful-element-v1/index.js';
import * as oldMediation from '../src/features/mediation-useful-element-v1/index.js';
import * as oldRemedy from '../src/features/remedy-evidence-v1/index.js';

test('method review reuses observations without changing independent doctrine outputs',()=>{
 const full=getSaju({y:2000,m:2,d:9,hh:12,mm:0});
 for(const saju of [full,{pillars:{...full.pillars,hour:null}}])for(const birthBasis of ['verified-chart','provisional-chart']){
  const args={saju,birthBasis};
  const review=analyzeUsefulElementReview({...args,policy:'useful-element-review-v1'});
  for(const [key,fn,policy] of [
   ['balance',analyzeBalanceUsefulElement,'balance-useful-element-v1'],
   ['mediation',analyzeMediationUsefulElement,'mediation-useful-element-v1'],
   ['remedy',analyzeRemedyEvidence,'remedy-evidence-v1']
  ])assert.deepEqual(review.methods[key],fn({...args,policy}));
  assert.deepEqual(analyzeBalancePriority({...args,policy:'balance-priority-v1'}).balance,review.methods.balance);
  assert.deepEqual(analyzeBalanceRouteReview({...args,policy:'balance-route-review-v1'}).balance,review.methods.balance);
  assert.equal(review.usefulElement,null);
  assert.equal(review.confirmed,false);
 }
});
test('method evidence is isolated by request and season, with unchanged compatibility exports',()=>{
 const saju=getSaju({y:2000,m:2,d:9,hh:12,mm:0});
 const a=createMethodEvidence(),b=createMethodEvidence();
 assert.equal(a.structure(saju),a.structure(saju));
 assert.notEqual(a.structure(saju),b.structure(saju));
 assert.notEqual(a.standard.quantitative(saju,'verified-chart'),a.neutral.quantitative(saju,'verified-chart'));
 assert.equal(a.standard.dynamics(saju),a.standard.dynamics(saju));
 assert.deepEqual(Object.keys(oldBalance).sort(),['BALANCE_USEFUL_ELEMENT_VERSION','analyzeBalanceUsefulElement'].sort());
 assert.deepEqual(Object.keys(oldMediation).sort(),['MEDIATION_USEFUL_ELEMENT_VERSION','analyzeMediationUsefulElement'].sort());
 assert.deepEqual(Object.keys(oldRemedy).sort(),['REMEDY_EVIDENCE_VERSION','analyzeRemedyEvidence','observeRemedyEvidence'].sort());
});
