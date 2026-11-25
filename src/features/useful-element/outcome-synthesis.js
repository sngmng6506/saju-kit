import {stemInfo} from '../../core/elements.js';
const ELEMENTS=['wood','fire','earth','metal','water'];
const key=(r,w)=>JSON.stringify([r,w]);
const unique=xs=>[...new Set(xs)].sort();
const index=(xs,id)=>new Map(xs.map(x=>[x[id],x]));
const directions=new Set(['strong','weak']);
// Composition only: no vote, score, inferred favorable element or authority.
export function composeOutcomeSynthesis(saju,balance,pattern){
 const complete=pattern.completeHour;
 const base={version:'useful-element-synthesis-v1',completeHour:complete,ordinaryChartAssumption:true,
  usefulElement:null,favorableElements:null,unfavorableElements:null,ranking:null,score:null,confirmed:false,selectionAuthority:false};
 const withheld=(status,reasons)=>({...base,status,reasons,balance:null,climate:null,pattern:null,candidates:[],elements:[]});
 if(!pattern.access||balance.reason==='provisional-chart')return withheld('unavailable',['chart-evidence-unavailable']);
 const m=pattern.efficacyReview?.mechanismReview,decision=pattern.decisionReview;
 if(!m||!m.climate||pattern.integrity?.status!=='consistent'||pattern.efficacyReview.status==='invalid-evidence'||decision?.status!=='abstained'||m.selectionAuthority!==false||m.effective!==null)
  return withheld('invalid-evidence',['upstream-evidence-invalid']);
 const reviews=pattern.reviews,collections=[m.candidates,pattern.assistantReview,decision.candidates];
 if(!Array.isArray(reviews)||reviews.some(q=>!q||typeof q.candidateId!=='string')||
  new Set(reviews.map(q=>q.candidateId)).size!==reviews.length||
  collections.some(xs=>!Array.isArray(xs)||xs.length!==reviews.length||xs.some(q=>!q||typeof q.candidateId!=='string')||
   new Set(xs.map(q=>q.candidateId)).size!==xs.length||reviews.some(q=>!xs.some(x=>x.candidateId===q.candidateId))))
  return withheld('invalid-evidence',['candidate-coverage-mismatch']);
 const [ms,assist,d]=collections.map(xs=>index(xs,'candidateId'));
 const actors=new Map(Object.entries(saju.pillars).filter(([,p])=>p).map(([position,p])=>['visible:'+position,{element:stemInfo(p.stem).element,stem:p.stem,layer:'visible'}]));
 for(const h of pattern.access.hidden)actors.set(h.id,{element:h.element,stem:h.stem,layer:'hidden'});
 for(const g of pattern.access.groups)actors.set(g.id,{element:g.element,stem:null,layer:'group'});
 const branches=balance.branches.map(b=>({assumedDirection:b.assumedDirection,candidates:b.candidates.map(c=>({element:c.element,category:c.category,purpose:c.purpose,presence:c.presence}))}));
 if(branches.some(b=>!directions.has(b.assumedDirection)||b.candidates.some(c=>!ELEMENTS.includes(c.element)))||new Set(branches.map(b=>b.assumedDirection)).size!==branches.length)return withheld('invalid-evidence',['balance-branch-contract']);
 const balanceDirection=balance.strength?.direction??null,patternDirection=pattern.regulationStrength?.direction??null;
 const directionComparison=!balanceDirection||!patternDirection?'unresolved':balanceDirection===patternDirection?'same-direction-hypothesis':'different-direction-hypotheses';
 const compare=element=>branches.map(b=>({assumedDirection:b.assumedDirection,membership:b.candidates.some(c=>c.element===element)?'candidate':'outside-candidates'}));
 const climate=m.climate;
 const requirements=index(climate.requirements,'stem');
 if(requirements.size!==climate.requirements.length)return withheld('invalid-evidence',['duplicate-climate-requirement']);
 const climateGroups=climate.groups.map((g,i)=>({id:'baseline:'+i,stems:[...g.stems],elements:unique(g.stems.map(s=>stemInfo(s).element)),allExactVisibleAndRootObserved:g.allExactVisibleAndRootObserved,effectiveSupply:null}));
 const climateAlternatives=climate.alternatives.map((a,i)=>({id:'alternative:'+i,when:a.when,stems:[...a.stems],elements:unique(a.stems.map(s=>stemInfo(s).element)),conditionResolved:false}));
 const climateExact=new Map();
 for(const r of requirements.values())for(const id of r.exactVisibleIds){
  if(actors.get(id)?.stem!==r.stem||id==='visible:day')return withheld('invalid-evidence',['climate-occurrence-mismatch']);
  climateExact.set(id,r.stem);
 }
 const climateLinks=actor=>({baselineGroupIds:climateGroups.filter(g=>g.elements.includes(actor.element)).map(g=>g.id),
  conditionalAlternativeIds:climateAlternatives.filter(g=>g.elements.includes(actor.element)).map(g=>g.id)});
 const candidates=[];
 for(const q of reviews){
  const a=assist.get(q.candidateId),mechanism=ms.get(q.candidateId),gate=d.get(q.candidateId);
  if(q.status==='out-of-scope'){candidates.push({candidateId:q.candidateId,family:q.family,status:'out-of-scope',anchors:[],participants:[],routeContacts:[],selectionAuthority:false});continue;}
  if(a.status==='invalid-evidence'||mechanism.status==='invalid-evidence'||gate.status!=='abstained')return withheld('invalid-evidence',['candidate-evidence-invalid']);
  const routes=new Map(mechanism.routes.map(r=>[key(r.ruleId,r.witnessId),r]));
  const raw=new Map(q.rules.flatMap(r=>r.witnesses.map(w=>[key(r.id,w.id),{r,w}])));
  if(raw.size!==q.rules.reduce((n,r)=>n+r.witnesses.length,0)||routes.size!==raw.size||mechanism.routes.length!==raw.size||[...raw.keys()].some(k=>!routes.has(k)))return withheld('invalid-evidence',['route-coverage-mismatch']);
  const anchors=q.anchorIds.map(id=>({id,...actors.get(id),meaning:q.anchorBasis==='day-reference-proxy'?'day-reference-proxy':'pattern-anchor-not-favorable-element'}));
  if(anchors.some(o=>!o.element))return withheld('invalid-evidence',['unknown-anchor']);
  const participants=[];
  for(const p of a.candidates){
   const actor=actors.get(p.occurrenceId);
   if(!actor)return withheld('invalid-evidence',['unknown-assistant']);
   const roles=[];
   for(const role of p.roles){
    const k=key(role.ruleId,role.witnessId),w=raw.get(k),r=routes.get(k);
    const expectedKind=w?.r.impact==='conditional-regulation-not-confirmed-support'?'regulation':w?.r.kind;
    if(!w||!r||expectedKind!==role.kind||w.w.roles[role.role]!==p.occurrenceId)return withheld('invalid-evidence',['assistant-route-mismatch']);
    roles.push({role:role.role,kind:role.kind,ruleId:role.ruleId,witnessId:role.witnessId,mechanismHypothesis:r.status,unresolvedConditions:[...r.unresolvedClassicalConditions]});
   }
   participants.push({occurrenceId:p.occurrenceId,...actor,classification:p.classification,anchorAlias:p.anchorAlias,roles,
    balance:compare(actor.element),climate:{...climateLinks(actor),exactRequirementStem:climateExact.get(p.occurrenceId)??null},assistantConfirmed:null});
  }
  // Directional control contacts and symmetric combination contacts are
  // contextual evidence, not cross-method contradictions or automatic vetoes.
  const routeContacts=[];
  for(const {r,w} of raw.values()){
   const edges=[...w.edges.map(e=>({e,scope:'mandatory'})),...(w.anchorBindings??[]).flatMap(b=>b.edge?[{e:b.edge,scope:'anchor-alternative',anchorId:b.anchorId}]:[])];
   for(const {e,scope,anchorId} of edges){
    const targets=e.kind==='control'?[e.to]:e.kind==='combine'?[e.from,e.to]:[];
    for(const id of targets.filter(id=>climateExact.has(id)))routeContacts.push({ruleId:r.id,witnessId:w.id,kind:r.kind,edgeKind:e.kind,from:e.from,to:e.to,scope,anchorId:anchorId??null,
     climateOccurrenceId:id,climateStem:climateExact.get(id),meaning:'possible-climate-supply-interference',effectConfirmed:null});
   }
  }
  candidates.push({candidateId:q.candidateId,family:q.family,status:'diagnostic',anchors,participants,routeContacts,
   jointPlanStatus:mechanism.joint?.search?.observed?.status??null,selectionAuthority:false});
 }
 const elements=ELEMENTS.map(element=>({element,balance:compare(element),
  climateBaselineGroupIds:climateGroups.filter(g=>g.elements.includes(element)).map(g=>g.id),
  climateConditionalAlternativeIds:climateAlternatives.filter(g=>g.elements.includes(element)).map(g=>g.id),
  patternAnchorRefs:candidates.flatMap(c=>c.anchors.filter(a=>a.element===element&&a.meaning!=='day-reference-proxy').map(a=>({candidateId:c.candidateId,occurrenceId:a.id}))),
  patternParticipantRefs:candidates.flatMap(c=>c.participants.filter(a=>a.element===element).map(a=>({candidateId:c.candidateId,occurrenceId:a.occurrenceId}))),
  favorable:null,unfavorable:null}));
 return {...base,status:complete?'diagnostic':'partial',reasons:['no-validated-cross-method-precedence','no-independent-outcome-gold','special-pattern-not-assessed','climate-and-force-unconfirmed'],
  balance:{policy:balance.version,status:balance.status,direction:balanceDirection,branches,patternStrengthPolicy:pattern.regulationStrength?.policy??null,patternDirection,directionComparison},
  climate:{policy:climate.policy,status:climate.status,section:climate.section,groups:climateGroups,alternatives:climateAlternatives,adequacyConfirmed:null},
  pattern:{policy:pattern.version,familyHypothesis:decision.pattern.evidence.hypothesis??null,monthChange:decision.pattern.evidence.monthChange??null,selectedPattern:null},
  candidates,elements,limitations:['membership-not-favorability','exact-stem-not-element-substitution','route-contact-not-proven-interference','no-method-vote-or-precedence','calendar-dependent-climate-conditions-not-resolved']};
}
