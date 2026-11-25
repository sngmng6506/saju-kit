// Separate month source, exact projection, root support and physical actor.
// No hidden constituent is promoted to a free visible stem.
export const ACCESS_REVIEW_VERSION='pattern-access-review-v1';
const unique=xs=>[...new Set(xs)].sort();
const order=['year','month','day','hour'];
const distance=(a,b)=>Math.abs(order.indexOf(a)-order.indexOf(b));
const exact=(a,b)=>a.stem===b.stem;
const slot=o=>o.position+':'+o.layer;
function indexOccurrences(occurrences){
 const byId=new Map(occurrences.map(o=>[o.id,o]));
 if(byId.size!==occurrences.length||occurrences.some(o=>!order.includes(o.position)||!['visible','hidden'].includes(o.layer)))throw Error('invalid access occurrence');
 return byId;
}
export function observeActorAccess(occurrences,completeHour){
 indexOccurrences(occurrences);
 const visible=occurrences.filter(o=>o.layer==='visible'),hidden=occurrences.filter(o=>o.layer==='hidden');
 return occurrences.map(o=>{
  const projected=o.layer==='hidden'?visible.filter(v=>!v.dayReference&&exact(v,o)):[];
  const sameElement=o.layer==='hidden'?visible.filter(v=>!v.dayReference&&v.element===o.element&&!exact(v,o)):[];
  const rootMatches=o.layer==='visible'?hidden.filter(h=>h.element===o.element).map(h=>({id:h.id,position:h.position,role:h.role??h.hiddenRole,match:exact(h,o)?'exact-stem':'same-element',clashExposed:h.clashExposed??null})):[];
  const kind=o.dayReference?'day-reference':o.layer==='visible'?'visible-actor':projected.length?'hidden-exact-projection-observed':completeHour?'hidden-unprojected':'hidden-projection-unresolved';
  return {id:o.id,position:o.position,layer:o.layer,kind,stem:o.stem,
   role:o.role??o.hiddenRole??null,graphSlot:slot(o),exactVisibleIds:projected.map(v=>v.id),
   sameElementVisibleIds:sameElement.map(v=>v.id),dayStemMatch:o.layer==='hidden'&&visible.some(v=>v.dayReference&&exact(v,o)),
   exactProjectionObserved:o.layer==='hidden'?(projected.length?true:completeHour?false:null):null,
   rootMatches,ownClashExposure:o.layer==='hidden'?o.clashExposed??null:null,
   commandConfirmed:null,independentHiddenAction:null,effective:null};
 });
}
export function bindCandidateAccess(candidate,occurrences,legacyAnchorIds,completeHour){
 const byId=indexOccurrences(occurrences),actors=occurrences.filter(o=>!o.dayReference),stems=new Set(candidate.stems);
 for(const id of legacyAnchorIds)if(!byId.has(id))throw Error('unknown legacy anchor: '+id);
 const month=actors.filter(o=>o.layer==='hidden'&&o.position==='month'&&stems.has(o.stem));
 const projected=actors.filter(o=>o.layer==='visible'&&stems.has(o.stem));
 let sourceIds=[],actorIds=[],contextIds=[],basis;
 if(candidate.kind==='month-principal'){
  if(month.length!==1||(month[0].role??month[0].hiddenRole)!=='principal')throw Error('invalid principal source: '+candidate.id);
  sourceIds=month.map(o=>o.id);actorIds=projected.map(o=>o.id);basis='month-principal';
 }else if(candidate.kind==='month-hidden-projection'){
  if(month.length!==1)throw Error('invalid projected month source: '+candidate.id);
  sourceIds=month.map(o=>o.id);
  actorIds=projected.filter(o=>candidate.positions.includes(o.position)).map(o=>o.id);
  if(actorIds.length!==candidate.positions.length)throw Error('unbound exact projection: '+candidate.id);
  basis='exact-month-projection';
 }else if(candidate.kind==='month-storage-projection'){
  if(month.length)throw Error('storage projection duplicates exact hidden stem: '+candidate.id);
  contextIds=actors.filter(o=>o.layer==='hidden'&&o.position==='month'&&o.element===candidate.element).map(o=>o.id);
  actorIds=projected.filter(o=>candidate.positions.includes(o.position)&&o.element===candidate.element).map(o=>o.id);
  if(actorIds.length!==candidate.positions.length)throw Error('unbound storage projection: '+candidate.id);
  basis='storage-element-hypothesis';
 }else if(candidate.kind==='month-formation'){
  contextIds=month.map(o=>o.id);basis='formation-context-only';
 }else if(candidate.kind==='month-peer-class'){
  contextIds=actors.filter(o=>o.layer==='hidden'&&o.position==='month').map(o=>o.id);basis='peer-class-context-only';
 }else throw Error('unknown candidate kind: '+candidate.kind);
 // A monthly hidden source is retained for the month-anchored structural
 // hypothesis, not declared a free actor. Other same-stem hidden copies
 // remain contextual roots, not alternate month anchors.
 const scoped=unique([...sourceIds,...actorIds]);
 const legacy=new Set(legacyAnchorIds);
 if(scoped.some(id=>!legacy.has(id)))throw Error('scope escaped legacy anchors: '+candidate.id);
 return {candidateId:candidate.id,family:candidate.family,basis,sourceIds,visibleActorIds:actorIds,contextIds,
  scopedAnchorIds:scoped,excludedLegacyIds:legacyAnchorIds.filter(id=>!scoped.includes(id)),
  visibleActorObserved:basis.endsWith('context-only')?null:actorIds.length?true:completeHour?false:null,commandConfirmed:null,selectionAuthority:false};
}
export function classifyAccessEdge(edge,byId,accessById,completeHour){
 const a=byId.get(edge.from),b=byId.get(edge.to);
 if(!a||!b||slot(a)===slot(b))throw Error('invalid access edge: '+edge.id);
 const x=accessById.get(a.id),y=accessById.get(b.id);
 const span=distance(a.position,b.position);
 const layerKind=a.layer==='visible'&&b.layer==='visible'?'visible-visible':
  a.layer==='hidden'&&b.layer==='hidden'?'branch-branch':
  span===0?'same-pillar-stem-branch':'cross-pillar-stem-branch';
 const bridge=(u,v)=>{
  if(u.layer!=='hidden')return [];
  // Exact projections are alternatives with their own visible occurrence;
  // do not rewrite this edge or assert that the projected stem acts.
  return accessById.get(u.id).exactVisibleIds.filter(id=>id!==v.id);
 };
 return {id:edge.id,from:a.id,to:b.id,kind:edge.kind,layerKind,span,
  projectedSourceAlternatives:bridge(a,b),projectedTargetAlternatives:bridge(b,a),
  sourceRole:x.role,targetRole:y.role,sourceClash:x.ownClashExposure,targetClash:y.ownClashExposure,
  accessStatus:!completeHour?'partial':layerKind==='visible-visible'?'visible-relation':layerKind==='same-pillar-stem-branch'?'vertical-context':
   layerKind==='branch-branch'?'branch-context':'cross-layer-context',effective:null};
}
export function reviewPatternAccess(result,outcome){
 const base={version:ACCESS_REVIEW_VERSION,selectionAuthority:false,selectedPattern:null};
 if(!result.selection||!result.routeReview||!result.relativeForce||outcome.status==='unavailable')return {...base,status:'unavailable',actors:[],edges:[],candidates:[]};
 const complete=result.completeHour===true&&result.relativeForce.completeHour===true;
 const occurrences=result.routeReview.occurrences,byId=indexOccurrences(occurrences);
 const actors=observeActorAccess(occurrences,complete),accessById=new Map(actors.map(o=>[o.id,o]));
 const candidates=result.selection.candidates.map(c=>{
  const old=outcome.candidates.find(o=>o.candidateId===c.id);
  if(!old)throw Error('missing legacy candidate: '+c.id);
  return bindCandidateAccess(c,occurrences,old.anchorIds,complete);
 });
 const edges=result.relativeForce.edges.map(e=>classifyAccessEdge(e,byId,accessById,complete));
 return {...base,status:complete?'research-review':'partial',actors,edges,candidates};
}
// Parallel scoped comparison only. Upstream candidate inventory and all
// legacy routes are left unchanged. This is not a destructive filter.
export function scopedOutcome(outcome,access){
 if(access.status==='unavailable')return outcome;
 return {status:outcome.status,scope:'anchor-ablation-role-contrasts-only',selectionAuthority:false,candidates:outcome.candidates.map(c=>{
  const a=access.candidates.find(x=>x.candidateId===c.candidateId);
  if(!a)throw Error('missing scoped candidate');
  return {candidateId:c.candidateId,family:c.family,anchorIds:[...a.scopedAnchorIds]};
 })};
}
export function summarizeAccess(reviews){
 const actors=reviews.flatMap(r=>r.actors),edges=reviews.flatMap(r=>r.edges),cs=reviews.flatMap(r=>r.candidates);
 const counts=(xs,key)=>Object.fromEntries(unique(xs.map(x=>x[key])).map(k=>[k,xs.filter(x=>x[key]===k).length]));
 return {charts:reviews.length,partial:reviews.filter(r=>r.status==='partial').length,unavailable:reviews.filter(r=>r.status==='unavailable').length,
  actors:counts(actors,'kind'),edgeLayers:counts(edges,'layerKind'),candidateBases:counts(cs,'basis'),
  candidates:cs.length,scopedAnchors:cs.reduce((n,c)=>n+c.scopedAnchorIds.length,0),
  excludedLegacyAnchors:cs.reduce((n,c)=>n+c.excludedLegacyIds.length,0),candidatesWithVisibleActors:cs.filter(c=>c.visibleActorIds.length).length,
  confirmedHiddenActions:0,selectionAuthority:false};
}
