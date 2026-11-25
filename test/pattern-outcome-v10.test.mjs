import test from 'node:test';
import assert from 'node:assert/strict';
import {observeOutcomeDecision,outcomeDecisionRelease} from '../src/features/pattern/outcome-decision-gate.js';
import {analyzePatternOutcomeV10,analyzePatternOutcomeEfficacy,PATTERN_OUTCOME_V10_VERSION,PATTERN_OUTCOME_EFFICACY_VERSION} from '../src/index.js';
const w=(ruleId,witnessId,kind)=>({ruleId,witnessId,kind,status:'edge-screens-met',flags:[],unresolvedConditions:['effective-condition'],edges:[],anchorAlternatives:[]});
const sample=()=>{
 const q={candidateId:'c',family:'officer',anchorIds:['visible:year'],status:'support-and-damage-observed',rules:[{id:'s',kind:'support'},{id:'d',kind:'damage'},{id:'r',kind:'rescue'},{id:'reg',kind:'support',impact:'conditional-regulation-not-confirmed-support'}]};
 const common={candidateId:'c',status:'diagnostic',selectionAuthority:false};
 const threats=[{threat:{ruleId:'d',witnessId:'d1'},coverage:'structural-route-observed',alternatives:[{ruleId:'r',witnessId:'r1',status:'edge-screens-met'}],resolutionConfirmed:null}];
 return {access:{},completeHour:true,reviews:[q],integrity:{status:'consistent',candidates:[{...common,status:'consistent'}]},
  efficacyReview:{status:'diagnostic',candidates:[{...common,witnesses:[w('s','s1','support'),w('d','d1','damage'),w('r','r1','rescue'),w('reg','g1','support')],threats}]},
  compoundReview:[{...common,violations:[]}],assistantReview:[{...common,candidates:[{occurrenceId:'visible:hour',classification:'observed-route-dependent',observedRouteDependencyKeys:['k']}]}],
  clarityReview:[{...common,blockers:{uncoveredThreats:[],assistantInjury:[]},dualRoleIds:[]}],extensionReview:[{...common,branchDependencies:[],combinationInjury:[]}],
  preference:{status:'hypothesis',hypothesis:{family:'officer',candidateIds:['c'],anchorStems:['신'],grounds:['month']}},purityReview:{motifs:[]}};
};
test('all seven release axes are independently closed and returned copies cannot unlock them',()=>{
 const r=outcomeDecisionRelease();assert.equal(Object.keys(r.axes).length,7);
 r.axes.pattern.authorized=true;r.axes.pattern.blockers.length=0;
 assert.equal(outcomeDecisionRelease().axes.pattern.authorized,false);assert.ok(outcomeDecisionRelease().axes.pattern.blockers.length);
});
test('passing screens do not grant a verdict; ordinary support separate from regulation',()=>{
 const r=observeOutcomeDecision(sample()),c=r.candidates[0];
 assert.equal(r.status,'abstained');assert.equal(r.pattern.evidence.hypothesis.family,'officer');
 for(const d of [r.pattern,r.purity,...Object.values(c.decisions)]){assert.equal(d.value,null);assert.equal(d.authorized,false);assert.ok(d.blockers.length);}
 assert.equal(c.structural.support.length,1);assert.equal(c.structural.regulation.length,1);
 assert.ok(c.decisions.formation.blockers.includes('witness-effect-or-rule-conditions-unresolved'));
 assert.equal(c.decisions.rescue.evidence.threats[0].resolutionConfirmed,null);
});
test('no witnesses cannot be interpreted as negative, and missing hour propagates',()=>{
 const a=sample();a.completeHour=false;a.efficacyReview.candidates[0].witnesses=[];a.efficacyReview.candidates[0].threats=[];
 const r=observeOutcomeDecision(a),d=r.candidates[0].decisions;
 assert.ok(d.breakage.blockers.includes('no-covered-damage-witness'));assert.equal(d.breakage.value,null);
 assert.ok(d.formation.blockers.includes('missing-hour'));assert.ok(r.pattern.blockers.includes('missing-hour'));
});
test('candidate mismatch and invalid evidence fail closed',()=>{
 const a=sample();a.assistantReview=[];const r=observeOutcomeDecision(a);
 assert.equal(r.status,'invalid-evidence');assert.ok(r.globalBlockers.includes('candidate-coverage-mismatch'));assert.equal(r.candidates[0].status,'invalid-evidence');
 assert.equal(r.pattern.evidence.hypothesis,null);assert.equal(r.candidates[0].decisions.assistant.value,null);
});
test('unavailable and out of scope are distinguished from negative',()=>{
 const a=observeOutcomeDecision({access:null,completeHour:true,reviews:[]});assert.equal(a.status,'unavailable');assert.equal(a.pattern.value,null);
 const b=sample();b.reviews[0].status='out-of-scope';const r=observeOutcomeDecision(b);
 assert.equal(r.candidates[0].status,'out-of-scope');assert.equal(r.candidates[0].decisions.formation.value,null);
});
test('storage uncertainty, uncovered threats and assistant injury are traceable',()=>{
 const a=sample();a.reviews[0].storageProjection={};a.efficacyReview.candidates[0].threats[0].coverage='no-covered-route';a.extensionReview[0].combinationInjury=[{assistantId:'visible:hour'}];
 const d=observeOutcomeDecision(a).candidates[0].decisions;
 assert.ok(d.formation.blockers.includes('storage-access-and-family-unresolved'));assert.ok(d.rescue.blockers.includes('uncovered-threats'));
 assert.ok(d.assistant.blockers.includes('assistant-combination-injury-unresolved'));assert.ok(d.clarity.blockers.includes('assistant-injury-unresolved'));
});
test('native V10 keeps inherited evidence and ignores supplied approval',()=>{
 const ps=['정묘','신유','갑자','임신'],saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:ps[i][0],branch:ps[i][1],text:ps[i]}]))},args={saju,birthBasis:'verified-chart'};
 const a=analyzePatternOutcomeEfficacy({...args,policy:PATTERN_OUTCOME_EFFICACY_VERSION});
 const b=analyzePatternOutcomeV10({...args,policy:PATTERN_OUTCOME_V10_VERSION,authorized:true,validationReceipt:{passed:true},decisionRelease:{status:'approved'}});
 const {decisionReview,version,scope,...rest}=b;
 assert.deepEqual(rest,Object.fromEntries(Object.entries(a).filter(([k])=>!['version','scope'].includes(k))));
 assert.equal(decisionReview.status,'abstained');assert.equal(b.formed,null);assert.equal(b.selectedPattern,null);
 assert.ok(Object.values(decisionReview.release.axes).every(x=>!x.authorized&&x.validationReceipt===null));
 assert.equal(analyzePatternOutcomeV10({...args,birthBasis:'provisional-chart',policy:PATTERN_OUTCOME_V10_VERSION}).decisionReview.status,'unavailable');
 assert.throws(()=>analyzePatternOutcomeV10({...args,policy:PATTERN_OUTCOME_EFFICACY_VERSION}),{code:'pattern-policy'});
});
