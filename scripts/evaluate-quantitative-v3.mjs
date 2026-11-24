import {readFileSync} from 'node:fs';
import {evaluateQuantitativeV3} from './quantitative-v3-reference.mjs';
for(const name of ['ordinary-xu-v1.json','strength-ditiansui-v1.json']){
 const fixture=JSON.parse(readFileSync(new URL('../test/fixtures/'+name,import.meta.url),'utf8'));
 const result=evaluateQuantitativeV3(fixture);
 if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));
 else{
  console.log(result.fixtureVersion);
  console.table(result.rows.map(r=>({...r,oldRange:r.oldRange.join('–'),newRange:r.newRange.join('–')})));
  console.table(Object.entries(result.metrics).map(([policy,{agrees,disagrees,abstained}])=>({policy,agrees,disagrees,abstained})));
 }
}
