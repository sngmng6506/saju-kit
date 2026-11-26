import {elementRelation} from '../../src/core/elements.js';
const ORDER=['year','month','day','hour'];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sort=xs=>[...xs].sort();
const uniq=xs=>[...new Set(xs)].sort();
const eq=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&same(sort(a),sort(b));
const abstains=x=>x&&x.accessConfirmed===null&&x.independentSupplyConfirmed===null&&x.effective===null;
const key=(a,b,kind)=>JSON.stringify([a,b,kind]);
export function summarizeHiddenAccess(c,m,partial){
 const errors=[],base={id:c.id,partial,effectConfirmed:null},r=m?.hiddenAccessContext,root=m?.rootContext,supply=m?.groundedSupply,branch=m?.branchContext,capacity=m?.roleCapacity?.occurrences;
 const counts={slots:0,projectedSlots:0,dayOnlySlots:0,branchNodes:0,relations:0,literalActions:0,multipleLiteralRelations:0,visibleAlternatives:0,withinBranch:0,observedPaths:0},contexts={};
 if(!abstains(r)||r.status!==(partial?'partial':'diagnostic')||r.completeHour!==!partial||r.selectionAuthority!==false||
 ![r.slots,r.branchNodes,r.relations,r.withinBranch,root?.slots,root?.occurrences,supply?.nodes,supply?.actions,supply?.occurrences,branch?.hidden,capacity].every(Array.isArray))return {...base,errors:['hidden-access-contract']};
 const slots=new Map(root.slots.map(s=>[s.id,s])),roots=new Map(root.occurrences.map(s=>[s.id,s])),actors=new Map(capacity.map(a=>[a.id,a])),
 nodes=new Map(supply.nodes.map(n=>[n.nodeId,n])),obs=new Map(supply.occurrences.map(a=>[a.id,a])),actions=new Map(supply.actions.map(e=>[e.edgeId,e])),
 hidden=new Map(branch.hidden.map(h=>[h.occurrenceId,h])),rows=new Map(r.slots.map(s=>[s.id,s]));
 const graphId=a=>a.layer==='visible'?a.position+':stem':a.position+':branch:'+a.element;
 if(!eq(r.slots.map(s=>s.id),root.slots.map(s=>s.id)))errors.push('hidden-access-slot-coverage');
 for(const q of r.slots){
  const s=slots.get(q.id),h=hidden.get(q.id),a=actors.get(q.id);
  counts.slots++;if(q.projections.length)counts.projectedSlots++;if(q.dayReferenceMatches&&!q.projections.length)counts.dayOnlySlots++;
  contexts[q.accessContext]=(contexts[q.accessContext]??0)+1;
  if(!s||!h||!a||!abstains(q)||q.nodeId!==graphId(a)||['position','stem','element','role','state','dayReferenceMatches'].some(k=>q[k]!==s[k])||
   q.tenGod!==a.tenGod||!eq(q.clashIds,s.clashIds)||!eq(q.formationIds,s.formationIds)||!eq(q.competingTargetFormationIds,s.competingTargetFormationIds)||
   !eq(q.sameElementOtherStemIds,s.sameElementOtherStemIds)||q.localSubstantialObserved!==(s.state==='uncontested-substantial-observation')||q.localRootContext!==h.accessHypothesis){
    errors.push('hidden-access-slot:'+q.id);continue;
   }
  const projections=s.exactProjectionIds.map(id=>({visibleId:id,rootId:s.id,rootState:s.state,stemPairContactIds:[...actors.get(id).contacts],accessConfirmed:null,substitutionConfirmed:null}));
  const external=roots.get(q.id).roots.filter(x=>x.position!==s.position&&x.role!=='residual').map(x=>x.id);
  const context=partial?'partial':s.clashIds.length||s.competingTargetFormationIds.length?'disrupted-local-context':projections.length?'exact-projection-context':s.role==='residual'?'residual-local-context':'substantial-local-context';
  if(!same(q.projections,projections)||!eq(q.externalRootIds,external)||q.accessContext!==context)errors.push('hidden-access-projection:'+q.id);
 }
 const branchNodes=supply.nodes.filter(n=>n.kind==='local-branch-constituents');
 if(!eq(r.branchNodes.map(n=>n.nodeId),branchNodes.map(n=>n.nodeId)))errors.push('hidden-access-node-coverage');
 for(const q of r.branchNodes){
  counts.branchNodes++;const n=nodes.get(q.nodeId);
  if(!n||!abstains(q)||q.position!==n.position||q.element!==n.element||q.donorState!==n.state||!eq(q.slotIds,n.occurrenceIds)||
   !eq(q.groundedRootIds,n.groundedRootIds)||!eq(q.contestedRootIds,n.contestedRootIds)||!eq(q.residualIds,n.occurrenceIds.filter(id=>slots.get(id)?.role==='residual'))||
   !eq(q.exactProjectionIds,uniq(n.occurrenceIds.flatMap(id=>slots.get(id)?.exactProjectionIds??[]))))errors.push('hidden-access-node:'+q.nodeId);
 }
 const expected=new Map();
 for(const e of supply.actions){
  const a=actors.get(e.from),b=actors.get(e.to);if(!a||!b){errors.push('hidden-access-action-endpoint');continue;}
  if(a.layer==='visible'&&b.layer==='visible')continue;
  const id=key(graphId(a),graphId(b),e.kind);if(!expected.has(id))expected.set(id,[]);expected.get(id).push(e.edgeId);
 }
 if(!eq(r.relations.map(x=>x.id),[...expected.keys()]))errors.push('hidden-access-relation-coverage');
 for(const q of r.relations){
  const a=nodes.get(q.fromNodeId),b=nodes.get(q.toNodeId);
  counts.relations++;counts.literalActions+=q.literalActionIds.length;if(q.literalActionIds.length>1)counts.multipleLiteralRelations++;if(q.alternativeVisibleActionIds.length)counts.visibleAlternatives++;
  if(!a||!b||!abstains(q)||q.id!==key(a.nodeId,b.nodeId,q.kind)||!eq(q.literalActionIds,expected.get(q.id))||!eq(q.fromOccurrenceIds,a.occurrenceIds)||!eq(q.toOccurrenceIds,b.occurrenceIds)){
   errors.push('hidden-access-relation:'+q.id);continue;
  }
  const distance=Math.abs(ORDER.indexOf(a.position)-ORDER.indexOf(b.position)),paths=[];
  if(q.kind==='generate'&&distance<=1)for(const id of b.occurrenceIds){
   const p=obs.get(id).paths.find(p=>p.donor.nodeId===a.nodeId);
   if(!p){errors.push('hidden-access-path-missing:'+q.id);continue;}
   paths.push({pathId:p.id,recipientId:id,upstream:p.upstream,readiness:p.readiness,effective:null});
  }
  const projected=n=>uniq(n.occurrenceIds.flatMap(id=>actors.get(id).layer==='visible'?[id]:slots.get(id).exactProjectionIds));
  const alternative=[];
  for(const x of projected(a))for(const y of projected(b)){const e=actions.get(x+'>'+y);if(e?.kind===q.kind)alternative.push(e.edgeId);}
  counts.observedPaths+=paths.filter(p=>p.upstream==='observed').length;
  if(q.distance!==distance||q.local!==(distance<=1)||!same(q.incomingPathRefs,paths)||!eq(q.alternativeVisibleActionIds,uniq(alternative)))errors.push('hidden-access-relation-provenance:'+q.id);
 }
 const within=[];
 for(const a of root.slots)for(const b of root.slots)if(a.id!==b.id&&a.position===b.position){
  const rel=elementRelation(a.element,b.element);if(rel.direction==='left-to-right'&&['generate','control'].includes(rel.type))within.push(key(a.id,b.id,rel.type));
 }
 counts.withinBranch=r.withinBranch.length;
 if(!eq(r.withinBranch.map(e=>key(e.from,e.to,e.kind)),within)||r.withinBranch.some(e=>!abstains(e)||e.graphEdge!==false||
 slots.get(e.from)?.position!==e.position||slots.get(e.to)?.position!==e.position||actions.has(e.from+'>'+e.to)))errors.push('hidden-access-within-branch');
 return {...base,counts,contexts,errors};
}
