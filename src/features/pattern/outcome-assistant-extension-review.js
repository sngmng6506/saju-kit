import {SajuError} from '../../core/error.js';
import {analyzePatternOutcomeV9,PATTERN_OUTCOME_V9_VERSION} from './outcome-review-v9.js';
import {extendAssistantRoutes,observeAssistantCombinationInjury,observeBranchAssistantDependencies} from './outcome-assistant-extension.js';
import {observeCompoundTopology} from './outcome-compound-topology.js';
import {observeAssistantNecessity} from './outcome-assistant.js';
import {observeCandidateClarity} from './outcome-clarity.js';
export const PATTERN_OUTCOME_ASSISTANT_EXTENSION_VERSION='pattern-outcome-assistant-extension-v1';
export function analyzePatternOutcomeAssistantExtension(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_ASSISTANT_EXTENSION_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const prior=analyzePatternOutcomeV9({...input,policy:PATTERN_OUTCOME_V9_VERSION});
 const base={...prior,version:PATTERN_OUTCOME_ASSISTANT_EXTENSION_VERSION,scope:'ordinary-pattern-assistant-route-extension'};
 if(!prior.access)return {...base,assistantExtension:null};
 const candidates=prior.reviews.map(q=>{
  const review=extendAssistantRoutes(q,input.saju,prior.access,prior.completeHour);
  const compound=observeCompoundTopology(review,prior.completeHour);
  const assistant=observeAssistantNecessity(review,compound,prior.completeHour);
  const clarity=observeCandidateClarity(review,compound,assistant,prior.positionContext.visibleOrder,prior.completeHour);
  return {candidateId:q.candidateId,review,compound,assistant,clarity,
   combinationInjury:observeAssistantCombinationInjury(review,compound,input.saju,prior.completeHour),
   branchDependencies:observeBranchAssistantDependencies(review,prior.access,prior.completeHour),
   assistantConfirmed:null,selectionAuthority:false};
 });
 return {...base,assistantExtension:{candidates,selectionAuthority:false,confirmed:false}};
}
