import {elementRelation} from '../../core/elements.js';
import {compareReplenishmentBurden,BURDEN_COMPARISON_VERSION} from './outcome-burden-comparison.js';
const key=(...xs)=>JSON.stringify(xs);
const same=(a,b)=>key(a)===key(b);
const order=['year','month','day','hour'];
// Project precisely local directed relations incident on visible stems.
// Physical actions are deduplicated across their incoming/outgoing views.
export function reviewBurden(prior,replenishment){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:BURDEN_COMPARISON_VERSION,completeHour:complete,selectionAuthority:false,effective:null,actualMagnitudeComparison:'unresolved'};
 const empty=reason=>({...base,status:'invalid-evidence',reason,summary:null});
 if(typeof complete!=='boolean'||replenishment?.status!==status||replenishment.completeHour!==complete||replenishment.selectionAuthority!==false||replenishment.effective!==null||replenishment.actualReplenishmentState!=='unresolved')return empty('upstream');
 try{
  const {nodes,links,targets,network}=replenishment;
  const ns=new Map(nodes.map(n=>[n.id,n])),ts=new Set(targets),actors=prior.stemForce.occurrences.filter(a=>a.layer==='visible');
  if(ns.size!==nodes.length||ts.size!==targets.length||!same([...ts].sort(),actors.map(a=>a.graphNodeId).sort()))return empty('inventory');
  const actions=new Map();
  for(const a of actors){
   const n=ns.get(a.graphNodeId);
   if(!n||n.element!==a.element||n.position!==a.position||n.kind!=='visible-stem')return empty('actor-binding');
   const expected=nodes.filter(b=>b.id!==n.id&&Math.abs(order.indexOf(b.position)-order.indexOf(n.position))<=1);
   const groups=[
    {edges:a.controlReceived,kind:'control',incoming:true},
    {edges:a.outputAndControl,kind:null,incoming:false},
    {edges:a.generationReceived,kind:'generate',incoming:true}
   ];
   for(const {edges,kind,incoming} of groups){
    if(!Array.isArray(edges))return empty('edge-inventory');
    const literal=expected.flatMap(b=>{
     const r=incoming?elementRelation(b.element,n.element):elementRelation(n.element,b.element);
     return r.direction==='left-to-right'&&['generate','control'].includes(r.type)&&(!kind||r.type===kind)?[key(r.type,incoming?b.id:n.id,incoming?n.id:b.id)]:[];
    }).sort();
    const local=edges.filter(e=>e.local);
    if(!same(literal,local.map(e=>key(e.type,e.from,e.to)).sort()))return empty('edge-coverage');
    for(const e of local){
     const from=ns.get(e.from),to=ns.get(e.to);
     if(!from||!to||e.effectConfirmed!==null||e.sourceEvidence?.id!==from.id||e.targetEvidence?.id!==to.id)return empty('edge-binding');
     const id=key(e.type,e.from,e.to);
     actions.set(id,{id,kind:e.type,from:e.from,to:e.to,actualOperationState:'unresolved'});
    }
   }
  }
  const analysis=compareReplenishmentBurden({completeHour:complete,nodes,links,targets,actions:[...actions.values()],replenishmentPacket:network.packet});
  if(analysis.status!==status)return empty(analysis.reason);
  return {...base,status,reason:null,analysis,summary:analysis.summary,limitations:['local-visible-incident-actions','hidden-recipients-not-relays','not-a-strength-comparison']};
 }catch(e){return empty(e instanceof Error?e.message:'invalid-reference');}
}
