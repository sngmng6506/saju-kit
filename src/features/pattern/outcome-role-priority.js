import {stemInfo} from '../../core/elements.js';
const ref=(r,w)=>({ruleId:r.id,witnessId:w.id});
const key=(r,w)=>JSON.stringify([r,w]);
const sorted=xs=>[...new Set(xs)].sort();
// An ordered review is not a preference for an effective useful element.
// Directional evidence is never promoted to role excess or deficiency.
export function readCapacityComparison(context,left,right){
 const rows=context.pairs.filter(p=>p.left===left&&p.right===right||p.left===right&&p.right===left);
 if(rows.length!==1)return {relation:null,status:rows.length?'invalid-evidence':'not-comparable',cautions:[],effectiveForce:null};
 const p=rows[0],r=p.comparison.relation,reverse=p.left!==left;
 const relation=reverse&&r==='left-evidence-dominates'?'right-evidence-dominates':reverse&&r==='right-evidence-dominates'?'left-evidence-dominates':r;
 return {relation,status:['left-evidence-dominates','right-evidence-dominates'].includes(relation)?p.cautions.length?'context-review':'directional-profile-only':'unresolved',
  cautions:[...p.cautions],effectiveForce:null};
}
// A directional comparison is eligible for an excess *review* only when
// the same exact pair survives the contextual root and applicable commander
// comparisons. This is a conservative gate, never a measure of excess.
export function assessRoleComparisonReadiness(comparison,left,right,rootContext,commandReview){
 const base={relation:comparison.relation,rootRelation:null,commandRelations:[],effectiveForce:null,excessConfirmed:null,deficiencyConfirmed:null};
 const result=(status,reasons,extra={})=>({...base,...extra,status,reasons});
 if(comparison.status==='invalid-evidence'||rootContext?.status==='invalid-evidence'||commandReview?.status==='invalid-evidence')return result('invalid-evidence',['upstream-invalid']);
 if(!['left-evidence-dominates','right-evidence-dominates'].includes(comparison.relation))return result('unresolved',['no-directional-profile']);
 const find=rows=>rows.filter(p=>p.left===left&&p.right===right||p.left===right&&p.right===left);
 const orient=(p,r)=>p.left===left?r:r==='left-evidence-dominates'?'right-evidence-dominates':r==='right-evidence-dominates'?'left-evidence-dominates':r;
 if(!rootContext)return result('unresolved',['root-context-not-assessed']);
 const roots=find(rootContext.comparisons);
 if(roots.length!==1)return result(roots.length?'invalid-evidence':'unresolved',['root-pair-coverage']);
 const rootRelation=orient(roots[0],roots[0].sensitivity.relation);
 const contextual={rootRelation};
 if(rootRelation!==comparison.relation)return result('unresolved',['root-context-direction-not-preserved'],contextual);
 const reasons=[];
 if(comparison.cautions.length)reasons.push(...comparison.cautions);
 if(!commandReview||commandReview.status==='unresolved')reasons.push('command-not-assessed');
 else{
  const rows=find(commandReview.comparisonCoverage);
  if(rows.length!==1)return result(rows.length?'invalid-evidence':'unresolved',['command-pair-coverage'],contextual);
  const c=rows[0];
  const ids=commandReview.variants?.map(v=>v.id);
  const hs=c.hypotheses;
  if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||!Array.isArray(hs)||
   hs.length!==ids.length||new Set(hs.map(h=>h.id)).size!==hs.length||hs.some(h=>!ids.includes(h.id))||
   c.expectedCount!==ids.length||c.availableCount!==hs.filter(h=>h.relation!==null).length)
   return result('invalid-evidence',['command-hypothesis-coverage'],contextual);
  const commandRelations=hs.map(h=>({id:h.id,relation:orient(c,h.relation)}));
  contextual.commandRelations=commandRelations;
  if(c.status!=='available-hypotheses-agree'||commandRelations.some(h=>h.relation!==comparison.relation))
   return result('unresolved',['command-context-direction-not-preserved',c.status],contextual);
 }
 return result(reasons.length?'context-review':'directional-review-eligible',reasons,contextual);
}
export function observeConditionalRolePriority(review,prior,capacity,comparisons,flow,strength,rootContext=null,commandReview=null){
 const base={candidateId:review.candidateId,selectionAuthority:false,preferredInterpretation:null,netEffectConfirmed:null};
 const empty=status=>({...base,status,contexts:[]});
 if(review.status==='out-of-scope')return empty('out-of-scope');
 if([capacity,comparisons,flow].some(x=>!x||x.status==='invalid-evidence')||rootContext?.status==='invalid-evidence'||commandReview?.status==='invalid-evidence')return empty('invalid-evidence');
 const complete=prior.completeHour,day=prior.stemForce.occurrences.find(o=>o.dayReference);
 if(!day)return empty('invalid-evidence');
 const direction=complete&&['strong','weak'].includes(strength?.direction)?strength.direction:null;
 const polarity=stemInfo(day.stem).yinYang;
 const actors=new Map(capacity.occurrences.map(o=>[o.id,o]));
 const entries=review.rules.flatMap(r=>r.witnesses.map(w=>({r,w})));
 const flows=new Map(flow.routes.map(w=>[key(w.ruleId,w.witnessId),w]));
 if(flows.size!==entries.length||flow.routes.length!==entries.length||entries.some(({r,w})=>!flows.has(key(r.id,w.id))))return empty('invalid-evidence');
 const contexts=[];
 const roots=new Map((rootContext?.occurrences??[]).map(o=>[o.id,o]));
 const rootReview=ids=>sorted(ids.flatMap(id=>(roots.get(id)?.contexts??[]).map(c=>id+':'+c)));
 const rootedContext=id=>rootContext?roots.get(id)?.rootAxes.anySubstantial===true:null;
 const add=(id,references,comparison,obligations,alternatives,reviewFirst,readiness=null)=>contexts.push({
  id,references,dayDirection:direction,dayPolarity:polarity,comparison,reviewObligations:sorted(obligations),
  alternatives,reviewFirst:complete?reviewFirst:null,comparisonReadiness:readiness,priorityConfirmed:null,netEffectConfirmed:null});
 if(review.family==='resource'){
  const damages=entries.filter(x=>x.r.id==='resource-wealth'),regulations=entries.filter(x=>x.r.id==='resource-wealth-regulation');
  for(const d of damages)for(const r of regulations){
   const {obstacle,target}=d.w.roles;
   if(r.w.roles.helper!==obstacle||r.w.roles.target!==target)continue;
   const a=actors.get(target);if(!a)return empty('invalid-evidence');
   const cmp=readCapacityComparison(comparisons,obstacle,target);
   if(cmp.status==='invalid-evidence')return empty('invalid-evidence');
   const readiness=assessRoleComparisonReadiness(cmp,obstacle,target,rootContext,commandReview);
   if(readiness.status==='invalid-evidence')return empty('invalid-evidence');
   const rooted=rootContext?rootedContext(target):a.exactRootSlots.length>0||a.sameElementRootSlots.length>0;
   const obligations=['resource-required-supply','resource-excess-not-established','wealth-control-efficacy',...cmp.cautions,...rootReview([obstacle,target])];
   if(!rooted)obligations.push('resource-root-access-review');
   // Weak day prompts protection review; strong day alone is not excess.
   const first=direction==='weak'?'required-resource-protection':direction==='strong'&&rooted?'resource-excess-assessment':null;
   add('resource-wealth-regulation-versus-injury',[ref(d.r,d.w),ref(r.r,r.w)],cmp,obligations,
    ['required-resource-protection','resource-excess-assessment'],first,readiness);
  }
 }
 if(review.family==='killing'){
  const supports=entries.filter(x=>x.r.id==='killing-food');
  for(const s of supports){
   for(const m of flow.mediationContexts.filter(m=>m.killingId===s.w.roles.target&&m.dayId===s.w.roles.day)){
    const cmp=readCapacityComparison(comparisons,s.w.roles.helper,s.w.roles.target);
    if(cmp.status==='invalid-evidence')return empty('invalid-evidence');
    const readiness=assessRoleComparisonReadiness(cmp,s.w.roles.helper,s.w.roles.target,rootContext,commandReview);
    if(readiness.status==='invalid-evidence')return empty('invalid-evidence');
    // Xu's commentary distinguishes yin and yang stems. Only weak yang
    // opens the explicit day-burden-first review, not a blanket weak-day rule.
    add('food-control-versus-resource-mediation',[ref(s.r,s.w),{mediationContextId:m.id}],cmp,
     ['day-output-burden','food-control-efficacy','resource-access-and-mediation',...cmp.cautions,...rootReview([s.w.roles.helper,s.w.roles.target,m.resourceId,m.dayId])],
     ['food-control-capacity','resource-mediation-capacity'],
     direction==='weak'&&polarity==='yang'?'resource-mediation-capacity':null,readiness);
   }
  }
  for(const d of entries.filter(x=>x.r.id==='killing-resource-blocks-food')){
   const {food,target,obstacle}=d.w.roles;
   if(!actors.has(food)||!actors.has(target)||!actors.has(obstacle))return empty('invalid-evidence');
   const cmp=readCapacityComparison(comparisons,food,target);
   if(cmp.status==='invalid-evidence')return empty('invalid-evidence');
   const readiness=assessRoleComparisonReadiness(cmp,food,target,rootContext,commandReview);
   if(readiness.status==='invalid-evidence')return empty('invalid-evidence');
   // Output-dominant profile triggers an excess review, not a claim of
   // excessive output; a clash or shared supply stays visible.
   add('resource-obstruction-versus-output-regulation',[ref(d.r,d.w)],cmp,
    ['output-excess-not-established','required-killing-preservation','resource-control-efficacy',...cmp.cautions,...rootReview([food,target,obstacle])],
    ['resource-obstructs-necessary-output','resource-moderates-excessive-output'],
    cmp.relation==='left-evidence-dominates'&&readiness.status==='directional-review-eligible'?'resource-moderates-excessive-output':null,readiness);
  }
 }
 return {...base,status:complete?'diagnostic':'partial',contexts,
  limitations:['review-order-not-effect-priority','no-automatic-excess-or-deficiency','no-cross-candidate-join','no-selected-interpretation']};
}

// R02 and K02: source-scoped conditional objectives, not a new force engine.
// Distinguish required role, comparative capacity and actual causal efficacy.
const clauseSources={R02:'https://luckclub.cn/bazi/002/037/',K02:'https://luckclub.cn/bazi/002/041/'};
const premise=(id,state,evidence)=>({id,state,evidence});
const edgeKey=(from,to,kind)=>JSON.stringify([from,to,kind]);
const validStates=['supported','opposed','conflicting','unresolved'];
function combinePremises(ps){
 if(ps.some(p=>p.state==='conflicting'))return 'conflicting';
 if(ps.some(p=>p.state==='opposed'))return 'opposed';
 return ps.length&&ps.every(p=>p.state==='supported')?'supported':'unresolved';
}
export function assessRoleObjectives(review,prior,capacity,comparisons,mechanism,strength,rootContext,commandReview){
 const base={version:'role-objective-policy-v1',candidateId:review.candidateId,selectionAuthority:false,
  preferredObjective:null,excessConfirmed:null,deficiencyConfirmed:null,effectConfirmed:null};
 const empty=status=>({...base,status,objectives:[]});
 if(review.status==='out-of-scope'||!['resource','killing'].includes(review.family))return empty('out-of-scope');
 if([capacity,comparisons,mechanism,rootContext,commandReview].some(x=>!x||x.status==='invalid-evidence'))return empty('invalid-evidence');
 const complete=prior.completeHour,actors=new Map(capacity.occurrences.map(o=>[o.id,o])),roots=new Map(rootContext.occurrences.map(o=>[o.id,o]));
 const edges=new Map(mechanism.edges.map(e=>[edgeKey(e.from,e.to,e.kind),e]));
 const entries=review.rules.flatMap(r=>r.witnesses.map(w=>({r,w})));
 const routeMap=new Map(mechanism.routes.map(r=>[key(r.ruleId,r.witnessId),r]));
 if(actors.size!==capacity.occurrences.length||roots.size!==rootContext.occurrences.length||actors.size!==roots.size||
  [...actors.keys()].some(id=>!roots.has(id))||edges.size!==mechanism.edges.length||
  routeMap.size!==entries.length||mechanism.routes.length!==entries.length||entries.some(({r,w})=>!routeMap.has(key(r.id,w.id))))return empty('invalid-evidence');
 const day=[...actors.values()].filter(a=>a.dayReference);
 if(day.length!==1)return empty('invalid-evidence');
 const dayId=day[0].id,dir=complete&&['strong','weak'].includes(strength?.direction)?strength.direction:null;
 const objectives=[];
 let invalid=false;
 const rooted=(id,label)=>{
  const a=actors.get(id),r=roots.get(id);
  if(!a||!r){invalid=true;return premise(label,'unresolved',{occurrenceId:id});}
  // Hidden access is not established by root presence. Absence of root
  // evidence alone is not opposition or actual weakness.
  return premise(label,complete&&a.layer==='visible'&&r.rootAxes.anySubstantial===true?'supported':'unresolved',
   {occurrenceId:id,layer:a.layer,rootState:r.rootAxes.anySubstantial,uncontestedRootIds:[...r.uncontestedRootIds],contestedRootIds:[...r.contestedRootIds],
    localSupply:r.localSupply??null});
 };
 const relative=(a,b,want,label)=>{
  const comparison=readCapacityComparison(comparisons,a,b),readiness=assessRoleComparisonReadiness(comparison,a,b,rootContext,commandReview);
  if(readiness.status==='invalid-evidence')invalid=true;
  // A missing birth instant permits only a chart-conditional premise; other
  // caution flags or known commander disagreement cannot be bypassed.
  const stable=complete&&(readiness.status==='directional-review-eligible'||
   readiness.status==='context-review'&&readiness.reasons.length===1&&readiness.reasons[0]==='command-not-assessed');
  const state=stable?(comparison.relation===want?'supported':'opposed'):
   comparison.relation==='mixed-evidence'?'conflicting':'unresolved';
  return premise(label,state,{from:a,to:b,expected:want,comparison,readiness,
   basis:stable&&readiness.status==='context-review'?'chart-only-conditional':'contextual-profile'});
 };
 const directed=(from,to,kind,label,required=false)=>{
  const e=edges.get(edgeKey(from,to,kind));
  if(!e){if(required)invalid=true;return premise(label,'unresolved',{from,to,kind,reason:'route-edge-not-projected'});}
  if(!validStates.includes(e.status)||e.effective!==null){invalid=true;return premise(label,'unresolved',{from,to,kind});}
  return premise(label,complete?e.status:'unresolved',{from,to,kind,edgeId:e.id,conditions:e.conditions});
 };
 const dayPremise=want=>premise('day-capacity-hypothesis',dir===null?'unresolved':dir===want?'supported':'opposed',
  {occurrenceId:dayId,direction:dir,expected:want,policy:strength?.policy??null});
 const distinct=(ids)=>ids.every(id=>actors.has(id))&&new Set(ids.map(id=>{const a=actors.get(id);return a.position+':'+a.layer;})).size===ids.length;
 const has=(w,a,b,k)=>w.edges.some(e=>e.from===a&&e.to===b&&e.kind===k);
 const push=(clause,objective,d,related,ps,unresolvedRequirements)=>{
  objectives.push({clause,source:clauseSources[clause],objective,route:ref(d.r,d.w),relatedRoutes:related.map(x=>ref(x.r,x.w)),
   premises:ps,conditionalStatus:combinePremises(ps),unresolvedRequirements,
   actualDemand:null,excessConfirmed:null,deficiencyConfirmed:null,effectConfirmed:null,selectionAuthority:false});
 };
 if(review.family==='resource')for(const d of entries.filter(x=>x.r.id==='resource-wealth')){
  const {obstacle:wealth,target:resource}=d.w.roles;
  if(!distinct([wealth,resource,dayId])||!has(d.w,wealth,resource,'control')||
   !['정재','편재'].includes(actors.get(wealth).tenGod)||!['정인','편인'].includes(actors.get(resource).tenGod))return empty('invalid-evidence');
  const regulation=entries.filter(x=>x.r.id==='resource-wealth-regulation'&&x.w.roles.helper===wealth&&x.w.roles.target===resource&&x.w.roles.day===dayId);
  const rescues=entries.filter(x=>x.r.kind==='rescue'&&x.r.threatRuleId===d.r.id&&x.w.threatWitnessId===d.w.id);
  const control=directed(wealth,resource,'control','wealth-control-capacity',true);
  const sourceSupply=directed(resource,dayId,'generate','resource-to-day-supply',regulation.length>0);
  const preservation=premise('other-resource-or-rescue-access','unresolved',{rescueRefs:rescues.map(x=>ref(x.r,x.w)),
   otherResourceIds:[...actors.values()].filter(a=>a.id!==resource&&!a.dayReference&&['정인','편인'].includes(a.tenGod)).map(a=>a.id)});
  push('R02','required-resource-injury',d,rescues,[dayPremise('weak'),relative(wealth,resource,'left-evidence-dominates','wealth-relative-dominance'),control,sourceSupply],
   ['resource-required-in-this-chart','resource-light-not-proven','rescue-and-independent-supply-unresolved']);
  // Strong day + rooted resource is only a prerequisite, not abundant
  // resource. A usable controller need not dominate the target.
  push('R02','excess-resource-moderation',d,regulation,[dayPremise('strong'),rooted(resource,'resource-root-access'),rooted(wealth,'wealth-root-access'),control,sourceSupply,preservation],
   ['resource-excess-not-proven','required-resource-preservation-unresolved']);
 }
 if(review.family==='killing')for(const d of entries.filter(x=>x.r.id==='killing-resource-blocks-food')){
  const {obstacle:resource,food:output,target:killing}=d.w.roles;
  if(!distinct([resource,output,killing])||!has(d.w,resource,output,'control')||!has(d.w,output,killing,'control')||
   !['정인','편인'].includes(actors.get(resource).tenGod)||!['식신','상관'].includes(actors.get(output).tenGod)||actors.get(killing).tenGod!=='편관')return empty('invalid-evidence');
  // K02 is the literal food-control clause, not an extension to hurting officer.
  if(actors.get(output).tenGod!=='식신')continue;
  const support=entries.filter(x=>x.r.id==='killing-food'&&x.w.roles.helper===output&&x.w.roles.target===killing&&x.w.roles.day===dayId);
  const control=directed(resource,output,'control','resource-controls-food',true);
  const foodControl=directed(output,killing,'control','food-controls-killing',true);
  const dayDrain=directed(dayId,output,'generate','day-output-drain',support.length>0);
  const killingPressure=directed(killing,dayId,'control','killing-day-pressure',support.length>0);
  const dayBurden=premise('day-burden-context','unresolved',{direction:dir,drain:dayDrain,pressure:killingPressure});
  push('K02','required-food-control-obstruction',d,support,[relative(output,killing,'right-evidence-dominates','killing-relative-dominance'),control,foodControl,dayBurden],
   ['food-required-in-this-chart','food-light-not-proven','alternative-mediation-unresolved']);
  push('K02','excess-food-moderation',d,support,[relative(output,killing,'left-evidence-dominates','food-relative-dominance'),rooted(resource,'resource-root-access'),control,dayBurden],
   ['food-excess-not-proven','necessary-killing-control-preserved','resource-day-support-unresolved']);
 }
 if(invalid)return empty('invalid-evidence');
 return {...base,status:complete?'diagnostic':'partial',objectives,
  limitations:['conditional-premises-not-effective-force','relative-profile-not-role-excess','literal-food-clause-only','no-final-objective-selection']};
}
