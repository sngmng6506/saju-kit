import { evaluateClimateReview } from './review.js';
import { climateSourceRowV4,CLIMATE_V4_COVERAGE } from './source-v4.js';
import { observeSourceConditions } from './conditions.js';
export const CLIMATE_V4_VERSION='climate-useful-element-v4';
export function analyzeClimateUsefulElementV4(input){
 return evaluateClimateReview(input,{version:CLIMATE_V4_VERSION,lookup:climateSourceRowV4,coverage:CLIMATE_V4_COVERAGE,observeConditions:observeSourceConditions});
}
