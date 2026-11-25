import test from 'node:test';
import assert from 'node:assert/strict';
import {observeBranchAccessContext,observeMonthChange,observeBranchRouteAccess} from '../src/features/pattern/outcome-branch-context.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const h={id:'hidden:month:갑',position:'month',stem:'갑',element:'wood',tenGod:'편인',layer:'hidden',hiddenRole:'principal',roots:[{position:'month',match:'exact-stem',role:'principal',clashExposed:false}]};
const v=(position,stem,element)=>({id:'visible:'+position,position,stem,element,layer:'visible',dayReference:position==='day'});
const make=()=>{
 const actors=[h,v('day','병','fire'),v('year','을','wood'),v('hour','임','water')];
 const f={id:'g',layer:'branch',classification:'complete-three',positions:['year','month','day'],target:'fire',flags:{structurallyComplete:true,monthSupports:true,seasonSupports:true},roots:[],visible:[],clashOverlap:[],competingOverlaps:[],sameTargetOverlaps:[]};
 const prior={completeHour:true,stemForce:{occurrences:actors},selection:{candidates:[{id:'principal:갑'},{id:'formation:g',kind:'month-formation',formationId:'g',possibleTenGods:['비견','겁재']}]}};
 const access={completeHour:true,hidden:[{id:h.id,position:h.position,stem:h.stem,role:h.hiddenRole,slot:'branch:month',exactVisibleProjections:[]}],groups:[{id:'group:g',formationId:'g',element:'fire',positions:f.positions}]};
 return {prior,access,formation:{completeHour:true,formations:[f],clashes:[]}};
};
const run=x=>observeBranchAccessContext(x.prior,x.access,x.formation);
test('same element is not exact projection, hidden principal remains a local context',()=>{
 const x=make(),r=run(x);assert.equal(r.status,'diagnostic');assert.deepEqual(r.hidden[0].exactProjectionIds,[]);
 assert.deepEqual(r.hidden[0].sameElementOtherStemIds,['visible:year']);assert.equal(r.hidden[0].accessHypothesis,'local-principal-context');
 assert.equal(r.hidden[0].literalAccessConfirmed,null);
});
test('local clash not remote clash and no automatic storage opening',()=>{
 const x=make();x.formation.clashes=[{id:'remote',positions:['year','day']}];assert.equal(run(x).hidden[0].accessHypothesis,'local-principal-context');
 x.formation.clashes.push({id:'local',positions:['month','hour']});assert.equal(run(x).hidden[0].accessHypothesis,'local-clash-review');
});
test('six harmony and partial pair remain contacts even with target element',()=>{
 const x=make(),f=x.formation.formations[0];f.classification='six-harmony';x.access.groups=[];
 const r=run(x);assert.equal(r.formations[0].accessHypothesis,'contact-only-not-aggregate');
 assert.equal(r.formations[0].groupId,null);
});
test('source change and preservation hypotheses coexist without selecting a pattern',()=>{
 const x=make(),r=observeMonthChange(x.prior,run(x),'인');
 assert.equal(r.sourceClauses.find(c=>c.id==='bing-yin-resource-to-peer').matched,true);
 assert.equal(r.sourceClauses.find(c=>c.id==='bing-yin-resource-preservation').matched,true);
 assert.equal(r.original.family,'resource');assert.deepEqual(r.formationAlternatives[0].possibleFamilies,['peer']);
 assert.equal(r.selectedPattern,null);
});
test('missing-hour absence is unknown and mismatched group or projection is invalid',()=>{
 const x=make();x.prior.completeHour=x.access.completeHour=x.formation.completeHour=false;
 const r=observeMonthChange(x.prior,run(x),'인');assert.equal(r.sourceClauses[0].matched,null);
 const y=make();y.access.hidden[0].exactVisibleProjections=['visible:year'];assert.equal(run(y).status,'invalid-evidence');
 const z=make();z.access.groups=[];assert.equal(run(z).status,'invalid-evidence');
});
test('branch route context preserves separate anchor alternatives and rejects unknown actors',()=>{
 const x=make(),ctx=run(x);
 const q={candidateId:'c',status:'diagnostic',rules:[{id:'s',witnesses:[{id:'w',roles:{helper:'group:g'},edges:[],anchorBindings:[{anchorId:h.id,targetId:'visible:hour'}]}]}]};
 const p=observeBranchRouteAccess(q,ctx).routes[0];assert.equal(p.mandatory.groups[0].id,'group:g');assert.equal(p.anchorAlternatives[0].hidden[0].id,h.id);assert.equal(p.effective,null);
 q.rules[0].witnesses[0].roles.helper='group:unknown';assert.equal(observeBranchRouteAccess(q,ctx).status,'invalid-evidence');
});
test('native month group and projected change preserve literal anchors and authority',()=>{
 for(const ps of [['갑오','병인','병술','임진'],['기묘','임신','기축','갑자']]){
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  const m=r.efficacyReview.mechanismReview;
  assert.equal(m.branchContext.status,'diagnostic');assert.equal(m.monthChange.status,'diagnostic');assert.equal(m.monthChange.selectedPattern,null);assert.equal(r.decisionReview.status,'abstained');
  assert.ok(m.monthChange.sourceClauses.some(c=>c.matched===true));
  assert.ok(m.candidates.every(c=>c.branchAccess.status!=='invalid-evidence'));
 }
});
