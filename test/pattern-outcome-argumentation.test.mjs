import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateInterpositionScenario,reviewInterpositionPolicy,interpositionSourcePolicies} from '../src/features/pattern/outcome-interposition-policy.js';
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
 const s=makeActor('month','wood','상관'),t=makeActor('day','earth','정관',kind==='mediation');
 // In a protection fixture the day reference is a separate fourth actor.
 const extra=makeActor('hour','water',null,kind==='protection');
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
