import {analyzeScenarioSets,MAX_SET_QUERIES,unavailableScenarioSets} from './outcome-scenario-sets.js';
// Bounded exact Boolean completion of explicitly scoped model assumptions.
// A completion is not a physical outcome. No probability, preference,
// implicit exclusivity or allocation is introduced.
const valid=x=>typeof x==='string'&&x.length>0;
const unique=xs=>new Set(xs).size===xs.length;
const key=(...xs)=>JSON.stringify(xs);
const MAX_UNKNOWN=16,MAX_NODES=12000,MAX_QUERIES=64,MAX_WORK=16000000;
export function evaluateScenarioSpace({scope,variables,queries,constraints=[],includeSets=false}={}){
 const base={selectionAuthority:false,effective:null};
 const empty=(status,reason)=>({...base,status,reason,scenarioCount:0,admissibleCount:null,queries:[],pairs:[],...(includeSets===true?{sets:{...unavailableScenarioSets(reason),status}}:{})});
 if(typeof includeSets!=='boolean'||!['complete','partial'].includes(scope)||![variables,queries,constraints].every(Array.isArray)||
  variables.some(v=>!v||!valid(v.id)||![true,false,null].includes(v.value))||!unique(variables.map(v=>v.id))||
  queries.some(q=>!q||!valid(q.id))||!unique(queries.map(q=>q.id))||
  constraints.some(c=>!c||!valid(c.id)||!Array.isArray(c.refs)||!c.refs.length||c.refs.some(r=>!r||!valid(r.owner)||!valid(r.id)||!valid(r.field)))||
  !unique(constraints.map(c=>c.id)))return empty('invalid-evidence','identity');
 if(queries.length>MAX_QUERIES)return empty('unavailable','query-budget');
 const values=new Map(variables.map(v=>[v.id,v.value])),used=new Set();let nodes=0;
 // A small closed expression language. Compile once, never execute caller code.
 const compile=(e,depth=0)=>{
  if(++nodes>MAX_NODES||depth>64)throw Error('formula-budget');
  if(typeof e==='boolean')return ()=>e;
  if(!e||typeof e!=='object'||Array.isArray(e))throw Error('formula');
  if(e.op==='var'&&values.has(e.id)){used.add(e.id);return read=>read(e.id);}
  if(e.op==='not'){const f=compile(e.arg,depth+1);return read=>!f(read);}
  if(['all','any'].includes(e.op)&&Array.isArray(e.args)){
   const fs=e.args.map(x=>compile(x,depth+1));
   return e.op==='all'?read=>fs.every(f=>f(read)):read=>fs.some(f=>f(read));
  }
  throw Error('formula');
 };
 let qs,cs;
 try{qs=queries.map(q=>compile(q.formula));cs=constraints.map(c=>compile(c.formula));}
 catch(e){return empty(e.message==='formula-budget'?'unavailable':'invalid-evidence',e.message);}
 if(scope==='partial')return empty('partial','missing-hour');
 const unknown=[...used].filter(id=>values.get(id)===null).sort();
 if(unknown.length>MAX_UNKNOWN)return empty('unavailable','scenario-budget');
 const count=2**unknown.length,pairCount=qs.length*(qs.length-1)/2;
 if(count*(nodes+pairCount)>MAX_WORK)return empty('unavailable','work-budget');
 const pos=new Map(unknown.map((id,i)=>[id,i])),singles=qs.map(()=>({count:0,witness:null})),pairs=[];
 for(let i=0;i<qs.length;i++)for(let j=i+1;j<qs.length;j++)pairs.push({i,j,counts:[0,0,0,0],witnesses:[null,null,null,null]});
 const collectSets=includeSets&&qs.length<=MAX_SET_QUERIES,patterns=new Map();
 let admitted=0;
 for(let mask=0;mask<count;mask++){
  const read=id=>values.get(id)===null?Boolean(mask&(1<<pos.get(id))):values.get(id);
  if(!cs.every(f=>f(read)))continue;
  admitted++;
  const witness=()=>Object.fromEntries(unknown.map(id=>[id,read(id)]));
  const results=qs.map(f=>f(read));
  if(collectSets){
   const truthMask=results.reduce((m,value,i)=>value?m|(1<<i):m,0);
   const old=patterns.get(truthMask);
   if(old)old.count++;else patterns.set(truthMask,{mask:truthMask,count:1,witness:witness()});
  }
  results.forEach((v,i)=>{if(v){singles[i].count++;if(singles[i].witness===null)singles[i].witness=witness();}});
  for(const p of pairs){
   const k=(results[p.i]?2:0)+(results[p.j]?1:0);
   p.counts[k]++;if(p.witnesses[k]===null)p.witnesses[k]=witness();
  }
 }
 if(!admitted)return {...empty('diagnostic','no-admissible-completion'),scenarioCount:count,admissibleCount:0,variables:unknown};
 const sets=includeSets?(collectSets?analyzeScenarioSets(queries.map(q=>q.id),[...patterns.values()]):unavailableScenarioSets('set-query-budget')):null;
 const label=n=>n===0?'impossible-in-model':n===admitted?'invariant-in-model':'possible-not-invariant';
 return {...base,status:'diagnostic',reason:null,scenarioCount:count,admissibleCount:admitted,variables:unknown,...(includeSets?{sets}:{}),
  queries:queries.map((q,i)=>({id:q.id,state:label(singles[i].count),supportCount:singles[i].count,witness:singles[i].witness})),
  pairs:pairs.map(p=>({id:key(queries[p.i].id,queries[p.j].id),leftId:queries[p.i].id,rightId:queries[p.j].id,
   jointState:label(p.counts[3]),individuallyPossible:singles[p.i].count>0&&singles[p.j].count>0,
   individuallyPossibleButJointImpossible:singles[p.i].count>0&&singles[p.j].count>0&&p.counts[3]===0,
   counts:{neither:p.counts[0],rightOnly:p.counts[1],leftOnly:p.counts[2],both:p.counts[3]},
   witnesses:{neither:p.witnesses[0],rightOnly:p.witnesses[1],leftOnly:p.witnesses[2],both:p.witnesses[3]}}))};
}
