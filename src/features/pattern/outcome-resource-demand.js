// Source-bound resource review. The original role policies own objectives;
// the chart inventory owns literal occurrences and edges. No strength sum.
const RESOURCE=new Set(['정인','편인']),OUTPUT=new Set(['식신','상관']),OFFICER=new Set(['정관','편관']),WEALTH=new Set(['정재','편재']),PEER=new Set(['비견','겁재']);
const index=(xs,f)=>Array.isArray(xs)&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const edgeKey=(from,to,kind)=>JSON.stringify([from,to,kind]);
const uniq=xs=>[...new Set(xs)].sort();
const source='https://www.diancangwang.cn/xuanxuewushu/03cf53eede8a/6e77288ed5b4.html';
const scenarios=Object.freeze({
 'required-resource-injury':{clause:'R02',day:'weak',axis:'necessity',required:['resource-light','wealth-heavy','rescue-unavailable']},
 'excess-resource-moderation':{clause:'R02',day:'strong',axis:'excess',required:['resource-heavy','wealth-regulation-effective','needed-resource-preserved']},
 'drain-resource-supported-strong-day':{clause:'R01',day:'strong',axis:'excess',required:['resource-heavy','output-effective','output-preserved']},
 'drain-burdens-weak-day':{clause:'R01',day:'weak',axis:'deficiency',required:['resource-light','output-heavy','actual-day-burden']},
 'killing-supplies-light-resource':{clause:'R03',day:'strong',axis:'deficiency',required:['resource-light','killing-supply-effective','resource-preserved']},
 'weak-day-heavy-resource-original-reading':{clause:'R03',day:'weak',axis:'heaviness-context',required:['resource-heavy','ordinary-scope-established','killing-supply-useful']},
 'killing-supply-with-both-day-and-resource-heavy':{clause:'R03',day:'strong',axis:'heaviness-context',required:['resource-heavy','output-and-killing-regulation-context','wealth-alternative-reviewed']},
 'officer-independent-role-review':{clause:'R03-context',day:'strong',axis:'independent-officer',required:['officer-purity','officer-independent-demand']}
});
const refEdge=e=>({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,sourceBasis:e.sourceBasis,generationScreen:e.generationScreen,controlComparison:e.controlComparison,effective:null});
const confirmed={necessityConfirmed:null,excessConfirmed:null,deficiencyConfirmed:null,preservationConfirmed:null,effective:null};
// Compute once per chart. Only a literal generate edge to the same day
// qualifies as a resource delivery or alternative delivery observation.
export function observeResourceSupplyContext(capacity,supply,interposition,strength,complete){
 const base={version:'resource-supply-context-v1',completeHour:complete,selectionAuthority:false,...confirmed};
 const empty=status=>({...base,status,day:null,resources:[],alternatives:[]});
 const status=complete?'diagnostic':'partial',neutral=interposition?.roleNeutral;
 if([capacity,supply,neutral].some(x=>!x||x.status!==status||x.selectionAuthority!==false)||supply.effectiveSupply!==null||
  neutral.effectConfirmed!==null||neutral.neutralizationConfirmed!==null||neutral.roleDemandConfirmed!==null||neutral.targetScope!=='all-visible-stems')return empty('invalid-evidence');
 const actors=index(capacity.occurrences,a=>a.id),observations=index(supply.occurrences,a=>a.id),actions=index(supply.actions,e=>edgeKey(e.from,e.to,e.kind)),contexts=index(neutral.pressureContexts,t=>t.targetId);
 if(!actors||!observations||!actions||!contexts||actors.size!==observations.size||[...actors.keys()].some(id=>!observations.has(id)))return empty('invalid-evidence');
 const days=[...actors.values()].filter(a=>a.dayReference);
 if(days.length!==1||days[0].id!=='visible:day'||days[0].layer!=='visible')return empty('invalid-evidence');
 const d=days[0].id,dayObs=observations.get(d);
 const related=(id,kind,dir)=>[...actions.values()].filter(e=>e.kind===kind&&e[dir==='in'?'to':'from']===id).map(refEdge);
 for(const e of actions.values())if(!actors.has(e.from)||!actors.has(e.to)||e.edgeId!==e.from+'>'+e.to||!['generate','control'].includes(e.kind)||e.effective!==null||e.selectionAuthority!==false)return empty('invalid-evidence');
 for(const a of actors.values()){
  const o=observations.get(a.id),t=contexts.get(a.id);
  if(o.layer!==a.layer||o.effectiveSupply!==null||!Array.isArray(o.directRoot?.uncontestedRootIds)||!Array.isArray(o.directRoot?.contestedRootIds)||o.directRoot.preservationConfirmed!==null||
   (a.layer==='visible'?(!t||t.targetScope!=='in-scope'||t.effective!==null||t.allPressureResolved!==null||t.controllers.some(c=>c.neutralizationConfirmed!==null||c.remainingPressureConfirmed!==null)):!!t))return empty('invalid-evidence');
 }
 const day={id:d,direction:complete&&['strong','weak'].includes(strength?.direction)?strength.direction:null,
  directRootState:dayObs.directRoot.state,rootIds:[...dayObs.directRoot.uncontestedRootIds],groundedPathIds:[...dayObs.groundedPathIds],
  peerIds:[...actors.values()].filter(a=>!a.dayReference&&PEER.has(a.tenGod)).map(a=>a.id),
  outputDrain:related(d,'generate','out').filter(e=>OUTPUT.has(actors.get(e.to).tenGod)),
  officerPressure:related(d,'control','in').filter(e=>OFFICER.has(actors.get(e.from).tenGod)),
  resourceDelivery:related(d,'generate','in').filter(e=>RESOURCE.has(actors.get(e.from).tenGod)),actualBurdenConfirmed:null};
 const resources=[];
 for(const a of actors.values())if(!a.dayReference&&RESOURCE.has(a.tenGod)){
  const o=observations.get(a.id),delivery=actions.get(edgeKey(a.id,d,'generate')),t=contexts.get(a.id);
  if(!Array.isArray(o.paths)||!Array.isArray(o.groundedPathIds)||new Set(o.groundedPathIds).size!==o.groundedPathIds.length||
   o.groundedPathIds.some(id=>!o.paths.some(p=>p.id===id&&p.recipientId===a.id&&p.upstream==='observed'&&p.effectiveSupply===null&&Array.isArray(p.donor?.groundedRootIds))))return empty('invalid-evidence');
  const pathRoots=uniq(o.paths.filter(p=>o.groundedPathIds.includes(p.id)).flatMap(p=>p.donor.groundedRootIds));
  const rootIds=uniq([...o.directRoot.uncontestedRootIds,...pathRoots]);
  resources.push({id:a.id,layer:a.layer,tenGod:a.tenGod,directRootState:o.directRoot.state,
   directRootIds:[...o.directRoot.uncontestedRootIds],contestedRootIds:[...o.directRoot.contestedRootIds],groundedPathIds:[...o.groundedPathIds],observedSupplyRootIds:rootIds,
   delivery:delivery?refEdge(delivery):null,
   officerSupply:related(a.id,'generate','in').filter(e=>OFFICER.has(actors.get(e.from).tenGod)),
   wealthPressure:related(a.id,'control','in').filter(e=>WEALTH.has(actors.get(e.from).tenGod)),
   outputControl:related(a.id,'control','out').filter(e=>OUTPUT.has(actors.get(e.to).tenGod)),
   controllers:(t?.controllers??[]).map(c=>({nodeId:c.controllerNodeId,classification:c.classification,candidatePathIds:[...c.candidatePathIds],screenedPathIds:[...c.screenedPathIds],neutralizationConfirmed:null})),
   pressureCoverage:a.layer==='visible'?'visible-context':'hidden-access-unresolved',...confirmed});
 }
 const alternatives=[];
 for(const a of resources)for(const b of resources){
  if(a.id===b.id||!b.delivery)continue;
  const sharedRootIds=a.observedSupplyRootIds.filter(id=>b.observedSupplyRootIds.includes(id));
  const coverage=a.layer!=='visible'||b.layer!=='visible'?'hidden-access-review':
   sharedRootIds.length?'shared-root-review':!a.observedSupplyRootIds.length||!b.observedSupplyRootIds.length?'root-basis-unestablished':
   'distinct-observed-root-ids';
  alternatives.push({resourceId:a.id,alternativeId:b.id,delivery:b.delivery,sharedRootIds,coverage,
   independentSupplyConfirmed:null,substitutionConfirmed:null});
 }
 return {...base,status,day,resources,alternatives,limitations:['literal-delivery-to-same-day-only','distinct-root-ids-not-independent-capacity','hidden-access-unresolved','no-role-total-or-effect']};
}
export function assessResourceDemandConditions(review,demand,chart,complete){
 const base={version:'resource-demand-conditions-v1',candidateId:review.candidateId,selectionAuthority:false,...confirmed};
 const empty=status=>({...base,status,contexts:[]});
 if(review.status==='out-of-scope'||demand?.status==='out-of-scope')return empty('out-of-scope');
 const status=complete?'diagnostic':'partial';
 if(!demand||demand.candidateId!==review.candidateId||demand.status!==status||demand.selectionAuthority!==false||demand.actualDemand!==null||
  !chart||chart.status!==status||chart.completeHour!==complete||chart.selectionAuthority!==false||chart.effective!==null)return empty('invalid-evidence');
 const resources=index(chart.resources,r=>r.id);if(!resources||!Array.isArray(demand.objectives)||!chart.day)return empty('invalid-evidence');
 const contexts=[],seen=new Set();
 for(const o of demand.objectives){
  const scenario=Object.hasOwn(scenarios,o.objectiveId)?scenarios[o.objectiveId]:null;
  if(!scenario||review.family!=='resource')continue;
  const expectedCollection={'R01':'resource-output','R02':'objective','R03':'resource-killing','R03-context':'resource-officer'}[scenario.clause];
  if(o.collection!==expectedCollection)return empty('invalid-evidence');
  const r=resources.get(o.roles.resource);
  if(!r||o.roles.day!==chart.day.id||o.actualDemand!==null||o.effectConfirmed!==null||o.selected!==false||seen.has(o.id))return empty('invalid-evidence');
  seen.add(o.id);
  const direction=chart.day.direction;
  const dayPremise=!complete||direction===null?'unresolved':direction===scenario.day?'supported':'opposed';
  const bound=(xs,from,to)=>xs.find(e=>e.from===from&&e.to===to)??null;
  const delivery=r.delivery;
  const wealthControl=o.roles.wealth?bound(r.wealthPressure,o.roles.wealth,r.id):null;
  const officerSupply=o.roles.officer?bound(r.officerSupply,o.roles.officer,r.id):null;
  const outputDrain=o.roles.output?bound(chart.day.outputDrain,chart.day.id,o.roles.output):null;
  const requiredEdge=scenario.clause==='R02'?wealthControl:scenario.clause==='R01'?outputDrain:officerSupply;
  const relationObserved=scenario.clause==='R03-context'?!!officerSupply:!!requiredEdge&&!!delivery;
  const contextState=!complete?'partial':dayPremise==='opposed'?'day-hypothesis-opposed':dayPremise==='unresolved'?'day-hypothesis-unresolved':
   !relationObserved?'required-edge-unobserved':r.layer!=='visible'?'hidden-access-review':'source-context-observed';
  contexts.push({objectiveRef:o.id,objectiveId:o.objectiveId,clause:scenario.clause,source,resourceId:r.id,dayId:chart.day.id,axis:scenario.axis,
   scope:o.objectiveId==='weak-day-heavy-resource-original-reading'?'disputed-ordinary-scope':o.objectiveId==='killing-supply-with-both-day-and-resource-heavy'?'competing-interpretation':'source-conditional',
   dayPremise,contextState,sourceConditionalStatus:o.conditionalStatus,delivery,wealthControl,officerSupply,outputDrain,
   alternativeIds:chart.alternatives.filter(a=>a.resourceId===r.id).map(a=>a.alternativeId),
   requirementRefs:o.obligations.filter(q=>q.role==='resource').map(q=>q.id),
   unprovedConditions:scenario.required.map(id=>({id,state:'unresolved'})),...confirmed});
 }
 return {...base,status,contexts,limitations:['source-context-observed-not-demand-supported','day-direction-not-resource-magnitude','officer-context-not-excess-rule','no-classical-authority-promotion']};
}
