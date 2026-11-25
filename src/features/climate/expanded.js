import { evaluateClimateKernel } from './kernel.js';
import { climateSourceRowV2,CLIMATE_V2_COVERAGE } from './source-v2.js';
export const CLIMATE_V2_VERSION='climate-useful-element-v2';
export function analyzeClimateUsefulElementV2(input){
 return evaluateClimateExpanded(input);
}
export function evaluateClimateExpanded(input,provider){
 return evaluateClimateKernel(input,{version:CLIMATE_V2_VERSION,lookup:climateSourceRowV2,coverage:CLIMATE_V2_COVERAGE,legacy:true},undefined,provider);
}
