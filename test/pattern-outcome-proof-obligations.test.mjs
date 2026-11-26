import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateArguments} from '../src/features/pattern/outcome-argumentation.js';
import {inspectProofObligations,summarizeObligationTargets} from '../scripts/lib/pattern-outcome-proof-obligations.mjs';
const lit=(propositionId,sign='for')=>({propositionId,sign}),refs=[{owner:'fixture',id:'x',field:'x'}];
const p=(id,level='structural-hypothesis')=>({id,level,kind:id,subject:id});
const fact=(id,sign)=>({id:id+sign,...lit(id,sign),refs,applicability:'complete-only'});
const rule=(id,conclusion,premises,undercutWhen=[])=>({id,policyId:'fixture',conclusion:lit(conclusion),premises,undercutWhen,refs,applicability:'complete-only'});
function fixture(scope='complete'){
 const propositions=[p('a','observation'),p('b','observation'),p('c','observation'),p('d','observation'),p('x'),p('y'),p('z'),p('cycle'),p('no-rule'),p('actual','effect-hypothesis')];
 const evidence=[fact('a','against'),fact('c','for'),fact('d','for'),fact('d','against')];
 const rules=[rule('x1','x',[lit('a'),lit('b')]),rule('x2','x',[lit('y')]),rule('y1','y',[lit('b')]),rule('y2','y',[lit('c')],[lit('d')]),rule('z1','z',[lit('d')]),rule('c1','cycle',[lit('cycle')]),rule('c2','cycle',[lit('no-rule')])];
 return {propositions,evidence,rules,...evaluateArguments({scope,propositions,evidence,rules})};
}
test('proof frontier retains alternative conjunctions and exact signed contrary/unknown evidence',()=>{
 const g=inspectProofObligations(fixture(),[lit('x')]);
 assert.equal(g.status,'diagnostic');const x=g.nodes.find(n=>n.propositionId==='x'),r=g.targets[0];
 assert.deepEqual(x.alternatives.map(a=>a.missing),[[JSON.stringify(['a','for']),JSON.stringify(['b','for'])],[JSON.stringify(['y','for'])]]);
 assert.deepEqual(r.reachableTerminals.map(t=>[t.kind,t.reason]).sort(),[['a','contrary-observation'],['b','observation-unestablished']]);
 assert.equal(r.inactiveAlternatives[0].status,'undercut');assert.equal(r.inactiveAlternatives[0].undercuts.length,1);
});
test('actual authority absence, signed conflict and unseeded cycles are not treated as missing observed premises',()=>{
 const g=inspectProofObligations(fixture(),[lit('actual'),lit('d'),lit('cycle')]);
 assert.equal(g.targets[0].reachableTerminals[0].reason,'effect-authority-absent');
 assert.equal(g.targets[1].state,'conflicting');assert.equal(g.targets[1].established,true);
 assert.equal(g.targets[2].cycleNodeIds.length,1);
 assert.equal(g.targets[2].reachableTerminals[0].reason,'hypothesis-no-rule');
 assert.equal(summarizeObligationTargets(g.targets).cycleTargets,1);
});
test('partial scope and tampered proofs cannot manufacture obligations',()=>{
 const g=inspectProofObligations(fixture('partial'),[lit('x')],'partial');
 assert.equal(g.status,'partial');assert.equal(g.targets[0].reachableTerminals.length,0);
 assert.ok(g.targets[0].inactiveAlternatives.every(a=>a.status==='scope-unresolved'));
 const f=fixture();f.judgments[0].state='supported';
 assert.equal(inspectProofObligations(f,[lit('x')]).reason,'proof-replay');
 assert.equal(inspectProofObligations(fixture(),[lit('x'),lit('x')]).reason,'target-identity');
});
