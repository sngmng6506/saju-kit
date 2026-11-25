import {performance} from 'node:perf_hooks';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {cpus} from 'node:os';
import * as api from '../src/index.js';
const rounds=Number(process.argv[2]??3);
if(!Number.isSafeInteger(rounds)||rounds<1||rounds>30)throw Error('rounds must be 1..30');
const read=n=>JSON.parse(readFileSync(new URL('../test/fixtures/'+n,import.meta.url),'utf8'));
const dev=read('pattern-outcome-reference-v1.json'),queue=read('pattern-outcome-adjudication-v1.json');
const cases=[...dev.cases,...dev.controls,...queue.chartQueue.filter(c=>c.eligible===true)].map(c=>({id:c.caseId??c.id,saju:{pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))},birthBasis:'verified-chart'}));
const configs=[
 ['v9',api.analyzePatternOutcomeV9,api.PATTERN_OUTCOME_V9_VERSION],
 ['integrated',api.analyzePatternOutcomeIntegrated,api.PATTERN_OUTCOME_INTEGRATED_VERSION],
 ['efficacy',api.analyzePatternOutcomeEfficacy,api.PATTERN_OUTCOME_EFFICACY_VERSION],
 ['v10',api.analyzePatternOutcomeV10,api.PATTERN_OUTCOME_V10_VERSION]
];
const p=(xs,f)=>xs.length?[...xs].sort((a,b)=>a-b)[Math.ceil(xs.length*f)-1]:null;
const results=[];
for(const [name,fn,policy] of configs){
 const call=c=>fn({saju:c.saju,birthBasis:c.birthBasis,policy});
 const errors=[],ok=[],hash=createHash('sha256'),bytes=[],ms=[];
 for(const c of cases)try{
  const r=call(c),j=JSON.stringify(r);hash.update(c.id+'\n'+j+'\n');bytes.push(Buffer.byteLength(j));ok.push(c);
 }catch(e){errors.push({id:c.id,phase:'warmup',message:e.message});}
 for(let i=0;i<rounds;i++)for(const c of ok)try{const start=performance.now();call(c);ms.push(performance.now()-start);}catch(e){errors.push({id:c.id,phase:'measure',round:i,message:e.message});}
 results.push({name,cases:cases.length,expectedSamples:cases.length*rounds,samples:ms.length,p50Ms:p(ms,.5),p95Ms:p(ms,.95),maxJsonBytes:bytes.length?Math.max(...bytes):null,meanJsonBytes:bytes.length?bytes.reduce((a,b)=>a+b,0)/bytes.length:null,digest:hash.digest('hex'),errors});
}
console.log(JSON.stringify({schemaVersion:1,scope:'same-process descriptive timings, no acceptance threshold or cross-policy output equality',rounds,node:process.version,cpu:cpus()[0]?.model??null,results},null,2));
if(results.some(r=>r.errors.length||r.samples!==r.expectedSamples))process.exitCode=1;
