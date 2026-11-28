import {auditRootIndependentOperation} from './pattern-root-independent-operation.mjs';
import {evaluateArguments} from '../../src/features/pattern/outcome-argumentation.js';
const key=(...xs)=>JSON.stringify(xs),lit=(propositionId,sign='for')=>({propositionId,sign});
const VERSION='p3-action-purpose-v1',DAY='day:stem';
const AXES=['temperature','moisture'],DIRECTIONS=['increase','decrease'];
const base={version:VERSION,selectionAuthority:false,effective:null,actualBalanceState:'unresolved',actualClimateState:'unresolved',actualSufficiencyState:'unresolved'};
const empty=(status,reason)=>({...base,status,reason,balance:[],climate:[],needs:[],judgments:[],summary:null});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// Research-only projections. Direction, magnitude and normative usefulness
// are different claims. No observation of an elemental relation establishes
// a climatic direction or a need; explicit scenario observations are required.
export function auditActionPurpose(input,{assumptions=[]}={}){
 const upstream=auditRootIndependentOperation(input,{includeProofPacket:true});
 if(upstream.status!=='diagnostic')return empty(upstream.status,upstream.reason);
 try{
  const original=upstream.proofPacket;
  if(!original||original.scope!=='complete'||original.evidence.length)return empty('invalid-evidence','upstream-packet');
  const propositions=[...original.propositions],rules=[...original.rules],ids=new Set(propositions.map(p=>p.id));
  const add=(parts,subject,kind,level='structural-hypothesis')=>{
   const id=key(...parts);if(ids.has(id))throw Error('duplicate-proposition');
   ids.add(id);propositions.push({id,subject,kind,level});return id;
  };
  const rule=(parts,out,premises,sign='for')=>{
   const id=key(...parts);
   rules.push({id,policyId:VERSION,conclusion:lit(out,sign),premises,refs:[{owner:VERSION,id,field:'conditional-only'}],applicability:'complete-only'});
  };
  const gate=(purpose,id)=>add(['purpose-condition',purpose,id],id,'hypothetical-purpose-condition','observation');
  const conditional=(id,prerequisites,guard)=>{
   rule(['purpose-support',id],id,[...prerequisites,lit(guard)]);
   // Explicit denial is not inference of the opposite physical direction.
   rule(['purpose-opposition',id],id,[...prerequisites,lit(guard,'against')],'against');
  };
  const needs=AXES.map(axis=>({axis,observationId:add(['climate-need',axis],axis,'hypothetical-climate-need-increase','observation')}));
  const balance=[],climate=[];
  const nodes=new Map(input.nodes.map(n=>[n.id,n]));
  if(!nodes.has(DAY)||!input.targets.includes(DAY))throw Error('day-reference');
  // Scope: the exact generation/control actions in the upstream audit.
  // Peer assistance and multi-hop protection remain separate future models.
  for(const a of upstream.actions){
   if(!nodes.has(a.from)||!nodes.has(a.to)||!ids.has(a.alternativePropositionId))throw Error('action-binding');
   const prerequisite=lit(a.alternativePropositionId);
   const role=a.to===DAY?(a.kind==='generate'?'replenishment':'received-control'):a.from===DAY?(a.kind==='generate'?'output-demand':'control-demand'):null;
   if(role){
    const conditionId=gate('balance',a.actionId);
    const propositionId=add(['balance-effect-candidate',a.actionId,role],a.actionId,'conditional-balance-direction');
    // Incoming generation requires a rooted action or exact independent
    // received transfer, not independent operation ability alone.
    const bases=role==='replenishment'?[lit(a.rootedPropositionId),...upstream.transfers.filter(t=>t.kind==='generate'&&t.from===a.from&&t.to===a.to&&t.operationVariableId===a.operationVariableId).map(t=>lit(t.propositionId))]:[prerequisite];
    if(!bases.length)throw Error('balance-basis');
    for(const b of bases){
     rule(['balance-support',propositionId,b.propositionId],propositionId,[b,lit(conditionId)]);
     rule(['balance-opposition',propositionId,b.propositionId],propositionId,[b,lit(conditionId,'against')],'against');
    }
    balance.push({actionId:a.actionId,role,from:a.from,to:a.to,conditionId,propositionId,basisIds:bases.map(b=>b.propositionId),actualEffect:null});
   }
   // Climatic action hypotheses are not restricted to day-directed edges.
   // Both signs are admitted as independent candidates; neither element
   // labels nor balance role determine the climatic direction.
   for(const {axis,observationId:needId} of needs)for(const direction of DIRECTIONS){
    const conditionId=gate('climate:'+axis+':'+direction,a.actionId);
    const propositionId=add(['climate-direction-candidate',a.actionId,axis,direction],a.actionId,'conditional-climate-direction');
    conditional(propositionId,[prerequisite],conditionId);
    const alignmentId=add(['climate-need-alignment',a.actionId,axis,direction],a.actionId,'conditional-climate-need-alignment');
    const matching=direction==='increase'?'for':'against',opposing=matching==='for'?'against':'for';
    rule(['climate-alignment-support',alignmentId],alignmentId,[lit(propositionId),lit(needId,matching)]);
    rule(['climate-alignment-opposition',alignmentId],alignmentId,[lit(propositionId),lit(needId,opposing)],'against');
    climate.push({actionId:a.actionId,axis,direction,conditionId,needId,propositionId,alignmentId,actualEffect:null});
   }
  }
  const packet={...original,propositions,rules};
  const replay=evaluateArguments(packet),before=evaluateArguments(original);
  if(replay.status!=='diagnostic'||before.status!=='diagnostic'||!same(replay.judgments.slice(0,before.judgments.length),before.judgments)||!same(replay.ruleResults.slice(0,before.ruleResults.length),before.ruleResults))throw Error('proof-parity');
  const allowed=new Set(propositions.filter(p=>p.level==='observation').map(p=>p.id));
  if(!Array.isArray(assumptions)||assumptions.some(a=>!a||!allowed.has(a.propositionId)||!['for','against'].includes(a.sign))||new Set(assumptions.map(a=>key(a.propositionId,a.sign))).size!==assumptions.length)throw Error('scenario-observation-contract');
  const evidence=assumptions.map((a,i)=>({...lit(a.propositionId,a.sign),id:key('purpose-scenario',i),refs:[{owner:VERSION,id:a.propositionId,field:'hypothetical'}],applicability:'complete-only'}));
  const result=evaluateArguments({...packet,evidence}),upstreamScenario=evaluateArguments({...original,evidence:evidence.filter(e=>original.propositions.some(p=>p.id===e.propositionId))});
  if(result.status!=='diagnostic'||upstreamScenario.status!=='diagnostic'||!same(result.judgments.slice(0,upstreamScenario.judgments.length),upstreamScenario.judgments)||!same(result.ruleResults.slice(0,upstreamScenario.ruleResults.length),upstreamScenario.ruleResults))throw Error('scenario-parity');
  const judgments=result.judgments.slice(original.propositions.length);
  const states=new Map(judgments.map(j=>[j.id,j.state]));
  return {...base,status:'diagnostic',reason:null,balance:balance.map(b=>({...b,state:states.get(b.propositionId)})),climate:climate.map(c=>({...c,state:states.get(c.propositionId),alignmentState:states.get(c.alignmentId)})),needs,judgments,summary:{actions:upstream.actions.length,balanceCandidates:balance.length,climateCandidates:climate.length,actualEffectsConfirmed:0},limitations:['hypothetical-purpose-conditions-only','climate-need-signs-are-increase-or-decrease-not-absence','no-peer-or-multi-hop-purpose-projection','no-seasonal-validity-or-sufficiency','no-production-authority']};
 }catch(e){return empty('invalid-evidence',String(e?.message??e));}
}
