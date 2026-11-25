import { SajuError } from '../../core/error.js';
import { analyzeNatalContext } from '../../core/natal-context.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { climateEvidence } from './evidence.js';
import { compareClimateTermConditions } from './term-conditions.js';

// Legacy v1/v2 omit temporal fields and alternative projection; v3+ retain
// the same evidence and temporal semantics. Extension is internal only.
export function evaluateClimateKernel(input,{version,lookup,coverage,observeConditions,legacy=false},extend){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('climate-input','조후 분석 입력 객체가 필요합니다.');
 if(input.policy!==version)throw new SajuError('climate-policy','조후 정책을 명시해야 합니다.');
 if(!['verified-chart','provisional-chart'].includes(input.birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
 const context=analyzeNatalContext({saju:input.saju});
 const meta={version,completeHour:context.completeHour,assessment:'source-specific-climate-review-only',usefulElement:null,confirmed:false};
 if(input.birthBasis==='provisional-chart')return {...meta,status:'unavailable',reason:'provisional-chart',evidence:null};
 const structure=analyzeElementStructure({saju:input.saju});
 const evidence=climateEvidence(context,structure,{lookup,coverage,projectAlternatives:!legacy});
 if(legacy)return {...meta,status:context.completeHour?'diagnostic':'partial',evidence};
 const temporal=compareClimateTermConditions({saju:input.saju,birth:input.birth,completeHour:context.completeHour,alternatives:evidence.sourceProfile?.alternatives??[]});
 const result={...meta,status:context.completeHour?'diagnostic':'partial',evidence,temporal,...(observeConditions?{structuralConditions:observeConditions(evidence.sourceProfile,structure)}:{})};
 return extend?extend(result,structure):result;
}
