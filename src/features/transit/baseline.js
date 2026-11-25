import { evaluateTransitKernel } from './kernel.js';
import { analyzeUsefulElementAuthority } from '../useful-element-authority-v1/index.js';
export const USEFUL_ELEMENT_TRANSIT_VERSION='useful-element-transit-v1';
export function analyzeUsefulElementTransit(input){
 return evaluateUsefulElementTransit(input);
}
// Historical internal fixed-policy adapter; extra options are not forwarded.
export function evaluateUsefulElementTransit(input,{version=USEFUL_ELEMENT_TRANSIT_VERSION,authorityPolicy='useful-element-authority-v1',authorityAnalyzer=analyzeUsefulElementAuthority}={}){
 return evaluateTransitKernel(input,{version,authorityPolicy,authorityAnalyzer});
}
