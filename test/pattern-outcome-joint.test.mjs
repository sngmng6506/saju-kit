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

test('bound threat pressure is not a new rescue contact in simultaneous plan',()=>{
 const a=sample(),s=a.review.rules[0].witnesses[0],d=a.review.rules[1].witnesses[0],r=a.review.rules[2].witnesses[0];
 s.roles={helper:'x',target:'k'};d.edges=[{from:'obstacle',to:'k',kind:'control'}];
 r.edges.push(...d.edges);r.roles={helper:'h',obstacle:'obstacle',target:'k'};
 const f=run(a).search.observed.plan.flow;
 const q=f.routes.find(x=>x.ref.witnessId==='r1');
 assert.deepEqual(q.inheritedEdges,d.edges);assert.ok(!q.mandatoryEdges.some(e=>e.from==='obstacle'));
 assert.ok(!f.contacts.some(x=>x.fromRoute.witnessId==='r1'&&x.edge.from==='obstacle'));
 assert.equal(f.netEffectConfirmed,null);
});
test('rescue to rescue helper contact is retained and shared edges are not counted as separate supply',()=>{
 const a=sample(),r=a.review.rules[2].witnesses;
 r[0].roles={helper:'h'};r[2].roles={helper:'j'};
 const pressure={from:'h',to:'j',kind:'control'},supply={from:'x',to:'y',kind:'generate'};
 r[0].edges.push(pressure,supply);r[2].edges.push(supply);
 const f=run(a).search.observed.plan.flow;
 assert.ok(f.contacts.some(x=>x.kind==='rescue-to-rescue-contact'&&x.affectedHelper&&x.toRoute.witnessId==='r3'));
 assert.equal(f.sharedRelations.length,1);assert.equal(f.sharedRelations[0].routeRefs.length,2);
 assert.equal(f.sharedRelations[0].independentSupplyConfirmed,null);
});
test('unselected anchor alternatives cannot become mandatory simultaneous relations',()=>{
 const a=sample(),w=a.review.rules[0].witnesses[0];
 w.anchorBindings=[{anchorId:'a',edge:combine('a','z')},{anchorId:'b',edge:combine('b','z')}];
 const f=run(a).search.observed.plan.flow;
 assert.equal(f.pendingAlternatives.length,1);assert.equal(f.routes[0].anchorOptions.length,2);
 assert.equal(f.status,'anchor-alternative-review');
 assert.ok(!f.uniqueMandatoryRelations.some(x=>x.edge.to==='z'));
 assert.ok(f.routes[0].anchorOptions.every(x=>x.selected===null));
});

test('explicit anchor combination conflict is rejected without changing legacy structural plan',()=>{
 const a=sample(),s=a.review.rules[0].witnesses[0];
 s.anchorBindings=[{anchorId:'b',edge:combine('h','b')}];
 const r=run(a).search.observed;
 assert.equal(r.status,'conditional-plan-found');
 assert.equal(r.allocationReview.status,'no-compatible-allocation');
 assert.equal(r.allocationReview.exhaustive,true);assert.equal(r.allocationReview.selectedPlan,null);
});
test('enumerates feasible alternatives separately and never assigns both anchor options',()=>{
 const a=sample(),s=a.review.rules[0].witnesses[0];
 s.anchorBindings=[{anchorId:'a',edge:combine('h','a')},{anchorId:'z',edge:combine('x','z')}];
 const r=run(a).search.observed.allocationReview;
 assert.equal(r.feasibleCount,2);assert.equal(r.exhaustive,true);
 assert.ok(r.samples.every(p=>p.anchorAssignments.length===1&&p.netEffectConfirmed===null));
 assert.equal(r.reviewFrontierIds.length,2);assert.equal(r.selectedPlan,null);
});
test('strictly fewer obligations may be a review frontier but not a chosen outcome',()=>{
 const a=sample(),w=a.review.rules[2].witnesses;
 w[1].edges=[combine('q','b')];w[1].roles={helper:'q'};w[0].roles={helper:'h'};
 w[2].roles={helper:'h'}; // shared helper only in second plan
 const r=run(a).search.observed.allocationReview;
 assert.equal(r.feasibleCount,2);assert.equal(r.reviewFrontierIds.length,1);
 const p=r.samples.find(p=>p.id===r.reviewFrontierIds[0]);
 assert.equal(p.rescues[1].witnessId,'r2');assert.equal(r.selectedPlan,null);
});
test('sample truncation is not exhaustive and deterministic under reordered inputs',()=>{
 const a=sample();a.review.rules[0].witnesses=Array.from({length:40},(_,i)=>w('s'+String(i).padStart(2,'0')));
 a.mechanism.routes=a.review.rules.flatMap(r=>r.witnesses.map(w=>({...ref(r.id,w.id),kind:r.kind,status:'supported',effective:null})));
 const r=run(a).search.observed.allocationReview;
 assert.equal(r.status,'search-incomplete');assert.equal(r.stopReason,'sample-budget');assert.equal(r.exhaustive,false);
 assert.equal(r.samples.length,32);assert.equal(r.frontierScope,'observed-sample-only');
 a.review.rules.reverse();a.mechanism.routes.reverse();a.compound.threatCoverage.reverse();
 const s=run(a).search.observed.allocationReview;
 assert.deepEqual(s.samples.map(p=>p.id),r.samples.map(p=>p.id));
});
test('same bound threat option is required and partial evidence never yields authority',()=>{
 const a=sample(),d=a.review.rules[1].witnesses[0],r=a.review.rules[2].witnesses[0];
 d.anchorBindings=[{anchorId:'a',edge:combine('h','a')}];
 r.anchorBindings=[{anchorId:'z',edge:combine('x','z')}];
 assert.equal(run(a).search.observed.allocationReview.status,'no-compatible-allocation');
 r.anchorBindings=[...d.anchorBindings];
 const result=run(a,false).search.observed.allocationReview;
 assert.equal(result.status,'partial-allocation-review');assert.equal(result.selectionAuthority,false);
 assert.equal(result.samples[0].anchorAssignments[0].accessConfirmed,null);
});

test('supported allocation cannot borrow support from a different anchor option',()=>{
 const a=sample(),s=a.review.rules[0].witnesses[0];
 const b1={anchorId:'a',targetId:'z',basis:'directed-generation',independentSlots:true,edge:{from:'a',to:'z',kind:'generate'}};
 const b2={anchorId:'b',targetId:'z',basis:'directed-generation',independentSlots:true,edge:{from:'b',to:'z',kind:'generate'}};
 s.anchorBindings=[b1,b2];
 a.mechanism.edges=[b1,b2].map((b,i)=>({...b.edge,id:JSON.stringify([b.edge.from,b.edge.to,b.edge.kind]),status:i?'unresolved':'supported',effective:null}));
 a.mechanism.routes[0].conditions=[{id:'anchor-alternative-path',state:'supported',evidence:[b1,b2].map((b,i)=>({anchorId:b.anchorId,targetId:b.targetId,basis:b.basis,identityOnly:false,edgeId:a.mechanism.edges[i].id}))}];
 const x=run(a).search;
 assert.equal(x.observed.allocationReview.samples.length,2);
 assert.equal(x.supportedOnly.allocationReview.samples.length,1);
 assert.equal(x.supportedOnly.allocationReview.samples[0].anchorAssignments[0].anchorId,'a');
 assert.equal(x.observed.allocationReview.samples.find(p=>p.anchorAssignments[0].anchorId==='b').anchorAssignments[0].hypothesis,'unresolved');
 assert.equal(x.supportedOnly.allocationReview.unsupportedOptionRejections,1);
 a.mechanism.routes[0].conditions[0].evidence.pop();
 assert.equal(run(a).status,'invalid-evidence');
});
test('missing projected option evidence cannot qualify for supported allocation',()=>{
 const a=sample();a.review.rules[0].witnesses[0].anchorBindings=[{anchorId:'a',edge:combine('h','a')}];
 const r=run(a).search;
 assert.equal(r.observed.allocationReview.samples.length,1);
 assert.equal(r.supportedOnly.allocationReview.samples.length,0);
 assert.equal(r.supportedOnly.allocationReview.unsupportedOptionRejections,1);
});
test('empty rescue binding cannot bypass its bound threat anchor and duplicates fail closed',()=>{
 const a=sample(),d=a.review.rules[1].witnesses[0],s=a.review.rules[0].witnesses[0];
 d.anchorBindings=[{anchorId:'a',edge:combine('h','a')}];
 const r=run(a).search.observed.allocationReview;
 assert.equal(r.status,'no-compatible-allocation');assert.ok(r.bindingRejections>0);
 s.anchorBindings=[d.anchorBindings[0],d.anchorBindings[0]];
 assert.equal(run(a).status,'invalid-evidence');
});
