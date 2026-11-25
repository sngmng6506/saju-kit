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

import {allOf,anyOf,not,alternatives,evaluateOutcomeLogic,reviewOutcomeDecision,summarizeOutcomeDecisions} from '../scripts/lib/pattern-outcome-decision.mjs';
import {auditOutcomeDecisions} from '../scripts/audit-classical-patterns.mjs';
test('outcome algebra obeys three-valued truth tables and open-world coverage',()=>{
 const values=[true,false,null];
 const and=[[true,false,null],[false,false,false],[null,false,null]],or=[[true,true,true],[true,false,null],[true,null,null]];
 for(let i=0;i<3;i++)for(let j=0;j<3;j++){
  assert.equal(allOf([values[i],values[j]]),and[i][j]);
  assert.equal(anyOf([values[i],values[j]]),or[i][j]);
  assert.equal(not(allOf([values[i],values[j]])),anyOf([not(values[i]),not(values[j])]));
 }
 assert.deepEqual(values.map(not),[false,true,null]);
 assert.equal(alternatives([]),null);assert.equal(alternatives([],{exhaustive:true}),false);
 assert.equal(alternatives([false]),null);assert.equal(alternatives([false],{exhaustive:true}),false);
 assert.throws(()=>allOf([undefined]),/invalid truth/);
});
test('conditional outcome algebra distinguishes clean, damaged, rescued, incomplete and independent threats',()=>{
 const threat=(id,damage,rescues=[],rescueInventoryComplete=true)=>({id,damage,rescues,rescueInventoryComplete});
 const run=(support,threats,threatInventoryComplete=true)=>evaluateOutcomeLogic({support,threats,threatInventoryComplete});
 assert.equal(run(true,[]).hypothesis,'cleanFormation');
 assert.equal(run(true,[threat('a',true)]).hypothesis,'formationWithDamage');
 assert.equal(run(false,[threat('a',true)]).hypothesis,'damageWithoutSupport');
 assert.equal(run(true,[threat('a',true,[true])]).hypothesis,'formationAfterRescue');
 const mixed=run(true,[threat('a',true,[true]),threat('b',true)]);
 assert.equal(mixed.hypothesis,'formationWithDamage');assert.equal(mixed.rescuedDamage,true);
 assert.equal(mixed.threats[0].remainingDamage,false);assert.equal(mixed.threats[1].remainingDamage,true);
 assert.equal(run(true,[],false).hypothesis,null);
 assert.equal(run(true,[threat('a',true,[],false)]).hypothesis,null);
 assert.equal(run(true,[threat('a',true,[true])],false).hypothesis,null);
 assert.equal(run(null,[threat('a',true)]).hypothesis,null);
 assert.equal(run(false,[]).hypothesis,null);
 assert.equal(mixed.formed,null);assert.equal(mixed.broken,null);assert.equal(mixed.rescued,null);
 assert.throws(()=>run(true,[threat('a',true),threat('a',false)]),/duplicate threat/);
});
const decisionControl=()=>{
 const result={completeHour:true,outcomes:[{candidateId:'p',family:'officer',motifs:[
  {id:'s',kind:'support',source:'control',predicate:null,clauses:[{kind:'present',matched:true},{kind:'contextual',name:'force',matched:null}]},
  {id:'d',kind:'damage',source:'control',predicate:false,clauses:[{kind:'present',matched:false},{kind:'contextual',name:'damage',matched:null}]},
  {id:'r',kind:'rescue',source:'control',predicate:true,clauses:[{kind:'present',matched:true}]}
 ]}]};
 const outcome={status:'structural-review',candidates:[{candidateId:'p',family:'officer'}]};
 const efficacy={status:'research-review',candidates:[{candidateId:'p',family:'officer',routes:[],paths:[],triads:[],threats:[
  {routeId:'damage',damage:{from:'output',to:'officer',effective:null,status:'necessary-screen-met'},possibleRescues:[{neutralizesThreat:null}]}
 ]}]};
 return {result,outcome,efficacy};
};
test('source motif truth does not imply effective force, and excluded clauses do not close the source inventory',()=>{
 const {result,outcome,efficacy}=decisionControl(),before=structuredClone({result,outcome,efficacy});
 const r=reviewOutcomeDecision(result,outcome,efficacy),c=r.candidates[0];
 assert.deepEqual({result,outcome,efficacy},before);
 assert.deepEqual(c.summary.damage.excluded,['d']);assert.equal(c.summary.damage.effective,null);
 assert.deepEqual(c.summary.rescue.literalMatched,['r']);assert.equal(c.motifs[2].effective,null);
 assert.equal(c.motifs[1].effective,false);assert.equal(c.logic.status,'abstained');assert.equal(c.formed,null);
 assert.ok(c.reviewReasons.includes('motif:s:force'));
 assert.equal(r.selectedPattern,null);assert.equal(r.selectionAuthority,false);
 const s=summarizeOutcomeDecisions([r]);assert.equal(s.abstained,1);assert.equal(s.finalDecisions,0);
 assert.equal(s.motifCounts.rescue.literalMatched,1);
 assert.deepEqual(s.conditionBacklog,[{condition:'force',occurrences:1,chartCount:1,families:['officer'],motifs:['s']}]);
 result.completeHour=false;assert.equal(reviewOutcomeDecision(result,outcome,efficacy).status,'partial');
 assert.equal(reviewOutcomeDecision({}, {status:'unavailable'}, {}).status,'unavailable');
 result.outcomes[0].motifs[0].predicate=true;
 assert.throws(()=>reviewOutcomeDecision(result,outcome,efficacy),/inconsistent motif predicate/);
});
test('native outcome decision audit preserves separate cohorts and reports abstention instead of unsupported decisions',()=>{
 const r=auditOutcomeDecisions();
 assert.equal(r.shen.summary.charts,67);assert.equal(r.xu.summary.charts,34);assert.equal(r.excludedShen,14);
 for(const s of [r.shen.summary,r.xu.summary]){
  assert.ok(s.candidates>0);assert.equal(s.abstained,s.candidates);assert.equal(s.finalDecisions,0);
  assert.equal(s.finalOutcomeAccuracy,null);assert.equal(s.selectionAuthority,false);
  for(const x of Object.values(s.motifCounts))assert.equal(x.total,x.literalMatched+x.excluded+x.unresolved);
 }
});

test('exhaustive two-threat logic never grants final authority across 972 combinations',()=>{
 const vs=[true,false,null];let n=0;
 for(const support of vs)for(const a of vs)for(const b of vs)for(const ra of vs)for(const rb of vs)
 for(const complete of [true,false])for(const rescueComplete of [true,false]){
  const x=evaluateOutcomeLogic({support,threatInventoryComplete:complete,threats:[
   {id:'a',damage:a,rescues:[ra],rescueInventoryComplete:rescueComplete},
   {id:'b',damage:b,rescues:[rb],rescueInventoryComplete:rescueComplete}]});
  n++;assert.notEqual(x.status,'conflicting-premises');assert.equal(x.selectionAuthority,false);
  assert.equal(x.formed,null);assert.equal(x.broken,null);assert.equal(x.rescued,null);
 }
 assert.equal(n,972);
});

import {compareScenarioRows,observeStrengthContext,reviewPatternContext,summarizePatternContexts} from '../scripts/lib/pattern-context-review.mjs';
import {auditPatternContexts} from '../scripts/audit-classical-patterns.mjs';
const contextStrength=(direction='strong')=>({version:'strength-decision-v1',scope:'ordinary-chart-assumption',completeHour:true,status:'hypothesis',direction,
 decision:{direction,conflicts:[],grounds:['control']},axes:{rootCapacity:{min:40,max:50}},seasonRobustness:{passed:true},
 observations:{interaction:{rows:[{support:10,conditionalResource:6,peerStem:4,burden:{wealth:7,officer:8,output:2}},
 {support:20,conditionalResource:15,peerStem:5,burden:{wealth:12,officer:25,output:3}}]}}});
test('context uses paired scenario comparisons and never treats mixed evidence as a measured force',()=>{
 const c=observeStrengthContext(contextStrength(),true);
 assert.equal(c.dayStrongHypothesis,true);assert.equal(c.actualDayCapacity,null);
 assert.equal(c.comparisons.supportVsBurden.wealth.status,'left-dominates-all');
 assert.equal(c.comparisons.supportVsBurden.officer.status,'scenario-sensitive');
 assert.equal(c.comparisons.conditionalResourceVsNominalWealth.status,'scenario-sensitive');
 assert.equal(c.comparisons.visiblePeerVsNominalWealth.status,'right-dominates-all');
 assert.equal(compareScenarioRows([{a:4,b:4}],r=>r.a,r=>r.b).status,'equal-all');
 assert.throws(()=>compareScenarioRows([{a:-1,b:0}],r=>r.a,r=>r.b),/invalid scenario mass/);
 assert.equal(observeStrengthContext(contextStrength('weak'),true).dayStrongHypothesis,false);
 const conflict=contextStrength();conflict.decision.conflicts.push('opposing-grounds');
 assert.equal(observeStrengthContext(conflict,true).dayStrongHypothesis,null);
 assert.equal(observeStrengthContext(contextStrength(),false).dayStrongHypothesis,null);
 assert.equal(observeStrengthContext({...contextStrength(),scope:'other'},true).dayStrongHypothesis,null);
 assert.equal(observeStrengthContext({...contextStrength(),status:'unresolved'},true).dayStrongHypothesis,null);
});
const contextControl=()=>{
 const occurrence=(id,tenGod,dayReference=false)=>({id,tenGod,dayReference});
 const edge=(from,to)=>({id:from+'>'+to,from,to,kind:'control',relative:{relation:'mixed-evidence'},screen:'requires-review',blockers:['nonadjacent']});
 const result={completeHour:true,routeReview:{occurrences:[occurrence('day','비견',true),occurrence('peer','겁재'),occurrence('wealth','정재'),occurrence('other','편재')]},
 relativeForce:{edges:[edge('day','wealth'),edge('peer','wealth'),edge('peer','other')]}};
 const outcome={status:'structural-review',candidates:[{candidateId:'p',family:'wealth',anchorIds:['wealth']}]};
 const efficacy={status:'research-review',candidates:[{candidateId:'p',family:'wealth',routes:[],triads:[]}]};
 const motif=(id,name)=>({id,kind:'support',source:'control',predicate:null,effective:null,clauses:[{id:'present:0',kind:'present',value:true},{id:name,kind:'contextual',value:null}]});
 const decision={status:'research-review',candidates:[{candidateId:'p',family:'wealth',motifs:[motif('a','day-strong'),motif('b','day-and-resource-strong'),motif('c','resource-light'),motif('d','unimplemented')]}]};
 return {result,outcome,efficacy,decision};
};
test('only the explicit ordinary-strength proxy resolves conditionally; day and other anchors are excluded from peer pressure',()=>{
 const {result,outcome,efficacy,decision}=contextControl(),strength=contextStrength(),before=structuredClone({result,outcome,efficacy,decision,strength});
 const r=reviewPatternContext(result,outcome,efficacy,decision,strength),c=r.candidates[0];
 assert.deepEqual({result,outcome,efficacy,decision,strength},before);
 assert.deepEqual(c.evidence.peerWealth.map(p=>p.id),['peer>wealth']);
 assert.deepEqual(c.motifs.map(m=>m.conditionalPredicate),[true,null,null,null]);
 assert.ok(c.motifs.every(m=>m.baselinePredicate===null&&m.effective===null));
 assert.ok(c.motifs.every(m=>m.clauses[1].context.doctrinalValue===null));
 const weak=reviewPatternContext(result,outcome,efficacy,decision,contextStrength('weak'));
 assert.deepEqual(weak.candidates[0].motifs.map(m=>m.conditionalPredicate),[false,false,null,null]);
 assert.equal(weak.candidates[0].formed,null);assert.equal(weak.selectionAuthority,false);
 const s=summarizePatternContexts([r,weak]);
 assert.equal(s.conditionalMotifMatched,1);assert.equal(s.conditionalMotifExcluded,2);
 assert.equal(s.doctrinalConditionsResolved,0);assert.equal(s.finalDecisions,0);
 result.completeHour=false;
 assert.ok(reviewPatternContext(result,outcome,efficacy,decision,strength).candidates[0].motifs.every(m=>m.conditionalPredicate===null));
 assert.equal(reviewPatternContext({}, {status:'unavailable'}, {}, {}, strength).status,'unavailable');
});
test('native context audit pins strength policy and separates the two development cohorts',()=>{
 const r=auditPatternContexts();
 assert.equal(r.strengthPolicy,'strength-decision-v1');
 assert.equal(r.shen.summary.charts,67);assert.equal(r.xu.summary.charts,34);assert.equal(r.excludedShen,14);
 for(const s of [r.shen.summary,r.xu.summary]){
  assert.equal(s.ordinaryStrength.strong+s.ordinaryStrength.weak+s.ordinaryStrength.unresolved,s.charts);
  assert.equal(s.doctrinalConditionsResolved,0);assert.equal(s.finalDecisions,0);
  assert.equal(s.selectionAuthority,false);
  assert.ok(s.candidates>0);
 }
});

import {observeStemInterference,reviewCandidateInterference,reviewPatternInterference,reviewInterferenceConditions,summarizeInterference} from '../scripts/lib/pattern-stem-interference.mjs';
import {auditPatternInterference} from '../scripts/audit-classical-patterns.mjs';
const intStem=(position,stem,tenGod,contacts=[],layer='visible')=>({id:layer==='visible'?'visible:'+position:'hidden:'+position+':'+stem,position,stem,tenGod,contacts,layer,dayReference:position==='day'&&layer==='visible'});
const intEdge=(from,to,kind)=>({id:from+'>'+to,from,to,kind});
test('adjacent and distant competitors remain distinct; self-combination is never removal',()=>{
 const a='stem.combine:year-month',b='stem.combine:month-day';
 const stems=[intStem('year','경','편관',[a]),intStem('month','을','겁재',[a,b]),intStem('day','경','비견',[b]),intStem('hour','정','정관')];
 const obs=observeStemInterference({occurrences:stems},{edges:[]},true);
 assert.equal(obs.pairs.length,2);assert.equal(obs.competition.length,1);
 assert.ok(obs.pairs.every(p=>p.status==='competing-adjacent-contact'&&p.exclusivePairObserved===false));
 assert.equal(obs.pairs.find(p=>p.id===b).dayContactKind,'day-participates');
 assert.ok(obs.pairs.every(p=>p.removedParticipants.length===0&&p.effective===null));
 const c='stem.combine:year-hour';
 const distant=[intStem('year','경','편관',[a,c]),intStem('month','을','겁재',[a]),intStem('day','갑','비견'),intStem('hour','을','겁재',[c])];
 const q=observeStemInterference({occurrences:distant},{edges:[]},true);
 assert.equal(q.pairs.find(p=>p.id===a).status,'adjacent-no-adjacent-competitor');
 assert.equal(q.pairs.find(p=>p.id===a).exclusivePairObserved,false);
 assert.deepEqual(q.pairs.find(p=>p.id===a).remoteCompetitorIds,[c]);
 assert.equal(q.pairs.find(p=>p.id===c).status,'separated-contact');
 assert.ok(observeStemInterference({occurrences:distant},{edges:[]},false).pairs.every(p=>p.status==='partial'&&p.exclusivePairObserved===null));
 assert.throws(()=>observeStemInterference({occurrences:[intStem('year','경','편관',[a])]},{edges:[]},false),/unpaired/);
});
test('preservation binds the actual protected occurrence, including hidden anchors, without cancellation',()=>{
 const a='stem.combine:year-month';
 const stems=[intStem('year','경','편관',[a]),intStem('month','을','겁재',[a]),intStem('day','갑','비견'),intStem('hour','신','정관'),intStem('month','신','정관',[],'hidden')];
 const obs=observeStemInterference({occurrences:stems},{edges:[]},true);
 const c=reviewCandidateInterference({candidateId:'p',family:'officer',anchorIds:['hidden:month:신']},obs,stems);
 assert.equal(c.witnesses.length,1);assert.equal(c.witnesses[0].ruleId,'combine-killing-preserve-officer');
 assert.equal(c.witnesses[0].target,'hidden:month:신');assert.ok(c.witnesses[0].concerns.includes('hidden-target-access'));
 assert.equal(c.witnesses[0].preserved,null);assert.equal(c.rescued,null);
 assert.equal(reviewCandidateInterference({candidateId:'q',family:'officer',anchorIds:[]},obs,stems).witnesses.length,0);
 const wc=[...stems,intStem('year','무','편재',[],'hidden')];
 const wObs=observeStemInterference({occurrences:wc},{edges:[intEdge('hidden:year:무','visible:year','generate')]},true);
 const w=reviewCandidateInterference({candidateId:'w',family:'wealth',anchorIds:['hidden:year:무']},wObs,wc);
 assert.equal(w.witnesses.length,1);assert.equal(w.witnesses[0].relation,'reverse-generate');
 assert.equal(w.witnesses[0].threatEdgeId,'hidden:year:무>visible:year');
 const wrong=observeStemInterference({occurrences:wc},{edges:[intEdge('visible:year','hidden:year:무','generate')]},true);
 assert.equal(reviewCandidateInterference({candidateId:'w',family:'wealth',anchorIds:['hidden:year:무']},wrong,wc).witnesses.length,0);
});
test('ordered interference retains both directed mediator edges and actual positional separation',()=>{
 const stems=[intStem('year','무','편재'),intStem('month','경','편관'),intStem('day','임','비견'),intStem('hour','갑','식신')];
 const edges=[intEdge('visible:year','visible:day','control'),intEdge('visible:year','visible:month','generate'),intEdge('visible:month','visible:day','generate')];
 const obs=observeStemInterference({occurrences:stems},{edges},true),d=obs.directed.find(e=>e.kind==='control');
 assert.deepEqual(d.between,['visible:month']);assert.deepEqual(d.interference[0].mediatedGeneration,['visible:year>visible:month','visible:month>visible:day']);
 assert.equal(d.effective,null);
 const v=[intStem('year','무','편재'),intStem('month','병','식신'),intStem('day','갑','비견'),intStem('hour','임','편인')];
 const result={completeHour:true,stemForce:{completeHour:true,occurrences:v},relativeForce:{completeHour:true,edges:[intEdge('visible:year','visible:hour','control')]},routeReview:{occurrences:v}};
 const outcome={status:'structural-review',candidates:[{candidateId:'p',family:'resource',anchorIds:['visible:hour']}]};
 const before=structuredClone({result,outcome});
 const review=reviewPatternInterference(result,outcome),s=review.candidates[0].separation[0];
 assert.deepEqual({result,outcome},before);assert.equal(s.dayBetween,true);assert.equal(s.scope,'anchor-related');assert.equal(s.noninterferenceConfirmed,null);
 assert.equal(summarizeInterference([review]).separationWitnesses,1);assert.equal(review.selectionAuthority,false);
 assert.equal(reviewPatternInterference({}, {status:'unavailable'}).status,'unavailable');
});
test('native interference audit retains cohort scope and does not remove or preserve any actor conclusively',()=>{
 const r=auditPatternInterference();
 assert.equal(r.shen.summary.charts,67);assert.equal(r.xu.summary.charts,34);assert.equal(r.excludedShen,14);
 for(const s of [r.shen.summary,r.xu.summary]){
  assert.equal(s.pairs,s.adjacent+s.separated);assert.equal(s.confirmedRemoval,0);assert.equal(s.confirmedPreservation,0);assert.equal(s.selectionAuthority,false);
 }
});

test('related interference witnesses are not doctrinal truth and excluded motifs remain excluded',()=>{
 const candidate={witnesses:[{ruleId:'combine-killing-preserve-officer',combinationId:'a',helper:'h',obstacle:'o',target:'t'}],separation:[{edgeId:'b'}]};
 const motif=(id,name,predicate=null)=>({id,predicate,clauses:[{kind:'contextual',name}]});
 const rows=reviewInterferenceConditions([
  motif('m','killing-combined-without-loss-of-officer'),
  motif('n','wealth-resource-noninterference',false),
  motif('x','wealth-controls-resource-preserves-food'),
  motif('z','unimplemented')],candidate);
 assert.equal(rows.length,3);assert.equal(rows[0].status,'related-structure-observed');assert.equal(rows[1].status,'literal-motif-excluded');
 assert.equal(rows[2].status,'no-related-structure-observed');assert.ok(rows.every(r=>r.doctrinalValue===null&&r.effective===null));
});

import {reviewRoleContrasts,summarizeRoleContrasts} from '../scripts/lib/pattern-role-contrasts.mjs';
import {auditRoleContrasts} from '../scripts/audit-classical-patterns.mjs';
const contrastActor=(id,position,tenGod,layer='visible')=>({id,position,tenGod,layer,dayReference:id==='d'});
const contrastEdge=(from,to,kind)=>({id:from+'>'+to,from,to,kind,screen:'root-and-locality-screen-met',relative:{relation:'same-evidence-profile'},blockers:[],sourceLocalControlNodes:[]});
const contrastInput=(actors,edges,candidates,complete=true)=>({
 result:{completeHour:complete,routeReview:{occurrences:actors},relativeForce:{completeHour:complete,edges}},
 outcome:{status:complete?'structural-review':'partial',candidates}
});
const patternRows=(c,id)=>c.patterns.find(p=>p.id===id).witnesses;
test('same wealth-resource relation preserves damage and regulation as alternatives, not a favorable verdict',()=>{
 const a=[contrastActor('w','year','정재'),contrastActor('r','month','정인'),contrastActor('d','day','비견'),contrastActor('other','hour','편인')];
 const edges=[contrastEdge('w','r','control'),contrastEdge('r','d','generate'),contrastEdge('other','d','generate')];
 const {result,outcome}=contrastInput(a,edges,[{candidateId:'r',family:'resource',anchorIds:['r']},{candidateId:'o',family:'resource',anchorIds:['other']}]);
 const before=structuredClone({result,outcome});
 const review=reviewRoleContrasts(result,outcome,{strength:{dayStrongHypothesis:true}},{pairs:[]});
 const c=review.candidates[0],damage=patternRows(c,'wealth-resource-damage')[0],regulation=patternRows(c,'wealth-resource-regulation')[0];
 assert.deepEqual({result,outcome},before);
 assert.deepEqual(damage.roles,regulation.roles);assert.equal(c.contrasts.length,1);
 assert.equal(damage.favorable,null);assert.equal(regulation.favorable,null);assert.equal(regulation.conditionalPredicate,null);
 assert.equal(patternRows(review.candidates[1],'wealth-resource-regulation').length,0);
 const weak=reviewRoleContrasts(result,outcome,{strength:{dayStrongHypothesis:false}},{pairs:[]});
 assert.equal(patternRows(weak.candidates[0],'wealth-resource-regulation')[0].status,'conditional-excluded');
 assert.notEqual(patternRows(weak.candidates[0],'wealth-resource-damage')[0].status,'conditional-excluded');
 const partial=reviewRoleContrasts({...result,completeHour:false},outcome,{strength:{dayStrongHypothesis:false}},{pairs:[]});
 assert.equal(patternRows(partial.candidates[0],'wealth-resource-regulation')[0].conditionalPredicate,null);
 assert.equal(partial.status,'partial');assert.equal(review.selectionAuthority,false);
});
test('food damage, wealth protection and killing-resource transmission share exact food and owl',()=>{
 const actors=[contrastActor('w','year','정재','hidden'),contrastActor('r','year','편인'),contrastActor('f','month','식신'),contrastActor('d','day','비견'),contrastActor('k','hour','편관')];
 const edges=[contrastEdge('r','f','control'),contrastEdge('w','r','control'),contrastEdge('k','r','generate'),contrastEdge('r','d','generate')];
 const {result,outcome}=contrastInput(actors,edges,[{candidateId:'f',family:'food',anchorIds:['f']}]);
 const r=reviewRoleContrasts(result,outcome,null,{pairs:[]}),c=r.candidates[0];
 assert.equal(patternRows(c,'owl-food-damage').length,1);assert.equal(patternRows(c,'owl-food-protected-by-wealth').length,1);
 assert.equal(patternRows(c,'food-to-killing-resource').length,1);assert.equal(c.contrasts.length,2);
 assert.ok(c.contrasts.every(x=>x.resolution===null));assert.equal(c.rescued,null);
 const reverse=reviewRoleContrasts({...result,relativeForce:{...result.relativeForce,edges:edges.filter(e=>e.from!=='k')}},outcome,null,{pairs:[]});
 assert.equal(patternRows(reverse.candidates[0],'food-to-killing-resource').length,0);
});
test('killing alternatives retain direct pressure, wealth-fed killing, combination contacts and shared anchors',()=>{
 const actors=[contrastActor('w','year','정재','hidden'),contrastActor('r','year','정인'),contrastActor('f','month','식신'),contrastActor('d','day','비견'),contrastActor('k','hour','편관'),contrastActor('k2','hour','편관','hidden')];
 const edges=[contrastEdge('d','f','generate'),contrastEdge('f','k','control'),contrastEdge('k','d','control'),contrastEdge('k','r','generate'),contrastEdge('r','d','generate'),contrastEdge('r','f','control'),contrastEdge('w','r','control'),contrastEdge('w','k','generate')];
 const {result,outcome}=contrastInput(actors,edges,[{candidateId:'k',family:'killing',anchorIds:['k']},{candidateId:'k2',family:'killing',anchorIds:['k2']}]);
 const review=reviewRoleContrasts(result,outcome,{strength:{dayStrongHypothesis:true}},{pairs:[{id:'contact',participants:['r','w']}]});
 const c=review.candidates[0],w=patternRows(c,'wealth-protects-food-controller')[0];
 assert.equal(patternRows(c,'food-controls-killing').length,1);assert.equal(patternRows(c,'killing-resource-transmission').length,1);
 assert.equal(w.additionalEdges[0].edgeId,'w>k');assert.deepEqual(w.contacts,['contact']);
 assert.equal(w.status,'structure-requires-review');assert.equal(w.effective,null);
 assert.ok(review.candidates[1].patterns.every(p=>p.witnesses.length===0));
 const summary=summarizeRoleContrasts([review]);
 assert.equal(summary.finalDecisions,0);
 assert.ok(summary.visibleOnlyWitnesses>0);
 assert.ok(summary.blockerCounts.some(b=>b.reason==='additional-wealth-killing-edge'&&b.chartCount===1&&b.witnesses===1));
 assert.equal(reviewRoleContrasts({}, {status:'unavailable'},null,null).status,'unavailable');
});
test('native role contrast audit preserves cohort counts and authority boundary',()=>{
 const r=auditRoleContrasts();assert.equal(r.shen.summary.charts,67);assert.equal(r.xu.summary.charts,34);assert.equal(r.excludedShen,14);
 for(const s of [r.shen.summary,r.xu.summary]){
  assert.equal(s.confirmedEffective,0);assert.equal(s.finalDecisions,0);assert.equal(s.selectionAuthority,false);
  for(const p of Object.values(s.byPattern))assert.equal(p.witnesses,p.screenMet+p.requiresReview+p.conditionalExcluded);
 }
});

import {observeActorAccess,bindCandidateAccess,classifyAccessEdge,reviewPatternAccess,scopedOutcome,summarizeAccess} from '../scripts/lib/pattern-access-review.mjs';
import {auditPatternAccess} from '../scripts/audit-classical-patterns.mjs';
const accessActor=(position,layer,stem,element,role=null)=>({id:layer==='visible'?'visible:'+position:'hidden:'+position+':'+stem,position,layer,stem,element,role,dayReference:layer==='visible'&&position==='day'});
test('hidden projection is exact, independent of same-element roots and day reference',()=>{
 const actors=[accessActor('year','visible','갑','wood'),accessActor('day','visible','을','wood'),
 accessActor('month','hidden','갑','wood','principal'),accessActor('hour','hidden','을','wood','middle'),accessActor('year','hidden','병','fire','principal')];
 const rows=observeActorAccess(actors,true),get=id=>rows.find(x=>x.id===id);
 assert.deepEqual(get('hidden:month:갑').exactVisibleIds,['visible:year']);
 assert.deepEqual(get('hidden:hour:을').exactVisibleIds,[]);
 assert.deepEqual(get('hidden:hour:을').sameElementVisibleIds,['visible:year']);
 assert.equal(get('hidden:hour:을').dayStemMatch,true);
 assert.equal(get('hidden:hour:을').exactProjectionObserved,false);
 assert.equal(observeActorAccess(actors,false).find(x=>x.id==='hidden:hour:을').exactProjectionObserved,null);
 assert.equal(get('hidden:month:갑').independentHiddenAction,null);
 assert.equal(get('visible:year').rootMatches.length,2);
});
test('month anchor scope preserves monthly source and projected actors without promoting other hidden copies',()=>{
 const actors=[accessActor('year','visible','갑','wood'),accessActor('day','visible','을','wood'),accessActor('month','hidden','갑','wood','principal'),
 accessActor('hour','hidden','갑','wood','middle'),accessActor('month','hidden','을','wood','middle'),accessActor('hour','visible','을','wood')];
 const legacy=['visible:year','hidden:month:갑','hidden:hour:갑'];
 const base={id:'p',family:'resource',kind:'month-principal',stems:['갑']};
 const p=bindCandidateAccess(base,actors,legacy,true);
 assert.deepEqual(p.sourceIds,['hidden:month:갑']);assert.deepEqual(p.visibleActorIds,['visible:year']);
 assert.deepEqual(p.excludedLegacyIds,['hidden:hour:갑']);
 const exact=bindCandidateAccess({...base,kind:'month-hidden-projection',positions:['year']},actors,legacy,true);
 assert.equal(exact.basis,'exact-month-projection');
 assert.throws(()=>bindCandidateAccess({...base,kind:'month-hidden-projection',positions:['hour']},actors,legacy,true),/unbound exact/);
 const storageActors=actors.filter(o=>o.id!=='hidden:month:을');
 const storage=bindCandidateAccess({...base,kind:'month-storage-projection',stems:['을'],positions:['hour'],element:'wood'},storageActors,['visible:hour'],true);
 assert.deepEqual(storage.sourceIds,[]);assert.deepEqual(storage.contextIds,['hidden:month:갑']);
 assert.deepEqual(storage.scopedAnchorIds,['visible:hour']);
 const formation=bindCandidateAccess({...base,kind:'month-formation',stems:['갑','을']},actors,[...legacy,'hidden:month:을','visible:hour'],true);
 assert.deepEqual(formation.scopedAnchorIds,[]);
});
test('access layers distinguish vertical from branch and visible edges without replacing a hidden actor',()=>{
 const actors=[accessActor('year','visible','갑','wood'),accessActor('month','visible','병','fire'),accessActor('day','visible','무','earth'),
 accessActor('year','hidden','병','fire','principal'),accessActor('hour','hidden','갑','wood','principal')];
 const edges=[{id:'a',from:'visible:year',to:'visible:month',kind:'generate'},
 {id:'b',from:'visible:year',to:'hidden:year:병',kind:'generate'},
 {id:'c',from:'hidden:hour:갑',to:'hidden:year:병',kind:'generate'},
 {id:'d',from:'hidden:hour:갑',to:'visible:month',kind:'generate'}];
 const idx=new Map(actors.map(o=>[o.id,o])),acc=new Map(observeActorAccess(actors,true).map(o=>[o.id,o]));
 const rows=edges.map(e=>classifyAccessEdge(e,idx,acc,true));
 assert.deepEqual(rows.map(r=>r.layerKind),['visible-visible','same-pillar-stem-branch','branch-branch','cross-pillar-stem-branch']);
 assert.deepEqual(rows[2].projectedSourceAlternatives,['visible:year']);
 assert.deepEqual(rows[2].projectedTargetAlternatives,['visible:month']);
 assert.ok(rows.every(r=>r.effective===null));
 assert.equal(classifyAccessEdge(edges[0],idx,acc,false).accessStatus,'partial');
});
test('scoped comparison does not mutate original anchors or expand legacy candidate scope',()=>{
 const actors=[accessActor('year','visible','갑','wood'),accessActor('month','hidden','갑','wood','principal'),accessActor('hour','hidden','갑','wood','middle')];
 const selection={candidates:[{id:'p',family:'resource',kind:'month-principal',stems:['갑']}]};
 const result={completeHour:true,selection,routeReview:{occurrences:actors},relativeForce:{completeHour:true,edges:[]}};
 const outcome={status:'structural-review',candidates:[{candidateId:'p',family:'resource',anchorIds:actors.map(o=>o.id)}]};
 const before=structuredClone({result,outcome}),r=reviewPatternAccess(result,outcome),scoped=scopedOutcome(outcome,r);
 assert.deepEqual({result,outcome},before);
 assert.equal(scoped.candidates[0].anchorIds.length,2);assert.equal(outcome.candidates[0].anchorIds.length,3);
 assert.equal(summarizeAccess([r]).excludedLegacyAnchors,1);assert.equal(r.selectionAuthority,false);
 assert.equal(reviewPatternAccess({}, {status:'unavailable'}).status,'unavailable');
});
test('native access ablation preserves candidates and cannot increase the scoped role witness count',()=>{
 const r=auditPatternAccess();
 assert.equal(r.shen.access.charts,67);assert.equal(r.xu.access.charts,34);
 for(const cohort of [r.shen,r.xu]){
  assert.equal(cohort.legacy.candidates,cohort.scoped.candidates);
  for(const [id,p] of Object.entries(cohort.scoped.byPattern))assert.ok(p.witnesses<=cohort.legacy.byPattern[id].witnesses);
  assert.equal(cohort.access.confirmedHiddenActions,0);assert.equal(cohort.scoped.finalDecisions,0);
 }
});

import {reviewLayerMechanisms,reviewCoherentProjection,reviewContrastProjections,summarizeLayerMechanisms,summarizeContrastProjections} from '../scripts/lib/pattern-layer-mechanisms.mjs';
import {auditLayerMechanisms} from '../scripts/audit-classical-patterns.mjs';
const layerFixture=()=>{
 const actors=[accessActor('year','visible','갑','wood'),accessActor('month','visible','병','fire'),accessActor('day','visible','무','earth'),
 accessActor('hour','visible','임','water'),accessActor('year','hidden','병','fire','principal'),
 accessActor('month','hidden','갑','wood','middle'),accessActor('day','hidden','임','water','residual'),
 accessActor('hour','hidden','무','earth','principal')].map(o=>({...o,clashExposed:o.layer==='hidden'?false:null}));
 const pairs=[['visible:year','visible:month','generate'],['visible:year','hidden:year:병','generate'],
 ['hidden:month:갑','visible:month','generate'],['hidden:day:임','visible:day','control'],
 ['hidden:month:갑','hidden:year:병','generate'],['hidden:day:임','hidden:year:병','control'],
 ['hidden:month:갑','visible:day','control'],['visible:year','visible:day','control'],
 ['hidden:hour:무','hidden:day:임','control'],['visible:day','visible:hour','control']];
 const edges=pairs.map(([from,to,kind])=>({...contrastEdge(from,to,kind),blockers:[...(from.startsWith('hidden:')||to.startsWith('hidden:')?['hidden-participant-access-unresolved']:[])],
 screen:from.startsWith('hidden:')||to.startsWith('hidden:')?'requires-review':'root-and-locality-screen-met'}));
 const result={completeHour:true,selection:{candidates:[]},routeReview:{occurrences:actors},relativeForce:{completeHour:true,edges}};
 const access=reviewPatternAccess(result,{status:'structural-review',candidates:[]});
 const interaction={completeHour:true,formations:[{id:'group',type:'branch.threeHarmony',layer:'branch',positions:['year','month','hour'],complete:true}],
 disruptions:[{id:'clash',type:'branch.clash',positions:['day','hour']}]};
 return {result,access,interaction};
};
test('layered mechanisms preserve hidden role, branch pair context, direct visible screens and directed projection alternatives',()=>{
 const {result,access,interaction}=layerFixture(),before=structuredClone({result,access,interaction});
 const r=reviewLayerMechanisms(result,access,interaction),get=(a,b)=>r.edges.find(e=>e.from===a&&e.to===b);
 assert.deepEqual({result,access,interaction},before);
 assert.equal(get('visible:year','visible:month').status,'necessary-screen-met');
 const v=get('visible:year','hidden:year:병');
 assert.equal(v.mechanism,'vertical-principal-relation');assert.equal(v.structuralStatus,'principal-vertical-observed');
 assert.deepEqual(v.branchContext.pairFormationIds,[]);assert.equal(v.effective,null);
 assert.equal(get('hidden:month:갑','visible:month').mechanism,'vertical-constituent-relation');
 assert.ok(get('hidden:day:임','visible:day').unresolved.includes('constituent-participation-unadjudicated'));
 const b=get('hidden:month:갑','hidden:year:병');
 assert.deepEqual(b.branchContext.pairFormationIds,['group']);assert.equal(b.structuralStatus,'branch-relation-context-observed');
 assert.deepEqual(b.projectedAlternatives.map(a=>a.edgeId),['visible:year>visible:month']);
 assert.deepEqual(get('hidden:day:임','hidden:year:병').projectedAlternatives,[]);
 assert.equal(get('hidden:month:갑','visible:day').structuralStatus,'visible-alternative-observed');
 assert.ok(get('hidden:hour:무','hidden:day:임').reviewReasons.includes('branch-disruption-contact'));
 assert.ok(r.edges.every(e=>e.effective===null));
 const s=summarizeLayerMechanisms([r]);assert.equal(s.edges,10);assert.equal(s.confirmedEffects,0);
 assert.equal(reviewLayerMechanisms(result,access,{...interaction,completeHour:false}).status,'partial');
});
test('coherent visible projection binds one actor per role and enforces visible candidate anchor',()=>{
 const {result,access,interaction}=layerFixture(),r=reviewLayerMechanisms(result,access,interaction);
 const witness={id:'w',roles:{resource:'hidden:month:갑',food:'hidden:year:병',day:'visible:day'},
 edges:[{edgeId:'hidden:month:갑>hidden:year:병',from:'hidden:month:갑',to:'hidden:year:병',kind:'generate'},
 {edgeId:'hidden:month:갑>visible:day',from:'hidden:month:갑',to:'visible:day',kind:'control'}]};
 const p=reviewCoherentProjection(witness,'resource',{visibleActorIds:['visible:year']},access,r);
 assert.equal(p.alternatives.length,1);
 assert.deepEqual(p.alternatives[0].roles,{resource:'visible:year',food:'visible:month',day:'visible:day'});
 assert.equal(p.alternatives[0].effective,null);
 assert.equal(reviewCoherentProjection(witness,'resource',{visibleActorIds:[]},access,r).observed,false);
 const invalid=structuredClone(witness);invalid.edges[0].kind='control';
 assert.throws(()=>reviewCoherentProjection(invalid,'resource',{visibleActorIds:['visible:year']},access,r),/unbound witness/);
 const split={...access,actors:access.actors.map(a=>a.id==='hidden:year:병'?{...a,exactVisibleIds:['visible:year']}:a)};
 assert.equal(reviewCoherentProjection(witness,'resource',{visibleActorIds:['visible:year']},split,r).alternatives.length,0);
 const candidate={candidateId:'c',visibleActorIds:['visible:year']};
 const contrasts={candidates:[{candidateId:'c',patterns:[{id:'p',anchorRole:'resource',witnesses:[witness,{...witness,id:'w2'}]}]}]};
 const summary=summarizeContrastProjections([reviewContrastProjections(contrasts,{...access,candidates:[candidate]},r)]);
 assert.equal(summary.alternativeOccurrences,2);assert.equal(summary.uniquePerChartAlternativeAssignments,1);
});
test('native layer audit preserves graph counts, direct visible screen equivalence and projection partitions',()=>{
 const r=auditLayerMechanisms();assert.equal(r.shen.layers.charts,67);assert.equal(r.xu.layers.charts,34);
 for(const c of [r.shen,r.xu]){
  assert.equal(c.layers.edges,Object.values(c.layers.byLayer).reduce((n,x)=>n+x.edges,0));
  assert.deepEqual(c.layers.byLayer['visible-visible'].legacy,c.layers.byLayer['visible-visible'].layered);
  assert.equal(c.projections.hiddenWitnesses,c.projections.withCoherentVisibleAlternative+c.projections.withoutObservedAlternative+c.projections.unresolved);
  assert.equal(c.layers.confirmedEffects+c.projections.confirmedEffects,0);
 }
});

import {inspectActionReferences,evaluateActionReference,summarizeActionReferences} from '../scripts/lib/pattern-action-reference.mjs';
import {auditActionReferences} from '../scripts/audit-classical-patterns.mjs';
const actionControl=()=>{
 const reference={id:'a',chartId:'c',author:'沈孝瞻',mechanism:'control',state:'supported',phase:'natal-reading',scope:'edge-effect',split:'development-reference',edges:[{from:'a',to:['b','c'],kind:'control',quantifier:'any'}]};
 const result={completeHour:true,routeReview:{occurrences:['a','b','c'].map(id=>({id}))}};
 const edge=(to,status,reasons)=>({id:'a>'+to,from:'a',to,kind:'control',layerKind:'visible-visible',status,legacyStatus:status,unresolved:[],reviewReasons:reasons,legacyUnresolved:[],legacyReviewReasons:reasons});
 return {reference,result,layers:{status:'research-review',edges:[edge('b','review-required',['root','nonadjacent']),edge('c','review-required',['root'])]}};
};
test('action reference existential alternatives preserve common and incidental reasons separately',()=>{
 const {reference,result,layers}=actionControl(),before=structuredClone({reference,result,layers});
 const row=evaluateActionReference(reference,result,layers,null),summary=summarizeActionReferences([row]);
 assert.deepEqual({reference,result,layers},before);
 assert.equal(row.allObserved,true);assert.equal(row.screenDisposition,'screen-withholds');
 assert.equal(row.predictedEffect,null);
 assert.deepEqual(summary.supportedWithheldSharedLegacyReasons,[{reason:'root',count:1}]);
 assert.equal(summary.supportedWithheldLegacyReasons.length,2);
 assert.equal(summary.groups.supported.withheld,1);assert.equal(summary.finalEfficacyAccuracy,null);
 layers.edges[1].status='necessary-screen-met';
 assert.equal(evaluateActionReference(reference,result,layers,null).screenDisposition,'all-probes-have-passing-alternative');
});
test('source phase, limitation and combination are not binary effect labels',()=>{
 const {reference,result,layers}=actionControl();
 const limited=evaluateActionReference({...reference,state:'limited',combination:{participants:['b','c']}},result,layers,{pairs:[{participants:['c','b']}]});
 assert.equal(limited.combinationObserved,true);assert.equal(limited.state,'limited');assert.equal(limited.predictedEffect,null);
 const missing=evaluateActionReference({...reference,combination:{participants:['b','c']}},result,layers,{pairs:[]});
 assert.equal(missing.screenDisposition,'structure-missing');
 const before=evaluateActionReference({...reference,state:'blocked',phase:'before-rescue-explanation'},result,layers,null);
 const route=evaluateActionReference({...reference,scope:'route-interpretation'},result,layers,null);
 const excluded=evaluateActionReference({...reference,split:'excluded-source-review'},result,layers,null);
 assert.ok([before,route,excluded].every(x=>x.comparable===false));
 const s=summarizeActionReferences([limited,before,route,excluded]);
 assert.equal(s.comparable,1);assert.equal(s.groups.blocked.references,0);assert.equal(s.groups.limited.references,1);
 assert.throws(()=>evaluateActionReference({...reference,edges:[{from:'missing',to:['b'],kind:'control'}]},result,layers,null),/unbound reference occurrence/);
});
test('action references retain corpus identity and separate incomplete templates',async()=>{
 const read=async file=>JSON.parse(await readFile(new URL('./fixtures/'+file,import.meta.url),'utf8'));
 const [a,s,x]=await Promise.all(['pattern-action-reference-v1.json','pattern-classical-v2.json','pattern-classical-commentary-v1.json'].map(read));
 assert.deepEqual(inspectActionReferences(a,s,x),{references:12,uniqueCharts:11,excluded:1,partialTemplates:3,errors:[]});
 const bad=structuredClone(a);bad.cases[0].rawPillars='incorrect';bad.cases[0].independentlyAdjudicated=true;
 assert.ok(inspectActionReferences(bad,s,x).errors.some(e=>e.reason==='transcription-mismatch'));
 assert.ok(inspectActionReferences(bad,s,x).errors.some(e=>e.reason==='provenance'));
});
test('native action reference audit preserves annotation scope and does not claim accuracy',()=>{
 const r=auditActionReferences();
 assert.equal(r.inventory.errors.length,0);assert.equal(r.summary.references,12);assert.equal(r.summary.comparable,8);
 assert.equal(r.summary.groups.supported.references,5);assert.equal(r.summary.groups.limited.references,3);
 assert.equal(r.summary.groups.blocked.references,0);assert.equal(r.summary.finalEfficacyAccuracy,null);
 assert.equal(r.summary.selectionAuthority,false);
});
