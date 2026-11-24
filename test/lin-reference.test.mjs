import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateStrengthFactorial} from '../scripts/strength-factorial.mjs';
test('scan-transcribed Lin charts are unique and retain frozen factorial results',async()=>{
 const read=n=>JSON.parse(readFileSync(new URL('./fixtures/'+n+'.json',import.meta.url),'utf8'));
 const seen=new Set(['ordinary-xu-v1','ordinary-wei-v1','strength-ditiansui-v1','ordinary-ran-yuan-v1','ordinary-xu-holdout-v1'].flatMap(n=>read(n).cases.map(c=>c.pillars.join(' '))));
 const f=read('ordinary-lin-scan-v1'),stems='甲乙丙丁戊己庚辛壬癸',branches='子丑寅卯辰巳午未申酉戌亥';
 for(const c of f.cases){
  const k=c.pillars.join(' ');assert.ok(!seen.has(k));seen.add(k);
  const [y,m,d,t]=c.pillars;
  for(const p of c.pillars)assert.equal(stems.indexOf(p[0])%2,branches.indexOf(p[1])%2);
  assert.equal(stems.indexOf(m[0]),((stems.indexOf(y[0])%5)*2+2+(branches.indexOf(m[1])+10)%12)%10);
  assert.equal(stems.indexOf(t[0]),((stems.indexOf(d[0])%5)*2+branches.indexOf(t[1]))%10);
  assert.equal(c.pdfPageIndex,c.printedPage+6);
 }
 const r=await evaluateStrengthFactorial(['ordinary-lin-scan-v1']);
 assert.equal(r.total,4);
 assert.deepEqual(r.totals,Array.from({length:4},()=>[3,0,1]));
 assert.deepEqual(r.corpora[0].rows.map(x=>x.results),['weak','weak','strong',null].map(d=>Array(4).fill(d)));
});
