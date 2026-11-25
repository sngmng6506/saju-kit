// Generalization of five source pair clauses, not a global purity classifier.
// Both endpoints must be real, distinct visible monthly-use candidates.
// An ordinary helper alone is not evidence of simultaneous monthly use.
const SOURCE='https://www.diancangwang.cn/xuanxuewushu/03cf53eede8a/46649fec6649.html';
const definitions=[
 {id:'wealth-officer-generation',from:['정재','편재'],to:['정관'],kind:'generate',orientation:'aligned',conditions:['wealth-officer-effective']},
 {id:'food-wealth-generation',from:['식신'],to:['정재','편재'],kind:'generate',orientation:'aligned',conditions:['food-wealth-effective']},
 {id:'food-killing-control',from:['식신'],to:['편관'],kind:'control',orientation:'aligned',conditions:['food-killing-balance','day-capacity']},
 {id:'hurting-officer-control',from:['상관'],to:['정관'],kind:'control',orientation:'opposed',conditions:['officer-injury-effective','rescue-and-exceptions']},
 {id:'wealth-resource-control',from:['정재','편재'],to:['정인','편인'],kind:'control',orientation:'opposed',conditions:['resource-injury-effective','resource-necessity','mediation-and-regulation']}
];
const sorted=xs=>[...new Set(xs)].sort();
const edgeRef=e=>({from:e.from,to:e.to,kind:e.kind,edgeId:e.id,screen:e.screen,blockers:[...e.blockers],effective:null});
const relationKey=(a,b,k)=>JSON.stringify([a,b,k]);
export function observeGeneralPurity(prior,reviews,integrity){
 const complete=prior.completeHour;
 const base={version:'purity-pair-evidence-v1',source:SOURCE,completeHour:complete,purityConfirmed:null,mixedConfirmed:null,selectionAuthority:false};
 if(integrity.some(q=>q.status!=='consistent'))return {...base,status:'invalid-evidence',pairs:[],unclassifiedPairs:[],eligibleVisibleAnchorIds:[]};
 const actors=prior.stemForce.occurrences.filter(o=>o.layer==='visible'&&!o.dayReference);
 const anchors=actors.flatMap(o=>{
  const qs=reviews.filter(q=>q.status!=='out-of-scope'&&q.anchorBasis!=='day-reference-proxy'&&q.anchorIds.includes(o.id));
  return qs.length?[{...o,candidateIds:sorted(qs.map(q=>q.candidateId)),storageCandidateIds:sorted(qs.filter(q=>q.storageProjection).map(q=>q.candidateId))}]:[];
 });
 const byId=new Map(anchors.map(o=>[o.id,o]));
 const edges=prior.relativeForce.edges.filter(e=>byId.has(e.from)&&byId.has(e.to));
 const edgeBy=new Map(edges.map(e=>[relationKey(e.from,e.to,e.kind),e]));
 const pairs=[],unclassifiedPairs=[];
 const endpoint=o=>({id:o.id,tenGod:o.tenGod,candidateIds:o.candidateIds,storageCandidateIds:o.storageCandidateIds});
 // Pair exact projected occurrences once, irrespective of duplicate principal/projected candidates.
 for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++){
  const a=anchors[i],b=anchors[j];
  const sharedCandidateIds=a.candidateIds.filter(id=>b.candidateIds.includes(id));
  const e=edges.find(e=>e.from===a.id&&e.to===b.id||e.from===b.id&&e.to===a.id);
  const found=e&&definitions.find(d=>d.kind===e.kind&&d.from.includes(byId.get(e.from).tenGod)&&d.to.includes(byId.get(e.to).tenGod));
  if(!found){unclassifiedPairs.push({participants:[endpoint(a),endpoint(b)],sharedCandidateIds,edge:e?edgeRef(e):null,reason:a.tenGod===b.tenGod?'same-ten-god-occurrences-not-purity':'no-covered-pair-clause',interpretationConfirmed:null});continue;}
  const from=byId.get(e.from),to=byId.get(e.to);
  const evidence=[];
  for(const q of reviews)if(q.status!=='out-of-scope')for(const r of q.rules)for(const w of r.witnesses){
   const es=[...w.edges,...(w.anchorBindings??[]).flatMap(b=>b.edge?[b.edge]:[])];
   if(es.some(x=>edgeBy.get(relationKey(x.from,x.to,x.kind))===e))
    evidence.push({candidateId:q.candidateId,ruleId:r.id,witnessId:w.id,kind:r.kind,impact:r.impact??null});
  }
  pairs.push({id:found.id+':'+e.from+'>'+e.to,clauseId:found.id,orientation:found.orientation,from:endpoint(from),to:endpoint(to),
   sharedCandidateIds,edge:edgeRef(e),relatedWitnesses:evidence,
   unresolvedConditions:sorted([...found.conditions,'joint-monthly-use-unconfirmed',...(from.storageCandidateIds.length||to.storageCandidateIds.length?['storage-access-and-family-unresolved']:[])]),
   interpretationConfirmed:null,effective:null});
 }
 return {...base,status:!complete?'partial':anchors.length<2?'insufficient-projected-anchors':'diagnostic',eligibleVisibleAnchorIds:anchors.map(o=>o.id),pairs,unclassifiedPairs,
  limitations:['projected-monthly-use-pairs-only','not-all-role-combinations-covered','co-use-not-confirmed','no-purity-verdict']};
}
