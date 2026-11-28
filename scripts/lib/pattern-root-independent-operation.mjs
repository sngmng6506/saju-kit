import {auditRootSeedSensitivity} from './pattern-root-seed-sensitivity.mjs';
import {evaluateArguments} from '../../src/features/pattern/outcome-argumentation.js';
const key=(...xs)=>JSON.stringify(xs),same=(a,b)=>key(a)===key(b),lit=propositionId=>({propositionId,sign:'for'});
const VERSION='p3-root-independent-operation-v1';
const basis=id=>key('replenishment-basis',id),op=id=>key('supply-operation',id);
const base={version:VERSION,selectionAuthority:false,effective:null,actualOperationState:'unresolved',actualReplenishmentState:'unresolved',actualStrengthState:'unresolved'};
// Research-only comparison. An explicit edge-specific operation
// hypothesis may support action without a rooted source. A separate
// transfer hypothesis is required to introduce a received supply basis.
// No hidden source, new physical root, nonlocal relay, or strength rule.
export function auditRootIndependentOperation(input,{includeProofPacket=false}={}){
 const empty=(status,reason)=>({...base,status,reason,actions:[],transfers:[],targets:[],summary:null});
 const rootAudit=auditRootSeedSensitivity(input);
 if(rootAudit.status!=='diagnostic')return empty(rootAudit.status,rootAudit.reason);
 try{
  const {nodes,links,targets,burden}=input,packet=burden.packet,ns=new Map(nodes.map(n=>[n.id,n])),visible=new Set(targets);
  const baseline=evaluateArguments(packet);
  if(baseline.status!=='diagnostic'||packet.evidence.length)return empty('invalid-evidence','baseline');
  const propositions=[...packet.propositions],rules=[...packet.rules],ids=new Set(propositions.map(p=>p.id));
  const add=(id,subject,kind,level)=>{
   if(ids.has(id))throw Error('duplicate-proposition');
   ids.add(id);propositions.push({id,subject,kind,level});return id;
  };
  const rule=(id,out,premises)=>rules.push({id,policyId:VERSION,conclusion:lit(out),premises:premises.map(lit),refs:[{owner:'root-independent-operation',id,field:'hypothetical-only'}],applicability:'complete-only'});
  const projection=n=>key('received-basis',n);
  const actions=[],transfers=[];
  for(const n of nodes){
   add(projection(n.id),n.id,'hypothetical-rooted-or-received-basis','structural-hypothesis');
   rule(key('baseline-basis',n.id),projection(n.id),[basis(n.id)]);
  }
  for(const a of burden.actionRows){
   const id=add(key('alternative-action',a.id),a.id,'conditional-action-basis','structural-hypothesis');
   rule(key('rooted-action-alternative',a.id),id,[a.propositionId]);
   let guard=null;
   if(visible.has(a.from)){
    guard=add(key('root-independent-action-ability',a.id),a.id,'hypothetical-exact-action-without-rooted-basis','observation');
    rule(key('independent-action-alternative',a.id),id,[a.operationVariableId,guard]);
   }
   actions.push({actionId:a.id,kind:a.kind,from:a.from,to:a.to,operationVariableId:a.operationVariableId,rootedPropositionId:a.propositionId,alternativePropositionId:id,independentGuard:guard,sourceLiteralRootCount:rootAudit.seeds.filter(s=>s.nodeId===a.from).length,actualOperationState:'unresolved'});
  }
  const byId=new Map(actions.map(a=>[a.actionId,a]));
  for(const l of links){
   const operation=op(l.id);
   if(!ids.has(operation))return empty('invalid-evidence','link-operation');
   rule(key('received-relay',l.id),projection(l.to),[projection(l.from),operation]);
   if(!visible.has(l.from))continue;
   const a=byId.get(key(l.kind,l.from,l.to));
   if(l.kind==='generate'&&(!a||a.operationVariableId!==operation))return empty('invalid-evidence','action-link-binding');
   const ability=a?.independentGuard??add(key('root-independent-peer-ability',l.id),l.id,'hypothetical-exact-peer-action-without-rooted-basis','observation');
   const transfer=add(key('root-independent-transfer',l.id),l.id,'hypothetical-received-supply-from-exact-action','observation');
   const direct=add(key('root-independent-transfer-basis',l.id),l.id,'hypothetical-exact-received-basis','structural-hypothesis');
   rule(key('independent-transfer-rule',l.id),direct,[operation,ability,transfer]);
   rule(key('independent-transfer-reception',l.id),projection(l.to),[direct]);
   transfers.push({linkId:l.id,from:l.from,to:l.to,kind:l.kind,ability,transfer,operationVariableId:operation,propositionId:direct,actualTransferState:'unresolved'});
  }
  const combined={...packet,propositions,rules},replay=evaluateArguments(combined);
  if(replay.status!==baseline.status||!same(replay.judgments.slice(0,baseline.judgments.length),baseline.judgments)||!same(replay.ruleResults.slice(0,baseline.ruleResults.length),baseline.ruleResults))return empty('invalid-evidence','proof-parity');
  const originalObs=new Set(packet.propositions.filter(p=>p.level==='observation').map(p=>p.id)),obs=propositions.filter(p=>p.level==='observation').map(p=>p.id);
  const roots=new Set([...originalObs].filter(id=>id.startsWith('["slot-retained",')||id.startsWith('["root-access",')));
  const ability=new Set([...actions.map(a=>a.independentGuard).filter(Boolean),...transfers.map(t=>t.ability)]),transfer=new Set(transfers.map(t=>t.transfer));
  const run=truth=>{
   const evidence=obs.map((id,i)=>({id:key('independent-operation-scenario',i),propositionId:id,sign:truth.has(id)?'for':'against',refs:[{owner:'independent-operation-scenario',id,field:'hypothetical'}],applicability:'complete-only'}));
   const r=evaluateArguments({...combined,evidence});
   if(r.status!=='diagnostic')throw Error('scenario-replay');
   return new Map(r.judgments.map(j=>[j.id,j.state==='supported']));
  };
  const on=run(new Set(obs)),local=run(originalObs),actionOnly=run(new Set([...originalObs,...ability]));
  const noRoots=new Set(obs.filter(id=>!roots.has(id))),nr=run(noRoots),nrActionOnly=run(new Set([...noRoots].filter(id=>!transfer.has(id))));
  // Independent graph closure of the no-root experiment; every initial
  // recipient must have an explicit transfer, never a self-seeding cycle.
  const reached=new Set(transfers.map(t=>t.to));let change=true;
  while(change){change=false;for(const l of links)if(reached.has(l.from)&&!reached.has(l.to)){reached.add(l.to);change=true;}}
  for(const n of nodes){
   if(local.get(basis(n.id))!==local.get(projection(n.id))||local.get(projection(n.id))!==actionOnly.get(projection(n.id))||
    local.get(basis(n.id))&&!on.get(projection(n.id))||nr.get(basis(n.id))||nrActionOnly.get(projection(n.id))||nr.get(projection(n.id))!==reached.has(n.id))return empty('invalid-evidence','supply-parity');
  }
  for(const a of actions){
   a.rootedPossible=local.get(a.rootedPropositionId);
   a.alternativePossible=on.get(a.alternativePropositionId);
   a.noRootActionPossible=nrActionOnly.get(a.alternativePropositionId);
   if(a.rootedPossible!==local.get(a.alternativePropositionId)||a.noRootActionPossible!==!!a.independentGuard||a.rootedPossible&&!a.alternativePossible)return empty('invalid-evidence','action-parity');
   a.noRootWitness=a.independentGuard?[a.operationVariableId,a.independentGuard]:null;
   if(a.noRootWitness){const j=run(new Set(a.noRootWitness));if(!j.get(a.alternativePropositionId)||j.get(a.rootedPropositionId)||nodes.some(n=>j.get(projection(n.id))))return empty('invalid-evidence','action-witness');}
  }
  // An exact transfer is not derivable from either action ability or
  // network reachability alone. Replay every premise removal separately.
  for(const t of transfers){
   const assumptions=[t.operationVariableId,t.ability,t.transfer];
   if(new Set(assumptions).size!==3||assumptions.some(id=>roots.has(id))||!run(new Set(assumptions)).get(t.propositionId))return empty('invalid-evidence','transfer-premises');
   for(const id of assumptions)if(run(new Set(assumptions.filter(x=>x!==id))).get(t.propositionId))return empty('invalid-evidence','transfer-premise-removal');
   t.noRootWitness=assumptions;
  }
  const rows=[];
  for(const targetId of targets){
   const row={targetId,rootedPossible:local.get(basis(targetId)),actionOnlySupplyPossible:actionOnly.get(projection(targetId)),receivedBasisPossible:on.get(projection(targetId)),noRootReceivedBasisPossible:nr.get(projection(targetId)),witness:null,actualReplenishmentState:'unresolved'};
   // Construct an explicit no-root witness using one transfer followed
   // by a simple path of existing local links. No operation is inferred.
   if(row.noRootReceivedBasisPossible){
    for(const t of transfers){
     const queue=[{id:t.to,path:[]}],seen=new Set([t.to]);let hit=null;
     while(queue.length){const x=queue.shift();if(x.id===targetId){hit=x;break;}for(const l of links.filter(l=>l.from===x.id&&!seen.has(l.to))){seen.add(l.to);queue.push({id:l.to,path:[...x.path,l.id]});}}
     if(!hit)continue;
     const assumptions=[...new Set([t.ability,t.transfer,t.operationVariableId,...hit.path.map(op)])],j=run(new Set(assumptions));
     if(j.get(basis(targetId))||!j.get(projection(targetId))||!j.get(t.propositionId)||assumptions.some(id=>roots.has(id)))return empty('invalid-evidence','transfer-witness');
     row.witness={initialLinkId:t.linkId,subsequentLinkIds:hit.path,assumptions};break;
    }
    if(!row.witness)return empty('invalid-evidence','missing-witness');
   }
   rows.push(row);
  }
  return {...base,status:'diagnostic',reason:null,...(includeProofPacket?{proofPacket:combined}:{}),actions,transfers,targets:rows,summary:{actions:actions.length,rootedActions:actions.filter(a=>a.rootedPossible).length,noRootActions:actions.filter(a=>a.noRootActionPossible).length,newActionPossibilities:actions.filter(a=>!a.rootedPossible&&a.alternativePossible).length,
   visibleRootlessActionSources:actions.filter(a=>a.independentGuard&&a.sourceLiteralRootCount===0).length,transfers:transfers.length,targets:rows.length,newSupplyPossibilities:rows.filter(r=>!r.rootedPossible&&r.receivedBasisPossible).length,noRootSupplyPossibilities:rows.filter(r=>r.noRootReceivedBasisPossible).length,actualEffectsConfirmed:0},
   limitations:['independent-ability-and-transfer-unreviewed','no-root-completion-not-actual-root-absence','not-quantity-or-sufficiency','visible-sources-local-relays-only','no-production-authority']};
 }catch(e){return empty('invalid-evidence',String(e?.message??e));}
}
