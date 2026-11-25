import { SajuError } from '../../core/error.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { analyzeInteractionContext } from '../../core/interaction-context.js';
import { analyzePatternUsefulElementV7,PATTERN_V7_VERSION } from '../pattern-useful-element-v7/index.js';
import { observeMixedUse,refineMixedPreference } from './review.js';
export const PATTERN_V8_VERSION='pattern-useful-element-v8';
export function analyzePatternUsefulElementV8(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_V8_VERSION)throw new SajuError('pattern-policy','격국 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternUsefulElementV7({...input,policy:PATTERN_V7_VERSION});
 const mixedUse=prior.status==='unavailable'?observeMixedUse(null,null,null):observeMixedUse(prior.selection,analyzeElementStructure({saju:input.saju}),analyzeInteractionContext({saju:input.saju}));
 return {...prior,version:PATTERN_V8_VERSION,mixedUse,preference:refineMixedPreference(prior.preference,mixedUse,prior.selection)};
}
