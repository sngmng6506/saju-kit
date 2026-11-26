import test from 'node:test';
import assert from 'node:assert/strict';
import {elementRelation} from '../src/core/elements.js';
import {compileReplenishmentNetwork} from '../src/features/pattern/outcome-replenishment-network.js';
import {compareReplenishmentBurden} from '../src/features/pattern/outcome-burden-comparison.js';
import {auditBurdenSourceConditions,burdenSourceConditions} from '../scripts/lib/pattern-strength-source-conditions.mjs';
const key=(...xs)=>JSON.stringify(xs);
function fixture(completeHour=true,rooted=true){
 const nodes=[
  ['day:stem','day','wood'],['month:stem','month','water'],['hour:stem','hour','earth'],['year:stem','year','fire'],
  ['day:branch:metal','day','metal'],['day:branch:wood','day','wood'],['day:branch:fire','day','fire']
 ].map(([id,position,element])=>({id,position,element,rootIds:rooted?[id+':root']:[]}));
 const targets=nodes.filter(n=>n.id.endsWith(':stem')).map(n=>n.id),positions=['year','month','day','hour'];
 const actions=nodes.flatMap(a=>nodes.flatMap(b=>{
  const r=elementRelation(a.element,b.element);
  return a.id!==b.id&&(targets.includes(a.id)||targets.includes(b.id))&&Math.abs(positions.indexOf(a.position)-positions.indexOf(b.position))<=1&&['generate','control'].includes(r.type)&&r.direction==='left-to-right'?[{id:key(r.type,a.id,b.id),kind:r.type,from:a.id,to:b.id,actualOperationState:'unresolved'}]:[];
 }));
 const links=actions.filter(a=>a.kind==='generate'&&targets.includes(a.to)).map(a=>({id:'link:'+a.id,from:a.from,to:a.to,kind:'generate'}));
 const x={completeHour,nodes,targets,links},burden=compareReplenishmentBurden({...x,actions,replenishmentPacket:compileReplenishmentNetwork(x).packet});
 return {...x,burden};
}
test('source templates trace exact rooted action witnesses but never prove comparative guards',()=>{
 const x=fixture(),r=auditBurdenSourceConditions(x);
 assert.equal(r.status,'diagnostic',r.reason);
 assert.equal(r.summary.analysisStatus,'diagnostic');assert.equal(r.actualStrengthState,'unresolved');assert.equal(r.selectionAuthority,false);
 assert.equal(r.summary.templates,5);
 const byId=new Map(r.conditions.map(c=>[c.id,c]));
 for(const id of ['control-resource-mediation','wealth-resource-interference','peer-protects-resource','output-wealth-chain','output-resource-restraint']){
  const c=byId.get(id);assert.ok(c.rows.length>0,id);
  assert.equal(c.guardEvidenceState,'unresolved');assert.equal(c.actualEffectState,'unresolved');
  for(const row of c.rows){
   assert.equal(row.jointRootedBasisPossible,true);assert.ok(row.witness.length>0);
   assert.equal(new Set(Object.values(row.bindings)).size,Object.values(row.bindings).length);
   assert.ok(row.actionIds.every(a=>x.burden.actionRows.some(b=>b.id===a)));
   assert.ok(row.operationVariableIds.every(v=>row.witness.includes(v)));
  }
 }
});
test('literal exposure does not disappear when a rooted operation cannot be established',()=>{
 const a=auditBurdenSourceConditions(fixture(true,true)),b=auditBurdenSourceConditions(fixture(true,false));
 assert.equal(b.status,'diagnostic',b.reason);assert.equal(a.summary.literalContexts,b.summary.literalContexts);
 assert.equal(b.summary.rootedContexts,0);assert.ok(b.conditions.flatMap(c=>c.rows).every(r=>r.jointRootedBasisPossible===false&&r.witness===null));
 assert.ok(b.conditions.every(c=>c.guardEvidenceState==='unresolved'));
});
test('changed action identity or removed coverage fails closed',()=>{
 const x=fixture();
 assert.equal(auditBurdenSourceConditions({...x,burden:{...x.burden,actionRows:x.burden.actionRows.slice(1)}}).reason,'action-coverage');
 assert.equal(auditBurdenSourceConditions({...x,burden:{...x.burden,actionRows:x.burden.actionRows.map((a,i)=>i?a:{...a,operationVariableId:'fake'})}}).reason,'action-proof-binding');
 assert.equal(auditBurdenSourceConditions({...x,burden:{...x.burden,judgments:[]}}).reason,'proof-replay');
});
test('partial scope publishes no source-conditioned effect and registry copies are isolated',()=>{
 const q=auditBurdenSourceConditions(fixture(false));
 assert.equal(q.status,'partial',q.reason);assert.deepEqual(q.conditions,[]);assert.equal(q.actualMagnitudeComparison,'unresolved');
 const a=burdenSourceConditions();a[0].legs.length=0;
 assert.ok(burdenSourceConditions()[0].legs.length>0);
});
