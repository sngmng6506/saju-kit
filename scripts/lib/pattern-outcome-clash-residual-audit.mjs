const sorted=xs=>[...xs].sort();
const uniq=xs=>[...new Set(xs)].sort();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const equalIds=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&same(sorted(a),sorted(b));
const noAuthority=x=>x&&x.damageConfirmed===null&&x.preservationConfirmed===null&&x.reliefConfirmed===null&&x.effective===null;
const bump=(o,k)=>o[k]=(o[k]??0)+1;
export function summarizeClashResidual(c,m,partial){
 const base={id:c.id,partial,effectConfirmed:null},errors=[],counts={clashes:0,slots:0,substantialSlots:0,residualSlots:0,reliefAlternatives:0,coveredSlots:0,occurrences:0,actions:0,residualOnlyActions:0,sharedExposedRoots:0},contexts={};
 const r=m?.clashResidualContext,root=m?.rootContext,supply=m?.groundedSupply,capacity=m?.roleCapacity?.occurrences,branch=m?.branchPressure;
 if(!noAuthority(r)||r.status!==(partial?'partial':'diagnostic')||r.completeHour!==!partial||r.selectionAuthority!==false||
  ![r.clashes,r.slots,r.occurrences,r.actions,r.sharedExposedRoots,root?.clashes,root?.slots,root?.occurrences,supply?.actions,supply?.occurrences,capacity,branch?.formations].every(Array.isArray))return {...base,errors:['clash-residual-contract']};
 const exposed=root.slots.filter(s=>s.clashIds.length),slotMap=new Map(exposed.map(s=>[s.id,s])),byId=new Map(capacity.map(a=>[a.id,a])),roots=new Map(root.occurrences.map(a=>[a.id,a])),obs=new Map(supply.occurrences.map(a=>[a.id,a]));
 const clashes=new Map(root.clashes.map(c=>[c.clashId,c])),forms=new Map(branch.formations.map(f=>[f.formationId,f])),actors=capacity.filter(a=>a.layer==='visible'&&roots.get(a.id)?.roots.some(x=>slotMap.has(x.id)));
 const ids=(xs,k)=>xs.map(x=>x[k]);
 if(!equalIds(ids(r.clashes,'clashId'),ids(root.clashes,'clashId'))||!equalIds(ids(r.slots,'id'),ids(exposed,'id'))||!equalIds(ids(r.occurrences,'id'),ids(actors,'id')))errors.push('clash-residual-inventory');
 const options=(c,s)=>c.alternatives.map(a=>{const f=forms.get(a.formationId);return {formationId:a.formationId,side:a.sharedPosition===s.position?'root-side':'opposite-side',
  rootPositionParticipates:f.positions.includes(s.position),targetElement:f.target,rootElementDiffersFromTarget:f.positions.includes(s.position)&&f.target!=null&&f.target!==s.element,
  hypothesis:a.hypothesis,reliefConfirmed:null};});
 for(const q of r.clashes){
  counts.clashes++;counts.reliefAlternatives+=q.alternatives.length;
  const c=clashes.get(q.clashId);
  if(!c||!noAuthority(q)||!same(q.positions,c.positions)){errors.push('clash-residual-clash:'+q.clashId);continue;}
  const endpoints=c.positions.map(position=>({position,slotIds:root.slots.filter(s=>s.position===position).map(s=>s.id),damageConfirmed:null}));
  const alternatives=c.alternatives.map(a=>{const f=forms.get(a.formationId);return {formationId:a.formationId,classification:f.classification,positions:[...f.positions],sharedPosition:a.sharedPosition,
   oppositePosition:c.positions.find(p=>p!==a.sharedPosition),targetElement:f.target,otherClashIds:a.otherClashIds,remainingClashIds:a.remainingClashIds,competingFormationIds:a.competingFormationIds,hypothesis:a.hypothesis,reliefConfirmed:null};});
  if(!same(q.endpoints,endpoints)||!same(q.alternatives,alternatives))errors.push('clash-residual-relief:'+q.clashId);
 }
 for(const q of r.slots){
  counts.slots++;counts[q.substantial?'substantialSlots':'residualSlots']++;if(q.allIncidentClashesHaveCandidate)counts.coveredSlots++;
  const s=slotMap.get(q.id);
  if(!s||!noAuthority(q)||['position','stem','element','role'].some(k=>q[k]!==s[k])||q.substantial!==(s.role!=='residual')||
   !same(q.clashIds,s.clashIds)||!same(q.formationIds,s.formationIds)||!same(q.competingTargetFormationIds,s.competingTargetFormationIds)){errors.push('clash-residual-slot:'+q.id);continue;}
  const expected=root.clashes.filter(c=>c.positions.includes(s.position)).map(c=>({clashId:c.clashId,options:options(c,s)}));
  const uncovered=expected.filter(a=>!a.options.length).map(a=>a.clashId);
  const context=partial?'partial':s.role==='residual'?'residual-exposure-review':uncovered.length?'incomplete-relief-coverage':'relief-candidate-coverage-review';
  if(!same(q.reliefAlternatives,expected)||!same(q.uncoveredClashIds,uncovered)||q.allIncidentClashesHaveCandidate!==!uncovered.length||q.context!==context)errors.push('clash-residual-slot-relief:'+q.id);
 }
 const affected=new Map();
 for(const a of actors){
  const q=r.occurrences.find(x=>x.id===a.id),p=roots.get(a.id),s=obs.get(a.id);
  const hit=p.roots.filter(x=>slotMap.has(x.id)),sub=hit.filter(x=>x.role!=='residual').map(x=>x.id),res=hit.filter(x=>x.role==='residual').map(x=>x.id);
  const incident=uniq(hit.flatMap(x=>slotMap.get(x.id).clashIds)),positions=uniq(incident.flatMap(id=>clashes.get(id).positions)),intact=p.roots.filter(x=>p.uncontestedRootIds.includes(x.id));
  const incoming=s.groundedPathIds.map(id=>{const x=s.paths.find(x=>x.id===id);return {pathId:id,donorNodeId:x.donor.nodeId,groundedRootIds:x.donor.groundedRootIds,
   sharedDirectRootIds:x.donor.groundedRootIds.filter(id=>p.uncontestedRootIds.includes(id)),readiness:x.readiness,effective:null};});
  const context=partial?'partial':!sub.length?'residual-only-exposure':intact.length?'exposed-and-uncontested-substantial-roots':incoming.length?'exposed-substantial-with-indirect-supply':'exposed-substantial-without-uncontested-root';
  counts.occurrences++;bump(contexts,context);affected.set(a.id,{sub,res});
  if(!noAuthority(q)||q.dayReference!==a.dayReference||q.element!==a.element||!same(q.exposedSubstantialRootIds,sub)||!same(q.exposedResidualRootIds,res)||
   !same(q.uncontestedRootIds,p.uncontestedRootIds)||!same(q.uncontestedExactRootIds,intact.filter(x=>x.match==='exact-stem').map(x=>x.id))||
   !same(q.otherContestedRootIds,p.contestedRootIds.filter(id=>!slotMap.has(id)))||!same(q.incidentClashIds,incident)||
   !same(q.outsideIncidentClashRootIds,intact.filter(x=>!positions.includes(x.position)).map(x=>x.id))||!same(q.incoming,incoming)||q.context!==context)errors.push('clash-residual-occurrence:'+a.id);
 }
 const actions=supply.actions.filter(e=>byId.get(e.from)?.layer==='visible'&&byId.get(e.to)?.layer==='visible'&&(affected.has(e.from)||affected.has(e.to)));
 if(!equalIds(ids(r.actions,'edgeId'),ids(actions,'edgeId')))errors.push('clash-residual-action-coverage');
 for(const e of actions){
  const q=r.actions.find(x=>x.edgeId===e.edgeId),a=affected.get(e.from),b=affected.get(e.to),sub=uniq([...(a?.sub??[]),...(b?.sub??[])]),res=uniq([...(a?.res??[]),...(b?.res??[])]);
  counts.actions++;if(!sub.length)counts.residualOnlyActions++;
  if(!noAuthority(q)||q.from!==e.from||q.to!==e.to||q.kind!==e.kind||!same(q.substantialRootIds,sub)||!same(q.residualRootIds,res)||
   q.exposureContext!==(sub.length?'substantial-exposure':'residual-only-exposure')||q.originalGenerationScreen!==e.generationScreen||
   !same(q.originalContextBlockers,e.contextBlockers)||!e.contextBlockers.includes('root-clash-exposure'))errors.push('clash-residual-action:'+e.edgeId);
 }
 const shared=exposed.map(s=>({rootId:s.id,actorIds:actors.filter(a=>[...affected.get(a.id).sub,...affected.get(a.id).res].includes(s.id)).map(a=>a.id),independentSupplyConfirmed:null})).filter(s=>s.actorIds.length>1);
 counts.sharedExposedRoots=shared.length;if(!same(shared,r.sharedExposedRoots))errors.push('clash-residual-shared-root');
 return {...base,counts,contexts,errors};
}
