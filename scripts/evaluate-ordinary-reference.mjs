import {readFileSync} from 'node:fs';
import {evaluateOrdinaryReferences} from './ordinary-reference.mjs';
const fixture=JSON.parse(readFileSync(new URL('../test/fixtures/ordinary-xu-v1.json',import.meta.url),'utf8'));
const result=evaluateOrdinaryReferences(fixture);
if(process.argv.includes('--json')){
 console.log(JSON.stringify(result,null,2));
}else{
 console.table(result.rows.map(r=>({id:r.id,reference:r.reference,v1:r.v1,v2:r.v2,
   v1Structural:r.v1Structural,v2Structural:r.v2Structural,min:r.range.min,max:r.range.max,
   formationSensitive:r.formationSensitive,clashSensitive:r.clashSensitive})));
 console.table(Object.entries(result.metrics).map(([policy,{n,classified,agrees,disagrees,abstained}])=>({
   policy,n,classified,agrees,disagrees,abstained,
   coverage:classified/n,conditionalAgreement:classified?agrees/classified:null
 })));
}
