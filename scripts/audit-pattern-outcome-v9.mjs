import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {analyzePatternOutcomeV8,analyzePatternOutcomeV9,PATTERN_OUTCOME_V8_VERSION,PATTERN_OUTCOME_V9_VERSION} from '../src/index.js';
import {evaluateOutcomeCase,summarizeOutcome} from './lib/pattern-outcome-reference.mjs';
import {mapOutcomeReferenceV6} from './lib/pattern-outcome-v6-mapping.mjs';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));
const chart=c=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))});
const rows=[],regressions=[],invalid=[],classifications={};
for(const c of [...data.cases,...data.controls]){
 const args={saju:chart(c),birthBasis:'verified-chart'},id=c.caseId??c.id;
 const a=analyzePatternOutcomeV8({...args,policy:PATTERN_OUTCOME_V8_VERSION});
 const b=analyzePatternOutcomeV9({...args,policy:PATTERN_OUTCOME_V9_VERSION});
 const {purityReview,clarityReview,version,scope,...rest}=b;
 if(!isDeepStrictEqual(rest,Object.fromEntries(Object.entries(a).filter(([k])=>!['version','scope'].includes(k)))))regressions.push(id);
 for(const q of clarityReview??[]){
  if(q.status==='invalid-evidence'||q.selectionAuthority||q.cleanConfirmed!==null||q.turbidConfirmed!==null)invalid.push({id,candidateId:q.candidateId});
  classifications[q.status]=(classifications[q.status]??0)+1;
 }
 if(purityReview&&(purityReview.purityConfirmed!==null||purityReview.selectionAuthority))invalid.push({id,scope:'purity'});
 rows.push({id,control:!c.caseId,evaluation:evaluateOutcomeCase(mapOutcomeReferenceV6(c),b),purityReview,clarityReview});
}
const historical=summarizeOutcome(rows.filter(r=>!r.control).map(r=>r.evaluation)),controls=summarizeOutcome(rows.filter(r=>r.control).map(r=>r.evaluation));
console.log(JSON.stringify({policy:PATTERN_OUTCOME_V9_VERSION,scope:'source-scoped purity and candidate clarity observations, not final judgement',historical,controls,regressions,invalid,classifications,rows},null,2));
if(regressions.length||invalid.length||controls.byStatus.matched!==controls.probes)process.exitCode=1;
