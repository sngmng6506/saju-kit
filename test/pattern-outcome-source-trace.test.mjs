import test from 'node:test';
import assert from 'node:assert/strict';
import {observeLiteralSourceRelation,traceMechanismSource,summarizeSourceTrace} from '../scripts/lib/pattern-outcome-source-trace.mjs';
import {readFileSync} from 'node:fs';
const c={id:'c',family:'killing',pillars:['무술','갑자','정미','경술']};
const p={id:'p',from:'visible:month',to:'visible:year',kind:'control'};
const edge={...p,id:'e',blockers:['nonadjacent'],relative:{relation:'mixed-evidence'},effective:null};
const sample=()=>{
 const prior={stemForce:{occurrences:[{id:p.from},{id:p.to}]},relativeForce:{edges:[edge]}};
 const q={candidateId:'c1',family:c.family,status:'diagnostic',rules:[{id:'d',witnesses:[{id:'w',edges:[edge]}]}]};
 const m={candidateId:'c1',status:'diagnostic',selectionAuthority:false,edges:[{...edge,status:'conflicting'}]};
 const result={access:{},reviews:[q],efficacyReview:{mechanismReview:{candidates:[m],combinationContext:{pairs:[]}}}};
 return {prior,result,q,m};
};
const run=(x,probe=p)=>traceMechanismSource(c,probe,x.prior,x.result);
test('literal direction and hidden membership are verified independently',()=>{
 assert.equal(observeLiteralSourceRelation(c,p).status,'literal-relation-observed');
 assert.equal(observeLiteralSourceRelation(c,{...p,from:p.to,to:p.from}).status,'literal-relation-mismatch');
 assert.equal(observeLiteralSourceRelation(c,{...p,to:'hidden:month:갑'}).status,'endpoint-not-in-chart');
});
test('core relation, raw witness and hypothesis preserve distinct stages',()=>{
 const x=sample(),r=run(x);
 assert.equal(r.stage,'hypothesis-observed');assert.equal(r.candidates[0].rawWitnessRefs[0].witnessId,'w');assert.equal(r.effectAgreement,null);
 x.q.rules=[];x.m.edges=[];assert.equal(run(x).stage,'family-route-not-covered');
 x.q.status='out-of-scope';assert.equal(run(x).stage,'family-out-of-scope');
 x.result.reviews=[];assert.equal(run(x).stage,'family-candidate-missing');
});
test('a raw witness without a mechanism projection and the converse fail integrity',()=>{
 const x=sample();x.m.edges=[];assert.equal(run(x).stage,'projection-integrity-mismatch');
 const y=sample();y.q.rules=[];assert.equal(run(y).stage,'projection-integrity-mismatch');
 const z=sample();z.result.efficacyReview.mechanismReview.candidates.push(z.m);assert.equal(run(z).stage,'projection-integrity-mismatch');
});
test('missing graph relation differs from same-slot exclusion and duplicate evidence',()=>{
 const x=sample();x.prior.relativeForce.edges=[];assert.equal(run(x).stage,'core-relation-missing');
 const y=sample();y.prior.relativeForce.edges.push(edge);assert.equal(run(y).stage,'duplicate-core-relation');
 const h={id:'h',from:'hidden:year:정',to:'hidden:year:신',kind:'control'};
 x.prior.stemForce.occurrences.push({id:h.from},{id:h.to});
 assert.equal(run(x,h).stage,'same-slot-excluded');
});
test('anchor alternative trace does not become mandatory evidence',()=>{
 const x=sample(),w=x.q.rules[0].witnesses[0];w.edges=[];w.anchorBindings=[{anchorId:p.from,targetId:p.to,edge}];
 assert.equal(run(x).candidates[0].rawWitnessRefs[0].scope,'anchor-alternative');
});
test('report counts missing and inconsistent traces without treating uncovered routes as integrity failure',()=>{
 const r=summarizeSourceTrace([{id:'c',probes:[{id:'p',trace:{stage:'family-route-not-covered'}},{id:'q',trace:{stage:'projection-integrity-mismatch'}},{id:'z'}]}]);
 assert.equal(r.counts['family-route-not-covered'],1);assert.equal(r.integrityFailures.length,2);assert.equal(r.effectAgreement,null);
});
test('frozen ten source probes have actual literal endpoints and valid relations',()=>{
 const data=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-outcome-mechanism-source-v2.json',import.meta.url),'utf8'));
 for(const c of data.cases)for(const p of c.probes)assert.equal(observeLiteralSourceRelation(c,p).status,'literal-relation-observed',c.id+':'+p.id);
});
