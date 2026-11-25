import { evaluateAuthorityPolicy, USEFUL_ELEMENT_AUTHORITY_VERSION } from './authority-pipeline.js';
export { USEFUL_ELEMENT_AUTHORITY_VERSION, composeAuthorityReview } from './authority-pipeline.js';
export function analyzeUsefulElementAuthority(input){
 return evaluateAuthorityPolicy(input,USEFUL_ELEMENT_AUTHORITY_VERSION);
}
