// Structural evidence composition, not a decision or numerical score.
// Every reference is scoped by candidate, rule and witness. Never deduplicate
// by stem, element or family: distinct occurrences may have distinct threats.
const unique=xs=>[...new Set(xs)].sort();
const key=(ruleId,witnessId)=>JSON.stringify([ruleId,witnessId]);
const ref=x=>({ruleId:x.rule.id,witnessId:x.witness.id});
const ids=w=>unique([...Object.values(w.roles),...(w.anchorBindings??[]).map(b=>b.anchorId).filter(Boolean)]);
const roleMatch=(a,b)=>Object.entries(a.roles).every(([k,v])=>b.roles[k]===v);
const observed=(n,complete)=>n>0?true:complete?false:null;
const edgeKey=e=>e.kind==='combine'?JSON.stringify(['combine',...[e.from,e.to].sort()]):JSON.stringify([e.kind,e.from,e.to]);
const edges=w=>[...w.edges,...(w.anchorBindings??[]).flatMap(b=>b.edge?[b.edge]:[])];
// A rescue must retain the entire original anchor scope. Order is not
// identity; neither a different anchor nor a changed relation can substitute.
const bindingKey=b=>JSON.stringify([b.anchorId,b.targetId??null,b.basis??null,b.independentSlots??null,b.edge?edgeKey(b.edge):null]);
const bindingKeys=w=>(w.anchorBindings??[]).map(bindingKey).sort();
const sameBindings=(a,b)=>JSON.stringify(bindingKeys(a))===JSON.stringify(bindingKeys(b));
const distinctHelper=(a,b)=>typeof b.roles.helper==='string'&&b.roles.helper.length>0&&!Object.values(a.roles).includes(b.roles.helper);
const intervention=e=>e.kind==='control'||e.kind==='combine';
const affected=e=>e.kind==='combine'?[e.from,e.to]:[e.to];
function indexReview(review){
 const rows=review.rules.flatMap(rule=>rule.witnesses.map(witness=>({rule,witness})));
 const byKey=new Map(),violations=[];
 for(const x of rows){
  const k=key(x.rule.id,x.witness.id);
  if(byKey.has(k))violations.push({kind:'duplicate-witness',...ref(x)});
  else byKey.set(k,x);
 }
 const damage=rows.filter(x=>x.rule.kind==='damage'),rescue=rows.filter(x=>x.rule.kind==='rescue');
 const support=rows.filter(x=>x.rule.kind==='support'&&x.rule.impact!=='conditional-regulation-not-confirmed-support');
 const regulation=rows.filter(x=>x.rule.kind==='support'&&x.rule.impact==='conditional-regulation-not-confirmed-support');
 const exceptions=rows.filter(x=>x.rule.kind==='exception'),valid=[];
 for(const x of rescue){
  const t=byKey.get(key(x.rule.threatRuleId,x.witness.threatWitnessId));
  if(!t||t.rule.kind!=='damage'||!roleMatch(t.witness,x.witness)||!sameBindings(t.witness,x.witness)||!distinctHelper(t.witness,x.witness)){
   violations.push({kind:'invalid-rescue-reference',...ref(x),threatRuleId:x.rule.threatRuleId,threatWitnessId:x.witness.threatWitnessId});
   continue;
  }
  valid.push({rescue:x,threat:t});
 }
 return {damage,support,regulation,exceptions,valid,violations};
}
function pairInteractions(left,right,excluded=new Set()){
 const common=ids(left.witness).filter(id=>ids(right.witness).includes(id));
 // A day reference alone is ubiquitous, not evidence of compound causation.
 const sharedNonDayIds=common.filter(id=>id!=='visible:day');
 const hits=edges(right.witness).filter(e=>intervention(e)&&!excluded.has(edgeKey(e))).flatMap(e=>{
  const targets=affected(e).filter(id=>ids(left.witness).includes(id)&&id!=='visible:day');
  return targets.length?[{from:e.from,to:e.to,kind:e.kind,affectedParticipantIds:targets}]:[];
 });
 return {sharedNonDayIds,interventionContacts:hits,interactionConfirmed:null};
}
export function observeCompoundTopology(review,completeHour){
 if(review.status==='out-of-scope')return {candidateId:review.candidateId,status:'out-of-scope',violations:[],formed:null,broken:null,rescued:null,selectionAuthority:false};
 const {damage,support,regulation,exceptions,valid,violations}=indexReview(review);
 const threatCoverage=damage.map(t=>{
  const alternatives=valid.filter(v=>v.threat===t).map(v=>ref(v.rescue));
  return {threat:ref(t),roles:{...t.witness.roles},alternatives,
   coverage:alternatives.length?'structural-route-observed':completeHour?'no-covered-route':'route-unknown',
   resolved:null};
 });
 const supportDamage=support.flatMap(s=>damage.flatMap(d=>{
  const x=pairInteractions(s,d);
  return x.sharedNonDayIds.length?[{support:ref(s),damage:ref(d),...x,
   topology:x.interventionContacts.length?'intervention-touches-support-role':'shared-role-only'}]:[];
 }));
 const rescueInteractions=valid.flatMap(v=>support.flatMap(s=>{
  const inherited=new Set(edges(v.threat.witness).map(edgeKey));
  const x=pairInteractions(s,v.rescue,inherited);
  // Mere shared protected target is not collateral interference.
  return x.interventionContacts.length?[{rescue:ref(v.rescue),threat:ref(v.threat),support:ref(s),...x}]:[];
 }));
 const rescueCollateral=valid.flatMap(v=>{
  const e=v.rescue.witness.clearing?.officerCollateralControl;
  return e?[{rescue:ref(v.rescue),threat:ref(v.threat),from:e.from,to:e.to,kind:e.kind,effectConfirmed:null}]:[];
 });
 const competingRegulation=regulation.flatMap(s=>damage.flatMap(d=>{
  if(s.witness.alternativeDamageRuleId!==d.rule.id)return [];
  const shared=edges(s.witness).filter(intervention).filter(e=>edges(d.witness).some(f=>edgeKey(e)===edgeKey(f)));
  return shared.length?[{regulation:ref(s),damage:ref(d),sameInterventionEdges:shared.map(e=>({from:e.from,to:e.to,kind:e.kind})),preferredInterpretation:null}]:[];
 }));
 const exceptionContacts=exceptions.flatMap(x=>damage.flatMap(d=>{
  // Same monthly hurting occurrence and actual officer, not merely family.
  return x.witness.roles.target===d.witness.roles.target&&x.witness.roles.officer===d.witness.roles.obstacle?
   [{exception:ref(x),damage:ref(d),contextScreen:x.witness.contextScreen??null,exceptionApplied:null}]:[];
 }));
 // Alternatives that reuse a helper or combine participant are not independent
 // force. Keep potential competition; never select an allocation.
 const rescueAlternatives=valid.map(v=>{
  const helper=v.rescue.witness.roles.helper;
  const contacts=edges(v.rescue.witness).filter(e=>e.kind==='combine').flatMap(e=>[e.from,e.to]);
  const related=valid.filter(w=>w!==v&&((helper&&w.rescue.witness.roles.helper===helper)||
   edges(w.rescue.witness).some(e=>e.kind==='combine'&&[e.from,e.to].some(id=>contacts.includes(id)))));
  return {rescue:ref(v.rescue),sharedParticipantAlternatives:related.map(w=>ref(w.rescue)),independentSupplyConfirmed:null};
 });
 return {candidateId:review.candidateId,status:violations.length?'invalid-evidence':completeHour?'diagnostic':'partial',
  counts:{support:support.length,damage:damage.length,validRescue:valid.length,regulation:regulation.length,exception:exceptions.length,
   threatsWithRoute:threatCoverage.filter(t=>t.alternatives.length).length,threatsWithoutObservedRoute:threatCoverage.filter(t=>!t.alternatives.length).length},
  threatCoverage,supportDamage,rescueInteractions,rescueCollateral,competingRegulation,exceptionContacts,rescueAlternatives,violations,
  supportWithAdversityObserved:observed(supportDamage.length,completeHour),
  damageWithRescueObserved:observed(valid.length,completeHour),
  allObservedThreatsHaveRoute:violations.length||!damage.length||!completeHour?null:threatCoverage.every(t=>t.alternatives.length>0),
  formed:null,broken:null,rescued:null,selectionAuthority:false};
}
