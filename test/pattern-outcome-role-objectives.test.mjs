import test from 'node:test';
import assert from 'node:assert/strict';
import {assessRoleObjectives,assessResourceStrategies} from '../src/features/pattern/outcome-role-priority.js';
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


const resourceSample=()=>{
 const i='visible:month',d='visible:day',o='visible:year',h='visible:hour',j='hidden:month:을';
 const actors=[{id:i,position:'month',layer:'visible',tenGod:'정인'},{id:d,position:'day',layer:'visible',dayReference:true},
  {id:o,position:'year',layer:'visible',tenGod:'식신'},{id:h,position:'hour',layer:'visible',tenGod:'편관'},{id:j,position:'month',layer:'hidden',tenGod:'정인'}];
 const rawEdge=(from,to,kind)=>({from,to,kind,id:from+'>'+to,edgeId:from+'>'+to,effective:null});
 const raw=[rawEdge(d,o,'generate'),rawEdge(i,d,'generate'),rawEdge(j,d,'generate'),rawEdge(i,o,'control'),rawEdge(h,i,'generate'),rawEdge(h,d,'control')];
 const rules=[{id:'resource-output-regulation',kind:'support',witnesses:[{id:'out',roles:{helper:o,target:d},edges:[raw[0]],
  anchorBindings:[{anchorId:i,edge:raw[1],effective:null},{anchorId:j,edge:raw[2],effective:null}]}]},
  {id:'resource-killing',kind:'support',witnesses:[{id:'kill',roles:{helper:h,target:i},edges:[raw[4]]}]}];
 const assess=e=>({from:e.from,to:e.to,kind:e.kind,status:e.from===j?'unresolved':'supported',conditions:[],effective:null});
 const review={candidateId:'res',family:'resource',status:'diagnostic',anchorIds:[i,j],rules};
 const mechanism={status:'diagnostic',edges:[raw[0],raw[1],raw[2],raw[4]].map(assess),
  routes:rules.map(r=>({ruleId:r.id,witnessId:r.witnesses[0].id,status:'supported',effective:null}))};
 const root={status:'diagnostic',occurrences:actors.map(a=>({id:a.id,rootAxes:{anySubstantial:true},uncontestedRootIds:['root:'+a.id],contestedRootIds:[]}))};
 return {i,d,o,h,j,review,mechanism,prior:{completeHour:true,stemForce:{occurrences:actors},relativeForce:{edges:raw}},
  capacity:{status:'diagnostic',occurrences:actors},root,strength:{direction:'strong'},assess};
};
const runResource=x=>assessResourceStrategies(x.review,x.prior,x.capacity,x.mechanism,x.strength,x.root,x.assess);
test('R01 exact anchor alternatives cannot borrow visible rooted support; strong day does not establish abundance',()=>{
 const x=resourceSample(),before=JSON.stringify(x),r=runResource(x);
 assert.equal(r.status,'diagnostic');assert.equal(r.outputDrain.length,2);
 const [v,h]=r.outputDrain;assert.equal(v.pathConditionalStatus,'supported');assert.equal(h.pathConditionalStatus,'unresolved');
 assert.equal(v.objectives[0].conditionalStatus,'unresolved');assert.equal(v.objectives[0].excessConfirmed,null);
 assert.equal(v.contacts.length,1);assert.equal(v.contacts[0].obstructionConfirmed,null);
 assert.equal(r.preferredObjective,null);assert.equal(JSON.stringify(x),before);
});
test('R01 weak day is not a proven excessive-output burden; missing hour suppresses directional premises',()=>{
 const x=resourceSample();x.strength.direction='weak';let r=runResource(x);
 assert.equal(r.outputDrain[0].objectives[0].conditionalStatus,'opposed');assert.equal(r.outputDrain[0].objectives[1].conditionalStatus,'unresolved');
 x.prior.completeHour=false;r=runResource(x);assert.equal(r.status,'partial');
 assert.ok(r.outputDrain.every(a=>a.objectives.every(o=>o.conditionalStatus==='unresolved')));
});
test('R03 original weak-day-heavy-resource case is scope review not ordinary confirmed use',()=>{
 const x=resourceSample();x.strength.direction='weak';const r=runResource(x),k=r.killingSupply[0];
 assert.equal(k.pathConditionalStatus,'supported');assert.equal(k.dayPressure.kind,'control');
 assert.equal(k.objectives[0].conditionalStatus,'opposed');assert.equal(k.objectives[1].scope,'original-scope-review');
 assert.equal(k.objectives[1].conditionalStatus,'unresolved');assert.equal(k.commentary.scopeResolved,null);
});
test('R03 strong day cannot infer resource deficiency or both-heavy harm',()=>{
 const x=resourceSample(),r=runResource(x),k=r.killingSupply[0];
 assert.equal(k.objectives[0].conditionalStatus,'unresolved');assert.equal(k.objectives[2].conditionalStatus,'unresolved');
 assert.ok(k.objectives.every(o=>o.actualDemand===null&&o.deficiencyConfirmed===null&&o.effectConfirmed===null));
});
test('officer and killing contexts are distinct; no shortage rule for literal officer',()=>{
 const x=resourceSample();x.capacity.occurrences.find(a=>a.id===x.h).tenGod='정관';
 x.review.rules[1].id='resource-officer';x.mechanism.routes[1].ruleId='resource-officer';
 const r=runResource(x);assert.equal(r.status,'diagnostic');assert.equal(r.killingSupply.length,0);assert.equal(r.officerContext.length,1);
 assert.equal(r.officerContext[0].objectives[0].scope,'officer-distinct');
});
test('R01 duplicate anchor or foreign edge identity fails closed',()=>{
 const x=resourceSample();x.review.rules[0].witnesses[0].anchorBindings.push(x.review.rules[0].witnesses[0].anchorBindings[0]);
 assert.equal(runResource(x).status,'invalid-evidence');
 const y=resourceSample();y.review.rules[0].witnesses[0].anchorBindings[0].edge={...y.review.rules[0].witnesses[0].anchorBindings[0].edge,edgeId:'foreign'};
 assert.equal(runResource(y).status,'invalid-evidence');
});
test('R03 registry disagreement, foreign root and missing pressure fail closed',()=>{
 const x=resourceSample();x.mechanism.edges[3].status='opposed';assert.equal(runResource(x).status,'invalid-evidence');
 const y=resourceSample();y.root.occurrences[0].id='foreign';assert.equal(runResource(y).status,'invalid-evidence');
 const z=resourceSample();z.prior.relativeForce.edges.pop();assert.equal(runResource(z).status,'invalid-evidence');
});
test('R01 opposing or absent output control never certifies output preservation',()=>{
 const x=resourceSample(),old=x.assess;x.assess=e=>({...old(e),status:e.kind==='control'&&e.from===x.i?'opposed':old(e).status});
 const r=runResource(x);assert.equal(r.outputDrain[0].contacts[0].control.status,'opposed');
 assert.equal(r.outputDrain[0].objectives[0].premises.find(p=>p.id==='output-preserved').state,'unresolved');
 x.prior.relativeForce.edges=x.prior.relativeForce.edges.filter(e=>e.from!==x.i||e.to!==x.o);
 const q=runResource(x);assert.equal(q.outputDrain[0].contacts.length,0);assert.equal(q.outputDrain[0].objectives[0].conditionalStatus,'unresolved');
});
