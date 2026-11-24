import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateRanYuan} from '../scripts/ran-yuan-reference.mjs';
const read=n=>JSON.parse(readFileSync(new URL('./fixtures/'+n+'.json',import.meta.url),'utf8'));
test('new textual charts preserve frozen comparison and source uniqueness',()=>{
 const fixture=read('ordinary-ran-yuan-v1');
 const seen=new Set(['ordinary-xu-v1','ordinary-wei-v1','strength-ditiansui-v1'].flatMap(n=>read(n).cases.map(c=>c.pillars.join(' '))));
 for(const c of fixture.cases){const k=c.pillars.join(' ');assert.ok(!seen.has(k));seen.add(k);assert.ok(fixture.sources[c.source].url);}
 const r=evaluateRanYuan(fixture);
 assert.equal(r.rows.length,13);
 assert.deepEqual(r.counts,{v1:[5,1,4],v2:[5,0,5],structural:[5,0,5],quantitative:[2,0,8]});
 const y=r.rows.find(x=>x.id==='Y01');assert.equal(y.v1,'strong');assert.equal(y.v2,null);
 for(const id of ['R07','R10','R11'])assert.equal(r.rows.find(x=>x.id===id).v2,null);
});
