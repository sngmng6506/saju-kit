import {elementRelation} from '../../core/elements.js';
const ORDER=['year','month','day','hour'];
const directed=(a,b,kind)=>{const r=elementRelation(a,b);return r.direction==='left-to-right'&&r.type===kind;};
const unique=xs=>[...new Set(xs)].sort();
// Group nodes are hypotheses over existing branch slots, never new stems or
// independent root supply. Hidden occurrences share their physical branch.
export function observeOutcomeAccess(prior,formation){
 const occurrences=prior.stemForce.occurrences;
 const hidden=occurrences.filter(o=>o.layer==='hidden').map(o=>{
  const projections=occurrences.filter(v=>v.layer==='visible'&&!v.dayReference&&v.stem===o.stem).map(v=>v.id);
  return {id:o.id,slot:'branch:'+o.position,position:o.position,stem:o.stem,element:o.element,tenGod:o.tenGod,
   role:o.hiddenRole,exactVisibleProjections:projections,
   accessBasis:projections.length?'exact-projection-observed':o.hiddenRole==='principal'?'local-principal':o.hiddenRole==='middle'?'local-middle':'local-residual',
   rootClashExposed:[...o.rootBasis.clashExposed],formationContacts:[...o.contacts],
   accessConfirmed:null,effective:null};
 });
 const groups=formation.formations.filter(f=>['complete-three','complete-seasonal'].includes(f.classification)&&f.flags.structurallyComplete&&f.target!==null).map(f=>({
  id:'group:'+f.id,formationId:f.id,kind:f.classification,element:f.target,members:[...f.members],positions:[...f.positions],
  slots:f.positions.map(p=>'branch:'+p),includesMonth:f.positions.includes('month'),
  alternativeOrOverlappingGroups:[],contextScreen:f.contextScreen,limitations:[...f.limitations],
  clashIds:f.clashOverlap.map(x=>x.id),competingContacts:f.competingOverlaps.map(x=>x.id),
  transformationConfirmed:null,effective:null
 }));
 for(const g of groups)g.alternativeOrOverlappingGroups=groups.filter(h=>h.id!==g.id&&h.positions.some(p=>g.positions.includes(p))).map(h=>h.id);
 const edges=[];
 for(const g of groups)for(const o of occurrences){
  // A branch aggregate may not act upon its own constituent as an
  // independent endpoint. A visible stem at that pillar is a different slot.
  if(o.layer==='hidden'&&g.positions.includes(o.position))continue;
  for(const [from,to] of [[g,o],[o,g]])for(const kind of ['generate','control'])if(directed(from.element,to.element,kind)){
   const distance=Math.min(...g.positions.map(p=>Math.abs(ORDER.indexOf(p)-ORDER.indexOf(o.position))));
   edges.push({id:from.id+'>'+to.id,from:from.id,to:to.id,kind,formationId:g.formationId,
    participantId:o.id,minimumPillarDistance:distance,sharedPillar:g.positions.includes(o.position),
    blockers:unique(['formation-transformation-unresolved',...g.limitations,...(o.layer==='hidden'?['hidden-access-unresolved']:[])]),
    effective:null});
  }
 }
 return {completeHour:prior.completeHour,hidden,groups,edges,effective:null,selectionAuthority:false};
}
