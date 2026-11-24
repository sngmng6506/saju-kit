import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateStrengthFactorial} from '../scripts/strength-factorial.mjs';
test('unseen Xu references are unique and frozen factorial results are retained',async()=>{
 const read=n=>JSON.parse(readFileSync(new URL('./fixtures/'+n+'.json',import.meta.url),'utf8'));
 const seen=new Set(['ordinary-xu-v1','ordinary-wei-v1','strength-ditiansui-v1','ordinary-ran-yuan-v1'].flatMap(n=>read(n).cases.map(c=>c.pillars.join(' '))));
 const f=read('ordinary-xu-holdout-v1');
 for(const c of f.cases){const k=c.pillars.join(' ');assert.ok(!seen.has(k));seen.add(k);}
 const r=await evaluateStrengthFactorial(['ordinary-xu-holdout-v1']);
 assert.equal(r.total,8);
 assert.deepEqual(r.totals,[[3,0,5],[3,0,5],[2,0,6],[2,0,6]]);
 assert.deepEqual(r.corpora[0].rows.map(x=>x.results),[[null,null,null,null],[null,null,'weak','weak'],['weak','weak',null,null],['weak','weak',null,null],[null,null,null,null],[null,null,null,null],['strong','strong','strong','strong'],[null,null,null,null]]);
 assert.equal(r.corpora[0].rows.filter(x=>x.formationDependent).length,2);
});
