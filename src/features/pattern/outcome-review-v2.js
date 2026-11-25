import {SajuError} from '../../core/error.js';
import {analyzeFormationEvidence} from '../../core/formation-evidence.js';
import {analyzePatternPolicy} from './pipeline.js';
import {OUTCOME_SOURCE,outcomeRules} from './outcome-rules.js';
import {reviewOutcomeGraph} from './outcome-graph.js';
import {observeOutcomeAccess} from './outcome-access.js';
import {reviewExtendedOutcome} from './outcome-extended.js';
export const PATTERN_OUTCOME_V2_VERSION='pattern-outcome-evidence-v2';
export function analyzePatternOutcomeV2(input){
 return buildOutcomeV2(input).result;
}
// Internal request-local evidence for additive policies; not a root API.
export function buildOutcomeV2(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_V2_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternPolicy({...input,policy:'pattern-useful-element-v10'},10);
 const base={version:PATTERN_OUTCOME_V2_VERSION,baselinePolicy:prior.version,completeHour:prior.completeHour,
  source:OUTCOME_SOURCE,scope:'ordinary-pattern-structural-subclauses-with-hidden-and-group-review',specialPatternsAssessed:false,
  selectedPattern:null,formed:null,broken:null,rescued:null,assistantGod:null,patternUsefulGod:null,usefulElement:null,
  selectionAuthority:false,confirmed:false};
 if(!prior.selection)return {prior,result:{...base,status:'unavailable',reason:prior.reason,reviews:[],access:null}};
 const access=observeOutcomeAccess(prior,analyzeFormationEvidence({saju:input.saju}));
 const reviews=prior.selection.candidates.map(c=>reviewExtendedOutcome(prior,access,reviewOutcomeGraph(prior,c,outcomeRules(c.family))));
 return {prior,result:{...base,status:prior.completeHour?'diagnostic':'partial',preference:prior.preference,reviews,access}};
}
