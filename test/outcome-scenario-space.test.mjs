import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateScenarioSpace} from '../src/features/pattern/outcome-scenario-space.js';
const v=id=>({op:'var',id}),not=arg=>({op:'not',arg}),all=(...args)=>({op:'all',args}),any=(...args)=>({op:'any',args});
const run=(formulas,extra={})=>evaluateScenarioSpace({scope:'complete',variables:[{id:'x',value:null},{id:'y',value:null}],queries:formulas.map((formula,i)=>({id:String(i),formula})),...extra});
test('same unknown supports two queries only under the same completion',()=>{
 const r=run([v('x'),v('x')]);assert.equal(r.admissibleCount,2);
 assert.deepEqual(r.pairs[0].counts,{neither:1,rightOnly:0,leftOnly:0,both:1});
 assert.equal(r.pairs[0].individuallyPossibleButJointImpossible,false);
});
test('opposing requirements individually possible but jointly impossible',()=>{
 const r=run([v('x'),not(v('x'))]);assert.equal(r.queries[0].state,'possible-not-invariant');
 assert.equal(r.pairs[0].individuallyPossibleButJointImpossible,true);
 assert.deepEqual(r.pairs[0].counts,{neither:0,rightOnly:1,leftOnly:1,both:0});
});
test('independent variables permit all four outcomes',()=>{
 const r=run([v('x'),v('y')]);assert.deepEqual(r.pairs[0].counts,{neither:1,rightOnly:1,leftOnly:1,both:1});
 assert.deepEqual(r.pairs[0].witnesses.both,{x:true,y:true});
});
test('explicit referenced constraint removes only prohibited assignments',()=>{
 const r=run([v('x'),v('y')],{constraints:[{id:'exclusive',formula:not(all(v('x'),v('y'))),refs:[{owner:'scenario-policy',id:'test',field:'explicit-condition'}]}]});
 assert.equal(r.scenarioCount,4);assert.equal(r.admissibleCount,3);
 assert.equal(r.pairs[0].individuallyPossibleButJointImpossible,true);
});
test('empty admissible space is not vacuous invariance',()=>{
 const r=run([v('x')],{constraints:[{id:'never',formula:false,refs:[{owner:'scenario-policy',id:'test',field:'condition'}]}]});
 assert.equal(r.admissibleCount,0);assert.equal(r.reason,'no-admissible-completion');assert.deepEqual(r.queries,[]);
});
test('fixed facts and tautology retain exact invariance',()=>{
 const r=run([v('x'),any(v('y'),not(v('y')))],{variables:[{id:'x',value:false},{id:'y',value:null}]});
 assert.equal(r.queries[0].state,'impossible-in-model');assert.equal(r.queries[1].state,'invariant-in-model');
});
test('partial scope never publishes completions',()=>{
 const r=run([v('x')],{scope:'partial'});assert.equal(r.status,'partial');assert.deepEqual(r.queries,[]);
});
test('unknown references, duplicate ids and sourceless constraints rejected',()=>{
 assert.equal(run([v('missing')]).status,'invalid-evidence');
 assert.equal(run([v('x')],{variables:[{id:'x',value:null},{id:'x',value:false}]}).status,'invalid-evidence');
 assert.equal(run([true],{constraints:[{id:'c',formula:true,refs:[]}]}).status,'invalid-evidence');
});
test('budget exhaustion returns unavailable without a truncated answer',()=>{
 const variables=Array.from({length:17},(_,i)=>({id:String(i),value:null}));
 const r=run([all(...variables.map(x=>v(x.id)))],{variables});
 assert.equal(r.status,'unavailable');assert.equal(r.reason,'scenario-budget');assert.deepEqual(r.pairs,[]);
});
