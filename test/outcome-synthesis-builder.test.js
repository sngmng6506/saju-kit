import test from 'node:test';
import assert from 'node:assert/strict';
import {createSynthesisBuilder} from '../src/features/pattern/outcome-synthesis-builder.js';
import {evaluateArguments} from '../src/features/pattern/outcome-argumentation.js';
for(const complete of [true,false]) for(const state of ['supported','opposed','conflicting','unresolved']){
 test('shared synthesis '+complete+' '+state,()=>{
  const props=[],facts=[],rules=[];
  const build=createSynthesisBuilder({complete,policyId:'test-policy',policyOwner:'test-owner',props,facts,rules});
  const {observation,conjunction}=build('supply-edge');
  const p=observation('supply',state,'source','id','field');
  const q=conjunction('reception',[p],[p]);
  const r=evaluateArguments({scope:complete?'complete':'partial',propositions:props,evidence:facts,rules});
  assert.equal(r.status,complete?'diagnostic':'partial');
  assert.equal(r.judgments.find(j=>j.id===p).state,complete?state:'unresolved');
  assert.equal(r.judgments.find(j=>j.id===q).state,complete&&state==='supported'?'supported':'unresolved');
  assert.equal(rules[0].refs[0].owner,'test-owner');
  assert.equal(r.selectionAuthority,false);
  assert.equal(r.effective,null);
 });
}
test('subject isolation and chained conjunction',()=>{
 const props=[],facts=[],rules=[];
 const build=createSynthesisBuilder({complete:true,policyId:'p',policyOwner:'o',props,facts,rules});
 const a=build('a'),b=build('b');
 const x=a.observation('supply','supported','s','a','f');
 const y=b.observation('supply','opposed','s','b','f');
 const q=a.conjunction('reception',[x],[x]);
 const z=a.conjunction('downstream',[q,y],[y]);
 const r=evaluateArguments({scope:'complete',propositions:props,evidence:facts,rules});
 assert.equal(r.status,'diagnostic');
 assert.notEqual(x,y);
 assert.equal(r.judgments.find(j=>j.id===q).state,'supported');
 assert.equal(r.judgments.find(j=>j.id===z).state,'unresolved');
});
