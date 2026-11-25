import {readFileSync} from 'node:fs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeCombinationContext} from '../src/features/pattern/outcome-combination-context.js';
import {observeLiteralSourceRelation} from './lib/pattern-outcome-source-trace.mjs';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-role-flow-source-v1.json',import.meta.url),'utf8'));
const contrasts=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-role-contrast-v1.json',import.meta.url),'utf8'));
const actionSource=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-mechanism-source-v2.json',import.meta.url),'utf8'));
const rows=[],errors=[],seen=new Set(),coreReplay=[];
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
// Independent preflight: the root/relative-force and combination layers
// must retain every literal action endpoint before any family rule is tested.
for(const [population,cases] of [['role-contrast',data.cases],['action-source',actionSource.cases]])for(const c of cases)for(const complete of [true,false]){
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const stemForce=analyzeStemForceEvidence({saju}),relativeForce=observeRelativeForce(stemForce),formation=analyzeFormationEvidence({saju});
  const prior={completeHour:stemForce.completeHour,stemForce,relativeForce},root=observeRootContext(prior,formation),combination=observeCombinationContext(prior,formation);
  const expected=complete?'diagnostic':'partial',literalIds=stemForce.occurrences.filter(o=>o.layer==='hidden').map(o=>o.id);
  const valid=root.status===expected&&combination.status===expected&&stemForce.completeHour===complete&&
   JSON.stringify(root.slots.map(s=>s.id))===JSON.stringify(literalIds)&&root.clashes.length===formation.clashes.length&&
   root.selectionAuthority===false&&root.rootEffectConfirmed===null&&combination.selectionAuthority===false&&
   combination.removalConfirmed===null&&combination.transformationConfirmed===null&&
   root.comparisons.every(p=>p.forceComparison===null&&(complete||p.sensitivity.relation==='unresolved'));
  const probes=complete?(c.probes??[]).map(p=>{
   const literal=observeLiteralSourceRelation(c,p),hits=p.kind==='combine'?combination.pairs.filter(x=>x.participants.length===2&&x.participants.includes(p.from)&&x.participants.includes(p.to)):
    relativeForce.edges.filter(e=>e.from===p.from&&e.to===p.to&&e.kind===p.kind);
   return {id:p.id,observed:literal.status==='literal-relation-observed'&&hits.length===1,relationCount:hits.length,effectAgreement:null};
  }):[];
  if(!valid||probes.some(p=>!p.observed))errors.push({population,id:c.id,complete,error:'core-preflight-integrity'});
  coreReplay.push({population,id:c.id,complete,rootStatus:root.status,combinationStatus:combination.status,valid,probes,
   changedComparisons:root.comparisons.filter(p=>p.original.relation!==p.sensitivity.relation).length,effectAgreement:null});
 }catch(e){errors.push({population,id:c.id,complete,error:e.message});}
}
const expectedReplay=2*(data.cases.length+actionSource.cases.length),expectedActionProbes=actionSource.cases.flatMap(c=>c.probes).length;
const replayIds=coreReplay.map(r=>JSON.stringify([r.population,r.id,r.complete]));
const executedActionProbes=coreReplay.filter(r=>r.population==='action-source').flatMap(r=>r.probes).length;
if(coreReplay.length!==expectedReplay||new Set(replayIds).size!==expectedReplay||executedActionProbes!==expectedActionProbes)errors.push('core-preflight-coverage');
const coreReplaySummary={expectedReplay,executedReplay:coreReplay.length,expectedActionProbes,executedActionProbes,
 observedActionProbes:coreReplay.flatMap(r=>r.probes).filter(p=>p.observed).length,independentGold:0,effectAgreement:null};
console.log(JSON.stringify({coreReplaySummary,coreReplay,expectedProbes,executedProbes,scope:'exposed source contrasts, core sensitivity not force accuracy',independentGold:0,expectedCases:data.cases.length,executedCases:rows.length,errors,rows},null,2));
if(errors.length||rows.length!==data.cases.length)process.exitCode=1;
