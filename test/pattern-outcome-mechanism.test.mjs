import test from 'node:test';
import assert from 'node:assert/strict';
import {composeMechanismConditions,chooseMechanismAlternative,projectMechanismClimate,evaluateMechanismEdge,observeMechanismReview} from '../src/features/pattern/outcome-mechanism.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const actor=id=>({id,kind:'visible',axes:{anySubstantial:true},rootPositions:['month']});
const edge=(kind='control',relation='left-evidence-dominates')=>({from:'visible:year',to:'visible:month',kind,status:'root-locality-screen-met',source:actor('visible:year'),target:actor('visible:month'),relative:{relation},blockers:[],effective:null});
test('control hypotheses distinguish directional dominance and conflict from effective verdict',()=>{
 for(const [r,status] of [['left-evidence-dominates','supported'],['right-evidence-dominates','opposed'],['mixed-evidence','conflicting'],['same-evidence-profile','unresolved']]){
  const x=evaluateMechanismEdge(edge('control',r),true);assert.equal(x.status,status);assert.equal(x.effective,null);
 }
 assert.equal(evaluateMechanismEdge(edge('generate','right-evidence-dominates'),true).status,'supported');
});
test('hidden access, root absence and combination never imply ineffective or effective action',()=>{
 const e=edge();e.source={...e.source,kind:'hidden'};assert.equal(evaluateMechanismEdge(e,true).status,'unresolved');
 const g=edge('generate');g.source.axes.anySubstantial=false;g.source.axes.localRootedGeneration=true;
 assert.equal(evaluateMechanismEdge(g,true).status,'unresolved');
 assert.equal(evaluateMechanismEdge({...edge('combine'),combination:{exclusiveObserved:true,adjacent:true}},true).status,'unresolved');
 assert.equal(evaluateMechanismEdge(edge(),false).status,'unresolved');
});
test('required and alternative conditions preserve conflict and uncertainty',()=>{
 const c=(...xs)=>composeMechanismConditions(xs.map(state=>({state})));
 assert.equal(c('supported','unresolved'),'unresolved');assert.equal(c('opposed','supported'),'opposed');
 assert.equal(c('opposed','conflicting'),'conflicting');assert.equal(c(),'unresolved');
 assert.equal(chooseMechanismAlternative(['opposed','unresolved']),'unresolved');
 assert.equal(chooseMechanismAlternative(['conflicting','supported']),'supported');
});
const climateFixture={version:'climate-useful-element-v5',evidence:{sourceProfile:{section:'test'},seasonal:{need:'warmth-review'}},
 requirementContext:{baselineGroups:[['병','임']],alternatives:[{when:'test',stems:['계']}],requirements:[
 {stem:'병',element:'fire',exactVisible:['year'],roots:[{match:'exact-stem',role:'principal',clashExposed:false,position:'month'}],dayReferenceMatches:false,combinations:[]},
 {stem:'임',element:'water',exactVisible:[],roots:[{match:'exact-stem',role:'principal',clashExposed:true,position:'day'}],dayReferenceMatches:false,combinations:[]}]}};
test('climate observes exact substantial roots and retains group uncertainty',()=>{
 const c=projectMechanismClimate(climateFixture,true);
 assert.equal(c.requirements[0].status,'exact-visible-and-root-observed');assert.equal(c.groups[0].allExactVisibleAndRootObserved,false);
 assert.equal(c.adequacyConfirmed,null);assert.equal(c.alternatives[0].conditionResolved,false);
 assert.equal(projectMechanismClimate(null,true).status,'source-unavailable');
});
const review={candidateId:'c',status:'diagnostic',rules:[{id:'s',witnesses:[{id:'w'}]}]};
const row={ruleId:'s',witnessId:'w',kind:'support',roles:{helper:'visible:year'},edges:[edge('generate')],anchorAlternatives:[],flags:[],unresolvedConditions:['actual-supply']};
const efficacy={status:'diagnostic',witnesses:[row],threats:[]};
test('route hypotheses retain classical conditions, climate and exact assistant contacts',()=>{
 const climate=projectMechanismClimate(climateFixture,true);
 const a=observeMechanismReview(review,efficacy,null,climate,true);
 assert.equal(a.routes[0].status,'supported');assert.equal(a.routes[0].effective,null);assert.equal(a.routes[0].climateParticipants[0].stem,'병');
 assert.deepEqual(a.routes[0].unresolvedClassicalConditions,['actual-supply']);
 const b=observeMechanismReview(review,efficacy,{routeInjury:{contacts:[{route:{ruleId:'s',witnessId:'w'},assistantId:'visible:year',obstacleId:'visible:hour',contact:{kind:'control'}}],groupContext:[]}},climate,true);
 assert.equal(b.routes[0].status,'unresolved');assert.equal(b.edges.length,1);assert.equal(b.effective,null);
});
test('an invalid alternative cannot be masked by another supported alternative',()=>{
 const e={...efficacy,witnesses:[{...row,anchorAlternatives:[{anchorId:'a',edge:edge('generate')},{anchorId:'b',edge:{...edge('generate'),to:'unknown',status:'invalid-evidence'}}]}]};
 assert.equal(observeMechanismReview(review,e,null,{requirements:[]},true).status,'invalid-evidence');
});
test('native V10 mechanism coverage preserves abstention and no authority',()=>{
 const ps=['무술','갑자','정미','경술'],saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 const m=r.efficacyReview.mechanismReview;
 assert.equal(m.effective,null);assert.equal(m.selectionAuthority,false);assert.equal(r.decisionReview.status,'abstained');
 assert.ok(m.candidates.every(c=>c.status!=='invalid-evidence'&&c.routes.every(w=>w.effective===null)));
 for(const c of r.efficacyReview.candidates){const v=m.candidates.find(x=>x.candidateId===c.candidateId);assert.equal(v.routes.length,c.witnesses.length);}
});
