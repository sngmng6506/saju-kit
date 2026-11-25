import { analyzePatternPolicy } from '../pattern/pipeline.js';
export const PATTERN_V4_VERSION='pattern-useful-element-v4';
export function analyzePatternUsefulElementV4(input){
 return analyzePatternPolicy(input,4);
}
