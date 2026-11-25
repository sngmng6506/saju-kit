import { evaluateAuthorityPolicy, USEFUL_ELEMENT_AUTHORITY_V2_VERSION } from './authority-pipeline.js';
export { USEFUL_ELEMENT_AUTHORITY_V2_VERSION } from './authority-pipeline.js';
export function analyzeUsefulElementAuthorityV2(input){
 return evaluateAuthorityPolicy(input,USEFUL_ELEMENT_AUTHORITY_V2_VERSION);
}
