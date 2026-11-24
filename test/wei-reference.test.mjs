import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateWeiReferences} from '../scripts/wei-reference.mjs';
const read=name=>JSON.parse(readFileSync(new URL('./fixtures/'+name,import.meta.url),'utf8'));
const fixture=read('ordinary-wei-v1.json');

test('Wei references retain source provenance, distinct charts, and explicit exclusions',()=>{
 const seen=new Set(['ordinary-xu-v1.json','strength-ditiansui-v1.json'].flatMap(name=>read(name).cases.map(c=>c.pillars.join(' '))));
 const counts={};
 const stems='甲乙丙丁戊己庚辛壬癸',branches='子丑寅卯辰巳午未申酉戌亥';
 for(const c of fixture.cases){
  assert.ok(!seen.has(c.pillars.join(' ')),c.id);seen.add(c.pillars.join(' '));
  assert.equal(c.pillars.length,4);
  assert.equal(c.split,'new-source-frozen-multiaxis-v1');
  assert.ok(fixture.sources[c.source].url.startsWith('https://'));
  const idx=c.pillars.map(p=>[stems.indexOf(p[0]),branches.indexOf(p[1])]);
  assert.ok(idx.every(([a,b])=>a>=0&&b>=0&&a%2===b%2));
  assert.equal(idx[1][0],(idx[0][0]%5*2+2+(idx[1][1]+10)%12)%10,c.id+' month');
  assert.equal(idx[3][0],(idx[2][0]%5*2+idx[3][1])%10,c.id+' hour');
  counts[c.reference]=(counts[c.reference]||0)+1;
 }
 assert.deepEqual(counts,{strong:12,weak:11,qualified:2,balanced:1});
 assert.deepEqual(fixture.excluded.map(c=>c.id),['W07','W27']);
 assert.deepEqual(fixture.cases.filter(c=>c.formationDependent).map(c=>c.id),['W10','W12']);
});
test('frozen Wei comparison preserves disagreements and subgroup denominators',()=>{
 const r=evaluateWeiReferences(fixture),values=m=>[m.agrees,m.disagrees,m.abstained];
 assert.equal(r.total,26);
 assert.deepEqual(Object.values(r.metrics).map(values),[[12,0,11],[13,0,10],[11,1,11]]);
 assert.deepEqual(Object.values(r.byKind.teaching).map(values),[[12,0,8],[12,0,8],[10,1,9]]);
 assert.deepEqual(Object.values(r.byKind.commentary).map(values),[[0,0,3],[1,0,2],[1,0,2]]);
 assert.deepEqual(Object.values(r.withoutFormationDependent).map(values),[[12,0,9],[13,0,8],[10,1,10]]);
 assert.deepEqual(r.metrics.multiaxis.matrix,{strong:{strong:7,weak:0,abstained:5},weak:{strong:1,weak:4,abstained:6}});
 const wrong=r.rows.find(x=>x.id==='W24');
 assert.equal(wrong.reference,'weak');assert.equal(wrong.multiaxis,'strong');
 assert.deepEqual(wrong.axes.rootCapacity,{min:51.25,max:52});
 assert.deepEqual(wrong.axes.pressure.output,{min:43.8,max:62.3});
 assert.equal(wrong.allPressureDominates,true);
 const contrast=r.rows.find(x=>x.id==='W04');
 assert.equal(contrast.reference,'strong');assert.equal(contrast.multiaxis,'strong');
 assert.equal(contrast.allPressureDominates,true);
 for(const id of ['W01','W02','W03','W12','W20'])assert.equal(r.rows.find(x=>x.id===id).multiaxis,null);
});
