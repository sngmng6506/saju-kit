// Candidate-local structural integrity, independent of efficacy.
const key=(ruleId,witnessId)=>JSON.stringify([ruleId,witnessId]);
export function inspectIntegratedEvidence(review,compound,assistant,clarity,position,access,occurrenceIds){
 const violations=[];
 const fail=(kind,detail)=>violations.push({kind,...detail});
 const ids=new Set([...occurrenceIds,...access.groups.map(g=>g.id)]);
 const ruleIds=new Set(),witnesses=new Set();
 for(const id of review.anchorIds)if(!ids.has(id))fail('unknown-anchor',{id});
 for(const rule of review.rules){
  if(ruleIds.has(rule.id))fail('duplicate-rule',{ruleId:rule.id});
  ruleIds.add(rule.id);
  if(rule.effective!==null||rule.conditionResolved!==false)fail('rule-authority',{ruleId:rule.id});
  for(const w of rule.witnesses){
   const k=key(rule.id,w.id);
   if(witnesses.has(k))fail('duplicate-witness',{ruleId:rule.id,witnessId:w.id});
   witnesses.add(k);
   if(w.effective!==null)fail('witness-authority',{ruleId:rule.id,witnessId:w.id});
   for(const e of [...w.edges,...(w.anchorBindings??[]).flatMap(b=>b.edge?[b.edge]:[])])if(e.effective!==null)fail('edge-authority',{ruleId:rule.id,witnessId:w.id,from:e.from,to:e.to});
   for(const id of [...Object.values(w.roles),...w.edges.flatMap(e=>[e.from,e.to]),...(w.anchorBindings??[]).flatMap(b=>[b.anchorId,b.targetId,...(b.edge?[b.edge.from,b.edge.to]:[])].filter(Boolean))])
    if(!ids.has(id))fail('unknown-participant',{ruleId:rule.id,witnessId:w.id,id});
  }
  if(review.storageProjection&&!['storage-anchor-access','storage-family-validity'].every(c=>rule.unresolvedConditions.includes(c)))fail('missing-storage-conditions',{ruleId:rule.id});
 }
 const positionRows=position?.witnesses??[];
 const p=new Set(positionRows.map(w=>key(w.ruleId,w.witnessId)));
 if(!position||(position.candidateId!==undefined&&position.candidateId!==review.candidateId)||p.size!==positionRows.length||p.size!==witnesses.size||[...witnesses].some(k=>!p.has(k)))fail('position-witness-mismatch',{});
 for(const q of [compound,assistant,clarity])if(q.candidateId!==review.candidateId||q.status==='invalid-evidence'||q.selectionAuthority!==false)fail('invalid-derived-review',{status:q.status});
 for(const v of compound.violations)violations.push(v);
 for(const k of ['formed','broken','rescued'])if(review[k]!==null)fail('candidate-authority',{field:k});
 if(review.selectionAuthority!==false||assistant.assistantGod!==null||clarity.cleanConfirmed!==null||clarity.turbidConfirmed!==null)fail('premature-authority',{});
 return {status:violations.length?'invalid-evidence':'consistent',violations,selectionAuthority:false};
}
