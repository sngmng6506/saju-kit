import { evaluateAuthorityPolicy, USEFUL_ELEMENT_AUTHORITY_V4_VERSION } from './authority-pipeline.js';
export { USEFUL_ELEMENT_AUTHORITY_V4_VERSION, composeFiveMethodAuthority } from './authority-pipeline.js';
export function analyzeUsefulElementAuthorityV4(input){
 return evaluateAuthorityPolicy(input,USEFUL_ELEMENT_AUTHORITY_V4_VERSION);
}
