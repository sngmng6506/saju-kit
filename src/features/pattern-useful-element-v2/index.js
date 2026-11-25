import { analyzePatternPolicy } from '../pattern/pipeline.js';
export const PATTERN_V2_VERSION='pattern-useful-element-v2';
export function analyzePatternUsefulElementV2(input){
 return analyzePatternPolicy(input,2);
}
