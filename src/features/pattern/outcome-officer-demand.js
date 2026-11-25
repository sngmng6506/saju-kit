import {edgeKey,validStates} from './outcome-role-contract.js';
const groups={killing:['편관'],officer:['정관'],resource:['정인','편인'],output:['식신','상관'],wealth:['정재','편재']};
const officer=a=>!a.dayReference&&['정관','편관'].includes(a.tenGod);
const index=(xs,f)=>Array.isArray(xs)&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const status=c=>c?'diagnostic':'partial';
const abstain={necessityConfirmed:null,excessConfirmed:null,deficiencyConfirmed:null,preservationConfirmed:null,effective:null};
const edgeRef=e=>({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,sourceBasis:e.sourceBasis,generationScreen:e.generationScreen,controlComparison:e.controlComparison,effective:null});
const uniq=xs=>[...new Set(xs)].sort();
// Chart-wide literal pressure and resource mediation inventory. It is not
// a new force model; the role-neutral graph and supply screen own that evidence.
export function observeOfficerSupplyContext(capacity,supply,interposition,strength,complete){
 const base={version:'officer-supply-context-v1',completeHour:complete,selectionAuthority:false,...abstain};
 const empty=()=>({...base,status:'invalid-evidence',day:null,actorInventory:[],officers:[],mediationPaths:[],coexistence:null});
 const neutral=interposition?.roleNeutral;
 if(typeof complete!=='boolean'||[capacity,supply,neutral].some(x=>!x||x.status!==status(complete)||x.selectionAuthority!==false)||
  supply.effectiveSupply!==null||neutral.targetScope!=='all-visible-stems'||neutral.effectConfirmed!==null||
  neutral.neutralizationConfirmed!==null||neutral.roleDemandConfirmed!==null)return empty();
 const actors=index(capacity.occurrences,a=>a.id),obs=index(supply.occurrences,a=>a.id),edges=index(supply.actions,e=>edgeKey(e.from,e.to,e.kind)),
  pressures=index(neutral.pressureContexts,t=>t.targetId);
 if(!actors||!obs||!edges||!pressures||actors.size!==obs.size||[...actors.keys()].some(id=>!obs.has(id))||
  pressures.size!==[...actors.values()].filter(a=>a.layer==='visible').length)return empty();
 const day=actors.get('visible:day');
 if(!day?.dayReference||day.layer!=='visible'||[...actors.values()].filter(a=>a.dayReference).length!==1)return empty();
 for(const e of edges.values())if(!actors.has(e.from)||!actors.has(e.to)||!['control','generate'].includes(e.kind)||e.edgeId!==e.from+'>'+e.to||
  e.effective!==null||e.selectionAuthority!==false)return empty();
 const edge=(from,to,kind)=>{const e=edges.get(edgeKey(from,to,kind));return e?edgeRef(e):null;};
 const related=(id,kind,dir,gods)=>[...edges.values()].filter(e=>e.kind===kind&&e[dir==='in'?'to':'from']===id&&
  !actors.get(e[dir==='in'?'from':'to']).dayReference&&gods.includes(actors.get(e[dir==='in'?'from':'to']).tenGod)).map(edgeRef);
 const access=ids=>ids.some(id=>actors.get(id).layer!=='visible')?'hidden-access-review':'visible-context';
 const officers=[],mediationPaths=[];
 for(const a of actors.values()){
  const s=obs.get(a.id),p=pressures.get(a.id);
  if(s.layer!==a.layer||s.effectiveSupply!==null||s.directRoot?.preservationConfirmed!==null||
   (a.layer==='visible'?(!p||p.targetScope!=='in-scope'||p.effective!==null||p.allPressureResolved!==null||
    !Array.isArray(p.controllers)||p.controllers.some(c=>c.neutralizationConfirmed!==null||c.remainingPressureConfirmed!==null)):!!p))return empty();
  if(!officer(a))continue;
  if(!Array.isArray(s.directRoot.uncontestedRootIds)||!Array.isArray(s.directRoot.contestedRootIds)||!Array.isArray(s.paths)||!Array.isArray(s.groundedPathIds)||
   new Set(s.groundedPathIds).size!==s.groundedPathIds.length||s.groundedPathIds.some(id=>!s.paths.some(p=>p.id===id&&p.recipientId===a.id&&p.upstream==='observed'&&p.effectiveSupply===null)))return empty();
  const pressure=edge(a.id,day.id,'control'),resourceSupply=related(a.id,'generate','out',groups.resource);
  const outputControl=related(a.id,'control','in',groups.output).map(e=>({...e,sourceTenGod:actors.get(e.from).tenGod}));
  const wealthSupply=related(a.id,'generate','in',groups.wealth);
  for(const e of resourceSupply){
   const delivery=edge(e.to,day.id,'generate');if(!pressure||!delivery)continue;
   mediationPaths.push({id:JSON.stringify([a.id,e.to,day.id]),officerId:a.id,resourceId:e.to,dayId:day.id,
    officerTenGod:a.tenGod,pressure,supply:e,delivery,accessReview:access([a.id,e.to,day.id]),
    wealthContacts:wealthSupply.map(w=>({wealthId:w.from,officerSupply:w,resourceControl:edge(w.from,e.to,'control'),netEffectConfirmed:null})),
    pressureReliefConfirmed:null,netEffectConfirmed:null});
  }
  officers.push({id:a.id,tenGod:a.tenGod,layer:a.layer,rootState:s.directRoot.state,rootIds:uniq(s.directRoot.uncontestedRootIds),
   contestedRootIds:uniq(s.directRoot.contestedRootIds),groundedPathIds:[...s.groundedPathIds],pressure,
   pressureObservation:!complete?'partial':a.layer!=='visible'?'hidden-access-review':pressure?'literal-pressure-context-review':'literal-pressure-not-observed',
   outputControl,wealthSupply,resourceSupply,controllers:(p?.controllers??[]).map(c=>({nodeId:c.controllerNodeId,classification:c.classification,
    candidatePathIds:[...c.candidatePathIds],screenedPathIds:[...c.screenedPathIds],neutralizationConfirmed:null})),
   pressureCoverage:a.layer==='visible'?'visible-context':'hidden-access-unresolved',...abstain});
 }
 const proper=officers.filter(a=>a.tenGod==='정관'),killing=officers.filter(a=>a.tenGod==='편관');
 const coexistence={properOfficerIds:proper.map(a=>a.id),killingIds:killing.map(a=>a.id),
  visibleProperOfficerIds:proper.filter(a=>a.layer==='visible').map(a=>a.id),visibleKillingIds:killing.filter(a=>a.layer==='visible').map(a=>a.id),
  literalCoexistenceObserved:proper.length>0&&killing.length>0?true:complete?false:null,
  visibleCoexistenceObserved:proper.some(a=>a.layer==='visible')&&killing.some(a=>a.layer==='visible')?true:complete?false:null,
  mixtureConfirmed:null,purityConfirmed:null};
 return {...base,status:status(complete),day:{id:day.id,direction:complete&&['strong','weak'].includes(strength?.direction)?strength.direction:null,actualBurdenConfirmed:null},
  actorInventory:[...actors.values()].map(a=>({id:a.id,layer:a.layer,tenGod:a.tenGod,dayReference:!!a.dayReference})),
  officers,mediationPaths,coexistence,limitations:['literal-pressure-not-actual-burden','coexistence-not-impurity','resource-mediation-not-neutralization','no-officer-total-or-score']};
}
// Existing objectives only. Required edges describe the exact structural
// context; unproved requirements are not newly calibrated classical rules.
const K='https://luckclub.cn/bazi/002/041/',R='https://luckclub.cn/bazi/002/037/';
const spec=(clause,axis,roles,requiredEdges,unproved,day=null)=>({clause,axis,roles,requiredEdges,unproved,day});
const scenarios=Object.freeze({
 'food:food-control':spec('K01','control-balance',['output'],['pressure','outputControl','drain'],['food-killing-balance','actual-day-burden','necessary-killing-preserved'],'food-policy'),
 'mediation:resource-mediation':spec('K01','mediation',['resource'],['pressure','resourceSupply','resourceDelivery'],['resource-actual-throughput','killing-pressure-actually-relieved','resource-preservation']),
 'objective:required-food-control-obstruction':spec('K02','required-control-obstruction',['resource','output'],['outputControl','resourceControl'],['food-required','food-light','alternative-mediation']),
 'objective:excess-food-moderation':spec('K02','control-preservation',['resource','output'],['outputControl','resourceControl'],['food-excess','necessary-killing-control-preserved','resource-day-support']),
 'killing-wealth-supply:wealth-supplies-needed-killing':spec('K03','deficiency',['wealth'],['wealthSupply'],['killing-deficiency','wealth-supply-effective'],'strong'),
 'killing-wealth-supply:wealth-reinforces-dangerous-killing':spec('K03','burden',['wealth'],['wealthSupply','pressure'],['killing-pressure-exceeds-day-capacity']),
 'killing-wealth-dual:wealth-relieves-output-obstruction':spec('K03','restoration',['wealth','resource','output'],['wealthSupply','outputControl','resourceControl','wealthResourceControl'],['output-required','output-restoration','net-pressure-unproved']),
 'killing-wealth-dual:wealth-supplies-insufficient-killing':spec('K03','deficiency',['wealth','resource','output'],['wealthSupply','outputControl'],['output-killing-relative-contrast','killing-deficiency'],'strong'),
 'killing-wealth-dual:wealth-reinforces-dangerous-killing':spec('K03','burden',['wealth','resource','output'],['wealthSupply','pressure'],['killing-pressure-exceeds-day-capacity']),
 'killing-wealth-mediation:wealth-threatens-needed-resource':spec('K03','mediation-preservation',['wealth','resource'],['resourceSupply','resourceDelivery','wealthResourceControl'],['resource-required','resource-preservation']),
 'killing-wealth-mediation:wealth-supplies-killing-through-resource':spec('K03','mediation',['wealth','resource'],['wealthSupply','resourceSupply','resourceDelivery','pressure'],['resource-actual-throughput','resource-preserved','pressure-relief-unproved']),
 'killing-wealth-mediation:wealth-supplies-needed-killing':spec('K03','deficiency',['wealth','resource'],['wealthSupply'],['killing-deficiency','wealth-supply-effective'],'strong'),
 'resource-killing:killing-supplies-light-resource':spec('R03','resource-supply',['resource'],['resourceSupply','resourceDelivery'],['resource-deficiency','resource-preserved'],'strong'),
 'resource-killing:weak-day-heavy-resource-original-reading':spec('R03','disputed-scope',['resource'],['resourceSupply','resourceDelivery'],['resource-abundance','ordinary-scope-not-established'],'weak'),
 'resource-killing:killing-supply-with-both-day-and-resource-heavy':spec('R03','competing-interpretation',['resource'],['resourceSupply'],['resource-abundance','wealth-alternative-and-pressure'],'strong'),
 'resource-officer:officer-independent-role-review':spec('R03-context','independent-officer',['resource'],['resourceSupply'],['officer-purity','officer-independent-demand'],'strong')
});
export function assessOfficerDemandConditions(review,demand,chart,supply,strategies,complete){
 const base={version:'officer-demand-conditions-v1',candidateId:review.candidateId,selectionAuthority:false,...abstain};
 const empty=s=>({...base,status:s,contexts:[]});
 if(review.status==='out-of-scope'||demand?.status==='out-of-scope')return empty('out-of-scope');
 if(!demand||demand.candidateId!==review.candidateId||demand.status!==status(complete)||demand.selectionAuthority!==false||demand.actualDemand!==null||
  !chart||chart.status!==status(complete)||chart.completeHour!==complete||chart.selectionAuthority!==false||chart.effective!==null||
  !supply||supply.status!==status(complete)||supply.selectionAuthority!==false||supply.effectiveSupply!==null||
  !strategies||strategies.candidateId!==review.candidateId||strategies.selectionAuthority!==false||strategies.status==='invalid-evidence'||
  !Array.isArray(demand.objectives)||chart.day?.id!=='visible:day')return empty('invalid-evidence');
 const actors=index(chart.actorInventory,a=>a.id),officers=index(chart.officers,a=>a.id),edges=index(supply.actions,e=>edgeKey(e.from,e.to,e.kind)),food=index(strategies.food??[],a=>a.id),mediation=index(strategies.mediation??[],a=>a.id);
 if(!actors||!officers||!edges||!food||!mediation)return empty('invalid-evidence');
 const contexts=[],seen=new Set(),edge=(from,to,kind)=>{const e=edges.get(edgeKey(from,to,kind));return e?edgeRef(e):null;};
 for(const o of demand.objectives){
  const k=o.collection+':'+o.objectiveId,p=Object.hasOwn(scenarios,k)?scenarios[k]:null;if(!p)continue;
  const isResource=p.clause.startsWith('R'),isProper=p.clause==='R03-context',role=isProper?'officer':'killing',a=officers.get(o.roles[role]),d=chart.day.id;
  if(!a||a.tenGod!==(isProper?'정관':'편관')||review.family!==(isResource?'resource':'killing')||
   (o.collection==='resource-killing'&&o.roles.officer!==a.id)||o.roles.day!==d||seen.has(o.id)||o.selected!==false||
   o.actualDemand!==null||o.effectConfirmed!==null||!validStates.includes(o.conditionalStatus))return empty('invalid-evidence');
  const participantAccess=[{role:'day',id:d,layer:'visible'},{role,id:a.id,layer:a.layer}];
  for(const r of p.roles){
   const x=actors.get(o.roles[r]);if(!x||x.dayReference||!groups[r].includes(x.tenGod)||participantAccess.some(q=>q.id===x.id))return empty('invalid-evidence');
   if((p.clause==='K01'&&r==='output'||p.clause==='K02'&&r==='output')&&x.tenGod!=='식신')return empty('invalid-evidence');
   participantAccess.push({role:r,id:x.id,layer:x.layer});
  }
  seen.add(o.id);
  const r=o.roles.resource,w=o.roles.wealth,f=o.roles.output;
  const relations={pressure:edge(a.id,d,'control'),wealthSupply:edge(w,a.id,'generate'),resourceSupply:edge(a.id,r,'generate'),
   resourceDelivery:edge(r,d,'generate'),outputControl:edge(f,a.id,'control'),drain:edge(d,f,'generate'),
   resourceControl:edge(r,f,'control'),wealthResourceControl:edge(w,r,'control')};
  const direction=chart.day.direction;
  let dayPremise={expected:p.day,state:p.day?(!complete||direction===null?'unresolved':p.day===direction?'supported':'opposed'):'not-required',direction};
  if(p.day==='food-policy'){
   const f=food.get(o.contextId),q=f?.premises?.find(q=>q.id==='day-capacity-for-control');
   if(!f||f.foodId!==o.roles.output||f.killingId!==a.id||f.dayId!==d||!q||!validStates.includes(q.state)||(!complete&&q.state!=='unresolved'))return empty('invalid-evidence');
   dayPremise={expected:'food-control-source-premise',state:q.state,direction,detail:q.evidence??null};
  }
  let weakDayMediationPremise=null;
  if(o.collection==='mediation'){
   const m=mediation.get(o.contextId),q=m?.weakDayPremises?.find(q=>q.id==='weak-day-mediation-motive');
   if(!m||m.resourceId!==r||m.killingId!==a.id||m.dayId!==d||!q||!validStates.includes(q.state)||(!complete&&q.state!=='unresolved'))return empty('invalid-evidence');
   weakDayMediationPremise={state:q.state,detail:q.evidence??null};
  }
  const missingEdges=p.requiredEdges.filter(id=>!relations[id]);
  const contextState=!complete?'partial':dayPremise.state==='opposed'?'day-hypothesis-opposed':dayPremise.state==='unresolved'?'day-hypothesis-unresolved':
   missingEdges.length?'required-edge-unobserved':participantAccess.some(x=>x.layer!=='visible')?'hidden-access-review':'source-context-observed';
  contexts.push({objectiveRef:o.id,objectiveId:o.objectiveId,collection:o.collection,clause:p.clause,source:isResource?R:K,axis:p.axis,
   officerId:a.id,officerTenGod:a.tenGod,dayId:d,participantAccess,relations,requiredEdges:[...p.requiredEdges],missingEdges,
   mediationPathIds:chart.mediationPaths.filter(m=>m.officerId===a.id&&(!r||m.resourceId===r)).map(m=>m.id),
   dayPremise,weakDayMediationPremise,contextState,sourceConditionalStatus:o.conditionalStatus,
   unprovedConditions:p.unproved.map(id=>({id,state:'unresolved'})),...abstain});
 }
 return {...base,status:status(complete),contexts,limitations:['existing-K01-K02-K03-R03-only','weak-day-mediation-motive-not-universal-prerequisite','proper-officer-not-killing-shortage','no-purity-or-demand-promotion']};
}
