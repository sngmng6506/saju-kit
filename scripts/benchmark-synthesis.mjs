import {performance} from 'node:perf_hooks';
import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {buildSynthesis,USEFUL_ELEMENT_SYNTHESIS_VERSION} from '../src/features/useful-element/synthesis.js';
const rounds=Number(process.argv[2]??3);
if(!Number.isSafeInteger(rounds)||rounds<1||rounds>30)throw Error('rounds must be 1..30');
const f=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));
const cases=[...f.cases,...f.controls].map(c=>({id:c.caseId??c.id,input:{saju:{pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))},birthBasis:'verified-chart',policy:USEFUL_ELEMENT_SYNTHESIS_VERSION}}));
const errors=[],timings={shared:[],separate:[]};
const call=(c,shared)=>buildSynthesis(c.input,{shared});
for(const c of cases)try{
 const a=call(c,true),b=call(c,false);
 if(a.status==='invalid-evidence'||!isDeepStrictEqual(a,b))errors.push({id:c.id,error:'invalid or differential parity'});
}catch(e){errors.push({id:c.id,error:e.message});}
if(!errors.length)for(let i=0;i<rounds;i++)for(const c of cases)for(const shared of i%2?[false,true]:[true,false]){
 try{const start=performance.now();call(c,shared);timings[shared?'shared':'separate'].push(performance.now()-start);}
 catch(e){errors.push({id:c.id,round:i,shared,error:e.message});}
}
const summarize=xs=>{const a=[...xs].sort((a,b)=>a-b);return {samples:a.length,p50Ms:a.length?a[Math.ceil(a.length*.5)-1]:null,p95Ms:a.length?a[Math.ceil(a.length*.95)-1]:null,totalMs:xs.reduce((a,b)=>a+b,0)};};
console.log(JSON.stringify({scope:'same-process identical current policy shared vs separate provider; not historical speedup',rounds,cases:cases.length,expectedSamples:rounds*cases.length,parityPassed:!errors.length,shared:summarize(timings.shared),separate:summarize(timings.separate),errors},null,2));
if(errors.length||Object.values(timings).some(xs=>xs.length!==rounds*cases.length))process.exitCode=1;
