import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});
const pillar=text=>({stem:text[0],branch:text[1],text});
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?pillar(ps[i]):null]))});
function capture(fn,input,context){try{return {result:fn(input,context)};}catch(e){return {error:{name:e.name,code:e.code,message:e.message}};}}
export async function verifyRefactor({baseline,policies,neutralPolicies=[],extra}){
 const tmp=mkdtempSync(resolve(tmpdir(),'saju-refactor-')),checkout=resolve(tmp,'baseline');
 let added=false,checks=0;
 try{
  git('worktree','add','--detach',checkout,baseline);added=true;
  const old=await import(pathToFileURL(resolve(checkout,'src/index.js')).href),now=await import(pathToFileURL(resolve(root,'src/index.js')).href);
  // Historical refactor baselines predate this explicitly additive research API.
  // Do not waive removed or unrelated newly added exports.
  const additions=['analyzePatternOutcome','PATTERN_OUTCOME_VERSION','analyzePatternOutcomeV2','PATTERN_OUTCOME_V2_VERSION','analyzePatternOutcomeV3','PATTERN_OUTCOME_V3_VERSION','analyzePatternOutcomeV4','PATTERN_OUTCOME_V4_VERSION','analyzePatternOutcomeV5','PATTERN_OUTCOME_V5_VERSION','analyzePatternOutcomeV6','PATTERN_OUTCOME_V6_VERSION','analyzePatternOutcomeV7','PATTERN_OUTCOME_V7_VERSION','analyzePatternOutcomeV8','PATTERN_OUTCOME_V8_VERSION','analyzePatternOutcomeV9','PATTERN_OUTCOME_V9_VERSION','analyzePatternOutcomeAssistantExtension','PATTERN_OUTCOME_ASSISTANT_EXTENSION_VERSION','analyzePatternOutcomeIntegrated','PATTERN_OUTCOME_INTEGRATED_VERSION','analyzePatternOutcomeEfficacy','PATTERN_OUTCOME_EFFICACY_VERSION','analyzePatternOutcomeV10','PATTERN_OUTCOME_V10_VERSION'].filter(key=>!Object.hasOwn(old,key));
  for(const key of additions)assert.ok(Object.hasOwn(now,key),'approved additive export '+key);
  assert.deepEqual(Object.keys(now).filter(key=>!additions.includes(key)).sort(),Object.keys(old).sort(),'public exports (excluding approved outcome additions)');
  const corpus=JSON.parse(readFileSync(resolve(checkout,'test/fixtures/pattern-classical-v2.json'),'utf8')).cases;
  const cases=corpus.map(c=>({id:c.id,saju:chart(c.pillars)}));
  const stems='갑을병정무기경신임계',branches='자축인묘진사오미신유술해',p=i=>stems[i%10]+branches[i%12];
  for(let d=0;d<10;d++)for(let m=0;m<12;m++)for(const partial of [false,true])cases.push({id:'synthetic:'+d+':'+m+':'+partial,saju:chart([p((m+3)%60),p(m),p(d),partial?null:p((d+m+9)%60)])});
  function compare(name,input,label,context,requireSuccess=false){
   const resolveExport=module=>name.split('.').reduce((value,key)=>value?.[key],module);
   const oldFn=resolveExport(old),newFn=resolveExport(now);
   assert.equal(typeof oldFn,'function',name+' baseline export');
   assert.equal(typeof newFn,'function',name+' current export');
   const before=JSON.stringify(input),expected=capture(oldFn,input,context),actual=capture(newFn,input,context);
   if(requireSuccess)assert.ok(!expected.error,'baseline unexpected error '+name+' '+label);
   assert.deepEqual(actual,expected,name+' '+label);assert.equal(JSON.stringify(input),before);checks++;
  }
  for(const [name,policy] of policies){
   for(const c of cases)compare(name,{saju:c.saju,birthBasis:'verified-chart',policy},c.id,undefined,true);
   const sample=cases[0].saju;
   for(const input of [null,[],{}, {saju:sample,policy:'wrong',birthBasis:'verified-chart'}, {saju:sample,policy,birthBasis:'provisional-chart'}, {saju:sample,policy,birthBasis:'wrong'}, {saju:null,policy,birthBasis:'verified-chart'}])
    compare(name,input,'boundary');
   if(neutralPolicies.includes(policy))for(const c of cases.filter(x=>x.saju.pillars.hour!==null).slice(0,24))
    compare(name,{saju:c.saju,birthBasis:'verified-chart',policy},c.id+' neutral',{seasonMode:'neutral'},true);
  }
  if(extra)await extra({old,now,compare,cases});
  return {baseline,checks,charts:cases.length,policies:policies.length,publicExports:Object.keys(now).length};
 }finally{if(added)git('worktree','remove','--force',checkout);rmSync(tmp,{recursive:true,force:true});}
}
