import {elementRelation} from '../../core/elements.js';
import {edgeKey} from './outcome-role-contract.js';
const order=['year','month','day','hour'];
const distance=(a,b)=>Math.abs(order.indexOf(a)-order.indexOf(b));
const uniq=xs=>[...new Set(xs)].sort();
const index=(xs,key)=>Array.isArray(xs)&&new Set(xs.map(key)).size===xs.length?new Map(xs.map(x=>[key(x),x])):null;
const rootIds=(r,k)=>r?.[k]??[];
const hasSame=(a,b)=>JSON.stringify(uniq(a))===JSON.stringify(uniq(b));
const supplies=(a,b)=>{const r=elementRelation(a,b);return r.type==='generate'&&r.direction==='left-to-right';};
// One-hop rooted local supply, grounded in the existing graph. A branch
// donor is one aggregate physical node; only its own constituents may
// ground the path. No recursive inference, multiplication, or allocation.
export function observeGroundedSupply(prior,rootContext){
 const complete=prior.completeHour;
 const base={version:'grounded-supply-review-v1',completeHour:complete,selectionAuthority:false,effectiveSupply:null};
 const empty=status=>({...base,status,occurrences:[],actions:[]});
 if(!rootContext||rootContext.status==='invalid-evidence'||rootContext.completeHour!==complete)return empty('invalid-evidence');
 const actors=index(prior.stemForce?.occurrences,o=>o.id),roots=index(rootContext.occurrences,o=>o.id),slots=index(rootContext.slots,o=>o.id);
 const raw=index(prior.relativeForce?.edges,e=>edgeKey(e.from,e.to,e.kind));
 if(!actors||!roots||!slots||!raw||actors.size!==roots.size||
  [...actors.keys()].some(k=>!roots.has(k)))return empty('invalid-evidence');
 const graph=new Map();
 for(const a of actors.values()){
  const r=roots.get(a.id);
  if(!order.includes(a.position)||!['visible','hidden'].includes(a.layer)||r.layer!==a.layer||!a.graphNodeId||
   a.graphNodeId!==(a.layer==='visible'?a.position+':stem':a.position+':branch:'+a.element)||
   (a.layer==='hidden'&&(!slots.has(a.id)||slots.get(a.id).element!==a.element)))return empty('invalid-evidence');
  const literal=index(a.roots,x=>'hidden:'+x.position+':'+x.stem),projected=index(r.roots,x=>x.id);
  if(!literal||!projected||literal.size!==projected.size||[...literal.keys()].some(id=>!projected.has(id)))return empty('invalid-evidence');
  const intact=[],contested=[];
  for(const [id,x] of literal){
   const slot=slots.get(id),p=projected.get(id);
   if(!slot||slot.element!==a.element||slot.role!==x.role||p.role!==x.role||p.state!==slot.state)return empty('invalid-evidence');
   if(x.role!=='residual')(slot.state==='uncontested-substantial-observation'?intact:contested).push(id);
  }
  if(!hasSame(intact,rootIds(r,'uncontestedRootIds'))||!hasSame(contested,rootIds(r,'contestedRootIds'))||
   r.rootAxes.anySubstantial!==(intact.length?true:contested.length||!complete?null:false))return empty('invalid-evidence');
  if(!graph.has(a.graphNodeId))graph.set(a.graphNodeId,[]);
  graph.get(a.graphNodeId).push(a);
 }
 if(slots.size!==[...actors.values()].filter(a=>a.layer==='hidden').length)return empty('invalid-evidence');
 const donors=new Map();
 for(const [id,members] of graph){
  const a=members[0],visible=a.layer==='visible';
  if(members.some(b=>b.position!==a.position||b.layer!==a.layer||b.element!==a.element||!hasSame(b.contacts,a.contacts))||visible&&members.length!==1)return empty('invalid-evidence');
  const r=roots.get(a.id);
  const local=visible?[]:members.map(b=>slots.get(b.id)).filter(s=>s.role!=='residual');
  const grounded=visible?rootIds(r,'uncontestedRootIds'):local.filter(s=>s.state==='uncontested-substantial-observation').map(s=>s.id);
  const contested=visible?rootIds(r,'contestedRootIds'):local.filter(s=>s.state!=='uncontested-substantial-observation').map(s=>s.id);
  const state=grounded.length&&!a.contacts.length?'grounded-observation':grounded.length||contested.length?'context-review':complete?'no-substantial-root-observed':'partial';
  donors.set(id,{nodeId:id,position:a.position,element:a.element,kind:visible?'visible-stem':'local-branch-constituents',
   occurrenceIds:members.map(b=>b.id),groundedRootIds:uniq(grounded),contestedRootIds:uniq(contested),contacts:[...a.contacts],state,
   independentSupplyConfirmed:null});
 }
 const pressure=a=>{
  const ids=uniq((a.controlReceived??[]).filter(e=>e.local).map(e=>e.from));
  return ids.map(id=>({nodeId:id,donorState:donors.get(id)?.state??'context-review'}));
 };
 const pressured=xs=>xs.some(p=>p.donorState!=='no-substantial-root-observed');
 const occurrences=[];
 for(const a of actors.values()){
  const r=roots.get(a.id),directRootIds=rootIds(r,'uncontestedRootIds'),paths=[];
  const incoming=index((a.generationReceived??[]).filter(e=>e.local),e=>e.from);
  if(!incoming)return empty('invalid-evidence');
  const observed=r.localSupply?.generation?.observedIds,unresolved=r.localSupply?.generation?.unresolvedIds;
  if(!Array.isArray(observed)||!Array.isArray(unresolved)||new Set([...observed,...unresolved]).size!==observed.length+unresolved.length||
   [...observed,...unresolved].some(id=>!incoming.has(id)))return empty('invalid-evidence');
  for(const [id,e] of incoming){
   const donor=donors.get(id),members=graph.get(id);
   if(!donor||e.to!==a.graphNodeId||e.type!=='generate'||id===a.graphNodeId||distance(donor.position,a.position)>1||
    e.sourceEvidence?.id!==id||e.targetEvidence?.id!==a.graphNodeId||!supplies(donor.element,a.element))return empty('invalid-evidence');
   // Respect existing contextual local-supply classification; never
   // promote an aggregate graph source beyond the upstream observation.
   const upstream=observed.includes(id)?'observed':unresolved.includes(id)?'unresolved':'not-observed';
   if(upstream==='observed'&&donor.state!=='grounded-observation')return empty('invalid-evidence');
   const sourcePressure=pressure(members[0]),recipientPressure=pressure(a);
   const concerns=[];
   if(a.layer!=='visible')concerns.push('hidden-recipient-access');
   if(!complete)concerns.push('missing-hour');
   if(upstream!=='observed')concerns.push('donor-supply-not-established');
   if(a.contacts.length)concerns.push('recipient-contact');
   if(pressured(sourcePressure))concerns.push('donor-pressure-review');
   if(pressured(recipientPressure))concerns.push('recipient-pressure-review');
   // No target direct-root prerequisite for structural generation.
   const readiness=concerns.length?'context-review':'grounded-local-path-screen-met';
   paths.push({id:JSON.stringify([id,a.id]),donor,recipientId:a.id,graphEdge:{from:id,to:a.graphNodeId,kind:'generate'},
    upstream,readiness,concerns,sourcePressure,recipientPressure,recipientRootRequiredForObservation:false,effectiveSupply:null});
  }
  occurrences.push({id:a.id,layer:a.layer,directRoot:{state:r.rootAxes.anySubstantial,uncontestedRootIds:[...directRootIds],
   contestedRootIds:[...rootIds(r,'contestedRootIds')],preservationConfirmed:null},
   seasonal:{...r.seasonal},paths,
   groundedPathIds:paths.filter(p=>p.upstream==='observed'&&a.layer==='visible').map(p=>p.id),
   screenedPathIds:paths.filter(p=>p.readiness==='grounded-local-path-screen-met').map(p=>p.id),
   effectiveSupply:null});
 }
 const byId=new Map(occurrences.map(a=>[a.id,a]));
 // Compact projection for each existing literal action. Keep supply and
 // control comparison separate, never replace legacy mechanism status.
 const actions=[];
 for(const e of raw.values()){
  const a=byId.get(e.from),b=byId.get(e.to);
  if(!a||!b||e.effective!==null||!['control','generate'].includes(e.kind))return empty('invalid-evidence');
  const source=actors.get(e.from),target=actors.get(e.to);
  const relation=elementRelation(source.element,target.element);
  if(relation.type!==e.kind||relation.direction!=='left-to-right'||e.id!==e.from+'>'+e.to)return empty('invalid-evidence');
  const direct=a.layer==='visible'&&a.directRoot.state===true;
  const indirect=a.layer==='visible'&&a.screenedPathIds.length>0;
  const sourceBasis=!complete?'partial':a.layer!=='visible'?'hidden-access-review':direct?'direct-root-observed':indirect?'grounded-indirect-path-observed':a.groundedPathIds.length?'indirect-path-context-review':'no-screened-source-basis';
  const contextBlockers=(e.blockers??[]).filter(b=>!['source-substantial-root-not-established','target-substantial-root-not-established','relative-evidence-conflict','relative-evidence-unresolved','target-evidence-dominates-control-source'].includes(b));
  const controlComparison=e.kind==='control'?e.relative?.relation??null:null;
  const sourcePressure=pressure(source),targetPressure=pressure(target);
  // Keep all local controller observations, including a recipient under
  // review. The screen is not an inference of sufficient throughput.
  const structuralGenerationScreen=complete&&e.kind==='generate'&&b.layer==='visible'&&(direct||indirect)&&
   !contextBlockers.length&&!pressured(sourcePressure)&&!pressured(targetPressure);
  actions.push({edgeId:e.id,from:e.from,to:e.to,kind:e.kind,sourceBasis,sourceGroundedPathIds:[...a.groundedPathIds],
   sourceScreenedPathIds:[...a.screenedPathIds],targetDirectRootState:b.directRoot.state,targetAccess:b.layer==='visible'?'visible':'hidden-access-review',
   contextBlockers,sourcePressure,targetPressure,relativeProfile:e.relative?.relation??null,controlComparison,
   generationScreen:structuralGenerationScreen?'grounded-generation-context-screen-met':'unresolved',
   effective:null,selectionAuthority:false});
 }
 return {...base,status:complete?'diagnostic':'partial',occurrences,actions,
  limitations:['one-hop-rooted-supply-only','branch-donor-own-constituents-only','no-independent-root-budget','no-target-root-prerequisite-for-generation-observation','pressure-not-cancelled','no-control-or-effect-verdict','legacy-mechanism-unchanged']};
}
