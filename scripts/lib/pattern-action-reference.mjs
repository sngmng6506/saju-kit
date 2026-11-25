// Reference labels belong to the cited author and interpretation, not empirical truth.
export const ACTION_REFERENCE_VERSION='pattern-action-reference-v1';
const states=['supported','limited','blocked'];
const scopes=['edge-effect','route-interpretation'];
const unique=xs=>[...new Set(xs)].sort();
export function inspectActionReferences(data,shen,xu){
 const errors=[],ids=new Set();
 const fail=(id,reason)=>errors.push({id,reason});
 if(data.version!==ACTION_REFERENCE_VERSION)fail('corpus','version');
 if(data.scope!=='source-interpretation-not-empirical-ground-truth'||data.annotationPasses!==1)fail('corpus','scope');
 for(const c of data.cases){
  if(ids.has(c.id))fail(c.id,'duplicate-id');ids.add(c.id);
  const source=c.author==='沈孝瞻'?shen:c.author==='徐樂吾'?xu:null;
  const chart=source?.cases.find(x=>x.id===c.chartId);
  if(!chart)fail(c.id,'unbound-chart');
  else {
   if(chart.source.rawPillars!==c.rawPillars)fail(c.id,'transcription-mismatch');
   if((chart.eligible===false)!==(c.split==='excluded-source-review'))fail(c.id,'eligibility-mismatch');
  }
  if(!states.includes(c.state)||!scopes.includes(c.scope)||!['natal-reading','before-rescue-explanation'].includes(c.phase))fail(c.id,'label');
  if(!['development-reference','excluded-source-review'].includes(c.split)||c.independentlyAdjudicated!==false||!c.url||!c.locator||!c.claim||c.binding!=='annotator-role-to-occurrence')fail(c.id,'provenance');
  if(!Array.isArray(c.edges)||!c.edges.length)fail(c.id,'missing-edges');
  else for(const e of c.edges){
   if(!e.from||!Array.isArray(e.to)||!e.to.length||new Set(e.to).size!==e.to.length||e.to.includes(e.from)||!['control','generate'].includes(e.kind)||e.quantifier!=='any')fail(c.id,'edge-contract');
  }
  if(c.combination&&(!Array.isArray(c.combination.participants)||c.combination.participants.length!==2||new Set(c.combination.participants).size!==2))fail(c.id,'combination-contract');
 }
 for(const t of data.partialTemplates)if(t.completeChart!==false||!t.positive||!t.negative||!t.url)fail(t.mechanism,'partial-template-contract');
 return {references:data.cases.length,uniqueCharts:new Set(data.cases.map(c=>c.chartId)).size,
  excluded:data.cases.filter(c=>c.split==='excluded-source-review').length,
  partialTemplates:data.partialTemplates.length,errors};
}
export function evaluateActionReference(reference,result,layers,interference){
 const occurrences=new Map(result.routeReview.occurrences.map(o=>[o.id,o]));
 const edges=new Map(layers.edges.map(e=>[JSON.stringify([e.from,e.to,e.kind]),e]));
 if(occurrences.size!==result.routeReview.occurrences.length||edges.size!==layers.edges.length)throw Error('duplicate reference graph');
 const require=id=>{if(!occurrences.has(id))throw Error('unbound reference occurrence '+reference.id+': '+id);};
 const probes=reference.edges.map(p=>{
  require(p.from);p.to.forEach(require);
  const alternatives=p.to.map(to=>{
   const e=edges.get(JSON.stringify([p.from,to,p.kind]));
   return {from:p.from,to,kind:p.kind,observed:!!e,edgeId:e?.id??null,layer:e?.layerKind??null,
    status:e?.status??null,legacyStatus:e?.legacyStatus??null,
    reasons:e?unique([...e.unresolved,...e.reviewReasons]):[],legacyReasons:e?unique([...e.legacyUnresolved,...e.legacyReviewReasons]):[]};
  });
  // Existential reference binding is an explicit annotation scope,
  // never evidence that every repeated stem acts identically.
  return {quantifier:p.quantifier,alternatives,observed:alternatives.some(a=>a.observed),
   anyScreenMet:alternatives.some(a=>a.status==='necessary-screen-met')};
 });
 let combinationObserved=null;
 if(reference.combination){
  reference.combination.participants.forEach(require);
  const want=unique(reference.combination.participants);
  combinationObserved=(interference?.pairs??[]).some(p=>JSON.stringify(unique(p.participants))===JSON.stringify(want));
 }
 const allObserved=probes.every(p=>p.observed)&&combinationObserved!==false;
 const comparable=reference.split==='development-reference'&&reference.phase==='natal-reading'&&reference.scope==='edge-effect'&&result.completeHour===true&&layers.status==='research-review';
 // Screens are necessary engineering criteria, not predictions. A
 // limited source claim is not equivalent to zero effect.
 const screenDisposition=!allObserved?'structure-missing':probes.every(p=>p.anyScreenMet)?'all-probes-have-passing-alternative':'screen-withholds';
 return {id:reference.id,chartId:reference.chartId,author:reference.author,mechanism:reference.mechanism,state:reference.state,
  phase:reference.phase,scope:reference.scope,split:reference.split,comparable,probes,combinationObserved,allObserved,screenDisposition,
  predictedEffect:null,selectionAuthority:false};
}
export function summarizeActionReferences(rows){
 const eligible=rows.filter(r=>r.comparable);
 const groups=Object.fromEntries(states.map(s=>{
  const xs=eligible.filter(r=>r.state===s);
  return [s,{references:xs.length,allObserved:xs.filter(r=>r.allObserved).length,
   passing:xs.filter(r=>r.screenDisposition==='all-probes-have-passing-alternative').length,
   withheld:xs.filter(r=>r.screenDisposition==='screen-withholds').length,missing:xs.filter(r=>r.screenDisposition==='structure-missing').length}];
 }));
 const reasons=new Map(),unavoidable=new Map();
 // Count a blocker at most once per source reference, not once per alternative.
 for(const r of eligible.filter(r=>r.state==='supported'&&r.screenDisposition==='screen-withholds')){
  const keys=unique(r.probes.flatMap(p=>p.alternatives.filter(a=>a.observed).flatMap(a=>a.legacyReasons)));
  for(const k of keys)reasons.set(k,(reasons.get(k)??0)+1);
  // A reason on just one alternative cannot explain existential failure.
  // Count a shared reason only when every observed alternative of a failed
  // required probe carries it; union across required probes.
  const shared=unique(r.probes.filter(p=>p.observed&&!p.anyScreenMet).flatMap(p=>{
   const observed=p.alternatives.filter(a=>a.observed);
   return observed[0].legacyReasons.filter(k=>observed.every(a=>a.legacyReasons.includes(k)));
  }));
  for(const k of shared)unavoidable.set(k,(unavoidable.get(k)??0)+1);
 }
 return {references:rows.length,uniqueCharts:new Set(rows.map(r=>r.chartId)).size,comparable:eligible.length,
  structuralCoverage:rows.filter(r=>r.allObserved).length,groups,excluded:rows.filter(r=>r.split==='excluded-source-review').length,
  beforeRescue:rows.filter(r=>r.phase==='before-rescue-explanation').length,routeInterpretations:rows.filter(r=>r.scope==='route-interpretation').length,
  supportedWithheldLegacyReasons:[...reasons].map(([reason,count])=>({reason,count})).sort((a,b)=>b.count-a.count||a.reason.localeCompare(b.reason)),
  supportedWithheldSharedLegacyReasons:[...unavoidable].map(([reason,count])=>({reason,count})).sort((a,b)=>b.count-a.count||a.reason.localeCompare(b.reason)),
  empiricalAccuracy:null,finalEfficacyAccuracy:null,selectionAuthority:false};
}
