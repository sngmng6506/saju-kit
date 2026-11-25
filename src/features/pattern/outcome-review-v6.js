import {SajuError} from '../../core/error.js';
import {buildOutcomeV5,PATTERN_OUTCOME_V5_VERSION} from './outcome-review-v5.js';
import {observePositionContext} from './outcome-position.js';
import {needsWinterClimate,projectWinterClimate,reviewWinterOfficer} from './outcome-winter-exception.js';
export const PATTERN_OUTCOME_V6_VERSION='pattern-outcome-evidence-v6';
export function analyzePatternOutcomeV6(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_V6_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const {prior,result}=buildOutcomeV5({...input,policy:PATTERN_OUTCOME_V5_VERSION});
 const base={...result,version:PATTERN_OUTCOME_V6_VERSION,scope:'ordinary-pattern-structural-subclauses-with-position-and-winter-exception'};
 if(!result.access)return {...base,positionContext:null,winterClimate:null};
 const month=input.saju.pillars.month.branch;
 const winterClimate=needsWinterClimate(prior,month)?projectWinterClimate(input):null;
 const reviews=result.reviews.map(q=>reviewWinterOfficer(prior,q,month,winterClimate));
 return {...base,reviews,winterClimate,positionContext:observePositionContext(prior,reviews)};
}
