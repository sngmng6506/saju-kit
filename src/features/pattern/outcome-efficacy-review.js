import {SajuError} from '../../core/error.js';
import {buildIntegratedOutcome,PATTERN_OUTCOME_INTEGRATED_VERSION} from './outcome-integrated.js';
import {createEffectContext,observeWitnessEfficacy} from './outcome-efficacy.js';
import {analyzeClimateUsefulElementV5,CLIMATE_V5_VERSION} from '../climate/requirement-review.js';
import {projectMechanismClimate,observeMechanismReview} from './outcome-mechanism.js';
import {observeJointOutcome} from './outcome-joint.js';
import {observeCombinationContext,observeCombinationRoles} from './outcome-combination-context.js';
export const PATTERN_OUTCOME_EFFICACY_VERSION='pattern-outcome-efficacy-v1';
export function analyzePatternOutcomeEfficacy(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('pattern-input','격국 분석 입력 객체가 필요합니다.');
 if(input.policy!==PATTERN_OUTCOME_EFFICACY_VERSION)throw new SajuError('pattern-policy','성패구응 분석 정책을 명시해야 합니다.');
 const {prior,result,climateResult,formation}=buildIntegratedOutcome({...input,policy:PATTERN_OUTCOME_INTEGRATED_VERSION});
 const base={...result,version:PATTERN_OUTCOME_EFFICACY_VERSION,scope:'ordinary-pattern-efficacy-evidence-screens'};
 if(!result.access)return {...base,efficacyReview:null};
 const context=createEffectContext(prior,result.access);
 const integrity=new Map(result.integrity.candidates.map(q=>[q.candidateId,q]));
 const compound=new Map(result.compoundReview.map(q=>[q.candidateId,q]));
 const candidates=result.reviews.map(q=>observeWitnessEfficacy(q,integrity.get(q.candidateId),compound.get(q.candidateId),context,prior.completeHour));
 const climate=projectMechanismClimate(climateResult??analyzeClimateUsefulElementV5({saju:input.saju,birthBasis:input.birthBasis,policy:CLIMATE_V5_VERSION}),prior.completeHour);
 const clarity=new Map(result.clarityReview.map(q=>[q.candidateId,q]));
 const combinationContext=observeCombinationContext(prior,formation);
 const mechanisms=result.reviews.map((q,i)=>{
  const m=observeMechanismReview(q,candidates[i],clarity.get(q.candidateId),climate,prior.completeHour);
  const joint=observeJointOutcome(q,m,compound.get(q.candidateId),prior.completeHour);
  const combinationRoles=observeCombinationRoles(q,combinationContext,prior);
  return {...m,status:[joint,combinationRoles].some(x=>x.status==='invalid-evidence')?'invalid-evidence':m.status,joint,combinationRoles};
 });
 return {...base,efficacyReview:{status:[combinationContext,...candidates,...mechanisms].some(q=>q.status==='invalid-evidence')?'invalid-evidence':prior.completeHour?'diagnostic':'partial',
  candidates,mechanismReview:{version:'outcome-mechanism-hypothesis-v1',climate,combinationContext,candidates:mechanisms,selectionAuthority:false,effective:null},effective:null,selectionAuthority:false}};
}
