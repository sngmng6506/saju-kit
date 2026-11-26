import {compareForceCompletionEnvelope} from '../../core/relative-force.js';
export const SHARED_FORCE_BASIS_VERSION='p1-relative-shared-basis-v1';
const ORDER=['year','month','day','hour'];
const ROOT=['exactSubstantial','anySubstantial','ownPillarSubstantial','monthSubstantial'];
const SEASON=['principalSupport','seasonSupport'];
const SUPPLY=['localRootedGeneration','localRootedPeer'];
const AXES=[...ROOT,...SEASON,...SUPPLY];
const key=(...xs)=>JSON.stringify(xs);
const unique=xs=>[...new Set(xs)].sort();
const sameSet=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const distance=(a,b)=>Math.abs(ORDER.indexOf(a)-ORDER.indexOf(b));
const validValue=x=>x===true||x===false||x===null;
// DNF: each term is a conjunction of shared primitive references,
// the list of terms is a disjunction. No summing root occurrences.
const truth=(terms,read)=>{
 let unknown=false;
 for(const term of terms){
  const values=term.map(read);
  if(values.every(x=>x===true))return true;
  if(values.every(x=>x!==false))unknown=true;
 }
 return unknown?null:false;
};
const relation=(a,b)=>compareForceCompletionEnvelope(a,b).relation;
// Build a chart-wide reference inventory once. Slot variables stand
// for hypothetical eligibility as an observed basis, NOT actual root
// preservation or allocation. Contact gates are independent access
// placeholders, shared by node, not resolution of a combination.
export function buildSharedForceBasis(prior,root){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:SHARED_FORCE_BASIS_VERSION,completeHour:complete,selectionAuthority:false,forceComparison:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,primitives:[],profiles:[]});
 if(typeof complete!=='boolean'||root?.completeHour!==complete||root.status!==status||root.selectionAuthority!==false||root.rootEffectConfirmed!==null)return empty('upstream');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),slots=index(root.slots,s=>s.id),rows=index(root.occurrences,a=>a.id);
 if(!actors||!slots||!rows||actors.size!==rows.size)return empty('identity');
 const visible=[...actors.values()].filter(a=>a.layer==='visible'),hidden=[...actors.values()].filter(a=>a.layer==='hidden');
 if(!sameSet(visible.map(a=>a.position),complete?ORDER:ORDER.slice(0,3))||hidden.length!==slots.size||
  [...actors.values()].some(a=>!ORDER.includes(a.position)||!Array.isArray(a.contacts)||!['visible','hidden'].includes(a.layer)||
   a.id!==(a.layer==='visible'?'visible:'+a.position:'hidden:'+a.position+':'+a.stem)||
   a.graphNodeId!==(a.layer==='visible'?a.position+':stem':a.position+':branch:'+a.element)||!rows.has(a.id)))return empty('actor-binding');
 const primitives=new Map(),groups=new Map();
 const put=(id,kind,value,reference)=>{primitives.set(id,{id,kind,value,reference});return id;};
 for(const a of actors.values()){
  if(!groups.has(a.graphNodeId))groups.set(a.graphNodeId,[]);
  groups.get(a.graphNodeId).push(a);
 }
 for(const a of hidden){
  const s=slots.get(a.id);
  if(!s||s.position!==a.position||s.stem!==a.stem||s.element!==a.element||s.role!==a.hiddenRole||s.effectiveRoot!==null||
   !['principal','middle','residual'].includes(s.role)||!['uncontested-substantial-observation','clash-exposed','formation-contested','residual-context'].includes(s.state)||
   s.state==='uncontested-substantial-observation'&&s.role==='residual'||s.state==='residual-context'&&s.role!=='residual')return empty('slot-binding');
  if(s.role!=='residual')put(key('slot',s.id),'substantial-slot-basis',s.state==='uncontested-substantial-observation'?true:null,s.id);
 }
 const roots=a=>[...slots.values()].filter(s=>s.element===a.element&&s.role!=='residual');
 const terms=rs=>rs.map(s=>[key('slot',s.id)]);
 const rootTerms=a=>{const rs=roots(a);return {exactSubstantial:terms(rs.filter(s=>s.stem===a.stem)),anySubstantial:terms(rs),
  ownPillarSubstantial:terms(rs.filter(s=>s.position===a.position)),monthSubstantial:terms(rs.filter(s=>s.position==='month'))};};
 for(const a of visible){
  const r=rows.get(a.id),rs=roots(a),all=rs.map(s=>s.id);
  if(!sameSet(r.uncontestedRootIds,rs.filter(s=>s.state==='uncontested-substantial-observation').map(s=>s.id))||
   !sameSet(r.contestedRootIds,rs.filter(s=>s.state!=='uncontested-substantial-observation').map(s=>s.id))||
   !Array.isArray(a.roots)||!sameSet(a.roots.filter(s=>s.role!=='residual').map(s=>'hidden:'+s.position+':'+s.stem),all))return empty('root-coverage');
 }
 const donorTerms=new Map();
 for(const [nodeId,members] of groups){
  const a=members[0],isVisible=a.layer==='visible';
  if(members.some(m=>m.layer!==a.layer||m.element!==a.element||m.position!==a.position||!sameSet(m.contacts,a.contacts))||
   isVisible&&members.length!==1)return empty('donor-identity');
  const rs=isVisible?roots(a):members.map(m=>slots.get(m.id)).filter(s=>s.role!=='residual');
  const gate=a.contacts.length&&rs.length?put(key('contact-access',nodeId),'contact-access-assumption',null,nodeId):null;
  donorTerms.set(nodeId,terms(rs).map(t=>gate?[...t,gate]:t));
 }
 const profiles=[];
 for(const a of visible){
  const r=rows.get(a.id),p=prior.relativeForce?.profiles?.[a.id];
  if(!p||!r?.sensitivityAxes||Object.keys(r.sensitivityAxes).length!==AXES.length||AXES.some(k=>!validValue(r.sensitivityAxes[k]))||
   SEASON.some(k=>typeof p.axes?.[k]!=='boolean'||p.axes[k]!==r.sensitivityAxes[k]))return empty('profile');
  const axes=rootTerms(a),donors={};
  for(const k of SEASON)axes[k]=p.axes[k]?[[]]:[];
  for(const [axis,field,raw] of [
   ['localRootedGeneration','generation',(a.generationReceived??[]).filter(e=>e.local).map(e=>e.sourceEvidence)],
   ['localRootedPeer','peer',(a.peers??[]).filter(n=>distance(n.position,a.position)<=1)]]){
   if(raw.some(n=>!n||!groups.has(n.id)||!sameSet(n.contacts,groups.get(n.id)[0].contacts)))return empty('donor-binding');
   const ids=unique(raw.map(n=>n.id)),s=r.localSupply?.[field];
   const read=id=>primitives.get(id).value;
   const obs=ids.filter(id=>truth(donorTerms.get(id),read)===true),unknown=ids.filter(id=>truth(donorTerms.get(id),read)===null);
   // RootContext intentionally marks a contacted hidden donor as unknown
   // even if all its substantial slots are contested. DNF preserves that.
   if(!s||!sameSet(s.observedIds,obs)||!sameSet(s.unresolvedIds,unknown))return empty('supply-parity');
   donors[axis]=ids;axes[axis]=ids.flatMap(id=>donorTerms.get(id));
  }
  const value=k=>truth(axes[k],id=>primitives.get(id).value);
  // Missing hour may contribute entirely new slots/nodes, so only
  // verify definite positive observations and retain partial scope.
  if(AXES.some(k=>complete?value(k)!==r.sensitivityAxes[k]:
   (SEASON.includes(k)?value(k)!==r.sensitivityAxes[k]:(value(k)===true)!==(r.sensitivityAxes[k]===true))))return empty('axis-parity');
  profiles.push({actorId:a.id,axes,observedAxes:{...r.sensitivityAxes},donors});
 }
 return {...base,status,reason:null,primitives:[...primitives.values()],profiles,
  limitations:['shared-observation-basis-not-force-allocation','independent-contact-assumptions','no-actual-root-preservation','partial-no-completion']};
}
// Exact enumeration within the declared abstraction; no result is
// published when the budget is exceeded. Irrelevant variables are
// removed before enumeration by simplifying DNF with fixed facts.
export function compareSharedForceBasis(basis,leftId,rightId){
 const empty=reason=>({status:'invalid-evidence',reason,possibleRelations:null,invariantRelation:null,forceComparison:null});
 if(!basis||!['diagnostic','partial'].includes(basis.status)||basis.forceComparison!==null||basis.selectionAuthority!==false||leftId===rightId)return empty('basis');
 const ps=index(basis.primitives,p=>p.id),profiles=index(basis.profiles,p=>p.actorId),a=profiles?.get(leftId),b=profiles?.get(rightId);
 if(!ps||!a||!b||[...ps.values()].some(p=>!validValue(p.value)))return empty('identity');
 for(const p of [a,b])if(!p.axes||!p.observedAxes||!sameSet(Object.keys(p.axes),AXES)||AXES.some(k=>!validValue(p.observedAxes[k])||
  !Array.isArray(p.axes[k])||p.axes[k].some(t=>!Array.isArray(t)||new Set(t).size!==t.length||t.some(id=>!ps.has(id)))))return empty('formula');
 const base={version:SHARED_FORCE_BASIS_VERSION,leftId,rightId,possibleRelations:null,invariantRelation:null,forceComparison:null,
  actualControlState:'unresolved',selectionAuthority:false,abstraction:'shared-slot-and-contact-eligibility-completions'};
 if(basis.status==='partial')return {...base,status:'partial',reason:'missing-hour',scenarioCount:0};
 const read=id=>ps.get(id).value;
 if([a,b].some(p=>AXES.some(k=>truth(p.axes[k],read)!==p.observedAxes[k])))return empty('axis-parity');
 const simplify=ts=>{
  if(ts.some(t=>t.every(id=>read(id)===true)))return [[]];
  return ts.filter(t=>t.every(id=>read(id)!==false)).map(t=>t.filter(id=>read(id)===null));
 };
 const left=Object.fromEntries(AXES.map(k=>[k,simplify(a.axes[k])])),right=Object.fromEntries(AXES.map(k=>[k,simplify(b.axes[k])]));
 const variables=unique([...Object.values(left),...Object.values(right)].flat(2));
 const uses=id=>[...AXES.flatMap(k=>left[k].some(t=>t.includes(id))?['left:'+k]:[]),...AXES.flatMap(k=>right[k].some(t=>t.includes(id))?['right:'+k]:[])];
 const sharedVariables=variables.map(id=>({id,axes:uses(id)})).filter(x=>x.axes.length>1);
 const abstract=compareForceCompletionEnvelope(a.observedAxes,b.observedAxes);
 if(variables.length>16)return {...base,status:'unavailable',reason:'scenario-budget',scenarioCount:0,variables,sharedVariables,independentRelations:abstract.possibleRelations};
 const possible=new Set(),witnesses=new Map(),positions=new Map(variables.map((id,i)=>[id,i]));
 const count=2**variables.length;
 for(let mask=0;mask<count;mask++){
  const get=id=>Boolean(mask&(1<<positions.get(id)));
  const evalAxes=x=>Object.fromEntries(AXES.map(k=>[k,truth(x[k],get)]));
  const r=relation(evalAxes(left),evalAxes(right));
  if(!abstract.possibleRelations.includes(r))return empty('completion-parity');
  possible.add(r);if(!witnesses.has(r))witnesses.set(r,Object.fromEntries(variables.map(id=>[id,get(id)])));
 }
 const possibleRelations=abstract.possibleRelations.filter(r=>possible.has(r));
 return {...base,status:'diagnostic',reason:null,scenarioCount:count,variables,sharedVariables,
  independentRelations:abstract.possibleRelations,possibleRelations,invariantRelation:possibleRelations.length===1?possibleRelations[0]:null,
  excludedRelations:abstract.possibleRelations.filter(r=>!possible.has(r)),witnesses:possibleRelations.map(relation=>({relation,assignment:witnesses.get(relation)}))};
}
