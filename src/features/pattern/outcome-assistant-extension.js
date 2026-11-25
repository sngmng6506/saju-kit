import {stemCombination} from '../../core/relations.js';
import {stemInfo,elementRelation} from '../../core/elements.js';
const SOURCE='https://www.chenshupaipan.com/books/5/3884.html';
const ORDER=['year','month','day','hour'];
const unique=xs=>[...new Set(xs)].sort();
const ref=(r,w)=>({ruleId:r.id,witnessId:w.id});
const observed=(xs,complete)=>xs.length?true:complete?false:null;
const directed=(a,b,kind)=>{const r=elementRelation(a,b);return r.type===kind&&r.direction==='left-to-right';};
const makeRule=(id,kind,witnesses,complete,conditions,threatRuleId=null)=>({id,kind,witnesses,observed:observed(witnesses,complete),threatRuleId,
 unresolvedConditions:conditions,source:SOURCE,conditionResolved:false,effective:null});
const witness=(id,roles,edges,extra={})=>({id:id+':'+Object.entries(roles).map(([k,v])=>k+'='+v).join('|'),roles,edges,...extra,effective:null});
const stemActors=saju=>ORDER.filter(p=>saju.pillars[p]).map(p=>({id:'visible:'+p,position:p,stem:saju.pillars[p].stem,element:stemInfo(saju.pillars[p].stem).element}));
function combination(a,b,actors){
 if(!a||!b||a.id===b.id||!stemCombination(a.stem,b.stem))return null;
 const partners=x=>actors.filter(y=>x.id!==y.id&&stemCombination(x.stem,y.stem)).map(y=>y.id).sort();
 return {from:a.id,to:b.id,kind:'combine',edgeId:null,screen:'combination-effect-unresolved',
  contact:{fromPartners:partners(a),toPartners:partners(b)},adjacent:Math.abs(ORDER.indexOf(a.position)-ORDER.indexOf(b.position))===1,effective:null};
}
// Add to copies of V9 reviews only; no new selection/strength authority.
export function extendAssistantRoutes(review,saju,access,complete){
 if(review.status==='out-of-scope')return review;
 const actors=stemActors(saju),visible=actors.filter(a=>a.position!=='day'),day=actors.find(a=>a.position==='day');
 const byId=new Map(actors.map(a=>[a.id,a])),extra=[];
 const rescueDefs={
  officer:[['officer-combine-hurting','officer-hurting','resource-combination-effective','officer-preserved']],
  killing:[['killing-combine-resource','killing-resource-blocks-food','resource-combination-effective','food-control-preserved']]
 };
 for(const [id,threatId,...conditions] of rescueDefs[review.family]??[]){
  const threats=review.rules.find(r=>r.id===threatId);
  const ws=(threats?.witnesses??[]).flatMap(t=>visible.flatMap(helper=>{
   if(Object.values(t.roles).includes(helper.id))return [];
   const obstacle=byId.get(t.roles.obstacle);
   // Officer rescue uses resource; killing rescue uses wealth. The exact
   // polarity follows from a real stem combination, not an element alias.
   const expected=review.family==='officer'?directed(helper.element,day.element,'generate'):directed(day.element,helper.element,'control');
   const e=expected?combination(helper,obstacle,actors):null;
   return e?[witness(id,{...t.roles,helper:helper.id},[e],{threatWitnessId:t.id})]:[];
  }));
  extra.push(makeRule(id,'rescue',ws,complete,[...conditions,'competing-combinations-resolved'],threatId));
 }
 if(review.family==='peer'&&review.anchorBasis==='day-reference-proxy'){
  // A month-including three-harmony changes the peer context only as a
  // hypothesis. Branch groups are never free stems or confirmed 化.
  const groups=access.groups.filter(g=>g.kind==='complete-three'&&g.includesMonth&&directed(day.element,g.element,'generate'));
  const edge=(a,b,kind)=>{const e=access.edges.find(e=>e.from===a&&e.to===b&&e.kind===kind);
   return e?{from:e.from,to:e.to,kind:e.kind,edgeId:e.id,screen:'formation-relation-only',blockers:[...e.blockers],effective:null}:null;};
  const wealthId='peer-group-output-wealth',outputId='peer-group-output-projection';
  const wealth=groups.flatMap(g=>visible.filter(v=>directed(day.element,v.element,'control')).flatMap(v=>{
   const a=edge(day.id,g.id,'generate'),b=edge(g.id,v.id,'generate');
   return a&&b?[witness(wealthId,{target:day.id,helper:g.id,wealth:v.id},[a,b],{formationId:g.formationId,groupId:g.id})]:[];
  }));
  const output=groups.flatMap(g=>visible.filter(v=>v.element===g.element).flatMap(v=>{
   const a=edge(day.id,g.id,'generate');
   // Projection is an observed same-element participant, not a causal edge.
   return a?[witness(outputId,{target:day.id,helper:g.id,projection:v.id},[a],{formationId:g.formationId,groupId:g.id,projectionConfirmed:null})]:[];
  }));
  extra.push(makeRule(wealthId,'support',wealth,complete,['group-transformation','wealth-generation-effective','peer-role-conversion']),
   makeRule(outputId,'support',output,complete,['group-transformation','projection-effective','peer-output-balance']));
 }
 if(!extra.length)return review;
 const rules=[...review.rules,...extra];
 const support=rules.some(r=>r.kind==='support'&&r.impact!=='conditional-regulation-not-confirmed-support'&&r.observed===true);
 const damage=rules.some(r=>r.kind==='damage'&&r.observed===true);
 const assistants=unique([...review.assistantCandidates.map(a=>a.occurrenceId),...extra.flatMap(r=>r.witnesses.map(w=>w.roles.helper))]);
 return {...review,rules,status:!complete?'partial':support&&damage?'support-and-damage-observed':damage?'damage-observed':support?'support-observed':'no-covered-witness',
  assistantCandidates:assistants.map(id=>({occurrenceId:id,role:'conditional-participant',confirmed:false})),
  rescueObserved:observed(rules.filter(r=>r.kind==='rescue'&&r.observed===true),complete)};
}
// A third stem combining with an actual rescue helper is an observed
// possible impairment; it does not cancel either combination/control.
export function observeAssistantCombinationInjury(review,compound,saju,complete){
 if(review.status==='out-of-scope'||compound.violations.length)return [];
 const actors=stemActors(saju),byId=new Map(actors.map(a=>[a.id,a]));
 const valid=compound.threatCoverage.flatMap(t=>t.alternatives.map(a=>({alternative:a,threat:t.threat})));
 return valid.flatMap(({alternative,threat})=>{
  const r=review.rules.find(r=>r.id===alternative.ruleId),w=r?.witnesses.find(w=>w.id===alternative.witnessId);
  const helper=byId.get(w?.roles.helper);
  if(!helper)return [];
  return actors.filter(a=>!Object.values(w.roles).includes(a.id)).flatMap(obstacle=>{
   const e=combination(obstacle,helper,actors);
   return e?[{assistantId:helper.id,obstacleId:obstacle.id,dayReferenceInvolved:obstacle.position==='day',
    rescue:ref(r,w),threat,contact:e,completeHour:complete,assistantInjuryConfirmed:null,rescueLost:null}]:[];
  });
 });
}
export function observeBranchAssistantDependencies(review,access,complete){
 if(review.status==='out-of-scope')return [];
 const groups=new Map(access.groups.map(g=>[g.id,g]));
 const rules=review.rules.filter(r=>r.kind==='support'&&['peer-group-output-wealth','peer-group-output-projection'].includes(r.id));
 // Alternative groups must support the same actual recipient/projection,
 // not simply share an element. Mask physical branch slots, not the stem.
 return rules.flatMap(r=>{
  const recipients=unique(r.witnesses.map(w=>w.roles.wealth??w.roles.projection));
  return recipients.map(recipient=>{
   const ws=r.witnesses.filter(w=>(w.roles.wealth??w.roles.projection)===recipient&&groups.has(w.groupId));
   const slots=unique(ws.flatMap(w=>groups.get(w.groupId).slots));
   return {ruleId:r.id,recipientId:recipient,alternatives:ws.map(w=>{
    const g=groups.get(w.groupId);
    return {witnessId:w.id,groupId:g.id,formationId:g.formationId,memberSlots:[...g.slots],members:[...g.members],
     supportingNonMonthSlots:g.slots.filter(s=>s!=='branch:month'),clashIds:[...g.clashIds],competingContacts:[...g.competingContacts],
     transformationConfirmed:null};
   }),branchMasks:slots.filter(s=>s!=='branch:month').map(slot=>{
    const lost=ws.filter(w=>groups.get(w.groupId).slots.includes(slot)),remaining=ws.filter(w=>!groups.get(w.groupId).slots.includes(slot));
    return {slot,lostWitnessIds:lost.map(w=>w.id),remainingWitnessIds:remaining.map(w=>w.id),
     allObservedAlternativesLost:lost.length>0&&remaining.length===0,necessityConfirmed:null};
   }),completeHour:complete,assistantConfirmed:null,necessityConfirmed:null};
  });
 });
}
