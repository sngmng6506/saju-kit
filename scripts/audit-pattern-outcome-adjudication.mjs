import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {analyzePatternOutcomeV9,PATTERN_OUTCOME_V9_VERSION} from '../src/index.js';
import {evaluateOutcomeCase} from './lib/pattern-outcome-reference.mjs';
import {mapOutcomeReferenceV6} from './lib/pattern-outcome-v6-mapping.mjs';
import {validateAdjudicationFixture,summarizeAdjudication,summarizeIntegration} from './lib/pattern-outcome-adjudication.mjs';
const read=name=>readFileSync(new URL('../test/fixtures/'+name,import.meta.url),'utf8');
const raw=read('pattern-outcome-adjudication-v1.json'),rawDev=read('pattern-outcome-reference-v1.json');
const data=JSON.parse(raw),dev=JSON.parse(rawDev);
const errors=validateAdjudicationFixture(data,dev);
const chart=c=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))});
const run=(c,kind)=>{
 const id=c.caseId??c.id;
 try{
  const r=analyzePatternOutcomeV9({saju:chart(c),birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V9_VERSION});
  const violations=[];
  for(const k of ['formed','broken','rescued','selectedPattern','assistantGod','usefulElement'])if(r[k]!==null)violations.push({kind:'premature-authority',field:k});
  if(r.selectionAuthority!==false)violations.push({kind:'premature-authority',field:'selectionAuthority'});
  for(const q of r.compoundReview??[])for(const v of q.violations)violations.push({candidateId:q.candidateId,...v});
  for(const q of [...(r.assistantReview??[]),...(r.clarityReview??[])])if(q.status==='invalid-evidence'||q.selectionAuthority!==false)violations.push({kind:'invalid-review',candidateId:q.candidateId});
  return {id,kind,probes:evaluateOutcomeCase(mapOutcomeReferenceV6(c),r).probes,violations};
 }catch(e){return {id,kind,error:{name:e.name,code:e.code??null,message:e.message}};}
};
const rows=[...dev.cases.map(c=>run(c,'historical')),...dev.controls.map(c=>run(c,'control'))];
const integration=summarizeIntegration(rows,{historicalCases:dev.cases.length,historicalProbes:dev.cases.flatMap(c=>c.probes).length,controlCases:dev.controls.length,controlProbes:dev.controls.flatMap(c=>c.probes).length});
const hash=s=>createHash('sha256').update(s).digest('hex');
console.log(JSON.stringify({policy:PATTERN_OUTCOME_V9_VERSION,fixtureSha256:hash(raw),developmentSha256:hash(rawDev),fixtureErrors:errors,
 adjudication:summarizeAdjudication(data),integration,rows},null,2));
if(errors.length||!integration.gatePassed)process.exitCode=1;
