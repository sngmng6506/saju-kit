import {readFileSync} from 'node:fs';
import {evaluateRanYuan} from './ran-yuan-reference.mjs';
const r=evaluateRanYuan(JSON.parse(readFileSync(new URL('../test/fixtures/ordinary-ran-yuan-v1.json',import.meta.url),'utf8')));
console.log(JSON.stringify(r,null,2));
