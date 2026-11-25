// Explicit research hypotheses, not effective-force verdicts.
// No weighted scores, no inferred magnitude from axis count.
const key=(r,w)=>JSON.stringify([r,w]);
const edgeKey=e=>JSON.stringify([e.from,e.to,e.kind]);
const sorted=xs=>[...new Set(xs)].sort();
const state=(id,value,evidence)=>({id,state:value,evidence});
const validState=x=>x==='supported'||x==='opposed'||x==='conflicting'||x==='unresolved';
export function composeMechanismConditions(conditions){
 const ss=conditions.map(c=>c.state);
 if(!ss.length||ss.some(s=>!validState(s)))return 'unresolved';
 if(ss.includes('conflicting'))return 'conflicting';
 if(ss.includes('opposed'))return 'opposed';
 return ss.every(s=>s==='supported')?'supported':'unresolved';
}
export function chooseMechanismAlternative(states){
 if(!states.length)return 'unresolved';
 if(states.includes('supported'))return 'supported';
 if(states.every(s=>s==='opposed'))return 'opposed';
 return states.includes('conflicting')?'conflicting':'unresolved';
}
// Climate groups are source requirements, not a sufficient climate model.
// A missing exact visible stem is not absence of its element or failed supply.
export function projectMechanismClimate(climate,complete){
 const context=climate?.requirementContext;
 const base={policy:climate?.version??null,section:climate?.evidence?.sourceProfile?.section??null,
  seasonalNeed:climate?.evidence?.seasonal?.need??null,adequacyConfirmed:null,selectionAuthority:false};
 if(!context)return {...base,status:'source-unavailable',groups:[],requirements:[],alternatives:[]};
 const requirements=context.requirements.map(r=>{
  const exactRoot=r.roots.filter(x=>x.match==='exact-stem'&&x.role!=='residual'&&!x.clashExposed).map(x=>x.position);
  const presence=r.exactVisible.length>0;
  const root=exactRoot.length>0;
  return {stem:r.stem,element:r.element,exactVisibleIds:r.exactVisible.map(p=>'visible:'+p),exactSubstantialRootPositions:sorted(exactRoot),
   dayReferenceMatches:r.dayReferenceMatches,combinationPositions:r.combinations.map(c=>c.positions),
   status:presence&&root?'exact-visible-and-root-observed':presence?'visible-root-review':root?'hidden-root-review':complete?'no-exact-visible-or-substantial-root-observed':'partial',
   effectiveSupply:null};
 });
 const byStem=new Map(requirements.map(r=>[r.stem,r]));
 return {...base,status:complete?'diagnostic':'partial',requirements,
  groups:context.baselineGroups.map(stems=>({stems:[...stems],allExactVisibleAndRootObserved:stems.every(s=>byStem.get(s)?.status==='exact-visible-and-root-observed'),effectiveSupply:null})),
  alternatives:context.alternatives.map(a=>({when:a.when,stems:[...a.stems],conditionResolved:false}))};
}
// Directional evidence: a dominant target is a concern for control only.
// Missing roots, locality or contacts are not proof of an ineffective edge.
export function evaluateMechanismEdge(edge,complete){
 const base={from:edge.from,to:edge.to,kind:edge.kind,effective:null};
 if(edge.status==='invalid-evidence'||!edge.source||!edge.target)return {...base,status:'invalid-evidence',conditions:[]};
 const a=edge.source,b=edge.target,bs=edge.blockers??[];
 const contains=x=>bs.includes(x);
 const condition=[];
 condition.push(state('complete-chart',complete?'supported':'unresolved',complete));
 condition.push(state('visible-participant-access',a.kind==='visible'&&b.kind==='visible'?'supported':'unresolved',[a.kind,b.kind]));
 if(edge.kind==='combine'){
  condition.push(state('exclusive-adjacent-combination',edge.combination?.exclusiveObserved&&edge.combination?.adjacent?'supported':'unresolved',edge.combination??null));
  condition.push(state('combination-outcome','unresolved',null));
  return {...base,status:'unresolved',conditions:condition};
 }
 if(a.kind==='group'||b.kind==='group')condition.push(state('group-transformation','unresolved',null));
 const capacity=(x,role)=>{
  const axes=x.axes??{};
  const direct=axes.anySubstantial===true;
  const indirect=axes.localRootedGeneration===true||axes.localRootedPeer===true;
  const season=axes.principalSupport===true||axes.seasonSupport===true;
  return state(role,direct?'supported':'unresolved',{directRoot:axes.anySubstantial??null,indirectSupply:indirect,seasonSupport:season,rootPositions:x.rootPositions??[]});
 };
 condition.push(capacity(a,'source-root-capacity'));
 if(edge.kind==='generate')condition.push(capacity(b,'target-receptive-root-context'));
 const relation=edge.relative?.relation??null;
 if(edge.kind==='control'){
  condition.push(state('directional-control-evidence',relation==='left-evidence-dominates'?'supported':relation==='right-evidence-dominates'?'opposed':relation==='mixed-evidence'?'conflicting':'unresolved',relation));
 }else condition.push(state('generation-direction','supported',relation));
 const pressure=edge.sourceLocalControlNodes??[];
 condition.push(state('source-pressure',pressure.length||contains('source-local-rooted-control')?'unresolved':'supported',
  {controllers:pressure,protectionOptions:edge.possibleLocalProtection??[]}));
 const disruptions=bs.filter(x=>!['relative-evidence-conflict','relative-evidence-unresolved','target-evidence-dominates-control-source','source-local-rooted-control'].includes(x));
 condition.push(state('remaining-context',disruptions.length?'unresolved':'supported',disruptions));
 // Preserve relative mixed evidence for generation as review context, without requiring dominance.
 if(edge.kind==='generate'&&['mixed-evidence','unresolved','not-comparable'].includes(relation))condition.push(state('relative-generation-context','unresolved',relation));
 return {...base,status:composeMechanismConditions(condition),conditions:condition};
}
export function observeMechanismReview(review,efficacy,clarity,climate,complete){
 const base={candidateId:review.candidateId,selectionAuthority:false,effective:null,formationConfirmed:null,breakageConfirmed:null,rescueConfirmed:null};
 if(review.status==='out-of-scope')return {...base,status:'out-of-scope',edges:[],routes:[],threats:[]};
 if(!efficacy||efficacy.status==='invalid-evidence'||clarity?.routeInjury?.status==='invalid-evidence')return {...base,status:'invalid-evidence',edges:[],routes:[],threats:[]};
 const registry=new Map(),lookup=new Map(review.rules.flatMap(r=>r.witnesses.map(w=>[key(r.id,w.id),{r,w}])));
 const assess=e=>{
  const k=edgeKey(e);
  // Validate each reference before reuse; an invalid duplicate must not inherit a valid cached edge.
  const assessed=evaluateMechanismEdge(e,complete);
  if(assessed.status==='invalid-evidence')return {id:k,...assessed};
  if(!registry.has(k))registry.set(k,{id:k,...assessed});
  return registry.get(k);
 };
 const contacts=clarity?.routeInjury?.contacts??[];
 const groupContext=clarity?.routeInjury?.groupContext??[];
 const routes=efficacy.witnesses.map(row=>{
  const entry=lookup.get(key(row.ruleId,row.witnessId));
  if(!entry)return {ruleId:row.ruleId,witnessId:row.witnessId,status:'invalid-evidence',effective:null};
  const mandatory=row.edges.map(assess),alternatives=row.anchorAlternatives.map(a=>({anchorId:a.anchorId,edge:a.edge?assess(a.edge):null}));
  const participants=new Set([...Object.values(row.roles),...row.edges.flatMap(e=>[e.from,e.to]),...row.anchorAlternatives.flatMap(a=>[a.anchorId,...(a.edge?[a.edge.from,a.edge.to]:[])])]);
  const relevantClimate=climate.requirements.filter(r=>r.exactVisibleIds.some(id=>participants.has(id))).map(r=>({stem:r.stem,visibleIds:r.exactVisibleIds.filter(id=>participants.has(id)),status:r.status}));
  const hits=contacts.filter(c=>c.route.ruleId===row.ruleId&&c.route.witnessId===row.witnessId);
  const groups=groupContext.filter(c=>c.route.ruleId===row.ruleId&&c.route.witnessId===row.witnessId);
  const cond=[state('mandatory-edge-path',mandatory.some(e=>e.status==='invalid-evidence')?'unresolved':composeMechanismConditions(mandatory.map(e=>({state:e.status}))),mandatory.map(e=>e.id))];
  if(alternatives.length)cond.push(state('anchor-alternative-path',chooseMechanismAlternative(alternatives.map(a=>a.edge?.status??'unresolved')),alternatives.map(a=>({anchorId:a.anchorId,edgeId:a.edge?.id??null}))));
  if(!complete)cond.push(state('complete-chart','unresolved',null));
  if(row.flags.length)cond.push(state('witness-context','unresolved',row.flags));
  if(hits.length||groups.some(g=>g.clashIds.length||g.competingContacts.length))cond.push(state('assistant-contact','unresolved',{contacts:hits.map(c=>({assistantId:c.assistantId,obstacleId:c.obstacleId,kind:c.contact.kind})),groups:groups.map(g=>g.formationId)}));
  const invalid=mandatory.some(e=>e.status==='invalid-evidence')||alternatives.some(a=>a.edge?.status==='invalid-evidence');
  return {ruleId:row.ruleId,witnessId:row.witnessId,kind:row.kind,status:invalid?'invalid-evidence':composeMechanismConditions(cond),conditions:cond,
   climateParticipants:relevantClimate,climateAdequacy:null,unresolvedClassicalConditions:[...row.unresolvedConditions],effective:null};
 });
 const byKey=new Map(routes.map(r=>[key(r.ruleId,r.witnessId),r]));
 const read=r=>byKey.get(key(r.ruleId,r.witnessId))?.status??'invalid-evidence';
 const threats=efficacy.threats.map(t=>({threat:t.threat,threatHypothesis:read(t.threat),alternatives:t.alternatives.map(a=>({ruleId:a.ruleId,witnessId:a.witnessId,status:read(a)})),
  coverage:t.coverage,resolutionConfirmed:null}));
 return {...base,status:routes.some(r=>r.status==='invalid-evidence')||threats.some(t=>t.threatHypothesis==='invalid-evidence'||t.alternatives.some(a=>a.status==='invalid-evidence'))?'invalid-evidence':complete?'diagnostic':'partial',
  edges:[...registry.values()],routes,threats,limitations:['conditional-research-hypotheses-only','opposed-is-not-ineffective','supported-is-not-effective','climate-context-not-global-veto','unresolved-classical-conditions-not-certified']};
}
