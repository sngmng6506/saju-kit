import {elementRelation} from '../../src/core/elements.js';
import {compileReplenishmentNetwork} from '../../src/features/pattern/outcome-replenishment-network.js';
import {compareReplenishmentBurden} from '../../src/features/pattern/outcome-burden-comparison.js';
import {evaluateArguments} from '../../src/features/pattern/outcome-argumentation.js';
const key=(...xs)=>JSON.stringify(xs),same=(a,b)=>key(a)===key(b),lit=propositionId=>({propositionId,sign:'for'});
const order=['year','month','day','hour'],elements=['wood','fire','earth','metal','water'];
const distance=(a,b)=>Math.abs(order.indexOf(a.position)-order.indexOf(b.position));
const layer=n=>n.kind==='visible-stem'?'stem':'branch';
const slot=n=>key(n.position,layer(n));
const scope=(a,b)=>distance(a,b)<=1?(layer(a)==='stem'||layer(b)==='stem'?'local-visible':'local-hidden'):(layer(a)==='stem'||layer(b)==='stem'?'nonlocal-visible':'nonlocal-hidden');
const sorted=xs=>[...xs].sort();
const VERSION='p3-interaction-scope-v1';
// Complete literal graph projection, not expanded effective supply.
// Hidden elements within one physical branch are co-resident, not
// independent acting slots. Extra edges never feed the local network.
export function auditInteractionScope({completeHour,nodes,links,targets,burden,stemForce}={}){
 const base={version:VERSION,selectionAuthority:false,effective:null,actualStrengthState:'unresolved',actualMagnitudeComparison:'unresolved'};
 const empty=reason=>({...base,status:'invalid-evidence',reason,rows:[],coResident:[],summary:null});
 try{
  if(typeof completeHour!=='boolean'||![nodes,links,targets,stemForce?.occurrences].every(Array.isArray)||nodes.length>16||stemForce.completeHour!==completeHour||stemForce.selectionAuthority!==false||stemForce.effectsConfirmed!==false)return empty('inventory');
  const ns=new Map(nodes.map(n=>[n.id,n])),actors=new Map(stemForce.occurrences.map(a=>[a.id,a]));
  if(ns.size!==nodes.length||actors.size!==stemForce.occurrences.length||!same(sorted(targets),order.slice(0,completeHour?4:3).map(p=>p+':stem').sort()))return empty('identity');
  const seen=new Set();
  for(const n of nodes){
   if(!n||!order.includes(n.position)||!elements.includes(n.element)||!['visible-stem','local-branch-constituents'].includes(n.kind)||(!completeHour&&n.position==='hour')||n.id!==(layer(n)==='stem'?n.position+':stem':n.position+':branch:'+n.element)||!Array.isArray(n.occurrenceIds)||!n.occurrenceIds.length||layer(n)==='stem'&&n.occurrenceIds.length!==1)return empty('node-binding');
   for(const id of n.occurrenceIds){
    const a=actors.get(id);
    if(!a||seen.has(id)||a.graphNodeId!==n.id||a.element!==n.element||a.position!==n.position||a.layer!==(layer(n)==='stem'?'visible':'hidden')||id!==(a.layer==='visible'?'visible:'+a.position:'hidden:'+a.position+':'+a.stem)||a.effectiveForce!==null||a.confirmed!==false)return empty('actor-binding');
    seen.add(id);
   }
  }
  if(seen.size!==actors.size||targets.some(id=>!ns.has(id)))return empty('actor-coverage');
  const rows=[],coResident=[];
  for(const a of nodes)for(const b of nodes){
   if(a.id===b.id)continue;
   if(slot(a)===slot(b)){
    if(a.id<b.id)coResident.push({nodeIds:[a.id,b.id],position:a.position,reason:'same-physical-branch',actualInteractionState:'unresolved'});
    continue;
   }
   const r=elementRelation(a.element,b.element);
   if(!['generate','control'].includes(r.type)||r.direction!=='left-to-right')continue;
   rows.push({id:key(r.type,a.id,b.id),kind:r.type,from:a.id,to:b.id,distance:distance(a,b),scope:scope(a,b),sourceOccurrenceIds:[...a.occurrenceIds],targetOccurrenceIds:[...b.occurrenceIds],sourceLayer:layer(a),targetLayer:layer(b),actualOperationState:'unresolved'});
  }
  const byId=new Map(rows.map(r=>[r.id,r]));
  // Every constituent view must carry the same exact graph inventory.
  for(const a of actors.values()){
   for(const [edges,kind,incoming] of [[a.generationReceived,'generate',true],[a.controlReceived,'control',true],[a.outputAndControl,null,false]]){
    if(!Array.isArray(edges))return empty('edge-inventory');
    const expected=rows.filter(r=>(incoming?r.to:r.from)===a.graphNodeId&&(!kind||r.kind===kind)).map(r=>r.id);
    if(!same(sorted(expected),sorted(edges.map(e=>key(e.type,e.from,e.to)))))return empty('edge-coverage');
    for(const e of edges){
     const r=byId.get(key(e.type,e.from,e.to)),from=ns.get(e.from),to=ns.get(e.to);
     if(e.distance!==r.distance||e.local!==(r.distance<=1)||e.effectConfirmed!==null||e.sourceEvidence?.id!==from.id||e.targetEvidence?.id!==to.id||e.sourceEvidence.layer!==layer(from)||e.targetEvidence.layer!==layer(to)||e.sourceEvidence.position!==from.position||e.targetEvidence.position!==to.position||e.sourceEvidence.element!==from.element||e.targetEvidence.element!==to.element)return empty('edge-binding');
    }
   }
  }
  const local=rows.filter(r=>r.scope==='local-visible'),extra=rows.filter(r=>r.scope!=='local-visible');
  if(!Array.isArray(burden?.actionRows)||!same(sorted(local.map(r=>r.id)),sorted(burden.actionRows.map(r=>r.id))))return empty('local-coverage');
  // Do not accept a self-consistent but widened replenishment packet.
  // Local supply must still have exactly the original generation/peer
  // inventory, with visible recipients and distinct physical slots.
  const targetSet=new Set(targets);
  const expectedLinks=nodes.flatMap(a=>nodes.flatMap(b=>{
   if(!targetSet.has(b.id)||slot(a)===slot(b)||distance(a,b)>1)return [];
   const r=elementRelation(a.element,b.element);
   return r.type==='same'?[key('peer',a.id,b.id)]:r.type==='generate'&&r.direction==='left-to-right'?[key('generate',a.id,b.id)]:[];
  }));
  if(links.some(l=>!l||!ns.has(l.from)||!ns.has(l.to))||!same(sorted(expectedLinks),sorted(links.map(l=>key(l.kind,l.from,l.to)))))return empty('local-relay-coverage');
  const c=compileReplenishmentNetwork({completeHour,nodes,links,targets});
  if(c.status!== (completeHour?'diagnostic':'partial'))return empty('network');
  const exact=compareReplenishmentBurden({completeHour,nodes,links,targets,actions:burden.actionRows.map(({id,kind,from,to,actualOperationState})=>({id,kind,from,to,actualOperationState})),replenishmentPacket:c.packet});
  if(exact.status!==c.status||!same(exact,burden))return empty('local-proof-replay');
  for(const r of local){const a=burden.actionRows.find(a=>a.id===r.id);r.propositionId=a.propositionId;r.operationVariableId=a.operationVariableId;}
  for(const r of extra){
   r.propositionId=key('extended-rooted-action',r.id);
   r.operationVariableId=key('supply-operation',r.id);
  }
  const packet=burden.packet,propositions=[...packet.propositions],rules=[...packet.rules],ids=new Set(propositions.map(p=>p.id));
  for(const r of extra){
   if(ids.has(r.propositionId)||ids.has(r.operationVariableId))return empty('operation-alias');
   ids.add(r.propositionId);ids.add(r.operationVariableId);
   propositions.push({id:r.operationVariableId,subject:r.id,kind:'hypothetical-out-of-local-scope-operation',level:'observation'},{id:r.propositionId,subject:r.id,kind:'local-basis-seeded-extended-action',level:'structural-hypothesis'});
   rules.push({id:key('extended-action-rule',r.id),policyId:VERSION,conclusion:lit(r.propositionId),premises:[lit(key('replenishment-basis',r.from)),lit(r.operationVariableId)],refs:[{owner:'literal-interaction-scope',id:r.id,field:r.scope}],applicability:'complete-only'});
  }
  const extended={...packet,propositions,rules},replay=evaluateArguments(extended);
  if(replay.status!==exact.status||!same(replay.judgments.slice(0,exact.judgments.length),exact.judgments)||!same(replay.ruleResults.slice(0,exact.ruleResults.length),exact.ruleResults))return empty('proof-parity');
  // Evaluate each extension from the exact existing source frontier.
  // No relay through added edges; this avoids copying local supply logic.
  const frontier=exact.frontier;
  const fs=new Map(frontier.frontiers.map(f=>[f.id,f.terms]));
  if(frontier.status==='diagnostic'){
   for(const r of rows){
    const terms=fs.get(r.scope==='local-visible'?r.propositionId:key('replenishment-basis',r.from));
    if(!Array.isArray(terms))return empty('frontier-coverage');
    r.localBasisSeededActionPossible=terms.length>0;
    r.witness=terms.length?(r.scope==='local-visible'?terms[0]:sorted([...terms[0],r.operationVariableId])):null;
   }
   // Replay a single joint positive completion; it must realize precisely
   // all possible rows, not confer actual operation or capacity.
   const yes=new Set(rows.flatMap(r=>r.witness??[]));
   const evidence=propositions.filter(p=>p.level==='observation').map((p,i)=>({id:key('scope-witness',i),...lit(p.id),sign:yes.has(p.id)?'for':'against',refs:[{owner:'scope-witness',id:p.id,field:'hypothetical'}],applicability:'complete-only'}));
   const result=evaluateArguments({...extended,evidence}),j=new Map(result.judgments.map(j=>[j.id,j.state]));
   if(result.status!=='diagnostic'||rows.some(r=>(j.get(r.propositionId)==='supported')!==r.localBasisSeededActionPossible))return empty('witness-parity');
  }else for(const r of rows){r.localBasisSeededActionPossible=null;r.witness=null;}
  const scopes=['local-visible','local-hidden','nonlocal-visible','nonlocal-hidden'];
  const groups=scopes.map(s=>({scope:s,literal:rows.filter(r=>r.scope===s).length,rootedPossible:frontier.status==='diagnostic'?rows.filter(r=>r.scope===s&&r.localBasisSeededActionPossible).length:null}));
  const day=rows.filter(r=>r.from==='day:stem'||r.to==='day:stem');
  return {...base,status:exact.status,reason:null,rows,coResident,summary:{analysisStatus:frontier.status,groups,coResidentPairs:coResident.length,dayLocal:day.filter(r=>r.scope==='local-visible').length,dayNonlocal:day.filter(r=>r.scope==='nonlocal-visible').length,actualEffectsConfirmed:0},
   limitations:['literal-relations-not-effective-actions','extension-uses-local-source-basis-only','no-new-supply-relays','hidden-constituents-not-independent-slots','co-residence-not-a-refutation','no-strength-authority']};
 }catch(e){return empty(String(e?.message??e));}
}
