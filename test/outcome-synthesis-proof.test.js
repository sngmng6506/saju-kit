import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateArguments} from '../src/features/pattern/outcome-argumentation.js';
import {replaySynthesisProof,describeSynthesisProof,bindSynthesisProof,preservesSynthesisProofs} from '../src/features/pattern/outcome-synthesis-proof.js';
const ref=[{owner:'fixture',id:'source',field:'value'}];
const lit=(propositionId,sign='for')=>({propositionId,sign});
const prop=(id,level='observation',subject='edge')=>({id,kind:id,level,subject});
function packet(scope='complete',opposed=false,extension=false){
 const propositions=[prop('a'),prop('b','structural-hypothesis'),prop('effect','effect-hypothesis'),...(extension?[prop('extra')]:[])];
 const evidence=[{id:'f',...lit('a'),refs:ref,applicability:'complete-only'},...(opposed?[{id:'n',...lit('a','against'),refs:ref,applicability:'complete-only'}]:[])];
 const rules=[{id:'r',policyId:'p',conclusion:lit('b'),premises:[lit('a')],undercutWhen:[lit('a','against')],refs:ref,applicability:'complete-only'}];
 const input={scope,propositions,evidence,rules};
 return {...input,...evaluateArguments(input)};
}
for(const scope of ['complete','partial'])for(const opposed of [false,true]){
 test('proof replay '+scope+' '+opposed,()=>{
  const p=packet(scope,opposed),g=replaySynthesisProof(p,scope);
  assert.ok(g);
  const report=describeSynthesisProof(g,'b','upstream');
  assert.equal(report.state,scope==='complete'&&!opposed?'supported':'unresolved');
  assert.equal(report.alternatives[0].status,scope==='partial'?'scope-unresolved':opposed?'undercut':'applicable');
  assert.equal(bindSynthesisProof(g,report,'upstream','b','edge'),true);
  assert.equal(describeSynthesisProof(g,'effect','upstream').state,'unresolved');
 });
}
test('reject forged replay outputs and invalid inputs',()=>{
 const p=packet();
 for(const change of [
  {judgments:p.judgments.map(j=>({...j,state:'supported'}))},
  {ruleResults:[]},
  {propositions:[...p.propositions,p.propositions[0]]},
  {evidence:[...p.evidence,{id:'bad',...lit('effect'),refs:ref,applicability:'complete-only'}]}
 ])assert.equal(replaySynthesisProof({...p,...change},'complete'),null);
 assert.equal(replaySynthesisProof(p,'partial'),null);
 assert.equal(replaySynthesisProof(null,'complete'),null);
});
test('reject substituted owner, subject, kind, id, level and signed witnesses',()=>{
 const g=replaySynthesisProof(packet(),'complete'),p=describeSynthesisProof(g,'b','upstream');
 for(const change of [{owner:'other'},{subject:'other'},{kind:'a'},{propositionId:'a'},{level:'effect-hypothesis'},{state:'opposed'},{proof:{support:p.proof.opposition,opposition:p.proof.support}},{alternatives:[]}])
  assert.equal(bindSynthesisProof(g,{...p,...change},'upstream','b','edge'),false);
 assert.equal(bindSynthesisProof(g,null,'upstream','b','edge'),false);
});
test('reject forged undercuts and proof obligations',()=>{
 const g=replaySynthesisProof(packet('complete',true),'complete'),p=describeSynthesisProof(g,'b','upstream');
 const a=p.alternatives[0];
 for(const change of [{undercuts:[]},{status:'applicable'},{missing:[{propositionId:'a',sign:'for',kind:'a',state:'supported'}]}])
  assert.equal(bindSynthesisProof(g,{...p,alternatives:[{...a,...change}]},'upstream','b','edge'),false);
});
test('extension must preserve every original judgment',()=>{
 const original=replaySynthesisProof(packet(),'complete');
 const extended=replaySynthesisProof(packet('complete',false,true),'complete');
 const changed=replaySynthesisProof(packet('complete',true,true),'complete');
 assert.equal(preservesSynthesisProofs(original,extended),true);
 assert.equal(preservesSynthesisProofs(extended,original),false);
 assert.equal(preservesSynthesisProofs(original,changed),false);
 assert.equal(preservesSynthesisProofs(original,null),false);
});
