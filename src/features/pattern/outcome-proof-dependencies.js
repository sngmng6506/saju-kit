import {evaluateArguments} from './outcome-argumentation.js';
const key=(...xs)=>JSON.stringify(xs);
const literalKey=x=>key(x.propositionId,x.sign);
const signs=['for','against'];
const same=(a,b)=>key(a)===key(b);
// Iterative Kosaraju, with canonical output independent of traversal order.
function components(nodes,edges){
 const adj=new Map(nodes.map(x=>[x,[]])),rev=new Map(nodes.map(x=>[x,[]]));
 for(const [a,b] of edges){adj.get(a).push(b);rev.get(b).push(a);}
 const visited=new Set(),order=[];
 for(const root of nodes)if(!visited.has(root)){
  visited.add(root);const stack=[[root,0]];
  while(stack.length){
   const top=stack[stack.length-1],xs=adj.get(top[0]);
   if(top[1]<xs.length){const next=xs[top[1]++];if(!visited.has(next)){visited.add(next);stack.push([next,0]);}}
   else{order.push(top[0]);stack.pop();}
  }
 }
 visited.clear();const out=[];
 for(const root of order.reverse())if(!visited.has(root)){
  const group=[],stack=[root];visited.add(root);
  while(stack.length){const x=stack.pop();group.push(x);for(const y of rev.get(x))if(!visited.has(y)){visited.add(y);stack.push(y);}}
  if(group.length>1||adj.get(root).includes(root))out.push(group.sort());
 }
 return out.sort((a,b)=>key(a)<key(b)?-1:key(a)>key(b)?1:0);
}
// Distinguish signed proof dependency cycles from domain topology.
// Hyperedge AND/OR semantics and grounded support remain owned by
// evaluateArguments; SCCs alone never determine proof readiness.
export function analyzeProofDependencies(packet,expected=null){
 const base={selectionAuthority:false,effective:null};
 const empty=(status,reason)=>({...base,status,reason,components:[],activeComponents:[],summary:null});
 const r=evaluateArguments(packet);
 if(!['diagnostic','partial'].includes(r.status))return empty(r.status,r.reason);
 if(expected&&(!same(r.judgments,expected.judgments)||!same(r.ruleResults,expected.ruleResults)))return empty('invalid-evidence','proof-replay');
 if(r.status==='partial')return {...empty('partial','missing-hour'),summary:{cycles:null,activeCycles:null,actualEffectsConfirmed:0}};
 const {propositions,evidence,rules}=packet;
 const literalIds=propositions.flatMap(p=>signs.map(sign=>key(p.id,sign)));
 const states=new Map(r.judgments.flatMap(j=>[[key(j.id,'for'),j.support.rank],[key(j.id,'against'),j.opposition.rank]]));
 const ruleResults=new Map(r.ruleResults.map(q=>[q.id,q]));
 const edges=rs=>rs.flatMap(q=>q.premises.map(p=>[literalKey(q.conclusion),literalKey(p)]));
 const active=rules.filter(q=>!['undercut','scope-unresolved'].includes(ruleResults.get(q.id).status));
 // Deliberate structural upper bound: grant both signs to every observation,
 // retain existing signed facts, ignore undercuts. This is NOT a scenario,
 // admissible completion, or additional evidence in the original graph.
 const relaxedEvidence=[...evidence];
 const usedIds=new Set(evidence.map(e=>e.id));
 for(const p of propositions.filter(p=>p.level==='observation'))for(const sign of signs){
  let id=key('structural-upper-bound',p.id,sign);
  while(usedIds.has(id))id+=':';
  usedIds.add(id);relaxedEvidence.push({id,propositionId:p.id,sign,refs:[{owner:'proof-dependency-upper-bound',id:p.id,field:sign}],applicability:'complete-only'});
 }
 const upper=evaluateArguments({...packet,evidence:relaxedEvidence,rules:rules.map(({undercutWhen,...q})=>q)});
 if(upper.status!=='diagnostic')return empty(upper.status,'upper-bound-'+upper.reason);
 const potential=new Map(upper.judgments.flatMap(j=>[[key(j.id,'for'),j.support.rank],[key(j.id,'against'),j.opposition.rank]]));
 const byConclusion=rs=>{const m=new Map();for(const q of rs){const k=literalKey(q.conclusion);if(!m.has(k))m.set(k,[]);m.get(k).push(q);}return m;};
 const describe=(members,rs)=>{
  const set=new Set(members),relevant=members.flatMap(id=>rs.get(id)??[]);
  const alternatives=relevant.map(q=>({ruleId:q.id,conclusion:q.conclusion,
   internalPremises:q.premises.filter(p=>set.has(literalKey(p))),
   externalPremises:q.premises.filter(p=>!set.has(literalKey(p))),
   status:ruleResults.get(q.id).status,missing:ruleResults.get(q.id).missing,undercuts:ruleResults.get(q.id).undercuts??[]}));
  const literalRows=members.map(id=>{const [propositionId,sign]=JSON.parse(id);return {propositionId,sign,groundedRank:states.get(id),upperBoundRank:potential.get(id)};});
  return {id:key(...members),members:literalRows,alternatives,
   groundedCount:literalRows.filter(p=>p.groundedRank!==null).length,
   upperBoundReachableCount:literalRows.filter(p=>p.upperBoundRank!==null).length,
   classification:literalRows.every(p=>p.groundedRank!==null)?'grounded':
    literalRows.every(p=>p.upperBoundRank===null)?'structurally-seedless':'not-fully-grounded'};
 };
 const fullIndex=byConclusion(rules),activeIndex=byConclusion(active);
 const cycles=components(literalIds,edges(rules)).map(xs=>describe(xs,fullIndex));
 const activeCycles=components(literalIds,edges(active)).map(xs=>describe(xs,activeIndex));
 return {...base,status:'diagnostic',reason:null,components:cycles,activeComponents:activeCycles,
  summary:{cycles:cycles.length,activeCycles:activeCycles.length,structurallySeedless:cycles.filter(c=>c.classification==='structurally-seedless').length,
   notFullyGrounded:cycles.filter(c=>c.classification!=='grounded').length,actualEffectsConfirmed:0},
  limitations:['signed-proof-topology-not-physical-cycle','upper-bound-not-admissible-scenario','missing-proof-not-opposition','no-effect-authority']};
}
