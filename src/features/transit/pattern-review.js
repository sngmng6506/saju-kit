import { evaluateTransitPolicy } from './pipeline.js';
export const USEFUL_ELEMENT_TRANSIT_V4_VERSION='useful-element-transit-v4';
export function analyzeUsefulElementTransitV4(input){
 return evaluateTransitPolicy(input,USEFUL_ELEMENT_TRANSIT_V4_VERSION);
}
