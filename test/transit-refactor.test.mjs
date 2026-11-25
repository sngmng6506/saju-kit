import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/index.js';
import * as historical from '../src/features/useful-element-transit-v2/index.js';
import {observeConditionalArrivals} from '../src/features/transit/conditional-arrivals.js';

test('transit annual projections preserve independent policy contracts and original anchor evidence',()=>{
 const birth={y:1980,m:2,d:9,hh:12,mm:0},saju=api.getSaju(birth);
 for(const daeunPolicy of ['legacy-day-v1','movement-minute-v6']){
  const args={saju,birth,birthBasis:'verified-chart',gender:'남',daeunPolicy,fromYear:1980,toYear:1999};
  const results=[api.analyzeUsefulElementTransit,api.analyzeUsefulElementTransitV2,api.analyzeUsefulElementTransitV3,api.analyzeUsefulElementTransitV4].map((fn,i)=>fn({...args,policy:'useful-element-transit-v'+(i+1)}));
  for(const result of results){
   assert.equal(result.status,'diagnostic');
   assert.equal(result.years.length,20);
   assert.equal(result.confirmed,false);
   assert.deepEqual(result.daeun,results[0].daeun);
  }
  for(let i=0;i<20;i++){
   const [a,b,c,d]=results.map(r=>r.years[i]);
   for(const row of [b,c,d]){assert.deepEqual(row.seun,a.seun);assert.deepEqual(row.daeun,a.daeun);assert.deepEqual(row.transit,a.transit);}
   const {patternArrivals,...prior}=d;
   assert.deepEqual(prior,c);
   assert.equal(Array.isArray(patternArrivals),true);
  }
  assert.deepEqual(results[3].authority.authority,results[2].authority.authority);
 }
 assert.deepEqual(Object.keys(historical).sort(),['USEFUL_ELEMENT_TRANSIT_V2_VERSION','analyzeUsefulElementTransitV2','observeConditionalArrivals'].sort());
 assert.equal(historical.observeConditionalArrivals,observeConditionalArrivals);
});
test('shared annual timeline kernel preserves legacy and v6 policy-specific presentation',()=>{
 const birth={y:1997,m:6,d:28,hh:8,mm:0},saju=api.getSaju(birth);
 for(const policy of [api,api.movementV6]){
  const daeun=policy.getDaeun({saju,birth,gender:'남'}),timeline=policy.getYearTimeline({saju,daeun,endAge:20});
  assert.equal(timeline.metadata.movementIndex,policy.MOVEMENT_INDEX_VERSION);
  for(const row of timeline.years){
   const annual=policy.getYearSignals({saju,daeun,year:row.year});
   assert.deepEqual(row.signals,annual.signals);
   assert.deepEqual(row.display,policy.summarizeMovementSignals(annual.signals));
  }
 }
});
