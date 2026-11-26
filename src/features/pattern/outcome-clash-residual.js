// A clash belongs to physical branch positions; a root belongs to a
// physical hidden-stem slot. Do not infer erasure, restoration or force.
const ORDER=['year','month','day','hour'];
const index=(xs,f)=>Array.isArray(xs)&&new Set(xs.map(f)).size===xs.length?new Map(xs.map(x=>[f(x),x])):null;
const uniq=xs=>[...new Set(xs)].sort();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const setEqual=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&same(uniq(a),uniq(b));
const absent={damageConfirmed:null,preservationConfirmed:null,reliefConfirmed:null,effective:null};
export function observeClashResidualContext(prior,formation,root,supply){
 const complete=prior?.completeHour,status=complete?'diagnostic':'partial';
 const base={version:'clash-residual-context-v1',completeHour:complete,selectionAuthority:false,...absent};
 const empty=()=>({...base,status:'invalid-evidence',clashes:[],slots:[],occurrences:[],actions:[],sharedExposedRoots:[]});
 if(typeof complete!=='boolean'||[formation,root,supply].some(x=>!x||x.status!==status||x.completeHour!==complete)||
  formation.effectsConfirmed!==false||root.selectionAuthority!==false||root.rootEffectConfirmed!==null||supply.selectionAuthority!==false||supply.effectiveSupply!==null)return empty();
 const actors=index(prior.stemForce?.occurrences,a=>a.id),slots=index(root.slots,s=>s.id),roots=index(root.occurrences,a=>a.id),obs=index(supply.occurrences,a=>a.id),
  forms=index(formation.formations,f=>f.id),clashes=index(formation.clashes,c=>c.id),reliefs=index(root.clashes,c=>c.clashId),nodes=index(supply.nodes,n=>n.nodeId),
  raw=index(prior.relativeForce?.edges,e=>e.id),actions=index(supply.actions,e=>e.edgeId);
 if(!actors||!slots||!roots||!obs||!forms||!clashes||!reliefs||!nodes||!raw||!actions||actors.size!==roots.size||actors.size!==obs.size||
  clashes.size!==reliefs.size||raw.size!==actions.size||slots.size!==[...actors.values()].filter(a=>a.layer==='hidden').length)return empty();
 const branchForms=[...forms.values()].filter(f=>f.layer==='branch'),visible=[...actors.values()].filter(a=>a.layer==='visible');
 const clashRows=[];
 for(const c of clashes.values()){
  const q=reliefs.get(c.id);
  if(!q||!Array.isArray(c.positions)||c.positions.length!==2||new Set(c.positions).size!==2||c.positions.some(p=>!ORDER.includes(p))||
   !same(c.positions,q.positions)||q.reliefConfirmed!==null||!Array.isArray(q.alternatives))return empty();
  const candidates=branchForms.filter(f=>['six-harmony','complete-three'].includes(f.classification)&&f.flags.structurallyComplete&&f.positions.filter(p=>c.positions.includes(p)).length===1);
  if(!setEqual(q.alternatives.map(a=>a.formationId),candidates.map(f=>f.id)))return empty();
  const alternatives=[];
  for(const a of q.alternatives){
   const f=forms.get(a.formationId),shared=f.positions.find(p=>c.positions.includes(p));
   const otherClashIds=uniq([...clashes.values()].filter(x=>x.id!==c.id&&x.positions.some(p=>f.positions.includes(p))).map(x=>x.id));
   const remainingClashIds=uniq([...clashes.values()].filter(x=>x.id!==c.id&&x.positions.some(p=>c.positions.includes(p))).map(x=>x.id));
   const competingFormationIds=uniq(branchForms.filter(g=>g.id!==f.id&&g.flags.structurallyComplete&&g.positions.some(p=>f.positions.includes(p))&&g.positions.some(p=>!f.positions.includes(p))).map(g=>g.id));
   const expected=!complete?'partial':otherClashIds.length||remainingClashIds.length||competingFormationIds.length?'competing-relief-review':'relief-contact-review';
   if(a.sharedPosition!==shared||!same(a.otherClashIds,otherClashIds)||!same(a.remainingClashIds,remainingClashIds)||
    !same(a.competingFormationIds,competingFormationIds)||a.hypothesis!==expected||a.reliefConfirmed!==null||f.transformationConfirmed!==null)return empty();
   alternatives.push({formationId:f.id,classification:f.classification,positions:[...f.positions],sharedPosition:shared,
    oppositePosition:c.positions.find(p=>p!==shared),targetElement:f.target,otherClashIds,remainingClashIds,competingFormationIds,
    hypothesis:a.hypothesis,reliefConfirmed:null});
  }
  const endpoints=c.positions.map(position=>({position,slotIds:[...slots.values()].filter(s=>s.position===position).map(s=>s.id),damageConfirmed:null}));
  if(endpoints.some(e=>!e.slotIds.length))return empty();
  clashRows.push({clashId:c.id,positions:[...c.positions],endpoints,alternatives,...absent});
 }
 const byClash=new Map(clashRows.map(c=>[c.clashId,c])),exposed=[];
 for(const s of slots.values()){
  const a=actors.get(s.id),incident=clashRows.filter(c=>c.positions.includes(s.position)),f=branchForms.filter(f=>f.positions.includes(s.position)),
   competing=f.filter(f=>f.flags.structurallyComplete&&f.target!=null&&f.target!==s.element);
  if(!a||a.layer!=='hidden'||a.position!==s.position||a.stem!==s.stem||a.element!==s.element||a.hiddenRole!==s.role||
   !setEqual(s.clashIds,incident.map(c=>c.clashId))||!setEqual(s.formationIds,f.map(f=>f.id))||!setEqual(s.competingTargetFormationIds,competing.map(f=>f.id))||
   s.effectiveRoot!==null||s.accessConfirmed!==null||s.independentSupplyConfirmed!==null||
   s.state!==(incident.length?'clash-exposed':competing.length?'formation-contested':s.role==='residual'?'residual-context':'uncontested-substantial-observation'))return empty();
  if(!incident.length)continue;
  const alternatives=incident.map(c=>({clashId:c.clashId,options:c.alternatives.map(a=>({formationId:a.formationId,
   side:a.sharedPosition===s.position?'root-side':'opposite-side',rootPositionParticipates:a.positions.includes(s.position),
   targetElement:a.targetElement,rootElementDiffersFromTarget:a.positions.includes(s.position)&&a.targetElement!=null&&a.targetElement!==s.element,
   hypothesis:a.hypothesis,reliefConfirmed:null}))}));
  const uncoveredClashIds=alternatives.filter(x=>!x.options.length).map(x=>x.clashId);
  // Candidate coverage is not joint feasibility. A formation may be
  // cited for two clashes, and relief may introduce a competing target.
  exposed.push({id:s.id,position:s.position,stem:s.stem,element:s.element,role:s.role,substantial:s.role!=='residual',
   clashIds:[...s.clashIds],formationIds:[...s.formationIds],competingTargetFormationIds:[...s.competingTargetFormationIds],
   reliefAlternatives:alternatives,uncoveredClashIds,allIncidentClashesHaveCandidate:uncoveredClashIds.length===0,
   context:!complete?'partial':s.role==='residual'?'residual-exposure-review':uncoveredClashIds.length?'incomplete-relief-coverage':'relief-candidate-coverage-review',...absent});
 }
 const exposedById=new Map(exposed.map(s=>[s.id,s])),occurrences=[];
 for(const a of visible){
  const r=roots.get(a.id),s=obs.get(a.id);
  if(!r||!s||r.layer!=='visible'||s.layer!=='visible'||r.rootPreservedConfirmed!==null||s.effectiveSupply!==null||s.directRoot?.preservationConfirmed!==null||
   !Array.isArray(r.roots)||!same(r.uncontestedRootIds,s.directRoot.uncontestedRootIds)||!same(r.contestedRootIds,s.directRoot.contestedRootIds)||r.rootAxes.anySubstantial!==s.directRoot.state)return empty();
  const literal=index(a.roots,x=>'hidden:'+x.position+':'+x.stem),rootRows=index(r.roots,x=>x.id);
  if(!literal||!rootRows||literal.size!==rootRows.size)return empty();
  for(const x of rootRows.values()){
   const h=slots.get(x.id),l=literal.get(x.id);
   if(!h||!l||h.element!==a.element||x.state!==h.state||x.role!==h.role||x.match!==(h.stem===a.stem?'exact-stem':'same-element')||l.clashExposed!==exposedById.has(x.id))return empty();
  }
  const hit=r.roots.filter(x=>exposedById.has(x.id));
  if(!hit.length)continue;
  const substantial=hit.filter(x=>x.role!=='residual'),residual=hit.filter(x=>x.role==='residual');
  const intact=r.roots.filter(x=>x.state==='uncontested-substantial-observation');
  if(!setEqual(r.uncontestedRootIds,intact.map(x=>x.id))||!setEqual(r.contestedRootIds,r.roots.filter(x=>x.role!=='residual'&&x.state!=='uncontested-substantial-observation').map(x=>x.id)))return empty();
  const incidentIds=uniq(hit.flatMap(x=>exposedById.get(x.id).clashIds)),positions=uniq(incidentIds.flatMap(id=>byClash.get(id).positions));
  const incoming=[];
  for(const id of s.groundedPathIds){
   const p=s.paths.find(p=>p.id===id),n=p&&nodes.get(p.donor.nodeId);
   if(!p||!n||!same(n,p.donor)||p.recipientId!==a.id||p.upstream!=='observed'||p.effectiveSupply!==null||n.independentSupplyConfirmed!==null||
    n.groundedRootIds.some(id=>slots.get(id)?.state!=='uncontested-substantial-observation'))return empty();
   incoming.push({pathId:id,donorNodeId:n.nodeId,groundedRootIds:[...n.groundedRootIds],
    sharedDirectRootIds:n.groundedRootIds.filter(id=>r.uncontestedRootIds.includes(id)),readiness:p.readiness,effective:null});
  }
  const context=!complete?'partial':!substantial.length?'residual-only-exposure':intact.length?'exposed-and-uncontested-substantial-roots':
   incoming.length?'exposed-substantial-with-indirect-supply':'exposed-substantial-without-uncontested-root';
  occurrences.push({id:a.id,dayReference:a.dayReference,element:a.element,exposedSubstantialRootIds:substantial.map(x=>x.id),
   exposedResidualRootIds:residual.map(x=>x.id),uncontestedRootIds:[...r.uncontestedRootIds],
   uncontestedExactRootIds:intact.filter(x=>x.match==='exact-stem').map(x=>x.id),
   otherContestedRootIds:r.contestedRootIds.filter(id=>!exposedById.has(id)),incidentClashIds:incidentIds,
   outsideIncidentClashRootIds:intact.filter(x=>!positions.includes(x.position)).map(x=>x.id),incoming,context,...absent});
 }
 const affected=new Map(occurrences.map(a=>[a.id,a])),affectedActions=[];
 for(const e of actions.values()){
  const a=actors.get(e.from),b=actors.get(e.to),q=raw.get(e.edgeId);
  if(!a||!b||!q||q.from!==e.from||q.to!==e.to||q.kind!==e.kind||e.effective!==null||q.effective!==null||e.selectionAuthority!==false||!Array.isArray(e.contextBlockers))return empty();
  if(a.layer!=='visible'||b.layer!=='visible')continue;
  const x=affected.get(a.id),y=affected.get(b.id);
  if(e.contextBlockers.includes('root-clash-exposure')!==!!(x||y))return empty();
  if(!x&&!y)continue;
  const substantialRootIds=uniq([...(x?.exposedSubstantialRootIds??[]),...(y?.exposedSubstantialRootIds??[])]),
   residualRootIds=uniq([...(x?.exposedResidualRootIds??[]),...(y?.exposedResidualRootIds??[])]);
  affectedActions.push({edgeId:e.edgeId,from:e.from,to:e.to,kind:e.kind,substantialRootIds,residualRootIds,
   exposureContext:substantialRootIds.length?'substantial-exposure':'residual-only-exposure',
   originalGenerationScreen:e.generationScreen,originalContextBlockers:[...e.contextBlockers],...absent});
 }
 const sharedExposedRoots=exposed.map(s=>({rootId:s.id,actorIds:occurrences.filter(a=>[...a.exposedSubstantialRootIds,...a.exposedResidualRootIds].includes(s.id)).map(a=>a.id),independentSupplyConfirmed:null})).filter(s=>s.actorIds.length>1);
 return {...base,status,clashes:clashRows,slots:exposed,occurrences,actions:affectedActions,sharedExposedRoots,
  limitations:['clash-exposure-not-root-erasure','residual-not-substantial','relief-candidate-coverage-not-joint-allocation','opposite-side-not-root-restoration','outside-root-not-independent-capacity','no-screen-promotion']};
}
