import { SajuError } from '../../core/error.js';
import { evaluateClimateKernel } from './kernel.js';
import { CLIMATE_V4_VERSION } from './structural-review.js';
import { climateSourceRowV4,CLIMATE_V4_COVERAGE } from './source-v4.js';
import { observeSourceConditions } from './conditions.js';
import { observeClimateRequirements } from './requirements.js';
import { observeTextualMotifs } from './motifs.js';
export const CLIMATE_V5_VERSION='climate-useful-element-v5';
export function analyzeClimateUsefulElementV5(input){
 return evaluateClimateRequirements(input);
}
export function evaluateClimateRequirements(input,provider){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('climate-input','조후 분석 입력 객체가 필요합니다.');
 if(input.policy!==CLIMATE_V5_VERSION)throw new SajuError('climate-policy','조후 정책을 명시해야 합니다.');
 const prior=evaluateClimateKernel({...input,policy:CLIMATE_V4_VERSION},{version:CLIMATE_V4_VERSION,lookup:climateSourceRowV4,coverage:CLIMATE_V4_COVERAGE,observeConditions:observeSourceConditions},(result,structure)=>({...result,requirementContext:observeClimateRequirements(result.evidence.sourceProfile,structure),textualMotifs:observeTextualMotifs(structure)}),provider);
 const base={...prior,version:CLIMATE_V5_VERSION};
 if(prior.status==='unavailable')return {...base,requirementContext:null,textualMotifs:null};
 return base;
}
