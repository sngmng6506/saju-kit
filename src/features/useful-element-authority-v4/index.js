import { SajuError } from '../../core/error.js';
import { analyzeUsefulElementAuthorityV3,USEFUL_ELEMENT_AUTHORITY_V3_VERSION } from '../useful-element-authority-v3/index.js';
import { analyzePatternUsefulElementV3,PATTERN_V3_VERSION } from '../pattern-useful-element-v3/index.js';
import { compareFiveMethods } from './matrix.js';
export const USEFUL_ELEMENT_AUTHORITY_V4_VERSION='useful-element-authority-v4';
// Internal composition preserves prior anchor basis, without recalculating it.
export function composeFiveMethodAuthority(prior,pattern){
 return {...prior,version:USEFUL_ELEMENT_AUTHORITY_V4_VERSION,patternReview:pattern,
  fiveMethodReview:compareFiveMethods(prior,pattern)};
}
export function analyzeUsefulElementAuthorityV4(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('useful-element-input','용신 분석 입력 객체가 필요합니다.');
 if(input.policy!==USEFUL_ELEMENT_AUTHORITY_V4_VERSION)throw new SajuError('useful-element-policy','용신 권한 검토 정책을 명시해야 합니다.');
 const prior=analyzeUsefulElementAuthorityV3({...input,policy:USEFUL_ELEMENT_AUTHORITY_V3_VERSION});
 const pattern=analyzePatternUsefulElementV3({...input,policy:PATTERN_V3_VERSION});
 return composeFiveMethodAuthority(prior,pattern);
}
