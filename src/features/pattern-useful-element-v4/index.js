import { SajuError } from '../../core/error.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { analyzeInteractionContext } from '../../core/interaction-context.js';
import { analyzePatternUsefulElementV3,PATTERN_V3_VERSION } from '../pattern-useful-element-v3/index.js';
import { observePatternOutcomes } from '../pattern-useful-element-v1/outcomes.js';
import { observePatternRoutes } from '../pattern-useful-element-v2/routes.js';
import { observeRouteQuality } from '../pattern-useful-element-v3/quality.js';
import { observeStorageProjection,observeRolePaths } from './extension.js';
export const PATTERN_V4_VERSION='pattern-useful-element-v4';
export function analyzePatternUsefulElementV4(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_V4_VERSION)throw new SajuError('pattern-policy','격국 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternUsefulElementV3({...input,policy:PATTERN_V3_VERSION}),base={...prior,version:PATTERN_V4_VERSION};
 if(prior.status==='unavailable')return {...base,storageReview:null,roleReview:[]};
 const structure=analyzeElementStructure({saju:input.saju}),interaction=analyzeInteractionContext({saju:input.saju});
 const storageReview=observeStorageProjection(structure);
 const selection={...prior.selection,candidates:[...prior.selection.candidates,...storageReview.candidates]};
 const outcomes=observePatternOutcomes(selection,structure,interaction),routeReview=observePatternRoutes(selection,structure,interaction);
 const qualityReview=observeRouteQuality({...prior,selection,routeReview},structure,interaction);
 return {...base,selection,outcomes,routeReview,qualityReview,storageReview,
  roleReview:observeRolePaths(selection,routeReview.occurrences,interaction,structure.completeHour)};
}
