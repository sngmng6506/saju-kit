import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeRoleDemandReview} from '../scripts/lib/pattern-outcome-role-policy-triage.mjs';
import {observeRoleDemand} from '../src/features/pattern/outcome-role-demand.js';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const fixture=(complete=true)=>{
 const status=complete?'diagnostic':'partial',c='resource-candidate';
 const actors=[{id:'visible:day',layer:'visible',dayReference:true,tenGod:'비견'},{id:'visible:month',layer:'visible',tenGod:'정인'},{id:'visible:year',layer:'visible',tenGod:'정재'},...(complete?[{id:'visible:hour',layer:'visible',tenGod:'편인'}]:[])];
 const route={ruleId:'resource-wealth',witnessId:'w'};
 const review={candidateId:c,family:'resource',status:'diagnostic',rules:[{id:route.ruleId,witnesses:[{id:route.witnessId,roles:{target:'visible:month',obstacle:'visible:year'}}]}]};
 const policy=()=>({candidateId:c,status,selectionAuthority:false});
 const objective={clause:'R02',objective:'required-resource-injury',route,relatedRoutes:[],premises:[{id:'resource-required',state:'unresolved'}],conditionalStatus:'unresolved',actualDemand:null,effectConfirmed:null,unresolvedRequirements:['resource-light-not-proven','rescue-and-independent-supply-unresolved']};
 const policies={objectiveReview:{...policy(),objectives:[objective]},killingStrategies:{...policy(),food:[],mediation:[]},killingWealth:{...policy(),supply:[],dualRoles:[],mediationContacts:[]},resourceStrategies:{...policy(),outputDrain:[],killingSupply:[],officerContext:[]}};
 const capacity={status,selectionAuthority:false,occurrences:actors};
 const groundedSupply={status,selectionAuthority:false,effectiveSupply:null,occurrences:actors.map(a=>({id:a.id,layer:a.layer,directRoot:{state:true},groundedPathIds:[],screenedPathIds:[],effectiveSupply:null})),actions:[]};
 const interposition={roleNeutral:{status,selectionAuthority:false,roleDemandConfirmed:null,effectConfirmed:null,targetScope:'all-visible-stems',pressureContexts:actors.map(a=>({targetId:a.id,targetNodeId:a.id.slice(8)+':stem',targetScope:'in-scope',controllers:[],effective:null,allPressureResolved:null})),paths:[]}};
 return {review,capacity,groundedSupply,interposition,policies,complete};
};
const run=x=>observeRoleDemand(x.review,x.capacity,x.groundedSupply,x.interposition,x.policies,x.complete);
test('source requirement binds only the exact resource occurrence, not another resource or a role total',()=>{
 const x=fixture(),r=run(x);assert.equal(r.status,'diagnostic');
 assert.equal(r.objectives.length,1);assert.equal(r.objectives[0].obligations.length,3);
 assert.ok(r.objectives[0].obligations.every(o=>o.actorId==='visible:month'&&o.actualDemand===null&&o.deficiencyConfirmed===null));
 assert.deepEqual(r.actorEvidence.map(a=>a.id),['visible:month']);
 assert.equal(r.actualDemand,null);
});
test('unbound alternative role stays unbound and never borrows another actor',()=>{
 const x=fixture();x.policies.objectiveReview.objectives[0].premises.push({id:'output-required',state:'unresolved'});
 const r=run(x),o=r.objectives[0].obligations.find(o=>o.label==='output-required');
 assert.equal(o.actorId,null);assert.equal(o.evidenceStatus,'unbound-role-review');
});
test('different interpretations retain separate source requirements without choosing a winner',()=>{
 const x=fixture(),o=x.policies.objectiveReview.objectives[0];
 x.policies.objectiveReview.objectives.push({...o,objective:'excess-resource-moderation',premises:[{id:'resource-abundance',state:'unresolved'}],unresolvedRequirements:['resource-excess-not-proven']});
 const r=run(x);assert.equal(r.objectives.length,2);assert.ok(r.objectives.every(o=>o.selected===false&&o.actualDemand===null));
 assert.equal(r.objectives[1].obligations[0].axis,'excess');
});
test('foreign witness, wrong role and upstream authority fail closed',()=>{
 let x=fixture();x.policies.objectiveReview.objectives[0].route.witnessId='foreign';assert.equal(run(x).status,'invalid-evidence');
 x=fixture();x.review.rules[0].witnesses[0].roles.target='visible:year';assert.equal(run(x).status,'invalid-evidence');
 x=fixture();x.interposition.roleNeutral.roleDemandConfirmed=true;assert.equal(run(x).status,'invalid-evidence');
});
test('partial source requirement remains diagnostic context only, and unknown requirement is explicit',()=>{
 const x=fixture(false);x.policies.objectiveReview.objectives[0].unresolvedRequirements.push('future-clause');
 const r=run(x);assert.equal(r.status,'partial');assert.equal(r.unmappedRequirements[0].label,'future-clause');
 assert.ok(r.objectives[0].obligations.every(o=>o.actualDemand===null));
});
test('native V10 source objectives compose demand review without authority',()=>{
 for(const ps of [['무술','갑자','정미','경술'],['무술','을묘','병오','을해']])for(const complete of [true,false]){
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
  const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
  assert.notEqual(r.efficacyReview.status,'invalid-evidence');assert.equal(r.decisionReview.status,'abstained');
  for(const c of r.efficacyReview.mechanismReview.candidates){const d=c.rolePriority.demandReview;
   assert.ok(['diagnostic','partial','out-of-scope'].includes(d.status));assert.equal(d.actualDemand,null);assert.equal(d.selectionAuthority,false);}
 }
});

test('audit detects dropped objectives and cross-occurrence requirement substitution',()=>{
 const x=fixture(),r=run(x);
 const mechanism={candidates:[{candidateId:x.review.candidateId,rolePriority:{...x.policies,demandReview:r}}]};
 const audit=()=>summarizeRoleDemandReview({id:'fixture'},mechanism,false);
 assert.deepEqual(audit().errors,[]);assert.equal(audit().counts.obligations,3);
 const q=r.objectives[0].obligations[0];q.actorId='visible:hour';
 assert.ok(audit().errors.some(e=>e.startsWith('demand-obligation-contract:')));
 q.actorId='visible:month';r.objectives=[];
 assert.ok(audit().errors.some(e=>e.startsWith('demand-objective-coverage:')));
});
