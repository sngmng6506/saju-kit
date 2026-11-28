import {elementRelation} from '../../src/core/elements.js';
import {compileReplenishmentNetwork} from '../../src/features/pattern/outcome-replenishment-network.js';
import {evaluateArguments} from '../../src/features/pattern/outcome-argumentation.js';
import {auditInteractionScope} from './pattern-interaction-scope.mjs';
const key=(...xs)=>JSON.stringify(xs),same=(a,b)=>key(a)===key(b),lit=propositionId=>({propositionId,sign:'for'});
const VERSION='p3-gated-supply-extension-v1';
const order=['year','month','day','hour'],slot=n=>key(n.position,n.kind),dist=(a,b)=>Math.abs(order.indexOf(a.position)-order.indexOf(b.position));
const unique=xs=>[...new Set(xs)].sort();
const basis=id=>key('replenishment-basis',id);
const op=id=>key('supply-operation',id);
const valid=x=>typeof x==='string'&&x.length>0;
// Every link has a distinct operation variable, every seed has its own
// actor-slot access variable. Additional shared gates may restrict paths.
// With only the variables of one simple seeded path true, baseline
// reachability cannot bypass an extra edge on that path. Thus a simple
// path with an extra edge witnesses a genuine extension (not a cycle).
export function compareRelayPaths({nodes,local,extra,targetId,excludeRecipient=false}={}){
 const empty=(status,reason)=>({status,reason,baseline:null,extended:null,extensionOnly:null});
 try{
  if(!Array.isArray(nodes)||!Array.isArray(local)||!Array.isArray(extra)||typeof excludeRecipient!=='boolean'||nodes.length>16||local.length+extra.length>256)return empty('invalid-evidence','inventory');
  const ns=new Map(nodes.map(n=>[n.id,n])),ls=[...local,...extra];
  if(ns.size!==nodes.length||!ns.has(targetId)||nodes.some(n=>!valid(n.id)||!Array.isArray(n.rootIds)||n.rootIds.some(r=>!valid(r))||new Set(n.rootIds).size!==n.rootIds.length)||
   ls.some(l=>!l||!valid(l.id)||!ns.has(l.from)||!ns.has(l.to)||l.from===l.to||!valid(l.operationVariableId)||!Array.isArray(l.gates)||l.gates.some(g=>!valid(g))||new Set(l.gates).size!==l.gates.length)||
   new Set(ls.map(l=>l.id)).size!==ls.length||new Set(ls.map(l=>l.operationVariableId)).size!==ls.length||new Set(ls.map(l=>key(l.from,l.to))).size!==ls.length||local.some(l=>l.gates.length))return empty('invalid-evidence','identity');
  const operations=new Set(ls.map(l=>l.operationVariableId));
  const seedVars=new Set(nodes.flatMap(n=>n.rootIds.flatMap(r=>[key('slot-retained',r),key('root-access',n.id,r)])));
  if([...operations].some(id=>seedVars.has(id))||ls.some(l=>l.gates.some(g=>operations.has(g)||seedVars.has(g))))return empty('invalid-evidence','variable-alias');
  const extraIds=new Set(extra.map(l=>l.id)),incoming=new Map(nodes.map(n=>[n.id,[]]));
  for(const l of ls)if(!excludeRecipient||l.from!==targetId)incoming.get(l.to).push(l);
  let work=0;
  function search(mode){
   const stack=[{node:targetId,nodeIds:[targetId],path:[],hasExtra:false}];
   while(stack.length){
    if(++work>300000)throw Error('path-budget');
    const x=stack.pop(),n=ns.get(x.node);
    if((!excludeRecipient||n.id!==targetId)&&n.rootIds.length&&(mode!=='extension-only'||x.hasExtra)){
     const r=n.rootIds[0],path=[...x.path].reverse();
     return {seedNodeId:n.id,rootId:r,nodeIds:[...x.nodeIds].reverse(),linkIds:path.map(l=>l.id),extraLinkIds:path.filter(l=>extraIds.has(l.id)).map(l=>l.id),
      assumptions:unique([key('slot-retained',r),key('root-access',n.id,r),...path.flatMap(l=>[l.operationVariableId,...l.gates])])};
    }
    for(const l of incoming.get(x.node)){
     if(mode==='baseline'&&extraIds.has(l.id)||x.nodeIds.includes(l.from))continue;
     if(++work>300000)throw Error('path-budget');
     stack.push({node:l.from,nodeIds:[...x.nodeIds,l.from],path:[...x.path,l],hasExtra:x.hasExtra||extraIds.has(l.id)});
    }
   }
   return null;
  }
  const baseline=search('baseline'),extensionOnly=search('extension-only'),extended=baseline??extensionOnly;
  return {status:'diagnostic',reason:null,baseline,extended,extensionOnly};
 }catch(e){return empty(e.message==='path-budget'?'unavailable':'invalid-evidence',String(e?.message??e));}
}
export function auditExtendedSupply(input){
 const base={version:VERSION,selectionAuthority:false,effective:null,actualReplenishmentState:'unresolved',actualStrengthState:'unresolved'};
 const empty=(status,reason)=>({...base,status,reason,rows:[],extraLinks:[],summary:null});
 const scope=auditInteractionScope(input);
 if(scope.status!=='diagnostic')return empty(scope.status,scope.reason);
 if(scope.summary.analysisStatus!=='diagnostic')return empty('unavailable','local-frontier');
 try{
  const {completeHour,nodes,links,targets,burden,stemForce}=input,ns=new Map(nodes.map(n=>[n.id,n]));
  const local=links.map(l=>({...l,operationVariableId:op(l.id),gates:[]}));
  const pairs=new Set(local.map(l=>key(l.from,l.to))),extra=[];
  const actions=new Map(scope.rows.map(r=>[r.id,r]));
  for(const a of stemForce.occurrences){
   const n=ns.get(a.graphNodeId);
   const expected=nodes.filter(b=>b.element===n.element&&slot(b)!==slot(n)).map(b=>b.id);
   if(!Array.isArray(a.peers)||!same(unique(a.peers.map(p=>p.id)),unique(expected))||a.peers.length!==expected.length||a.peers.some(p=>{const b=ns.get(p.id);return !b||p.element!==b.element||p.position!==b.position||p.layer!==(b.kind==='visible-stem'?'stem':'branch');}))return empty('invalid-evidence','peer-scope-coverage');
  }
  for(const a of nodes)for(const b of nodes){
   if(slot(a)===slot(b)||pairs.has(key(a.id,b.id)))continue;
   const r=elementRelation(a.element,b.element),kind=r.type==='same'?'peer':r.type==='generate'&&r.direction==='left-to-right'?'generate':null;
   if(!kind)continue;
   const id=key('extended-relay',kind,a.id,b.id),action=kind==='generate'?actions.get(key('generate',a.id,b.id)):null;
   if(kind==='generate'&&!action)return empty('invalid-evidence','generation-scope-binding');
   const gates=[];
   if(dist(a,b)>1)gates.push(key('nonlocal-relay-access',kind,a.id,b.id));
   if(b.kind!=='visible-stem')gates.push(key('hidden-reception-access',b.id));
   if(!gates.length)return empty('invalid-evidence','unexpected-local-relay');
   extra.push({id,kind,from:a.id,to:b.id,distance:dist(a,b),sourceActionId:action?.id??null,operationVariableId:action?.operationVariableId??op(id),gates,actualOperationState:'unresolved'});
  }
  const packet=burden.packet,propositions=[...packet.propositions],rules=[...packet.rules],ps=new Map(propositions.map(p=>[p.id,p]));
  function observe(id,subject,kind){
   const old=ps.get(id);
   if(old){if(old.level!=='observation')throw Error('observation-alias');return;}
   const p={id,subject,kind,level:'observation'};ps.set(id,p);propositions.push(p);
  }
  for(const l of extra){
   observe(l.operationVariableId,l.sourceActionId??l.id,'hypothetical-extended-relay-operation');
   for(const g of l.gates)observe(g,g,'hypothetical-relay-access');
  }
  const canonical=compileReplenishmentNetwork({completeHour,nodes,links,targets});
  if(canonical.status!=='diagnostic')return empty('invalid-evidence','canonical-network');
  const projected=(tag,targetId=null,withExtra=true)=>{
   const id=n=>key(tag,targetId,n);
   const add=(rid,out,premises)=>rules.push({id:key(tag,targetId,rid),policyId:VERSION,conclusion:lit(id(out)),premises:premises.map(lit),refs:[{owner:'gated-relay-projection',id:rid,field:'hypothetical-only'}],applicability:'complete-only'});
   for(const n of nodes){
    propositions.push({id:id(n.id),subject:n.id,kind:'gated-root-seeded-supply-basis',level:'structural-hypothesis'});
    if(n.id!==targetId)for(const r of n.rootIds)add(key('seed',n.id,r),n.id,[key('slot-retained',r),key('root-access',n.id,r)]);
   }
   for(const l of [...local,...(withExtra?extra:[])])if(l.from!==targetId)add(l.id,l.to,[id(l.from),l.operationVariableId,...l.gates]);
   return id;
  };
  const expanded=projected('expanded-supply');
  const independentLocal=projected('local-independent','day:stem',false),independentExtended=projected('expanded-independent','day:stem');
  const combined={...packet,propositions,rules},baseline=evaluateArguments(packet),replay=evaluateArguments(combined);
  if(replay.status!==baseline.status||!same(replay.judgments.slice(0,baseline.judgments.length),baseline.judgments)||!same(replay.ruleResults.slice(0,baseline.ruleResults.length),baseline.ruleResults))return empty('invalid-evidence','proof-parity');
  const obs=propositions.filter(p=>p.level==='observation').map(p=>p.id);
  function checkWitness(w,oldId,newId,oldExpected){
   if(!w)return true;
   const truth=new Set(w.assumptions);
   if([...truth].some(id=>!obs.includes(id)))return false;
   const evidence=obs.map((id,i)=>({id:key('relay-witness',i),propositionId:id,sign:truth.has(id)?'for':'against',refs:[{owner:'relay-witness',id,field:'hypothetical'}],applicability:'complete-only'}));
   const r=evaluateArguments({...combined,evidence}),j=new Map(r.judgments.map(x=>[x.id,x.state]));
   return r.status==='diagnostic'&&j.get(newId)==='supported'&&(j.get(oldId)==='supported')===oldExpected;
  }
  // Factorial access ablation: each disabled family removes all links
  // requiring it. Cross-family links require both gates. Replay the
  // same expanded packet under explicit false access observations.
  const families=[
   {id:'local-only',nonlocal:false,hiddenReception:false},
   {id:'nonlocal-only',nonlocal:true,hiddenReception:false},
   {id:'hidden-local-only',nonlocal:false,hiddenReception:true},
   {id:'both',nonlocal:true,hiddenReception:true}
  ];
  const permitted=(l,p)=>(p.nonlocal||l.distance<=1)&&(p.hiddenReception||ns.get(l.to).kind==='visible-stem');
  const closure=new Map();
  for(const p of families){
   const disabled=new Set(extra.flatMap(l=>l.gates).filter(g=>!p.nonlocal&&g.startsWith('["nonlocal-relay-access",')||!p.hiddenReception&&g.startsWith('["hidden-reception-access",')));
   const evidence=obs.map((id,i)=>({id:key('relay-ablation',i),propositionId:id,sign:disabled.has(id)?'against':'for',refs:[{owner:'relay-ablation',id,field:'hypothetical'}],applicability:'complete-only'}));
   const r=evaluateArguments({...combined,evidence});
   if(r.status!=='diagnostic')return empty('invalid-evidence','ablation-replay');
   closure.set(p.id,new Map(r.judgments.map(j=>[j.id,j.state])));
  }
  const rows=[];
  for(const t of targets)for(const independent of t==='day:stem'?[false,true]:[false]){
   const q=compareRelayPaths({nodes,local,extra,targetId:t,excludeRecipient:independent});
   if(q.status!=='diagnostic')return empty(q.status,q.reason);
   const old=independent?independentLocal(t):basis(t),next=independent?independentExtended(t):expanded(t);
   if(!checkWitness(q.baseline,old,next,true)||!checkWitness(q.extensionOnly,old,next,false))return empty('invalid-evidence','witness-parity');
   // Verify each ablation's exact reachability and differential witness.
   const ablation=[];
   for(const p of families){
    const v=p.id==='both'?q:compareRelayPaths({nodes,local,extra:extra.filter(l=>permitted(l,p)),targetId:t,excludeRecipient:independent});
    if(v.status!=='diagnostic')return empty(v.status,v.reason);
    const j=closure.get(p.id);
    if((j.get(old)==='supported')!==!!v.baseline||(j.get(next)==='supported')!==!!v.extended||!!v.baseline!==!!q.baseline||!checkWitness(v.extensionOnly,old,next,false))return empty('invalid-evidence','ablation-parity');
    ablation.push({policy:p.id,reachable:!!v.extended,extensionOnlyPossible:!!v.extensionOnly,witness:v.extensionOnly});
   }
   const [l,n,h,b]=ablation;
   if(l.reachable!==!!q.baseline||l.extensionOnlyPossible||b.reachable!==!!q.extended||b.extensionOnlyPossible!==!!q.extensionOnly||
    [n,h].some(x=>l.reachable&&!x.reachable||x.reachable&&!b.reachable||x.extensionOnlyPossible&&!b.extensionOnlyPossible))return empty('invalid-evidence','ablation-monotonicity');
   rows.push({targetId:t,scope:independent?'recipient-excluded':'all-origins',baselinePossible:!!q.baseline,extendedPossible:!!q.extended,extensionOnlyPossible:!!q.extensionOnly,witnesses:q,ablation,
    jointFamiliesRequiredForNewReachability:b.reachable&&!n.reachable&&!h.reachable,actualReplenishmentState:'unresolved'});
  }
  return {...base,status:'diagnostic',reason:null,rows,extraLinks:extra,summary:{localLinks:local.length,extraLinks:extra.length,nonlocalLinks:extra.filter(l=>l.distance>1).length,hiddenRecipientLinks:extra.filter(l=>ns.get(l.to).kind!=='visible-stem').length,targets:rows.length,newReachability:rows.filter(r=>!r.baselinePossible&&r.extendedPossible).length,extensionOnly:rows.filter(r=>r.extensionOnlyPossible).length,jointFamiliesRequired:rows.filter(r=>r.jointFamiliesRequiredForNewReachability).length,ablation:families.map(p=>({policy:p.id,reachable:rows.filter(r=>r.ablation.find(a=>a.policy===p.id).reachable).length,extensionOnly:rows.filter(r=>r.ablation.find(a=>a.policy===p.id).extensionOnlyPossible).length})),actualEffectsConfirmed:0},
   limitations:['explicit-unreviewed-access-gates','not-effective-supply','shared-roots-not-capacity','no-within-branch-relays','no-strength-authority']};
 }catch(e){return empty('invalid-evidence',String(e?.message??e));}
}
