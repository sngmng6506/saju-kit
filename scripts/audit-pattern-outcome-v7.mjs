import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {analyzePatternOutcomeV6,analyzePatternOutcomeV7,PATTERN_OUTCOME_V6_VERSION,PATTERN_OUTCOME_V7_VERSION} from '../src/index.js';
import {evaluateOutcomeCase,summarizeOutcome} from './lib/pattern-outcome-reference.mjs';
import {mapOutcomeReferenceV6} from './lib/pattern-outcome-v6-mapping.mjs';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));
const chart=c=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))});
const rows=[],violations=[],regressions=[],motifCounts={};
for(const c of [...data.cases,...data.controls]){
 const args={saju:chart(c),birthBasis:'verified-chart'};
 const a=analyzePatternOutcomeV6({...args,policy:PATTERN_OUTCOME_V6_VERSION});
 const b=analyzePatternOutcomeV7({...args,policy:PATTERN_OUTCOME_V7_VERSION});
 const {compoundReview,version,scope,...rest}=b;
 const old=Object.fromEntries(Object.entries(a).filter(([k])=>!['version','scope'].includes(k)));
 const id=c.caseId??c.id;
 if(!isDeepStrictEqual(rest,old))regressions.push(id);
 const mapped=mapOutcomeReferenceV6(c),before=evaluateOutcomeCase(mapped,a),after=evaluateOutcomeCase(mapped,b);
 if(!isDeepStrictEqual(before,after))regressions.push(id+':reference');
 for(const q of compoundReview??[]){
  for(const v of q.violations)violations.push({id,candidateId:q.candidateId,...v});
  for(const m of q.motifs)if(m.observed===true)motifCounts[m.id]=(motifCounts[m.id]??0)+1;
 }
 rows.push({id,control:!c.caseId,evaluation:after,compound:compoundReview});
}
const historical=summarizeOutcome(rows.filter(r=>!r.control).map(r=>r.evaluation)),controls=summarizeOutcome(rows.filter(r=>r.control).map(r=>r.evaluation));
console.log(JSON.stringify({policy:PATTERN_OUTCOME_V7_VERSION,scope:'compound topology and unchanged fixed reference; no compound accuracy labels',historical,controls,regressions,violations,motifCandidateCounts:motifCounts,rows},null,2));
if(regressions.length||violations.length||controls.byStatus.matched!==controls.probes)process.exitCode=1;
