import {SajuError} from '../../core/error.js';
import {analyzePatternPolicy} from './pipeline.js';
import {OUTCOME_SOURCE,outcomeRules} from './outcome-rules.js';
import {reviewOutcomeGraph} from './outcome-graph.js';
export const PATTERN_OUTCOME_VERSION='pattern-outcome-evidence-v1';
export function analyzePatternOutcome(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternPolicy({...input,policy:'pattern-useful-element-v10'},10);
 const base={version:PATTERN_OUTCOME_VERSION,baselinePolicy:prior.version,completeHour:prior.completeHour,
  source:OUTCOME_SOURCE,scope:'ordinary-pattern-structural-subclauses',specialPatternsAssessed:false,
  selectedPattern:null,formed:null,broken:null,rescued:null,assistantGod:null,patternUsefulGod:null,usefulElement:null,
  selectionAuthority:false,confirmed:false};
 if(!prior.selection)return {...base,status:'unavailable',reason:prior.reason,reviews:[]};
 return {...base,status:prior.completeHour?'diagnostic':'partial',preference:prior.preference,
  reviews:prior.selection.candidates.map(c=>reviewOutcomeGraph(prior,c,outcomeRules(c.family)))};
}
