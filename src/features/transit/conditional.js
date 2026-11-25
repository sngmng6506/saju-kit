import { evaluateTransitPolicy } from './pipeline.js';
export { observeConditionalArrivals } from './conditional-arrivals.js';
export const USEFUL_ELEMENT_TRANSIT_V2_VERSION='useful-element-transit-v2';
export function analyzeUsefulElementTransitV2(input){
 return evaluateTransitPolicy(input,USEFUL_ELEMENT_TRANSIT_V2_VERSION);
}
