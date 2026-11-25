import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
import {validateMechanismSource,evaluateMechanismSourceCase,summarizeMechanismSource} from './lib/pattern-outcome-mechanism-source.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../test/fixtures/'+n,import.meta.url),'utf8'));
const source=read('pattern-outcome-mechanism-source-v2.json'),development=read('pattern-outcome-reference-v1.json');
const errors=validateMechanismSource(source,development),rows=[];
for(const c of source.cases)try{
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
 const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 rows.push({id:c.id,probes:evaluateMechanismSourceCase(c,r)});
}catch(e){rows.push({id:c.id,error:{name:e.name,message:e.message,code:e.code??null},probes:[]});}
const summary=summarizeMechanismSource(source,rows);
console.log(JSON.stringify({version:source.version,scope:source.scope,fixtureErrors:errors,summary,rows},null,2));
if(errors.length||!summary.gatePassed)process.exitCode=1;
