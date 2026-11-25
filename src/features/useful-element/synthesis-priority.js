import {stemInfo} from '../../core/elements.js';
const SOURCE='https://www.diancangwang.cn/xuanxuewushu/03cf53eede8a/217806b65c4a.html';
const COMMENTARY='https://taoly.app/library/bazi/zi-ping-zhen-quan/016/';
const winter=['해','자','축'],summer=['사','오','미'];
// A source-scoped review dependency is not a ranking of useful elements.
// The same actor may meet one need while creating another unresolved issue.
const definitions=[
 {id:'winter-wood-resource-warming',element:'wood',months:winter,family:'resource',focus:'fire',
  review:['climate-supply','resource-generation-context','day-capacity'],reason:'winter-water-wood-generation-and-output-warming-review'},
 {id:'winter-metal-hurting-warming',element:'metal',months:winter,family:'hurting-officer',focus:'fire',
  review:['climate-supply','officer-output-conflict','day-capacity'],reason:'conditional-climate-exception-not-officer-immunity'},
 {id:'summer-wood-hurting-moisture',element:'wood',months:summer,family:'hurting-officer',focus:'water',
  review:['climate-supply','resource-output-regulation','day-capacity'],reason:'summer-wood-resource-and-moisture-review'},
 {id:'summer-wood-food-resource',element:'wood',months:summer,family:'food',focus:'water',
  review:['climate-supply','resource-output-regulation','day-capacity'],reason:'light-resource-use-conditional-on-output-and-heat'}
];
const sorted=xs=>[...new Set(xs)].sort();
const key=(r,w)=>JSON.stringify([r,w]);
const relationKey=c=>JSON.stringify([c.ruleId,c.witnessId,c.from,c.to,c.edgeKind,c.scope,c.anchorId??null,c.climateOccurrenceId]);
function readFocus(element,synthesis,pattern,saju){
 const visible=Object.entries(saju.pillars).filter(([p,v])=>v&&p!=='day'&&stemInfo(v.stem).element===element).map(([p,v])=>({occurrenceId:'visible:'+p,stem:v.stem}));
 const hidden=pattern.access.hidden.filter(h=>h.element===element).map(h=>({occurrenceId:h.id,position:h.position,stem:h.stem,role:h.role}));
 const req=pattern.efficacyReview.mechanismReview.climate.requirements.filter(r=>r.element===element).map(r=>({stem:r.stem,exactVisibleIds:[...r.exactVisibleIds],status:r.status}));
 return {element,visible,hidden,requirements:req,baselineGroupIds:synthesis.climate.groups.filter(g=>g.elements.includes(element)).map(g=>g.id),
  conditionalAlternativeIds:synthesis.climate.alternatives.filter(g=>g.elements.includes(element)).map(g=>g.id),
  literalPresence:visible.length||hidden.length?'observed':synthesis.completeHour?'not-observed':'unknown',adequacyConfirmed:null};
}
export function observeSynthesisPriority(saju,synthesis,pattern){
 const base={version:'synthesis-priority-review-v1',source:SOURCE,commentary:COMMENTARY,
  selectionAuthority:false,precedenceConfirmed:null,selectedMethod:null,selectedElement:null};
 if(!['diagnostic','partial'].includes(synthesis.status))return {...base,status:synthesis.status,clauses:[],candidates:[],reviewDependencies:[]};
 const complete=synthesis.completeHour,day=stemInfo(saju.pillars.day.stem).element,month=saju.pillars.month.branch;
 const raw=new Map(pattern.reviews.map(q=>[q.candidateId,q]));
 const mechanisms=new Map(pattern.efficacyReview.mechanismReview.candidates.map(q=>[q.candidateId,q]));
 const clauses=[],candidates=[],reviewDependencies=[];
 const invalid=()=>({...base,status:'invalid-evidence',clauses:[],candidates:[],reviewDependencies:[]});
 if(raw.size!==pattern.reviews.length||mechanisms.size!==pattern.reviews.length)return invalid();
 const direction=synthesis.balance.directionComparison;
 for(const q of synthesis.candidates){
  if(q.status==='out-of-scope')continue;
  const review=raw.get(q.candidateId),m=mechanisms.get(q.candidateId);
  if(!review||!m||m.status==='invalid-evidence')return invalid();
  const ruleRows=new Map(review.rules.flatMap(r=>r.witnesses.map(w=>[key(r.id,w.id),{r,w}])));
  const matching=definitions.filter(d=>d.element===day&&d.months.includes(month)&&d.family===q.family);
  const clauseIds=[];
  for(const d of matching){
   const focus=readFocus(d.focus,synthesis,pattern,saju);
   const relevantContacts=q.routeContacts.filter(c=>stemInfo(c.climateStem).element===d.focus);
   const id=q.candidateId+':'+d.id;
   clauseIds.push(id);
   clauses.push({id,clauseId:d.id,candidateId:q.candidateId,scope:{dayElement:day,monthBranch:month,family:q.family},
    status:complete?'scope-observed':'partial-scope',focus,reason:d.reason,reviewOrder:[...d.review],
    contactRefs:relevantContacts.map(c=>({ruleId:c.ruleId,witnessId:c.witnessId,climateOccurrenceId:c.climateOccurrenceId,scope:c.scope})),
    applicableConfirmed:null,priorityConfirmed:null});
   // The ordering is a review obligation for this clause, not a universal
   // precedence of doctrines, nor proof that climate is deficient.
   reviewDependencies.push({candidateId:q.candidateId,clauseId:d.id,before:'climate-supply',after:'accept-source-pattern-interpretation',reason:d.reason,resolved:null});
   reviewDependencies.push({candidateId:q.candidateId,clauseId:d.id,before:'day-capacity',after:'accept-source-pattern-interpretation',reason:'climate-need-does-not-set-balance-useful-element',resolved:null});
  }
  const contacts=[],seen=new Set();
  for(const c of q.routeContacts){
   const k=key(c.ruleId,c.witnessId),row=ruleRows.get(k);
   if(!row||!['mandatory','anchor-alternative'].includes(c.scope)||c.effectConfirmed!==null)return invalid();
   const edges=c.scope==='mandatory'?row.w.edges:(row.w.anchorBindings??[]).filter(b=>b.anchorId===c.anchorId&&b.edge).map(b=>b.edge);
   if(!edges.some(e=>e.from===c.from&&e.to===c.to&&e.kind===c.edgeKind))return invalid();
   const rk=relationKey(c);if(seen.has(rk))continue;seen.add(rk);
   const groups=synthesis.climate.groups.filter(g=>g.stems.includes(c.climateStem));
   const alternatives=synthesis.climate.alternatives.filter(g=>g.stems.includes(c.climateStem));
   const requirement=pattern.efficacyReview.mechanismReview.climate.requirements.find(r=>r.stem===c.climateStem);
   if(!requirement?.exactVisibleIds.includes(c.climateOccurrenceId))return invalid();
   const otherExactIds=requirement.exactVisibleIds.filter(id=>id!==c.climateOccurrenceId);
   contacts.push({ruleId:c.ruleId,witnessId:c.witnessId,routeKind:row.r.kind,from:c.from,to:c.to,edgeKind:c.edgeKind,
    scope:c.scope,anchorId:c.anchorId,climateOccurrenceId:c.climateOccurrenceId,climateStem:c.climateStem,
    baselineGroupIds:groups.map(g=>g.id),conditionalAlternativeIds:alternatives.map(g=>g.id),otherExactIds,
    concern:groups.length?'baseline-supply-contact':alternatives.length?'conditional-supply-contact':'unclassified-requirement-contact',
    alternativeSupplyConfirmed:null,interferenceConfirmed:null,priorityConfirmed:null});
  }
  const obligations=[];
  if(direction==='different-direction-hypotheses'||direction==='unresolved')obligations.push('reconcile-strength-hypotheses');
  if(contacts.length)obligations.push('review-exact-climate-supply-contacts');
  if(clauseIds.length)obligations.push('review-source-scoped-climate-conditions');
  if(m.joint?.search?.observed?.status!=='conditional-plan-found')obligations.push('review-pattern-route-coverage');
  if(m.joint?.search?.observed?.status==='conditional-plan-found')obligations.push('review-unconfirmed-joint-route-effects');
  const scenarios=synthesis.balance.branches.map(b=>({assumedDirection:b.assumedDirection,
   focusMembership:sorted(matching.map(d=>d.focus)).map(element=>({element,membership:b.candidates.some(c=>c.element===element)?'candidate':'outside-candidates'})),
   roleMembership:q.participants.map(p=>({occurrenceId:p.occurrenceId,element:p.element,membership:b.candidates.some(c=>c.element===p.element)?'candidate':'outside-candidates'})),
   selectedElement:null}));
  candidates.push({candidateId:q.candidateId,clauseIds,contacts,obligations,scenarios,precedenceConfirmed:null});
 }
 return {...base,status:complete?'diagnostic':'partial',clauses,candidates,reviewDependencies,
  limitations:['source-scoped-not-universal','review-order-not-doctrine-ranking','literal-presence-not-adequacy','no-climate-veto','no-balance-promotion','no-validated-precedence']};
}
