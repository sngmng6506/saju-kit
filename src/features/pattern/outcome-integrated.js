import {SajuError} from '../../core/error.js';
import {evaluateClimateRequirements,CLIMATE_V5_VERSION} from '../climate/requirement-review.js';
import {buildOutcomeV5,PATTERN_OUTCOME_V5_VERSION} from './outcome-review-v5.js';
import {completeStorageStages,retainStorageConditions} from './outcome-storage-extension.js';
import {needsWinterClimate,projectWinterClimate,reviewWinterOfficer} from './outcome-winter-exception.js';
import {observePositionContext} from './outcome-position.js';
import {extendAssistantRoutes,observeAssistantCombinationInjury,observeBranchAssistantDependencies} from './outcome-assistant-extension.js';
import {observeCompoundTopology} from './outcome-compound-topology.js';
import {observeCompoundMotifs,observeKillingWealthDualRole} from './outcome-compound-motifs.js';
import {observeAssistantNecessity} from './outcome-assistant.js';
import {observeSourcePurity} from './outcome-purity-source.js';
import {observeGeneralPurity} from './outcome-purity-general.js';
import {observeRouteInjury} from './outcome-route-injury.js';
import {observeCandidateClarity} from './outcome-clarity.js';
import {inspectIntegratedEvidence} from './outcome-integrity.js';
export const PATTERN_OUTCOME_INTEGRATED_VERSION='pattern-outcome-integrated-v1';
export function analyzePatternOutcomeIntegrated(input){
 return buildIntegratedOutcome(input).result;
}
// Internal request-local evidence for downstream diagnostic policies.
export function buildIntegratedOutcome(input,provider,birth){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_INTEGRATED_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const {prior,result,formation}=buildOutcomeV5({...input,policy:PATTERN_OUTCOME_V5_VERSION},provider);
 const base={...result,version:PATTERN_OUTCOME_INTEGRATED_VERSION,scope:'ordinary-pattern-integrated-structural-evidence'};
 if(!result.access)return {prior,result:{...base,positionContext:null,winterClimate:null,compoundReview:null,assistantReview:null,purityReview:null,clarityReview:null,extensionReview:null,integrity:null}};
 const month=input.saju.pillars.month.branch,complete=prior.completeHour;
 const climateResult=needsWinterClimate(prior,month)?evaluateClimateRequirements({saju:input.saju,birthBasis:input.birthBasis,birth,policy:CLIMATE_V5_VERSION},provider):null;
 const winterClimate=climateResult?projectWinterClimate(input,climateResult):null;
 const reviews=result.reviews.map(q=>retainStorageConditions(extendAssistantRoutes(
  reviewWinterOfficer(prior,completeStorageStages(prior,result.access,q,result.regulationStrength),month,winterClimate),
  input.saju,result.access,complete)));
 // Every projection below reads the same final candidate witness set.
 const positionContext=observePositionContext(prior,reviews);
 const positions=new Map(positionContext.candidateReviews.map(q=>[q.candidateId,q]));
 const occurrenceIds=prior.stemForce.occurrences.map(o=>o.id);
 const rows=reviews.map(q=>{
  const compound={...observeCompoundTopology(q,complete),motifs:[...observeCompoundMotifs(q,complete),...observeKillingWealthDualRole(q,complete)]};
  const assistant=observeAssistantNecessity(q,compound,complete);
  const clarity=observeCandidateClarity(q,compound,assistant,positionContext.visibleOrder,complete);
  const extension={candidateId:q.candidateId,combinationInjury:observeAssistantCombinationInjury(q,compound,input.saju,complete),
   branchDependencies:observeBranchAssistantDependencies(q,result.access,complete),selectionAuthority:false};
  const integrity=inspectIntegratedEvidence(q,compound,assistant,clarity,positions.get(q.candidateId),result.access,occurrenceIds);
  const routeInjury=observeRouteInjury(prior,result.access,q,compound,assistant,integrity);
  return {compound,assistant,clarity:{...clarity,routeInjury},extension,integrity:{candidateId:q.candidateId,...integrity}};
 });
 const integrityRows=rows.map(r=>r.integrity);
 return {prior,formation,climateResult,result:{...base,reviews,winterClimate,positionContext,compoundReview:rows.map(r=>r.compound),assistantReview:rows.map(r=>r.assistant),
  purityReview:{...observeSourcePurity(input.saju,reviews,complete),generalized:observeGeneralPurity(prior,reviews,integrityRows)},clarityReview:rows.map(r=>r.clarity),extensionReview:rows.map(r=>r.extension),
  integrity:{status:integrityRows.some(r=>r.violations.length)?'invalid-evidence':'consistent',candidates:integrityRows,selectionAuthority:false}}};
}
