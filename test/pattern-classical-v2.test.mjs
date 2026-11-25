import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateClassicalCase,summarizeClassical} from '../scripts/lib/classical-pattern-evaluation.mjs';
import {auditClassicalPatterns} from '../scripts/audit-classical-patterns.mjs';
test('dataset identity and source scope',async()=>{
 const d=JSON.parse(await readFile(new URL('./fixtures/pattern-classical-v2.json',import.meta.url),'utf8'));
 assert.equal(d.cases.length,81);assert.equal(new Set(d.cases.map(c=>c.pillars.join(''))).size,d.cases.length);
 assert.equal(d.cases.filter(c=>c.split==='development-known').length,12);
 for(const c of d.cases){assert.ok(c.source.url);assert.equal(c.annotation.selectedUsefulStem,null);assert.equal(c.annotation.selectedAssistantStem,null);if(!c.eligible)assert.equal(c.annotation.expectedFamily,null);}
});
test('selective accuracy does not reward abstention or candidate recall',()=>{
 const base={eligible:true,annotation:{expectedFamily:'officer',sourceSelectedFamily:'officer',actors:[]},source:{transcription:'synthetic'},split:'control',id:'control'};
 const results=[null,{family:'officer'},{family:'wealth'}].map(selectedPattern=>evaluateClassicalCase(base,{selectedPattern,selection:{candidates:[{family:'officer'},{family:'wealth'}]}}));
 const s=summarizeClassical(results);
 assert.equal(s.candidateRecall,1);assert.equal(s.coverage,2/3);assert.equal(s.selectiveAccuracy,1/2);assert.equal(s.abstentionRate,1/3);
 assert.equal(summarizeClassical(results.slice(0,1)).selectiveAccuracy,null);
});
test('audit does not silently grant selection',()=>{
 const r=auditClassicalPatterns();assert.equal(r.summary.total,81);assert.equal(r.summary.coverage,0);assert.equal(r.summary.selectiveAccuracy,null);
});

test('chapter membership without an explicit selection label is not a selection trial',()=>{
 const c={eligible:true,annotation:{expectedFamily:'wealth',actors:[],sourceSelectedFamily:null},source:{transcription:'synthetic'},split:'control',id:'unlabelled'};
 const s=summarizeClassical([evaluateClassicalCase(c,{selectedPattern:{family:'wealth'},selection:{candidates:[{family:'wealth'}]}})]);
 assert.equal(s.candidateRecall,1);assert.equal(s.selectionLabelled,0);assert.equal(s.selectiveAccuracy,null);assert.equal(s.coverage,null);
});

import {reviewPatternOutcome,summarizeReferenceReadiness,summarizeOutcomeReviews} from '../scripts/lib/pattern-outcome-review.mjs';
import {auditPatternOutcomes} from '../scripts/audit-classical-patterns.mjs';
const syntheticOutcome=({completeHour=true,anchor=true}={})=>{
 const damage={from:'officer',to:'output',kind:'controlled-by-anchor',distinctSlots:true,rescueWitnesses:[]};
 const helper={from:'resource',to:'output',kind:'control',distinctSlots:true,rescueWitnesses:[
  {helper:'resource',obstacle:'output',target:'officer',relation:'controls-target',effective:null},
  {helper:'resource',obstacle:'output',target:'other-officer',relation:'controls-target',effective:null}]};
 return {completeHour,selection:{candidates:[{id:'p',family:'officer'}]},outcomes:[{candidateId:'p',motifs:[]}],
  routeReview:{reviews:[{candidateId:'p',anchorIds:anchor?['officer']:[],routes:[{id:'damage',observed:anchor,source:'control'},{id:'rescue',observed:anchor,source:'control'}]}]},
  qualityReview:{reviews:[{candidateId:'p',routes:[{routeId:'damage',kind:'damage',links:[damage]},{routeId:'rescue',kind:'rescue',links:[helper]}]}]},
  relativePattern:{routes:[{candidateId:'p',routes:[{id:'damage',links:[{from:'output',to:'officer',kind:'controlled-by-anchor',screen:'requires-review',edgeId:'d'}]},{id:'rescue',links:[{from:'resource',to:'output',kind:'control',screen:'root-and-locality-screen-met',edgeId:'r'}]}]}]},
  roleReview:[{candidateId:'p',paths:[]}]};
};
test('outcome review binds rescue to the same directed threat and target without confirming efficacy',()=>{
 const input=syntheticOutcome(),before=structuredClone(input),r=reviewPatternOutcome(input),c=r.candidates[0];
 assert.deepEqual(input,before);
 assert.equal(c.threats.length,1);assert.equal(c.threats[0].from,'output');assert.equal(c.threats[0].to,'officer');
 assert.equal(c.threats[0].possibleRescues.length,1);assert.equal(c.unmatchedRescues.length,1);
 assert.equal(c.unmatchedRescues[0].target,'other-officer');
 assert.equal(c.formed,null);assert.equal(c.broken,null);assert.equal(c.rescued,null);assert.equal(r.selectionAuthority,false);
 const s=summarizeOutcomeReviews([r]);assert.equal(s.threatWitnesses,1);assert.equal(s.threatsWithPossibleRescue,1);assert.equal(s.rescuedConfirmed,0);
});
test('anchorless routes, partial and unavailable charts do not manufacture conclusions',()=>{
 const a=reviewPatternOutcome(syntheticOutcome({anchor:false,completeHour:false}));
 assert.equal(a.status,'partial');assert.equal(a.candidates[0].threats.length,0);
 assert.ok(a.candidates[0].routes.every(r=>r.observed===null));
 assert.equal(reviewPatternOutcome({selection:null}).status,'unavailable');
});
test('source label inventory distinguishes unknown from negative and has no held-out claims',()=>{
 const c={id:'a',eligible:true,source:{url:'control',transcription:'checked'},annotation:{expectedFamily:'wealth',formed:false,actors:[]}};
 const s=summarizeReferenceReadiness([c]);assert.equal(s.formed,1);assert.equal(s.selectedFamily,0);
 assert.equal(s.heldOutConfirmed,0);assert.ok(!s.reviewQueue[0].missing.includes('formed'));
});
test('v10 outcome corpus review retains missing-label and authority boundaries',()=>{
 const a=auditPatternOutcomes();
 assert.equal(a.referenceReadiness.total,81);assert.equal(a.referenceReadiness.eligible,67);assert.equal(a.referenceReadiness.selectedFamily,13);
 assert.equal(a.referenceReadiness.selectedAssistantStem,0);assert.equal(a.all.charts,81);
 assert.equal(a.eligible.charts,67);assert.equal(a.all.authorityGranted,0);
 assert.equal(a.all.threatWitnesses,a.all.threatsWithPossibleRescue+a.all.threatsWithoutMatchedRescue);
 assert.equal(a.all.formedConfirmed+a.all.brokenConfirmed+a.all.rescuedConfirmed,0);
});

import {inspectCommentaryCorpus,evaluateCommentaryCase,summarizeCommentary} from '../scripts/lib/classical-commentary-evaluation.mjs';
import {auditClassicalCommentary} from '../scripts/audit-classical-patterns.mjs';
test('Xu commentary remains a distinct, unique and calendar-coherent development cohort',async()=>{
 const original=JSON.parse(await readFile(new URL('./fixtures/pattern-classical-v2.json',import.meta.url),'utf8'));
 const data=JSON.parse(await readFile(new URL('./fixtures/pattern-classical-commentary-v1.json',import.meta.url),'utf8'));
 const inv=inspectCommentaryCorpus(data,original);
 assert.deepEqual(inv,{total:34,combinedUnique:115,errors:[]});
 const invalid=structuredClone(data);
 invalid.cases[1].pillars=[...invalid.cases[0].pillars];
 assert.ok(inspectCommentaryCorpus(invalid,original).errors.some(e=>e.reason==='duplicate-chart'));
 const changed=structuredClone(data);
 changed.cases[0].pillars[3]='갑오';
 assert.ok(inspectCommentaryCorpus(changed,original).errors.some(e=>e.reason==='day-hour-incoherence'));
});
test('commentary rescue probes require a matched threat, not any role or an unmatched rescue',()=>{
 const c={id:'control',relatedGroup:null,annotation:{family:'wealth',outcome:'rescued',selectedUsefulStems:[],selectedAssistantStems:['갑'],rescueStems:['갑'],obstructionStems:['을']}};
 const r={selection:{candidates:[{family:'wealth'}]},routeReview:{occurrences:[{id:'a',stem:'갑',layer:'visible'},{id:'b',stem:'을',layer:'visible'}]}};
 const review={candidates:[{family:'wealth',threats:[{from:'b',possibleRescues:[]}],unmatchedRescues:[{helper:'a'}],paths:[{helperIds:['a']}]}]};
 const row=evaluateCommentaryCase(c,r,review);
 assert.equal(row.familyRetrieved,true);
 assert.equal(row.rescueProbes[0].observed,false);
 assert.equal(row.obstructionProbes[0].observed,true);
 assert.equal(row.outcomePrediction,null);
 assert.equal(summarizeCommentary([row]).finalOutcomeAccuracy,null);
 review.candidates[0].threats[0].possibleRescues.push({helper:'a'});
 assert.equal(evaluateCommentaryCase(c,r,review).rescueProbes[0].observed,true);
});
test('native v10 commentary audit preserves source label counts and abstains on unimplemented decisions',()=>{
 const r=auditClassicalCommentary();
 assert.equal(r.summary.total,34);
 assert.equal(r.inventory.combinedUnique,115);
 assert.equal(r.summary.sourceFamilyLabels,16);
 assert.deepEqual(r.summary.sourceOutcomeCounts,{formed:3,broken:1,rescued:4,'formed-with-damage':5});
 assert.equal(r.summary.explicitAssistantLabels,1);
 assert.equal(r.summary.commentaryUsefulStemLabels,5);
 assert.equal(r.summary.matchedRescueProbe.total,6);
 assert.equal(r.summary.damageActorProbe.total,7);
 assert.equal(r.summary.finalOutcomeAccuracy,null);
 assert.equal(r.summary.finalAssistantAccuracy,null);
 assert.ok(r.rows.every(x=>x.selectionAuthority===false));
});

import {reviewEfficacyEdge,reviewPatternEfficacy,summarizeEfficacyReviews} from '../scripts/lib/pattern-efficacy-review.mjs';
import {auditPatternEfficacy} from '../scripts/audit-classical-patterns.mjs';
const forceEdge=(from,to,{kind='control',blockers=[],relation='left-evidence-dominates'}={})=>({
 id:from+'>'+to,from,to,kind,blockers,relative:{relation},screen:blockers.includes('missing-hour')?'unresolved':blockers.length?'requires-review':'root-and-locality-screen-met',
 sourceLocalControlNodes:[],possibleLocalProtection:[],effective:null
});
const forceRef=(e,kind=e.kind)=>({from:e.from,to:e.to,kind,edgeId:e.id,screen:e.screen});
test('efficacy screen separates direction, control balance, unknown access and combination',()=>{
 const a=forceEdge('a','b'),g=new Map([[a.id,a]]);
 assert.equal(reviewEfficacyEdge(forceRef(a,'controlled-by-anchor'),g,true).status,'necessary-screen-met');
 assert.equal(reviewEfficacyEdge(forceRef(a),g,false).status,'unresolved');
 assert.throws(()=>reviewEfficacyEdge({...forceRef(a),from:'c'},g,true),/inconsistent/);
 assert.throws(()=>reviewEfficacyEdge({...forceRef(a),screen:'unresolved'},g,true),/inconsistent/);
 assert.equal(reviewEfficacyEdge({from:'a',to:'b',kind:'combine',edgeId:null,screen:'combination-effect-unresolved'},g,true).status,'unresolved');
 const b=forceEdge('a','b',{relation:'right-evidence-dominates'});g.set(b.id,b);
 assert.equal(reviewEfficacyEdge(forceRef(b),g,true).status,'review-required');
 const h=forceEdge('a','b',{blockers:['hidden-participant-access-unresolved','root-clash-exposure']});g.set(h.id,h);
 const q=reviewEfficacyEdge(forceRef(h),g,true);
 assert.equal(q.status,'unresolved');assert.ok(q.reviewReasons.includes('root-clash-exposure'));assert.equal(q.effective,null);
 const m=forceEdge('a','b',{relation:'mixed-evidence'});g.set(m.id,m);
 assert.ok(reviewEfficacyEdge(forceRef(m),g,true).reviewReasons.includes('control-evidence-incomparable'));
 const gen=forceEdge('a','b',{kind:'generate',relation:'right-evidence-dominates'});g.set(gen.id,gen);
 assert.equal(reviewEfficacyEdge(forceRef(gen,'generated-by-anchor'),g,true).status,'necessary-screen-met');
});
const efficacyControl=()=>{
 const a=forceEdge('output','officer'),b=forceEdge('resource','output');
 const damage=forceRef(a,'controlled-by-anchor'),helper=forceRef(b);
 const routes=[{id:'damage',kind:'damage',observed:true,links:[damage]},{id:'rescue',kind:'rescue',observed:true,links:[helper]}];
 const result={completeHour:true,relativeForce:{completeHour:true,edges:[a,b],triads:[]},
  relativePattern:{routes:[{candidateId:'p',routes}],paths:[{candidateId:'p',paths:[{id:'protect',unresolvedConditions:['resource-effective'],witnesses:[{roles:{helper:'resource',target:'officer',obstacle:'output'},edges:[helper,damage]}]}]}]}};
 const outcome={status:'structural-review',candidates:[{candidateId:'p',family:'officer',anchorIds:['officer'],routes,threats:[{routeId:'damage',...damage,possibleRescues:[{routeId:'rescue',helper:'resource',obstacle:'output',target:'officer'}]}]}]};
 return {result,outcome};
};
test('multi-edge rescue and named paths retain unresolved doctrinal conditions and never cancel damage',()=>{
 const {result,outcome}=efficacyControl();
 const before=structuredClone({result,outcome}),review=reviewPatternEfficacy(result,outcome),c=review.candidates[0];
 assert.deepEqual({result,outcome},before);
 assert.equal(c.threats[0].damage.status,'necessary-screen-met');
 const w=c.threats[0].possibleRescues[0];
 assert.equal(w.allEdgeScreensMet,true);assert.equal(w.status,'unresolved');assert.equal(w.neutralizesThreat,null);
 assert.equal(c.threats[0].neutralized,null);
 assert.equal(c.paths[0].witnesses[0].status,'unresolved');
 assert.ok(c.paths[0].witnesses[0].unresolved.includes('source-condition:resource-effective'));
 assert.equal(c.formed,null);assert.equal(c.rescued,null);assert.equal(review.selectionAuthority,false);
 const s=summarizeEfficacyReviews([review]);
 assert.equal(s.routeLinks['necessary-screen-met'],2);assert.equal(s.rescueWitnesses.unresolved,1);
 assert.equal(s.allRescueEdgeScreensMet,1);assert.equal(s.confirmedEffective,0);
 result.completeHour=false;assert.equal(reviewPatternEfficacy(result,outcome).status,'partial');
 assert.equal(reviewPatternEfficacy(result,outcome).candidates[0].routes[0].links[0].status,'unresolved');
 assert.equal(reviewPatternEfficacy({}, {status:'unavailable'}).status,'unavailable');
});
test('food-killing-day triad stays bound to its actual killing occurrence and does not resolve day capacity',()=>{
 const food=forceEdge('food','killing'),pressure=forceEdge('killing','day'),drain=forceEdge('day','food',{kind:'generate'});
 const triad={id:'t',food:'food',killing:'killing',day:'day',controlEdge:food.id,dayPressureEdge:pressure.id,dayOutputEdge:drain.id,dayRootEvidence:true,concerns:[]};
 const candidates=['killing','other'].map(id=>({candidateId:id,family:'killing',anchorIds:[id],routes:[],threats:[]}));
 const result={completeHour:true,relativeForce:{completeHour:true,edges:[food,pressure,drain],triads:[triad]},
  relativePattern:{routes:candidates.map(c=>({candidateId:c.candidateId,routes:[]})),paths:candidates.map(c=>({candidateId:c.candidateId,paths:[]}))}};
 const r=reviewPatternEfficacy(result,{status:'structural-review',candidates});
 assert.equal(r.candidates[0].triads.length,1);assert.equal(r.candidates[1].triads.length,0);
 assert.ok(r.candidates[0].triads[0].unresolved.includes('source-condition:day-capacity'));
 assert.equal(r.candidates[0].triads[0].effectiveControl,null);
});
test('native efficacy audit reports cohorts separately without final outcome authority',()=>{
 const r=auditPatternEfficacy();
 assert.equal(r.shen.summary.charts,67);assert.equal(r.xu.summary.charts,34);assert.equal(r.excludedShen,14);
 for(const s of [r.shen.summary,r.xu.summary]){
  assert.equal(s.confirmedEffective,0);assert.equal(s.finalOutcomeAccuracy,null);
  assert.equal(s.selectionAuthority,false);
  assert.ok(s.candidates>0);
 }
});
