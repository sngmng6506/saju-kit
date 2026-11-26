import {evaluateArguments} from './outcome-argumentation.js';
import {positiveProofFrontier} from './outcome-positive-frontier.js';
const key=(...xs)=>JSON.stringify(xs);
const valid=x=>typeof x==='string'&&x.length>0;
const unique=xs=>Array.isArray(xs)&&xs.every(valid)&&new Set(xs).size===xs.length;
const MAX_QUERIES=256,MAX_WORK=300000;
// Exact satisfiability of conjunctions of positive or negated monotone
// proof propositions under explicit observation restrictions. No counts,
// probabilities, capacity or real-world feasibility are inferred.
export function queryPositiveProofConstraints(packet,queries){
 const empty=(status,reason)=>({status,reason,queries:[],selectionAuthority:false,effective:null});
 const frontier=positiveProofFrontier(packet);
 if(frontier.status!=='diagnostic')return empty(frontier.status,frontier.reason);
 if(!Array.isArray(queries)||queries.some(q=>!q||!valid(q.id))||new Set(queries.map(q=>q.id)).size!==queries.length)return empty('invalid-evidence','query-identity');
 if(queries.length>MAX_QUERIES)return empty('unavailable','query-budget');
 const fs=new Map(frontier.frontiers.map(f=>[f.id,f.terms]));
 const observations=packet.propositions.filter(p=>p.level==='observation').map(p=>p.id),obs=new Set(observations);
 const fixedFacts=new Set(packet.evidence.map(e=>e.propositionId));
 if(queries.some(q=>!unique(q.required)||!unique(q.excluded)||[...q.required,...q.excluded].some(id=>!fs.has(id))||
  !Array.isArray(q.fixed)||q.fixed.some(x=>!x||!obs.has(x.id)||typeof x.value!=='boolean')||new Set(q.fixed.map(x=>x.id)).size!==q.fixed.length))return empty('invalid-evidence','query-contract');
 let work=0;
 const tick=()=>{if(++work>MAX_WORK)throw Error('work-budget');};
 const subset=(term,truth)=>{tick();return term.every(x=>truth.has(x));};
 function solve(q){
  if(q.fixed.some(x=>!x.value&&fixedFacts.has(x.id)))return null;
  const forbidden=new Set(q.fixed.filter(x=>!x.value).map(x=>x.id));
  const initial=new Set(q.fixed.filter(x=>x.value&&!fixedFacts.has(x.id)).map(x=>x.id));
  const required=q.required.map(id=>fs.get(id).filter(t=>{tick();return !t.some(x=>forbidden.has(x));})).sort((a,b)=>a.length-b.length);
  const excluded=q.excluded.flatMap(id=>fs.get(id));
  if(required.some(ts=>!ts.length))return null;
  const stack=[{i:0,truth:initial}];
  while(stack.length){
   tick();const {i,truth}=stack.pop();
   if(excluded.some(t=>subset(t,truth)))continue;
   if(i===required.length)return [...truth].sort();
   if(required[i].some(t=>subset(t,truth))){stack.push({i:i+1,truth});continue;}
   for(const t of required[i]){tick();stack.push({i:i+1,truth:new Set([...truth,...t])});}
  }
  return null;
 }
 try{
  const rows=[];
  for(const q of queries){
   const witness=solve(q);
   if(witness!==null){
    const truth=new Set([...fixedFacts,...witness]),evidence=[...packet.evidence,...observations.filter(id=>!fixedFacts.has(id)).map((id,i)=>({id:key('constraint-witness',i),propositionId:id,sign:truth.has(id)?'for':'against',refs:[{owner:'positive-constraint-witness',id,field:'hypothetical'}],applicability:'complete-only'}))];
    const replay=evaluateArguments({...packet,evidence}),j=new Map(replay.judgments.map(x=>[x.id,x.state]));
    if(replay.status!=='diagnostic'||q.required.some(id=>j.get(id)!=='supported')||q.excluded.some(id=>j.get(id)==='supported')||q.fixed.some(x=>truth.has(x.id)!==x.value))return empty('invalid-evidence','witness-replay');
   }
   rows.push({id:q.id,feasible:witness!==null,witness});
  }
  return {status:'diagnostic',reason:null,queries:rows,selectionAuthority:false,effective:null};
 }catch(e){return empty('unavailable',String(e?.message??e));}
}
