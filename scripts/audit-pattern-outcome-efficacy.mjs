import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {analyzePatternOutcomeIntegrated,analyzePatternOutcomeEfficacy,PATTERN_OUTCOME_INTEGRATED_VERSION,PATTERN_OUTCOME_EFFICACY_VERSION} from '../src/index.js';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));
const rows=[],counts={};
for(const c of [...data.cases,...data.controls]){
 const id=c.caseId??c.id,saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))};
 try{
  const args={saju,birthBasis:'verified-chart'},a=analyzePatternOutcomeIntegrated({...args,policy:PATTERN_OUTCOME_INTEGRATED_VERSION}),b=analyzePatternOutcomeEfficacy({...args,policy:PATTERN_OUTCOME_EFFICACY_VERSION});
  const {efficacyReview,version,scope,...rest}=b;
  const parity=isDeepStrictEqual(rest,Object.fromEntries(Object.entries(a).filter(([k])=>!['version','scope'].includes(k))));
  const invalid=efficacyReview?.status==='invalid-evidence'||efficacyReview?.effective!==null||efficacyReview?.selectionAuthority!==false;
  for(const q of efficacyReview?.candidates??[])for(const w of q.witnesses)counts[w.status]=(counts[w.status]??0)+1;
  rows.push({id,parity,invalid,efficacyReview});
 }catch(e){rows.push({id,error:{name:e.name,message:e.message,code:e.code??null}});}
}
console.log(JSON.stringify({policy:PATTERN_OUTCOME_EFFICACY_VERSION,scope:'screen counts not efficacy accuracy',expectedCases:data.cases.length+data.controls.length,counts,rows},null,2));
if(rows.some(r=>r.error||!r.parity||r.invalid))process.exitCode=1;
