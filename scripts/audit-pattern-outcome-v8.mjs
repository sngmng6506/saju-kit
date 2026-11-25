import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {analyzePatternOutcomeV7,analyzePatternOutcomeV8,PATTERN_OUTCOME_V7_VERSION,PATTERN_OUTCOME_V8_VERSION} from '../src/index.js';
import {evaluateOutcomeCase,summarizeOutcome} from './lib/pattern-outcome-reference.mjs';
import {mapOutcomeReferenceV6} from './lib/pattern-outcome-v6-mapping.mjs';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));
const chart=c=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))});
const rows=[],regressions=[],invalid=[],classifications={};
for(const c of [...data.cases,...data.controls]){
 const args={saju:chart(c),birthBasis:'verified-chart'},id=c.caseId??c.id;
 const a=analyzePatternOutcomeV7({...args,policy:PATTERN_OUTCOME_V7_VERSION});
 const b=analyzePatternOutcomeV8({...args,policy:PATTERN_OUTCOME_V8_VERSION});
 const {assistantReview,version,scope,...rest}=b;
 if(!isDeepStrictEqual(rest,Object.fromEntries(Object.entries(a).filter(([k])=>!['version','scope'].includes(k)))))regressions.push(id);
 for(const q of assistantReview??[]){
  if(q.status==='invalid-evidence'||q.selectionAuthority||q.assistantGod!==null)invalid.push({id,candidateId:q.candidateId});
  for(const c of q.candidates)classifications[c.classification]=(classifications[c.classification]??0)+1;
 }
 rows.push({id,control:!c.caseId,evaluation:evaluateOutcomeCase(mapOutcomeReferenceV6(c),b),assistantReview});
}
const historical=summarizeOutcome(rows.filter(r=>!r.control).map(r=>r.evaluation)),controls=summarizeOutcome(rows.filter(r=>r.control).map(r=>r.evaluation));
console.log(JSON.stringify({policy:PATTERN_OUTCOME_V8_VERSION,scope:'observed-route dependencies, not assistant accuracy',historical,controls,regressions,invalid,classifications,rows},null,2));
if(regressions.length||invalid.length||controls.byStatus.matched!==controls.probes)process.exitCode=1;
