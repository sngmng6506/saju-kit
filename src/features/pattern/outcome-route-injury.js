import {stemCombination} from '../../core/relations.js';
// Contacts are hypotheses attached to an exact route and assistant role.
// Never equate an observed control or combination with effective injury.
const ORDER=['year','month','day','hour'];
const key=(r,w)=>JSON.stringify([r,w]);
const sameEdge=(a,b)=>a.kind===b.kind&&(a.from===b.from&&a.to===b.to||a.kind==='combine'&&a.from===b.to&&a.to===b.from);
const ref=(r,w)=>({ruleId:r.id,witnessId:w.id});
export function observeRouteInjury(prior,access,review,compound,assistant,integrity){
 const base={candidateId:review.candidateId,completeHour:prior.completeHour,selectionAuthority:false,injuryConfirmed:null,clearedConfirmed:null};
 if(review.status==='out-of-scope')return {...base,status:'out-of-scope',contacts:[],groupContext:[]};
 if(integrity.status!=='consistent'||compound.violations.length||assistant.status==='invalid-evidence')return {...base,status:'invalid-evidence',contacts:[],groupContext:[]};
 const actors=prior.stemForce.occurrences,visible=actors.filter(o=>o.layer==='visible'),byId=new Map(actors.map(o=>[o.id,o]));
 const groups=new Map(access.groups.map(g=>[g.id,g]));
 const allEdges=[...prior.relativeForce.edges,...access.edges];
 const ws=new Map(review.rules.flatMap(r=>r.witnesses.map(w=>[key(r.id,w.id),{r,w}])));
 const contacts=[],groupContext=[],seen=new Set();
 for(const a of assistant.candidates)for(const role of a.roles){
  if(!['support','rescue'].includes(role.kind))continue;
  const row=ws.get(key(role.ruleId,role.witnessId));
  if(!row)continue;
  const {r,w}=row,id=a.occurrenceId,actor=byId.get(id),g=groups.get(id);
  const necessary=[...w.edges,...(w.anchorBindings??[]).flatMap(b=>b.edge?[b.edge]:[])];
  const route=ref(r,w);
  const add=(e,extra)=>{
   if(necessary.some(x=>sameEdge(x,e)))return;
   const k=JSON.stringify([route.ruleId,route.witnessId,id,e.kind,e.from,e.to]);
   if(seen.has(k))return;seen.add(k);
   contacts.push({route,routeKind:r.kind,assistantId:id,obstacleId:e.from===id?e.to:e.from,contact:e,
    role:role.role,routeParticipant:Object.values(w.roles).includes(e.from===id?e.to:e.from),...extra,injuryConfirmed:null,routeLost:null});
  };
  if(g){groupContext.push({route,assistantId:id,formationId:g.formationId,clashIds:[...g.clashIds],competingContacts:[...g.competingContacts],transformationConfirmed:null});}
  // Visible and aggregate controllers only; hidden access is not silently
  // promoted into a new active threat. Core blocker lists remain intact.
  for(const e of allEdges.filter(e=>e.kind==='control'&&e.to===id&&(byId.get(e.from)?.layer==='visible'||groups.has(e.from)))){
   add({from:e.from,to:e.to,kind:e.kind,edgeId:e.id,blockers:[...e.blockers],effective:null},{basis:'directed-control-contact',dayReferenceInvolved:e.from==='visible:day'});
  }
  if(actor?.layer==='visible')for(const other of visible){
   if(other.id===id||!stemCombination(other.stem,actor.stem))continue;
   const partners=o=>visible.filter(x=>x.id!==o.id&&stemCombination(x.stem,o.stem)).map(x=>x.id).sort();
   add({from:other.id,to:id,kind:'combine',edgeId:null,adjacent:Math.abs(ORDER.indexOf(other.position)-ORDER.indexOf(actor.position))===1,
    fromPartners:partners(other),toPartners:partners(actor),effective:null},{basis:'competing-or-external-combination-contact',dayReferenceInvolved:other.dayReference});
  }
 }
 return {...base,status:prior.completeHour?'diagnostic':'partial',contacts,groupContext,
  limitations:['contact-not-injury','intentional-route-edges-excluded','no-cancellation','hidden-controller-injury-not-expanded']};
}
