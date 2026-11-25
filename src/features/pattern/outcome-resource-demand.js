// Source-conditioned resource balance review. Neither a root inventory
// nor a day-strength hypothesis measures surplus or deficit.
const SOURCE='https://luckclub.cn/bazi/002/037/';
const ORIGINAL='https://www.diancangwang.cn/xuanxuewushu/03cf53eede8a/6e77288ed5b4.html';
const resource=a=>a&&!a.dayReference&&['정인','편인'].includes(a.tenGod);
const uniq=xs=>[...new Set(xs)].sort();
const index=(xs,key)=>Array.isArray(xs)&&new Set(xs.map(key)).size===xs.length?new Map(xs.map(x=>[key(x),x])):null;
const state=complete=>complete?'diagnostic':'partial';
const intersection=(a,b)=>a.filter(x=>b.includes(x));
// Structural supply inventory: one chart, no candidate-owned quantities.
// Distinguish a literal occurrence edge from an aggregate branch path.
export function observeResourceBalanceContext(prior,rootContext,supply,strength){
 const complete=prior?.completeHour,base={version:'resource-balance-context-v1',completeHour:complete,selectionAuthority:false,actualDemand:null,excessConfirmed:null,deficiencyConfirmed:null,effectConfirmed:null};
 const empty=()=>({...base,status:'invalid-evidence',resources:[],day:null});
 if(typeof complete!=='boolean'||[rootContext,supply].some(x=>!x||x.status!==state(complete)||x.completeHour!==complete||x.selectionAuthority!==false)||
  supply.effectiveSupply!==null||rootContext.rootEffectConfirmed!==null)return empty();
 const actors=index(prior.stemForce?.occurrences,a=>a.id),roots=index(rootContext.occurrences,a=>a.id),supplies=index(supply.occurrences,a=>a.id),actions=index(supply.actions,a=>a.edgeId),nodes=index(supply.nodes,n=>n.nodeId);
 if(!actors||!roots||!supplies||!actions||!nodes||actors.size!==roots.size||actors.size!==supplies.size||
  [...actors.keys()].some(id=>!roots.has(id)||!supplies.has(id)))return empty();
 const d=actors.get('visible:day'),ds=supplies.get('visible:day'),dr=roots.get('visible:day');
 if(!d?.dayReference||!ds||!dr||[...actors.values()].filter(a=>a.dayReference).length!==1)return empty();
 const rootIds=s=>uniq([...s.directRoot.uncontestedRootIds,...s.directRoot.contestedRootIds]);
 const edgeRef=e=>({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,sourceBasis:e.sourceBasis,generationScreen:e.generationScreen,controlComparison:e.controlComparison,contextBlockers:e.contextBlockers,effective:null});
 const directed=(from,to,kind)=>[...actions.values()].filter(e=>e.from===from&&e.to===to&&e.kind===kind);
 for(const e of actions.values())if(!actors.has(e.from)||!actors.has(e.to)||e.effective!==null||e.selectionAuthority!==false||e.edgeId!==e.from+'>'+e.to||!['generate','control'].includes(e.kind))return empty();
 const pathRefs=(s,ids)=>s.paths.filter(p=>ids.includes(p.id));
 const validSupply=(a,s,r)=>{
  if(s.layer!==a.layer||s.effectiveSupply!==null||s.directRoot.preservationConfirmed!==null||s.directRoot.state!==r.rootAxes.anySubstantial||
   JSON.stringify(rootIds(s))!==JSON.stringify(uniq([...r.uncontestedRootIds,...r.contestedRootIds]))||
   !Array.isArray(s.paths)||new Set(s.paths.map(p=>p.id)).size!==s.paths.length)return false;
  if(s.groundedPathIds.some(id=>!s.paths.some(p=>p.id===id&&p.upstream==='observed'&&p.recipientId===a.id))||
   s.screenedPathIds.some(id=>!s.groundedPathIds.includes(id)||!s.paths.some(p=>p.id===id&&p.readiness==='grounded-local-path-screen-met'))||
   (!complete||a.layer!=='visible')&&s.screenedPathIds.length)return false;
  return s.paths.every(p=>p.recipientId===a.id&&p.effectiveSupply===null&&nodes.has(p.donor.nodeId)&&
   p.graphEdge.to===a.graphNodeId&&p.graphEdge.from===p.donor.nodeId&&p.graphEdge.kind==='generate'&&
   JSON.stringify(p.donor)===JSON.stringify(nodes.get(p.donor.nodeId)));
 };
 if([...actors.values()].some(a=>!validSupply(a,supplies.get(a.id),roots.get(a.id))))return empty();
 const resources=[];
 for(const a of actors.values())if(resource(a)){
  const s=supplies.get(a.id),r=roots.get(a.id),delivery=directed(a.id,d.id,'generate');
  if(delivery.length>1)return empty();
  const edge=delivery[0]??null;
  const graphPaths=ds.paths.filter(p=>p.donor.nodeId===a.graphNodeId);
  if(graphPaths.length>1||graphPaths.some(p=>!p.donor.occurrenceIds.includes(a.id)))return empty();
  const visible=a.layer==='visible';
  const grounded=pathRefs(s,s.groundedPathIds),screened=pathRefs(s,s.screenedPathIds);
  // Shared evidence includes contested slots and every grounded donor root.
  // Do not count identical branch roots twice or infer independence from
  // disjoint observations. Hidden branch paths belong to aggregate nodes.
  const supportRootIds=uniq([...rootIds(s),...grounded.flatMap(p=>[...p.donor.groundedRootIds,...p.donor.contestedRootIds])]);
  const upstreamNodeIds=uniq(grounded.map(p=>p.donor.nodeId));
  const basis=!complete?'partial':!visible?'hidden-access-review':s.directRoot.state===true?'direct-root-observed':
   screened.length?'grounded-indirect-path-observed':grounded.length?'indirect-path-context-review':'source-basis-not-established';
  resources.push({id:a.id,tenGod:a.tenGod,layer:a.layer,graphNodeId:a.graphNodeId,sourceBasis:basis,
   rootState:s.directRoot.state,rootIds:rootIds(s),supportRootIds,upstreamNodeIds,seasonal:r.seasonal,
   groundedPathIds:[...s.groundedPathIds],screenedPathIds:[...s.screenedPathIds],
   delivery:edge?edgeRef(edge):null,localDayPathIds:graphPaths.map(p=>p.id),
   deliveryObservation:!complete?'partial':!visible?'hidden-access-review':edge?.generationScreen==='grounded-generation-context-screen-met'?'structural-delivery-screen-met':edge?'literal-delivery-context-review':'literal-delivery-not-observed',
   incomingControl:[...actions.values()].filter(e=>e.to===a.id&&e.kind==='control').map(edgeRef),
   outputControl:[...actions.values()].filter(e=>e.from===a.id&&e.kind==='control'&&['식신','상관'].includes(actors.get(e.to).tenGod)).map(edgeRef),
   effectiveSupply:null,preservationConfirmed:null});
 }
 const alternatives=[];
 for(const a of resources)for(const b of resources)if(a.id!==b.id){
  const sharedRootIds=intersection(a.supportRootIds,b.supportRootIds),sharedDonorNodeIds=intersection(a.upstreamNodeIds,b.upstreamNodeIds);
  const sharedGraphNode=a.graphNodeId===b.graphNodeId;
  alternatives.push({from:a.id,to:b.id,sharedRootIds,sharedDonorNodeIds,sharedGraphNode,
   observation:sharedGraphNode||sharedRootIds.length||sharedDonorNodeIds.length?'shared-evidence-observed':'independence-not-established',
   alternativeSupplyConfirmed:null});
 }
 const day={id:d.id,direction:complete&&['strong','weak'].includes(strength?.direction)?strength.direction:null,
  directionBasis:strength?.policy??null,rootState:ds.directRoot.state,rootIds:rootIds(ds),
  peerNodeIds:[...(dr.localSupply?.peer?.observedIds??[])],unresolvedPeerNodeIds:[...(dr.localSupply?.peer?.unresolvedIds??[])],
  incomingControl:[...actions.values()].filter(e=>e.to===d.id&&e.kind==='control').map(edgeRef),
  outputDrain:[...actions.values()].filter(e=>e.from===d.id&&e.kind==='generate'&&['식신','상관'].includes(actors.get(e.to).tenGod)).map(edgeRef),
  wealthControl:[...actions.values()].filter(e=>e.from===d.id&&e.kind==='control'&&['정재','편재'].includes(actors.get(e.to).tenGod)).map(edgeRef),
  actualBurdenConfirmed:null};
 return {...base,status:state(complete),day,resources,alternatives,limitations:['literal-occurrence-and-aggregate-graph-distinct','shared-roots-not-additive','day-direction-not-resource-demand','no-resource-total-or-force-score','no-independent-alternative-confirmed']};
}
// Original clauses R01/R02/R03 plus explicit Xu disagreement. These are
// conditional requirements; the day premise is one dimension only.
const policies=Object.freeze({
 'resource-output:drain-resource-supported-strong-day':{clause:'R01',day:'strong',resource:'excess',role:'output-drain'},
 'resource-output:drain-burdens-weak-day':{clause:'R01',day:'weak',resource:'deficiency',role:'preserve-resource'},
 'objective:excess-resource-moderation':{clause:'R02',day:'strong',resource:'excess',role:'wealth-moderation'},
 'objective:required-resource-injury':{clause:'R02',day:'weak',resource:'deficiency',role:'wealth-injury',reading:'xu-commentary'},
 'resource-killing:killing-supplies-light-resource':{clause:'R03',day:'strong',resource:'deficiency',role:'killing-supply'},
 'resource-killing:weak-day-heavy-resource-original-reading':{clause:'R03',day:'weak',resource:'abundance',role:'killing-supply',reading:'disputed-special-scope'},
 'resource-killing:killing-supply-with-both-day-and-resource-heavy':{clause:'R03',day:'strong',resource:'abundance',role:'wealth-alternative-review',reading:'original-and-xu-distinct'},
 'resource-officer:officer-independent-role-review':{clause:'R03-context',day:'strong',resource:null,role:'officer-independent-demand'}
});
export function assessResourceDemand(demand,context,complete){
 const base={version:'resource-demand-conditions-v1',candidateId:demand?.candidateId??null,selectionAuthority:false,actualDemand:null,excessConfirmed:null,deficiencyConfirmed:null,effectConfirmed:null};
 const empty=status=>({...base,status,conditions:[]});
 if(demand?.status==='out-of-scope')return empty('out-of-scope');
 if(!demand||demand.status!==state(complete)||demand.selectionAuthority!==false||demand.actualDemand!==null||
  !context||context.status!==state(complete)||context.completeHour!==complete||context.selectionAuthority!==false||context.actualDemand!==null)return empty('invalid-evidence');
 const resources=index(context.resources,a=>a.id);
 if(!resources||!context.day||context.day.id!=='visible:day'||!Array.isArray(context.alternatives))return empty('invalid-evidence');
 const conditions=[],ids=new Set();
 for(const o of demand.objectives){
  const policy=policies[o.collection+':'+o.objectiveId];
  if(!policy)continue;
  const a=resources.get(o.roles.resource);
  if(ids.has(o.id)||!a||o.roles.day!==context.day.id||o.actualDemand!==null||o.effectConfirmed!==null)return empty('invalid-evidence');
  ids.add(o.id);
  const dir=context.day.direction;
  const dayState=!complete||dir===null?'unresolved':dir===policy.day?'aligned-direction':'opposed-direction';
  const alternatives=context.alternatives.filter(x=>x.from===a.id);
  if(alternatives.some(x=>!resources.has(x.to)||x.alternativeSupplyConfirmed!==null))return empty('invalid-evidence');
  // Existence of another source is not sufficient; retain its own
  // delivery status plus exact shared physical evidence.
  const alternativeSources=alternatives.map(x=>({...x,deliveryObservation:resources.get(x.to).deliveryObservation,sourceBasis:resources.get(x.to).sourceBasis}));
  const next=[];
  if(!complete)next.push('missing-hour');
  if(a.layer!=='visible')next.push('hidden-resource-access');
  if(dayState==='unresolved')next.push('day-direction-unresolved');
  if(policy.resource)next.push('resource-'+policy.resource+'-not-established');
  if(a.deliveryObservation!=='structural-delivery-screen-met')next.push('resource-delivery-unresolved');
  if(a.incomingControl.length)next.push('resource-preservation-review');
  if(policy.role==='officer-independent-demand')next.push('officer-purity-and-independent-demand');
  if(policy.reading==='disputed-special-scope')next.push('ordinary-scope-not-established');
  conditions.push({objectiveRef:o.id,resourceId:a.id,clause:policy.clause,source:SOURCE,parallelText:ORIGINAL,reading:policy.reading??'original',
   role:policy.role,expectedResourceCondition:policy.resource,dayPremise:{expected:policy.day,observed:dir,state:dayState},
   sourceBasis:a.sourceBasis,deliveryObservation:a.deliveryObservation,deliveryEdgeId:a.delivery?.edgeId??null,
   alternativeSources,unresolvedRequirements:next,conditionalStatus:o.conditionalStatus,
   actualDemand:null,excessConfirmed:null,deficiencyConfirmed:null,preservationConfirmed:null,effectConfirmed:null});
 }
 return {...base,status:state(complete),conditions,limitations:['source-specific-day-premise-only','abundance-not-excess','no-absence-to-deficiency-conversion','no-demand-from-structural-screen','officer-independent-exception-retained']};
}
