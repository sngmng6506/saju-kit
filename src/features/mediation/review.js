import { createMethodEvidence } from '../method-evidence.js';
import { SajuError } from '../../core/error.js';
import { observeBalanceElements } from '../balance/evidence.js';
import { observeMediationPairs,compareConfrontation } from './evidence.js';
export const MEDIATION_USEFUL_ELEMENT_VERSION='mediation-useful-element-v1';
export function analyzeMediationUsefulElement(input){
 return evaluateMediationUsefulElement(input,createMethodEvidence());
}
export function evaluateMediationUsefulElement(input,provider){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('mediation-input','통관 분석 입력 객체가 필요합니다.');
 if(input.policy!==MEDIATION_USEFUL_ELEMENT_VERSION)throw new SajuError('mediation-policy','통관 정책을 명시해야 합니다.');
 if(!['verified-chart','provisional-chart'].includes(input.birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
 const {saju,birthBasis}=input,structure=provider.structure(saju);
 const meta={version:MEDIATION_USEFUL_ELEMENT_VERSION,assessment:'structural-mediation-review-only',completeHour:structure.completeHour,usefulElement:null,confirmed:false};
 if(birthBasis==='provisional-chart')return {...meta,status:'unavailable',reason:'provisional-chart',pairs:[]};
 const pairs=observeMediationPairs(provider.standard.dynamics(saju),structure);
 if(!structure.completeHour)return {...meta,status:'partial',pairs};
 const standard=provider.standard.quantitative(saju,birthBasis).quantitative.scenarios,neutral=provider.neutral.quantitative(saju,birthBasis).quantitative.scenarios;
 return {...meta,status:'diagnostic',pairs:compareConfrontation(pairs,observeBalanceElements(structure),standard,neutral)};
}
