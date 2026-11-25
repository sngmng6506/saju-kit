// Pressure topology, not a force estimator. A grounded proof of the
// structural prerequisites never proves neutralization or effective supply.
const index=(xs,f)=>Array.isArray(xs)&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const uniq=xs=>[...new Set(xs)].sort();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const key=(controller,target)=>JSON.stringify([controller,target]);
const active=p=>p.donorState!=='no-substantial-root-observed';
const pressureBlockers=new Set(['helper-under-rooted-control','helper-control-context-unresolved']);
const flip=r=>r==='left-evidence-dominates'?'right-evidence-dominates':r==='right-evidence-dominates'?'left-evidence-dominates':r;
// Monotone least closure of AND prerequisites / OR candidate paths.
// Rank zero is an existing pressure-free structural screen; no cycle can
// self-seed. This is only a hypothetical support-chain inventory.
export function tracePressureDependencies(pressureIds,paths){
 const ids=new Set(pressureIds),byPath=index(paths,p=>p.id);
 if(ids.size!==pressureIds.length||!byPath||paths.some(p=>!ids.has(p.targetPressureId)||!Array.isArray(p.dependencies)||new Set(p.dependencies).size!==p.dependencies.length||p.dependencies.some(d=>!ids.has(d))||!Array.isArray(p.otherBlockers)))return null;
 const ranks=new Map(),pathRanks=new Map();
 for(let rank=0;rank<=ids.size;rank++){
  const ready=paths.filter(p=>!p.otherBlockers.length&&!pathRanks.has(p.id)&&p.dependencies.every(d=>ranks.has(d)));
  if(!ready.length)break;
  for(const p of ready)pathRanks.set(p.id,rank);
  for(const p of ready)if(!ranks.has(p.targetPressureId))ranks.set(p.targetPressureId,rank);
 }
 const unresolved=[...ids].filter(id=>!ranks.has(id)),unresolvedSet=new Set(unresolved);
 const adjacency=new Map(unresolved.map(id=>[id,new Set()]));
 for(const p of paths)if(!p.otherBlockers.length&&unresolvedSet.has(p.targetPressureId))
  for(const d of p.dependencies)if(unresolvedSet.has(d))adjacency.get(p.targetPressureId).add(d);
 const reach=id=>{const seen=new Set(),todo=[...adjacency.get(id)];while(todo.length){const x=todo.pop();if(seen.has(x))continue;seen.add(x);todo.push(...adjacency.get(x));}return seen;};
 const reachability=new Map(unresolved.map(id=>[id,reach(id)])),components=[],assigned=new Set();
 for(const id of unresolved)if(!assigned.has(id)&&reachability.get(id).has(id)){
  const members=unresolved.filter(x=>reachability.get(id).has(x)&&reachability.get(x).has(id)).sort();
  members.forEach(x=>assigned.add(x));components.push(members);
 }
 return {pressureRanks:[...ranks].map(([id,rank])=>({id,rank})),pathRanks:[...pathRanks].map(([id,rank])=>({id,rank})),unseededCycles:components};
}
export function observePressureDependencyReview(prior,root,supply,interposition){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:'pressure-dependency-review-v1',completeHour:complete,selectionAuthority:false,neutralizationConfirmed:null,effective:null};
 const empty=()=>({...base,status:'invalid-evidence',pressures:[],paths:[],generation:[],unseededCycles:[]});
 const neutral=interposition?.roleNeutral;
 if(typeof complete!=='boolean'||[root,supply,neutral].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  supply.effectiveSupply!==null||neutral.effectConfirmed!==null||neutral.neutralizationConfirmed!==null||neutral.targetScope!=='all-visible-stems')return empty();
 const actors=index(prior.stemForce?.occurrences,a=>a.id),obs=index(supply.occurrences,a=>a.id),nodes=index(supply.nodes,n=>n.nodeId),
  raw=index(prior.relativeForce?.edges,e=>e.id),actions=index(supply.actions,e=>e.edgeId),contexts=index(neutral.pressureContexts,c=>c.targetNodeId),
  pathMap=index(neutral.paths,p=>p.id),pairs=index(root.comparisons,p=>key(p.left,p.right));
 if(!actors||!obs||!nodes||!raw||!actions||!contexts||!pathMap||!pairs||actors.size!==obs.size||raw.size!==actions.size||
  [...actors.keys()].some(id=>!obs.has(id))||contexts.size!==[...actors.values()].filter(a=>a.layer==='visible').length)return empty();
 const graph=new Map();
 for(const a of actors.values()){if(!nodes.has(a.graphNodeId))return empty();if(!graph.has(a.graphNodeId))graph.set(a.graphNodeId,a);}
 const pressures=[],pressureMap=new Map();
 for(const [target,a] of graph){
  const edges=index(a.controlReceived,e=>e.from);if(!edges)return empty();
  const ctx=contexts.get(target),visible=a.layer==='visible';
  if(visible&&(!ctx||ctx.targetId!==a.id||ctx.allPressureResolved!==null||ctx.effective!==null||!Array.isArray(ctx.controllers)||ctx.controllers.length!==edges.size)||!visible&&ctx)return empty();
  for(const e of edges.values()){
   const n=nodes.get(e.from),source=graph.get(e.from);
   if(!n||!source||e.to!==target||e.type!=='control'||e.effectConfirmed!==null)return empty();
   const q=ctx?.controllers.find(p=>p.controllerNodeId===e.from);
   if(visible&&(!q||q.donorState!==n.state||q.local!==e.local||q.neutralizationConfirmed!==null||q.remainingPressureConfirmed!==null||!Array.isArray(q.candidatePathIds)||!Array.isArray(q.screenedPathIds)))return empty();
   let comparison=null;
   if(visible&&source.layer==='visible'){
    const forward=pairs.get(key(source.id,a.id)),reverse=pairs.get(key(a.id,source.id)),p=forward??reverse;
    const exact=actions.get(source.id+'>'+a.id);
    if(!p||forward&&reverse||!exact||exact.kind!=='control'||exact.effective!==null||p.forceComparison!==null)return empty();
    const orient=r=>forward?r:flip(r);
    comparison=Object.fromEntries(['original','sensitivity','nonseason','seasonOnly'].map(k=>[k,orient(p[k].relation)]));
    if(comparison.original!==exact.controlComparison)return empty();
   }
   const rel=comparison?.sensitivity;
   const contrast=!complete?'partial':!comparison?'hidden-comparison-unavailable':
    ['left-evidence-dominates','right-evidence-dominates'].includes(rel)&&comparison.original===rel&&comparison.nonseason===rel&&
     comparison.seasonOnly!==flip(rel)?rel==='left-evidence-dominates'?'controller-evidence-dominance-stable':'target-evidence-dominance-stable':'direction-not-stable';
   const id=key(e.from,target),row={id,controllerNodeId:e.from,targetNodeId:target,local:e.local,donorState:n.state,comparison,contrast,
    candidatePathIds:q?.candidatePathIds??[],screenedPathIds:q?.screenedPathIds??[],targetAccess:visible?'visible':'hidden-target-review',neutralizationConfirmed:null,effective:null};
   pressures.push(row);pressureMap.set(id,row);
  }
 }
 const paths=[];
 for(const p of pathMap.values()){
  const id=key(p.threat,p.target),owner=pressureMap.get(id);
  if(!owner||!owner.candidatePathIds.includes(p.id)||p.id!==JSON.stringify([p.kind,p.helper,p.threat,p.target])||
   p.neutralizationConfirmed!==null||p.effectConfirmed!==null||!Array.isArray(p.blockers)||!Array.isArray(p.pressure?.helper))return empty();
  const helper=graph.get(p.helper);
  if(!helper||p.pressure.helper.length!==helper.controlReceived.length)return empty();
  const refs=index(p.pressure.helper,q=>q.controllerNodeId);
  if(!refs||helper.controlReceived.some(e=>!refs.has(e.from)))return empty();
  const dependencies=[];
  for(const q of refs.values()){
   const r=pressureMap.get(key(q.controllerNodeId,p.helper));
   if(!r||r.donorState!==q.donorState||r.local!==q.local||q.effectConfirmed!==null)return empty();
   if(active(r))dependencies.push(r.id);
  }
  const otherBlockers=p.blockers.filter(b=>!pressureBlockers.has(b));
  if((dependencies.length>0)!==p.blockers.some(b=>pressureBlockers.has(b))||
   p.structuralScreen!==(!p.blockers.length?'grounded-structure-screen-met':'context-review')||
   owner.screenedPathIds.includes(p.id)!==!p.blockers.length)return empty();
  paths.push({id:p.id,targetPressureId:id,dependencies:uniq(dependencies),otherBlockers:uniq(otherBlockers),effectConfirmed:null});
 }
 for(const p of pressures)if(new Set(p.candidatePathIds).size!==p.candidatePathIds.length||
  p.candidatePathIds.some(id=>{const q=pathMap.get(id);return !q||q.threat!==p.controllerNodeId||q.target!==p.targetNodeId;})||
  p.screenedPathIds.some(id=>!p.candidatePathIds.includes(id))||
  !same([...p.screenedPathIds].sort(),p.candidatePathIds.filter(id=>pathMap.get(id).structuralScreen==='grounded-structure-screen-met').sort()))return empty();
 const closure=tracePressureDependencies(pressures.map(p=>p.id),paths);if(!closure)return empty();
 const ranks=new Map(closure.pressureRanks.map(p=>[p.id,p.rank])),pathRanks=new Map(closure.pathRanks.map(p=>[p.id,p.rank]));
 for(const p of paths){p.structuralDependencyRank=pathRanks.get(p.id)??null;p.neutralizationConfirmed=null;}
 for(const p of pressures){p.structuralDependencyRank=ranks.get(p.id)??null;p.dependencyState=p.targetAccess!=='visible'?'hidden-target-review':
  ranks.has(p.id)?'structural-chain-observed':p.candidatePathIds.length?'candidate-prerequisites-unresolved':'no-candidate-observed';}
 const generation=[];
 for(const e of actions.values()){
  const a=actors.get(e.from),b=actors.get(e.to),r=raw.get(e.edgeId),source=obs.get(e.from);
  if(!a||!b||!r||!source||r.from!==e.from||r.to!==e.to||r.kind!==e.kind||e.effective!==null||e.selectionAuthority!==false)return empty();
  if(e.kind!=='generate'||a.layer!=='visible'||b.layer!=='visible')continue;
  const read=(ps,target)=>{
   if(!Array.isArray(ps))return null;
   const expected=graph.get(target).controlReceived.filter(e=>e.local).map(e=>e.from).sort();
   if(!same(ps.map(q=>q.nodeId).sort(),expected))return null;
   const refs=[];
   for(const q of ps){const p=pressureMap.get(key(q.nodeId,target));if(!p||!p.local||p.donorState!==q.donorState)return null;if(active(p))refs.push(p.id);}
   return uniq(refs);
  };
  const sourcePressureIds=read(e.sourcePressure,a.graphNodeId),targetPressureIds=read(e.targetPressure,b.graphNodeId);
  if(!sourcePressureIds||!targetPressureIds)return empty();
  const dependencies=uniq([...sourcePressureIds,...targetPressureIds]),otherBlockers=e.contextBlockers.filter(b=>b!=='source-local-rooted-control'||
   !(r.sourceLocalControlNodes??[]).length||!(r.sourceLocalControlNodes??[]).every(id=>sourcePressureIds.includes(key(id,a.graphNodeId))));
  if(!complete)otherBlockers.push('missing-hour');
  if(source.directRoot.state!==true&&!source.screenedPathIds.length)otherBlockers.push('source-basis-unestablished');
  const nonpressure=uniq(otherBlockers);
  const state=nonpressure.length?'other-prerequisites-unresolved':!dependencies.length?'pressure-free-structure-observed':
   dependencies.every(id=>ranks.has(id))?'conditional-structural-chain-observed':'pressure-prerequisites-unresolved';
  generation.push({edgeId:e.edgeId,from:e.from,to:e.to,sourcePressureIds,targetPressureIds,otherBlockers:nonpressure,state,
   originalScreen:e.generationScreen,unresolvedPressureIds:dependencies.filter(id=>!ranks.has(id)),effective:null});
 }
 return {...base,status,pressures,paths,generation,unseededCycles:closure.unseededCycles,
  limitations:['evidence-dominance-not-magnitude','least-closure-no-self-seeding','structural-chain-not-pressure-relief','no-screen-promotion','hidden-target-not-evaluated','no-role-selection']};
}
