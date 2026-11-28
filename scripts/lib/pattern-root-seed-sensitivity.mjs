import {compileReplenishmentNetwork} from '../../src/features/pattern/outcome-replenishment-network.js';
import {evaluateArguments} from '../../src/features/pattern/outcome-argumentation.js';
import {observeRootContext} from '../../src/features/pattern/outcome-root-context.js';
import {auditInteractionScope} from './pattern-interaction-scope.mjs';
const key=(...xs)=>JSON.stringify(xs),same=(a,b)=>key(a)===key(b),lit=propositionId=>({propositionId,sign:'for'});
const order=['year','month','day','hour'],roles=['principal','middle','residual'];
const sorted=xs=>[...xs].sort();
const VERSION='p3-root-seed-sensitivity-v1';
const basis=id=>key('replenishment-basis',id),access=(n,s)=>key('root-access',n,s),retain=s=>key('slot-retained',s);
const policies=[
 {id:'substantial-baseline',allow:s=>s.role!=='residual'},
 {id:'all-constituents',allow:()=>true},
 {id:'residual-only',allow:s=>s.role==='residual'},
 {id:'principal-only',allow:s=>s.role==='principal'},
 {id:'middle-only',allow:s=>s.role==='middle'},
 {id:'uncontested-only',allow:s=>!s.contested},
 {id:'month-only',allow:s=>s.position==='month'},
 {id:'nonmonth-only',allow:s=>s.position!=='month'},
 {id:'exact-or-own-only',allow:s=>s.match==='exact-stem'||s.match==='own-constituent'},
 {id:'near-only',allow:s=>s.distance<=1}
];
// Generic root seed projection: original root identities remain shared.
// Every policy is an explicit hypothetical access restriction. Even
// "all-constituents" does not certify a single root or its magnitude.
export function compareRootSeedPolicies({completeHour,nodes,links,targets,seeds,packet}={}){
 const empty=(status,reason)=>({status,reason,rows:[],selectionAuthority:false,effective:null,actualRootState:'unresolved'});
 try{
  const c=compileReplenishmentNetwork({completeHour,nodes,links,targets});
  if(!['diagnostic','partial'].includes(c.status)||!same(c.packet,packet)||!Array.isArray(seeds))return empty('invalid-evidence','baseline-network');
  const ns=new Map(nodes.map(n=>[n.id,n])),ids=new Set(),slotMeta=new Map();
  for(const s of seeds){
   if(!s||!ns.has(s.nodeId)||typeof s.slotId!=='string'||!s.slotId||!roles.includes(s.role)||!order.includes(s.position)||typeof s.contested!=='boolean'||!Number.isInteger(s.distance)||s.distance<0||s.distance>3||!['exact-stem','same-element','own-constituent'].includes(s.match)||ids.has(access(s.nodeId,s.slotId)))return empty('invalid-evidence','seed-contract');
   ids.add(access(s.nodeId,s.slotId));
   const physical=key(s.role,s.position,s.contested);
   if(slotMeta.has(s.slotId)&&slotMeta.get(s.slotId)!==physical)return empty('invalid-evidence','physical-slot-conflict');
   slotMeta.set(s.slotId,physical);
  }
  if(!same(sorted(seeds.filter(s=>s.role!=='residual').map(s=>access(s.nodeId,s.slotId))),sorted(nodes.flatMap(n=>n.rootIds.map(r=>access(n.id,r))))))return empty('invalid-evidence','baseline-seed-coverage');
  if(!completeHour)return empty('partial','missing-hour');
  const expandedNodes=nodes.map(n=>({...n,rootIds:seeds.filter(s=>s.nodeId===n.id).map(s=>s.slotId)}));
  const e=compileReplenishmentNetwork({completeHour,nodes:expandedNodes,links,targets});
  if(e.status!=='diagnostic')return empty('invalid-evidence','expanded-network');
  const baseProps=new Map(packet.propositions.map(p=>[p.id,p]));
  const project=id=>key('root-policy-basis',id);
  const derived=new Set(e.packet.propositions.filter(p=>p.level==='structural-hypothesis').map(p=>p.id));
  const propositions=[...packet.propositions,...e.packet.propositions.filter(p=>p.level==='observation'&&!baseProps.has(p.id)),...e.packet.propositions.filter(p=>derived.has(p.id)).map(p=>({...p,id:project(p.id)}))];
  const rules=[...packet.rules,...e.packet.rules.map(r=>({...r,id:key('root-policy-rule',r.id),conclusion:lit(project(r.conclusion.propositionId)),premises:r.premises.map(p=>lit(derived.has(p.propositionId)?project(p.propositionId):p.propositionId))}))];
  const combined={...packet,propositions,rules},base=evaluateArguments(packet),replay=evaluateArguments(combined);
  if(replay.status!=='diagnostic'||!same(base.judgments,replay.judgments.slice(0,base.judgments.length))||!same(base.ruleResults,replay.ruleResults.slice(0,base.ruleResults.length)))return empty('invalid-evidence','proof-parity');
  const obs=propositions.filter(p=>p.level==='observation').map(p=>p.id);
  const run=truth=>{
   const evidence=obs.map((id,i)=>({id:key('root-policy-witness',i),propositionId:id,sign:truth.has(id)?'for':'against',refs:[{owner:'root-policy-witness',id,field:'hypothetical'}],applicability:'complete-only'}));
   const q=evaluateArguments({...combined,evidence});
   if(q.status!=='diagnostic')throw Error('witness-replay');
   return new Map(q.judgments.map(j=>[j.id,j.state==='supported']));
  };
  const rows=targets.map(targetId=>({targetId,policies:[],actualRootState:'unresolved'}));
  for(const p of policies){
   const allowed=seeds.filter(p.allow),disabled=new Set(seeds.filter(s=>!p.allow(s)).map(s=>access(s.nodeId,s.slotId)));
   const truth=new Set(obs.filter(id=>!disabled.has(id))),j=run(truth);
   // Independent graph closure verifies each all-on maximum and all
   // negative reachability claims. No amount or probability is inferred.
   const reached=new Set(allowed.map(s=>s.nodeId));let change=true;
   while(change){change=false;for(const l of links)if(reached.has(l.from)&&!reached.has(l.to)){reached.add(l.to);change=true;}}
   for(const r of rows){
    const reachable=j.get(project(basis(r.targetId)));
    if(reachable!==reached.has(r.targetId)||p.id==='substantial-baseline'&&reachable!==j.get(basis(r.targetId)))return empty('invalid-evidence','reachability-parity');
    r.policies.push({id:p.id,reachable,directPossible:allowed.some(s=>s.nodeId===r.targetId),eligibleSeedCount:allowed.length});
   }
  }
  // Construct a differential witness from one residual seed and a
  // simple local path. All other seed access variables are false.
  // Shared retention remains the same in both projections.
  for(const r of rows){
   r.residualAlternativeWitness=null;
   for(const s of seeds.filter(s=>s.role==='residual')){
    const queue=[{node:s.nodeId,path:[]}],seen=new Set([s.nodeId]);
    let hit=null;
    while(queue.length){const x=queue.shift();if(x.node===r.targetId){hit=x;break;}
     for(const l of links.filter(l=>l.from===x.node&&!seen.has(l.to))){seen.add(l.to);queue.push({node:l.to,path:[...x.path,l.id]});}}
    if(!hit)continue;
    const assumptions=[retain(s.slotId),access(s.nodeId,s.slotId),...hit.path.map(id=>key('supply-operation',id))],j=run(new Set(assumptions));
    if(j.get(basis(r.targetId))||!j.get(project(basis(r.targetId))))return empty('invalid-evidence','differential-witness');
    r.residualAlternativeWitness={seedNodeId:s.nodeId,slotId:s.slotId,linkIds:hit.path,assumptions};break;
   }
   const lookup=id=>r.policies.find(p=>p.id===id).reachable;
   if(lookup('residual-only')!==!!r.residualAlternativeWitness||lookup('substantial-baseline')&&!lookup('all-constituents')||lookup('all-constituents')!==(lookup('substantial-baseline')||lookup('residual-only')))return empty('invalid-evidence','policy-parity');
  }
  return {...empty('diagnostic',null),rows};
 }catch(e){return empty('invalid-evidence',String(e?.message??e));}
}
export function auditRootSeedSensitivity(input){
 const base={version:VERSION,selectionAuthority:false,effective:null,actualRootState:'unresolved',actualStrengthState:'unresolved'};
 const empty=(status,reason)=>({...base,status,reason,seeds:[],rows:[],summary:null});
 const scope=auditInteractionScope(input);
 if(scope.status!=='diagnostic')return empty(scope.status,scope.reason);
 try{
  const {completeHour,nodes,links,targets,prior,formation,root,stemForce}=input;
  if(prior?.stemForce!==stemForce||!same(observeRootContext(prior,formation),root)||root.status!=='diagnostic')return empty('invalid-evidence','root-replay');
  const slots=new Map(root.slots.map(s=>[s.id,s])),actors=new Map(stemForce.occurrences.map(a=>[a.id,a])),seeds=[];
  for(const n of nodes){
   const candidates=root.slots.filter(s=>s.element===n.element&&(n.kind==='visible-stem'||n.occurrenceIds.includes(s.id)));
   for(const s of candidates){
    const a=actors.get(n.kind==='visible-stem'?n.occurrenceIds[0]:s.id),r=a?.roots.find(r=>r.position===s.position&&r.stem===s.stem);
    if(!r||r.role!==s.role||slots.get(s.id)!==s||r.clashExposed!==(s.clashIds.length>0))return empty('invalid-evidence','seed-binding');
    seeds.push({nodeId:n.id,slotId:s.id,role:s.role,position:s.position,distance:Math.abs(order.indexOf(n.position)-order.indexOf(s.position)),match:n.kind==='visible-stem'?r.match:'own-constituent',
     contested:!!(s.clashIds.length||s.competingTargetFormationIds.length),clashIds:[...s.clashIds],competingFormationIds:[...s.competingTargetFormationIds],reliefCandidateIds:[...s.reliefFormationIds],lifeStage:r.stage,actualPreservationState:'unresolved',actualAccessState:'unresolved'});
   }
  }
  const c=compileReplenishmentNetwork({completeHour,nodes,links,targets});
  const q=compareRootSeedPolicies({completeHour,nodes,links,targets,seeds,packet:c.packet});
  if(q.status!=='diagnostic')return empty(q.status,q.reason);
  return {...base,status:'diagnostic',reason:null,seeds,rows:q.rows,summary:{physicalSlots:slots.size,seedCandidates:seeds.length,residualSeeds:seeds.filter(s=>s.role==='residual').length,
   residualOnlyAlternatives:q.rows.filter(r=>r.residualAlternativeWitness).length,newReachability:q.rows.filter(r=>!r.policies[0].reachable&&r.policies[1].reachable).length,actualEffectsConfirmed:0},
   limitations:['residual-root-candidate-not-confirmed-usable','role-not-life-stage','month-position-not-command','uncontested-not-preserved','explicit-access-restrictions-not-source-verdicts','local-relays-only','no-strength-authority']};
 }catch(e){return empty('invalid-evidence',String(e?.message??e));}
}
