import {auditResidualPressure} from './pattern-residual-pressure.mjs';
import {positiveProofFrontier} from '../../src/features/pattern/outcome-positive-frontier.js';
import {queryPositiveProofConstraints} from '../../src/features/pattern/outcome-frontier-constraints.js';
const key=(...xs)=>JSON.stringify(xs);
const kinds=['incoming-control','outgoing-generation','wealth-demand','resource-interference'];
const physicalKinds=['slot-retained','root-access','supply-operation'];
function physical(id){
 try{const v=JSON.parse(id);return Array.isArray(v)&&physicalKinds.includes(v[0])&&v.slice(1).every(x=>typeof x==='string'&&x.length)?v[0]:null;}catch{return null;}
}
// Research-only joint scope: all existing local pressure rows, not
// all physical interactions in the natal chart.
export function auditJointResidualPressure(input){
 const base={version:'p3-joint-residual-pressure-v1',selectionAuthority:false,effective:null,actualResidualState:'unresolved',actualMagnitudeComparison:'unresolved',actualStrengthState:'unresolved'};
 const empty=(status,reason)=>({...base,status,reason,groups:[],dependencies:[],summary:null});
 const source=auditResidualPressure(input,{includeProof:true});
 if(source.status!=='diagnostic')return empty(source.status,source.reason);
 try{
  const proof=source.proof,frontier=positiveProofFrontier(proof.packet);
  if(frontier.status!=='diagnostic')return empty(frontier.status,frontier.reason);
  const fs=new Map(frontier.frontiers.map(f=>[f.id,f.terms]));
  const rows=proof.rows;
  for(const r of rows){
   if(!kinds.includes(r.kind)||!Array.isArray(fs.get(r.pressure))||!Array.isArray(fs.get(r.fullRelief))||r.actualResidualState!=='unresolved')return empty('invalid-evidence','row-contract');
  }
  const possible=r=>fs.get(r.pressure).length>0,coverable=r=>fs.get(r.fullRelief).length>0;
  const groups=[],queries=[];
  function group(id,kind,members,extra={}){
   if(!members.length)return;
   const viable=members.filter(possible),relievable=members.filter(coverable);
   const g={id,kind,...extra,pressureIds:members.map(r=>r.id),individuallyPossibleIds:viable.map(r=>r.id),individuallyRelievableIds:relievable.map(r=>r.id),tests:[]};
   const add=(name,required,excluded=[],fixed=[])=>{
    const q={id:key(id,name),required:[...new Set(required)],excluded:[...new Set(excluded)],fixed};
    queries.push(q);g.tests.push({name,queryId:q.id});
   };
   add('all-candidates-active',members.map(r=>r.pressure));
   if(viable.length){
    add('all-viable-active',viable.map(r=>r.pressure));
    add('all-viable-uncovered',viable.map(r=>r.pressure),viable.map(r=>r.fullRelief));
    add('all-viable-fully-relieved',viable.map(r=>r.fullRelief));
   }
   if(relievable.length)add('all-relievable-relieved-with-other-viable-active',[...relievable.map(r=>r.fullRelief),...viable.filter(r=>!coverable(r)).map(r=>r.pressure)]);
   // An exact shared protected route can be subject to different pressure
   // outcomes. Require both pressures and prohibit only the second relief.
   if(kind==='shared-protected-supply')for(const a of relievable)for(const b of viable){
    if(a.id===b.id)continue;
    add(key('mixed-relief',a.id,b.id),[a.fullRelief,b.pressure],[b.fullRelief]);
   }
   groups.push(g);
  }
  group('all-local-pressures','chart',rows);
  for(const kind of kinds)group(kind,'pressure-kind',rows.filter(r=>r.kind===kind));
  const supplyIds=[...new Set(rows.map(r=>r.protectedSupplyActionId).filter(Boolean))];
  for(const id of supplyIds){
   const members=rows.filter(r=>r.protectedSupplyActionId===id);
   if(members.length>1)group(key('shared-protected-supply',id),'shared-protected-supply',members,{protectedSupplyActionId:id});
  }
  // Dependency inventory is exact within the monotone proof model. A
  // common variable can be used by different proofs without representing
  // a finite or independently allocated resource.
  const outcomes=rows.flatMap(r=>[{pressureId:r.id,outcome:'pressure',terms:fs.get(r.pressure),propositionId:r.pressure},{pressureId:r.id,outcome:'full-relief',terms:fs.get(r.fullRelief),propositionId:r.fullRelief}]).filter(r=>r.terms.length);
  const uses=new Map();
  for(const o of outcomes)for(const id of new Set(o.terms.flat())){
   const kind=physical(id);if(!kind)continue;
   if(!uses.has(id))uses.set(id,{variableId:id,kind,participants:[]});
   uses.get(id).participants.push({pressureId:o.pressureId,outcome:o.outcome,propositionId:o.propositionId,requiredInEveryProof:o.terms.every(t=>t.includes(id))});
  }
  const dependencies=[...uses.values()].filter(d=>new Set(d.participants.map(p=>p.pressureId)).size>1).map(d=>({...d,
   lostUnderExplicitRemoval:d.participants.filter(p=>p.requiredInEveryProof).map(p=>({pressureId:p.pressureId,outcome:p.outcome})),
   survivingAlternativeUnderRemoval:d.participants.filter(p=>!p.requiredInEveryProof).map(p=>({pressureId:p.pressureId,outcome:p.outcome})),actualCapacityState:'unresolved'}));
  const q=queryPositiveProofConstraints(proof.packet,queries);
  if(q.status!=='diagnostic')return empty(q.status,q.reason);
  const byId=new Map(q.queries.map(q=>[q.id,q]));
  for(const g of groups)for(const t of g.tests){
   const result=byId.get(t.queryId);
   if(!result)return empty('invalid-evidence','query-coverage');
   t.feasible=result.feasible;t.witness=result.witness;
  }
  return {...base,status:'diagnostic',reason:null,groups,dependencies,
   summary:{pressures:rows.length,viable:rows.filter(possible).length,relievable:rows.filter(coverable).length,groups:groups.length,queries:queries.length,
    feasibleQueries:q.queries.filter(q=>q.feasible).length,sharedVariables:dependencies.length,sharedRequiredVariables:dependencies.filter(d=>d.lostUnderExplicitRemoval.length>0).length,
    sharedProtectedSupplies:groups.filter(g=>g.kind==='shared-protected-supply').length,actualEffectsConfirmed:0},
   limitations:['local-scope-only','Boolean-completion-not-actual-feasibility','shared-variable-not-capacity','no-physical-exclusion-or-allocation','not-partial-relief-quantity','no-strength-authority']};
 }catch(e){return empty('invalid-evidence',String(e?.message??e));}
}
