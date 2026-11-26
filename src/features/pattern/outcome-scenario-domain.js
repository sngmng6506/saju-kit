const valid=x=>typeof x==='string'&&x.length>0;
const unique=xs=>new Set(xs).size===xs.length;
const key=(...xs)=>JSON.stringify(xs);
const MAX_UNKNOWN=16,MAX_NODES=12000,MAX_QUERIES=64,MAX_WORK=16000000;
// Internal shared preparation for exact finite Boolean scenarios. The
// visitor is trusted application code, never supplied by formula data.
export function prepareScenarioDomain({scope,variables,queries,constraints=[],extraWork=0}={}){
 const empty=(status,reason)=>({status,reason});
 if(!Number.isSafeInteger(extraWork)||extraWork<0)return empty('invalid-evidence','work-contract');
 if(!['complete','partial'].includes(scope)||![variables,queries,constraints].every(Array.isArray)||
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
 if(count*(nodes+pairCount+extraWork)>MAX_WORK)return empty('unavailable','work-budget');

 const pos=new Map(unknown.map((id,i)=>[id,i]));
 return {status:'diagnostic',reason:null,unknown,count,visit(visitor){
  let admitted=0;
  for(let mask=0;mask<count;mask++){
   const read=id=>values.get(id)===null?Boolean(mask&(1<<pos.get(id))):values.get(id);
   if(!cs.every(f=>f(read)))continue;
   admitted++;
   visitor(read,qs.map(f=>f(read)),()=>Object.fromEntries(unknown.map(id=>[id,read(id)])));
  }
  return admitted;
 }};
}
