// Selection readiness, not an additional vote or a scoring method.
// The policy is release-owned and cannot be unlocked by runtime input.
const METHODS=['pattern','balance','climate','mediation','remedy'];
const ELEMENTS=['wood','fire','earth','metal','water'];
const release=()=>({version:'synthesis-selection-release-v1',authorized:false,validationReceipt:null,
 blockers:['no-independent-method-specific-gold','no-validated-cross-method-precedence','no-validated-effective-force-policy','native-regression-not-certified']});
const unique=xs=>[...new Set(xs)].sort();
export function observeSynthesisSelection(s){
 const gate=release(),base={version:'synthesis-selection-review-v1',release:gate,selectionAuthority:false,
  selectedMethod:null,selectedElement:null,favorableElements:null,unfavorableElements:null};
 const empty=(status,blockers)=>({...base,status,blockers,scenarios:[]});
 if(!['diagnostic','partial'].includes(s.status))return empty(s.status,['upstream-unavailable-or-invalid',...gate.blockers]);
 const p=s.priorityReview,supp=s.supplementaryMethods,timing=s.climateTiming;
 if(!p||!supp||!timing||[p,supp,timing].some(x=>x.selectionAuthority!==false||x.status==='invalid-evidence')||
  s.selectionAuthority!==false||s.usefulElement!==null||s.favorableElements!==null||s.unfavorableElements!==null)
  return empty('invalid-evidence',['upstream-contract-invalid',...gate.blockers]);
 const active=s.candidates.filter(c=>c.status!=='out-of-scope'),priority=new Map(p.candidates.map(c=>[c.candidateId,c]));
 if(priority.size!==p.candidates.length||priority.size!==active.length||active.some(c=>!priority.has(c.candidateId)))return empty('invalid-evidence',['candidate-coverage-mismatch',...gate.blockers]);
 const blockers=[...gate.blockers,...(!s.completeHour?['missing-hour']:[]),
  ...(s.balance.directionComparison!=='same-direction-hypothesis'?['strength-hypotheses-unreconciled']:[]),
  ...(!active.length?['no-active-pattern-candidate']:[]),
  ...(s.climate.status==='source-unavailable'?['climate-source-unavailable']:[])];
 // A direction is a scenario premise, not an adjudicated direction. Keep
 // unsupported branch absence as unknown rather than unfavorable.
 const branches=s.balance.branches.length?s.balance.branches:[{assumedDirection:null,candidates:[]}];
 const scenarios=[];
 for(const c of active)for(const b of branches){
  const q=priority.get(c.candidateId);
  const rows=ELEMENTS.map(element=>{
   const participants=c.participants.filter(x=>x.element===element);
   const baseline=s.climate.groups.filter(g=>g.elements.includes(element));
   const alternatives=s.climate.alternatives.filter(g=>g.elements.includes(element));
   const mediation=supp.mediation.pairs.filter(x=>x.via===element);
   const remedies=supp.remedy.motifs.filter(x=>x.remedyElement===element);
   const contacts=q.contacts.filter(x=>baseline.some(g=>x.baselineGroupIds.includes(g.id))||alternatives.some(g=>x.conditionalAlternativeIds.includes(g.id)));
   return {element,pattern:{anchorIds:c.anchors.filter(a=>a.element===element&&a.meaning!=='day-reference-proxy').map(a=>a.id),
    participantRoles:participants.flatMap(a=>a.roles.map(r=>({occurrenceId:a.occurrenceId,kind:r.kind,ruleId:r.ruleId,witnessId:r.witnessId,hypothesis:r.mechanismHypothesis})))},
    balance:{membership:b.assumedDirection===null?'unknown':b.candidates.some(x=>x.element===element)?'candidate':'outside-candidates'},
    climate:{baselineGroupIds:baseline.map(g=>g.id),conditionalAlternativeIds:alternatives.map(g=>g.id),
     exactParticipantIds:participants.filter(a=>a.climate.exactRequirementStem!==null).map(a=>a.occurrenceId),
     supplyContacts:contacts.map(x=>({ruleId:x.ruleId,witnessId:x.witnessId,occurrenceId:x.climateOccurrenceId,scope:x.scope}))},
    mediation:{pairRefs:mediation.map(x=>({from:x.from,to:x.to,routeCount:x.routeCount}))},
    remedy:{motifIds:remedies.map(x=>x.id)},selected:null};
  });
  scenarios.push({candidateId:c.candidateId,family:c.family,assumedDirection:b.assumedDirection,
   jointPlanStatus:c.jointPlanStatus,reviewObligations:unique([...q.obligations,'validate-effective-actions','validate-method-specific-objectives']),
   methodOrder:null,rows,selectedElement:null});
 }
 return {...base,status:'abstained',blockers:unique(blockers),methods:[...METHODS],scenarios,
  limitations:['no-majority-vote','no-absence-as-unfavorable','no-pattern-anchor-as-useful-element','no-confirmed-intervention','scenario-not-ranking']};
}
