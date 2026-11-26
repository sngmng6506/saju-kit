import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeProofDependencies} from '../src/features/pattern/outcome-proof-dependencies.js';
import {evaluateArguments} from '../src/features/pattern/outcome-argumentation.js';
const lit=(propositionId,sign='for')=>({propositionId,sign});
const ref=[{owner:'test',id:'case',field:'rule'}];
const prop=(id,level='structural-hypothesis')=>({id,kind:id,subject:id,level});
const rule=(id,out,requires,undercutWhen=[])=>({id,policyId:'test',conclusion:typeof out==='string'?lit(out):out,premises:requires.map(p=>typeof p==='string'?lit(p):p),undercutWhen,refs:ref,applicability:'complete-only'});
const fact=(id,p,sign='for')=>({id,...lit(p,sign),refs:ref,applicability:'complete-only'});
const packet=(rules,evidence=[],scope='complete')=>({scope,propositions:[prop('a'),prop('b'),prop('c'),prop('seed','observation'),prop('block','observation'),prop('effect','effect-hypothesis')],evidence,rules});
const cycle=[rule('ab','a',['b']),rule('ba','b',['a'])];
test('unseeded mutual support never becomes a proof',()=>{
 const p=packet(cycle),r=analyzeProofDependencies(p);
 assert.equal(r.summary.cycles,1);assert.equal(r.components[0].classification,'structurally-seedless');
 assert.equal(r.components[0].groundedCount,0);assert.equal(r.components[0].upperBoundReachableCount,0);
 assert.equal(evaluateArguments(p).judgments.find(x=>x.id==='a').state,'unresolved');
});
test('independent alternative seeds a cycle only when supported',()=>{
 const rules=[...cycle,rule('seed-a','a',['seed'])];
 const unknown=analyzeProofDependencies(packet(rules));
 assert.equal(unknown.components[0].classification,'not-fully-grounded');
 assert.equal(unknown.components[0].upperBoundReachableCount,2);
 const grounded=analyzeProofDependencies(packet(rules,[fact('s','seed')]));
 assert.equal(grounded.components[0].classification,'grounded');
 assert.deepEqual(grounded.components[0].members.map(m=>m.groundedRank),[1,2]);
});
test('external premise alone does not seed conjunctive cycle',()=>{
 const r=analyzeProofDependencies(packet([rule('ab','a',['b','seed']),rule('ba','b',['a'])],[fact('s','seed')]));
 assert.equal(r.components[0].classification,'structurally-seedless');
});
test('undercut removes a rule from active topology without asserting opposition',()=>{
 const p=packet([rule('ab','a',['b'],[lit('block')]),cycle[1]],[fact('blocked','block')]);
 const r=analyzeProofDependencies(p);
 assert.equal(r.summary.cycles,1);assert.equal(r.summary.activeCycles,0);
 assert.equal(r.components[0].alternatives.find(a=>a.ruleId==='ab').status,'undercut');
 assert.equal(evaluateArguments(p).judgments.find(x=>x.id==='a').state,'unresolved');
});
test('signed literals distinguish superficially cyclic propositions',()=>{
 const p=packet([rule('ab','a',[lit('b','against')]),rule('ba','b',['a'])]);
 assert.equal(analyzeProofDependencies(p).summary.cycles,0);
});
test('negative literal cycle and self-loop remain distinct',()=>{
 const p=packet([rule('ab',lit('a','against'),[lit('b','against')]),rule('ba',lit('b','against'),[lit('a','against')]),rule('self','c',['c'])]);
 const r=analyzeProofDependencies(p);
 assert.equal(r.summary.cycles,2);assert.equal(r.summary.structurallySeedless,2);
 assert.ok(r.components.some(c=>c.members.length===1&&c.members[0].propositionId==='c'));
});
test('optimistic upper bound does not assert admissible support',()=>{
 const p=packet([...cycle,rule('both','a',[lit('seed'),lit('seed','against')])]);
 const r=analyzeProofDependencies(p);
 assert.equal(r.components[0].upperBoundReachableCount,2);
 assert.equal(r.components[0].groundedCount,0);
 assert.equal(r.components[0].classification,'not-fully-grounded');
});
test('partial and forged replay cannot publish cycle conclusions',()=>{
 assert.equal(analyzeProofDependencies(packet(cycle,[],'partial')).summary.cycles,null);
 const p=packet(cycle),r=evaluateArguments(p);
 assert.equal(analyzeProofDependencies(p,{...r,judgments:[]}).status,'invalid-evidence');
 assert.equal(analyzeProofDependencies(packet([rule('bad','effect',['a'])])).status,'invalid-evidence');
});
