import {observeArgumentReview} from '../../src/features/pattern/outcome-argument-review.js';
// Deterministic provenance replay against published upstream contracts.
// This is not an independent oracle for actual force or the raw natal graph.
export function summarizeArgumentReview(c,m,partial){
 const base={id:c.id,partial,effectConfirmed:null},errors=[],counts={actions:0,generation:0,control:0,excludedHiddenActions:0,structural:{supported:0,opposed:0,conflicting:0,unresolved:0},effectsUnresolved:0};
 const r=m?.argumentReview,s=m?.groundedSupply,p=m?.pressureDependencyReview,l=m?.localityContext,capacity=m?.roleCapacity;
 if(!r||r.status!==(partial?'partial':'diagnostic')||r.completeHour!==!partial||r.selectionAuthority!==false||r.effective!==null||
  !Array.isArray(capacity?.occurrences)||!Array.isArray(s?.actions)||!Array.isArray(r.actions)||!Array.isArray(r.judgments))return {...base,errors:['argument-review-contract']};
 const prior={completeHour:!partial,stemForce:{occurrences:capacity.occurrences.map(a=>({...a,graphNodeId:a.layer==='visible'?a.position+':stem':a.position+':branch:'+a.element}))},
  relativeForce:{edges:s.actions.map(e=>({id:e.edgeId,from:e.from,to:e.to,kind:e.kind}))}};
 const expected=observeArgumentReview(prior,s,p,l);
 if(expected.status==='invalid-evidence'||JSON.stringify(expected)!==JSON.stringify(r))errors.push('argument-review-replay');
 const judgments=new Map(r.judgments.map(j=>[j.id,j]));
 counts.excludedHiddenActions=r.excludedHiddenActionCount;
 for(const a of r.actions){
  counts.actions++;if(a.kind==='generate')counts.generation++;else if(a.kind==='control')counts.control++;else errors.push('argument-review-kind:'+a.edgeId);
  const q=judgments.get(a.structuralPropositionId),effect=judgments.get(a.effectPropositionId);
  if(!q||q.level!=='structural-hypothesis'||q.subject!==a.edgeId||!effect||effect.level!=='effect-hypothesis'||effect.subject!==a.edgeId||
   effect.state!=='unresolved'||effect.support.rank!==null||effect.opposition.rank!==null||effect.effective!==null||a.effective!==null){
   errors.push('argument-review-effect:'+a.edgeId);continue;
  }
  counts.structural[q.state]++;counts.effectsUnresolved++;
 }
 return {...base,counts,errors};
}
