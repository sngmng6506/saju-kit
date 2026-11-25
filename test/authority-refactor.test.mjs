import test from 'node:test';
import assert from 'node:assert/strict';
import {getSaju,analyzeUsefulElementReview,analyzeUsefulElementAuthority,analyzeUsefulElementAuthorityV2,analyzeUsefulElementAuthorityV3,analyzeUsefulElementAuthorityV4,analyzeClimateUsefulElementV2,analyzeClimateUsefulElementV3,analyzeClimateUsefulElementV5,analyzePatternUsefulElementV3} from '../src/index.js';
import {createMethodEvidence} from '../src/features/method-evidence.js';
import * as legacy from '../src/features/useful-element-authority-v1/index.js';
import * as legacyClimate from '../src/features/climate-useful-element-v3/index.js';

test('authority pipeline preserves the historical anchor namespace and independent projections',()=>{
 const birth={y:2000,m:2,d:9,hh:12,mm:0},full=getSaju(birth);
 for(const saju of [full,{pillars:{...full.pillars,hour:null}}])for(const birthBasis of ['verified-chart','provisional-chart']){
  const args={saju,birth,birthBasis};
  const review=analyzeUsefulElementReview({...args,policy:'useful-element-review-v1'});
  const v1=analyzeUsefulElementAuthority({...args,policy:'useful-element-authority-v1'});
  const v2=analyzeUsefulElementAuthorityV2({...args,policy:'useful-element-authority-v2'});
  const v3=analyzeUsefulElementAuthorityV3({...args,policy:'useful-element-authority-v3'});
  const v4=analyzeUsefulElementAuthorityV4({...args,policy:'useful-element-authority-v4'});
  for(const key of ['balance','mediation','remedy'])for(const result of [v1,v2,v3,v4])assert.deepEqual(result.review.methods[key],review.methods[key]);
  assert.deepEqual(v1.review.methods.climate,analyzeClimateUsefulElementV2({...args,policy:'climate-useful-element-v2'}));
  assert.deepEqual(v2.review.methods.climate,analyzeClimateUsefulElementV3({...args,policy:'climate-useful-element-v3'}));
  assert.deepEqual(v3.sourceReview.climate,analyzeClimateUsefulElementV5({...args,policy:'climate-useful-element-v5'}));
  assert.deepEqual(v4.patternReview,analyzePatternUsefulElementV3({...args,policy:'pattern-useful-element-v3'}));
  for(const result of [v3,v4]){
   assert.deepEqual(result.authority,v2.authority);
   assert.deepEqual(result.review,v2.review);
   assert.equal(result.anchorBasis,'useful-element-authority-v2');
   assert.equal(result.sourceReview.selectionAuthority,false);
  }
  for(const result of [v1,v2,v3,v4]){assert.equal(result.usefulElement,null);assert.equal(result.confirmed,false);}
 }
});
test('request-local climate context is isolated and historical helpers remain explicit',()=>{
 const saju=getSaju({y:2000,m:2,d:9,hh:12,mm:0}),a=createMethodEvidence(),b=createMethodEvidence();
 assert.equal(a.context(saju),a.context(saju));
 assert.notEqual(a.context(saju),b.context(saju));
 assert.deepEqual(Object.keys(legacy).sort(),['USEFUL_ELEMENT_AUTHORITY_VERSION','analyzeUsefulElementAuthority','composeAuthorityReview'].sort());
 assert.deepEqual(Object.keys(legacyClimate).sort(),['CLIMATE_V3_VERSION','analyzeClimateUsefulElementV3','evaluateClimateReview'].sort());
 const input={saju,birthBasis:'verified-chart',policy:'useful-element-authority-v4'};
 assert.deepEqual(analyzeUsefulElementAuthorityV4({...input,provider:{context(){throw Error('untrusted');}}}),analyzeUsefulElementAuthorityV4(input));
});
