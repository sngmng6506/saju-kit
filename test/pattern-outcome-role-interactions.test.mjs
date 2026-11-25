import test from 'node:test';
import assert from 'node:assert/strict';
import {observeRoleInteractions} from '../src/features/pattern/outcome-role-interactions.js';
import {createRoleEvidence,createRoleEdgeReader,combinePremises} from '../src/features/pattern/outcome-role-contract.js';
const obj=(id,status='unresolved')=>({id,conditionalStatus:status,effectConfirmed:null,actualDemand:null});
const actor=(id,position,layer='visible',dayReference=false)=>({id,position,layer,dayReference});
const ref=(ruleId,witnessId)=>({ruleId,witnessId});
const row=(candidateId,extra)=>({candidateId,selectionAuthority:false,status:'diagnostic',...extra});
const sample=(family='resource')=>{
 const d='visible:day',a='visible:year',b='visible:month',c='visible:hour',h='hidden:month:을';
 const actors=[actor(d,'day','visible',true),actor(a,'year'),actor(b,'month'),actor(c,'hour'),actor(h,'month','hidden')];
 const roots=actors.map(o=>({id:o.id,uncontestedRootIds:o.id===a||o.id===h?['hidden:month:을']:[]}));
 const review={candidateId:'x',family,status:'diagnostic',rules:[]};
 const policies={objectiveReview:row('x',{objectives:[]}),killingStrategies:row('x',{food:[],mediation:[],comparisons:[]}),
  killingWealth:row('x',{dualRoles:[]}),resourceStrategies:row('x',{outputDrain:[]})};
 return {d,a,b,c,h,review,capacity:{status:'diagnostic',occurrences:actors},root:{status:'diagnostic',occurrences:roots},policies,complete:true};
};
const run=x=>observeRoleInteractions(x.review,x.capacity,x.root,x.policies,x.complete);
function drain(x){
 const r=ref('resource-output-regulation','w');
 x.review.rules=[{id:r.ruleId,witnesses:[{id:r.witnessId,anchorBindings:[{anchorId:x.a},{anchorId:x.h}]}]}];
 x.policies.resourceStrategies.outputDrain=[x.a,x.h].map((anchorId,i)=>({route:r,anchorId,outputId:x.c,dayId:x.d,
  pathConditionalStatus:i?'unresolved':'supported',objectives:[obj('drain')]}));
}
test('anchor options stay separate; same root is not two independent supplies',()=>{
 const x=sample();drain(x);const before=JSON.stringify(x),r=run(x);
 assert.equal(r.status,'diagnostic');assert.equal(r.anchorAlternatives.length,1);
 assert.equal(r.anchorAlternatives[0].options[1].pathConditionalStatus,'unresolved');
 assert.equal(r.anchorAlternatives[0].selectedAnchorId,null);assert.equal(r.simultaneousContexts.length,0);
 assert.equal(r.sharedEvidence[0].sharedRoots[0].rootId,x.h);
 assert.equal(r.sharedEvidence[0].independentSupplyConfirmed,null);assert.equal(JSON.stringify(x),before);
});
test('duplicate or missing anchor option fails closed',()=>{
 const x=sample();drain(x);x.policies.resourceStrategies.outputDrain.pop();assert.equal(run(x).status,'invalid-evidence');
 drain(x);x.policies.resourceStrategies.outputDrain.push(x.policies.resourceStrategies.outputDrain[0]);assert.equal(run(x).status,'invalid-evidence');
});
test('same route competing interpretations do not count votes or establish exclusivity',()=>{
 const x=sample(),r=ref('resource-wealth','w');x.review.rules=[{id:r.ruleId,witnesses:[{id:r.witnessId}]}];
 x.policies.objectiveReview.objectives=['injury','moderation'].map(id=>({...obj(id),clause:'R02',objective:id,route:r,relatedRoutes:[]}));
 const p=run(x);assert.equal(p.interpretations.length,1);assert.equal(p.interpretations[0].exclusiveConfirmed,null);
 assert.equal(p.selectedObjective,null);assert.equal(p.simultaneousContexts.length,0);
});
test('K01 paired path records contact and shared pressure, never confirms interference',()=>{
 const x=sample('killing'),r=ref('killing-food','w');
 x.review.rules=[{id:r.ruleId,witnesses:[{id:r.witnessId}]}];
 const f={route:r,foodId:x.a,killingId:x.h,dayId:x.d},m={id:'m',resourceId:x.b,killingId:x.h,dayId:x.d};
 x.policies.killingStrategies.food=[f];x.policies.killingStrategies.mediation=[m];
 const c={foodRoute:r,mediationContextId:'m',killingId:x.h,dayId:x.d,sharedRelations:[{from:x.h,to:x.d,kind:'control'}],
  crossContact:{from:x.b,to:x.a,kind:'control',status:'unresolved',effective:null},interferenceStatus:'contact-unresolved',effectConfirmed:null};
 x.policies.killingStrategies.comparisons=[c];const p=run(x);
 assert.equal(p.simultaneousContexts.length,1);assert.equal(p.simultaneousContexts[0].sharedRelations.length,1);
 assert.equal(p.simultaneousContexts[0].simultaneousEffectConfirmed,null);
 x.complete=false;assert.equal(run(x).simultaneousContexts[0].relationStatus,'partial');
 c.sharedRelations[0].to=x.c;assert.equal(run(x).status,'invalid-evidence');
});
test('K03 keeps exact bound rescue and supply in simultaneous context',()=>{
 const x=sample('killing'),a=ref('rescue','a'),b=ref('supply','b'),c=ref('damage','c');
 x.review.rules=[a,b,c].map(r=>({id:r.ruleId,witnesses:[{id:r.witnessId}]}));
 const p={rescue:a,supply:b,boundThreat:c,wealthId:x.a,resourceId:x.b,outputId:x.c,killingId:x.h,objectives:[obj('relief'),obj('feed')],netEffectConfirmed:null};
 x.policies.killingWealth.dualRoles=[p];
 const r=run(x);assert.equal(r.simultaneousContexts[0].kind,'bound-wealth-rescue-and-supply');assert.equal(r.simultaneousContexts[0].effectConfirmed,null);
 x.policies.killingWealth.dualRoles.push(p);assert.equal(run(x).status,'invalid-evidence');
});
test('foreign policy or root inventory and authority leakage fail closed',()=>{
 const x=sample();x.policies.killingWealth.candidateId='foreign';assert.equal(run(x).status,'invalid-evidence');
 x.policies.killingWealth.candidateId='x';x.policies.killingWealth.selectionAuthority=true;assert.equal(run(x).status,'invalid-evidence');
 x.policies.killingWealth.selectionAuthority=false;x.root.occurrences.pop();assert.equal(run(x).status,'invalid-evidence');
});
test('common premise composition retains existing conservative ordering',()=>{
 assert.equal(combinePremises([]),'unresolved');assert.equal(combinePremises([{state:'supported'}]),'supported');
 assert.equal(combinePremises([{state:'opposed'},{state:'conflicting'}]),'conflicting');
 assert.equal(combinePremises([{state:'opposed'},{state:'unresolved'}]),'opposed');
});
test('common raw reader requires exact binding and rejects inconsistent registry',()=>{
 const x=sample(),e={id:'a>b',from:x.a,to:x.b,kind:'generate'};
 const prior={stemForce:{occurrences:x.capacity.occurrences},relativeForce:{edges:[e]}};
 const m={edges:[{...e,status:'opposed',conditions:[],effective:null}],routes:[]};
 const ctx=createRoleEvidence(x.review,x.capacity,m,{prior,rawRequired:true});
 const reader=createRoleEdgeReader(ctx,true,r=>({...r,status:'supported',conditions:[],effective:null}));
 assert.equal(reader.bound({...e,edgeId:'foreign'},x.a,x.b,'generate'),false);
 reader.edge(x.a,x.b,'generate');assert.equal(reader.invalid(),true);
 m.edges.push(m.edges[0]);assert.equal(createRoleEvidence(x.review,x.capacity,m,{prior,rawRequired:true}),null);
});
