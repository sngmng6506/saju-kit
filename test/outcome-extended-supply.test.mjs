import test from 'node:test';
import assert from 'node:assert/strict';
import {elementRelation} from '../src/core/elements.js';
import {compileReplenishmentNetwork} from '../src/features/pattern/outcome-replenishment-network.js';
import {compareReplenishmentBurden} from '../src/features/pattern/outcome-burden-comparison.js';
import {compareRelayPaths,auditExtendedSupply} from '../scripts/lib/pattern-extended-supply.mjs';
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
 const occurrences=nodes.map(n=>({id:n.occurrenceIds[0],graphNodeId:n.id,position:n.position,element:n.element,stem:n.stem,layer:n.kind==='visible-stem'?'visible':'hidden',effectiveForce:null,confirmed:false,peers:nodes.filter(b=>b.element===n.element&&!(b.position===n.position&&b.kind===n.kind)).map(evidence),generationReceived:edges.filter(e=>e.to===n.id&&e.type==='generate'),controlReceived:edges.filter(e=>e.to===n.id&&e.type==='control'),outputAndControl:edges.filter(e=>e.from===n.id)}));
 const actions=edges.filter(e=>e.local&&(targets.includes(e.from)||targets.includes(e.to))).map(e=>({id:key(e.type,e.from,e.to),kind:e.type,from:e.from,to:e.to,actualOperationState:'unresolved'}));
 const links=actions.filter(a=>a.kind==='generate'&&targets.includes(a.to)).map(a=>({id:'link:'+a.id,kind:'generate',from:a.from,to:a.to}));
 for(const a of nodes)for(const b of nodes){
  if(a.id!==b.id&&targets.includes(b.id)&&a.element===b.element&&Math.abs(order.indexOf(a.position)-order.indexOf(b.position))<=1)links.push({id:key('peer',a.id,b.id),kind:'peer',from:a.id,to:b.id});
 }
 const x={completeHour,nodes,links,targets};
 const burden=compareReplenishmentBurden({...x,actions,replenishmentPacket:compileReplenishmentNetwork(x).packet});
 return {...x,burden,stemForce:{completeHour,occurrences,selectionAuthority:false,effectsConfirmed:false}};
}

const link=(id,from,to,gates=[])=>({id,from,to,operationVariableId:'op:'+id,gates});
test('simple path extension comparison matches exhaustive shared assignments',()=>{
 const nodes=[{id:'a',rootIds:['r']},{id:'b',rootIds:['r']},{id:'c',rootIds:[]}];
 const local=[link('ab','a','b'),link('bc','b','c')],extra=[link('ac','a','c',['access']),link('ca','c','a',['access'])];
 const ids=[key('slot-retained','r'),key('root-access','a','r'),key('root-access','b','r'),...local.concat(extra).map(l=>l.operationVariableId),'access'];
 for(const targetId of ['a','b','c'])for(const excludeRecipient of [false,true]){
  const q=compareRelayPaths({nodes,local,extra,targetId,excludeRecipient});
  assert.equal(q.status,'diagnostic',q.reason);
  const reach=(truth,links)=>{
   const reached=new Set(nodes.filter(n=>(!excludeRecipient||n.id!==targetId)&&n.rootIds.some(r=>truth.has(key('slot-retained',r))&&truth.has(key('root-access',n.id,r)))).map(n=>n.id));
   let changed=true;while(changed){changed=false;for(const l of links)if((!excludeRecipient||l.from!==targetId)&&reached.has(l.from)&&truth.has(l.operationVariableId)&&l.gates.every(g=>truth.has(g))&&!reached.has(l.to)){reached.add(l.to);changed=true;}}
   return reached.has(targetId);
  };
  let b=false,e=false,d=false;
  for(let m=0;m<2**ids.length;m++){
   const truth=new Set(ids.filter((_,i)=>m&(1<<i))),x=reach(truth,local),y=reach(truth,[...local,...extra]);
   b||=x;e||=y;d||=y&&!x;assert.ok(!x||y);
  }
  assert.deepEqual([!!q.baseline,!!q.extended,!!q.extensionOnly],[b,e,d]);
  if(q.extensionOnly){const t=new Set(q.extensionOnly.assumptions);assert.equal(reach(t,local),false);assert.equal(reach(t,[...local,...extra]),true);}
 }
});
test('cycles without another source do not establish independent supply',()=>{
 const nodes=[{id:'a',rootIds:['r']},{id:'b',rootIds:[]}],local=[link('ab','a','b')],extra=[link('ba','b','a',['access'])];
 const q=compareRelayPaths({nodes,local,extra,targetId:'a',excludeRecipient:true});
 assert.equal(q.status,'diagnostic');assert.equal(q.extended,null);assert.equal(q.extensionOnly,null);
 assert.equal(compareRelayPaths({nodes,local,extra,targetId:'a'}).extensionOnly,null);
 assert.equal(compareRelayPaths({nodes,local,extra:[{...extra[0],operationVariableId:local[0].operationVariableId}],targetId:'a'}).reason,'identity');
 assert.equal(compareRelayPaths({nodes,local,extra:[{...extra[0],gates:[local[0].operationVariableId]}],targetId:'a'}).reason,'variable-alias');
});
test('expanded chart preserves baseline and requires explicit access for each new relay',()=>{
 const x=fixture(),q=auditExtendedSupply(x);
 assert.equal(q.status,'diagnostic',q.reason);assert.equal(q.rows.length,5);assert.ok(q.extraLinks.length>0);
 assert.ok(q.extraLinks.every(l=>l.gates.length>0&&l.actualOperationState==='unresolved'));
 assert.ok(q.extraLinks.filter(l=>l.distance>1).every(l=>l.gates.some(g=>g.startsWith('["nonlocal-relay-access",'))));
 assert.ok(q.extraLinks.filter(l=>!x.targets.includes(l.to)).every(l=>l.gates.includes(key('hidden-reception-access',l.to))));
 assert.ok(q.rows.every(r=>!r.baselinePossible||r.extendedPossible));assert.ok(q.rows.some(r=>r.extensionOnlyPossible));
 for(const r of q.rows)if(r.witnesses.extensionOnly){
  const w=r.witnesses.extensionOnly;
  assert.ok(w.extraLinkIds.every(id=>q.extraLinks.find(l=>l.id===id).gates.every(g=>w.assumptions.includes(g))));
  if(r.scope==='recipient-excluded')assert.ok(w.seedNodeId!==r.targetId&&!w.nodeIds.slice(0,-1).includes(r.targetId));
 }
 assert.equal(q.actualStrengthState,'unresolved');assert.equal(q.selectionAuthority,false);
});
test('rootless, partial and falsified peer observations do not promote supply',()=>{
 const q=auditExtendedSupply(fixture(true,false));assert.equal(q.status,'diagnostic',q.reason);assert.ok(q.rows.every(r=>!r.extendedPossible&&!r.extensionOnlyPossible));
 assert.equal(auditExtendedSupply(fixture(false)).status,'partial');
 const x=fixture(),a=x.stemForce.occurrences.find(a=>a.peers.length);
 const altered={...x,stemForce:{...x.stemForce,occurrences:x.stemForce.occurrences.map(b=>b===a?{...b,peers:[]}:b)}};
 assert.equal(auditExtendedSupply(altered).reason,'peer-scope-coverage');
});
