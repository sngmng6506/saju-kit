import {elementRelation} from '../../core/elements.js';
const ORDER=['year','month','day','hour'];
const uniq=xs=>[...new Set(xs)].sort();
const index=(xs,key)=>{if(!Array.isArray(xs))return null;try{const keys=xs.map(key);return new Set(keys).size===xs.length?new Map(xs.map((x,i)=>[keys[i],x])):null;}catch{return null;}};
const slot=a=>a.position+':'+a.layer;
const distance=(a,b)=>Math.abs(ORDER.indexOf(a.position)-ORDER.indexOf(b.position));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const rootPositions=ids=>uniq(ids.map(id=>id.split(':')[1]));
const nodeLayer=a=>a.layer==='visible'?'stem':'branch';
const pressureClass=state=>state==='grounded-observation'?'rooted-controller-observed':
 state==='no-substantial-root-observed'?'no-substantial-controller-observed':'controller-access-unresolved';
const invalid=base=>({...base,status:'invalid-evidence',paths:[],summary:{candidatePaths:0,protectionPaths:0,mediationPaths:0,structuralScreensMet:0}});
function validateNode(nodeId,groups,donors,rootContext,complete){
 const members=groups.get(nodeId),d=donors.get(nodeId);
 if(!members?.length||!d||!Array.isArray(d.occurrenceIds)||d.occurrenceIds.some(x=>typeof x!=='string')||
  !Array.isArray(d.contacts)||!Array.isArray(d.groundedRootIds)||!Array.isArray(d.contestedRootIds)||
  [...d.groundedRootIds,...d.contestedRootIds].some(x=>typeof x!=='string'||!/^hidden:(year|month|day|hour):.+$/.test(x))||
  members.some(a=>!Array.isArray(a.contacts)))return false;
 const first=members[0],kind=first.layer==='visible'?'visible-stem':'local-branch-constituents';
 if(d.position!==first.position||d.element!==first.element||d.kind!==kind||
  !same(uniq(d.occurrenceIds),uniq(members.map(x=>x.id)))||
  !same(d.contacts,first.contacts)||members.some(a=>a.position!==first.position||a.layer!==first.layer||
   a.element!==first.element||!same(a.contacts,first.contacts)))return false;
 if(first.layer==='visible'&&members.length!==1)return false;
 let grounded=[],contested=[];
 if(first.layer==='visible'){
  const r=rootContext.occurrences.find(x=>x.id===first.id);
  if(!r)return false;
  grounded=r.uncontestedRootIds;contested=r.contestedRootIds;
  if(!same(uniq(grounded),uniq(d.groundedRootIds))||!same(uniq(contested),uniq(d.contestedRootIds)))return false;
 }else{
  const slotRows=index(rootContext.slots,x=>x.id);
  if(!slotRows)return false;
  for(const a of members){
   const r=slotRows.get(a.id);
   if(!r||r.position!==a.position||r.element!==a.element||r.role!==a.hiddenRole)return false;
   if(r.role!=='residual')(r.state==='uncontested-substantial-observation'?grounded:contested).push(r.id);
  }
  if(!same(uniq(grounded),uniq(d.groundedRootIds))||!same(uniq(contested),uniq(d.contestedRootIds)))return false;
 }
 const expectedState=grounded.length&&!d.contacts.length?'grounded-observation':
  grounded.length||contested.length?'context-review':complete?'no-substantial-root-observed':'partial';
 return d.state===expectedState&&d.independentSupplyConfirmed===null;
}
function unexposedPositions(nodeId,groups,rootContext){
 const members=groups.get(nodeId)??[];
 if(!members.length)return null;
 if(members[0].layer==='visible'){
  const row=rootContext.occurrences.find(x=>x.id===members[0].id);
  return row?uniq(row.roots.filter(r=>r.role!=='residual'&&r.state!=='clash-exposed').map(r=>r.position)):null;
 }
 const slots=index(rootContext.slots,x=>x.id);
 if(!slots)return null;
 const rows=members.map(a=>slots.get(a.id));
 if(rows.some(r=>!r))return null;
 return uniq(rows.filter(r=>r.role!=='residual'&&r.state!=='clash-exposed').map(r=>r.position));
}
function validateEdge(e,from,to,type,groups,donors,rootContext){
 const a=groups.get(from)?.[0],b=groups.get(to)?.[0],source=donors.get(from),target=donors.get(to);
 if(!e||!a||!b||!source||!target||!Array.isArray(e.sourceEvidence?.contacts)||
  !Array.isArray(e.targetEvidence?.contacts)||!Array.isArray(e.sourceEvidence?.substantialRootPositions)||
  !Array.isArray(e.targetEvidence?.substantialRootPositions)||!Array.isArray(e.sourceEvidence?.unexposedSubstantialRootPositions)||
  !Array.isArray(e.targetEvidence?.unexposedSubstantialRootPositions)||e.from!==from||e.to!==to||e.type!==type||
  e.effectConfirmed!==null||e.sourceEvidence?.id!==from||e.targetEvidence?.id!==to||
  e.sourceEvidence.position!==a.position||e.targetEvidence.position!==b.position||
  e.sourceEvidence.layer!==nodeLayer(a)||e.targetEvidence.layer!==nodeLayer(b)||
  e.sourceEvidence.element!==a.element||e.targetEvidence.element!==b.element||
  !same(e.sourceEvidence.contacts,a.contacts)||!same(e.targetEvidence.contacts,b.contacts))return false;
 const d=distance(a,b);let r;try{r=elementRelation(a.element,b.element);}catch{return false;}
 if(d!==e.distance||e.local!==(d<=1)||r.type!==type||r.direction!=='left-to-right')return false;
 const sourceRoots=uniq([...source.groundedRootIds,...source.contestedRootIds]);
 const targetRoots=uniq([...target.groundedRootIds,...target.contestedRootIds]);
 const sourceUnexposed=unexposedPositions(from,groups,rootContext),targetUnexposed=unexposedPositions(to,groups,rootContext);
 return sourceUnexposed!==null&&targetUnexposed!==null&&
  same(rootPositions(sourceRoots),uniq(e.sourceEvidence.substantialRootPositions??[]))&&
  same(rootPositions(targetRoots),uniq(e.targetEvidence.substantialRootPositions??[]))&&
  same(sourceUnexposed,uniq(e.sourceEvidence.unexposedSubstantialRootPositions??[]))&&
  same(targetUnexposed,uniq(e.targetEvidence.unexposedSubstantialRootPositions??[]));
}
function pressureFor(nodeId,groups,donors,rootContext){
 const members=groups.get(nodeId),first=members[0];
 const rows=first.controlReceived??[];
 if(!Array.isArray(rows)||rows.some(e=>!e||typeof e!=='object')||members.some(m=>!Array.isArray(m.controlReceived)||m.controlReceived.some(e=>!e||typeof e!=='object')))return null;
 const signature=e=>JSON.stringify([e.from,e.to,e.distance,e.local,e.sourceEvidence?.id,e.targetEvidence?.id]);
 if(members.some(m=>!same((m.controlReceived??[]).map(signature).sort(),rows.map(signature).sort())))return null;
 const result=[];
 for(const e of rows){
  if(e.to!==nodeId||e.type!=='control'||!validateEdge(e,e.from,nodeId,'control',groups,donors,rootContext))return null;
  const d=donors.get(e.from);
  result.push({controllerNodeId:e.from,distance:e.distance,local:e.local,donorState:d.state,
   classification:pressureClass(d.state),effectConfirmed:null});
 }
 return result.sort((a,b)=>a.controllerNodeId.localeCompare(b.controllerNodeId));
}
function classifyPath(path,groups,donors,pressures,complete){
 const helper=donors.get(path.helper),threat=donors.get(path.threat),target=donors.get(path.target);
 const helperPressure=pressures.get(path.helper),threatPressure=pressures.get(path.threat),targetPressure=pressures.get(path.target);
 const participants=[path.helper,path.threat,path.target].map(id=>groups.get(id)[0]);
 const hidden=participants.some(a=>a.layer!=='visible');
 const edges=path.edges;
 const chainEdges=path.kind==='protection'?edges:edges.slice(0,2);
 const chainLocal=chainEdges.every(e=>e.local);
 const directThreatControlLocal=path.kind==='mediation'?edges[2].local:null;
 const blockers=[];
 if(!complete)blockers.push('missing-hour');
 if(hidden)blockers.push('hidden-participant-access');
 if(participants.some(a=>donors.get(a.graphNodeId).contacts.length))blockers.push('participant-contact');
 if(!chainLocal)blockers.push(path.kind==='protection'?'nonlocal-protection-chain':'nonlocal-generation-chain');
 if(helper.state!=='grounded-observation')blockers.push(helper.state==='no-substantial-root-observed'?'helper-root-not-observed':'helper-root-access-unresolved');
 if(threat.state!=='grounded-observation')blockers.push(threat.state==='no-substantial-root-observed'?'threat-root-not-observed':'threat-root-access-unresolved');
 const helperPressureRooted=helperPressure.some(p=>p.donorState==='grounded-observation');
 const helperPressureUnknown=helperPressure.some(p=>p.donorState!=='no-substantial-root-observed'&&p.donorState!=='grounded-observation');
 if(helperPressureRooted)blockers.push('helper-under-rooted-control');
 if(helperPressureUnknown)blockers.push('helper-control-context-unresolved');
 const routeController=path.kind==='protection'?path.helper:path.threat;
 const additionalThreatPressure=threatPressure.filter(p=>p.controllerNodeId!==routeController);
 const additionalTargetPressure=targetPressure.filter(p=>p.controllerNodeId!==path.threat);
 return {id:JSON.stringify([path.kind,path.helper,path.threat,path.target]),kind:path.kind,
  helper:path.helper,threat:path.threat,target:path.target,sourceOccurrenceIds:uniq(path.sourceOccurrenceIds),
  participants:{helper:{nodeId:path.helper,kind:helper.kind,state:helper.state,groundedRootIds:helper.groundedRootIds,
    contestedRootIds:helper.contestedRootIds,contacts:helper.contacts},
   threat:{nodeId:path.threat,kind:threat.kind,state:threat.state,groundedRootIds:threat.groundedRootIds,
    contestedRootIds:threat.contestedRootIds,contacts:threat.contacts},
   target:{nodeId:path.target,kind:target.kind,state:target.state,groundedRootIds:target.groundedRootIds,
    contestedRootIds:target.contestedRootIds,contacts:target.contacts}},
  edges:edges.map(e=>({from:e.from,to:e.to,type:e.type,distance:e.distance,local:e.local})),
  chainLocal,directThreatControlLocal,
  pressure:{helper:helperPressure,threat:threatPressure,target:targetPressure,
   additionalThreatControllers:additionalThreatPressure,additionalTargetControllers:additionalTargetPressure,
   helperRootedControllerObserved:helperPressureRooted,helperControllerUnresolved:helperPressureUnknown},
  targetRootRequiredForPathObservation:false,
  blockers,structuralScreen:blockers.length?'context-review':'grounded-structure-screen-met',
  effectiveProtection:null,effectiveMediation:null,neutralizationConfirmed:null,effectConfirmed:null,
  selectionAuthority:false};
}
export function observeInterpositionReview(prior,rootContext,groundedSupply){
 const complete=prior?.completeHour;
 const base={version:'interposition-review-v1',completeHour:complete,selectionAuthority:false,
  effectConfirmed:null,neutralizationConfirmed:null};
 if(typeof complete!=='boolean'||prior.stemForce?.completeHour!==complete||prior.relativeForce?.completeHour!==complete||
  prior.stemForce?.selectionAuthority!==false||prior.stemForce?.effectsConfirmed!==false||
  !rootContext||rootContext.status!==(complete?'diagnostic':'partial')||rootContext.completeHour!==complete||
  rootContext.selectionAuthority!==false||rootContext.rootEffectConfirmed!==null||
  !groundedSupply||groundedSupply.status!==(complete?'diagnostic':'partial')||groundedSupply.completeHour!==complete||
  groundedSupply.selectionAuthority!==false||groundedSupply.effectiveSupply!==null)return invalid(base);
 const actors=index(prior.stemForce?.occurrences,a=>a.id),rootRows=index(rootContext.occurrences,a=>a.id);
 const groups=new Map();
 if(!actors||!rootRows||actors.size!==rootRows.size||[...actors.keys()].some(id=>!rootRows.has(id)))return invalid(base);
 for(const a of actors.values()){
  if(!a.graphNodeId||!ORDER.includes(a.position)||!['visible','hidden'].includes(a.layer)||
   a.graphNodeId!==(a.layer==='visible'?a.position+':stem':a.position+':branch:'+a.element)||
   !Array.isArray(a.protectionAndMediation))return invalid(base);
  if(!groups.has(a.graphNodeId))groups.set(a.graphNodeId,[]);
  groups.get(a.graphNodeId).push(a);
 }
 const donors=index(groundedSupply.nodes,n=>n.nodeId);
 if(!donors||donors.size!==groups.size||[...groups.keys()].some(id=>!donors.has(id))||
  [...groups.keys()].some(id=>!validateNode(id,groups,donors,rootContext,complete)))return invalid(base);
 const pressures=new Map();
 for(const id of groups.keys()){
  const p=pressureFor(id,groups,donors,rootContext);if(!p)return invalid(base);pressures.set(id,p);
 }
 const candidates=new Map();
 for(const a of actors.values())for(const p of a.protectionAndMediation??[]){
  if(!['protection','mediation'].includes(p.kind)||p.target!==a.graphNodeId||p.effective!==null||
   !Array.isArray(p.edges))return invalid(base);
  const expected=p.kind==='protection'?
   [[p.helper,p.threat,'control'],[p.threat,p.target,'control']]:
   [[p.threat,p.helper,'generate'],[p.helper,p.target,'generate'],[p.threat,p.target,'control']];
  if(p.edges.length!==expected.length||![p.helper,p.threat,p.target].every(id=>groups.has(id))||
   new Set([p.helper,p.threat,p.target].map(id=>slot(groups.get(id)[0]))).size!==3)return invalid(base);
  for(let i=0;i<expected.length;i++)if(!validateEdge(p.edges[i],...expected[i],groups,donors,rootContext))return invalid(base);
  const id=JSON.stringify([p.kind,p.helper,p.threat,p.target]),signature=JSON.stringify(p.edges);
  const old=candidates.get(id);
  if(old&&old.signature!==signature)return invalid(base);
  if(old)old.sourceOccurrenceIds.push(a.id);
  else candidates.set(id,{...p,signature,sourceOccurrenceIds:[a.id]});
 }
 const paths=[],excluded=new Map();
 const day=actors.get('visible:day');
 if(!day||!day.dayReference)return invalid(base);
 for(const p of candidates.values()){
  const target=groups.get(p.target)?.[0];
  const relation=target&&elementRelation(target.element,day.element);
  const targetEligible=target?.layer==='visible'&&(target.element===day.element||
   relation.type==='generate'&&relation.direction==='left-to-right');
  if(!targetEligible){
   const reason=!target||target.layer!=='visible'?'hidden-or-branch-target':'non-supportive-visible-target';
   excluded.set(JSON.stringify([p.kind,p.helper,p.threat,p.target]),reason);
   continue;
  }
  const route=classifyPath(p,groups,donors,pressures,complete);
  paths.push(route);
 }
 paths.sort((a,b)=>a.id.localeCompare(b.id));
 const excludedReasons={};for(const reason of excluded.values())excludedReasons[reason]=(excludedReasons[reason]??0)+1;
 const summary={candidatePaths:paths.length,excludedTargetPaths:excluded.size,excludedReasons,protectionPaths:paths.filter(p=>p.kind==='protection').length,
  mediationPaths:paths.filter(p=>p.kind==='mediation').length,
  structuralScreensMet:paths.filter(p=>p.structuralScreen==='grounded-structure-screen-met').length,
  hiddenParticipantPaths:paths.filter(p=>p.blockers.includes('hidden-participant-access')).length,
  pressureBlockedPaths:paths.filter(p=>p.blockers.some(b=>b.includes('control'))).length,
  nonlocalChainPaths:paths.filter(p=>p.blockers.some(b=>b.includes('nonlocal'))).length};
 return {...base,status:complete?'diagnostic':'partial',targetScope:'day-master-and-visible-peer-resource',paths,summary,
  limitations:['candidate-paths-are-not-effective-protection-or-mediation','control-is-not-removed-by-a-path','all-shared-node-paths-are-deduplicated','helper-root-and-threat-root-are-separate','target-root-not-required-for-structural-path-observation','helper-pressure-is-a-review-blocker','threat-and-target-additional-pressure-retained','mediation-direct-control-edge-may-be-nonlocal','no-strength-score-or-role-selection']};
}
