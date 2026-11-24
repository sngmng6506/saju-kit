import { evaluateUsefulElementTransit } from '../useful-element-transit-v1/index.js';
import { analyzeUsefulElementAuthorityV3,USEFUL_ELEMENT_AUTHORITY_V3_VERSION } from '../useful-element-authority-v3/index.js';
import { observeConditionalArrivals } from '../useful-element-transit-v2/index.js';
import { observeSourceArrivals } from './source-arrivals.js';
export const USEFUL_ELEMENT_TRANSIT_V3_VERSION='useful-element-transit-v3';
export function analyzeUsefulElementTransitV3(input){
 const result=evaluateUsefulElementTransit(input,{version:USEFUL_ELEMENT_TRANSIT_V3_VERSION,
  authorityPolicy:USEFUL_ELEMENT_AUTHORITY_V3_VERSION,authorityAnalyzer:analyzeUsefulElementAuthorityV3});
 if(result.status!=='diagnostic')return result;
 return {...result,years:result.years.map(y=>({...y,
  conditionalSourceArrivals:observeConditionalArrivals(result.authority.conditionalSourceAlternatives,y.transit.layers),
  sourceReviewArrivals:observeSourceArrivals(result.authority.sourceReview,y.transit)
 }))};
}
