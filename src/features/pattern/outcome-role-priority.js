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

// K01: compare exact food-control and resource-mediation strategies.
// The latter is a contextual path, not a synthetic support witness.
export function assessKillingStrategies(review,prior,capacity,flow,mechanism,strength,assessEdge){
 const base={version:'killing-strategy-policy-v1',candidateId:review.candidateId,clause:'K01',
  source:'https://luckclub.cn/bazi/002/041/',selectionAuthority:false,preferredStrategy:null,effectConfirmed:null};
 const empty=status=>({...base,status,food:[],mediation:[],comparisons:[]});
 if(review.status==='out-of-scope'||review.family!=='killing')return empty('out-of-scope');
 if([capacity,flow,mechanism].some(x=>!x||x.status==='invalid-evidence'))return empty('invalid-evidence');
 const complete=prior.completeHour,actors=new Map(capacity.occurrences.map(o=>[o.id,o]));
 const raw=new Map(prior.relativeForce.edges.map(e=>[edgeKey(e.from,e.to,e.kind),e]));
 const registry=new Map(mechanism.edges.map(e=>[edgeKey(e.from,e.to,e.kind),e]));
 const day=capacity.occurrences.filter(o=>o.dayReference);
 if(day.length!==1||actors.size!==capacity.occurrences.length||raw.size!==prior.relativeForce.edges.length||
  registry.size!==mechanism.edges.length||typeof assessEdge!=='function')return empty('invalid-evidence');
 const dayId=day[0].id,dayStem=prior.stemForce.occurrences.find(o=>o.id===dayId&&o.dayReference)?.stem;
 if(!dayStem)return empty('invalid-evidence');
 const polarity=stemInfo(dayStem).yinYang,dir=complete&&['strong','weak'].includes(strength?.direction)?strength.direction:null;
 const routeRows=new Map(mechanism.routes.map(r=>[key(r.ruleId,r.witnessId),r]));
 const flowRows=new Map(flow.routes.map(r=>[key(r.ruleId,r.witnessId),r]));
 const entries=review.rules.flatMap(r=>r.witnesses.map(w=>({r,w})));
 const refs=entries.map(({r,w})=>key(r.id,w.id));
 if(new Set(refs).size!==refs.length||routeRows.size!==refs.length||mechanism.routes.length!==refs.length||
  flowRows.size!==refs.length||flow.routes.length!==refs.length||refs.some(k=>!routeRows.has(k)||!flowRows.has(k)))return empty('invalid-evidence');
 let invalid=false;
 const distinct=ids=>ids.every(id=>actors.has(id))&&new Set(ids.map(id=>{const a=actors.get(id);return a.position+':'+a.layer;})).size===ids.length;
 const edge=(from,to,kind,required=true)=>{
  const k=edgeKey(from,to,kind),r=raw.get(k);
  if(!r){if(required)invalid=true;return null;}
  const assessed=assessEdge({from,to,kind,edgeId:r.id});
  if(!assessed||assessed.from!==from||assessed.to!==to||assessed.kind!==kind||
   assessed.effective!==null||!validStates.includes(assessed.status)){invalid=true;return null;}
  const existing=registry.get(k);
  if(existing&&(existing.status!==assessed.status||existing.effective!==null||
   JSON.stringify(existing.conditions)!==JSON.stringify(assessed.conditions)))invalid=true;
  return {from,to,kind,edgeId:r.id,status:complete?assessed.status:'unresolved',conditions:assessed.conditions,effective:null};
 };
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
  if(required.some(([a,b,c])=>!w.edges.some(e=>e.from===a&&e.to===b&&e.kind===c)))return empty('invalid-evidence');
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
  if(m.edges.length!==3||required.some(([a,b,c])=>!m.edges.some(e=>e.from===a&&e.to===b&&e.kind===c&&e.edgeId===raw.get(edgeKey(a,b,c))?.id)))return empty('invalid-evidence');
  const [supply,delivery,pressure]=required.map(args=>edge(...args));
  // Independent structural path is assessed even when no food witness exists.
  // Weak day is a source-specific motive, not a universal requirement for
  // mediation (the text also treats well-placed killing/resource separately).
  const ps=[ep('killing-supplies-resource',supply),ep('resource-supplies-day',delivery)];
  const wealthContacts=[...actors.values()].filter(a=>a.layer==='visible'&&['정재','편재'].includes(a.tenGod)).flatMap(a=>{
   const harm=edge(a.id,i,'control',false),feed=edge(a.id,k,'generate',false);
   return harm||feed?[{wealthId:a.id,resourceControl:harm,killingSupply:feed,netEffectConfirmed:null}]:[];
  });
  const exposure=premise('resource-preservation',wealthContacts.some(x=>x.resourceControl)?'unresolved':'supported',
   {wealthContacts,scope:'visible-directed-contacts-only',actualPreservation:null});
  const pathPremises=[...ps,exposure];
  mediation.push({id:m.id,killingId:k,resourceId:i,dayId:d,premises:pathPremises,pressure,
   conditionalStatus:combinePremises(pathPremises),weakDayPremises:[motive,...pathPremises],
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
   simultaneousStatus:obstruction?'interference-review':combinePremises(ps),
   preferenceHypothesis:dir==='weak'&&polarity==='yang'?'review-mediation-first':null,
   unresolvedRequirements:['no-proof-of-net-pressure-reduction','shared-killing-pressure-not-additive','resource-food-contact-not-confirmed-injury'],
   preferredStrategy:null,effectConfirmed:null});
 }
 return invalid?empty('invalid-evidence'):{...base,status:complete?'diagnostic':'partial',food,mediation,comparisons,
  limitations:['source-conditional-strategy-not-final-choice','no-synthetic-support-witness','no-cross-anchor-comparison','no-effective-pressure-cancellation']};
}
