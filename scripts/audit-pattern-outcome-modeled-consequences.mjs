import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const packet=JSON.parse(readFileSync(new URL('../test/fixtures/pattern-modeled-consequence-source-contrast-v1.json',import.meta.url),'utf8'));
const rows=[],errors=[];
for(const c of packet.cases)for(const complete of [true,false]){
 const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!complete&&i===3?null:{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
 const native=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION});
 const m=native.efficacyReview?.mechanismReview,r=m?.modeledConsequenceReview,expectedStatus=complete?'diagnostic':'partial';
 const action=r?.actions.find(a=>a.edgeId===c.edgeId),clause=action?.clauses.find(a=>a.clauseId===c.clauseId);
 const predicate=m?.elementContextReview?.actions.find(a=>a.edgeId===c.edgeId)?.clauses.find(a=>a.clauseId===c.clauseId);
 const scope=complete?'complete':'partial';
 const fail=reason=>errors.push({id:c.id,scope,reason});
 if(r?.status!==expectedStatus)fail('review-status:'+String(r?.reason));
 if(!clause)fail('missing-exact-source-clause');
 if(r?.judgments.some(j=>j.level==='effect-hypothesis'&&j.state!=='unresolved')||native.decisionReview?.status!=='abstained')fail('actual-effect-or-selection-promotion');
 if(!complete&&(clause?.state!=='unresolved'||clause?.directInjuryState!==undefined&&clause.directInjuryState!=='unresolved'))fail('partial-promotion');
 if(clause?.interpositionCandidates?.some(p=>p.actualReliefState!=='unresolved'))fail('relief-promotion');
 if(clause?.directReleasePropositionId&&(clause.actualReceptionState!=='unresolved'||!complete&&clause.directReleaseState!=='unresolved'||clause.state==='supported'&&clause.directReleaseState!=='supported'))fail('release-scope-invariant');
 if(c.label==='explicit-opposition'&&clause?.state==='supported')fail('source-opposition-contradicted');
 rows.push({id:c.id,scope,label:c.label,sourceScope:c.scope,source:c.source,section:c.section,pillars:c.pillars,reading:c.reading,
  edgeId:c.edgeId,clauseId:c.clauseId,modelPredicateState:predicate?.modelPredicateState??null,
  structuralState:r?.judgments.find(j=>j.id===clause?.structuralPropositionId)?.state??null,modeledConsequenceState:clause?.state??null,
  directInjuryState:clause?.directInjuryState??null,residualInjuryState:clause?.residualInjuryState??null,
  directReleaseState:clause?.directReleaseState??null,jointReleaseScreenState:clause?.jointReleaseScreenState??null,
  targetPressureScreenState:clause?.targetPressureScreenState??null,actualReceptionState:clause?.actualReceptionState??null,sourceScreen:clause?.sourceScreen??null,
  interpositionCandidates:clause?.interpositionCandidates??[],directInjuryProof:clause?.directInjuryProof??null,
  conditions:clause?.conditions??[],proof:clause?.proof??null,actualEffectState:action?.actualEffectState??null,
  comparison:!complete?'scope-withheld':clause?.state==='supported'?c.label==='explicit-opposition'?'source-contradiction':'model-support-not-exact-edge-gold':'model-abstention-not-a-negative-verdict'});
}
console.log(JSON.stringify({version:packet.version,scope:packet.scope,sourceEdition:packet.sourceEdition,
 counts:{cases:packet.cases.length,replays:rows.length,completeSupported:rows.filter(r=>r.scope==='complete'&&r.modeledConsequenceState==='supported').length,
 completeAbstained:rows.filter(r=>r.scope==='complete'&&r.modeledConsequenceState==='unresolved').length,errors:errors.length},rows,errors},null,2));
if(errors.length)process.exitCode=1;
