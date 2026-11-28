import test from 'node:test';
import assert from 'node:assert/strict';
import {buildLiteralStrengthInput} from '../scripts/lib/pattern-strength-replay.mjs';
import {auditRootIndependentOperation} from '../scripts/lib/pattern-root-independent-operation.mjs';
const key=(...xs)=>JSON.stringify(xs);
const fixture=()=>buildLiteralStrengthInput(['정유','기유','무자','임자']).input;
test('root-independent operation and received supply have independent explicit gates',()=>{
 const x=fixture(),q=auditRootIndependentOperation(x);
 assert.equal(q.status,'diagnostic',q.reason);
 const a=q.actions.find(a=>a.actionId===key('generate','year:stem','month:stem'));
 assert.ok(a);assert.equal(a.sourceLiteralRootCount,0);assert.equal(a.rootedPossible,false);
 assert.equal(a.noRootActionPossible,true);assert.deepEqual(a.noRootWitness,[a.operationVariableId,a.independentGuard]);
 const t=q.transfers.find(t=>t.from==='year:stem'&&t.to==='month:stem');
 assert.equal(t.ability,a.independentGuard);assert.equal(t.operationVariableId,a.operationVariableId);assert.ok(t.transfer!==t.ability);
 const day=q.targets.find(t=>t.targetId==='day:stem');
 assert.equal(day.rootedPossible,false);assert.equal(day.actionOnlySupplyPossible,false);
 assert.equal(day.receivedBasisPossible,true);assert.equal(day.noRootReceivedBasisPossible,true);
 assert.ok(day.witness.assumptions.every(id=>!id.startsWith('["slot-retained",')&&!id.startsWith('["root-access",')));
 assert.equal(q.selectionAuthority,false);assert.equal(q.actualStrengthState,'unresolved');
});
test('extension retains exact action and link identity and never grants hidden-source independent ability',()=>{
 const x=buildLiteralStrengthInput(['경술','무자','무자','병진']).input,q=auditRootIndependentOperation(x);
 assert.equal(q.status,'diagnostic',q.reason);
 assert.equal(q.actions.length,x.burden.actionRows.length);
 for(const a of q.actions){
  const original=x.burden.actionRows.find(r=>r.id===a.actionId);
  assert.equal(a.operationVariableId,original.operationVariableId);
  assert.equal(a.rootedPropositionId,original.propositionId);
  assert.equal(a.noRootActionPossible,x.targets.includes(a.from));
  assert.equal(a.actualOperationState,'unresolved');
 }
 assert.ok(q.transfers.every(t=>x.targets.includes(t.from)&&x.links.some(l=>l.id===t.linkId&&l.from===t.from&&l.to===t.to&&l.kind===t.kind)));
 assert.ok(q.targets.every(t=>t.rootedPossible===t.actionOnlySupplyPossible&&(!t.rootedPossible||t.receivedBasisPossible)));
});
test('invalid baseline and inconsistent action inventory fail closed',()=>{
 const x=fixture(),q=auditRootIndependentOperation({...x,burden:{...x.burden,actionRows:x.burden.actionRows.slice(1)}});
 assert.equal(q.status,'invalid-evidence');assert.deepEqual(q.targets,[]);
});
