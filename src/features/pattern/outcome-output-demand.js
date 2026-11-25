import {edgeKey,validStates} from './outcome-role-contract.js';
const OUTPUT=new Set(['식신','상관']),RESOURCE=new Set(['정인','편인']),WEALTH=new Set(['정재','편재']),OFFICER=new Set(['정관','편관']);
const index=(xs,f)=>Array.isArray(xs)&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const status=c=>c?'diagnostic':'partial';
const uniq=xs=>[...new Set(xs)].sort();
const abstain={necessityConfirmed:null,excessConfirmed:null,deficiencyConfirmed:null,preservationConfirmed:null,effective:null};
const edgeRef=e=>({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,sourceBasis:e.sourceBasis,generationScreen:e.generationScreen,controlComparison:e.controlComparison,effective:null});
// Chart-level literal output inventory. One output may drain the day,
// control killing and generate wealth simultaneously; no net sign or sum.
export function observeOutputSupplyContext(capacity,supply,interposition,strength,complete){
 const base={version:'output-supply-context-v1',completeHour:complete,selectionAuthority:false,...abstain};
 const empty=()=>({...base,status:'invalid-evidence',day:null,outputs:[],wealthFeeds:[],wealthResourceControls:[]});
 const neutral=interposition?.roleNeutral;
 if(typeof complete!=='boolean'||[capacity,supply,neutral].some(x=>!x||x.status!==status(complete)||x.selectionAuthority!==false)||
  supply.effectiveSupply!==null||neutral.targetScope!=='all-visible-stems'||neutral.effectConfirmed!==null||
  neutral.neutralizationConfirmed!==null||neutral.roleDemandConfirmed!==null)return empty();
 const actors=index(capacity.occurrences,a=>a.id),obs=index(supply.occurrences,a=>a.id),edges=index(supply.actions,e=>edgeKey(e.from,e.to,e.kind)),pressures=index(neutral.pressureContexts,t=>t.targetId);
 if(!actors||!obs||!edges||!pressures||actors.size!==obs.size||[...actors.keys()].some(id=>!obs.has(id))||
  pressures.size!==[...actors.values()].filter(a=>a.layer==='visible').length)return empty();
 const day=actors.get('visible:day');
 if(!day?.dayReference||day.layer!=='visible'||[...actors.values()].filter(a=>a.dayReference).length!==1)return empty();
 for(const e of edges.values())if(!actors.has(e.from)||!actors.has(e.to)||!['control','generate'].includes(e.kind)||e.edgeId!==e.from+'>'+e.to||
  e.effective!==null||e.selectionAuthority!==false)return empty();
 const matching=(id,kind,dir,gods)=>[...edges.values()].filter(e=>e.kind===kind&&e[dir==='in'?'to':'from']===id&&
  !actors.get(e[dir==='in'?'from':'to']).dayReference&&gods.has(actors.get(e[dir==='in'?'from':'to']).tenGod)).map(edgeRef);
 const outputs=[],wealthFeeds=[];
 for(const a of actors.values()){
  const s=obs.get(a.id),p=pressures.get(a.id);
  if(s.layer!==a.layer||s.effectiveSupply!==null||s.directRoot?.preservationConfirmed!==null||
   (a.layer==='visible'?(!p||p.targetScope!=='in-scope'||p.effective!==null||p.allPressureResolved!==null||!Array.isArray(p.controllers)||
    p.controllers.some(c=>c.neutralizationConfirmed!==null||c.remainingPressureConfirmed!==null)):!!p))return empty();
  if(a.dayReference||!OUTPUT.has(a.tenGod))continue;
  const drain=edges.get(edgeKey(day.id,a.id,'generate'));
  if(!Array.isArray(s.groundedPathIds)||!Array.isArray(s.paths)||!Array.isArray(s.directRoot.uncontestedRootIds)||!Array.isArray(s.directRoot.contestedRootIds)||
   s.groundedPathIds.some(id=>!s.paths.some(p=>p.id===id&&p.recipientId===a.id&&p.upstream==='observed'&&p.effectiveSupply===null)))return empty();
  const observation=!complete?'partial':a.layer!=='visible'?'hidden-access-review':drain?.generationScreen==='grounded-generation-context-screen-met'?
   'structural-drain-screen-met':drain?'literal-drain-context-review':'literal-drain-not-observed';
  const wealthSupply=matching(a.id,'generate','out',WEALTH);
  for(const e of wealthSupply){
   const feed=matching(e.to,'generate','out',OFFICER);
   for(const f of feed)wealthFeeds.push({id:JSON.stringify([a.id,e.to,f.to]),outputId:a.id,wealthId:e.to,officerId:f.to,
    outputWealth:e,wealthOfficer:f,officerTenGod:actors.get(f.to).tenGod,
    directOutputControl:edges.has(edgeKey(a.id,f.to,'control'))?edgeRef(edges.get(edgeKey(a.id,f.to,'control'))):null,
    scope:'literal-chain-only',netEffectConfirmed:null});
  }
  outputs.push({id:a.id,layer:a.layer,tenGod:a.tenGod,rootState:s.directRoot.state,
   rootIds:uniq(s.directRoot.uncontestedRootIds),contestedRootIds:uniq(s.directRoot.contestedRootIds),groundedPathIds:[...s.groundedPathIds],
   drain:drain?edgeRef(drain):null,drainObservation:observation,
   officerControl:matching(a.id,'control','out',OFFICER).map(e=>({...e,targetTenGod:actors.get(e.to).tenGod})),
   wealthSupply,resourcePressure:matching(a.id,'control','in',RESOURCE),
   controllers:(p?.controllers??[]).map(c=>({nodeId:c.controllerNodeId,classification:c.classification,candidatePathIds:[...c.candidatePathIds],screenedPathIds:[...c.screenedPathIds],neutralizationConfirmed:null})),
   pressureCoverage:a.layer==='visible'?'visible-context':'hidden-access-unresolved',...abstain});
 }
 const wealthResourceControls=[...edges.values()].filter(e=>e.kind==='control'&&WEALTH.has(actors.get(e.from).tenGod)&&RESOURCE.has(actors.get(e.to).tenGod)).map(edgeRef);
 const wealthOfficerSupply=[...edges.values()].filter(e=>e.kind==='generate'&&WEALTH.has(actors.get(e.from).tenGod)&&OFFICER.has(actors.get(e.to).tenGod)).map(edgeRef);
 const dayResourceSupply=matching(day.id,'generate','in',RESOURCE),dayOfficerPressure=matching(day.id,'control','in',OFFICER);
 return {...base,status:status(complete),day:{id:day.id,direction:complete&&['strong','weak'].includes(strength?.direction)?strength.direction:null,
  actualBurdenConfirmed:null,resourceSupply:dayResourceSupply,officerPressure:dayOfficerPressure},outputs,wealthFeeds,wealthResourceControls,wealthOfficerSupply,limitations:['literal-edge-not-effective-flow','food-and-hurting-officer-distinct','wealth-feed-not-universal-benefit','no-force-sum-or-demand']};
}
// Existing D1-D4 source contexts only. Food-family and hurting-officer-
// family policies are not invented by this projection.
const R='https://luckclub.cn/bazi/002/037/',K='https://yiology.net/books/%E5%91%BD/%E5%85%AB%E5%AD%97%E5%91%BD%E7%90%86/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0/39';
const scenarios=Object.freeze({
 'resource-output:drain-resource-supported-strong-day':{clause:'R01',source:R,day:'strong',axis:'necessary-drain',required:['resource-abundance','output-effective','output-preserved']},
 'resource-output:drain-burdens-weak-day':{clause:'R01',source:R,day:'weak',axis:'excess-burden',required:['resource-light','output-heavy','actual-day-burden']},
 'food:food-control':{clause:'K01',source:K,day:'food-policy',axis:'control-balance',foodOnly:true,required:['food-killing-balance','actual-day-burden','necessary-killing-preserved']},
 'objective:required-food-control-obstruction':{clause:'K02',source:K,axis:'necessary-control-obstruction',foodOnly:true,required:['food-required','food-light','resource-injury-to-food','alternative-mediation']},
 'objective:excess-food-moderation':{clause:'K02',source:K,axis:'excess-moderation',foodOnly:true,required:['food-excess','necessary-killing-control-preserved','resource-day-support']},
 'killing-wealth-dual:wealth-relieves-output-obstruction':{clause:'K03',source:K,axis:'restoration',required:['output-required','output-restored','wealth-resource-control-effective','killing-feed-context']},
 'killing-wealth-dual:wealth-supplies-insufficient-killing':{clause:'K03',source:K,day:'strong',axis:'relative-balance',required:['killing-deficiency','output-killing-balance','wealth-killing-supply-effective']}
});
export const outputScenarioKey=o=>o.collection+':'+o.objectiveId;
export function assessOutputDemandConditions(review,demand,chart,foodPolicy,complete){
 const base={version:'output-demand-conditions-v1',candidateId:review.candidateId,selectionAuthority:false,...abstain};
 const empty=s=>({...base,status:s,contexts:[]});
 if(review.status==='out-of-scope'||demand?.status==='out-of-scope')return empty('out-of-scope');
 if(!demand||demand.candidateId!==review.candidateId||demand.status!==status(complete)||demand.selectionAuthority!==false||demand.actualDemand!==null||
  !chart||chart.status!==status(complete)||chart.completeHour!==complete||chart.selectionAuthority!==false||chart.effective!==null||
  !Array.isArray(demand.objectives)||chart.day?.id!=='visible:day')return empty('invalid-evidence');
 const outputs=index(chart.outputs,a=>a.id),food=index(foodPolicy?.food??[],a=>a.id);
 if(!outputs||!food||foodPolicy?.candidateId!==review.candidateId||foodPolicy.selectionAuthority!==false||foodPolicy.status==='invalid-evidence')return empty('invalid-evidence');
 const contexts=[],seen=new Set();
 for(const o of demand.objectives){
  const p=scenarios[outputScenarioKey(o)];if(!p)continue;
  const a=outputs.get(o.roles.output);
  if(!a||o.roles.day!==chart.day.id||seen.has(o.id)||o.selected!==false||o.actualDemand!==null||o.effectConfirmed!==null||
   !validStates.includes(o.conditionalStatus)||p.foodOnly&&a.tenGod!=='식신'||
   review.family!==(p.clause==='R01'?'resource':'killing'))return empty('invalid-evidence');
  seen.add(o.id);
  const control=a.officerControl.find(e=>e.to===o.roles.killing&&e.targetTenGod==='편관')??null;
  const resourcePressure=a.resourcePressure.find(e=>e.from===o.roles.resource)??null;
  const resourceDelivery=chart.day.resourceSupply.find(e=>e.from===o.roles.resource)??null;
  const killingPressure=chart.day.officerPressure.find(e=>e.from===o.roles.killing)??null;
  const wealthControl=chart.wealthResourceControls.find(e=>e.from===o.roles.wealth&&e.to===o.roles.resource)??null;
  // K03 requires the exact wealth->killing supply relation, not a
  // newly inferred output->wealth->killing route. Keep these separate.
  const wealthKillingFeed=chart.wealthOfficerSupply.find(e=>e.from===o.roles.wealth&&e.to===o.roles.killing)??null;
  const dayDirection=chart.day.direction;
  let dayPremise={expected:p.day??null,state:'not-required',direction:dayDirection,source:'not-declared'};
  if(p.day==='food-policy'){
   const f=food.get(o.contextId),q=f?.premises?.find(q=>q.id==='day-capacity-for-control');
   if(!f||f.foodId!==a.id||f.killingId!==o.roles.killing||f.dayId!==chart.day.id||!q||!validStates.includes(q.state)||
    !complete&&q.state!=='unresolved')return empty('invalid-evidence');
   dayPremise={expected:'food-control-source-premise',state:q.state,direction:dayDirection,source:'K01-existing-polarity-policy',detail:q.evidence??null};
  }else if(p.day)dayPremise={expected:p.day,state:!complete||dayDirection===null?'unresolved':dayDirection===p.day?'supported':'opposed',direction:dayDirection,source:'existing-day-hypothesis'};
  const relationObserved=p.clause==='R01'?!!a.drain&&!!resourceDelivery:p.clause==='K01'?!!a.drain&&!!control&&!!killingPressure:
   p.clause==='K02'?!!control&&!!resourcePressure:p.axis==='restoration'?!!control&&!!resourcePressure&&!!wealthControl&&!!wealthKillingFeed:!!control&&!!wealthKillingFeed;
  const contextState=!complete?'partial':dayPremise.state==='opposed'?'day-hypothesis-opposed':dayPremise.state==='unresolved'?'day-hypothesis-unresolved':
   !relationObserved?'required-edge-unobserved':a.layer!=='visible'?'hidden-access-review':'source-context-observed';
  contexts.push({objectiveRef:o.id,objectiveId:o.objectiveId,clause:p.clause,source:p.source,axis:p.axis,outputId:a.id,outputTenGod:a.tenGod,
   dayId:chart.day.id,killingId:o.roles.killing??null,resourceId:o.roles.resource??null,wealthId:o.roles.wealth??null,
   drain:a.drain,drainObservation:a.drainObservation,control,resourcePressure,resourceDelivery,killingPressure,wealthControl,wealthKillingFeed,
   wealthFeedIds:chart.wealthFeeds.filter(x=>x.outputId===a.id&&(!o.roles.killing||x.officerId===o.roles.killing)&&(!o.roles.wealth||x.wealthId===o.roles.wealth)).map(x=>x.id),
   dayPremise,contextState,sourceConditionalStatus:o.conditionalStatus,unprovedConditions:p.required.map(id=>({id,state:'unresolved'})),...abstain});
 }
 return {...base,status:status(complete),contexts,limitations:['existing-R01-K01-K02-K03-only','food-only-clause-not-extended-to-hurting-officer','no-natal-rule-from-transit-text','no-role-demand-or-effect-promotion']};
}
