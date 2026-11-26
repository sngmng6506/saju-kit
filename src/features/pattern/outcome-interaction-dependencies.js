import {createDependencyGraph,sharedDependencyUses} from './outcome-dependency-graph.js';
import {buildSharedForceBasis} from './outcome-shared-force-basis.js';
import {reviewControlSynthesis} from './outcome-control-synthesis.js';
import {reviewGenerationSynthesis} from './outcome-generation-synthesis.js';
import {tracePressureDependencies} from './outcome-pressure-dependency.js';
const key=(...xs)=>JSON.stringify(xs);
const same=(a,b)=>key(a)===key(b);
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const setEq=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
const uniq=xs=>[...new Set(xs)].sort();
const unresolved=x=>x==='unresolved';
export const INTERACTION_DEPENDENCY_VERSION='p2-interaction-dependencies-v1';
// Pure structural projection. No rule about simultaneous operation,
// quantitative budgets or actual relief is introduced by graph adjacency.
export function reviewInteractionDependencies(prior,root,supply,pressure,argument,joint,modeled,synthesis,generation,control){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:INTERACTION_DEPENDENCY_VERSION,completeHour:complete,selectionAuthority:false,effective:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,nodes:[],links:[],shared:{},summary:null});
 if(typeof complete!=='boolean'||[root,supply,pressure,argument,joint,modeled,synthesis,generation,control].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  root.rootEffectConfirmed!==null||supply.effectiveSupply!==null||[pressure,argument,joint,modeled,synthesis,generation,control].some(x=>x.effective!==null))return empty('upstream');
 try{
  const basis=buildSharedForceBasis(prior,root);
  if(basis.status!==status||!same(basis,pressure.sharedForceBasis))return empty('basis-replay');
  if(!same(reviewGenerationSynthesis(prior,root,supply,argument,modeled,synthesis),generation)||
   !same(reviewControlSynthesis(prior,root,pressure,argument,modeled,synthesis),control))return empty('synthesis-replay');
  const actors=index(prior.stemForce?.occurrences,a=>a.id),slots=index(root.slots,a=>a.id),donors=index(supply.nodes,a=>a.nodeId),
   obs=index(supply.occurrences,a=>a.id),aa=index(argument.actions,a=>a.edgeId),ja=index(joint.actions,a=>a.edgeId),
   pa=index(pressure.pressures,a=>a.id),paths=index(pressure.paths,a=>a.id),jp=index(joint.paths,a=>a.pathId),
   ga=index(generation.actions,a=>a.edgeId),ca=index(control.actions,a=>a.edgeId),ss=index(synthesis.actions,a=>a.edgeId),profiles=index(basis.profiles,a=>a.actorId);
  if([actors,slots,donors,obs,aa,ja,pa,paths,jp,ga,ca,ss,profiles].some(x=>!x)||!setEq([...aa.keys()],[...ja.keys()])||!setEq([...aa.keys()],[...ss.keys()])||
   !setEq([...aa.keys()],[...ga.keys(),...ca.keys()])||!setEq([...actors.keys()],[...obs.keys()]))return empty('inventory');
  const closure=tracePressureDependencies([...pa.keys()],[...paths.values()]);
  if(!closure||!same(closure.unseededCycles,pressure.unseededCycles))return empty('pressure-closure');
  const {node,link,finish}=createDependencyGraph();
  const bind=(kind,ref,map)=>{if(!map.has(ref))throw Error('unbound-'+kind);return node(kind,ref);};
  const actor=id=>bind('occurrence',id,actors),slot=id=>bind('root-slot',id,slots),donor=id=>bind('physical-node',id,donors),
   action=id=>bind('action',id,aa),press=id=>bind('pressure',id,pa),route=id=>bind('route',id,paths);
  for(const a of actors.values())link(actor(a.id),donor(a.graphNodeId),'represented-by');
  for(const s of slots.values())link(slot(s.id),actor(s.id),'slot-occurrence');
  const primitiveIds=new Set(basis.primitives.map(p=>p.id));
  for(const p of basis.primitives){
   const n=node('basis-primitive',p.id);
   if(p.kind==='substantial-slot-basis')link(n,slot(p.reference),'primitive-reference');
   else if(p.kind==='contact-access-assumption')link(n,donor(p.reference),'primitive-reference');
   else return empty('primitive-kind');
  }
  for(const a of profiles.values())for(const [axis,terms] of Object.entries(a.axes))for(const id of uniq(terms.flat())){
   if(!primitiveIds.has(id))return empty('primitive-coverage');
   link(actor(a.actorId),node('basis-primitive',id),'profile-reference',axis);
  }
  const rootUses=new Map();
  for(const a of aa.values()){
   const n=action(a.edgeId),j=ja.get(a.edgeId),g=ga.get(a.edgeId),c=ca.get(a.edgeId);
   if(j.from!==a.from||j.to!==a.to||j.kind!==a.kind||j.effectPropositionId!==a.effectPropositionId||!unresolved(j.actualEffectState)||j.effective!==null||
    (a.kind==='generate')!==!!g||(a.kind==='control')!==!!c||![j.rootIds,j.exposedRootIds,j.combinationPairIds,j.interpositionPathIds].every(Array.isArray))return empty('action-binding');
   const actual=g??c,projected=ss.get(a.edgeId);
   if(!setEq(j.combinationPairIds,projected.constraints?.pairIds)||!setEq(j.exposedRootIds,projected.constraints?.exposedRootIds)||
    !setEq(j.interpositionPathIds,projected.interposition?.visibleRoutes?.map(r=>r.pathId)))return empty('constraint-parity');
   if(actual.from!==a.from||actual.to!==a.to||actual.originalEffectPropositionId!==a.effectPropositionId)return empty('synthesis-binding');
   const used=[];
   const remember=(id,role,basis,pathId=null)=>{
    used.push(id);link(n,slot(id),'root-reference',key(role,basis,pathId));
    if(!rootUses.has(id))rootUses.set(id,[]);
    rootUses.get(id).push({edgeId:a.edgeId,role,basis,pathId});
   };
   for(const [id,role] of [[a.from,'source'],[a.to,'target']]){
    const o=obs.get(id),oActor=actors.get(id);
    link(n,actor(id),'participant',role);link(n,donor(oActor.graphNodeId),'physical-participant',role);
    for(const [ids,b] of [[o.directRoot.uncontestedRootIds,'direct-uncontested'],[o.directRoot.contestedRootIds,'direct-contested']])for(const r of ids)remember(r,role,b);
    const pp=index(o.paths,p=>p.id);if(!pp)return empty('supply-paths');
    for(const p of pp.values()){
     const sp=node('supply-path',p.id);
     if(p.recipientId!==id||p.effectiveSupply!==null||p.donor.independentSupplyConfirmed!==null||
      !same(p.donor,donors.get(p.donor.nodeId))||p.graphEdge.from!==p.donor.nodeId||p.graphEdge.to!==oActor.graphNodeId||p.graphEdge.kind!=='generate')return empty('supply-path-binding');
     link(n,sp,'supply-context',role);link(sp,donor(p.donor.nodeId),'supply-donor');link(sp,actor(id),'supply-recipient');
     for(const r of p.donor.groundedRootIds)link(sp,slot(r),'supply-root','grounded');
     for(const r of p.donor.contestedRootIds)link(sp,slot(r),'supply-root','contested');
     if(o.groundedPathIds.includes(p.id)){
      if(p.upstream!=='observed')return empty('supply-observation');
      for(const r of p.donor.groundedRootIds)remember(r,role,'incoming-observed',p.id);
     }
    }
   }
   if(!setEq(uniq(used),j.rootIds))return empty('root-coverage');
   for(const r of j.exposedRootIds)link(n,slot(r),'exposed-root-reference');
   for(const id of j.combinationPairIds)link(n,node('combination-pair',id),'combination-reference');
   for(const id of j.interpositionPathIds)link(n,route(id),'candidate-route');
   if(c)link(n,press(c.pressureId),'control-pressure');
  }
  const expectedShared=[...rootUses].filter(([,u])=>u.length>1).map(([rootId,uses])=>({rootId,uses}));
  if(!Array.isArray(joint.sharedRoots)||!setEq(joint.sharedRoots.map(r=>r.rootId),expectedShared.map(r=>r.rootId))||
   expectedShared.some(x=>{const q=joint.sharedRoots.find(r=>r.rootId===x.rootId);return q.independentCapacityConfirmed!==null||!setEq(q.uses.map(u=>JSON.stringify(u)),x.uses.map(u=>JSON.stringify(u)));}))return empty('shared-root-parity');
  for(const p of pa.values()){
   if(p.effective!==null||p.neutralizationConfirmed!==null||!Array.isArray(p.candidatePathIds))return empty('pressure-authority');
   const n=press(p.id);link(n,donor(p.controllerNodeId),'pressure-controller');link(n,donor(p.targetNodeId),'pressure-target');
   for(const id of p.candidatePathIds){if(paths.get(id)?.targetPressureId!==p.id)return empty('pressure-route');link(n,route(id),'candidate-relief-route');}
  }
  for(const p of paths.values()){
   const n=route(p.id),owner=pa.get(p.targetPressureId),j=jp.get(p.id);
   if(!owner?.candidatePathIds.includes(p.id)||p.effectConfirmed!==null||p.neutralizationConfirmed!==null||!Array.isArray(p.dependencies))return empty('route-binding');
   const identity=JSON.parse(p.id);
   if(!Array.isArray(identity)||identity.length!==4||!['protection','mediation'].includes(identity[0])||identity[2]!==owner.controllerNodeId||identity[3]!==owner.targetNodeId)return empty('route-identity');
   link(n,donor(identity[1]),'route-helper');link(n,press(p.targetPressureId),'route-target-pressure');
   for(const id of p.dependencies)link(n,press(id),'prerequisite-pressure');
   if(j){
    if(j.pressureId!==p.targetPressureId||!setEq(j.dependencyIds,p.dependencies)||!unresolved(j.actualEffectState)||!Array.isArray(j.requiredLegIds)||ca.get(j.controlEdgeId)?.pressureId!==p.targetPressureId)return empty('route-leg-binding');
    const helper=[...actors.values()].find(a=>a.graphNodeId===identity[1]&&a.layer==='visible');
    const target=aa.get(j.controlEdgeId);
    if(!helper||!target)return empty('visible-route-identity');
    const legs=identity[0]==='protection'?[helper.id+'>'+target.from]:[target.from+'>'+helper.id,helper.id+'>'+target.to];
    if(!setEq(legs,j.requiredLegIds))return empty('route-leg-coverage');
    for(const id of j.requiredLegIds)link(n,action(id),'required-leg');
    for(const id of j.combinationPairIds)link(n,node('combination-pair',id),'combination-reference');
   }
  }
  for(const j of jp.values())if(!paths.has(j.pathId)||!ja.get(j.controlEdgeId)?.interpositionPathIds.includes(j.pathId))return empty('joint-route-coverage');
  const pg=index(pressure.generation,g=>g.edgeId);
  if(!pg||[...ga.keys()].some(id=>!pg.has(id)))return empty('generation-pressure-coverage');
  for(const g of pg.values()){
   if(!ga.has(g.edgeId))continue; // hidden generation is not a visible action
   const a=aa.get(g.edgeId);
   if(g.from!==a.from||g.to!==a.to||!Array.isArray(g.sourcePressureIds)||!Array.isArray(g.targetPressureIds))return empty('generation-pressure-binding');
   for(const id of g.sourcePressureIds){if(pa.get(id)?.targetNodeId!==actors.get(a.from).graphNodeId)return empty('source-pressure-binding');link(action(g.edgeId),press(id),'pressure-context','source');}
   for(const id of g.targetPressureIds){if(pa.get(id)?.targetNodeId!==actors.get(a.to).graphNodeId)return empty('target-pressure-binding');link(action(g.edgeId),press(id),'pressure-context','target');}
  }
  const graph=finish();
  const shared=Object.fromEntries([
   ['roots','root-slot',['root-reference','exposed-root-reference']],
   ['participants','physical-node',['physical-participant']],
   ['supplyPaths','supply-path',['supply-context']],
   ['pairs','combination-pair',['combination-reference']],
   ['pressures','pressure',['pressure-context','control-pressure']]
  ].map(([k,resourceKind,linkKinds])=>[k,sharedDependencyUses(graph,{consumerKind:'action',resourceKind,linkKinds})]));
  shared.routeLegs=sharedDependencyUses(graph,{consumerKind:'route',resourceKind:'action',linkKinds:['required-leg']});
  return {...base,status,reason:null,...graph,shared,summary:{actions:aa.size,nodes:graph.nodes.length,links:graph.links.length,
   ...Object.fromEntries(Object.entries(shared).map(([k,v])=>['shared'+k[0].toUpperCase()+k.slice(1),v.length])),actualEffectsConfirmed:0},
   limitations:['reference-not-causal-effect','shared-use-not-exclusive-resource','candidate-route-not-operation','no-capacity-allocation','no-selection-authority']};
 }catch(e){return empty(e instanceof Error?e.message:'invalid-reference');}
}
