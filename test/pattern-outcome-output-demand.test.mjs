import test from 'node:test';
import assert from 'node:assert/strict';
import {observeOutputSupplyContext,assessOutputDemandConditions} from '../src/features/pattern/outcome-output-demand.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const fixture=(complete=true,tenGod='식신',direction='strong')=>{
 const status=complete?'diagnostic':'partial',d='visible:day',f='visible:month',i='visible:year',k='hidden:month:경',w='hidden:day:기';
 const actors=[{id:d,layer:'visible',tenGod:'비견',dayReference:true},{id:f,layer:'visible',tenGod},{id:i,layer:'visible',tenGod:'편인'},
  {id:k,layer:'hidden',tenGod:'편관'},{id:w,layer:'hidden',tenGod:'정재'},...(complete?[{id:'visible:hour',layer:'visible',tenGod:'상관'}]:[])];
 const edge=(from,to,kind)=>({edgeId:from+'>'+to,from,to,kind,sourceBasis:'direct-root-observed',generationScreen:'unresolved',controlComparison:null,effective:null,selectionAuthority:false});
 const capacity={status,selectionAuthority:false,occurrences:actors};
 const supply={status,selectionAuthority:false,effectiveSupply:null,occurrences:actors.map(a=>({id:a.id,layer:a.layer,directRoot:{state:true,uncontestedRootIds:[],contestedRootIds:[],preservationConfirmed:null},paths:[],groundedPathIds:[],effectiveSupply:null})),
  actions:[edge(d,f,'generate'),edge(f,k,'control'),edge(i,f,'control'),edge(f,w,'generate'),edge(w,k,'generate'),edge(i,d,'generate'),edge(k,d,'control'),edge(w,i,'control')]};
 const interposition={roleNeutral:{status,selectionAuthority:false,targetScope:'all-visible-stems',effectConfirmed:null,neutralizationConfirmed:null,roleDemandConfirmed:null,
  pressureContexts:actors.filter(a=>a.layer==='visible').map(a=>({targetId:a.id,targetScope:'in-scope',controllers:[],effective:null,allPressureResolved:null}))}};
 const review={candidateId:'k',family:'killing',status:'diagnostic'};
 const foodPolicy={candidateId:'k',status,selectionAuthority:false,food:[{id:'f',foodId:f,killingId:k,dayId:d,premises:[{id:'day-capacity-for-control',state:complete?'supported':'unresolved',evidence:{direction,polarity:'yang'}}]}]};
 const demand={candidateId:'k',status,selectionAuthority:false,actualDemand:null,objectives:[{id:'o',collection:'food',contextId:'f',objectiveId:'food-control',roles:{output:f,killing:k,day:d},selected:false,actualDemand:null,effectConfirmed:null,conditionalStatus:'unresolved'}]};
 return {capacity,supply,interposition,review,foodPolicy,demand,complete,direction};
};
const chart=x=>observeOutputSupplyContext(x.capacity,x.supply,x.interposition,{direction:x.direction},x.complete);
const run=x=>assessOutputDemandConditions(x.review,x.demand,chart(x),x.foodPolicy,x.complete);
test('one output can drain day, restrain killing and generate wealth which feeds the same killing',()=>{
 const x=fixture(),r=chart(x),f=r.outputs.find(a=>a.id==='visible:month');
 assert.equal(r.status,'diagnostic');assert.equal(f.drain.from,'visible:day');
 assert.equal(f.officerControl[0].targetTenGod,'편관');assert.equal(f.wealthSupply.length,1);
 assert.equal(f.resourcePressure[0].from,'visible:year');
 assert.equal(r.wealthFeeds.length,1);assert.equal(r.wealthFeeds[0].directOutputControl.to,'hidden:month:경');
 assert.equal(r.wealthFeeds[0].netEffectConfirmed,null);assert.equal(f.excessConfirmed,null);
});
test('K01 preserves original polarity-dependent premise, including weak yin exception',()=>{
 const x=fixture(true,'식신','weak');
 x.foodPolicy.food[0].premises[0]={id:'day-capacity-for-control',state:'unresolved',evidence:{direction:'weak',polarity:'yin',originalText:'opposed',xuPolarityClause:'unresolved'}};
 const r=run(x);assert.equal(r.status,'diagnostic');assert.equal(r.contexts[0].dayPremise.state,'unresolved');
 assert.equal(r.contexts[0].dayPremise.detail.polarity,'yin');assert.equal(r.contexts[0].necessityConfirmed,null);
});
test('K02 literal food clause rejects hurting officer without banning K03 output rescue',()=>{
 const x=fixture(true,'상관');assert.equal(run(x).status,'invalid-evidence');
 const o=x.demand.objectives[0];o.collection='objective';o.objectiveId='excess-food-moderation';o.roles.resource='visible:year';
 assert.equal(run(x).status,'invalid-evidence');
 o.collection='killing-wealth-dual';o.objectiveId='wealth-relieves-output-obstruction';o.roles.wealth='hidden:day:기';
 const r=run(x);assert.equal(r.status,'diagnostic');assert.equal(r.contexts[0].outputTenGod,'상관');
});
test('R01 separates day hypothesis and output excess, and requires exact drain',()=>{
 const x=fixture();x.review.family='resource';const o=x.demand.objectives[0];o.collection='resource-output';o.objectiveId='drain-burdens-weak-day';
 o.roles.resource='visible:year';x.direction='weak';
 const r=run(x);assert.equal(r.contexts[0].dayPremise.state,'supported');assert.equal(r.contexts[0].excessConfirmed,null);
 x.supply.actions=x.supply.actions.filter(e=>e.from!=='visible:day');
 assert.equal(run(x).contexts[0].contextState,'required-edge-unobserved');
});
test('partial chart suppresses source premise and drain screen',()=>{
 const x=fixture(false),r=run(x);assert.equal(r.status,'partial');assert.equal(r.contexts[0].dayPremise.state,'unresolved');
 assert.equal(r.contexts[0].drainObservation,'partial');assert.equal(r.contexts[0].effective,null);
});
test('foreign output, mismatched food policy and leaked effect fail closed',()=>{
 let x=fixture();x.demand.objectives[0].roles.output='visible:year';assert.equal(run(x).status,'invalid-evidence');
 x=fixture();x.foodPolicy.food[0].foodId='visible:hour';assert.equal(run(x).status,'invalid-evidence');
 x=fixture();x.supply.actions[0].effective=true;assert.equal(chart(x).status,'invalid-evidence');
});
test('native V10 projects output inventory and conditions without decision authority',()=>{
 for(const ps of [['임진','갑진','병술','무술'],['무술','갑자','정미','경술'],['무술','을묘','병오','을해']])for(const complete of [true,false]){
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION}),m=r.efficacyReview.mechanismReview;
  assert.notEqual(r.efficacyReview.status,'invalid-evidence');assert.equal(r.decisionReview.status,'abstained');
  assert.equal(m.outputSupplyContext.status,complete?'diagnostic':'partial');
  for(const c of m.candidates){const d=c.rolePriority.outputDemandConditions;assert.ok(['diagnostic','partial','out-of-scope'].includes(d.status));assert.equal(d.effective,null);}
 }
});
