import { stemInfo } from '../../core/elements.js';
const ELEMENTS=['wood','fire','earth','metal','water'];
// Comparison is not a vote. A pattern anchor and an effective assistant
// are different roles, and an unlisted balance candidate is not a 忌神.
export function compareFiveMethods(prior,pattern){
 const {balance,mediation,remedy}=prior.review.methods;
 const climate=prior.sourceReview;
 const occurrences=new Map((pattern.routeReview?.occurrences??[]).map(x=>[x.id,x]));
 const candidates=pattern.selection?.candidates??[];
 const quality=pattern.qualityReview?.reviews??[];
 const methods=[
  {id:'balance',status:balance.status,meaning:'conditional-balance-direction',selectionAuthority:false},
  {id:'climate',status:climate.climate.status,meaning:'seasonal-source-requirements',selectionAuthority:false},
  {id:'pattern',status:pattern.status,meaning:'month-pattern-anchor-and-assistant-hypotheses',selectionAuthority:false},
  {id:'mediation',status:mediation.status,meaning:'potential-mediator',selectionAuthority:false},
  {id:'remedy',status:remedy.status,meaning:'potential-obstruction-remedy',selectionAuthority:false}
 ];
 const elements=ELEMENTS.map(element=>{
  const balanceBranches=balance.branches.map(b=>({direction:b.assumedDirection,
   candidate:b.candidates.some(c=>c.element===element)}));
  const climateRequirements=climate.candidates.flatMap(c=>{
   const stems=c.stems.filter(s=>stemInfo(s).element===element);
   return stems.length?[{candidateId:c.id,kind:c.kind,stems,conditionResolved:false}]:[];
  });
  const patternAnchors=candidates.flatMap(c=>{
   const stems=c.stems.filter(s=>stemInfo(s).element===element);
   return stems.length?[{candidateId:c.id,kind:c.kind,stems,role:'pattern-anchor-not-favorable-element'}]:[];
  });
  const patternAssistants=quality.flatMap(q=>q.routes.flatMap(r=>r.assistantIds.filter(id=>occurrences.get(id)?.element===element)
   .map(id=>({candidateId:q.candidateId,routeId:r.routeId,occurrenceId:id,stem:occurrences.get(id).stem,role:'structural-assistant'}))));
  const mediationPaths=mediation.pairs.filter(p=>p.via===element).map(p=>({from:p.from,to:p.to,
   robustTopTwo:p.nominalConfrontation?.robustTopTwo??null,reviewStatus:p.reviewStatus??null}));
  const remedyPaths=remedy.motifs.flatMap((m,i)=>m.remedyElement===element?[{motifIndex:i,targetContext:{...m.targetContext},
   presentRemedy:m.remedies.length>0,desirableTargetConfirmed:false}]:[]);
  return {element,balanceBranches,climateRequirements,patternAnchors,patternAssistants,mediationPaths,remedyPaths,
   favorable:null,unfavorable:null,selectionAuthority:false};
 });
 // These pairwise comparisons only contrast candidate membership under
 // a particular ordinary-chart direction; they do not assert contradiction.
 const comparisons=balance.branches.map(b=>{
  const set=new Set(b.candidates.map(c=>c.element));
  const compare=(items)=>({overlap:items.filter(e=>set.has(e)),outsideBalanceCandidates:items.filter(e=>!set.has(e))});
  return {assumedDirection:b.assumedDirection,
   climateBaseline:compare(elements.filter(e=>e.climateRequirements.some(c=>c.kind==='baseline-group')).map(e=>e.element)),
   climateConditional:compare(elements.filter(e=>e.climateRequirements.some(c=>c.kind==='conditional-alternative')).map(e=>e.element)),
   patternAssistants:compare(elements.filter(e=>e.patternAssistants.length).map(e=>e.element)),
   mediationRobust:compare(elements.filter(e=>e.mediationPaths.some(p=>p.robustTopTwo===true)).map(e=>e.element)),
   remedyObserved:compare(elements.filter(e=>e.remedyPaths.some(p=>p.presentRemedy)).map(e=>e.element)),
   // Pattern anchor identity deliberately excluded: not the same semantics.
   comparisonMeans:'candidate-membership-only'};
 });
 return {methods,elements,comparisons,ordinaryChartAssumption:true,
  decision:{status:pattern.status==='unavailable'?'unavailable':'withheld',reasons:[
   'special-pattern-not-assessed','pattern-selection-unvalidated','effective-force-unresolved','source-conditions-unresolved',
   'no-validated-cross-method-precedence','favorable-unfavorable-unvalidated'],
   usefulElement:null,favorableElements:null,unfavorableElements:null,ranking:null,score:null,confirmed:false,selectionAuthority:false}};
}
