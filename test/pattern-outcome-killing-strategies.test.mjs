import test from 'node:test';
import assert from 'node:assert/strict';
import {assessKillingStrategies,assessKillingWealth} from '../src/features/pattern/outcome-role-priority.js';
import {observeKillingWealthDualRole} from '../src/features/pattern/outcome-compound-motifs.js';
const k='visible:month',i='visible:year',f='visible:hour',d='visible:day';
const edge=(from,to,kind)=>({from,to,kind,id:from+'>'+to,edgeId:from+'>'+to});
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
 assert.equal(r.food[0].conditionalStatus,'opposed');assert.equal(r.mediation[0].weakDayConditionalStatus,'unresolved');assert.equal(r.mediation[0].transferConditionalStatus,'supported');
 assert.equal(r.comparisons[0].simultaneousStatus,'interference-review');assert.equal(r.comparisons[0].preferenceHypothesis,'review-mediation-first');
 assert.equal(r.preferredStrategy,null);assert.equal(r.effectConfirmed,null);assert.equal(JSON.stringify(x),before);
});
test('weak yin is not blanket opposed; strong day is not mandatory for all mediation',()=>{
 const x=sample();x.capacity.occurrences.find(o=>o.id===d).stem='을';
 assert.equal(run(x).food[0].conditionalStatus,'unresolved');
 x.strength.direction='strong';const r=run(x);
 assert.equal(r.food[0].conditionalStatus,'supported');assert.equal(r.mediation[0].conditionalStatus,'unresolved');assert.equal(r.mediation[0].transferConditionalStatus,'supported');
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
 const x=sample(),w={id:f,position:'hour',layer:'visible',tenGod:'편재'};
 // Replace the output with wealth: four visible stems, not five.
 x.capacity.occurrences[2]=w;
 x.review.rules=[];x.flow.routes=[];x.mechanism.edges=[];x.mechanism.routes=[];
 x.prior.relativeForce.edges=x.prior.relativeForce.edges.filter(e=>e.from!==f&&e.to!==f);
 x.prior.relativeForce.edges.push(edge(f,i,'control'),edge(f,k,'generate'));
 const r=run(x),p=r.mediation[0].premises.find(p=>p.id==='resource-preservation');
 assert.equal(p.state,'unresolved');assert.equal(p.evidence.visibleControlObserved,true);
 assert.equal(p.evidence.wealthContacts[0].resourceControl.kind,'control');
 assert.equal(p.evidence.wealthContacts[0].killingSupply.kind,'generate');assert.equal(r.mediation[0].conditionalStatus,'unresolved');
});
test('absence of visible control is not preservation; partial and opposed contact stay distinct',()=>{
 const x=sample(),r=run(x),p=r.mediation[0].premises.find(p=>p.id==='resource-preservation');
 assert.equal(p.state,'unresolved');assert.equal(p.evidence.visibleControlObserved,false);assert.equal(p.evidence.actualPreservation,null);
 const original=x.assess;x.assess=e=>({...original(e),status:e.from===i&&e.to===f?'opposed':'supported'});
 const q=run(x);assert.equal(q.comparisons[0].interferenceStatus,'contact-opposed');
 assert.notEqual(q.comparisons[0].simultaneousStatus,'interference-review');
 x.prior.completeHour=false;assert.equal(run(x).comparisons[0].simultaneousStatus,'unresolved');
});
test('wrong edge identity and duplicate visible slot fail closed',()=>{
 const x=sample();x.review.rules[0].witnesses[0].edges[0].edgeId='foreign';assert.equal(run(x).status,'invalid-evidence');
 const y=sample();y.capacity.occurrences.push({id:'foreign',position:'hour',layer:'visible',tenGod:'편재'});assert.equal(run(y).status,'invalid-evidence');
});
const zhou=()=>{
 // Zhou source topology: 戊戌 甲子 丁未 庚戌. Killing is hidden in 子.
 const f='visible:year',i='visible:month',w='visible:hour',k='hidden:month:계',d='visible:day';
 const actors=[{id:f,position:'year',layer:'visible',tenGod:'상관',stem:'무'},
  {id:i,position:'month',layer:'visible',tenGod:'정인',stem:'갑'},
  {id:w,position:'hour',layer:'visible',tenGod:'정재',stem:'경'},
  {id:k,position:'month',layer:'hidden',tenGod:'편관',stem:'계'},
  {id:d,position:'day',layer:'visible',dayReference:true,stem:'정'}];
 const t={id:'t',roles:{obstacle:i,food:f,target:k},edges:[edge(i,f,'control'),edge(f,k,'control')]};
 const r={id:'r',threatWitnessId:t.id,roles:{...t.roles,helper:w},edges:[edge(w,i,'control')]};
 const b={id:'b',roles:{obstacle:w,target:k},edges:[edge(w,k,'generate')]};
 const rules=[{id:'killing-resource-blocks-food',kind:'damage',witnesses:[t]},
  {id:'killing-wealth-removes-resource',kind:'rescue',threatRuleId:'killing-resource-blocks-food',witnesses:[r]},
  {id:'killing-wealth',kind:'damage',witnesses:[b]}];
 const review={candidateId:'z',family:'killing',status:'diagnostic',anchorIds:[k],rules};
 const raw=[...t.edges,...r.edges,...b.edges],mechanism={status:'diagnostic',edges:raw.map(e=>({...e,status:'unresolved',effective:null,conditions:[]})),
  routes:rules.map(r=>({ruleId:r.id,witnessId:r.witnesses[0].id,status:'unresolved',effective:null}))};
 return {review,prior:{completeHour:true,stemForce:{occurrences:actors},relativeForce:{edges:raw}},capacity:{status:'diagnostic',occurrences:actors},mechanism,
  compound:{motifs:observeKillingWealthDualRole(review,true),violations:[]},strategies:{candidateId:'z',status:'diagnostic',mediation:[]},strength:{direction:'strong'},
  comparisons:{status:'diagnostic',pairs:[]},root:{status:'diagnostic',comparisons:[]},command:{status:'unresolved'}};
};
const runWealth=x=>assessKillingWealth(x.review,x.prior,x.capacity,x.mechanism,x.compound,x.strategies,x.strength,x.comparisons,x.root,x.command);
test('K03 reuses exact rescue and supply; Zhou topology retains hurting-officer and hidden access',()=>{
 const x=zhou(),before=JSON.stringify(x),r=runWealth(x);
 assert.equal(r.status,'diagnostic');assert.equal(r.dualRoles.length,1);assert.equal(r.supply.length,1);
 assert.equal(r.dualRoles[0].outputTenGod,'상관');assert.equal(r.dualRoles[0].objectives.length,3);
 assert.ok(r.dualRoles[0].objectives.every(o=>o.conditionalStatus==='unresolved'&&o.actualDemand===null));
 assert.equal(r.preferredObjective,null);assert.equal(r.effectConfirmed,null);assert.equal(JSON.stringify(x),before);
});
test('K03 rejects forged bound paths, duplicate motifs and foreign supply references',()=>{
 const x=zhou();x.compound.motifs[0].witnesses[0].paths.wealthGeneratesKilling.to='foreign';assert.equal(runWealth(x).status,'invalid-evidence');
 const y=zhou();y.compound.motifs[0].witnesses.push(y.compound.motifs[0].witnesses[0]);assert.equal(runWealth(y).status,'invalid-evidence');
 const z=zhou();z.compound.motifs[0].witnesses[0].right.witnessId='foreign';assert.equal(runWealth(z).status,'invalid-evidence');
});
test('K03 supply alone does not imply a rescue or actual deficiency; missing hour suppresses direction',()=>{
 const x=zhou();x.review.rules=x.review.rules.slice(2);x.mechanism.routes=x.mechanism.routes.slice(2);x.mechanism.edges=x.mechanism.edges.slice(3);
 x.compound.motifs=observeKillingWealthDualRole(x.review,true);
 assert.equal(runWealth(x).dualRoles.length,0);assert.equal(runWealth(x).supply.length,1);
 x.prior.completeHour=false;const r=runWealth(x);assert.equal(r.status,'partial');assert.equal(r.supply[0].objectives[0].conditionalStatus,'unresolved');
});
test('K03 placement is context, never proof of protected resource',()=>{
 const x=sample();x.capacity.occurrences[2]={id:f,position:'hour',layer:'visible',tenGod:'편재'};
 x.review.rules=[];x.flow.routes=[];x.mechanism.edges=[];x.mechanism.routes=[];
 x.prior.relativeForce.edges=x.prior.relativeForce.edges.filter(e=>e.from!==f&&e.to!==f);
 x.prior.relativeForce.edges.push(edge(f,i,'control'),edge(f,k,'generate'));
 const strategies=run(x),compound={motifs:observeKillingWealthDualRole(x.review,true),violations:[]};
 const r=assessKillingWealth(x.review,x.prior,x.capacity,x.mechanism,compound,strategies,x.strength,{status:'diagnostic',pairs:[]},{status:'diagnostic',comparisons:[]},{status:'unresolved'});
 assert.equal(r.status,'diagnostic');assert.equal(r.mediationContacts.length,1);
 assert.equal(r.mediationContacts[0].placement.wealthResourceDistance,3);
 assert.equal(r.mediationContacts[0].placement.protectionConfirmed,null);
 assert.ok(r.mediationContacts[0].objectives.every(o=>o.effectConfirmed===null));
});
