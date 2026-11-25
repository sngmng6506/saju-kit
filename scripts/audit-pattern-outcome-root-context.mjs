import {readFileSync} from 'node:fs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-role-flow-source-v1.json',import.meta.url),'utf8'));
const contrasts=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-role-contrast-v1.json',import.meta.url),'utf8'));
const rows=[],errors=[],seen=new Set();
const reverse=r=>r==='left-evidence-dominates'?'right-evidence-dominates':r==='right-evidence-dominates'?'left-evidence-dominates':r;
for(const c of data.cases){
 if(seen.has(c.id)){errors.push(c.id+':duplicate');continue;}seen.add(c.id);
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const stemForce=analyzeStemForceEvidence({saju}),relativeForce=observeRelativeForce(stemForce),formation=analyzeFormationEvidence({saju});
  const result=observeRootContext({completeHour:stemForce.completeHour,stemForce,relativeForce},formation);
  if(result.status!=='diagnostic'||result.selectionAuthority!==false||result.rootEffectConfirmed!==null||result.slots.some(s=>s.effectiveRoot!==null||s.accessConfirmed!==null))errors.push(c.id+':integrity');
  const source=contrasts.cases.find(x=>x.id===c.id);
  if(!source)errors.push(c.id+':missing-contrast');
  const probeIds=new Set();
  const probes=(source?.probes??[]).map(p=>{
   if(probeIds.has(p.id))errors.push(c.id+':duplicate-probe:'+p.id);probeIds.add(p.id);
   const x=result.comparisons.find(x=>x.left===p.left&&x.right===p.right||x.left===p.right&&x.right===p.left);
   if(!result.occurrences.some(o=>o.id===p.left)||!result.occurrences.some(o=>o.id===p.right))errors.push(c.id+':invalid-probe-endpoint:'+p.id);
   const read=k=>!x?null:x.left===p.left?x[k].relation:reverse(x[k].relation);
   return {...p,original:read('original'),sensitivity:read('sensitivity'),nonseason:read('nonseason'),seasonOnly:read('seasonOnly'),effectAgreement:null};
  });
  rows.push({id:c.id,source:c.source,locator:c.locator,reading:c.reading,probes,result,effectAgreement:null});
 }catch(e){errors.push({id:c.id,error:e.message});}
}
const expectedProbes=contrasts.cases.reduce((n,c)=>n+c.probes.length,0),executedProbes=rows.reduce((n,c)=>n+c.probes.length,0);
if(contrasts.cases.length!==data.cases.length||new Set(contrasts.cases.map(c=>c.id)).size!==contrasts.cases.length||expectedProbes!==executedProbes)errors.push('contrast-coverage');
console.log(JSON.stringify({expectedProbes,executedProbes,scope:'exposed source contrasts, core sensitivity not force accuracy',independentGold:0,expectedCases:data.cases.length,executedCases:rows.length,errors,rows},null,2));
if(errors.length||rows.length!==data.cases.length)process.exitCode=1;
