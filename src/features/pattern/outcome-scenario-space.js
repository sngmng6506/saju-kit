import {analyzeScenarioSets,MAX_SET_QUERIES,unavailableScenarioSets} from './outcome-scenario-sets.js';
// Bounded exact Boolean completion of explicitly scoped model assumptions.
// A completion is not a physical outcome. No probability, preference,
// implicit exclusivity or allocation is introduced.
import {prepareScenarioDomain} from './outcome-scenario-domain.js';
const key=(...xs)=>JSON.stringify(xs);
export function evaluateScenarioSpace({scope,variables,queries,constraints=[],includeSets=false}={}){
 const base={selectionAuthority:false,effective:null};
 const empty=(status,reason)=>({...base,status,reason,scenarioCount:0,admissibleCount:null,queries:[],pairs:[],...(includeSets===true?{sets:{...unavailableScenarioSets(reason),status}}:{})});
 if(typeof includeSets!=='boolean')return empty('invalid-evidence','identity');
 const domain=prepareScenarioDomain({scope,variables,queries,constraints});
 if(domain.status!=='diagnostic')return empty(domain.status,domain.reason);
 const {unknown,count}=domain,queryCount=queries.length;
 const singles=queries.map(()=>({count:0,witness:null})),pairs=[];
 for(let i=0;i<queryCount;i++)for(let j=i+1;j<queryCount;j++)pairs.push({i,j,counts:[0,0,0,0],witnesses:[null,null,null,null]});
 const collectSets=includeSets&&queryCount<=MAX_SET_QUERIES,patterns=new Map();
 const admitted=domain.visit((read,results,witness)=>{
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
 });
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
