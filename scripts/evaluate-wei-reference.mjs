import {readFileSync} from 'node:fs';
import {evaluateWeiReferences} from './wei-reference.mjs';
const fixture=JSON.parse(readFileSync(new URL('../test/fixtures/ordinary-wei-v1.json',import.meta.url),'utf8'));
const r=evaluateWeiReferences(fixture);
if(process.argv.includes('--json'))console.log(JSON.stringify(r,null,2));
else{
 console.table(r.rows.map(x=>({id:x.id,reference:x.reference,structural:x.structural,quantitative:x.quantitative,
   multiaxis:x.multiaxis,rootMin:x.axes.rootCapacity.min,rootMax:x.axes.rootCapacity.max,
   allPressureDominates:x.allPressureDominates})));
 console.log({metrics:r.metrics,byKind:r.byKind,withoutFormationDependent:r.withoutFormationDependent});
}
