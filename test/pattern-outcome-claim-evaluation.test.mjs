import test from 'node:test';
import assert from 'node:assert/strict';
import {buildClaimPacket,claimReviewTemplate,adjudicateClaims,readClaimPrediction,compareClaim,evaluateClaimComparisons} from '../scripts/lib/pattern-outcome-claim-evaluation.mjs';
const intake={version:'p1-5b-intake-v1',candidates:[{id:'test',pillars:['갑자','병인','무진','기미'],source:{work:'test',commentator:'test',edition:'test',chapter:'test',passage:'test',url:'https://example.test'}}]};
const edge={kind:'action-effect',from:'visible:year',to:'visible:day',relation:'control'};
const route={kind:'route-relief',route:'mediation',controller:'visible:year',helper:'visible:month',target:'visible:day'};
const pair={kind:'pair-restriction',participants:['visible:hour','visible:year']};
const branch={kind:'branch-context',description:'test scope'};
const draft={version:'p1-5d-claim-draft-v1',tasks:[edge,route,pair,branch].map((target,i)=>({id:'t'+i,chartId:'test',target}))};
const packet=buildClaimPacket(intake,draft),digest='test-digest';
const review=(id,values=['yes','no','yes','yes'],scope='ordinary')=>({...claimReviewTemplate(packet,digest),reviewerId:id,noEngineOutputConsulted:true,noPriorLabelsConsulted:true,priorExposure:'none-declared',
 charts:[{chartId:'test',scope,rationale:'test'}],responses:packet.tasks.map((t,i)=>({taskId:t.id,label:values[i],sourceLocator:'test',rationale:'test'}))});
const native=()=>({version:'pattern-outcome-decision-v10',completeHour:true,selectionAuthority:false,selectedPattern:null,formed:null,broken:null,rescued:null,assistantGod:null,patternUsefulGod:null,usefulElement:null,decisionReview:{status:'abstained'},efficacyReview:{status:'diagnostic',mechanismReview:{
 actionSynthesis:{status:'diagnostic',actions:[{edgeId:'visible:year>visible:day',from:edge.from,to:edge.to,kind:'control',actualEffect:{subject:'visible:year>visible:day',kind:'actual-action-effective',level:'effect-hypothesis',state:'unresolved'},direct:{state:'supported'},combined:{state:'supported'},structural:{state:'supported'},interposition:{visibleRoutes:[{pathId:JSON.stringify(['mediation','month:stem','year:stem','day:stem']),proof:{state:'supported'},actualReliefState:'unresolved'}]}}]},
 combinationPolicyReview:{pairs:[{pairId:JSON.stringify(pair.participants),participantIds:pair.participants,actualRestrictionState:'unresolved',contactHypothesis:'supported'}]}}}});
test('packet validates exact direction, route and pair identities and excludes expected labels',()=>{
 assert.equal(packet.tasks.length,4);
 assert.throws(()=>buildClaimPacket(intake,{...draft,tasks:[{...draft.tasks[0],target:{...edge,relation:'generate'}}]}));
 assert.throws(()=>buildClaimPacket(intake,{...draft,tasks:[{...draft.tasks[0],expected:'yes'}]}));
 assert.throws(()=>buildClaimPacket(intake,{...draft,tasks:[{...draft.tasks[1],target:{...route,helper:'visible:hour'}}]}));
 assert.throws(()=>buildClaimPacket(intake,{...draft,tasks:[{...draft.tasks[2],target:{...pair,participants:['visible:year','visible:hour']}}]}));
 assert.throws(()=>buildClaimPacket(intake,{...draft,tasks:[draft.tasks[0],{...draft.tasks[0],id:'duplicate'}]}));
});
test('two distinct reviews, packet binding, exact coverage and unresolved agreement',()=>{
 assert.equal(adjudicateClaims(packet,digest,[review('A')]).status,'pending');
 assert.equal(adjudicateClaims(packet,digest,[review('A'),review('a')]).status,'invalid-review');
 assert.equal(adjudicateClaims(packet,digest,[review('A'),{...review('B'),packetDigest:'wrong'}]).status,'invalid-review');
 const r=adjudicateClaims(packet,digest,[review('A'),review('B',['no','no','undetermined','yes'])]);
 assert.equal(r.rows[0].status,'disagreement');assert.equal(r.rows[1].agreedLabel,'no');assert.equal(r.rows[2].agreedLabel,null);
 assert.equal(r.independentGoldCases,0);
 assert.equal(adjudicateClaims(packet,digest,[review('A'),review('B',undefined,'uncertain')]).rows[1].status,'scope-review-required');
});
test('actual effects are not modeled direct, combined, contact or route support',()=>{
 const n=native();
 for(const t of [edge,route,pair]){
  const p=readClaimPrediction(t,n);assert.equal(p.status,'mapped');assert.equal(p.state,'unresolved');assert.equal(compareClaim('yes',p),'model-abstention');assert.equal(compareClaim('no',p),'model-abstention');
 }
 assert.equal(readClaimPrediction(branch,n).status,'model-scope-gap');
 n.efficacyReview.mechanismReview.actionSynthesis.actions[0].actualEffect.state='supported';
 assert.equal(readClaimPrediction(edge,n).status,'invalid-model-output');
});
test('missing exact row is scope gap, duplicate identity or unsafe envelope is invalid',()=>{
 const n=native(),a=n.efficacyReview.mechanismReview.actionSynthesis.actions;
 a.push({...a[0]});assert.equal(readClaimPrediction(edge,n).status,'invalid-model-output');
 a.length=0;assert.equal(readClaimPrediction(edge,n).status,'model-scope-gap');
 n.formed=true;assert.equal(readClaimPrediction(branch,n).status,'invalid-model-output');
});
test('generic signed comparator distinguishes conflict, explicit disagreement and no coverage',()=>{
 const p=state=>({status:'mapped',state});
 assert.equal(compareClaim('yes',p('supported')),'agreement');
 assert.equal(compareClaim('no',p('supported')),'disagreement');
 assert.equal(compareClaim('yes',p('opposed')),'disagreement');
 assert.equal(compareClaim('no',p('opposed')),'agreement');
 assert.equal(compareClaim('yes',p('conflicting')),'model-conflict');
 assert.equal(compareClaim(null,p('supported')),'reference-unresolved');
});
test('fixed denominators preserve abstentions, unmapped claims and unverified authenticity',()=>{
 const rows=[{chartId:'test',pillars:intake.candidates[0].pillars,native:native()}],reviews=[review('A'),review('B')];
 const r=evaluateClaimComparisons(packet,digest,reviews,rows);
 assert.equal(r.status,'diagnostic-unverified-input');assert.equal(r.denominators.allTasks,4);assert.equal(r.denominators.determinateReferenceTasks,4);assert.equal(r.counts['model-abstention'],3);assert.equal(r.counts['model-scope-gap'],1);
 assert.equal(r.diagnosticCoverage,0);assert.equal(r.diagnosticAgreement,null);assert.equal(r.independentGoldCases,0);
 assert.equal(evaluateClaimComparisons(packet,digest,reviews,[]).status,'invalid-model-output');
 assert.equal(evaluateClaimComparisons(packet,digest,reviews,[{...rows[0],pillars:['갑자','병인','무진','신미']}]).status,'invalid-model-output');
});
