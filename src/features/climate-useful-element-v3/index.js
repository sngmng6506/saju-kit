import { SajuError } from '../../core/error.js';
import { analyzeNatalContext } from '../../core/natal-context.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { climateEvidence } from '../climate-useful-element-v1/index.js';
import { climateSourceRowV3,CLIMATE_V3_COVERAGE } from './source.js';
import { compareClimateTermConditions } from './term-conditions.js';
export const CLIMATE_V3_VERSION='climate-useful-element-v3';
export function analyzeClimateUsefulElementV3(input){
 return evaluateClimateReview(input,{version:CLIMATE_V3_VERSION,lookup:climateSourceRowV3,coverage:CLIMATE_V3_COVERAGE});
}
// Internal composition; public versions fix their own source and policy.
export function evaluateClimateReview(input,{version,lookup,coverage,observeConditions}){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('climate-input','조후 분석 입력 객체가 필요합니다.');
 if(input.policy!==version)throw new SajuError('climate-policy','조후 정책을 명시해야 합니다.');
 if(!['verified-chart','provisional-chart'].includes(input.birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
 const context=analyzeNatalContext({saju:input.saju});
 const meta={version,completeHour:context.completeHour,assessment:'source-specific-climate-review-only',usefulElement:null,confirmed:false};
 if(input.birthBasis==='provisional-chart')return {...meta,status:'unavailable',reason:'provisional-chart',evidence:null};
 const structure=analyzeElementStructure({saju:input.saju});
 const evidence=climateEvidence(context,structure,{lookup,coverage,projectAlternatives:true});
 const temporal=compareClimateTermConditions({saju:input.saju,birth:input.birth,completeHour:context.completeHour,alternatives:evidence.sourceProfile?.alternatives??[]});
 return {...meta,status:context.completeHour?'diagnostic':'partial',evidence,temporal,...(observeConditions?{structuralConditions:observeConditions(evidence.sourceProfile,structure)}:{})};
}
