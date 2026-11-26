import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {summarizePressureDependencies} from '../scripts/lib/pattern-outcome-screen-bottlenecks.mjs';
import {tracePressureDependencies,observePressureDependencyReview} from '../src/features/pattern/outcome-pressure-dependency.js';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce,compareForceCompletionEnvelope,compareForceProfiles} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {observeInterpositionReview} from '../src/features/pattern/outcome-interposition-review.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const path=(id,targetPressureId,dependencies=[],otherBlockers=[])=>({id,targetPressureId,dependencies,otherBlockers});
test('unseeded circular and self dependencies never bootstrap',()=>{
 const r=tracePressureDependencies(['a','b','c'],[path('ab','a',['b']),path('ba','b',['a']),path('cc','c',['c'])]);
 assert.deepEqual(r.pressureRanks,[]);assert.deepEqual(r.unseededCycles,[['a','b'],['c']]);
});
test('independent seed supports strictly ranked conditional AND/OR chain',()=>{
 const r=tracePressureDependencies(['a','b','c','d'],[path('ab','a',['b']),path('ba','b',['a']),path('seed','a'),path('join','c',['a','b']),path('blocked','d',['c'],['contact'])]);
 assert.deepEqual(r.pressureRanks,[{id:'a',rank:0},{id:'b',rank:1},{id:'c',rank:2}]);
 assert.deepEqual(r.unseededCycles,[]);assert.ok(!r.pathRanks.some(x=>x.id==='blocked'));
});
test('all dependencies must be present, and foreign or duplicate ids fail closed',()=>{
 assert.deepEqual(tracePressureDependencies(['a','b','c'],[path('seed','a'),path('join','c',['a','b'])]).pressureRanks,[{id:'a',rank:0}]);
 assert.equal(tracePressureDependencies(['a'],[path('foreign','a',['b'])]),null);
 assert.equal(tracePressureDependencies(['a'],[path('x','a'),path('x','a')]),null);
});
const build=(ps,complete=true)=>{
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour:complete,stemForce,relativeForce:observeRelativeForce(stemForce)};
 const root=observeRootContext(prior,analyzeFormationEvidence({saju})),supply=observeGroundedSupply(prior,root),interposition=observeInterpositionReview(prior,root,supply);
 return {prior,root,supply,interposition,saju};
};
const run=x=>observePressureDependencyReview(x.prior,x.root,x.supply,x.interposition);
test('source packet preserves existing screens, counts exact stable evidence and no effects',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));
 let n=0,pressureOnly=0,stable=0,total=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const x=build(c.pillars,complete),r=run(x);assert.equal(r.status,complete?'diagnostic':'partial',c.id);n++;
  assert.deepEqual(summarizePressureDependencies(c,r,x.supply,x.interposition,!complete).errors,[],c.id);
  assert.ok(r.pressures.every(p=>p.neutralizationConfirmed===null&&p.effective===null));
  assert.ok(r.paths.every(p=>p.effectConfirmed===null&&p.neutralizationConfirmed===null));
  assert.ok(r.generation.every(g=>g.originalScreen===x.supply.actions.find(e=>e.edgeId===g.edgeId).generationScreen&&g.effective===null));
  if(!complete)assert.ok(r.paths.every(p=>p.structuralDependencyRank===null));
  if(complete){total+=r.generation.length;pressureOnly+=r.generation.filter(g=>g.state==='pressure-prerequisites-unresolved').length;
   stable+=r.pressures.filter(p=>p.contrast.endsWith('-stable')&&p.contrast!=='direction-not-stable').length;}
 }
 assert.equal(n,24);assert.equal(total,34);assert.equal(pressureOnly,4);assert.equal(stable,5);
});
test('synthetic generation control retains two pressure-free structures and nonlocal blocker',()=>{
 const r=run(build(['을묘','을묘','정묘','을묘']));
 assert.equal(r.status,'diagnostic');assert.equal(r.generation.filter(g=>g.state==='pressure-free-structure-observed').length,2);
 assert.equal(r.generation.filter(g=>g.otherBlockers.includes('nonadjacent')).length,1);assert.equal(r.effective,null);
});
test('foreign controller or altered path screen fails closed',()=>{
 const x=build(['무술','갑자','정미','경술']),p=x.interposition.roleNeutral.paths.find(p=>p.blockers.length);
 p.structuralScreen='grounded-structure-screen-met';assert.equal(run(x).status,'invalid-evidence');
 const y=build(['무술','갑자','정미','경술']),c=y.interposition.roleNeutral.pressureContexts.find(c=>c.controllers.length);
 c.controllers[0].controllerNodeId='foreign';assert.equal(run(y).status,'invalid-evidence');
 const z=build(['무술','갑자','정미','경술']),e=z.supply.actions.find(e=>e.kind==='generate'&&e.from.startsWith('visible:')&&e.to.startsWith('visible:')&&e.sourcePressure.length);
 assert.ok(e);e.sourcePressure.pop();assert.equal(run(z).status,'invalid-evidence');
});
test('native V10 exposes pressure dependencies without decision authority',()=>{
 const {saju}=build(['무술','갑자','정미','경술']);
 const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 assert.notEqual(r.efficacyReview.status,'invalid-evidence');assert.equal(r.decisionReview.status,'abstained');
 const p=r.efficacyReview.mechanismReview.pressureDependencyReview;assert.equal(p.status,'diagnostic');assert.equal(p.effective,null);
});

test('completion envelope distinguishes invariant mixed evidence from missing information',()=>{
 const left={a:true,b:false,c:null},right={a:false,b:true,c:null};
 const r=compareForceCompletionEnvelope(left,right);
 assert.equal(r.relation,'unresolved');
 assert.deepEqual(r.possibleRelations,['mixed-evidence']);
 assert.equal(r.invariantRelation,'mixed-evidence');
 assert.deepEqual(r.leftOnly,['a']);assert.deepEqual(r.rightOnly,['b']);assert.deepEqual(r.unknown,['c']);
 assert.deepEqual(compareForceCompletionEnvelope({a:true,b:null},{a:false,b:true}).possibleRelations,['left-evidence-dominates','mixed-evidence']);
 assert.deepEqual(compareForceCompletionEnvelope({a:true,b:null},{a:false,b:false}).possibleRelations,['left-evidence-dominates']);
 assert.deepEqual(compareForceCompletionEnvelope({a:null},{a:null}).possibleRelations,['same-evidence-profile','left-evidence-dominates','right-evidence-dominates']);
 assert.equal(compareForceCompletionEnvelope(left,right,{completeHour:false}).possibleRelations,null);
 assert.equal(compareForceCompletionEnvelope({a:true},{b:true}),null);
});
test('completion envelope equals brute-force Boolean assignments on small graphs',()=>{
 const values=[true,false,null],names=['a','b','c'],sets=[];
 for(const a of values)for(const b of values)for(const c of values)sets.push({a,b,c});
 const expand=axes=>names.reduce((acc,k)=>acc.flatMap(r=>(axes[k]===null?[false,true]:[axes[k]]).map(v=>({...r,[k]:v}))),[{}]);
 const profile=axes=>({axes,rootPositions:[],localGenerationNodes:[],localPeerNodes:[]});
 for(const l of sets)for(const r of sets){
  const expected=new Set(expand(l).flatMap(a=>expand(r).map(b=>compareForceProfiles(profile(a),profile(b)).relation)));
  const got=compareForceCompletionEnvelope(l,r);
  assert.deepEqual([...got.possibleRelations].sort(),[...expected].sort());
  assert.equal(got.forceComparison,null);
 }
});
test('pressure contrast diagnostic retains direction, unknowns and exact comparison binding',()=>{
 for(const complete of [true,false]){
  const x=build(['무술','갑자','정미','경술'],complete),r=run(x);
  assert.equal(r.status,complete?'diagnostic':'partial');
  for(const p of r.pressures){
   if(!p.comparison){assert.equal(p.comparisonDiagnostics,null);continue;}
   const d=p.comparisonDiagnostics;
   assert.equal(d.contrast,p.contrast);assert.equal(d.forceComparison,null);
   for(const k of Object.keys(p.comparison))assert.equal(d.views[k].relation,p.comparison[k]);
   if(!complete){assert.equal(d.reason,'partial');assert.equal(d.views.sensitivity.possibleRelations,null);}
  }
 }
 // Mutate an exact projected control pair.
 const y=build(['무술','갑자','정미','경술']),r=run(y),q=r.pressures.find(p=>p.comparison);
 assert.ok(q);
 const a=y.prior.stemForce.occurrences.find(a=>a.graphNodeId===q.controllerNodeId).id;
 const b=y.prior.stemForce.occurrences.find(a=>a.graphNodeId===q.targetNodeId).id;
 const cmp=y.root.comparisons.find(p=>[p.left,p.right].includes(a)&&[p.left,p.right].includes(b));
 cmp.sensitivity.leftOnly.push('foreign');
 assert.equal(run(y).status,'invalid-evidence');
});
