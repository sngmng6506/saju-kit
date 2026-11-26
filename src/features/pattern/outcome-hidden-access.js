import {elementRelation} from '../../core/elements.js';
const ORDER=['year','month','day','hour'];
const index=(xs,f)=>Array.isArray(xs)&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const uniq=xs=>[...new Set(xs)].sort();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const eq=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&same(uniq(a),uniq(b));
const key=(a,b,kind)=>JSON.stringify([a,b,kind]);
const abstain={accessConfirmed:null,independentSupplyConfirmed:null,effective:null};
const slot=a=>a.position+':'+(a.layer==='visible'?'stem':'branch');
// Physical branch constituents, exact visible projections and aggregate
// graph actions are different views of shared evidence, not extra force.
export function observeHiddenAccessContext(prior,branch,root,supply){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:'hidden-access-context-v1',completeHour:complete,selectionAuthority:false,...abstain};
 const empty=()=>({...base,status:'invalid-evidence',slots:[],branchNodes:[],relations:[],withinBranch:[]});
 if(typeof complete!=='boolean'||[branch,root,supply].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  branch.accessConfirmed!==null||branch.transformationConfirmed!==null||root.rootEffectConfirmed!==null||supply.effectiveSupply!==null)return empty();
 const actors=index(prior.stemForce?.occurrences,a=>a.id),hidden=index(branch.hidden,h=>h.occurrenceId),slots=index(root.slots,s=>s.id),roots=index(root.occurrences,r=>r.id),
  nodes=index(supply.nodes,n=>n.nodeId),obs=index(supply.occurrences,a=>a.id),actions=index(supply.actions,e=>e.edgeId),raw=index(prior.relativeForce?.edges,e=>e.id);
 if(!actors||!hidden||!slots||!roots||!nodes||!obs||!actions||!raw||actors.size!==roots.size||actors.size!==obs.size||actions.size!==raw.size)return empty();
 const visible=[...actors.values()].filter(a=>a.layer==='visible'),literals=[...actors.values()].filter(a=>a.layer==='hidden');
 if(hidden.size!==literals.length||slots.size!==literals.length||!eq(visible.map(a=>a.position),complete?ORDER:ORDER.slice(0,3)))return empty();
 const groups=new Map(),rows=[],bySlot=new Map();
 for(const a of actors.values()){
  if(!nodes.has(a.graphNodeId)||!obs.has(a.id)||!roots.has(a.id)||!ORDER.includes(a.position))return empty();
  if(!groups.has(a.graphNodeId))groups.set(a.graphNodeId,[]);groups.get(a.graphNodeId).push(a);
 }
 if(groups.size!==nodes.size)return empty();
 for(const a of literals){
  const h=hidden.get(a.id),s=slots.get(a.id),n=nodes.get(a.graphNodeId);
  const exact=visible.filter(v=>!v.dayReference&&v.stem===a.stem).map(v=>v.id),sameElement=visible.filter(v=>!v.dayReference&&v.stem!==a.stem&&v.element===a.element).map(v=>v.id);
  const dayMatch=visible.some(v=>v.dayReference&&v.stem===a.stem);
  if(!h||!s||!n||a.id!=='hidden:'+a.position+':'+a.stem||h.slot!=='branch:'+a.position||h.position!==a.position||h.stem!==a.stem||h.element!==a.element||h.tenGod!==a.tenGod||h.hiddenRole!==a.hiddenRole||
   s.position!==a.position||s.stem!==a.stem||s.role!==a.hiddenRole||s.element!==a.element||!eq(h.exactProjectionIds,exact)||!eq(s.exactProjectionIds,exact)||
   !eq(h.sameElementOtherStemIds,sameElement)||!eq(s.sameElementOtherStemIds,sameElement)||s.dayReferenceMatches!==dayMatch||
   !eq(h.localClashIds,s.clashIds)||!eq(h.formationIds,s.formationIds)||h.literalAccessConfirmed!==null||h.independentSupplyConfirmed!==null||
   s.effectiveRoot!==null||s.accessConfirmed!==null||s.independentSupplyConfirmed!==null||n.independentSupplyConfirmed!==null)return empty();
  const projections=exact.map(id=>{
   const r=roots.get(id),o=obs.get(id),x=r.roots.find(x=>x.id===a.id);
   return x&&x.match==='exact-stem'&&x.role===s.role&&x.state===s.state&&o.effectiveSupply===null?{visibleId:id,rootId:a.id,rootState:s.state,
    stemPairContactIds:[...actors.get(id).contacts],accessConfirmed:null,substitutionConfirmed:null}:null;
  });
  if(projections.some(p=>!p))return empty();
  const externalRootIds=roots.get(a.id).roots.filter(r=>r.position!==a.position&&r.role!=='residual').map(r=>r.id);
  const row={id:a.id,nodeId:a.graphNodeId,position:a.position,stem:a.stem,element:a.element,tenGod:a.tenGod,role:s.role,state:s.state,
   clashIds:[...s.clashIds],competingTargetFormationIds:[...s.competingTargetFormationIds],formationIds:[...s.formationIds],
   projections,sameElementOtherStemIds:sameElement,dayReferenceMatches:dayMatch,externalRootIds,
   localSubstantialObserved:s.state==='uncontested-substantial-observation',localRootContext:h.accessHypothesis,
   accessContext:!complete?'partial':s.clashIds.length||s.competingTargetFormationIds.length?'disrupted-local-context':exact.length?'exact-projection-context':s.role==='residual'?'residual-local-context':'substantial-local-context',...abstain};
  rows.push(row);bySlot.set(a.id,row);
 }
 const branchNodes=[],withinBranch=[],relations=[];
 for(const [id,members] of groups){
  const n=nodes.get(id),a=members[0],isHidden=a.layer==='hidden';
  if(!eq(n.occurrenceIds,members.map(m=>m.id))||n.position!==a.position||n.element!==a.element||n.kind!==(isHidden?'local-branch-constituents':'visible-stem')||
   n.independentSupplyConfirmed!==null||members.some(m=>m.layer!==a.layer||m.position!==a.position||m.element!==a.element))return empty();
  if(!isHidden){if(members.length!==1||id!==a.position+':stem')return empty();continue;}
  if(id!==a.position+':branch:'+a.element)return empty();
  const local=members.map(m=>bySlot.get(m.id));
  if(local.some(m=>!m))return empty();
  const grounded=local.filter(s=>s.localSubstantialObserved).map(s=>s.id),contested=local.filter(s=>s.role!=='residual'&&!s.localSubstantialObserved).map(s=>s.id);
  if(!eq(n.groundedRootIds,grounded)||!eq(n.contestedRootIds,contested))return empty();
  branchNodes.push({nodeId:id,position:a.position,element:a.element,slotIds:local.map(s=>s.id),groundedRootIds:[...n.groundedRootIds],
   contestedRootIds:[...n.contestedRootIds],residualIds:local.filter(s=>s.role==='residual').map(s=>s.id),
   exactProjectionIds:uniq(local.flatMap(s=>s.projections.map(p=>p.visibleId))),donorState:n.state,...abstain});
 }
 // Same physical branch: elemental direction can be described, but it
 // is not a graph edge and must never be exposed as a literal action.
 for(const a of literals)for(const b of literals)if(a!==b&&a.position===b.position){
  const r=elementRelation(a.element,b.element);
  if(actions.has(a.id+'>'+b.id)||raw.has(a.id+'>'+b.id))return empty();
  if(r.direction==='left-to-right'&&['generate','control'].includes(r.type))withinBranch.push({from:a.id,to:b.id,position:a.position,kind:r.type,graphEdge:false,...abstain});
 }
 const expected=new Set();
 for(const [from,aa] of groups)for(const [to,bb] of groups){
  const a=aa[0],b=bb[0];
  if(slot(a)===slot(b)||a.layer==='visible'&&b.layer==='visible')continue;
  const r=elementRelation(a.element,b.element);
  if(r.direction!=='left-to-right'||!['generate','control'].includes(r.type))continue;
  const kind=r.type,id=key(from,to,kind),distance=Math.abs(ORDER.indexOf(a.position)-ORDER.indexOf(b.position)),literalActionIds=[];
  const incomingPathRefs=[];
  for(const x of aa)for(const y of bb){
   const eid=x.id+'>'+y.id,e=actions.get(eid),q=raw.get(eid);
   if(!e||!q||e.from!==x.id||e.to!==y.id||e.kind!==kind||q.from!==x.id||q.to!==y.id||q.kind!==kind||
    e.effective!==null||q.effective!==null||e.selectionAuthority!==false||!e.contextBlockers.includes('hidden-participant-access-unresolved'))return empty();
   literalActionIds.push(eid);expected.add(eid);
  }
  for(const y of bb){
   const edges=kind==='generate'?y.generationReceived:y.controlReceived;
   const matches=edges.filter(e=>e.from===from&&e.to===to&&e.type===kind);
   if(matches.length!==1||matches[0].local!==(distance<=1)||matches[0].distance!==distance||matches[0].effectConfirmed!==null)return empty();
   const o=obs.get(y.id),p=o.paths.filter(p=>p.donor.nodeId===from);
   if(kind==='generate'&&distance<=1){
    if(p.length!==1||p[0].recipientId!==y.id||p[0].id!==JSON.stringify([from,y.id])||p[0].effectiveSupply!==null||!same(p[0].donor,nodes.get(from)))return empty();
    incomingPathRefs.push({pathId:p[0].id,recipientId:y.id,upstream:p[0].upstream,readiness:p[0].readiness,effective:null});
   }else if(p.length)return empty();
  }
  const projectedIds=members=>uniq(members.flatMap(m=>m.layer==='visible'?[m.id]:bySlot.get(m.id).projections.map(p=>p.visibleId)));
  const alternativeVisibleActionIds=[];
  for(const x of projectedIds(aa))for(const y of projectedIds(bb)){
   const e=actions.get(x+'>'+y);
   if(e?.kind===kind&&e.effective===null)alternativeVisibleActionIds.push(e.edgeId);
  }
  relations.push({id,fromNodeId:from,toNodeId:to,kind,distance,local:distance<=1,
   fromOccurrenceIds:aa.map(a=>a.id),toOccurrenceIds:bb.map(a=>a.id),literalActionIds,
   incomingPathRefs,alternativeVisibleActionIds:uniq(alternativeVisibleActionIds),...abstain});
 }
 const actual=[...actions.values()].filter(e=>actors.get(e.from)?.layer==='hidden'||actors.get(e.to)?.layer==='hidden');
 if(!eq(actual.map(e=>e.edgeId),[...expected]))return empty();
 return {...base,status,slots:rows,branchNodes,relations,withinBranch,
  limitations:['exact-projection-not-transport','day-reference-not-external-projection','branch-node-local-constituents-only','within-branch-not-independent-action','alternative-visible-action-not-equivalent','no-access-or-effect-promotion']};
}
