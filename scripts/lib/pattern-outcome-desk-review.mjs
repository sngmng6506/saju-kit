const key=(c,p)=>JSON.stringify([c,p]);
const types=new Set(['asserted-action','interpreted-action','asserted-removal','interpreted-removal','disputed-removal']);
export function bindDeskReview(source,desk){
 const errors=[],map=new Map(),expected=new Map(source.cases.flatMap(c=>c.probes.map(p=>[key(c.id,p.id),p])));
 if(desk.independentGold!==0||desk.scope!=='model-assisted-development-source-review-not-independent')errors.push('scope');
 for(const r of desk.rows){
  const k=key(r.caseId,r.probeId),p=expected.get(k);
  const expectedReading=p?.claim==='removal-disputed'?'disputed-removal':
   (p?.endpointBasis==='explicit-stems'?'asserted-':'interpreted-')+(p?.claim==='action-asserted'?'action':'removal');
  if(!p||map.has(k)||!types.has(r.reading)||r.reading!==expectedReading||!r.source?.startsWith('https://')||!r.locator||!r.rationale||r.effectAgreement!==null)errors.push('review:'+k);
  else map.set(k,r);
 }
 for(const k of expected.keys())if(!map.has(k))errors.push('missing:'+k);
 return {errors,map};
}
export function summarizeDeskReview(rows){
 const counts={},gaps=[];
 for(const c of rows)for(const p of c.probes??[]){
  const reading=p.deskReview?.reading??'missing-review',stage=p.trace?.stage??'missing-trace';
  const k=reading+':'+stage;counts[k]=(counts[k]??0)+1;
  if(stage!=='hypothesis-observed'||p.status!=='supported'||reading==='disputed-removal')
   gaps.push({caseId:c.id,probeId:p.id,reading,stage,hypothesis:p.status,blockers:p.blockers??[],effectAgreement:null});
 }
 return {counts,gaps,independentGold:0,effectAgreement:null};
}
