const rate=(n,d)=>d?n/d:null;
export function evaluateOutcomeProbe(reviews,probe){
 const all=reviews.flatMap(q=>q.rules.map(rule=>({candidateId:q.candidateId,rule})));
 if(probe.ruleId===null)return {status:'unmapped',witnesses:[]};
 const entries=all.filter(x=>x.rule.id===probe.ruleId&&x.rule.kind===probe.kind);
 if(!entries.length)return {status:'unavailable',witnesses:[]};
 const witnesses=entries.flatMap(({candidateId,rule})=>rule.witnesses.filter(w=>Object.entries(probe.roles).every(([key,id])=>w.roles[key]===id)).map(w=>({candidateId,id:w.id})));
 // Missing hour can hide other witnesses even when a different one is observed.
 const incomplete=reviews.some(q=>q.status==='partial');
 const actual=witnesses.length?'present':incomplete||entries.some(x=>x.rule.observed===null)?'unresolved':'absent';
 return {status:actual===probe.expected?'matched':actual==='unresolved'?'unresolved':'mismatch',actual,witnesses};
}
export function evaluateOutcomeCase(row,result){
 const reviews=result.reviews.filter(q=>q.family===row.family&&q.status!=='out-of-scope');
 return {id:row.caseId??row.id,family:row.family,reviewStatus:row.reviewStatus??'synthetic-control',probes:row.probes.map(p=>({...p,...evaluateOutcomeProbe(reviews,p)}))};
}
export function summarizeOutcome(rows){
 const p=rows.flatMap(r=>r.probes);
 const byStatus=Object.fromEntries(['matched','mismatch','unresolved','unavailable','unmapped'].map(s=>[s,p.filter(x=>x.status===s).length]));
 const mapped=p.filter(x=>x.ruleId!==null),positive=mapped.filter(x=>x.expected==='present'),negative=mapped.filter(x=>x.expected==='absent');
 const hits=positive.filter(x=>x.status==='matched').length;
 const resolved=mapped.filter(x=>['matched','mismatch'].includes(x.status));
 return {cases:rows.length,probes:p.length,mapped:mapped.length,byStatus,mappedCoverage:rate(mapped.length,p.length),
  positiveProbes:positive.length,positiveHits:hits,positiveProbeRecall:rate(hits,positive.length),
  negativeProbes:negative.length,negativeMatches:negative.filter(x=>x.status==='matched').length,
  resolvedCoverage:rate(resolved.length,mapped.length),resolvedAgreement:rate(resolved.filter(x=>x.status==='matched').length,resolved.length),
  gapCounts:Object.fromEntries([...new Set(p.map(x=>x.gap).filter(Boolean))].sort().map(g=>[g,p.filter(x=>x.gap===g).length]))};
}
