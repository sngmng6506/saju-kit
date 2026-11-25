import { analyzePatternPolicy } from '../pattern/pipeline.js';
export const PATTERN_V5_VERSION='pattern-useful-element-v5';
export function analyzePatternUsefulElementV5(input){
 return analyzePatternPolicy(input,5);
}
