import {elementRelation} from '../../core/elements.js';
import {stemCombination} from '../../core/relations.js';
const slot=o=>o.position+':'+o.layer;
const distinct=xs=>new Set(xs.map(slot)).size===xs.length;
const unique=xs=>[...new Set(xs)].sort();
const W=['정재','편재'],I=['정인','편인'],E=['식신','상관'];
const directed=(a,b,kind)=>{const r=elementRelation(a.element,b.element);return r.type===kind&&r.direction==='left-to-right';};
const relationRef=e=>({from:e.from,to:e.to,kind:e.kind,edgeId:e.id,screen:e.screen,blockers:[...e.blockers],effective:null});
const evidence=(id,roles,edges,anchorBindings,extra={})=>({
 id:id+':'+Object.entries(roles).map(([k,v])=>k+'='+v).join('|'),
 roles,edges,anchorBindings,...extra,effective:null
});
const rule=(id,kind,witnesses,complete,conditions,impact,threatRuleId=null)=>({
 id,kind,threatRuleId,witnesses,observed:witnesses.length?true:complete?false:null,
 unresolvedConditions:conditions,impact,conditionResolved:false,effective:null
});
// A family anchor establishes scope, not an independent participant in every
// causal relation. Explicit aliases and same-branch context never create edges.
export function reviewSecondaryOutcome(prior,access,review){
 if(review.status==='out-of-scope'||!['wealth','resource','officer'].includes(review.family))return review;
 const actors=prior.stemForce.occurrences,byId=new Map(actors.map(o=>[o.id,o]));
 const edges=new Map(prior.relativeForce.edges.map(e=>[e.id,e]));
 const hidden=new Map(access.hidden.map(o=>[o.id,o]));
 const visible=actors.filter(o=>o.layer==='visible'&&!o.dayReference);
 const officers=actors.filter(o=>!o.dayReference&&o.tenGod==='정관');
 const anchors=review.anchorIds.map(id=>byId.get(id)).filter(Boolean);
 const find=(a,b,kind)=>{const e=edges.get(a.id+'>'+b.id);return e?.kind===kind?relationRef(e):null;};
 const bindings=target=>anchors.flatMap(a=>{
  if(a.id===target.id)return []; // secondary target must not equal anchor
  const from=review.family==='wealth'?a:target,to=review.family==='wealth'?target:a;
  if(!directed(from,to,'generate'))return [];
  const edge=find(from,to,'generate');
  if(edge)return [{anchorId:a.id,targetId:target.id,basis:'directed-generation',edge,independentSlots:true,effective:null}];
  if(a.layer==='hidden'&&target.layer==='hidden'&&a.position===target.position)
   return [{anchorId:a.id,targetId:target.id,basis:'same-branch-constituent-context',edge:null,independentSlots:false,effective:null}];
  return [];
 });
 const contact=(a,b)=>{
  if(a.layer!=='visible'||b.layer!=='visible'||!stemCombination(a.stem,b.stem))return null;
  const partners=x=>actors.filter(y=>y.layer==='visible'&&y.id!==x.id&&stemCombination(x.stem,y.stem)).map(y=>y.id).sort();
  return {from:a.id,to:b.id,kind:'combine',edgeId:null,screen:'combination-effect-unresolved',
   contact:{fromPartners:partners(a),toPartners:partners(b)},effective:null};
 };
 const extra=[];
 if(['wealth','resource'].includes(review.family)){
  const prefix=review.family+'-secondary-officer',damageId=prefix+'-damage',rescueId=prefix+'-resource-rescue';
  const threats=officers.flatMap(target=>{
   const anchorBindings=bindings(target);
   if(!anchorBindings.length)return [];
   return visible.filter(o=>E.includes(o.tenGod)).flatMap(obstacle=>{
    const edge=find(obstacle,target,'control');
    if(!edge||!distinct([target,obstacle]))return [];
    return [evidence(damageId,{target:target.id,obstacle:obstacle.id},[edge],anchorBindings,
     {protectedRole:'secondary-officer',targetAccessId:hidden.has(target.id)?target.id:null,threatWitnessId:null})];
   });
  });
  const rescues=threats.flatMap(t=>visible.filter(h=>I.includes(h.tenGod)).flatMap(helper=>{
   const target=byId.get(t.roles.target),obstacle=byId.get(t.roles.obstacle);
   if(!distinct([target,obstacle,helper]))return [];
   const e=find(helper,obstacle,'control');
   if(!e)return [];
   // A projected resource anchor may itself protect the officer. Record
   // this identity; do not manufacture a second copy of the same stem.
   return [evidence(rescueId,{...t.roles,helper:helper.id},[e],t.anchorBindings,
    {protectedRole:t.protectedRole,targetAccessId:t.targetAccessId,threatWitnessId:t.id,
     helperAnchorAlias:anchors.some(a=>a.id===helper.id)})];
  }));
  extra.push(rule(damageId,'damage',threats,prior.completeHour,['secondary-officer-relevant','output-effective','hidden-access-if-applicable'],'secondary-role-injury'),
   rule(rescueId,'rescue',rescues,prior.completeHour,['resource-effective','officer-preserved','family-anchor-preserved'],'secondary-role-protection',damageId));
 }else{
  // 財印相合: the support relationship may be impaired, but the officer
  // is not the object of this combination. Keep both support links explicit.
  const id='officer-wealth-resource-support-loss';
  const witnesses=anchors.filter(a=>a.tenGod==='정관').flatMap(target=>
   visible.filter(a=>W.includes(a.tenGod)).flatMap(wealth=>
    visible.filter(a=>I.includes(a.tenGod)).flatMap(resource=>{
     if(!distinct([target,wealth,resource]))return [];
     const a=find(wealth,target,'generate'),b=find(target,resource,'generate'),c=contact(wealth,resource);
     if(!a||!b||!c)return [];
     return [evidence(id,{target:target.id,wealth:wealth.id,resource:resource.id},[a,b,c],
      [{anchorId:target.id,targetId:target.id,basis:'target-is-anchor',edge:null,independentSlots:false,effective:null}],
      {protectedRole:'pattern-officer',affectedSupportRoles:['wealth','resource'],directTargetInjury:null,threatWitnessId:null})];
    })));
  extra.push(rule(id,'damage',witnesses,prior.completeHour,['combination-effective','wealth-support-lost','resource-protection-lost'],'support-loss-not-direct-injury'));
 }
 const rules=[...review.rules,...extra],support=rules.some(r=>r.kind==='support'&&r.observed===true),damage=rules.some(r=>r.kind==='damage'&&r.observed===true),rescue=rules.some(r=>r.kind==='rescue'&&r.observed===true);
 const assistants=unique([...review.assistantCandidates.map(a=>a.occurrenceId),...extra.filter(r=>r.kind==='rescue').flatMap(r=>r.witnesses.map(w=>w.roles.helper))]);
 return {...review,rules,status:!prior.completeHour?'partial':support&&damage?'support-and-damage-observed':damage?'damage-observed':support?'support-observed':'no-covered-witness',
  assistantCandidates:assistants.map(id=>({occurrenceId:id,role:'conditional-participant',confirmed:false})),rescueObserved:rescue?true:prior.completeHour?false:null};
}
