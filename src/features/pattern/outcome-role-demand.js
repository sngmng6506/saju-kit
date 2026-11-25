import {key,validStates} from './outcome-role-contract.js';
// Explicit requirements already declared by D1-D4. These labels are not
// a new classical policy and the bindings are per occurrence, not totals.
const requirements=Object.freeze({
 'resource-abundance':['resource','excess'],
 'resource-deficiency':['resource','deficiency'],
 'resource-insufficient':['resource','deficiency'],
 'resource-required':['resource','necessity'],
 'resource-preserved':['resource','preservation'],
 'resource-preservation':['resource','preservation'],
 'other-resource-or-rescue-access':['resource','alternative-supply'],
 'output-required':['output','necessity'],
 'output-restoration':['output','preservation'],
 'output-preserved':['output','preservation'],
 'output-excess':['output','excess'],
 'killing-deficiency':['killing','deficiency'],
 'killing-pressure-exceeds-day-capacity':['killing','burden'],
 'day-burden-context':['day','burden'],
 'officer-purity':['officer','purity'],
 'officer-independent-demand':['officer','necessity'],
 'wealth-alternative-and-pressure':['wealth','alternative-review']
});
const unresolved=Object.freeze({
 'resource-required-in-this-chart':['resource','necessity'],
 'resource-light-not-proven':['resource','deficiency'],
 'rescue-and-independent-supply-unresolved':['resource','alternative-supply'],
 'resource-excess-not-proven':['resource','excess'],
 'required-resource-preservation-unresolved':['resource','preservation'],
 'food-required-in-this-chart':['output','necessity'],
 'food-light-not-proven':['output','deficiency'],
 'alternative-mediation-unresolved':['day','alternative-supply'],
 'food-excess-not-proven':['output','excess'],
 'necessary-killing-control-preserved':['killing','control-preservation'],
 'resource-day-support-unresolved':['resource','supply'],
 'food-killing-balance':['output','relative-balance'],
 'day-actual-burden':['day','burden'],
 'necessary-killing-preserved':['killing','preservation'],
 'resource-actual-throughput':['resource','throughput'],
 'killing-pressure-actually-relieved':['day','pressure-relief'],
 'resource-preserved-under-all-contacts':['resource','preservation']
});
const gods={resource:['정인','편인'],output:['식신','상관'],wealth:['정재','편재'],killing:['편관'],officer:['정관','편관']};
const index=(xs,f)=>Array.isArray(xs)&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const rk=r=>r&&key(r.ruleId,r.witnessId);
const ref=(r,w)=>({ruleId:r.id,witnessId:w.id});
const valid=o=>o&&validStates.includes(o.conditionalStatus)&&o.effectConfirmed===null&&(!Object.hasOwn(o,'actualDemand')||o.actualDemand===null);
// This layer records exactly which observation an existing objective is
// missing. It cannot promote a capacity observation to role necessity.
export function observeRoleDemand(review,capacity,groundedSupply,interposition,policies,complete){
 const base={version:'role-demand-review-v1',candidateId:review.candidateId,selectionAuthority:false,actualDemand:null,excessConfirmed:null,deficiencyConfirmed:null,effectConfirmed:null};
 const empty=status=>({...base,status,objectives:[],unmappedRequirements:[]});
 if(review.status==='out-of-scope'||!['resource','killing'].includes(review.family))return empty('out-of-scope');
 const neutral=interposition?.roleNeutral;
 if([capacity,groundedSupply,neutral].some(x=>!x||x.status!==(complete?'diagnostic':'partial')||x.selectionAuthority!==false)||
  groundedSupply.effectiveSupply!==null||neutral.roleDemandConfirmed!==null||neutral.effectConfirmed!==null||neutral.targetScope!=='all-visible-stems')return empty('invalid-evidence');
 const {objectiveReview,killingStrategies,killingWealth,resourceStrategies}=policies;
 if([objectiveReview,killingStrategies,killingWealth,resourceStrategies].some(p=>!p||p.candidateId!==review.candidateId||p.status==='invalid-evidence'||p.selectionAuthority!==false))return empty('invalid-evidence');
 const actors=index(capacity.occurrences,a=>a.id),supplies=index(groundedSupply.occurrences,a=>a.id),contexts=index(neutral.pressureContexts,t=>t.targetId);
 const actions=index(groundedSupply.actions,a=>a.edgeId),paths=index(neutral.paths,p=>p.id);
 const entries=index(review.rules.flatMap(r=>r.witnesses.map(w=>({r,w}))),x=>key(x.r.id,x.w.id));
 if(!actors||!supplies||!contexts||!actions||!paths||!entries||actors.size!==supplies.size||
  [...actors.keys()].some(id=>!supplies.has(id))||contexts.size!==[...actors.values()].filter(a=>a.layer==='visible').length)return empty('invalid-evidence');
 const day=[...actors.values()].filter(a=>a.dayReference);
 if(day.length!==1||day[0].id!=='visible:day')return empty('invalid-evidence');
 const rows=[],unmapped=[],seen=new Set();let bad=false;
 const roleOk=(role,id)=>role==='day'?id===day[0].id:actors.has(id)&&!actors.get(id).dayReference&&gods[role]?.includes(actors.get(id).tenGod);
 const scopeActor=id=>{
  const a=actors.get(id),s=supplies.get(id),t=contexts.get(id);
  if(!a||!s||a.layer!==s.layer||s.effectiveSupply!==null||a.layer==='visible'&&(!t||t.targetScope!=='in-scope'||t.effective!==null||t.allPressureResolved!==null)||a.layer!=='visible'&&t){bad=true;return null;}
  const incoming=[],outgoing=[];
  for(const e of actions.values()){
   if(e.from!==id&&e.to!==id)continue;
   if(e.effective!==null||e.selectionAuthority!==false||!actors.has(e.from)||!actors.has(e.to)){bad=true;continue;}
   (e.to===id?incoming:outgoing).push({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,generationScreen:e.generationScreen,controlComparison:e.controlComparison,effective:null});
  }
  const controllers=(t?.controllers??[]).map(c=>{
   if(c.neutralizationConfirmed!==null||c.remainingPressureConfirmed!==null||c.evaluatedPathIds.some(pid=>{const p=paths.get(pid);return !p||p.target!==t.targetNodeId||p.threat!==c.controllerNodeId||p.effectConfirmed!==null;}))bad=true;
   return {nodeId:c.controllerNodeId,classification:c.classification,candidatePathIds:[...c.candidatePathIds],screenedPathIds:[...c.screenedPathIds],neutralizationConfirmed:null};
  });
  return {id,tenGod:a.tenGod,layer:a.layer,directRootState:s.directRoot.state,groundedPathIds:[...s.groundedPathIds],screenedPathIds:[...s.screenedPathIds],
   pressureCoverage:a.layer==='visible'?'visible-context':'hidden-access-unresolved',controllers,incoming,outgoing,effectiveForce:null};
 };
 const actorCache=new Map();
 const readActor=id=>{if(!actorCache.has(id))actorCache.set(id,scopeActor(id));return actorCache.get(id);};
 function add(collection,contextId,o,roles,refs=[],extraRequirements=[]){
  if(!valid(o)||typeof contextId!=='string'||!Array.isArray(o.premises)||refs.some(r=>!entries.has(rk(r)))){bad=true;return;}
  const objectiveId=o.objective??o.id;
  if(typeof objectiveId!=='string'||!objectiveId||Object.entries(roles).some(([r,id])=>!roleOk(r,id))){bad=true;return;}
  const id=JSON.stringify([collection,contextId,objectiveId]);
  if(seen.has(id)){bad=true;return;}seen.add(id);
  const obligations=[];
  const addReq=(kind,label,binding,originalState)=>{
   const [role,axis]=binding,actorId=roles[role]??null;
   // A role which is not bound by this source context remains explicitly
   // unbound. Do not substitute another occurrence of the same ten-god.
   const actor=actorId?readActor(actorId):null;
   obligations.push({id:JSON.stringify([kind,label]),origin:kind,label,role,axis,actorId,originalState,
    evidenceStatus:!actor?'unbound-role-review':actor.layer==='hidden'?'hidden-access-review':'structural-context-only',
    actualDemand:null,excessConfirmed:null,deficiencyConfirmed:null,preservationConfirmed:null});
  };
  for(const p of o.premises){
   if(!validStates.includes(p.state)||typeof p.id!=='string'){bad=true;continue;}
   if(Object.hasOwn(requirements,p.id))addReq('premise',p.id,requirements[p.id],p.state);
  }
  for(const label of [...new Set([...(o.unresolvedRequirements??[]),...extraRequirements])]){
   if(Object.hasOwn(unresolved,label))addReq('declared-requirement',label,unresolved[label],'unresolved');
   else unmapped.push({objectiveRef:id,label});
  }
  rows.push({id,collection,contextId,objectiveId,routeRefs:refs,conditionalStatus:o.conditionalStatus,roles:{...roles},obligations,
   actualDemand:null,selected:false,effectConfirmed:null});
 }
 const d=day[0].id;
 for(const o of objectiveReview.objectives){
  const e=entries.get(rk(o.route));if(!e){bad=true;continue;}
  const w=e.w.roles;
  const roles=o.clause==='R02'?{resource:w.target,wealth:w.obstacle,day:d}:o.clause==='K02'?{resource:w.obstacle,output:w.food,killing:w.target,day:d}:null;
  if(!roles){bad=true;continue;}
  add('objective',rk(o.route),o,roles,[o.route,...o.relatedRoutes]);
 }
 for(const f of killingStrategies.food)add('food',f.id,{...f,id:'food-control'}, {output:f.foodId,killing:f.killingId,day:f.dayId},[f.route]);
 for(const m of killingStrategies.mediation)add('mediation',m.id,{...m,id:'resource-mediation'}, {resource:m.resourceId,killing:m.killingId,day:m.dayId});
 for(const x of killingWealth.supply)for(const o of x.objectives)add('killing-wealth-supply',rk(x.route),o,{wealth:x.wealthId,killing:x.killingId,day:x.dayId},[x.route]);
 for(const x of killingWealth.dualRoles)for(const o of x.objectives)add('killing-wealth-dual',x.id,o,{wealth:x.wealthId,resource:x.resourceId,output:x.outputId,killing:x.killingId,day:x.dayId},[x.rescue,x.supply,x.boundThreat]);
 for(const x of killingWealth.mediationContacts)for(const o of x.objectives)add('killing-wealth-mediation',JSON.stringify([x.mediationContextId,x.wealthId]),o,{wealth:x.wealthId,resource:x.resourceId,killing:x.killingId,day:x.dayId});
 for(const x of resourceStrategies.outputDrain)for(const o of x.objectives)add('resource-output',JSON.stringify([rk(x.route),x.anchorId]),o,{resource:x.anchorId,output:x.outputId,day:x.dayId},[x.route]);
 for(const x of resourceStrategies.killingSupply)for(const o of x.objectives)add('resource-killing',rk(x.route),o,{resource:x.resourceId,killing:x.officerId,officer:x.officerId,day:x.dayId},[x.route]);
 for(const x of resourceStrategies.officerContext)for(const o of x.objectives)add('resource-officer',rk(x.route),o,{resource:x.resourceId,officer:x.officerId,day:x.dayId},[x.route]);
 if(bad)return empty('invalid-evidence');
 return {...base,status:complete?'diagnostic':'partial',objectives:rows,actorEvidence:[...actorCache.values()],unmappedRequirements:unmapped,
  limitations:['existing-source-obligations-only','no-role-count-or-weights','occurrence-not-role-total','structural-context-not-demand','hidden-access-unresolved','no-automatic-preservation','no-objective-selection']};
}
