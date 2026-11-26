// Independent coverage check over published chart-level inventories.
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sorted=xs=>[...xs].sort();
const noAuthority=x=>x&&x.restrictionConfirmed===null&&x.retentionConfirmed===null&&x.transformationConfirmed===null&&x.effective===null;
export function summarizeCombinationResidual(c,m,partial){
 const errors=[],base={id:c.id,partial,effectConfirmed:null},r=m?.combinationResidualContext,pairs=m?.combinationContext?.pairs,capacity=m?.roleCapacity?.occurrences,root=m?.rootContext,supply=m?.groundedSupply;
 const counts={pairs:0,selfPairs:0,participants:0,rootObserved:0,supplyObserved:0,actions:0,visibleActions:0},contexts={};
 if(!noAuthority(r)||r.status!==(partial?'partial':'diagnostic')||r.completeHour!==!partial||r.selectionAuthority!==false||
  !Array.isArray(r.pairs)||!Array.isArray(r.participants)||!Array.isArray(r.actions)||!Array.isArray(pairs)||!Array.isArray(capacity)||!Array.isArray(root?.occurrences)||!Array.isArray(supply?.actions))return {...base,errors:['combination-residual-contract']};
 const ids=new Map(),byId=new Map(capacity.map(a=>[a.id,a])),roots=new Map(root.occurrences.map(a=>[a.id,a])),slots=new Map(root.slots.map(s=>[s.id,s])),obs=new Map(supply.occurrences.map(a=>[a.id,a]));
 for(const p of pairs)for(const id of p.participants){if(!ids.has(id))ids.set(id,[]);ids.get(id).push(p.id);}
 const expectedIds=sorted(pairs.map(p=>p.id)),expectedParticipants=sorted([...ids.keys()]);
 if(!same(sorted(r.pairs.map(p=>p.id)),expectedIds)||!same(sorted(r.participants.map(p=>p.id)),expectedParticipants))errors.push('combination-residual-coverage');
 for(const p of r.pairs){
  counts.pairs++;if(p.dayReferenceInvolved)counts.selfPairs++;contexts[p.contactHypothesis]=(contexts[p.contactHypothesis]??0)+1;
  const q=pairs.find(q=>q.id===p.id);
  if(!q||!noAuthority(p)||p.formationId!==q.formationId||!same(p.participants,q.participants)||p.span!==q.distance||p.associatedElement!==q.associatedElement||
   p.contactHypothesis!==q.contactHypothesis||p.dayReferenceInvolved!==q.dayReferenceInvolved||
   p.scope!==(q.dayReferenceInvolved?'self-combination-not-external-removal':'external-role-restriction-review')||
   !same(p.competitors,q.competing.map(x=>({...x,pairId:JSON.stringify([x.participantId,x.partnerId].sort())})))||
   !same(p.intervening,q.intervening)||p.transformationContext!==q.transformation.context||p.monthSupports!==q.transformation.monthSupports||p.seasonSupports!==q.transformation.seasonSupports)errors.push('combination-residual-pair:'+p.id);
 }
 for(const p of r.participants){
  counts.participants++;if(p.retainedEvidence==='original-root-observed')counts.rootObserved++;if(p.retainedEvidence==='original-supply-observed')counts.supplyObserved++;
  const a=byId.get(p.id),q=roots.get(p.id),s=obs.get(p.id);
  if(!a||!q||!s||!noAuthority(p)||a.dayReference!==p.dayReference||a.tenGod!==p.tenGod||a.element!==p.element||!same(sorted(p.pairIds),sorted(ids.get(p.id)??[]))||
   !same(p.uncontestedRootIds,q.uncontestedRootIds)||!same(p.contestedRootIds,q.contestedRootIds)){errors.push('combination-residual-participant:'+p.id);continue;}
  const expectedRoots=q.roots.map(x=>({id:x.id,state:x.state,role:x.role,match:x.match,formationIds:[...slots.get(x.id).formationIds],clashIds:[...slots.get(x.id).clashIds]}));
  const expectedIncoming=s.groundedPathIds.map(id=>{const x=s.paths.find(x=>x.id===id);return {pathId:id,donorNodeId:x.donor.nodeId,groundedRootIds:[...x.donor.groundedRootIds],readiness:x.readiness,concerns:[...x.concerns],effective:null};});
  const alternatives=capacity.filter(b=>b.id!==a.id&&!b.dayReference&&!a.dayReference&&b.tenGod===a.tenGod).map(b=>({id:b.id,layer:b.layer,contactPairIds:ids.get(b.id)??[],access:b.layer!=='visible'?'hidden-access-review':ids.has(b.id)?'other-contact-review':'no-stem-pair-observed',substitutionConfirmed:null}));
  const basis=partial?'partial':q.uncontestedRootIds.length?'original-root-observed':expectedIncoming.length?'original-supply-observed':q.contestedRootIds.length?'original-root-context-review':'original-basis-not-established';
  if(!same(p.originalRoots,expectedRoots)||!same(p.incoming,expectedIncoming)||!same(p.alternatives,alternatives)||p.retainedEvidence!==basis)errors.push('combination-residual-provenance:'+p.id);
 }
 const expectedActions=supply.actions.filter(e=>ids.has(e.from)||ids.has(e.to));
 if(!same(sorted(r.actions.map(e=>e.edgeId)),sorted(expectedActions.map(e=>e.edgeId))))errors.push('combination-residual-action-coverage');
 for(const e of r.actions){
  counts.actions++;if(e.access==='visible')counts.visibleActions++;
  const q=expectedActions.find(q=>q.edgeId===e.edgeId),a=ids.get(e.from)??[],b=ids.get(e.to)??[];
  if(!q||!noAuthority(e)||e.from!==q.from||e.to!==q.to||e.kind!==q.kind||!same(sorted(e.fromPairIds),sorted(a))||!same(sorted(e.toPairIds),sorted(b))||
   !same(sorted(e.samePairIds),sorted(a.filter(id=>b.includes(id))))||e.originalGenerationScreen!==q.generationScreen||!same(e.originalContextBlockers,q.contextBlockers)||
   e.access!==(byId.get(e.from)?.layer==='visible'&&byId.get(e.to)?.layer==='visible'?'visible':'hidden-endpoint-review'))errors.push('combination-residual-action:'+e.edgeId);
 }
 return {...base,counts,contexts,errors};
}
