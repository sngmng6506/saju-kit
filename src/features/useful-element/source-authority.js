import { evaluateAuthorityPolicy, USEFUL_ELEMENT_AUTHORITY_V3_VERSION } from './authority-pipeline.js';
export { USEFUL_ELEMENT_AUTHORITY_V3_VERSION } from './authority-pipeline.js';
export function analyzeUsefulElementAuthorityV3(input){
 return evaluateAuthorityPolicy(input,USEFUL_ELEMENT_AUTHORITY_V3_VERSION);
}
