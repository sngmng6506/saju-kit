import { SajuError } from '../../core/error.js';
import { analyzeBalanceUsefulElement } from '../balance-useful-element-v1/index.js';
import { analyzeClimateUsefulElement } from '../climate-useful-element-v1/index.js';
import { analyzeMediationUsefulElement } from '../mediation-useful-element-v1/index.js';
import { analyzeRemedyEvidence } from '../remedy-evidence-v1/index.js';
import { compareMethodEvidence } from './evidence.js';
export const USEFUL_ELEMENT_REVIEW_VERSION='useful-element-review-v1';
export function analyzeUsefulElementReview(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('useful-element-input','용신 분석 입력 객체가 필요합니다.');
 if(input.policy!==USEFUL_ELEMENT_REVIEW_VERSION)throw new SajuError('useful-element-policy','용신 검토 정책을 명시해야 합니다.');
 const args={saju:input.saju,birthBasis:input.birthBasis};
 const balance=analyzeBalanceUsefulElement({...args,policy:'balance-useful-element-v1'});
 const climate=analyzeClimateUsefulElement({...args,policy:'climate-useful-element-v1'});
 const mediation=analyzeMediationUsefulElement({...args,policy:'mediation-useful-element-v1'});
 const remedy=analyzeRemedyEvidence({...args,policy:'remedy-evidence-v1'});
 const status=args.birthBasis==='provisional-chart'?'unavailable':
  climate.status==='partial'?'partial':balance.status;
 return {version:USEFUL_ELEMENT_REVIEW_VERSION,status,assessment:'parallel-doctrine-review-only',specialPatternAssessment:'not-assessed',
  methods:{balance,climate,mediation,remedy},
  comparisons:compareMethodEvidence(balance,climate,mediation,remedy),
  usefulElement:null,favorableElements:null,unfavorableElements:null,ranking:null,confirmed:false,
  limitations:['no-cross-method-authority','special-pattern-not-assessed','month-command-use-not-assessed','no-effective-force-model','no-confirmed-useful-element']};
}
