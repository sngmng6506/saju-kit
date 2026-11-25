import { SajuError } from '../../core/error.js';
import { createMethodEvidence } from '../method-evidence.js';
import { evaluateMethodReview } from './review.js';
import { compareMethodEvidence } from './method-comparison.js';
import { collectAuthorityReview } from './anchor-relations.js';
import { evaluateClimateExpanded, CLIMATE_V2_VERSION } from '../climate/expanded.js';
import { evaluateClimateTemporal, CLIMATE_V3_VERSION } from '../climate/review.js';
import { evaluateClimateRequirements, CLIMATE_V5_VERSION } from '../climate/requirement-review.js';
import { analyzePatternUsefulElementV3, PATTERN_V3_VERSION } from '../pattern-useful-element-v3/index.js';
import { projectSourceCandidates } from './source-candidates.js';
import { compareFiveMethods } from './five-method-matrix.js';

export const USEFUL_ELEMENT_AUTHORITY_VERSION='useful-element-authority-v1';
export const USEFUL_ELEMENT_AUTHORITY_V2_VERSION='useful-element-authority-v2';
export const USEFUL_ELEMENT_AUTHORITY_V3_VERSION='useful-element-authority-v3';
export const USEFUL_ELEMENT_AUTHORITY_V4_VERSION='useful-element-authority-v4';

// Retained research composition contract; callers may compose existing
// evidence but public analysis always computes its own fixed policy evidence.
export function composeAuthorityReview(legacy,climate,version,reviewVersion){
 const methods={...legacy.methods,climate};
 const review={...legacy,version:reviewVersion,methods,
  comparisons:compareMethodEvidence(methods.balance,climate,methods.mediation,methods.remedy)};
 return {version,assessment:'conditional-authority-and-anchor-relations-only',
  review,authority:collectAuthorityReview(review),usefulElement:null,favorableElements:null,unfavorableElements:null,confirmed:false};
}

function fromReview(review,version){
 return {version,assessment:'conditional-authority-and-anchor-relations-only',
  review,authority:collectAuthorityReview(review),usefulElement:null,favorableElements:null,unfavorableElements:null,confirmed:false};
}

function attachTemporal(result,climate){
 const temporal=new Map((climate.temporal?.conditions??[]).map(c=>[c.when,c]));
 // Conditional source alternatives never become unconditional anchors.
 const conditionalSourceAlternatives=(climate.evidence?.sourceProfile?.alternatives??[]).map(a=>({
  when:a.when,stems:[...a.stems],groups:a.groups?.map(g=>[...g])??null,
  evidence:a.evidence,calendarPredicate:temporal.get(a.when)??null,
  conditionResolved:false,selectionAuthority:false,confirmed:false
 }));
 return {...result,conditionalSourceAlternatives};
}

export function composeFiveMethodAuthority(prior,pattern){
 return {...prior,version:USEFUL_ELEMENT_AUTHORITY_V4_VERSION,patternReview:pattern,
  fiveMethodReview:compareFiveMethods(prior,pattern)};
}

// One request scope. The v2 anchor namespace remains fixed for v3/v4.
// Do not compute a legacy climate projection that would be discarded.
export function evaluateAuthorityPolicy(input,version){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('useful-element-input','용신 분석 입력 객체가 필요합니다.');
 if(input.policy!==version)throw new SajuError('useful-element-policy','용신 권한 검토 정책을 명시해야 합니다.');
 const provider=createMethodEvidence(),args={saju:input.saju,birthBasis:input.birthBasis};
 const reviewInput={...args,policy:'useful-element-review-v1'};
 if(version===USEFUL_ELEMENT_AUTHORITY_VERSION){
  const review=evaluateMethodReview(reviewInput,provider,()=>evaluateClimateExpanded({...args,policy:CLIMATE_V2_VERSION},provider));
  return fromReview({...review,version:'parallel-doctrine-review-v2'},version);
 }
 const climate=evaluateClimateTemporal({...args,birth:input.birth,policy:CLIMATE_V3_VERSION},provider);
 const review=evaluateMethodReview(reviewInput,provider,()=>climate);
 const anchor=attachTemporal(fromReview({...review,version:'parallel-doctrine-review-v3'},USEFUL_ELEMENT_AUTHORITY_V2_VERSION),climate);
 if(version===USEFUL_ELEMENT_AUTHORITY_V2_VERSION)return anchor;
 const expanded=evaluateClimateRequirements({...input,policy:CLIMATE_V5_VERSION},provider);
 const prior={...anchor,version:USEFUL_ELEMENT_AUTHORITY_V3_VERSION,anchorBasis:USEFUL_ELEMENT_AUTHORITY_V2_VERSION,
  sourceReview:{climate:expanded,candidates:projectSourceCandidates(expanded),selectionAuthority:false,confirmed:false}};
 if(version===USEFUL_ELEMENT_AUTHORITY_V3_VERSION)return prior;
 const pattern=analyzePatternUsefulElementV3({...input,policy:PATTERN_V3_VERSION});
 return composeFiveMethodAuthority(prior,pattern);
}
