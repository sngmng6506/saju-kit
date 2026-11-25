// E1 discrepancy diagnosis. A profile comparison is a partial order of
// evidence, never a physical strength measurement. Preserve legacy states.
const pair=(p,a,b)=>p.left===a&&p.right===b||p.left===b&&p.right===a;
const orient=(r,reverse)=>!reverse?r:r==='left-evidence-dominates'?'right-evidence-dominates':r==='right-evidence-dominates'?'left-evidence-dominates':r;
const compare=(p,reverse)=>p?{relation:orient(p.relation,reverse),sourceOnly:[...(reverse?p.rightOnly:p.leftOnly)??[]],
 targetOnly:[...(reverse?p.leftOnly:p.rightOnly)??[]],unknown:[...(p.unknown??[])]}:null;
const unique=xs=>[...new Set(xs)].sort();
const conditions=xs=>(xs??[]).map(c=>({id:c.id,state:c.state,evidence:c.evidence??null}));
const flags=xs=>xs.filter(c=>c.state!=='supported').map(c=>c.id+':'+c.state);
const endpoint=(root,capacity,id)=>{
 const r=root?.occurrences?.find(x=>x.id===id),a=capacity?.occurrences?.find(x=>x.id===id);
 return {id,layer:a?.layer??r?.layer??null,tenGod:a?.tenGod??null,rootState:r?.rootAxes?.anySubstantial??null,
  roots:r?.roots??[],contestedRootIds:r?.contestedRootIds??[],contexts:r?.contexts??[],localSupply:r?.localSupply??null};
};
export function diagnoseDirectedPremise(p,context,partial=false){
 const e=p.evidence;
 if(!e||typeof e.from!=='string'||typeof e.to!=='string'||!['generate','control','combine'].includes(e.kind))return null;
 const {from,to,kind}=e;
 const root=context?.rootContext,capacity=context?.roleCapacity,command=context?.monthCommandReview;
 const ps=(root?.comparisons??[]).filter(x=>pair(x,from,to));
 const r=ps.length===1?ps[0]:null,reverse=r?.left!==from;
 const original=compare(r?.original,reverse),sensitivity=compare(r?.sensitivity,reverse),
  nonseason=compare(r?.nonseason,reverse),seasonOnly=compare(r?.seasonOnly,reverse);
 const a=endpoint(root,capacity,from),b=endpoint(root,capacity,to);
 const cs=conditions(e.conditions),find=id=>cs.find(c=>c.id===id),reasons=[];
 if(partial)reasons.push('partial-chart');
 if(!cs.length)reasons.push('edge-conditions-not-projected');
 if(find('visible-participant-access')?.state==='unresolved')reasons.push('participant-access-unresolved');
 if(a.contestedRootIds.length||b.contestedRootIds.length)reasons.push('contested-root-context');
 if(find('source-root-capacity')?.state==='unresolved'){
  reasons.push('source-direct-root-not-established');
  if(find('source-root-capacity').evidence?.indirectSupply===true)reasons.push('source-indirect-supply-observed-not-certified');
 }
 if(find('target-receptive-root-context')?.state==='unresolved')reasons.push('target-receptive-root-not-established');
 if(find('source-pressure')?.state==='unresolved')reasons.push('source-pressure-unresolved');
 if(find('remaining-context')?.state==='unresolved')reasons.push('remaining-context-unresolved');
 if(kind==='control'){
  if(original?.relation==='mixed-evidence'){
   if(sensitivity?.relation==='unresolved')reasons.push('mixed-profile-with-contextual-root-uncertainty');
   else if(nonseason?.relation&&seasonOnly?.relation&&nonseason.relation!==seasonOnly.relation)reasons.push('season-versus-nonseason-profile-disagreement');
   else reasons.push('mixed-profile-axes');
  }
  if(original?.relation==='right-evidence-dominates')reasons.push(sensitivity?.relation===original.relation?'target-profile-dominance-preserved':'target-profile-dominance-context-sensitive');
  if(find('directional-control-evidence')?.state==='unresolved')reasons.push('directional-control-not-established');
 }
 if(find('relative-generation-context')?.state==='unresolved')reasons.push('generation-comparison-context-unresolved');
 if(command?.status==='unresolved')reasons.push('command-not-assessed');
 const supply=(context?.groundedSupply?.actions??[]).filter(a=>a.from===from&&a.to===to&&a.kind===kind);
 const targetContext=(context?.interpositionReview?.pressureContexts??[]).find(x=>x.targetId===to);
 const sourceContext=(context?.interpositionReview?.pressureContexts??[]).find(x=>x.targetId===from);
 const sourceNode=(context?.groundedSupply?.nodes??[]).find(n=>n.occurrenceIds.includes(from))?.nodeId;
 const cc=(command?.comparisonCoverage??[]).filter(x=>pair(x,from,to)),cmd=cc.length===1?cc[0]:null;
 return {from,to,kind,edgeId:e.edgeId??null,premiseState:p.state,conditionStates:cs,conditionBlockers:flags(cs),reasons:unique(reasons),
  groundedSupplyAction:supply.length===1?supply[0]:null,
  interpositionContext:{sourceScope:sourceContext?.targetScope??null,targetScope:targetContext?.targetScope??null,
   sourceControllers:sourceContext?.controllers??[],targetControllers:targetContext?.controllers??[],
   exactControl:kind==='control'?targetContext?.controllers.find(c=>c.controllerNodeId===sourceNode)??null:null,
   neutralizationConfirmed:null},
  source:a,target:b,comparison:{original,sensitivity,nonseason,seasonOnly,coverage:ps.length===1?'exact-pair':ps.length?'duplicate-pair':'not-projected'},
  command:{status:command?.status??null,reason:command?.reason??null,pairStatus:cmd?.status??null,hypotheses:(cmd?.hypotheses??[]).map(h=>({id:h.id,relation:orient(h.relation,cmd.left!==from)}))},
  effectConfirmed:null};
}
export function diagnoseSourcePremise(p,context,partial=false){
 const edge=diagnoseDirectedPremise(p,context,partial);
 if(edge)return {...p,evidence:p.evidence??null,diagnostic:{kind:'directed-edge',reasons:edge.reasons,edge}};
 let kind='other-premise',reasons=[];
 if(p.id==='day-capacity-hypothesis'||p.id==='day-capacity-for-control'||p.id==='weak-day-mediation-motive'){
  kind='day-capacity';if(p.state==='unresolved')reasons.push(partial?'partial-chart':'day-direction-or-polarity-unresolved');
  if(p.state==='opposed')reasons.push('day-hypothesis-opposed');
 }else if(p.id.includes('relative-dominance')||p.id.includes('relative-contrast')){
  kind='comparison';reasons=p.evidence?.readiness?.reasons??[];
 }else if(p.id==='witness-mechanism-context'){
  kind='route-context';reasons=flags(conditions(p.evidence?.conditions));
 }else if(p.id.includes('root-access')||p.id.includes('root-observation')){
  kind='root-observation';if(p.state==='unresolved')reasons.push('root-access-not-established');
 }else if(p.state==='unresolved'){
  kind='classical-condition';reasons.push('role-demand-or-context-not-established');
 }
 return {id:p.id,state:p.state,evidence:p.evidence??null,diagnostic:{kind,reasons:unique(reasons)}};
}
// Use source packet's explicit endpoints, not a coincidental loss of a
// policy row, to attribute hour dependence. Other lost paths need tracing.
export function summarizeRoleTriage(packet,rows){
 const issues=[],reasonCounts={},gapRows=[],scopeRows=[];
 for(const c of packet.cases){
  const full=rows.find(r=>r.id===c.id&&r.partial===false),partial=rows.find(r=>r.id===c.id&&r.partial===true);
  if(!full||!partial)continue;
  if(c.scope!=='ordinary-review')scopeRows.push({id:c.id,scope:c.scope,directionStatus:full.directionStatus,probed:c.probes.length>0});
  for(const p of full.probes??[]){
   const fixture=c.probes.find(x=>x.id===p.id),q=partial.probes?.find(x=>x.id===p.id);
   if(!fixture)continue;
   for(const w of p.rows??[])for(const premise of w.premises??[]){
    if(premise.state==='supported')continue;
    const reasons=premise.diagnostic?.reasons??[];
    for(const reason of reasons)reasonCounts[reason]=(reasonCounts[reason]??0)+1;
    if(['conflicting','opposed'].includes(premise.state))issues.push({caseId:c.id,probeId:p.id,scope:c.scope,candidateId:w.candidateId,
     route:w.route??null,premiseId:premise.id,state:premise.state,diagnostic:premise.diagnostic??null,effectConfirmed:null});
   }
   if(p.coverage==='observed'&&q&&q.coverage!=='observed'){
    const explicitHourIds=unique(Object.values(fixture.match).filter(v=>typeof v==='string'&&/^(visible|hidden):hour(?::|$)/.test(v)));
    gapRows.push({caseId:c.id,probeId:p.id,partialCoverage:q.coverage,explicitHourIds,
     classification:explicitHourIds.length?'explicit-hour-endpoint-removed':'indirect-dependency-review',causalLossConfirmed:null});
   }
  }
 }
 return {version:'role-source-triage-v1',issues,reasonCounts,gapRows,scopeRows,effectConfirmed:null,
  limitations:['reason-counts-are-repeated-premise-observations','no-profile-axis-voting','no-physical-causality-or-effect','explicit-hour-endpoint-not-proof-of-all-dependencies']};
}

// Audit projection of the chart-level review; all counts are observations,
// not independent donor quantities or estimates of effect.
export function summarizeGroundedSupplyReview(c,review,partial){
 const errors=[],base={id:c.id,partial,effectConfirmed:null};
 if(!review||review.status!==(partial?'partial':'diagnostic')||review.completeHour!==!partial||review.selectionAuthority!==false||review.effectiveSupply!==null||
  !Array.isArray(review.occurrences)||!Array.isArray(review.actions))return {...base,errors:['grounded-supply-review-invalid']};
 const actors=new Map(review.occurrences.map(a=>[a.id,a]));
 if(actors.size!==review.occurrences.length||new Set(review.actions.map(a=>a.edgeId)).size!==review.actions.length)errors.push('duplicate-supply-identity');
 const counts={visibleGroundedPaths:0,visibleScreenedPaths:0,visibleIndirectWithoutDirectRoot:0,screenedGenerationActions:0},reasons={};
 for(const a of actors.values()){
  const ids=new Set(a.paths.map(p=>p.id));
  if(ids.size!==a.paths.length||a.effectiveSupply!==null||a.directRoot.preservationConfirmed!==null||
   [...a.groundedPathIds,...a.screenedPathIds].some(id=>!ids.has(id))||
   a.screenedPathIds.some(id=>!a.groundedPathIds.includes(id))||
   (partial||a.layer!=='visible')&&a.screenedPathIds.length)errors.push('supply-path-integrity:'+a.id);
  if(a.layer==='visible'){
   counts.visibleGroundedPaths+=a.groundedPathIds.length;
   counts.visibleScreenedPaths+=a.screenedPathIds.length;
   if(a.directRoot.state!==true&&a.groundedPathIds.length)counts.visibleIndirectWithoutDirectRoot++;
   for(const p of a.paths)if(p.upstream==='observed')for(const reason of p.concerns)reasons[reason]=(reasons[reason]??0)+1;
  }
  if(a.paths.some(p=>p.recipientId!==a.id||p.effectiveSupply!==null||p.donor.independentSupplyConfirmed!==null||
   p.donor.kind==='local-branch-constituents'&&p.donor.groundedRootIds.some(id=>!id.startsWith('hidden:'+p.donor.position+':'))))errors.push('supply-path-grounding:'+a.id);
 }
 for(const a of review.actions){
  const screen=a.generationScreen==='grounded-generation-context-screen-met';
  if(screen)counts.screenedGenerationActions++;
  if(!actors.has(a.from)||!actors.has(a.to)||a.effective!==null||a.selectionAuthority!==false||
   screen&&(partial||a.kind!=='generate'||a.targetAccess!=='visible'||a.contextBlockers.length||
    !['direct-root-observed','grounded-indirect-path-observed'].includes(a.sourceBasis)))errors.push('supply-action-integrity:'+a.edgeId);
 }
 return {...base,counts,reasons,errors};
}

export function summarizeInterpositionReview(c,review,partial){
 const base={id:c.id,partial,effectConfirmed:null,neutralizationConfirmed:null};
 const errors=[];
 if(!review||review.version!=='interposition-review-v1'||review.targetScope!=='day-master-and-visible-peer-resource'||review.status!==(partial?'partial':'diagnostic')||
  review.completeHour!==!partial||review.selectionAuthority!==false||review.effectConfirmed!==null||
  review.neutralizationConfirmed!==null||!Array.isArray(review.paths)||!review.summary)return {...base,errors:['interposition-review-invalid']};
 const paths=review.paths.filter(p=>p&&typeof p==='object'&&Array.isArray(p.blockers));
 if(paths.length!==review.paths.length)errors.push('interposition-path-shape');
 const ids=new Set(paths.map(p=>p.id));
 if(ids.size!==paths.length)errors.push('duplicate-interposition-path');
 const counts={candidatePaths:paths.length,excludedTargetPaths:review.summary.excludedTargetPaths,protectionPaths:paths.filter(p=>p.kind==='protection').length,
  mediationPaths:paths.filter(p=>p.kind==='mediation').length,
  structuralScreensMet:paths.filter(p=>p.structuralScreen==='grounded-structure-screen-met').length,
  hiddenParticipantPaths:paths.filter(p=>p.blockers.includes('hidden-participant-access')).length,
  pressureBlockedPaths:paths.filter(p=>p.blockers.some(b=>b.includes('control'))).length,
  nonlocalChainPaths:paths.filter(p=>p.blockers.some(b=>b.includes('nonlocal'))).length};
 const excluded=review.summary.excludedReasons;
 if(Object.entries(counts).some(([k,v])=>review.summary[k]!==v)||!excluded||typeof excluded!=='object'||
  !Number.isSafeInteger(review.summary.excludedTargetPaths)||Object.values(excluded).some(n=>!Number.isSafeInteger(n)||n<0)||
  Object.values(excluded).reduce((a,b)=>a+b,0)!==review.summary.excludedTargetPaths)errors.push('interposition-summary-mismatch');
 for(const p of paths){
  const participants=[p.participants?.helper,p.participants?.threat,p.participants?.target];
  const visible=participants.every(x=>x?.kind==='visible-stem');
  if(p.participants?.target?.kind!=='visible-stem')errors.push('interposition-target-scope:'+p.id);
  if(!['protection','mediation'].includes(p.kind)||!Array.isArray(p.edges)||!Array.isArray(p.sourceOccurrenceIds)||p.sourceOccurrenceIds.length===0||
   !Array.isArray(p.blockers)||new Set(p.sourceOccurrenceIds).size!==p.sourceOccurrenceIds.length||
   p.effectConfirmed!==null||p.neutralizationConfirmed!==null||p.effectiveProtection!==null||
   p.effectiveMediation!==null||p.selectionAuthority!==false||p.targetRootRequiredForPathObservation!==false||
   p.blockers.length!==new Set(p.blockers).size||!p.pressure||!Array.isArray(p.pressure.helper)||!Array.isArray(p.pressure.threat)||!Array.isArray(p.pressure.target))errors.push('interposition-path-contract:'+p.id);
  const screen=p.structuralScreen==='grounded-structure-screen-met';
  if(p.structuralScreen!==(p.blockers.length?'context-review':'grounded-structure-screen-met'))errors.push('interposition-screen-state:'+p.id);
  if(screen&&(partial||!visible||!p.chainLocal||p.blockers.length||
   p.participants.helper.state!=='grounded-observation'||p.participants.threat.state!=='grounded-observation'||
   p.pressure.helperRootedControllerObserved||p.pressure.helperControllerUnresolved))errors.push('interposition-screen-leak:'+p.id);
  if(p.kind==='mediation'&&Array.isArray(p.edges)&&p.edges.length===3){
   const local=p.edges.slice(0,2).every(e=>e.local===true);
   if(p.chainLocal!==local||p.directThreatControlLocal!==p.edges[2].local||
    p.blockers.includes('nonlocal-generation-chain')!==!local)errors.push('mediation-chain-locality-mismatch:'+p.id);
  }
 }
 const pressureCounts={visibleTargets:0,inScopeControllers:0,outsideScopeControllers:0,inScopeWithCandidates:0,inScopeWithoutCandidates:0,outsideScopeWithCandidates:0,screenedControllers:0};
 const contexts=review.pressureContexts;
 if(!Array.isArray(contexts))errors.push('pressure-context-missing');
 else{
  const targetIds=new Set(),bound=new Set();
  for(const t of contexts){
   pressureCounts.visibleTargets++;
   if(targetIds.has(t.targetId)||!/^visible:(year|month|day|hour)$/.test(t.targetId)||t.targetNodeId!==t.targetId.slice(8)+':stem'||
    !['in-scope','outside-target-scope'].includes(t.targetScope)||!Array.isArray(t.controllers)||t.effective!==null||t.allPressureResolved!==null){errors.push('pressure-target-contract');continue;}
   targetIds.add(t.targetId);
   const controllerIds=new Set();
   for(const c of t.controllers){
    const outside=t.targetScope==='outside-target-scope';
    if(controllerIds.has(c.controllerNodeId)||!Array.isArray(c.candidatePathIds)||!Array.isArray(c.evaluatedPathIds)||!Array.isArray(c.screenedPathIds)||
     c.neutralizationConfirmed!==null||c.remainingPressureConfirmed!==null){errors.push('pressure-controller-contract:'+t.targetId);continue;}
    controllerIds.add(c.controllerNodeId);
    if(outside){pressureCounts.outsideScopeControllers++;if(c.candidatePathIds.length)pressureCounts.outsideScopeWithCandidates++;}
    else{pressureCounts.inScopeControllers++;if(c.candidatePathIds.length)pressureCounts.inScopeWithCandidates++;else pressureCounts.inScopeWithoutCandidates++;}
    if(c.screenedPathIds.length)pressureCounts.screenedControllers++;
    const expected=paths.filter(p=>p.target===t.targetNodeId&&p.threat===c.controllerNodeId),equal=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
    if(c.coverage!==(outside?'outside-target-scope':c.candidatePathIds.length?'candidate-path-observed':'no-candidate-path-observed')||
     new Set(c.candidatePathIds).size!==c.candidatePathIds.length||
     !equal(c.evaluatedPathIds,expected.map(p=>p.id))||!equal(c.screenedPathIds,expected.filter(p=>p.structuralScreen==='grounded-structure-screen-met').map(p=>p.id))||
     (!outside&&!equal(c.candidatePathIds,c.evaluatedPathIds))||(outside&&c.evaluatedPathIds.length)||partial&&c.screenedPathIds.length)
      errors.push('pressure-path-binding:'+t.targetId+':'+c.controllerNodeId);
    for(const id of c.evaluatedPathIds)bound.add(id);
   }
  }
  if(targetIds.size!==(partial?3:4)||!targetIds.has('visible:day')||bound.size!==paths.length||paths.some(p=>!bound.has(p.id)))errors.push('pressure-context-coverage');
 }
 return {...base,counts,pressureCounts,errors};
}

