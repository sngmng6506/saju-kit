import { evaluateUsefulElementTransit } from '../useful-element-transit-v1/index.js';
import { analyzeUsefulElementAuthorityV2,USEFUL_ELEMENT_AUTHORITY_V2_VERSION } from '../useful-element-authority-v2/index.js';
import { stemInfo } from '../../core/elements.js';
export const USEFUL_ELEMENT_TRANSIT_V2_VERSION='useful-element-transit-v2';
// Exact source stem arrivals and same-element alternatives are distinct.
// A matching arrival is not a confirmed supply or favorable effect.
export function observeConditionalArrivals(alternatives,layers){
 return alternatives.map(a=>({
  when:a.when,stems:[...a.stems],calendarPredicate:a.calendarPredicate,
  layers:layers.map(l=>{
   const arrivals=[{location:'stem',stem:l.stem.stem,element:l.stem.element},
    ...l.branch.hiddenStems.map(h=>({location:'hidden-stem',stem:h.stem,element:h.element,role:h.role}))];
   return {id:l.id,requirements:a.stems.map(stem=>{
    const element=stemInfo(stem).element;
    return {stem,element,exact:arrivals.filter(x=>x.stem===stem),sameElementOtherStem:arrivals.filter(x=>x.element===element&&x.stem!==stem)};
   })};
  }),conditionResolved:false,confirmed:false
 }));
}
export function analyzeUsefulElementTransitV2(input){
 const result=evaluateUsefulElementTransit(input,{version:USEFUL_ELEMENT_TRANSIT_V2_VERSION,
  authorityPolicy:USEFUL_ELEMENT_AUTHORITY_V2_VERSION,authorityAnalyzer:analyzeUsefulElementAuthorityV2});
 if(result.status!=='diagnostic')return result;
 return {...result,years:result.years.map(y=>({...y,conditionalSourceArrivals:observeConditionalArrivals(result.authority.conditionalSourceAlternatives,y.transit.layers)}))};
}
