import { elementRelation } from '../../core/elements.js';
const ELEMENTS=['wood','fire','earth','metal','water'];
// The relations below are conditional on an anchor being useful. They are
// not favorable/unfavorable classifications; an excessive or obstructed
// anchor can need an entirely different treatment.
export function describeAnchorRelations(anchor){
 if(!ELEMENTS.includes(anchor))throw Error('invalid useful-element anchor');
 return ELEMENTS.map(element=>{
  const r=elementRelation(element,anchor);
  const relation=r.type==='same'?'same-element':r.type==='generate'?
   r.direction==='left-to-right'?'generates-anchor':'generated-by-anchor':
   r.direction==='left-to-right'?'controls-anchor':'controlled-by-anchor';
  return {element,relation,favorable:null,unfavorable:null};
 });
}
export function collectAuthorityReview(review){
 const {balance,climate,mediation,remedy}=review.methods;
 const ready=balance.status!=='unavailable'&&climate.status==='diagnostic';
 const source=climate.evidence?.sourceProfile??null;
 const seasonal=climate.evidence?.seasonal.candidate??null;
 const methodScopes=[
  {method:'balance',status:balance.status,selectionAuthority:false,reason:'unvalidated-candidate-selection'},
  {method:'seasonal-cue',status:seasonal?'cue-observed':'no-cue',selectionAuthority:false,reason:'heat-moisture-unresolved'},
  {method:'seasonal-source',status:source?'profile-observed':'source-cell-unavailable',selectionAuthority:false,reason:'source-qualifiers-and-scope-unresolved'},
  {method:'mediation',status:mediation.status,selectionAuthority:false,reason:'effective-mediation-unconfirmed'},
  {method:'disease-remedy',status:remedy.status,selectionAuthority:false,reason:'desirable-target-unresolved'}
 ];
 const branches=review.comparisons.map(b=>{
  const prior=balance.branches.find(x=>x.assumedDirection===b.assumedDirection);
  if(!prior)throw Error('missing balance hypothesis');
  const anchors=new Map();
  function add(element,origin){
   if(!anchors.has(element))anchors.set(element,[]);
   anchors.get(element).push(origin);
  }
  for(const c of prior.candidates)add(c.element,{method:'balance',category:c.category});
  if(seasonal)add(seasonal.element,{method:'seasonal-cue'});
  for(const [i,g] of (source?.groups??[]).entries())for(const s of g)add(s.element,{method:'seasonal-source',group:i+1,stem:s.stem});
  for(const p of mediation.pairs.filter(p=>p.nominalConfrontation?.robustTopTwo))add(p.via,{method:'mediation',from:p.from,to:p.to,status:p.reviewStatus});
  // Remedy motifs have no established desirable target. They are observations,
  // not eligible anchors. Source conditional alternatives are also not anchors.
  const hypotheses=ELEMENTS.filter(e=>anchors.has(e)).map(element=>({element,origins:anchors.get(element),
   relations:describeAnchorRelations(element),selectionAuthority:false,confirmed:false}));
  const opposite=b.comparisons.seasonal==='opposite-tendency'||(b.comparisons.sourceFirstGroup?.oppositeTendency.length??0)>0||
   b.comparisons.mediation.some(p=>p.comparison==='opposite-tendency');
  return {assumedDirection:b.assumedDirection,hypotheses,oppositeTendencyObserved:opposite,
   reasons:['special-pattern-not-assessed','no-validated-method-precedence','no-validated-anchor-selection',
    ...(balance.strength?.direction===null?['strength-unresolved']:[]),...(opposite?['opposite-method-tendencies']:[])],
   selectedElement:null,favorableElements:null,unfavorableElements:null,confirmed:false};
 });
 return {status:ready?'withheld':review.status,methodScopes,branches,selectionAuthority:false,
  usefulElement:null,favorableElements:null,unfavorableElements:null,confirmed:false};
}
