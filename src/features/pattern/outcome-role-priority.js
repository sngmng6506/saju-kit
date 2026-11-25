import {stemInfo} from '../../core/elements.js';
import {ref,key,edgeKey,validStates,premise,unknown,combinePremises,dayDirection,hasEdge,createRoleEvidence,createRoleEdgeReader,createRegistryReader} from './outcome-role-contract.js';
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
 const direction=dayDirection(complete,strength);
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
export function assessRoleObjectives(review,prior,capacity,comparisons,mechanism,strength,rootContext,commandReview){
 const base={version:'role-objective-policy-v1',candidateId:review.candidateId,selectionAuthority:false,
  preferredObjective:null,excessConfirmed:null,deficiencyConfirmed:null,effectConfirmed:null};
 const empty=status=>({...base,status,objectives:[]});
 if(review.status==='out-of-scope'||!['resource','killing'].includes(review.family))return empty('out-of-scope');
 if([capacity,comparisons,mechanism,rootContext,commandReview].some(x=>!x||x.status==='invalid-evidence'))return empty('invalid-evidence');
 const complete=prior.completeHour,evidence=createRoleEvidence(review,capacity,mechanism,{rootContext});
 if(!evidence)return empty('invalid-evidence');
 const {actors,roots,entries,registry,distinct}=evidence;
 const dayId=evidence.day.id,dir=dayDirection(complete,strength);
 const reader=createRegistryReader(registry,complete,{missingReason:true});
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
 const directed=(from,to,kind,label,required=false)=>reader.directed(from,to,kind,label,required);
 const dayPremise=want=>premise('day-capacity-hypothesis',dir===null?'unresolved':dir===want?'supported':'opposed',
  {occurrenceId:dayId,direction:dir,expected:want,policy:strength?.policy??null});
 const has=hasEdge;
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
 if(invalid||reader.invalid())return empty('invalid-evidence');
 return {...base,status:complete?'diagnostic':'partial',objectives,
  limitations:['conditional-premises-not-effective-force','relative-profile-not-role-excess','literal-food-clause-only','no-final-objective-selection']};
}

// K01: compare exact food-control and resource-mediation strategies.
// The latter is a contextual path, not a synthetic support witness.
export function assessKillingStrategies(review,prior,capacity,flow,mechanism,strength,assessEdge){
 const base={version:'killing-strategy-policy-v2',candidateId:review.candidateId,clause:'K01',
  source:'https://luckclub.cn/bazi/002/041/',selectionAuthority:false,preferredStrategy:null,effectConfirmed:null};
 const empty=status=>({...base,status,food:[],mediation:[],comparisons:[]});
 if(review.status==='out-of-scope'||review.family!=='killing')return empty('out-of-scope');
 if([capacity,flow,mechanism].some(x=>!x||x.status==='invalid-evidence'))return empty('invalid-evidence');
 const complete=prior.completeHour,evidence=createRoleEvidence(review,capacity,mechanism,{prior,flow,rawRequired:true});
 if(!evidence||typeof assessEdge!=='function')return empty('invalid-evidence');
 const {actors,entries,routes:routeRows,distinct}=evidence;
 const dayId=evidence.day.id,dayStem=evidence.original.get(dayId)?.stem;
 if(!dayStem)return empty('invalid-evidence');
 const polarity=stemInfo(dayStem).yinYang,dir=dayDirection(complete,strength);
 const reader=createRoleEdgeReader(evidence,complete,assessEdge),{edge,bound}=reader;
 const ep=(label,e)=>premise(label,e?.status??'unresolved',e);
 const dayFitness=()=>{
  // Original text asks for a healthy day. Xu adds a polarity distinction:
  // weak yang is opposed; weak yin is not automatically disqualified.
  const original=dir==='strong'?'supported':dir==='weak'?'opposed':'unresolved';
  const xu=dir==='strong'?'supported':dir==='weak'&&polarity==='yang'?'opposed':'unresolved';
  return premise('day-capacity-for-control',xu,{direction:dir,polarity,originalText:original,xuPolarityClause:xu,
   policy:strength?.policy??null,actualBurdenConfirmed:null});
 };
 const motive=premise('weak-day-mediation-motive',dir==='weak'?'supported':dir==='strong'?'opposed':'unresolved',
  {direction:dir,policy:strength?.policy??null,killingExcessConfirmed:null});
 const food=[],mediation=[],comparisons=[];
 for(const {r,w} of entries.filter(x=>x.r.id==='killing-food')){
  const {helper:f,target:k,day:d}=w.roles;
  if(d!==dayId||!distinct([f,k,d])||actors.get(f).tenGod!=='식신'||actors.get(k).tenGod!=='편관'||
   !review.anchorIds.includes(k))return empty('invalid-evidence');
  const required=[[f,k,'control'],[k,d,'control'],[d,f,'generate']];
  if(required.some(([a,b,c])=>!w.edges.some(e=>bound(e,a,b,c))))return empty('invalid-evidence');
  const [control,pressure,drain]=required.map(args=>edge(...args));
  const route=routeRows.get(key(r.id,w.id));
  if(!validStates.includes(route.status)||route.effective!==null)return empty('invalid-evidence');
  const ps=[dayFitness(),ep('food-control-capacity',control),
   premise('witness-mechanism-context',complete?route.status:'unresolved',{ruleId:r.id,witnessId:w.id,conditions:route.conditions})];
  food.push({id:key(r.id,w.id),route:ref(r,w),foodId:f,killingId:k,dayId:d,premises:ps,
   pressure,drain,conditionalStatus:combinePremises(ps),
   unresolvedRequirements:['food-killing-balance','day-actual-burden','necessary-killing-preserved'],effectConfirmed:null});
 }
 const ids=new Set();
 for(const m of flow.mediationContexts){
  const {killingId:k,resourceId:i,dayId:d}=m;
  if(ids.has(m.id)||m.id!==JSON.stringify([k,i,d])||d!==dayId||!review.anchorIds.includes(k)||!distinct([k,i,d])||
   actors.get(k).tenGod!=='편관'||actors.get(i).layer!=='visible'||!['정인','편인'].includes(actors.get(i).tenGod))return empty('invalid-evidence');
  ids.add(m.id);
  const required=[[k,i,'generate'],[i,d,'generate'],[k,d,'control']];
  if(m.edges.length!==3||required.some(([a,b,c])=>!m.edges.some(e=>bound(e,a,b,c))))return empty('invalid-evidence');
  const [supply,delivery,pressure]=required.map(args=>edge(...args));
  // Independent structural path is assessed even when no food witness exists.
  // Weak day is a source-specific motive, not a universal requirement for
  // mediation (the text also treats well-placed killing/resource separately).
  const ps=[ep('killing-supplies-resource',supply),ep('resource-supplies-day',delivery)];
  const wealthContacts=[...actors.values()].filter(a=>a.layer==='visible'&&['정재','편재'].includes(a.tenGod)).flatMap(a=>{
   const harm=edge(a.id,i,'control',false),feed=edge(a.id,k,'generate',false);
   return harm||feed?[{wealthId:a.id,resourceControl:harm,killingSupply:feed,netEffectConfirmed:null}]:[];
  });
  const exposure=premise('resource-preservation','unresolved',
   {wealthContacts,scope:'visible-directed-contacts-only',visibleControlObserved:wealthContacts.some(x=>x.resourceControl)?true:complete?false:null,actualPreservation:null});
  const pathPremises=[...ps,exposure];
  mediation.push({id:m.id,killingId:k,resourceId:i,dayId:d,premises:pathPremises,pressure,
   transferConditionalStatus:combinePremises(ps),conditionalStatus:combinePremises(pathPremises),weakDayPremises:[motive,...pathPremises],
   weakDayConditionalStatus:combinePremises([motive,...pathPremises]),
   unresolvedRequirements:['resource-actual-throughput','killing-pressure-actually-relieved','resource-preserved-under-all-contacts'],effectConfirmed:null});
 }
 for(const f of food)for(const m of mediation){
  if(f.killingId!==m.killingId||f.dayId!==m.dayId)continue;
  if(!distinct([f.foodId,m.resourceId,f.killingId,f.dayId]))continue;
  const obstruction=edge(m.resourceId,f.foodId,'control',false);
  const ps=[...f.premises,...m.premises];
  comparisons.push({foodRoute:f.route,mediationContextId:m.id,killingId:f.killingId,dayId:f.dayId,
   foodStatus:f.conditionalStatus,mediationStatus:m.conditionalStatus,weakDayMediationStatus:m.weakDayConditionalStatus,
   crossContact:obstruction,sharedRelations:[{from:f.killingId,to:f.dayId,kind:'control'}],
   interferenceStatus:!complete?'partial':obstruction?'contact-'+obstruction.status:'contact-not-observed',
   simultaneousStatus:!complete?'unresolved':obstruction&&obstruction.status!=='opposed'?'interference-review':combinePremises(ps),
   preferenceHypothesis:dir==='weak'&&polarity==='yang'?'review-mediation-first':null,
   unresolvedRequirements:['no-proof-of-net-pressure-reduction','shared-killing-pressure-not-additive','resource-food-contact-not-confirmed-injury'],
   preferredStrategy:null,effectConfirmed:null});
 }
 return reader.invalid()?empty('invalid-evidence'):{...base,status:complete?'diagnostic':'partial',food,mediation,comparisons,
  limitations:['source-conditional-strategy-not-final-choice','no-synthetic-support-witness','no-cross-anchor-comparison','no-effective-pressure-cancellation']};
}


// K03 consumes the existing compound motif, not a second witness generator.
// Capacity, role demand and outcome remain distinct; no polarity-based sign netting.
export function assessKillingWealth(review,prior,capacity,mechanism,compound,strategies,strength,comparisons,rootContext,commandReview){
 const base={version:'killing-wealth-policy-v1',candidateId:review.candidateId,clause:'K03',
  source:'https://luckclub.cn/bazi/002/041/',selectionAuthority:false,preferredObjective:null,effectConfirmed:null};
 const empty=status=>({...base,status,supply:[],dualRoles:[],mediationContacts:[]});
 if(review.status==='out-of-scope'||review.family!=='killing')return empty('out-of-scope');
 if([capacity,mechanism,strategies,comparisons,rootContext,commandReview].some(x=>!x||x.status==='invalid-evidence')||
  !compound||compound.violations?.length||strategies.candidateId!==review.candidateId)return empty('invalid-evidence');
 const complete=prior.completeHour,dir=dayDirection(complete,strength);
 const evidence=createRoleEvidence(review,capacity,mechanism);
 if(!evidence)return empty('invalid-evidence');
 const {actors,entries,lookup,registry,distinct}=evidence;
 const refKey=r=>key(r.ruleId,r.witnessId);
 const dayId=evidence.day.id,wealth=id=>actors.get(id)?.layer==='visible'&&['정재','편재'].includes(actors.get(id)?.tenGod);
 const killing=id=>actors.get(id)?.tenGod==='편관'&&review.anchorIds.includes(id);
 const resource=id=>actors.get(id)?.layer==='visible'&&['정인','편인'].includes(actors.get(id)?.tenGod);
 const output=id=>actors.get(id)?.layer==='visible'&&['식신','상관'].includes(actors.get(id)?.tenGod);
 const has=hasEdge;
 let invalid=false;
 const reader=createRegistryReader(registry,complete,{nullMissingId:true}),{directed}=reader;
 const dayPremise=want=>premise('day-capacity-hypothesis',dir===null?'unresolved':dir===want?'supported':'opposed',{direction:dir,expected:want,policy:strength?.policy??null});
 const objective=(id,premises)=>({id,premises,conditionalStatus:combinePremises(premises),actualDemand:null,effectConfirmed:null});
 const supply=[],dualRoles=[],mediationContacts=[];
 const supplyMap=new Map();
 for(const {r,w} of entries.filter(x=>x.r.id==='killing-wealth')){
  const {obstacle:a,target:k}=w.roles;
  if(r.kind!=='damage'||!wealth(a)||!killing(k)||!distinct([a,k,dayId])||!has(w,a,k,'generate'))return empty('invalid-evidence');
  const generation=directed(a,k,'generate','wealth-supplies-killing');
  const row={route:ref(r,w),wealthId:a,killingId:k,dayId,generation,
   objectives:[objective('wealth-supplies-needed-killing',[dayPremise('strong'),generation,unknown('killing-deficiency')]),
    objective('wealth-reinforces-dangerous-killing',[generation,unknown('killing-pressure-exceeds-day-capacity',{direction:dir})])],
   effectConfirmed:null};
  supply.push(row);supplyMap.set(key(r.id,w.id),row);
 }
 const motifs=(compound.motifs??[]).filter(m=>m.id==='killing-wealth-rescue-with-killing-supply');
 if(motifs.length!==1)return empty('invalid-evidence');
 const seen=new Set();
 for(const m of motifs[0].witnesses){
  const a=lookup.get(refKey(m.left)),t=lookup.get(refKey(m.boundThreat)),b=lookup.get(refKey(m.right));
  const id=JSON.stringify([m.left.ruleId,m.left.witnessId,m.right.ruleId,m.right.witnessId,m.boundThreat.ruleId,m.boundThreat.witnessId]);
  if(seen.has(id)||!a||!t||!b||a.r.id!=='killing-wealth-removes-resource'||a.r.kind!=='rescue'||
   t.r.id!=='killing-resource-blocks-food'||t.r.kind!=='damage'||b.r.id!=='killing-wealth'||
   a.r.threatRuleId!==t.r.id||a.w.threatWitnessId!==t.w.id)return empty('invalid-evidence');
  seen.add(id);
  const {helper:w,obstacle:i,food:f,target:k}=a.w.roles;
  const feed=supplyMap.get(refKey(m.right));
  if(!feed||feed.wealthId!==w||feed.killingId!==k||!wealth(w)||!resource(i)||!output(f)||!killing(k)||
   !distinct([w,i,f,k,dayId])||t.w.roles.obstacle!==i||t.w.roles.food!==f||t.w.roles.target!==k||
   !has(t.w,i,f,'control')||!has(t.w,f,k,'control')||!has(a.w,w,i,'control'))return empty('invalid-evidence');
  const expected={resourceObstructsOutput:[i,f,'control'],outputControlsKilling:[f,k,'control'],
   wealthControlsResource:[w,i,'control'],wealthGeneratesKilling:[w,k,'generate']};
  if(Object.keys(m.paths??{}).length!==4||Object.entries(expected).some(([name,[from,to,kind]])=>{
   const p=m.paths?.[name];return !p||p.from!==from||p.to!==to||p.kind!==kind;
  }))return empty('invalid-evidence');
  const obstacle=directed(i,f,'control','resource-controls-output'),controller=directed(f,k,'control','output-controls-killing');
  const rescue=directed(w,i,'control','wealth-controls-resource');
  const cmp=readCapacityComparison(comparisons,f,k),ready=assessRoleComparisonReadiness(cmp,f,k,rootContext,commandReview);
  if(ready.status==='invalid-evidence')return empty('invalid-evidence');
  const contrast=complete&&ready.status==='directional-review-eligible'?(cmp.relation==='left-evidence-dominates'?'supported':'opposed'):'unresolved';
  dualRoles.push({id,rescue:m.left,supply:m.right,boundThreat:m.boundThreat,wealthId:w,resourceId:i,outputId:f,outputTenGod:actors.get(f).tenGod,killingId:k,dayId,
   objectives:[objective('wealth-relieves-output-obstruction',[obstacle,rescue,controller,unknown('output-required'),unknown('output-restoration')]),
    objective('wealth-supplies-insufficient-killing',[dayPremise('strong'),feed.generation,premise('output-killing-relative-contrast',contrast,{comparison:cmp,readiness:ready}),unknown('killing-deficiency')]),
    objective('wealth-reinforces-dangerous-killing',[feed.generation,unknown('killing-pressure-exceeds-day-capacity',{direction:dir})])],
   killingDeficiencyConfirmed:null,outputRestored:null,netEffectConfirmed:null,effectConfirmed:null});
 }
 // He/Liu: placement and resource injury are separate from wealth supply.
 // Reuse the already assessed mediation contacts; never infer no injury from
 // distance alone, and never create a new support or rescue witness.
 const order=['year','month','day','hour'];
 for(const m of strategies.mediation){
  const p=m.premises.find(p=>p.id==='resource-preservation');
  if(!p||p.state!=='unresolved'||!resource(m.resourceId)||!killing(m.killingId)||m.dayId!==dayId)return empty('invalid-evidence');
  for(const c of p.evidence.wealthContacts){
   const w=c.wealthId,i=m.resourceId,k=m.killingId;
   if(!wealth(w)||!distinct([w,i,k,dayId]))return empty('invalid-evidence');
   const read=(e,to,kind,label)=>{
    if(!e)return unknown(label,{observed:false});
    if(e.from!==w||e.to!==to||e.kind!==kind||e.effective!==null||!validStates.includes(e.status)){invalid=true;return unknown(label);}
    return premise(label,complete?e.status:'unresolved',e);
   };
   const harm=read(c.resourceControl,i,'control','wealth-controls-resource');
   const feed=read(c.killingSupply,k,'generate','wealth-supplies-killing');
   const distance=Math.abs(order.indexOf(actors.get(w).position)-order.indexOf(actors.get(i).position));
   mediationContacts.push({mediationContextId:m.id,wealthId:w,resourceId:i,killingId:k,dayId,
    placement:{wealthResourceDistance:distance,adjacent:distance===1,protectionConfirmed:null},
    objectives:[objective('wealth-threatens-needed-resource',[harm,unknown('resource-required')]),
     objective('wealth-supplies-killing-through-resource',[feed,...m.premises.filter(p=>p.id!=='resource-preservation'),unknown('resource-preserved')]),
     objective('wealth-supplies-needed-killing',[dayPremise('strong'),feed,unknown('killing-deficiency')])],
    netEffectConfirmed:null,effectConfirmed:null});
  }
 }
 return invalid||reader.invalid()?empty('invalid-evidence'):{...base,status:complete?'diagnostic':'partial',supply,dualRoles,mediationContacts,
  limitations:['exact-bound-compound-motif-only','placement-not-protection','relative-contrast-not-deficiency','no-summed-or-confirmed-effects']};
}


// R01/R03: the resource family has several different objectives. A
// strong-day hypothesis and observed roots do not establish excess.
export function assessResourceStrategies(review,prior,capacity,mechanism,strength,rootContext,assessEdge){
 const base={version:'resource-strategy-policy-v1',candidateId:review.candidateId,
  source:'https://luckclub.cn/bazi/002/037/',selectionAuthority:false,preferredObjective:null,effectConfirmed:null};
 const empty=status=>({...base,status,outputDrain:[],killingSupply:[],officerContext:[]});
 if(review.status==='out-of-scope'||review.family!=='resource')return empty('out-of-scope');
 if([capacity,mechanism,rootContext].some(x=>!x||x.status==='invalid-evidence')||typeof assessEdge!=='function')return empty('invalid-evidence');
 const complete=prior.completeHour,dir=dayDirection(complete,strength);
 const evidence=createRoleEvidence(review,capacity,mechanism,{prior,rootContext,rawRequired:true});
 if(!evidence||evidence.day.id!=='visible:day')return empty('invalid-evidence');
 const {actors,entries,roots,routes,visible,distinct}=evidence;
 const d=evidence.day.id,resource=id=>review.anchorIds.includes(id)&&['정인','편인'].includes(actors.get(id)?.tenGod);
 const reader=createRoleEdgeReader(evidence,complete,assessEdge),{edge,bound}=reader;
 const dayPremise=want=>premise('day-capacity-hypothesis',dir===null?'unresolved':dir===want?'supported':'opposed',{occurrenceId:d,direction:dir,expected:want,policy:strength?.policy??null});
 const rootPremise=id=>{
  const a=actors.get(id),r=roots.get(id);
  return premise('resource-root-observation',complete&&a.layer==='visible'&&r.rootAxes.anySubstantial===true?'supported':'unresolved',
   {occurrenceId:id,layer:a.layer,rootState:r.rootAxes.anySubstantial,uncontestedRootIds:[...r.uncontestedRootIds],contestedRootIds:[...r.contestedRootIds]});
 };
 const ep=(id,e)=>premise(id,e?.status??'unresolved',e);
 const routeValid=(r,w)=>{const row=routes.get(key(r.id,w.id));return row&&validStates.includes(row.status)&&row.effective===null;};
 const objective=(clause,id,premises,scope='ordinary')=>({clause,id,scope,premises,conditionalStatus:combinePremises(premises),
  actualDemand:null,excessConfirmed:null,deficiencyConfirmed:null,effectConfirmed:null,selectionAuthority:false});
 const outputDrain=[],killingSupply=[],officerContext=[];
 for(const {r,w} of entries.filter(x=>x.r.id==='resource-output-regulation')){
  const {helper:o,target}=w.roles;
  if(r.kind!=='support'||target!==d||actors.get(o)?.layer!=='visible'||!['식신','상관'].includes(actors.get(o)?.tenGod)||
   !distinct([o,d])||!routeValid(r,w)||w.edges.length!==1||!bound(w.edges[0],d,o,'generate')||
   !Array.isArray(w.anchorBindings)||!w.anchorBindings.length)return empty('invalid-evidence');
  const bindingIds=w.anchorBindings.map(b=>b.anchorId);
  // Alternatives cannot inherit the readiness of another anchor.
  if(new Set(bindingIds).size!==bindingIds.length)return empty('invalid-evidence');
  const drain=edge(d,o,'generate');
  const contacts=visible.filter(a=>['정인','편인'].includes(a.tenGod)&&a.id!==o).flatMap(a=>{
   const control=edge(a.id,o,'control',false);
   return control?[{resourceId:a.id,control,obstructionConfirmed:null}]:[];
  });
  for(const b of w.anchorBindings){
   const i=b.anchorId;
   if(!resource(i)||!distinct([i,d,o])||!bound(b.edge,i,d,'generate')||b.effective!==null)return empty('invalid-evidence');
   const support=edge(i,d,'generate');
   const ps=[rootPremise(i),ep('resource-supplies-day',support),ep('day-drains-to-output',drain)];
   outputDrain.push({route:ref(r,w),anchorId:i,outputId:o,outputTenGod:actors.get(o).tenGod,dayId:d,
    pathPremises:ps,pathConditionalStatus:combinePremises(ps),contacts,
    objectives:[
     objective('R01','drain-resource-supported-strong-day',[dayPremise('strong'),...ps,unknown('resource-abundance'),unknown('output-preserved',{contacts})]),
     objective('R01','drain-burdens-weak-day',[dayPremise('weak'),ep('day-drains-to-output',drain),unknown('resource-insufficient'),unknown('output-excess')])],
    netEffectConfirmed:null,effectConfirmed:null});
  }
 }
 for(const {r,w} of entries.filter(x=>['resource-killing','resource-officer'].includes(x.r.id))){
  const {helper:h,target:i}=w.roles,isKilling=r.id==='resource-killing';
  if(r.kind!=='support'||!resource(i)||!distinct([h,i,d])||actors.get(h)?.layer!=='visible'||
   actors.get(h)?.tenGod!==(isKilling?'편관':'정관')||!routeValid(r,w)||w.edges.length!==1||!bound(w.edges[0],h,i,'generate'))return empty('invalid-evidence');
  const supply=edge(h,i,'generate'),delivery=edge(i,d,'generate'),pressure=edge(h,d,'control');
  const wealthContacts=visible.filter(a=>['정재','편재'].includes(a.tenGod)).flatMap(a=>{
   const harm=edge(a.id,i,'control',false),feed=edge(a.id,h,'generate',false);
   return harm||feed?[{wealthId:a.id,resourceControl:harm,officerSupply:feed,netEffectConfirmed:null}]:[];
  });
  const ps=[ep('officer-supplies-resource',supply),ep('resource-supplies-day',delivery)];
  const common={route:ref(r,w),resourceId:i,officerId:h,officerTenGod:actors.get(h).tenGod,dayId:d,pathPremises:ps,
   pathConditionalStatus:combinePremises(ps),dayPressure:pressure,resourceRoot:rootPremise(i),wealthContacts,
   netEffectConfirmed:null,effectConfirmed:null};
  if(!isKilling){
   // 正官 may be used independently of generation in the original text;
   // this is not the 七殺 shortage rule and purity remains unresolved.
   officerContext.push({...common,objectives:[objective('R03-context','officer-independent-role-review',
    [dayPremise('strong'),unknown('officer-purity'),unknown('officer-independent-demand')],'officer-distinct')]});
   continue;
  }
  killingSupply.push({...common,objectives:[
   objective('R03','killing-supplies-light-resource',[dayPremise('strong'),...ps,unknown('resource-deficiency'),unknown('resource-preserved',{wealthContacts})]),
   objective('R03','weak-day-heavy-resource-original-reading',[dayPremise('weak'),...ps,unknown('resource-abundance'),unknown('ordinary-scope-not-established')],'original-scope-review'),
   objective('R03','killing-supply-with-both-day-and-resource-heavy',[dayPremise('strong'),ep('officer-supplies-resource',supply),unknown('resource-abundance'),unknown('wealth-alternative-and-pressure',{wealthContacts,pressure})])],
   commentary:{mao:'Xu treats the weak-day/heavy-resource example as exceptional; no ordinary positive rule is inferred.',
    ma:'Xu emphasizes resource supply despite rooted day and output drain; preservation matters.',scopeResolved:null}});
 }
 return reader.invalid()?empty('invalid-evidence'):{...base,status:complete?'diagnostic':'partial',outputDrain,killingSupply,officerContext,
  limitations:['no-role-count-or-force-weights','exact-anchor-alternatives-only','root-not-abundance','original-and-commentary-scope-distinct','no-special-pattern-or-selection-authority']};
}
