import {stemCombination} from '../../core/relations.js';
const ORDER=['year','month','day','hour'];
const distance=(a,b)=>Math.abs(ORDER.indexOf(a.position)-ORDER.indexOf(b.position));
const unique=xs=>[...new Set(xs)].sort();
const edgeRef=e=>({from:e.from,to:e.to,kind:e.kind,edgeId:e.id,screen:e.screen,blockers:[...e.blockers],effective:null});
const witness=(id,roles,edges,extra={})=>({id:id+':'+Object.entries(roles).map(([k,v])=>k+'='+v).join('|'),roles,edges,...extra,effective:null});
const rule=(id,kind,witnesses,complete,conditions,threatRuleId=null)=>({id,kind,threatRuleId,witnesses,
 observed:witnesses.length?true:complete?false:null,unresolvedConditions:conditions,conditionResolved:false,effective:null});
export function reviewPeerOfficerClearing(prior,review){
 if(review.status==='out-of-scope'||review.family!=='peer'||review.anchorBasis!=='day-reference-proxy')return review;
 const actors=prior.stemForce.occurrences,byId=new Map(actors.map(a=>[a.id,a]));
 const day=actors.find(a=>a.dayReference);
 const visible=actors.filter(a=>a.layer==='visible'&&!a.dayReference);
 const officers=visible.filter(a=>a.tenGod==='정관'),killers=visible.filter(a=>a.tenGod==='편관');
 const edges=new Map(prior.relativeForce.edges.map(e=>[e.id,e]));
 const get=(a,b)=>{const e=edges.get(a.id+'>'+b.id);return e?.kind==='control'?edgeRef(e):null;};
 const partners=a=>actors.filter(b=>b.layer==='visible'&&a.id!==b.id&&stemCombination(a.stem,b.stem)).map(b=>b.id).sort();
 const damageId='peer-officer-killing-mix',combineId='peer-combine-killing-preserve-officer',controlId='peer-food-controls-killing-preserve-officer';
 const threats=officers.flatMap(controller=>killers.flatMap(obstacle=>{
  const a=get(controller,day),b=get(obstacle,day);
  if(!a||!b)return [];
  return [witness(damageId,{controller:controller.id,obstacle:obstacle.id,target:day.id},[a,b],
   {protectedRole:'officer',mixingConfirmed:null,threatWitnessId:null})];
 }));
 const combine=threats.flatMap(t=>visible.filter(h=>h.tenGod==='겁재').flatMap(helper=>{
  const obstacle=byId.get(t.roles.obstacle),controller=byId.get(t.roles.controller);
  if([obstacle.id,controller.id].includes(helper.id)||!stemCombination(helper.stem,obstacle.stem))return [];
  const a=partners(helper),b=partners(obstacle),c=partners(controller);
  return [witness(combineId,{...t.roles,helper:helper.id},[{from:helper.id,to:obstacle.id,kind:'combine',edgeId:null,screen:'combination-effect-unresolved',contact:{fromPartners:a,toPartners:b},effective:null}],
   {protectedRole:'officer',threatWitnessId:t.id,clearing:{method:'combine',adjacent:distance(helper,obstacle)===1,
    exclusiveContact:a.length===1&&b.length===1,officerContacts:c,remainingVisibleKillingIds:killers.filter(x=>x.id!==obstacle.id).map(x=>x.id),
    killingRemoved:null,officerPreserved:null}})];
 }));
 const control=threats.flatMap(t=>visible.filter(h=>h.tenGod==='식신').flatMap(helper=>{
  const obstacle=byId.get(t.roles.obstacle),controller=byId.get(t.roles.controller);
  if([obstacle.id,controller.id].includes(helper.id))return [];
  const e=get(helper,obstacle);
  if(!e)return [];
  const collateral=get(helper,controller);
  return [witness(controlId,{...t.roles,helper:helper.id},[e],
   {protectedRole:'officer',threatWitnessId:t.id,clearing:{method:'control',officerCollateralControl:collateral,
    officerContacts:partners(controller),remainingVisibleKillingIds:killers.filter(x=>x.id!==obstacle.id).map(x=>x.id),
    killingRemoved:null,officerPreserved:null}})];
 }));
 const extra=[rule(damageId,'damage',threats,prior.completeHour,['actual-mixing','officer-and-killing-relative-force']),
  rule(combineId,'rescue',combine,prior.completeHour,['combination-effective','competing-contacts-resolved','all-killing-reviewed','officer-preserved'],damageId),
  rule(controlId,'rescue',control,prior.completeHour,['food-effective','collateral-officer-control-resolved','all-killing-reviewed','officer-preserved'],damageId)];
 const rules=[...review.rules,...extra];
 // Conditional regulation support (V4) does not promote diagnostic status.
 const support=rules.some(r=>r.kind==='support'&&r.observed===true&&r.impact!=='conditional-regulation-not-confirmed-support'),damage=rules.some(r=>r.kind==='damage'&&r.observed===true),rescue=rules.some(r=>r.kind==='rescue'&&r.observed===true);
 const assistants=unique([...review.assistantCandidates.map(a=>a.occurrenceId),...combine.map(w=>w.roles.helper),...control.map(w=>w.roles.helper)]);
 return {...review,rules,status:!prior.completeHour?'partial':support&&damage?'support-and-damage-observed':damage?'damage-observed':support?'support-observed':'no-covered-witness',
  assistantCandidates:assistants.map(id=>({occurrenceId:id,role:'conditional-participant',confirmed:false})),rescueObserved:rescue?true:prior.completeHour?false:null};
}
