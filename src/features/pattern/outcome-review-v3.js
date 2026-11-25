import {SajuError} from '../../core/error.js';
import {buildOutcomeV2,PATTERN_OUTCOME_V2_VERSION} from './outcome-review-v2.js';
import {reviewSecondaryOutcome} from './outcome-secondary.js';
export const PATTERN_OUTCOME_V3_VERSION='pattern-outcome-evidence-v3';
export function analyzePatternOutcomeV3(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_V3_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const {prior,result}=buildOutcomeV2({...input,policy:PATTERN_OUTCOME_V2_VERSION});
 return {...result,version:PATTERN_OUTCOME_V3_VERSION,scope:'ordinary-pattern-structural-subclauses-with-secondary-role-review',
  reviews:result.access?result.reviews.map(q=>reviewSecondaryOutcome(prior,result.access,q)):result.reviews};
}
