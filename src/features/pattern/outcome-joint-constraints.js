import {evaluateArguments} from './outcome-argumentation.js';
const VERSION='p1-3e-joint-constraints-v1';
const index=(xs,key)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(key)).size===xs.length?new Map(xs.map(x=>[key(x),x])):null;
const uniq=xs=>[...new Set(xs)].sort();
const key=(kind,...ids)=>JSON.stringify([kind,...ids]);
const ref=(owner,id,field)=>({owner,id,field});
const lit=(propositionId,sign='for')=>({propositionId,sign});
const states=['supported','opposed','conflicting','unresolved'];
const signs=s=>s==='supported'?['for']:s==='opposed'?['against']:s==='conflicting'?['for','against']:[];
const safe=x=>typeof x==='string'&&x.length>0;
const sameSet=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&a.every(x=>b.includes(x));
// Scenario-only signed assumptions. A candidate has alternative conjunctive
// rules; its dependencies may be other candidates, but blockers must be
// independent observations. An unseeded dependency cycle cannot fire.
// Shared resource IDs do not themselves constitute an incompatibility.
export function evaluateJointScenario({scope,assumptions,candidates}={}){
 const invalid=()=>({status:'invalid-evidence',selectionAuthority:false,effective:null,judgments:[],ruleResults:[]});
 const facts=index(assumptions,a=>a.id),nodes=index(candidates,a=>a.id);
 if(!['complete','partial'].includes(scope)||!facts||!nodes||
  [...facts.values()].some(a=>!safe(a.id)||!states.includes(a.state)||nodes.has(a.id))||
  [...nodes.values()].some(a=>!safe(a.id)||!Array.isArray(a.alternatives)||!a.alternatives.length))return invalid();
 const propositions=[...assumptions.map(a=>({id:a.id,subject:a.id,kind:'explicit-scenario-assumption',level:'observation'})),
  ...candidates.map(a=>({id:a.id,subject:a.id,kind:'joint-conditional-readiness',level:'structural-hypothesis'}))];
 const evidence=assumptions.flatMap(a=>signs(a.state).map(sign=>({id:key('assumption',a.id,sign),...lit(a.id,sign),refs:[ref('joint-scenario-assumption',a.id,'state')],applicability:'complete-only'})));
 const rules=[];
 for(const c of candidates){
  const alternatives=index(c.alternatives,a=>a.id);
  if(!alternatives)return invalid();
  for(const a of alternatives.values()){
   if(!safe(a.id)||!Array.isArray(a.requires)||!a.requires.length||!Array.isArray(a.undercutWhen))return invalid();
   rules.push({id:key('alternative',c.id,a.id),policyId:VERSION,conclusion:lit(c.id),premises:a.requires,undercutWhen:a.undercutWhen,
    refs:[ref('joint-scenario-candidate',c.id,a.id)],applicability:'complete-only'});
  }
  // Explicit opposition is an independent rule, never inferred from the
  // failure of every support alternative.
  if(c.rebutWhen!==undefined){
   if(!Array.isArray(c.rebutWhen))return invalid();
   c.rebutWhen.forEach((p,i)=>rules.push({id:key('rebuttal',c.id,String(i)),policyId:VERSION,conclusion:lit(c.id,'against'),premises:[p],
    refs:[ref('joint-scenario-candidate',c.id,'rebutWhen')],applicability:'complete-only'}));
  }
 }
 return evaluateArguments({scope,propositions,evidence,rules});
}
const unresolved=x=>x==='unresolved';
export function reviewJointConstraints(prior,supply,argument,source,interposition,combination,clash){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:VERSION,completeHour:complete,selectionAuthority:false,effective:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,actions:[],paths:[],sharedRoots:[],pairCompetition:[],reliefCompetition:[],scenario:null});
 if(typeof complete!=='boolean'||[supply,argument,source,interposition,combination,clash].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  supply.effectiveSupply!==null||source.effectConfirmed!==null||[argument,interposition,combination,clash].some(x=>x.effective!==null))return empty('upstream');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),sup=index(supply.occurrences,a=>a.id),args=index(argument.actions,a=>a.edgeId),
  judgments=index(argument.judgments,a=>a.id),sources=index(source.actions,a=>a.edgeId),ipActions=index(interposition.actions,a=>a.edgeId),
  paths=index(interposition.paths,a=>a.pathId),pairs=index(combination.pairs,a=>a.pairId),combActions=index(combination.actions,a=>a.edgeId),
  slots=index(clash.slots,a=>a.slotId),reliefs=index(clash.reliefs,a=>a.id),clashActions=index(clash.actions,a=>a.edgeId);
 if([actors,sup,args,judgments,sources,ipActions,paths,pairs,combActions,slots,reliefs,clashActions].some(x=>!x))return empty('identity');
 if([...reliefs.values()].some(r=>!unresolved(r.actualReliefState)||!Array.isArray(r.positions)||!Array.isArray(r.competingFormationIds)))return empty('relief-contract');
 const actions=[],roots=new Map(),byActor=new Map(),reliefCompetition=[],pairCompetition=[],pathRows=[],assumptions=new Map(),candidates=[];
 const assumption=id=>{if(!assumptions.has(id))assumptions.set(id,{id,state:'unresolved'});return lit(id);};
 const clearance=id=>({requires:lit(id,'against'),attack:assumption(id)});
 const rememberRoot=(id,edgeId,role,basis,pathId=null)=>{
  if(!actors.has(id)||actors.get(id).layer!=='hidden')return false;
  if(!roots.has(id))roots.set(id,[]);
  roots.get(id).push({edgeId,role,basis,pathId});return true;
 };
 for(const p of pairs.values()){
  if(!Array.isArray(p.participantIds)||p.participantIds.length!==2||!Array.isArray(p.competitorPairIds)||
   ![p.actualRestrictionState,p.actualTransformationState,p.actualRetentionState].every(unresolved))return empty('pair-contract');
  for(const id of p.participantIds){if(actors.get(id)?.layer!=='visible')return empty('pair-actor');if(!byActor.has(id))byActor.set(id,[]);byActor.get(id).push(p.pairId);}
  for(const id of p.competitorPairIds){
   const other=pairs.get(id);
   if(!other||id===p.pairId||!other.competitorPairIds?.includes(p.pairId))return empty('pair-competition');
   const shared=p.participantIds.filter(x=>other.participantIds.includes(x));if(shared.length!==1)return empty('pair-overlap');
   if(p.pairId<id)pairCompetition.push({pairIds:[p.pairId,id],sharedActorIds:shared,exclusiveConfirmed:null});
  }
 }
 for(const r of reliefs.values()){
  if(!unresolved(r.actualReliefState)||!Array.isArray(r.positions)||!Array.isArray(r.competingFormationIds))return empty('relief-contract');
  for(const q of reliefs.values()){
   if(r.id>=q.id)continue;
   const sharedPositions=r.positions.filter(x=>q.positions.includes(x));
   const sameFormation=r.formationId===q.formationId,sameClash=r.clashId===q.clashId;
   const competing=r.competingFormationIds.includes(q.formationId)||q.competingFormationIds?.includes(r.formationId);
   if(sameFormation||sameClash||competing)reliefCompetition.push({reliefIds:[r.id,q.id],sameFormation,sameClash,sharedPositions,competingFormationObserved:!!competing,exclusiveConfirmed:null});
  }
 }
 for(const a of args.values()){
  const e=judgments.get(a.effectPropositionId),s=sources.get(a.edgeId),from=actors.get(a.from),to=actors.get(a.to),x=sup.get(a.from),y=sup.get(a.to);
  if(!e||e.subject!==a.edgeId||e.kind!=='actual-action-effective'||e.level!=='effect-hypothesis'||!unresolved(e.state)||e.support?.rank!==null||e.opposition?.rank!==null||
   !s||s.actualEffectPropositionId!==e.id||!unresolved(s.actualEffectState)||from?.layer!=='visible'||to?.layer!=='visible'||!x||!y||!Array.isArray(s.clauses))return empty('effect-binding');
  const ca=combActions.get(a.edgeId),cl=clashActions.get(a.edgeId),ip=ipActions.get(a.edgeId);
  const fromPairs=byActor.get(a.from)??[],toPairs=byActor.get(a.to)??[];
  if(!!ca!==!!(fromPairs.length||toPairs.length)||ca&&(!sameSet(ca.fromPairIds,fromPairs)||!sameSet(ca.toPairIds,toPairs)||ca.originalEffectPropositionId!==e.id||!unresolved(ca.actualEffectState))||
   cl&&(cl.originalEffectPropositionId!==e.id||!unresolved(cl.actualEffectState))||
   (a.kind==='control')!==!!ip||ip&&(ip.actualEffectPropositionId!==e.id||!unresolved(ip.actualEffectState)||!Array.isArray(ip.pathIds)))return empty('constraint-binding');
  const rootIds=[];
  for(const [o,role] of [[x,'source'],[y,'target']]){
   if(!Array.isArray(o.directRoot?.uncontestedRootIds)||!Array.isArray(o.directRoot?.contestedRootIds)||!Array.isArray(o.paths)||!Array.isArray(o.groundedPathIds))return empty('root-contract');
   for(const [ids,basis] of [[o.directRoot.uncontestedRootIds,'direct-uncontested'],[o.directRoot.contestedRootIds,'direct-contested']])for(const id of ids){
    if(!rememberRoot(id,a.edgeId,role,basis))return empty('root-id');rootIds.push(id);
   }
   // Observed incoming supply is contextual, not a required or independent root.
   const allPaths=index(o.paths,p=>p.id);if(!allPaths)return empty('supply-paths');
   for(const pathId of o.groundedPathIds){
    const p=allPaths.get(pathId);if(!p||p.recipientId!==o.id||p.upstream!=='observed'||!Array.isArray(p.donor?.groundedRootIds))return empty('supply-path-binding');
    for(const id of p.donor.groundedRootIds){if(!rememberRoot(id,a.edgeId,role,'incoming-observed',pathId))return empty('incoming-root');rootIds.push(id);}
   }
  }
  if(cl&&(!Array.isArray(cl.substantialRootIds)||!Array.isArray(cl.residualRootIds)))return empty('exposure-contract');
  const exposed=cl?[...cl.substantialRootIds,...cl.residualRootIds]:[];
  if(exposed.some(id=>!slots.has(id)))return empty('exposure-binding');
  actions.push({edgeId:a.edgeId,effectPropositionId:e.id,kind:a.kind,from:a.from,to:a.to,rootIds:uniq(rootIds),exposedRootIds:uniq(exposed),
   sourceClauseIds:s.clauses.map(c=>c.clauseId),combinationPairIds:uniq([...fromPairs,...toPairs]),interpositionPathIds:ip?[...ip.pathIds]:[],
   actualEffectState:'unresolved',effective:null});
 }
 const actionMap=index(actions,a=>a.edgeId);
 if(sources.size!==args.size||[combActions,clashActions,ipActions].some(m=>[...m.keys()].some(id=>!actionMap.has(id))))return empty('action-coverage');
 const pressureCandidates=new Map(),legCandidates=new Set();
 for(const p of paths.values()){
  const target=actionMap.get(p.controlEdgeId);
  if(!target||target.kind!=='control'||!target.interpositionPathIds.includes(p.pathId)||!unresolved(p.actualEffectState)||
   !Array.isArray(p.legEdgeIds)||!Array.isArray(p.dependencyIds)||!['protection','mediation'].includes(p.kind))return empty('path-binding');
  const expected=p.kind==='protection'?[p.helperId+'>'+p.controllerId,p.controlEdgeId]:[p.controllerId+'>'+p.helperId,p.helperId+'>'+p.targetId,p.controlEdgeId];
  if(!sameSet(p.legEdgeIds,expected)||expected.some(id=>!actionMap.has(id)))return empty('leg-binding');
  const requiredLegIds=expected.slice(0,-1); // target control is not a prerequisite effect
  if(p.sourcePolicyId===null){
   pathRows.push({pathId:p.pathId,controlEdgeId:p.controlEdgeId,requiredLegIds,pressureId:p.pressureId,dependencyIds:[...p.dependencyIds],
    combinationPairIds:uniq([p.helperId,p.controllerId,p.targetId].flatMap(id=>byActor.get(id)??[])),
    conditionalRestrictionIds:[],sharedRootIds:uniq(requiredLegIds.flatMap(id=>actionMap.get(id).rootIds)),scenarioPropositionId:null,
    sourcePolicyId:null,actualEffectState:'unresolved'});
   continue;
  }
  if(!safe(p.sourcePolicyId))return empty('path-policy');
  const id=key('path',p.pathId),gate=clearance(key('path-obstruction',p.pathId));
  const requires=[assumption(key('source-context',p.pathId)),assumption(key('path-operation',p.pathId)),gate.requires,
   ...requiredLegIds.map(e=>lit(key('leg-ready',e)))];
  // A pressure with no in-scope alternative is not cleared by absence.
  if(new Set(p.dependencyIds).size!==p.dependencyIds.length)return empty('dependency-identity');
  for(const dep of p.dependencyIds)requires.push(lit(key('pressure',dep)));
  // Explicit, leg-specific restriction predicates are shared between paths.
  // A pair or exposed root is not itself a blocker. Only an independently
  // established restriction of this exact leg may undercut the conditional.
  const contextualAttacks=requiredLegIds.flatMap(edgeId=>{
   const leg=actionMap.get(edgeId),legId=key('leg-ready',edgeId);
   const attacks=uniq([...leg.combinationPairIds.map(pairId=>key('pair-restricts-leg',pairId,edgeId)),
    ...leg.exposedRootIds.map(rootId=>key('root-loss-blocks-leg',rootId,edgeId))]);
   if(!legCandidates.has(legId)){
    legCandidates.add(legId);
    const gates=attacks.map(clearance);
    candidates.push({id:legId,alternatives:[{id:'apply',requires:[assumption(key('leg-operation',edgeId)),...gates.map(g=>g.requires)],undercutWhen:gates.map(g=>g.attack)}]});
   }
   return attacks;
  });
  candidates.push({id,alternatives:[{id:'apply',requires,undercutWhen:[gate.attack]}]});
  if(!pressureCandidates.has(p.pressureId))pressureCandidates.set(p.pressureId,[]);
  pressureCandidates.get(p.pressureId).push(id);
  pathRows.push({pathId:p.pathId,controlEdgeId:p.controlEdgeId,requiredLegIds,pressureId:p.pressureId,dependencyIds:[...p.dependencyIds],
   combinationPairIds:uniq([p.helperId,p.controllerId,p.targetId].flatMap(id=>byActor.get(id)??[])),conditionalRestrictionIds:uniq(contextualAttacks),
   sharedRootIds:uniq(requiredLegIds.flatMap(id=>actionMap.get(id).rootIds)),scenarioPropositionId:id,sourcePolicyId:p.sourcePolicyId,actualEffectState:'unresolved'});
 }
 for(const a of actions)if(a.interpositionPathIds.some(id=>paths.get(id)?.controlEdgeId!==a.edgeId))return empty('path-coverage');
 const pressureIds=uniq([...pressureCandidates.keys(),...pathRows.flatMap(p=>p.dependencyIds)]);
 for(const p of pressureIds){
  const id=key('pressure',p),alts=(pressureCandidates.get(p)??[]).map(path=>({id:path,requires:[lit(path),assumption(key('pressure-relief-operation',p))],undercutWhen:[]}));
  // Unknown hidden/out-of-scope pressure must be resolved independently.
  candidates.push({id,alternatives:alts.length?alts:[{id:'external',requires:[assumption(key('external-pressure-relief',p))],undercutWhen:[]}]});
 }
 const scenario=evaluateJointScenario({scope:complete?'complete':'partial',assumptions:[...assumptions.values()],candidates});
 if(scenario.status!==status||scenario.judgments.some(j=>j.state!=='unresolved'))return empty('scenario-authority');
 const sharedRoots=[...roots].filter(([,uses])=>new Set(uses.map(u=>u.edgeId)).size>1||uses.length>1).map(([rootId,uses])=>({
  rootId,uses,exposed:slots.has(rootId),independentCapacityConfirmed:null}));
 return {...base,status,reason:null,actions,paths:pathRows,sharedRoots,pairCompetition,reliefCompetition,
  scenario:{assumptions:[...assumptions.values()],candidates,judgments:scenario.judgments,ruleResults:scenario.ruleResults},
  limitations:['shared-reference-not-exclusive-resource','candidate-overlap-not-defeat','joint-readiness-not-effective-relief','no-hidden-clearance-by-absence','no-effect-promotion']};
}
