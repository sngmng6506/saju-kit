import { elementRelation } from './elements.js';
export const RELATIVE_FORCE_VERSION='relative-force-evidence-v1';
const ORDER=['year','month','day','hour'];
const slot=o=>o.position+':'+o.layer;
const unique=xs=>[...new Set(xs)].sort();
const overlap=(a,b)=>a.filter(x=>b.includes(x));
const supported=r=>r.type==='same'||r.type==='generate'&&r.direction==='left-to-right';
const observed=(xs,complete)=>xs.length?true:complete?false:null;
const distance=(a,b)=>Math.abs(ORDER.indexOf(a)-ORDER.indexOf(b));
const source='https://www.donglishuzhai.net/chapter/3725.html';
function profile(o,complete){
 const roots=o.roots.filter(r=>r.role!=='residual'&&!r.clashExposed);
 const exact=roots.filter(r=>r.match==='exact-stem');
 const rootedLocal=o.generationReceived.filter(e=>e.local&&e.sourceEvidence.unexposedSubstantialRootPositions.length&&e.sourceEvidence.contacts.length===0);
 const exposedLocal=o.controlReceived.filter(e=>e.local&&e.sourceEvidence.unexposedSubstantialRootPositions.length);
 const peerLocal=o.peers.filter(p=>distance(p.position,o.position)<=1&&p.unexposedSubstantialRootPositions.length&&p.contacts.length===0);
 const axes={exactSubstantial:observed(exact,complete),anySubstantial:observed(roots,complete),
  ownPillarSubstantial:observed(roots.filter(r=>r.position===o.position),complete),
  monthSubstantial:observed(roots.filter(r=>r.position==='month'),complete),
  principalSupport:supported(o.seasonal.principalRelation),seasonSupport:supported(o.seasonal.seasonRelation),
  localRootedGeneration:observed(rootedLocal,complete),localRootedPeer:observed(peerLocal,complete)};
 return {occurrenceId:o.id,axes,rootPositions:unique(roots.map(r=>r.position)),
  localGenerationNodes:unique(rootedLocal.map(e=>e.from)),localPeerNodes:unique(peerLocal.map(p=>p.id)),
  localControlNodes:unique(exposedLocal.map(e=>e.from)),contacts:[...o.contacts],
  rootClashExposed:[...o.rootBasis.clashExposed],effectiveForce:null};
}
// Boolean evidence partial order, not magnitude. No weighted sum,
// no duplicated root counts, no strength inference from the number of axes.
export function compareForceProfiles(a,b,{completeHour=true,comparable=true}={}){
 const keys=Object.keys(a.axes);
 const leftOnly=keys.filter(k=>a.axes[k]===true&&b.axes[k]===false);
 const rightOnly=keys.filter(k=>b.axes[k]===true&&a.axes[k]===false);
 const unknown=keys.filter(k=>a.axes[k]===null||b.axes[k]===null);
 const relation=!comparable?'not-comparable':!completeHour||unknown.length?'unresolved':
  leftOnly.length&&rightOnly.length?'mixed-evidence':leftOnly.length?'left-evidence-dominates':rightOnly.length?'right-evidence-dominates':'same-evidence-profile';
 return {relation,leftOnly,rightOnly,unknown,sharedRootPositions:overlap(a.rootPositions,b.rootPositions),
  sharedGenerationNodes:overlap(a.localGenerationNodes,b.localGenerationNodes),sharedPeerNodes:overlap(a.localPeerNodes,b.localPeerNodes),forceComparison:null};
}
export function observeRelativeForce(force){
 const complete=force.completeHour,byId=new Map(force.occurrences.map(o=>[o.id,o]));
 const profiles=Object.fromEntries(force.occurrences.map(o=>[o.id,profile(o,complete)]));
 const compare=(a,b)=>compareForceProfiles(profiles[a.id],profiles[b.id],{completeHour:complete,comparable:a.layer==='visible'&&b.layer==='visible'&&slot(a)!==slot(b)});
 const edges=[];
 for(const a of force.occurrences)for(const b of force.occurrences){
  if(slot(a)===slot(b))continue;
  const r=elementRelation(a.element,b.element);
  if(r.direction!=='left-to-right')continue;
  const ap=profiles[a.id],bp=profiles[b.id];
  const localPressure=ap.localControlNodes.filter(id=>id!==b.graphNodeId);
  const pathOptions=a.protectionAndMediation.filter(p=>localPressure.includes(p.threat)&&p.helper!==b.graphNodeId)
   .filter(p=>p.edges.every(e=>e.local)&&p.edges.some(e=>e.from===p.helper&&e.sourceEvidence.unexposedSubstantialRootPositions.length>0&&e.sourceEvidence.contacts.length===0));
  // A possible rescue never removes a controller from the pressure set.
  const blockers=[];
  if(!complete)blockers.push('missing-hour');
  if(a.layer!=='visible'||b.layer!=='visible')blockers.push('hidden-participant-access-unresolved');
  if(ap.contacts.length||bp.contacts.length)blockers.push('participant-combination-or-group');
  if(ap.rootClashExposed.length||bp.rootClashExposed.length)blockers.push('root-clash-exposure');
  if(localPressure.length)blockers.push('source-local-rooted-control');
  if(distance(a.position,b.position)>1)blockers.push('nonadjacent');
  if(ap.axes.anySubstantial!==true)blockers.push('source-substantial-root-not-established');
  if(bp.axes.anySubstantial!==true)blockers.push('target-substantial-root-not-established');
  const relative=compare(a,b);
  edges.push({id:a.id+'>'+b.id,from:a.id,to:b.id,kind:r.type,relative,
   sourceLocalControlNodes:localPressure,possibleLocalProtection:pathOptions.map(p=>({kind:p.kind,helper:p.helper,threat:p.threat})),
   blockers,screen:!complete?'unresolved':blockers.length?'requires-review':'root-and-locality-screen-met',effective:null});
 }
 const day=byId.get('visible:day');
 const food=force.occurrences.filter(o=>o.layer==='visible'&&!o.dayReference&&o.tenGod==='식신');
 const killing=force.occurrences.filter(o=>o.layer==='visible'&&!o.dayReference&&o.tenGod==='편관');
 const edgeBy=new Map(edges.map(e=>[e.id,e]));
 const triads=food.flatMap(f=>killing.map(k=>{
  const control=edgeBy.get(f.id+'>'+k.id),burden=edgeBy.get(k.id+'>'+day.id),drain=edgeBy.get(day.id+'>'+f.id);
  if(!control||!burden||!drain)return null;
  const dayRoot=profiles[day.id].axes.anySubstantial;
  const concerns=[];
  if(dayRoot!==true)concerns.push(dayRoot===null?'day-root-unknown':'day-substantial-root-not-observed');
  if(control.relative.relation==='right-evidence-dominates')concerns.push('killing-evidence-dominates-food');
  if(control.relative.relation==='left-evidence-dominates')concerns.push('food-evidence-dominates-killing');
  if(control.relative.relation==='mixed-evidence')concerns.push('food-killing-evidence-incomparable');
  if(control.blockers.length)concerns.push('food-control-requires-review');
  return {id:f.id+'>'+k.id+'>day',food:f.id,killing:k.id,day:day.id,
   controlEdge:control.id,dayPressureEdge:burden.id,dayOutputEdge:drain.id,dayRootEvidence:dayRoot,concerns,
   balanceConfirmed:null,effectiveControl:null,dayCapacityConfirmed:null};
 }).filter(Boolean));
 return {version:RELATIVE_FORCE_VERSION,source,completeHour:complete,profiles,edges,triads,selectionAuthority:false,confirmed:false};
}
