import {execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {cpus} from 'node:os';

const script=fileURLToPath(import.meta.url),root=resolve(dirname(script),'..');
const baselineDefault='dde2df3feb8433ebdfb924c0eefac957357a19cc';
const workloads=['calendar','core','pattern-v10','strength-v4','climate-v5','authority-v4','movement-v6','transit-v4'];
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const percentile=(xs,p)=>[...xs].sort((a,b)=>a-b)[Math.ceil(xs.length*p)-1];
function inputs(api){
 return [1980,2000,2020].flatMap(y=>[2,5,8,11].map(m=>{
  const birth={y,m,d:9,hh:12,mm:0},saju=api.getSaju(birth);
  return {birth,saju,gender:m%2?'남':'여'};
 }));
}
function call(api,name,c){
 const {birth,saju,gender}=c;
 const base={saju,birth,birthBasis:'verified-chart'};
 switch(name){
  case 'calendar':return api.getSaju(birth);
  case 'core':return api.analyzeElementStructure({saju});
  case 'pattern-v10':return api.analyzePatternUsefulElementV10({...base,policy:'pattern-useful-element-v10'});
  case 'strength-v4':return api.analyzeMultiaxisStrengthV4({...base,policy:'strength-multiaxis-v4'});
  case 'climate-v5':return api.analyzeClimateUsefulElementV5({...base,policy:'climate-useful-element-v5'});
  case 'authority-v4':return api.analyzeUsefulElementAuthorityV4({...base,policy:'useful-element-authority-v4'});
  case 'movement-v6':{
   const daeun=api.movementV6.getDaeun({saju,birth,gender});
   return api.movementV6.getYearTimeline({saju,daeun,endAge:80});
  }
  case 'transit-v4':return api.analyzeUsefulElementTransitV4({...base,gender,daeunPolicy:'movement-minute-v6',fromYear:birth.y,toYear:birth.y+9,policy:'useful-element-transit-v4'});
  default:throw new Error('Unknown workload '+name);
 }
}
async function worker(checkout,name,rounds){
 if(!workloads.includes(name))throw new Error('Unknown workload '+name);
 const start=performance.now(),api=await import(pathToFileURL(resolve(checkout,'src/index.js')).href);
 const importMs=performance.now()-start;
 const cases=inputs(api);
 for(const c of cases)call(api,name,c);
 const timings=[];
 for(let i=0;i<rounds;i++)for(const c of cases){
  const t=performance.now();call(api,name,c);timings.push(performance.now()-t);
 }
 const hash=createHash('sha256'),bytes=[];
 for(const c of cases){
  const json=JSON.stringify(call(api,name,c));
  if(typeof json!=='string')throw new Error('Non-JSON result '+name);
  bytes.push(Buffer.byteLength(json,'utf8'));hash.update(json+'\n');
 }
 return {cases:cases.length,samples:timings.length,importMs,p50Ms:percentile(timings,.5),p95Ms:percentile(timings,.95),
  meanMs:timings.reduce((a,b)=>a+b,0)/timings.length,
  meanJsonBytes:bytes.reduce((a,b)=>a+b,0)/bytes.length,maxJsonBytes:Math.max(...bytes),
  resultSha256:hash.digest('hex'),peakRssKiB:process.resourceUsage().maxRSS,heapUsedBytesAtEnd:process.memoryUsage().heapUsed};
}
function revision(ref){return git('rev-parse','--verify',ref+'^{commit}');}
function roundsValue(s){const n=Number(s);if(!Number.isSafeInteger(n)||n<1||n>100)throw new Error('Rounds must be 1..100');return n;}
async function main(){
 const args=process.argv.slice(2);
 if(args[0]==='--worker'){
  console.log(JSON.stringify(await worker(args[1],args[2],roundsValue(args[3]))));return;
 }
 if(args.length>3)throw new Error('Usage: npm run benchmark:refactor -- [baseline] [candidate] [rounds]');
 const baseline=revision(args[0]??baselineDefault),candidate=revision(args[1]??'HEAD'),rounds=roundsValue(args[2]??'3');
 const tmp=mkdtempSync(resolve(tmpdir(),'saju-bench-')),added=[];
 try{
  const checkouts={};
  for(const [label,sha] of Object.entries({baseline,candidate})){
   const path=resolve(tmp,label);git('worktree','add','--detach',path,sha);added.push(path);checkouts[label]=path;
  }
  const results=[];
  for(const name of workloads){
   const run=label=>JSON.parse(execFileSync(process.execPath,[script,'--worker',checkouts[label],name,String(rounds)],{encoding:'utf8',maxBuffer:4*1024*1024}));
   const old=run('baseline'),now=run('candidate');
   results.push({name,baseline:old,candidate:now,jsonDigestEqual:old.resultSha256===now.resultSha256,
    p50Ratio:old.p50Ms>0?now.p50Ms/old.p50Ms:null,p95Ratio:old.p95Ms>0?now.p95Ms/old.p95Ms:null});
   console.error('Measured '+name);
  }
  console.log(JSON.stringify({schemaVersion:1,baseline,candidate,rounds,node:process.version,platform:process.platform,arch:process.arch,cpu:cpus()[0]?.model??null,results},null,2));
 }finally{
  for(const path of added.reverse())git('worktree','remove','--force',path);
  rmSync(tmp,{recursive:true,force:true});
 }
}
await main();
