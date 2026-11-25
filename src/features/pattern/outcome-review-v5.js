import {SajuError} from '../../core/error.js';
import {buildOutcomeV4,PATTERN_OUTCOME_V4_VERSION} from './outcome-review-v4.js';
import {reviewStorageOutcome} from './outcome-storage.js';
import {reviewPeerOfficerClearing} from './outcome-officer-clearing.js';
export const PATTERN_OUTCOME_V5_VERSION='pattern-outcome-evidence-v5';
export function analyzePatternOutcomeV5(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_V5_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const {prior,result}=buildOutcomeV4({...input,policy:PATTERN_OUTCOME_V4_VERSION});
 return {...result,version:PATTERN_OUTCOME_V5_VERSION,scope:'ordinary-pattern-structural-subclauses-with-storage-and-peer-clearing',
  reviews:result.access?result.reviews.map(q=>reviewPeerOfficerClearing(prior,reviewStorageOutcome(prior,q))):result.reviews};
}
