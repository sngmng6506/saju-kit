import { SajuError } from '../../core/error.js';
import { observeRelativeForce } from '../../core/relative-force.js';
import { analyzePatternUsefulElementV9,PATTERN_V9_VERSION } from '../pattern-useful-element-v9/index.js';
import { bindRelativePattern } from './roles.js';
export const PATTERN_V10_VERSION='pattern-useful-element-v10';
export function analyzePatternUsefulElementV10(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_V10_VERSION)throw new SajuError('pattern-policy','격국 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternUsefulElementV9({...input,policy:PATTERN_V9_VERSION});
 if(prior.status==='unavailable')return {...prior,version:PATTERN_V10_VERSION,relativeForce:null,relativePattern:null};
 const relativeForce=observeRelativeForce(prior.stemForce);
 return {...prior,version:PATTERN_V10_VERSION,relativeForce,relativePattern:bindRelativePattern(prior,relativeForce)};
}
