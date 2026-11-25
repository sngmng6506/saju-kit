// Counterfactual evidence masking: not a new natal chart or a force model.
// A witness needs every explicit role/edge endpoint; anchorBindings are
// alternatives, not independent necessary actors.
const SOURCE='https://www.diancangwang.cn/xuanxuewushu/03cf53eede8a/751ad9247246.html';
const key=(r,w)=>JSON.stringify([r,w]);
const ref=x=>({ruleId:x.rule.id,witnessId:x.witness.id});
const unique=xs=>[...new Set(xs)].sort();
const intersects=(xs,removed)=>xs.some(x=>removed.has(x));
const supportKind=r=>r.kind==='support'&&r.impact!=='conditional-regulation-not-confirmed-support';
const regulationKind=r=>r.kind==='support'&&r.impact==='conditional-regulation-not-confirmed-support';
const endpoints=es=>es.flatMap(e=>[e.from,e.to]);
function required(w){
 return unique([...Object.values(w.roles),...endpoints(w.edges)]);
}
function survives(x,removed){
 const w=x.witness;
 if(intersects(required(w),removed))return false;
 const bs=w.anchorBindings??[];
 return !bs.length||bs.some(b=>!intersects([b.anchorId,b.targetId,...(b.edge?endpoints([b.edge]):[])].filter(Boolean),removed));
}
function candidateRoles(x){
 const w=x.witness,r=x.rule;
 if(r.kind==='rescue')return [['helper',w.roles.helper]].filter(([,id])=>id);
 if(r.kind!=='support')return [];
 // Wealth in peer-output-wealth is a necessary product/participant, not
 // automatically the same kind of assistant as its output helper.
 return ['helper','controller','wealth'].filter(role=>w.roles[role]).map(role=>[role,w.roles[role]]);
}
function groupSupport(rows){
 const map=new Map();
 for(const x of rows){
  // Alternatives only within the same rule and protected target. A distinct
  // route or anchor is never declared interchangeable.
  const target=x.witness.roles.target??null;
  const k=JSON.stringify([x.rule.id,target]);
  if(!map.has(k))map.set(k,{id:k,ruleId:x.rule.id,target,witnesses:[]});
  map.get(k).witnesses.push(x);
 }
 return [...map.values()];
}
export function observeAssistantNecessity(review,compound,completeHour){
 const meta={candidateId:review.candidateId,source:SOURCE,scope:'observed-witness-mask-only',completeHour,
  assistantGod:null,selectionAuthority:false,confirmed:false};
 if(review.status==='out-of-scope')return {...meta,status:'out-of-scope',candidates:[],pairDependencies:[]};
 if(!compound||compound.candidateId!==review.candidateId||compound.violations.length)
  return {...meta,status:'invalid-evidence',candidates:[],pairDependencies:[]};
 const all=review.rules.flatMap(rule=>rule.witnesses.map(witness=>({rule,witness})));
 const lookup=new Map(all.map(x=>[key(x.rule.id,x.witness.id),x]));
 const get=r=>lookup.get(key(r.ruleId,r.witnessId));
 const threatRows=compound.threatCoverage.map(t=>({threat:get(t.threat),alternatives:t.alternatives.map(get)}));
 if(threatRows.some(t=>!t.threat||t.alternatives.some(x=>!x)))return {...meta,status:'invalid-evidence',candidates:[],pairDependencies:[]};
 const rescue=threatRows.flatMap(t=>t.alternatives),support=all.filter(x=>supportKind(x.rule)),regulation=all.filter(x=>regulationKind(x.rule));
 const groups=groupSupport(support);
 const eligible=[...support,...rescue,...regulation];
 const roleMap=new Map();
 for(const x of eligible)for(const [role,id] of candidateRoles(x)){
  if(id==='visible:day')continue;
  if(!roleMap.has(id))roleMap.set(id,[]);
  roleMap.get(id).push({role,kind:regulationKind(x.rule)?'regulation':x.rule.kind,...ref(x)});
 }
 const mask=removed=>{
  const supportGroups=groups.map(g=>{
   const remaining=g.witnesses.filter(x=>survives(x,removed));
   return {id:g.id,ruleId:g.ruleId,target:g.target,lost:g.witnesses.filter(x=>!remaining.includes(x)).map(ref),remaining:remaining.map(ref),
    // If the target itself is masked this is not loss of an assistant.
    state:removed.has(g.target)?'target-masked':!remaining.length?'all-observed-alternatives-lost':remaining.length<g.witnesses.length?'some-alternatives-lost':'unchanged'};
  });
  const threats=threatRows.map(t=>{
   const remaining=t.alternatives.filter(x=>survives(x,removed));
   return {threat:ref(t.threat),lost:t.alternatives.filter(x=>!remaining.includes(x)).map(ref),remaining:remaining.map(ref),
    state:!survives(t.threat,removed)?'threat-masked':!t.alternatives.length?'no-observed-route-before-mask':!remaining.length?'all-observed-alternatives-lost':remaining.length<t.alternatives.length?'some-alternatives-lost':'unchanged'};
  });
  return {supportGroups,threats,regulationLost:regulation.filter(x=>!survives(x,removed)).map(ref),
   damageMasked:threatRows.filter(t=>!survives(t.threat,removed)).map(t=>ref(t.threat))};
 };
 const allLost=m=>[...m.supportGroups.filter(g=>g.state==='all-observed-alternatives-lost').map(g=>'support:'+g.id),
  ...m.threats.filter(t=>t.state==='all-observed-alternatives-lost').map(t=>'threat:'+key(t.threat.ruleId,t.threat.witnessId))];
 const candidates=[...roleMap].sort(([a],[b])=>a.localeCompare(b)).map(([id,roles])=>{
  const effect=mask(new Set([id])),anchorAlias=review.anchorIds.includes(id);
  const touched=compound.supportDamage.filter(x=>x.interventionContacts.some(e=>e.affectedParticipantIds.includes(id))).map(x=>({support:x.support,damage:x.damage}));
  const collateral=compound.rescueCollateral.filter(e=>e.to===id).map(e=>({rescue:e.rescue,threat:e.threat}));
  const rescueInterference=compound.rescueInteractions.filter(x=>x.interventionContacts.some(e=>e.affectedParticipantIds.includes(id))).map(x=>({rescue:x.rescue,support:x.support}));
  const lost=allLost(effect);
  return {occurrenceId:id,roles,anchorAlias,mask:effect,observedRouteDependencyKeys:lost,
   classification:anchorAlias?'anchor-and-assistant-role-alias':lost.length?'observed-route-dependent':roles.every(r=>r.kind==='regulation')?'conditional-regulation-only':'alternative-or-participant',
   potentialInjury:{supportDamage:touched,rescueCollateral:collateral,rescueInterference,confirmed:null},
   necessityConfirmed:null,assistantConfirmed:null};
 });
 const pairDependencies=[];
 for(let i=0;i<candidates.length;i++)for(let j=i+1;j<candidates.length;j++){
  const a=candidates[i],b=candidates[j];
  if(a.anchorAlias||b.anchorAlias)continue;
  const lost=allLost(mask(new Set([a.occurrenceId,b.occurrenceId]))).filter(k=>!a.observedRouteDependencyKeys.includes(k)&&!b.observedRouteDependencyKeys.includes(k));
  if(lost.length)pairDependencies.push({occurrenceIds:[a.occurrenceId,b.occurrenceId],jointOnlyDependencyKeys:lost,necessityConfirmed:null});
 }
 return {...meta,status:completeHour?'diagnostic':'partial',candidates,pairDependencies,
  // These are explicitly outside this evidence-mask policy.
  limitations:['no-new-chart','no-force-recomputation','no-global-necessity-inference','branch-assembly-assistant-not-covered','source-specific-combination-gaps-remain'],
  necessityConfirmed:null};
}
