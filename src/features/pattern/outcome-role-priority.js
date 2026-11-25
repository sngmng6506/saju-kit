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
  const c=rows[0],commandRelations=c.hypotheses.map(h=>({id:h.id,relation:orient(c,h.relation)}));
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
