import {reviewEfficacyEdge} from './pattern-efficacy-review.mjs';
export const LAYER_REVIEW_VERSION='pattern-layer-mechanisms-v1';
const unique=xs=>[...new Set(xs)].sort();
const key=(a,b,k)=>JSON.stringify([a,b,k]);
const order=['year','month','day','hour'];
const roles=['principal','middle','residual'];
const slot=o=>o.position+':'+o.layer;
function index(xs,label){
 const m=new Map(xs.map(x=>[x.id,x]));
 if(m.size!==xs.length)throw Error('duplicate '+label);
 return m;
}
function branchContext(interaction,positions){
 const formations=interaction.formations.filter(f=>f.layer==='branch'&&f.positions.some(p=>positions.includes(p)))
  .map(f=>({id:f.id,type:f.type,positions:[...f.positions],complete:f.complete,sharedPositions:f.positions.filter(p=>positions.includes(p))}));
 const disruptions=interaction.disruptions.filter(d=>d.positions.some(p=>positions.includes(p)))
  .map(d=>({id:d.id,type:d.type,positions:[...d.positions],sharedPositions:d.positions.filter(p=>positions.includes(p))}));
 return {formations,disruptions,pairFormationIds:formations.filter(f=>positions.every(p=>f.positions.includes(p))).map(f=>f.id),
  pairDisruptionIds:disruptions.filter(d=>positions.every(p=>d.positions.includes(p))).map(d=>d.id)};
}
// Mechanism-specific evidence requirements. The structural classification
// never serves as an effectiveness verdict or as a replacement force screen.
export function reviewLayerMechanisms(result,access,interaction){
 const base={version:LAYER_REVIEW_VERSION,selectionAuthority:false,confirmedEffects:0};
 if(!result.relativeForce||!result.routeReview||access.status==='unavailable')return {...base,status:'unavailable',edges:[]};
 if(!interaction||!Array.isArray(interaction.formations)||!Array.isArray(interaction.disruptions))throw Error('missing interaction context');
 const complete=result.completeHour===true&&result.relativeForce.completeHour===true&&interaction.completeHour===true&&access.status!=='partial';
 const occurrences=index(result.routeReview.occurrences,'occurrence'),actors=index(access.actors,'access actor'),graph=index(result.relativeForce.edges,'force edge');
 const byPair=new Map(result.relativeForce.edges.map(e=>[key(e.from,e.to,e.kind),e]));
 if(byPair.size!==graph.size||access.edges.length!==graph.size||new Set(access.edges.map(e=>e.id)).size!==graph.size)throw Error('inconsistent access graph');
 const edges=access.edges.map(l=>{
  const e=graph.get(l.id),a=occurrences.get(l.from),b=occurrences.get(l.to);
  if(!e||!a||!b||e.from!==l.from||e.to!==l.to||e.kind!==l.kind||slot(a)===slot(b))throw Error('invalid layer binding: '+l.id);
  const aa=actors.get(a.id),bb=actors.get(b.id);
  if(!aa||!bb||aa.layer!==a.layer||bb.layer!==b.layer)throw Error('missing actor access');
  const hidden=[aa,bb].filter(x=>x.layer==='hidden');
  if(hidden.some(x=>!roles.includes(x.role)))throw Error('unknown hidden role');
  const expected=hidden.length===0?'visible-visible':hidden.length===2?'branch-branch':a.position===b.position?'same-pillar-stem-branch':'cross-pillar-stem-branch';
  if(expected!==l.layerKind)throw Error('invalid access layer');
  const legacy=reviewEfficacyEdge({from:e.from,to:e.to,kind:e.kind,edgeId:e.id,screen:e.screen},graph,complete);
  const context=branchContext(interaction,unique(hidden.map(x=>x.position)));
  const hiddenRoles=hidden.map(x=>({id:x.id,position:x.position,role:x.role,clashExposed:x.ownClashExposure,exactVisibleIds:[...x.exactVisibleIds]}));
  const sourcePool=a.layer==='visible'?[a.id]:aa.exactVisibleIds;
  const targetPool=b.layer==='visible'?[b.id]:bb.exactVisibleIds;
  const projectedAlternatives=hidden.length?sourcePool.flatMap(from=>targetPool.flatMap(to=>{
   if(from===to)return [];
   const alt=byPair.get(key(from,to,e.kind));
   if(!alt||occurrences.get(from)?.layer!=='visible'||occurrences.get(to)?.layer!=='visible')return [];
   return [{edgeId:alt.id,from,to,kind:alt.kind,legacyStatus:reviewEfficacyEdge({from,to,kind:alt.kind,edgeId:alt.id,screen:alt.screen},graph,complete).status,effective:null}];
  })):[];
  const unknown=[],concerns=[];
  if(!complete)unknown.push('missing-hour-or-partial-context');
  let mechanism,structuralStatus;
  if(expected==='visible-visible'){
   mechanism='direct-visible-relation';structuralStatus='visible-relation-observed';
   unknown.push(...legacy.unresolved);concerns.push(...legacy.reviewReasons);
  }else if(expected==='same-pillar-stem-branch'){
   const h=hidden[0];
   mechanism=h.role==='principal'?'vertical-principal-relation':'vertical-constituent-relation';
   structuralStatus=h.role==='principal'?'principal-vertical-observed':'constituent-vertical-observed';
   // The principal vertical relation is a literal local observation; the
   // branch constituent does not need a separate external root to exist.
   // No assertion about the efficacy of 生剋 or strength of a hidden actor.
   unknown.push('vertical-effect-unadjudicated');
   if(h.role!=='principal')unknown.push('constituent-participation-unadjudicated');
  }else if(expected==='branch-branch'){
   mechanism=hidden.every(x=>x.role==='principal')?'branch-principal-relation':'branch-constituent-relation';
   structuralStatus=context.pairFormationIds.length||context.pairDisruptionIds.length?'branch-relation-context-observed':'element-relation-only';
   unknown.push('branch-interaction-effect-unadjudicated');
   if(hidden.some(x=>x.role!=='principal'))unknown.push('constituent-participation-unadjudicated');
  }else{
   mechanism='cross-pillar-mixed-relation';structuralStatus=projectedAlternatives.length?'visible-alternative-observed':'cross-layer-element-relation-only';
   unknown.push('cross-layer-transfer-unadjudicated');
   if(!projectedAlternatives.length)unknown.push('no-exact-visible-alternative-observed');
  }
  // Preserve rather than delete the original graph blockers. They are
  // diagnostic context for mixed/branch edges, not identical requirements.
  if(hidden.length){
   if(context.formations.length)concerns.push('branch-formation-contact');
   if(context.disruptions.length)concerns.push('branch-disruption-contact');
   if(hidden.some(x=>x.ownClashExposure===true))concerns.push('hidden-own-branch-clash');
   if(hidden.some(x=>x.ownClashExposure===null))unknown.push('hidden-clash-context-unknown');
   if(e.sourceLocalControlNodes.length)concerns.push('source-local-rooted-control');
   if(l.span>1)concerns.push('nonadjacent-context');
   if(e.blockers.includes('participant-combination-or-group'))concerns.push('participant-combination-or-group');
   if(e.blockers.includes('root-clash-exposure'))concerns.push('root-clash-exposure');
  }
  return {id:e.id,from:e.from,to:e.to,kind:e.kind,layerKind:expected,mechanism,structuralStatus,hiddenRoles,
   branchContext:context,projectedAlternatives,legacyStatus:legacy.status,legacyUnresolved:[...legacy.unresolved],legacyReviewReasons:[...legacy.reviewReasons],
   unresolved:unique(unknown),reviewReasons:unique(concerns),status:unknown.length?'unresolved':concerns.length?'review-required':'necessary-screen-met',
   effective:null,selectionAuthority:false};
 });
 return {...base,status:complete?'research-review':'partial',edges};
}
// Evaluate an entire route with a single consistent projection assignment.
// Never compose individually available substitutions which use different
// visible counterparts for the same role or collapse two roles into one slot.
export function reviewCoherentProjection(witness,anchorRole,candidate,access,layerReview){
 const actorMap=index(access.actors,'projection actor'),edgeMap=index(layerReview.edges,'layer edge');
 const visibleEdges=new Map(layerReview.edges.filter(e=>e.layerKind==='visible-visible').map(e=>[key(e.from,e.to,e.kind),e]));
 const entries=Object.entries(witness.roles);
 if(!entries.some(([r])=>r===anchorRole))throw Error('missing anchor role');
 const original=new Set(entries.map(([,id])=>id));
 if(original.size!==entries.length)throw Error('duplicate witness actor');
 const anchorIds=new Set(candidate.visibleActorIds);
 let assignments=[{}];
 for(const [role,id] of entries){
  const actor=actorMap.get(id);
  if(!actor)throw Error('unbound projection role');
  const pool=(actor.layer==='visible'?[id]:actor.exactVisibleIds).filter(v=>role!==anchorRole||anchorIds.has(v));
  assignments=assignments.flatMap(a=>pool.filter(v=>!Object.values(a).includes(v)&&actorMap.get(v)?.layer==='visible').map(v=>({...a,[role]:v})));
 }
 const roleById=new Map(entries.map(([r,id])=>[id,r]));
 const bindings=witness.edges.map(e=>{
  const actual=edgeMap.get(e.edgeId);
  if(!actual||actual.from!==e.from||actual.to!==e.to||actual.kind!==e.kind||!original.has(e.from)||!original.has(e.to))throw Error('unbound witness projection edge');
  return actual;
 });
 const alternatives=assignments.flatMap(a=>{
  const edges=bindings.map(e=>visibleEdges.get(key(a[roleById.get(e.from)],a[roleById.get(e.to)],e.kind)));
  if(edges.some(e=>!e))return [];
  return [{roles:a,edgeIds:edges.map(e=>e.id),allScreensMet:edges.every(e=>e.status==='necessary-screen-met'),effective:null}];
 });
 return {originalWitnessId:witness.id,anchorRole,alternatives,observed:alternatives.length?true:layerReview.status==='partial'?null:false,effective:null};
}
export function summarizeLayerMechanisms(reviews){
 const edges=reviews.flatMap(r=>r.edges);
 const count=(xs,k)=>Object.fromEntries(unique(xs.map(x=>x[k])).map(v=>[v,xs.filter(x=>x[k]===v).length]));
 return {charts:reviews.length,partial:reviews.filter(r=>r.status==='partial').length,unavailable:reviews.filter(r=>r.status==='unavailable').length,
  edges:edges.length,mechanisms:count(edges,'mechanism'),structuralStatuses:count(edges,'structuralStatus'),byLayer:Object.fromEntries(unique(edges.map(e=>e.layerKind)).map(k=>{
   const xs=edges.filter(e=>e.layerKind===k);
   return [k,{edges:xs.length,legacy:count(xs,'legacyStatus'),layered:count(xs,'status'),withVisibleAlternative:xs.filter(e=>e.projectedAlternatives.length).length}];
  })),confirmedEffects:0,selectionAuthority:false};
}
