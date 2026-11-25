import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(process.argv[2]??resolve(root,'outcome-validation'));
mkdirSync(out,{recursive:true});
const jobs=[
 ['native',['--test','--test-reporter=./scripts/lib/failures-reporter.mjs']],
 ...['architecture','layout','dead-code','pattern-outcome','pattern-outcome-reference','pattern-outcome-v2','pattern-outcome-v3','pattern-outcome-v4','pattern-outcome-v5','pattern-outcome-v6','pattern-outcome-v7','pattern-outcome-v8','pattern-outcome-v9','pattern-outcome-adjudication','pattern-outcome-prospective','pattern-outcome-integrated','pattern-outcome-efficacy','pattern-outcome-joint','pattern-outcome-mechanism-source','pattern-outcome-v10'].map(n=>[n,['scripts/audit-'+n+'.mjs']]),
 ['useful-element-synthesis',['scripts/audit-useful-element-synthesis.mjs']],
 ['useful-element-priority',['scripts/audit-useful-element-priority.mjs']],
 ['benchmark',['scripts/benchmark-outcome.mjs','3']]
];
const runGit=args=>spawnSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true}).stdout?.trim()??null;
const head=runGit(['rev-parse','HEAD']),dirty=runGit(['status','--porcelain','--untracked-files=no']);
const receipts=[];
for(const [name,args] of jobs){
 const start=performance.now(),r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:128*1024*1024,timeout:600000});
 const stdout=name+'.stdout.txt',stderr=name+'.stderr.txt';
 writeFileSync(resolve(out,stdout),r.stdout??'');writeFileSync(resolve(out,stderr),r.stderr??'');
 const receipt={name,args,exitCode:r.status,signal:r.signal,error:r.error?.message??null,elapsedMs:performance.now()-start,stdout,stderr,passed:r.status===0&&!r.error};
 receipts.push(receipt);console.error((receipt.passed?'PASS ':'FAIL ')+name);
}
const finalHead=runGit(['rev-parse','HEAD']),finalDirty=runGit(['status','--porcelain','--untracked-files=no']);
const report={schemaVersion:1,head,finalHead,dirty,finalDirty,node:process.version,platform:process.platform,receipts,
 passed:!!head&&head===finalHead&&dirty===''&&finalDirty===''&&receipts.every(r=>r.passed),decisionAuthority:false};
writeFileSync(resolve(out,'summary.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
