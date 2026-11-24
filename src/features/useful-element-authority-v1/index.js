import { SajuError } from '../../core/error.js';
import { analyzeUsefulElementReview } from '../useful-element-review-v1/index.js';
import { compareMethodEvidence } from '../useful-element-review-v1/evidence.js';
import { analyzeClimateUsefulElementV2 } from '../climate-useful-element-v2/index.js';
import { collectAuthorityReview } from './evidence.js';
export const USEFUL_ELEMENT_AUTHORITY_VERSION='useful-element-authority-v1';
export function analyzeUsefulElementAuthority(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('useful-element-input','용신 분석 입력 객체가 필요합니다.');
 if(input.policy!==USEFUL_ELEMENT_AUTHORITY_VERSION)throw new SajuError('useful-element-policy','용신 권한 검토 정책을 명시해야 합니다.');
 const args={saju:input.saju,birthBasis:input.birthBasis};
 const legacy=analyzeUsefulElementReview({...args,policy:'useful-element-review-v1'});
 const climate=analyzeClimateUsefulElementV2({...args,policy:'climate-useful-element-v2'});
 return composeAuthorityReview(legacy,climate,USEFUL_ELEMENT_AUTHORITY_VERSION,'parallel-doctrine-review-v2');
}
// Internal shared composition; the public v1 has no caller-selectable provider.
export function composeAuthorityReview(legacy,climate,version,reviewVersion){
 const methods={...legacy.methods,climate};
 const review={...legacy,version:reviewVersion,methods,
  comparisons:compareMethodEvidence(methods.balance,climate,methods.mediation,methods.remedy)};
 return {version,assessment:'conditional-authority-and-anchor-relations-only',
  review,authority:collectAuthorityReview(review),usefulElement:null,favorableElements:null,unfavorableElements:null,confirmed:false};
}
