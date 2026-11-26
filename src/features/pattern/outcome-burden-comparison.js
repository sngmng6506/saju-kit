import {compileReplenishmentNetwork} from './outcome-replenishment-network.js';
import {positiveProofFrontier,comparePositiveFrontiers} from './outcome-positive-frontier.js';
import {evaluateArguments} from './outcome-argumentation.js';
export const BURDEN_COMPARISON_VERSION='p3-burden-comparison-v1';
const key=(...xs)=>JSON.stringify(xs);
const basis=id=>key('replenishment-basis',id);
const lit=propositionId=>({propositionId,sign:'for'});
const categories=['incoming-control','outgoing-generation','outgoing-control'];
const valid=x=>typeof x==='string'&&x.length>0;
const same=(a,b)=>key(a)===key(b);
// Extend exactly the replenishment packet. Each physical directed action
// has one operation variable, including generation already in that packet.
export function compareReplenishmentBurden({completeHour,nodes,links,targets,actions,replenishmentPacket}={}){
 const base={version:BURDEN_COMPARISON_VERSION,completeHour,selectionAuthority:false,effective:null,actualMagnitudeComparison:'unresolved'};
 const empty=reason=>({...base,status:'invalid-evidence',reason,rows:[]});
 const c=compileReplenishmentNetwork({completeHour,nodes,links,targets});
 if(c.status==='invalid-evidence'||!same(c.packet,replenishmentPacket))return empty('replenishment-packet');
 const ns=new Set(nodes.map(n=>n.id)),ts=new Set(targets);
 const gen=new Map(links.filter(l=>l.kind==='generate').map(l=>[key(l.from,l.to),l]));
 if(!Array.isArray(actions)||actions.some(a=>!a||!ns.has(a.from)||!ns.has(a.to)||a.from===a.to||!['control','generate'].includes(a.kind)||!ts.has(a.from)&&!ts.has(a.to)||
  a.id!==key(a.kind,a.from,a.to)||a.actualOperationState!=='unresolved')||new Set(actions.map(a=>a.id)).size!==actions.length)return empty('action-inventory');
 if(actions.filter(a=>a.kind==='generate'&&ts.has(a.to)).length!==gen.size||
  actions.some(a=>a.kind==='generate'&&ts.has(a.to)&&!gen.has(key(a.from,a.to))))return empty('generation-coverage');
 const propositions=[...c.packet.propositions],rules=[...c.packet.rules],ids=new Set(propositions.map(p=>p.id));
 const observe=(id,subject)=>{if(!ids.has(id)){ids.add(id);propositions.push({id,subject,kind:'hypothetical-burden-operation',level:'observation'});}return id;};
 const derive=(id,subject,kind)=>{if(ids.has(id))throw Error('duplicate-proposition');ids.add(id);propositions.push({id,subject,kind,level:'structural-hypothesis'});return id;};
 const rule=(id,out,premises,reference)=>rules.push({id,policyId:BURDEN_COMPARISON_VERSION,conclusion:lit(out),premises:premises.map(lit),refs:[{owner:'burden-comparison-policy',id:reference,field:'hypothetical-basis'}],applicability:'complete-only'});
 const actionRows=actions.map(a=>{
  const link=a.kind==='generate'?gen.get(key(a.from,a.to)):null;
  const op=observe(key('supply-operation',link?.id??a.id),a.id);
  const id=derive(key('root-seeded-action',a.id),a.id,'hypothetical-root-seeded-action');
  rule(key('action-rule',a.id),id,[basis(a.from),op],a.id);
  return {...a,operationVariableId:op,propositionId:id,sharedSupplyLinkId:link?.id??null};
 });
 const manifests=targets.map(targetId=>{
  const groups=categories.map(kind=>{
   const id=derive(key('burden-basis',targetId,kind),targetId,'hypothetical-burden-basis');
   const members=actionRows.filter(a=>kind==='incoming-control'?a.kind==='control'&&a.to===targetId:
    a.from===targetId&&a.kind===(kind==='outgoing-generation'?'generate':'control'));
   for(const a of members)rule(key('burden-rule',id,a.id),id,[a.propositionId],a.id);
   return {kind,propositionId:id,actionIds:members.map(a=>a.id)};
  });
  return {targetId,supportPropositionId:basis(targetId),groups};
 });
 const packet={...c.packet,propositions,rules},result=evaluateArguments(packet);
 if(result.status!==c.status||!same(result.judgments.slice(0,c.judgments.length),c.judgments)||!same(result.ruleResults.slice(0,c.ruleResults.length),c.ruleResults))return empty('proof-parity');
 const frontier=positiveProofFrontier(packet);
 if(!['diagnostic','partial','unavailable'].includes(frontier.status))return empty('frontier');
 const byId=new Map(frontier.frontiers.map(f=>[f.id,f.terms]));
 const rows=manifests.map(m=>({...m,groups:m.groups.map(g=>({...g,comparison:frontier.status==='diagnostic'?comparePositiveFrontiers(byId.get(m.supportPropositionId),byId.get(g.propositionId)):null})),actualStrengthState:'unresolved',actualMagnitudeComparison:'unresolved'}));
 return {...base,status:c.status,reason:null,packet,judgments:result.judgments,ruleResults:result.ruleResults,actionRows,rows,frontier,
  summary:{targets:rows.length,actions:actionRows.length,analysisStatus:frontier.status,actualEffectsConfirmed:0},
  limitations:['positive-hypotheses-only','logical-implication-not-magnitude','outgoing-action-basis-requires-source-basis','not-physical-feasibility','no-capacity-allocation','no-strength-authority']};
}
