import { SajuError } from '../../core/error.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { analyzeInteractionContext } from '../../core/interaction-context.js';
import { analyzePatternUsefulElementV5,PATTERN_V5_VERSION } from '../pattern-useful-element-v5/index.js';
import { refineOfficerPreference } from './officer.js';
export const PATTERN_V6_VERSION='pattern-useful-element-v6';
export function analyzePatternUsefulElementV6(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_V6_VERSION)throw new SajuError('pattern-policy','격국 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternUsefulElementV5({...input,policy:PATTERN_V5_VERSION});
 if(prior.status==='unavailable')return {...prior,version:PATTERN_V6_VERSION,preference:{...prior.preference,policy:'month-family-preference-v2',officerReview:null}};
 return {...prior,version:PATTERN_V6_VERSION,preference:refineOfficerPreference(prior.preference,prior.selection,analyzeElementStructure({saju:input.saju}),analyzeInteractionContext({saju:input.saju}))};
}
