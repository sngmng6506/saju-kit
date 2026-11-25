// Source assertion ≠ structural relation ≠ verified effect.
// The development set is descriptive; neither supported nor opposed is a
// confirmed physical action. No labels derived from engine output.
const STATES=new Set(['supported','opposed','conflicting','unresolved']);
const CLAIMS=new Set(['action-asserted','removal-asserted','removal-disputed']);
const BASES=new Set(['explicit-stems','interpreted-endpoints']);
const key=(a,b,k)=>JSON.stringify(k==='combine'?[k,...[a,b].sort()]:[k,a,b]);
const validId=x=>typeof x==='string'&&/^(visible:(year|month|day|hour)|hidden:(year|month|day|hour):[갑을병정무기경신임계])$/.test(x);
export function validateMechanismSource(data,development){
 const errors=[],ids=new Set(),dev=new Map(development.cases.map(c=>[c.caseId,c]));
 for(const c of data.cases){
  const d=dev.get(c.id);
  if(ids.has(c.id)||!d||JSON.stringify(d.pillars)!==JSON.stringify(c.pillars)||d.family!==c.family||!c.source||!c.probes.length)errors.push('case:'+c.id);
  ids.add(c.id);
  const ps=new Set();
  for(const p of c.probes){
   if(ps.has(p.id)||!validId(p.from)||!validId(p.to)||p.from===p.to||!['generate','control','combine'].includes(p.kind)||!CLAIMS.has(p.claim)||!BASES.has(p.endpointBasis)||!p.reading||
    (p.kind==='combine')!==(p.claim!=='action-asserted')||(p.claim==='removal-disputed')!==Boolean(p.commentaryDispute))errors.push('probe:'+c.id+':'+p.id);
   ps.add(p.id);
  }
 }
 return errors;
}
export function evaluateMechanismSourceCase(c,result){
 const m=result?.efficacyReview?.mechanismReview;
 const reviews=result?.reviews??[],mechanisms=m?.candidates??[];
 const allIds=reviews.map(q=>q.candidateId),mechanismIds=mechanisms.map(q=>q.candidateId);
 const ids=new Set(reviews.filter(q=>q.family===c.family&&q.status!=='out-of-scope').map(q=>q.candidateId));
 const relevant=mechanisms.filter(q=>ids.has(q.candidateId));
 const invalid=!m||result.decisionReview?.status!=='abstained'||m.selectionAuthority!==false||
  result.efficacyReview?.status==='invalid-evidence'||new Set(allIds).size!==allIds.length||
  new Set(mechanismIds).size!==mechanismIds.length||allIds.length!==mechanismIds.length||
  allIds.some(id=>!mechanismIds.includes(id))||mechanisms.some(q=>q.status==='invalid-evidence'||q.selectionAuthority!==false)||
  relevant.some(q=>!Array.isArray(q.edges)||new Set(q.edges.map(e=>JSON.stringify([e.from,e.to,e.kind]))).size!==q.edges.length||
   q.edges.some(e=>e.effective!==null||!STATES.has(e.status)||!Array.isArray(e.conditions)||e.conditions.some(c=>!STATES.has(c.state))));
 return c.probes.map(p=>{
  const expected=key(p.from,p.to,p.kind),hits=relevant.flatMap(q=>q.edges.filter(e=>key(e.from,e.to,e.kind)===expected).map(e=>({
   candidateId:q.candidateId,edgeId:e.id,status:e.status,conditions:e.conditions.map(c=>({id:c.id,state:c.state})),effective:e.effective
  })));
  const coveredIds=new Set(hits.map(h=>h.candidateId));
  const candidateCoverage=[...ids].map(candidateId=>({candidateId,observed:invalid?null:coveredIds.has(candidateId)}));
  const kinds=new Set(hits.map(h=>h.status));
  const status=invalid?'invalid-evidence':!ids.size?'candidate-unavailable':!hits.length?'uncovered':
   coveredIds.size!==ids.size?'partial-candidate-coverage':kinds.size===1?hits[0].status:'candidate-dependent';
  const blockers=[...new Set(hits.flatMap(h=>h.conditions.filter(c=>c.state!=='supported').map(c=>c.id+':'+c.state)))].sort();
  return {...p,status,hits,blockers,candidateCoverage,relationObserved:invalid?null:hits.length>0,sourceDispute:p.claim==='removal-disputed',effectAgreement:null};
 });
}
export function summarizeMechanismSource(data,rows){
 const all=rows.flatMap(r=>r.probes??[]),expected=data.cases.flatMap(c=>c.probes.map(p=>JSON.stringify([c.id,p.id])));
 const actual=rows.flatMap(r=>(r.probes??[]).map(p=>JSON.stringify([r.id,p.id])));
 const caseIds=data.cases.map(c=>c.id),rowIds=rows.map(r=>r.id);
 const coverageOk=caseIds.length===rowIds.length&&new Set(rowIds).size===rowIds.length&&caseIds.every(id=>rowIds.includes(id))&&expected.length===actual.length&&new Set(actual).size===actual.length&&expected.every(k=>actual.includes(k));
 const counts={},blockerCounts={},byClaim={},byEndpointBasis={};
 for(const p of all){
  counts[p.status]=(counts[p.status]??0)+1;
  for(const b of p.blockers??[])blockerCounts[b]=(blockerCounts[b]??0)+1;
  for(const [map,k] of [[byClaim,p.claim],[byEndpointBasis,p.endpointBasis]]){
   const row=map[k]??(map[k]={total:0,relationObserved:0,statuses:{}});
   row.total++;row.relationObserved+=p.relationObserved===true?1:0;row.statuses[p.status]=(row.statuses[p.status]??0)+1;
  }
 }
 const errors=rows.filter(r=>r.error).map(r=>({id:r.id,error:r.error}));
 return {expectedCases:data.cases.length,executedCases:rows.length,expectedProbes:expected.length,reportedProbes:all.length,
  relationObserved:all.filter(p=>p.relationObserved===true).length,counts,blockerCounts,byClaim,byEndpointBasis,
  independentGold:0,effectAgreement:null,errors,coverageOk,gatePassed:coverageOk&&!errors.length&&!all.some(p=>p.status==='invalid-evidence'||p.effectAgreement!==null)};
}
