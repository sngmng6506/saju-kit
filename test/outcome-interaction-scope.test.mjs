import test from 'node:test';
import assert from 'node:assert/strict';
import {elementRelation} from '../src/core/elements.js';
import {compileReplenishmentNetwork} from '../src/features/pattern/outcome-replenishment-network.js';
import {compareReplenishmentBurden} from '../src/features/pattern/outcome-burden-comparison.js';
import {auditInteractionScope} from '../scripts/lib/pattern-interaction-scope.mjs';
const key=(...xs)=>JSON.stringify(xs),order=['year','month','day','hour'];
function fixture(completeHour=true,rooted=true){
 const nodes=[
 ['year:stem','year','fire','병'],['month:stem','month','water','계'],['day:stem','day','wood','갑'],['hour:stem','hour','earth','무'],
 ['year:branch:metal','year','metal','경'],['year:branch:water','year','water','임'],['day:branch:wood','day','wood','갑'],['day:branch:fire','day','fire','병'],['hour:branch:earth','hour','earth','무']
 ].filter(([,p])=>completeHour||p!=='hour').map(([id,position,element,stem])=>{
  const visible=id.endsWith(':stem'),occurrenceId=visible?'visible:'+position:'hidden:'+position+':'+stem;
  return {id,position,element,stem,kind:visible?'visible-stem':'local-branch-constituents',occurrenceIds:[occurrenceId],rootIds:rooted?[occurrenceId+':root']:[]};
 });
 const targets=nodes.filter(n=>n.kind==='visible-stem').map(n=>n.id);
 const evidence=n=>({id:n.id,position:n.position,element:n.element,layer:n.kind==='visible-stem'?'stem':'branch'});
 const edges=nodes.flatMap(a=>nodes.flatMap(b=>{
  const r=elementRelation(a.element,b.element),x=evidence(a),y=evidence(b),distance=Math.abs(order.indexOf(a.position)-order.indexOf(b.position));
  return !(x.position===y.position&&x.layer===y.layer)&&r.direction==='left-to-right'&&['control','generate'].includes(r.type)?[{from:a.id,to:b.id,type:r.type,distance,local:distance<=1,sourceEvidence:x,targetEvidence:y,effectConfirmed:null}]:[];
 }));
 const occurrences=nodes.map(n=>({id:n.occurrenceIds[0],graphNodeId:n.id,position:n.position,element:n.element,stem:n.stem,layer:n.kind==='visible-stem'?'visible':'hidden',effectiveForce:null,confirmed:false,generationReceived:edges.filter(e=>e.to===n.id&&e.type==='generate'),controlReceived:edges.filter(e=>e.to===n.id&&e.type==='control'),outputAndControl:edges.filter(e=>e.from===n.id)}));
 const actions=edges.filter(e=>e.local&&(targets.includes(e.from)||targets.includes(e.to))).map(e=>({id:key(e.type,e.from,e.to),kind:e.type,from:e.from,to:e.to,actualOperationState:'unresolved'}));
 const links=actions.filter(a=>a.kind==='generate'&&targets.includes(a.to)).map(a=>({id:'link:'+a.id,kind:'generate',from:a.from,to:a.to}));
 for(const a of nodes)for(const b of nodes){
  if(a.id!==b.id&&targets.includes(b.id)&&a.element===b.element&&Math.abs(order.indexOf(a.position)-order.indexOf(b.position))<=1)links.push({id:key('peer',a.id,b.id),kind:'peer',from:a.id,to:b.id});
 }
 const x={completeHour,nodes,links,targets};
 const burden=compareReplenishmentBurden({...x,actions,replenishmentPacket:compileReplenishmentNetwork(x).packet});
 return {...x,burden,stemForce:{completeHour,occurrences,selectionAuthority:false,effectsConfirmed:false}};
}
test('scope partitions exact core edges and preserves local action and operation identities',()=>{
 const x=fixture(),q=auditInteractionScope(x);
 assert.equal(q.status,'diagnostic',q.reason);assert.equal(q.summary.analysisStatus,'diagnostic');
 assert.ok(q.summary.groups.every(g=>g.literal>0));assert.equal(q.actualStrengthState,'unresolved');assert.equal(q.selectionAuthority,false);
 assert.equal(new Set(q.rows.map(r=>r.id)).size,q.rows.length);
 assert.equal(q.rows.length,x.stemForce.occurrences.reduce((n,a)=>n+a.outputAndControl.length,0));
 for(const r of q.rows.filter(r=>r.scope==='local-visible')){
  const a=x.burden.actionRows.find(a=>a.id===r.id);assert.equal(r.propositionId,a.propositionId);assert.equal(r.operationVariableId,a.operationVariableId);
 }
 assert.ok(q.rows.every(r=>r.actualOperationState==='unresolved'&&r.localBasisSeededActionPossible));
 assert.ok(q.rows.every(r=>r.witness.includes(r.operationVariableId)));
});
test('co-resident constituents are not emitted as independent cross-slot actions',()=>{
 const q=auditInteractionScope(fixture());
 assert.equal(q.status,'diagnostic',q.reason);assert.equal(q.coResident.length,2);
 for(const r of q.coResident)assert.ok(!q.rows.some(e=>r.nodeIds.includes(e.from)&&r.nodeIds.includes(e.to)));
 assert.ok(q.coResident.every(r=>r.actualInteractionState==='unresolved'));
});
test('partial scope retains literal observations but abstains from possibility claims',()=>{
 const q=auditInteractionScope(fixture(false));
 assert.equal(q.status,'partial',q.reason);assert.ok(q.rows.length>0);
 assert.ok(q.rows.every(r=>r.localBasisSeededActionPossible===null&&r.witness===null));
 assert.ok(q.summary.groups.every(g=>g.rootedPossible===null));
});
test('rootless source does not become rooted by adding nonlocal or hidden actions',()=>{
 const q=auditInteractionScope(fixture(true,false));
 assert.equal(q.status,'diagnostic',q.reason);assert.ok(q.rows.length>0);
 assert.ok(q.rows.every(r=>r.localBasisSeededActionPossible===false&&r.witness===null));
 assert.equal(q.actualMagnitudeComparison,'unresolved');
});
test('missing edges and forged local proof or distance are rejected',()=>{
 const x=fixture(),a=x.stemForce.occurrences.find(a=>a.outputAndControl.length);
 const change=f=>({...x,stemForce:{...x.stemForce,occurrences:x.stemForce.occurrences.map(b=>b===a?{...a,outputAndControl:f(a.outputAndControl)}:b)}});
 assert.equal(auditInteractionScope(change(es=>es.slice(1))).reason,'edge-coverage');
 assert.equal(auditInteractionScope(change(es=>es.map((e,i)=>i?e:{...e,distance:99}))).reason,'edge-binding');
 assert.equal(auditInteractionScope({...x,burden:{...x.burden,judgments:[]}}).reason,'local-proof-replay');
 assert.equal(auditInteractionScope({...x,burden:{...x.burden,actionRows:x.burden.actionRows.slice(1)}}).reason,'local-coverage');
});

test('even a recompiled proof cannot introduce nonlocal or hidden-recipient relays',()=>{
 const x=fixture(),links=x.links;
 const a=x.nodes.find(n=>n.id==='year:branch:water'),b=x.nodes.find(n=>n.id==='day:stem');
 const wide=[...links,{id:'nonlocal',kind:'generate',from:a.id,to:b.id}];
 const c=compileReplenishmentNetwork({...x,links:wide});
 assert.equal(c.status,'diagnostic');
 assert.equal(auditInteractionScope({...x,links:wide}).reason,'local-relay-coverage');
 const hidden=[...links,{id:'hidden-relay',kind:'peer',from:'day:stem',to:'day:branch:wood'}];
 const burden=compareReplenishmentBurden({...x,links:hidden,actions:x.burden.actionRows.map(({id,kind,from,to,actualOperationState})=>({id,kind,from,to,actualOperationState})),replenishmentPacket:compileReplenishmentNetwork({...x,links:hidden}).packet});
 assert.equal(burden.status,'diagnostic',burden.reason);
 assert.equal(auditInteractionScope({...x,links:hidden,burden}).reason,'local-relay-coverage');
 assert.equal(auditInteractionScope({...x,links:x.links.filter(l=>l.kind!=='peer')}).reason,'local-relay-coverage');
});
