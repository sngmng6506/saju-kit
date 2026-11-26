import {evaluateArguments} from './outcome-argumentation.js';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const index=(xs,f)=>Array.isArray(xs)&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const ref=(owner,id,field)=>({owner,id,field});
const id=(subject,kind)=>JSON.stringify([subject,kind]);
const clear=xs=>Array.isArray(xs)&&xs.every(x=>x.donorState==='no-substantial-root-observed');
const structuralPolicy='p1-1-existing-structural-screen-v1';
// P1-1 is deliberately a typed bridge, not a new classical effect policy.
// Do not import the old four-state mechanism status as effect evidence.
export function observeArgumentReview(prior,supply,pressure,locality){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:'outcome-argument-review-v1',completeHour:complete,selectionAuthority:false,effective:null};
 const empty=(reason)=>({...base,status:'invalid-evidence',reason,propositions:[],evidence:[],rules:[],judgments:[],ruleResults:[],actions:[]});
 if(typeof complete!=='boolean'||[supply,pressure,locality].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  supply.effectiveSupply!==null||pressure.effective!==null||locality.effective!==null)return empty('upstream');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),obs=index(supply.occurrences,a=>a.id),actions=index(supply.actions,e=>e.edgeId),
  local=index(locality.relations,e=>e.edgeId),press=index(pressure.pressures,p=>p.id),raw=index(prior.relativeForce?.edges,e=>e.id);
 if(!actors||!obs||!actions||!local||!press||!raw||obs.size!==actors.size||actions.size!==raw.size)return empty('identity');
 const visible=[...actions.values()].filter(e=>actors.get(e.from)?.layer==='visible'&&actors.get(e.to)?.layer==='visible');
 if(visible.length!==local.size||[...actions.values()].some(e=>!actors.has(e.from)||!actors.has(e.to)||!raw.has(e.edgeId)))return empty('visible-coverage');
 const propositions=[],evidence=[],rules=[],rows=[];
 const add=(subject,kind,level)=>{const p={id:id(subject,kind),subject,kind,level};propositions.push(p);return p.id;};
 const fact=(p,value,refs)=>{
  if(value!==true&&value!==false&&value!==null)throw Error('boolean evidence');
  if(value===null)return;
  const sign=value?'for':'against';
  evidence.push({id:JSON.stringify([p,sign]),propositionId:p,sign,refs,applicability:'complete-only'});
 };
 const rule=(p,sign,premises,source)=>{
  rules.push({id:JSON.stringify([p,sign,premises]),policyId:structuralPolicy,conclusion:{propositionId:p,sign},premises,
   refs:[source],applicability:'complete-only'});
 };
 const lit=(p,sign)=>({propositionId:p,sign});
 for(const e of visible){
  const a=actors.get(e.from),b=actors.get(e.to),s=obs.get(e.from),l=local.get(e.edgeId),q=raw.get(e.edgeId);
  if(!s||!l||!q||l.from!==e.from||l.to!==e.to||l.kind!==e.kind||q.from!==e.from||q.to!==e.to||q.kind!==e.kind||
   l.effective!==null||l.localityEffectConfirmed!==null||l.originalGenerationScreen!==e.generationScreen||!same(l.originalContextBlockers,e.contextBlockers)||
   e.effective!==null||e.selectionAuthority!==false||!Array.isArray(s.screenedPathIds)||!Array.isArray(e.contextBlockers)||
   !Array.isArray(e.sourcePressure)||!Array.isArray(e.targetPressure)||!['generate','control'].includes(e.kind))return empty('edge-binding');
  const subject=e.edgeId,effect=add(subject,'actual-action-effective','effect-hypothesis');
  let structural,expected;
  if(e.kind==='generate'){
   structural=add(subject,'existing-generation-screen-met','structural-hypothesis');
   const conditions=[
    ['source-basis-screen-met',s.directRoot.state===true||s.screenedPathIds.length>0,[ref('groundedSupply',s.id,'directRoot'),ref('groundedSupply',s.id,'screenedPathIds')]],
    ['context-blockers-empty',e.contextBlockers.length===0,[ref('localityContext',subject,'originalContextBlockers')]],
    ['source-pressure-screen-clear',clear(e.sourcePressure),[ref('groundedSupply',subject,'sourcePressure')]],
    ['target-pressure-screen-clear',clear(e.targetPressure),[ref('groundedSupply',subject,'targetPressure')]]
   ];
   const ps=conditions.map(([kind,value,refs])=>{const p=add(subject,kind,'observation');fact(p,value,refs);return p;});
   const source=ref('groundedSupply',subject,'generationScreen');
   rule(structural,'for',ps.map(p=>lit(p,'for')),source);
   for(const p of ps)rule(structural,'against',[lit(p,'against')],source);
   expected=!complete?'unresolved':conditions.every(c=>c[1])?'supported':'opposed';
   if(e.generationScreen!==(expected==='supported'?'grounded-generation-context-screen-met':'unresolved'))return empty('screen-parity');
  }else{
   const p=press.get(l.directPressureId);
   if(!p||p.controllerNodeId!==a.graphNodeId||p.targetNodeId!==b.graphNodeId||p.effective!==null||p.neutralizationConfirmed!==null||
    p.comparison?.original!==e.controlComparison)return empty('pressure-binding');
   structural=add(subject,'stable-source-profile-dominance','structural-hypothesis');
   const observation=add(subject,'stable-control-profile-contrast','observation');
   const rel=p.comparison?.sensitivity,reverse=rel==='left-evidence-dominates'?'right-evidence-dominates':'left-evidence-dominates';
   const expectedContrast=!complete?'partial':['left-evidence-dominates','right-evidence-dominates'].includes(rel)&&p.comparison.original===rel&&p.comparison.nonseason===rel&&p.comparison.seasonOnly!==reverse?
    rel==='left-evidence-dominates'?'controller-evidence-dominance-stable':'target-evidence-dominance-stable':'direction-not-stable';
   if(p.contrast!==expectedContrast)return empty('contrast-parity');
   const value=p.contrast==='controller-evidence-dominance-stable'?true:p.contrast==='target-evidence-dominance-stable'?false:null;
   fact(observation,value,[ref('pressureDependencyReview',p.id,'contrast'),ref('pressureDependencyReview',p.id,'comparison')]);
   for(const sign of ['for','against'])rule(structural,sign,[lit(observation,sign)],ref('pressureDependencyReview',p.id,'contrast'));
   expected=!complete||value===null?'unresolved':value?'supported':'opposed';
  }
  rows.push({edgeId:subject,from:e.from,to:e.to,kind:e.kind,structuralPropositionId:structural,effectPropositionId:effect,expectedStructuralState:expected,effective:null});
 }
 const result=evaluateArguments({scope:complete?'complete':'partial',propositions,evidence,rules});
 if(result.status!==status)return empty('argument-evaluation');
 const judgments=new Map(result.judgments.map(j=>[j.id,j]));
 if(rows.some(r=>judgments.get(r.structuralPropositionId)?.state!==r.expectedStructuralState||judgments.get(r.effectPropositionId)?.state!=='unresolved'))return empty('judgment-parity');
 return {...base,status,reason:null,propositions,evidence,rules,judgments:result.judgments,ruleResults:result.ruleResults,actions:rows,
  scope:'visible-literal-actions-only',excludedHiddenActionCount:actions.size-visible.length,
  limitations:['structural-opposition-not-ineffective-action','no-default-negation','no-conflict-precedence','no-effect-hypothesis-rules','hidden-and-group-effects-unassessed']};
}
