import {readFileSync} from 'node:fs';
import {validateNatalPillars} from '../src/core/natal.js';
import {adjudicateChart} from './lib/pattern-outcome-adjudication.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../test/fixtures/'+n,import.meta.url),'utf8'));
const data=read('pattern-outcome-prospective-v1.json'),old=read('pattern-classical-v2.json'),dev=read('pattern-outcome-reference-v1.json'),queue=read('pattern-outcome-adjudication-v1.json');
const seen=new Set([...old.cases,...dev.cases,...dev.controls,...queue.chartQueue].map(c=>JSON.stringify(c.pillars))),ids=new Set(),errors=[],rows=[];
for(const c of data.cases){
 const k=JSON.stringify(c.pillars),duplicate=seen.has(k);
 if(ids.has(c.id)||duplicate!==!c.eligible||c.split!=='prospective-source-candidate'||c.finalOutcome!==null||!c.source||!c.sourceReading)errors.push(c.id);
 ids.add(c.id);seen.add(k);
 try{validateNatalPillars({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))});}catch(e){errors.push(c.id+':'+e.message);}
 rows.push({id:c.id,eligible:c.eligible,duplicate,...adjudicateChart(c)});
}
console.log(JSON.stringify({version:data.version,cases:rows.length,eligible:rows.filter(c=>c.eligible).length,verifiedIndependentGold:0,releaseAuthorized:false,errors,rows},null,2));
if(errors.length)process.exitCode=1;
