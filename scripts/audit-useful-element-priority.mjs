import {readFileSync} from 'node:fs';
import {analyzeUsefulElementSynthesis,USEFUL_ELEMENT_SYNTHESIS_VERSION} from '../src/index.js';
const read=n=>JSON.parse(readFileSync(new URL('../test/fixtures/'+n,import.meta.url),'utf8'));
const data=read('useful-element-priority-source-v1.json');
const known=new Set(['pattern-classical-v2.json','pattern-outcome-reference-v1.json','pattern-outcome-prospective-v1.json'].flatMap(n=>read(n).cases.map(c=>JSON.stringify(c.pillars))));
const rows=[],errors=[],ids=new Set();
for(const c of data.cases){
 if(ids.has(c.id)){errors.push(c.id+':duplicate');continue;}ids.add(c.id);
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const r=analyzeUsefulElementSynthesis({saju,birthBasis:'verified-chart',policy:USEFUL_ELEMENT_SYNTHESIS_VERSION}),p=r.priorityReview;
  const hits=p.clauses.filter(x=>x.clauseId===c.expectedClause);
  if(r.status!=='diagnostic'||p.selectionAuthority!==false||p.precedenceConfirmed!==null||p.selectedElement!==null||p.selectedMethod!==null||r.usefulElement!==null||p.clauses.some(c=>c.priorityConfirmed!==null||c.applicableConfirmed!==null)||!hits.length)errors.push(c.id+':scope-or-authority');
  rows.push({id:c.id,overlapsKnownCorpus:known.has(JSON.stringify(c.pillars)),expectedClause:c.expectedClause,scopeObserved:hits.length>0,commentaryReading:c.commentaryReading,directionComparison:r.balance?.directionComparison,clauses:hits,precedenceAgreement:null});
 }catch(e){errors.push({id:c.id,error:e.message});}
}
console.log(JSON.stringify({version:data.version,scope:data.scope,expectedCases:data.cases.length,executedCases:rows.length,scopeObserved:rows.filter(r=>r.scopeObserved).length,independentGold:0,precedenceAgreement:null,errors,rows},null,2));
if(errors.length||rows.length!==data.cases.length)process.exitCode=1;
