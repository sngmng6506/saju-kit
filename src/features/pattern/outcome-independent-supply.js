import {evaluateArguments} from './outcome-argumentation.js';
// Project an origin-bound indirect supply proof using the existing exact
// retention/access/operation variables. The recipient cannot seed or
// relay its own incoming supply. Other actors may share physical roots:
// this is source independence, not independent quantity or capacity.
const key=(...xs)=>JSON.stringify(xs);
const lit=propositionId=>({propositionId,sign:'for'});
const same=(a,b)=>key(a)===key(b);
export function compileIndependentSupply({packet,nodes,targetId}={}){
 const fail=reason=>({status:'invalid-evidence',reason});
 if(!Array.isArray(nodes)||!Array.isArray(packet?.rules)||!Array.isArray(packet?.propositions)||!Array.isArray(packet?.evidence)||packet.evidence.length||nodes.some(n=>!n||typeof n.id!=='string'||!n.id))return fail('inventory');
 const baseline=evaluateArguments(packet);
 if(!['diagnostic','partial'].includes(baseline.status))return fail('packet-contract');
 const ns=new Map(nodes.map(n=>[n.id,n])),ps=new Map(packet.propositions.map(p=>[p.id,p]));
 if(ns.size!==nodes.length||!ns.has(targetId)||nodes.some(n=>!Array.isArray(n.rootIds)||new Set(n.rootIds).size!==n.rootIds.length))return fail('nodes');
 const basis=id=>key('replenishment-basis',id),local=id=>key('independent-supply-basis',targetId,id);
 const propositions=nodes.map(n=>({id:local(n.id),subject:n.id,kind:'recipient-excluded-root-seeded-basis',level:'structural-hypothesis'}));
 const rules=[],seedIds=[],linkIds=[],seenSeeds=new Set(),basisIds=new Set(nodes.map(n=>basis(n.id)));
 if(nodes.some(n=>ps.get(basis(n.id))?.level!=='structural-hypothesis'))return fail('basis-inventory');
 const append=(r,out,premises)=>rules.push({id:key('independent-supply-rule',targetId,r.id),policyId:'p3-independent-supply-v1',conclusion:lit(out),premises,refs:[{owner:'replenishment-proof',id:r.id,field:'exact-origin-excluded-projection'}],applicability:'complete-only'});
 for(const r of packet.rules){
  if(!r.id.startsWith('["root-seed",')&&!r.id.startsWith('["supply-link",')){if(basisIds.has(r.conclusion.propositionId))return fail('unexpected-supply-rule');continue;}
  let ids;try{ids=JSON.parse(r.id)}catch{return fail('rule-id')}
  if(!Array.isArray(ids)||r.policyId!=='p3-replenishment-network-v1'||r.conclusion?.sign!=='for'||r.applicability!=='complete-only'||r.undercutWhen?.length)return fail('rule-contract');
  if(ids[0]==='root-seed'){
   const [,node,slot]=ids;
   if(ids.length!==3||r.id!==key('root-seed',node,slot)||!ns.get(node)?.rootIds.includes(slot)||!same(r.conclusion,lit(basis(node)))||!same(r.premises,[lit(key('slot-retained',slot)),lit(key('root-access',node,slot))])||r.premises.some(p=>ps.get(p.propositionId)?.level!=='observation')||seenSeeds.has(r.id))return fail('seed-binding');
   seenSeeds.add(r.id);
   if(node!==targetId){append(r,local(node),r.premises);seedIds.push({nodeId:node,slotId:slot,sharedWithRecipient:ns.get(targetId).rootIds.includes(slot)});}
  }else{
   const from=nodes.find(n=>basis(n.id)===r.premises?.[0]?.propositionId),to=nodes.find(n=>basis(n.id)===r.conclusion.propositionId);
   if(ids.length!==2||r.id!==key('supply-link',ids[1])||!from||!to||from.id===to.id||!same(r.premises,[lit(basis(from.id)),lit(key('supply-operation',ids[1]))])||ps.get(r.premises[1].propositionId)?.level!=='observation')return fail('link-binding');
   if(from.id!==targetId){append(r,local(to.id),[lit(local(from.id)),r.premises[1]]);linkIds.push(ids[1]);}
  }
 }
 if(seenSeeds.size!==nodes.reduce((n,x)=>n+x.rootIds.length,0)||nodes.some(n=>n.rootIds.some(s=>!seenSeeds.has(key('root-seed',n.id,s)))))return fail('seed-coverage');
 return {status:'diagnostic',propositions,rules,propositionId:local(targetId),seedIds,linkIds,selectionAuthority:false,effective:null,actualReplenishmentState:'unresolved'};
}
