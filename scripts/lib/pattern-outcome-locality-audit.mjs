// Independently reconstruct the positional inventory from literal actions
// and the existing capacity projection; this is not an efficacy oracle.
const ORDER=['year','month','day','hour'];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const index=(xs,f)=>Array.isArray(xs)&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const pk=(a,b)=>JSON.stringify([a.position+':stem',b.position+':stem']);
const bump=(o,k)=>o[k]=(o[k]??0)+1;
export function summarizeLocalityContext(c,mechanism,partial){
 const base={id:c.id,partial,effectConfirmed:null},errors=[],counts={relations:0,adjacent:0,nonadjacent:0,nonadjacentGeneration:0,nonadjacentControl:0,intervenors:0,protection:0,mediation:0,chains:0,adjacentLegChains:0},motifs={},spans={};
 const r=mechanism?.localityContext,supply=mechanism?.groundedSupply,capacity=mechanism?.roleCapacity,neutral=mechanism?.interpositionReview?.roleNeutral,dependency=mechanism?.pressureDependencyReview;
 if(!r||r.version!=='locality-context-v1'||r.status!==(partial?'partial':'diagnostic')||r.completeHour!==!partial||r.selectionAuthority!==false||r.effective!==null||r.noninterferenceConfirmed!==null||
  !Array.isArray(r.relations)||!Array.isArray(capacity?.occurrences)||!Array.isArray(supply?.actions)||!Array.isArray(supply?.occurrences)||!Array.isArray(neutral?.paths)||!Array.isArray(dependency?.paths)||!Array.isArray(dependency?.pressures))return {...base,errors:['locality-contract']};
 const visible=capacity.occurrences.filter(a=>a.layer==='visible'),actors=index(visible,a=>a.id),actions=index(supply.actions.filter(e=>e.from.startsWith('visible:')&&e.to.startsWith('visible:')),e=>e.edgeId),
  observations=index(supply.occurrences,a=>a.id),paths=index(neutral.paths,p=>p.id),deps=index(dependency.paths,p=>p.id),pressures=index(dependency.pressures,p=>p.id),rows=index(r.relations,a=>a.edgeId);
 if(!actors||!actions||!observations||!paths||!deps||!pressures||!rows||rows.size!==actions.size||actors.size!==(partial?3:4))return {...base,errors:['locality-inventory']};
 const position=a=>ORDER.indexOf(a.position),span=(a,b)=>Math.abs(position(a)-position(b));
 const ref=e=>e?{edgeId:e.edgeId,kind:e.kind,from:e.from,to:e.to,span:span(actors.get(e.from),actors.get(e.to)),generationScreen:e.generationScreen,controlComparison:e.controlComparison,effective:null}:null;
 const read=(a,b,kind)=>{const e=actions.get(a.id+'>'+b.id);return e?.kind===kind?e:null;};
 const definitions=[
  ['sourceToIntervenorGenerate','source','mid','generate','alternative-source-output'],
  ['sourceToIntervenorControl','source','mid','control','alternative-source-control'],
  ['intervenorToSourceGenerate','mid','source','generate','source-supplier'],
  ['intervenorToSourceControl','mid','source','control','source-controller'],
  ['intervenorToTargetGenerate','mid','target','generate','target-supplier'],
  ['intervenorToTargetControl','mid','target','control','target-controller'],
  ['targetToIntervenorGenerate','target','mid','generate','target-output'],
  ['targetToIntervenorControl','target','mid','control','target-control']
 ];
 for(const e of actions.values()){
  const row=rows.get(e.edgeId),a=actors.get(e.from),b=actors.get(e.to);
  if(!row||!a||!b||row.from!==e.from||row.to!==e.to||row.kind!==e.kind||row.effective!==null||row.localityEffectConfirmed!==null||row.noninterferenceConfirmed!==null||row.originalGenerationScreen!==e.generationScreen||!same(row.originalContextBlockers,e.contextBlockers)){errors.push('locality-edge:'+e.edgeId);continue;}
  const d=position(a)<position(b)?1:-1,n=span(a,b),between=visible.filter(m=>position(m)>Math.min(position(a),position(b))&&position(m)<Math.max(position(a),position(b))).sort((x,y)=>d*(position(x)-position(y)));
  counts.relations++;bump(spans,n);if(n===1)counts.adjacent++;else {counts.nonadjacent++;counts[e.kind==='generate'?'nonadjacentGeneration':'nonadjacentControl']++;}
  const expectedPressure=e.kind==='control'?pk(a,b):null;
  if(row.span!==n||row.adjacent!==(n===1)||row.order!==(d===1?'source-before-target':'source-after-target')||
   row.directPressureId!==expectedPressure||expectedPressure&&!pressures.has(expectedPressure)||!Array.isArray(row.intervenors)||!same(row.intervenors.map(m=>m.id),between.map(m=>m.id))){errors.push('locality-position:'+e.edgeId);continue;}
  let routeCount=0;
  for(const [i,m] of between.entries()){
   counts.intervenors++;
   const q=row.intervenors[i],s=observations.get(m.id),bindings={source:a,mid:m,target:b},roles={},tags=[],controllerIds=[],routeRefs=[];
   for(const [field,from,to,kind,tag] of definitions){
    const x=bindings[from],y=bindings[to],edge=read(x,y,kind);
    roles[field]=ref(edge);if(edge){tags.push(tag);if(kind==='control')controllerIds.push(pk(x,y));}
   }
   if(a.element===m.element)tags.push('source-element-peer');if(b.element===m.element)tags.push('target-element-peer');
   if(e.kind==='control'){
    const candidates=neutral.paths.filter(p=>p.helper===m.position+':stem'&&p.threat===a.position+':stem'&&p.target===b.position+':stem').sort((x,y)=>x.kind==='protection'?-1:y.kind==='protection'?1:0);
    for(const p of candidates){
     const dep=deps.get(p.id);
     if(!dep){errors.push('locality-route-missing:'+p.id);continue;}
     routeCount++;counts[p.kind]++;tags.push('intervening-'+p.kind+'-candidate');
     routeRefs.push({pathId:p.id,kind:p.kind,structuralScreen:p.structuralScreen,structuralDependencyRank:dep.structuralDependencyRank,neutralizationConfirmed:null});
    }
   }
   for(const tag of tags)bump(motifs,tag);
   if(!s||q.position!==m.position||q.dayReference!==m.dayReference||q.rootState!==s.directRoot.state||!same(q.groundedPathIds,s.groundedPathIds)||q.effectConfirmed!==null||
    !same(q.roles,roles)||!same([...q.motifs].sort(),tags.sort())||!same([...q.controllerRefs].sort(),controllerIds.sort())||controllerIds.some(id=>!pressures.has(id))||!same(q.routeRefs,routeRefs))errors.push('locality-intervenor:'+e.edgeId+':'+m.id);
  }
  // At most two between stems. Enumerate one-intervenor routes and the
  // ordered two-intervenor route independently of the production bitmask.
  const sequences=between.map(m=>[a,m,b]);if(between.length===2)sequences.push([a,...between,b]);
  const chains=[];
  for(const seq of sequences){const es=seq.slice(1).map((x,i)=>read(seq[i],x,'generate'));if(es.every(Boolean))chains.push({id:JSON.stringify(seq.map(x=>x.id)),actorIds:seq.map(x=>x.id),edges:es.map(ref),allLegsAdjacent:es.every(x=>ref(x).span===1),effective:null});}
  counts.chains+=chains.length;counts.adjacentLegChains+=chains.filter(c=>c.allLegsAdjacent).length;
  const state=partial?'partial':n===1?'adjacent-observation':routeCount||chains.length?'intervening-route-observed':'intervening-relations-observed';
  if(!same(row.chains,chains)||row.contextState!==state)errors.push('locality-chain:'+e.edgeId);
 }
 return {...base,counts,motifs,spans,errors};
}
