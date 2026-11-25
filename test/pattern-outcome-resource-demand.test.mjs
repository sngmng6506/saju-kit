import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeResourceDemandConditions} from '../scripts/lib/pattern-outcome-role-policy-triage.mjs';
import {observeResourceSupplyContext,assessResourceDemandConditions} from '../src/features/pattern/outcome-resource-demand.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
function fixture(direction='strong',complete=true){
 const status=complete?'diagnostic':'partial',day='visible:day',a='visible:month',b='visible:year',w='visible:hour';
 const actors=[{id:day,dayReference:true,tenGod:'비견',layer:'visible'},{id:a,tenGod:'정인',layer:'visible'},{id:b,tenGod:'편인',layer:'visible'},...(complete?[{id:w,tenGod:'정재',layer:'visible'}]:[])];
 const occurrence=x=>({id:x.id,layer:x.layer,directRoot:{state:true,uncontestedRootIds:x.id===day?['hidden:day:병']:['hidden:month:을'],contestedRootIds:[],preservationConfirmed:null},paths:[],groundedPathIds:[],effectiveSupply:null});
 const edge=(from,to,kind)=>({edgeId:from+'>'+to,from,to,kind,sourceBasis:'direct-root-observed',generationScreen:'unresolved',controlComparison:null,effective:null,selectionAuthority:false});
 const capacity={status,selectionAuthority:false,occurrences:actors};
 const supply={status,selectionAuthority:false,effectiveSupply:null,occurrences:actors.map(occurrence),actions:[edge(a,day,'generate'),edge(b,day,'generate'),...(complete?[edge(w,a,'control')]:[])]};
 const interposition={roleNeutral:{status,selectionAuthority:false,targetScope:'all-visible-stems',effectConfirmed:null,neutralizationConfirmed:null,roleDemandConfirmed:null,pressureContexts:actors.map(x=>({targetId:x.id,targetScope:'in-scope',controllers:[],effective:null,allPressureResolved:null}))}};
 const review={candidateId:'c',family:'resource',status:'diagnostic'};
 const objective=(id,collection='objective')=>({id,objectiveId:id,collection,roles:{resource:a,day,...(complete?{wealth:w}:{})},conditionalStatus:'unresolved',actualDemand:null,effectConfirmed:null,selected:false,obligations:[{id:'req',role:'resource'}]});
 const demand={candidateId:'c',status,selectionAuthority:false,actualDemand:null,objectives:[objective('excess-resource-moderation'),objective('required-resource-injury')]};
 return {capacity,supply,interposition,review,demand,direction,complete};
}
const chart=x=>observeResourceSupplyContext(x.capacity,x.supply,x.interposition,{direction:x.direction},x.complete);
const run=x=>assessResourceDemandConditions(x.review,x.demand,chart(x),x.complete);
test('strong and weak hypotheses reverse only the day premise, never establish resource excess or deficiency',()=>{
 for(const direction of ['strong','weak',null]){
  const x=fixture(direction),r=run(x);assert.equal(r.status,'diagnostic');
  assert.deepEqual(r.contexts.map(c=>c.dayPremise),direction==='strong'?['supported','opposed']:direction==='weak'?['opposed','supported']:['unresolved','unresolved']);
  assert.ok(r.contexts.every(c=>c.excessConfirmed===null&&c.deficiencyConfirmed===null&&c.unprovedConditions.every(p=>p.state==='unresolved')));
 }
});
test('alternative delivery with shared roots is not independent supply',()=>{
 const r=chart(fixture());assert.equal(r.alternatives.length,2);
 assert.ok(r.alternatives.every(a=>a.coverage==='shared-root-review'&&a.independentSupplyConfirmed===null&&a.substitutionConfirmed===null));
});
test('no borrowed delivery from another resource when exact edge is absent',()=>{
 const x=fixture();x.supply.actions=x.supply.actions.filter(e=>e.from!=='visible:month');
 const r=run(x),c=r.contexts[0];assert.equal(c.delivery,null);assert.equal(c.contextState,'required-edge-unobserved');
});
test('missing hour does not support or oppose day premise and cannot confirm demand',()=>{
 const r=run(fixture('strong',false));assert.equal(r.status,'partial');assert.ok(r.contexts.every(c=>c.dayPremise==='unresolved'&&c.contextState==='partial'));
});
test('foreign actor, duplicated objective and efficacy leaks fail closed',()=>{
 let x=fixture();x.demand.objectives[0].roles.resource='visible:hour';assert.equal(run(x).status,'invalid-evidence');
 x=fixture();x.demand.objectives.push(x.demand.objectives[0]);assert.equal(run(x).status,'invalid-evidence');
 x=fixture();x.supply.actions[0].effective=true;assert.equal(chart(x).status,'invalid-evidence');
});
test('officer-independent context is not an excess conclusion and heavy-resource special context stays separate',()=>{
 const x=fixture();const base=x.demand.objectives[0];
 x.demand.objectives=[{...base,id:'o',objectiveId:'officer-independent-role-review',collection:'resource-officer'},
 {...base,id:'m',objectiveId:'weak-day-heavy-resource-original-reading',collection:'resource-killing'}];
 const r=run(x);assert.equal(r.status,'diagnostic');
 assert.equal(r.contexts[0].axis,'independent-officer');assert.equal(r.contexts[1].axis,'heaviness-context');assert.equal(r.contexts[1].scope,'disputed-ordinary-scope');
 assert.ok(r.contexts.every(c=>c.excessConfirmed===null));
});
test('native V10 source chart resource context is composed and has no authority',()=>{
 for(const ps of [['신유','병신','임신','신해'],['무술','을묘','병오','을해'],['임인','무신','임진','임인']])for(const complete of [true,false]){
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION}),m=r.efficacyReview.mechanismReview;
  assert.notEqual(r.efficacyReview.status,'invalid-evidence');
  assert.equal(m.resourceSupplyContext.status,complete?'diagnostic':'partial');
  for(const c of m.candidates){const d=c.rolePriority.resourceDemandConditions;assert.ok(['diagnostic','partial','out-of-scope'].includes(d.status));assert.equal(d.excessConfirmed,null);assert.equal(d.selectionAuthority,false);}
  assert.equal(r.decisionReview.status,'abstained');
 }
});

test('resource audit rejects false independent supply, changed source status and dropped contexts',()=>{
 const x=fixture(),c=chart(x),d=run(x);
 const m={resourceSupplyContext:c,candidates:[{candidateId:x.review.candidateId,rolePriority:{demandReview:x.demand,resourceDemandConditions:d}}]};
 const audit=()=>summarizeResourceDemandConditions({id:'fixture'},m,false);
 assert.deepEqual(audit().errors,[]);
 c.alternatives[0].independentSupplyConfirmed=true;
 assert.ok(audit().errors.some(e=>e.startsWith('resource-alternative:')));
 c.alternatives[0].independentSupplyConfirmed=null;
 d.contexts[0].sourceConditionalStatus='supported';
 assert.ok(audit().errors.some(e=>e.startsWith('resource-objective-binding:')));
 d.contexts.pop();
 assert.ok(audit().errors.some(e=>e.startsWith('resource-objective-coverage:')));
});
