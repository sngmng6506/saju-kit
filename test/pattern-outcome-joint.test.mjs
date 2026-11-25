import test from 'node:test';
import assert from 'node:assert/strict';
import {observeJointOutcome} from '../src/features/pattern/outcome-joint.js';
import {observeMechanismReview} from '../src/features/pattern/outcome-mechanism.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const r=(id,kind,ws,extra={})=>({id,kind,witnesses:ws,...extra});
const w=(id,edges=[],extra={})=>({id,edges,...extra});
const ref=(ruleId,witnessId)=>({ruleId,witnessId});
const combine=(from,to)=>({from,to,kind:'combine'});
const sample=()=>{
 const review={candidateId:'c',status:'diagnostic',rules:[r('s','support',[w('s1')]),r('d','damage',[w('d1'),w('d2')]),r('r','rescue',[w('r1',[combine('h','a')],{threatWitnessId:'d1'}),w('r2',[combine('h','b')],{threatWitnessId:'d2'}),w('r3',[combine('j','b')],{threatWitnessId:'d2'})],{threatRuleId:'d'})]};
 const mechanism={candidateId:'c',status:'diagnostic',routes:review.rules.flatMap(r=>r.witnesses.map(w=>({...ref(r.id,w.id),kind:r.kind,status:'supported',effective:null})))};
 const compound={candidateId:'c',status:'diagnostic',violations:[],threatCoverage:[{threat:ref('d','d1'),alternatives:[ref('r','r1')],coverage:'structural-route-observed'},{threat:ref('d','d2'),alternatives:[ref('r','r2'),ref('r','r3')],coverage:'structural-route-observed'}],rescueInteractions:[],rescueCollateral:[],rescueAlternatives:[]};
 return {review,mechanism,compound};
};
const run=(x,complete=true)=>observeJointOutcome(x.review,x.mechanism,x.compound,complete);
test('joint search backtracks over incompatible combination allocations',()=>{
 const a=sample(),x=run(a);
 assert.equal(x.search.observed.status,'conditional-plan-found');
 assert.deepEqual(x.search.observed.plan.rescues.map(x=>x.witnessId),['r1','r3']);
 assert.equal(x.search.supportedOnly.status,'conditional-plan-found');assert.equal(x.rescued,null);
});
test('individually covered threats can have no simultaneous single-partner plan',()=>{
 const a=sample();a.review.rules[2].witnesses.pop();a.mechanism.routes.pop();a.compound.threatCoverage[1].alternatives.pop();
 const x=run(a);assert.ok(x.threats.every(t=>t.alternatives.length));assert.equal(x.search.observed.status,'no-single-partner-plan');assert.equal(x.broken,null);
});
test('opposed threat is not discarded and unresolved rescues are not supported',()=>{
 const a=sample();a.mechanism.routes.find(x=>x.witnessId==='d2').status='opposed';
 for(const x of a.mechanism.routes.filter(x=>x.witnessId==='r2'||x.witnessId==='r3'))x.status='unresolved';
 const x=run(a);assert.equal(x.threats.length,2);assert.equal(x.threats[1].threat.hypothesis,'opposed');
 assert.equal(x.search.observed.status,'conditional-plan-found');assert.equal(x.search.supportedOnly.status,'missing-route-choice');
});
test('interference and shared helpers are retained, not assumed independent',()=>{
 const a=sample();a.compound.rescueInteractions=[{rescue:ref('r','r1'),support:ref('s','s1')}];
 a.compound.rescueAlternatives=[{rescue:ref('r','r1'),sharedParticipantAlternatives:[ref('r','r3')]}];
 const p=run(a).search.observed.plan;assert.equal(p.interference.length,1);assert.equal(p.sharedParticipantRoutes.length,1);assert.equal(p.allThreatsResolved,null);
});
test('misbound and missing route coverage fail closed',()=>{
 const a=sample();a.compound.threatCoverage[0].alternatives=[ref('r','r2')];assert.equal(run(a).status,'invalid-evidence');
 const b=sample();b.mechanism.routes.pop();assert.equal(run(b).status,'invalid-evidence');
 const c=sample();c.compound.threatCoverage.pop();assert.equal(run(c).status,'invalid-evidence');
});
test('missing rescue differs for complete and partial chart; regulation is not ordinary support',()=>{
 const a=sample();a.review.rules[2].witnesses=[];a.mechanism.routes=a.mechanism.routes.filter(x=>x.kind!=='rescue');
 for(const t of a.compound.threatCoverage)t.alternatives=[];
 assert.equal(run(a).threats[0].reviewState,'no-observed-rescue');assert.equal(run(a,false).threats[0].reviewState,'unknown-rescue-coverage');
 a.review.rules[0].impact='conditional-regulation-not-confirmed-support';assert.equal(run(a).supports.length,0);assert.equal(run(a).regulation.length,1);
});
test('invalid repeated edge cannot inherit valid cached assessment',()=>{
 const actor={kind:'visible',axes:{anySubstantial:true}},edge={from:'a',to:'b',kind:'generate',source:actor,target:actor,status:'root-locality-screen-met',blockers:[],relative:{relation:'left-evidence-dominates'}};
 const q={candidateId:'c',status:'diagnostic',rules:[r('s','support',[w('w1'),w('w2')])]};
 const row=(id,e)=>({...ref('s',id),kind:'support',roles:{},edges:[e],anchorAlternatives:[],flags:[],unresolvedConditions:[]});
 const m=observeMechanismReview(q,{status:'diagnostic',witnesses:[row('w1',edge),row('w2',{...edge,status:'invalid-evidence'})],threats:[]},null,{requirements:[]},true);
 assert.equal(m.status,'invalid-evidence');assert.equal(m.routes[1].status,'invalid-evidence');
});
test('native joint hypothesis keeps every threat and final verdict closed',()=>{
 const ps=['무술','갑자','정미','경술'],saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const a=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 assert.equal(a.decisionReview.status,'abstained');assert.equal(a.rescued,null);
 for(const m of a.efficacyReview.mechanismReview.candidates){
  assert.notEqual(m.joint.status,'invalid-evidence');assert.equal(m.joint.rescued,null);assert.equal(m.joint.threats.length,m.threats.length);
 }
});
