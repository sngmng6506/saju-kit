import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateArguments} from '../src/features/pattern/outcome-argumentation.js';
import {compileResidualPressure,auditResidualPressure} from '../scripts/lib/pattern-residual-pressure.mjs';
import {compileReplenishmentNetwork} from '../src/features/pattern/outcome-replenishment-network.js';
import {compareReplenishmentBurden} from '../src/features/pattern/outcome-burden-comparison.js';
import {elementRelation} from '../src/core/elements.js';
const key=(...xs)=>JSON.stringify(xs);
const lit=propositionId=>({propositionId,sign:'for'});
const obs=id=>({id,subject:id,kind:'fixture',level:'observation'});
const hyp=id=>({id,subject:id,kind:'fixture',level:'structural-hypothesis'});
const rule=(id,from,to)=>({id,policyId:'fixture',conclusion:lit(to),premises:[lit(from)],refs:[{owner:'fixture',id,field:'basis'}],applicability:'complete-only'});
const packet={scope:'complete',propositions:[obs('a'),obs('b'),obs('c'),hyp('A'),hyp('B'),hyp('C')],evidence:[],rules:[rule('aA','a','A'),rule('bB','b','B'),rule('cC','c','C')]};
const pressures=[{id:'p',basis:['A'],relief:[{id:'r1',basis:['B']},{id:'r2',basis:['C']}]},{id:'q',basis:['A'],relief:[]}];
test('relief requires exact pressure and explicit full relief hypothesis',()=>{
 const q=compileResidualPressure({packet,pressures});
 assert.equal(q.status,'diagnostic',q.reason);assert.equal(q.actualResidualState,'unresolved');
 const [p,other]=q.rows;
 assert.equal(p.comparison.localFullReliefPossible,true);assert.equal(p.comparison.localUncoveredPossible,true);
 assert.equal(other.comparison.localFullReliefPossible,false);assert.equal(other.comparison.localUncoveredPossible,true);
 assert.ok(p.comparison.witnesses.fullyRelieved.includes(p.pressureGuard));
 assert.ok(p.relief.some(r=>p.comparison.witnesses.fullyRelieved.includes(r.guard)));
 assert.ok(p.relief.every(r=>!p.comparison.witnesses.uncovered.includes(r.guard)));
 assert.ok(q.judgments.every(j=>j.state==='unresolved'));
});
test('symbolic pressure and relief witnesses match all assignments of exact packet',()=>{
 const q=compileResidualPressure({packet,pressures}),ids=q.packet.propositions.filter(p=>p.level==='observation').map(p=>p.id);
 const found=q.rows.map(()=>new Set());
 for(let m=0;m<2**ids.length;m++){
  const truth=new Set(ids.filter((_,i)=>m&(1<<i)));
  const evidence=ids.map((id,i)=>({id:'f'+i,propositionId:id,sign:truth.has(id)?'for':'against',refs:[{owner:'fixture',id,field:'value'}],applicability:'complete-only'}));
  const r=evaluateArguments({...q.packet,evidence}),j=new Map(r.judgments.map(j=>[j.id,j.state==='supported']));
  assert.equal(r.status,'diagnostic');
  q.rows.forEach((p,i)=>{
   const active=truth.has('a')&&truth.has(p.pressureGuard);
   const relieved=active&&p.relief.some(r=>truth.has(r.guard)&&truth.has(r.id==='r1'?'b':'c'));
   assert.equal(j.get(p.pressure),active);assert.equal(j.get(p.fullRelief),relieved);
   found[i].add(active?(relieved?'fullyRelieved':'uncovered'):'inactive');
  });
 }
 q.rows.forEach((p,i)=>assert.deepEqual(Object.keys(p.comparison.witnesses).filter(k=>p.comparison.witnesses[k]!==null).sort(),[...found[i]].sort()));
});
test('invalid basis and duplicate routes are rejected; partial does not publish a comparison',()=>{
 assert.equal(compileResidualPressure({packet,pressures:[{id:'x',basis:['fake'],relief:[]}]}).reason,'pressure-contract');
 assert.equal(compileResidualPressure({packet,pressures:[{...pressures[0],relief:[pressures[0].relief[0],pressures[0].relief[0]]}]}).reason,'relief-contract');
 const p=compileResidualPressure({packet:{...packet,scope:'partial'},pressures});
 assert.equal(p.status,'partial');assert.ok(p.rows.every(r=>r.comparison===null));
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
test('source adapter binds peer rescue only to the exact protected supply, not total wealth demand',()=>{
 const q=auditResidualPressure(fixture());
 assert.equal(q.status,'diagnostic',q.reason);
 const rows=q.rows.filter(r=>r.kind==='resource-interference');
 assert.ok(rows.length>0);assert.ok(rows.some(r=>r.relief.length>0));
 for(const r of rows){
  assert.ok(r.protectedSupplyActionId);
  const [kind,wealth,resource]=JSON.parse(r.pressureActionId);
  assert.equal(kind,'control');assert.equal(r.protectedSupplyActionId,key('generate',resource,'day:stem'));
  assert.ok(r.relief.every(x=>x.actionIds.every(id=>JSON.parse(id)[2]===wealth)));
 }
 assert.ok(q.rows.filter(r=>r.kind==='wealth-demand').every(r=>r.relief.length===0));
 assert.ok(q.rows.some(r=>r.kind==='incoming-control'&&r.relief.length>0));
 assert.ok(q.rows.some(r=>r.kind==='outgoing-generation'&&r.relief.length>0));
 assert.equal(q.actualMagnitudeComparison,'unresolved');assert.equal(q.summary.actualEffectsConfirmed,0);
});
test('missing rooted operation never proves lack of actual burden and partial scope abstains',()=>{
 const a=auditResidualPressure(fixture(true,true)),b=auditResidualPressure(fixture(true,false));
 assert.equal(b.status,'diagnostic',b.reason);assert.equal(a.summary.pressures,b.summary.pressures);
 assert.equal(b.summary.pressurePossible,0);assert.equal(b.actualResidualState,'unresolved');
 const p=auditResidualPressure(fixture(false));assert.equal(p.status,'partial',p.reason);assert.deepEqual(p.rows,[]);
});
