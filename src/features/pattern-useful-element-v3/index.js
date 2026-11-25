import { analyzePatternPolicy } from '../pattern/pipeline.js';
export const PATTERN_V3_VERSION='pattern-useful-element-v3';
export function analyzePatternUsefulElementV3(input){
 return analyzePatternPolicy(input,3);
}
