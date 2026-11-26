import {elementRelation} from '../../core/elements.js';
import {observeGroundedSupply} from './outcome-grounded-supply.js';
import {reviewReplenishmentNetwork,REPLENISHMENT_VERSION} from './outcome-replenishment-network.js';
const key=(...xs)=>JSON.stringify(xs);
const same=(a,b)=>key(a)===key(b);
const order=['year','month','day','hour'];
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const eq=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
const distance=(a,b)=>Math.abs(order.indexOf(a)-order.indexOf(b));
// Native adapter: rooted local generation and peer contact are the only
// declared relay candidates; hidden constituents may seed but not receive.
export function reviewReplenishment(prior,root,supply){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:REPLENISHMENT_VERSION,completeHour:complete,selectionAuthority:false,effective:null,actualReplenishmentState:'unresolved'};
 const empty=reason=>({...base,status:'invalid-evidence',reason,nodes:[],links:[],targets:[],network:null,summary:null});
 if(typeof complete!=='boolean'||[root,supply].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  root.rootEffectConfirmed!==null||supply.effectiveSupply!==null)return empty('upstream');
 try{
  if(!same(observeGroundedSupply(prior,root),supply))return empty('supply-replay');
  const actors=index(prior.stemForce?.occurrences,a=>a.id),slots=index(root.slots,s=>s.id),donors=index(supply.nodes,n=>n.nodeId),occ=index(supply.occurrences,a=>a.id);
  if(!actors||!slots||!donors||!occ||!eq([...occ.keys()],[...actors.keys()]))return empty('inventory');
  const nodes=[];
  for(const n of donors.values()){
   const members=n.occurrenceIds.map(id=>actors.get(id)),rootIds=[...n.groundedRootIds,...n.contestedRootIds];
   if(!members.length||members.some(a=>!a||a.graphNodeId!==n.nodeId||a.position!==n.position||a.element!==n.element)||
    rootIds.some(id=>{const s=slots.get(id);return !s||s.element!==n.element||s.role==='residual'||s.effectiveRoot!==null||
     n.kind==='local-branch-constituents'&&!n.occurrenceIds.includes(id);})||new Set(rootIds).size!==rootIds.length)return empty('donor-binding');
   nodes.push({id:n.nodeId,element:n.element,position:n.position,kind:n.kind,rootIds,occurrenceIds:[...n.occurrenceIds],observationState:n.state});
  }
  const visible=[...actors.values()].filter(a=>a.layer==='visible'),links=[],targets=visible.map(a=>a.graphNodeId);
  for(const a of visible){
   const o=occ.get(a.id),receiver=donors.get(a.graphNodeId);
   if(!receiver||!o||!Array.isArray(a.peers)||!Array.isArray(o.paths))return empty('recipient');
   for(const p of o.paths){
    const n=donors.get(p.donor.nodeId),r=n&&elementRelation(n.element,a.element);
    if(!n||!same(n,p.donor)||p.id!==key(n.nodeId,a.id)||p.recipientId!==a.id||p.effectiveSupply!==null||
     p.graphEdge.from!==n.nodeId||p.graphEdge.to!==a.graphNodeId||r.type!=='generate'||r.direction!=='left-to-right'||distance(n.position,a.position)>1)return empty('generation-binding');
    links.push({id:key('generation-path',p.id),from:n.nodeId,to:a.graphNodeId,kind:'generate',sourcePathId:p.id,
     context:p.readiness,concerns:[...p.concerns],actualOperationState:'unresolved'});
   }
   const expected=[...donors.values()].filter(n=>n.element===a.element&&n.nodeId!==a.graphNodeId);
   if(!eq(a.peers.map(p=>p.id),expected.map(n=>n.nodeId)))return empty('peer-coverage');
   for(const p of a.peers){
    const n=donors.get(p.id);
    if(!n||n.element!==p.element||n.position!==p.position||!eq(n.contacts,p.contacts))return empty('peer-binding');
    if(distance(n.position,a.position)>1)continue;
    links.push({id:key('peer-path',n.nodeId,a.id),from:n.nodeId,to:a.graphNodeId,kind:'peer',sourcePathId:null,
     context:'peer-contact-review',concerns:[...new Set([...n.contacts,...a.contacts])],actualOperationState:'unresolved'});
   }
  }
  const network=reviewReplenishmentNetwork({completeHour:complete,nodes,links,targets});
  if(network.status!==status)return empty(network.reason??'network');
  return {...base,status,reason:null,nodes,links,targets,network,summary:{nodes:nodes.length,links:links.length,distinctRootSlots:new Set(nodes.flatMap(n=>n.rootIds)).size,
   pathAnalysisStatus:network.pathAnalysis.status,scenarioStatus:network.scenario?.status??'partial',actualEffectsConfirmed:0},
   limitations:['local-visible-recipient-relays-only','branch-donors-own-constituents-only','peer-contact-not-effective-assistance','no-quantity-or-capacity-allocation','no-strength-verdict']};
 }catch(e){return empty(e instanceof Error?e.message:'invalid-reference');}
}
