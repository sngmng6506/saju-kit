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
