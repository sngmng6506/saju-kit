const edgeKey=e=>JSON.stringify(e.kind==='combine'?[e.kind,...[e.from,e.to].sort()]:[e.kind,e.from,e.to]);
const refKey=x=>JSON.stringify([x.ruleId,x.witnessId]);
// Probe presence in a sample is structural coverage, not effect agreement.
// A truncated search cannot establish absence from all possible allocations.
export function inspectProbeAllocations(probe,review,joint,mode){
 const a=joint.search?.[mode]?.allocationReview;
 if(!a)return {candidateId:review.candidateId,status:'unavailable',matches:[],effectAgreement:null};
 const expected=edgeKey(probe),entries=new Map(review.rules.flatMap(r=>r.witnesses.map(w=>[refKey({ruleId:r.id,witnessId:w.id}),{r,w}])));
 const matches=[];
 const seen=new Set();
 for(const p of a.samples){
  if(seen.has(p.id))throw Error('duplicate allocation identity');seen.add(p.id);
  const origins=[],selected=[p.support,...p.rescues],selectedIds=new Set(selected.map(refKey));
  if(selectedIds.size!==selected.length||p.anchorAssignments.some(b=>!selectedIds.has(refKey(b.route))))throw Error('invalid allocation route identity');
  for(const x of selected){
   const entry=entries.get(refKey(x));if(!entry)throw Error('invalid plan route');
   const {r,w}=entry;
   const threat=r.kind==='rescue'?entries.get(refKey({ruleId:r.threatRuleId,witnessId:w.threatWitnessId})):null;
   if(r.kind==='rescue'&&threat?.r.kind!=='damage')throw Error('invalid plan threat');
   if(threat?.w.edges.some(e=>edgeKey(e)===expected))origins.push({route:{ruleId:x.ruleId,witnessId:x.witnessId},origin:'bound-threat'});
   if(w.edges.some(e=>edgeKey(e)===expected)&&!threat?.w.edges.some(e=>edgeKey(e)===expected))origins.push({route:{ruleId:x.ruleId,witnessId:x.witnessId},origin:'witness'});
   for(const b of p.anchorAssignments.filter(b=>refKey(b.route)===refKey(x)&&b.edge&&edgeKey(b.edge)===expected))
    origins.push({route:{ruleId:x.ruleId,witnessId:x.witnessId},origin:threat?'bound-threat-anchor':'anchor-option',hypothesis:b.hypothesis??null});
  }
  if(mode==='supportedOnly'&&p.anchorAssignments.some(b=>b.hypothesis!=='supported'))throw Error('unsupported selected anchor');
  if(origins.length)matches.push({sampleId:p.id,frontier:a.reviewFrontierIds.includes(p.id),origins});
 }
 return {candidateId:review.candidateId,status:matches.length?'sample-observed':!a.exhaustive?'search-incomplete':!a.samples.length?'no-enumerated-allocation':'not-in-enumerated-allocations',
  examined:a.examined,exhaustive:a.exhaustive,sampleCount:a.samples.length,matches,effectAgreement:null};
}
