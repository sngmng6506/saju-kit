import test from 'node:test';
import assert from 'node:assert/strict';
import {observeRoleCapacity,observeRoleConditions} from '../src/features/pattern/outcome-role-capacity.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const actor=(id,tenGod,layer='visible',dayReference=false)=>({id,tenGod,layer,position:id.split(':')[1],dayReference,element:'fire',roots:[{position:'month',role:'principal',match:'exact-stem',clashExposed:false}]});
const edge=(from,to,kind,relation='left-evidence-dominates')=>({id:from+'>'+to,from,to,kind,relative:{relation,sharedRootPositions:['month']},effective:null});
const sample=()=>{
 const actors=[actor('visible:year','식신'),actor('visible:month','편관'),actor('visible:day','비견','visible',true),actor('visible:hour','편인'),actor('hidden:month:정','식신','hidden')];
 const profiles=Object.fromEntries(actors.map(o=>[o.id,{occurrenceId:o.id,axes:{anySubstantial:true},localGenerationNodes:[],localPeerNodes:[],localControlNodes:[],contacts:[]}]));
 const control=edge('visible:year','visible:month','control'),prior={completeHour:true,stemForce:{occurrences:actors},relativeForce:{profiles,edges:[control]}};
 const review={candidateId:'c',family:'killing',status:'diagnostic',rules:[{id:'killing-food',kind:'support',witnesses:[{id:'w',roles:{helper:control.from,target:control.to,day:'visible:day'},edges:[control]}]}]};
 const mechanism={status:'diagnostic',routes:[{ruleId:'killing-food',witnessId:'w'}]};
 return {prior,review,mechanism,compound:{status:'diagnostic',motifs:[]},strength:{direction:'weak'},combination:{status:'diagnostic',pairs:[]}};
};
const run=x=>observeRoleConditions(x.review,x.prior,observeRoleCapacity(x.prior),x.mechanism,x.compound,x.strength,x.combination);
test('literal role evidence deduplicates root slots and excludes day reference',()=>{
 const x=sample(),r=observeRoleCapacity(x.prior),f=r.tenGods.find(g=>g.tenGod==='식신');
 assert.deepEqual(f.exactRootSlots,['branch:month']);assert.deepEqual(f.sharedRootSlots,['branch:month']);
 assert.equal(f.visibleIds.length,1);assert.equal(f.hiddenIds.length,1);assert.deepEqual(r.tenGods.find(g=>g.tenGod==='비견').visibleIds,[]);
 assert.equal(f.excessConfirmed,null);
});
test('output-killing directional evidence does not substitute for day capacity or excess',()=>{
 const x=sample(),r=run(x).routes[0];
 assert.equal(r.conditions[0].evidence.hypothesis,'source-evidence-dominates');
 assert.equal(r.conditions[1].evidence.hypothesis,'weak-hypothesis');
 assert.equal(r.interpretations[1].evidence,'relative-evidence-aligned');
 assert.equal(r.interpretations[1].excessConfirmed,null);assert.equal(r.netEffectConfirmed,null);
 x.prior.relativeForce.edges[0].relative.relation='right-evidence-dominates';
 assert.equal(run(x).routes[0].interpretations[0].evidence,'relative-evidence-aligned');
});
test('hidden incomparability and missing hour do not become deficiency',()=>{
 const x=sample();x.prior.relativeForce.edges[0].relative.relation='not-comparable';
 assert.equal(run(x).routes[0].conditions[0].evidence.hypothesis,'unresolved');
 x.prior.completeHour=false;assert.equal(run(x).status,'partial');
 assert.equal(observeRoleCapacity(x.prior).tenGods.find(g=>g.tenGod==='정재').visibleObserved,null);
});
test('resource regulation uses separate anchor profiles and strong-day premise without declaring excess',()=>{
 const x=sample();x.review.rules=[{id:'resource-output-regulation',kind:'support',witnesses:[{id:'w',roles:{helper:'visible:year',target:'visible:day'},anchorBindings:[{anchorId:'visible:hour'}],edges:[]}]}];
 x.mechanism.routes[0].ruleId='resource-output-regulation';x.strength.direction='strong';
 const r=run(x).routes[0];assert.equal(r.interpretations[0].evidence,'day-capacity-premise-aligned');assert.equal(r.conditions[1].evidence.excessConfirmed,null);
});
test('rescue review distinguishes inherited pressure and new combination from confirmed removal',()=>{
 const x=sample(),t={id:'d',roles:{target:'visible:month',obstacle:'visible:year'},edges:[x.prior.relativeForce.edges[0]]};
 x.review.rules=[{id:'d',kind:'damage',witnesses:[t]},{id:'r',kind:'rescue',threatRuleId:'d',witnesses:[{id:'r',threatWitnessId:'d',roles:{...t.roles,helper:'visible:hour'},edges:[...t.edges,edge('visible:hour','visible:year','combine')]}]}];
 x.mechanism.routes=[{ruleId:'d',witnessId:'d'},{ruleId:'r',witnessId:'r'}];
 x.combination.pairs=[{id:'p',participants:['visible:hour','visible:year'],contactHypothesis:'local-contact-hypothesis',removalHypothesis:'local-role-restriction-review',competing:[],transformation:{originalRootIds:['visible:year']}}];
 const r=run(x).routes[0];assert.equal(r.interventions.length,1);assert.equal(r.interventions[0].kind,'combination');assert.equal(r.interventions[0].removalConfirmed,null);
});
test('invalid route coverage and profile identity fail closed',()=>{
 const x=sample();x.mechanism.routes=[];assert.equal(run(x).status,'invalid-evidence');
 const y=sample();y.prior.relativeForce.profiles['visible:year'].occurrenceId='other';assert.equal(observeRoleCapacity(y.prior).status,'invalid-evidence');
});
test('native Zhou and resource regulation keep role conditions and authority separate',()=>{
 for(const ps of [['무술','갑자','정미','경술'],['신유','병신','임신','신해']]){
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION}),m=r.efficacyReview.mechanismReview;
  assert.equal(m.roleCapacity.tenGods.length,10);assert.ok(m.candidates.every(c=>c.roleConditions.status!=='invalid-evidence'));
  assert.ok(m.candidates.some(c=>c.roleConditions.routes.length>0));assert.equal(r.decisionReview.status,'abstained');
 }
});
