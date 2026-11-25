import {compareForceProfiles} from '../../core/relative-force.js';
const key=e=>JSON.stringify([e.from,e.to,e.kind]);
const ref=(r,w)=>({ruleId:r.id,witnessId:w.id});
const unique=xs=>[...new Set(xs)].sort();
const slot=o=>o.position+':'+o.layer;
const source='https://luckclub.cn/bazi/002/041/';
const resourceSource='https://luckclub.cn/bazi/002/037/';
// Do not count roots or axes. All comparisons concern individual literal
// occurrences; even visible-only unanimity is not total ten-god magnitude.
export function observeCapacityComparisons(prior,capacity){
 const complete=prior.completeHour,base={version:'role-comparison-context-v1',selectionAuthority:false,effectiveForce:null};
 if(capacity.status==='invalid-evidence')return {...base,status:'invalid-evidence',pairs:[]};
 const visible=capacity.occurrences.filter(o=>o.layer==='visible');
 const profiles=prior.relativeForce.profiles;
 const pairs=[];
 for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){
  const a=visible[i],b=visible[j],p=profiles[a.id],q=profiles[b.id];
  if(!p||!q||p.occurrenceId!==a.id||q.occurrenceId!==b.id||
   Object.keys(p.axes).length!==Object.keys(q.axes).length||Object.keys(p.axes).some(k=>!Object.hasOwn(q.axes,k)||
    ![true,false,null].includes(p.axes[k])||![true,false,null].includes(q.axes[k])))
   return {...base,status:'invalid-evidence',pairs:[]};
  const comparison=compareForceProfiles(p,q,{completeHour:complete,comparable:slot(a)!==slot(b)});
  const shared=unique([...comparison.sharedRootPositions.map(p=>'branch:'+p),...comparison.sharedGenerationNodes,...comparison.sharedPeerNodes]);
  const cautions=unique([...(p.contacts.length||q.contacts.length)?['combination-or-group-contact']:[],
   ...(p.rootClashExposed.length||q.rootClashExposed.length)?['root-clash-exposure']:[],
   ...(p.localControlNodes.length||q.localControlNodes.length)?['rooted-control-pressure']:[],
   ...shared.length?['shared-supply-not-independent']:[]]);
  pairs.push({left:a.id,right:b.id,leftTenGod:a.tenGod,rightTenGod:b.tenGod,comparison,cautions,
   interpretation:!complete?'partial':cautions.length?'context-review':'relative-profile-only',
   excessConfirmed:null,deficiencyConfirmed:null,effectiveForce:null});
 }
 return {...base,status:complete?'diagnostic':'partial',pairs,limitations:['visible-occurrence-comparison-only','no-total-role-magnitude','no-summed-supply']};
}
// Keep each witness and each alternative separate. Rescue context can
// include its own exact bound damage, but inherited pressure is not a
// new intervention. Generation is both source outflow and recipient supply.
export function observeRouteFlow(review,prior,access,mechanism,strength){
 const base={candidateId:review.candidateId,selectionAuthority:false,netEffectConfirmed:null};
 const empty=status=>({...base,status,routes:[],mediationContexts:[]});
 if(review.status==='out-of-scope')return empty('out-of-scope');
 if(mechanism.status==='invalid-evidence')return empty('invalid-evidence');
 const complete=prior.completeHour,actors=new Map(prior.stemForce.occurrences.map(o=>[o.id,o]));
 for(const g of access.groups)actors.set(g.id,{id:g.id,layer:'group',element:g.element});
 const entries=new Map(),assessed=new Map(mechanism.edges.map(e=>[key(e),e]));
 for(const r of review.rules)for(const w of r.witnesses){
  const k=JSON.stringify([r.id,w.id]);if(entries.has(k))return empty('invalid-evidence');entries.set(k,{r,w});
 }
 const routes=[];
 const day=actors.get('visible:day');
 const dayCapacity=!complete?'unresolved':strength?.direction??'unresolved';
 function project(edges){
  const nodes=new Map();
  for(const {edge:e,origin} of edges){
   if(!actors.has(e.from)||!actors.has(e.to))return null;
   for(const id of [e.from,e.to])if(!nodes.has(id))nodes.set(id,{occurrenceId:id,layer:actors.get(id).layer,tenGod:actors.get(id).tenGod??null,receives:[],outflows:[],controls:[],controlledBy:[],combinations:[]});
   const a=nodes.get(e.from),b=nodes.get(e.to),edge={from:e.from,to:e.to,kind:e.kind,origin,mechanismHypothesis:assessed.get(key(e))?.status??null,effective:null};
   if(e.kind==='generate'){a.outflows.push(edge);b.receives.push(edge);}
   else if(e.kind==='control'){a.controls.push(edge);b.controlledBy.push(edge);}
   else if(e.kind==='combine'){a.combinations.push(edge);b.combinations.push(edge);}
   else return null;
  }
  return [...nodes.values()].map(n=>({...n,contexts:[
   ...n.receives.length&&n.outflows.length?['generation-throughput']:[],
   ...n.receives.length&&n.controlledBy.length?['supply-and-pressure']:[],
   ...n.outflows.length&&n.controlledBy.length?['drain-and-pressure']:[],
   ...n.controls.length&&n.controlledBy.length?['control-and-counterpressure']:[],
   ...n.controls.length&&n.outflows.length?['control-and-outflow']:[],
   ...n.combinations.length?['combination-contact-review']:[]],netEffectConfirmed:null}));
 }
 for(const {r,w} of entries.values()){
  const threat=r.kind==='rescue'?entries.get(JSON.stringify([r.threatRuleId,w.threatWitnessId])):null;
  if(r.kind==='rescue'&&threat?.r.kind!=='damage')return empty('invalid-evidence');
  const inherited=new Set((threat?.w.edges??[]).map(key));
  const mandatory=[...new Map([...(threat?.w.edges??[]),...w.edges].map(e=>[key(e),e])).values()].map(edge=>({edge,origin:inherited.has(key(edge))?'bound-threat':'witness'}));
  const nodes=project(mandatory);if(!nodes)return empty('invalid-evidence');
  const alternatives=[];
  for(const b of w.anchorBindings??[]){
   const edges=b.edge&&!mandatory.some(x=>key(x.edge)===key(b.edge))?[...mandatory,{edge:b.edge,origin:'anchor-alternative'}]:mandatory;
   const variant=project(edges);if(!variant)return empty('invalid-evidence');
   alternatives.push({anchorId:b.anchorId,targetId:b.targetId??null,basis:b.basis??null,nodes:variant,netEffectConfirmed:null});
  }
  routes.push({...ref(r,w),kind:r.kind,boundThreat:threat?ref(threat.r,threat.w):null,nodes,anchorAlternatives:alternatives,netEffectConfirmed:null});
 }
 // Classical alternative: killing -> resource -> day, alongside killing
 // pressure. Context only; no new support witness or assumed hidden access.
 const raw=new Map(prior.relativeForce.edges.map(e=>[key(e),e]));
 const read=(from,to,kind)=>raw.get(key({from,to,kind}));
 const mediationContexts=[];
 if(review.family==='killing'&&day)for(const id of review.anchorIds){
  const k=actors.get(id);
  if(!k||k.tenGod!=='편관')continue;
  for(const i of actors.values()){
   if(i.layer!=='visible'||!['정인','편인'].includes(i.tenGod)||new Set([slot(k),slot(i),slot(day)]).size!==3)continue;
   const edges=[read(k.id,i.id,'generate'),read(i.id,day.id,'generate'),read(k.id,day.id,'control')];
   if(edges.some(e=>!e))continue;
   mediationContexts.push({id:JSON.stringify([k.id,i.id,day.id]),source,killingId:k.id,resourceId:i.id,dayId:day.id,
    edges:edges.map(e=>({from:e.from,to:e.to,kind:e.kind,edgeId:e.id,blockers:[...e.blockers],effective:null})),
    dayCapacity,interpretation:'killing-resource-day-mediation-review',pressureResolved:null,mediationConfirmed:null});
  }
 }
 const resourceContexts=review.family==='resource'?routes.filter(r=>['resource-wealth','resource-wealth-regulation','resource-output-regulation','resource-killing'].includes(r.ruleId)).map(r=>({
  ruleId:r.ruleId,witnessId:r.witnessId,source:resourceSource,dayCapacity,
  interpretations:r.ruleId==='resource-killing'?['resource-deficiency-supply-review']:r.ruleId==='resource-output-regulation'?['day-output-drain-review']:['resource-excess-regulation-review','required-resource-injury-review'],
  resourceExcessConfirmed:null,resourceDeficiencyConfirmed:null,netEffectConfirmed:null})): [];
 return {...base,status:complete?'diagnostic':'partial',routes,mediationContexts,resourceContexts,
  limitations:['no-net-force-arithmetic','no-cross-witness-splicing','no-hidden-access-inference','no-new-support-witness','source-conditions-not-certified']};
}
