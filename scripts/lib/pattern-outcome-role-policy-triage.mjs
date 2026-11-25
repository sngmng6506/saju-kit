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


export function summarizeResourceDemandReview(c,mechanism,partial){
 const base={id:c.id,partial,effectConfirmed:null},errors=[],context=mechanism?.resourceBalanceContext;
 const counts={resources:0,visibleResources:0,hiddenResources:0,screenedDeliveries:0,sharedAlternatives:0,conditions:0,alignedDay:0,opposedDay:0,unresolvedDay:0};
 if(!context||context.status!==(partial?'partial':'diagnostic')||context.completeHour!==!partial||context.version!=='resource-balance-context-v1'||
  context.selectionAuthority!==false||context.actualDemand!==null||context.excessConfirmed!==null||context.deficiencyConfirmed!==null||context.effectConfirmed!==null||
  !Array.isArray(context.resources)||!Array.isArray(context.alternatives)||context.day?.id!=='visible:day'||context.day.actualBurdenConfirmed!==null||
  partial&&context.day.direction!==null||!Array.isArray(mechanism.candidates))return {...base,errors:['resource-context-contract']};
 const source=mechanism.groundedSupply,capacity=mechanism.roleCapacity;
 const expected=(capacity?.occurrences??[]).filter(a=>!a.dayReference&&['정인','편인'].includes(a.tenGod));
 const resources=new Map(context.resources.map(a=>[a.id,a])),actorRows=new Map((source?.occurrences??[]).map(a=>[a.id,a]));
 if(resources.size!==context.resources.length||resources.size!==expected.length||expected.some(a=>!resources.has(a.id)))errors.push('resource-occurrence-coverage');
 for(const a of resources.values()){
  counts.resources++;
  if(a.layer==='visible')counts.visibleResources++;else counts.hiddenResources++;
  const screened=a.deliveryObservation==='structural-delivery-screen-met';
  if(screened)counts.screenedDeliveries++;
  const r=actorRows.get(a.id),expectedActor=expected.find(x=>x.id===a.id);
  const delivery=(source?.actions??[]).find(e=>e.from===a.id&&e.to==='visible:day'&&e.kind==='generate');
  if(!r||!expectedActor||a.layer!==expectedActor.layer||a.tenGod!==expectedActor.tenGod||a.rootState!==r.directRoot.state||
   a.effectiveSupply!==null||a.preservationConfirmed!==null||
   (a.delivery?.edgeId??null)!==(delivery?.edgeId??null)||a.delivery&&a.delivery.effective!==null||
   screened!==(!partial&&a.layer==='visible'&&delivery?.generationScreen==='grounded-generation-context-screen-met')||
   partial&&a.deliveryObservation!=='partial'||!partial&&a.layer==='hidden'&&a.deliveryObservation!=='hidden-access-review')errors.push('resource-delivery-contract:'+a.id);
 }
 const keys=new Set();
 for(const p of context.alternatives){
  const k=JSON.stringify([p.from,p.to]),a=resources.get(p.from),b=resources.get(p.to);
  if(keys.has(k)||p.from===p.to||!a||!b||p.alternativeSupplyConfirmed!==null){errors.push('resource-alternative-contract:'+k);continue;}
  keys.add(k);
  const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
  const roots=a.supportRootIds.filter(id=>b.supportRootIds.includes(id)),donors=a.upstreamNodeIds.filter(id=>b.upstreamNodeIds.includes(id));
  const shared=a.graphNodeId===b.graphNodeId||roots.length>0||donors.length>0;
  if(shared)counts.sharedAlternatives++;
  if(!same(roots,p.sharedRootIds)||!same(donors,p.sharedDonorNodeIds)||p.sharedGraphNode!==(a.graphNodeId===b.graphNodeId)||
   p.observation!==(shared?'shared-evidence-observed':'independence-not-established'))errors.push('resource-alternative-provenance:'+k);
 }
 if(keys.size!==resources.size*(resources.size-1))errors.push('resource-alternative-coverage');
 for(const m of mechanism.candidates){
  const d=m.rolePriority?.demandReview,r=m.rolePriority?.resourceDemand;
  if(!d||!r||r.candidateId!==m.candidateId||r.status!==d.status||r.selectionAuthority!==false||
   r.actualDemand!==null||r.excessConfirmed!==null||r.deficiencyConfirmed!==null||r.effectConfirmed!==null||!Array.isArray(r.conditions)){
   errors.push('resource-demand-contract:'+m.candidateId);continue;}
  // Coverage for all R01/R02/R03 source objectives. K02 shares the
  // 'objective' collection but has food-specific rather than R02 labels.
  const expected=d.objectives.filter(o=>['resource-output','resource-killing','resource-officer'].includes(o.collection)||
   o.collection==='objective'&&['required-resource-injury','excess-resource-moderation'].includes(o.objectiveId));
  const byId=new Map(expected.map(o=>[o.id,o])),seen=new Set();
  if(r.conditions.length!==expected.length)errors.push('resource-condition-coverage:'+m.candidateId);
  for(const x of r.conditions){
   counts.conditions++;
   const o=byId.get(x.objectiveRef),a=resources.get(x.resourceId);
   if(!o||!a||seen.has(x.objectiveRef)||o.roles.resource!==x.resourceId||o.conditionalStatus!==x.conditionalStatus||
    x.sourceBasis!==a.sourceBasis||x.deliveryObservation!==a.deliveryObservation||x.deliveryEdgeId!==(a.delivery?.edgeId??null)||
    x.actualDemand!==null||x.excessConfirmed!==null||x.deficiencyConfirmed!==null||x.preservationConfirmed!==null||x.effectConfirmed!==null||
    x.dayPremise?.observed!==context.day.direction||
    x.dayPremise?.state!==(partial||context.day.direction===null?'unresolved':context.day.direction===x.dayPremise.expected?'aligned-direction':'opposed-direction'))errors.push('resource-condition-binding:'+x.objectiveRef);
   seen.add(x.objectiveRef);
   if(x.dayPremise?.state==='aligned-direction')counts.alignedDay++;else if(x.dayPremise?.state==='opposed-direction')counts.opposedDay++;else counts.unresolvedDay++;
   const alternatives=context.alternatives.filter(p=>p.from===x.resourceId),expectedIds=alternatives.map(p=>p.to).sort();
   if(!Array.isArray(x.alternativeSources)||JSON.stringify(x.alternativeSources.map(p=>p.to).sort())!==JSON.stringify(expectedIds)||
    x.alternativeSources.some(p=>{const a=alternatives.find(a=>a.to===p.to),b=resources.get(p.to);return !a||!b||
     p.alternativeSupplyConfirmed!==null||p.deliveryObservation!==b.deliveryObservation||p.sourceBasis!==b.sourceBasis||
     Object.keys(a).some(k=>JSON.stringify(a[k])!==JSON.stringify(p[k]));}))errors.push('resource-condition-alternative-binding:'+x.objectiveRef);
  }
 }
 return {...base,counts,errors};
}
