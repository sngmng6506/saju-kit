// Conditional signed terminal rules over a positive proof frontier.
// For each guard assignment, all remaining conditions are monotone DNF.
// A minimal true-set witness suffices: adding variables cannot help an
// excluded monotone formula become false.
const states=['supported','opposed','conflicting','unresolved'];
const key=(...xs)=>JSON.stringify(xs);
const valid=x=>typeof x==='string'&&x.length>0;
const subset=(a,b)=>a.every(x=>b.has(x));
const MAX_WORK=300000,MAX_GUARDS=8;
export function analyzeGuardedFrontier({frontiers,guards,requirements,targets,rules,fixedGuards=[]}={}){
 const empty=(status,reason)=>({status,reason,targets:[],selectionAuthority:false,effective:null});
 if(![frontiers,guards,requirements,targets,rules,fixedGuards].every(Array.isArray)||
  guards.some(x=>!valid(x))||new Set(guards).size!==guards.length||
  targets.some(x=>!valid(x))||new Set(targets).size!==targets.length||
  frontiers.some(f=>!f||!valid(f.id)||!Array.isArray(f.terms)||f.terms.some(t=>!Array.isArray(t)||t.some(x=>!valid(x)||guards.includes(x))||new Set(t).size!==t.length))||
  new Set(frontiers.map(f=>f.id)).size!==frontiers.length)return empty('invalid-evidence','identity');
 const byId=new Map(frontiers.map(f=>[f.id,f.terms]));
 if(requirements.some(r=>!r||!guards.includes(r.guard)||!byId.has(r.basis))||
  rules.some(r=>!r||!targets.includes(r.target)||!['for','against'].includes(r.sign)||!byId.has(r.basis)||!Array.isArray(r.guards)||
   r.guards.some(g=>!g||!guards.includes(g.id)||typeof g.value!=='boolean')||new Set(r.guards.map(g=>g.id)).size!==r.guards.length))return empty('invalid-evidence','rule-contract');
 if(fixedGuards.some(g=>!g||!guards.includes(g.id)||typeof g.value!=='boolean')||new Set(fixedGuards.map(g=>g.id)).size!==fixedGuards.length)return empty('invalid-evidence','fixed-guard-contract');
 if(guards.length>MAX_GUARDS)return empty('unavailable','guard-budget');
 let work=0;const tick=()=>{if(++work>MAX_WORK)throw Error('work-budget');};
 const search=(required,excluded)=>{
  if(required.some(xs=>!xs.length))return null;
  const lists=[...required].sort((a,b)=>a.length-b.length);
  // Iterative product search, with pruning against excluded DNF terms.
  const stack=[{i:0,truth:new Set()}];
  while(stack.length){
   tick();const {i,truth}=stack.pop();
   if(excluded.some(t=>{tick();return subset(t,truth);}))continue;
   if(i===lists.length)return [...truth].sort();
   for(const t of lists[i]){tick();stack.push({i:i+1,truth:new Set([...truth,...t])});}
  }
  return null;
 };
 const rows=targets.map(id=>({id,witnesses:Object.fromEntries(states.map(s=>[s,null]))}));
 try{
  for(let mask=0;mask<2**guards.length;mask++){
   const value=new Map(guards.map((g,i)=>[g,Boolean(mask&(1<<i))]));
   if(fixedGuards.some(g=>value.get(g.id)!==g.value))continue;
   const necessary=requirements.filter(r=>value.get(r.guard)).map(r=>byId.get(r.basis));
   const active=rules.filter(r=>r.guards.every(g=>value.get(g.id)===g.value));
   for(const t of rows){
    const terms=sign=>active.filter(r=>r.target===t.id&&r.sign===sign).flatMap(r=>byId.get(r.basis));
    const p=terms('for'),n=terms('against');
    for(const [state,yes,no] of [['supported',true,false],['opposed',false,true],['conflicting',true,true],['unresolved',false,false]]){
     if(t.witnesses[state]!==null)continue;
     const w=search([...necessary,...(yes?[p]:[]),...(no?[n]:[])],[...(yes?[]:p),...(no?[]:n)]);
     if(w!==null)t.witnesses[state]=[...new Set([...w,...guards.filter(g=>value.get(g))])].sort();
    }
   }
  }
  return {status:'diagnostic',reason:null,targets:rows.map(t=>{
   const possibleStates=states.filter(s=>t.witnesses[s]!==null);
   return {...t,possibleStates,invariantState:possibleStates.length===1?possibleStates[0]:null};
  }),selectionAuthority:false,effective:null};
 }catch(e){return empty('unavailable',e.message);}
}
