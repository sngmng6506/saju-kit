// Bounded, conditional route composition. This is a feasibility search
// over observed witnesses, not simulation of actual force or cancellation.
const key=r=>JSON.stringify([r.ruleId,r.witnessId]);
const ref=(r,w)=>({ruleId:r.id,witnessId:w.id});
const states=new Set(['supported','opposed','conflicting','unresolved']);
const ordinary=r=>r.kind==='support'&&r.impact!=='conditional-regulation-not-confirmed-support';
const sortRefs=xs=>[...xs].sort((a,b)=>key(a).localeCompare(key(b)));
const limit=2048;
// Single partner is an explicit hypothetical allocation constraint, not a
// claim that every classical combination is exclusive. Only mandatory
// combination edges participate; alternative anchor edges remain unresolved.
function partners(w){
 return w.edges.filter(e=>e.kind==='combine').map(e=>[e.from,e.to]);
}
function addPartners(existing,pairs){
 const next=new Map(existing);
 for(const [a,b] of pairs){
  if(next.has(a)&&next.get(a)!==b||next.has(b)&&next.get(b)!==a)return null;
  next.set(a,b);next.set(b,a);
 }
 return next;
}

// Canonical identity for undirected combination, directional identity for
// control/generation. Inherited threat edges are never new interventions.
const edgeKey=e=>JSON.stringify(e.kind==='combine'?[e.kind,...[e.from,e.to].sort()]:[e.kind,e.from,e.to]);
const edgeRef=e=>({from:e.from,to:e.to,kind:e.kind});
const unique=xs=>[...new Set(xs)].sort();
function mandatoryFlow(selected,entries){
 const routes=selected.map(x=>{
  const {r,w}=entries.get(key(x));
  const bound=r.kind==='rescue'?entries.get(key({ruleId:r.threatRuleId,witnessId:w.threatWitnessId})):null;
  const inherited=new Set((bound?.w.edges??[]).map(edgeKey));
  const own=w.edges.filter(e=>!inherited.has(edgeKey(e)));
  const participants=unique([...Object.values(w.roles??{}),...w.edges.flatMap(e=>[e.from,e.to])]);
  const anchorOptions=(w.anchorBindings??[]).map(b=>({anchorId:b.anchorId,targetId:b.targetId??null,basis:b.basis??null,
   edge:b.edge?edgeRef(b.edge):null,selected:null}));
  return {ref:{ruleId:r.id,witnessId:w.id},kind:r.kind,participants,
   helperId:w.roles?.helper??null,boundThreat:bound?.ref??null,
   mandatoryEdges:own.map(edgeRef),inheritedEdges:(bound?.w.edges??[]).map(edgeRef),anchorOptions,
   netEffectConfirmed:null};
 });
 const contacts=[],shared=[],inventory=new Map();
 for(const route of routes)for(const e of route.mandatoryEdges){
  const k=edgeKey(e);
  if(!inventory.has(k))inventory.set(k,{edge:e,routeRefs:[]});
  const row=inventory.get(k);
  if(!row.routeRefs.some(r=>key(r)===key(route.ref)))row.routeRefs.push(route.ref);
 }
 for(const a of routes)for(const b of routes){
  if(a===b)continue;
  // Only an intervention introduced by A may be a new contact on B.
  for(const e of a.mandatoryEdges.filter(e=>['control','combine'].includes(e.kind))){
   const targets=(e.kind==='control'?[e.to]:[e.from,e.to]).filter(id=>id!=='visible:day'&&b.participants.includes(id));
   if(!targets.length)continue;
   contacts.push({fromRoute:a.ref,toRoute:b.ref,edge:e,affectedIds:unique(targets),
    affectedHelper:b.helperId!==null&&targets.includes(b.helperId),
    kind:a.kind==='rescue'&&b.kind==='rescue'?'rescue-to-rescue-contact':'cross-route-contact',effectConfirmed:null});
  }
 }
 for(const row of inventory.values())if(row.routeRefs.length>1)shared.push({...row,independentSupplyConfirmed:null});
 const pendingAlternatives=routes.filter(r=>r.anchorOptions.length).map(r=>r.ref);
 return {routes,contacts,sharedRelations:shared,uniqueMandatoryRelations:[...inventory.values()],
  pendingAlternatives,
  status:contacts.length?'cross-route-review':pendingAlternatives.length?'anchor-alternative-review':shared.length?'shared-relation-review':'no-mandatory-cross-contact-observed',
  netEffectConfirmed:null,allThreatsResolved:null,selectionAuthority:false,
  limitations:['mandatory-new-edges-only','anchor-options-not-allocated','no-force-addition-or-cancellation','contact-not-injury']};
}
export function observeJointOutcome(review,mechanism,compound,complete){
 const base={candidateId:review.candidateId,completeHour:complete,selectionAuthority:false,formed:null,broken:null,rescued:null};
 const empty=status=>({...base,status,supports:[],threats:[],search:null,regulation:[],exceptions:[]});
 if(review.status==='out-of-scope')return empty('out-of-scope');
 if(!mechanism||!compound||mechanism.candidateId!==review.candidateId||compound.candidateId!==review.candidateId||
  mechanism.status==='invalid-evidence'||compound.status==='invalid-evidence'||compound.violations.length)return empty('invalid-evidence');
 const entries=new Map();
 for(const r of review.rules)for(const w of r.witnesses){
  const k=key(ref(r,w));if(entries.has(k))return empty('invalid-evidence');
  entries.set(k,{r,w,ref:ref(r,w)});
 }
 const status=new Map();
 for(const row of mechanism.routes){
  const k=key(row);
  if(!entries.has(k)||status.has(k)||!states.has(row.status)||row.effective!==null||row.kind!==entries.get(k).r.kind)return empty('invalid-evidence');
  status.set(k,row.status);
 }
 if(status.size!==entries.size)return empty('invalid-evidence');
 const project=r=>({...r,hypothesis:status.get(key(r)),effective:null});
 const all=[...entries.values()];
 const supports=all.filter(x=>ordinary(x.r)).map(x=>project(x.ref));
 const regulation=all.filter(x=>x.r.kind==='support'&&!ordinary(x.r)).map(x=>project(x.ref));
 const exceptions=all.filter(x=>x.r.kind==='exception').map(x=>project(x.ref));
 const seen=new Set(),rescueSeen=new Set(),threats=[];
 for(const t of compound.threatCoverage){
  const k=key(t.threat),d=entries.get(k);
  if(!d||d.r.kind!=='damage'||seen.has(k))return empty('invalid-evidence');
  seen.add(k);
  const alternatives=[];
  for(const a of t.alternatives){
   const r=entries.get(key(a));
   if(!r||r.r.kind!=='rescue'||r.r.threatRuleId!==d.r.id||r.w.threatWitnessId!==d.w.id||rescueSeen.has(key(a)))return empty('invalid-evidence');
   rescueSeen.add(key(a));alternatives.push(project(a));
  }
  const supported=alternatives.filter(a=>a.hypothesis==='supported');
  const reviewState=!alternatives.length?(complete?'no-observed-rescue':'unknown-rescue-coverage'):supported.length?'supported-rescue-hypothesis-observed':alternatives.every(a=>a.hypothesis==='opposed')?'all-observed-rescue-hypotheses-opposed':'rescue-hypotheses-unresolved';
  threats.push({threat:project(t.threat),alternatives,reviewState,coverage:t.coverage,resolutionConfirmed:null,
   // Opposed is not ineffective; no threat is silently discarded.
   residualThreatConfirmed:null});
 }
 if(seen.size!==all.filter(x=>x.r.kind==='damage').length||rescueSeen.size!==all.filter(x=>x.r.kind==='rescue').length)return empty('invalid-evidence');
 function search(supportedOnly){
  const qualify=x=>!supportedOnly||x.hypothesis==='supported';
  const choices=[sortRefs(supports.filter(qualify)),...threats.map(t=>sortRefs(t.alternatives.filter(qualify)))];
  if(choices.some(c=>!c.length))return {status:'missing-route-choice',examined:0,plan:null,limit};
  let examined=0,truncated=false;
  const dfs=(i,allocation,selected)=>{
   if(i===choices.length)return selected;
   for(const x of choices[i]){
    if(examined>=limit){truncated=true;return null;}
    examined++;
    const next=addPartners(allocation,partners(entries.get(key(x)).w));
    if(!next)continue;
    const found=dfs(i+1,next,[...selected,x]);
    if(found)return found;
    if(truncated)return null;
   }
   return null;
  };
  const selected=dfs(0,new Map(),[]);
  if(!selected)return {status:truncated?'search-budget-exhausted':'no-single-partner-plan',examined,plan:null,limit};
  const chosen=new Set(selected.map(key));
  const support=selected[0],rescues=selected.slice(1);
  const interference=compound.rescueInteractions.filter(x=>chosen.has(key(x.rescue))&&key(x.support)===key(support));
  const flow=mandatoryFlow(selected,entries);
  const collateral=compound.rescueCollateral.filter(x=>chosen.has(key(x.rescue)));
  const shared=compound.rescueAlternatives.filter(x=>chosen.has(key(x.rescue))&&x.sharedParticipantAlternatives.some(a=>chosen.has(key(a))));
  return {status:'conditional-plan-found',examined,limit,plan:{support,rescues,
   interference,collateral,sharedParticipantRoutes:shared,flow,allocationConfirmed:null,allThreatsResolved:null}};
 }
 return {...base,status:complete?'diagnostic':'partial',supports,threats,regulation,exceptions,
  search:{assumption:'one-ordinary-support-and-one-rescue-per-observed-threat-single-partner-combination',observed:search(false),supportedOnly:search(true)},
  limitations:['no-threat-cancellation','no-sufficiency-of-single-support','no-independent-supply-assumption','no-effective-judgment','search-not-exhaustive-on-budget']};
}
