import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectProbeAllocations} from '../scripts/lib/pattern-outcome-joint-audit.mjs';
const edge={from:'a',to:'b',kind:'combine'};
const ref=(ruleId,witnessId)=>({ruleId,witnessId});
const sample=()=>{
 const support=ref('s','w'),rescue=ref('r','w');
 const review={candidateId:'c',rules:[{id:'s',kind:'support',witnesses:[{id:'w',edges:[]}]},
  {id:'d',kind:'damage',witnesses:[{id:'w',edges:[edge]}]},
  {id:'r',kind:'rescue',threatRuleId:'d',witnesses:[{id:'w',threatWitnessId:'w',edges:[edge]}]}]};
 const p={id:'p',support,rescues:[rescue],anchorAssignments:[{route:support,edge,hypothesis:'unresolved'}]};
 const a={samples:[p],reviewFrontierIds:['p'],exhaustive:true,examined:1};
 return {review,p,a,joint:{search:{observed:{allocationReview:a},supportedOnly:{allocationReview:a}}}};
};
const run=(x,probe=edge,mode='observed')=>inspectProbeAllocations(probe,x.review,x.joint,mode);
test('audit preserves exact rule and witness identities even for symmetric combination',()=>{
 const x=sample(),r=run(x,{...edge,from:'b',to:'a'});
 assert.equal(r.status,'sample-observed');assert.deepEqual(r.matches[0].origins,[{route:ref('s','w'),origin:'anchor-option',hypothesis:'unresolved'},{route:ref('r','w'),origin:'bound-threat'}]);
 assert.equal(r.effectAgreement,null);
});
test('unseen relation under truncation is not evidence of absence',()=>{
 const x=sample(),p={from:'c',to:'d',kind:'control'};x.a.exhaustive=false;
 assert.equal(run(x,p).status,'search-incomplete');
 x.a.exhaustive=true;assert.equal(run(x,p).status,'not-in-enumerated-allocations');
});
test('invalid sample identities and unsupported selected alternatives fail the audit',()=>{
 const x=sample();assert.throws(()=>run(x,edge,'supportedOnly'));
 x.p.anchorAssignments[0].hypothesis='supported';assert.equal(run(x,edge,'supportedOnly').status,'sample-observed');
 x.p.anchorAssignments[0].route=ref('other','w');assert.throws(()=>run(x));
 const y=sample();y.a.samples.push(y.p);assert.throws(()=>run(y));
});
