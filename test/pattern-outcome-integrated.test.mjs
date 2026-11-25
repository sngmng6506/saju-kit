import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePatternOutcomeV9,analyzePatternOutcomeAssistantExtension,analyzePatternOutcomeIntegrated,PATTERN_OUTCOME_V9_VERSION,PATTERN_OUTCOME_ASSISTANT_EXTENSION_VERSION,PATTERN_OUTCOME_INTEGRATED_VERSION} from '../src/index.js';
import {inspectIntegratedEvidence} from '../src/features/pattern/outcome-integrity.js';
const chart=ps=>({pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,ps[i]?{stem:ps[i][0],branch:ps[i][1],text:ps[i]}:null]))});
const args=ps=>({saju:chart(ps),birthBasis:'verified-chart'});
const run=ps=>analyzePatternOutcomeIntegrated({...args(ps),policy:PATTERN_OUTCOME_INTEGRATED_VERSION});
const storage=(r,id)=>r.reviews.find(q=>q.candidateId==='storage:'+id);
const witness=(id,roles,edges=[])=>({id,roles,edges,effective:null});
const sample=()=>({
 candidateId:'c',anchorIds:['visible:year'],formed:null,broken:null,rescued:null,selectionAuthority:false,
 rules:[{id:'s',kind:'support',effective:null,conditionResolved:false,unresolvedConditions:[],witnesses:[witness('w',{target:'visible:year',helper:'visible:month'})]}]});
const derived=()=>({candidateId:'c',status:'diagnostic',selectionAuthority:false,violations:[],assistantGod:null,cleanConfirmed:null,turbidConfirmed:null});
const check=(q,p={witnesses:[{ruleId:'s',witnessId:'w'}]})=>inspectIntegratedEvidence(q,derived(),derived(),derived(),p,{groups:[]},['visible:year','visible:month']);
test('integrity accepts exact projection and detects missing position evidence',()=>{
 assert.equal(check(sample()).status,'consistent');
 assert.ok(check(sample(),{witnesses:[]}).violations.some(v=>v.kind==='position-witness-mismatch'));
});
test('integrity detects duplicate rules, unknown roles and premature authority',()=>{
 const q=sample();q.rules.push({...q.rules[0]});q.rules[0].witnesses[0].roles.helper='unknown';q.formed=true;
 const v=check(q).violations.map(v=>v.kind);
 assert.ok(v.includes('duplicate-rule'));assert.ok(v.includes('unknown-participant'));assert.ok(v.includes('candidate-authority'));
});
test('storage provenance must remain on every rule',()=>{
 const q=sample();q.storageProjection={};assert.ok(check(q).violations.some(v=>v.kind==='missing-storage-conditions'));
 q.rules[0].unresolvedConditions=['storage-anchor-access','storage-family-validity'];assert.equal(check(q).status,'consistent');
});
test('position duplicates, wrong candidate and edge authority are rejected',()=>{
 const q=sample(),p={witnesses:[{ruleId:'s',witnessId:'w'},{ruleId:'s',witnessId:'w'}]};
 assert.ok(check(q,p).violations.some(v=>v.kind==='position-witness-mismatch'));
 assert.ok(check(q,{candidateId:'other',witnesses:[p.witnesses[0]]}).violations.some(v=>v.kind==='position-witness-mismatch'));
 q.rules[0].witnesses[0].edges=[{from:'visible:year',to:'visible:month',kind:'generate',effective:true}];
 assert.ok(check(q).violations.some(v=>v.kind==='edge-authority'));
});
test('anchor bindings must belong to candidate and carry their exact unresolved relation',()=>{
 const q=sample(),w=q.rules[0].witnesses[0];
 const b={anchorId:'visible:year',targetId:'visible:month',edge:{from:'visible:year',to:'visible:month',kind:'generate',effective:null},effective:null};
 w.anchorBindings=[b];assert.equal(check(q).status,'consistent');
 w.anchorBindings=[b,b];assert.ok(check(q).violations.some(v=>v.kind==='duplicate-anchor-binding'));
 w.anchorBindings=[{...b,anchorId:'visible:month',effective:true}];
 const a=check(q).violations;assert.ok(a.some(v=>v.kind==='binding-outside-candidate-anchor'));assert.ok(a.some(v=>v.kind==='anchor-binding-authority'));
 w.anchorBindings=[{...b,edge:{...b.edge,from:'visible:month'}}];assert.ok(check(q).violations.some(v=>v.kind==='binding-edge-anchor-mismatch'));
});
test('storage resource now receives secondary and regulation stages, not synthetic roots',()=>{
 const r=run(['임자','무진','갑인','병인']),q=storage(r,'임');
 assert.ok(q?.storageProjection);assert.ok(q.rules.some(r=>r.id==='resource-secondary-officer-damage'));
 const rule=q.rules.find(r=>r.id==='resource-output-regulation');
 assert.ok(rule.witnesses.some(w=>w.roles.helper==='visible:hour'&&w.anchorBindings.some(b=>b.anchorId==='visible:year')));
 assert.equal(q.storageProjection.literalMonthHidden,false);
 assert.ok(!r.access.hidden.some(h=>h.id==='hidden:month:임'));
 assert.ok(q.rules.every(r=>r.unresolvedConditions.includes('storage-anchor-access')&&r.unresolvedConditions.includes('storage-family-validity')));
 assert.equal(r.integrity.status,'consistent');
});
test('storage officer and killing receive their family-specific extensions',()=>{
 const a=storage(run(['경자','기축','을묘','병인']),'경');
 assert.ok(a?.rules.some(r=>r.id==='officer-branch-output-damage'));
 assert.ok(a.rules.some(r=>r.id==='officer-wealth-resource-support-loss'));
 assert.ok(a.rules.some(r=>r.id==='officer-combine-hurting'));
 const b=storage(run(['경자','기축','갑인','병인']),'경');
 assert.ok(b?.rules.some(r=>r.id==='killing-food-regulation'));
 assert.ok(b.rules.some(r=>r.id==='killing-combine-resource'));
});
test('storage wealth base rule preserved; all newly derived references use final witness set',()=>{
 const ps=['갑자','신미','신유','임진'],a=analyzePatternOutcomeV9({...args(ps),policy:PATTERN_OUTCOME_V9_VERSION}),b=run(ps),q=storage(b,'갑');
 assert.ok(q);assert.deepEqual(q.rules.slice(0,storage(a,'갑').rules.length),storage(a,'갑').rules);
 assert.ok(q.rules.some(r=>r.id==='wealth-secondary-officer-damage'));
 const p=b.positionContext.candidateReviews.find(x=>x.candidateId===q.candidateId);
 assert.equal(p.witnesses.length,q.rules.flatMap(r=>r.witnesses).length);assert.equal(b.integrity.status,'consistent');
});
test('ordinary extension witnesses agree with prior extension and now have position context',()=>{
 const ps=['정묘','신유','갑자','임신'],a=analyzePatternOutcomeAssistantExtension({...args(ps),policy:PATTERN_OUTCOME_ASSISTANT_EXTENSION_VERSION}),b=run(ps);
 for(const q of a.assistantExtension.candidates.filter(q=>!q.review.storageProjection)){
  const n=b.reviews.find(x=>x.candidateId===q.candidateId);assert.deepEqual(n,q.review);
  const p=b.positionContext.candidateReviews.find(x=>x.candidateId===q.candidateId);
  assert.equal(p.witnesses.length,n.rules.flatMap(r=>r.witnesses).length);
 }
 assert.equal(b.integrity.status,'consistent');assert.equal(b.selectionAuthority,false);
});
test('partial and provisional charts keep authority absent',()=>{
 const a=run(['임자','무진','갑인',null]);assert.equal(a.completeHour,false);assert.equal(a.formed,null);
 const b=analyzePatternOutcomeIntegrated({...args(['임자','무진','갑인','병인']),birthBasis:'provisional-chart',policy:PATTERN_OUTCOME_INTEGRATED_VERSION});
 assert.equal(b.integrity,null);assert.equal(b.assistantReview,null);
});

test('binding target must match the relation and same-branch context is not a causal edge',()=>{
 const q=sample(),w=q.rules[0].witnesses[0],b={anchorId:'visible:year',targetId:'visible:year',edge:{from:'visible:year',to:'visible:month',kind:'generate',effective:null},effective:null};
 w.anchorBindings=[b];assert.ok(check(q).violations.some(v=>v.kind==='binding-edge-target-mismatch'));
 w.anchorBindings=[{anchorId:'visible:year',targetId:'visible:month',basis:'same-branch-constituent-context',edge:null,independentSlots:false,effective:null}];
 assert.ok(check(q).violations.some(v=>v.kind==='invalid-same-branch-binding'));
});
test('target-is-anchor identity requires the actual target and no independent edge',()=>{
 const q=sample(),w=q.rules[0].witnesses[0];
 w.anchorBindings=[{anchorId:'visible:year',targetId:'visible:year',basis:'target-is-anchor',edge:null,independentSlots:false,effective:null}];
 assert.equal(check(q).status,'consistent');
 w.anchorBindings[0].targetId='visible:month';assert.ok(check(q).violations.some(v=>v.kind==='invalid-anchor-alias'));
});
