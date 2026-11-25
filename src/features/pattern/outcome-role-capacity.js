// Role-specific capacity evidence. No magnitude, no duplicate root budget.
const GODS=['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];
const key=(r,w)=>JSON.stringify([r,w]);
const sorted=xs=>[...new Set(xs)].sort();
const observed=(xs,complete)=>xs.length?true:complete?false:null;
const pairKey=(a,b)=>JSON.stringify([a,b].sort());
const edgeKey=e=>JSON.stringify([e.from,e.to,e.kind]);
const SOURCES={killing:'https://changxianyi.com/guji/ziping/nlc-continuation-text-review-20261005/pianguan/',
 contrast:'https://changxianyi.com/guji/ziping/nlc-continuation-text-review-20261005/pianguan-quyun/',
 resource:'https://www.diancangwang.cn/xuanxuewushu/03cf53eede8a/6e77288ed5b4.html'};
export function observeRoleCapacity(prior){
 const complete=prior.completeHour,actors=prior.stemForce.occurrences,profiles=prior.relativeForce.profiles;
 const base={version:'outcome-role-capacity-v1',completeHour:complete,selectionAuthority:false,effectiveForce:null};
 const invalid=()=>({...base,status:'invalid-evidence',occurrences:[],tenGods:[]});
 if(new Set(actors.map(o=>o.id)).size!==actors.length||actors.some(o=>!profiles[o.id]||profiles[o.id].occurrenceId!==o.id))return invalid();
 const occurrences=actors.map(o=>{
  const p=profiles[o.id],roots=o.roots.filter(r=>r.role!=='residual'&&!r.clashExposed);
  return {id:o.id,tenGod:o.tenGod,layer:o.layer,position:o.position,dayReference:o.dayReference,element:o.element,
   exactRootSlots:sorted(roots.filter(r=>r.match==='exact-stem').map(r=>'branch:'+r.position)),
   sameElementRootSlots:sorted(roots.filter(r=>r.match==='same-element').map(r=>'branch:'+r.position)),
   exposedRootSlots:sorted(o.roots.filter(r=>r.clashExposed).map(r=>'branch:'+r.position)),
   rootedGenerationNodeIds:[...p.localGenerationNodes],rootedPeerNodeIds:[...p.localPeerNodes],rootedControlNodeIds:[...p.localControlNodes],
   axes:{...p.axes},contacts:[...p.contacts],effectiveForce:null,excessConfirmed:null,deficiencyConfirmed:null};
 });
 const tenGods=GODS.map(tenGod=>{
  const rows=occurrences.filter(o=>!o.dayReference&&o.tenGod===tenGod),visible=rows.filter(o=>o.layer==='visible'),hidden=rows.filter(o=>o.layer==='hidden');
  return {tenGod,visibleIds:visible.map(o=>o.id),hiddenIds:hidden.map(o=>o.id),visibleObserved:observed(visible,complete),
   exactRootSlots:sorted(rows.flatMap(o=>o.exactRootSlots)),sameElementRootSlots:sorted(rows.flatMap(o=>o.sameElementRootSlots)),
   sharedRootSlots:sorted(rows.flatMap(o=>sorted([...o.exactRootSlots,...o.sameElementRootSlots])).filter((slot,i,xs)=>xs.indexOf(slot)!==i)),
   effectiveForce:null,excessConfirmed:null,deficiencyConfirmed:null};
 });
 return {...base,status:complete?'diagnostic':'partial',occurrences,tenGods,limitations:['day-reference-excluded-from-ten-god-aggregation','root-slots-not-additive','hidden-access-unresolved','no-magnitude-from-axis-count']};
}
// Comparison is explicitly limited to the already observed directed edge.
// Hidden/group edges are not comparable merely because they have roots.
export function observeRoleConditions(review,prior,capacity,mechanism,compound,strength,combination){
 const base={candidateId:review.candidateId,selectionAuthority:false,excessConfirmed:null,deficiencyConfirmed:null,effective:null};
 const empty=status=>({...base,status,routes:[],dualRoles:[]});
 if(review.status==='out-of-scope')return empty('out-of-scope');
 if(capacity.status==='invalid-evidence'||mechanism.status==='invalid-evidence'||compound.status==='invalid-evidence'||combination.status==='invalid-evidence')return empty('invalid-evidence');
 const complete=prior.completeHour,actors=new Map(capacity.occurrences.map(o=>[o.id,o]));
 const raw=new Map(prior.relativeForce.edges.map(e=>[edgeKey(e),e]));
 const routeMap=new Map(mechanism.routes.map(r=>[key(r.ruleId,r.witnessId),r]));
 const entries=review.rules.flatMap(r=>r.witnesses.map(w=>({r,w})));
 if(routeMap.size!==entries.length||mechanism.routes.length!==entries.length||entries.some(({r,w})=>!routeMap.has(key(r.id,w.id))))return empty('invalid-evidence');
 const pairs=new Map(combination.pairs.map(p=>[pairKey(...p.participants),p]));
 const dayCapacity=complete&&strength?.direction==='strong'?'strong-hypothesis':complete&&strength?.direction==='weak'?'weak-hypothesis':'unresolved';
 const comparison=(a,b,kind)=>{
  const e=raw.get(edgeKey({from:a,to:b,kind}));
  const relation=e?.relative?.relation??null;
  return {from:a,to:b,kind,edgeId:e?.id??null,relation,
   hypothesis:!complete?'unresolved':relation==='left-evidence-dominates'?'source-evidence-dominates':relation==='right-evidence-dominates'?'target-evidence-dominates':relation==='mixed-evidence'?'conflicting-evidence':'unresolved',
   sharedRootSlots:(e?.relative?.sharedRootPositions??[]).map(p=>'branch:'+p),
   sharedGenerationNodeIds:e?.relative?.sharedGenerationNodes??[],effective:null};
 };
 const routes=[];
 for(const {r,w} of entries){
  const conditions=[],interpretations=[],contacts=[];
  const add=(id,source,evidence)=>conditions.push({id,source,evidence,confirmed:null});
  // Source-specific premises; no transit prescriptions are applied to natal.
  if(['killing-food','killing-food-regulation','killing-resource-blocks-food','killing-wealth-removes-resource'].includes(r.id)){
   const output=r.id==='killing-food'||r.id==='killing-food-regulation'?w.roles.helper:w.roles.food;
   const killing=w.roles.controller??w.roles.target;
   if(!actors.has(output)||!actors.has(killing))return empty('invalid-evidence');
   const c=comparison(output,killing,'control');
   add('output-killing-relative-evidence',SOURCES.contrast,c);
   add('day-capacity',SOURCES.killing,{hypothesis:dayCapacity});
   interpretations.push({id:'killing-heavy-output-light',evidence:c.hypothesis==='target-evidence-dominates'?'relative-evidence-aligned':'unresolved',excessConfirmed:null,deficiencyConfirmed:null},
    {id:'output-heavy-killing-light',evidence:c.hypothesis==='source-evidence-dominates'?'relative-evidence-aligned':'unresolved',excessConfirmed:null,deficiencyConfirmed:null});
   if(w.roles.food&&w.roles.obstacle)add('resource-obstructs-output',SOURCES.killing,comparison(w.roles.obstacle,output,'control'));
   if(r.kind==='rescue')add('wealth-restrains-resource',SOURCES.killing,comparison(w.roles.helper,w.roles.obstacle,'control'));
  }
  if(['resource-wealth','resource-wealth-regulation','resource-output-regulation'].includes(r.id)){
   add('day-capacity',SOURCES.resource,{hypothesis:dayCapacity});
   const resourceIds=r.id==='resource-output-regulation'?(w.anchorBindings??[]).map(b=>b.anchorId):[w.roles.target];
   if(resourceIds.some(id=>!actors.has(id)))return empty('invalid-evidence');
   add('resource-root-and-supply-context',SOURCES.resource,{alternatives:resourceIds.map(id=>({id,profile:actors.get(id)})),excessConfirmed:null});
   if(r.id!=='resource-output-regulation')add('wealth-resource-relative-evidence',SOURCES.resource,comparison(w.roles.helper??w.roles.obstacle,w.roles.target,'control'));
   interpretations.push({id:'resource-excess-regulation',evidence:dayCapacity==='strong-hypothesis'?'day-capacity-premise-aligned':'unresolved',excessConfirmed:null,deficiencyConfirmed:null});
  }
  if(r.kind==='rescue'){
   const t=entries.find(x=>x.r.id===r.threatRuleId&&x.w.id===w.threatWitnessId&&x.r.kind==='damage');
   if(!t)return empty('invalid-evidence');
   const inherited=new Set(t.w.edges.map(edgeKey));
   for(const e of w.edges.filter(e=>!inherited.has(edgeKey(e)))){
    if(e.kind==='control')contacts.push({kind:'directed-control',comparison:comparison(e.from,e.to,e.kind),effectConfirmed:null});
    if(e.kind==='combine'){
     const pair=pairs.get(pairKey(e.from,e.to));if(!pair)return empty('invalid-evidence');
     contacts.push({kind:'combination',pairId:pair.id,from:e.from,to:e.to,contactHypothesis:pair.contactHypothesis,
      removalHypothesis:pair.removalHypothesis,dayReferenceInvolved:pair.dayReferenceInvolved,competingPartnerIds:sorted(pair.competing.map(c=>c.partnerId)),
      originalRootIds:[...pair.transformation.originalRootIds],removalConfirmed:null,transformationConfirmed:null,effectConfirmed:null});
    }
   }
  }
  if(conditions.length||contacts.length)routes.push({ruleId:r.id,witnessId:w.id,kind:r.kind,conditions,interpretations,interventions:contacts,netEffectConfirmed:null,effective:null});
 }
 const dualRoles=(compound.motifs??[]).filter(m=>m.id==='killing-wealth-rescue-with-killing-supply').flatMap(m=>m.witnesses.map(w=>{
  const {outputControlsKilling:c,wealthGeneratesKilling:g}=w.paths;
  return {rescue:w.left,supply:w.right,boundThreat:w.boundThreat,outputVsKilling:comparison(c.from,c.to,'control'),
   wealthSupply:comparison(g.from,g.to,'generate'),dayCapacity,killingDeficiencyConfirmed:null,netEffectConfirmed:null};
 }));
 return {...base,status:complete?'diagnostic':'partial',routes,dualRoles,limitations:['relative-evidence-not-excess-or-deficiency','source-premises-not-final-natal-or-transit-rules','control-not-removal','no-automatic-rescue']};
}
