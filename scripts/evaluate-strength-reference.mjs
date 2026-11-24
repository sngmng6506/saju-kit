import { readFileSync } from 'node:fs';
import { evaluateReferences } from './strength-reference.mjs';
const fixture=JSON.parse(readFileSync(new URL('../test/fixtures/strength-ditiansui-v1.json',import.meta.url),'utf8'));
const result=evaluateReferences(fixture);
if(process.argv.includes('--json')){
  console.log(JSON.stringify(result,null,2));
}else{
  console.table(result.rows.map(({id,reference,category,status,rule,min,max,stable,flags,outcome})=>({
    id,reference,category,status,rule,min,max,stable,flags:flags.join(', '),outcome
  })));
  console.log({policy:result.policy,total:result.total,counts:result.counts});
}
