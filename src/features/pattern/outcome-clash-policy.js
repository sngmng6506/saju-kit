import {evaluateArguments} from './outcome-argumentation.js';
const VERSION='p1-3d-clash-policy-v1';
const DITIAN='https://www.shidianguji.com/book/7654517725435265075/chapter/1m5zgml2zaqkp';
const COMMENT='https://zh.wikisource.org/wiki/滴天髓闡微';
const ZIPING='https://changxianyi.com/guji/ziping/wz-20260914/chapter-008/';
const registry=Object.freeze([
 {id:'weak-side-damage',source:DITIAN,section:'地支論',scope:'directed-branch-context',consequence:'conditional-weak-side-damage'},
 {id:'strong-side-preservation',source:COMMENT,section:'地支',scope:'directed-branch-context',consequence:'conditional-strong-side-preservation'},
 {id:'formation-relief',source:ZIPING,section:'論刑沖會合解法',scope:'specific-clash-and-formation',consequence:'conditional-clash-relief'}
].map(Object.freeze));
export const clashSourcePolicies=()=>registry;
const states=['supported','opposed','conflicting','unresolved'];
const signs=s=>s==='supported'?['for']:s==='opposed'?['against']:s==='conflicting'?['for','against']:[];
const ref=(owner,id,field)=>({owner,id,field});
const lit=(propositionId,sign='for')=>({propositionId,sign});
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const setEqual=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
const absent=x=>x&&x.damageConfirmed===null&&x.preservationConfirmed===null&&x.reliefConfirmed===null&&x.effective===null;
const reliefKey=(clashId,formationId)=>JSON.stringify([clashId,formationId]);
const directionKey=(clashId,position)=>JSON.stringify([clashId,position]);
// Source-scoped authorization only: relative branch direction is not an
// occurrence profile or day strength label. No slot effect is authorized.
export function evaluateClashScenario(policyId,{contactState,contextState,operationState,obstructionState,scope='complete'}={}){
 const policy=registry.find(p=>p.id===policyId);
 if(!policy||![contactState,contextState,operationState,obstructionState].every(s=>states.includes(s))||!['complete','partial'].includes(scope))return {status:'invalid-evidence',effective:null};
 const props=['contact','context','operation','obstruction'].map(id=>({id,kind:'scenario-assumption',subject:policyId,level:'observation'}));
 props.push({id:'applicable',kind:'source-conditional-applicable',subject:policyId,level:'structural-hypothesis'},
  {id:'effect',kind:policy.consequence,subject:policyId,level:'effect-hypothesis'});
 const evidence=[['contact',contactState],['context',contextState],['operation',operationState],['obstruction',obstructionState]].flatMap(([id,s])=>signs(s).map(sign=>({
  id:id+':'+sign,...lit(id,sign),refs:[ref('scenario-assumption',policyId,id)],applicability:'complete-only'})));
 const mk=(id,sign,premises,gate)=>({id,policyId:VERSION,conclusion:lit('applicable',sign),premises,...(gate?{undercutWhen:gate}:{}),
  refs:[ref('clash-source-policy',policyId,'section')],applicability:'complete-only'});
 const rules=[mk('apply','for',[lit('contact'),lit('context'),lit('operation'),lit('obstruction','against')],[lit('obstruction')]),
  ...['contact','context','operation'].map(id=>mk('counter:'+id,'against',[lit(id,'against')]))];
 const r=evaluateArguments({scope,propositions:props,evidence,rules});
 if(!['diagnostic','partial'].includes(r.status))return {status:'invalid-evidence',effective:null};
 const j=r.judgments.find(x=>x.id==='applicable'),a=r.ruleResults.find(x=>x.id==='apply');
 return {status:r.status,policyId,applicability:j.state,ruleStatus:a.status,undercuts:a.undercuts,
  consequenceState:j.state==='supported'?'follows-under-explicit-assumptions':'not-established',
  actualEffectState:r.judgments.find(x=>x.id==='effect').state,selectionAuthority:false,effective:null};
}
export function reviewClashPolicy(prior,residual,supply,argument){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:VERSION,completeHour:complete,selectionAuthority:false,effective:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,directions:[],reliefs:[],slots:[],occurrences:[],actions:[]});
 if(typeof complete!=='boolean'||[residual,supply,argument].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  !absent(residual)||supply.effectiveSupply!==null||argument.effective!==null)return empty('upstream');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),clashes=index(residual.clashes,c=>c.clashId),slots=index(residual.slots,s=>s.id),
  occurrences=index(residual.occurrences,a=>a.id),affected=index(residual.actions,a=>a.edgeId),edges=index(supply.actions,a=>a.edgeId),
  args=index(argument.actions,a=>a.edgeId),judgments=index(argument.judgments,j=>j.id);
 if(!actors||!clashes||!slots||!occurrences||!affected||!edges||!args||!judgments)return empty('identity');
 const scenario=id=>evaluateClashScenario(id,{contactState:complete?'supported':'unresolved',contextState:'unresolved',operationState:'unresolved',obstructionState:'unresolved',scope:complete?'complete':'partial'});
 const directions=[],reliefs=[],slotRows=[],occurrenceRows=[],actions=[],incident=new Map(),reliefMap=new Map();
 for(const c of clashes.values()){
  if(!absent(c)||!Array.isArray(c.positions)||c.positions.length!==2||new Set(c.positions).size!==2||
   !Array.isArray(c.endpoints)||c.endpoints.length!==2||!setEqual(c.endpoints.map(x=>x.position),c.positions)||
   !Array.isArray(c.alternatives))return empty('clash-contract');
  for(const e of c.endpoints){
   if(e.damageConfirmed!==null||!setEqual(e.slotIds,[...actors.values()].filter(a=>a.layer==='hidden'&&a.position===e.position).map(a=>a.id))||!e.slotIds.length)return empty('endpoint-binding');
   for(const id of e.slotIds){if(!incident.has(id))incident.set(id,[]);incident.get(id).push(c.clashId);}
   directions.push({id:directionKey(c.clashId,e.position),clashId:c.clashId,targetPosition:e.position,oppositePosition:c.positions.find(p=>p!==e.position),
    slotIds:[...e.slotIds],conditionals:[scenario('weak-side-damage'),scenario('strong-side-preservation')],actualDamageState:'unresolved',actualPreservationState:'unresolved'});
  }
  for(const a of c.alternatives){
   const id=reliefKey(c.clashId,a.formationId);
   if(reliefMap.has(id)||a.reliefConfirmed!==null||!['six-harmony','complete-three'].includes(a.classification)||
    !Array.isArray(a.positions)||a.positions.filter(p=>c.positions.includes(p)).length!==1||!a.positions.includes(a.sharedPosition)||
    !c.positions.includes(a.sharedPosition)||a.oppositePosition!==c.positions.find(p=>p!==a.sharedPosition)||
    ![a.otherClashIds,a.remainingClashIds,a.competingFormationIds].every(Array.isArray)||
    [...a.otherClashIds,...a.remainingClashIds].some(x=>x===c.clashId||!clashes.has(x)))return empty('relief-binding');
   const row={id,clashId:c.clashId,formationId:a.formationId,sharedPosition:a.sharedPosition,oppositePosition:a.oppositePosition,
    positions:[...a.positions],targetElement:a.targetElement,otherClashIds:[...a.otherClashIds],remainingClashIds:[...a.remainingClashIds],competingFormationIds:[...a.competingFormationIds],
    conditional:scenario('formation-relief'),actualReliefState:'unresolved',effective:null};
   reliefMap.set(id,row);reliefs.push(row);
  }
 }
 if(slots.size!==incident.size)return empty('slot-coverage');
 for(const [id,clashIds] of incident){
  const s=slots.get(id),a=actors.get(id);
  if(!absent(s)||s.position!==a.position||s.element!==a.element||s.role!==a.hiddenRole||s.substantial!==(s.role!=='residual')||
   !setEqual(s.clashIds,clashIds)||!Array.isArray(s.reliefAlternatives)||!setEqual(s.reliefAlternatives.map(x=>x.clashId),clashIds))return empty('slot-binding');
  const alternatives=[];
  for(const g of s.reliefAlternatives){
   if(!Array.isArray(g.options)||!setEqual(g.options.map(o=>o.formationId),clashes.get(g.clashId).alternatives.map(o=>o.formationId)))return empty('relief-coverage');
   for(const o of g.options){
    const k=reliefKey(g.clashId,o.formationId),r=reliefMap.get(k);
    if(!r||o.reliefConfirmed!==null||o.side!==(r.sharedPosition===s.position?'root-side':'opposite-side')||
     o.rootPositionParticipates!==r.positions.includes(s.position)||o.targetElement!==r.targetElement||
     o.rootElementDiffersFromTarget!==(r.positions.includes(s.position)&&r.targetElement!=null&&r.targetElement!==s.element))return empty('slot-relief-binding');
    alternatives.push({reliefId:k,side:o.side,rootPositionParticipates:o.rootPositionParticipates,rootElementDiffersFromTarget:o.rootElementDiffersFromTarget,restorationConfirmed:null});
   }
  }
  slotRows.push({slotId:id,position:s.position,substantial:s.substantial,clashIds:[...clashIds],directionIds:clashIds.map(c=>directionKey(c,s.position)),
   reliefAlternatives:alternatives,actualDamageState:'unresolved',actualPreservationState:'unresolved',actualRestorationState:'unresolved',effective:null});
 }
 // Every visible actor's literal exposed-root references must match the
 // residual owner's occurrence inventory, including shared physical slots.
 for(const actor of actors.values()){
  if(actor.layer!=='visible')continue;
  if(!Array.isArray(actor.roots))return empty('literal-root-contract');
  const expected=actor.roots.filter(r=>slots.has('hidden:'+r.position+':'+r.stem)).map(r=>'hidden:'+r.position+':'+r.stem);
  const row=occurrences.get(actor.id);
  if(!!row!==!!expected.length||row&&(!Array.isArray(row.exposedSubstantialRootIds)||!Array.isArray(row.exposedResidualRootIds)||!setEqual([...row.exposedSubstantialRootIds,...row.exposedResidualRootIds],expected)))return empty('occurrence-coverage');
 }
 for(const a of occurrences.values()){
  const actor=actors.get(a.id);
  if(!absent(a)||!actor||actor.layer!=='visible'||a.element!==actor.element||
   ![a.exposedSubstantialRootIds,a.exposedResidualRootIds,a.uncontestedRootIds,a.outsideIncidentClashRootIds,a.incoming].every(Array.isArray))return empty('occurrence-binding');
  const exposed=[...a.exposedSubstantialRootIds,...a.exposedResidualRootIds];
  if(!exposed.length||new Set(exposed).size!==exposed.length||a.exposedSubstantialRootIds.some(id=>!slots.get(id)?.substantial)||
   a.exposedResidualRootIds.some(id=>slots.get(id)?.substantial!==false)||
   exposed.some(id=>slots.get(id)?.element!==actor.element)||a.uncontestedRootIds.some(id=>slots.has(id))||
   a.outsideIncidentClashRootIds.some(id=>!a.uncontestedRootIds.includes(id)))return empty('root-binding');
  occurrenceRows.push({occurrenceId:a.id,exposedRootIds:exposed,uncontestedRootIds:[...a.uncontestedRootIds],outsideIncidentClashRootIds:[...a.outsideIncidentClashRootIds],
   evidenceRefs:['exposedSubstantialRootIds','exposedResidualRootIds','uncontestedRootIds','incoming'].map(field=>ref('clashResidualContext',a.id,field)),
   actualCapacityState:'unresolved',effective:null});
 }
 let visibleCount=0;
 for(const e of edges.values()){
  const a=actors.get(e.from),b=actors.get(e.to);
  if(!a||!b||e.effective!==null||e.selectionAuthority!==false)return empty('edge-contract');
  if(a.layer!=='visible'||b.layer!=='visible')continue;
  visibleCount++;
  const x=occurrences.get(e.from),y=occurrences.get(e.to),q=affected.get(e.edgeId);
  if(!!q!==!!(x||y))return empty('action-coverage');if(!q)continue;
  const sub=[...new Set([...(x?.exposedSubstantialRootIds??[]),...(y?.exposedSubstantialRootIds??[])])],res=[...new Set([...(x?.exposedResidualRootIds??[]),...(y?.exposedResidualRootIds??[])])];
  const r=args.get(e.edgeId),j=r&&judgments.get(r.effectPropositionId);
  if(!absent(q)||q.from!==e.from||q.to!==e.to||q.kind!==e.kind||!setEqual(q.substantialRootIds,sub)||!setEqual(q.residualRootIds,res)||
   !r||r.from!==e.from||r.to!==e.to||r.kind!==e.kind||r.effective!==null||!j||j.subject!==e.edgeId||j.kind!=='actual-action-effective'||
   j.level!=='effect-hypothesis'||j.state!=='unresolved'||j.support?.rank!==null||j.opposition?.rank!==null)return empty('action-binding');
  actions.push({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,substantialRootIds:sub,residualRootIds:res,originalEffectPropositionId:j.id,
   actualEffectState:'unresolved',actualUndercuts:[],effective:null});
 }
 if(visibleCount!==args.size||actions.length!==affected.size)return empty('action-inventory');
 return {...base,status,reason:null,directions,reliefs,slots:slotRows,occurrences:occurrenceRows,actions,
  limitations:['direction-context-not-axis-dominance','branch-effect-not-slot-erasure','relief-not-restoration','candidate-coverage-not-joint-allocation','residual-not-substantial','outside-root-not-effective-capacity','no-effect-promotion']};
}
