import { SajuError } from '../../core/error.js';
import { analyzeElementStructure } from '../../core/element-structure.js';
import { analyzeClimateUsefulElementV4,CLIMATE_V4_VERSION } from '../climate-useful-element-v4/index.js';
import { observeClimateRequirements } from './requirements.js';
import { observeTextualMotifs } from './motifs.js';
export const CLIMATE_V5_VERSION='climate-useful-element-v5';
export function analyzeClimateUsefulElementV5(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('climate-input','조후 분석 입력 객체가 필요합니다.');
 if(input.policy!==CLIMATE_V5_VERSION)throw new SajuError('climate-policy','조후 정책을 명시해야 합니다.');
 const prior=analyzeClimateUsefulElementV4({...input,policy:CLIMATE_V4_VERSION});
 const base={...prior,version:CLIMATE_V5_VERSION};
 if(prior.status==='unavailable')return {...base,requirementContext:null,textualMotifs:null};
 const structure=analyzeElementStructure({saju:input.saju});
 return {...base,requirementContext:observeClimateRequirements(prior.evidence.sourceProfile,structure),textualMotifs:observeTextualMotifs(structure)};
}
