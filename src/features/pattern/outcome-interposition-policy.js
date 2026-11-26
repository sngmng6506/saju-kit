import {elementRelation} from '../../core/elements.js';
import {evaluateArguments} from './outcome-argumentation.js';
const VERSION='p1-3b-interposition-policy-v1';
const TONGGUAN='https://zh.wikisource.org/zh-hans/滴天髓/20';
const RESCUE='https://changxianyi.com/guji/ziping/wz-20260914/chapter-010/';
const states=['supported','opposed','conflicting','unresolved'];
const registry=Object.freeze([
 {id:'tongguan',kind:'mediation',source:TONGGUAN,section:'通關',scope:'element-route',consequence:'conditional-mediation'},
 {id:'officer-rescue',kind:'protection',source:RESCUE,section:'論用神成敗救應',scope:'officer-pattern-context',consequence:'conditional-officer-protection'},
 {id:'food-rescue',kind:'protection',source:RESCUE,section:'論用神成敗救應',scope:'food-pattern-context',consequence:'conditional-food-protection'}
].map(Object.freeze));
export const interpositionSourcePolicies=()=>registry;
const lit=(propositionId,sign='for')=>({propositionId,sign});
const ref=(owner,id,field)=>({owner,id,field});
const signs=s=>s==='supported'?['for']:s==='opposed'?['against']:s==='conflicting'?['for','against']:[];
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const idFor=(a,b)=>a+'>'+b;
// Assumption-only contract. Structural path existence is insufficient.
// Obstruction attacks this source conditional, not the original control.
// Clearance is explicit opposition to obstruction, never its absence.
export function evaluateInterpositionScenario(policyId,{routeState,contextState,operationState,obstructionState,scope='complete'}={}){
 const policy=registry.find(p=>p.id===policyId);
 if(!policy||![routeState,contextState,operationState,obstructionState].every(s=>states.includes(s))||!['complete','partial'].includes(scope))return {status:'invalid-evidence',effective:null};
 const props=['route','context','operation','obstruction'].map(id=>({id,kind:'scenario-assumption',subject:policyId,level:'observation'}));
 props.push({id:'applicable',kind:'source-conditional-applicable',subject:policyId,level:'structural-hypothesis'},
  {id:'effect',kind:'actual-control-neutralized',subject:policyId,level:'effect-hypothesis'});
 const facts=[['route',routeState],['context',contextState],['operation',operationState],['obstruction',obstructionState]].flatMap(([id,s])=>signs(s).map(sign=>({
  id:id+':'+sign,...lit(id,sign),refs:[ref('scenario-assumption',policyId,id)],applicability:'complete-only'})));
 const rules=[{id:'apply',policyId:VERSION,conclusion:lit('applicable'),
  premises:[lit('route'),lit('context'),lit('operation'),lit('obstruction','against')],
  undercutWhen:[lit('obstruction')],refs:[ref('interposition-source-policy',policyId,'section')],applicability:'complete-only'},
  ...['route','context','operation'].map(id=>({id:'counter:'+id,policyId:VERSION,conclusion:lit('applicable','against'),
   premises:[lit(id,'against')],refs:[ref('interposition-source-policy',policyId,'section')],applicability:'complete-only'}))];
 const r=evaluateArguments({scope,propositions:props,evidence:facts,rules});
 if(!['diagnostic','partial'].includes(r.status))return {status:'invalid-evidence',effective:null};
 const j=r.judgments.find(x=>x.id==='applicable');
 const apply=r.ruleResults.find(x=>x.id==='apply');
 return {status:r.status,policyId,applicability:j.state,ruleStatus:apply.status,undercuts:apply.undercuts,
  assumptionStates:Object.fromEntries(r.judgments.filter(x=>x.level==='observation').map(x=>[x.id,x.state])),
  consequence:policy.consequence,consequenceState:j.state==='supported'?'follows-under-explicit-assumptions':'not-established',
  actualEffectState:r.judgments.find(x=>x.id==='effect').state,selectionAuthority:false,effective:null};
}
function matchPolicy(kind,h,s,t){
 if(kind==='mediation')return registry[0];
 // Ten-god labels alone do not establish the corresponding pattern.
 if([h,s,t].some(a=>a.dayReference))return null;
 if(['정인','편인'].includes(h.tenGod)&&s.tenGod==='상관'&&t.tenGod==='정관')return registry[1];
 if(['정재','편재'].includes(h.tenGod)&&s.tenGod==='편인'&&t.tenGod==='식신')return registry[2];
 return null;
}
// Reuse role-neutral interposition and pressure dependency owners.
// Bind only exact all-visible directed routes; hidden participants remain
// explicitly excluded, never counted as a failed route.
export function reviewInterpositionPolicy(prior,supply,interposition,pressure,argument){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:VERSION,completeHour:complete,selectionAuthority:false,effective:null,neutralizationConfirmed:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,paths:[],actions:[],excludedHiddenPathCount:0});
 const neutral=interposition?.roleNeutral;
 if(typeof complete!=='boolean'||[supply,neutral,pressure,argument].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  supply.effectiveSupply!==null||neutral.effectConfirmed!==null||neutral.neutralizationConfirmed!==null||pressure.effective!==null||
  pressure.neutralizationConfirmed!==null||argument.effective!==null||neutral.targetScope!=='all-visible-stems')return empty('upstream');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),edges=index(supply.actions,e=>e.edgeId),paths=index(neutral.paths,p=>p.id),
  deps=index(pressure.paths,p=>p.id),pressures=index(pressure.pressures,p=>p.id),args=index(argument.actions,a=>a.edgeId),judgments=index(argument.judgments,j=>j.id);
 if(!actors||!edges||!paths||!deps||!pressures||!args||!judgments||paths.size!==deps.size)return empty('identity');
 const visible=[...actors.values()].filter(a=>a.layer==='visible'),nodes=index(visible,a=>a.graphNodeId);
 if(!nodes||visible.length!==(complete?4:3)||visible.some(a=>a.id!=='visible:'+a.position||a.graphNodeId!==a.position+':stem'))return empty('visible-identity');
 const expectedControls=[...edges.values()].filter(e=>e.kind==='control'&&actors.get(e.from)?.layer==='visible'&&actors.get(e.to)?.layer==='visible');
 if(args.size!==[...edges.values()].filter(e=>actors.get(e.from)?.layer==='visible'&&actors.get(e.to)?.layer==='visible').length)return empty('action-coverage');
 const actions=new Map();
 for(const e of expectedControls){
  const a=actors.get(e.from),b=actors.get(e.to),r=args.get(e.edgeId),j=r&&judgments.get(r.effectPropositionId),p=pressures.get(JSON.stringify([a.graphNodeId,b.graphNodeId]));
  if(!r||r.kind!=='control'||r.from!==e.from||r.to!==e.to||r.effective!==null||e.effective!==null||e.selectionAuthority!==false||
   e.edgeId!==idFor(a.id,b.id)||!j||j.subject!==e.edgeId||j.kind!=='actual-action-effective'||j.level!=='effect-hypothesis'||
   j.state!=='unresolved'||j.support?.rank!==null||j.opposition?.rank!==null||!p||p.controllerNodeId!==a.graphNodeId||p.targetNodeId!==b.graphNodeId||
   p.neutralizationConfirmed!==null||p.effective!==null||!Array.isArray(p.candidatePathIds))return empty('control-binding');
  actions.set(p.id,{edgeId:e.edgeId,pressureId:p.id,actualEffectPropositionId:j.id,pathIds:[],sourceMatchedPathIds:[],actualEffectState:'unresolved',neutralizationConfirmed:null});
 }
 const rows=[];let excludedHiddenPathCount=0;
 for(const p of paths.values()){
  const d=deps.get(p.id),owner=pressures.get(JSON.stringify([p.threat,p.target]));
  if(!['protection','mediation'].includes(p.kind)||p.id!==JSON.stringify([p.kind,p.helper,p.threat,p.target])||
   new Set([p.helper,p.threat,p.target]).size!==3||!d||!owner||!owner.candidatePathIds?.includes(p.id)||d.targetPressureId!==owner.id||
   p.effectConfirmed!==null||p.neutralizationConfirmed!==null||d.effectConfirmed!==null||d.neutralizationConfirmed!==null||
   !Array.isArray(p.blockers)||!Array.isArray(d.dependencies)||!Array.isArray(d.otherBlockers)||
   p.structuralScreen!==(p.blockers.length?'context-review':'grounded-structure-screen-met')||
   !(d.structuralDependencyRank===null||Number.isInteger(d.structuralDependencyRank)&&d.structuralDependencyRank>=0))return empty('path-binding');
  const h=nodes.get(p.helper),s=nodes.get(p.threat),t=nodes.get(p.target);
  if(!t)return empty('target-scope');
  if(!h||!s){excludedHiddenPathCount++;continue;}
  const expected=p.kind==='protection'?[[h,s,'control'],[s,t,'control']]:[[s,h,'generate'],[h,t,'generate'],[s,t,'control']];
  if(!Array.isArray(p.edges)||p.edges.length!==expected.length||expected.some(([a,b,kind],i)=>{
   const x=p.edges[i],e=edges.get(idFor(a.id,b.id)),rel=elementRelation(a.element,b.element);
   return !x||x.from!==a.graphNodeId||x.to!==b.graphNodeId||x.type!==kind||!e||e.from!==a.id||e.to!==b.id||e.kind!==kind||e.effective!==null||e.selectionAuthority!==false||
    rel.type!==kind||rel.direction!=='left-to-right';
  }))return empty('leg-binding');
  const a=actions.get(owner.id);if(!a)return empty('action-binding');
  const policy=matchPolicy(p.kind,h,s,t);
  const routeState=complete?'supported':'unresolved';
  // Neither a rank nor an empty blocker array proves real operation or
  // clearance. Even the two named protection cases need pattern context.
  const scenario=policy?evaluateInterpositionScenario(policy.id,{routeState,contextState:policy.scope==='element-route'&&complete?'supported':'unresolved',
   operationState:'unresolved',obstructionState:'unresolved',scope:complete?'complete':'partial'}):null;
  if(scenario&&scenario.status!==status)return empty('scenario');
  a.pathIds.push(p.id);if(policy)a.sourceMatchedPathIds.push(p.id);
  rows.push({pathId:p.id,kind:p.kind,helperId:h.id,controllerId:s.id,targetId:t.id,pressureId:owner.id,controlEdgeId:a.edgeId,
   legEdgeIds:expected.map(([x,y])=>idFor(x.id,y.id)),structuralScreen:p.structuralScreen,structuralDependencyRank:d.structuralDependencyRank,
   observedBlockers:[...p.blockers],dependencyIds:[...d.dependencies],otherBlockers:[...d.otherBlockers],
   sourcePolicyId:policy?.id??null,sourceRefs:policy?[ref('interposition-source-policy',policy.id,'section')]:[],
   routeState,sourceApplicability:scenario?.applicability??'unresolved',sourceRuleStatus:scenario?.ruleStatus??'out-of-source-scope',
   actualUndercuts:[],actualEffectState:'unresolved',neutralizationConfirmed:null,effective:null});
 }
 for(const a of actions.values()){
  const expected=pressures.get(a.pressureId).candidatePathIds.filter(id=>{const p=paths.get(id);return p&&nodes.has(p.helper)&&nodes.has(p.threat)&&nodes.has(p.target);});
  if(!same([...a.pathIds].sort(),[...expected].sort())||pressures.get(a.pressureId).candidatePathIds.some(id=>!paths.has(id)))return empty('path-coverage');
 }
 return {...base,status,reason:null,paths:rows,actions:[...actions.values()],excludedHiddenPathCount,
  limitations:['source-condition-not-effect-proof','role-match-not-pattern-context','structural-rank-not-neutralization','blocker-not-proven-obstruction','no-clearance-by-absence','no-hidden-substitution']};
}
