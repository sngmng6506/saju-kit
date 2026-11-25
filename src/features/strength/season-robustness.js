import { SajuError } from '../../core/error.js';
import { evaluateIntegratedDecision } from './integrated-decision.js';
import { createStrengthEvidenceProvider } from './request-evidence.js';

export const MULTIAXIS_V4_VERSION='strength-multiaxis-v4';
const resourceGrounds=['local-resource-and-robust-support','bounded-route-support'];

// E4 is a conservative confirmation gate, not a second classifier.
// Only resource-based strong hypotheses require a matched neutral-season check.
export function assessSeasonRobustness(standard,neutral){
 if(standard.direction!=='strong'||standard.decision.grounds.includes('central-root-capacity'))
  return {required:false,passed:null,sharedGrounds:[]};
 const sharedGrounds=resourceGrounds.filter(g=>standard.decision.grounds.includes(g)&&neutral?.decision?.grounds.includes(g));
 return {required:true,passed:neutral?.direction==='strong'&&sharedGrounds.length>0,sharedGrounds};
}

export function analyzeMultiaxisStrengthV4(input){
 return evaluateSeasonRobustness(input,createStrengthEvidenceProvider(),createStrengthEvidenceProvider({seasonMode:'neutral'}));
}
// Internal composition: the public API never accepts a provider.
export function evaluateSeasonRobustness(input,standardProvider,neutralProvider){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('strength-input','강약 분석 입력 객체가 필요합니다.');
 if(input.policy!==MULTIAXIS_V4_VERSION)throw new SajuError('strength-policy','다축 v4 정책을 명시해야 합니다.');
 const args={saju:input.saju,birthBasis:input.birthBasis,policy:'strength-multiaxis-v3'};
 const standard=evaluateIntegratedDecision(args,standardProvider);
 const required=standard.direction==='strong'&&!standard.decision.grounds.includes('central-root-capacity');
 const neutral=required?evaluateIntegratedDecision(args,neutralProvider):null;
 const gate=assessSeasonRobustness(standard,neutral);
 const blocked=gate.required&&!gate.passed;
 const decision=blocked?{...standard.decision,direction:null,conflicts:[...standard.decision.conflicts,'season-sensitive-resource-support']}:standard.decision;
 return {...standard,version:MULTIAXIS_V4_VERSION,assessment:'experimental-season-robust-confirmation',
  baselinePolicy:standard.version,baselineDirection:standard.direction,baselineDecision:standard.decision,
  direction:blocked?null:standard.direction,status:blocked?'unresolved':standard.status,decision,
  seasonRobustness:{...gate,neutralDirection:neutral?.direction??null,neutralGrounds:neutral?.decision?.grounds??[],neutralConflicts:neutral?.decision?.conflicts??[]}};
}
