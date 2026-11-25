import { layerArrivals } from './arrivals.js';
import { stemInfo } from '../../core/elements.js';
export function observeConditionalArrivals(alternatives,layers){
 return alternatives.map(a=>({
  when:a.when,stems:[...a.stems],calendarPredicate:a.calendarPredicate,
  layers:layers.map(l=>{
   const arrivals=layerArrivals(l);
   return {id:l.id,requirements:a.stems.map(stem=>{
    const element=stemInfo(stem).element;
    return {stem,element,exact:arrivals.filter(x=>x.stem===stem),sameElementOtherStem:arrivals.filter(x=>x.element===element&&x.stem!==stem)};
   })};
  }),conditionResolved:false,confirmed:false
 }));
}
