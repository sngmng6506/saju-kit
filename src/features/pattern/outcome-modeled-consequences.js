import {tracePressureDependencies} from './outcome-pressure-dependency.js';
import {evaluateArguments} from './outcome-argumentation.js';
import {evaluateElementContextModel,ELEMENT_CONTEXT_VERSION} from './outcome-element-context.js';
import {sourceEffectClauses} from './outcome-source-effect-policy.js';
import {elementRelation} from '../../core/elements.js';

export const MODELED_CONSEQUENCE_VERSION='p1-4d-modeled-consequence-v4';
const SOURCE='https://www.shidianguji.com/book/SK1610/chapter/1kf5v8oqbug4m';
// No generic effect authority. Only these two narrow consequences can
// be derived under the experimental strength model and exact-edge screens.
// Neither represents benefit, final role selection or a causal fact.
const policies=Object.freeze({
 'generation-strong-source-release':Object.freeze({kind:'generate',role:'source',predicate:'strong',conclusion:'modeled-source-release'}),
 'control-weak-target':Object.freeze({kind:'control',role:'target',predicate:'weak',conclusion:'modeled-target-injury'})
});
const ELEMENTS=['wood','fire','earth','metal','water'];
const ORDER=['year','month','day','hour'];
const states=['supported','opposed','conflicting','unresolved'];
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const eq=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const key=(...x)=>JSON.stringify(x);
const ref=(owner,id,field)=>({owner,id,field});
const lit=(propositionId,sign='for')=>({propositionId,sign});
const byClause=new Map(sourceEffectClauses().map(c=>[c.id,c]));
const clearPressure=xs=>Array.isArray(xs)&&xs.every(x=>x.donorState==='no-substantial-root-observed');
const cleanPressure=x=>x&&x.neutralizationConfirmed===null&&x.effective===null;
// Reuse the original generation screen's observation identities. A
// negative full screen may be decomposed only if its exact source-side
// premises are supported, and its only failed premise is target pressure.
// Missing proof or a contradictory screen is not permission to bypass it.
function sourceSideScreen(argument,judgments,edge,structural,complete){
 const kinds=['source-basis-screen-met','context-blockers-empty','source-pressure-screen-clear','target-pressure-screen-clear'];
 const ids=kinds.map(k=>key(edge.edgeId,k)),rows=ids.map(id=>judgments.get(id));
 if(rows.some((j,i)=>!j||j.subject!==edge.edgeId||j.kind!==kinds[i]||j.level!=='observation'))return null;
 const expected=complete?[
  ['direct-root-observed','grounded-indirect-path-observed'].includes(edge.sourceBasis),
  edge.contextBlockers.length===0,clearPressure(edge.sourcePressure),clearPressure(edge.targetPressure)
 ]:ids.map(()=>null);
 if(rows.some((j,i)=>j.state!==(expected[i]===null?'unresolved':expected[i]?'supported':'opposed')))return null;
 const rules=argument.rules.filter(r=>r.conclusion.propositionId===structural.id);
 const matches=(r,sign,ps)=>r.policyId==='p1-1-existing-structural-screen-v1'&&r.applicability==='complete-only'&&
  r.conclusion.sign===sign&&!(r.undercutWhen??[]).length&&eq(r.premises.map(p=>key(p.propositionId,p.sign)),ps.map(id=>key(id,sign)));
 if(rules.length!==5||!rules.some(r=>matches(r,'for',ids))||ids.some(id=>!rules.some(r=>matches(r,'against',[id]))))return null;
 if(structural.state!==(!complete?'unresolved':expected.every(Boolean)?'supported':'opposed'))return null;
 return {sourcePremiseIds:ids.slice(0,3),targetPremiseId:ids[3],targetPressureScreenState:rows[3].state,
  sourceScreenState:!complete?'unresolved':expected.slice(0,3).every(Boolean)?'supported':'opposed'};
}
// Structural availability is an explanation of the existing route model,
// not evidence for actual relief or evidence against an injury.
function inspectInterposition(pr,paths,nodes,pressures,targetActor,complete){
 if(!Array.isArray(pr.candidatePathIds)||!Array.isArray(pr.screenedPathIds)||
  new Set(pr.candidatePathIds).size!==pr.candidatePathIds.length||
  new Set(pr.screenedPathIds).size!==pr.screenedPathIds.length||
  pr.screenedPathIds.some(id=>!pr.candidatePathIds.includes(id)))return null;
 // Require the raw topology inventory as well as the derived pressure
 // inventory, so coordinated omission cannot masquerade as clearance.
 if(!Array.isArray(targetActor.protectionAndMediation)||
  targetActor.protectionAndMediation.some(p=>!p||!['protection','mediation'].includes(p.kind)||
   p.target!==targetActor.graphNodeId||!nodes.has(p.helper)||!nodes.has(p.threat)||p.effective!==null))return null;
 const raw=targetActor.protectionAndMediation.filter(p=>p.threat===pr.controllerNodeId).map(p=>key(p.kind,p.helper,p.threat,p.target));
 const expected=[...paths.values()].filter(p=>p.targetPressureId===pr.id).map(p=>p.id);
 if(!eq(pr.candidatePathIds,expected)||!eq(pr.candidatePathIds,raw))return null;
 const rows=[];
 for(const id of pr.candidatePathIds){
  const p=paths.get(id);let identity;
  try{identity=JSON.parse(id)}catch{return null;}
  if(!Array.isArray(identity)||identity.length!==4)return null;
  const [kind,helper,threat,target]=identity;
  const h=nodes.get(helper),s=nodes.get(threat),t=nodes.get(target);
  if(!p||!h||!s||!t||!['protection','mediation'].includes(kind)||
   threat!==pr.controllerNodeId||target!==pr.targetNodeId||
   new Set([helper,threat,target]).size!==3||p.effectConfirmed!==null||p.neutralizationConfirmed!==null||
   !Array.isArray(p.otherBlockers)||!Array.isArray(p.dependencies)||
   new Set(p.dependencies).size!==p.dependencies.length||p.dependencies.some(d=>!pressures.has(d))||
   !(p.structuralDependencyRank===null||Number.isInteger(p.structuralDependencyRank)&&p.structuralDependencyRank>=0))return null;
  const legs=kind==='protection'?[[h,s,'control']]:[[s,h,'generate'],[h,t,'generate']];
  if(legs.some(([a,b,k])=>{const r=elementRelation(a.element,b.element);return r.type!==k||r.direction!=='left-to-right'}))return null;
  const screened=pr.screenedPathIds.includes(id);
  if(screened!==(!p.otherBlockers.length&&!p.dependencies.length)||
   screened&&p.structuralDependencyRank!==0||p.otherBlockers.length&&p.structuralDependencyRank!==null)return null;
  rows.push({pathId:id,kind,helperNodeId:helper,dependencyIds:[...p.dependencies],otherBlockers:[...p.otherBlockers],
   structuralDependencyRank:p.structuralDependencyRank,
   structuralState:!complete?'partial':p.otherBlockers.length?'screen-blocked':p.structuralDependencyRank===null?'dependency-unresolved':'screen-reachable',
   actualReliefState:'unresolved'});
 }
 return rows;
}
// Recompute the experimental model from its signed observation evidence
// and the fixed model policy. Do not consume a caller's bare state label.
function replayModel(profile,complete){
 const model=profile?.model;
 if(!model||!Array.isArray(model.evidence)||!profile.axes)return null;
 const refs=Object.fromEntries(model.evidence.map(e=>[e.propositionId,e.refs]));
 // Partial scope has no evidence facts; references are placeholders only
 // for disabled observations and cannot supply any sign.
 for(const k of Object.keys(profile.axes))if(!refs[k])refs[k]=[ref('elementContextReview',profile.element,'axes')];
 const replay=evaluateElementContextModel({completeHour:complete,element:profile.element,axes:profile.axes,evidenceRefs:refs});
 if(replay.status!==model.status||replay.strongState!==model.strongState||replay.weakState!==model.weakState||
  !same(replay.judgments,model.judgments)||!same(replay.ruleResults,model.ruleResults)||!same(replay.evidence,model.evidence)||
  !same(replay.rules,model.rules)||!same(replay.propositions,model.propositions))return null;
 return replay;
}
export function reviewModeledConsequences(prior,supply,argument,pressure,joint,element){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:MODELED_CONSEQUENCE_VERSION,completeHour:complete,selectionAuthority:false,effective:null,source:SOURCE,
  authority:'experimental-modeled-consequence-only'};
 const empty=reason=>({...base,status:'invalid-evidence',reason,actions:[],interpositionRoutes:[],propositions:[],evidence:[],rules:[],judgments:[],ruleResults:[]});
 if(typeof complete!=='boolean'||[supply,argument,pressure,joint,element].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  supply.effectiveSupply!==null||[argument,pressure,joint,element].some(x=>x.effective!==null)||element.version!==ELEMENT_CONTEXT_VERSION)return empty('upstream');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),edges=index(supply.actions,e=>e.edgeId),nodes=index(supply.nodes,n=>n.nodeId),
  args=index(argument.actions,a=>a.edgeId),js=index(argument.judgments,j=>j.id),pressures=index(pressure.pressures,p=>p.id),
  paths=index(pressure.paths,p=>p.id),jr=index(joint.actions,a=>a.edgeId),jp=index(joint.paths,p=>p.pathId),profiles=index(element.elements,p=>p.element),er=index(element.actions,a=>a.edgeId);
 if([actors,edges,nodes,args,js,pressures,paths,jr,jp,profiles,er].some(x=>!x)||!eq([...profiles.keys()],ELEMENTS)||
  args.size!==jr.size||args.size!==er.size||!Array.isArray(argument.propositions)||!Array.isArray(argument.evidence)||!Array.isArray(argument.rules))return empty('identity');
 const closure=tracePressureDependencies([...pressures.keys()],[...paths.values()]);
 if(!closure)return empty('interposition-dependencies');
 const pressureRanks=new Map(closure.pressureRanks.map(p=>[p.id,p.rank])),pathRanks=new Map(closure.pathRanks.map(p=>[p.id,p.rank]));
 if([...pressures.values()].some(p=>p.structuralDependencyRank!==(pressureRanks.get(p.id)??null))||
  [...paths.values()].some(p=>p.structuralDependencyRank!==(pathRanks.get(p.id)??null)))return empty('interposition-rank-parity');
 const orig=evaluateArguments({scope:complete?'complete':'partial',propositions:argument.propositions,evidence:argument.evidence,rules:argument.rules});
 if(orig.status!==status||!same(orig.judgments,argument.judgments)||!same(orig.ruleResults,argument.ruleResults))return empty('argument-proof');
 const props=[...argument.propositions],evidence=[...argument.evidence],rules=[...argument.rules],rows=[];
 const modelId=(element,id)=>key('element-model',element,id);
 for(const p of profiles.values()){
  if(p.actualStrengthState!=='unresolved'||p.excessState!=='unresolved'||p.deficiencyState!=='unresolved'||p.resistanceState!=='unresolved'||p.effective!==null)return empty('model-authority');
  const replay=replayModel(p,complete);
  if(!replay)return empty('model-proof');
  const rename=x=>({...x,propositionId:modelId(p.element,x.propositionId)});
  props.push(...replay.propositions.map(x=>({...x,id:modelId(p.element,x.id)})));
  evidence.push(...replay.evidence.map(x=>({...rename(x),id:modelId(p.element,x.id)})));
  rules.push(...replay.rules.map(x=>({...x,id:modelId(p.element,x.id),conclusion:rename(x.conclusion),premises:x.premises.map(rename)})));
 }
 const visible=[...actors.values()].filter(a=>a.layer==='visible');
 const expected=visible.flatMap(a=>visible.filter(b=>a.id!==b.id&&elementRelation(a.element,b.element).direction==='left-to-right').map(b=>a.id+'>'+b.id));
 if(!eq([...args.keys()],expected))return empty('visible-action-coverage');
 const addCondition=(subject,name,value,refs)=>{
  const id=key('modeled-condition',subject,name);
  props.push({id,subject,kind:name,level:'observation'});
  if(value!==null)evidence.push({id:key(id,value),...lit(id,value?'for':'against'),refs,applicability:'complete-only'});
  return {id,name,value};
 };
 for(const a of args.values()){
  const e=edges.get(a.edgeId),s=js.get(a.structuralPropositionId),effect=js.get(a.effectPropositionId),q=jr.get(a.edgeId),m=er.get(a.edgeId),
   from=actors.get(a.from),to=actors.get(a.to),node=nodes.get(from?.graphNodeId);
  const relation=elementRelation(from?.element,to?.element);
  if(!e||e.from!==a.from||e.to!==a.to||e.kind!==a.kind||e.effective!==null||e.selectionAuthority!==false||!['generate','control'].includes(e.kind)||
   relation.type!==e.kind||relation.direction!=='left-to-right'||!s||s.subject!==a.edgeId||s.level!=='structural-hypothesis'||
   s.kind!==(e.kind==='generate'?'existing-generation-screen-met':'stable-source-profile-dominance')||!states.includes(s.state)||
   !effect||effect.subject!==a.edgeId||effect.kind!=='actual-action-effective'||effect.level!=='effect-hypothesis'||effect.state!=='unresolved'||
   effect.support?.rank!==null||effect.opposition?.rank!==null||!q||q.from!==a.from||q.to!==a.to||q.kind!==a.kind||q.effectPropositionId!==effect.id||
   q.actualEffectState!=='unresolved'||!Array.isArray(q.combinationPairIds)||!Array.isArray(q.exposedRootIds)||
   !m||m.originalEffectPropositionId!==effect.id||m.actualEffectState!=='unresolved'||!Array.isArray(m.clauses)||
   !node||node.kind!=='visible-stem'||!eq(node.occurrenceIds,[from.id])||!Array.isArray(node.groundedRootIds)||
   !Array.isArray(e.contextBlockers)||!Array.isArray(e.sourcePressure)||!Array.isArray(e.targetPressure))return empty('action-binding');
  const defs=sourceEffectClauses().filter(c=>c.kind===a.kind&&c.fromElement===from.element&&c.toElement===to.element);
  if(!eq(m.clauses.map(c=>c.clauseId),defs.map(c=>c.id)))return empty('clause-inventory');
  const clauses=[];
  for(const c of m.clauses){
   const def=byClause.get(c.clauseId),policy=policies[def.family],actor=def.role==='source'?from:to,p=profiles.get(actor.element);
   if(c.predicateElement!==actor.element||c.predicate!==def.predicate||c.actualPredicateState!=='unresolved'||c.actualEffectState!=='unresolved'||
    c.authority!=='experimental-model-assumption-only')return empty('clause-binding');
   const modeled=['strong','weak'].includes(def.predicate)?p.model[def.predicate+'State']:'unresolved';
   if(c.modelPredicateState!==modeled||c.modeledApplicability!==(complete&&modeled==='supported'?'supported':'unresolved')||
    c.modeledConsequence!==def.consequence)return empty('predicate-parity');
   if(!policy){clauses.push({clauseId:def.id,kind:def.consequence,state:'unresolved',reason:'no-modeled-outcome-authority',propositionId:null});continue;}
   const subject=key(a.edgeId,def.id),id=key('modeled-outcome',subject);
   props.push({id,subject,kind:policy.conclusion,level:'structural-hypothesis'});
   const C=(name,value,refs)=>addCondition(subject,name,complete?value:null,refs);
   const conditions=[
    C('adjacent-visible-action',Math.abs(ORDER.indexOf(from.position)-ORDER.indexOf(to.position))===1,[ref('stemForce',from.id,'position'),ref('stemForce',to.id,'position')]),
    C('direct-grounded-source-basis',node.state==='grounded-observation'&&node.groundedRootIds.length>0&&e.sourceBasis==='direct-root-observed',
     [ref('groundedSupply',node.nodeId,'groundedRootIds'),ref('groundedSupply',a.edgeId,'sourceBasis')]),
    C('no-observed-combination-or-clash-reference',q.combinationPairIds.length===0&&q.exposedRootIds.length===0,[ref('jointConstraintReview',a.edgeId,'combinationPairIds'),ref('jointConstraintReview',a.edgeId,'exposedRootIds')]),
    C('no-other-observed-context-blocker',e.contextBlockers.length===0,[ref('groundedSupply',a.edgeId,'contextBlockers')]),
    C('source-pressure-screen-clear',clearPressure(e.sourcePressure),[ref('groundedSupply',a.edgeId,'sourcePressure')]),
    C('premises-nonconflicting',s.state!=='conflicting'&&modeled!=='conflicting',[ref('argumentReview',s.id,'state'),ref('elementContextReview',p.element,'model')])
   ];
   let interposition=null,directId=null,releaseId=null,sourceScreen=null;
   if(a.kind==='generate'){
    conditions.push(C('target-pressure-screen-clear',clearPressure(e.targetPressure),[ref('groundedSupply',a.edgeId,'targetPressure')]));
    sourceScreen=sourceSideScreen(argument,js,e,s,complete);
    if(!sourceScreen)return empty('generation-source-screen-proof');
    releaseId=key('modeled-direct-release',subject);
    props.push({id:releaseId,subject,kind:'modeled-direct-release-tendency',level:'structural-hypothesis'});
   }else{
    const pressureId=key(from.graphNodeId,to.graphNodeId),pr=pressures.get(pressureId);
    if(!cleanPressure(pr)||pr.controllerNodeId!==from.graphNodeId||pr.targetNodeId!==to.graphNodeId||!Array.isArray(pr.candidatePathIds)||
     pr.local!==(Math.abs(ORDER.indexOf(from.position)-ORDER.indexOf(to.position))===1))return empty('pressure-binding');
    interposition=inspectInterposition(pr,paths,nodes,pressures,to,complete);
    if(!interposition)return empty('interposition-inventory');
    directId=key('modeled-direct-injury',subject);
    props.push({id:directId,subject,kind:'modeled-direct-injury-tendency',level:'structural-hypothesis'});
    conditions.push(C('no-observed-interposition-candidate',pr.candidatePathIds.length===0,[ref('pressureDependencyReview',pressureId,'candidatePathIds')]));
   }
   // Structural and strength premises remain linked to their original
   // proof DAG, not copied as independently asserted observations.
   const mid=modelId(actor.element,policy.predicate);
   const premises=[lit(mid),lit(s.id),...conditions.filter(c=>!directId||c.name!=='no-observed-interposition-candidate').map(c=>lit(c.id))];
   const rule=(name,conclusion,premises)=>rules.push({id:key(name,subject),policyId:MODELED_CONSEQUENCE_VERSION,conclusion:lit(conclusion),premises,
    refs:[ref('source-clause',def.id,'quote'),ref('experimental-modeled-consequence-policy',MODELED_CONSEQUENCE_VERSION,name)],
    applicability:'complete-only'});
   if(directId){
    rule('direct-injury-tendency',directId,premises);
    // Preserve the legacy residual model gate. A blocked or unreachable
    // structural route is not proof that actual relief cannot occur.
    rule('modeled-rule',id,[lit(directId),lit(conditions.find(c=>c.name==='no-observed-interposition-candidate').id)]);
   }else{
    // Only the original source-side proof may support direct tendency.
    // The full structural screen remains required for the legacy result.
    const directPremises=[lit(mid),...conditions.filter(c=>c.name!=='target-pressure-screen-clear').map(c=>lit(c.id))];
    rule('direct-release-source-screen',releaseId,[...directPremises,...sourceScreen.sourcePremiseIds.map(id=>lit(id))]);
    // Preserve the exact old conjunction for the legacy release result.
    rule('modeled-rule',id,[lit(releaseId),lit(s.id),lit(conditions.find(c=>c.name==='target-pressure-screen-clear').id)]);
   }
   clauses.push({clauseId:def.id,kind:policy.conclusion,propositionId:id,modelPropositionId:mid,structuralPropositionId:s.id,conditions,
    ...(directId?{directInjuryPropositionId:directId,interpositionCandidates:interposition}:{directReleasePropositionId:releaseId,sourceScreen,targetPressureScreenState:complete?(clearPressure(e.targetPressure)?'supported':'opposed'):'unresolved',actualReceptionState:'unresolved'}),
    actualEffectState:'unresolved',state:null,reason:null});
  }
  rows.push({edgeId:a.edgeId,from:a.from,to:a.to,kind:a.kind,originalEffectPropositionId:effect.id,clauses,actualEffectState:'unresolved',effective:null});
 }
 // Interposition routes reuse the exact action subproofs, not the
 // strong/weak consequence predicates. Injury is not required for a
 // counterpressure relation and discharge is not proof of reception.
 const actionRows=index(rows,a=>a.edgeId),routeRows=[],seenPaths=new Set();
 for(const owner of rows.filter(a=>a.kind==='control')){
  const control=owner.clauses.find(c=>c.directInjuryPropositionId),jointAction=jr.get(owner.edgeId);
  if(!control||!Array.isArray(jointAction.interpositionPathIds))return empty('route-owner');
  const visibleCandidates=control.interpositionCandidates.filter(p=>nodes.get(p.helperNodeId)?.kind==='visible-stem');
  if(!eq(visibleCandidates.map(p=>p.pathId),jointAction.interpositionPathIds))return empty('route-coverage');
  for(const p of visibleCandidates){
   const j=jp.get(p.pathId),helper=nodes.get(p.helperNodeId)?.occurrenceIds[0];
   const expectedLegs=p.kind==='protection'?[helper+'>'+owner.from]:[owner.from+'>'+helper,helper+'>'+owner.to];
   const pressureId=key(actors.get(owner.from).graphNodeId,actors.get(owner.to).graphNodeId);
   if(!j||seenPaths.has(p.pathId)||j.controlEdgeId!==owner.edgeId||j.pressureId!==pressureId||
    !eq(j.requiredLegIds,expectedLegs)||!eq(j.dependencyIds,p.dependencyIds)||j.actualEffectState!=='unresolved'||
    (p.kind==='mediation'?j.sourcePolicyId!=='tongguan':![null,'officer-rescue','food-rescue'].includes(j.sourcePolicyId)))return empty('route-binding');
   seenPaths.add(p.pathId);
   const subject=key('interposition-operation',p.pathId),id=key('modeled-route',p.pathId);
   const kind=p.kind==='protection'?'modeled-counterpressure-channel':'modeled-mediation-channel';
   props.push({id,subject,kind,level:'structural-hypothesis'});
   // Rank above zero requires unresolved relief of a helper's pressure.
   // A reachable topology alone must not seed its own operation.
   const gate=addCondition(subject,'independent-route-screen',complete?p.structuralDependencyRank===0&&p.otherBlockers.length===0&&p.dependencyIds.length===0:null,
    [ref('pressureDependencyReview',p.pathId,'structuralDependencyRank'),ref('pressureDependencyReview',p.pathId,'otherBlockers'),ref('pressureDependencyReview',p.pathId,'dependencies')]);
   const legProofs=[];
   for(const [i,edgeId] of expectedLegs.entries()){
    const leg=actionRows.get(edgeId),a=args.get(edgeId),expectedKind=p.kind==='protection'?'control':'generate';
    const c=leg?.clauses.find(c=>c.propositionId!==null);
    if(!leg||!a||!c||leg.kind!==expectedKind)return empty('route-leg-binding');
    const names=['adjacent-visible-action','direct-grounded-source-basis','no-observed-combination-or-clash-reference','no-other-observed-context-blocker','source-pressure-screen-clear'];
    const selected=names.map(n=>c.conditions.find(q=>q.name===n));
    if(selected.some(x=>!x))return empty('route-leg-condition');
    // Mediation entry must pass both sides of its generation screen.
    // The exit leg must prove its source-side screen only: the original
    // target pressure is the object of review, not already cleared.
    const subproofs=p.kind==='mediation'&&i===1?c.sourceScreen?.sourcePremiseIds:[a.structuralPropositionId];
    if(!Array.isArray(subproofs)||!subproofs.length)return empty('route-leg-proof');
    const nonconflict=addCondition(subject,'nonconflicting-leg-'+i,complete?subproofs.every(id=>js.has(id)&&js.get(id).state!=='conflicting'):null,
     subproofs.map(id=>ref('argumentReview',id,'state')));
    const premiseIds=[...selected.map(x=>x.id),...subproofs,nonconflict.id];
    legProofs.push({edgeId,mode:p.kind==='protection'?'control-profile':i===0?'entry-full-generation':'exit-source-generation',premiseIds});
   }
   const premises=[lit(gate.id),...legProofs.flatMap(x=>x.premiseIds.map(id=>lit(id)))];
   rules.push({id:key('route-operation-rule',p.pathId),policyId:MODELED_CONSEQUENCE_VERSION,conclusion:lit(id),premises,
    refs:[ref('jointConstraintReview',p.pathId,'requiredLegIds'),ref('experimental-modeled-route-policy',MODELED_CONSEQUENCE_VERSION,kind)],applicability:'complete-only'});
   routeRows.push({pathId:p.pathId,controlEdgeId:owner.edgeId,pressureId,kind,sourcePolicyId:j.sourcePolicyId,
    propositionId:id,gatePropositionId:gate.id,legProofs,structuralState:p.structuralState,dependencyIds:p.dependencyIds,
    sourceApplicability:'unresolved',actualReliefState:'unresolved',actualReceptionState:'unresolved',effective:null});
  }
 }
 if(seenPaths.size!==jp.size)return empty('route-inventory');
 const r=evaluateArguments({scope:complete?'complete':'partial',propositions:props,evidence,rules});
 if(r.status!==status||r.judgments.some(j=>j.level==='effect-hypothesis'&&j.state!=='unresolved'))return empty('evaluation');
 const result=index(r.judgments,j=>j.id);
 for(const row of rows)for(const c of row.clauses)if(c.propositionId){
  const j=result.get(c.propositionId);
  if(!j)return empty('outcome-identity');
  c.state=j.state;
  c.reason=j.state==='supported'?'modeled-consequence-derived':!complete?'partial':'premises-not-established';
  c.proof={support:j.support,opposition:j.opposition};
  if(c.directInjuryPropositionId){
   const direct=result.get(c.directInjuryPropositionId);
   if(!direct)return empty('direct-injury-identity');
   c.directInjuryState=direct.state;
   c.directInjuryProof={support:direct.support,opposition:direct.opposition};
   c.residualInjuryState=j.state;
  }
  if(c.directReleasePropositionId){
   const direct=result.get(c.directReleasePropositionId);
   if(!direct)return empty('direct-release-identity');
   c.directReleaseState=direct.state;
   c.directReleaseProof={support:direct.support,opposition:direct.opposition};
   c.jointReleaseScreenState=j.state;
  }
 }
 for(const route of routeRows){
  const j=result.get(route.propositionId);
  if(!j)return empty('route-judgment');
  route.state=j.state;route.proof={support:j.support,opposition:j.opposition};
  route.missingPremiseIds=r.ruleResults.find(q=>q.id===key('route-operation-rule',route.pathId))?.missing.map(x=>x.propositionId)??[];
 }
 return {...base,status,reason:null,actions:rows,interpositionRoutes:routeRows,propositions:props,evidence,rules,judgments:r.judgments,ruleResults:r.ruleResults,
  limitations:['direct-release-not-target-reception','target-pressure-screen-not-reception-capacity','modeled-release-not-beneficial-generation','direct-tendency-not-residual-injury','modeled-route-not-operation-or-neutralization','dependent-route-not-independent-operation','candidate-screen-not-relief-or-clearance','modeled-injury-not-net-control-or-benefit','screen-not-confirmed-clearance','no-rule-from-excess-or-resistance','no-actual-effect-authority','no-selection-authority']};
}
