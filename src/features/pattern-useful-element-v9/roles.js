// Bind structural route participants to occurrence-level force evidence.
// Distinguish source/recipient on reverse-oriented legacy route links.
export function observePatternForce(prior,force){
 const byId=new Map(force.occurrences.map(o=>[o.id,o]));
 const require=id=>{const o=byId.get(id);if(!o)throw Error('unbound pattern force occurrence: '+id);return o;};
 const binding=id=>{const x=require(id);return {occurrenceId:id,rootEvidenceKind:x.rootEvidenceKind,
  rootBasis:x.rootBasis,diagnostics:x.diagnostics,monthStage:x.seasonal.monthStage,effectiveForce:null};};
 const routes=prior.routeReview.reviews.map(q=>({candidateId:q.candidateId,routes:q.routes.map(r=>({
  id:r.id,kind:r.kind,links:r.links.map(l=>{
   const reversed=['generated-by-anchor','controlled-by-anchor'].includes(l.kind),from=reversed?l.to:l.from,to=reversed?l.from:l.to;
   return {source:binding(from),target:binding(to),kind:l.kind,span:l.span,
    combinationId:l.combinationId,effectConfirmed:null};
  }),effective:null}))}));
 const paths=prior.roleReview.map(q=>({candidateId:q.candidateId,paths:q.paths.map(p=>({id:p.id,witnesses:p.witnesses.map(w=>({
  roles:Object.fromEntries(Object.entries(w.roles).map(([k,id])=>[k,binding(id)])),effective:null})),effective:null}))}));
 return {source:force.sources.quality,day:binding('visible:day'),routes,paths,
  roleBalanceConfirmed:null,forceConfirmed:null,selectionAuthority:false};
}
