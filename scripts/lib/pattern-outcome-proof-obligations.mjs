import {evaluateArguments} from '../../src/features/pattern/outcome-argumentation.js';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const key=x=>JSON.stringify([x.propositionId,x.sign]);
const rank=(j,sign)=>j[sign==='for'?'support':'opposition'].rank;
const index=(xs,f)=>new Map(xs.map(x=>[f(x),x]));
// Read-only proof obligation graph. Does not add evidence, remove undercuts,
// change policy, rank rules by accuracy, or propose sufficient repairs.
export function inspectProofObligations(owner,targets,scope='complete'){
 const empty=reason=>({status:'invalid-evidence',reason,targets:[],nodes:[]});
 if(!owner||![owner.propositions,owner.evidence,owner.rules,owner.judgments,owner.ruleResults,targets].every(Array.isArray))return empty('shape');
 const replay=evaluateArguments({scope,propositions:owner.propositions,evidence:owner.evidence,rules:owner.rules});
 if(replay.status!==(scope==='complete'?'diagnostic':'partial')||!same(replay.judgments,owner.judgments)||!same(replay.ruleResults,owner.ruleResults))return empty('proof-replay');
 const js=index(replay.judgments,j=>j.id),rs=index(replay.ruleResults,r=>r.id),byConclusion=new Map(),nodes=new Map();
 for(const r of owner.rules){
  const k=key(r.conclusion);if(!byConclusion.has(k))byConclusion.set(k,[]);byConclusion.get(k).push(r);
 }
 if(targets.some(t=>!t||!js.has(t.propositionId)||!['for','against'].includes(t.sign))||new Set(targets.map(key)).size!==targets.length)return empty('target-identity');
 const pending=[...targets];
 while(pending.length){
  const t=pending.pop(),k=key(t);if(nodes.has(k))continue;
  const j=js.get(t.propositionId),rules=byConclusion.get(k)??[];
  const node={id:k,propositionId:t.propositionId,sign:t.sign,kind:j.kind,level:j.level,subject:j.subject,state:j.state,
   requestedRank:rank(j,t.sign),contraryRank:rank(j,t.sign==='for'?'against':'for'),terminal:null,alternatives:[]};
  nodes.set(k,node);
  if(node.requestedRank!==null){node.terminal='established';continue;}
  if(j.level==='effect-hypothesis'){node.terminal='effect-authority-absent';continue;}
  if(j.level==='observation'){node.terminal=node.contraryRank!==null?'contrary-observation':'observation-unestablished';continue;}
  if(!rules.length){node.terminal=node.contraryRank!==null?'contrary-hypothesis-no-rule':'hypothesis-no-rule';continue;}
  for(const r of rules){
   const q=rs.get(r.id),active=q.status==='premises-unresolved';
   node.alternatives.push({ruleId:r.id,policyId:r.policyId,status:q.status,
    missing:q.missing.map(key),undercuts:(q.undercuts??[]).map(x=>({literal:key(x),witnesses:x.witnesses}))});
   // Inactive alternatives retain their scope/undercut reason, not an
   // invented missing observation that would make the rule applicable.
   if(active)pending.push(...q.missing);
  }
 }
 const rows=targets.map(t=>{
  const seen=new Set(),terminals=new Map(),inactive=new Map(),cycles=new Set();
  // Iterative depth-first traversal with path membership distinguishes
  // actual cycles from shared dependencies. No Cartesian product of
  // alternative conjunctions, and no treating their union as a repair set.
  const stack=[{id:key(t),exit:false}],active=new Set();
  while(stack.length){
   const {id,exit}=stack.pop();
   if(exit){active.delete(id);continue;}
   if(active.has(id)){cycles.add(id);continue;}
   if(seen.has(id))continue;
   seen.add(id);active.add(id);stack.push({id,exit:true});
   const n=nodes.get(id);
   if(n.terminal){if(n.terminal!=='established')terminals.set(id,{id,kind:n.kind,sign:n.sign,state:n.state,reason:n.terminal});continue;}
   for(const a of n.alternatives){
    if(a.status!=='premises-unresolved'){inactive.set(a.ruleId,{ruleId:a.ruleId,status:a.status,undercuts:a.undercuts});continue;}
    for(const child of a.missing)stack.push({id:child,exit:false});
   }
  }
  return {id:key(t),state:nodes.get(key(t)).state,established:nodes.get(key(t)).requestedRank!==null,
   reachableTerminals:[...terminals.values()],inactiveAlternatives:[...inactive.values()],cycleNodeIds:[...cycles]};
 });
 return {status:replay.status,reason:null,targets:rows,nodes:[...nodes.values()],
  limitations:['reachable-terminal-union-not-sufficient-repair','alternatives-retain-conjunctions','no-assumption-mutation','no-effect-authority']};
}
export function summarizeObligationTargets(rows){
 const counts={},byReason={},inactive={},cycleTargets=rows.filter(r=>r.cycleNodeIds.length).length;
 for(const r of rows){
  for(const k of new Set(r.reachableTerminals.map(t=>JSON.stringify([t.kind,t.sign,t.reason]))))counts[k]=(counts[k]??0)+1;
  for(const k of new Set(r.reachableTerminals.map(t=>t.reason)))byReason[k]=(byReason[k]??0)+1;
  for(const k of new Set(r.inactiveAlternatives.map(t=>t.status)))inactive[k]=(inactive[k]??0)+1;
 }
 return {targets:rows.length,established:rows.filter(r=>r.established).length,unestablished:rows.filter(r=>!r.established).length,cycleTargets,
  terminalOccurrences:Object.entries(counts).map(([k,count])=>{const [kind,sign,reason]=JSON.parse(k);return {kind,sign,reason,count};}).sort((a,b)=>b.count-a.count||JSON.stringify(a).localeCompare(JSON.stringify(b))),
  byReason,inactive};
}
