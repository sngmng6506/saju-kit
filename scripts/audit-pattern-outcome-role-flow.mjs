import {readFileSync} from 'node:fs';
import {evaluateRoleContrast,summarizeRoleContrasts} from './lib/pattern-outcome-role-contrast.mjs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-role-flow-source-v1.json',import.meta.url),'utf8'));
const contrasts=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-role-contrast-v1.json',import.meta.url),'utf8'));
const rows=[],errors=[],seen=new Set(),contrastRows=[];
for(const c of data.cases){
 if(seen.has(c.id)){errors.push(c.id+':duplicate');continue;}seen.add(c.id);
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION}),m=r.efficacyReview?.mechanismReview;
  if(r.decisionReview.status!=='abstained'||!m||m.capacityComparisons.status==='invalid-evidence'||m.capacityComparisons.effectiveForce!==null||
   m.candidates.some(q=>!q.roleFlow||q.roleFlow.status==='invalid-evidence'||q.roleFlow.netEffectConfirmed!==null||q.roleFlow.selectionAuthority!==false||
    q.roleFlow.routes.some(w=>w.netEffectConfirmed!==null)||q.roleFlow.mediationContexts.some(w=>w.mediationConfirmed!==null)))errors.push(c.id+':integrity');
  const contrast=contrasts.cases.find(x=>x.id===c.id);
  if(!contrast||!m)errors.push(c.id+':contrast-missing');
  else contrastRows.push(evaluateRoleContrast(contrast,m.roleCapacity,m.capacityComparisons));
  if(m?.candidates.some(q=>!q.rolePriority||q.rolePriority.status==='invalid-evidence'||q.rolePriority.preferredInterpretation!==null||q.rolePriority.selectionAuthority!==false||q.rolePriority.contexts.some(x=>x.priorityConfirmed!==null)))errors.push(c.id+':priority-integrity');
  if(m?.candidates.some(q=>{
   const o=q.rolePriority?.objectiveReview;
   return !o||o.status==='invalid-evidence'||o.selectionAuthority!==false||o.preferredObjective!==null||
    o.objectives.some(x=>x.effectConfirmed!==null||x.actualDemand!==null||x.excessConfirmed!==null||x.deficiencyConfirmed!==null);
  }))errors.push(c.id+':objective-integrity');
  if(m?.candidates.some(q=>{
   const s=q.rolePriority?.killingStrategies;
   return !s||s.status==='invalid-evidence'||s.selectionAuthority!==false||s.preferredStrategy!==null||s.effectConfirmed!==null||
    [...s.food,...s.mediation,...s.comparisons].some(x=>x.effectConfirmed!==null);
  }))errors.push(c.id+':killing-strategy-integrity');
  if(m?.candidates.some(q=>{
   const w=q.rolePriority?.killingWealth;
   return !w||w.status==='invalid-evidence'||w.selectionAuthority!==false||w.preferredObjective!==null||w.effectConfirmed!==null||
    [...w.supply,...w.dualRoles,...w.mediationContacts].some(x=>x.effectConfirmed!==null||
     x.objectives.some(o=>o.effectConfirmed!==null||o.actualDemand!==null))||
    [...w.dualRoles,...w.mediationContacts].some(x=>x.netEffectConfirmed!==null)||
    w.dualRoles.some(x=>x.killingDeficiencyConfirmed!==null||x.outputRestored!==null)||
    w.mediationContacts.some(x=>x.placement.protectionConfirmed!==null);
  }))errors.push(c.id+':killing-wealth-integrity');
  const active=r.reviews.filter(q=>q.family===c.family&&q.status!=='out-of-scope').map(q=>q.candidateId);
  const flows=(m?.candidates??[]).filter(q=>active.includes(q.candidateId)).map(q=>q.roleFlow);
  rows.push({id:c.id,reading:c.reading,source:c.source,locator:c.locator,activeCandidates:active,
   ruleCoverage:c.rules.map(ruleId=>({ruleId,observed:flows.some(f=>f.routes.some(w=>w.ruleId===ruleId))})),
   mediationObserved:c.mediationReview?flows.some(f=>f.mediationContexts.length>0):null,
   direction:r.regulationStrength?.direction??null,flows,priorities:(m?.candidates??[]).filter(q=>active.includes(q.candidateId)).map(q=>q.rolePriority),effectAgreement:null});
 }catch(e){errors.push({id:c.id,error:e.message});}
}
const contrastSummary=summarizeRoleContrasts(contrasts,contrastRows);
const objectiveCounts={};for(const row of rows)for(const p of row.priorities)for(const o of p.objectiveReview?.objectives??[]){const k=o.clause+':'+o.objective+':'+o.conditionalStatus;objectiveCounts[k]=(objectiveCounts[k]??0)+1;}
const strategyCounts={};
for(const row of rows)for(const p of row.priorities){
 const s=p.killingStrategies;if(!s)continue;
 for(const [kind,items] of [['food',s.food],['mediation',s.mediation]])for(const x of items){
  const k=kind+':'+x.conditionalStatus;strategyCounts[k]=(strategyCounts[k]??0)+1;
 }
 for(const x of s.comparisons){const k='joint:'+x.simultaneousStatus;strategyCounts[k]=(strategyCounts[k]??0)+1;}
}
const wealthObjectiveCounts={};
for(const row of rows)for(const p of row.priorities){
 const w=p.killingWealth;if(!w)continue;
 for(const [kind,items] of [['supply',w.supply],['dual',w.dualRoles],['mediation',w.mediationContacts]])for(const x of items)for(const o of x.objectives){
  const k=kind+':'+o.id+':'+o.conditionalStatus;wealthObjectiveCounts[k]=(wealthObjectiveCounts[k]??0)+1;
 }
}
// Zhou was not in the six-case role contrast fixture. Replay it separately
// rather than modify the frozen comparison denominator or call it new gold.
const mechanismSource=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-mechanism-source-v2.json',import.meta.url),'utf8'));
const killingSourceRows=[];
for(const id of ['zhou-killing','he-killing-resource']){
 try{
  const c=id==='zhou-killing'?mechanismSource.cases.find(c=>c.id===id):data.cases.find(c=>c.id===id);
  if(!c)throw Error('missing source case');
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  const policies=r.efficacyReview.mechanismReview.candidates.map(c=>c.rolePriority.killingWealth);
  const matched=id==='zhou-killing'?policies.flatMap(p=>p.dualRoles).filter(x=>x.wealthId==='visible:hour'&&x.resourceId==='visible:month'&&x.outputId==='visible:year'&&x.killingId==='hidden:month:계'):
   policies.flatMap(p=>p.mediationContacts).filter(x=>x.wealthId==='visible:year'&&x.resourceId==='visible:hour'&&x.killingId==='visible:month');
  if(!matched.length||r.decisionReview.status!=='abstained'||policies.some(p=>p.status==='invalid-evidence'||p.selectionAuthority!==false)||
   matched.some(x=>x.effectConfirmed!==null||x.objectives.some(o=>o.effectConfirmed!==null||o.actualDemand!==null)))errors.push(id+':K03-source-integrity');
  killingSourceRows.push({id,source:c.source,matched,structuralCoverage:matched.length>0,effectAgreement:null,independentGold:false});
 }catch(e){errors.push({id,error:e.message});}
}
console.log(JSON.stringify({killingSourceRows,wealthObjectiveCounts,strategyCounts,objectiveCounts,contrastSummary,contrastRows,version:data.version,scope:data.scope,independentGold:0,expectedCases:data.cases.length,executedCases:rows.length,errors,rows},null,2));
if(errors.length||contrastSummary.errors.length||rows.length!==data.cases.length)process.exitCode=1;
