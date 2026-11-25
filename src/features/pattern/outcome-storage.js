import {outcomeRules} from './outcome-rules.js';
import {reviewOutcomeGraph} from './outcome-graph.js';
// Existing storage hypothesis, not a new hidden occurrence or literal root.
export function reviewStorageOutcome(prior,review){
 if(review.status!=='out-of-scope')return review;
 const c=prior.selection.candidates.find(c=>c.id===review.candidateId);
 if(c?.kind!=='month-storage-projection'||!['officer','wealth','resource','food','killing','hurting-officer'].includes(c.family))return review;
 const record=prior.storageReview?.candidates.find(x=>x.id===c.id);
 if(!record)return review;
 const anchorIds=prior.routeReview.occurrences.filter(a=>a.layer==='visible'&&!a.dayReference&&record.stems.includes(a.stem)&&record.positions.includes(a.position)&&a.element===record.element).map(a=>a.id);
 if(!anchorIds.length)return review;
 const projection={candidateId:c.id,branch:record.storageBranch,element:record.element,visibleAnchorIds:anchorIds,
  literalMonthHidden:false,monthClash:prior.storageReview.monthClash,source:record.source,rootEffective:null,storageAccessConfirmed:null};
 const q=reviewOutcomeGraph(prior,c,outcomeRules(c.family),{storageAnchorIds:anchorIds});
 return {...q,anchorBasis:'conditional-month-storage-visible-projection',storageProjection:projection,
  rules:q.rules.map(r=>({...r,unresolvedConditions:[...r.unresolvedConditions,'storage-anchor-access','storage-family-validity']}))};
}
