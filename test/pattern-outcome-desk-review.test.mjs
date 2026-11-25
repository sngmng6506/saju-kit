import test from 'node:test';
import assert from 'node:assert/strict';
import {observeKillingWealthDualRole} from '../src/features/pattern/outcome-compound-motifs.js';
import {bindDeskReview,summarizeDeskReview} from '../scripts/lib/pattern-outcome-desk-review.mjs';
import {projectMechanismClimate} from '../src/features/pattern/outcome-mechanism.js';
import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const e=(from,to,kind)=>({from,to,kind});
const sample=()=>({family:'killing',status:'diagnostic',rules:[
 {id:'killing-resource-blocks-food',kind:'damage',witnesses:[{id:'d',roles:{obstacle:'resource',food:'output',target:'killing'},edges:[e('resource','output','control'),e('output','killing','control')]}]},
 {id:'killing-wealth-removes-resource',kind:'rescue',threatRuleId:'killing-resource-blocks-food',witnesses:[{id:'r',threatWitnessId:'d',roles:{helper:'wealth',obstacle:'resource',food:'output',target:'killing'},edges:[e('wealth','resource','control')]}]},
 {id:'killing-wealth',kind:'damage',witnesses:[{id:'f',roles:{obstacle:'wealth',target:'killing'},edges:[e('wealth','killing','generate')]}]}
]});
test('same wealth relieves obstruction and feeds the exact same killing without confirming either effect',()=>{
 const q=sample(),before=JSON.stringify(q),r=observeKillingWealthDualRole(q,true)[0];
 assert.equal(r.observed,true);assert.equal(r.witnesses.length,1);const w=r.witnesses[0];
 assert.equal(w.boundThreat.witnessId,'d');assert.equal(w.paths.wealthGeneratesKilling.from,'wealth');assert.equal(w.killingDeficiencyConfirmed,null);
 assert.equal(w.netEffectConfirmed,null);assert.equal(r.outcomeConfirmed,null);assert.equal(JSON.stringify(q),before);
});
test('mismatched actor, threat, target or missing directed edge cannot form dual-role motif',()=>{
 for(const modify of [q=>q.rules[2].witnesses[0].roles.obstacle='other',q=>q.rules[2].witnesses[0].roles.target='other',
  q=>q.rules[1].witnesses[0].threatWitnessId='other',q=>q.rules[0].witnesses[0].edges.pop(),q=>q.rules[2].witnesses[0].edges[0].kind='control']){
  const q=sample();modify(q);assert.equal(observeKillingWealthDualRole(q,true)[0].observed,false);
 }
});
test('partial or missing rule coverage is unknown rather than a negative interpretation',()=>{
 const q=sample();q.rules[2].witnesses=[];assert.equal(observeKillingWealthDualRole(q,false)[0].observed,null);
 q.rules.pop();assert.equal(observeKillingWealthDualRole(q,true)[0].observed,null);
});
test('desk review requires exact coverage and cannot be promoted to independent gold',()=>{
 const p={id:'p',claim:'removal-disputed',endpointBasis:'explicit-stems'},s={cases:[{id:'c',probes:[p]}]};
 const d={scope:'model-assisted-development-source-review-not-independent',independentGold:0,rows:[{caseId:'c',probeId:'p',reading:'disputed-removal',source:'https://example.com',locator:'chapter',rationale:'dispute',effectAgreement:null}]};
 assert.equal(bindDeskReview(s,d).errors.length,0);
 d.rows[0].reading='asserted-removal';assert.ok(bindDeskReview(s,d).errors.length>0);
 d.rows[0].reading='disputed-removal';d.independentGold=1;assert.ok(bindDeskReview(s,d).errors.length>0);
 const r=summarizeDeskReview([{id:'c',probes:[{id:'p',status:'supported',deskReview:d.rows[0],trace:{stage:'hypothesis-observed'}}]}]);
 assert.equal(r.gaps.length,1);assert.equal(r.effectAgreement,null);assert.equal(r.independentGold,0);
});
test('incomplete climate requirement coverage is unknown, not absent',()=>{
 const c={requirementContext:{requirements:[],baselineGroups:[['병']],alternatives:[]}};
 assert.equal(projectMechanismClimate(c,false).groups[0].allExactVisibleAndRootObserved,null);
 assert.equal(projectMechanismClimate(c,true).groups[0].allExactVisibleAndRootObserved,false);
});
test('frozen source review covers all ten original probes without changing their labels',()=>{
 const read=n=>JSON.parse(readFileSync(new URL('./fixtures/'+n,import.meta.url),'utf8'));
 const s=read('pattern-outcome-mechanism-source-v2.json'),d=read('pattern-outcome-mechanism-desk-review-v1.json');
 assert.equal(bindDeskReview(s,d).errors.length,0);assert.equal(d.rows.length,10);
});
test('native Zhou chart retains dual-role evidence alongside adverse witness and abstention',()=>{
 const ps=['무술','갑자','정미','경술'],saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))};
 const r=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 const motifs=r.compoundReview.flatMap(q=>q.motifs).filter(m=>m.id==='killing-wealth-rescue-with-killing-supply');
 assert.ok(motifs.some(m=>m.witnesses.some(w=>w.paths.wealthGeneratesKilling.from==='visible:hour'&&w.paths.wealthGeneratesKilling.to==='hidden:month:계')));
 assert.equal(r.rescued,null);assert.equal(r.decisionReview.status,'abstained');
});
