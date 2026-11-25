import {stemCombination} from '../../core/relations.js';
import {elementRelation} from '../../core/elements.js';
const directed=(a,b,kind)=>{const r=elementRelation(a,b);return r.direction==='left-to-right'&&r.type===kind;};
const slot=o=>o.layer==='visible'?'stem:'+o.position:'branch:'+o.position;
const unique=xs=>[...new Set(xs)].sort();
const witness=(rule,roles,edges,extra={})=>({id:rule+':'+Object.entries(roles).map(([k,v])=>k+'='+v).join('|'),roles,edges,...extra,effective:null});
const summary=(id,kind,witnesses,complete,unresolved,threatRuleId=null)=>({id,kind,threatRuleId,witnesses,
 observed:witnesses.length?true:complete?false:null,unresolvedConditions:unresolved,conditionResolved:false,effective:null});
const extend=(id,threat,helper,edges)=>witness(id,{...threat.roles,helper:helper.id},edges,{threatWitnessId:threat.id});
const edgeRef=e=>({from:e.from,to:e.to,kind:e.kind,edgeId:e.id,screen:e.screen??'formation-relation-only',blockers:[...e.blockers],effective:null});
export function reviewExtendedOutcome(prior,access,review){
 if(review.status==='out-of-scope')return review;
 const actors=prior.stemForce.occurrences,byId=new Map(actors.map(o=>[o.id,o]));
 const day=actors.find(o=>o.dayReference);
 const visible=actors.filter(o=>o.layer==='visible'&&!o.dayReference);
 const resources=visible.filter(o=>['정인','편인'].includes(o.tenGod));
 const groupEdges=new Map(access.edges.map(e=>[e.id,e]));
 const occurrenceEdges=new Map(prior.relativeForce.edges.map(e=>[e.id,e]));
 const extra=[];
 const rel=(edges,a,b,kind)=>{const e=edges.get(a+'>'+b);return e?.kind===kind?edgeRef(e):null;};
 if(review.family==='officer'){
  const damageId='officer-branch-output-damage',rescueId='officer-branch-resource-rescue';
  const threats=access.groups.flatMap(g=>{
   // Day produces group element; group controls the actual officer anchor.
   // Do not infer 식신 vs 상관 polarity for an aggregate.
   if(!directed(day.element,g.element,'generate'))return [];
   return review.anchorIds.flatMap(id=>{
    const target=byId.get(id),edge=target&&target.tenGod==='정관'?rel(groupEdges,g.id,id,'control'):null;
    return edge?[witness(damageId,{obstacle:g.id,target:id},[edge],{formationId:g.formationId,threatWitnessId:null})]:[];
   });
  });
  const rescues=threats.flatMap(t=>resources.flatMap(h=>{
   if(h.id===t.roles.target)return [];
   const e=rel(groupEdges,h.id,t.roles.obstacle,'control');
   return e?[extend(rescueId,t,h,[e])]:[];
  }));
  extra.push(summary(damageId,'damage',threats,prior.completeHour,['group-transformation','group-output-effective','officer-damaged']),
   summary(rescueId,'rescue',rescues,prior.completeHour,['resource-effective','group-pressure-regulated','officer-preserved'],damageId));
 }
 if(review.family==='blade'){
  const damageId='blade-hidden-controller-damage',combineId='blade-hidden-controller-combine-output',controlId='blade-hidden-controller-resource-control';
  const controllers=access.hidden.filter(o=>['정관','편관'].includes(o.tenGod));
  const outputs=visible.filter(o=>['식신','상관'].includes(o.tenGod));
  const threats=controllers.flatMap(c=>outputs.flatMap(o=>{
   const controller=byId.get(c.id);
   const a=rel(occurrenceEdges,controller.id,day.id,'control'),b=rel(occurrenceEdges,o.id,controller.id,'control');
   if(!a||!b||new Set([slot(day),slot(controller),slot(o)]).size!==3)return [];
   return [witness(damageId,{target:day.id,controller:controller.id,obstacle:o.id},[a,b],{controllerAccessId:c.id,threatWitnessId:null})];
  }));
  const combines=threats.flatMap(t=>resources.flatMap(h=>{
   const o=byId.get(t.roles.obstacle);
   if(h.id===o.id||!stemCombination(h.stem,o.stem))return [];
   const partners=a=>actors.filter(b=>b.layer==='visible'&&a.id!==b.id&&stemCombination(a.stem,b.stem)).map(b=>b.id).sort();
   return [extend(combineId,t,h,[{from:h.id,to:o.id,kind:'combine',edgeId:null,screen:'combination-effect-unresolved',
    contact:{fromPartners:partners(h),toPartners:partners(o)},effective:null}])];
  }));
  const controls=threats.flatMap(t=>resources.flatMap(h=>{
   const e=rel(occurrenceEdges,h.id,t.roles.obstacle,'control');
   return e?[extend(controlId,t,h,[e])]:[];
  }));
  extra.push(summary(damageId,'damage',threats,prior.completeHour,['hidden-controller-access','controller-effective','output-damages-controller']),
   summary(combineId,'rescue',combines,prior.completeHour,['hidden-controller-access','combination-effective','controller-preserved'],damageId),
   summary(controlId,'rescue',controls,prior.completeHour,['hidden-controller-access','resource-effective','controller-preserved'],damageId));
 }
 if(!extra.length)return review;
 const rules=[...review.rules,...extra],support=rules.some(r=>r.kind==='support'&&r.observed===true),damage=rules.some(r=>r.kind==='damage'&&r.observed===true),rescue=rules.some(r=>r.kind==='rescue'&&r.observed===true);
 const assistants=unique([...review.assistantCandidates.map(a=>a.occurrenceId),...extra.filter(r=>r.kind==='rescue').flatMap(r=>r.witnesses.map(w=>w.roles.helper))]);
 return {...review,rules,status:!prior.completeHour?'partial':support&&damage?'support-and-damage-observed':damage?'damage-observed':support?'support-observed':'no-covered-witness',
  assistantCandidates:assistants.map(id=>({occurrenceId:id,role:'conditional-participant',confirmed:false})),
  rescueObserved:rescue?true:prior.completeHour?false:null};
}
