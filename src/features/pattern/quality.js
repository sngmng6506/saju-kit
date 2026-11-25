import { elementRelation } from '../../core/elements.js';
const ORDER=['year','month','day','hour'];
const supports=(a,b)=>{const r=elementRelation(a,b);return r.type==='same'||r.type==='generate'&&r.direction==='left-to-right';};
const controls=(a,b)=>{const r=elementRelation(a,b);return r.type==='control'&&r.direction==='left-to-right';};
const source='https://www.donglishuzhai.net/chapter/3725.html';
const orderSource='https://donglishuzhai.net/chapter/3733.html';
// These are explicitly scoped source examples, not universal order rules.
// A positive orientation records the source's favorable structural example,
// not a prediction of a favorable life outcome.
const orderExamples=[
 {id:'jia-you-wealth-hurting',day:'갑',month:'유',family:'officer',first:'정',second:'무',section:'officer'},
 {id:'jia-zi-wealth-resource',day:'갑',month:'자',family:'resource',first:'기',second:'계',section:'resource'},
 {id:'ren-yin-owl-wealth',day:'임',month:'인',family:'food',first:'경',second:'병',section:'food'},
 {id:'ji-mao-wealth-food',day:'기',month:'묘',family:'killing',first:'계',second:'신',section:'killing'}
];
export function observeSourceOrder(dayStem,monthBranch,occurrences,completeHour){
 const visible=occurrences.filter(x=>x.layer==='visible'&&!x.dayReference);
 return orderExamples.filter(x=>x.day===dayStem&&x.month===monthBranch).map(x=>{
  const first=visible.filter(v=>v.stem===x.first),second=visible.filter(v=>v.stem===x.second);
  const pairs=first.flatMap(a=>second.map(b=>({first:a.id,second:b.id,
   orientation:ORDER.indexOf(a.position)<ORDER.indexOf(b.position)?'source-preferred-order':'source-reversed-order'})));
  return {...x,source:orderSource,pairs,status:pairs.length?'observed':completeHour?'not-observed':'unresolved',
   interpretationConfirmed:false};
 });
}
function endpoint(x,month,completeHour){
 const roots=x.layer==='visible'?x.roots:[{position:x.position,stem:x.stem,role:x.role,match:'exact-stem',clashExposed:x.clashExposed}];
 const substantial=roots.filter(r=>r.role!=='residual');
 const nonClashed=substantial.filter(r=>!r.clashExposed);
 // Positive observed roots are not necessarily intact or effective;
 // an unknown hour prevents a global absence conclusion.
 return {id:x.id,layer:x.layer,stem:x.stem,tenGod:x.tenGod,
  exactSubstantialRoots:substantial.filter(r=>r.match==='exact-stem').map(r=>r.position),
  sameElementSubstantialRoots:substantial.filter(r=>r.match!=='exact-stem').map(r=>r.position),
  unclashedSubstantialRootObserved:nonClashed.length?true:completeHour?false:null,
  clashExposedRoots:roots.filter(r=>r.clashExposed).map(r=>r.position),
  monthPrincipalSupports:supports(month.principalElement,x.element),
  lifeStageNotEvaluated:true,effectiveForce:null};
}
const slot=x=>x.position+':'+x.layer;
// Explicit obstacle links are required, not just a reference to any anchor.
function rescueTargets(routeId,actors,anchor){
 if(routeId==='combine-killing-preserve-officer')return actors.filter(a=>a.tenGod==='정관');
 if(routeId==='combine-resource-preserve-food'||routeId==='wealth-controls-resource')return actors.filter(a=>a.tenGod==='식신');
 if(routeId==='food-controls-killing')return actors.filter(a=>a.tenGod==='정관');
 return anchor;
}
function threatRelation(routeId,obstacle,target){
 if(['combine-killing-preserve-officer','food-controls-killing'].includes(routeId))return obstacle.tenGod==='편관'&&target.tenGod==='정관'?'officer-killing-coexistence':null;
 if(routeId==='combine-killing-preserve-wealth'){
  const r=elementRelation(target.element,obstacle.element);
  return r.type==='generate'&&r.direction==='left-to-right'?'wealth-generates-killing':null;
 }
 return controls(obstacle.element,target.element)?'controls-target':null;
}
export function observeRouteQuality(prior,structure,interaction){
 const rr=prior.routeReview,actors=rr.occurrences.filter(x=>!x.dayReference),byId=new Map(rr.occurrences.map(x=>[x.id,x]));
 const endpoints=Object.fromEntries(rr.occurrences.map(x=>[x.id,endpoint(x,structure.month,structure.completeHour)]));
 const combinations=interaction.formations.filter(f=>f.type==='stem.combine');
 const visible=rr.occurrences.filter(x=>x.layer==='visible');
 const combinationContacts=x=>x.layer==='visible'?combinations.filter(f=>f.positions.includes(x.position)).map(f=>f.id):[];
 const reviews=rr.reviews.map(r=>{
  const anchor=r.anchorIds.map(id=>byId.get(id));
  return {candidateId:r.candidateId,routes:r.routes.map(route=>{
   const links=route.links.map(l=>{
    const a=byId.get(l.from),b=byId.get(l.to);
    const between=visible.filter(x=>ORDER.indexOf(x.position)>Math.min(ORDER.indexOf(a.position),ORDER.indexOf(b.position))&&ORDER.indexOf(x.position)<Math.max(ORDER.indexOf(a.position),ORDER.indexOf(b.position)));
    const directedFrom=['generated-by-anchor','controlled-by-anchor'].includes(l.kind)?b:a;
    const interveningControls=between.filter(x=>controls(x.element,directedFrom.element)).map(x=>x.id);
    const rescueWitnesses=route.kind==='rescue'?rescueTargets(route.id,actors,anchor).flatMap(target=>{
     if(new Set([slot(a),slot(b),slot(target)]).size!==3)return [];
     const relation=threatRelation(route.id,b,target);
     return relation?[{target:target.id,obstacle:b.id,helper:a.id,relation,effective:null}]:[];
    }):[];
    return {from:l.from,to:l.to,kind:l.kind,span:l.span,distinctSlots:slot(a)!==slot(b),bothVisible:a.layer==='visible'&&b.layer==='visible',
     intervening:between.map(x=>x.id),interveningControls,fromCombinations:combinationContacts(a),toCombinations:combinationContacts(b),
     rescueWitnesses,forceConfirmed:null,affinityConfirmed:null};
   });
   const structuralLinks=links.filter(l=>l.distinctSlots&&(route.kind!=='rescue'||l.rescueWitnesses.length>0));
   return {routeId:route.id,kind:route.kind,links,qualifiedStructuralLinks:structuralLinks.length,
    structurallySupported:structuralLinks.length?true:structure.completeHour?false:null,
    assistantIds:route.kind==='damage'?[]:[...new Set(structuralLinks.map(l=>l.from))],
    affinity:null,force:null,effectConfirmed:false};
  }),formed:null,broken:null,rescued:null,assistantGod:null,selectionAuthority:false};
 });
 return {source,sourceOrder:observeSourceOrder(structure.dayMaster.stem,structure.month.branch,rr.occurrences,structure.completeHour),
  endpoints,reviews,affinityConfirmed:null,forceConfirmed:null,selectionAuthority:false};
}
