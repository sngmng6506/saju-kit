import {elementRelation} from '../../core/elements.js';
import {observeGroundedSupply} from './outcome-grounded-supply.js';
import {sourceSideScreen} from './outcome-generation-screen.js';
import {createSynthesisBuilder} from './outcome-synthesis-builder.js';
import {replaySynthesisProof,bindSynthesisProof,preservesSynthesisProofs} from './outcome-synthesis-proof.js';
import {evaluateArguments} from './outcome-argumentation.js';

export const GENERATION_SYNTHESIS_VERSION='p1-generation-synthesis-v1';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const index=(xs,f)=>Array.isArray(xs)&&xs.every(x=>x&&typeof x==='object')&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const eq=(a,b)=>a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
// Source availability, local context and recipient capacity are distinct.
// The existing screen is not a capacity or effective transfer model.
export function reviewGenerationSynthesis(prior,root,supply,argument,modeled,synthesis){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial',scope=complete?'complete':'partial';
 const base={version:GENERATION_SYNTHESIS_VERSION,completeHour:complete,selectionAuthority:false,effective:null};
 const empty=reason=>({...base,status:'invalid-evidence',reason,actions:[],propositions:[],evidence:[],rules:[],judgments:[],ruleResults:[],summary:null});
 if(typeof complete!=='boolean'||[root,supply,argument,modeled,synthesis].some(x=>!x||x.status!==status||x.completeHour!==complete||x.selectionAuthority!==false)||
  root.rootEffectConfirmed!==null||supply.effectiveSupply!==null||[argument,modeled,synthesis].some(x=>x.effective!==null))return empty('upstream');
 if(!same(observeGroundedSupply(prior,root),supply))return empty('supply-replay');
 const ag=replaySynthesisProof(argument,scope),mg=replaySynthesisProof(modeled,scope);
 if(!preservesSynthesisProofs(ag,mg))return empty('proof-replay');
 const actors=index(prior.stemForce?.occurrences,a=>a.id),edges=index(supply.actions,a=>a.edgeId),aa=index(argument.actions,a=>a.edgeId),
  ss=index(synthesis.actions,a=>a.edgeId),mm=index(modeled.actions,a=>a.edgeId);
 if([actors,edges,aa,ss,mm].some(x=>!x)||!eq([...aa.keys()],[...ss.keys()])||!eq([...aa.keys()],[...mm.keys()]))return empty('inventory');
 const visible=[...actors.values()].filter(a=>a.layer==='visible');
 const expected=visible.flatMap(a=>visible.filter(b=>a.id!==b.id&&elementRelation(a.element,b.element).direction==='left-to-right')
  .map(b=>({id:a.id+'>'+b.id,from:a.id,to:b.id,kind:elementRelation(a.element,b.element).type})));
 if(!eq([...aa.keys()],expected.map(a=>a.id))||expected.some(e=>{const a=aa.get(e.id);return a.kind!==e.kind||a.from!==e.from||a.to!==e.to;}))return empty('coverage');
 const props=[],facts=[],rules=[],rows=[];
 const build=createSynthesisBuilder({complete,policyId:GENERATION_SYNTHESIS_VERSION,policyOwner:'generation-synthesis-policy',props,facts,rules});
 for(const a of aa.values()){
  if(a.kind!=='generate')continue;
  const e=edges.get(a.edgeId),s=ss.get(a.edgeId),m=mm.get(a.edgeId);
  if(!e||[e,s,m].some(x=>x.kind!==a.kind||x.from!==a.from||x.to!==a.to)||e.effective!==null||e.selectionAuthority!==false||
   s.selectionAuthority!==false||s.effective!==null||s.actualReceptionState!=='unresolved'||s.actualBenefitState!=='unresolved'||m.actualEffectState!=='unresolved'||
   !bindSynthesisProof(ag,s.structural,'argumentReview','existing-generation-screen-met',a.edgeId)||
   !bindSynthesisProof(ag,s.actualEffect,'argumentReview','actual-action-effective',a.edgeId)||
   s.structural.propositionId!==a.structuralPropositionId||s.actualEffect.propositionId!==a.effectPropositionId||s.actualEffect.state!=='unresolved'||
   s.actualEffect.level!=='effect-hypothesis'||s.structural.level!=='structural-hypothesis')return empty('edge-proof');
  const structural=ag.judgments.get(a.structuralPropositionId);
  const screen=sourceSideScreen(argument,ag.judgments,e,structural,complete);
  if(!screen)return empty('generation-screen');
  const {observation,conjunction}=build(a.edgeId);
  const importScreen=(kind,id)=>observation(kind,ag.judgments.get(id).state,'argumentReview',id,'judgment');
  const [basis,context,sourcePressure]=screen.sourcePremiseIds.map((id,i)=>importScreen(['source-basis-observed','context-screen-clear','source-pressure-screen-clear'][i],id));
  const recipientPressure=importScreen('recipient-pressure-screen-clear',screen.targetPremiseId);
  const source=conjunction('source-context-screen-met',[basis,context,sourcePressure],[basis,context,sourcePressure]);
  const local=conjunction('generation-context-screen-met',[source,recipientPressure],[recipientPressure]);
  // No reviewed recipient-capacity predicate exists yet. Missing evidence
  // is represented by an explicit open proposition, not a false premise.
  const capacity=observation('recipient-capacity-model-supported','unresolved','generation-synthesis-policy',GENERATION_SYNTHESIS_VERSION,'unmodeled');
  const reception=conjunction('modeled-reception-hypothesis',[local,capacity],[capacity]);
  rows.push({edgeId:a.edgeId,from:a.from,to:a.to,sourceBasisPropositionId:basis,contextPropositionId:context,
   sourcePressurePropositionId:sourcePressure,recipientPressurePropositionId:recipientPressure,sourceContextPropositionId:source,
   localContextPropositionId:local,recipientCapacityPropositionId:capacity,receptionPropositionId:reception,
   originalEffectPropositionId:a.effectPropositionId,originalStructuralState:structural.state,sourceScreenState:screen.sourceScreenState,
   actualSupplyState:'unresolved',actualReceptionState:'unresolved',actualBenefitState:'unresolved',selectionAuthority:false,effective:null});
 }
 const r=evaluateArguments({scope,propositions:props,evidence:facts,rules});
 if(r.status!==status)return empty('argument-evaluation');
 const js=new Map(r.judgments.map(j=>[j.id,j.state]));
 const actions=rows.map(q=>({...q,sourceContextState:js.get(q.sourceContextPropositionId),localContextState:js.get(q.localContextPropositionId),
  recipientCapacityState:js.get(q.recipientCapacityPropositionId),receptionState:js.get(q.receptionPropositionId)}));
 if(actions.some(q=>(q.localContextState==='supported')!==(q.originalStructuralState==='supported')||
  (q.sourceContextState==='supported')!==(q.sourceScreenState==='supported')||q.recipientCapacityState!=='unresolved'||q.receptionState!=='unresolved'))return empty('screen-parity');
 const count=k=>actions.filter(a=>a[k]==='supported').length;
 return {...base,status,reason:null,actions,propositions:props,evidence:facts,rules,judgments:r.judgments,ruleResults:r.ruleResults,
  summary:{generations:actions.length,sourceContext:count('sourceContextState'),localContext:count('localContextState'),modeledReception:count('receptionState'),actualReceptionConfirmed:0},
  limitations:['structural-supply-not-throughput','recipient-pressure-screen-not-capacity','recipient-capacity-unmodeled','no-actual-effect-authority','no-selection-authority']};
}
