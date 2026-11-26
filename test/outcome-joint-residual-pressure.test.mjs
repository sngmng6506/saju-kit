import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateArguments} from '../src/features/pattern/outcome-argumentation.js';
import {queryPositiveProofConstraints} from '../src/features/pattern/outcome-frontier-constraints.js';
import {compileReplenishmentNetwork} from '../src/features/pattern/outcome-replenishment-network.js';
import {compareReplenishmentBurden} from '../src/features/pattern/outcome-burden-comparison.js';
import {elementRelation} from '../src/core/elements.js';
import {auditJointResidualPressure} from '../scripts/lib/pattern-joint-residual-pressure.mjs';
import {auditResidualPressure} from '../scripts/lib/pattern-residual-pressure.mjs';
const key=(...xs)=>JSON.stringify(xs);
const lit=propositionId=>({propositionId,sign:'for'});
const obs=id=>({id,subject:id,kind:'fixture',level:'observation'});
const hyp=id=>({id,subject:id,kind:'fixture',level:'structural-hypothesis'});
const rule=(id,from,to)=>({id,policyId:'fixture',conclusion:lit(to),premises:from.map(lit),refs:[{owner:'fixture',id,field:'basis'}],applicability:'complete-only'});
const fact=(id,sign='for')=>({id:'f:'+id,propositionId:id,sign,refs:[{owner:'fixture',id,field:'value'}],applicability:'complete-only'});
const packet={scope:'complete',propositions:[...['x','y','z'].map(obs),...['A','B','C'].map(hyp)],evidence:[],rules:[rule('xA',['x'],'A'),rule('yA',['y'],'A'),rule('xB',['x'],'B'),rule('zB',['z'],'B'),rule('AB',['A','B'],'C')]};
test('joint constraints match exhaustive proof replay including false observation restrictions',()=>{
 const ids=['x','y','z'],ps=['A','B','C'],queries=[];
 for(let m=0;m<3**ps.length;m++){
  let k=m;const required=[],excluded=[];
  for(const p of ps){if(k%3===1)required.push(p);if(k%3===2)excluded.push(p);k=Math.floor(k/3);}
  for(const fixed of [[],[{id:'x',value:false}],[{id:'x',value:true}]]){
   queries.push({id:key(m,fixed),required,excluded,fixed});
  }
 }
 const result=queryPositiveProofConstraints(packet,queries);assert.equal(result.status,'diagnostic',result.reason);
 const assignments=Array.from({length:8},(_,m)=>{
  const yes=new Set(ids.filter((_,i)=>m&(1<<i)));
  const j=new Map(evaluateArguments({...packet,evidence:ids.map(id=>fact(id,yes.has(id)?'for':'against'))}).judgments.map(j=>[j.id,j.state==='supported']));
  return {yes,j};
 });
 for(const [i,q] of queries.entries()){
  const possible=assignments.some(({yes,j})=>q.required.every(id=>j.get(id))&&q.excluded.every(id=>!j.get(id))&&q.fixed.every(f=>yes.has(f.id)===f.value));
  assert.equal(result.queries[i].feasible,possible,q.id);
 }
});
test('fixed positive facts cannot be disabled and contradictory proposition requests are infeasible',()=>{
 const p={...packet,evidence:[fact('x')]};
 const qs=[{id:'a',required:['A'],excluded:['B'],fixed:[]},{id:'b',required:['A'],excluded:[],fixed:[{id:'x',value:false}]},{id:'c',required:['C'],excluded:[],fixed:[]},{id:'d',required:['A'],excluded:['A'],fixed:[]}];
 const q=queryPositiveProofConstraints(p,qs);assert.equal(q.status,'diagnostic',q.reason);
 assert.deepEqual(q.queries.map(x=>x.feasible),[false,false,true,false]);assert.deepEqual(q.queries[2].witness,[]);
 const collision={...p,evidence:[{...fact('x'),id:key('constraint-witness',0)}]};
 assert.equal(queryPositiveProofConstraints(collision,[qs[2]]).queries[0].feasible,true);
 assert.equal(queryPositiveProofConstraints(packet,[{...qs[0],required:['unknown']}]).status,'invalid-evidence');
 assert.equal(queryPositiveProofConstraints(packet,Array.from({length:257},(_,i)=>({...qs[0],id:String(i)}))).status,'unavailable');
 assert.equal(queryPositiveProofConstraints({...packet,scope:'partial'},qs).status,'partial');
});
function fixture(completeHour=true,rooted=true){
 const nodes=[
 ['day:stem','day','wood'],['month:stem','month','water'],['hour:stem','hour','earth'],['year:stem','year','fire'],
 ['day:branch:metal','day','metal'],['day:branch:wood','day','wood'],['day:branch:fire','day','fire'],['day:branch:water','day','water']
 ].filter(([,p])=>completeHour||p!=='hour').map(([id,position,element])=>({id,position,element,rootIds:rooted?[id+':root']:[]}));
 const targets=nodes.filter(n=>n.id.endsWith(':stem')).map(n=>n.id),pos=['year','month','day','hour'];
 const actions=nodes.flatMap(a=>nodes.flatMap(b=>{
  const r=elementRelation(a.element,b.element);
  return a.id!==b.id&&(targets.includes(a.id)||targets.includes(b.id))&&Math.abs(pos.indexOf(a.position)-pos.indexOf(b.position))<=1&&['generate','control'].includes(r.type)&&r.direction==='left-to-right'?[{id:key(r.type,a.id,b.id),kind:r.type,from:a.id,to:b.id,actualOperationState:'unresolved'}]:[];
 }));
 const links=actions.filter(a=>a.kind==='generate'&&targets.includes(a.to)).map(a=>({id:'link:'+a.id,from:a.from,to:a.to,kind:'generate'}));
 const x={completeHour,nodes,targets,links},burden=compareReplenishmentBurden({...x,actions,replenishmentPacket:compileReplenishmentNetwork(x).packet});
 return {...x,burden};
}

test('chart-wide queries include exact shared proof variables and preserve baseline abstention',()=>{
 const x=fixture(),q=auditJointResidualPressure(x);
 assert.equal(q.status,'diagnostic',q.reason);assert.equal(q.summary.actualEffectsConfirmed,0);
 assert.equal(q.actualResidualState,'unresolved');assert.equal(q.selectionAuthority,false);
 const g=q.groups.find(g=>g.kind==='chart');
 assert.equal(g.tests.find(t=>t.name==='all-viable-active').feasible,true);
 assert.equal(g.tests.find(t=>t.name==='all-viable-uncovered').feasible,true);
 assert.equal(g.tests.find(t=>t.name==='all-viable-fully-relieved').feasible,false);
 assert.ok(q.dependencies.length>0);
 for(const d of q.dependencies){
  assert.ok(new Set(d.participants.map(p=>p.pressureId)).size>1);
  assert.equal(d.actualCapacityState,'unresolved');
  assert.equal(d.lostUnderExplicitRemoval.length+d.survivingAlternativeUnderRemoval.length,d.participants.length);
  assert.deepEqual(d.requiredAcrossPressureIds,[...new Set(d.lostUnderExplicitRemoval.map(p=>p.pressureId))]);
  if(d.lostUnderExplicitRemoval.length&&d.survivingAlternativeUnderRemoval.length){assert.equal(d.removalQuery.feasible,true);assert.ok(!d.removalQuery.witness.includes(d.variableId));}
 }
 // Check every claimed removal result by a distinct constraint query.
 const p=auditResidualPressure(x,{includeProof:true}).proof.packet;
 for(const d of q.dependencies){
  const v=queryPositiveProofConstraints(p,d.participants.map((r,i)=>({id:String(i),required:[r.propositionId],excluded:[],fixed:[{id:d.variableId,value:false}]})));
  assert.equal(v.status,'diagnostic',v.reason);
  v.queries.forEach((r,i)=>assert.equal(r.feasible,!d.participants[i].requiredInEveryProof));
 }
});
test('partial or rootless chart does not acquire strength or vacuous joint states',()=>{
 const p=auditJointResidualPressure(fixture(false));assert.equal(p.status,'partial');assert.deepEqual(p.groups,[]);
 const q=auditJointResidualPressure(fixture(true,false));
 assert.equal(q.status,'diagnostic',q.reason);assert.equal(q.summary.viable,0);
 assert.ok(q.groups.every(g=>g.tests.length===1&&g.tests[0].feasible===false));
 assert.deepEqual(q.dependencies,[]);assert.equal(q.actualStrengthState,'unresolved');
});
