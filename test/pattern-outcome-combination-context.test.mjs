import test from 'node:test';
import assert from 'node:assert/strict';
import {observeCombinationContext,observeCombinationRoles} from '../src/features/pattern/outcome-combination-context.js';
import {stemCombination} from '../src/core/relations.js';
import {stemInfo} from '../src/core/elements.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const pos=['year','month','day','hour'];
const make=(stems,complete=true)=>{
 const actors=stems.map((stem,i)=>({id:'visible:'+pos[i],position:pos[i],stem,element:stemInfo(stem).element,layer:'visible',dayReference:i===2,tenGod:stem,roots:[]}));
 const formations=actors.flatMap((a,i)=>actors.slice(i+1).flatMap(b=>{
  const c=stemCombination(a.stem,b.stem);
  return c?[{id:a.id+'+'+b.id,classification:'stem-pair',layer:'stem',positions:[a.position,b.position],target:c.associatedElement,
   flags:{monthSupports:true,seasonSupports:true,directClash:false,competingTarget:false},roots:[],visible:[],limitations:[]}]:[];
 }));
 return {prior:{completeHour:complete,stemForce:{occurrences:actors}},formation:{completeHour:complete,formations}};
};
const run=x=>observeCombinationContext(x.prior,x.formation);
const pair=(r,a,b)=>r.pairs.find(p=>p.participants.includes('visible:'+a)&&p.participants.includes('visible:'+b));
test('separated competition does not veto a closer local pair, but remote pair retains competition',()=>{
 const x=run(make(['경','을','갑','을'])),local=pair(x,'year','month'),remote=pair(x,'year','hour');
 assert.equal(local.contactHypothesis,'local-contact-hypothesis');assert.equal(local.competing[0].positionRelation,'farther');
 assert.equal(remote.competing[0].positionRelation,'closer');assert.notEqual(remote.contactHypothesis,'local-contact-hypothesis');
 assert.equal(local.removalConfirmed,null);
});
test('intervening control and self combination are separate contexts',()=>{
 const x=run(make(['갑','경','기','병'])),p=pair(x,'year','day');
 assert.equal(p.contactHypothesis,'intervening-control-review');assert.equal(p.removalScope,'self-combination-not-external-removal');
 assert.equal(p.removalHypothesis,'not-external-removal');
 assert.ok(p.intervening[0].controlsParticipantIds.includes('visible:year'));
});
test('closer external partner is retained for day combination; partial chart cannot establish local hypothesis',()=>{
 const x=run(make(['경','을','을','병'])),p=pair(x,'year','day');
 assert.ok(p.competing.some(c=>c.positionRelation==='closer'));
 assert.equal(p.removalHypothesis,'not-external-removal');
 assert.equal(pair(run(make(['경','을','갑'],false)),'year','month').contactHypothesis,'unresolved');
});
test('target supply and original root evidence can coexist without transformation',()=>{
 const x=make(['을','경','갑','신']),f=x.formation.formations[0];
 f.roots=[{role:'principal',position:'month',clashExposed:false}];f.visible=[{position:'hour',participating:false,isDayMaster:false,outsideUnclashedRoots:['month']}];
 x.prior.stemForce.occurrences[0].roots=[{role:'principal',position:'day',match:'exact-stem',clashExposed:false}];
 const p=pair(run(x),'year','month');assert.equal(p.transformation.context,'competing-original-and-target-root-evidence');
 assert.deepEqual(p.transformation.originalRootIds,['visible:year']);assert.equal(p.transformation.transformationConfirmed,null);
});
test('rescue restriction targets exact obstacle and retains other same-role occurrences',()=>{
 const x=make(['경','을','갑','경']),ctx=run(x);
 const q={candidateId:'c',status:'diagnostic',anchorIds:['visible:day'],rules:[{id:'r',kind:'rescue',witnesses:[{id:'w',roles:{obstacle:'visible:year',helper:'visible:month',target:'visible:day'},edges:[{from:'visible:month',to:'visible:year',kind:'combine'}]}]}]};
 const p=observeCombinationRoles(q,ctx,x.prior).routes[0];assert.equal(p.intendedObstacleId,'visible:year');
 assert.deepEqual(p.otherSameTenGodOccurrences.map(o=>o.occurrenceId),['visible:hour']);assert.equal(p.removalConfirmed,null);
 assert.equal(p.protectedRolePreserved,null);
});
test('missing or duplicate core pair cannot be silently accepted',()=>{
 const x=make(['경','을','갑','병']);x.formation.formations=[];assert.equal(run(x).status,'invalid-evidence');
 const y=make(['경','을','갑','병']);y.formation.formations.push(y.formation.formations[0]);assert.equal(run(y).status,'invalid-evidence');
});
test('native source separated partner and day-reference combination remain diagnostic',()=>{
 for(const ps of [['경오','을유','갑자','을해'],['경인','을유','을미','병자']]){
  const saju={pillars:Object.fromEntries(pos.map((p,i)=>[p,{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  const c=r.efficacyReview.mechanismReview.combinationContext;
  assert.equal(c.status,'diagnostic');assert.equal(c.transformationConfirmed,null);assert.equal(r.decisionReview.status,'abstained');
  assert.ok(c.pairs.every(p=>p.removalConfirmed===null));assert.ok(c.branchFormations.every(p=>p.transformationConfirmed===null));
  assert.ok(r.efficacyReview.mechanismReview.candidates.every(m=>m.combinationRoles.status!=='invalid-evidence'));
 }
});
