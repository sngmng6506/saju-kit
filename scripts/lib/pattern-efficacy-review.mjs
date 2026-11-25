// Research-only assessment of necessary evidence, not classical efficacy.
// The v10 relative-force graph owns roots, locality and contacts.
export const EFFICACY_REVIEW_VERSION='pattern-efficacy-review-v1';
const unique=xs=>[...new Set(xs)].sort();
const source={
 force:'https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yong-shen-ge-ju-gao-di',
 order:'https://www.kaucim.ai/bazi/ziping-zhenquan/lun-sheng-ke-xian-hou-fen-ji-xiong',
 outcome:'https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yong-shen-cheng-bai-jiu-ying'
};
const normalize=k=>k==='generated-by-anchor'?'generate':k==='controlled-by-anchor'?'control':k;
const state=(conditions,concerns)=>conditions.length?'unresolved':concerns.length?'review-required':'necessary-screen-met';
export function reviewEfficacyEdge(ref,graph,complete){
 const unknown=[],concerns=[];
 if(!complete)unknown.push('missing-hour');
 const kind=normalize(ref.kind);
 let edge=null;
 if(kind==='combine'){
  if(ref.edgeId!=null)throw Error('combination cannot bind a force edge');
  unknown.push('combination-effect-unresolved');
 }else if(ref.edgeId==null){
  unknown.push('physical-slot-or-relation-unresolved');
 }else{
  edge=graph.get(ref.edgeId);
  if(!edge||edge.from!==ref.from||edge.to!==ref.to||edge.kind!==kind)
   throw Error('inconsistent efficacy edge binding: '+ref.edgeId);
  if(edge.screen!==ref.screen)throw Error('inconsistent efficacy screen: '+ref.edgeId);
  for(const b of edge.blockers){
   if(['missing-hour','hidden-participant-access-unresolved'].includes(b))unknown.push(b);
   else concerns.push(b);
  }
  if(edge.screen==='unresolved')unknown.push('upstream-screen-unresolved');
  if(edge.screen==='requires-review'&&!edge.blockers.length)concerns.push('upstream-screen-requires-review');
  if(!['unresolved','requires-review','root-and-locality-screen-met'].includes(edge.screen))throw Error('unknown force screen');
  // Dominance of evidence is not dominance of effective force.
  if(kind==='control'){
   const relation=edge.relative.relation;
   if(['unresolved','not-comparable'].includes(relation))unknown.push('control-relative-evidence-unresolved');
   if(relation==='right-evidence-dominates')concerns.push('target-evidence-dominates');
   if(relation==='mixed-evidence')concerns.push('control-evidence-incomparable');
  }
 }
 const unresolved=unique(unknown),reviewReasons=unique(concerns);
 return {from:ref.from,to:ref.to,kind,edgeId:ref.edgeId??null,upstreamScreen:ref.screen,
  status:state(unresolved,reviewReasons),unresolved,reviewReasons,
  relativeEvidence:edge?.relative?.relation??null,sourceLocalControlNodes:[...(edge?.sourceLocalControlNodes??[])],
  possibleLocalProtection:(edge?.possibleLocalProtection??[]).map(x=>({...x})),effective:null};
}
function reviewWitness(edges,conditions,complete){
 const unknown=unique([...edges.flatMap(e=>e.unresolved),...conditions.map(c=>'source-condition:'+c),
  ...(!edges.length?['no-bound-edge']:[]),...(!complete?['missing-hour']:[])]);
 const concerns=unique(edges.flatMap(e=>e.reviewReasons));
 return {edges,unresolved:unknown,reviewReasons:concerns,status:state(unknown,concerns),
  allEdgeScreensMet:edges.length>0&&edges.every(e=>e.status==='necessary-screen-met'),effective:null};
}
export function reviewPatternEfficacy(result,outcome){
 const base={version:EFFICACY_REVIEW_VERSION,sources:{...source},effective:null,selectionAuthority:false};
 if(!result.relativeForce||!result.relativePattern||outcome.status==='unavailable')
  return {...base,status:'unavailable',candidates:[]};
 const complete=result.completeHour===true&&result.relativeForce.completeHour===true;
 const graph=new Map(result.relativeForce.edges.map(e=>[e.id,e]));
 if(graph.size!==result.relativeForce.edges.length)throw Error('duplicate force edge');
 const assess=ref=>reviewEfficacyEdge(ref,graph,complete);
 const candidates=outcome.candidates.map(c=>{
  const relRoutes=result.relativePattern.routes.find(q=>q.candidateId===c.candidateId);
  const relPaths=result.relativePattern.paths.find(q=>q.candidateId===c.candidateId);
  if(!relRoutes||!relPaths)throw Error('missing efficacy candidate: '+c.candidateId);
  const routes=c.routes.map(r=>{
   const binding=relRoutes.routes.find(x=>x.id===r.id);
   if(!binding)throw Error('missing efficacy route: '+r.id);
   const links=r.links.map(l=>{
    const refs=binding.links.filter(x=>x.from===l.from&&x.to===l.to&&x.edgeId===l.edgeId&&x.screen===l.screen);
    if(refs.length!==1)throw Error('ambiguous efficacy route link: '+r.id);
    return assess(refs[0]);
   });
   return {id:r.id,kind:r.kind,observed:r.observed,links,effective:null};
  });
  const paths=relPaths.paths.map(p=>({id:p.id,unresolvedConditions:[...p.unresolvedConditions],
   witnesses:p.witnesses.map(w=>({roles:{...w.roles},...reviewWitness(w.edges.map(assess),p.unresolvedConditions,complete)})),effective:null}));
  const threats=c.threats.map(t=>{
   const damage=routes.find(r=>r.id===t.routeId&&r.kind==='damage')?.links.find(l=>l.from===t.from&&l.to===t.to&&l.edgeId===t.edgeId);
   if(!damage)throw Error('missing efficacy damage link: '+t.routeId);
   const possibleRescues=t.possibleRescues.map(w=>{
    const helper=routes.find(r=>r.id===w.routeId&&r.kind==='rescue')?.links.find(l=>l.from===w.helper&&l.to===w.obstacle);
    if(!helper||w.obstacle!==t.from||w.target!==t.to)throw Error('inconsistent efficacy rescue witness');
    // Both sides of a rescue must be checked. Even two passing screens
    // do not establish neutralization, priority, or net force.
    return {helper:w.helper,obstacle:w.obstacle,target:w.target,routeId:w.routeId,
     ...reviewWitness([damage,helper],['net-rescue-effect','source-order-and-interference'],complete),neutralizesThreat:null};
   });
   return {routeId:t.routeId,damage,possibleRescues,unmatched:possibleRescues.length===0,neutralized:null};
  });
  const triads=c.family==='killing'?result.relativeForce.triads.filter(t=>c.anchorIds.includes(t.killing)).map(t=>{
   const links=[t.controlEdge,t.dayPressureEdge,t.dayOutputEdge].map(id=>{
    const e=graph.get(id);if(!e)throw Error('unbound triad edge: '+id);
    return assess({from:e.from,to:e.to,kind:e.kind,screen:e.screen,edgeId:id});
   });
   return {id:t.id,food:t.food,killing:t.killing,day:t.day,dayRootEvidence:t.dayRootEvidence,concerns:[...t.concerns],
    ...reviewWitness(links,['day-capacity','food-killing-balance'],complete),effectiveControl:null};
  }):[];
  return {candidateId:c.candidateId,family:c.family,routes,paths,threats,triads,formed:null,broken:null,rescued:null,selectionAuthority:false};
 });
 return {...base,status:complete?'research-review':'partial',candidates};
}
export function summarizeEfficacyReviews(reviews){
 const statuses=['necessary-screen-met','review-required','unresolved'];
 const count=xs=>Object.fromEntries(statuses.map(s=>[s,xs.filter(x=>x.status===s).length]));
 const cs=reviews.flatMap(r=>r.candidates);
 const links=cs.flatMap(c=>c.routes.flatMap(r=>r.links));
 const witnesses=cs.flatMap(c=>c.paths.flatMap(p=>p.witnesses));
 const threats=cs.flatMap(c=>c.threats);
 const rescues=threats.flatMap(t=>t.possibleRescues);
 const triads=cs.flatMap(c=>c.triads);
 return {charts:reviews.length,partial:reviews.filter(r=>r.status==='partial').length,unavailable:reviews.filter(r=>r.status==='unavailable').length,
  candidates:cs.length,routeLinks:count(links),roleWitnesses:count(witnesses),rescueWitnesses:count(rescues),triads:count(triads),
  threats:threats.length,threatsWithoutMatchedRescue:threats.filter(t=>t.unmatched).length,
  allRescueEdgeScreensMet:rescues.filter(r=>r.allEdgeScreensMet).length,
  confirmedEffective:0,finalOutcomeAccuracy:null,selectionAuthority:false};
}
