import test from 'node:test';
import assert from 'node:assert/strict';
import {compileReplenishmentNetwork} from '../src/features/pattern/outcome-replenishment-network.js';
import {compareReplenishmentBurden} from '../src/features/pattern/outcome-burden-comparison.js';
import {elementRelation} from '../src/core/elements.js';
import {querySupplyCut,auditSupplyPreservation} from '../scripts/lib/pattern-supply-preservation.mjs';
const key=(...xs)=>JSON.stringify(xs);
function network(completeHour=true){
 const nodes=[{id:'a',rootIds:['r']},{id:'b',rootIds:['s']},{id:'c',rootIds:[]}],links=[{id:'ac',from:'a',to:'c',kind:'generate'},{id:'bc',from:'b',to:'c',kind:'generate'},{id:'ca',from:'c',to:'a',kind:'peer'}],targets=['a','b','c'];
 const x={completeHour,nodes,links,targets};
 return {...x,packet:compileReplenishmentNetwork(x).packet,targetId:'c'};
}
const result=(q,id)=>q.queries.find(r=>r.id===id).feasible;
test('cut distinguishes surviving alternative and total modeled loss in the same graph',()=>{
 const x=network(),q=querySupplyCut({...x,removedLinkIds:['ac']});
 assert.equal(q.status,'diagnostic',q.reason);assert.equal(result(q,'basis-survives'),true);assert.equal(result(q,'basis-lost'),true);
 assert.equal(result(q,'incoming-survives'),true);assert.equal(result(q,'direct-without-incoming'),false);
 assert.equal(result(q,'impossible-new-basis'),false);assert.equal(q.actualSupplyState,'unresolved');
 const all=querySupplyCut({...x,removedLinkIds:['ac','bc']});
 assert.equal(all.status,'diagnostic',all.reason);assert.equal(result(all,'basis-survives'),false);assert.equal(result(all,'basis-lost'),true);
});
test('cut outcome witnesses agree with exhaustive graph closure and share all original assumptions',()=>{
 const x=network(),q=querySupplyCut({...x,removedLinkIds:['ac']});
 const ids=x.packet.propositions.filter(p=>p.level==='observation').map(p=>p.id);
 const found=new Set();
 for(let mask=0;mask<2**ids.length;mask++){
  const truth=new Set(ids.filter((_,i)=>mask&(1<<i)));
  const reach=links=>{
   const reached=new Set(x.nodes.filter(n=>n.rootIds.some(r=>truth.has(key('slot-retained',r))&&truth.has(key('root-access',n.id,r)))).map(n=>n.id));
   let change=true;while(change){change=false;for(const l of links)if(reached.has(l.from)&&truth.has(key('supply-operation',l.id))&&!reached.has(l.to)){reached.add(l.to);change=true;}}
   return reached.has(x.targetId);
  };
  const before=reach(x.links),after=reach(x.links.filter(l=>l.id!=='ac'));
  if(before)found.add(after?'basis-survives':'basis-lost');
  assert.ok(!after||before);
 }
 for(const id of ['basis-survives','basis-lost'])assert.equal(result(q,id),found.has(id));
 for(const r of q.queries)if(r.witness!==null)assert.ok(r.witness.every(id=>ids.includes(id)));
});
test('direct roots survive a link cut, invalid inventory fails and partial abstains',()=>{
 const x=network(),nodes=x.nodes.map(n=>n.id==='c'?{...n,rootIds:['t']}:n);
 const packet=compileReplenishmentNetwork({...x,nodes}).packet;
 const q=querySupplyCut({...x,nodes,packet,removedLinkIds:['ac','bc']});
 assert.equal(q.status,'diagnostic',q.reason);assert.equal(result(q,'direct-without-incoming'),true);
 assert.equal(querySupplyCut({...x,removedLinkIds:['fake']}).reason,'cut-contract');
 assert.equal(querySupplyCut({...x,removedLinkIds:['ac'],packet:{...x.packet,rules:x.packet.rules.slice(1)}}).reason,'network-proof-binding');
 assert.equal(querySupplyCut({...network(false),removedLinkIds:['ac']}).status,'partial');
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

test('source adapter cuts only exact threatened generation links and conditions on uncovered pressure',()=>{
 const x=fixture(),q=auditSupplyPreservation(x);
 assert.equal(q.status,'diagnostic',q.reason);assert.ok(q.rows.length>0);assert.equal(q.actualStrengthState,'unresolved');
 for(const r of q.rows){
  assert.equal(r.interruptionAssumed,true);assert.ok(r.removedLinkIds.every(id=>x.links.some(l=>l.id===id&&l.to==='day:stem')));
  assert.equal(r.condition.required.length,r.pressureIds.length);assert.equal(r.condition.excluded.length,r.pressureIds.length);
  assert.equal(r.conditionPossible,r.survivalPossible||r.lossPossible);
 }
 const a=x.burden.actionRows.find(a=>a.sharedSupplyLinkId&&a.to==='day:stem');
 const bad={...x,burden:{...x.burden,actionRows:x.burden.actionRows.map(r=>r.id===a.id?{...r,sharedSupplyLinkId:'fake'}:r)}};
 // Forge every protected candidate link so an exact binding cannot pass.
 const invalid={...bad,burden:{...bad.burden,actionRows:bad.burden.actionRows.map(r=>r.sharedSupplyLinkId?{...r,sharedSupplyLinkId:'fake'}:r)}};
 assert.equal(auditSupplyPreservation(invalid).reason,'protected-link-binding');
});
test('rootless and partial chart do not imply supply loss',()=>{
 const q=auditSupplyPreservation(fixture(true,false));assert.equal(q.status,'diagnostic',q.reason);
 assert.equal(q.summary.conditionPossible,0);assert.equal(q.summary.lossPossible,0);assert.equal(q.actualSupplyState,'unresolved');
 const p=auditSupplyPreservation(fixture(false));assert.equal(p.status,'partial');assert.deepEqual(p.rows,[]);
});
