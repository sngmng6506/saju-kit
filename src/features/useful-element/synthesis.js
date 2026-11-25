import {SajuError} from '../../core/error.js';
import {analyzeBalanceUsefulElement,BALANCE_USEFUL_ELEMENT_VERSION} from '../balance/candidates.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../pattern/outcome-review-v10.js';
import {composeOutcomeSynthesis} from './outcome-synthesis.js';
import {observeSynthesisPriority} from './synthesis-priority.js';
export const USEFUL_ELEMENT_SYNTHESIS_VERSION='useful-element-synthesis-v1';
// Public fixed-policy orchestration. No supplied evidence or approval accepted.
export function analyzeUsefulElementSynthesis(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('useful-element-input','용신 종합 분석 입력 객체가 필요합니다.');
 if(input.policy!==USEFUL_ELEMENT_SYNTHESIS_VERSION)throw new SajuError('useful-element-policy','용신 종합 분석 정책을 명시해야 합니다.');
 const args={saju:input.saju,birthBasis:input.birthBasis};
 const pattern=analyzePatternOutcomeV10({...args,policy:PATTERN_OUTCOME_V10_VERSION});
 const balance=analyzeBalanceUsefulElement({...args,policy:BALANCE_USEFUL_ELEMENT_VERSION});
 const result=composeOutcomeSynthesis(input.saju,balance,pattern);
 const priorityReview=observeSynthesisPriority(input.saju,result,pattern);
 return {...result,status:priorityReview.status==='invalid-evidence'?'invalid-evidence':result.status,priorityReview};
}
