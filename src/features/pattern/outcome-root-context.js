import {compareForceProfiles} from '../../core/relative-force.js';
const uniq=xs=>[...new Set(xs)].sort();
const observed=(xs,complete)=>xs.length?true:complete?false:null;
const ROOT_SOURCE='https://luckclub.cn/bazi/002/008/';
const CLASH_SOURCE='https://changxianyi.com/guji/ziping/wz-20260914/chapter-008/';
// Only literal six harmony or a complete three-harmony is a candidate for
// the source's clash-relief clause. Do not grant relief or allocate partners.
export function observeClashAlternatives(formation){
 const branches=formation.formations.filter(f=>f.layer==='branch'),clashes=formation.clashes;
 return clashes.map(c=>{
  const alternatives=branches.filter(f=>['six-harmony','complete-three'].includes(f.classification)&&f.flags.structurallyComplete&&
   f.positions.filter(p=>c.positions.includes(p)).length===1).map(f=>{
    const participants=f.positions,shared=participants.filter(p=>c.positions.includes(p))[0];
    const otherClashes=clashes.filter(x=>x.id!==c.id&&x.positions.some(p=>participants.includes(p)));
    const competitors=branches.filter(g=>g.id!==f.id&&g.flags.structurallyComplete&&g.positions.some(p=>participants.includes(p))&&g.positions.some(p=>!participants.includes(p)));
    const remainingClashes=clashes.filter(x=>x.id!==c.id&&x.positions.some(p=>c.positions.includes(p)));
    return {formationId:f.id,sharedPosition:shared,otherClashIds:uniq(otherClashes.map(x=>x.id)),
     remainingClashIds:uniq(remainingClashes.map(x=>x.id)),competingFormationIds:uniq(competitors.map(x=>x.id)),
     hypothesis:!formation.completeHour?'partial':otherClashes.length||competitors.length||remainingClashes.length?'competing-relief-review':'relief-contact-review',
     reliefConfirmed:null};
   });
  return {clashId:c.id,positions:[...c.positions],alternatives,reliefConfirmed:null};
 });
}
export function observeRootContext(prior,formation){
 const complete=prior.completeHour,base={version:'root-context-review-v1',completeHour:complete,selectionAuthority:false,rootEffectConfirmed:null,
  sources:{roots:ROOT_SOURCE,clash:CLASH_SOURCE}};
 const invalid=()=>({...base,status:'invalid-evidence',clashes:[],slots:[],occurrences:[],comparisons:[]});
 if(!formation||formation.completeHour!==complete)return invalid();
 const actors=prior.stemForce.occurrences,profiles=prior.relativeForce.profiles;
 if(new Set(actors.map(o=>o.id)).size!==actors.length||new Set(formation.clashes.map(c=>c.id)).size!==formation.clashes.length||
  new Set(formation.formations.map(f=>f.id)).size!==formation.formations.length)return invalid();
 const hidden=actors.filter(o=>o.layer==='hidden'),visible=actors.filter(o=>o.layer==='visible');
 const clashRows=observeClashAlternatives(formation),branch=formation.formations.filter(f=>f.layer==='branch');
 const byId=new Map(hidden.map(o=>[o.id,o]));
 const slots=hidden.map(h=>{
  const c=clashRows.filter(x=>x.positions.includes(h.position));
  const f=branch.filter(x=>x.positions.includes(h.position));
  const competing=f.filter(x=>x.flags.structurallyComplete&&x.target!=null&&x.target!==h.element);
  const exact=visible.filter(v=>v.stem===h.stem),same=visible.filter(v=>v.element===h.element&&v.stem!==h.stem);
  const unexposed=c.length===0&&competing.length===0;
  const state=c.length?'clash-exposed':competing.length?'formation-contested':h.hiddenRole==='residual'?'residual-context':'uncontested-substantial-observation';
  return {id:h.id,position:h.position,stem:h.stem,element:h.element,role:h.hiddenRole,clashIds:c.map(x=>x.clashId),
   reliefFormationIds:uniq(c.flatMap(x=>x.alternatives.map(a=>a.formationId))),formationIds:f.map(x=>x.id),
   competingTargetFormationIds:competing.map(x=>x.id),
   exactProjectionIds:exact.filter(v=>!v.dayReference).map(v=>v.id),dayReferenceMatches:exact.some(v=>v.dayReference),
   sameElementOtherStemIds:same.filter(v=>!v.dayReference).map(v=>v.id),state,
   independentAccessHypothesis:!complete?'partial':!unexposed?'disruption-review':exact.some(v=>!v.dayReference)?'exact-projection-context':h.hiddenRole==='residual'?'residual-context':'local-constituent-context',
   effectiveRoot:null,accessConfirmed:null,independentSupplyConfirmed:null};
 });
 const slotMap=new Map(slots.map(s=>[s.id,s]));
 const occurrences=[];
 for(const o of actors){
  const p=profiles[o.id];
  if(!p||p.occurrenceId!==o.id||!Array.isArray(o.roots))return invalid();
  const roots=[];
  for(const r of o.roots){
   const id='hidden:'+r.position+':'+r.stem,h=byId.get(id),s=slotMap.get(id);
   if(!h||h.element!==o.element||h.hiddenRole!==r.role||r.match!==(r.stem===o.stem?'exact-stem':'same-element')||
    r.clashExposed!==(s.clashIds.length>0))return invalid();
   roots.push({id,position:r.position,match:r.match,role:r.role,state:s.state});
  }
  if(new Set(roots.map(r=>r.id)).size!==roots.length)return invalid();
  const substantial=roots.filter(r=>r.role!=='residual'),uncontested=substantial.filter(r=>r.state==='uncontested-substantial-observation');
  const contested=substantial.filter(r=>r.state!=='uncontested-substantial-observation');
  const axis=predicate=>uncontested.some(predicate)?true:contested.some(predicate)||!complete?null:false;
  // This is a sensitivity profile, not a replacement for the frozen core.
  // Unknown disrupted roots are not silently counted as absent.
  const rootAxes={exactSubstantial:axis(r=>r.match==='exact-stem'),anySubstantial:axis(()=>true),
   ownPillarSubstantial:axis(r=>r.position===o.position),monthSubstantial:axis(r=>r.position==='month')};
  const axes={...p.axes,...rootAxes};
  const principal=p.axes.principalSupport,season=p.axes.seasonSupport;
  const monthContested=slots.some(s=>s.position==='month'&&(s.clashIds.length||s.competingTargetFormationIds.length));
  const contexts=[];
  if((principal||season)&&rootAxes.anySubstantial!==true)contexts.push('season-support-with-root-access-unresolved-or-absent');
  if(!principal&&!season&&rootAxes.anySubstantial===true)contexts.push('root-observed-without-season-support');
  if(principal!==season)contexts.push('month-principal-season-disagreement');
  if(monthContested)contexts.push('month-branch-contact-review');
  if(contested.length)contexts.push('contested-root-supply');
  if(o.layer==='hidden')contexts.push('hidden-access-not-visible-force');
  occurrences.push({id:o.id,layer:o.layer,roots,uncontestedRootIds:uncontested.map(r=>r.id),contestedRootIds:contested.map(r=>r.id),
   rootAxes,seasonal:{principalSupport:principal,seasonSupport:season,monthCommandResolved:false,monthBranchContested:monthContested},
   sensitivityAxes:axes,contexts,rootPreservedConfirmed:null,excessConfirmed:null,deficiencyConfirmed:null});
 }
 const byOccurrence=new Map(occurrences.map(o=>[o.id,o])),comparisons=[];
 for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){
  const a=visible[i],b=visible[j],p=profiles[a.id],q=profiles[b.id];
  const ap=byOccurrence.get(a.id),bp=byOccurrence.get(b.id);
  const cmp=(x,y)=>compareForceProfiles(x,y,{completeHour:complete,comparable:a.position!==b.position});
  const sensitivity=cmp({...p,axes:ap.sensitivityAxes},{...q,axes:bp.sensitivityAxes});
  const localAxes=x=>Object.fromEntries(Object.entries(x).filter(([k])=>!['principalSupport','seasonSupport'].includes(k)));
  const nonseason=cmp({...p,axes:localAxes(ap.sensitivityAxes)},{...q,axes:localAxes(bp.sensitivityAxes)});
  const seasonOnly=cmp({...p,axes:{principalSupport:p.axes.principalSupport,seasonSupport:p.axes.seasonSupport}},
   {...q,axes:{principalSupport:q.axes.principalSupport,seasonSupport:q.axes.seasonSupport}});
  const original=cmp(p,q);
  comparisons.push({left:a.id,right:b.id,original,sensitivity,nonseason,seasonOnly,
   disposition:!complete?'partial':sensitivity.relation==='unresolved'?'root-access-unresolved':nonseason.relation!==seasonOnly.relation?'season-local-evidence-differ':'same-direction-or-profile',
   forceComparison:null});
 }
 return {...base,status:complete?'diagnostic':'partial',clashes:clashRows,slots,occurrences,comparisons,
  limitations:['no-root-erasure','no-automatic-clash-relief','uncontested-observation-not-confirmed-preservation','no-hidden-independent-force','sensitivity-not-calibrated-strength']};
}
