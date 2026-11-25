import {verifyRefactor} from './lib/refactor-equivalence.mjs';
const baseline=process.argv[2]??'6cb229d69b5fe574a84112ced94fc01bec0d5d7d';
const policies=Array.from({length:5},(_,i)=>[i===0?'analyzeClimateUsefulElement':'analyzeClimateUsefulElementV'+(i+1),'climate-useful-element-v'+(i+1)]);
const extra=({old,compare})=>{
 for(const y of [1980,2000,2026])for(let m=1;m<=12;m++)for(const d of [9,23]){
  const birth={y,m,d,hh:12,mm:0},saju=old.getSaju(birth);
  for(const [name,policy] of policies)compare(name,{saju,birth,birthBasis:'verified-chart',policy},'exact birth '+y+'-'+m+'-'+d,undefined,true);
 }
};
console.log(JSON.stringify(await verifyRefactor({baseline,policies,extra}),null,2));
