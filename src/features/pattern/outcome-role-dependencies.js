// Link existing demand projections. D1-D4 own the premises; D5 owns
// declared interpretation/strategy relationships; joint owns allocation.
// This is an identity/provenance index, not another decision policy.
const index=(xs,f)=>Array.isArray(xs)&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const sorted=xs=>[...new Set(xs)].sort();
const noAuthority=x=>x&&x.necessityConfirmed===null&&x.excessConfirmed===null&&x.deficiencyConfirmed===null&&x.preservationConfirmed===null&&x.effective===null;
const fields={
 resource:['delivery','wealthControl','officerSupply','outputDrain'],
 output:['drain','control','resourcePressure','resourceDelivery','killingPressure','wealthControl','wealthKillingFeed'],
 officer:['pressure','wealthSupply','resourceSupply','resourceDelivery','outputControl','drain','resourceControl','wealthResourceControl']
};
// Bind field meaning as well as edge identity. An otherwise valid edge
// between two participants must not substitute for another required edge.
const meanings={
 resource:{delivery:['resource','day','generate'],wealthControl:['wealth','resource','control'],officerSupply:['officer','resource','generate'],outputDrain:['day','output','generate']},
 output:{drain:['day','output','generate'],control:['output','killing','control'],resourcePressure:['resource','output','control'],resourceDelivery:['resource','day','generate'],killingPressure:['killing','day','control'],wealthControl:['wealth','resource','control'],wealthKillingFeed:['wealth','killing','generate']},
 officer:{pressure:['officer','day','control'],wealthSupply:['wealth','officer','generate'],resourceSupply:['officer','resource','generate'],resourceDelivery:['resource','day','generate'],outputControl:['output','officer','control'],drain:['day','output','generate'],resourceControl:['resource','output','control'],wealthResourceControl:['wealth','resource','control']}
};
const primary={resource:'resourceId',output:'outputId',officer:'officerId'};
const edgeFields=['edgeId','from','to','kind','sourceBasis','generationScreen','controlComparison','effective'];
const sameEdge=(a,b)=>edgeFields.every(k=>a[k]===b[k]);
export function observeRoleDependencies(demand,projections,supply,complete){
 const base={version:'role-dependency-review-v1',candidateId:demand?.candidateId??null,selectionAuthority:false,netEffectConfirmed:null,independentSupplyConfirmed:null};
 const empty=status=>({...base,status,objectives:[],sharedActions:[],sharedRoots:[],sharedDonors:[]});
 if(!demand||typeof complete!=='boolean'||demand.selectionAuthority!==false||demand.actualDemand!==null||demand.effectConfirmed!==null)return empty('invalid-evidence');
 const expected=complete?'diagnostic':'partial',inScope=demand.status===expected;
 if(!inScope&&demand.status!=='out-of-scope')return empty('invalid-evidence');
 if(Object.keys(projections??{}).sort().join(',')!=='officer,output,resource'||Object.values(projections).some(p=>!noAuthority(p)||p.candidateId!==demand.candidateId||p.selectionAuthority!==false||p.status!==demand.status||!Array.isArray(p.contexts)))return empty('invalid-evidence');
 if(!inScope)return Object.values(projections).every(p=>!p.contexts.length)&&Array.isArray(demand.objectives)&&!demand.objectives.length?empty('out-of-scope'):empty('invalid-evidence');
 if(!supply||supply.status!==expected||supply.selectionAuthority!==false||supply.effectiveSupply!==null)return empty('invalid-evidence');
 const objectives=index(demand.objectives,o=>o.id),actors=index(supply.occurrences,a=>a.id),actions=index(supply.actions,e=>e.edgeId);
 if(!objectives||!actors||!actions||[...actions.values()].some(e=>e.effective!==null||e.selectionAuthority!==false||!actors.has(e.from)||!actors.has(e.to)||e.edgeId!==e.from+'>'+e.to))return empty('invalid-evidence');
 const rows=new Map(),actionUses=new Map(),rootUses=new Map(),donorUses=new Map();
 const addUse=(map,id,use)=>{if(!map.has(id))map.set(id,[]);map.get(id).push(use);};
 for(const o of objectives.values()){
  if(typeof o.id!=='string'||o.selected!==false||o.effectConfirmed!==null||o.actualDemand!==null||!o.roles||Object.values(o.roles).some(id=>!actors.has(id)))return empty('invalid-evidence');
  rows.set(o.id,{objectiveRef:o.id,sourceConditionalStatus:o.conditionalStatus,projections:[],boundActorIds:sorted(Object.values(o.roles)),effectConfirmed:null});
 }
 for(const [kind,p] of Object.entries(projections)){
  const seen=new Set();
  for(const c of p.contexts){
   const o=objectives.get(c.objectiveRef),row=rows.get(c.objectiveRef);
   if(!o||seen.has(c.objectiveRef)||!noAuthority(c)||c.sourceConditionalStatus!==o.conditionalStatus||c.dayId!==o.roles.day||
    c[primary[kind]]!==(kind==='officer'?(o.roles.killing??o.roles.officer):o.roles[kind]))return empty('invalid-evidence');
   seen.add(c.objectiveRef);
   const refs=[];
   for(const field of fields[kind]){
    const e=(kind==='officer'?c.relations:c)?.[field];
    if(e===null)continue;
    if(!e||!actions.has(e.edgeId)||!sameEdge(e,actions.get(e.edgeId))||!row.boundActorIds.includes(e.from)||!row.boundActorIds.includes(e.to))return empty('invalid-evidence');
    const [fromRole,toRole,relation]=meanings[kind][field];
    const roleId=role=>role==='officer'?(o.roles.officer??o.roles.killing):o.roles[role];
    if(e.from!==roleId(fromRole)||e.to!==roleId(toRole)||e.kind!==relation)return empty('invalid-evidence');
    refs.push({field,edgeId:e.edgeId});addUse(actionUses,e.edgeId,{objectiveRef:o.id,projection:kind,field});
   }
   row.projections.push({kind,contextState:c.contextState,edgeRefs:refs});
  }
 }
 // All bound actor provenance is contextual, not an assertion that a
 // particular objective consumes a root. Count physical IDs once.
 for(const row of rows.values())for(const id of row.boundActorIds){
  const a=actors.get(id),r=a.directRoot;
  if(a.effectiveSupply!==null||!r||r.preservationConfirmed!==null||!Array.isArray(r.uncontestedRootIds)||!Array.isArray(r.contestedRootIds)||
   !Array.isArray(a.paths)||!Array.isArray(a.groundedPathIds))return empty('invalid-evidence');
  const direct=new Map();
  for(const [state,ids] of [['uncontested',r.uncontestedRootIds],['contested',r.contestedRootIds]])for(const root of ids){
   if(direct.has(root))return empty('invalid-evidence');direct.set(root,state);
   addUse(rootUses,root,{objectiveRef:row.objectiveRef,actorId:id,basis:'direct-'+state});
  }
  const paths=index(a.paths,p=>p.id);if(!paths||new Set(a.groundedPathIds).size!==a.groundedPathIds.length)return empty('invalid-evidence');
  for(const pid of a.groundedPathIds){
   const p=paths.get(pid);
   if(!p||p.recipientId!==id||p.upstream!=='observed'||p.effectiveSupply!==null||!p.donor||p.donor.independentSupplyConfirmed!==null||
    pid!==JSON.stringify([p.donor.nodeId,id])||!Array.isArray(p.donor.groundedRootIds)||!Array.isArray(p.donor.contestedRootIds))return empty('invalid-evidence');
   addUse(donorUses,p.donor.nodeId,{objectiveRef:row.objectiveRef,actorId:id,pathId:pid});
   for(const [state,ids] of [['uncontested',p.donor.groundedRootIds],['contested',p.donor.contestedRootIds]])for(const root of ids)
    addUse(rootUses,root,{objectiveRef:row.objectiveRef,actorId:id,basis:'donor-'+state,pathId:pid});
  }
 }
 const sharedActions=[...actionUses].filter(([,uses])=>uses.length>1).map(([edgeId,uses])=>({edgeId,uses,
  objectiveRefs:sorted(uses.map(x=>x.objectiveRef)),projections:sorted(uses.map(x=>x.projection)),
  interpretation: new Set(uses.map(x=>x.objectiveRef)).size>1?'shared-across-objectives':'repeated-projection-of-one-objective',netEffectConfirmed:null}));
 const shared=(map,field)=>[...map].filter(([,uses])=>new Set(uses.map(u=>u.actorId)).size>1).map(([id,uses])=>({[field]:id,uses,actorIds:sorted(uses.map(u=>u.actorId)),independentSupplyConfirmed:null}));
 return {...base,status:expected,objectives:[...rows.values()],sharedActions,sharedRoots:shared(rootUses,'rootId'),sharedDonors:shared(donorUses,'nodeId'),
  limitations:['projection-reuse-not-independent-vote','shared-root-context-not-allocation','same-action-not-same-objective','D5-owns-declared-interactions','joint-owns-allocation','no-net-effect']};
}
