import { evaluateTransitKernel } from './kernel.js';
import { analyzeUsefulElementAuthorityV2,USEFUL_ELEMENT_AUTHORITY_V2_VERSION } from '../useful-element-authority-v2/index.js';
import { analyzeUsefulElementAuthorityV3,USEFUL_ELEMENT_AUTHORITY_V3_VERSION } from '../useful-element-authority-v3/index.js';
import { analyzePatternUsefulElementV3,PATTERN_V3_VERSION } from '../pattern-useful-element-v3/index.js';
import { composeFiveMethodAuthority } from '../useful-element-authority-v4/index.js';
import { observeConditionalArrivals } from './conditional-arrivals.js';
import { observeSourceArrivals } from './source-arrivals.js';
import { collectPatternRoles,observePatternTransit } from './pattern-arrivals.js';

// Fixed versions only. Annual calendar and anchor evidence are computed
// once, then projected into the policy-specific annual observation.
export function evaluateTransitPolicy(input,version){
 const expanded=version!=='useful-element-transit-v2';
 const patternReview=version==='useful-element-transit-v4';
 const result=evaluateTransitKernel(input,{
  version,authorityPolicy:expanded?USEFUL_ELEMENT_AUTHORITY_V3_VERSION:USEFUL_ELEMENT_AUTHORITY_V2_VERSION,
  authorityAnalyzer:expanded?analyzeUsefulElementAuthorityV3:analyzeUsefulElementAuthorityV2,
  prepareProjection(prior,original){
   const pattern=patternReview?analyzePatternUsefulElementV3({...original,policy:PATTERN_V3_VERSION}):null;
   const authority=patternReview?composeFiveMethodAuthority(prior,pattern):prior;
   const patternRoles=patternReview?collectPatternRoles(pattern):null;
   return {authority,extra:patternReview?{patternRoles}:undefined,
    year:y=>({...y,
     conditionalSourceArrivals:observeConditionalArrivals(prior.conditionalSourceAlternatives,y.transit.layers),
     ...(expanded?{sourceReviewArrivals:observeSourceArrivals(prior.sourceReview,y.transit)}:{}),
     ...(patternReview?{patternArrivals:observePatternTransit(patternRoles,y.transit)}:{})
    })};
  }
 });
 return patternReview&&result.status!=='diagnostic'?{...result,patternRoles:[]}:result;
}
