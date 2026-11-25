import test from 'node:test';
import assert from 'node:assert/strict';
import {observeOfficerSupplyContext,assessOfficerDemandConditions} from '../src/features/pattern/outcome-officer-demand.js';
import {summarizeOfficerDemandConditions} from '../scripts/lib/pattern-outcome-role-policy-triage.mjs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const fixture=(complete=true,direction='strong')=>{
 const status=complete?'diagnostic':'partial',d='visible:day',k='visible:month',i='visible:year',f='hidden:day:병',w='hidden:month:기',o='hidden:year:경';
 const actors=[{id:d,layer:'visible',tenGod:'비견',dayReference:true},{id:k,layer:'visible',tenGod:'편관'},{id:i,layer:'visible',tenGod:'정인'},
  {id:f,layer:'hidden',tenGod:'식신'},{id:w,layer:'hidden',tenGod:'정재'},{id:o,layer:'hidden',tenGod:'정관'},...(complete?[{id:'visible:hour',layer:'visible',tenGod:'편재'}]:[])];
 const edge=(from,to,kind)=>({edgeId:from+'>'+to,from,to,kind,sourceBasis:'direct-root-observed',generationScreen:'unresolved',controlComparison:null,effective:null,selectionAuthority:false});
 const capacity={status,selectionAuthority:false,occurrences:actors};
 const supply={status,selectionAuthority:false,effectiveSupply:null,occurrences:actors.map(a=>({id:a.id,layer:a.layer,directRoot:{state:true,uncontestedRootIds:[],contestedRootIds:[],preservationConfirmed:null},paths:[],groundedPathIds:[],effectiveSupply:null})),
  actions:[edge(k,d,'control'),edge(o,d,'control'),edge(k,i,'generate'),edge(o,i,'generate'),edge(i,d,'generate'),edge(f,k,'control'),edge(f,o,'control'),edge(d,f,'generate'),edge(i,f,'control'),edge(w,k,'generate'),edge(w,o,'generate'),edge(w,i,'control')]};
 const interposition={roleNeutral:{status,selectionAuthority:false,targetScope:'all-visible-stems',effectConfirmed:null,neutralizationConfirmed:null,roleDemandConfirmed:null,
  pressureContexts:actors.filter(a=>a.layer==='visible').map(a=>({targetId:a.id,targetScope:'in-scope',controllers:[],effective:null,allPressureResolved:null}))}};
 const review={candidateId:'c',family:'killing',status:'diagnostic'};
 const strategies={candidateId:'c',status,selectionAuthority:false,food:[{id:'food',foodId:f,killingId:k,dayId:d,premises:[{id:'day-capacity-for-control',state:complete?'supported':'unresolved',evidence:{direction,polarity:'yin'}}]}],
  mediation:[{id:'mediation',resourceId:i,killingId:k,dayId:d,weakDayPremises:[{id:'weak-day-mediation-motive',state:!complete?'unresolved':direction==='weak'?'supported':'opposed',evidence:{direction}}]}]};
 const make=(collection,objectiveId,roles={},contextId='ctx')=>({id:collection+':'+objectiveId,collection,objectiveId,contextId,roles:{day:d,killing:k,...roles},selected:false,actualDemand:null,effectConfirmed:null,conditionalStatus:'unresolved'});
 const demand={candidateId:'c',status,selectionAuthority:false,actualDemand:null,objectives:[make('food','food-control',{output:f},'food'),make('mediation','resource-mediation',{resource:i},'mediation')]};
 return {capacity,supply,interposition,review,strategies,demand,complete,direction,make,d,k,i,f,w,o};
};
const chart=x=>observeOfficerSupplyContext(x.capacity,x.supply,x.interposition,{direction:x.direction},x.complete);
const run=x=>assessOfficerDemandConditions(x.review,x.demand,chart(x),x.supply,x.strategies,x.complete);
test('literal officer coexistence is not mixture or purity, and mediation does not erase pressure',()=>{
 const x=fixture(),r=chart(x);assert.equal(r.status,'diagnostic');assert.equal(r.officers.length,2);
 assert.equal(r.coexistence.literalCoexistenceObserved,true);assert.equal(r.coexistence.visibleCoexistenceObserved,false);
 assert.equal(r.coexistence.mixtureConfirmed,null);assert.equal(r.coexistence.purityConfirmed,null);
 assert.equal(r.mediationPaths.length,2);
 for(const m of r.mediationPaths){assert.equal(m.pressure.from,m.officerId);assert.equal(m.delivery.to,x.d);assert.equal(m.pressureReliefConfirmed,null);assert.equal(m.wealthContacts[0].netEffectConfirmed,null);}
});
test('weak-day mediation motive is separate from general mediation and food polarity premise is preserved',()=>{
 const x=fixture(),r=run(x);assert.equal(r.status,'diagnostic');
 assert.equal(r.contexts[0].dayPremise.state,'supported');
 assert.equal(r.contexts[1].dayPremise.state,'not-required');assert.equal(r.contexts[1].weakDayMediationPremise.state,'opposed');
 assert.equal(r.contexts[1].contextState,'source-context-observed');assert.equal(r.contexts[1].effective,null);
});
test('the same wealth feed may support shortage review or burden review without confirming either',()=>{
 const x=fixture();x.demand.objectives=[x.make('killing-wealth-supply','wealth-supplies-needed-killing',{wealth:x.w}),x.make('killing-wealth-supply','wealth-reinforces-dangerous-killing',{wealth:x.w})];
 const r=run(x);assert.equal(r.status,'diagnostic');assert.deepEqual(r.contexts.map(a=>a.axis),['deficiency','burden']);
 assert.equal(r.contexts[0].dayPremise.state,'supported');assert.equal(r.contexts[1].dayPremise.state,'not-required');
 assert.deepEqual(r.contexts[0].relations.wealthSupply,r.contexts[1].relations.wealthSupply);
 assert.ok(r.contexts.every(a=>a.deficiencyConfirmed===null&&a.excessConfirmed===null&&a.effective===null));
});
test('R03 proper officer remains separate from killing supply and disputed heavy-resource scope',()=>{
 const x=fixture();x.review.family='resource';
 x.demand.objectives=[x.make('resource-officer','officer-independent-role-review',{officer:x.o,resource:x.i}),
  x.make('resource-killing','weak-day-heavy-resource-original-reading',{officer:x.k,resource:x.i})];
 const r=run(x);assert.equal(r.status,'diagnostic');assert.equal(r.contexts[0].officerTenGod,'정관');assert.equal(r.contexts[0].axis,'independent-officer');
 assert.equal(r.contexts[1].axis,'disputed-scope');assert.equal(r.contexts[1].dayPremise.state,'opposed');
 x.demand.objectives[1].roles.killing=x.o;x.demand.objectives[1].roles.officer=x.o;assert.equal(run(x).status,'invalid-evidence');
});
test('missing exact supply does not borrow another officer relation',()=>{
 const x=fixture();x.supply.actions=x.supply.actions.filter(e=>e.from!==x.k||e.to!==x.i);
 const r=run(x);assert.equal(r.status,'diagnostic');const m=r.contexts[1];
 assert.equal(m.contextState,'required-edge-unobserved');assert.ok(m.missingEdges.includes('resourceSupply'));assert.equal(m.relations.resourceSupply,null);
});
test('partial hour keeps even a visible mediation unconfirmed and no day premise is promoted',()=>{
 const x=fixture(false),r=run(x);assert.equal(r.status,'partial');assert.equal(chart(x).coexistence.visibleCoexistenceObserved,null);
 assert.equal(r.contexts[0].dayPremise.state,'unresolved');assert.equal(r.contexts[1].weakDayMediationPremise.state,'unresolved');
 assert.ok(r.contexts.every(c=>c.contextState==='partial'&&c.effective===null));
});
test('foreign role, substituted strategy and upstream effect fail closed',()=>{
 let x=fixture();x.demand.objectives[0].roles.killing=x.o;assert.equal(run(x).status,'invalid-evidence');
 x=fixture();x.strategies.mediation[0].resourceId=x.w;assert.equal(run(x).status,'invalid-evidence');
 x=fixture();x.supply.actions[0].effective=true;assert.equal(chart(x).status,'invalid-evidence');
});
test('audit rejects dropped mediation, wrong officer and efficacy promotion',()=>{
 const x=fixture(),c=chart(x),d=run(x),m={officerSupplyContext:c,roleCapacity:x.capacity,groundedSupply:x.supply,candidates:[{candidateId:'c',rolePriority:{demandReview:x.demand,killingStrategies:x.strategies,officerDemandConditions:d}}]};
 const audit=()=>summarizeOfficerDemandConditions({id:'fixture'},m,false);
 assert.deepEqual(audit().errors,[]);
 const paths=c.mediationPaths;c.mediationPaths=[];assert.ok(audit().errors.includes('officer-mediation-coverage'));c.mediationPaths=paths;
 d.contexts[0].relations.pressure={...d.contexts[0].relations.pressure,from:x.o};assert.ok(audit().errors.some(e=>e.startsWith('officer-objective-binding:')));
 d.contexts[0].effective=true;assert.ok(audit().errors.some(e=>e.startsWith('officer-objective-binding:')));
});
test('native V10 composes officer contexts without selecting a pattern',()=>{
 for(const ps of [['임진','갑진','병술','무술'],['무술','갑자','정미','경술'],['병인','무술','신유','무자'],['병인','무술','임술','신축']])for(const complete of [true,false]){
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION}),m=r.efficacyReview.mechanismReview;
  assert.notEqual(r.efficacyReview.status,'invalid-evidence');assert.equal(r.decisionReview.status,'abstained');
  assert.equal(m.officerSupplyContext.status,complete?'diagnostic':'partial');
  for(const c of m.candidates){const d=c.rolePriority.officerDemandConditions;assert.ok(['diagnostic','partial','out-of-scope'].includes(d.status));assert.equal(d.effective,null);}
 }
});
