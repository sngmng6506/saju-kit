import {SajuError} from '../../core/error.js';
import {evaluateBalanceUsefulElement,BALANCE_USEFUL_ELEMENT_VERSION} from '../balance/candidates.js';
import {buildOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../pattern/outcome-review-v10.js';
import {composeOutcomeSynthesis} from './outcome-synthesis.js';
import {observeSynthesisPriority} from './synthesis-priority.js';
import {observeSynthesisSelection} from './synthesis-selection.js';
import {createMethodEvidence} from '../method-evidence.js';
import {evaluateMediationUsefulElement,MEDIATION_USEFUL_ELEMENT_VERSION} from '../mediation/review.js';
import {evaluateRemedyEvidence,REMEDY_EVIDENCE_VERSION} from '../remedy/review.js';
import {observeSupplementaryMethods,projectSynthesisTiming} from './synthesis-method-links.js';
export const USEFUL_ELEMENT_SYNTHESIS_VERSION='useful-element-synthesis-v1';
// Public fixed-policy orchestration. No supplied evidence or approval accepted.
export function analyzeUsefulElementSynthesis(input){
 return buildSynthesis(input);
}
// Internal differential benchmark: separate providers compute identical policies.
export function buildSynthesis(input,{shared=true}={}){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('useful-element-input','용신 종합 분석 입력 객체가 필요합니다.');
 if(input.policy!==USEFUL_ELEMENT_SYNTHESIS_VERSION)throw new SajuError('useful-element-policy','용신 종합 분석 정책을 명시해야 합니다.');
 const args={saju:input.saju,birthBasis:input.birthBasis};
 const provider=createMethodEvidence();
 const next=()=>shared?provider:createMethodEvidence();
 const {result:pattern,climateResult}=buildOutcomeV10({...args,policy:PATTERN_OUTCOME_V10_VERSION},next(),input.birth);
 const balance=evaluateBalanceUsefulElement({...args,policy:BALANCE_USEFUL_ELEMENT_VERSION},next());
 const result=composeOutcomeSynthesis(input.saju,balance,pattern);
 const priorityReview=observeSynthesisPriority(input.saju,result,pattern);
 const status=priorityReview.status==='invalid-evidence'?'invalid-evidence':result.status;
 const usable=['diagnostic','partial'].includes(status);
 const mediation=usable?evaluateMediationUsefulElement({...args,policy:MEDIATION_USEFUL_ELEMENT_VERSION},next()):null;
 const remedy=usable?evaluateRemedyEvidence({...args,policy:REMEDY_EVIDENCE_VERSION},next()):null;
 const supplementaryMethods=observeSupplementaryMethods(input.saju,{...result,status},pattern,mediation,remedy);
 const climateTiming=projectSynthesisTiming(usable?climateResult:null);
 const composed={...result,status,priorityReview,supplementaryMethods,climateTiming};
 const selectionReview=observeSynthesisSelection(composed);
 return {...composed,status:selectionReview.status==='invalid-evidence'?'invalid-evidence':status,selectionReview};
}
