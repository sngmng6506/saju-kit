import { observeConditionalArrivals } from '../useful-element-transit-v2/index.js';
// Natal source conditions stay natal. A transit cannot retrospectively
// satisfy a birth-time condition or resolve a textual prescription.
export function observeSourceArrivals(sourceReview,transit){
 const candidates=sourceReview.candidates;
 const natal=new Map((sourceReview.climate.requirementContext?.requirements??[]).map(r=>[r.stem,r]));
 const arrivals=observeConditionalArrivals(candidates,transit.layers);
 return candidates.map((candidate,i)=>({
  candidateId:candidate.id,kind:candidate.kind,when:candidate.when,stems:[...candidate.stems],
  layers:arrivals[i].layers.map(l=>({...l,requirements:l.requirements.map(q=>{
   const r=natal.get(q.stem);
   if(!r)throw Error('missing natal source requirement');
   const pairs=transit.pairs.filter(p=>p.left===l.id);
   const rootContacts=r.roots.flatMap(root=>pairs.filter(p=>p.right===root.position&&p.branchSignals.length>0)
    .map(p=>({position:root.position,branch:root.branch,stem:root.stem,match:root.match,role:root.role,
      natalClashExposed:root.clashExposed,signals:p.branchSignals,effectsConfirmed:false})));
   const visibleCombinationContacts=pairs.filter(p=>r.exactVisible.includes(p.right)&&p.stemCombination!==null)
    .map(p=>({position:p.right,combination:p.stemCombination,transformationConfirmed:null}));
   return {...q,rootContacts,visibleCombinationContacts,effectiveSupply:null,effectsConfirmed:false};
  })})),
  conditionResolved:false,selectionAuthority:false,confirmed:false
 }));
}
