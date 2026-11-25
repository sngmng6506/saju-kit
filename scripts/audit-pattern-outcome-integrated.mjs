import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeIntegrated,PATTERN_OUTCOME_INTEGRATED_VERSION,analyzePatternOutcomeV9,PATTERN_OUTCOME_V9_VERSION} from '../src/index.js';
import {evaluateOutcomeCase,summarizeOutcome} from './lib/pattern-outcome-reference.mjs';
import {mapOutcomeReferenceV6} from './lib/pattern-outcome-v6-mapping.mjs';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));
const chart=c=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))});
const run=c=>{
 const id=c.caseId??c.id;
 try{
  const r=analyzePatternOutcomeIntegrated({saju:chart(c),birthBasis:'verified-chart',policy:PATTERN_OUTCOME_INTEGRATED_VERSION});
  const mapped=mapOutcomeReferenceV6(c),evaluation=evaluateOutcomeCase(mapped,r);
  const before=evaluateOutcomeCase(mapped,analyzePatternOutcomeV9({saju:chart(c),birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V9_VERSION}));
  const regressions=before.probes.filter((p,i)=>p.status==='matched'&&evaluation.probes[i].status!=='matched').map(p=>p.id);
  return {id,evaluation,regressions,integrity:r.integrity,authorityViolation:r.selectionAuthority!==false||['formed','broken','rescued','assistantGod','selectedPattern','usefulElement'].some(k=>r[k]!==null),
   storage:r.reviews.filter(q=>q.storageProjection).map(q=>({candidateId:q.candidateId,rules:q.rules.map(r=>r.id)}))};
 }catch(e){return {id,error:{name:e.name,message:e.message,code:e.code??null}};}
};
const historical=data.cases.map(run),controls=data.controls.map(run),rows=[...historical,...controls];
const errors=rows.filter(r=>r.error),invalid=rows.filter(r=>r.authorityViolation||(!r.error&&r.integrity?.status!=='consistent'));
const hs=summarizeOutcome(historical.filter(r=>r.evaluation).map(r=>r.evaluation)),cs=summarizeOutcome(controls.filter(r=>r.evaluation).map(r=>r.evaluation));
const total=data.cases.flatMap(c=>c.probes).length,controlTotal=data.controls.flatMap(c=>c.probes).length;
console.log(JSON.stringify({policy:PATTERN_OUTCOME_INTEGRATED_VERSION,historical:{...hs,fixedTotal:total,fixedRecall:hs.positiveHits/total},controls:{...cs,fixedTotal:controlTotal},
 errors,invalid,regressions:rows.flatMap(r=>(r.regressions??[]).map(probeId=>({id:r.id,probeId}))),rows},null,2));
if(errors.length||invalid.length||rows.some(r=>r.regressions?.length)||cs.byStatus.matched!==controlTotal)process.exitCode=1;
