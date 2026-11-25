// Candidate-local role accounting. No numeric score or global clean/impure
// inference. An unclassified participant is not automatically idle or harmful.
const SOURCE='https://zh.wikisource.org/zh-hans/滴天髓/21';
const unique=xs=>[...new Set(xs)].sort();
const key=(r,w)=>JSON.stringify([r,w]);
const ref=x=>({ruleId:x.rule.id,witnessId:x.witness.id});
const ids=w=>unique([...Object.values(w.roles),...w.edges.flatMap(e=>[e.from,e.to]),...(w.anchorBindings??[]).map(b=>b.anchorId).filter(Boolean)]);
const regulation=r=>r.kind==='support'&&r.impact==='conditional-regulation-not-confirmed-support';
export function observeCandidateClarity(review,compound,assistant,visibleIds,completeHour){
 const base={candidateId:review.candidateId,source:SOURCE,completeHour,cleanConfirmed:null,turbidConfirmed:null,
  pureConfirmed:null,mixedConfirmed:null,clearedConfirmed:null,selectionAuthority:false};
 if(review.status==='out-of-scope')return {...base,status:'out-of-scope',participants:[]};
 if(!compound||!assistant||compound.candidateId!==review.candidateId||assistant.candidateId!==review.candidateId||
 compound.status==='invalid-evidence'||compound.violations.length||assistant.status==='invalid-evidence')return {...base,status:'invalid-evidence',participants:[]};
 const rows=review.rules.flatMap(rule=>rule.witnesses.map(witness=>({rule,witness})));
 const lookup=new Map(rows.map(x=>[key(x.rule.id,x.witness.id),x]));
 const get=r=>lookup.get(key(r.ruleId,r.witnessId));
 const threats=compound.threatCoverage;
 const validRescues=threats.flatMap(t=>t.alternatives.map(get));
 if(validRescues.some(x=>!x)||threats.some(t=>!get(t.threat)))return {...base,status:'invalid-evidence',participants:[]};
 const supports=rows.filter(x=>x.rule.kind==='support'&&!regulation(x.rule));
 const damages=rows.filter(x=>x.rule.kind==='damage');
 const regs=rows.filter(x=>regulation(x.rule)),exceptions=rows.filter(x=>x.rule.kind==='exception');
 const allIds=unique([...visibleIds,...review.anchorIds,...rows.flatMap(x=>ids(x.witness))]);
 const refsFor=(xs,id)=>xs.filter(x=>ids(x.witness).includes(id)).map(ref);
 const participants=allIds.map(id=>{
  const a=assistant.candidates.find(c=>c.occurrenceId===id);
  const positive=refsFor(supports,id),negative=refsFor(damages,id),rescue=refsFor(validRescues,id),conditional=refsFor(regs,id),exception=refsFor(exceptions,id);
  const roles=rows.filter(x=>ids(x.witness).includes(id)).flatMap(x=>Object.entries(x.witness.roles).filter(([,v])=>v===id).map(([role])=>({role,kind:regulation(x.rule)?'regulation':x.rule.kind,...ref(x)})));
  // Participation in a damage witness can mean victim, not adversary.
  const adverseRoles=roles.filter(r=>r.kind==='damage'&&r.role==='obstacle');
  const directInjury=compound.supportDamage.filter(x=>x.interventionContacts.some(e=>e.affectedParticipantIds.includes(id))).map(x=>({support:x.support,damage:x.damage}));
  const mixedRoles=!!(adverseRoles.length&&roles.some(r=>['support','rescue'].includes(r.kind)&&['helper','controller','wealth'].includes(r.role)));
  return {occurrenceId:id,anchor:review.anchorIds.includes(id),dayReference:id==='visible:day',roles,
   support:positive,damage:negative,rescue,regulation:conditional,exception,
   adverseRoles,directInjury,dualRoleObserved:mixedRoles,assistantClassification:a?.classification??null,
   classification:!positive.length&&!negative.length&&!rescue.length&&!conditional.length&&!exception.length&&!review.anchorIds.includes(id)?'unclassified-participant':'role-observed',
   idleConfirmed:null,beneficialConfirmed:null,harmfulConfirmed:null};
 });
 const supportContacts=compound.supportDamage.filter(x=>x.interventionContacts.length).map(x=>({support:x.support,damage:x.damage,contacts:x.interventionContacts}));
 const assistantInjury=assistant.candidates.filter(c=>c.potentialInjury.supportDamage.length||c.potentialInjury.rescueCollateral.length||c.potentialInjury.rescueInterference.length)
  .map(c=>({occurrenceId:c.occurrenceId,evidence:c.potentialInjury}));
 const coverage=threats.map(t=>({threat:t.threat,coverage:t.coverage,alternatives:t.alternatives,resolved:null}));
 const blockers={
  uncoveredThreats:coverage.filter(t=>t.coverage==='no-covered-route').map(t=>t.threat),
  unknownThreatRoutes:coverage.filter(t=>t.coverage==='route-unknown').map(t=>t.threat),
  conditionalRescueThreats:coverage.filter(t=>t.alternatives.length).map(t=>t.threat),
  supportContacts,assistantInjury,rescueInterference:compound.rescueInteractions,
  rescueCollateral:compound.rescueCollateral,competingRegulation:compound.competingRegulation,
  exceptionContacts:compound.exceptionContacts
 };
 const dualRoleIds=participants.filter(p=>p.dualRoleObserved).map(p=>p.occurrenceId);
 // These descriptive axes can coexist. No absence of covered evidence proves
 // clarity; no adverse witness by itself proves effective turbidity.
 return {...base,status:completeHour?'diagnostic':'partial',participants,threatCoverage:coverage,blockers,dualRoleIds,
  observations:{ordinarySupportObserved:supports.length?true:completeHour?false:null,
   adversityObserved:damages.length?true:completeHour?false:null,
   rescueRouteObserved:validRescues.length?true:completeHour?false:null,
   supportInterferenceObserved:supportContacts.length?true:completeHour?false:null,
   unclassifiedVisibleIds:participants.filter(p=>visibleIds.includes(p.occurrenceId)&&!p.dayReference&&p.classification==='unclassified-participant').map(p=>p.occurrenceId)},
  limitations:['covered-rules-only','unclassified-is-not-idle','rescue-route-is-not-clearing','no-effective-force-or-purity-verdict']};
}
