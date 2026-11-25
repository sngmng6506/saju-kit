import { SajuError } from '../../core/error.js';
import { analyzePatternUsefulElementV4,PATTERN_V4_VERSION } from '../pattern-useful-element-v4/index.js';
import { resolvePatternPreference } from './preference.js';
export const PATTERN_V5_VERSION='pattern-useful-element-v5';
export function analyzePatternUsefulElementV5(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_V5_VERSION)throw new SajuError('pattern-policy','격국 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternUsefulElementV4({...input,policy:PATTERN_V4_VERSION});
 return {...prior,version:PATTERN_V5_VERSION,
  preference:resolvePatternPreference(prior.selection,input.saju.pillars.month.branch,prior.completeHour)};
}
