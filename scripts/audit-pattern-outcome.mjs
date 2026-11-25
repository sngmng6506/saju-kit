import {readFileSync} from 'node:fs';
import {analyzePatternOutcome,PATTERN_OUTCOME_VERSION} from '../src/index.js';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-classical-v2.json',import.meta.url),'utf8'));
const counts={},rows=[];
for(const c of data.cases){
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
 const result=analyzePatternOutcome({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_VERSION});
 const reviews=result.reviews.filter(r=>r.status!=='out-of-scope'&&r.family===c.annotation.expectedFamily);
 const observed=[...new Set(reviews.flatMap(r=>r.rules.filter(x=>x.observed===true).map(x=>x.id)))].sort();
 if(c.eligible)for(const id of observed)counts[id]=(counts[id]??0)+1;
 rows.push({id:c.id,eligible:c.eligible,expectedFamily:c.annotation.expectedFamily,candidateReviews:reviews.length,observed,
  sourceOutcomeLabel:c.annotation.formed??null});
}
console.log(JSON.stringify({policy:PATTERN_OUTCOME_VERSION,scope:'structural coverage only; no outcome accuracy or independent labels',total:rows.length,eligible:rows.filter(r=>r.eligible).length,eligibleRuleCaseCounts:counts,rows},null,2));
