import test from 'node:test';
import assert from 'node:assert/strict';
import {getSaju,analyzeClimateUsefulElementV4,analyzeClimateUsefulElementV5,analyzeClimateUsefulElement,analyzeClimateUsefulElementV2} from '../src/index.js';
import * as oldBaseline from '../src/features/climate-useful-element-v1/index.js';
import * as baseline from '../src/features/climate/baseline.js';
import * as oldReview from '../src/features/climate-useful-element-v3/index.js';
import * as review from '../src/features/climate/review.js';

test('historical climate module paths preserve their exported bindings',()=>{
 for(const [a,b] of [[oldBaseline,baseline],[oldReview,review]]){
  assert.deepEqual(Object.keys(a),Object.keys(b));
  for(const key of Object.keys(a))assert.equal(a[key],b[key]);
 }
});
test('climate kernel preserves legacy projections and v5 extends the v4 observation',()=>{
 for(const hour of [12,null]){
  const birth={y:2000,m:2,d:9,hh:12,mm:0},full=getSaju(birth),saju=hour===null?{...full,pillars:{...full.pillars,hour:null}}:full;
  for(const birthBasis of ['verified-chart','provisional-chart']){
   const args={saju,birthBasis};
   for(const [fn,policy] of [[analyzeClimateUsefulElement,'climate-useful-element-v1'],[analyzeClimateUsefulElementV2,'climate-useful-element-v2']]){
    const r=fn({...args,policy});
    assert.equal(Object.hasOwn(r,'temporal'),false);
    assert.equal(Object.hasOwn(r,'structuralConditions'),false);
   }
   const v4=analyzeClimateUsefulElementV4({...args,policy:'climate-useful-element-v4'});
   const v5=analyzeClimateUsefulElementV5({...args,policy:'climate-useful-element-v5'});
   const {version,requirementContext,textualMotifs,...rest}=v5;
   assert.deepEqual(rest,(({version,...r})=>r)(v4));
   assert.equal(v5.confirmed,false);
   if(birthBasis==='provisional-chart'){assert.equal(requirementContext,null);assert.equal(textualMotifs,null);}
  }
 }
});
