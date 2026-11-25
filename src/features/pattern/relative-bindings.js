// Use actual directed relations in the new role review. Legacy reverse
// route link orientation has already been normalized in pattern v9.
export function bindRelativePattern(prior,relative){
 const edges=new Map(relative.edges.map(e=>[e.id,e]));
 const ref=(from,to,kind)=>{
  if(kind==='combine')return {from,to,kind,edgeId:null,screen:'combination-effect-unresolved',effective:null};
  const e=edges.get(from+'>'+to);
  if(!e)return {from,to,kind,edgeId:null,screen:'physical-slot-or-relation-unresolved',effective:null};
  return {from,to,kind,edgeId:e.id,screen:e.screen,effective:null};
 };
 const routes=prior.patternForce.routes.map(q=>({candidateId:q.candidateId,routes:q.routes.map(r=>({id:r.id,kind:r.kind,links:r.links.map(l=>ref(l.source.occurrenceId,l.target.occurrenceId,l.kind)),effective:null}))}));
 const paths=prior.roleReview.map(q=>({candidateId:q.candidateId,paths:q.paths.map(p=>({id:p.id,witnesses:p.witnesses.map(w=>({roles:{...w.roles},edges:w.edges.map(e=>ref(e.from,e.to,e.kind)),effective:null})),unresolvedConditions:[...p.unresolvedConditions],effective:null}))}));
 return {routes,paths,triadIds:relative.triads.map(t=>t.id),effective:null,selectionAuthority:false};
}
