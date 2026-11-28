import test from 'node:test';
import assert from 'node:assert/strict';
import {buildLiteralStrengthInput} from '../scripts/lib/pattern-strength-replay.mjs';
import {auditRootIndependentOperation} from '../scripts/lib/pattern-root-independent-operation.mjs';
import {auditActionPurpose} from '../scripts/lib/pattern-action-purpose.mjs';
const key=(...xs)=>JSON.stringify(xs),yes=propositionId=>({propositionId,sign:'for'}),no=propositionId=>({propositionId,sign:'against'});
const fixture=()=>buildLiteralStrengthInput(['정유','기유','무자','임자']).input;
test('purpose inventory is independent, unconfirmed and has no implicit direction or need',()=>{
 const x=fixture(),q=auditActionPurpose(x);
 assert.equal(q.status,'diagnostic',q.reason);
 assert.ok(q.balance.length&&q.climate.length);
 assert.equal(q.climate.length,q.summary.actions*4);
 assert.ok(q.balance.every(b=>b.state==='unresolved'&&b.actualEffect===null));
 assert.ok(q.climate.every(c=>c.state==='unresolved'&&c.alignmentState==='unresolved'&&c.actualEffect===null));
 assert.equal(q.selectionAuthority,false);assert.equal(q.actualSufficiencyState,'unresolved');
});
test('exact action can have climatic direction without received supply, and need is independent',()=>{
 const x=fixture(),u=auditRootIndependentOperation(x),q=auditActionPurpose(x);
 const a=u.actions.find(a=>a.actionId===key('generate','year:stem','month:stem'));
 const c=q.climate.find(c=>c.actionId===a.actionId&&c.axis==='temperature'&&c.direction==='increase');
 const assumptions=[...a.noRootWitness.map(yes),yes(c.conditionId)];
 const run=(xs)=>{const r=auditActionPurpose(x,{assumptions:xs});assert.equal(r.status,'diagnostic',r.reason);return r;};
 const row=r=>r.climate.find(z=>z.propositionId===c.propositionId);
 assert.equal(row(run(assumptions)).state,'supported');
 assert.equal(row(run(assumptions)).alignmentState,'unresolved');
 assert.ok(run(assumptions).balance.every(b=>b.state==='unresolved'));
 assert.equal(row(run([...assumptions,yes(c.needId)])).alignmentState,'supported');
 assert.equal(row(run([...assumptions,no(c.needId)])).alignmentState,'opposed');
 assert.equal(row(run([...assumptions,yes(c.needId),no(c.needId)])).alignmentState,'conflicting');
 for(let i=0;i<assumptions.length;i++)assert.equal(row(run(assumptions.filter((_,j)=>i!==j))).state,'unresolved');
 assert.equal(row(run([...assumptions,no(c.conditionId)])).state,'conflicting');
});
test('direct day replenishment requires exact transfer or rooted action, not action alone',()=>{
 const x=fixture(),u=auditRootIndependentOperation(x),q=auditActionPurpose(x);
 const t=u.transfers.find(t=>t.kind==='generate'&&t.to==='day:stem'&&t.from==='month:stem');
 // XU26 month/day are peers; select any literal rootless generating donor
 // to the day from a second fixture if the first chart has none.
 const y=t?x:buildLiteralStrengthInput(['경술','무자','무자','병진']).input;
 const v=t?u:auditRootIndependentOperation(y),m=t?q:auditActionPurpose(y);
 const tr=v.transfers.find(t=>t.kind==='generate'&&t.to==='day:stem');
 assert.ok(tr);
 const b=m.balance.find(b=>b.from===tr.from&&b.to===tr.to&&b.role==='replenishment');
 assert.ok(b&&b.basisIds.includes(tr.propositionId));
 const run=xs=>{const r=auditActionPurpose(y,{assumptions:xs});assert.equal(r.status,'diagnostic',r.reason);return r.balance.find(z=>z.propositionId===b.propositionId);};
 assert.equal(run([yes(tr.operationVariableId),yes(tr.ability),yes(b.conditionId)]).state,'unresolved');
 assert.equal(run([...tr.noRootWitness.map(yes),yes(b.conditionId)]).state,'supported');
 for(const id of tr.noRootWitness)assert.equal(run([...tr.noRootWitness.filter(x=>x!==id).map(yes),yes(b.conditionId)]).state,'unresolved');
});
test('scenario cannot assert conclusions or use unknown observations',()=>{
 const x=fixture(),q=auditActionPurpose(x);
 for(const id of [q.climate[0].propositionId,q.climate[0].alignmentId,'unknown']){
  const r=auditActionPurpose(x,{assumptions:[yes(id)]});
  assert.equal(r.status,'invalid-evidence');assert.deepEqual(r.climate,[]);
 }
});
