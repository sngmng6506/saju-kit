import {SajuError} from '../../core/error.js';
import {analyzePatternOutcomeV8,PATTERN_OUTCOME_V8_VERSION} from './outcome-review-v8.js';
import {observeSourcePurity} from './outcome-purity-source.js';
import {observeCandidateClarity} from './outcome-clarity.js';
export const PATTERN_OUTCOME_V9_VERSION='pattern-outcome-evidence-v9';
export function analyzePatternOutcomeV9(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_V9_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternOutcomeV8({...input,policy:PATTERN_OUTCOME_V8_VERSION});
 const base={...prior,version:PATTERN_OUTCOME_V9_VERSION,scope:'ordinary-pattern-structural-subclauses-with-purity-and-clarity'};
 if(!prior.access)return {...base,purityReview:null,clarityReview:null};
 const compound=new Map(prior.compoundReview.map(q=>[q.candidateId,q])),assistant=new Map(prior.assistantReview.map(q=>[q.candidateId,q]));
 return {...base,purityReview:observeSourcePurity(input.saju,prior.reviews,prior.completeHour),
  clarityReview:prior.reviews.map(q=>observeCandidateClarity(q,compound.get(q.candidateId),assistant.get(q.candidateId),prior.positionContext.visibleOrder,prior.completeHour))};
}
