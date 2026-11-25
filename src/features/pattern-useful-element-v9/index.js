import { SajuError } from '../../core/error.js';
import { analyzeStemForceEvidence } from '../../core/stem-force.js';
import { analyzePatternUsefulElementV8,PATTERN_V8_VERSION } from '../pattern-useful-element-v8/index.js';
import { observePatternForce } from './roles.js';
export const PATTERN_V9_VERSION='pattern-useful-element-v9';
export function analyzePatternUsefulElementV9(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_V9_VERSION)throw new SajuError('pattern-policy','격국 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternUsefulElementV8({...input,policy:PATTERN_V8_VERSION});
 if(prior.status==='unavailable')return {...prior,version:PATTERN_V9_VERSION,stemForce:null,patternForce:null};
 const stemForce=analyzeStemForceEvidence({saju:input.saju});
 return {...prior,version:PATTERN_V9_VERSION,stemForce,patternForce:observePatternForce(prior,stemForce)};
}
