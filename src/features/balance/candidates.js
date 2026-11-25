import { createMethodEvidence } from '../method-evidence.js';
import { SajuError } from '../../core/error.js';
import { validateNatalPillars } from '../../core/natal.js';
import { evaluateSeasonRobustness } from '../strength/season-robustness.js';
import { observeBalanceElements, buildBalanceBranch } from './evidence.js';

export const BALANCE_USEFUL_ELEMENT_VERSION='balance-useful-element-v1';
/** Conditional ordinary-chart 扶抑 candidates, never final 用神/喜忌. */
export function analyzeBalanceUsefulElement(input){
 return evaluateBalanceUsefulElement(input,createMethodEvidence());
}
export function evaluateBalanceUsefulElement(input,provider){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('balance-input','억부용신 분석 입력 객체가 필요합니다.');
 const {saju,birthBasis,policy}=input;
 if(policy!==BALANCE_USEFUL_ELEMENT_VERSION)throw new SajuError('balance-policy','억부용신 정책을 명시해야 합니다.');
 if(!['verified-chart','provisional-chart'].includes(birthBasis))throw new SajuError('strength-birth-basis','원국 확정 여부를 명시해야 합니다.');
 const pillars=validateNatalPillars(saju),completeHour=pillars.hour!==null;
 const meta={version:BALANCE_USEFUL_ELEMENT_VERSION,scope:'ordinary-chart-assumption',specialPatternAssessment:'not-assessed',
  assessment:'conditional-balance-candidates-only',completeHour,
  usefulElement:null,favorableElements:null,unfavorableElements:null,confirmed:false};
 const unavailable=reason=>({...meta,status:'unavailable',reason,strength:null,observations:null,branches:[]});
 if(birthBasis==='provisional-chart')return unavailable('provisional-chart');
 if(!completeHour)return unavailable('missing-hour');
 // Fixed accepted research baseline; never accept caller-supplied strength or authority.
 const base=evaluateSeasonRobustness({saju,birthBasis,policy:'strength-multiaxis-v4'},provider.standard,provider.neutral);
 const strength={version:base.version,direction:base.direction,status:base.status,
  grounds:[...base.decision.grounds],conflicts:[...base.decision.conflicts]};
 const structure=provider.structure(saju);
 const observations=observeBalanceElements(structure);
 const directions=base.direction===null?['strong','weak']:[base.direction];
 return {...meta,status:base.direction===null?'conditional-branches':'directional-hypothesis',
  strength,observations,branches:directions.map(d=>buildBalanceBranch(observations,d)),
  limitations:['special-pattern-not-assessed','effective-interactions-unconfirmed','month-command-unresolved','climate-not-assessed','no-useful-element-reference-validation']};
}
