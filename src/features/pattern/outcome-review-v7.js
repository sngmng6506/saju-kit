import {SajuError} from '../../core/error.js';
import {analyzePatternOutcomeV6,PATTERN_OUTCOME_V6_VERSION} from './outcome-review-v6.js';
import {observeCompoundTopology} from './outcome-compound-topology.js';
import {observeCompoundMotifs} from './outcome-compound-motifs.js';
export const PATTERN_OUTCOME_V7_VERSION='pattern-outcome-evidence-v7';
export function analyzePatternOutcomeV7(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_V7_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternOutcomeV6({...input,policy:PATTERN_OUTCOME_V6_VERSION});
 return {...prior,version:PATTERN_OUTCOME_V7_VERSION,scope:'ordinary-pattern-structural-subclauses-with-compound-topology',
  compoundReview:prior.access?prior.reviews.map(q=>({...observeCompoundTopology(q,prior.completeHour),motifs:observeCompoundMotifs(q,prior.completeHour)})):null};
}
