import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {observeResourceBalanceContext,assessResourceDemand} from '../src/features/pattern/outcome-resource-demand.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const chart=(ps,complete=true)=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))});
const build=(ps,complete=true,direction='strong')=>{
 const saju=chart(ps,complete),stemForce=analyzeStemForceEvidence({saju}),relativeForce=observeRelativeForce(stemForce);
 const prior={completeHour:complete,stemForce,relativeForce},root=observeRootContext(prior,analyzeFormationEvidence({saju})),supply=observeGroundedSupply(prior,root);
 const strength={direction,policy:'test-direction-only'};
 return {prior,root,supply,strength,context:observeResourceBalanceContext(prior,root,supply,strength)};
};
const synthetic=['을묘','을묘','정묘','을묘'],wang=['신유','병신','임신','신해'];
const demand=(context,collection,objectiveId,resourceId='visible:month')=>({candidateId:'fixture',status:context.status,selectionAuthority:false,actualDemand:null,objectives:[
 {id:JSON.stringify([collection,objectiveId,resourceId]),collection,objectiveId,roles:{resource:resourceId,day:'visible:day'},conditionalStatus:'unresolved',actualDemand:null,effectConfirmed:null}
]});
const assess=(c,collection,id,actor)=>assessResourceDemand(demand(c,collection,id,actor),c,c.completeHour);
test('strong day and screened delivery do not prove surplus; shared roots remain shared',()=>{
 const {context:c}=build(synthetic);
 assert.equal(c.status,'diagnostic');
 const r=c.resources.find(a=>a.id==='visible:month');
 assert.equal(r.deliveryObservation,'structural-delivery-screen-met');
 const a=assess(c,'resource-output','drain-resource-supported-strong-day').conditions[0];
 assert.equal(a.dayPremise.state,'aligned-direction');assert.equal(a.expectedResourceCondition,'excess');
 assert.equal(a.excessConfirmed,null);assert.equal(a.actualDemand,null);
 assert.ok(a.alternativeSources.some(x=>x.sharedRootIds.length&&x.alternativeSupplyConfirmed===null));
});
test('same strong-day premise allows light-resource supply hypothesis without asserting shortage',()=>{
 const {context:c}=build(synthetic);
 const a=assess(c,'resource-killing','killing-supplies-light-resource').conditions[0];
 assert.equal(a.dayPremise.state,'aligned-direction');assert.equal(a.expectedResourceCondition,'deficiency');assert.equal(a.deficiencyConfirmed,null);
 const b=assess(c,'resource-killing','weak-day-heavy-resource-original-reading').conditions[0];
 assert.equal(b.dayPremise.state,'opposed-direction');assert.equal(b.expectedResourceCondition,'abundance');assert.equal(b.reading,'disputed-special-scope');
});
test('weak day and lack of a screened path do not prove resource deficiency',()=>{
 const {context:c}=build(wang,true,'weak');
 const a=assess(c,'objective','required-resource-injury','visible:year').conditions[0];
 assert.equal(a.dayPremise.state,'aligned-direction');assert.equal(a.deliveryObservation,'literal-delivery-context-review');
 assert.equal(a.deficiencyConfirmed,null);assert.equal(a.reading,'xu-commentary');
});
test('officer-independent condition does not require a resource surplus hypothesis',()=>{
 const {context:c}=build(synthetic);
 const a=assess(c,'resource-officer','officer-independent-role-review').conditions[0];
 assert.equal(a.expectedResourceCondition,null);
 assert.ok(a.unresolvedRequirements.includes('officer-purity-and-independent-demand'));
 assert.equal(a.excessConfirmed,null);
});
test('missing hour suppresses day direction and every delivery screen',()=>{
 const {context:c}=build(synthetic,false,'strong');
 assert.equal(c.status,'partial');assert.equal(c.day.direction,null);
 assert.ok(c.resources.every(r=>r.deliveryObservation==='partial'));
 const a=assess(c,'resource-output','drain-resource-supported-strong-day').conditions[0];
 assert.equal(a.dayPremise.state,'unresolved');assert.equal(a.actualDemand,null);
});
test('hidden resource is not credited with visible delivery; foreign actor and root evidence fail closed',()=>{
 const x=build(['임인','무신','임진','임인']),c=x.context;
 const r=c.resources.find(a=>a.layer==='hidden');assert.ok(r);assert.equal(r.deliveryObservation,'hidden-access-review');
 assert.equal(assess(c,'resource-killing','killing-supplies-light-resource',r.id).conditions[0].deliveryObservation,'hidden-access-review');
 assert.equal(assess(c,'resource-killing','killing-supplies-light-resource','visible:day').status,'invalid-evidence');
 const bad=structuredClone(x.supply);bad.occurrences[0].directRoot.uncontestedRootIds.push('foreign');
 assert.equal(observeResourceBalanceContext(x.prior,x.root,bad,x.strength).status,'invalid-evidence');
});
test('native V10 composes resource context and conditions without decision authority',()=>{
 for(const ps of [wang,['무술','을묘','병오','을해'],['임인','무신','임진','임인']])for(const complete of [true,false]){
  const r=analyzePatternOutcomeV10({saju:chart(ps,complete),birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  assert.notEqual(r.efficacyReview.status,'invalid-evidence');
  assert.equal(r.decisionReview.status,'abstained');
  const m=r.efficacyReview.mechanismReview;
  assert.equal(m.resourceBalanceContext.status,complete?'diagnostic':'partial');
  for(const c of m.candidates){const d=c.rolePriority.resourceDemand;
   assert.ok(['diagnostic','partial','out-of-scope'].includes(d.status));assert.equal(d.actualDemand,null);}
 }
});
