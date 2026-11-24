import { SajuError } from '../../core/error.js';
import { analyzeUsefulElementReview } from '../useful-element-review-v1/index.js';
import { analyzeClimateUsefulElementV3 } from '../climate-useful-element-v3/index.js';
import { composeAuthorityReview } from '../useful-element-authority-v1/index.js';
export const USEFUL_ELEMENT_AUTHORITY_V2_VERSION='useful-element-authority-v2';
export function analyzeUsefulElementAuthorityV2(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new SajuError('useful-element-input','용신 분석 입력 객체가 필요합니다.');
 if(input.policy!==USEFUL_ELEMENT_AUTHORITY_V2_VERSION)throw new SajuError('useful-element-policy','용신 권한 검토 정책을 명시해야 합니다.');
 const args={saju:input.saju,birthBasis:input.birthBasis};
 const climate=analyzeClimateUsefulElementV3({...args,birth:input.birth,policy:'climate-useful-element-v3'});
 const legacy=analyzeUsefulElementReview({...args,policy:'useful-element-review-v1'});
 const result=composeAuthorityReview(legacy,climate,USEFUL_ELEMENT_AUTHORITY_V2_VERSION,'parallel-doctrine-review-v3');
 const temporal=new Map((climate.temporal?.conditions??[]).map(c=>[c.when,c]));
 // Conditional source alternatives never become unconditional anchors.
 const conditionalSourceAlternatives=(climate.evidence?.sourceProfile?.alternatives??[]).map(a=>({
  when:a.when,stems:[...a.stems],groups:a.groups?.map(g=>[...g])??null,
  evidence:a.evidence,calendarPredicate:temporal.get(a.when)??null,
  conditionResolved:false,selectionAuthority:false,confirmed:false
 }));
 return {...result,conditionalSourceAlternatives};
}
