import { SajuError } from '../../core/error.js';
import { analyzeUsefulElementAuthorityV2,USEFUL_ELEMENT_AUTHORITY_V2_VERSION } from './temporal-authority.js';
import { analyzeClimateUsefulElementV5,CLIMATE_V5_VERSION } from '../climate-useful-element-v5/index.js';
import { projectSourceCandidates } from './source-candidates.js';
export const USEFUL_ELEMENT_AUTHORITY_V3_VERSION='useful-element-authority-v3';
export function analyzeUsefulElementAuthorityV3(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('useful-element-input','용신 분석 입력 객체가 필요합니다.');
 if(input.policy!==USEFUL_ELEMENT_AUTHORITY_V3_VERSION)throw new SajuError('useful-element-policy','용신 권한 검토 정책을 명시해야 합니다.');
 const prior=analyzeUsefulElementAuthorityV2({...input,policy:USEFUL_ELEMENT_AUTHORITY_V2_VERSION});
 const climate=analyzeClimateUsefulElementV5({...input,policy:CLIMATE_V5_VERSION});
 // No unreviewed source expansion is admitted into the legacy anchor namespace.
 return {...prior,version:USEFUL_ELEMENT_AUTHORITY_V3_VERSION,anchorBasis:USEFUL_ELEMENT_AUTHORITY_V2_VERSION,
  sourceReview:{climate,candidates:projectSourceCandidates(climate),selectionAuthority:false,confirmed:false}};
}
