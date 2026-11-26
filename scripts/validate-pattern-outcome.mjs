import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {TEST_DOMAINS} from './lib/domain-manifest.mjs';
import {inspectValidationState,validationPassed} from './lib/validation-provenance.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(process.argv[2]??resolve(root,'outcome-validation'));
mkdirSync(out,{recursive:true});
const nativeFiles=Object.values(TEST_DOMAINS).flat();
const jobs=[
 ['native',['--test','--test-reporter=./scripts/lib/failures-reporter.mjs',...nativeFiles]],
 ...['architecture','layout','dead-code','pattern-outcome','pattern-outcome-reference','pattern-outcome-v2','pattern-outcome-v3','pattern-outcome-v4','pattern-outcome-v5','pattern-outcome-v6','pattern-outcome-v7','pattern-outcome-v8','pattern-outcome-v9','pattern-outcome-adjudication','pattern-outcome-prospective','pattern-outcome-integrated','pattern-outcome-efficacy','pattern-outcome-joint','pattern-outcome-mechanism-source','pattern-outcome-role-flow','pattern-outcome-root-context','pattern-outcome-command-replay','pattern-outcome-v10','pattern-outcome-modeled-consequences','pattern-outcome-modeled-coverage','pattern-outcome-native-p1'].map(n=>[n,['scripts/audit-'+n+'.mjs']]),
 ['useful-element-synthesis',['scripts/audit-useful-element-synthesis.mjs']],
 ['useful-element-priority',['scripts/audit-useful-element-priority.mjs']],
 ['useful-element-method-links',['scripts/audit-useful-element-method-links.mjs']],
 ['benchmark-synthesis',['scripts/benchmark-synthesis.mjs','3']],
 ['benchmark',['scripts/benchmark-outcome.mjs','3']]
];
const runGit=args=>spawnSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024});
const reportPaths=['summary.json',...jobs.flatMap(([name])=>[name+'.stdout.txt',name+'.stderr.txt'])].map(name=>resolve(out,name));
const before=inspectValidationState(root,reportPaths,runGit);
console.error('VALIDATION | HEAD: '+(before.head??'unknown')+' | native files: '+nativeFiles.length+' | clean: '+before.clean);
const receipts=[];
for(const [name,args] of jobs){
 const start=performance.now(),r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:128*1024*1024,timeout:600000});
 const stdout=name+'.stdout.txt',stderr=name+'.stderr.txt';
 writeFileSync(resolve(out,stdout),r.stdout??'');writeFileSync(resolve(out,stderr),r.stderr??'');
 const receipt={name,args,exitCode:r.status,signal:r.signal,error:r.error?.message??null,elapsedMs:performance.now()-start,stdout,stderr,passed:r.status===0&&!r.error};
 receipts.push(receipt);console.error((receipt.passed?'PASS ':'FAIL ')+name);
}
const after=inspectValidationState(root,reportPaths,runGit);
const report={schemaVersion:2,head:before.head,finalHead:after.head,dirty:before.dirty,finalDirty:after.dirty,
 provenance:{before,after,nativeFiles,nativeFileCount:nativeFiles.length},node:process.version,platform:process.platform,receipts,
 passed:validationPassed(before,after,receipts),decisionAuthority:false};
writeFileSync(resolve(out,'summary.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
