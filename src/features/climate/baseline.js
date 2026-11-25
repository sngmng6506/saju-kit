import { evaluateClimateKernel } from './kernel.js';
import { climateSourceRow,CLIMATE_SOURCE_COVERAGE } from './source-v1.js';
export { climateEvidence } from './evidence.js';
export const CLIMATE_USEFUL_ELEMENT_VERSION='climate-useful-element-v1';
export function analyzeClimateUsefulElement(input){
 return evaluateClimateKernel(input,{version:CLIMATE_USEFUL_ELEMENT_VERSION,lookup:climateSourceRow,coverage:CLIMATE_SOURCE_COVERAGE,legacy:true});
}
