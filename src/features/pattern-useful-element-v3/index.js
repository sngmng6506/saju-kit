import { SajuError } from '../../core/error.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { analyzeInteractionContext } from '../../core/interaction-context.js';
import { analyzePatternUsefulElementV2,PATTERN_V2_VERSION } from '../pattern-useful-element-v2/index.js';
import { observeRouteQuality } from './quality.js';
export const PATTERN_V3_VERSION='pattern-useful-element-v3';
export function analyzePatternUsefulElementV3(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_V3_VERSION)throw new SajuError('pattern-policy','격국 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternUsefulElementV2({...input,policy:PATTERN_V2_VERSION});
 const base={...prior,version:PATTERN_V3_VERSION};
 if(prior.status==='unavailable')return {...base,qualityReview:null};
 const structure=analyzeElementStructure({saju:input.saju}),interaction=analyzeInteractionContext({saju:input.saju});
 return {...base,qualityReview:observeRouteQuality(prior,structure,interaction)};
}
