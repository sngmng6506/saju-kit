import {evaluateArguments} from './outcome-argumentation.js';
import {evaluateElementContextModel,ELEMENT_CONTEXT_VERSION} from './outcome-element-context.js';
import {sourceEffectClauses} from './outcome-source-effect-policy.js';
import {elementRelation} from '../../core/elements.js';

export const MODELED_CONSEQUENCE_VERSION='p1-4c-modeled-consequence-v1';
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
 const empty=reason=>({...base,status:'invalid-evidence',reason,actions:[],propositions:[],evidence:[],rules:[],judgments:[],ruleResults:[]});
 if(typeof complete!=='boolean'||[supply,argument,pressure,joint,element].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  supply.effectiveSupply!==null||[argument,pressure,joint,element].some(x=>x.effective!==null)||element.version!==ELEMENT_CONTEXT_VERSION)return empty('upstream');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),edges=index(supply.actions,e=>e.edgeId),nodes=index(supply.nodes,n=>n.nodeId),
  args=index(argument.actions,a=>a.edgeId),js=index(argument.judgments,j=>j.id),pressures=index(pressure.pressures,p=>p.id),
  jr=index(joint.actions,a=>a.edgeId),profiles=index(element.elements,p=>p.element),er=index(element.actions,a=>a.edgeId);
 if([actors,edges,nodes,args,js,pressures,jr,profiles,er].some(x=>!x)||!eq([...profiles.keys()],ELEMENTS)||
  args.size!==jr.size||args.size!==er.size||!Array.isArray(argument.propositions)||!Array.isArray(argument.evidence)||!Array.isArray(argument.rules))return empty('identity');
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
   if(a.kind==='generate'){
    conditions.push(C('target-pressure-screen-clear',clearPressure(e.targetPressure),[ref('groundedSupply',a.edgeId,'targetPressure')]));
   }else{
    const pressureId=key(from.graphNodeId,to.graphNodeId),pr=pressures.get(pressureId);
    if(!cleanPressure(pr)||pr.controllerNodeId!==from.graphNodeId||pr.targetNodeId!==to.graphNodeId||!Array.isArray(pr.candidatePathIds)||
     pr.local!==(Math.abs(ORDER.indexOf(from.position)-ORDER.indexOf(to.position))===1))return empty('pressure-binding');
    conditions.push(C('no-observed-interposition-candidate',pr.candidatePathIds.length===0,[ref('pressureDependencyReview',pressureId,'candidatePathIds')]));
   }
   // Structural and strength premises remain linked to their original
   // proof DAG, not copied as independently asserted observations.
   const mid=modelId(actor.element,policy.predicate);
   rules.push({id:key('modeled-rule',subject),policyId:MODELED_CONSEQUENCE_VERSION,conclusion:lit(id),
    premises:[lit(mid),lit(s.id),...conditions.map(c=>lit(c.id))],
    refs:[ref('source-clause',def.id,'quote'),ref('experimental-modeled-consequence-policy',MODELED_CONSEQUENCE_VERSION,policy.conclusion)],
    applicability:'complete-only'});
   clauses.push({clauseId:def.id,kind:policy.conclusion,propositionId:id,modelPropositionId:mid,structuralPropositionId:s.id,conditions,
    actualEffectState:'unresolved',state:null,reason:null});
  }
  rows.push({edgeId:a.edgeId,from:a.from,to:a.to,kind:a.kind,originalEffectPropositionId:effect.id,clauses,actualEffectState:'unresolved',effective:null});
 }
 const r=evaluateArguments({scope:complete?'complete':'partial',propositions:props,evidence,rules});
 if(r.status!==status||r.judgments.some(j=>j.level==='effect-hypothesis'&&j.state!=='unresolved'))return empty('evaluation');
 const result=index(r.judgments,j=>j.id);
 for(const row of rows)for(const c of row.clauses)if(c.propositionId){
  const j=result.get(c.propositionId);
  if(!j)return empty('outcome-identity');
  c.state=j.state;
  c.reason=j.state==='supported'?'modeled-consequence-derived':!complete?'partial':'premises-not-established';
  c.proof={support:j.support,opposition:j.opposition};
 }
 return {...base,status,reason:null,actions:rows,propositions:props,evidence,rules,judgments:r.judgments,ruleResults:r.ruleResults,
  limitations:['modeled-release-not-beneficial-generation','modeled-injury-not-net-control-or-benefit','screen-not-confirmed-clearance','no-rule-from-excess-or-resistance','no-actual-effect-authority','no-selection-authority']};
}
