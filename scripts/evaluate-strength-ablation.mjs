import {readFileSync} from 'node:fs';
import {evaluateAblations,variants} from './strength-ablation.mjs';
const names=["ordinary-xu-v1","ordinary-wei-v1","strength-ditiansui-v1","ordinary-ran-yuan-v1"];
const all=names.map(name=>({name,...evaluateAblations(JSON.parse(readFileSync(new URL('../test/fixtures/'+name+'.json',import.meta.url),'utf8')))}));
const totals=Object.fromEntries(variants.map(v=>[v,Object.fromEntries(['agree','disagree','abstain'].map(k=>[k,all.reduce((n,r)=>n+r.metrics[v][k],0)]))]));
console.log(JSON.stringify({totals,corpora:all},null,2));
