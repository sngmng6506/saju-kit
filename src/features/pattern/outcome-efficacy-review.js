import {SajuError} from '../../core/error.js';
import {buildIntegratedOutcome,PATTERN_OUTCOME_INTEGRATED_VERSION} from './outcome-integrated.js';
import {createEffectContext,observeWitnessEfficacy} from './outcome-efficacy.js';
import {evaluateClimateRequirements,CLIMATE_V5_VERSION} from '../climate/requirement-review.js';
import {projectMechanismClimate,observeMechanismReview} from './outcome-mechanism.js';
import {observeJointOutcome} from './outcome-joint.js';
import {observeRoleCapacity,observeRoleConditions} from './outcome-role-capacity.js';
import {observeCapacityComparisons,observeRouteFlow} from './outcome-role-flow.js';
import {observeCombinationContext,observeCombinationRoles} from './outcome-combination-context.js';
import {observeBranchAccessContext,observeMonthChange,observeBranchRouteAccess} from './outcome-branch-context.js';
export const PATTERN_OUTCOME_EFFICACY_VERSION='pattern-outcome-efficacy-v1';
export function analyzePatternOutcomeEfficacy(input){
 return buildOutcomeEfficacy(input).result;
}
// Internal composition returns raw climate evidence without duplicating it in the public payload.
export function buildOutcomeEfficacy(input,provider,birth){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_EFFICACY_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const {prior,result,climateResult,formation}=buildIntegratedOutcome({...input,policy:PATTERN_OUTCOME_INTEGRATED_VERSION},provider,birth);
 const base={...result,version:PATTERN_OUTCOME_EFFICACY_VERSION,scope:'ordinary-pattern-efficacy-evidence-screens'};
 if(!result.access)return {prior,result:{...base,efficacyReview:null},climateResult:null};
 const context=createEffectContext(prior,result.access);
 const integrity=new Map(result.integrity.candidates.map(q=>[q.candidateId,q]));
 const compound=new Map(result.compoundReview.map(q=>[q.candidateId,q]));
 const candidates=result.reviews.map(q=>observeWitnessEfficacy(q,integrity.get(q.candidateId),compound.get(q.candidateId),context,prior.completeHour));
 const resolvedClimate=climateResult??evaluateClimateRequirements({saju:input.saju,birthBasis:input.birthBasis,birth,policy:CLIMATE_V5_VERSION},provider);
 const climate=projectMechanismClimate(resolvedClimate,prior.completeHour);
 const clarity=new Map(result.clarityReview.map(q=>[q.candidateId,q]));
 const combinationContext=observeCombinationContext(prior,formation);
 const branchContext=observeBranchAccessContext(prior,result.access,formation);
 const monthChange=observeMonthChange(prior,branchContext,input.saju.pillars.month.branch);
 const roleCapacity=observeRoleCapacity(prior);
 const capacityComparisons=observeCapacityComparisons(prior,roleCapacity);
 const mechanisms=result.reviews.map((q,i)=>{
  const m=observeMechanismReview(q,candidates[i],clarity.get(q.candidateId),climate,prior.completeHour);
  const joint=observeJointOutcome(q,m,compound.get(q.candidateId),prior.completeHour);
  const combinationRoles=observeCombinationRoles(q,combinationContext,prior);
  const branchAccess=observeBranchRouteAccess(q,branchContext);
  const roleConditions=observeRoleConditions(q,prior,roleCapacity,m,compound.get(q.candidateId),result.regulationStrength,combinationContext);
  const roleFlow=observeRouteFlow(q,prior,result.access,m,result.regulationStrength);
  return {...m,status:[joint,combinationRoles,branchAccess,roleConditions,roleFlow].some(x=>x.status==='invalid-evidence')?'invalid-evidence':m.status,joint,combinationRoles,branchAccess,roleConditions,roleFlow};
 });
 return {prior,climateResult:resolvedClimate,result:{...base,efficacyReview:{status:[combinationContext,branchContext,monthChange,roleCapacity,capacityComparisons,...candidates,...mechanisms].some(q=>q.status==='invalid-evidence')?'invalid-evidence':prior.completeHour?'diagnostic':'partial',
  candidates,mechanismReview:{version:'outcome-mechanism-hypothesis-v1',climate,combinationContext,branchContext,monthChange,roleCapacity,capacityComparisons,candidates:mechanisms,selectionAuthority:false,effective:null},effective:null,selectionAuthority:false}}};
}
