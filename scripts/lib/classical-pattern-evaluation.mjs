const unique=x=>[...new Set(x)];
const rate=(a,b)=>b===0?null:a/b;
export function evaluateClassicalCase(c,result){
 const candidates=unique((result.selection?.candidates??[]).map(x=>x.family).filter(Boolean));
 const selected=result.selectedPattern,selectedFamily=typeof selected==='object'&&selected!==null?selected.family??null:null;
 const expected=c.annotation.expectedFamily;
 const selection=selected==null?'abstained':selectedFamily===null?'invalid-selection-contract':selectedFamily===expected?'correct':'incorrect';
 const occurrences=new Map((result.routeReview?.occurrences??[]).map(x=>[x.id,x]));
 const candidateIds=new Set((result.selection?.candidates??[]).filter(x=>x.family===expected).map(x=>x.id));
 const assistantStems=unique((result.qualityReview?.reviews??[]).filter(q=>candidateIds.has(q.candidateId)).flatMap(q=>q.routes.flatMap(r=>r.assistantIds.map(id=>occurrences.get(id)?.stem))).filter(Boolean));
 const actors=c.annotation.actors.filter(a=>a.role==='support').map(a=>({stem:a.stem,observed:assistantStems.includes(a.stem)}));
 return {id:c.id,split:c.split,sourceStatus:c.source.transcription,eligible:c.eligible,expectedFamily:expected,candidateFamilies:candidates,retrieved:expected===null?null:candidates.includes(expected),candidateCount:candidates.length,selection,selectedFamily,actors,assistantAbstained:result.assistantGod==null};
}
export function summarizeClassical(rows){
 const evaluated=rows.filter(r=>r.eligible&&r.expectedFamily!==null),n=evaluated.length;
 const correct=evaluated.filter(r=>r.selection==='correct').length,wrong=evaluated.filter(r=>['incorrect','invalid-selection-contract'].includes(r.selection)).length,abstained=evaluated.filter(r=>r.selection==='abstained').length;
 const hits=evaluated.filter(r=>r.retrieved).length,actors=evaluated.flatMap(r=>r.actors),actorHits=actors.filter(a=>a.observed).length;
 return {total:rows.length,eligible:n,excluded:rows.length-n,candidateHits:hits,candidateRecall:rate(hits,n),competingCandidateCases:evaluated.filter(r=>r.candidateCount>1).length,meanCandidateFamilies:rate(evaluated.reduce((s,r)=>s+r.candidateCount,0),n),selectedCorrect:correct,selectedWrong:wrong,abstained,coverage:rate(correct+wrong,n),selectiveAccuracy:rate(correct,correct+wrong),allCaseSelectionAccuracy:rate(correct,n),abstentionRate:rate(abstained,n),sourceActorObservations:actors.length,sourceActorHits:actorHits,sourceActorRecall:rate(actorHits,actors.length),assistantAbstained:evaluated.filter(r=>r.assistantAbstained).length};
}
