const ELEMENTS=['wood','fire','earth','metal','water'];
// Preserve each method's scope. Do not count votes or combine into a score.
export function compareMethodEvidence(balance,climate,mediation,remedy){
 const seasonal=climate.evidence?.seasonal.candidate?.element??null;
 const groups=climate.evidence?.sourceProfile?.groups??[];
 const pairs=mediation.pairs.filter(p=>p.nominalConfrontation?.robustTopTwo===true);
 const contextualMotifs=remedy.motifs.filter(m=>m.targetContext.dayReference||m.targetContext.monthPrincipal||m.targetContext.receivesMonthGeneration);
 return balance.branches.map(b=>{
  const candidates=new Set(b.candidates.map(c=>c.element));
  return {assumedDirection:b.assumedDirection,elements:ELEMENTS.map(element=>({
   element,balanceTendency:candidates.has(element)?'candidate':'opposite-tendency',
   seasonalCue:seasonal===element,
   sourceStemGroups:groups.flatMap((g,i)=>g.filter(s=>s.element===element).map(s=>({group:i+1,stem:s.stem}))),
   mediationReviews:pairs.filter(p=>p.via===element).map(p=>({from:p.from,to:p.to,status:p.reviewStatus})),
   remedyMotifCount:contextualMotifs.filter(m=>m.remedyElement===element).length
  })),
  comparisons:{
   seasonal:seasonal===null?'unavailable':candidates.has(seasonal)?'overlap':'opposite-tendency',
   sourceFirstGroup:groups.length?{overlap:[...new Set(groups[0].map(s=>s.element).filter(e=>candidates.has(e)))],
    oppositeTendency:[...new Set(groups[0].map(s=>s.element).filter(e=>!candidates.has(e)))]}:null,
   mediation:pairs.map(p=>({from:p.from,to:p.to,via:p.via,comparison:candidates.has(p.via)?'overlap':'opposite-tendency'}))
  },selectedElement:null,confirmed:false};
 });
}
