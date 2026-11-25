import {SajuError} from '../../core/error.js';
import {analyzePatternOutcomeV7,PATTERN_OUTCOME_V7_VERSION} from './outcome-review-v7.js';
import {observeAssistantNecessity} from './outcome-assistant.js';
export const PATTERN_OUTCOME_V8_VERSION='pattern-outcome-evidence-v8';
export function analyzePatternOutcomeV8(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_V8_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternOutcomeV7({...input,policy:PATTERN_OUTCOME_V7_VERSION});
 const compound=new Map((prior.compoundReview??[]).map(q=>[q.candidateId,q]));
 return {...prior,version:PATTERN_OUTCOME_V8_VERSION,scope:'ordinary-pattern-structural-subclauses-with-assistant-necessity',
  assistantReview:prior.access?prior.reviews.map(q=>observeAssistantNecessity(q,compound.get(q.candidateId),prior.completeHour)):null};
}
