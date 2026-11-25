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
 const neutralContexts=context?.interpositionReview?.roleNeutral?.pressureContexts??[];
 const neutralTarget=neutralContexts.find(x=>x.targetId===to),neutralSource=neutralContexts.find(x=>x.targetId===from);
 const targetContext=(context?.interpositionReview?.pressureContexts??[]).find(x=>x.targetId===to);
 const sourceContext=(context?.interpositionReview?.pressureContexts??[]).find(x=>x.targetId===from);
 const sourceNode=(context?.groundedSupply?.nodes??[]).find(n=>n.occurrenceIds.includes(from))?.nodeId;
 const cc=(command?.comparisonCoverage??[]).filter(x=>pair(x,from,to)),cmd=cc.length===1?cc[0]:null;
 return {from,to,kind,edgeId:e.edgeId??null,premiseState:p.state,conditionStates:cs,conditionBlockers:flags(cs),reasons:unique(reasons),
  groundedSupplyAction:supply.length===1?supply[0]:null,
  interpositionContext:{sourceScope:sourceContext?.targetScope??null,targetScope:targetContext?.targetScope??null,
   sourceControllers:sourceContext?.controllers??[],targetControllers:targetContext?.controllers??[],
   exactControl:kind==='control'?targetContext?.controllers.find(c=>c.controllerNodeId===sourceNode)??null:null,
   roleNeutral:{sourceControllers:neutralSource?.controllers??[],targetControllers:neutralTarget?.controllers??[],
    exactControl:kind==='control'?neutralTarget?.controllers.find(c=>c.controllerNodeId===sourceNode)??null:null},
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

function auditInterpositionScope(c,review,partial,neutral=false){
 const base={id:c.id,partial,effectConfirmed:null,neutralizationConfirmed:null};
 const errors=[];
 if(!review||review.version!==(neutral?'role-neutral-interposition-v1':'interposition-review-v1')||review.targetScope!==(neutral?'all-visible-stems':'day-master-and-visible-peer-resource')||review.status!==(partial?'partial':'diagnostic')||
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
    !['in-scope','outside-target-scope'].includes(t.targetScope)||neutral&&t.targetScope!=='in-scope'||!Array.isArray(t.controllers)||t.effective!==null||t.allPressureResolved!==null){errors.push('pressure-target-contract');continue;}
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


export function summarizeInterpositionReview(c,review,partial){
 const legacy=auditInterpositionScope(c,review,partial),neutral=review?.roleNeutral;
 const all=auditInterpositionScope(c,neutral,partial,true);
 const errors=[...legacy.errors,...all.errors.map(e=>'role-neutral:'+e)];
 if(!neutral||neutral.roleDemandConfirmed!==null)errors.push('role-neutral-demand-authority');
 if(!legacy.errors.length&&!all.errors.length){
  const paths=new Map(neutral.paths.map(p=>[p.id,p])),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const oldPaths=new Set(review.paths.map(p=>p.id)),oldContexts=new Map(review.pressureContexts.map(t=>[t.targetId,t]));
  const actualAdded=neutral.paths.filter(p=>!oldPaths.has(p.id));
  if(review.paths.some(p=>!same(p,paths.get(p.id)))||
   neutral.summary.excludedTargetPaths!==(review.summary.excludedReasons['hidden-or-branch-target']??0)||
   Object.keys(neutral.summary.excludedReasons).some(k=>k!=='hidden-or-branch-target')||
   actualAdded.length!==(review.summary.excludedReasons['non-supportive-visible-target']??0))errors.push('role-neutral-legacy-projection');
  for(const t of neutral.pressureContexts){
   const old=oldContexts.get(t.targetId);
   if(!old||old.controllers.length!==t.controllers.length){errors.push('role-neutral-controller-coverage:'+t.targetId);continue;}
   for(const a of t.controllers){
    const b=old.controllers.find(x=>x.controllerNodeId===a.controllerNodeId);
    if(!b||!same(a.candidatePathIds,b.candidatePathIds)||a.distance!==b.distance||a.local!==b.local||a.donorState!==b.donorState||a.classification!==b.classification||
     old.targetScope==='in-scope'&&!same(a,b))errors.push('role-neutral-controller-parity:'+t.targetId);
   }
  }
  if(actualAdded.some(p=>review.pressureContexts.find(t=>t.targetNodeId===p.target)?.targetScope!=='outside-target-scope'))errors.push('role-neutral-added-target-scope');
 }
 return {...legacy,roleNeutral:{counts:all.counts??null,pressureCounts:all.pressureCounts??null,effectConfirmed:null},errors};
}

export function summarizeRoleDemandReview(c,mechanism,partial){
 const base={id:c.id,partial,effectConfirmed:null},errors=[],counts={candidates:0,objectives:0,obligations:0,unboundRoles:0,hiddenRoles:0,unmappedRequirements:0},axes={};
 if(!Array.isArray(mechanism?.candidates))return {...base,errors:['demand-candidates-missing']};
 const candidateIds=new Set();
 for(const m of mechanism.candidates){
  const p=m.rolePriority,d=p?.demandReview;
  if(candidateIds.has(m.candidateId)||!d||d.candidateId!==m.candidateId||d.version!=='role-demand-review-v1'||d.selectionAuthority!==false||
   d.actualDemand!==null||d.excessConfirmed!==null||d.deficiencyConfirmed!==null||d.effectConfirmed!==null||!Array.isArray(d.objectives)||!Array.isArray(d.unmappedRequirements)){errors.push('demand-contract:'+m.candidateId);continue;}
  candidateIds.add(m.candidateId);
  if(d.status==='out-of-scope'){if(d.objectives.length||d.unmappedRequirements.length)errors.push('demand-scope-leak:'+m.candidateId);continue;}
  counts.candidates++;
  if(d.status!==(partial?'partial':'diagnostic')){errors.push('demand-status:'+m.candidateId);continue;}
  const expected=(p.objectiveReview?.objectives?.length??0)+(p.killingStrategies?.food?.length??0)+(p.killingStrategies?.mediation?.length??0)+
   [...(p.killingWealth?.supply??[]),...(p.killingWealth?.dualRoles??[]),...(p.killingWealth?.mediationContacts??[]),
    ...(p.resourceStrategies?.outputDrain??[]),...(p.resourceStrategies?.killingSupply??[]),...(p.resourceStrategies?.officerContext??[])].reduce((n,x)=>n+x.objectives.length,0);
  if(d.objectives.length!==expected)errors.push('demand-objective-coverage:'+m.candidateId);
  const actorRows=d.actorEvidence??[],actors=new Map(actorRows.map(a=>[a.id,a])),ids=new Set();
  if(actors.size!==actorRows.length||actorRows.some(a=>a.effectiveForce!==null))errors.push('demand-actor-integrity:'+m.candidateId);
  for(const o of d.objectives){
   counts.objectives++;
   if(ids.has(o.id)||o.selected!==false||o.actualDemand!==null||o.effectConfirmed!==null||!Array.isArray(o.obligations)){errors.push('demand-objective-contract:'+o.id);continue;}
   ids.add(o.id);
   const seen=new Set();
   for(const q of o.obligations){
    counts.obligations++;axes[q.axis]=(axes[q.axis]??0)+1;
    const a=actors.get(q.actorId);
    if(q.actorId===null)counts.unboundRoles++;
    if(a?.layer==='hidden')counts.hiddenRoles++;
    if(seen.has(q.id)||q.actorId!==(o.roles[q.role]??null)||q.actorId!==null&&!a||
     q.evidenceStatus!==(q.actorId===null?'unbound-role-review':a?.layer==='hidden'?'hidden-access-review':'structural-context-only')||
     q.actualDemand!==null||q.excessConfirmed!==null||q.deficiencyConfirmed!==null||q.preservationConfirmed!==null)errors.push('demand-obligation-contract:'+o.id+':'+q.id);
    seen.add(q.id);
   }
  }
  counts.unmappedRequirements+=d.unmappedRequirements.length;
  if(d.unmappedRequirements.some(x=>!ids.has(x.objectiveRef)||typeof x.label!=='string'))errors.push('demand-unmapped-reference:'+m.candidateId);
 }
 return {...base,counts,axes,errors};
}

export function summarizeResourceDemandConditions(c,mechanism,partial){
 const base={id:c.id,partial,effectConfirmed:null},errors=[],counts={resources:0,visibleResources:0,deliveryEdges:0,alternativeRelations:0,sharedRootRelations:0,sharedContextRootRelations:0,sharedDonorRelations:0,screenedDeliveries:0,contexts:0},states={};
 const chart=mechanism?.resourceSupplyContext,status=partial?'partial':'diagnostic';
 const noAuthority=x=>x&&x.necessityConfirmed===null&&x.excessConfirmed===null&&x.deficiencyConfirmed===null&&x.preservationConfirmed===null&&x.effective===null;
 if(!noAuthority(chart)||chart.status!==status||chart.completeHour!==!partial||chart.selectionAuthority!==false||!chart.day||
  (partial&&chart.day.direction!==null)||chart.day.actualBurdenConfirmed!==null||!Array.isArray(chart.resources)||!Array.isArray(chart.alternatives))return {...base,errors:['resource-context-contract']};
 const resources=new Map(chart.resources.map(r=>[r.id,r])),pairs=new Set();
 if(resources.size!==chart.resources.length)errors.push('resource-duplicate');
 for(const r of resources.values()){
  counts.resources++;if(r.layer==='visible')counts.visibleResources++;if(r.delivery)counts.deliveryEdges++;
  if(r.deliveryObservation==='structural-delivery-screen-met')counts.screenedDeliveries++;
  const expectedObservation=partial?'partial':r.layer!=='visible'?'hidden-access-review':r.delivery?.generationScreen==='grounded-generation-context-screen-met'?'structural-delivery-screen-met':r.delivery?'literal-delivery-context-review':'literal-delivery-not-observed';
  if(r.deliveryObservation!==expectedObservation||!Array.isArray(r.supplyContextRootIds)||!Array.isArray(r.observedSupplyDonorNodeIds)||
   r.observedSupplyRootIds.some(id=>!r.supplyContextRootIds.includes(id))||r.contestedRootIds.some(id=>!r.supplyContextRootIds.includes(id)))errors.push('resource-delivery-observation:'+r.id);
  if(!noAuthority(r)||r.delivery&&(r.delivery.from!==r.id||r.delivery.to!==chart.day.id||r.delivery.kind!=='generate'||r.delivery.effective!==null))errors.push('resource-delivery:'+r.id);
 }
 for(const a of chart.alternatives){
  counts.alternativeRelations++;if(a.sharedRootIds.length)counts.sharedRootRelations++;
  const r=resources.get(a.resourceId),b=resources.get(a.alternativeId),k=JSON.stringify([a.resourceId,a.alternativeId]);
  const shared=r&&b?r.observedSupplyRootIds.filter(id=>b.observedSupplyRootIds.includes(id)).sort():[];
  const commonContext=r&&b?r.supplyContextRootIds.filter(id=>b.supplyContextRootIds.includes(id)).sort():[];
  const commonDonors=r&&b?r.observedSupplyDonorNodeIds.filter(id=>b.observedSupplyDonorNodeIds.includes(id)).sort():[];
  if(commonContext.length)counts.sharedContextRootRelations++;
  if(commonDonors.length)counts.sharedDonorRelations++;
  const coverage=r&&b?(r.layer!=='visible'||b.layer!=='visible'?'hidden-access-review':shared.length?'shared-root-review':commonDonors.length?'shared-donor-review':commonContext.length?'shared-context-root-review':!r.observedSupplyRootIds.length||!b.observedSupplyRootIds.length?'root-basis-unestablished':'distinct-observed-root-ids'):null;
  if(JSON.stringify(a.sharedContextRootIds?.slice().sort())!==JSON.stringify(commonContext)||JSON.stringify(a.sharedDonorNodeIds?.slice().sort())!==JSON.stringify(commonDonors)||a.coverage!==coverage)errors.push('resource-alternative-context:'+k);
  if(pairs.has(k)||!r||!b||r===b||!b.delivery||JSON.stringify(a.delivery)!==JSON.stringify(b.delivery)||
   JSON.stringify([...a.sharedRootIds].sort())!==JSON.stringify(shared)||a.independentSupplyConfirmed!==null||a.substitutionConfirmed!==null)errors.push('resource-alternative:'+k);
  pairs.add(k);
 }
 const expectedPairs=[...resources.values()].flatMap(r=>[...resources.values()].filter(b=>r.id!==b.id&&b.delivery).map(b=>JSON.stringify([r.id,b.id])));
 if(expectedPairs.length!==pairs.size||expectedPairs.some(k=>!pairs.has(k)))errors.push('resource-alternative-coverage');
 const ids=new Set(['required-resource-injury','excess-resource-moderation','drain-resource-supported-strong-day','drain-burdens-weak-day','killing-supplies-light-resource','weak-day-heavy-resource-original-reading','killing-supply-with-both-day-and-resource-heavy','officer-independent-role-review']);
 for(const m of mechanism.candidates??[]){
  const p=m.rolePriority,d=p?.resourceDemandConditions,source=p?.demandReview;
  if(!noAuthority(d)||d.candidateId!==m.candidateId||d.selectionAuthority!==false||!Array.isArray(d.contexts)||!source){errors.push('resource-demand-contract:'+m.candidateId);continue;}
  const expected=source.objectives.filter(o=>ids.has(o.objectiveId));
  if(d.contexts.length!==expected.length)errors.push('resource-objective-coverage:'+m.candidateId);
  const seen=new Set();
  for(const x of d.contexts){
   counts.contexts++;states[x.contextState]=(states[x.contextState]??0)+1;
   const o=expected.find(o=>o.id===x.objectiveRef);
   if(!noAuthority(x)||!o||seen.has(x.objectiveRef)||x.resourceId!==o.roles.resource||!resources.has(x.resourceId)||
    x.dayId!==chart.day.id||x.deliveryObservation!==resources.get(x.resourceId)?.deliveryObservation||
    JSON.stringify(x.delivery)!==JSON.stringify(resources.get(x.resourceId)?.delivery)||x.sourceConditionalStatus!==o.conditionalStatus||!x.unprovedConditions.length||
    x.unprovedConditions.some(p=>p.state!=='unresolved')||partial&&x.dayPremise!=='unresolved')errors.push('resource-objective-binding:'+x.objectiveRef);
   seen.add(x.objectiveRef);
  }
 }
 return {...base,counts,states,errors};
}


export function summarizeOutputDemandConditions(c,mechanism,partial){
 const base={id:c.id,partial,effectConfirmed:null},errors=[],counts={outputs:0,visibleOutputs:0,food:0,hurtingOfficer:0,drainEdges:0,screenedDrains:0,killingControls:0,properOfficerControls:0,wealthFeeds:0,hiddenWealthFeeds:0,contexts:0},states={};
 const chart=mechanism?.outputSupplyContext,status=partial?'partial':'diagnostic';
 const noAuthority=x=>x&&x.necessityConfirmed===null&&x.excessConfirmed===null&&x.deficiencyConfirmed===null&&x.preservationConfirmed===null&&x.effective===null;
 if(!noAuthority(chart)||chart.status!==status||chart.completeHour!==!partial||chart.selectionAuthority!==false||chart.day?.id!=='visible:day'||
  (partial&&chart.day.direction!==null)||chart.day.actualBurdenConfirmed!==null||
  !Array.isArray(chart.actorInventory)||!Array.isArray(chart.outputs)||!Array.isArray(chart.wealthFeeds)||!Array.isArray(mechanism.candidates))return {...base,errors:['output-context-contract']};
 const actors=new Map(chart.actorInventory.map(a=>[a.id,a])),outputs=new Map(chart.outputs.map(a=>[a.id,a]));
 const raw=mechanism.groundedSupply?.actions,capacity=mechanism.roleCapacity?.occurrences;
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),key=e=>JSON.stringify([e.from,e.to,e.kind]);
 const edgeRef=e=>({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,sourceBasis:e.sourceBasis,generationScreen:e.generationScreen,controlComparison:e.controlComparison,effective:null});
 const gods={output:['식신','상관'],resource:['정인','편인'],wealth:['정재','편재'],officer:['정관','편관']};
 if(!Array.isArray(raw)||!Array.isArray(capacity))return {...base,errors:['output-upstream-missing']};
 const edges=new Map(raw.map(e=>[key(e),e]));
 const expectedInventory=capacity.map(a=>({id:a.id,layer:a.layer,tenGod:a.tenGod,dayReference:!!a.dayReference}));
 if(!eq(chart.actorInventory,expectedInventory)||actors.size!==chart.actorInventory.length||edges.size!==raw.length||
  outputs.size!==chart.outputs.length||!eq(chart.outputs.map(a=>a.id),expectedInventory.filter(a=>!a.dayReference&&gods.output.includes(a.tenGod)).map(a=>a.id)))errors.push('output-inventory');
 const related=(id,kind,dir,g)=>raw.filter(e=>e.kind===kind&&e[dir==='in'?'to':'from']===id&&
  !actors.get(e[dir==='in'?'from':'to'])?.dayReference&&gods[g].includes(actors.get(e[dir==='in'?'from':'to'])?.tenGod)).map(edgeRef);
 const daySupply=related(chart.day.id,'generate','in','resource'),dayPressure=related(chart.day.id,'control','in','officer');
 const wealthControl=raw.filter(e=>e.kind==='control'&&gods.wealth.includes(actors.get(e.from)?.tenGod)&&gods.resource.includes(actors.get(e.to)?.tenGod)).map(edgeRef);
 const wealthOfficer=raw.filter(e=>e.kind==='generate'&&gods.wealth.includes(actors.get(e.from)?.tenGod)&&gods.officer.includes(actors.get(e.to)?.tenGod)).map(edgeRef);
 if(!eq(chart.day.resourceSupply,daySupply)||!eq(chart.day.officerPressure,dayPressure)||!eq(chart.wealthResourceControls,wealthControl)||!eq(chart.wealthOfficerSupply,wealthOfficer))errors.push('output-chart-edge-coverage');
 const expectedFeeds=[];
 for(const a of outputs.values()){
  counts.outputs++;if(a.layer==='visible')counts.visibleOutputs++;if(a.tenGod==='식신')counts.food++;if(a.tenGod==='상관')counts.hurtingOfficer++;
  const actor=actors.get(a.id),drain=edges.get(JSON.stringify([chart.day.id,a.id,'generate']));
  const d=drain?edgeRef(drain):null;
  const obs=partial?'partial':a.layer!=='visible'?'hidden-access-review':d?.generationScreen==='grounded-generation-context-screen-met'?'structural-drain-screen-met':d?'literal-drain-context-review':'literal-drain-not-observed';
  if(d)counts.drainEdges++;if(obs==='structural-drain-screen-met')counts.screenedDrains++;
  const control=related(a.id,'control','out','officer').map(e=>({...e,targetTenGod:actors.get(e.to).tenGod}));
  const wealth=related(a.id,'generate','out','wealth'),resource=related(a.id,'control','in','resource');
  counts.killingControls+=control.filter(e=>e.targetTenGod==='편관').length;counts.properOfficerControls+=control.filter(e=>e.targetTenGod==='정관').length;
  if(!noAuthority(a)||!actor||a.layer!==actor.layer||a.tenGod!==actor.tenGod||!eq(a.drain,d)||a.drainObservation!==obs||
   !eq(a.officerControl,control)||!eq(a.wealthSupply,wealth)||!eq(a.resourcePressure,resource)||
   !Array.isArray(a.controllers)||a.controllers.some(c=>c.neutralizationConfirmed!==null))errors.push('output-edge-coverage:'+a.id);
  for(const w of wealth)for(const f of wealthOfficer.filter(e=>e.from===w.to)){
   const direct=edges.get(JSON.stringify([a.id,f.to,'control']));
   expectedFeeds.push({id:JSON.stringify([a.id,w.to,f.to]),outputId:a.id,wealthId:w.to,officerId:f.to,
    outputWealth:w,wealthOfficer:f,officerTenGod:actors.get(f.to).tenGod,directOutputControl:direct?edgeRef(direct):null,
    scope:'literal-chain-only',accessReview:[a.id,w.to,f.to].some(id=>actors.get(id).layer!=='visible')?'hidden-access-review':'visible-context',netEffectConfirmed:null});
  }
 }
 counts.wealthFeeds=chart.wealthFeeds.length;counts.hiddenWealthFeeds=chart.wealthFeeds.filter(f=>f.accessReview==='hidden-access-review').length;
 if(!eq(chart.wealthFeeds,expectedFeeds))errors.push('output-wealth-feed-coverage');
 const specs={
  'resource-output:drain-resource-supported-strong-day':['R01','strong','necessary-drain'],
  'resource-output:drain-burdens-weak-day':['R01','weak','excess-burden'],
  'food:food-control':['K01','food-policy','control-balance'],
  'objective:required-food-control-obstruction':['K02',null,'necessary-control-obstruction'],
  'objective:excess-food-moderation':['K02',null,'excess-moderation'],
  'killing-wealth-dual:wealth-relieves-output-obstruction':['K03',null,'restoration'],
  'killing-wealth-dual:wealth-supplies-insufficient-killing':['K03','strong','relative-balance']
 };
 for(const m of mechanism.candidates){
  const p=m.rolePriority,d=p?.outputDemandConditions,source=p?.demandReview;
  if(!noAuthority(d)||d.candidateId!==m.candidateId||d.status!==source?.status||d.selectionAuthority!==false||!Array.isArray(d.contexts)||!Array.isArray(source?.objectives)){errors.push('output-demand-contract:'+m.candidateId);continue;}
  const expected=source.objectives.filter(o=>Object.hasOwn(specs,o.collection+':'+o.objectiveId)),seen=new Set();
  if(d.contexts.length!==expected.length)errors.push('output-objective-coverage:'+m.candidateId);
  for(const x of d.contexts){
   counts.contexts++;states[x.contextState]=(states[x.contextState]??0)+1;
   const o=expected.find(o=>o.id===x.objectiveRef),a=outputs.get(x.outputId);
   if(!o||!a||seen.has(x.objectiveRef)||!noAuthority(x)){errors.push('output-objective-binding:'+x.objectiveRef);continue;}seen.add(x.objectiveRef);
   const [clause,want,axis]=specs[o.collection+':'+o.objectiveId],roles=o.roles;
   const control=a.officerControl.find(e=>e.to===roles.killing&&e.targetTenGod==='편관')??null;
   const resourcePressure=a.resourcePressure.find(e=>e.from===roles.resource)??null;
   const resourceDelivery=daySupply.find(e=>e.from===roles.resource)??null,killingPressure=dayPressure.find(e=>e.from===roles.killing)??null;
   const wc=wealthControl.find(e=>e.from===roles.wealth&&e.to===roles.resource)??null,wf=wealthOfficer.find(e=>e.from===roles.wealth&&e.to===roles.killing)??null;
   const requiredRoles=clause==='R01'?['day','resource','output']:clause==='K01'?['day','output','killing']:clause==='K02'?['day','output','resource','killing']:['day','output','resource','wealth','killing'];
   const access=requiredRoles.map(role=>({role,id:roles[role],layer:actors.get(roles[role])?.layer}));
   const f=p.killingStrategies?.food?.find(f=>f.id===o.contextId),foodPremise=f?.premises?.find(q=>q.id==='day-capacity-for-control');
   const dayState=want==='food-policy'?foodPremise?.state:want===null?'not-required':partial||chart.day.direction===null?'unresolved':chart.day.direction===want?'supported':'opposed';
   const observed=clause==='R01'?!!a.drain&&!!resourceDelivery:clause==='K01'?!!a.drain&&!!control&&!!killingPressure:
    clause==='K02'?!!control&&!!resourcePressure:axis==='restoration'?!!control&&!!resourcePressure&&!!wc&&!!wf:!!control&&!!wf;
   const contextState=partial?'partial':dayState==='opposed'?'day-hypothesis-opposed':dayState==='unresolved'?'day-hypothesis-unresolved':!observed?'required-edge-unobserved':access.some(x=>x.layer!=='visible')?'hidden-access-review':'source-context-observed';
   const feedIds=expectedFeeds.filter(f=>f.outputId===a.id&&(!roles.killing||f.officerId===roles.killing)&&(!roles.wealth||f.wealthId===roles.wealth)).map(f=>f.id);
   if(x.clause!==clause||x.axis!==axis||x.outputId!==roles.output||x.outputTenGod!==a.tenGod||x.dayId!==roles.day||x.killingId!==(roles.killing??null)||
    x.resourceId!==(roles.resource??null)||x.wealthId!==(roles.wealth??null)||(['K01','K02'].includes(clause)&&a.tenGod!=='식신')||
    x.sourceConditionalStatus!==o.conditionalStatus||!eq(x.drain,a.drain)||x.drainObservation!==a.drainObservation||!eq(x.control,control)||
    !eq(x.resourcePressure,resourcePressure)||!eq(x.resourceDelivery,resourceDelivery)||!eq(x.killingPressure,killingPressure)||
    !eq(x.wealthControl,wc)||!eq(x.wealthKillingFeed,wf)||!eq(x.participantAccess,access)||!eq(x.wealthFeedIds,feedIds)||
    x.dayPremise?.state!==dayState||x.dayPremise?.direction!==chart.day.direction||x.contextState!==contextState||
    !Array.isArray(x.unprovedConditions)||!x.unprovedConditions.length||x.unprovedConditions.some(q=>q.state!=='unresolved'))errors.push('output-objective-binding:'+x.objectiveRef);
  }
 }
 return {...base,counts,states,errors};
}


export function summarizeOfficerDemandConditions(c,mechanism,partial){
 const base={id:c.id,partial,effectConfirmed:null},errors=[],counts={officers:0,visibleOfficers:0,properOfficer:0,killing:0,pressureEdges:0,outputControls:0,wealthSupplies:0,mediationPaths:0,hiddenMediationPaths:0,literalCoexistence:0,visibleCoexistence:0,contexts:0},states={};
 const chart=mechanism?.officerSupplyContext,status=partial?'partial':'diagnostic';
 const safe=x=>x&&x.necessityConfirmed===null&&x.excessConfirmed===null&&x.deficiencyConfirmed===null&&x.preservationConfirmed===null&&x.effective===null;
 if(!safe(chart)||chart.status!==status||chart.completeHour!==!partial||chart.selectionAuthority!==false||chart.day?.id!=='visible:day'||
  chart.day.actualBurdenConfirmed!==null||partial&&chart.day.direction!==null||!Array.isArray(chart.actorInventory)||!Array.isArray(chart.officers)||
  !Array.isArray(chart.mediationPaths)||!Array.isArray(mechanism.candidates))return {...base,errors:['officer-context-contract']};
 const raw=mechanism.groundedSupply?.actions,capacity=mechanism.roleCapacity?.occurrences;
 if(!Array.isArray(raw)||!Array.isArray(capacity))return {...base,errors:['officer-upstream-missing']};
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),key=(a,b,k)=>JSON.stringify([a,b,k]),actors=new Map(chart.actorInventory.map(a=>[a.id,a])),
  officers=new Map(chart.officers.map(a=>[a.id,a])),edges=new Map(raw.map(e=>[key(e.from,e.to,e.kind),e]));
 const ref=e=>({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,sourceBasis:e.sourceBasis,generationScreen:e.generationScreen,controlComparison:e.controlComparison,effective:null});
 const edge=(a,b,k)=>{const e=edges.get(key(a,b,k));return e?ref(e):null;};
 const expected=capacity.map(a=>({id:a.id,layer:a.layer,tenGod:a.tenGod,dayReference:!!a.dayReference}));
 if(!eq(chart.actorInventory,expected)||actors.size!==expected.length||edges.size!==raw.length||officers.size!==chart.officers.length||
  !eq(chart.officers.map(a=>a.id),expected.filter(a=>!a.dayReference&&['정관','편관'].includes(a.tenGod)).map(a=>a.id)))errors.push('officer-inventory');
 const related=(id,kind,dir,gods)=>raw.filter(e=>e.kind===kind&&e[dir==='in'?'to':'from']===id&&
  !actors.get(e[dir==='in'?'from':'to'])?.dayReference&&gods.includes(actors.get(e[dir==='in'?'from':'to'])?.tenGod)).map(ref);
 const paths=[],d=chart.day.id;
 for(const a of officers.values()){
  counts.officers++;if(a.layer==='visible')counts.visibleOfficers++;if(a.tenGod==='정관')counts.properOfficer++;else if(a.tenGod==='편관')counts.killing++;
  const actor=actors.get(a.id),pressure=edge(a.id,d,'control'),resources=related(a.id,'generate','out',['정인','편인']),
   outputs=related(a.id,'control','in',['식신','상관']).map(e=>({...e,sourceTenGod:actors.get(e.from).tenGod})),wealth=related(a.id,'generate','in',['정재','편재']);
  if(pressure)counts.pressureEdges++;counts.outputControls+=outputs.length;counts.wealthSupplies+=wealth.length;
  const observation=partial?'partial':a.layer!=='visible'?'hidden-access-review':pressure?'literal-pressure-context-review':'literal-pressure-not-observed';
  if(!safe(a)||!actor||a.tenGod!==actor.tenGod||a.layer!==actor.layer||a.pressureObservation!==observation||!eq(a.pressure,pressure)||
   !eq(a.resourceSupply,resources)||!eq(a.outputControl,outputs)||!eq(a.wealthSupply,wealth)||!Array.isArray(a.controllers)||
   a.controllers.some(c=>c.neutralizationConfirmed!==null))errors.push('officer-edge-coverage:'+a.id);
  for(const r of resources){
   const delivery=edge(r.to,d,'generate');if(!pressure||!delivery)continue;
   paths.push({id:JSON.stringify([a.id,r.to,d]),officerId:a.id,resourceId:r.to,dayId:d,officerTenGod:a.tenGod,pressure,supply:r,delivery,
    accessReview:[a.id,r.to,d].some(id=>actors.get(id).layer!=='visible')?'hidden-access-review':'visible-context',
    wealthContacts:wealth.map(w=>({wealthId:w.from,officerSupply:w,resourceControl:edge(w.from,r.to,'control'),netEffectConfirmed:null})),
    pressureReliefConfirmed:null,netEffectConfirmed:null});
  }
 }
 counts.mediationPaths=chart.mediationPaths.length;counts.hiddenMediationPaths=chart.mediationPaths.filter(p=>p.accessReview==='hidden-access-review').length;
 if(!eq(chart.mediationPaths,paths))errors.push('officer-mediation-coverage');
 const proper=chart.officers.filter(a=>a.tenGod==='정관'),killing=chart.officers.filter(a=>a.tenGod==='편관');
 const properVisible=proper.filter(a=>a.layer==='visible'),killingVisible=killing.filter(a=>a.layer==='visible');
 const coexistence={properOfficerIds:proper.map(a=>a.id),killingIds:killing.map(a=>a.id),visibleProperOfficerIds:properVisible.map(a=>a.id),
  visibleKillingIds:killingVisible.map(a=>a.id),literalCoexistenceObserved:proper.length&&killing.length?true:partial?null:false,
  visibleCoexistenceObserved:properVisible.length&&killingVisible.length?true:partial?null:false,mixtureConfirmed:null,purityConfirmed:null};
 if(!eq(chart.coexistence,coexistence))errors.push('officer-coexistence-contract');
 counts.literalCoexistence=coexistence.literalCoexistenceObserved===true?1:0;counts.visibleCoexistence=coexistence.visibleCoexistenceObserved===true?1:0;
 // Independently enumerate the intended existing source objectives.
 const specs={
  'food:food-control':['K01','control-balance',['output'],['pressure','outputControl','drain'],'food-policy'],
  'mediation:resource-mediation':['K01','mediation',['resource'],['pressure','resourceSupply','resourceDelivery'],null],
  'objective:required-food-control-obstruction':['K02','required-control-obstruction',['resource','output'],['outputControl','resourceControl'],null],
  'objective:excess-food-moderation':['K02','control-preservation',['resource','output'],['outputControl','resourceControl'],null],
  'killing-wealth-supply:wealth-supplies-needed-killing':['K03','deficiency',['wealth'],['wealthSupply'],'strong'],
  'killing-wealth-supply:wealth-reinforces-dangerous-killing':['K03','burden',['wealth'],['wealthSupply','pressure'],null],
  'killing-wealth-dual:wealth-relieves-output-obstruction':['K03','restoration',['wealth','resource','output'],['wealthSupply','outputControl','resourceControl','wealthResourceControl'],null],
  'killing-wealth-dual:wealth-supplies-insufficient-killing':['K03','deficiency',['wealth','resource','output'],['wealthSupply','outputControl'],'strong'],
  'killing-wealth-dual:wealth-reinforces-dangerous-killing':['K03','burden',['wealth','resource','output'],['wealthSupply','pressure'],null],
  'killing-wealth-mediation:wealth-threatens-needed-resource':['K03','mediation-preservation',['wealth','resource'],['resourceSupply','resourceDelivery','wealthResourceControl'],null],
  'killing-wealth-mediation:wealth-supplies-killing-through-resource':['K03','mediation',['wealth','resource'],['wealthSupply','resourceSupply','resourceDelivery','pressure'],null],
  'killing-wealth-mediation:wealth-supplies-needed-killing':['K03','deficiency',['wealth','resource'],['wealthSupply'],'strong'],
  'resource-killing:killing-supplies-light-resource':['R03','resource-supply',['resource'],['resourceSupply','resourceDelivery'],'strong'],
  'resource-killing:weak-day-heavy-resource-original-reading':['R03','disputed-scope',['resource'],['resourceSupply','resourceDelivery'],'weak'],
  'resource-killing:killing-supply-with-both-day-and-resource-heavy':['R03','competing-interpretation',['resource'],['resourceSupply'],'strong'],
  'resource-officer:officer-independent-role-review':['R03-context','independent-officer',['resource'],['resourceSupply'],'strong']
 };
 for(const m of mechanism.candidates){
  const p=m.rolePriority,q=p?.officerDemandConditions,source=p?.demandReview;
  if(!safe(q)||q.candidateId!==m.candidateId||q.status!==source?.status||q.selectionAuthority!==false||!Array.isArray(q.contexts)||!Array.isArray(source?.objectives)){errors.push('officer-demand-contract:'+m.candidateId);continue;}
  const expected=source.objectives.filter(o=>Object.hasOwn(specs,o.collection+':'+o.objectiveId)),seen=new Set();
  if(q.contexts.length!==expected.length)errors.push('officer-objective-coverage:'+m.candidateId);
  for(const x of q.contexts){
   counts.contexts++;states[x.contextState]=(states[x.contextState]??0)+1;
   const o=expected.find(o=>o.id===x.objectiveRef),a=officers.get(x.officerId);
   if(!safe(x)||!o||!a||seen.has(x.objectiveRef)){errors.push('officer-objective-binding:'+x.objectiveRef);continue;}seen.add(x.objectiveRef);
   const [clause,axis,roles,required,want]=specs[o.collection+':'+o.objectiveId],role=clause==='R03-context'?'officer':'killing',r=o.roles.resource,w=o.roles.wealth,f=o.roles.output;
   const access=['day',role,...roles].map(role=>({role,id:o.roles[role],layer:actors.get(o.roles[role])?.layer}));
   const rel={pressure:edge(a.id,d,'control'),wealthSupply:edge(w,a.id,'generate'),resourceSupply:edge(a.id,r,'generate'),resourceDelivery:edge(r,d,'generate'),
    outputControl:edge(f,a.id,'control'),drain:edge(d,f,'generate'),resourceControl:edge(r,f,'control'),wealthResourceControl:edge(w,r,'control')};
   const missing=required.filter(id=>!rel[id]),direction=chart.day.direction;
   const food=p.killingStrategies?.food?.find(f=>f.id===o.contextId)?.premises?.find(p=>p.id==='day-capacity-for-control');
   const motive=p.killingStrategies?.mediation?.find(m=>m.id===o.contextId)?.weakDayPremises?.find(p=>p.id==='weak-day-mediation-motive');
   const dayPremise=want==='food-policy'?{expected:'food-control-source-premise',state:food?.state,direction,detail:food?.evidence??null}:
    {expected:want,state:want===null?'not-required':partial||direction===null?'unresolved':want===direction?'supported':'opposed',direction};
   const context=partial?'partial':dayPremise.state==='opposed'?'day-hypothesis-opposed':dayPremise.state==='unresolved'?'day-hypothesis-unresolved':
    missing.length?'required-edge-unobserved':access.some(x=>x.layer!=='visible')?'hidden-access-review':'source-context-observed';
   const ids=paths.filter(p=>p.officerId===a.id&&(!r||p.resourceId===r)).map(p=>p.id);
   if(x.objectiveId!==o.objectiveId||x.collection!==o.collection||x.clause!==clause||x.axis!==axis||x.officerId!==o.roles[role]||
    a.tenGod!==(role==='officer'?'정관':'편관')||x.officerTenGod!==a.tenGod||x.dayId!==d||o.roles.day!==d||!eq(x.participantAccess,access)||
    !eq(x.relations,rel)||!eq(x.requiredEdges,required)||!eq(x.missingEdges,missing)||!eq(x.mediationPathIds,ids)||
    !eq(x.dayPremise,dayPremise)||!eq(x.weakDayMediationPremise,o.collection==='mediation'?{state:motive?.state,detail:motive?.evidence??null}:null)||
    x.contextState!==context||x.sourceConditionalStatus!==o.conditionalStatus||!Array.isArray(x.unprovedConditions)||!x.unprovedConditions.length||
    x.unprovedConditions.some(p=>p.state!=='unresolved'))errors.push('officer-objective-binding:'+x.objectiveRef);
  }
 }
 return {...base,counts,states,errors};
}
