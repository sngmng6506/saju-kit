import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateArguments} from '../src/features/pattern/outcome-argumentation.js';
import {evaluateConditionalArguments} from '../src/features/pattern/outcome-conditional-arguments.js';
const lit=(propositionId,sign='for')=>({propositionId,sign});
const prop=(id,level='structural-hypothesis')=>({id,kind:id,subject:id,level});
const refs=[{owner:'fixture',id:'rule',field:'premises'}];
const rule=(id,conclusion,premises,undercutWhen=[])=>({id,policyId:'fixture',conclusion,premises,undercutWhen,refs,applicability:'complete-only'});
const fact=(id,p,sign)=>({id,...lit(p,sign),refs,applicability:'complete-only'});
const v=id=>({op:'var',id}),not=arg=>({op:'not',arg});
const packet=(rules=[],evidence=[],scope='complete')=>({scope,propositions:[prop('x','observation'),prop('y','observation'),prop('z','observation'),prop('a'),prop('b'),prop('effect','effect-hypothesis')],evidence,rules});
const run=(p,extra={})=>evaluateConditionalArguments({packet:p,expected:evaluateArguments(p),variables:[{id:'shared',value:null}],bindings:[{propositionId:'x',formula:v('shared')}],targets:[{id:'A',propositionId:'a'},{id:'B',propositionId:'b'}],...extra});
test('one shared completion drives opposite proof conclusions',()=>{
 const p=packet([rule('a',lit('a'),[lit('x')]),rule('b',lit('b'),[lit('x','against')])]);
 const r=run(p);
 assert.equal(r.admissibleCount,2);
 assert.deepEqual(r.targets[0].counts,{supported:1,opposed:0,conflicting:0,unresolved:1});
 assert.deepEqual(r.targets[1].counts,r.targets[0].counts);
 assert.deepEqual(r.sets.minimalInfeasible.map(c=>c.queryIds),[['A','B']]);
 assert.deepEqual(r.targets[0].witnesses.supported,{shared:true});
 assert.deepEqual(r.targets[1].witnesses.supported,{shared:false});
 assert.equal(evaluateArguments(p).judgments.find(j=>j.id==='a').state,'unresolved');
});
test('shared formula aliases remain correlated across observations',()=>{
 const p=packet([rule('a',lit('a'),[lit('x')]),rule('b',lit('b'),[lit('y')])]);
 const r=run(p,{bindings:[{propositionId:'x',formula:v('shared')},{propositionId:'y',formula:not(v('shared'))}]});
 assert.equal(r.sets.whole.supportCount,0);
 assert.deepEqual(r.sets.maximalFeasible.map(s=>s.queryIds),[['A'],['B']]);
});
test('all four proof states retained and conflict excluded from strict sets',()=>{
 const p=packet([rule('yes',lit('a'),[lit('x')]),rule('no',lit('a','against'),[lit('y')])]);
 const r=run(p,{variables:[{id:'shared',value:null},{id:'other',value:null}],bindings:[{propositionId:'x',formula:v('shared')},{propositionId:'y',formula:v('other')}]});
 assert.deepEqual(r.targets[0].counts,{supported:1,opposed:1,conflicting:1,unresolved:1});
 assert.equal(r.targets[0].invariantState,null);assert.equal(r.sets.maximalFeasible[0].supportCount,1);
 assert.equal(r.targets[1].invariantState,'unresolved');
});
test('cycle cannot self-seed, alternative seed propagates only within scenario',()=>{
 const cycle=[rule('ab',lit('a'),[lit('b')]),rule('ba',lit('b'),[lit('a')])];
 const r=run(packet(cycle));assert.equal(r.targets[0].invariantState,'unresolved');
 const q=run(packet([...cycle,rule('seed',lit('a'),[lit('x')])]));
 assert.equal(q.sets.whole.supportCount,1);
 assert.deepEqual(q.sets.whole.witness,{shared:true});
});
test('undercut does not become explicit opposition or default clearance',()=>{
 const p=packet([rule('a',lit('a'),[lit('y')],[lit('x')])],[fact('y','y','for')]);
 const r=run(p);assert.deepEqual(r.targets[0].counts,{supported:1,opposed:0,conflicting:0,unresolved:1});
 assert.deepEqual(r.targets[0].witnesses.supported,{shared:false});
 const unbound=run(packet([rule('a',lit('a'),[lit('z','against')])]));
 assert.equal(unbound.targets[0].invariantState,'unresolved');
});
test('constraints restrict the common completion without changing original evidence',()=>{
 const p=packet([rule('a',lit('a'),[lit('x')])]);
 const r=run(p,{constraints:[{id:'c',formula:v('shared'),refs}]});
 assert.equal(r.admissibleCount,1);assert.equal(r.targets[0].invariantState,'supported');
 assert.equal(p.evidence.length,0);
 const empty=run(p,{constraints:[{id:'c',formula:false,refs}]});
 assert.equal(empty.admissibleCount,0);assert.equal(empty.sets,null);
});
test('reject forged replay, recorded facts, derived assumptions and effect targets',()=>{
 const p=packet();
 assert.equal(run(p,{expected:{judgments:[],ruleResults:[]}}).status,'invalid-evidence');
 assert.equal(run(packet([],[fact('x','x','for')])).status,'invalid-evidence');
 assert.equal(run(p,{bindings:[{propositionId:'a',formula:true}]}).status,'invalid-evidence');
 assert.equal(run(p,{targets:[{id:'E',propositionId:'effect'}]}).status,'invalid-evidence');
 assert.equal(run(p,{bindings:[{propositionId:'x',formula:v('missing')}]}).status,'invalid-evidence');
});
test('partial scope and budget are not conditional verdicts',()=>{
 const r=run(packet([],[],'partial'));assert.equal(r.status,'partial');assert.deepEqual(r.targets,[]);
 const variables=Array.from({length:17},(_,i)=>({id:String(i),value:null}));
 const q=run(packet(),{variables,bindings:[{propositionId:'x',formula:{op:'all',args:variables.map(x=>v(x.id))}}]});
 assert.equal(q.status,'unavailable');assert.equal(q.reason,'scenario-budget');assert.equal(q.sets,null);
});
