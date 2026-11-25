// Structural stem combination and order review. Not a transformation policy.
// Reuse v10 contact IDs and directed force edges; do not recreate 五合 tables.
export const STEM_INTERFERENCE_VERSION='pattern-stem-interference-v1';
const order=['year','month','day','hour'];
const source={combination:'https://www.donglishuzhai.net/chapter/3718.html',assistant:'https://donglishuzhai.net/chapter/3728.html',order:'https://donglishuzhai.net/chapter/3733.html'};
const unique=xs=>[...new Set(xs)].sort();
const W=['정재','편재'],I=['정인','편인'];
const span=(a,b)=>Math.abs(order.indexOf(a.position)-order.indexOf(b.position));
const between=(a,b,visible)=>visible.filter(o=>order.indexOf(o.position)>Math.min(order.indexOf(a.position),order.indexOf(b.position))&&order.indexOf(o.position)<Math.max(order.indexOf(a.position),order.indexOf(b.position)));
const includesPair=(p,a,b)=>p.participants.includes(a)&&p.participants.includes(b);
export function observeStemInterference(force,relative,completeHour){
 const visible=force.occurrences.filter(o=>o.layer==='visible').sort((a,b)=>order.indexOf(a.position)-order.indexOf(b.position));
 const byId=new Map(visible.map(o=>[o.id,o]));
 if(byId.size!==visible.length||new Set(visible.map(o=>o.position)).size!==visible.length||visible.some(o=>!order.includes(o.position)))throw Error('invalid visible occurrences');
 const contacts=new Map();
 for(const o of visible)for(const id of unique(o.contacts)){
  if(!id.startsWith('stem.combine:'))continue;
  if(!contacts.has(id))contacts.set(id,[]);
  contacts.get(id).push(o.id);
 }
 const graph=new Map(relative.edges.map(e=>[JSON.stringify([e.from,e.to]),e]));
 const edge=(a,b,kind)=>{const e=graph.get(JSON.stringify([a,b]));return e?.kind===kind?e.id:null;};
 const raw=[...contacts].map(([id,participants])=>{
  if(participants.length!==2)throw Error('unpaired stem contact: '+id);
  const [a,b]=participants.map(p=>byId.get(p));
  if(id!=='stem.combine:'+a.position+'-'+b.position)throw Error('inconsistent stem contact: '+id);
  return {id,participants,span:span(a,b),between:between(a,b,visible).map(o=>o.id),includesDay:a.dayReference||b.dayReference};
 });
 const pairs=raw.map(p=>{
  const competitors=raw.filter(q=>q.id!==p.id&&q.participants.some(id=>p.participants.includes(id)));
  const adjacentCompetitors=competitors.filter(q=>q.span===1);
  const remoteCompetitors=competitors.filter(q=>q.span>1);
  const interveningControl=[];
  for(const id of p.between)for(const target of p.participants){
   const e=edge(id,target,'control');if(e)interveningControl.push({from:id,to:target,edgeId:e});
  }
  const status=!completeHour?'partial':p.span>1?'separated-contact':adjacentCompetitors.length?'competing-adjacent-contact':'adjacent-no-adjacent-competitor';
  return {...p,status,adjacentCompetitorIds:adjacentCompetitors.map(q=>q.id),remoteCompetitorIds:remoteCompetitors.map(q=>q.id),
   interveningControl,exclusivePairObserved:completeHour?competitors.length===0:null,
   // Self-combination and another stem combining the same actor have
   // different interpretations; neither proves removal.
   dayContactKind:p.includesDay?'day-participates':'non-day-pair',effective:null,transformationConfirmed:null,removedParticipants:[]};
 });
 const competition=visible.flatMap(o=>{
  const incident=pairs.filter(p=>p.participants.includes(o.id));
  if(incident.length<2)return [];
  return [{occurrenceId:o.id,pairIds:incident.map(p=>p.id),adjacentPairIds:incident.filter(p=>p.span===1).map(p=>p.id),
   remotePairIds:incident.filter(p=>p.span>1).map(p=>p.id),competitionEffective:null}];
 });
 const directed=relative.edges.filter(e=>byId.has(e.from)&&byId.has(e.to)&&['control','generate'].includes(e.kind)).map(e=>{
  const a=byId.get(e.from),b=byId.get(e.to),mid=between(a,b,visible);
  const interference=mid.flatMap(o=>{
   const controlsSource=edge(o.id,a.id,'control'),controlsTarget=edge(o.id,b.id,'control');
   const sourceGenerates=edge(a.id,o.id,'generate'),generatesTarget=edge(o.id,b.id,'generate');
   return [{occurrenceId:o.id,controlsSource,controlsTarget,mediatedGeneration:sourceGenerates&&generatesTarget?[sourceGenerates,generatesTarget]:[]}];
  });
  return {edgeId:e.id,from:e.from,to:e.to,kind:e.kind,span:span(a,b),between:mid.map(o=>o.id),interference,
   fromContacts:pairs.filter(p=>p.participants.includes(a.id)).map(p=>p.id),toContacts:pairs.filter(p=>p.participants.includes(b.id)).map(p=>p.id),effective:null};
 });
 return {version:STEM_INTERFERENCE_VERSION,sources:{...source},status:completeHour?'structural-review':'partial',pairs,competition,directed,visible,relationEdges:relative.edges.map(e=>({id:e.id,from:e.from,to:e.to,kind:e.kind})),selectionAuthority:false};
}
// Role definitions are source-scoped archetypes, not sufficient rules.
// The protected occurrence must belong to this candidate where specified.
const rules=[
 {id:'combine-hurting-preserve-officer',family:'officer',helper:['정인','편인'],obstacle:['상관'],target:['정관'],anchor:'target',relation:'control'},
 {id:'combine-killing-preserve-officer',family:'officer',helper:['비견','겁재'],obstacle:['편관'],target:['정관'],anchor:'target',relation:'coexistence'},
 {id:'combine-killing-preserve-wealth',family:'wealth',helper:['비견','겁재'],obstacle:['편관'],target:W,anchor:'target',relation:'reverse-generate'},
 {id:'combine-resource-preserve-food',family:'killing',helper:W,obstacle:I,target:['식신'],anchor:'controller-target',relation:'control'},
 {id:'combine-one-preserve-one-officer',family:'officer',helper:['식신','상관'],obstacle:['정관'],target:['정관'],anchor:'target',relation:'same-role'}
];
export function reviewCandidateInterference(candidate,observation,occurrences){
 const visible=observation.visible,byId=new Map(occurrences.map(o=>[o.id,o]));
 const actors=visible.filter(o=>!o.dayReference);
 const anchors=new Set(candidate.anchorIds);
 const directed=observation.directed;
 const relation=(a,b,kind)=>observation.relationEdges.find(e=>e.from===a&&e.to===b&&e.kind===kind)?.id??null;
 const witnesses=[];
 for(const rule of rules.filter(r=>r.family===candidate.family)){
  for(const helper of actors.filter(o=>rule.helper.includes(o.tenGod)))for(const obstacle of actors.filter(o=>rule.obstacle.includes(o.tenGod))){
   const pair=observation.pairs.find(p=>includesPair(p,helper.id,obstacle.id));
   if(!pair)continue;
   for(const target of occurrences.filter(o=>!o.dayReference&&rule.target.includes(o.tenGod))){
    // Hidden target is allowed as an anchor, but not as a stem-combination participant.
    if(new Set([helper.id,obstacle.id,target.id]).size!==3)continue;
    if(rule.anchor==='target'&&!anchors.has(target.id))continue;
    if(rule.relation==='same-role'&&target.layer!=='visible')continue;
    if(rule.relation==='same-role'&&obstacle.stem!==target.stem)continue;
    let controlTargets=[];
    if(rule.anchor==='controller-target'){
     controlTargets=[...anchors].filter(id=>byId.get(id)?.tenGod==='편관'&&id!==target.id&&id!==helper.id&&id!==obstacle.id);
     if(!controlTargets.length)continue;
    }
    // Visible relations are already guaranteed by the role definitions;
    // a hidden endpoint keeps its physical access unresolved.
    const threatEdgeId=rule.relation==='control'?relation(obstacle.id,target.id,'control'):rule.relation==='reverse-generate'?relation(target.id,obstacle.id,'generate'):null;
    if(['control','reverse-generate'].includes(rule.relation)&&!threatEdgeId)continue;
    if(rule.anchor==='controller-target'){
     controlTargets=controlTargets.filter(id=>relation(target.id,id,'control'));
     if(!controlTargets.length)continue;
    }
    const targetContacts=observation.pairs.filter(p=>p.participants.includes(target.id)).map(p=>p.id);
    const concerns=unique([...(pair.span>1?['separated-combination']:[]),...(pair.adjacentCompetitorIds.length?['adjacent-competition']:[]),
     ...(pair.remoteCompetitorIds.length?['remote-alternative-contact']:[]),...(targetContacts.length?['protected-target-contact']:[]),
     ...(target.layer!=='visible'?['hidden-target-access']:[]),...(observation.status==='partial'?['missing-hour']:[])]);
    witnesses.push({ruleId:rule.id,source:source.assistant,helper:helper.id,obstacle:obstacle.id,target:target.id,relation:rule.relation,
     combinationId:pair.id,threatEdgeId,controlTargets,targetContacts,concerns,effective:null,preserved:null});
   }
  }
 }
 // Resource/wealth positional separation is evidence, not universal noninterference.
 const separation=directed.filter(e=>e.kind==='control'&&W.includes(byId.get(e.from)?.tenGod)&&I.includes(byId.get(e.to)?.tenGod))
  .filter(e=>anchors.has(e.from)||anchors.has(e.to)||candidate.family==='officer')
  .map(e=>({edgeId:e.edgeId,wealth:e.from,resource:e.to,between:[...e.between],dayBetween:e.between.some(id=>byId.get(id)?.dayReference),interference:e.interference,scope:anchors.has(e.from)||anchors.has(e.to)?'anchor-related':'officer-chart-context',noninterferenceConfirmed:null}));
 return {candidateId:candidate.candidateId,family:candidate.family,witnesses,separation,formed:null,broken:null,rescued:null,selectionAuthority:false};
}
// Bind only explicitly corresponding motif conditions, never fuzzy name matching.
const conditionRules={
 'killing-combined-without-loss-of-officer':['combine-killing-preserve-officer'],
 'resource-controls-hurting-effect':['combine-hurting-preserve-officer'],
 'wealth-controls-resource-preserves-food':['combine-resource-preserve-food'],
 'wealth-resource-noninterference':[],
 'resource-wealth-noninterference':[]
};
export function reviewInterferenceConditions(motifs,candidate){
 return motifs.flatMap(m=>m.clauses.filter(k=>k.kind==='contextual'&&Object.hasOwn(conditionRules,k.name)).map(k=>{
  const ids=conditionRules[k.name];
  const witnesses=candidate.witnesses.filter(w=>ids.includes(w.ruleId));
  const separation=ids.length?[]:candidate.separation;
  // Some witness mechanisms (combine versus control) are alternatives,
  // not proof of the named condition. This is diagnostic evidence only.
  return {motifId:m.id,condition:k.name,witnesses:witnesses.map(w=>({ruleId:w.ruleId,combinationId:w.combinationId,helper:w.helper,obstacle:w.obstacle,target:w.target})),
   separationEdgeIds:unique(separation.map(s=>s.edgeId)),
   status:m.predicate===false?'literal-motif-excluded':witnesses.length||separation.length?'related-structure-observed':'no-related-structure-observed',
   doctrinalValue:null,effective:null};
 }));
}
export function reviewPatternInterference(result,outcome){
 if(!result.stemForce||!result.relativeForce||outcome.status==='unavailable')return {version:STEM_INTERFERENCE_VERSION,status:'unavailable',pairs:[],competition:[],directed:[],candidates:[],selectionAuthority:false};
 const obs=observeStemInterference(result.stemForce,result.relativeForce,result.completeHour===true&&result.stemForce.completeHour===true&&result.relativeForce.completeHour===true);
 const {visible,relationEdges,...publicObs}=obs;
 return {...publicObs,candidates:outcome.candidates.map(c=>{
  const review=reviewCandidateInterference(c,obs,result.routeReview.occurrences);
  const motifs=result.outcomes?.find(x=>x.candidateId===c.candidateId)?.motifs??[];
  return {...review,conditions:reviewInterferenceConditions(motifs,review)};
 })};
}
export function summarizeInterference(reviews){
 const pairs=reviews.flatMap(r=>r.pairs),candidates=reviews.flatMap(r=>r.candidates),witnesses=candidates.flatMap(c=>c.witnesses);
 return {charts:reviews.length,partial:reviews.filter(r=>r.status==='partial').length,unavailable:reviews.filter(r=>r.status==='unavailable').length,
  pairs:pairs.length,adjacent:pairs.filter(p=>p.span===1).length,separated:pairs.filter(p=>p.span>1).length,dayContacts:pairs.filter(p=>p.includesDay).length,
  competitionOccurrences:reviews.reduce((n,r)=>n+r.competition.length,0),candidates:candidates.length,preservationWitnesses:witnesses.length,
  byRule:Object.fromEntries(rules.map(r=>[r.id,witnesses.filter(w=>w.ruleId===r.id).length])),
  separationWitnesses:candidates.reduce((n,c)=>n+c.separation.length,0),
  conditionReviews:candidates.reduce((n,c)=>n+c.conditions.length,0),conditionsWithRelatedStructure:candidates.reduce((n,c)=>n+c.conditions.filter(k=>k.status==='related-structure-observed').length,0),
  confirmedRemoval:0,confirmedPreservation:0,selectionAuthority:false};
}
