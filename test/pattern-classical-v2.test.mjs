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
