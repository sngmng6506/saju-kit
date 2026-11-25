import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const baseline=process.argv[2]??'dde2df3feb8433ebdfb924c0eefac957357a19cc';
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});
const tmp=mkdtempSync(resolve(tmpdir(),'saju-refactor-')),checkout=resolve(tmp,'baseline');
let added=false,checks=0;
const names=Array.from({length:10},(_,i)=>i===0?'analyzePatternUsefulElement':'analyzePatternUsefulElementV'+(i+1));
const pillar=text=>({stem:text[0],branch:text[1],text});
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?pillar(ps[i]):null]))});
function capture(fn,input){try{return {result:fn(input)};}catch(e){return {error:{name:e.name,code:e.code,message:e.message}};}}
try{
 git('worktree','add','--detach',checkout,baseline);added=true;
 const old=await import(pathToFileURL(resolve(checkout,'src/index.js')).href),now=await import(pathToFileURL(resolve(root,'src/index.js')).href);
 assert.deepEqual(Object.keys(now).sort(),Object.keys(old).sort(),'public exports');
 const corpus=JSON.parse(readFileSync(resolve(checkout,'test/fixtures/pattern-classical-v2.json'),'utf8')).cases;
 const cases=corpus.map(c=>({id:c.id,saju:chart(c.pillars)}));
 const stems='갑을병정무기경신임계',branches='자축인묘진사오미신유술해',p=i=>stems[i%10]+branches[i%12];
 for(let d=0;d<10;d++)for(let m=0;m<12;m++)for(const partial of [false,true])cases.push({id:'synthetic:'+d+':'+m+':'+partial,saju:chart([p((m+3)%60),p(m),p(d),partial?null:p((d+m+9)%60)])});
 for(let i=0;i<names.length;i++){
  const name=names[i],policy='pattern-useful-element-v'+(i+1);
  for(const c of cases){
   const input={saju:c.saju,birthBasis:'verified-chart',policy},before=JSON.stringify(input);
   const expected=capture(old[name],input),actual=capture(now[name],input);
   assert.ok(!expected.error,'baseline unexpected error '+name+' '+c.id);
   assert.deepEqual(actual,expected,name+' '+c.id);assert.equal(JSON.stringify(input),before);checks++;
  }
  const sample=cases[0].saju;
  for(const input of [null,[],{}, {saju:sample,policy:'wrong',birthBasis:'verified-chart'}, {saju:sample,policy,birthBasis:'provisional-chart'}, {saju:sample,policy,birthBasis:'wrong'}, {saju:null,policy,birthBasis:'verified-chart'}]){
   assert.deepEqual(capture(now[name],input),capture(old[name],input),name+' boundary');checks++;
  }
 }
 console.log(JSON.stringify({baseline,checks,charts:cases.length,policies:names.length,publicExports:Object.keys(now).length},null,2));
}finally{if(added)git('worktree','remove','--force',checkout);rmSync(tmp,{recursive:true,force:true});}
