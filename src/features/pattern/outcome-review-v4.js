import {SajuError} from '../../core/error.js';
import {evaluateStrengthDecision,STRENGTH_DECISION_VERSION} from '../strength/decision.js';
import {buildOutcomeV3,PATTERN_OUTCOME_V3_VERSION} from './outcome-review-v3.js';
import {projectRegulationStrength} from './outcome-regulation-strength.js';
import {reviewRegulation} from './outcome-regulation.js';
export const PATTERN_OUTCOME_V4_VERSION='pattern-outcome-evidence-v4';
export function analyzePatternOutcomeV4(input){
 return buildOutcomeV4(input).result;
}
// Request-local extension contract, not a public root export.
export function buildOutcomeV4(input,provider){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_V4_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const {prior,result,formation}=buildOutcomeV3({...input,policy:PATTERN_OUTCOME_V3_VERSION},provider);
 const base={...result,version:PATTERN_OUTCOME_V4_VERSION,scope:'ordinary-pattern-structural-subclauses-with-conditional-regulation'};
 if(!result.access)return {prior,formation,result:{...base,regulationStrength:null}};
 // No caller-supplied strength override, and no recursive pattern dependency.
 const strength=projectRegulationStrength(prior.completeHour?evaluateStrengthDecision({saju:input.saju,birthBasis:input.birthBasis,policy:STRENGTH_DECISION_VERSION},provider):null,prior.completeHour);
 return {prior,formation,result:{...base,regulationStrength:strength,reviews:result.reviews.map(q=>reviewRegulation(prior,q,strength))}};
}
