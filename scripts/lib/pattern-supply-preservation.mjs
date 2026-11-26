import {compileIndependentSupply} from '../../src/features/pattern/outcome-independent-supply.js';
import {compileReplenishmentNetwork} from '../../src/features/pattern/outcome-replenishment-network.js';
import {evaluateArguments} from '../../src/features/pattern/outcome-argumentation.js';
import {queryPositiveProofConstraints} from '../../src/features/pattern/outcome-frontier-constraints.js';
import {auditResidualPressure} from './pattern-residual-pressure.mjs';
const key=(...xs)=>JSON.stringify(xs),same=(a,b)=>key(a)===key(b),lit=propositionId=>({propositionId,sign:'for'});
const VERSION='p3-supply-preservation-v1';
// An explicit cut is an intervention, not a prediction of actual loss.
// Clone only derived reachability propositions; share every observation
// with the original network. No new root, access or operation variable.
export function querySupplyCut({completeHour,nodes,links,targets,packet,targetId,removedLinkIds,required=[],excluded=[]}={}){
 const empty=(status,reason)=>({status,reason,queries:[],selectionAuthority:false,effective:null,actualSupplyState:'unresolved'});
 try{
  const c=compileReplenishmentNetwork({completeHour,nodes,links,targets});
  if(!['diagnostic','partial'].includes(c.status)||!targets.includes(targetId)||!Array.isArray(removedLinkIds)||!removedLinkIds.length||new Set(removedLinkIds).size!==removedLinkIds.length||removedLinkIds.some(id=>!links.some(l=>l.id===id)))return empty('invalid-evidence','cut-contract');
  const baseline=evaluateArguments(packet);
  if(baseline.status!==c.status||packet.evidence.length||!same(packet.propositions.slice(0,c.packet.propositions.length),c.packet.propositions)||!same(packet.rules.slice(0,c.packet.rules.length),c.packet.rules))return empty('invalid-evidence','network-proof-binding');
  const basisIds=new Set(c.packet.propositions.filter(p=>p.level==='structural-hypothesis').map(p=>p.id));
  if(packet.rules.slice(c.packet.rules.length).some(r=>basisIds.has(r.conclusion.propositionId)))return empty('invalid-evidence','unexpected-network-rule');
  if(!completeHour)return empty('partial','missing-hour');
  const remaining=links.filter(l=>!removedLinkIds.includes(l.id));
  const cut=compileReplenishmentNetwork({completeHour,nodes,links:remaining,targets});
  if(cut.status!=='diagnostic')return empty('invalid-evidence','cut-network');
  const project=id=>basisIds.has(id)?key('cut-basis',id):id;
  const propositions=[...packet.propositions,...cut.packet.propositions.filter(p=>p.level==='structural-hypothesis').map(p=>({...p,id:project(p.id),kind:'counterfactual-link-cut-basis'}))];
  const rules=[...packet.rules,...cut.packet.rules.map(r=>({...r,id:key('cut-rule',r.id),conclusion:lit(project(r.conclusion.propositionId)),premises:r.premises.map(p=>lit(project(p.propositionId)))}))];
  const original=key('replenishment-basis',targetId),survival=project(original);
  const direct=key('cut-direct-root',targetId),incoming=key('cut-incoming-basis',targetId);
  propositions.push({id:direct,subject:targetId,kind:'counterfactual-direct-root-basis',level:'structural-hypothesis'},{id:incoming,subject:targetId,kind:'counterfactual-incoming-basis',level:'structural-hypothesis'});
  const add=(id,out,premises)=>rules.push({id,policyId:VERSION,conclusion:lit(out),premises,refs:[{owner:'supply-cut',id,field:'counterfactual-only'}],applicability:'complete-only'});
  for(const r of cut.packet.rules.filter(r=>r.conclusion.propositionId===original)){
   if(r.id.startsWith('["root-seed",'))add(key('cut-direct-rule',r.id),direct,r.premises);
   else if(r.id.startsWith('["supply-link",'))add(key('cut-incoming-rule',r.id),incoming,r.premises.map(p=>lit(project(p.propositionId))));
  }
  const independent=compileIndependentSupply({packet:cut.packet,nodes,targetId});
  if(independent.status!=='diagnostic')return empty('invalid-evidence','independent-cut:'+independent.reason);
  const independentIds=new Set(independent.propositions.map(p=>p.id));
  const projectIndependent=id=>independentIds.has(id)?key('cut-independent',id):id;
  propositions.push(...independent.propositions.map(p=>({...p,id:projectIndependent(p.id)})));
  rules.push(...independent.rules.map(r=>({...r,id:key('cut-independent-rule',r.id),conclusion:lit(projectIndependent(r.conclusion.propositionId)),premises:r.premises.map(p=>lit(projectIndependent(p.propositionId)))})));
  const external=projectIndependent(independent.propositionId);
  const combined={...packet,propositions,rules},result=evaluateArguments(combined);
  if(result.status!==baseline.status||!same(result.judgments.slice(0,baseline.judgments.length),baseline.judgments)||!same(result.ruleResults.slice(0,baseline.ruleResults.length),baseline.ruleResults))return empty('invalid-evidence','proof-parity');
  if(!Array.isArray(required)||!Array.isArray(excluded)||required.some(id=>!packet.propositions.some(p=>p.id===id&&p.level==='structural-hypothesis'))||excluded.some(id=>!packet.propositions.some(p=>p.id===id&&p.level==='structural-hypothesis')))return empty('invalid-evidence','condition-contract');
  const query=(id,r=[],e=[])=>({id,required:[...new Set([...required,...r])],excluded:[...new Set([...excluded,...e])],fixed:[]});
  const queries=[query('condition'),query('pre-cut-basis',[original]),query('basis-survives',[original,survival]),query('basis-lost',[original],[survival]),query('incoming-survives',[original,incoming]),query('direct-without-incoming',[original,direct],[incoming]),query('independent-origin-survives',[original,external]),query('impossible-independent-without-incoming',[external],[incoming]),query('impossible-new-basis',[survival],[original])];
  const q=queryPositiveProofConstraints(combined,queries);
  if(q.status!=='diagnostic')return empty(q.status,q.reason);
  const by=new Map(q.queries.map(r=>[r.id,r]));
  if(by.get('impossible-new-basis').feasible||by.get('impossible-independent-without-incoming').feasible||by.get('pre-cut-basis').feasible!==(by.get('basis-survives').feasible||by.get('basis-lost').feasible))return empty('invalid-evidence','cut-monotonicity');
  return {...empty('diagnostic',null),targetId,removedLinkIds:[...removedLinkIds],queries:queries.map((query,i)=>({...query,...q.queries[i]})),condition:{required:[...required],excluded:[...excluded]},
   originalPropositionId:original,survivalPropositionId:survival,directPropositionId:direct,incomingPropositionId:incoming,independentOriginPropositionId:external};
 }catch(e){return empty('invalid-evidence',String(e?.message??e));}
}
// Match only resource-interference pressures with the exact generation
// action and network link. Assume complete interruption of selected
// links for a stress test; uncovered does NOT entail interruption.
export function auditSupplyPreservation(input){
 const base={version:VERSION,selectionAuthority:false,effective:null,actualSupplyState:'unresolved',actualStrengthState:'unresolved',actualMagnitudeComparison:'unresolved'};
 const empty=(status,reason)=>({...base,status,reason,rows:[],summary:null});
 const source=auditResidualPressure(input,{includeProof:true});
 if(source.status!=='diagnostic')return empty(source.status,source.reason);
 try{
  const {completeHour,nodes,links,targets,burden}=input,packet=source.proof.packet,targetId='day:stem';
  const c=compileReplenishmentNetwork({completeHour,nodes,links,targets});
  if(c.status!=='diagnostic'||!same(burden.packet.propositions.slice(0,c.packet.propositions.length),c.packet.propositions)||!same(burden.packet.rules.slice(0,c.packet.rules.length),c.packet.rules))return empty('invalid-evidence','network-inventory');
  const actions=new Map(burden.actionRows.map(a=>[a.id,a])),byLink=new Map(),candidates=[];
  for(const p of source.rows.filter(r=>r.kind==='resource-interference')){
   const a=actions.get(p.protectedSupplyActionId),l=links.find(l=>l.id===a?.sharedSupplyLinkId);
   if(!a||!l||a.kind!=='generate'||a.to!==targetId||l.kind!=='generate'||l.from!==a.from||l.to!==a.to||a.operationVariableId!==key('supply-operation',l.id)||!p.basis.includes(a.propositionId))return empty('invalid-evidence','protected-link-binding');
   if(!byLink.has(l.id))byLink.set(l.id,[]);
   byLink.get(l.id).push(p);candidates.push({p,l});
  }
  const scenarios=candidates.map(({p,l})=>({id:key('single-pressure',p.id),kind:'single-pressure',links:[l.id],pressures:[p]}));
  for(const [link,ps] of byLink)if(ps.length>1)scenarios.push({id:key('all-on-link',link),kind:'all-on-link',links:[link],pressures:ps});
  if(byLink.size>1)scenarios.push({id:'all-exposed-links',kind:'all-exposed-links',links:[...byLink.keys()],pressures:candidates.map(x=>x.p)});
  if(scenarios.length>64)return empty('unavailable','scenario-budget');
  const rows=[];
  for(const s of scenarios){
   const q=querySupplyCut({completeHour,nodes,links,targets,packet,targetId,removedLinkIds:s.links,required:s.pressures.map(p=>p.pressure),excluded:s.pressures.map(p=>p.fullRelief)});
   if(q.status!=='diagnostic')return empty(q.status,q.reason);
   const feasible=id=>q.queries.find(r=>r.id===id).feasible;
   rows.push({id:s.id,kind:s.kind,pressureIds:s.pressures.map(p=>p.id),...q,conditionPossible:feasible('condition'),survivalPossible:feasible('basis-survives'),lossPossible:feasible('basis-lost'),incomingAlternativePossible:feasible('incoming-survives'),independentOriginPossible:feasible('independent-origin-survives'),directWithoutIncomingPossible:feasible('direct-without-incoming'),interruptionAssumed:true});
  }
  return {...base,status:'diagnostic',reason:null,rows,summary:{exposedLinks:byLink.size,pressures:candidates.length,scenarios:rows.length,conditionPossible:rows.filter(r=>r.conditionPossible).length,survivalPossible:rows.filter(r=>r.survivalPossible).length,lossPossible:rows.filter(r=>r.lossPossible).length,bothPossible:rows.filter(r=>r.survivalPossible&&r.lossPossible).length,incomingAlternativePossible:rows.filter(r=>r.incomingAlternativePossible).length,independentOriginPossible:rows.filter(r=>r.independentOriginPossible).length,actualEffectsConfirmed:0},
   limitations:['complete-link-interruption-stress-test-not-inferred-damage','selected-uncovered-pressures-not-proof-of-loss','remaining-links-not-confirmed-safe','incoming-path-may-reuse-recipient-root','independent-origin-not-independent-physical-capacity','rooted-reachability-not-capacity','local-scope-only','no-strength-authority']};
 }catch(e){return empty('invalid-evidence',String(e?.message??e));}
}
