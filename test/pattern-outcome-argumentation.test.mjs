import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateInterpositionScenario,reviewInterpositionPolicy,interpositionSourcePolicies} from '../src/features/pattern/outcome-interposition-policy.js';
import {evaluateCombinationScenario,reviewCombinationPolicy,combinationSourcePolicies} from '../src/features/pattern/outcome-combination-policy.js';
import {observeCombinationContext} from '../src/features/pattern/outcome-combination-context.js';
import {observeCombinationResidualContext} from '../src/features/pattern/outcome-combination-residual.js';
import {evaluateClashScenario,reviewClashPolicy,clashSourcePolicies} from '../src/features/pattern/outcome-clash-policy.js';
import {observeClashResidualContext} from '../src/features/pattern/outcome-clash-residual.js';
import {evaluateJointScenario,reviewJointConstraints} from '../src/features/pattern/outcome-joint-constraints.js';
import {resolveDayDirection,reviewDayBalanceDirection} from '../src/features/pattern/outcome-day-balance-direction.js';
import {elementRelation} from '../src/core/elements.js';
import {sourceEffectClauses} from '../src/features/pattern/outcome-source-effect-policy.js';
import {evaluateElementContextModel,reviewElementContexts} from '../src/features/pattern/outcome-element-context.js';
import {reviewModeledConsequences} from '../src/features/pattern/outcome-modeled-consequences.js';
import {controls as coverageControls,replayModeledCoverage,summarizeModeledCoverage} from '../scripts/lib/pattern-modeled-consequence-coverage.mjs';
import {evaluateArguments} from '../src/features/pattern/outcome-argumentation.js';
import {observeArgumentReview} from '../src/features/pattern/outcome-argument-review.js';
import {summarizeArgumentReview} from '../scripts/lib/pattern-outcome-argument-audit.mjs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {observeInterpositionReview} from '../src/features/pattern/outcome-interposition-review.js';
import {observePressureDependencyReview} from '../src/features/pattern/outcome-pressure-dependency.js';
import {observeLocalityContext} from '../src/features/pattern/outcome-locality-context.js';
import {observeRoleCapacity} from '../src/features/pattern/outcome-role-capacity.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const p=(id,level='structural-hypothesis')=>({id,kind:'test',subject:id,level});
const lit=(propositionId,sign='for')=>({propositionId,sign});
const refs=[{owner:'fixture',id:'control',field:'state'}];
const f=(id,propositionId,sign='for',applicability='observed')=>({id,...lit(propositionId,sign),refs,applicability});
const rule=(id,conclusion,premises,applicability='observed')=>({id,policyId:'test-policy',conclusion,premises,refs,applicability});
const run=(propositions,evidence,rules,scope='complete')=>evaluateArguments({propositions,evidence,rules,scope});
const read=(r,id)=>r.judgments.find(x=>x.id===id);
test('four states retain independent proof signs without explosion or negation by failure',()=>{
 const r=run([p('a'),p('b'),p('c'),p('d'),p('e','effect-hypothesis')],[f('a+','a'),f('b-','b','against'),f('c+','c'),f('c-','c','against')],[]);
 assert.deepEqual(r.judgments.map(j=>j.state),['supported','opposed','conflicting','unresolved','unresolved']);
 assert.ok(r.judgments.every(j=>j.effective===null));assert.equal(r.selectionAuthority,false);
});
test('explicit conjunction, alternative rules and conflict are not votes',()=>{
 const r=run([p('a'),p('b'),p('c')],[f('1','a'),f('2','a'),f('3','b','against')],
  [rule('and',lit('c'),[lit('a'),lit('b')]),rule('alt',lit('c'),[lit('a')]),rule('counter',lit('c','against'),[lit('b','against')])]);
 assert.equal(read(r,'c').state,'conflicting');assert.equal(read(r,'c').support.rank,1);
 assert.deepEqual(read(r,'c').support.witnesses,[{kind:'rule',id:'alt'}]);
 assert.equal(r.ruleResults.find(q=>q.id==='and').status,'premises-unresolved');
});
test('unseeded cycles stay unresolved; seeded chains have strictly earlier proof ranks',()=>{
 const ps=[p('a'),p('b'),p('c')],rs=[rule('ab',lit('b'),[lit('a')]),rule('ba',lit('a'),[lit('b')]),rule('bc',lit('c'),[lit('b')])];
 assert.ok(run(ps,[],rs).judgments.every(j=>j.state==='unresolved'));
 const r=run(ps,[f('seed','a')],rs);assert.deepEqual(r.judgments.map(j=>j.support.rank),[0,1,2]);
 assert.equal(r.ruleResults.find(q=>q.id==='ba').firstRankWitness,false);
});
test('partial scope, malformed references and effect promotion fail safely',()=>{
 const ps=[p('a'),p('b'),p('effect','effect-hypothesis')],fs=[f('seed','a','for','complete-only')];
 assert.equal(read(run(ps,fs,[rule('ab',lit('b'),[lit('a')])],'partial'),'b').state,'unresolved');
 assert.equal(run(ps,[f('x','effect')],[]).status,'invalid-evidence');
 assert.equal(run(ps,[f('a','a')],[rule('x',lit('effect'),[lit('a')])]).status,'invalid-evidence');
 assert.equal(run(ps,[f('a','a')],[rule('x',lit('b'),[lit('foreign')])]).status,'invalid-evidence');
 assert.equal(run([null],[],[]).status,'invalid-evidence');
 assert.equal(run(ps,[],[rule('x',lit('b'),[])]).status,'invalid-evidence');
});
test('large input fails explicitly rather than returning a partial verdict',()=>{
 assert.equal(run(Array.from({length:12001},(_,i)=>p('p'+i)),[],[]).status,'unavailable');
});
const build=(ps,complete=true)=>{
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour:complete,stemForce,relativeForce:observeRelativeForce(stemForce)};
 const root=observeRootContext(prior,analyzeFormationEvidence({saju})),supply=observeGroundedSupply(prior,root),interposition=observeInterpositionReview(prior,root,supply);
 const pressure=observePressureDependencyReview(prior,root,supply,interposition),locality=observeLocalityContext(prior,supply,interposition,pressure);
 const review=observeArgumentReview(prior,supply,pressure,locality);
 return {saju,prior,supply,pressure,locality,review,interposition};
};
const audit=(x,partial=false)=>summarizeArgumentReview({id:'test'},{argumentReview:x.review,groundedSupply:x.supply,pressureDependencyReview:x.pressure,localityContext:x.locality,roleCapacity:observeRoleCapacity(x.prior)},partial);
test('positive structural generation does not become an effective action',()=>{
 const x=build(['을묘','을묘','정묘','을묘']);assert.deepEqual(audit(x).errors,[]);
 assert.equal(x.review.actions.filter(a=>read(x.review,a.structuralPropositionId).state==='supported').length,2);
 assert.ok(x.review.actions.every(a=>read(x.review,a.effectPropositionId).state==='unresolved'));
});
test('source variants preserve structural scope and all actual effects remain unresolved',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
 let n=0,actions=0,support=0,oppose=0,unknown=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete),a=audit(x,!complete);assert.deepEqual(a.errors,[],c.id);n++;
  assert.equal(a.counts.actions,a.counts.effectsUnresolved);
  assert.equal(a.counts.actions,a.counts.generation+a.counts.control);
  if(complete){actions+=a.counts.actions;support+=a.counts.structural.supported;oppose+=a.counts.structural.opposed;unknown+=a.counts.structural.unresolved;}
  else assert.equal(a.counts.structural.unresolved,a.counts.actions);
 }
 assert.equal(n,24);assert.equal(actions,60);assert.equal(support,2);assert.equal(oppose,37);assert.equal(unknown,21);
});
test('audit rejects altered proof and contrast parity rejects forged dominance',()=>{
 const x=build(['무술','갑자','정미','경술']);assert.deepEqual(audit(x).errors,[]);
 x.review.judgments[0].state='supported';assert.ok(audit(x).errors.includes('argument-review-replay'));
 const y=build(['무술','갑자','정미','경술']),q=y.pressure.pressures.find(p=>p.comparison);
 q.contrast=q.contrast==='controller-evidence-dominance-stable'?'target-evidence-dominance-stable':'controller-evidence-dominance-stable';
 assert.equal(observeArgumentReview(y.prior,y.supply,y.pressure,y.locality).status,'invalid-evidence');
});
test('native V10 exposes argument review without decision authority',()=>{
 const {saju}=build(['무술','갑자','정미','경술']);
 const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 assert.notEqual(r.efficacyReview.status,'invalid-evidence');assert.equal(r.decisionReview.status,'abstained');
 assert.equal(r.efficacyReview.mechanismReview.argumentReview.status,'diagnostic');
});

const gated=(id,conclusion,premises,undercutWhen,applicability='observed')=>({...rule(id,conclusion,premises,applicability),undercutWhen});
const gateProps=()=>[p('a','observation'),p('u','observation'),p('v','observation'),p('b'),p('c'),p('effect','effect-hypothesis')];
const gateRules=()=>[gated('ab',lit('b'),[lit('a')],[lit('u')]),rule('bc',lit('c'),[lit('b')]),rule('cb',lit('b'),[lit('c')])];
test('explicit observation undercut withdraws dependent closure without negating conclusion',()=>{
 const ps=gateProps(),rs=gateRules(),seed=f('a','a'),attack=f('u','u');
 assert.equal(read(run(ps,[seed],rs),'c').state,'supported');
 const r=run(ps,[seed,attack],rs);
 assert.equal(read(r,'b').state,'unresolved');assert.equal(read(r,'c').state,'unresolved');
 assert.equal(read(r,'b').opposition.rank,null);
 assert.deepEqual(r.ruleResults[0].undercuts,[{...lit('u'),witnesses:[{kind:'evidence',id:'u'}]}]);
 assert.equal(r.ruleResults[0].status,'undercut');assert.equal(r.ruleResults[0].firstRankWitness,false);
 assert.deepEqual(run(ps,[attack,seed],rs).judgments,r.judgments);
});
test('independent proof survives undercut and rebuttal is an independent sign',()=>{
 const ps=gateProps(),rs=gateRules(),fs=[f('a','a'),f('u','u')];
 const r=run(ps,fs,[...rs,rule('alternative',lit('b'),[lit('a')])]);
 assert.equal(read(r,'c').state,'supported');
 assert.deepEqual(read(r,'b').support.witnesses,[{kind:'rule',id:'alternative'}]);
 const opposed=run(ps,fs,[...rs,rule('rebuttal',lit('b','against'),[lit('a')])]);
 assert.equal(read(opposed,'b').state,'opposed');
 assert.equal(read(opposed,'c').state,'unresolved');
});
test('conflicting attack evidence remains visible and cannot establish clearance',()=>{
 const r=run(gateProps(),[f('a','a'),f('u+','u'),f('u-','u','against')],gateRules());
 assert.equal(read(r,'u').state,'conflicting');assert.equal(read(r,'b').state,'unresolved');
 assert.equal(r.ruleResults[0].status,'undercut');
});
test('undercuts are explicit signed alternatives, scoped like all evidence',()=>{
 const ps=gateProps(),rs=[gated('ab',lit('b'),[lit('a')],[lit('u','against'),lit('v')])];
 const seed=f('a','a');
 for(const facts of [[seed],[seed,f('u+','u')],[seed,f('v','v','for','complete-only')]]){
  assert.equal(read(run(ps,facts,rs,'partial'),'b').state,'supported');
 }
 for(const fact of [f('u-','u','against'),f('v','v')]){
  assert.equal(read(run(ps,[seed,fact],rs),'b').state,'unresolved');
 }
 const r=run(ps,[seed,f('v','v')],[{...rs[0],applicability:'complete-only'}],'partial');
 assert.equal(r.ruleResults[0].status,'scope-unresolved');
 // Absence of an attack is not positive evidence for its opposite.
 assert.equal(read(run(ps,[seed],rs),'v').state,'unresolved');
});
test('undercut contract rejects recursive, duplicate and unknown predicates and preserves effect gate',()=>{
 const ps=gateProps(),fs=[f('a','a')];
 for(const bad of [[lit('b')],[lit('effect')],[lit('absent')],[lit('u'),lit('u')],null,{},[lit('u','bad')]]){
  assert.equal(run(ps,fs,[gated('ab',lit('b'),[lit('a')],bad)]).status,'invalid-evidence');
 }
 assert.equal(run(ps,fs,[gated('bad',lit('effect'),[lit('a')],[lit('u')])]).status,'invalid-evidence');
 const plain=run(ps,fs,[rule('ab',lit('b'),[lit('a')])]);
 assert.equal(Object.hasOwn(plain.ruleResults[0],'undercuts'),false);
});

const interpositionAssumptions={routeState:'supported',contextState:'supported',operationState:'supported',obstructionState:'opposed'};
test('source conditional requires operation, context and explicit clearance, not path existence',()=>{
 for(const p of interpositionSourcePolicies()){
  const go=overrides=>evaluateInterpositionScenario(p.id,{...interpositionAssumptions,...overrides});
  const yes=go({});assert.equal(yes.applicability,'supported');assert.equal(yes.consequenceState,'follows-under-explicit-assumptions');
  assert.equal(yes.actualEffectState,'unresolved');assert.equal(yes.selectionAuthority,false);
  for(const key of Object.keys(interpositionAssumptions)){
   assert.equal(go({[key]:'unresolved'}).applicability,'unresolved');
  }
  assert.equal(go({operationState:'opposed'}).applicability,'opposed');
  assert.equal(go({operationState:'conflicting'}).applicability,'conflicting');
  for(const obstructionState of ['supported','conflicting']){
   const x=go({obstructionState});assert.equal(x.ruleStatus,'undercut');assert.equal(x.applicability,'unresolved');
   assert.equal(x.actualEffectState,'unresolved');assert.equal(x.undercuts[0].propositionId,'obstruction');
  }
  assert.equal(go({scope:'partial'}).applicability,'unresolved');
 }
 assert.equal(evaluateInterpositionScenario('unknown',interpositionAssumptions).status,'invalid-evidence');
});
function interpositionFixture(kind='mediation',complete=true,matched=true){
 const makeActor=(position,element,tenGod,dayReference=false)=>({id:'visible:'+position,graphNodeId:position+':stem',position,layer:'visible',element,tenGod,dayReference});
 const h=makeActor('year',kind==='mediation'?'fire':'metal',kind==='mediation'?'정재':matched?'정인':'편재');
 const s=makeActor('month','wood','상관'),t=makeActor(kind==='mediation'?'day':'hour','earth','정관',kind==='mediation');
 // In a protection fixture the day reference is a separate fourth actor.
 const extra=makeActor(kind==='mediation'?'hour':'day','water',null,kind==='protection');
 const actors=complete?[h,s,t,extra]:[h,s,t];
 const edges=(kind==='mediation'?[[s,h,'generate'],[h,t,'generate'],[s,t,'control']]:[[h,s,'control'],[s,t,'control']]).map(([a,b,kind])=>({edgeId:a.id+'>'+b.id,from:a.id,to:b.id,kind,effective:null,selectionAuthority:false}));
 const control=edges.at(-1),pressureId=JSON.stringify([s.graphNodeId,t.graphNodeId]),pathId=JSON.stringify([kind,h.graphNodeId,s.graphNodeId,t.graphNodeId]);
 const base={status:complete?'diagnostic':'partial',completeHour:complete,selectionAuthority:false};
 const path={id:pathId,kind,helper:h.graphNodeId,threat:s.graphNodeId,target:t.graphNodeId,edges:edges.map(e=>({from:actors.find(a=>a.id===e.from).graphNodeId,to:actors.find(a=>a.id===e.to).graphNodeId,type:e.kind})),blockers:complete?[]:['missing-hour'],structuralScreen:complete?'grounded-structure-screen-met':'context-review',effectConfirmed:null,neutralizationConfirmed:null};
 const pressures=edges.filter(e=>e.kind==='control').map(e=>{const a=actors.find(a=>a.id===e.from),b=actors.find(a=>a.id===e.to);return {id:JSON.stringify([a.graphNodeId,b.graphNodeId]),controllerNodeId:a.graphNodeId,targetNodeId:b.graphNodeId,candidatePathIds:e===control?[pathId]:[],effective:null,neutralizationConfirmed:null};});
 const actions=edges.map(e=>({...e,effectPropositionId:'effect:'+e.edgeId}));
 const judgments=actions.map(e=>({id:e.effectPropositionId,subject:e.edgeId,kind:'actual-action-effective',level:'effect-hypothesis',state:'unresolved',support:{rank:null},opposition:{rank:null}}));
 return {prior:{completeHour:complete,stemForce:{occurrences:actors}},supply:{...base,actions:edges,effectiveSupply:null},
  interposition:{roleNeutral:{...base,paths:[path],targetScope:'all-visible-stems',effectConfirmed:null,neutralizationConfirmed:null}},
  pressure:{...base,paths:[{id:pathId,targetPressureId:pressureId,dependencies:[],otherBlockers:path.blockers,structuralDependencyRank:complete?0:null,effectConfirmed:null,neutralizationConfirmed:null}],pressures,effective:null,neutralizationConfirmed:null},
  review:{...base,actions,judgments,effective:null}};
}
const policyReview=x=>reviewInterpositionPolicy(x.prior,x.supply,x.interposition,x.pressure,x.review);
test('production bindings distinguish mediation and role-scoped protection without promotion',()=>{
 for(const [kind,matched,policy] of [['mediation',true,'tongguan'],['protection',true,'officer-rescue'],['protection',false,null]]){
  const x=interpositionFixture(kind,true,matched),r=policyReview(x);
  assert.equal(r.status,'diagnostic');assert.equal(r.paths.length,1);const p=r.paths[0];
  assert.equal(p.sourcePolicyId,policy);assert.equal(p.routeState,'supported');
  assert.equal(p.structuralDependencyRank,0);assert.equal(p.sourceApplicability,'unresolved');
  assert.equal(p.actualEffectState,'unresolved');assert.deepEqual(p.actualUndercuts,[]);
  assert.ok(r.actions.every(a=>a.actualEffectState==='unresolved'&&a.neutralizationConfirmed===null));
 }
 const partial=policyReview(interpositionFixture('mediation',false));assert.equal(partial.status,'partial');assert.equal(partial.paths[0].routeState,'unresolved');
});
test('interposition rejects fabricated path legs, missing path and promoted effect',()=>{
 const x=interpositionFixture();x.interposition.roleNeutral.paths[0].edges[0].to='day:stem';assert.equal(policyReview(x).status,'invalid-evidence');
 const y=interpositionFixture();y.interposition.roleNeutral.paths=[];y.pressure.paths=[];assert.equal(policyReview(y).status,'invalid-evidence');
 const z=interpositionFixture();z.review.judgments.at(-1).support.rank=0;assert.equal(policyReview(z).status,'invalid-evidence');
});
test('native interposition review binds packet variants and preserves all prior abstentions',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
 let n=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete),r=policyReview(x);
  assert.equal(r.status,complete?'diagnostic':'partial',c.id);
  assert.equal(r.paths.length+r.excludedHiddenPathCount,x.interposition.roleNeutral.paths.length,c.id);
  assert.equal(r.actions.length,x.review.actions.filter(a=>a.kind==='control').length,c.id);
  assert.ok(r.paths.every(p=>p.actualEffectState==='unresolved'&&p.sourceApplicability==='unresolved'&&!p.actualUndercuts.length));
  const native=analyzePatternOutcomeV10({saju:x.saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  assert.deepEqual(native.efficacyReview.mechanismReview.interpositionPolicyReview,r,c.id);
  assert.equal(native.decisionReview.status,'abstained');n++;
 }
 assert.equal(n,24);
});

const comboAssumptions={pairState:'supported',contextState:'supported',operationState:'supported',obstructionState:'opposed',selfState:'opposed'};
test('combination conditionals remain independent and require explicit clearance',()=>{
 for(const p of combinationSourcePolicies()){
  const go=overrides=>evaluateCombinationScenario(p.id,{...comboAssumptions,...overrides});
  assert.equal(go({}).applicability,'supported');assert.equal(go({}).actualEffectState,'unresolved');
  for(const key of ['pairState','contextState','operationState','obstructionState']){
   assert.equal(go({[key]:'unresolved'}).applicability,'unresolved');
  }
  assert.equal(go({operationState:'opposed'}).applicability,'opposed');
  assert.equal(go({operationState:'conflicting'}).applicability,'conflicting');
  assert.equal(go({obstructionState:'conflicting'}).ruleStatus,'undercut');
  assert.equal(go({scope:'partial'}).applicability,'unresolved');
  const self=go({selfState:'supported'});
  assert.equal(self.applicability,p.id==='external-role-restriction'?'opposed':'supported');
  assert.equal(self.actualEffectState,'unresolved');
 }
 assert.equal(evaluateCombinationScenario('unknown',comboAssumptions).status,'invalid-evidence');
});
function comboFixture(self=false,complete=true){
 const base={status:complete?'diagnostic':'partial',completeHour:complete,selectionAuthority:false},absent={restrictionConfirmed:null,retentionConfirmed:null,transformationConfirmed:null,effective:null};
 const a={id:'visible:year',layer:'visible',dayReference:false},b={id:self?'visible:day':'visible:month',layer:'visible',dayReference:self},
 c={id:self?'visible:month':'visible:day',layer:'visible',dayReference:!self},h={id:'hidden:month:갑',layer:'hidden',dayReference:false};
 const id=JSON.stringify([a.id,b.id].sort()),pair={id,participants:[a.id,b.id],dayReferenceInvolved:self,scope:self?'self-combination-not-external-removal':'external-role-restriction-review',span:1,competitors:[],intervening:[],formationId:'formation',associatedElement:'earth',contactHypothesis:'local-contact-hypothesis',transformationContext:'target-supply-hypothesis',...absent};
 const edges=[c,h].map(x=>({edgeId:a.id+'>'+x.id,from:a.id,to:x.id,kind:'generate',effective:null,selectionAuthority:false}));
 const actions=edges.map((e,i)=>({...e,fromPairIds:[id],toPairIds:[],samePairIds:[],access:i?'hidden-endpoint-review':'visible',...absent}));
 const r={...edges[0],effectPropositionId:'effect'};
 return {prior:{completeHour:complete,stemForce:{occurrences:[a,b,c,h]}},residual:{...base,...absent,pairs:[pair],participants:[a,b].map(x=>({id:x.id,pairIds:[id],...absent})),actions},supply:{...base,effectiveSupply:null,actions:edges},argument:{...base,effective:null,actions:[r],judgments:[{id:'effect',subject:r.edgeId,level:'effect-hypothesis',kind:'actual-action-effective',state:'unresolved',support:{rank:null},opposition:{rank:null}}]}};
}
const comboReview=x=>reviewCombinationPolicy(x.prior,x.residual,x.supply,x.argument);
test('self-combination blocks only external-removal scope and retains exact action bindings',()=>{
 for(const self of [false,true]){
  const r=comboReview(comboFixture(self));
  assert.equal(r.status,'diagnostic');assert.equal(r.actions.length,1);assert.equal(r.excludedHiddenActionCount,1);
  const p=r.pairs[0];assert.equal(p.conditionals[0].applicability,self?'opposed':'unresolved');
  assert.equal(p.conditionals[1].applicability,'unresolved');assert.equal(p.conditionals[2].applicability,'unresolved');
  assert.equal(p.actualRetentionState,'unresolved');assert.equal(p.actualTransformationState,'unresolved');
  assert.deepEqual(r.actions[0].actualUndercuts,[]);assert.equal(r.actions[0].actualEffectState,'unresolved');
 }
 assert.ok(comboReview(comboFixture(true,false)).pairs[0].conditionals.every(p=>p.applicability==='unresolved'));
});
test('combination binding rejects missing affected edge, wrong pair identity and manufactured effect',()=>{
 const a=comboFixture();a.residual.actions.pop();assert.equal(comboReview(a).status,'invalid-evidence');
 const b=comboFixture();b.residual.actions[0].fromPairIds=[];assert.equal(comboReview(b).status,'invalid-evidence');
 const c=comboFixture();c.residual.pairs[0].transformationConfirmed=true;assert.equal(comboReview(c).status,'invalid-evidence');
 const d=comboFixture();d.argument.judgments[0].state='supported';assert.equal(comboReview(d).status,'invalid-evidence');
});
test('native combination policy preserves source packet and exact residual scope',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
 let n=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete),formation=analyzeFormationEvidence({saju:x.saju}),root=observeRootContext(x.prior,formation);
  const combination=observeCombinationContext(x.prior,formation),residual=observeCombinationResidualContext(x.prior,formation,combination,root,x.supply);
  const r=reviewCombinationPolicy(x.prior,residual,x.supply,x.review);
  assert.equal(r.status,complete?'diagnostic':'partial',c.id);
  assert.equal(r.pairs.length,residual.pairs.length,c.id);
  assert.equal(r.actions.length+r.excludedHiddenActionCount,residual.actions.length,c.id);
  assert.ok(r.pairs.every(p=>p.actualRetentionState==='unresolved'&&p.actualRestrictionState==='unresolved'&&p.actualTransformationState==='unresolved'));
  const native=analyzePatternOutcomeV10({saju:x.saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  assert.deepEqual(native.efficacyReview.mechanismReview.combinationPolicyReview,r,c.id);assert.equal(native.decisionReview.status,'abstained');n++;
 }
 assert.equal(n,24);
});

test('classical separated competitor and remote-contact controls do not authorize removal',()=>{
 const cases=[
  {pillars:['경오','을유','갑자','을해'],cases:['competing-partner-review','remote-endpoints-review','farther-competitor-review']},
  {pillars:['정묘','병오','병자','임진'],cases:['remote-endpoints-review']},
  {pillars:['을유','갑신','정사','경술'],cases:['remote-endpoints-review']}
 ];
 for(const c of cases){
  const x=build(c.pillars),formation=analyzeFormationEvidence({saju:x.saju}),root=observeRootContext(x.prior,formation);
  const residual=observeCombinationResidualContext(x.prior,formation,observeCombinationContext(x.prior,formation),root,x.supply);
  const r=reviewCombinationPolicy(x.prior,residual,x.supply,x.review);
  assert.equal(r.status,'diagnostic');
  const contexts=new Set(r.pairs.flatMap(p=>p.sourceCases));
  for(const expected of c.cases)assert.ok(contexts.has(expected),expected);
  assert.ok(r.pairs.every(p=>p.actualRetentionState==='unresolved'&&p.actualRestrictionState==='unresolved'&&p.actualTransformationState==='unresolved'));
  assert.ok(r.actions.every(a=>a.actualUndercuts.length===0));
 }
});

const clashAssumptions={contactState:'supported',contextState:'supported',operationState:'supported',obstructionState:'opposed'};
test('clash damage preservation and relief are separate source conditionals',()=>{
 for(const p of clashSourcePolicies()){
  const go=overrides=>evaluateClashScenario(p.id,{...clashAssumptions,...overrides});
  assert.equal(go({}).applicability,'supported');assert.equal(go({}).actualEffectState,'unresolved');
  for(const key of Object.keys(clashAssumptions))assert.equal(go({[key]:'unresolved'}).applicability,'unresolved');
  assert.equal(go({contextState:'opposed'}).applicability,'opposed');assert.equal(go({operationState:'conflicting'}).applicability,'conflicting');
  for(const obstructionState of ['supported','conflicting']){
   const r=go({obstructionState});assert.equal(r.ruleStatus,'undercut');assert.equal(r.applicability,'unresolved');assert.equal(r.actualEffectState,'unresolved');
  }
  assert.equal(go({scope:'partial'}).applicability,'unresolved');
 }
 assert.equal(evaluateClashScenario('unknown',clashAssumptions).status,'invalid-evidence');
});
function clashFixture(complete=true){
 const base={status:complete?'diagnostic':'partial',completeHour:complete,selectionAuthority:false},absent={damageConfirmed:null,preservationConfirmed:null,reliefConfirmed:null,effective:null};
 const a={id:'visible:year',layer:'visible',position:'year',element:'water',roots:[{position:'year',stem:'계'}]},b={id:'visible:day',layer:'visible',position:'day',element:'wood',roots:[]},
 x={id:'hidden:year:계',layer:'hidden',position:'year',element:'water',hiddenRole:'principal'},
 y={id:'hidden:month:정',layer:'hidden',position:'month',element:'fire',hiddenRole:'principal'};
 const edge={edgeId:a.id+'>'+b.id,from:a.id,to:b.id,kind:'generate',effective:null,selectionAuthority:false};
 const clashId='clash-1',formationId='formation-1';
 const alternative={formationId,classification:'six-harmony',positions:['year','day'],sharedPosition:'year',oppositePosition:'month',targetElement:'earth',otherClashIds:[],remainingClashIds:[],competingFormationIds:[],reliefConfirmed:null};
 const clash={clashId,positions:['year','month'],endpoints:[x,y].map(a=>({position:a.position,slotIds:[a.id],damageConfirmed:null})),alternatives:[alternative],...absent};
 const slots=[x,y].map(a=>({id:a.id,position:a.position,element:a.element,role:a.hiddenRole,substantial:true,clashIds:[clashId],reliefAlternatives:[{clashId,options:[{formationId,side:a===x?'root-side':'opposite-side',rootPositionParticipates:a===x,targetElement:'earth',rootElementDiffersFromTarget:a===x,reliefConfirmed:null}]}],...absent}));
 const occurrence={id:a.id,element:a.element,exposedSubstantialRootIds:[x.id],exposedResidualRootIds:[],uncontestedRootIds:[],outsideIncidentClashRootIds:[],incoming:[],...absent};
 const affected={...edge,substantialRootIds:[x.id],residualRootIds:[],...absent};
 const arg={...edge,effectPropositionId:'effect'};
 return {prior:{completeHour:complete,stemForce:{occurrences:[a,b,x,y]}},residual:{...base,...absent,clashes:[clash],slots,occurrences:[occurrence],actions:[affected]},supply:{...base,effectiveSupply:null,actions:[edge]},argument:{...base,effective:null,actions:[arg],judgments:[{id:'effect',subject:edge.edgeId,kind:'actual-action-effective',level:'effect-hypothesis',state:'unresolved',support:{rank:null},opposition:{rank:null}}]}};
}
const clashReview=x=>reviewClashPolicy(x.prior,x.residual,x.supply,x.argument);
test('clash policy binds both directions and exact relief sides without restoring roots',()=>{
 for(const complete of [true,false]){
  const r=clashReview(clashFixture(complete));assert.equal(r.status,complete?'diagnostic':'partial');
  assert.equal(r.directions.length,2);assert.equal(r.reliefs.length,1);assert.equal(r.slots.length,2);assert.equal(r.actions.length,1);
  assert.deepEqual(r.slots.map(s=>s.reliefAlternatives[0].side),['root-side','opposite-side']);
  assert.ok(r.slots.every(s=>s.actualDamageState==='unresolved'&&s.actualRestorationState==='unresolved'&&s.actualPreservationState==='unresolved'));
  assert.ok(r.directions.every(d=>d.conditionals.every(c=>c.applicability==='unresolved')));
  assert.deepEqual(r.actions[0].actualUndercuts,[]);assert.equal(r.actions[0].actualEffectState,'unresolved');
 }
});
test('clash policy fails closed for omitted slots altered relief side or manufactured effect',()=>{
 const a=clashFixture();a.residual.slots.pop();assert.equal(clashReview(a).status,'invalid-evidence');
 const b=clashFixture();b.residual.slots[0].reliefAlternatives[0].options[0].side='opposite-side';assert.equal(clashReview(b).status,'invalid-evidence');
 const c=clashFixture();c.residual.actions[0].substantialRootIds=[];assert.equal(clashReview(c).status,'invalid-evidence');
 const d=clashFixture();d.argument.judgments[0].support.rank=0;assert.equal(clashReview(d).status,'invalid-evidence');
 const e=clashFixture();e.residual.clashes[0].alternatives[0].reliefConfirmed=true;assert.equal(clashReview(e).status,'invalid-evidence');
 const f=clashFixture();f.residual.occurrences=[];f.residual.actions=[];assert.equal(clashReview(f).status,'invalid-evidence');
});
test('native clash policy preserves 24 packet variants and exact residual scope',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));let n=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete),formation=analyzeFormationEvidence({saju:x.saju}),root=observeRootContext(x.prior,formation);
  const residual=observeClashResidualContext(x.prior,formation,root,x.supply);
  const r=reviewClashPolicy(x.prior,residual,x.supply,x.review);
  assert.equal(r.status,complete?'diagnostic':'partial',c.id);assert.equal(r.directions.length,residual.clashes.length*2,c.id);
  assert.equal(r.slots.length,residual.slots.length,c.id);assert.equal(r.actions.length,residual.actions.length,c.id);
  assert.ok(r.actions.every(a=>a.actualEffectState==='unresolved'&&!a.actualUndercuts.length));
  const native=analyzePatternOutcomeV10({saju:x.saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  assert.deepEqual(native.efficacyReview.mechanismReview.clashPolicyReview,r,c.id);assert.equal(native.decisionReview.status,'abstained');n++;
 }
 assert.equal(n,24);
});

const jointLit=(propositionId,sign='for')=>({propositionId,sign});
const jointAlt=(id,requires,undercutWhen=[])=>({id,requires:requires.map(x=>typeof x==='string'?jointLit(x):x),undercutWhen:undercutWhen.map(x=>jointLit(x))});
test('joint closure preserves alternatives, explicit opposition and unseeded cycles',()=>{
 const candidates=[
  {id:'A',alternatives:[jointAlt('cycle',['B']),jointAlt('seed',['seed'],['block'])]},
  {id:'B',alternatives:[jointAlt('from-A',['A'])],rebutWhen:[jointLit('counter')]},
  {id:'C',alternatives:[jointAlt('via-B',['B']),jointAlt('independent',['other'])]}
 ];
 const run=(seed,block,other='unresolved',counter='unresolved',scope='complete')=>evaluateJointScenario({scope,candidates,assumptions:[{id:'seed',state:seed},{id:'block',state:block},{id:'other',state:other},{id:'counter',state:counter}]});
 const state=(r,id)=>r.judgments.find(x=>x.id===id).state;
 let r=run('unresolved','unresolved');assert.ok(r.judgments.every(j=>j.state==='unresolved'));
 r=run('supported','opposed');assert.equal(state(r,'C'),'supported');
 r=run('supported','supported','supported');assert.equal(state(r,'A'),'unresolved');assert.equal(state(r,'B'),'unresolved');assert.equal(state(r,'C'),'supported');
 r=run('supported','opposed','unresolved','supported');assert.equal(state(r,'B'),'conflicting');
 r=run('supported','opposed','supported','supported','partial');assert.ok(r.judgments.every(j=>j.state==='unresolved'));
 assert.equal(evaluateJointScenario({scope:'complete',assumptions:[],candidates:[{id:'a',alternatives:[jointAlt('x',['unknown'])]}]}).status,'invalid-evidence');
});
function jointFixture(complete=true){
 const base={status:complete?'diagnostic':'partial',completeHour:complete,selectionAuthority:false,effective:null},u='unresolved';
 const a={id:'visible:year',layer:'visible'},b={id:'visible:month',layer:'visible'},c={id:'visible:day',layer:'visible'},h={id:'hidden:year:갑',layer:'hidden'};
 const edges=[[a,b,'generate'],[b,c,'generate'],[a,c,'control']].map(([x,y,kind])=>({edgeId:x.id+'>'+y.id,from:x.id,to:y.id,kind,effectPropositionId:'effect:'+x.id+'>'+y.id}));
 const [ab,bc,ac]=edges;
 const pairId='pair',pathId='mediation',pressureId='pressure',slotId=h.id;
 const occ=[a,b,c].map(x=>({id:x.id,directRoot:{uncontestedRootIds:[],contestedRootIds:x===a?[slotId]:[]},paths:[],groundedPathIds:[]}));
 occ[1].paths=[{id:'incoming',recipientId:b.id,upstream:'observed',donor:{groundedRootIds:[slotId]}}];occ[1].groundedPathIds=['incoming'];
 const effectRows=edges.map(e=>({id:e.effectPropositionId,subject:e.edgeId,kind:'actual-action-effective',level:'effect-hypothesis',state:u,support:{rank:null},opposition:{rank:null}}));
 const source={...base,effectConfirmed:null,actions:edges.map(e=>({edgeId:e.edgeId,actualEffectPropositionId:e.effectPropositionId,actualEffectState:u,clauses:[]}))};
 const pair={pairId,participantIds:[a.id,b.id],competitorPairIds:[],actualRestrictionState:u,actualTransformationState:u,actualRetentionState:u};
 const combination={...base,pairs:[pair],actions:edges.map(e=>({edgeId:e.edgeId,fromPairIds:[a.id,b.id].includes(e.from)?[pairId]:[],toPairIds:[a.id,b.id].includes(e.to)?[pairId]:[],originalEffectPropositionId:e.effectPropositionId,actualEffectState:u}))};
 const clash={...base,slots:[{slotId}],reliefs:[],actions:[ab,ac].map(e=>({edgeId:e.edgeId,substantialRootIds:[slotId],residualRootIds:[],originalEffectPropositionId:e.effectPropositionId,actualEffectState:u}))};
 const interposition={...base,actions:[{edgeId:ac.edgeId,actualEffectPropositionId:ac.effectPropositionId,actualEffectState:u,pathIds:[pathId]}],paths:[{pathId,kind:'mediation',helperId:b.id,controllerId:a.id,targetId:c.id,controlEdgeId:ac.edgeId,legEdgeIds:[ab.edgeId,bc.edgeId,ac.edgeId],pressureId,dependencyIds:['external'],sourcePolicyId:'tongguan',actualEffectState:u}]};
 return {prior:{completeHour:complete,stemForce:{occurrences:[a,b,c,h]}},supply:{...base,effectiveSupply:null,occurrences:occ},argument:{...base,actions:edges,judgments:effectRows},source,interposition,combination,clash};
}
const jointReview=x=>reviewJointConstraints(x.prior,x.supply,x.argument,x.source,x.interposition,x.combination,x.clash);
test('joint production binds shared physical roots and exact leg restrictions without promotion',()=>{
 const r=jointReview(jointFixture());assert.equal(r.status,'diagnostic');assert.equal(r.actions.length,3);assert.equal(r.sharedRoots.length,1);
 assert.equal(r.sharedRoots[0].independentCapacityConfirmed,null);assert.equal(r.paths.length,1);
 const path=r.paths[0];assert.equal(path.requiredLegIds.length,2);assert.ok(!path.requiredLegIds.includes(path.controlEdgeId));
 assert.ok(path.conditionalRestrictionIds.some(id=>JSON.parse(id)[0]==='pair-restricts-leg'));
 assert.ok(path.conditionalRestrictionIds.some(id=>JSON.parse(id)[0]==='root-loss-blocks-leg'));
 assert.ok(r.scenario.judgments.every(j=>j.state==='unresolved'));assert.ok(r.actions.every(a=>a.actualEffectState==='unresolved'));
 const assumptions=r.scenario.assumptions.map(a=>({...a,state:['path-obstruction','pair-restricts-leg','root-loss-blocks-leg'].includes(JSON.parse(a.id)[0])?'opposed':'supported'}));
 const go=as=>evaluateJointScenario({scope:'complete',assumptions:as,candidates:r.scenario.candidates});
 const state=x=>x.judgments.find(j=>j.id===path.scenarioPropositionId).state;
 assert.equal(state(go(assumptions)),'supported');
 const restriction=path.conditionalRestrictionIds.find(id=>JSON.parse(id)[0]==='pair-restricts-leg');
 assert.equal(state(go(assumptions.map(a=>a.id===restriction?{...a,state:'conflicting'}:a))),'unresolved');
 assert.equal(state(go(assumptions.map(a=>JSON.parse(a.id)[0]==='external-pressure-relief'?{...a,state:'unresolved'}:a))),'unresolved');
 assert.equal(jointReview(jointFixture(false)).status,'partial');
});
test('joint review rejects foreign identity and keeps unmatched routes unassessed',()=>{
 const x=jointFixture();x.interposition.paths[0].legEdgeIds[0]='foreign';assert.equal(jointReview(x).status,'invalid-evidence');
 const y=jointFixture();y.argument.judgments[0].state='supported';assert.equal(jointReview(y).status,'invalid-evidence');
 const z=jointFixture();z.interposition.paths[0].sourcePolicyId=null;const r=jointReview(z);assert.equal(r.status,'diagnostic');assert.equal(r.paths[0].scenarioPropositionId,null);
});
test('native joint constraint review replays all 24 variants with no effect promotion',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));let n=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete);
  const native=analyzePatternOutcomeV10({saju:x.saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  const m=native.efficacyReview.mechanismReview,r=m.jointConstraintReview;
  assert.equal(r.status,complete?'diagnostic':'partial',c.id);
  assert.deepEqual(r,reviewJointConstraints(x.prior,m.groundedSupply??x.supply,m.argumentReview,m.sourceEffectReview,m.interpositionPolicyReview,m.combinationPolicyReview,m.clashPolicyReview),c.id);
  assert.equal(r.actions.length,m.argumentReview.actions.length,c.id);
  assert.ok(r.actions.every(a=>a.actualEffectState==='unresolved'));assert.equal(native.decisionReview.status,'abstained');n++;
 }
 assert.equal(n,24);
});

const strengthFixture=(direction)=>({policy:'strength-decision-v1',status:'hypothesis',confirmed:false,direction,grounds:[direction==='strong'?'central-root-capacity':'low-root-capacity-and-dominant-pressure'],conflicts:[]});
test('day direction resolver accepts only scoped and consistent strength hypotheses',()=>{
 for(const direction of ['strong','weak']){
  const s=strengthFixture(direction);assert.equal(resolveDayDirection(s,true).direction,direction);
  assert.equal(resolveDayDirection(s,false).direction,null);
  assert.equal(resolveDayDirection({...s,conflicts:['conflict']},true).direction,null);
  assert.equal(resolveDayDirection({...s,confirmed:true},true).direction,null);
  assert.equal(resolveDayDirection({...s,grounds:[]},true).direction,null);
  assert.equal(resolveDayDirection({...s,direction:direction==='strong'?'weak':'strong'},true).direction,null);
 }
 assert.equal(resolveDayDirection({...strengthFixture('strong'),grounds:['central-root-capacity','low-root-capacity-and-dominant-pressure']},true).direction,null);
 assert.equal(resolveDayDirection({...strengthFixture('strong'),status:'unresolved'},true).direction,null);
 assert.equal(resolveDayDirection({...strengthFixture('strong'),grounds:['central-root-capacity','unknown']},true).direction,null);
 assert.equal(resolveDayDirection({...strengthFixture('strong'),grounds:['central-root-capacity','central-root-capacity']},true).direction,null);
});
function directionFixture(complete=true,screenState='supported'){
 const base={status:complete?'diagnostic':'partial',completeHour:complete,selectionAuthority:false,effective:null};
 const day={id:'visible:day',layer:'visible',dayReference:true,element:'earth'};
 const year={id:'visible:year',layer:'visible',dayReference:false,element:'fire'},month={id:'visible:month',layer:'visible',dayReference:false,element:'metal'},hour={id:'visible:hour',layer:'visible',dayReference:false,element:'wood'};
 const actions=[[year,day,'generate'],[day,month,'generate'],[hour,day,'control'],[year,month,'control'],[hour,year,'generate'],[month,hour,'control']].filter(([a,b])=>complete||a!==hour&&b!==hour).map(([a,b,kind])=>{
  const edgeId=a.id+'>'+b.id;return {edgeId,from:a.id,to:b.id,kind,effectPropositionId:'effect:'+edgeId,structuralPropositionId:'screen:'+edgeId};
 });
 const judgments=actions.flatMap(a=>[
  {id:a.effectPropositionId,subject:a.edgeId,kind:'actual-action-effective',level:'effect-hypothesis',state:'unresolved',support:{rank:null},opposition:{rank:null}},
  {id:a.structuralPropositionId,subject:a.edgeId,kind:a.kind==='generate'?'existing-generation-screen-met':'stable-source-profile-dominance',level:'structural-hypothesis',state:screenState}]);
 return {prior:{completeHour:complete,stemForce:{occurrences:complete?[day,year,month,hour]:[day,year,month]}},argument:{...base,actions,judgments},
  joint:{...base,actions:actions.map(a=>({edgeId:a.edgeId,from:a.from,to:a.to,kind:a.kind,effectPropositionId:a.effectPropositionId,actualEffectState:'unresolved'}))}};
}
const directionReview=(x,s)=>reviewDayBalanceDirection(x.prior,x.argument,x.joint,s);
test('strong weak contrast yields signed directional judgments but not actual effects',()=>{
 for(const direction of ['strong','weak']){
  const r=directionReview(directionFixture(),strengthFixture(direction));assert.equal(r.status,'diagnostic');assert.equal(r.actions.length,3);
  for(const a of r.actions){
   const fit=a.desiredDirection===direction;
   assert.equal(a.directionFit,fit?'supported':'opposed');assert.equal(a.candidateState,fit?'supported':'unresolved');
   assert.equal(a.actualEffectState,'unresolved');assert.equal(a.effective,null);
  }
  assert.ok(r.actions.every(a=>['support','release','restraint'].includes(a.role)));
  assert.equal(r.selectionAuthority,false);
 }
});
test('failed or conflicting screens never become effective force rebuttals',()=>{
 for(const s of ['opposed','conflicting','unresolved']){
  const r=directionReview(directionFixture(true,s),strengthFixture('strong'));
  assert.equal(r.actions.find(a=>a.role==='release').directionFit,'supported');
  assert.ok(r.actions.every(a=>a.candidateState==='unresolved'&&a.actualEffectState==='unresolved'));
 }
 const r=directionReview(directionFixture(false),strengthFixture('strong'));
 assert.equal(r.status,'partial');assert.ok(r.actions.every(a=>a.directionFit==='unresolved'&&a.candidateState==='unresolved'));
 const x=directionFixture();x.joint.actions[0].effectPropositionId='foreign';assert.equal(directionReview(x,strengthFixture('strong')).status,'invalid-evidence');
 const y=directionFixture();y.argument.judgments[0].state='supported';assert.equal(directionReview(y,strengthFixture('strong')).status,'invalid-evidence');
});
test('native day-balance direction replay preserves original scope and decision authority',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));let n=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete);
  const native=analyzePatternOutcomeV10({saju:x.saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  const m=native.efficacyReview.mechanismReview,r=m.dayBalanceDirectionReview;
  assert.equal(r.status,complete?'diagnostic':'partial',c.id);
  assert.deepEqual(r,reviewDayBalanceDirection(x.prior,m.argumentReview,m.jointConstraintReview,native.regulationStrength),c.id);
  assert.ok(r.actions.every(a=>a.actualEffectState==='unresolved'));assert.equal(native.decisionReview.status,'abstained');
  if(!complete)assert.ok(r.actions.every(a=>a.directionFit==='unresolved'));n++;
 }
 assert.equal(n,24);
});

function elementModelFixture(completeHour=true,targetElement='fire'){
 const base={status:completeHour?'diagnostic':'partial',completeHour,selectionAuthority:false};
 const positions=completeHour?['year','month','day','hour']:['year','month','day'];
 const visible=positions.map(position=>({id:'visible:'+position,position,layer:'visible',stem:position==='day'?(targetElement==='wood'?'갑':'병'):'임',element:position==='day'?targetElement:'water',contacts:[],graphNodeId:position+':stem'}));
 const hidden=positions.map(position=>({id:'hidden:'+position+':계',position,layer:'hidden',stem:'계',element:'water',hiddenRole:'principal',contacts:[],graphNodeId:position+':branch:water'}));
 const actors=[...visible,...hidden].map(a=>({...a,seasonal:{seasonRelation:elementRelation('water',a.element),principalRelation:elementRelation('water',a.element)}}));
 const slots=hidden.map(a=>({id:a.id,position:a.position,stem:a.stem,element:a.element,role:a.hiddenRole,state:'uncontested-substantial-observation',effectiveRoot:null}));
 const occurrences=actors.map(a=>({id:a.id,uncontestedRootIds:a.element==='water'?slots.map(s=>s.id):[],contestedRootIds:[],seasonal:{monthBranchContested:false}}));
 const nodes=actors.map(a=>({nodeId:a.graphNodeId,position:a.position,element:a.element,occurrenceIds:[a.id],contacts:[],groundedRootIds:a.layer==='hidden'?[a.id]:a.element==='water'?slots.map(s=>s.id):[],contestedRootIds:[],
  state:a.element==='water'?'grounded-observation':completeHour?'no-substantial-root-observed':'partial',independentSupplyConfirmed:null}));
 const actions=actors.flatMap(a=>actors.filter(b=>a.position!==b.position||a.layer!==b.layer).flatMap(b=>{
  const rel=elementRelation(a.element,b.element);
  return rel.direction==='left-to-right'?[{edgeId:a.id+'>'+b.id,from:a.id,to:b.id,kind:rel.type,effective:null,selectionAuthority:false}]:[];
 }));
 const sourceActions=actions.filter(e=>e.from.startsWith('visible:')&&e.to.startsWith('visible:')).map(e=>({
  ...e,actualEffectPropositionId:'effect:'+e.edgeId,actualEffectState:'unresolved',effectConfirmed:null,
  clauses:sourceEffectClauses().filter(c=>c.kind===e.kind&&c.fromElement==='water'&&c.toElement===targetElement).map(c=>({clauseId:c.id,predicateActorId:c.role==='source'?e.from:e.to,predicateElement:c.role==='source'?'water':targetElement,predicate:c.predicate,predicateState:'unresolved',effectConfirmed:null}))
 }));
 return {prior:{completeHour,stemForce:{occurrences:actors}},root:{...base,rootEffectConfirmed:null,slots,occurrences},supply:{...base,effectiveSupply:null,nodes,actions},source:{...base,effectConfirmed:null,actions:sourceActions}};
}
const elementReview=x=>reviewElementContexts(x.prior,x.root,x.supply,x.source);
test('element context model resolves bounded strong and weak contrasts without count scores',()=>{
 const r=elementReview(elementModelFixture());assert.equal(r.status,'diagnostic',r.reason);
 const water=r.elements.find(e=>e.element==='water'),fire=r.elements.find(e=>e.element==='fire');
 assert.equal(water.model.strongState,'supported');assert.equal(water.model.weakState,'opposed');
 assert.equal(fire.model.weakState,'supported');assert.equal(fire.model.strongState,'opposed');
 assert.equal(water.cleanPrincipalSlotIds.length,4);
 assert.ok(r.elements.filter(e=>!['water','fire'].includes(e.element)).every(e=>e.model.strongState==='unresolved'&&e.model.weakState==='unresolved'));
 assert.ok(r.elements.every(e=>e.actualStrengthState==='unresolved'&&e.excessState==='unresolved'&&e.deficiencyState==='unresolved'));
 assert.ok(r.actions.every(a=>a.clauses.find(c=>c.predicate==='weak').modeledApplicability==='supported'));
 assert.ok(r.actions.every(a=>a.clauses.every(c=>c.actualPredicateState==='unresolved'&&c.actualEffectState==='unresolved')));
 assert.ok(r.actions.every(a=>a.clauses.find(c=>c.predicate==='resistant').modeledApplicability==='unresolved'));
});
test('element model contrasts require each independent condition and never infer weak from not strong',()=>{
 const r=elementReview(elementModelFixture());
 const p=r.elements.find(e=>e.element==='water'),refs=Object.fromEntries(p.model.evidence.map(e=>[e.propositionId,e.refs]));
 const run=axes=>evaluateElementContextModel({completeHour:true,element:p.element,axes,evidenceRefs:refs});
 for(const axis of ['seasonSupports','principalSupports','cleanPrincipalRoot','clearContacts','monthContextClear','noRootedBurdenBasis']){
  const q=run({...p.axes,[axis]:null});assert.equal(q.strongState,'unresolved');assert.equal(q.weakState,'unresolved');
 }
 const q=run({...p.axes,substantialRoot:false});assert.equal(q.status,'invalid-evidence');
 const fire=r.elements.find(e=>e.element==='fire');
 const fr=Object.fromEntries(fire.model.evidence.map(e=>[e.propositionId,e.refs]));
 for(const axis of ['noRootedGeneratorBasis','localGroundedControlCoverage','substantialRoot','seasonSupports','principalSupports']){
  const x=evaluateElementContextModel({completeHour:true,element:'fire',axes:{...fire.axes,[axis]:null},evidenceRefs:fr});
  assert.equal(x.weakState,'unresolved');assert.equal(x.strongState,'unresolved');
 }
});
test('element review rejects omitted root basis forged predicates and partial-scope promotion',()=>{
 const x=elementModelFixture();x.supply.nodes[0].groundedRootIds=[];x.supply.nodes[0].state='no-substantial-root-observed';
 assert.equal(elementReview(x).status,'invalid-evidence');
 x.root.occurrences[0].uncontestedRootIds=[];assert.equal(elementReview(x).status,'invalid-evidence');
 const missing=elementModelFixture();const edge=missing.source.actions.pop();missing.supply.actions=missing.supply.actions.filter(a=>a.edgeId!==edge.edgeId);assert.equal(elementReview(missing).status,'invalid-evidence');
 const y=elementModelFixture();y.source.actions[0].clauses[0].predicateState='supported';assert.equal(elementReview(y).status,'invalid-evidence');
 const z=elementModelFixture();z.prior.stemForce.occurrences[0].seasonal.seasonRelation={type:'same',direction:'left-to-right'};assert.equal(elementReview(z).status,'invalid-evidence');
 const partial=elementReview(elementModelFixture(false));assert.equal(partial.status,'partial',partial.reason);
 assert.ok(partial.elements.every(e=>e.model.strongState==='unresolved'&&e.model.weakState==='unresolved'));
});
test('native element context review preserves five-element inventory and source authority across packet variants',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));let n=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete),native=analyzePatternOutcomeV10({saju:x.saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  const m=native.efficacyReview.mechanismReview,r=m.elementContextReview;
  assert.equal(r.status,complete?'diagnostic':'partial',c.id+':'+r.reason);assert.equal(r.elements.length,5,c.id);
  assert.deepEqual(r,reviewElementContexts(x.prior,m.rootContext,m.groundedSupply,m.sourceEffectReview),c.id);
  assert.equal(r.actions.length,m.sourceEffectReview.actions.length,c.id);
  assert.ok(r.elements.every(e=>e.actualStrengthState==='unresolved'&&e.excessState==='unresolved'&&e.deficiencyState==='unresolved'));
  if(!complete)assert.ok(r.elements.every(e=>e.model.strongState==='unresolved'&&e.model.weakState==='unresolved'));
  assert.equal(native.decisionReview.status,'abstained');n++;
 }
 assert.equal(n,24);
});

function consequenceFixture(target='fire',complete=true){
 const x=elementModelFixture(complete,target),element=elementReview(x);
 assert.equal(element.status,complete?'diagnostic':'partial',element.reason);
 const base={status:element.status,completeHour:complete,selectionAuthority:false,effective:null};
 for(const a of x.prior.stemForce.occurrences)a.protectionAndMediation=[];
 const byActor=new Map(x.prior.stemForce.occurrences.map(a=>[a.id,a]));
 const propositions=[],evidence=[],rules=[],actions=[],jointActions=[],pressures=[];
 for(const n of x.supply.nodes)n.kind=n.occurrenceIds[0].startsWith('visible:')?'visible-stem':'local-branch-constituents';
 for(const e of x.source.actions){
  const sid='screen:'+e.edgeId,eid=e.actualEffectPropositionId,oid='observed:'+e.edgeId;
  if(e.kind==='generate'){
   const ids=['source-basis-screen-met','context-blockers-empty','source-pressure-screen-clear','target-pressure-screen-clear'].map(k=>JSON.stringify([e.edgeId,k]));
   propositions.push({id:sid,subject:e.edgeId,kind:'existing-generation-screen-met',level:'structural-hypothesis'},
    {id:eid,subject:e.edgeId,kind:'actual-action-effective',level:'effect-hypothesis'},
    ...ids.map(id=>({id,subject:e.edgeId,kind:JSON.parse(id)[1],level:'observation'})));
   const refs=[{owner:'synthetic-fixture',id:e.edgeId,field:'screen'}];
   for(const id of ids)evidence.push({id:'fact:'+id,propositionId:id,sign:'for',refs,applicability:'complete-only'});
   const rule=(sign,ps)=>({id:JSON.stringify([sid,sign,ps]),policyId:'p1-1-existing-structural-screen-v1',conclusion:{propositionId:sid,sign},premises:ps.map(propositionId=>({propositionId,sign})),refs,applicability:'complete-only'});
   rules.push(rule('for',ids),...ids.map(id=>rule('against',[id])));
  }else{
  propositions.push({id:sid,subject:e.edgeId,kind:e.kind==='generate'?'existing-generation-screen-met':'stable-source-profile-dominance',level:'structural-hypothesis'},
   {id:eid,subject:e.edgeId,kind:'actual-action-effective',level:'effect-hypothesis'},
   {id:oid,subject:e.edgeId,kind:'synthetic-screen-premise',level:'observation'});
  evidence.push({id:'fact:'+oid,propositionId:oid,sign:'for',refs:[{owner:'synthetic-fixture',id:oid,field:'state'}],applicability:'complete-only'});
  rules.push({id:'rule:'+sid,policyId:'synthetic-screen-test',conclusion:{propositionId:sid,sign:'for'},premises:[{propositionId:oid,sign:'for'}],refs:[{owner:'synthetic-fixture',id:oid,field:'state'}],applicability:'complete-only'});
  }
  actions.push({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,structuralPropositionId:sid,effectPropositionId:eid});
  jointActions.push({...actions.at(-1),actualEffectState:'unresolved',combinationPairIds:[],exposedRootIds:[]});
  const row=x.supply.actions.find(a=>a.edgeId===e.edgeId);
  row.sourceBasis=complete?'direct-root-observed':'partial';row.contextBlockers=[];row.sourcePressure=[];row.targetPressure=[];
  if(e.kind==='control'){
   const from=byActor.get(e.from),to=byActor.get(e.to);
   pressures.push({id:JSON.stringify([from.graphNodeId,to.graphNodeId]),controllerNodeId:from.graphNodeId,targetNodeId:to.graphNodeId,local:Math.abs(['year','month','day','hour'].indexOf(from.position)-['year','month','day','hour'].indexOf(to.position))===1,candidatePathIds:[],screenedPathIds:[],structuralDependencyRank:null,neutralizationConfirmed:null,effective:null});
  }
 }
 const result=evaluateArguments({scope:complete?'complete':'partial',propositions,evidence,rules});
 return {...x,element,argument:{...base,propositions,evidence,rules,actions,judgments:result.judgments,ruleResults:result.ruleResults},joint:{...base,actions:jointActions},pressure:{...base,pressures,paths:[]}};
}
const consequenceReview=x=>reviewModeledConsequences(x.prior,x.supply,x.argument,x.pressure,x.joint,x.element);
const consequenceClause=(r,edge)=>r.actions.find(a=>a.edgeId===edge).clauses.find(c=>c.propositionId!==null);
test('modeled consequences derive actual signed model proofs for both release and injury without generic effect promotion',()=>{
 const edge='visible:month>visible:day';
 for(const [target,kind] of [['fire','modeled-target-injury'],['wood','modeled-source-release']]){
  const x=consequenceFixture(target),r=consequenceReview(x);assert.equal(r.status,'diagnostic',r.reason);
  const c=consequenceClause(r,edge);assert.equal(c.kind,kind);assert.equal(c.state,'supported');assert.ok(c.proof.support.rank>=2);
  assert.equal(c.proof.opposition.rank,null);
  assert.equal(consequenceClause(r,'visible:year>visible:day').state,'unresolved');
  assert.ok(r.judgments.filter(j=>j.level==='effect-hypothesis').every(j=>j.state==='unresolved'));
  assert.ok(r.actions.flatMap(a=>a.clauses).filter(c=>c.propositionId===null).every(c=>c.state==='unresolved'));
 }
});
test('modeled consequence withdraws on exact-edge interference or failed premise without asserting an opposite effect',()=>{
 const edge='visible:month>visible:day';
 const mutations=[
  x=>{x.joint.actions.find(a=>a.edgeId===edge).combinationPairIds=['candidate'];},
  x=>{x.joint.actions.find(a=>a.edgeId===edge).exposedRootIds=['candidate'];},
  x=>{x.supply.actions.find(a=>a.edgeId===edge).sourcePressure=[{donorState:'context-review'}];},
  x=>{x.supply.actions.find(a=>a.edgeId===edge).contextBlockers=['nonlocal-context'];},
  x=>{x.supply.actions.find(a=>a.edgeId===edge).sourceBasis='no-screened-source-basis';},
  x=>{
   const oid='observed:'+edge;
   x.argument.evidence.push({id:'opposition:'+oid,propositionId:oid,sign:'against',refs:[{owner:'synthetic-fixture',id:oid,field:'state'}],applicability:'complete-only'});
   x.argument.rules.push({id:'oppose:'+oid,policyId:'synthetic-screen-test',conclusion:{propositionId:'screen:'+edge,sign:'against'},premises:[{propositionId:oid,sign:'against'}],refs:[{owner:'synthetic-fixture',id:oid,field:'state'}],applicability:'complete-only'});
   const a=evaluateArguments({scope:'complete',propositions:x.argument.propositions,evidence:x.argument.evidence,rules:x.argument.rules});
   x.argument.judgments=a.judgments;x.argument.ruleResults=a.ruleResults;
  }
 ];
 for(const mutate of mutations){
  const x=consequenceFixture();mutate(x);const r=consequenceReview(x);assert.equal(r.status,'diagnostic',r.reason);
  const c=consequenceClause(r,edge);assert.equal(c.state,'unresolved');assert.equal(c.proof.opposition.rank,null);
 }
});
test('modeled consequence rejects tampered proof and clause authority and abstains with missing hour',()=>{
 const x=consequenceFixture();x.element.elements.find(p=>p.element==='fire').model.weakState='opposed';assert.equal(consequenceReview(x).status,'invalid-evidence');
 const y=consequenceFixture();y.argument.judgments[0].state='unresolved';assert.equal(consequenceReview(y).status,'invalid-evidence');
 const z=consequenceFixture();z.element.actions[0].clauses[0].actualPredicateState='supported';assert.equal(consequenceReview(z).status,'invalid-evidence');
 const missing=consequenceFixture();missing.pressure.pressures.find(p=>p.local).candidatePathIds=['foreign'];assert.equal(consequenceReview(missing).reason,'interposition-inventory');
 const rank=consequenceFixture();rank.pressure.pressures[0].structuralDependencyRank=0;assert.equal(consequenceReview(rank).reason,'interposition-rank-parity');
 const omitted=consequenceFixture();const to=omitted.prior.stemForce.occurrences.find(a=>a.id==='visible:day');
 to.protectionAndMediation.push({kind:'protection',helper:'hour:stem',threat:'month:stem',target:'day:stem',effective:null});
 assert.equal(consequenceReview(omitted).reason,'interposition-inventory');
 const partial=consequenceReview(consequenceFixture('fire',false));assert.equal(partial.status,'partial',partial.reason);
 assert.ok(partial.actions.flatMap(a=>a.clauses).every(c=>c.state==='unresolved'));
});
test('native modeled consequence review replays 24 packet variants with actual effects and decision authority unchanged',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));let n=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete),native=analyzePatternOutcomeV10({saju:x.saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  const m=native.efficacyReview.mechanismReview,r=m.modeledConsequenceReview;
  assert.equal(r.status,complete?'diagnostic':'partial',c.id+':'+r.reason);
  assert.deepEqual(r,reviewModeledConsequences(x.prior,m.groundedSupply,m.argumentReview,m.pressureDependencyReview,m.jointConstraintReview,m.elementContextReview),c.id);
  assert.equal(r.actions.length,m.argumentReview.actions.length);assert.ok(r.judgments.filter(j=>j.level==='effect-hypothesis').every(j=>j.state==='unresolved'));
  if(!complete)assert.ok(r.actions.flatMap(a=>a.clauses).every(c=>c.state==='unresolved'));
  assert.equal(native.decisionReview.status,'abstained');n++;
 }
 assert.equal(n,24);
});

test('production core replay establishes both modeled consequences and withdraws on one-pillar contrasts',()=>{
 for(const c of coverageControls)for(const complete of [true,false]){
  const r=replayModeledCoverage(c.pillars,complete);
  assert.deepEqual(r.invalid,[],c.id);
  assert.equal(r.actualEffectPromoted,false,c.id);
  const q=r.rows.find(a=>a.edgeId==='visible:month>visible:day'&&a.kind===c.kind);
  assert.equal(q?.state,complete?c.expected:'unresolved',c.id);
  if(c.expectedModel)assert.equal(q.modelState,complete?c.expectedModel:'unresolved',c.id);
  if(complete&&c.id==='resource-backed-release'){
   assert.equal(q.axes.noRootedBurdenBasis,false);
   assert.equal(q.axes.noRootedControllerBasis,true);
   assert.deepEqual(q.modelSupportRuleIds,['strong-resource-model']);
   assert.ok(q.resourceWitnesses.length>0);
   assert.ok(q.resourceWitnesses.every(w=>w.rootIds.every(id=>!q.monthPrincipalRootIds.includes(id)&&id.split(':')[1]!=='month')));
  }
  if(complete&&c.id==='resource-basis-removed'){
   assert.equal(q.axes.independentLocalResourceBasis,false);
   assert.deepEqual(q.blockers,['element-model']);
  }
  if(complete&&c.id==='resource-with-rooted-controller')assert.equal(q.axes.noRootedControllerBasis,false);
  if(!complete)assert.ok(r.rows.every(a=>a.state==='unresolved'&&(a.directInjuryState==null||a.directInjuryState==='unresolved')));
  if(complete&&c.id==='injury-interposition'){
   assert.equal(q.modelState,'supported');assert.equal(q.structuralState,'supported');
   assert.deepEqual(q.blockers,['no-observed-interposition-candidate']);
   assert.equal(q.directInjuryState,'supported');assert.equal(q.residualInjuryState,'unresolved');
   assert.ok(q.interpositionCandidates.length>0);assert.ok(q.interpositionCandidates.every(p=>p.actualReliefState==='unresolved'));
  }
 }
});
test('coverage counts jointly unsatisfied and single missing premises without interpreting abstention as opposition',()=>{
 const rows=[
  {kind:'modeled-source-release',state:'unresolved',modelState:'unresolved',structuralState:'opposed',blockers:['element-model','structural-screen']},
  {kind:'modeled-target-injury',state:'unresolved',modelState:'supported',structuralState:'supported',blockers:['no-observed-interposition-candidate']},
  {kind:'modeled-target-injury',state:'supported',modelState:'supported',structuralState:'supported',blockers:[]}
 ];
 const r=summarizeModeledCoverage(rows);assert.equal(r.eligible,3);assert.equal(r.supported,1);assert.equal(r.unresolved,2);
 assert.equal(r.modelSupported,2);assert.equal(r.structureSupported,2);assert.equal(r.bothSupported,2);
 assert.deepEqual(r.singleBlockers,{'no-observed-interposition-candidate':1});
});

test('resource-backed alternative requires its own independent premises and never infers weakness from failure',()=>{
 const p=elementReview(elementModelFixture()).elements.find(e=>e.element==='water');
 const refs=Object.fromEntries(p.model.evidence.map(e=>[e.propositionId,e.refs]));
 const axes={...p.axes,noRootedBurdenBasis:false,noRootedGeneratorBasis:false,cleanMonthPrincipalRoot:true,independentLocalResourceBasis:true,noRootedControllerBasis:true};
 const run=overrides=>evaluateElementContextModel({completeHour:true,element:'water',axes:{...axes,...overrides},evidenceRefs:refs});
 assert.equal(run({}).strongState,'supported');
 assert.deepEqual(run({}).judgments.find(j=>j.id==='strong').support.witnesses,[{kind:'rule',id:'strong-resource-model'}]);
 for(const k of ['visible','seasonSupports','principalSupports','cleanMonthPrincipalRoot','clearContacts','monthContextClear','independentLocalResourceBasis','noRootedControllerBasis']){
  const q=run({[k]:null});assert.equal(q.strongState,'unresolved',k);assert.equal(q.weakState,'unresolved',k);
 }
 assert.equal(run({noRootedControllerBasis:false}).strongState,'unresolved');
 assert.equal(run({noRootedGeneratorBasis:true}).status,'invalid-evidence');
 assert.equal(run({substantialRoot:false}).status,'invalid-evidence');
});

test('source-side release proof survives only target pressure and rejects mismatched source evidence',()=>{
 const edge='visible:month>visible:day';
 const mutate=(x,kind,field,value)=>{
  const id=JSON.stringify([edge,kind]);
  x.argument.evidence.find(e=>e.propositionId===id).sign='against';
  x.supply.actions.find(e=>e.edgeId===edge)[field]=value;
  const a=evaluateArguments({scope:'complete',propositions:x.argument.propositions,evidence:x.argument.evidence,rules:x.argument.rules});
  x.argument.judgments=a.judgments;x.argument.ruleResults=a.ruleResults;
 };
 const x=consequenceFixture('wood');
 mutate(x,'target-pressure-screen-clear','targetPressure',[{donorState:'grounded-observation'}]);
 let r=consequenceReview(x);assert.equal(r.status,'diagnostic',r.reason);
 let c=consequenceClause(r,edge);
 assert.equal(c.directReleaseState,'supported');assert.equal(c.jointReleaseScreenState,'unresolved');
 assert.equal(c.targetPressureScreenState,'opposed');assert.equal(c.actualReceptionState,'unresolved');
 assert.equal(c.sourceScreen.sourceScreenState,'supported');assert.equal(c.directReleaseProof.opposition.rank,null);
 mutate(x,'source-pressure-screen-clear','sourcePressure',[{donorState:'grounded-observation'}]);
 r=consequenceReview(x);assert.equal(r.status,'diagnostic',r.reason);c=consequenceClause(r,edge);
 assert.equal(c.directReleaseState,'unresolved');assert.equal(c.state,'unresolved');
 const forged=consequenceFixture('wood');forged.supply.actions.find(e=>e.edgeId===edge).targetPressure=[{donorState:'grounded-observation'}];
 assert.equal(consequenceReview(forged).reason,'generation-source-screen-proof');
 const partial=consequenceReview(consequenceFixture('wood',false));assert.equal(partial.status,'partial',partial.reason);
 assert.ok(partial.actions.flatMap(a=>a.clauses).filter(c=>c.directReleasePropositionId).every(c=>c.directReleaseState==='unresolved'&&c.actualReceptionState==='unresolved'));
});
