import test from 'node:test';
import assert from 'node:assert/strict';
import {readCapacityComparison,observeConditionalRolePriority,assessRoleComparisonReadiness} from '../src/features/pattern/outcome-role-priority.js';
import {evaluateRoleContrast,summarizeRoleContrasts} from '../scripts/lib/pattern-outcome-role-contrast.mjs';
import {observeRoleCapacity} from '../src/features/pattern/outcome-role-capacity.js';
const a='visible:year',b='visible:month',day='visible:day';
const sample=()=>{
 const capacity={status:'diagnostic',occurrences:[{id:a,exactRootSlots:[],sameElementRootSlots:[]},{id:b,exactRootSlots:['branch:month'],sameElementRootSlots:[]}]};
 const comparisons={status:'diagnostic',pairs:[{left:b,right:a,comparison:{relation:'left-evidence-dominates'},cautions:['root-clash-exposure']}]};
 const review={candidateId:'c',family:'resource',status:'diagnostic',rules:[{id:'resource-wealth',kind:'damage',witnesses:[{id:'d',roles:{obstacle:a,target:b}}]},{id:'resource-wealth-regulation',kind:'support',witnesses:[{id:'r',roles:{helper:a,target:b}}]}]};
 const prior={completeHour:true,stemForce:{occurrences:[{id:day,dayReference:true,stem:'갑'}]}};
 const flow={status:'diagnostic',routes:[{ruleId:'resource-wealth',witnessId:'d'},{ruleId:'resource-wealth-regulation',witnessId:'r'}],mediationContexts:[]};
 return {capacity,comparisons,review,prior,flow,strength:{direction:'weak'}};
};
const run=x=>observeConditionalRolePriority(x.review,x.prior,x.capacity,x.comparisons,x.flow,x.strength);
test('orientation is relative to requested endpoints and caution is not erased',()=>{
 const x=sample(),r=readCapacityComparison(x.comparisons,a,b);
 assert.equal(r.relation,'right-evidence-dominates');assert.equal(r.status,'context-review');assert.deepEqual(r.cautions,['root-clash-exposure']);
 assert.equal(readCapacityComparison(x.comparisons,a,'hidden:month:갑').status,'not-comparable');
});
test('resource review order changes with day premise but no effect selection',()=>{
 const x=sample(),before=JSON.stringify(x),r=run(x);
 assert.equal(r.contexts[0].reviewFirst,'required-resource-protection');assert.equal(r.preferredInterpretation,null);assert.equal(JSON.stringify(x),before);
 x.strength.direction='strong';assert.equal(run(x).contexts[0].reviewFirst,'resource-excess-assessment');
 x.capacity.occurrences[1].exactRootSlots=[];assert.equal(run(x).contexts[0].reviewFirst,null);
 x.prior.completeHour=false;assert.equal(run(x).contexts[0].reviewFirst,null);
});
test('resource regulation cannot be joined to unrelated damage',()=>{
 const x=sample();x.review.rules[1].witnesses[0].roles.target='other';
 assert.deepEqual(run(x).contexts,[]);
 x.flow.routes.pop();assert.equal(run(x).status,'invalid-evidence');
});
test('weak yang day prioritizes mediation review only for the same killing and day',()=>{
 const x=sample();x.review.family='killing';x.review.rules=[{id:'killing-food',kind:'support',witnesses:[{id:'s',roles:{helper:a,target:b,day}}]}];
 x.flow.routes=[{ruleId:'killing-food',witnessId:'s'}];x.flow.mediationContexts=[{id:'m',killingId:b,dayId:day}];
 assert.equal(run(x).contexts[0].reviewFirst,'resource-mediation-capacity');
 x.prior.stemForce.occurrences[0].stem='을';assert.equal(run(x).contexts[0].reviewFirst,null);
 x.flow.mediationContexts[0].killingId='other';assert.deepEqual(run(x).contexts,[]);
});
test('source comparison reports mismatch and not-comparable without inventing effect accuracy',()=>{
 const x=sample(),f={id:'c',probes:[{id:'p',left:a,right:b,expected:'left-evidence-dominates',basis:'explicit-role-contrast'},{id:'h',left:day,right:'hidden:month:갑',expected:'left-evidence-dominates',basis:'explicit-role-contrast'}]};
 const r=evaluateRoleContrast(f,x.capacity,x.comparisons);
 assert.equal(r.rows[0].status,'opposed-profile');assert.equal(r.rows[1].status,'not-comparable');
 const s=summarizeRoleContrasts({cases:[f]},[r]);assert.equal(s.errors.length,0);assert.equal(s.effectAgreement,null);
 assert.equal(summarizeRoleContrasts({cases:[f]},[]).errors.length,1);
});
test('exact and same-element root in one slot of one occurrence is not shared supply',()=>{
 const o={id:a,tenGod:'정인',layer:'visible',position:'year',dayReference:false,element:'wood',roots:[{position:'month',role:'principal',match:'exact-stem'},{position:'month',role:'middle',match:'same-element'}]};
 const p={occurrenceId:a,axes:{},localGenerationNodes:[],localPeerNodes:[],localControlNodes:[],contacts:[]};
 const r=observeRoleCapacity({completeHour:true,stemForce:{occurrences:[o]},relativeForce:{profiles:{[a]:p}}});
 assert.deepEqual(r.tenGods.find(g=>g.tenGod==='정인').sharedRootSlots,[]);
});

test('relative evidence cannot trigger excess review if root or command direction changes',()=>{
 const cmp={relation:'left-evidence-dominates',status:'directional-profile-only',cautions:[]};
 const root={status:'diagnostic',comparisons:[{left:a,right:b,sensitivity:{relation:'left-evidence-dominates'}}]};
 const command={status:'diagnostic',comparisonCoverage:[{left:b,right:a,status:'available-hypotheses-agree',hypotheses:[{id:'s',relation:'right-evidence-dominates'}]}]};
 assert.equal(assessRoleComparisonReadiness(cmp,a,b,root,command).status,'directional-review-eligible');
 assert.equal(assessRoleComparisonReadiness(cmp,a,b,root,null).status,'context-review');
 command.comparisonCoverage[0].status='incomplete-source-coverage';
 assert.equal(assessRoleComparisonReadiness(cmp,a,b,root,command).status,'unresolved');
 root.comparisons[0].sensitivity.relation='unresolved';
 assert.equal(assessRoleComparisonReadiness(cmp,a,b,root,command).status,'unresolved');
});
