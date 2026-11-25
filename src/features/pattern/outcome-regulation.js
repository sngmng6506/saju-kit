import {regulationConditions} from './outcome-regulation-strength.js';
const slot=o=>o.position+':'+o.layer;
const unique=xs=>[...new Set(xs)].sort();
const distinct=xs=>new Set(xs.map(slot)).size===xs.length;
const ref=e=>({from:e.from,to:e.to,kind:e.kind,edgeId:e.id,screen:e.screen,blockers:[...e.blockers],
 relativeEvidence:e.relative.relation,effective:null});
const profile=(prior,id)=>{
 const p=prior.relativeForce.profiles[id];
 return {occurrenceId:id,axes:{...p.axes},rootPositions:[...p.rootPositions],localGenerationNodes:[...p.localGenerationNodes],
 localPeerNodes:[...p.localPeerNodes],localControlNodes:[...p.localControlNodes],contacts:[...p.contacts],rootClashExposed:[...p.rootClashExposed],effectiveForce:null};
};
const witness=(id,roles,edges,extra)=>({id:id+':'+Object.entries(roles).map(([k,v])=>k+'='+v).join('|'),roles,edges,...extra,effective:null});
const rule=(id,witnesses,completeHour,conditions)=>({id,kind:'support',threatRuleId:null,witnesses,
 observed:witnesses.length?true:completeHour?false:null,unresolvedConditions:conditions,
 impact:'conditional-regulation-not-confirmed-support',conditionResolved:false,effective:null});
// Regulation is not rescue: it moderates a necessary/excessive role rather
// than removing a damage witness. Every role is an actual occurrence.
export function reviewRegulation(prior,review,strength){
 if(review.status==='out-of-scope'||!['resource','blade','killing'].includes(review.family))return review;
 const actors=prior.stemForce.occurrences,byId=new Map(actors.map(o=>[o.id,o]));
 const day=actors.find(o=>o.dayReference),anchors=review.anchorIds.map(id=>byId.get(id)).filter(Boolean);
 const visible=actors.filter(o=>o.layer==='visible'&&!o.dayReference);
 const edgeBy=new Map(prior.relativeForce.edges.map(e=>[e.id,e]));
 const edge=(a,b,kind)=>{const e=edgeBy.get(a.id+'>'+b.id);return e?.kind===kind?ref(e):null;};
 const foods=visible.filter(o=>o.tenGod==='식신');
 const outputs=visible.filter(o=>['식신','상관'].includes(o.tenGod));
 const wealth=visible.filter(o=>['정재','편재'].includes(o.tenGod));
 const killers=visible.filter(o=>o.tenGod==='편관');
 // No inference from the count of occurrences or the count of true axes.
 // Report distinct source IDs and shared root slots without summing force.
 const context=(helper,target,peers,requiresStrong)=>({
  helperProfile:profile(prior,helper.id),targetProfile:profile(prior,target.id),
  relatedVisibleIds:peers.map(o=>o.id),
  sharedRootPositions:unique(peers.flatMap(o=>prior.relativeForce.profiles[o.id].rootPositions)
   .filter(p=>prior.relativeForce.profiles[target.id].rootPositions.includes(p))),
  conditions:regulationConditions(strength,{requiresStrong}),dayStrengthPolicy:strength.policy
 });
 const extra=[];
 if(review.family==='resource'){
  const id='resource-output-regulation';
  const ws=outputs.flatMap(helper=>{
   const drain=edge(day,helper,'generate');
   if(!drain)return [];
   // Anchor is the source of the day support; never infer hidden access.
   const anchorBindings=anchors.flatMap(a=>{
    if(!distinct([a,day,helper]))return [];
    const e=edge(a,day,'generate');
    return e?[{anchorId:a.id,edge:e,effective:null}]:[];
   });
   if(!anchorBindings.length)return [];
   return [witness(id,{helper:helper.id,target:day.id},[drain],{anchorBindings,
    regulation:context(helper,day,[day],true),intent:'drain-day-supported-by-resource'})];
  });
  extra.push(rule(id,ws,prior.completeHour,['day-and-resource-strong','resource-excess','output-access-and-capacity','output-not-obstructed']));
  const wid='resource-wealth-regulation';
  const wealthWs=anchors.flatMap(target=>wealth.flatMap(helper=>{
   if(!distinct([target,helper,day]))return [];
   const control=edge(helper,target,'control'),support=edge(target,day,'generate');
   if(!control||!support)return [];
   return [witness(wid,{helper:helper.id,target:target.id,day:day.id},[control,support],
    {regulation:context(helper,target,visible.filter(o=>['정인','편인'].includes(o.tenGod)),true),
     intent:'moderate-excess-resource',alternativeDamageRuleId:'resource-wealth'})];
  }));
  extra.push(rule(wid,wealthWs,prior.completeHour,['day-strong','resource-excess','wealth-rooted-and-effective','required-resource-preserved']));
 }else{
  const id=review.family==='blade'?'blade-food-regulation':'killing-food-regulation';
  // Blade has a day proxy anchor; killing uses its actual monthly anchor.
  const controllers=review.family==='blade'?killers:anchors.filter(o=>o.tenGod==='편관');
  const ws=controllers.flatMap(controller=>foods.flatMap(helper=>{
   if(!distinct([controller,helper,day]))return [];
   const control=edge(helper,controller,'control'),pressure=edge(controller,day,'control'),drain=edge(day,helper,'generate');
   if(!control||!pressure||!drain)return [];
   return [witness(id,{helper:helper.id,controller:controller.id,day:day.id},[control,pressure,drain],
    {regulation:context(helper,controller,killers,review.family==='killing'),
     intent:'moderate-killing-not-remove-controller',alternativeDamageRuleId:review.family==='blade'?'blade-controller-damage':null})];
  }));
  extra.push(rule(id,ws,prior.completeHour,['killing-excess','food-capacity','day-capacity','necessary-controller-preserved']));
 }
 // Existing support/damage status is not promoted by conditional regulation.
 // In particular, the helper list is not silently promoted to assistant candidates.
 return {...review,rules:[...review.rules,...extra],regulationObserved:extra.some(r=>r.observed===true)?true:prior.completeHour?false:null};
}
