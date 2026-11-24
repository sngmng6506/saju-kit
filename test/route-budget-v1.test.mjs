import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeRouteBudget} from '../src/index.js';
import {splitBudget} from '../src/features/route-budget-v1/index.js';
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(y,m,d,h=null)=>({pillars:{year:p(y),month:p(m),day:p(d),hour:h===null?null:p(h)}});
const run=saju=>analyzeRouteBudget({saju,policy:'route-budget-v1',birthBasis:'verified-chart'});
test('integer allocation deduplicates targets and retains remainder',()=>{
 assert.deepEqual(splitBudget(5,['b','a','b']),[{id:'a',units:3},{id:'b',units:2}]);
 assert.deepEqual(splitBudget(5,[]),[]);
});
test('each source budget is allocated at most once across competing routes',()=>{
 const saju=chart('경신','경자','갑인','임신'),r=run(saju);
 assert.ok(r.analysis.rows.some(s=>s.officerResource>0&&s.directOfficer>0));
 for(const s of r.analysis.rows){
  for(const b of s.budgets){
   assert.equal(b.allocated,s.allocations.filter(a=>a.source===b.id).reduce((n,a)=>n+a.units,0));
   assert.ok(b.allocated<=b.units);
  }
  assert.ok(s.conditionalResource<=s.directResource);
  for(const x of s.routes)assert.equal(x.direct+x.outputControl,x.own);
 }
});
test('no resource implies zero resource allocation',()=>{
 const r=run(chart('신유','신유','을유','을유'));
 assert.deepEqual(r.analysis.ranges.directResource,{min:0,max:0});
 assert.deepEqual(r.analysis.ranges.officerResource,{min:0,max:0});
});
test('partial and provisional do not allocate unknown routes',()=>{
 const saju=chart('경신','임자','갑인');
 assert.equal(run(saju).analysis,null);
 assert.equal(analyzeRouteBudget({saju,policy:'route-budget-v1',birthBasis:'provisional-chart'}).analysis,null);
 assert.throws(()=>analyzeRouteBudget({saju}),{code:'strength-policy'});
});
