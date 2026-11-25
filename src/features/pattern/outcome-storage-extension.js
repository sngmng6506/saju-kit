import {reviewExtendedOutcome} from './outcome-extended.js';
import {reviewSecondaryOutcome} from './outcome-secondary.js';
import {reviewRegulation} from './outcome-regulation.js';

// V5 admits storage anchors after V2–V4 have already run. Replay only those
// missing stages for the admitted storage candidates, using the same evidence.
export function completeStorageStages(prior,access,review,strength){
 if(review.status==='out-of-scope'||!review.storageProjection)return review;
 const originalIds=new Set(review.rules.map(r=>r.id));
 const expanded=reviewRegulation(prior,reviewSecondaryOutcome(prior,access,reviewExtendedOutcome(prior,access,review)),strength);
 return {...expanded,rules:expanded.rules.map(r=>originalIds.has(r.id)?r:{...r,
  unresolvedConditions:[...new Set([...r.unresolvedConditions,'storage-anchor-access','storage-family-validity'])]})};
}
// Any subsequent stage adding a rule to a storage review must preserve the
// same unresolved anchor conditions. No change to ordinary candidates.
export function retainStorageConditions(review){
 if(!review.storageProjection)return review;
 return {...review,rules:review.rules.map(r=>({...r,unresolvedConditions:[...new Set([...r.unresolvedConditions,'storage-anchor-access','storage-family-validity'])]}))};
}
