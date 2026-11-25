import { analyzePatternPolicy } from '../pattern/pipeline.js';
export const PATTERN_USEFUL_ELEMENT_VERSION='pattern-useful-element-v1';
export function analyzePatternUsefulElement(input){
 return analyzePatternPolicy(input,1);
}
