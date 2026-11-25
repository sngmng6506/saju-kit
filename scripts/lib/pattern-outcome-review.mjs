// Research projection only: never changes an engine result or grants authority.
const unique=xs=>[...new Set(xs)].sort();
const key=(from,to)=>JSON.stringify([from,to]);
const reverse=k=>['generated-by-anchor','controlled-by-anchor'].includes(k);
const directed=l=>reverse(l.kind)?{from:l.to,to:l.from}:{from:l.from,to:l.to};
const empty=()=>({status:'unavailable',candidates:[],preference:null,selectedPattern:null,assistantGod:null,selectionAuthority:false});
export function reviewPatternOutcome(result){
 if(!result.selection||!result.relativePattern||!result.qualityReview||!result.routeReview)return empty();
 const complete=result.completeHour===true;
 const candidates=result.selection.candidates.map(c=>{
  const raw=result.routeReview.reviews.find(r=>r.candidateId===c.id);
  const quality=result.qualityReview.reviews.find(r=>r.candidateId===c.id);
  const relative=result.relativePattern.routes.find(r=>r.candidateId===c.id);
  const roles=result.roleReview.find(r=>r.candidateId===c.id);
  const motifs=result.outcomes.find(r=>r.candidateId===c.id)?.motifs??[];
  if(!raw||!quality||!relative||!roles)throw Error('missing candidate evidence: '+c.id);
  const routes=quality.routes.map(q=>{
   const r=raw.routes.find(r=>r.id===q.routeId);
   const rel=relative.routes.find(r=>r.id===q.routeId);
   if(!r||!rel)throw Error('missing route evidence: '+q.routeId);
   const links=q.links.filter(l=>r.observed===true&&l.distinctSlots&&(q.kind!=='rescue'||l.rescueWitnesses.length>0)).map(l=>{
    const {from,to}=directed(l);
    const ref=rel.links.find(x=>x.from===from&&x.to===to&&x.kind===l.kind);
    if(!ref)throw Error('missing relative route link: '+q.routeId);
    return {from,to,screen:ref.screen,edgeId:ref.edgeId,rescueWitnesses:l.rescueWitnesses.map(w=>({...w}))};
   });
   return {id:q.routeId,kind:q.kind,source:r.source,observed:links.length?true:complete?false:null,links,effective:null};
  });
  const damage=routes.filter(r=>r.kind==='damage').flatMap(r=>r.links.map(l=>({routeId:r.id,...l})));
  const rescue=routes.filter(r=>r.kind==='rescue').flatMap(r=>r.links.flatMap(l=>l.rescueWitnesses.map(w=>({routeId:r.id,screen:l.screen,...w}))));
  // A rescue must refer to the very same obstacle and protected occurrence.
  // Matching is structural only; no cancellation, even when the screen passes.
  const threats=damage.map(d=>({...d,possibleRescues:rescue.filter(w=>key(w.obstacle,w.target)===key(d.from,d.to))}));
  const unmatchedRescues=rescue.filter(w=>!damage.some(d=>key(w.obstacle,w.target)===key(d.from,d.to)));
  const paths=roles.paths.filter(p=>p.observed===true).map(p=>({id:p.id,source:p.source,helperRole:p.helperRole,helperIds:[...p.helperIds],witnessCount:p.witnesses.length,unresolvedConditions:[...p.unresolvedConditions],effective:null}));
  return {candidateId:c.id,family:c.family,anchorIds:[...raw.anchorIds],routes,threats,unmatchedRescues,paths,
   motifs:motifs.map(m=>({id:m.id,kind:m.kind,source:m.source,predicate:m.predicate,unresolvedConditions:m.clauses.filter(k=>k.matched===null).map(k=>k.name??k.kind)})),
   supportRouteIds:unique(routes.filter(r=>r.kind==='support'&&r.observed===true).map(r=>r.id)),
   formed:null,broken:null,rescued:null,selectedAssistant:null,selectionAuthority:false};
 });
 return {status:complete?'structural-review':'partial',candidates,preference:result.preference?.hypothesis?.family??null,selectedPattern:null,assistantGod:null,selectionAuthority:false};
}
export function summarizeReferenceReadiness(cases){
 const eligible=cases.filter(c=>c.eligible&&c.annotation.expectedFamily!==null);
 const known=(a,k)=>a[k]!==null&&a[k]!==undefined;
 const count=k=>eligible.filter(c=>known(c.annotation,k)).length;
 return {total:cases.length,eligible:eligible.length,excluded:cases.length-eligible.length,
  chapterFamily:count('expectedFamily'),selectedFamily:count('sourceSelectedFamily'),formed:count('formed'),
  selectedUsefulStem:count('selectedUsefulStem'),selectedAssistantStem:count('selectedAssistantStem'),unfavorableStems:count('unfavorableStems'),
  supportProbes:eligible.flatMap(c=>c.annotation.actors).filter(a=>a.role==='support').length,
  obstructionProbes:eligible.flatMap(c=>c.annotation.actors).filter(a=>a.role==='obstruction').length,
  heldOutConfirmed:0,reviewQueue:cases.filter(c=>!c.eligible||c.source.transcription==='appendix-only'||!known(c.annotation,'sourceSelectedFamily')||!known(c.annotation,'formed')).map(c=>({id:c.id,source:c.source.url,transcription:c.source.transcription,eligible:c.eligible,missing:['sourceSelectedFamily','formed','selectedUsefulStem','selectedAssistantStem','unfavorableStems'].filter(k=>!known(c.annotation,k))}))};
}
export function summarizeOutcomeReviews(reviews){
 const cs=reviews.flatMap(r=>r.candidates);
 const threats=cs.flatMap(c=>c.threats);
 return {charts:reviews.length,unavailable:reviews.filter(r=>r.status==='unavailable').length,partial:reviews.filter(r=>r.status==='partial').length,
  candidates:cs.length,supportRoutes:cs.reduce((n,c)=>n+c.supportRouteIds.length,0),threatWitnesses:threats.length,
  threatsWithPossibleRescue:threats.filter(t=>t.possibleRescues.length>0).length,
  threatsWithoutMatchedRescue:threats.filter(t=>t.possibleRescues.length===0).length,
  unmatchedRescueWitnesses:cs.reduce((n,c)=>n+c.unmatchedRescues.length,0),
  observedRolePaths:cs.reduce((n,c)=>n+c.paths.length,0),
  formedConfirmed:cs.filter(c=>c.formed===true).length,brokenConfirmed:cs.filter(c=>c.broken===true).length,rescuedConfirmed:cs.filter(c=>c.rescued===true).length,
  authorityGranted:reviews.filter(r=>r.selectionAuthority===true).length};
}
