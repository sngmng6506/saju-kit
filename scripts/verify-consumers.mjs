import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,readdirSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8',maxBuffer:16*1024*1024}).trim();
const run=(cwd,exe,args)=>execFileSync(exe,args,{cwd,stdio:'inherit',env:{...process.env,CI:'true'}});
const npm=(cwd,...args)=>{
 if(!process.env.npm_execpath)throw new Error('Invoke through npm run verify:consumers');
 run(cwd,process.execPath,[process.env.npm_execpath,...args]);
};
const list=(cwd,...args)=>git(cwd,...args).split('\n').filter(Boolean);
const sourceFiles=(sha)=>list(root,'ls-tree','-r','--name-only',sha,'src');
const sourceBytes=(sha,path)=>execFileSync('git',['show',sha+':'+path],{cwd:root,maxBuffer:16*1024*1024});
const jsFiles=(dir,pattern)=>readdirSync(dir).filter(n=>pattern.test(n)).sort().map(n=>join(dir,n));
const runRentTests=cwd=>run(cwd,process.execPath,['--test',...jsFiles(join(cwd,'tests'),/\.test\.mjs$/),...jsFiles(join(cwd,'scripts'),/^test_saju_.*\.mjs$/)]);
const args=process.argv.slice(2),mode=args[0],consumerPath=args[1];
if(!['friends','rent'].includes(mode)||!consumerPath||args.length>3)throw new Error('Usage: npm run verify:consumers -- <friends|rent> <checkout> [candidate]');
const consumer=resolve(consumerPath),candidate=git(root,'rev-parse','--verify',(args[2]??'HEAD')+'^{commit}'),consumerSha=git(consumer,'rev-parse','HEAD');
const tmp=mkdtempSync(resolve(tmpdir(),'saju-consumer-')),work=join(tmp,'consumer'),kit=join(tmp,'kit'),added=[];
function checkout(repo,path,sha){git(repo,'worktree','add','--detach',path,sha);added.push([repo,path]);}
try{
 checkout(consumer,work,consumerSha);
 console.log(JSON.stringify({mode,consumerSha,candidate,stage:'baseline'}));
 if(mode==='friends'){
  const lock=readFileSync(join(work,'package-lock.json'));
  npm(work,'ci');npm(work,'run','check');
  checkout(root,kit,candidate);
  const tar=join(tmp,'saju-kit-0.1.0.tgz');
  npm(kit,'pack','--pack-destination',tmp);
  if(!existsSync(tar))throw new Error('Expected package tarball missing: '+tar);
  console.log(JSON.stringify({mode,consumerSha,candidate,stage:'candidate'}));
  npm(work,'install','--no-save','--package-lock=false','--ignore-scripts',tar);
  for(const file of sourceFiles(candidate)){
   if(!readFileSync(join(work,'node_modules','saju-kit',file)).equals(readFileSync(join(kit,file))))throw new Error('Installed candidate differs: '+file);
  }
  if(!readFileSync(join(work,'package-lock.json')).equals(lock))throw new Error('Consumer lock changed');
  npm(work,'run','check');
 }else{
  const pinFile=join(work,'scripts','saju-kit-pin.json'),pin=JSON.parse(readFileSync(pinFile,'utf8'));
  runRentTests(work);
  console.log(JSON.stringify({mode,consumerSha,candidate,stage:'candidate'}));
  const oldToken='kit-'+pin.commit.slice(0,7),newToken='kit-'+candidate.slice(0,7),vendor='site/saju/lib/'+newToken;
  if(oldToken===newToken)throw new Error('Candidate already pinned; baseline only');
  const files={};
  for(const line of list(root,'ls-tree','-r',candidate,'src')){
   const m=line.match(/^100644 blob ([a-f0-9]{40})\tsrc\/(.+)$/);
   if(!m||! /^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.js$/.test(m[2]))throw new Error('Unsupported candidate source entry: '+line);
   const [,hash,name]=m;files[name]=hash;
   const target=join(work,vendor,name);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,sourceBytes(candidate,'src/'+name));
  }
  if(!Object.keys(files).length)throw new Error('Empty candidate source');
  for(const path of list(work,'grep','-l',oldToken,'--','site','scripts','tests')){
   if(path=== 'scripts/saju-kit-pin.json'||path.startsWith(pin.vendor+'/'))continue;
   const p=join(work,path);writeFileSync(p,readFileSync(p,'utf8').replaceAll(oldToken,newToken));
  }
  writeFileSync(pinFile,JSON.stringify({...pin,commit:candidate,vendor,files},null,2)+'\n');
  rmSync(join(work,pin.vendor),{recursive:true,force:true});
  run(work,process.execPath,['scripts/sync-saju-kit.mjs','--check']);
  runRentTests(work);
 }
 console.log(JSON.stringify({mode,consumerSha,candidate,status:'PASS',scope:mode==='friends'?'baseline and candidate tests/typecheck/build':'baseline and candidate native tests and vendor integrity'}));
}finally{
 for(const [repo,path] of added.reverse())git(repo,'worktree','remove','--force',path);
 rmSync(tmp,{recursive:true,force:true});
}
