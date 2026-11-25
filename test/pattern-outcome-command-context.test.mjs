import test from 'node:test';
import assert from 'node:assert/strict';
import {observeBranchPressure,projectMonthCommand,observeMonthCommandReview} from '../src/features/pattern/outcome-command-context.js';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {getSaju} from '../src/core/calendar.js';
import {readFileSync} from 'node:fs';
const sample=()=>{
 const a={id:'visible:year',element:'wood',layer:'visible',roots:[]},b={id:'visible:day',element:'metal',layer:'visible',roots:[],dayReference:true};
 const axes={principalSupport:true,seasonSupport:true,anySubstantial:true};
 const profiles=Object.fromEntries([a,b].map(o=>[o.id,{axes,rootPositions:[],localGenerationNodes:[],localPeerNodes:[]}]));
 const prior={completeHour:true,stemForce:{occurrences:[a,b]},relativeForce:{profiles}};
 const roots=[a,b].map(o=>({id:o.id,sensitivityAxes:axes}));
 const slot=(p,s,element,state='uncontested-substantial-observation')=>({id:'hidden:'+p+':'+s,position:p,stem:s,element,role:'principal',state,exactProjectionIds:[]});
 const slots=[slot('month','갑','wood','clash-exposed'),slot('hour','경','metal','clash-exposed'),slot('year','을','wood')];
 const root={status:'diagnostic',slots,occurrences:roots,clashes:[{clashId:'c',alternatives:[]}],comparisons:[{left:a.id,right:b.id,original:{relation:'same-evidence-profile'},sensitivity:{relation:'same-evidence-profile'}}]};
 const formation={completeHour:true,clashes:[{id:'c',positions:['month','hour']}],formations:[]};
 const h=(sourceId,stem,element,literalHiddenStemMatch)=>({sourceId,mode:'literal-days',status:'conditional',command:{stem,element},literalHiddenStemMatch});
 const command={status:'diagnostic',hypotheses:[h('a','갑','wood',true),h('b','경','metal',false),{sourceId:'c',mode:'literal-days',status:'source-unresolved',command:null}]};
 return {prior,root,formation,command};
};
const run=x=>projectMonthCommand(x.prior,x.root,x.formation,x.command);
test('command scenarios preserve source divergence, absent literal stems and missing coverage',()=>{
 const x=sample(),before=JSON.stringify(x),r=run(x);
 assert.equal(r.variants[0].slotBasis,'exact-literal-hidden-stem');assert.deepEqual(r.variants[0].slotIds,['hidden:month:갑']);
 assert.equal(r.variants[1].slotBasis,'source-stem-not-in-literal-month');assert.deepEqual(r.variants[1].slotIds,[]);
 assert.equal(r.comparisonCoverage[0].status,'source-or-mode-sensitive');assert.equal(r.commandResolved,false);
 assert.equal(r.effectiveForce,null);assert.equal(JSON.stringify(x),before);
});
test('element-only notation never becomes a literal stem or resolved command',()=>{
 const x=sample();x.command.hypotheses=[{sourceId:'a',mode:'literal-days',status:'conditional',command:{stem:null,element:'wood'},literalHiddenStemMatch:null,atBoundary:true}];
 const r=run(x);assert.equal(r.variants[0].slotBasis,'element-only-source-notation');assert.deepEqual(r.variants[0].slotIds,[]);
 assert.equal(r.comparisonCoverage[0].status,'boundary-review');assert.equal(r.commandResolved,false);
});
test('agreement of available hypotheses is not full agreement with missing sources',()=>{
 const x=sample();x.command.hypotheses.splice(1,1);
 assert.equal(run(x).comparisonCoverage[0].status,'incomplete-source-coverage');
 x.command.hypotheses.push(x.command.hypotheses[0]);assert.equal(run(x).status,'invalid-evidence');
});
test('branch principal control direction is not damage; outside roots remain separate',()=>{
 const x=sample(),r=observeBranchPressure(x.prior,x.root,x.formation).clashes[0];
 assert.equal(r.principalRelation.direction,'right-to-left');assert.deepEqual(r.sides[0].outsideUncontestedRootIds,['hidden:year:을']);
 assert.equal(r.relativeClashStrength,null);assert.equal(r.damageConfirmed,null);
 x.root.slots[1].element='wood';assert.equal(observeBranchPressure(x.prior,x.root,x.formation).clashes[0].principalRelation.type,'same');
});
test('missing hour and chart-only inputs do not invent command scenarios',()=>{
 const x=sample();x.prior.completeHour=false;
 assert.equal(observeMonthCommandReview({birthBasis:'verified-chart'},undefined,x.prior,x.root,x.formation).reason,'missing-hour');
 x.prior.completeHour=true;x.command={status:'unresolved',reason:'missing-birth-instant'};
 assert.deepEqual(run(x).variants,[]);
});
test('native source boundary and divergent commander replays preserve literal slots',()=>{
 const f=JSON.parse(readFileSync(new URL('../docs/month-command-results.json',import.meta.url),'utf8'));
 for(const {birth,commands} of f.examples){
  const saju=getSaju(birth),stemForce=analyzeStemForceEvidence({saju}),relativeForce=observeRelativeForce(stemForce),formation=analyzeFormationEvidence({saju});
  const prior={completeHour:stemForce.completeHour,stemForce,relativeForce},root=observeRootContext(prior,formation);
  const r=observeMonthCommandReview({saju,birthBasis:'verified-chart'},birth,prior,root,formation);
  assert.equal(r.status,'diagnostic');assert.equal(r.variants.length,commands.length);
  assert.ok(r.variants.every(v=>v.effectiveForce===null));assert.equal(r.selectionAuthority,false);
  assert.equal(observeBranchPressure(prior,root,formation).status,'diagnostic');
 }
});
