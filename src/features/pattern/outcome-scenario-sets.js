// Exact set analysis over the truth patterns of one admissible scenario
// space. A set is feasible iff some observed pattern contains it.
// This is not a choice/ranking policy or an allocation of physical force.
export const MAX_SET_QUERIES=16;
const MAX_OUTPUT_SETS=4096;
const valid=x=>typeof x==='string'&&x.length>0;
const base={selectionAuthority:false,effective:null};
export const unavailableScenarioSets=reason=>({...base,status:'unavailable',reason,whole:null,maximalFeasible:[],minimalInfeasible:[]});
const invalid=reason=>({...base,status:'invalid-evidence',reason,whole:null,maximalFeasible:[],minimalInfeasible:[]});
export function analyzeScenarioSets(queryIds,patterns){
 if(!Array.isArray(queryIds)||queryIds.some(id=>!valid(id))||new Set(queryIds).size!==queryIds.length||!Array.isArray(patterns))return invalid('identity');
 const n=queryIds.length;
 if(n>MAX_SET_QUERIES)return unavailableScenarioSets('set-query-budget');
 const size=2**n,full=size-1,exact=new Float64Array(size),witnesses=new Map();
 let admitted=0;
 for(const p of patterns){
  if(!p||!Number.isInteger(p.mask)||p.mask<0||p.mask>full||!Number.isSafeInteger(p.count)||p.count<=0||
   witnesses.has(p.mask)||!p.witness||typeof p.witness!=='object'||Array.isArray(p.witness))return invalid('pattern-contract');
  exact[p.mask]=p.count;witnesses.set(p.mask,p.witness);admitted+=p.count;
  if(!Number.isSafeInteger(admitted))return invalid('count-overflow');
 }
 if(!admitted)return {...base,status:'diagnostic',reason:'no-admissible-completion',whole:null,maximalFeasible:[],minimalInfeasible:[]};
 // Superset zeta transform. supports[mask] counts every admissible
 // completion satisfying at least the selected conditions, exactly once.
 const supports=exact.slice();
 for(let bit=1;bit<size;bit*=2)for(let m=0;m<size;m++)if(!(m&bit))supports[m]+=supports[m|bit];
 const ids=mask=>queryIds.filter((_,i)=>Boolean(mask&(1<<i)));
 const label=count=>count===0?'impossible-in-model':count===admitted?'invariant-in-model':'possible-not-invariant';
 const whole={queryIds:[...queryIds],state:label(supports[full]),supportCount:supports[full],witness:witnesses.get(full)??null};
 const maximalFeasible=[],minimalInfeasible=[];
 for(let mask=0;mask<size;mask++){
  if(supports[mask]>0){
   // All one-element extensions fail iff every proper superset fails.
   let maximal=true;
   for(let b=1;b<size;b*=2)if(!(mask&b)&&supports[mask|b]>0){maximal=false;break;}
   if(maximal)maximalFeasible.push({queryIds:ids(mask),supportCount:supports[mask],witness:witnesses.get(mask)});
  }else{
   // All immediate subsets must be feasible (inclusion-minimal core).
   let minimal=true;const removals=[];
   for(let i=0;i<n;i++){const b=1<<i;if(mask&b){const count=supports[mask^b];if(count===0){minimal=false;break;}removals.push({removedQueryId:queryIds[i],supportCount:count});}}
   if(minimal)minimalInfeasible.push({queryIds:ids(mask),supportCount:0,removals});
  }
  if(maximalFeasible.length+minimalInfeasible.length>MAX_OUTPUT_SETS)return {...unavailableScenarioSets('set-output-budget'),whole};
 }
 return {...base,status:'diagnostic',reason:null,whole,maximalFeasible,minimalInfeasible,
  summary:{maximalFeasible:maximalFeasible.length,minimalInfeasible:minimalInfeasible.length,
   higherOrderInfeasible:minimalInfeasible.filter(x=>x.queryIds.length>=3).length}};
}
