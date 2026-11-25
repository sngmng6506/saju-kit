import test from 'node:test';
import assert from 'node:assert/strict';
import {observeCapacityComparisons,observeRouteFlow} from '../src/features/pattern/outcome-role-flow.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const actor=(id,tenGod)=>({id,position:id.split(':')[1],layer:id.startsWith('hidden')?'hidden':'visible',tenGod});
const e=(from,to,kind)=>({from,to,kind,id:from+'>'+to,blockers:[],effective:null});
const sample=()=>{
 const k=actor('visible:year','편관'),i=actor('visible:month','정인'),d=actor('visible:day','비견'),o=actor('visible:hour','식신');
 const actors=[k,i,d,o],profiles=Object.fromEntries(actors.map(a=>[a.id,{occurrenceId:a.id,axes:{root:true},rootPositions:['month'],localGenerationNodes:[],localPeerNodes:[],localControlNodes:[],contacts:[],rootClashExposed:[]}]));
 const edges=[e(k.id,i.id,'generate'),e(i.id,d.id,'generate'),e(k.id,d.id,'control'),e(d.id,o.id,'generate'),e(o.id,k.id,'control')];
 const prior={completeHour:true,stemForce:{occurrences:actors},relativeForce:{profiles,edges}};
 const review={candidateId:'c',family:'killing',status:'diagnostic',anchorIds:[k.id],rules:[{id:'s',kind:'support',witnesses:[{id:'w',edges:edges.slice(2),roles:{}}]}]};
 return {prior,capacity:{status:'diagnostic',occurrences:actors},review,access:{groups:[]},mechanism:{status:'diagnostic',edges:edges.map(e=>({...e,status:'unresolved'}))},strength:{direction:'weak'}};
};
const run=x=>observeRouteFlow(x.review,x.prior,x.access,x.mechanism,x.strength);
test('individual comparisons retain shared root context and no magnitude',()=>{
 const x=sample(),r=observeCapacityComparisons(x.prior,x.capacity);
 assert.equal(r.pairs.length,6);assert.ok(r.pairs.every(p=>p.cautions.includes('shared-supply-not-independent')&&p.effectiveForce===null));
 x.prior.relativeForce.profiles['visible:year'].axes.root=null;
 assert.equal(observeCapacityComparisons(x.prior,x.capacity).pairs[0].comparison.relation,'unresolved');
});
test('day receives pressure and drain without subtracting net force',()=>{
 const x=sample(),before=JSON.stringify(x),r=run(x),d=r.routes[0].nodes.find(n=>n.occurrenceId==='visible:day');
 assert.ok(d.contexts.includes('drain-and-pressure'));assert.equal(d.netEffectConfirmed,null);assert.equal(JSON.stringify(x),before);
});
test('killing resource day context requires exact three edges and is not a new support witness',()=>{
 const x=sample(),r=run(x);
 assert.equal(r.mediationContexts.length,1);assert.equal(r.mediationContexts[0].dayCapacity,'weak');assert.equal(r.mediationContexts[0].mediationConfirmed,null);assert.equal(r.routes.length,1);
 x.prior.relativeForce.edges.shift();assert.equal(run(x).mediationContexts.length,0);
});
test('alternative anchor routes cannot be merged into simultaneous supply',()=>{
 const x=sample(),w=x.review.rules[0].witnesses[0];
 w.anchorBindings=[{anchorId:'visible:year',edge:x.prior.relativeForce.edges[0]},{anchorId:'visible:month',edge:x.prior.relativeForce.edges[1]}];
 const r=run(x).routes[0];assert.equal(r.anchorAlternatives.length,2);
 assert.equal(r.nodes.some(n=>n.occurrenceId==='visible:month'),false);
 assert.equal(r.anchorAlternatives[0].nodes.find(n=>n.occurrenceId==='visible:month').outflows.length,0);
 assert.equal(r.anchorAlternatives[1].nodes.find(n=>n.occurrenceId==='visible:month').receives.length,0);
});
test('rescue links only the bound threat and separates its new intervention',()=>{
 const x=sample(),d=x.review.rules[0];d.kind='damage';
 x.review.rules.push({id:'r',kind:'rescue',threatRuleId:'s',witnesses:[{id:'r',threatWitnessId:'w',edges:[x.prior.relativeForce.edges[0]]}]});
 const r=run(x).routes[1];assert.equal(r.boundThreat.witnessId,'w');
 assert.equal(r.nodes.find(n=>n.occurrenceId==='visible:year').outflows[0].origin,'witness');
 assert.equal(r.nodes.find(n=>n.occurrenceId==='visible:day').controlledBy[0].origin,'bound-threat');
 x.review.rules[1].witnesses[0].threatWitnessId='bad';assert.equal(run(x).status,'invalid-evidence');
});
test('partial chart does not retain a decisive day capacity premise',()=>{
 const x=sample();x.prior.completeHour=false;
 assert.equal(run(x).mediationContexts[0].dayCapacity,'unresolved');assert.equal(run(x).status,'partial');
});
test('native flow projection is diagnostic and preserves abstention',()=>{
 const ps=['무술','갑자','정미','경술'],saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION}),m=r.efficacyReview.mechanismReview;
 assert.equal(m.capacityComparisons.status,'diagnostic');assert.ok(m.candidates.every(c=>c.roleFlow.status!=='invalid-evidence'));
 assert.equal(r.decisionReview.status,'abstained');
});
