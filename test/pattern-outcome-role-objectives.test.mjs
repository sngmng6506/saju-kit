import test from 'node:test';
import assert from 'node:assert/strict';
import {assessRoleObjectives} from '../src/features/pattern/outcome-role-priority.js';
const a='visible:year',b='visible:month',c='visible:hour',day='visible:day';
const edge=(from,to,kind,status='supported')=>({from,to,kind,status,id:JSON.stringify([from,to,kind]),conditions:[],effective:null});
const sample=(family='resource')=>{
 const resource=family==='resource'?b:a,output=b,killing=c;
 const actors=[{id:a,position:'year',layer:'visible',tenGod:family==='resource'?'정재':'편인'},
 {id:b,position:'month',layer:'visible',tenGod:family==='resource'?'정인':'식신'},
 {id:c,position:'hour',layer:'visible',tenGod:'편관'},{id:day,position:'day',layer:'visible',dayReference:true}];
 const damage=family==='resource'?{id:'resource-wealth',kind:'damage',witnesses:[{id:'d',roles:{obstacle:a,target:b},edges:[edge(a,b,'control')]}]}:
 {id:'killing-resource-blocks-food',kind:'damage',witnesses:[{id:'d',roles:{obstacle:resource,food:output,target:killing},edges:[edge(resource,output,'control'),edge(output,killing,'control')]}]};
 const support=family==='resource'?{id:'resource-wealth-regulation',kind:'support',witnesses:[{id:'r',roles:{helper:a,target:b,day},edges:[edge(a,b,'control'),edge(b,day,'generate')]}]}:
 {id:'killing-food',kind:'support',witnesses:[{id:'r',roles:{helper:b,target:c,day},edges:[edge(b,c,'control'),edge(c,day,'control'),edge(day,b,'generate')]}]};
 const rules=[damage,support],review={candidateId:'c',status:'diagnostic',family,rules};
 const edges=[...new Map(rules.flatMap(r=>r.witnesses.flatMap(w=>w.edges)).map(e=>[e.id,e])).values()];
 const pair=family==='resource'?[a,b]:[b,c],relation='left-evidence-dominates';
 const capacity={status:'diagnostic',occurrences:actors},comparisons={status:'diagnostic',pairs:[{left:pair[0],right:pair[1],comparison:{relation},cautions:[]}]};
 const root={status:'diagnostic',occurrences:actors.map(a=>({id:a.id,rootAxes:{anySubstantial:true},uncontestedRootIds:['root:'+a.id],contestedRootIds:[]})),
 comparisons:[{left:pair[0],right:pair[1],sensitivity:{relation}}]};
 const command={status:'unresolved'},mechanism={status:'diagnostic',edges,routes:rules.map(r=>({ruleId:r.id,witnessId:r.witnesses[0].id}))};
 return {review,prior:{completeHour:true},capacity,comparisons,mechanism,strength:{direction:'weak'},root,command};
};
const run=x=>assessRoleObjectives(x.review,x.prior,x.capacity,x.comparisons,x.mechanism,x.strength,x.root,x.command);
test('weak day plus supported directed and relative premises supports only the conditional injury hypothesis',()=>{
 const x=sample(),before=JSON.stringify(x),r=run(x);
 assert.equal(r.objectives[0].conditionalStatus,'supported');assert.equal(r.objectives[1].conditionalStatus,'opposed');
 assert.equal(r.objectives[0].actualDemand,null);assert.equal(r.effectConfirmed,null);assert.equal(JSON.stringify(x),before);
});
test('strong day with roots is insufficient for resource excess or preservation',()=>{
 const x=sample();x.strength.direction='strong';const r=run(x);
 assert.equal(r.objectives[0].conditionalStatus,'opposed');assert.equal(r.objectives[1].conditionalStatus,'unresolved');
 assert.equal(r.objectives[1].excessConfirmed,null);
 x.root.occurrences[1].rootAxes.anySubstantial=false;
 assert.equal(run(x).objectives[1].premises.find(p=>p.id==='resource-root-access').state,'unresolved');
});
test('hidden resource remains an access hypothesis even when rooted',()=>{
 const x=sample();x.capacity.occurrences[1].layer='hidden';x.strength.direction='strong';
 assert.equal(run(x).objectives[1].premises.find(p=>p.id==='resource-root-access').state,'unresolved');
});
test('context reversal and missing hour suppress directional support',()=>{
 const x=sample();x.root.comparisons[0].sensitivity.relation='unresolved';
 assert.equal(run(x).objectives[0].conditionalStatus,'unresolved');
 x.root.comparisons[0].sensitivity.relation='left-evidence-dominates';x.prior.completeHour=false;
 assert.ok(run(x).objectives.every(o=>o.conditionalStatus==='unresolved'));
});
test('K02 distinguishes exact food from hurting officer and keeps the day burden unresolved',()=>{
 const x=sample('killing'),r=run(x);
 assert.equal(r.objectives[0].conditionalStatus,'opposed');assert.equal(r.objectives[1].conditionalStatus,'unresolved');
 assert.equal(r.objectives[1].premises[0].state,'supported');
 x.capacity.occurrences[1].tenGod='상관';assert.deepEqual(run(x).objectives,[]);
});
test('duplicate evidence, missing mandatory edge and same physical slot fail closed',()=>{
 const x=sample();x.mechanism.edges.push(x.mechanism.edges[0]);assert.equal(run(x).status,'invalid-evidence');
 x.mechanism.edges.pop();x.mechanism.edges.shift();assert.equal(run(x).status,'invalid-evidence');
 const y=sample();y.capacity.occurrences[1].position='year';assert.equal(run(y).status,'invalid-evidence');
});
test('control hypothesis and role demand are separate; missing commander versus disagreement',()=>{
 const x=sample();x.mechanism.edges[0].status='opposed';
 assert.equal(run(x).objectives[0].conditionalStatus,'opposed');
 x.mechanism.edges[0].status='supported';x.command={status:'diagnostic',variants:[{id:'s'}],comparisonCoverage:[{left:a,right:b,status:'available-hypotheses-agree',expectedCount:1,availableCount:1,hypotheses:[{id:'s',relation:'right-evidence-dominates'}]}]};
 assert.equal(run(x).objectives[0].conditionalStatus,'unresolved');
});
