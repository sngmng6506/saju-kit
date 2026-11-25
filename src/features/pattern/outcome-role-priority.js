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
export function observeConditionalRolePriority(review,prior,capacity,comparisons,flow,strength,rootContext=null){
 const base={candidateId:review.candidateId,selectionAuthority:false,preferredInterpretation:null,netEffectConfirmed:null};
 const empty=status=>({...base,status,contexts:[]});
 if(review.status==='out-of-scope')return empty('out-of-scope');
 if([capacity,comparisons,flow].some(x=>!x||x.status==='invalid-evidence')||rootContext?.status==='invalid-evidence')return empty('invalid-evidence');
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
 const add=(id,references,comparison,obligations,alternatives,reviewFirst)=>contexts.push({
  id,references,dayDirection:direction,dayPolarity:polarity,comparison,reviewObligations:sorted(obligations),
  alternatives,reviewFirst:complete?reviewFirst:null,priorityConfirmed:null,netEffectConfirmed:null});
 if(review.family==='resource'){
  const damages=entries.filter(x=>x.r.id==='resource-wealth'),regulations=entries.filter(x=>x.r.id==='resource-wealth-regulation');
  for(const d of damages)for(const r of regulations){
   const {obstacle,target}=d.w.roles;
   if(r.w.roles.helper!==obstacle||r.w.roles.target!==target)continue;
   const a=actors.get(target);if(!a)return empty('invalid-evidence');
   const cmp=readCapacityComparison(comparisons,obstacle,target);
   if(cmp.status==='invalid-evidence')return empty('invalid-evidence');
   const rooted=rootContext?rootedContext(target):a.exactRootSlots.length>0||a.sameElementRootSlots.length>0;
   const obligations=['resource-required-supply','resource-excess-not-established','wealth-control-efficacy',...cmp.cautions,...rootReview([obstacle,target])];
   if(!rooted)obligations.push('resource-root-access-review');
   // Weak day prompts protection review; strong day alone is not excess.
   const first=direction==='weak'?'required-resource-protection':direction==='strong'&&rooted?'resource-excess-assessment':null;
   add('resource-wealth-regulation-versus-injury',[ref(d.r,d.w),ref(r.r,r.w)],cmp,obligations,
    ['required-resource-protection','resource-excess-assessment'],first);
  }
 }
 if(review.family==='killing'){
  const supports=entries.filter(x=>x.r.id==='killing-food');
  for(const s of supports){
   for(const m of flow.mediationContexts.filter(m=>m.killingId===s.w.roles.target&&m.dayId===s.w.roles.day)){
    const cmp=readCapacityComparison(comparisons,s.w.roles.helper,s.w.roles.target);
    if(cmp.status==='invalid-evidence')return empty('invalid-evidence');
    // Xu's commentary distinguishes yin and yang stems. Only weak yang
    // opens the explicit day-burden-first review, not a blanket weak-day rule.
    add('food-control-versus-resource-mediation',[ref(s.r,s.w),{mediationContextId:m.id}],cmp,
     ['day-output-burden','food-control-efficacy','resource-access-and-mediation',...cmp.cautions,...rootReview([s.w.roles.helper,s.w.roles.target,m.resourceId,m.dayId])],
     ['food-control-capacity','resource-mediation-capacity'],
     direction==='weak'&&polarity==='yang'?'resource-mediation-capacity':null);
   }
  }
  for(const d of entries.filter(x=>x.r.id==='killing-resource-blocks-food')){
   const {food,target,obstacle}=d.w.roles;
   if(!actors.has(food)||!actors.has(target)||!actors.has(obstacle))return empty('invalid-evidence');
   const cmp=readCapacityComparison(comparisons,food,target);
   if(cmp.status==='invalid-evidence')return empty('invalid-evidence');
   // Output-dominant profile triggers an excess review, not a claim of
   // excessive output; a clash or shared supply stays visible.
   add('resource-obstruction-versus-output-regulation',[ref(d.r,d.w)],cmp,
    ['output-excess-not-established','required-killing-preservation','resource-control-efficacy',...cmp.cautions,...rootReview([food,target,obstacle])],
    ['resource-obstructs-necessary-output','resource-moderates-excessive-output'],
    cmp.relation==='left-evidence-dominates'&&(!rootContext||!rootReview([food,target,obstacle]).some(c=>c.endsWith(':contested-root-supply')))?'resource-moderates-excessive-output':null);
  }
 }
 return {...base,status:complete?'diagnostic':'partial',contexts,
  limitations:['review-order-not-effect-priority','no-automatic-excess-or-deficiency','no-cross-candidate-join','no-selected-interpretation']};
}
