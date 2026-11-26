import {strengthAuditFixtureNames,verifyStrengthAuditInventory} from '../scripts/lib/strength-audit-inventory.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildReferenceCoverageCohort,observeReferenceBasis,observeSynthesisCoverage,observeBurdenObligations,summarizeReferenceCoverage} from '../scripts/lib/pattern-strength-reference-coverage.mjs';
const read=name=>JSON.parse(readFileSync(new URL('./fixtures/'+name+'.json',import.meta.url),'utf8'));
const audit=read('strength-audit-v1'),patterns=read('pattern-classical-v2');
const cohort=()=>buildReferenceCoverageCohort(audit,patterns);
const basis={seasonSupport:false,principalSupport:false,substantialRootObserved:true,uncontestedRootObserved:true,localControlObserved:true,localDrainObserved:false};
test('frozen retrospective inventories retain separate scopes and overlap',()=>{
 const c=cohort();
 assert.equal(c.inventory.strength,76);assert.equal(c.inventory.primary,53);assert.equal(c.inventory.secondary,23);
 assert.deepEqual(c.inventory.primaryDirections,{strong:26,weak:27});assert.equal(c.inventory.pattern,81);
 assert.equal(c.inventory.patternFormationLabels,0);assert.equal(c.inventory.patternAssistantLabels,0);
 assert.equal(c.inventory.exactChartOverlap.length,34);assert.equal(c.independentGoldCases,0);
});
test('normalized duplicate charts cannot inflate a retrospective cohort',()=>{
 const a=audit.entries[0],p=cohort().rows[0].pillars;
 assert.throws(()=>buildReferenceCoverageCohort({...audit,entries:[a,{...a,id:'duplicate',pillars:p}]},patterns),/strength-reference/);
});
test('source direction expressivity is not actual prediction accuracy',()=>{
 const c=cohort(),r=summarizeReferenceCoverage(c,c.rows.map(({id})=>({id,basis,synthesis:{status:'diagnostic',strongPossible:true,weakPossible:true}})));
 assert.equal(r.primary.expressible,53);assert.equal(r.actualAccuracy,null);assert.equal(r.independentGoldCases,0);
 const b=summarizeReferenceCoverage(c,c.rows.map(({id})=>({id,basis})));
 assert.equal(b.primary.unevaluatedPossibility,53);assert.equal(b.primary.notExpressible,0);
 const u=summarizeReferenceCoverage(c,c.rows.map(({id})=>({id,basis,synthesis:{status:'unavailable',strongPossible:null,weakPossible:null}})));
 assert.equal(u.primary.unevaluatedPossibility,53);
 assert.throws(()=>summarizeReferenceCoverage(c,[]),/observation-coverage/);
});
test('model reader distinguishes strict support from conflict and rejects authority promotion',()=>{
 const row={targetId:'day:stem',actualStrengthState:'unresolved',strongPropositionId:'s',weakPropositionId:'w',analysis:{status:'diagnostic',targets:[{id:'s',possibleStates:['unresolved','conflicting']},{id:'w',possibleStates:['supported','unresolved']}]}};
 const s={status:'diagnostic',completeHour:true,selectionAuthority:false,effective:null,actualStrengthState:'unresolved',summary:{actualEffectsConfirmed:0},rows:[row]};
 assert.deepEqual(observeSynthesisCoverage(s),{status:'diagnostic',strongPossible:false,weakPossible:true});
 assert.throws(()=>observeSynthesisCoverage({...s,actualStrengthState:'strong'}),/synthesis-contract/);
 assert.deepEqual(observeSynthesisCoverage({...s,rows:[{...row,analysis:{status:'unavailable'}}]}),{status:'unavailable',strongPossible:null,weakPossible:null});
});
test('invalid execution remains separate from representability',()=>{
 const c=cohort(),id=c.rows.find(r=>r.cohort==='primary').id;
 const r=summarizeReferenceCoverage(c,c.rows.map(o=>o.id===id?{id,error:'rootContext: invalid'}:{id:o.id,basis}));
 assert.equal(r.invalid,1);assert.equal(r.primary.evaluated,52);assert.equal(r.primary.unevaluatedPossibility,52);
});
test('day basis requires a unique natal subject and abstaining root review',()=>{
 const actor={id:'visible:day',dayReference:true,layer:'visible',controlReceived:[{local:true}],outputAndControl:[]};
 const prior={completeHour:true,stemForce:{occurrences:[actor]}};
 const root={status:'diagnostic',completeHour:true,selectionAuthority:false,rootEffectConfirmed:null,occurrences:[{id:actor.id,uncontestedRootIds:['r'],contestedRootIds:[],seasonal:{seasonSupport:false,principalSupport:false}}]};
 assert.deepEqual(observeReferenceBasis(prior,root),basis);
 assert.throws(()=>observeReferenceBasis(prior,{...root,rootEffectConfirmed:true}),/day-basis-contract/);
 assert.throws(()=>observeReferenceBasis({...prior,completeHour:false},root),/day-basis-contract/);
});

test('audit records match all six original fixture populations without silent omission',()=>{
 const fixtures=strengthAuditFixtureNames.map(name=>({name,cases:read(name).cases}));
 assert.deepEqual(verifyStrengthAuditInventory(fixtures,audit),{directional:76,fixtures:6});
 assert.throws(()=>verifyStrengthAuditInventory(fixtures,{...audit,entries:audit.entries.slice(1)}),/missing-audit-record/);
 const a=audit.entries[0];
 assert.throws(()=>verifyStrengthAuditInventory(fixtures,{...audit,entries:[{...a,reference:a.reference==='strong'?'weak':'strong'},...audit.entries.slice(1)]}),/stale-audit/);
 assert.throws(()=>verifyStrengthAuditInventory(fixtures.slice(1),audit),/audit-inventory/);
});

test('literal burden candidates and rooted operations are not equivalent',()=>{
 const row={targetId:'day:stem',actualStrengthState:'unresolved',strongPropositionId:'s',weakPropositionId:'w',direct:'d',support:'r',control:'c',drain:'g',expenditure:'e',analysis:{status:'diagnostic',targets:[{id:'s',possibleStates:['unresolved']},{id:'w',possibleStates:['unresolved']}]}};
 const s={status:'diagnostic',completeHour:true,selectionAuthority:false,effective:null,actualStrengthState:'unresolved',summary:{actualEffectsConfirmed:0},rows:[row],packet:{rules:[]}};
 const action={id:'a',from:'day:stem',to:'other',kind:'generate',actualOperationState:'unresolved',propositionId:'a-proof'};
 const b={status:'diagnostic',completeHour:true,selectionAuthority:false,effective:null,actualMagnitudeComparison:'unresolved',analysis:{status:'diagnostic',selectionAuthority:false,actualMagnitudeComparison:'unresolved',actionRows:[action],rows:[{targetId:'day:stem',supportPropositionId:'r',groups:[{kind:'incoming-control',propositionId:'c',actionIds:[]},{kind:'outgoing-generation',propositionId:'g',actionIds:['a']},{kind:'outgoing-control',propositionId:'e',actionIds:[]}]}],frontier:{status:'diagnostic',frontiers:['r','c','g','e','a-proof'].map(id=>({id,terms:[]}))}}};
 const result=observeBurdenObligations(b,s);
 assert.deepEqual(result.obligations,['direct-root-required-by-strong-alternative','outgoing-generation-rooted-source-gate']);
 assert.equal(result.groups[1].state,'literal-without-rooted-basis');assert.equal(result.supportBasisPossible,false);
 assert.equal(result.actualMagnitudeComparison,'unresolved');
 const altered={...b,analysis:{...b.analysis,frontier:{...b.analysis.frontier,frontiers:b.analysis.frontier.frontiers.map(f=>f.id==='g'?{...f,terms:[['fake']]}:f)}}};
 assert.throws(()=>observeBurdenObligations(altered,s),/burden-frontier-parity/);
});
test('direction class partitions evaluated references and leaves unknown distinct',()=>{
 const c=cohort(),types=[[true,true],[true,false],[false,true],[false,false]],primary=c.rows.filter(r=>r.cohort==='primary');
 const ids=new Map(primary.slice(0,4).map((r,i)=>[r.id,i]));
 const obs=c.rows.map(r=>({id:r.id,basis,...(ids.has(r.id)?{synthesis:{status:'diagnostic',strongPossible:types[ids.get(r.id)][0],weakPossible:types[ids.get(r.id)][1]}}:{})}));
 const q=summarizeReferenceCoverage(c,obs);
 assert.deepEqual(q.primary.directionDistribution,{'both-directions':1,'strong-only':1,'weak-only':1,'neither-direction':1,unevaluated:49});
 assert.equal(q.actualAccuracy,null);
 assert.throws(()=>summarizeReferenceCoverage(c,obs.map((r,i)=>i===0?{...r,synthesis:{status:'diagnostic',strongPossible:true,weakPossible:null}}:r)),/possibility-contract/);
});
