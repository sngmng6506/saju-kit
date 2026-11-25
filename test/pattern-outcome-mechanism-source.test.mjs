import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateMechanismSourceCase,summarizeMechanismSource,validateMechanismSource} from '../scripts/lib/pattern-outcome-mechanism-source.mjs';
const c={id:'c',family:'wealth',pillars:['갑자','병인','갑자','병인'],source:'source',probes:[{id:'p',from:'visible:year',to:'visible:month',kind:'combine',claim:'removal-disputed',endpointBasis:'explicit-stems',reading:'main',commentaryDispute:'commentary'}]};
const edge={id:'e',from:'visible:month',to:'visible:year',kind:'combine',status:'unresolved',effective:null,conditions:[{id:'combination-outcome',state:'unresolved'}]};
const result=()=>({reviews:[{candidateId:'c1',family:'wealth',status:'diagnostic'}],decisionReview:{status:'abstained'},efficacyReview:{mechanismReview:{selectionAuthority:false,candidates:[{candidateId:'c1',selectionAuthority:false,status:'diagnostic',edges:[edge]}]}}});
test('combination is symmetric, removal dispute preserved separately from relation observation',()=>{
 const p=evaluateMechanismSourceCase(c,result())[0];assert.equal(p.status,'unresolved');assert.equal(p.relationObserved,true);assert.equal(p.sourceDispute,true);assert.equal(p.effectAgreement,null);
 assert.deepEqual(p.blockers,['combination-outcome:unresolved']);
});
test('directed action cannot be matched in reverse; candidate absence distinguished',()=>{
 const x={...c,probes:[{...c.probes[0],kind:'control',claim:'action-asserted'}]},r=result();
 r.efficacyReview.mechanismReview.candidates[0].edges=[{...edge,kind:'control'}];
 assert.equal(evaluateMechanismSourceCase(x,r)[0].status,'uncovered');
 r.reviews=[];assert.equal(evaluateMechanismSourceCase(x,r)[0].status,'candidate-unavailable');
});
test('different candidate hypotheses retained rather than voting',()=>{
 const r=result();r.reviews.push({candidateId:'c2',family:'wealth',status:'diagnostic'});
 r.efficacyReview.mechanismReview.candidates.push({candidateId:'c2',selectionAuthority:false,status:'diagnostic',edges:[{...edge,status:'supported'}]});
 assert.equal(evaluateMechanismSourceCase(c,r)[0].status,'candidate-dependent');
});
test('fixed denominator rejects missing, duplicate and invalid reports',()=>{
 const data={cases:[c]},p=evaluateMechanismSourceCase(c,result());
 assert.equal(summarizeMechanismSource(data,[{id:'c',probes:p}]).gatePassed,true);
 assert.equal(summarizeMechanismSource(data,[{id:'c',error:'failure'}]).expectedProbes,1);
 assert.equal(summarizeMechanismSource(data,[]).gatePassed,false);
 assert.equal(summarizeMechanismSource(data,[{id:'c',probes:[...p,...p]}]).gatePassed,false);
 const r=result();r.efficacyReview.mechanismReview.candidates[0].edges=[{...edge,effective:true}];
 assert.equal(summarizeMechanismSource(data,[{id:'c',probes:evaluateMechanismSourceCase(c,r)}]).gatePassed,false);
});
test('source fixture distinguishes disputed removal and rejects invalid claim or identity',()=>{
 const dev={cases:[{caseId:'c',family:c.family,pillars:c.pillars}]};
 assert.deepEqual(validateMechanismSource({cases:[c]},dev),[]);
 assert.equal(validateMechanismSource({cases:[{...c,probes:[{...c.probes[0],commentaryDispute:null}]}]},dev).length,1);
 assert.equal(validateMechanismSource({cases:[{...c,probes:[{...c.probes[0],from:'unknown'}]}]},dev).length,1);
});
