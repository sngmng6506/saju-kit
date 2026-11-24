import { SajuError } from '../../core/error.js';
import { analyzeBalanceUsefulElement } from '../balance-useful-element-v1/index.js';
import { analyzeQuantitativeStrength } from '../strength-quantitative-v3/index.js';
import { reviewBalancePriority } from './evidence.js';

export const BALANCE_PRIORITY_VERSION='balance-priority-v1';
export function analyzeBalancePriority(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('balance-input','억부용신 분석 입력 객체가 필요합니다.');
 if(input.policy!==BALANCE_PRIORITY_VERSION)throw new SajuError('balance-policy','억부 우선 검토 정책을 명시해야 합니다.');
 const {saju,birthBasis}=input;
 const balance=analyzeBalanceUsefulElement({saju,birthBasis,policy:'balance-useful-element-v1'});
 const meta={version:BALANCE_PRIORITY_VERSION,assessment:'conditional-mechanism-review-only',
  usefulElement:null,ranking:null,confirmed:false};
 if(balance.status==='unavailable')return {...meta,status:'unavailable',reason:balance.reason,balance,reviews:[]};
 const args={saju,birthBasis,policy:'strength-quantitative-v3'};
 const standard=analyzeQuantitativeStrength(args).quantitative.scenarios;
 const neutral=analyzeQuantitativeStrength(args,{seasonMode:'neutral'}).quantitative.scenarios;
 return {...meta,status:balance.status,balance,reviews:balance.branches.map(b=>reviewBalancePriority(b,standard,neutral))};
}
