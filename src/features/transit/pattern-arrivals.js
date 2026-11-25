import { layerArrivals } from './arrivals.js';
import { elementRelation } from '../../core/elements.js';
// Project natal roles once, then reference them across annual observations.
// An annual stem can contact the role without making it useful or harmful.
export function collectPatternRoles(pattern){
 const occurrences=pattern.routeReview?.occurrences??[];
 const byId=new Map(occurrences.map(o=>[o.id,o]));
 const roles=new Map();
 const add=(id,role)=>{
  if(!byId.has(id))throw Error('unknown pattern occurrence '+id);
  if(!roles.has(id))roles.set(id,[]);
  roles.get(id).push(role);
 };
 for(const q of pattern.qualityReview?.reviews??[]){
  const legacy=pattern.routeReview.reviews.find(x=>x.candidateId===q.candidateId);
  for(const id of legacy.anchorIds)add(id,{candidateId:q.candidateId,kind:'pattern-anchor'});
  for(const route of q.routes)for(const id of route.assistantIds)add(id,{candidateId:q.candidateId,routeId:route.routeId,kind:'structural-assistant'});
 }
 return occurrences.filter(o=>roles.has(o.id)).map(o=>({occurrenceId:o.id,position:o.position,layer:o.layer,stem:o.stem,element:o.element,
  rootPositions:[...new Set(o.layer==='visible'?o.roots.map(r=>r.position):[o.position])],roles:roles.get(o.id),confirmed:false}));
}
export function observePatternTransit(roles,transit){
 return roles.map(role=>({occurrenceId:role.occurrenceId,layers:transit.layers.map(l=>{
  const arrivals=layerArrivals(l);
  const contacts=transit.pairs.filter(p=>p.left===l.id);
  return {id:l.id,arrivals:arrivals.map(a=>({...a,exact:a.stem===role.stem,sameElementOtherStem:a.element===role.element&&a.stem!==role.stem,
    relation:elementRelation(a.element,role.element)})),
   rootContacts:contacts.filter(p=>role.rootPositions.includes(p.right)&&p.branchSignals.length).map(p=>({position:p.right,signals:p.branchSignals,effectsConfirmed:false})),
   stemCombinationContacts:role.layer==='visible'?contacts.filter(p=>p.right===role.position&&p.stemCombination).map(p=>({position:p.right,combination:p.stemCombination,effectsConfirmed:false})):[],
   effectiveForce:null,favorable:null,unfavorable:null};
 }),confirmed:false}));
}
