import {reviewBurden} from '../src/features/pattern/outcome-burden-review.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {reviewReplenishment} from '../src/features/pattern/outcome-replenishment-review.js';
import {replayModeledCoverage,controls,routeControls} from '../scripts/lib/pattern-modeled-consequence-coverage.mjs';
const key=(...xs)=>JSON.stringify(xs);
function fixture(completeHour=true){
 const actors=[
  {id:'visible:year',graphNodeId:'year:stem',position:'year',stem:'갑',element:'wood',layer:'visible'},
  {id:'visible:month',graphNodeId:'month:stem',position:'month',stem:'을',element:'wood',layer:'visible'},
  {id:'hidden:month:계',graphNodeId:'month:branch:water',position:'month',stem:'계',element:'water',layer:'hidden',hiddenRole:'principal'},
  {id:'hidden:day:갑',graphNodeId:'day:branch:wood',position:'day',stem:'갑',element:'wood',layer:'hidden',hiddenRole:'principal'}
 ].map(a=>({...a,contacts:[],controlReceived:[],generationReceived:[],peers:[],roots:[]}));
 const slots=actors.filter(a=>a.layer==='hidden').map(a=>({id:a.id,position:a.position,stem:a.stem,element:a.element,role:a.hiddenRole,state:'uncontested-substantial-observation',effectiveRoot:null}));
 const donor=actors[2];
 for(const a of actors){
  a.roots=slots.filter(s=>s.element===a.element).map(s=>({position:s.position,stem:s.stem,role:s.role}));
  a.peers=actors.filter(b=>b.element===a.element&&b.graphNodeId!==a.graphNodeId).map(b=>({id:b.graphNodeId,position:b.position,element:b.element,contacts:b.contacts}));
  if(a.layer==='visible')a.generationReceived=[{from:donor.graphNodeId,to:a.graphNodeId,type:'generate',local:true,sourceEvidence:{id:donor.graphNodeId},targetEvidence:{id:a.graphNodeId}}];
 }
 const root={status:completeHour?'diagnostic':'partial',completeHour,selectionAuthority:false,rootEffectConfirmed:null,slots,
  occurrences:actors.map(a=>({id:a.id,layer:a.layer,roots:a.roots.map(r=>({...r,id:'hidden:'+r.position+':'+r.stem,state:'uncontested-substantial-observation'})),
   uncontestedRootIds:a.roots.map(r=>'hidden:'+r.position+':'+r.stem),contestedRootIds:[],rootAxes:{anySubstantial:true},seasonal:{},
   localSupply:{generation:{observedIds:a.generationReceived.map(e=>e.from),unresolvedIds:[]}}}))};
 const prior={completeHour,stemForce:{occurrences:actors},relativeForce:{edges:[]}};
 return {prior,root,supply:observeGroundedSupply(prior,root)};
}
test('adapter reuses grounded donor paths and exact local peer inventory',()=>{
 const {prior,root,supply}=fixture(),r=reviewReplenishment(prior,root,supply);
 assert.equal(r.status,'diagnostic',r.reason);
 assert.equal(r.summary.distinctRootSlots,2);
 assert.equal(r.links.filter(l=>l.kind==='generate').length,2);
 assert.equal(r.links.filter(l=>l.kind==='peer').length,3);
 assert.ok(!r.links.some(l=>l.from==='day:branch:wood'&&l.to==='year:stem'));
 assert.ok(r.links.every(l=>l.actualOperationState==='unresolved'));
 const t=r.network.pathAnalysis.targets.find(t=>t.targetId==='year:stem');
 assert.deepEqual(t.distinctRootIds,['hidden:day:갑','hidden:month:계'].sort());
 assert.ok(t.alternatives.some(a=>a.linkIds.length===2));
 assert.equal(r.network.variables.filter(v=>v.id===key('slot-retained','hidden:day:갑')).length,1);
 assert.equal(r.summary.actualEffectsConfirmed,0);
});
test('adapter refuses altered supply, missing peer and partial promotion',()=>{
 const {prior,root,supply}=fixture();
 assert.equal(reviewReplenishment(prior,root,{...supply,nodes:[]}).reason,'supply-replay');
 prior.stemForce.occurrences[0].peers=[];
 assert.equal(reviewReplenishment(prior,root,supply).reason,'peer-coverage');
 const p=fixture(false),r=reviewReplenishment(p.prior,p.root,p.supply);
 assert.equal(r.status,'partial',r.reason);assert.equal(r.network.pathAnalysis.status,'partial');assert.equal(r.network.scenario,null);
});
for(const c of [...controls,...routeControls])for(const complete of [true,false]){
 test('native replenishment replay '+c.id+' '+complete,()=>{
  const r=replayModeledCoverage(c.pillars,complete,{includeSynthesisInputs:true}),q=r.replenishmentReview;
  assert.deepEqual(r.invalid,[]);
  assert.deepEqual(q,reviewReplenishment(...r.replenishmentInputs));
  assert.equal(q.status,complete?'diagnostic':'partial');assert.equal(q.effective,null);assert.equal(q.selectionAuthority,false);
  assert.equal(q.summary.actualEffectsConfirmed,0);
  assert.equal(q.targets.length,complete?4:3);
  const ids=new Set(q.nodes.map(n=>n.id));
  assert.ok(q.links.every(l=>ids.has(l.from)&&q.targets.includes(l.to)&&l.actualOperationState==='unresolved'));
  if(!complete){assert.equal(q.network.pathAnalysis.status,'partial');assert.equal(q.network.scenario,null);}
  else if(q.network.pathAnalysis.status==='diagnostic'){
   for(const t of q.network.pathAnalysis.targets){
    assert.equal(t.actualReplenishmentState,'unresolved');
    assert.ok(t.alternatives.every(a=>new Set(a.nodeIds).size===a.nodeIds.length&&a.nodeIds.at(-1)===t.targetId));
   }
  }
 });
}

test('native burden adapter binds incoming and outgoing physical actions',()=>{
 const {prior,root}=fixture(),actors=prior.stemForce.occurrences;
 // The synthetic fixture already has two local water-to-wood edges.
 for(const a of actors){
  a.outputAndControl=actors.flatMap(b=>{
   if(a.element!=='water'||b.element!=='wood'||Math.abs(['year','month','day','hour'].indexOf(a.position)-['year','month','day','hour'].indexOf(b.position))>1)return [];
   return [{from:a.graphNodeId,to:b.graphNodeId,type:'generate',local:true,sourceEvidence:{id:a.graphNodeId},targetEvidence:{id:b.graphNodeId},effectConfirmed:null}];
  });
  a.generationReceived=a.generationReceived.map(e=>({...e,effectConfirmed:null}));
 }
 const r=reviewReplenishment(prior,root,observeGroundedSupply(prior,root)),q=reviewBurden(prior,r);
 assert.equal(q.status,'diagnostic',q.reason);
 assert.equal(q.summary.actions,2);assert.equal(q.summary.targets,2);
 assert.ok(q.analysis.actionRows.every(a=>a.sharedSupplyLinkId!==null));
 assert.equal(q.summary.actualEffectsConfirmed,0);
 actors[0].generationReceived=[];
 assert.equal(reviewBurden(prior,r).reason,'edge-coverage');
});
for(const c of [...controls,...routeControls])for(const complete of [true,false]){
 test('native burden replay '+c.id+' '+complete,()=>{
  const r=replayModeledCoverage(c.pillars,complete,{includeSynthesisInputs:true}),q=r.burdenReview;
  assert.deepEqual(r.invalid,[]);assert.deepEqual(q,reviewBurden(...r.burdenInputs));
  assert.equal(q.status,complete?'diagnostic':'partial');assert.equal(q.selectionAuthority,false);
  assert.equal(q.effective,null);assert.equal(q.summary.actualEffectsConfirmed,0);
  assert.equal(q.actualMagnitudeComparison,'unresolved');
  assert.ok(q.analysis.rows.every(x=>x.actualStrengthState==='unresolved'));
  if(!complete)assert.equal(q.analysis.frontier.status,'partial');
 });
}
