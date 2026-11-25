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
const groupEdge=r=>r==='missing-hour'?'missing-hour':r.startsWith('hidden-')?'hidden-access':r==='source-basis-unestablished'?'source-basis':
 r.startsWith('source-pressure:')?'source-pressure':r.startsWith('target-pressure:')?'target-pressure':
 r.includes('nonadjacent')||r.includes('nonlocal')?'locality':r.includes('contact')?'contact':r.includes('root-clash')?'contested-root':'other-context';
export function summarizeScreenBottlenecks(c,supply,interposition,partial){
 const base={id:c.id,partial,effectConfirmed:null,policyChanged:false},errors=[];
 const neutral=interposition?.roleNeutral,status=partial?'partial':'diagnostic';
 if(!supply||supply.status!==status||supply.completeHour!==!partial||supply.selectionAuthority!==false||supply.effectiveSupply!==null||
  !neutral||neutral.status!==status||neutral.completeHour!==!partial||neutral.selectionAuthority!==false||neutral.neutralizationConfirmed!==null||
  neutral.effectConfirmed!==null||neutral.targetScope!=='all-visible-stems'||!Array.isArray(supply.occurrences)||!Array.isArray(supply.actions)||!Array.isArray(neutral.paths))return {...base,errors:['screen-context-invalid']};
 const actors=new Map(supply.occurrences.map(a=>[a.id,a]));
 if(actors.size!==supply.occurrences.length||new Set(supply.actions.map(a=>a.edgeId)).size!==supply.actions.length||new Set(neutral.paths.map(p=>p.id)).size!==neutral.paths.length)return {...base,errors:['screen-identity-duplicate']};
 const generation=[],paths=[];
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
  generation.push({id:e.edgeId,from:e.from,to:e.to,visible:a.layer==='visible'&&b.layer==='visible',reasons:distinct,groups,screened,
   sourcePressureNodes:e.sourcePressure.filter(p=>p.donorState!=='no-substantial-root-observed').map(p=>p.nodeId),
   targetPressureNodes:e.targetPressure.filter(p=>p.donorState!=='no-substantial-root-observed').map(p=>p.nodeId),effectConfirmed:null});
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
  interpretation:'soleGroupCounts counts rows with exactly one recorded blocker category; it is not an effect estimate or permission to bypass that category',errors};
}
