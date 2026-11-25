import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-role-flow-source-v1.json',import.meta.url),'utf8'));
const rows=[],errors=[],seen=new Set();
for(const c of data.cases){
 if(seen.has(c.id)){errors.push(c.id+':duplicate');continue;}seen.add(c.id);
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION}),m=r.efficacyReview?.mechanismReview;
  if(r.decisionReview.status!=='abstained'||!m||m.capacityComparisons.status==='invalid-evidence'||m.capacityComparisons.effectiveForce!==null||
   m.candidates.some(q=>!q.roleFlow||q.roleFlow.status==='invalid-evidence'||q.roleFlow.netEffectConfirmed!==null||q.roleFlow.selectionAuthority!==false||
    q.roleFlow.routes.some(w=>w.netEffectConfirmed!==null)||q.roleFlow.mediationContexts.some(w=>w.mediationConfirmed!==null)))errors.push(c.id+':integrity');
  const active=r.reviews.filter(q=>q.family===c.family&&q.status!=='out-of-scope').map(q=>q.candidateId);
  const flows=(m?.candidates??[]).filter(q=>active.includes(q.candidateId)).map(q=>q.roleFlow);
  rows.push({id:c.id,reading:c.reading,source:c.source,locator:c.locator,activeCandidates:active,
   ruleCoverage:c.rules.map(ruleId=>({ruleId,observed:flows.some(f=>f.routes.some(w=>w.ruleId===ruleId))})),
   mediationObserved:c.mediationReview?flows.some(f=>f.mediationContexts.length>0):null,
   direction:r.regulationStrength?.direction??null,flows,effectAgreement:null});
 }catch(e){errors.push({id:c.id,error:e.message});}
}
console.log(JSON.stringify({version:data.version,scope:data.scope,independentGold:0,expectedCases:data.cases.length,executedCases:rows.length,errors,rows},null,2));
if(errors.length||rows.length!==data.cases.length)process.exitCode=1;
