import { createMethodEvidence } from '../method-evidence.js';
import { SajuError } from '../../core/error.js';
import { evaluateBalanceUsefulElement } from '../balance/candidates.js';
import { analyzeClimateUsefulElement } from '../climate-useful-element-v1/index.js';
import { evaluateMediationUsefulElement } from '../mediation/review.js';
import { evaluateRemedyEvidence } from '../remedy/review.js';
import { compareMethodEvidence } from './method-comparison.js';
export const USEFUL_ELEMENT_REVIEW_VERSION='useful-element-review-v1';
export function analyzeUsefulElementReview(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('useful-element-input','용신 분석 입력 객체가 필요합니다.');
 if(input.policy!==USEFUL_ELEMENT_REVIEW_VERSION)throw new SajuError('useful-element-policy','용신 검토 정책을 명시해야 합니다.');
 const args={saju:input.saju,birthBasis:input.birthBasis};
 const provider=createMethodEvidence();
 const balance=evaluateBalanceUsefulElement({...args,policy:'balance-useful-element-v1'},provider);
 const climate=analyzeClimateUsefulElement({...args,policy:'climate-useful-element-v1'});
 const mediation=evaluateMediationUsefulElement({...args,policy:'mediation-useful-element-v1'},provider);
 const remedy=evaluateRemedyEvidence({...args,policy:'remedy-evidence-v1'},provider);
 const status=args.birthBasis==='provisional-chart'?'unavailable':
  climate.status==='partial'?'partial':balance.status;
 return {version:USEFUL_ELEMENT_REVIEW_VERSION,status,assessment:'parallel-doctrine-review-only',specialPatternAssessment:'not-assessed',
  methods:{balance,climate,mediation,remedy},
  comparisons:compareMethodEvidence(balance,climate,mediation,remedy),
  usefulElement:null,favorableElements:null,unfavorableElements:null,ranking:null,confirmed:false,
  limitations:['no-cross-method-authority','special-pattern-not-assessed','month-command-use-not-assessed','no-effective-force-model','no-confirmed-useful-element']};
}
