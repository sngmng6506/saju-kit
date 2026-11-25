import test from 'node:test';
import assert from 'node:assert/strict';
import {buildIndependentPacket,reviewTemplate,validateReview,summarizeIndependentReviews} from '../scripts/lib/pattern-outcome-independent-review.mjs';
const ps=['무술','갑자','정미','경술'];
const packet=buildIndependentPacket({cases:[{id:'m',pillars:ps,source:'source',probes:[{id:'p',from:'visible:month',to:'visible:year',kind:'control',reading:'secret expected effect'}]}]},
 {cases:[{id:'c',eligible:true,pillars:ps,source:'source',sourceReading:'secret label'}]},
 {source:'source',cases:[{id:'s',pillars:ps,expectedClause:'secret expected clause'}]});
const digest='test-digest';
const batch=id=>({...reviewTemplate(packet,digest),reviewerId:id,independentOfEngineOutputs:true,priorExposure:'none-declared',
 responses:packet.tasks.map(t=>({taskId:t.id,sourceLocator:'edition/chapter/passage',rationale:'source rationale',label:t.kind==='effect'?{effect:'effective'}:t.kind==='chart'?{family:'killing',formation:'undetermined',breakage:'undetermined',rescue:'undetermined',purity:'undetermined',clarity:'undetermined'}:{method:'joint',elements:['water','wood']}}))});
test('packet excludes expected labels, source readings and engine results',()=>{
 assert.equal(packet.tasks.length,3);assert.equal(JSON.stringify(packet).includes('secret'),false);
 assert.ok(reviewTemplate(packet,digest).responses.every(r=>r.label===null));
});
test('agreement does not certify independence and undetermined is not determinate agreement',()=>{
 const r=summarizeIndependentReviews(packet,digest,[batch('a'),batch('b')]);
 assert.equal(r.status,'reviewed-pending-external-check');assert.equal(r.verifiedIndependentGold,0);assert.equal(r.selectionAuthority,false);
 assert.equal(r.rows[1].status,'partially-unresolved');
});
test('missing, duplicate, wrong packet and duplicate reviewers fail closed',()=>{
 const x=batch('a');x.responses.pop();assert.ok(validateReview(packet,digest,x).errors.length);
 const y=batch('a');y.responses.push(y.responses[0]);assert.ok(validateReview(packet,digest,y).errors.length);
 assert.ok(validateReview(packet,'different',batch('a')).errors.length);
 assert.equal(summarizeIndependentReviews(packet,digest,[batch('A'),batch(' a ')]).status,'invalid-review');
});
test('disagreement retained and set ordering normalized, no majority vote',()=>{
 const a=batch('a'),b=batch('b');b.responses[0].label.effect='ineffective';b.responses[2].label.elements.reverse();
 const r=summarizeIndependentReviews(packet,digest,[a,b,batch('c')]);
 assert.equal(r.rows[0].status,'disagreement');assert.equal(r.rows[2].status,'agreement-pending-external-check');
});
test('selection cannot declare an element with undetermined method and no evidence rationale',()=>{
 const x=batch('a');x.responses[2].label.method='undetermined';assert.ok(validateReview(packet,digest,x).errors.length);
 const y=batch('a');y.responses[0].rationale='';assert.ok(validateReview(packet,digest,y).errors.length);
 assert.equal(summarizeIndependentReviews(packet,digest,[batch('a')]).status,'pending');
});
