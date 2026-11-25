import {readFileSync} from 'node:fs';
import {analyzeUsefulElementSynthesis,USEFUL_ELEMENT_SYNTHESIS_VERSION} from '../src/index.js';
const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-reference-v1.json',import.meta.url),'utf8'));
const counts={},rows=[],errors=[];
for(const c of [...data.cases,...data.controls]){
 const id=c.caseId??c.id;
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,c.pillars[i]?{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}:null]))};
  const r=analyzeUsefulElementSynthesis({saju,birthBasis:'verified-chart',policy:USEFUL_ELEMENT_SYNTHESIS_VERSION});
  if(!['diagnostic','partial'].includes(r.status)||r.selectionAuthority!==false||r.usefulElement!==null||r.favorableElements!==null||r.unfavorableElements!==null||r.elements.some(e=>e.favorable!==null||e.unfavorable!==null))errors.push(id);
  const k=r.balance?.directionComparison??r.status;counts[k]=(counts[k]??0)+1;
  rows.push({id,status:r.status,directionComparison:k,candidateCount:r.candidates.length,routeContacts:r.candidates.flatMap(c=>c.routeContacts).length});
 }catch(e){errors.push({id,error:e.message});}
}
console.log(JSON.stringify({policy:USEFUL_ELEMENT_SYNTHESIS_VERSION,scope:'development composition integrity not accuracy',expectedCases:data.cases.length+data.controls.length,counts,errors,rows,decisionAuthority:false},null,2));
if(errors.length||rows.length!==data.cases.length+data.controls.length)process.exitCode=1;
