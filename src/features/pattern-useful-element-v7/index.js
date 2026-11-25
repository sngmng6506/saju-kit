import { SajuError } from '../../core/error.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { analyzeInteractionContext } from '../../core/interaction-context.js';
import { analyzePatternUsefulElementV6,PATTERN_V6_VERSION } from '../pattern-useful-element-v6/index.js';
import { observePatternComposition,refineCompositionPreference } from './composition.js';
export const PATTERN_V7_VERSION='pattern-useful-element-v7';
export function analyzePatternUsefulElementV7(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_V7_VERSION)throw new SajuError('pattern-policy','격국 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternUsefulElementV6({...input,policy:PATTERN_V6_VERSION});
 const composition=prior.status==='unavailable'?observePatternComposition(null,null,null):
  observePatternComposition(prior.selection,analyzeElementStructure({saju:input.saju}),analyzeInteractionContext({saju:input.saju}));
 return {...prior,version:PATTERN_V7_VERSION,composition,preference:refineCompositionPreference(prior.preference,composition,prior.selection)};
}
