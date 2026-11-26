import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateContextualStrength} from '../src/features/pattern/outcome-contextual-strength.js';
const axes={'visible':true,'substantial-root-basis':true,'controller-basis':true,'output-basis':true};
const refs=Object.fromEntries(Object.keys(axes).map(k=>[k,[{owner:'fixture',id:k,field:'state'}]]));
const run=(overrides={},extra={})=>evaluateContextualStrength({completeHour:true,element:'wood',axes:{...axes,...overrides},evidenceRefs:refs,...extra});
const target=(r,id)=>r.scenario.targets.find(t=>t.id===id);
test('actual strength and unreviewed premises remain unresolved even with every structural basis',()=>{
 const r=run();assert.equal(r.status,'diagnostic');assert.equal(r.strongState,'unresolved');assert.equal(r.weakState,'unresolved');
 assert.equal(r.actualStrengthState,'unresolved');assert.equal(r.effective,null);assert.equal(r.selectionAuthority,false);
 assert.ok(r.assumptions.every(a=>a.state==='unresolved'));
 assert.equal(r.scenario.admissibleCount,8);
 assert.equal(target(r,'strong').counts.supported,1);assert.equal(target(r,'weak').counts.supported,6);
 assert.equal(r.scenario.sets.whole.supportCount,0);
 assert.equal(target(r,'strong').counts.conflicting,0);assert.equal(target(r,'weak').counts.conflicting,0);
});
test('deep roots support a conditional strong argument without a season prerequisite',()=>{
 for(const element of ['wood','fire','earth','metal','water']){
  const r=run({}, {element}),w=target(r,'strong').witnesses.supported;
  assert.deepEqual(w,{'control-exceeds-support':false,'deep-root-available':true,'drain-exceeds-support':false});
  assert.equal(r.rules.some(rule=>rule.premises.some(p=>/season/i.test(p.propositionId))),false);
  assert.equal(r.strongState,'unresolved');
 }
});
test('control and drain are alternative weak arguments, not interchangeable structural proxies',()=>{
 const control=run({'output-basis':false}),drain=run({'controller-basis':false});
 assert.equal(target(control,'weak').counts.supported,4);
 assert.equal(target(drain,'weak').counts.supported,4);
 assert.equal(target(control,'weak').witnesses.supported['control-exceeds-support'],true);
 assert.equal(target(drain,'weak').witnesses.supported['drain-exceeds-support'],true);
 const neither=run({'controller-basis':false,'output-basis':false});
 assert.equal(target(neither,'weak').counts.supported,0);
 assert.equal(neither.weakState,'unresolved');
});
test('missing structural root does not turn into weak evidence',()=>{
 const r=run({'substantial-root-basis':false,'controller-basis':false,'output-basis':false});
 assert.equal(target(r,'strong').invariantState,'unresolved');assert.equal(target(r,'weak').invariantState,'unresolved');
});
test('unestablished visibility or partial chart does not manufacture strength',()=>{
 const r=run({visible:false});assert.equal(target(r,'strong').invariantState,'unresolved');assert.equal(target(r,'weak').invariantState,'unresolved');
 const p=run({}, {completeHour:false,axes:Object.fromEntries(Object.keys(axes).map(k=>[k,null]))});
 assert.equal(p.status,'partial');assert.equal(p.scenario.status,'partial');assert.equal(p.strongState,'unresolved');
 assert.equal(run({}, {completeHour:false}).status,'invalid-evidence');
});
test('hypothetical scenario evaluation is optional and cannot mutate proof evidence',()=>{
 const a=run(),b=run({}, {includeScenarios:false});
 assert.equal(b.scenario,null);assert.deepEqual(a.evidence,b.evidence);assert.deepEqual(a.judgments,b.judgments);
 assert.deepEqual(a.ruleResults,b.ruleResults);
 assert.ok(a.evidence.every(e=>Object.hasOwn(axes,e.propositionId)));
 assert.equal(run({}, {axes:{...axes,seasonSupports:true}}).status,'invalid-evidence');
});
