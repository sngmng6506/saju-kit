// Release-owned authority. No caller flags, chart labels, or structural
// screen may grant authority. A future validated decision policy requires a
// new implementation and release, not a mutable boolean.
const AXES=['pattern','formation','breakage','rescue','assistant','purity','clarity'];
const RELEASE_BLOCKERS=Object.freeze({
 pattern:Object.freeze(['no-validated-pattern-selection-policy']),
 formation:Object.freeze(['no-validated-effective-force-policy','no-independent-formation-gold']),
 breakage:Object.freeze(['no-validated-effective-force-policy','no-independent-breakage-gold']),
 rescue:Object.freeze(['no-validated-effective-rescue-policy','no-independent-rescue-gold']),
 assistant:Object.freeze(['no-validated-assistant-necessity-policy','no-independent-assistant-gold']),
 purity:Object.freeze(['no-validated-purity-policy','no-independent-purity-gold']),
 clarity:Object.freeze(['no-validated-clarity-policy','no-independent-clarity-gold'])
});
export function outcomeDecisionRelease(){
 return {version:'outcome-decision-release-v1',status:'research-only',validatedPolicy:null,
  axes:Object.fromEntries(AXES.map(axis=>[axis,{authorized:false,validationReceipt:null,blockers:[...RELEASE_BLOCKERS[axis],'release-native-regression-not-certified']}]))};
}
const unique=xs=>[...new Set(xs)].sort();
const ref=w=>({ruleId:w.ruleId,witnessId:w.witnessId});
const key=(r,w)=>JSON.stringify([r,w]);
const axis=(release,name,blockers,evidence)=>({status:'abstained',value:null,authorized:false,
 blockers:unique([...release.axes[name].blockers,...blockers]),evidence});
function candidateDecision(q,e,c,a,l,x,i,complete,release,global){
 const base={candidateId:q.candidateId,family:q.family,anchorIds:[...q.anchorIds],selectionAuthority:false};
 const b=[...global,...(!complete?['missing-hour']:[]),...(q.storageProjection?['storage-access-and-family-unresolved']:[])];
 const excluded=q.status==='out-of-scope';
 if(excluded)b.push('candidate-out-of-scope');
 const derived=[e,c,a,l,x,i];
 const valid=derived.every(v=>v&&v.candidateId===q.candidateId&&v.selectionAuthority===false)&&i?.status==='consistent'&&
  [e,c,a,l].every(v=>v.status!=='invalid-evidence');
 if(!valid)b.push('invalid-or-missing-candidate-evidence');
 const rows=!excluded&&valid?e.witnesses:[];
 const ruleBy=new Map(q.rules.map(r=>[r.id,r]));
 const classified=rows.map(w=>({...ref(w),status:w.status,flags:[...w.flags],
  conditions:[...w.unresolvedConditions],edgeBlockers:unique([...w.edges,...w.anchorAlternatives.flatMap(a=>a.edge?[a.edge]:[])].flatMap(e=>e.blockers??[]))}));
 const support=rows.filter(w=>w.kind==='support'&&ruleBy.get(w.ruleId)?.impact!=='conditional-regulation-not-confirmed-support');
 const damage=rows.filter(w=>w.kind==='damage'),rescue=rows.filter(w=>w.kind==='rescue');
 const refs=ws=>ws.map(w=>classified.find(v=>key(v.ruleId,v.witnessId)===key(w.ruleId,w.witnessId)));
 const unresolved=ws=>ws.some(w=>w.status!=='edge-screens-met'||w.unresolvedConditions.length>0)?['witness-effect-or-rule-conditions-unresolved']:[];
 const threats=!excluded&&valid?e.threats:[];
 const assistants=!excluded&&valid?a.candidates.map(v=>({occurrenceId:v.occurrenceId,classification:v.classification,dependencyKeys:[...v.observedRouteDependencyKeys]})):[];
 const branchDependencies=!excluded&&valid?x.branchDependencies:[];
 const combinationInjury=!excluded&&valid?x.combinationInjury:[];
 const conflicts=!excluded&&valid?l.blockers:null;
 const structural={support:refs(support),damage:refs(damage),rescue:refs(rescue),
  regulation:refs(rows.filter(w=>w.kind==='support'&&ruleBy.get(w.ruleId)?.impact==='conditional-regulation-not-confirmed-support')),
  exception:refs(rows.filter(w=>w.kind==='exception'))};
 const no=(ws,code)=>ws.length?[]:[code];
 const decisions={
  formation:axis(release,'formation',[...b,...no(support,'no-covered-support-witness'),...unresolved(support),...(damage.length?['adverse-witnesses-unresolved']:[])],{support:structural.support,adversity:structural.damage}),
  breakage:axis(release,'breakage',[...b,...no(damage,'no-covered-damage-witness'),...unresolved(damage),...(rescue.length?['conditional-rescue-routes-unresolved']:[])],{damage:structural.damage,threats}),
  rescue:axis(release,'rescue',[...b,...no(damage,'no-covered-threat'),...no(rescue,'no-covered-rescue-witness'),...unresolved(rescue),
   ...(threats.some(t=>t.coverage==='no-covered-route')?['uncovered-threats']:[]),...(threats.some(t=>t.coverage==='route-unknown')?['threat-route-unknown']:[])],{rescue:structural.rescue,threats}),
  assistant:axis(release,'assistant',[...b,...no(assistants,'no-covered-assistant-participant'),...(assistants.length?['observed-dependency-not-classical-necessity']:[]),
   ...(combinationInjury.length?['assistant-combination-injury-unresolved']:[])],{participants:assistants,branchDependencies,combinationInjury}),
  clarity:axis(release,'clarity',[...b,'role-coherence-not-effective-clarity',...(conflicts?.uncoveredThreats.length?['uncovered-threats']:[]),
   ...(conflicts?.assistantInjury.length||combinationInjury.length?['assistant-injury-unresolved']:[])],{conflicts,dualRoleIds:!excluded&&valid?[...l.dualRoleIds]:[]})
 };
 return {...base,status:!valid?'invalid-evidence':excluded?'out-of-scope':'abstained',structural,decisions};
}
export function observeOutcomeDecision(result){
 const release=outcomeDecisionRelease();
 const global=[];
 if(!result.access)global.push('chart-evidence-unavailable');
 if(!result.completeHour)global.push('missing-hour');
 if(result.access&&(result.integrity?.status!=='consistent'||!result.efficacyReview||result.efficacyReview.status==='invalid-evidence'))global.push('integrated-evidence-invalid');
 const lookup=xs=>new Map((xs??[]).map(x=>[x.candidateId,x]));
 const collections=[result.efficacyReview?.candidates,result.compoundReview,result.assistantReview,result.clarityReview,result.extensionReview,result.integrity?.candidates];
 const reviews=result.reviews??[],candidateIds=reviews.map(q=>q.candidateId);
 if(result.access&&(new Set(candidateIds).size!==candidateIds.length||collections.some(xs=>!Array.isArray(xs)||xs.length!==reviews.length||
  new Set(xs.map(x=>x.candidateId)).size!==xs.length||xs.some(x=>!candidateIds.includes(x.candidateId)))))global.push('candidate-coverage-mismatch');
 const maps=collections.map(lookup);
 const candidates=reviews.map(q=>candidateDecision(q,...maps.map(m=>m.get(q.candidateId)),result.completeHour,release,global));
 const pref=result.preference,h=pref?.hypothesis;
 const hypothesis=h&&pref.status==='hypothesis'?{family:h.family,candidateIds:[...h.candidateIds],anchorStems:[...h.anchorStems],grounds:[...h.grounds],confirmed:false}:null;
 const usableHypothesis=hypothesis&&hypothesis.candidateIds.length&&hypothesis.candidateIds.every(id=>candidates.some(q=>q.candidateId===id&&q.status==='abstained'&&q.family===hypothesis.family));
 const purity=result.purityReview?.motifs??[];
 return {release,status:global.some(s=>['integrated-evidence-invalid','candidate-coverage-mismatch'].includes(s))||candidates.some(q=>q.status==='invalid-evidence')?'invalid-evidence':!result.access?'unavailable':'abstained',
  completeHour:result.completeHour,selectionAuthority:false,confirmed:false,globalBlockers:unique(global),
  pattern:axis(release,'pattern',[...global,...(usableHypothesis?['family-hypothesis-not-selection']:['no-usable-family-hypothesis']),...(pref?.reason?['preference:'+pref.reason]:[])],{hypothesis:usableHypothesis?hypothesis:null,candidateIds}),
  purity:axis(release,'purity',[...global,'source-subclauses-not-final-purity',...(purity.some(m=>m.observed===true)?[]:['no-covered-source-purity-motif'])],{motifs:purity.map(m=>({id:m.id,orientation:m.orientation,observed:m.observed,witnesses:m.witnesses}))}),
  candidates,limitations:['no-final-decision-authority','no-empirical-life-outcome-validation','ordinary-pattern-scope-only','no-score-or-forced-selection']};
}
