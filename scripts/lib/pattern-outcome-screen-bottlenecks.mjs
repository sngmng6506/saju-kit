import {tracePressureDependencies} from '../../src/features/pattern/outcome-pressure-dependency.js';
// Diagnostic accounting only. No gate is relaxed and no effect is inferred
// from hypothetical removal of a blocker category.
const sorted=xs=>[...new Set(xs)].sort();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const pressured=xs=>xs.some(p=>p.donorState!=='no-substantial-root-observed');
const pressureKind=xs=>xs.some(p=>p.donorState==='grounded-observation')?'rooted-controller-observed':pressured(xs)?'controller-access-unresolved':'no-substantial-controller-observed';
const bump=(o,k)=>o[k]=(o[k]??0)+1;
function summarize(rows){
 const reasons={},groups={},soleGroups={},combinations={};
 for(const r of rows){
  for(const reason of r.reasons)bump(reasons,reason);
  for(const group of r.groups)bump(groups,group);
  if(r.groups.length===1)bump(soleGroups,r.groups[0]);
  bump(combinations,r.groups.join('+')||'screen-met');
 }
 return {total:rows.length,screened:rows.filter(r=>!r.groups.length).length,reasonCounts:reasons,groupCounts:groups,soleGroupCounts:soleGroups,groupCombinations:combinations};
}
const groupPath=r=>r==='missing-hour'?'missing-hour':r==='hidden-participant-access'?'hidden-access':r==='participant-contact'?'contact':
 r.startsWith('nonlocal-')?'locality':r.startsWith('helper-root-')?'helper-root':r.startsWith('threat-root-')?'threat-root':
 ['helper-under-rooted-control','helper-control-context-unresolved'].includes(r)?'helper-pressure':'unknown';
const groupEdge=r=>['missing-hour','context:missing-hour'].includes(r)?'missing-hour':r.startsWith('hidden-')?'hidden-access':r==='source-basis-unestablished'?'source-basis':
 r.startsWith('source-pressure:')||r==='context:source-local-rooted-control'?'source-pressure':r.startsWith('target-pressure:')?'target-pressure':
 r.includes('nonadjacent')||r.includes('nonlocal')?'locality':r.includes('contact')||r==='context:participant-combination-or-group'?'contact':r.includes('root-clash')?'contested-root':'other-context';
export function summarizeScreenBottlenecks(c,supply,interposition,partial){
 const base={id:c.id,partial,effectConfirmed:null,policyChanged:false},errors=[];
 const neutral=interposition?.roleNeutral,status=partial?'partial':'diagnostic';
 if(!supply||supply.status!==status||supply.completeHour!==!partial||supply.selectionAuthority!==false||supply.effectiveSupply!==null||
  !neutral||neutral.status!==status||neutral.completeHour!==!partial||neutral.selectionAuthority!==false||neutral.neutralizationConfirmed!==null||
  neutral.effectConfirmed!==null||neutral.targetScope!=='all-visible-stems'||!Array.isArray(supply.occurrences)||!Array.isArray(supply.actions)||!Array.isArray(neutral.paths))return {...base,errors:['screen-context-invalid']};
 const actors=new Map(supply.occurrences.map(a=>[a.id,a]));
 if(actors.size!==supply.occurrences.length||new Set(supply.actions.map(a=>a.edgeId)).size!==supply.actions.length||new Set(neutral.paths.map(p=>p.id)).size!==neutral.paths.length)return {...base,errors:['screen-identity-duplicate']};
 const generation=[],paths=[];
 const contexts=new Map((neutral.pressureContexts??[]).map(t=>[t.targetId,t]));
 if(contexts.size!==supply.occurrences.filter(a=>a.layer==='visible').length)return {...base,errors:['screen-pressure-context-coverage']};
 for(const e of supply.actions){
  if(e.kind!=='generate')continue;
  const a=actors.get(e.from),b=actors.get(e.to);
  if(!a||!b||e.edgeId!==e.from+'>'+e.to||e.effective!==null||e.selectionAuthority!==false||!Array.isArray(e.contextBlockers)||!Array.isArray(e.sourcePressure)||!Array.isArray(e.targetPressure)||!Array.isArray(a.screenedPathIds)){errors.push('generation-shape:'+e.edgeId);continue;}
  const reasons=[];
  if(partial)reasons.push('missing-hour');
  if(a.layer!=='visible')reasons.push('hidden-source');
  if(b.layer!=='visible')reasons.push('hidden-target');
  if(a.layer==='visible'&&a.directRoot.state!==true&&!a.screenedPathIds.length)reasons.push('source-basis-unestablished');
  for(const r of e.contextBlockers)reasons.push('context:'+r);
  if(pressured(e.sourcePressure))reasons.push('source-pressure:'+pressureKind(e.sourcePressure));
  if(pressured(e.targetPressure))reasons.push('target-pressure:'+pressureKind(e.targetPressure));
  const distinct=sorted(reasons),groups=sorted(distinct.map(groupEdge)),screened=!distinct.length;
  if(e.generationScreen!==(screened?'grounded-generation-context-screen-met':'unresolved'))errors.push('generation-screen-mismatch:'+e.edgeId);
  const pressureRefs=(actor,ps)=>{
   if(actor.layer!=='visible')return [];
   const ctx=contexts.get(actor.id);
   if(!ctx||!Array.isArray(ctx.controllers)){errors.push('generation-pressure-context:'+actor.id);return [];}
   return ps.filter(p=>p.donorState!=='no-substantial-root-observed').map(p=>{
    const q=ctx.controllers.find(q=>q.controllerNodeId===p.nodeId);
    if(!q||q.local!==true||q.donorState!==p.donorState||q.neutralizationConfirmed!==null){errors.push('generation-pressure-binding:'+actor.id+':'+p.nodeId);return {nodeId:p.nodeId,coverage:'invalid-evidence'};}
    return {nodeId:p.nodeId,classification:q.classification,candidatePathIds:[...q.candidatePathIds],screenedPathIds:[...q.screenedPathIds],neutralizationConfirmed:null};
   });
  };
  generation.push({id:e.edgeId,from:e.from,to:e.to,visible:a.layer==='visible'&&b.layer==='visible',reasons:distinct,groups,screened,
   sourcePressureNodes:e.sourcePressure.filter(p=>p.donorState!=='no-substantial-root-observed').map(p=>p.nodeId),
   targetPressureNodes:e.targetPressure.filter(p=>p.donorState!=='no-substantial-root-observed').map(p=>p.nodeId),
   sourcePressureRefs:pressureRefs(a,e.sourcePressure),targetPressureRefs:pressureRefs(b,e.targetPressure),effectConfirmed:null});
 }
 for(const p of neutral.paths){
  const participants=[p.participants?.helper,p.participants?.threat,p.participants?.target];
  if(participants.some(a=>!a||!Array.isArray(a.contacts))||!Array.isArray(p.edges)||!Array.isArray(p.blockers)||!Array.isArray(p.pressure?.helper)||!['protection','mediation'].includes(p.kind)){errors.push('interposition-shape:'+p.id);continue;}
  const [helper,threat]=participants,visible=participants.every(a=>a.kind==='visible-stem'),reasons=[];
  if(partial)reasons.push('missing-hour');
  if(!visible)reasons.push('hidden-participant-access');
  if(participants.some(a=>a.contacts.length))reasons.push('participant-contact');
  const local=(p.kind==='protection'?p.edges:p.edges.slice(0,2)).every(e=>e.local);
  if(!local)reasons.push(p.kind==='protection'?'nonlocal-protection-chain':'nonlocal-generation-chain');
  if(helper.state!=='grounded-observation')reasons.push(helper.state==='no-substantial-root-observed'?'helper-root-not-observed':'helper-root-access-unresolved');
  if(threat.state!=='grounded-observation')reasons.push(threat.state==='no-substantial-root-observed'?'threat-root-not-observed':'threat-root-access-unresolved');
  if(p.pressure.helper.some(a=>a.donorState==='grounded-observation'))reasons.push('helper-under-rooted-control');
  if(p.pressure.helper.some(a=>!['grounded-observation','no-substantial-root-observed'].includes(a.donorState)))reasons.push('helper-control-context-unresolved');
  const distinct=sorted(reasons),groups=sorted(distinct.map(groupPath)),screened=!distinct.length;
  if(!same(distinct,sorted(p.blockers))||new Set(p.blockers).size!==p.blockers.length||p.chainLocal!==local||
   p.structuralScreen!==(screened?'grounded-structure-screen-met':'context-review')||p.effectConfirmed!==null)errors.push('interposition-screen-mismatch:'+p.id);
  paths.push({id:p.id,kind:p.kind,visible,reasons:distinct,groups,screened,effectConfirmed:null});
 }
 const visibleGeneration=generation.filter(r=>r.visible),visiblePaths=paths.filter(r=>r.visible);
 return {...base,generation:{all:summarize(generation),visible:summarize(visibleGeneration),hidden:summarize(generation.filter(r=>!r.visible)),visibleRows:visibleGeneration},
  interposition:{all:summarize(paths),visible:summarize(visiblePaths),hidden:summarize(paths.filter(r=>!r.visible)),visibleRows:visiblePaths},
  interpretation:'soleGroupCounts counts rows with exactly one recorded blocker category; categories may be causally dependent, and counts are not an effect estimate or permission to bypass a category',errors};
}


export function summarizePressureDependencies(c,review,supply,interposition,partial){
 const base={id:c.id,partial,effectConfirmed:null},errors=[],counts={pressures:0,paths:0,visibleGenerations:0,seededPaths:0,conditionalPaths:0,unseededCycles:0},states={},contrasts={};
 if(!review||review.status!==(partial?'partial':'diagnostic')||review.completeHour!==!partial||review.selectionAuthority!==false||review.neutralizationConfirmed!==null||review.effective!==null||
  !Array.isArray(review.pressures)||!Array.isArray(review.paths)||!Array.isArray(review.generation)||!Array.isArray(review.unseededCycles)||!supply||!interposition?.roleNeutral)return {...base,errors:['pressure-dependency-invalid']};
 const closure=tracePressureDependencies(review.pressures.map(p=>p.id),review.paths);
 if(!closure)return {...base,errors:['pressure-dependency-graph-invalid']};
 const ranks=new Map(closure.pressureRanks.map(p=>[p.id,p.rank])),pathRanks=new Map(closure.pathRanks.map(p=>[p.id,p.rank])),ids=new Set(review.pressures.map(p=>p.id));
 const candidates=new Map(interposition.roleNeutral.paths.map(p=>[p.id,p])),contexts=interposition.roleNeutral.pressureContexts;
 const actions=supply.actions.filter(e=>e.kind==='generate'&&e.from.startsWith('visible:')&&e.to.startsWith('visible:'));
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 if(!eq(review.unseededCycles,closure.unseededCycles)||review.paths.length!==candidates.size||new Set(review.paths.map(p=>p.id)).size!==review.paths.length||
  review.generation.length!==actions.length||new Set(review.generation.map(g=>g.edgeId)).size!==review.generation.length)errors.push('pressure-dependency-coverage');
 for(const p of review.pressures){
  counts.pressures++;bump(contrasts,p.contrast);
  if(p.structuralDependencyRank!==(ranks.get(p.id)??null)||p.effective!==null||p.neutralizationConfirmed!==null||p.id!==JSON.stringify([p.controllerNodeId,p.targetNodeId]))errors.push('pressure-dependency-rank:'+p.id);
 }
 for(const t of contexts)for(const q of t.controllers){
  const p=review.pressures.find(p=>p.id===JSON.stringify([q.controllerNodeId,t.targetNodeId]));
  if(!p||p.targetAccess!=='visible'||p.donorState!==q.donorState||!eq(p.candidatePathIds,q.candidatePathIds)||!eq(p.screenedPathIds,q.screenedPathIds))errors.push('pressure-dependency-owner:'+t.targetId);
 }
 for(const p of review.paths){
  counts.paths++;if(p.structuralDependencyRank===0)counts.seededPaths++;if(p.structuralDependencyRank>0)counts.conditionalPaths++;
  const q=candidates.get(p.id);
  const deps=q?.pressure.helper.filter(r=>r.donorState!=='no-substantial-root-observed').map(r=>JSON.stringify([r.controllerNodeId,q.helper])).sort();
  const blockers=q?.blockers.filter(b=>!['helper-under-rooted-control','helper-control-context-unresolved'].includes(b)).sort();
  if(!q||!eq(p.dependencies,deps)||!eq(p.otherBlockers,blockers)||p.targetPressureId!==JSON.stringify([q.threat,q.target])||
   p.structuralDependencyRank!==(pathRanks.get(p.id)??null)||p.effectConfirmed!==null||p.neutralizationConfirmed!==null)errors.push('pressure-dependency-path:'+p.id);
 }
 for(const g of review.generation){
  counts.visibleGenerations++;bump(states,g.state);
  const e=actions.find(e=>e.edgeId===g.edgeId),deps=[...new Set([...g.sourcePressureIds,...g.targetPressureIds])].sort();
  if(!e||g.originalScreen!==e.generationScreen||g.effective!==null||deps.some(id=>!ids.has(id))||!eq(g.unresolvedPressureIds,deps.filter(id=>!ranks.has(id))))errors.push('pressure-dependency-generation:'+g.edgeId);
 }
 counts.unseededCycles=review.unseededCycles.length;
 return {...base,counts,states,contrasts,errors};
}
