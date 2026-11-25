import {SajuError} from '../../core/error.js';
import {analyzePatternOutcomeEfficacy,PATTERN_OUTCOME_EFFICACY_VERSION} from './outcome-efficacy-review.js';
import {observeOutcomeDecision} from './outcome-decision-gate.js';
export const PATTERN_OUTCOME_V10_VERSION='pattern-outcome-decision-v10';
export function analyzePatternOutcomeV10(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_V10_VERSION)throw new SajuError('pattern-policy','성패구응 판단 정책을 명시해야 합니다.');
 // Explicitly forward only the analysis contract; no caller-supplied approval.
 const result=analyzePatternOutcomeEfficacy({saju:input.saju,birthBasis:input.birthBasis,policy:PATTERN_OUTCOME_EFFICACY_VERSION});
 return {...result,version:PATTERN_OUTCOME_V10_VERSION,scope:'ordinary-pattern-decision-abstention-only',decisionReview:observeOutcomeDecision(result)};
}
