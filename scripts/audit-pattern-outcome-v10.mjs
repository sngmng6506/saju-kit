import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {analyzePatternOutcomeV10,analyzePatternOutcomeEfficacy,PATTERN_OUTCOME_V10_VERSION,PATTERN_OUTCOME_EFFICACY_VERSION} from '../src/index.js';
const read=n=>JSON.parse(readFileSync(new URL('../test/fixtures/'+n,import.meta.url),'utf8'));
const dev=read('pattern-outcome-reference-v1.json'),queue=read('pattern-outcome-adjudication-v1.json');
const groups=[['historical-development',dev.cases],['synthetic-control',dev.controls],['previously-exposed-unlabeled',queue.chartQueue.filter(c=>c.eligible===true)]];
const rows=[],blockers={};
for(const [population,charts] of groups)for(const c of charts){
 const id=c.caseId??c.id,saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))};
 try{
  const args={saju,birthBasis:'verified-chart'},a=analyzePatternOutcomeEfficacy({...args,policy:PATTERN_OUTCOME_EFFICACY_VERSION}),b=analyzePatternOutcomeV10({...args,policy:PATTERN_OUTCOME_V10_VERSION});
  const {decisionReview:d,version,scope,...rest}=b;
  const parity=isDeepStrictEqual(rest,Object.fromEntries(Object.entries(a).filter(([k])=>!['version','scope'].includes(k))));
  const decisions=[d.pattern,d.purity,...d.candidates.flatMap(c=>Object.values(c.decisions))];
  const authorityLeak=decisions.some(x=>x.authorized||x.value!==null)||Object.values(d.release.axes).some(x=>x.authorized)||d.selectionAuthority!==false||
   b.selectionAuthority!==false||['formed','broken','rescued','selectedPattern','assistantGod','patternUsefulGod','usefulElement'].some(k=>b[k]!==null);
  for(const x of decisions)for(const k of x.blockers)blockers[k]=(blockers[k]??0)+1;
  rows.push({population,id,parity,authorityLeak,status:d.status,decisions:decisions.length,abstained:decisions.filter(x=>x.status==='abstained').length});
 }catch(e){rows.push({population,id,error:{name:e.name,message:e.message,code:e.code??null}});}
}
const expectedCases=groups.reduce((n,[,c])=>n+c.length,0);
const failed=rows.filter(r=>r.error||!r.parity||r.authorityLeak||r.status==='invalid-evidence'||r.abstained!==r.decisions);
console.log(JSON.stringify({policy:PATTERN_OUTCOME_V10_VERSION,scope:'abstention contract, not outcome accuracy',expectedCases,executedCases:rows.length,independentGoldCases:0,
 releaseAuthorized:false,failed,blockerCounts:blockers,rows},null,2));
if(failed.length||rows.length!==expectedCases)process.exitCode=1;
