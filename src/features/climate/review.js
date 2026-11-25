import { evaluateClimateKernel } from './kernel.js';
import { climateSourceRowV3,CLIMATE_V3_COVERAGE } from './source-v3.js';
export const CLIMATE_V3_VERSION='climate-useful-element-v3';
export function analyzeClimateUsefulElementV3(input){
 return evaluateClimateTemporal(input);
}
export function evaluateClimateTemporal(input,provider){
 return evaluateClimateKernel(input,{version:CLIMATE_V3_VERSION,lookup:climateSourceRowV3,coverage:CLIMATE_V3_COVERAGE},undefined,provider);
}
// Keep the historical research helper's option contract (no legacy switch).
export function evaluateClimateReview(input,{version,lookup,coverage,observeConditions}){
 return evaluateClimateKernel(input,{version,lookup,coverage,observeConditions});
}
