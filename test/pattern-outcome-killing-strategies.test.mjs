import test from 'node:test';
import assert from 'node:assert/strict';
import {assessKillingStrategies} from '../src/features/pattern/outcome-role-priority.js';
const k='visible:month',i='visible:year',f='visible:hour',d='visible:day';
const edge=(from,to,kind)=>({from,to,kind,id:from+'>'+to});
const sample=()=>{
 const actors=[{id:k,position:'month',layer:'visible',tenGod:'편관'},{id:i,position:'year',layer:'visible',tenGod:'정인'},
 {id:f,position:'hour',layer:'visible',tenGod:'식신'},{id:d,position:'day',layer:'visible',dayReference:true,stem:'갑'}];
 const foodEdges=[edge(f,k,'control'),edge(k,d,'control'),edge(d,f,'generate')];
 const mediationEdges=[edge(k,i,'generate'),edge(i,d,'generate'),foodEdges[1]];
 const raw=[...new Map([...foodEdges,...mediationEdges,edge(i,f,'control')].map(e=>[e.id,e])).values()];
 const assess=e=>({from:e.from,to:e.to,kind:e.kind,status:'supported',conditions:[],effective:null});
 const review={candidateId:'x',family:'killing',status:'diagnostic',anchorIds:[k],rules:[{id:'killing-food',kind:'support',witnesses:[{id:'s',roles:{helper:f,target:k,day:d},edges:foodEdges}]}]};
 const flow={status:'diagnostic',routes:[{ruleId:'killing-food',witnessId:'s'}],mediationContexts:[{id:JSON.stringify([k,i,d]),killingId:k,resourceId:i,dayId:d,edges:mediationEdges.map(e=>({...e,edgeId:e.id}))}]};
 const mechanism={status:'diagnostic',edges:foodEdges.map(assess),routes:[{ruleId:'killing-food',witnessId:'s',status:'supported',effective:null,conditions:[]}]};
 return {review,prior:{completeHour:true,stemForce:{occurrences:actors},relativeForce:{edges:raw}},capacity:{status:'diagnostic',occurrences:actors},flow,mechanism,strength:{direction:'weak'},assess};
};
const run=x=>assessKillingStrategies(x.review,x.prior,x.capacity,x.flow,x.mechanism,x.strength,x.assess);
test('weak yang food burden versus mediation motive preserves interference',()=>{
 const x=sample(),before=JSON.stringify(x),r=run(x);
 assert.equal(r.food[0].conditionalStatus,'opposed');assert.equal(r.mediation[0].weakDayConditionalStatus,'supported');
 assert.equal(r.comparisons[0].simultaneousStatus,'interference-review');assert.equal(r.comparisons[0].preferenceHypothesis,'review-mediation-first');
 assert.equal(r.preferredStrategy,null);assert.equal(r.effectConfirmed,null);assert.equal(JSON.stringify(x),before);
});
test('weak yin is not blanket opposed; strong day is not mandatory for all mediation',()=>{
 const x=sample();x.capacity.occurrences.find(o=>o.id===d).stem='을';
 assert.equal(run(x).food[0].conditionalStatus,'unresolved');
 x.strength.direction='strong';const r=run(x);
 assert.equal(r.food[0].conditionalStatus,'supported');assert.equal(r.mediation[0].conditionalStatus,'supported');
 assert.equal(r.mediation[0].weakDayConditionalStatus,'opposed');assert.equal(r.comparisons[0].preferenceHypothesis,null);
});
test('mediation without food witness is independently assessed, not synthetic support',()=>{
 const x=sample();x.review.rules=[];x.flow.routes=[];x.mechanism.edges=[];x.mechanism.routes=[];
 const r=run(x);assert.equal(r.food.length,0);assert.equal(r.mediation.length,1);assert.deepEqual(r.comparisons,[]);
 assert.equal(r.mediation[0].effectConfirmed,null);
});
test('hidden resource cannot impersonate visible path, duplicate and foreign identities fail',()=>{
 const x=sample();x.capacity.occurrences.find(o=>o.id===i).layer='hidden';assert.equal(run(x).status,'invalid-evidence');
 const y=sample();y.flow.mediationContexts.push(y.flow.mediationContexts[0]);assert.equal(run(y).status,'invalid-evidence');
 const z=sample();z.flow.mediationContexts[0].edges[0].edgeId='foreign';assert.equal(run(z).status,'invalid-evidence');
});
test('missing hour suppresses direction and edge hypotheses',()=>{
 const x=sample();x.prior.completeHour=false;
 const r=run(x);assert.equal(r.status,'partial');assert.equal(r.food[0].conditionalStatus,'unresolved');
 assert.equal(r.mediation[0].weakDayConditionalStatus,'unresolved');assert.equal(r.comparisons[0].preferenceHypothesis,null);
});
test('edge evaluator disagrees with existing registry and missing path fail closed',()=>{
 const x=sample();x.mechanism.edges[0].status='opposed';assert.equal(run(x).status,'invalid-evidence');
 const y=sample();y.prior.relativeForce.edges=y.prior.relativeForce.edges.filter(e=>e.from!==i||e.to!==d);
 assert.equal(run(y).status,'invalid-evidence');
});
test('wealth contacts preserve both resource injury and killing supply as unresolved',()=>{
 const x=sample(),w={id:'hidden:hour:무',position:'hour',layer:'visible',tenGod:'편재'};
 x.capacity.occurrences.push(w);x.prior.relativeForce.edges.push(edge(w.id,i,'control'),edge(w.id,k,'generate'));
 const r=run(x),p=r.mediation[0].premises.find(p=>p.id==='resource-preservation');
 assert.equal(p.state,'unresolved');assert.equal(p.evidence.wealthContacts[0].resourceControl.kind,'control');
 assert.equal(p.evidence.wealthContacts[0].killingSupply.kind,'generate');assert.equal(r.mediation[0].conditionalStatus,'unresolved');
});
