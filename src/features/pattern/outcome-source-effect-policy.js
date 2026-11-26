import {describeSemanticBridge} from './outcome-semantic-bridges.js';
import {elementRelation} from '../../core/elements.js';
import {evaluateArguments} from './outcome-argumentation.js';
const SOURCE='https://www.shidianguji.com/book/SK1610/chapter/1mecpy8lhe70z';
const PARALLEL='https://zh.wikisource.org/zh-hans/三命通会_(四库全书本)/卷12';
const POLICY='p1-2-sanming-wuxing-conditional-v1';
const types=Object.freeze([
 ['generation-source-excess','generate','source','excessive','target-adverse-condition','undercut-beneficial-supply'],
 ['generation-target-excess','generate','target','excessive','source-depletion-condition','undercut-source-preservation'],
 ['generation-strong-source-release','generate','source','strong','source-moderation-condition','conditional-source-release'],
 ['control-target-resistance','control','target','resistant','source-adverse-condition','undercut-unilateral-control'],
 ['control-weak-target','control','target','weak','target-injury-condition','conditional-target-injury']
].map(Object.freeze));
// The five element-specific clauses in each family are retained rather
// than identifying different classical terms with a scalar threshold.
const generators=[['wood','fire','木多火炽','火多木焚','强木得火方化其顽'],['fire','earth','火多土焦','土多火晦','强火得土方止其焰'],
 ['earth','metal','土多金埋','金多土变','强土得金方制其害'],['metal','water','金多水浊','水多金沈','强金得水方挫其锋'],['water','wood','水多木漂','木盛水缩','强水得木方泄其势']];
const controllers=[['metal','wood','木坚金缺','木弱逢金必为砍折'],['wood','earth','土重木折','土衰遇木必遭倾陷'],
 ['earth','water','水多土流','水弱逢土必为淤塞'],['water','fire','火炎水热','火弱逢水必为熄灭'],['fire','metal','金多火熄','金衰遇火必见销镕']];
const clauses=Object.freeze([...generators.flatMap(([from,to,...qs])=>types.slice(0,3).map((t,i)=>make(t,from,to,qs[i]))),
 ...controllers.flatMap(([from,to,...qs])=>types.slice(3).map((t,i)=>make(t,from,to,qs[i])))]);
function make([family,kind,role,predicate,consequence,interpretation],from,to,quote){
 return Object.freeze({id:[family,from,to].join(':'),family,kind,fromElement:from,toElement:to,role,predicate,
  premiseScope:'element-context-not-occurrence-profile',consequence,interpretation,source:SOURCE,parallel:PARALLEL,quote,
  // Textual conditional, not verified necessity/sufficiency for the
  // actual-action-effective proposition.
  authority:'source-conditional-only',actualEffectRule:false});
}
export const sourceEffectClauses=()=>clauses;
const byClause=new Map(clauses.map(c=>[c.id,c]));
const states=['supported','opposed','conflicting','unresolved'];
const signs=s=>s==='supported'?['for']:s==='opposed'?['against']:s==='conflicting'?['for','against']:[];
const ref=(owner,id,field)=>({owner,id,field});
// Explicit assumptions are allowed only in this scenario evaluator.
// Production review below passes unresolved for element predicates.
// A negative applicability proof is not a rebuttal of the consequent.
export function evaluateSourceClauseScenario(clauseId,{relationState,predicateState,scope='complete'}={}){
 const clause=byClause.get(clauseId);
 if(!clause||!states.includes(relationState)||!states.includes(predicateState)||!['complete','partial'].includes(scope))return {status:'invalid-evidence',effectConfirmed:null};
 const subject=clause.id,propositions=[{id:'relation',kind:'literal-relation',subject,level:'observation'},
  {id:'predicate',kind:'explicit-element-context-assumption',subject,level:'observation'},
  {id:'applicable',kind:'source-clause-applicable-under-assumptions',subject,level:'structural-hypothesis'},
  {id:'effect',kind:'actual-action-effective',subject,level:'effect-hypothesis'}];
 const evidence=[['relation',relationState],['predicate',predicateState]].flatMap(([id,s])=>signs(s).map(sign=>({
  id:id+':'+sign,propositionId:id,sign,refs:[ref('scenario-assumption',subject,id)],applicability:'complete-only'})));
 const lit=(propositionId,sign)=>({propositionId,sign});
 const rules=[{id:'apply',policyId:POLICY,conclusion:lit('applicable','for'),premises:[lit('relation','for'),lit('predicate','for')],refs:[ref('source-clause',subject,'quote')],applicability:'complete-only'},
  ...['relation','predicate'].map(id=>({id:'undercut:'+id,policyId:POLICY,conclusion:lit('applicable','against'),premises:[lit(id,'against')],refs:[ref('source-clause',subject,'quote')],applicability:'complete-only'}))];
 const result=evaluateArguments({scope,propositions,evidence,rules});
 if(!['diagnostic','partial'].includes(result.status))return {status:'invalid-evidence',effectConfirmed:null};
 const j=result.judgments.find(j=>j.id==='applicable'),effect=result.judgments.find(j=>j.id==='effect');
 return {status:result.status,clauseId,applicability:j.state,conditionalConsequence:clause.consequence,
  consequenceState:j.state==='supported'?'follows-under-explicit-assumptions':j.state==='conflicting'?'assumptions-conflict':'not-established',
  applicabilityProof:{support:j.support,opposition:j.opposition},actualEffectState:effect.state,effectConfirmed:null,selectionAuthority:false};
}
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
export function reviewSourceEffectPolicy(prior,argument,supply,strength){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial',base={version:POLICY,completeHour:complete,selectionAuthority:false,effectConfirmed:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,actions:[],clauseCount:clauses.length});
 if(typeof complete!=='boolean'||[argument,supply].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  argument.effective!==null||supply.effectiveSupply!==null)return empty('upstream');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),actions=index(supply.actions,a=>a.edgeId),rows=index(argument.actions,a=>a.edgeId),judgments=index(argument.judgments,j=>j.id);
 if(!actors||!actions||!rows||!judgments||[...actions.values()].some(e=>!actors.has(e.from)||!actors.has(e.to)))return empty('identity');
 const visible=[...actions.values()].filter(e=>actors.get(e.from).layer==='visible'&&actors.get(e.to).layer==='visible');
 if(visible.length!==rows.size||[...actors.values()].filter(a=>a.dayReference&&a.layer==='visible').length!==1)return empty('visible-coverage');
 const direction=complete&&['strong','weak'].includes(strength?.direction)?strength.direction:null;
 const result=[];
 for(const e of visible){
  const a=actors.get(e.from),b=actors.get(e.to),r=rows.get(e.edgeId),s=r&&judgments.get(r.structuralPropositionId),effect=r&&judgments.get(r.effectPropositionId);
  const rel=elementRelation(a.element,b.element);
  if(!r||r.from!==e.from||r.to!==e.to||r.kind!==e.kind||e.edgeId!==e.from+'>'+e.to||e.effective!==null||e.selectionAuthority!==false||r.effective!==null||
   rel.direction!=='left-to-right'||rel.type!==e.kind||!s||s.subject!==e.edgeId||s.level!=='structural-hypothesis'||s.kind!==(e.kind==='generate'?'existing-generation-screen-met':'stable-source-profile-dominance')||!states.includes(s.state)||
   s.state!==r.expectedStructuralState||!effect||effect.subject!==e.edgeId||effect.level!=='effect-hypothesis'||effect.kind!=='actual-action-effective'||effect.state!=='unresolved'||
   effect.support?.rank!==null||effect.opposition?.rank!==null||effect.effective!==null)return empty('edge-binding');
  const applicable=clauses.filter(c=>c.kind===e.kind&&c.fromElement===a.element&&c.toElement===b.element);
  if(applicable.length!==(e.kind==='generate'?3:2))return empty('registry-coverage');
  const conditional=applicable.map(c=>{
   const actor=c.role==='source'?a:b;
   const dayFit=actor.dayReference&&['strong','weak'].includes(c.predicate)?{
    direction,expected:c.predicate,fit:direction===null?'unresolved':direction===c.predicate?'aligned':'opposed',
    policy:strength?.policy??null,substitutionConfirmed:null}:null;
   const scenario=evaluateSourceClauseScenario(c.id,{relationState:'supported',predicateState:'unresolved',scope:complete?'complete':'partial'});
   return {clauseId:c.id,predicateActorId:actor.id,predicateElement:actor.element,predicate:c.predicate,predicateState:'unresolved',
    semanticBridge:describeSemanticBridge(c.predicate==='excessive'?'element-excess':c.predicate==='resistant'?'element-resistance':'element-strength',[actor.element]),
    dayHypothesisContext:dayFit,applicability:scenario.applicability,conditionalConsequence:c.consequence,consequenceState:scenario.consequenceState,
    interpretation:c.interpretation,sourceRefs:[ref('source-clause',c.id,'quote')],effectConfirmed:null};
  });
  // Failed screen/contrast concerns restrict only the corresponding
  // structural argument. They cannot provide negative effect evidence.
  const undercuts=s.state==='opposed'||s.state==='conflicting'?[{propositionId:s.id,kind:'structural-argument-undercut',
   state:s.state,scope:'structural-proposition-only',actualEffectRebuttal:false}]:[];
  result.push({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,structuralPropositionId:s.id,actualEffectPropositionId:effect.id,
   structuralUndercuts:undercuts,clauses:conditional,actualEffectState:'unresolved',effectConfirmed:null});
 }
 return {...base,status,reason:null,clauseCount:clauses.length,actions:result,limitations:['textual-conditional-not-empirical-validation',
  'element-predicate-not-relative-dominance','day-direction-not-element-predicate','undercut-not-effect-rebuttal','no-effect-rule-promotion','visible-literal-scope']};
}
