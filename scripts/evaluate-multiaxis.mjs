import {readFileSync} from 'node:fs';
import {evaluateMultiaxis} from './multiaxis-reference.mjs';
for(const name of ['ordinary-xu-v1.json','strength-ditiansui-v1.json']){
 const r=evaluateMultiaxis(JSON.parse(readFileSync(new URL('../test/fixtures/'+name,import.meta.url),'utf8')));
 if(process.argv.includes('--json'))console.log(JSON.stringify(r,null,2));
 else {
  console.log(r.fixtureVersion);
  console.table(r.rows.map(x=>({id:x.id,reference:x.reference,direction:x.direction,
    rootMin:x.axes.rootCapacity.min,rootMax:x.axes.rootCapacity.max,grounds:x.grounds.join(', ')})));
  console.log({agrees:r.agrees,disagrees:r.disagrees,abstained:r.abstained,matrix:r.matrix});
 }
}
