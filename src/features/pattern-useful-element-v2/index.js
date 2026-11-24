import { SajuError } from '../../core/error.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { analyzeInteractionContext } from '../../core/interaction-context.js';
import { analyzePatternUsefulElement,PATTERN_USEFUL_ELEMENT_VERSION } from '../pattern-useful-element-v1/index.js';
import { observePatternRoutes } from './routes.js';
export const PATTERN_V2_VERSION='pattern-useful-element-v2';
export function analyzePatternUsefulElementV2(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_V2_VERSION)throw new SajuError('pattern-policy','격국 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternUsefulElement({...input,policy:PATTERN_USEFUL_ELEMENT_VERSION});
 const base={...prior,version:PATTERN_V2_VERSION};
 if(prior.status==='unavailable')return {...base,routeReview:null};
 const structure=analyzeElementStructure({saju:input.saju}),interaction=analyzeInteractionContext({saju:input.saju});
 return {...base,routeReview:observePatternRoutes(prior.selection,structure,interaction)};
}
