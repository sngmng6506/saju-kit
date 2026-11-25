// E1 discrepancy diagnosis. A profile comparison is a partial order of
// evidence, never a physical strength measurement. Preserve legacy states.
const pair=(p,a,b)=>p.left===a&&p.right===b||p.left===b&&p.right===a;
const orient=(r,reverse)=>!reverse?r:r==='left-evidence-dominates'?'right-evidence-dominates':r==='right-evidence-dominates'?'left-evidence-dominates':r;
const compare=(p,reverse)=>p?{relation:orient(p.relation,reverse),sourceOnly:[...(reverse?p.rightOnly:p.leftOnly)??[]],
 targetOnly:[...(reverse?p.leftOnly:p.rightOnly)??[]],unknown:[...(p.unknown??[])]}:null;
const unique=xs=>[...new Set(xs)].sort();
const conditions=xs=>(xs??[]).map(c=>({id:c.id,state:c.state,evidence:c.evidence??null}));
const flags=xs=>xs.filter(c=>c.state!=='supported').map(c=>c.id+':'+c.state);
const endpoint=(root,capacity,id)=>{
 const r=root?.occurrences?.find(x=>x.id===id),a=capacity?.occurrences?.find(x=>x.id===id);
 return {id,layer:a?.layer??r?.layer??null,tenGod:a?.tenGod??null,rootState:r?.rootAxes?.anySubstantial??null,
  roots:r?.roots??[],contestedRootIds:r?.contestedRootIds??[],contexts:r?.contexts??[],localSupply:r?.localSupply??null};
};
export function diagnoseDirectedPremise(p,context,partial=false){
 const e=p.evidence;
 if(!e||typeof e.from!=='string'||typeof e.to!=='string'||!['generate','control','combine'].includes(e.kind))return null;
 const {from,to,kind}=e;
 const root=context?.rootContext,capacity=context?.roleCapacity,command=context?.monthCommandReview;
 const ps=(root?.comparisons??[]).filter(x=>pair(x,from,to));
 const r=ps.length===1?ps[0]:null,reverse=r?.left!==from;
 const original=compare(r?.original,reverse),sensitivity=compare(r?.sensitivity,reverse),
  nonseason=compare(r?.nonseason,reverse),seasonOnly=compare(r?.seasonOnly,reverse);
 const a=endpoint(root,capacity,from),b=endpoint(root,capacity,to);
 const cs=conditions(e.conditions),find=id=>cs.find(c=>c.id===id),reasons=[];
 if(partial)reasons.push('partial-chart');
 if(!cs.length)reasons.push('edge-conditions-not-projected');
 if(find('visible-participant-access')?.state==='unresolved')reasons.push('participant-access-unresolved');
 if(a.contestedRootIds.length||b.contestedRootIds.length)reasons.push('contested-root-context');
 if(find('source-root-capacity')?.state==='unresolved'){
  reasons.push('source-direct-root-not-established');
  if(find('source-root-capacity').evidence?.indirectSupply===true)reasons.push('source-indirect-supply-observed-not-certified');
 }
 if(find('target-receptive-root-context')?.state==='unresolved')reasons.push('target-receptive-root-not-established');
 if(find('source-pressure')?.state==='unresolved')reasons.push('source-pressure-unresolved');
 if(find('remaining-context')?.state==='unresolved')reasons.push('remaining-context-unresolved');
 if(kind==='control'){
  if(original?.relation==='mixed-evidence'){
   if(sensitivity?.relation==='unresolved')reasons.push('mixed-profile-with-contextual-root-uncertainty');
   else if(nonseason?.relation&&seasonOnly?.relation&&nonseason.relation!==seasonOnly.relation)reasons.push('season-versus-nonseason-profile-disagreement');
   else reasons.push('mixed-profile-axes');
  }
  if(original?.relation==='right-evidence-dominates')reasons.push(sensitivity?.relation===original.relation?'target-profile-dominance-preserved':'target-profile-dominance-context-sensitive');
  if(find('directional-control-evidence')?.state==='unresolved')reasons.push('directional-control-not-established');
 }
 if(find('relative-generation-context')?.state==='unresolved')reasons.push('generation-comparison-context-unresolved');
 if(command?.status==='unresolved')reasons.push('command-not-assessed');
 const cc=(command?.comparisonCoverage??[]).filter(x=>pair(x,from,to)),cmd=cc.length===1?cc[0]:null;
 return {from,to,kind,edgeId:e.edgeId??null,premiseState:p.state,conditionStates:cs,conditionBlockers:flags(cs),reasons:unique(reasons),
  source:a,target:b,comparison:{original,sensitivity,nonseason,seasonOnly,coverage:ps.length===1?'exact-pair':ps.length?'duplicate-pair':'not-projected'},
  command:{status:command?.status??null,reason:command?.reason??null,pairStatus:cmd?.status??null,hypotheses:(cmd?.hypotheses??[]).map(h=>({id:h.id,relation:orient(h.relation,cmd.left!==from)}))},
  effectConfirmed:null};
}
export function diagnoseSourcePremise(p,context,partial=false){
 const edge=diagnoseDirectedPremise(p,context,partial);
 if(edge)return {...p,evidence:p.evidence??null,diagnostic:{kind:'directed-edge',reasons:edge.reasons,edge}};
 let kind='other-premise',reasons=[];
 if(p.id==='day-capacity-hypothesis'||p.id==='day-capacity-for-control'||p.id==='weak-day-mediation-motive'){
  kind='day-capacity';if(p.state==='unresolved')reasons.push(partial?'partial-chart':'day-direction-or-polarity-unresolved');
  if(p.state==='opposed')reasons.push('day-hypothesis-opposed');
 }else if(p.id.includes('relative-dominance')||p.id.includes('relative-contrast')){
  kind='comparison';reasons=p.evidence?.readiness?.reasons??[];
 }else if(p.id==='witness-mechanism-context'){
  kind='route-context';reasons=flags(conditions(p.evidence?.conditions));
 }else if(p.id.includes('root-access')||p.id.includes('root-observation')){
  kind='root-observation';if(p.state==='unresolved')reasons.push('root-access-not-established');
 }else if(p.state==='unresolved'){
  kind='classical-condition';reasons.push('role-demand-or-context-not-established');
 }
 return {id:p.id,state:p.state,evidence:p.evidence??null,diagnostic:{kind,reasons:unique(reasons)}};
}
// Use source packet's explicit endpoints, not a coincidental loss of a
// policy row, to attribute hour dependence. Other lost paths need tracing.
export function summarizeRoleTriage(packet,rows){
 const issues=[],reasonCounts={},gapRows=[],scopeRows=[];
 for(const c of packet.cases){
  const full=rows.find(r=>r.id===c.id&&r.partial===false),partial=rows.find(r=>r.id===c.id&&r.partial===true);
  if(!full||!partial)continue;
  if(c.scope!=='ordinary-review')scopeRows.push({id:c.id,scope:c.scope,directionStatus:full.directionStatus,probed:c.probes.length>0});
  for(const p of full.probes??[]){
   const fixture=c.probes.find(x=>x.id===p.id),q=partial.probes?.find(x=>x.id===p.id);
   if(!fixture)continue;
   for(const w of p.rows??[])for(const premise of w.premises??[]){
    if(premise.state==='supported')continue;
    const reasons=premise.diagnostic?.reasons??[];
    for(const reason of reasons)reasonCounts[reason]=(reasonCounts[reason]??0)+1;
    if(['conflicting','opposed'].includes(premise.state))issues.push({caseId:c.id,probeId:p.id,scope:c.scope,candidateId:w.candidateId,
     route:w.route??null,premiseId:premise.id,state:premise.state,diagnostic:premise.diagnostic??null,effectConfirmed:null});
   }
   if(p.coverage==='observed'&&q&&q.coverage!=='observed'){
    const explicitHourIds=unique(Object.values(fixture.match).filter(v=>typeof v==='string'&&/^(visible|hidden):hour(?::|$)/.test(v)));
    gapRows.push({caseId:c.id,probeId:p.id,partialCoverage:q.coverage,explicitHourIds,
     classification:explicitHourIds.length?'explicit-hour-endpoint-removed':'indirect-dependency-review',causalLossConfirmed:null});
   }
  }
 }
 return {version:'role-source-triage-v1',issues,reasonCounts,gapRows,scopeRows,effectConfirmed:null,
  limitations:['reason-counts-are-repeated-premise-observations','no-profile-axis-voting','no-physical-causality-or-effect','explicit-hour-endpoint-not-proof-of-all-dependencies']};
}
