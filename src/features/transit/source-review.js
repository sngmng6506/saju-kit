import { evaluateTransitPolicy } from './pipeline.js';
export const USEFUL_ELEMENT_TRANSIT_V3_VERSION='useful-element-transit-v3';
export function analyzeUsefulElementTransitV3(input){
 return evaluateTransitPolicy(input,USEFUL_ELEMENT_TRANSIT_V3_VERSION);
}
