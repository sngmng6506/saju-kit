import {readFileSync} from 'node:fs';
import {buildOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/features/pattern/outcome-review-v10.js';
import {bindDeskReview,summarizeDeskReview} from './lib/pattern-outcome-desk-review.mjs';
import {traceMechanismSource,summarizeSourceTrace} from './lib/pattern-outcome-source-trace.mjs';
import {validateMechanismSource,evaluateMechanismSourceCase,summarizeMechanismSource} from './lib/pattern-outcome-mechanism-source.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../test/fixtures/'+n,import.meta.url),'utf8'));
const source=read('pattern-outcome-mechanism-source-v2.json'),development=read('pattern-outcome-reference-v1.json');
const desk=read('pattern-outcome-mechanism-desk-review-v1.json'),bound=bindDeskReview(source,desk);
const errors=[...validateMechanismSource(source,development),...bound.errors],rows=[];
for(const c of source.cases)try{
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
 const {prior,result:r}=buildOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 rows.push({id:c.id,probes:evaluateMechanismSourceCase(c,r).map(p=>({...p,trace:traceMechanismSource(c,p,prior,r),deskReview:bound.map.get(JSON.stringify([c.id,p.id]))??null}))});
}catch(e){rows.push({id:c.id,error:{name:e.name,message:e.message,code:e.code??null},probes:[]});}
const summary=summarizeMechanismSource(source,rows),traceSummary=summarizeSourceTrace(rows);
console.log(JSON.stringify({version:source.version,scope:source.scope,fixtureErrors:errors,summary,traceSummary,deskReviewSummary:summarizeDeskReview(rows),rows},null,2));
if(errors.length||!summary.gatePassed||traceSummary.integrityFailures.length)process.exitCode=1;
