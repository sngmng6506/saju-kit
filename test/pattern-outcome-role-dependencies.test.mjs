import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {observeRoleDependencies} from '../src/features/pattern/outcome-role-dependencies.js';
import {summarizeRoleDependencyReview} from '../scripts/lib/pattern-outcome-role-policy-triage.mjs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const abstain={necessityConfirmed:null,excessConfirmed:null,deficiencyConfirmed:null,preservationConfirmed:null,effective:null};
const fixture=(complete=true)=>{
 const status=complete?'diagnostic':'partial',day='visible:day',resource='visible:month',output='visible:year',candidateId='r';
 const mkActor=(id,roots=[],contested=[])=>({id,layer:'visible',directRoot:{uncontestedRootIds:roots,contestedRootIds:contested,preservationConfirmed:null},paths:[],groundedPathIds:[],effectiveSupply:null});
 const a=mkActor(resource,['hidden:month:을']),b=mkActor(output,[],['hidden:month:을']),d=mkActor(day);
 const donor={nodeId:'day:branch:water',groundedRootIds:['hidden:month:을'],contestedRootIds:[],independentSupplyConfirmed:null};
 for(const actor of [a,d]){
  const id=JSON.stringify([donor.nodeId,actor.id]);actor.paths=[{id,recipientId:actor.id,upstream:'observed',donor,effectiveSupply:null}];actor.groundedPathIds=[id];
 }
 const edge=(from,to,kind)=>({edgeId:from+'>'+to,from,to,kind,sourceBasis:'direct-root-observed',generationScreen:'unresolved',controlComparison:null,effective:null,selectionAuthority:false});
 const delivery=edge(resource,day,'generate'),drain=edge(day,output,'generate');
 const supply={status,selectionAuthority:false,effectiveSupply:null,occurrences:[a,b,d],actions:[delivery,drain]};
 const make=(id)=>({id,collection:'resource-output',objectiveId:id,roles:{day,resource,output},conditionalStatus:'unresolved',selected:false,actualDemand:null,effectConfirmed:null});
 const demand={candidateId,status,selectionAuthority:false,actualDemand:null,effectConfirmed:null,objectives:[make('a'),make('b')]};
 const ctx=o=>({objectiveRef:o.id,sourceConditionalStatus:o.conditionalStatus,dayId:day,contextState:complete?'source-context-observed':'partial',...abstain});
 const projection=contexts=>({candidateId,status,selectionAuthority:false,contexts,...abstain});
 const projections={resource:projection(demand.objectives.map(o=>({...ctx(o),resourceId:resource,delivery,outputDrain:drain,wealthControl:null,officerSupply:null}))),
 output:projection([ {...ctx(demand.objectives[0]),outputId:output,drain,resourceDelivery:delivery,control:null,resourcePressure:null,killingPressure:null,wealthControl:null,wealthKillingFeed:null} ]),
 officer:projection([])};
 return {demand,projections,supply,complete,delivery,drain};
};
const run=x=>observeRoleDependencies(x.demand,x.projections,x.supply,x.complete);
test('same literal action shared across objectives and projections remains one identity',()=>{
 const x=fixture(),r=run(x);assert.equal(r.status,'diagnostic');
 assert.equal(r.objectives.length,2);assert.equal(r.sharedActions.length,2);
 for(const e of r.sharedActions){assert.deepEqual(e.objectiveRefs,['a','b']);assert.deepEqual(e.projections,['output','resource']);assert.equal(e.uses.length,3);assert.equal(e.netEffectConfirmed,null);}
 assert.equal(r.objectives[0].projections.length,2);
});
test('one objective repeated in two projections is not two independent objectives',()=>{
 const x=fixture();x.demand.objectives.pop();x.projections.resource.contexts.pop();
 const r=run(x);assert.equal(r.status,'diagnostic');
 assert.ok(r.sharedActions.every(e=>e.interpretation==='repeated-projection-of-one-objective'&&e.objectiveRefs.length===1));
});
test('shared contested roots and donor IDs are not additive quantities',()=>{
 const r=run(fixture());assert.equal(r.sharedRoots.length,1);assert.equal(r.sharedDonors.length,1);
 assert.ok(r.sharedRoots[0].uses.some(u=>u.basis==='direct-contested'));
 assert.ok(r.sharedRoots[0].uses.some(u=>u.basis==='donor-uncontested'));
 assert.equal(r.sharedRoots[0].independentSupplyConfirmed,null);assert.equal(r.sharedDonors[0].independentSupplyConfirmed,null);
});
test('foreign edge, duplicate projection and promoted effect fail closed',()=>{
 let x=fixture();x.projections.output.contexts[0].drain={...x.drain,to:'visible:month'};assert.equal(run(x).status,'invalid-evidence');
 x=fixture();x.projections.output.contexts[0].drain=x.delivery;assert.equal(run(x).status,'invalid-evidence');
 x=fixture();x.projections.output.contexts.push(x.projections.output.contexts[0]);assert.equal(run(x).status,'invalid-evidence');
 x=fixture();x.projections.resource.contexts[0].effective=true;assert.equal(run(x).status,'invalid-evidence');
 x=fixture();x.projections.resource.contexts[0].sourceConditionalStatus='supported';assert.equal(run(x).status,'invalid-evidence');
});
test('partial and out-of-scope reviews retain no decision authority',()=>{
 const x=fixture(false),r=run(x);assert.equal(r.status,'partial');assert.equal(r.netEffectConfirmed,null);
 x.demand.status='out-of-scope';x.demand.objectives=[];for(const p of Object.values(x.projections)){p.status='out-of-scope';p.contexts=[];}
 assert.equal(run(x).status,'out-of-scope');
 x.projections.resource.contexts=[{}];assert.equal(run(x).status,'invalid-evidence');
});
test('audit detects missing shared action and forged root provenance',()=>{
 const x=fixture(),d=run(x),m={groundedSupply:x.supply,candidates:[{candidateId:x.demand.candidateId,rolePriority:{demandReview:x.demand,
  resourceDemandConditions:x.projections.resource,outputDemandConditions:x.projections.output,officerDemandConditions:x.projections.officer,dependencyReview:d}}]};
 const audit=()=>summarizeRoleDependencyReview({id:'fixture'},m,false);
 assert.deepEqual(audit().errors,[]);
 d.sharedActions.pop();assert.ok(audit().errors.includes('role-dependency-replay:r'));
 d.sharedRoots[0].uses[0].actorId='foreign';assert.ok(audit().errors.includes('role-dependency-replay:r'));
});
test('composer imports every called role supply and demand function',()=>{
 const source=readFileSync(new URL('../src/features/pattern/outcome-efficacy-review.js',import.meta.url),'utf8');
 const imports=new Set([...source.matchAll(/import\s*\{([^}]+)\}\s*from/g)].flatMap(m=>m[1].split(',').map(s=>s.trim())));
 for(const name of ['observeResourceSupplyContext','assessResourceDemandConditions','observeOutputSupplyContext','assessOutputDemandConditions','observeOfficerSupplyContext','assessOfficerDemandConditions','observeRoleDependencies']){
  assert.ok(imports.has(name),'missing import: '+name);assert.ok(source.includes(name+'('),'missing call: '+name);
 }
});
test('native V10 source packet dependency coverage and abstention',()=>{
 const packet=JSON.parse(readFileSync(new URL('./fixtures/pattern-outcome-role-policy-source-v1.json',import.meta.url),'utf8'));let variants=0;
 for(const c of packet.cases)for(const complete of [true,false]){
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  assert.notEqual(r.efficacyReview.status,'invalid-evidence',c.id);assert.equal(r.decisionReview.status,'abstained',c.id);
  assert.deepEqual(summarizeRoleDependencyReview(c,r.efficacyReview.mechanismReview,!complete).errors,[],c.id);variants++;
 }
 assert.equal(variants,24);
});
