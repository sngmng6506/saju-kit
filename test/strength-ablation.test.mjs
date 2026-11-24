import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateAblations,variants} from '../scripts/strength-ablation.mjs';
test('frozen decision ablations retain per-corpus results',()=>{
 const names=["ordinary-xu-v1","ordinary-wei-v1","strength-ditiansui-v1","ordinary-ran-yuan-v1"];
 const expected=[[[15,0,12],[15,0,12],[10,0,17],[15,0,12],[14,0,13],[15,0,12],[17,0,10],[15,0,12],[15,0,12]],[[13,0,10],[13,0,10],[11,0,12],[13,0,10],[12,0,11],[13,1,9],[14,0,9],[13,0,10],[13,0,10]],[[0,0,4],[0,0,4],[0,0,4],[0,1,3],[0,0,4],[0,0,4],[0,0,4],[0,0,4],[0,0,4]],[[5,0,5],[5,0,5],[0,0,10],[5,1,4],[5,0,5],[5,1,4],[5,0,5],[5,0,5],[5,0,5]]];
 for(const [i,name] of names.entries()){
  const fixture=JSON.parse(readFileSync(new URL('./fixtures/'+name+'.json',import.meta.url),'utf8'));
  const r=evaluateAblations(fixture);
  assert.deepEqual(variants.map(v=>{const m=r.metrics[v];return [m.agree,m.disagree,m.abstain]}),expected[i]);
  assert.deepEqual(r.metrics['without-route-ground'].changed,[]);
  assert.deepEqual(r.metrics['without-output-control'].changed,[]);
  assert.deepEqual(r.metrics['without-conditional-resource-gate'].changed,[]);
 }
});
