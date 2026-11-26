import {evaluateScenarioSpace} from './outcome-scenario-space.js';
const key=(...xs)=>JSON.stringify(xs);
const elements=['wood','fire','earth','metal','water'];
const positions=['year','month','day','hour'];
const roles=['principal','middle','residual'];
const states=['uncontested-substantial-observation','clash-exposed','formation-contested','residual-context'];
const map=(xs,f)=>new Map(xs.map(x=>[f(x),x]));
const valid=x=>typeof x==='string'&&x.length>0;
const eq=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
const variable=id=>({op:'var',id});
const any=args=>({op:'any',args});
const not=arg=>({op:'not',arg});
const retentionId=id=>key('slot-retained',id);
export const ROOT_PRESERVATION_VERSION='p3-root-preservation-v1';
// Slot inventory is shared across all same-element occurrences. The
// physical retention hypothesis is not an actor access or depth verdict.
export function reviewRootPreservation({prior,root,element}={}){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:ROOT_PRESERVATION_VERSION,completeHour:complete,element,selectionAuthority:false,effective:null,actualPreservationState:'unresolved',actualDepthState:'unresolved'};
 const empty=reason=>({...base,status:'invalid-evidence',reason,slots:[],actors:[],sharedSlots:[],scenario:null});
 if(typeof complete!=='boolean'||!elements.includes(element)||root?.status!==status||root.completeHour!==complete||root.selectionAuthority!==false||root.rootEffectConfirmed!==null)return empty('upstream');
 const all=prior.stemForce?.occurrences;
 if(!Array.isArray(all)||!Array.isArray(root.slots)||!Array.isArray(root.occurrences)||[all,root.slots,root.occurrences].some(xs=>xs.some(x=>!x||!valid(x.id))||new Set(xs.map(x=>x.id)).size!==xs.length))return empty('identity');
 const hidden=all.filter(a=>a.layer==='hidden'),visible=all.filter(a=>a.layer==='visible'&&a.element===element),slotsById=map(root.slots,s=>s.id),occurrences=map(root.occurrences,a=>a.id);
 if(!eq(root.slots.map(s=>s.id),hidden.map(a=>a.id))||!eq(root.occurrences.map(a=>a.id),all.map(a=>a.id)))return empty('inventory');
 for(const a of hidden){
  const s=slotsById.get(a.id);
  if(s.id!==keyId(a)||!positions.includes(s.position)||s.position!==a.position||s.stem!==a.stem||s.element!==a.element||s.role!==a.hiddenRole||!roles.includes(s.role)||!states.includes(s.state)||s.effectiveRoot!==null||
   s.state==='uncontested-substantial-observation'&&s.role==='residual'||s.state==='residual-context'&&s.role!=='residual')return empty('slot-binding');
  // Native root owners provide exact incident IDs; reject inconsistent
  // metadata rather than silently infer loss or restoration.
  if(!Array.isArray(s.clashIds)||!Array.isArray(s.competingTargetFormationIds)||!Array.isArray(s.reliefFormationIds)||!Array.isArray(s.formationIds)||
   [s.clashIds,s.competingTargetFormationIds,s.reliefFormationIds,s.formationIds].some(xs=>xs.some(x=>!valid(x))||new Set(xs).size!==xs.length)||
   s.competingTargetFormationIds.some(id=>!s.formationIds.includes(id))||
   s.state!==(s.clashIds.length?'clash-exposed':s.competingTargetFormationIds.length?'formation-contested':s.role==='residual'?'residual-context':'uncontested-substantial-observation'))return empty('contact-binding');
 }
 const slots=root.slots.filter(s=>s.element===element).map(s=>({slotId:s.id,position:s.position,stem:s.stem,role:s.role,
  context:s.state,clashIds:[...s.clashIds],formationIds:[...s.formationIds],competingTargetFormationIds:[...s.competingTargetFormationIds],
  reliefCandidateIds:[...s.reliefFormationIds],retentionVariableId:s.role==='residual'?null:retentionId(s.id),
  actualPreservationState:'unresolved',actualAccessState:'unresolved',actualDepthState:'unresolved'}));
 const substantial=slots.filter(s=>s.role!=='residual'),actors=[];
 for(const a of visible){
  const r=occurrences.get(a.id);
  const clean=substantial.filter(s=>s.context==='uncontested-substantial-observation').map(s=>s.slotId),contested=substantial.filter(s=>s.context!=='uncontested-substantial-observation').map(s=>s.slotId);
  if(a.id!=='visible:'+a.position||!eq(r.uncontestedRootIds,clean)||!eq(r.contestedRootIds,contested))return empty('root-coverage');
  actors.push({actorId:a.id,roots:slots.map(s=>({slotId:s.slotId,match:s.stem===a.stem?'exact-stem':'same-element',position:s.position,
   distance:Math.abs(positions.indexOf(a.position)-positions.indexOf(s.position)),role:s.role,retentionVariableId:s.retentionVariableId})),actualAccessState:'unresolved',actualDepthState:'unresolved'});
 }
 const sharedSlots=slots.map(s=>({slotId:s.slotId,actorIds:actors.filter(a=>a.roots.some(r=>r.slotId===s.slotId)).map(a=>a.actorId),independentCapacityConfirmed:null})).filter(s=>s.actorIds.length>1);
 const variables=substantial.map(s=>({id:s.retentionVariableId,value:null}));
 const formula=xs=>any(xs.map(s=>variable(s.retentionVariableId)));
 const queries=[{id:'any-substantial-retained',formula:formula(substantial)},
  {id:'all-substantial-unavailable',formula:not(formula(substantial))},
  ...['principal','middle'].map(role=>({id:role+'-retained',formula:formula(substantial.filter(s=>s.role===role))})),
  {id:'month-substantial-retained',formula:formula(substantial.filter(s=>s.position==='month'))},
  ...actors.flatMap(a=>['exact-stem','same-element'].map(match=>({id:key('actor-retained-basis',a.actorId,match),formula:formula(a.roots.filter(r=>r.role!=='residual'&&r.match===match))})))];
 const scenario=evaluateScenarioSpace({scope:complete?'complete':'partial',variables,queries});
 if(!['diagnostic','partial','unavailable'].includes(scenario.status))return empty('scenario');
 return {...base,status,reason:null,slots,actors,sharedSlots,scenario,substantialSlotIds:substantial.map(s=>s.slotId),
  rootInventoryState:!complete?'partial':substantial.length?'substantial-slots-observed':'no-substantial-slot-observed',
  limitations:['retention-not-access-or-depth','clean-not-confirmed-preservation','clash-not-loss','relief-candidate-not-restoration','residual-excluded-from-substantial-scenario-not-erased','shared-slot-not-independent-capacity','no-strength-authority']};
}
function keyId(a){return 'hidden:'+a.position+':'+a.stem;}
