import { SajuError } from '../../core/error.js';
import { analyzeNatalContext } from '../../core/natal-context.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { climateEvidence } from '../climate-useful-element-v1/index.js';
import { climateSourceRowV2, CLIMATE_V2_COVERAGE } from './source.js';
export const CLIMATE_V2_VERSION='climate-useful-element-v2';
export function analyzeClimateUsefulElementV2(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('climate-input','조후 분석 입력 객체가 필요합니다.');
 if(input.policy!==CLIMATE_V2_VERSION)throw new SajuError('climate-policy','조후 정책을 명시해야 합니다.');
 if(!['verified-chart','provisional-chart'].includes(input.birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
 const context=analyzeNatalContext({saju:input.saju});
 const meta={version:CLIMATE_V2_VERSION,completeHour:context.completeHour,assessment:'source-specific-climate-review-only',usefulElement:null,confirmed:false};
 if(input.birthBasis==='provisional-chart')return {...meta,status:'unavailable',reason:'provisional-chart',evidence:null};
 const evidence=climateEvidence(context,analyzeElementStructure({saju:input.saju}),{lookup:climateSourceRowV2,coverage:CLIMATE_V2_COVERAGE});
 return {...meta,status:context.completeHour?'diagnostic':'partial',evidence};
}
