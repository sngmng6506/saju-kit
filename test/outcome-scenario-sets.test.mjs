import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateScenarioSpace} from '../src/features/pattern/outcome-scenario-space.js';
import {analyzeScenarioSets} from '../src/features/pattern/outcome-scenario-sets.js';
const v=id=>({op:'var',id}),not=arg=>({op:'not',arg}),any=(...args)=>({op:'any',args}),all=(...args)=>({op:'all',args});
const run=(formulas,extra={})=>evaluateScenarioSpace({scope:'complete',variables:[{id:'x',value:null},{id:'y',value:null}],queries:formulas.map((formula,i)=>({id:String(i),formula})),includeSets:true,...extra});
test('pairwise possible but no common triple completion',()=>{
 const r=run([v('x'),v('y'),not(all(v('x'),v('y')))]);
 assert.equal(r.pairs.every(p=>p.counts.both>0),true);
 assert.equal(r.sets.whole.state,'impossible-in-model');
 assert.deepEqual(r.sets.minimalInfeasible,[{queryIds:['0','1','2'],supportCount:0,removals:['0','1','2'].map(removedQueryId=>({removedQueryId,supportCount:1}))}]);
 assert.deepEqual(r.sets.maximalFeasible.map(x=>x.queryIds),[['0','1'],['0','2'],['1','2']]);
 assert.equal(r.sets.summary.higherOrderInfeasible,1);
});
test('full conjunction invariant and empty query set semantics',()=>{
 const r=run([true,any(v('x'),not(v('x')))]);
 assert.equal(r.sets.whole.state,'invariant-in-model');assert.equal(r.sets.whole.supportCount,2);
 assert.deepEqual(r.sets.minimalInfeasible,[]);
 const q=run([]);assert.equal(q.sets.whole.state,'invariant-in-model');
 assert.deepEqual(q.sets.maximalFeasible,[{queryIds:[],supportCount:1,witness:{}}]);
});
test('impossible singleton is a core, not higher-order competition',()=>{
 const r=run([false,v('x'),not(v('x'))]);
 assert.deepEqual(r.sets.minimalInfeasible.map(x=>x.queryIds),[['0'],['1','2']]);
 assert.equal(r.sets.summary.higherOrderInfeasible,0);
});
test('explicit constraints and witness assignments remain common',()=>{
 const r=run([v('x'),v('y')],{constraints:[{id:'c',formula:not(all(v('x'),v('y'))),refs:[{owner:'policy',id:'test',field:'condition'}]}]});
 assert.equal(r.admissibleCount,3);assert.equal(r.sets.whole.supportCount,0);
 assert.deepEqual(r.sets.maximalFeasible.map(x=>x.witness),[{x:true,y:false},{x:false,y:true}]);
});
test('partial scope and empty admissible space do not assert invariance',()=>{
 const partial=run([true],{scope:'partial'});assert.equal(partial.sets.status,'partial');assert.equal(partial.sets.whole,null);
 const empty=run([true],{constraints:[{id:'c',formula:false,refs:[{owner:'p',id:'i',field:'f'}]}]});
 assert.equal(empty.sets.reason,'no-admissible-completion');assert.equal(empty.sets.whole,null);
});
test('set budget is separate from existing exact pair evaluation',()=>{
 const r=run(Array(17).fill(true));assert.equal(r.status,'diagnostic');
 assert.equal(r.sets.status,'unavailable');assert.equal(r.sets.reason,'set-query-budget');
 assert.equal(r.pairs.length,136);assert.equal(r.pairs[0].counts.both,1);
 assert.equal(Object.hasOwn(run([true],{includeSets:false}),'sets'),false);
});
test('reject malformed truth patterns and duplicate query IDs',()=>{
 assert.equal(analyzeScenarioSets(['a','a'],[]).status,'invalid-evidence');
 assert.equal(analyzeScenarioSets(['a'],[{mask:2,count:1,witness:{}}]).status,'invalid-evidence');
 assert.equal(analyzeScenarioSets(['a'],[{mask:1,count:0,witness:{}}]).status,'invalid-evidence');
 assert.equal(analyzeScenarioSets(['a'],[{mask:1,count:1,witness:{}},{mask:1,count:1,witness:{}}]).status,'invalid-evidence');
});
test('exhaustive three-query truth pattern families match brute-force subsets',()=>{
 const ids=['a','b','c'],maskOf=xs=>xs.reduce((m,x)=>m|(1<<ids.indexOf(x)),0);
 for(let family=1;family<256;family++){
  const patterns=Array.from({length:8},(_,mask)=>({mask,count:mask+1,witness:{pattern:mask}})).filter(p=>family&(1<<p.mask));
  const support=mask=>patterns.filter(p=>(p.mask&mask)===mask).reduce((n,p)=>n+p.count,0);
  const expectedMax=[],expectedMin=[];
  for(let m=0;m<8;m++){
   if(support(m)>0&&![0,1,2].some(i=>!(m&(1<<i))&&support(m|(1<<i))>0))expectedMax.push(m);
   if(support(m)===0&&[0,1,2].every(i=>!(m&(1<<i))||support(m^(1<<i))>0))expectedMin.push(m);
  }
  const r=analyzeScenarioSets(ids,patterns);
  assert.equal(r.whole.supportCount,support(7));
  assert.deepEqual(r.maximalFeasible.map(x=>maskOf(x.queryIds)),expectedMax);
  assert.deepEqual(r.minimalInfeasible.map(x=>maskOf(x.queryIds)),expectedMin);
  for(const x of r.maximalFeasible){assert.equal(x.supportCount,support(maskOf(x.queryIds)));assert.equal(x.witness.pattern,maskOf(x.queryIds));}
  for(const x of r.minimalInfeasible)for(const y of x.removals)assert.equal(y.supportCount,support(maskOf(x.queryIds)^(1<<ids.indexOf(y.removedQueryId))));
 }
});
test('output budget never publishes a truncated frontier',()=>{
 const ids=Array.from({length:16},(_,i)=>String(i));
 const patterns=Array.from({length:65536},(_,mask)=>mask).filter(m=>m.toString(2).replace(/0/g,'').length===8).map(mask=>({mask,count:1,witness:{}}));
 const r=analyzeScenarioSets(ids,patterns);
 assert.equal(r.status,'unavailable');assert.equal(r.reason,'set-output-budget');
 assert.equal(r.whole.state,'impossible-in-model');assert.deepEqual(r.maximalFeasible,[]);assert.deepEqual(r.minimalInfeasible,[]);
});
