import {evaluateArguments} from './outcome-argumentation.js';
const VERSION='p1-3c-combination-policy-v1';
const SOURCE='https://www.tianyashuku.com/yijing/9643/814106.html';
const COMMENTARY='https://www.ncc.com.tw/fate/paleo/bg/bg_032.htm';
const registry=Object.freeze([
 {id:'external-role-restriction',section:'論十干合而不合',source:SOURCE,scope:'external-pair',consequence:'conditional-original-role-restriction'},
 {id:'transformation',section:'論十干合而不合（徐注）',source:COMMENTARY,scope:'ordinary-natal-pair',consequence:'conditional-transformation'},
 {id:'residual-role-retention',section:'論十干合而不合（徐注）',source:COMMENTARY,scope:'specific-original-role',consequence:'conditional-original-role-retention'}
].map(Object.freeze));
export const combinationSourcePolicies=()=>registry;
const states=['supported','opposed','conflicting','unresolved'];
const signs=s=>s==='supported'?['for']:s==='opposed'?['against']:s==='conflicting'?['for','against']:[];
const lit=(propositionId,sign='for')=>({propositionId,sign});
const ref=(owner,id,field)=>({owner,id,field});
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sorted=xs=>[...xs].sort();
const pairKey=(a,b)=>JSON.stringify(sorted([a,b]));
const absent=x=>x&&x.restrictionConfirmed===null&&x.retentionConfirmed===null&&x.transformationConfirmed===null&&x.effective===null;
// All three conditionals have independent premises. Neither failure of
// transformation nor original root evidence is proof of retention.
export function evaluateCombinationScenario(policyId,{pairState,contextState,operationState,obstructionState,selfState,scope='complete'}={}){
 const policy=registry.find(p=>p.id===policyId);
 if(!policy||![pairState,contextState,operationState,obstructionState,selfState].every(s=>states.includes(s))||!['complete','partial'].includes(scope))return {status:'invalid-evidence',effective:null};
 const external=policy.scope==='external-pair';
 const props=['pair','context','operation','obstruction','self'].map(id=>({id,kind:'scenario-assumption',subject:policyId,level:'observation'}));
 props.push({id:'applicable',kind:'source-conditional-applicable',subject:policyId,level:'structural-hypothesis'},
  {id:'effect',kind:policy.consequence,subject:policyId,level:'effect-hypothesis'});
 const evidence=[['pair',pairState],['context',contextState],['operation',operationState],['obstruction',obstructionState],['self',selfState]].flatMap(([id,s])=>signs(s).map(sign=>({
  id:id+':'+sign,...lit(id,sign),refs:[ref('scenario-assumption',policyId,id)],applicability:'complete-only'})));
 const mk=(id,sign,premises,undercutWhen)=>({id,policyId:VERSION,conclusion:lit('applicable',sign),premises,
  ...(undercutWhen?{undercutWhen}:{}),refs:[ref('combination-source-policy',policyId,'section')],applicability:'complete-only'});
 const rules=[mk('apply','for',[lit('pair'),lit('context'),lit('operation'),lit('obstruction','against'),...(external?[lit('self','against')]:[])],
  [lit('obstruction'),...(external?[lit('self')]:[])]),
  ...['pair','context','operation'].map(id=>mk('counter:'+id,'against',[lit(id,'against')])),
  ...(external?[mk('outside-external-scope','against',[lit('self')])]:[])];
 const r=evaluateArguments({scope,propositions:props,evidence,rules});
 if(!['diagnostic','partial'].includes(r.status))return {status:'invalid-evidence',effective:null};
 const j=r.judgments.find(x=>x.id==='applicable'),rule=r.ruleResults.find(x=>x.id==='apply');
 return {status:r.status,policyId,applicability:j.state,ruleStatus:rule.status,undercuts:rule.undercuts,
  consequenceState:j.state==='supported'?'follows-under-explicit-assumptions':'not-established',
  actualEffectState:r.judgments.find(x=>x.id==='effect').state,selectionAuthority:false,effective:null};
}
// Existing residual context owns pair inventory, original roots and
// candidate competition. This adapter never reallocates or rewrites them.
export function reviewCombinationPolicy(prior,residual,supply,argument){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:VERSION,completeHour:complete,selectionAuthority:false,effective:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,pairs:[],actions:[],excludedHiddenActionCount:0});
 if(typeof complete!=='boolean'||[residual,supply,argument].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  !absent(residual)||supply.effectiveSupply!==null||argument.effective!==null)return empty('upstream');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),pairs=index(residual.pairs,p=>p.id),participants=index(residual.participants,p=>p.id),
  affected=index(residual.actions,a=>a.edgeId),edges=index(supply.actions,a=>a.edgeId),args=index(argument.actions,a=>a.edgeId),judgments=index(argument.judgments,j=>j.id);
 if(!actors||!pairs||!participants||!affected||!edges||!args||!judgments)return empty('identity');
 const byActor=new Map(),rows=[];
 for(const p of pairs.values()){
  if(!absent(p)||!Array.isArray(p.participants)||p.participants.length!==2||new Set(p.participants).size!==2||
   p.id!==pairKey(...p.participants)||!Array.isArray(p.competitors)||!Array.isArray(p.intervening))return empty('pair-contract');
  const [a,b]=p.participants.map(id=>actors.get(id));
  if(!a||!b||a.layer!=='visible'||b.layer!=='visible'||p.dayReferenceInvolved!==!!(a.dayReference||b.dayReference)||
   p.scope!==(p.dayReferenceInvolved?'self-combination-not-external-removal':'external-role-restriction-review'))return empty('pair-scope');
  for(const actor of [a,b]){
   if(!byActor.has(actor.id))byActor.set(actor.id,[]);
   byActor.get(actor.id).push(p.id);
  }
  if(p.competitors.some(c=>!pairs.has(c.pairId)||c.pairId===p.id||!p.participants.includes(c.participantId)||
   c.pairId!==pairKey(c.participantId,c.partnerId)||p.participants.includes(c.partnerId)))return empty('competition-binding');
  const selfState=complete?(p.dayReferenceInvolved?'supported':'opposed'):'unresolved';
  const sourceCases=[];
  // Remote or competing contact is a review condition, not a
  // confirmed obstruction; original commentary supplies countercases.
  if(p.span===3)sourceCases.push('remote-endpoints-review');
  if(p.intervening.some(m=>m.controlsParticipantIds?.length))sourceCases.push('intervening-controller-review');
  if(p.competitors.length)sourceCases.push('competing-partner-review');
  if(p.competitors.some(c=>c.positionRelation==='farther'))sourceCases.push('separated-competitor-countercase-review');
  if(p.dayReferenceInvolved)sourceCases.push('self-combination-external-removal-exception');
  const conditionals=registry.map(policy=>evaluateCombinationScenario(policy.id,{pairState:complete?'supported':'unresolved',
   contextState:'unresolved',operationState:'unresolved',obstructionState:'unresolved',selfState,scope:complete?'complete':'partial'}));
  if(conditionals.some(x=>x.status!==status))return empty('scenario');
  rows.push({pairId:p.id,participantIds:[...p.participants],formationId:p.formationId,associatedElement:p.associatedElement,
   contactHypothesis:p.contactHypothesis,sourceCases,competitorPairIds:[...new Set(p.competitors.map(c=>c.pairId))],
   transformationContext:p.transformationContext,conditionals,actualRestrictionState:'unresolved',actualTransformationState:'unresolved',
   actualRetentionState:'unresolved',effective:null});
 }
 if(participants.size!==byActor.size)return empty('participant-coverage');
 for(const [id,ids] of byActor){
  const p=participants.get(id);
  if(!absent(p)||!Array.isArray(p.pairIds)||!same(sorted(p.pairIds),sorted(ids)))return empty('participant-binding');
 }
 const actions=[];let excludedHiddenActionCount=0,visibleCount=0;
 for(const e of edges.values()){
  const a=actors.get(e.from),b=actors.get(e.to),q=affected.get(e.edgeId);
  if(!a||!b||e.effective!==null||e.selectionAuthority!==false)return empty('edge-contract');
  const from=byActor.get(e.from)??[],to=byActor.get(e.to)??[];
  if(!!q!==!!(from.length||to.length))return empty('affected-coverage');
  const visible=a.layer==='visible'&&b.layer==='visible';
  if(visible)visibleCount++;
  if(!q)continue;
  if(!absent(q)||q.from!==e.from||q.to!==e.to||q.kind!==e.kind||!Array.isArray(q.fromPairIds)||!Array.isArray(q.toPairIds)||!Array.isArray(q.samePairIds)||
   !same(sorted(q.fromPairIds),sorted(from))||!same(sorted(q.toPairIds),sorted(to))||
   !same(sorted(q.samePairIds),sorted(from.filter(id=>to.includes(id))))||
   q.access!==(visible?'visible':'hidden-endpoint-review'))return empty('affected-binding');
  if(!visible){excludedHiddenActionCount++;continue;}
  const r=args.get(e.edgeId),j=r&&judgments.get(r.effectPropositionId);
  if(!r||r.from!==e.from||r.to!==e.to||r.kind!==e.kind||r.effective!==null||!j||j.subject!==e.edgeId||
   j.kind!=='actual-action-effective'||j.level!=='effect-hypothesis'||j.state!=='unresolved'||j.support?.rank!==null||j.opposition?.rank!==null)return empty('effect-binding');
  actions.push({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,fromPairIds:[...from],toPairIds:[...to],
   originalEffectPropositionId:j.id,actualEffectState:'unresolved',actualUndercuts:[],effective:null});
 }
 if(visibleCount!==args.size||affected.size!==actions.length+excludedHiddenActionCount)return empty('action-coverage');
 return {...base,status,reason:null,pairs:rows,actions,excludedHiddenActionCount,
  limitations:['ordinary-stem-pairs-only','self-exception-not-retention-proof','competition-not-allocation','remote-contact-not-automatic-release','target-context-not-transformation','no-edge-removal']};
}
