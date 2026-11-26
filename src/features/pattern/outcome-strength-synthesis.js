import {strengthGuardIds,strengthGuardPropositionId} from './outcome-strength-guard-contract.js';
import {compileIndependentSupply} from './outcome-independent-supply.js';
import {evaluateArguments} from './outcome-argumentation.js';
import {positiveProofFrontier} from './outcome-positive-frontier.js';
import {analyzeGuardedFrontier} from './outcome-guarded-frontier.js';
import {contextualStrengthAlternatives} from './outcome-contextual-strength.js';
export const STRENGTH_SYNTHESIS_VERSION='p3-strength-synthesis-v1';
const key=(...xs)=>JSON.stringify(xs);
const same=(a,b)=>key(a)===key(b);
const lit=(propositionId,sign='for')=>({propositionId,sign});
const semantic=strengthGuardIds.slice(0,3);
const demandGuard=strengthGuardIds[3];
const supplyGuard=strengthGuardIds[4];
export const SUPPLY_STRENGTH_VERSION='p3-strength-synthesis-supply-v3';
export const DEMAND_STRENGTH_VERSION='p3-strength-synthesis-demand-v2';
// Reuse the burden proof packet, not its verdicts. Actor-local projections
// of the source-inspired element policy are experimental, not replacements.
export function synthesizeContextualStrength({completeHour,nodes,targets,burden,policy='rooted-operation',scenarioRestrictions=[]}={}){
 const supply=policy==='indirect-support',demand=supply||policy==='literal-demand',version=supply?SUPPLY_STRENGTH_VERSION:demand?DEMAND_STRENGTH_VERSION:STRENGTH_SYNTHESIS_VERSION;
 const semanticIds=supply?[...semantic,demandGuard,supplyGuard]:demand?[...semantic,demandGuard]:semantic;
 const status=completeHour?'diagnostic':'partial';
 const base={version,completeHour,selectionAuthority:false,effective:null,actualStrengthState:'unresolved'};
 const empty=reason=>({...base,status:'invalid-evidence',reason,rows:[],summary:null});
 if(!['rooted-operation','literal-demand','indirect-support'].includes(policy)||typeof completeHour!=='boolean'||burden?.status!==status||burden.completeHour!==completeHour||burden.selectionAuthority!==false||burden.effective!==null||
  burden.actualMagnitudeComparison!=='unresolved'||!Array.isArray(nodes)||!Array.isArray(targets)||new Set(targets).size!==targets.length)return empty('upstream');
 if(!Array.isArray(scenarioRestrictions)||scenarioRestrictions.some(r=>!r||!targets.includes(r.targetId)||!semanticIds.includes(r.guard)||typeof r.value!=='boolean')||new Set(scenarioRestrictions.map(r=>key(r.targetId,r.guard))).size!==scenarioRestrictions.length)return empty('scenario-restriction-contract');
 try{
  const original=burden.packet,baseline=evaluateArguments(original);
  if(baseline.status!==status||!same(baseline.judgments,burden.judgments)||!same(baseline.ruleResults,burden.ruleResults)||original.evidence.length)return empty('proof-replay');
  const ns=new Map(nodes.map(n=>[n.id,n])),bs=new Map(burden.rows.map(r=>[r.targetId,r]));
  if(ns.size!==nodes.length||bs.size!==burden.rows.length||!same([...bs.keys()].sort(),[...targets].sort())||targets.some(t=>!ns.has(t)))return empty('target-coverage');
  const evidence=[...original.evidence],propositions=[...original.propositions],rules=[...original.rules],props=new Map(propositions.map(p=>[p.id,p]));
  const add=(id,subject,kind,level)=>{if(props.has(id))throw Error('duplicate-proposition');const p={id,subject,kind,level};props.set(id,p);propositions.push(p);return id;};
  const rule=(id,out,sign,premises,field)=>rules.push({id,policyId:version,conclusion:lit(out,sign),premises,refs:[{owner:'contextual-strength-synthesis',id,field}],applicability:'complete-only'});
  const manifests=[];
  const actions=new Map();
  if(demand){
   if(!Array.isArray(burden.actionRows))return empty('action-inventory');
   for(const a of burden.actionRows){
    if(!a||!['generate','control'].includes(a.kind)||!ns.has(a.from)||!ns.has(a.to)||a.from===a.to||a.id!==key(a.kind,a.from,a.to)||actions.has(a.id)||a.actualOperationState!=='unresolved')return empty('action-binding');
    const r=original.rules.find(r=>r.id===key('action-rule',a.id));
    if(a.propositionId!==key('root-seeded-action',a.id)||r?.conclusion.propositionId!==a.propositionId||r.conclusion.sign!=='for'||!same(r.premises,[lit(key('replenishment-basis',a.from)),lit(a.operationVariableId)]))return empty('action-proof-binding');
    const observed=add(key('literal-action-observed',a.id),a.id,'literal-action-exposure','observation');
    evidence.push({id:key('literal-action-fact',a.id),...lit(observed),refs:[{owner:'burden-action-inventory',id:a.id,field:'literal-relation'}],applicability:'complete-only'});
    actions.set(a.id,{...a,observed});
   }
   if(original.rules.filter(r=>r.id.startsWith('["action-rule",')).length!==actions.size)return empty('action-coverage');
  }
  for(const t of targets){
   const n=ns.get(t),b=bs.get(t),direct=add(key('direct-root-basis',t),t,'hypothetical-direct-root-access-basis','structural-hypothesis');
   if(!Array.isArray(n.rootIds)||new Set(n.rootIds).size!==n.rootIds.length||b.actualMagnitudeComparison!=='unresolved'||b.actualStrengthState!=='unresolved'||b.supportPropositionId!==key('replenishment-basis',t)||props.get(b.supportPropositionId)?.level!=='structural-hypothesis')return empty('basis-binding');
   const seeds=original.rules.filter(r=>r.conclusion.propositionId===b.supportPropositionId&&r.id.startsWith('["root-seed",'));
   if(seeds.length!==n.rootIds.length)return empty('seed-coverage');
   for(const slot of n.rootIds){
    const s=seeds.find(r=>r.id===key('root-seed',t,slot));
    if(!s||!same(s.premises,[lit(key('slot-retained',slot)),lit(key('root-access',t,slot))]))return empty('seed-binding');
    rule(key('direct-seed',t,slot),direct,'for',s.premises,'exact-replenishment-seed');
   }
   const groups=new Map(b.groups.map(g=>[g.kind,g]));
   if(groups.size!==3||b.groups.length!==3||['incoming-control','outgoing-generation','outgoing-control'].some(k=>groups.get(k)?.propositionId!==key('burden-basis',t,k)||props.get(key('burden-basis',t,k))?.level!=='structural-hypothesis'))return empty('burden-binding');
   const m={targetId:t,direct,support:b.supportPropositionId,control:groups.get('incoming-control').propositionId,drain:groups.get('outgoing-generation').propositionId,expenditure:groups.get('outgoing-control').propositionId};
   if(demand){
    const exposure={};
    for(const kind of ['incoming-control','outgoing-generation','outgoing-control']){
     const group=groups.get(kind);
     const members=[...actions.values()].filter(a=>kind==='incoming-control'?a.kind==='control'&&a.to===t:a.from===t&&a.kind===(kind==='outgoing-generation'?'generate':'control'));
     if(!Array.isArray(group.actionIds)||!same([...group.actionIds].sort(),members.map(a=>a.id).sort()))return empty('exposure-coverage');
     const id=add(key('literal-demand-basis',t,kind),t,'literal-demand-exposure-basis','structural-hypothesis');
     for(const a of members)rule(key('exposure-rule',t,kind,a.id),id,'for',[lit(a.observed)],'literal-action-exposure-not-operation');
     exposure[kind]=id;
    }
    m.exposure=exposure;
   }
   if(supply){
    const q=compileIndependentSupply({packet:original,nodes,targetId:t});
    if(q.status!=='diagnostic')return empty('indirect-'+q.reason);
    for(const p of q.propositions)add(p.id,p.subject,p.kind,p.level);
    rules.push(...q.rules);
    m.indirectSupport={propositionId:q.propositionId,seedIds:q.seedIds,linkIds:q.linkIds,actualReplenishmentState:'unresolved'};
   }
   manifests.push(m);
  }
  const positivePacket={...original,evidence,propositions:[...propositions],rules:[...rules]};
  const frontier=positiveProofFrontier(positivePacket);
  if(!['diagnostic','partial','unavailable'].includes(frontier.status))return empty('positive-frontier');
  const rows=[];
  for(const m of manifests){
   const t=m.targetId,guards=semanticIds.map(k=>add(strengthGuardPropositionId(t,k),t,k,'observation')),guard=new Map(semanticIds.map((k,i)=>[k,guards[i]]));
   const controlBasis=demand?m.exposure['incoming-control']:m.control,drainBasis=demand?m.exposure['outgoing-generation']:m.drain;
   const basisByKind=new Map([['substantial-root-basis',m.direct],['controller-basis',controlBasis],['output-basis',drainBasis]]);
   const bases=[m.direct,controlBasis,drainBasis];
   if(demand){basisByKind.set('wealth-demand-basis',m.exposure['outgoing-control']);bases.push(m.exposure['outgoing-control']);}
   if(supply){basisByKind.set('indirect-support-basis',m.indirectSupport.propositionId);bases.push(m.indirectSupport.propositionId);}
   const requirements=semanticIds.map((k,i)=>({guard:guards[i],basis:bases[i]}));
   const strong=add(key('conditional-strength',t,'strong'),t,'source-inspired-actor-strength','structural-hypothesis'),weak=add(key('conditional-strength',t,'weak'),t,'source-inspired-actor-weakness','structural-hypothesis');
   const terminal=[];
   const alternatives=contextualStrengthAlternatives();
   if(demand){
    for(const d of alternatives)if(d.target==='strong')d.requires.push(lit(demandGuard,'against'));
    alternatives.push({id:'wealth-demand-weakness',target:'weak',requires:[lit('visible'),lit('wealth-demand-basis'),lit(demandGuard)],source:'https://www.donglishuzhai.net/chapter/3746.html'});
   }
   if(supply)alternatives.push({id:'indirect-support-strength',target:'strong',requires:[lit('visible'),lit('indirect-support-basis'),lit(supplyGuard),lit('control-exceeds-support','against'),lit('drain-exceeds-support','against'),lit(demandGuard,'against')],source:'https://changxianyi.com/guji/ziping/wz-20260914/chapter-007/'});
   for(const d of alternatives){
    const bs=d.requires.filter(p=>basisByKind.has(p.propositionId));
    const gs=d.requires.filter(p=>guard.has(p.propositionId));
    if(bs.length!==1||bs[0].sign!=='for'||d.requires.filter(p=>p.propositionId==='visible'&&p.sign==='for').length!==1||bs.length+gs.length+1!==d.requires.length)return empty('policy-mapping');
    const basis=basisByKind.get(bs[0].propositionId),conditions=gs.map(p=>({id:guard.get(p.propositionId),value:p.sign==='for'}));
    for(const sign of ['for','against']){
     const out=(d.target==='strong')===(sign==='for')?strong:weak;
     rule(key('strength-terminal',t,d.id,sign),out,sign,[lit(basis),...conditions.map(g=>lit(g.id,g.value?'for':'against'))],d.source);
     terminal.push({target:out,sign,basis,guards:conditions});
    }
   }
   const fixedGuards=scenarioRestrictions.filter(r=>r.targetId===t).map(r=>({id:guard.get(r.guard),value:r.value}));
   const analysis=frontier.status==='diagnostic'?analyzeGuardedFrontier({frontiers:frontier.frontiers,guards,requirements,targets:[strong,weak],rules:terminal,fixedGuards}):{status:frontier.status,reason:frontier.reason,targets:[]};
   if(!['diagnostic','partial','unavailable'].includes(analysis.status))return empty('guarded-frontier');
   rows.push({...m,strongPropositionId:strong,weakPropositionId:weak,guardIds:guards,requirements,terminal,analysis,...(fixedGuards.length?{scenarioRestrictions:fixedGuards,scenarioFeasible:analysis.status==='diagnostic'?analysis.targets.every(t=>t.possibleStates.length>0):null}:{}),actualStrengthState:'unresolved'});
  }
  const packet={...original,evidence,propositions,rules},result=evaluateArguments(packet);
  if(result.status!==status||!same(result.judgments.slice(0,baseline.judgments.length),baseline.judgments)||!same(result.ruleResults.slice(0,baseline.ruleResults.length),baseline.ruleResults))return empty('original-proof-parity');
  const fixed=new Set(evidence.map(e=>e.propositionId));
  const originalJudgments=new Map(result.judgments.map(j=>[j.id,j]));
  for(const r of rows){
   if([r.strongPropositionId,r.weakPropositionId,...r.guardIds].some(id=>originalJudgments.get(id)?.state!=='unresolved'))return empty('authority');
   // Replay every witness against the exact combined proof packet; all
   // nonlisted observation signs are false in the local counterfactual.
   for(const t of r.analysis.targets)for(const [state,witness] of Object.entries(t.witnesses)){
    if(witness===null)continue;
    const truth=new Set(witness);
    const hypothetical=propositions.filter(p=>p.level==='observation'&&!fixed.has(p.id)).map((p,i)=>({id:key('strength-witness',i),propositionId:p.id,sign:truth.has(p.id)?'for':'against',refs:[{owner:'strength-synthesis-witness',id:p.id,field:'hypothetical'}],applicability:'complete-only'}));
    const replay=evaluateArguments({...packet,evidence:[...evidence,...hypothetical]}),js=new Map(replay.judgments.map(j=>[j.id,j.state]));
    if(replay.status!=='diagnostic'||js.get(t.id)!==state||(r.scenarioRestrictions??[]).some(g=>truth.has(g.id)!==g.value)||r.requirements.some(q=>truth.has(q.guard)&&js.get(q.basis)!=='supported'))return empty('witness-replay');
   }
  }
  return {...base,status,reason:null,...(scenarioRestrictions.length?{scenarioRestrictionAuthority:'hypothetical-only'}:{}),packet,judgments:result.judgments,ruleResults:result.ruleResults,rows,
   summary:{targets:rows.length,analysisStatus:rows.every(r=>r.analysis.status==='diagnostic')&&completeHour?'diagnostic':completeHour?'unavailable':'partial',actualEffectsConfirmed:0},
   limitations:['actor-local-projection-not-element-strength','root-seeded-action-not-actual-burden',...(demand?['literal-exposure-not-operation','wealth-demand-guard-unreviewed','alternative-research-policy-not-runtime-default']:[]),'guard-truth-requires-modeled-basis-only',...(supply?['recipient-excluded-origin-not-independent-physical-capacity','indirect-support-sufficiency-unreviewed']:[]),'no-magnitude-comparison','local-state-possibility-not-chart-wide-joint-feasibility','no-selection-authority']};
 }catch(e){return empty(e instanceof Error?e.message:'invalid-reference');}
}
