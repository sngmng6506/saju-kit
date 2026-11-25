import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {analyzePatternOutcomeIntegrated,analyzePatternOutcomeEfficacy,PATTERN_OUTCOME_INTEGRATED_VERSION,PATTERN_OUTCOME_EFFICACY_VERSION} from '../src/index.js';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));
const rows=[],counts={},mechanismCounts={},combinationCounts={},branchCounts={},monthClauseCounts={};
for(const c of [...data.cases,...data.controls]){
 const id=c.caseId??c.id,saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))};
 try{
  const args={saju,birthBasis:'verified-chart'},a=analyzePatternOutcomeIntegrated({...args,policy:PATTERN_OUTCOME_INTEGRATED_VERSION}),b=analyzePatternOutcomeEfficacy({...args,policy:PATTERN_OUTCOME_EFFICACY_VERSION});
  const {efficacyReview,version,scope,...rest}=b;
  const parity=isDeepStrictEqual(rest,Object.fromEntries(Object.entries(a).filter(([k])=>!['version','scope'].includes(k))));
  const invalid=efficacyReview?.status==='invalid-evidence'||efficacyReview?.effective!==null||efficacyReview?.selectionAuthority!==false;
  for(const q of efficacyReview?.candidates??[])for(const w of q.witnesses)counts[w.status]=(counts[w.status]??0)+1;
  const m=efficacyReview?.mechanismReview;
  const mechanismInvalid=!m||m.effective!==null||m.selectionAuthority!==false||m.candidates.length!==efficacyReview.candidates.length||
   m.candidates.some(q=>q.status==='invalid-evidence'||q.effective!==null||q.selectionAuthority!==false||q.routes.some(w=>w.effective!==null));
  for(const q of m?.candidates??[])for(const w of q.routes)mechanismCounts[w.status]=(mechanismCounts[w.status]??0)+1;
  const combo=m?.combinationContext;
  const combinationInvalid=!combo||combo.status==='invalid-evidence'||combo.selectionAuthority!==false||combo.removalConfirmed!==null||combo.transformationConfirmed!==null||
   combo.pairs.some(p=>p.removalConfirmed!==null||p.transformation.transformationConfirmed!==null)||
   combo.branchFormations.some(p=>p.transformationConfirmed!==null)||
   m.candidates.some(q=>!q.combinationRoles||q.combinationRoles.status==='invalid-evidence'||q.combinationRoles.removalConfirmed!==null);
  for(const p of combo?.pairs??[])combinationCounts[p.contactHypothesis]=(combinationCounts[p.contactHypothesis]??0)+1;
  const branch=m?.branchContext,month=m?.monthChange;
  const branchInvalid=!branch||!month||branch.status==='invalid-evidence'||month.status==='invalid-evidence'||branch.accessConfirmed!==null||branch.transformationConfirmed!==null||month.selectedPattern!==null||month.selectionAuthority!==false||
   branch.hidden.some(h=>h.literalAccessConfirmed!==null||h.independentSupplyConfirmed!==null)||branch.formations.some(f=>f.transformationConfirmed!==null)||
   m.candidates.some(q=>!q.branchAccess||q.branchAccess.status==='invalid-evidence'||q.branchAccess.effective!==null);
  for(const h of branch?.hidden??[])branchCounts[h.accessHypothesis]=(branchCounts[h.accessHypothesis]??0)+1;
  for(const c of month?.sourceClauses??[]){const k=c.id+':'+String(c.matched);monthClauseCounts[k]=(monthClauseCounts[k]??0)+1;}
  rows.push({id,parity,invalid:invalid||mechanismInvalid||combinationInvalid||branchInvalid,efficacyReview});
 }catch(e){rows.push({id,error:{name:e.name,message:e.message,code:e.code??null}});}
}
console.log(JSON.stringify({policy:PATTERN_OUTCOME_EFFICACY_VERSION,scope:'screen counts not efficacy accuracy',expectedCases:data.cases.length+data.controls.length,counts,mechanismCounts,combinationCounts,branchCounts,monthClauseCounts,rows},null,2));
if(rows.some(r=>r.error||!r.parity||r.invalid))process.exitCode=1;
