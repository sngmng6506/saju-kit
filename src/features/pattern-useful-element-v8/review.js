import { elementRelation,stemInfo } from '../../core/elements.js';
import { tenGodForStem } from '../../core/natal.js';
import { patternFamily } from '../pattern-useful-element-v1/source.js';
import { MIXED_SOURCE,mixedRules } from './source.js';
const STORAGE=['진','술','축','미'];
const ELEMENT_STEMS={wood:['갑','을'],fire:['병','정'],earth:['무','기'],metal:['경','신'],water:['임','계']};
const unique=x=>[...new Set(x)];
const ORDER=['year','month','day','hour'];
export function observeMixedUse(selection,structure,interaction){
 const base={source:MIXED_SOURCE,scope:'mixed-month-structural-review',status:'unavailable',participants:[],pairs:[],reviews:[],hypothesis:null,
  affinityConfirmed:null,selectionAuthority:false,confirmed:false};
 if(!selection||!structure||!interaction)return base;
 if(!STORAGE.includes(structure.month.branch))return {...base,status:'not-applicable'};
 const visible=structure.profiles.flatMap(p=>p.visible).filter(v=>v.position!=='day');
 const groups=interaction.formations.filter(f=>f.layer==='branch'&&f.complete&&f.positions.includes('month')&&f.type==='branch.threeHarmony');
 const monthGroups=interaction.formations.filter(f=>f.layer==='branch'&&f.complete&&f.positions.includes('month')&&['branch.threeHarmony','branch.seasonalHarmony'].includes(f.type));
 const combos=interaction.formations.filter(f=>f.type==='stem.combine');
 const monthClashes=structure.clashes.filter(c=>c.positions.includes('month'));
 const ids=selection.candidates;
 const participants=ids.filter(c=>['month-hidden-projection','month-storage-projection'].includes(c.kind)).flatMap(c=>
  visible.filter(v=>c.stems.includes(v.stem)).map(v=>({id:'projection:'+c.id+':'+v.position,kind:c.kind,candidateId:c.id,stem:v.stem,element:stemInfo(v.stem).element,family:c.family,
   positions:[v.position],transformationConfirmed:null})));
 for(const f of monthGroups){
  const stems=ELEMENT_STEMS[f.associatedElement]??[];
  participants.push({id:'group:'+f.id,kind:f.type,candidateId:ids.find(c=>c.formationId===f.id)?.id??null,element:f.associatedElement,
   possibleFamilies:unique(stems.map(s=>patternFamily(tenGodForStem(structure.dayMaster.stem,s))).filter(Boolean)),positions:[...f.positions],transformationConfirmed:null});
 }
 const pairs=participants.flatMap((a,i)=>participants.slice(i+1).map(b=>{
  const bothProjected=a.kind.startsWith('month-')&&b.kind.startsWith('month-');
  const contacts=bothProjected?combos.filter(f=>a.positions[0]!==b.positions[0]&&f.positions.includes(a.positions[0])&&f.positions.includes(b.positions[0])):[];
  const between=bothProjected?visible.filter(v=>ORDER.indexOf(v.position)>Math.min(ORDER.indexOf(a.positions[0]),ORDER.indexOf(b.positions[0]))&&ORDER.indexOf(v.position)<Math.max(ORDER.indexOf(a.positions[0]),ORDER.indexOf(b.positions[0]))).map(v=>v.position):[];
  return {left:a.id,right:b.id,relation:elementRelation(a.element,b.element),combinationIds:contacts.map(f=>f.id),between,affinity:null,effectConfirmed:false};
 }));
 const positions=s=>visible.filter(v=>v.stem===s).map(v=>v.position);
 const observed=n=>n?true:structure.completeHour?false:null;
 const evaluate=c=>{
  if(c.kind==='visible'){const ps=positions(c.stem);return {...c,positions:ps,matched:observed(ps.length)};}
  if(c.kind==='group'||c.kind==='group-absent'){
   const fs=groups.filter(f=>f.associatedElement===c.element),present=observed(fs.length);
   return {...c,formationIds:fs.map(f=>f.id),matched:c.kind==='group'?present:present===null?null:!present};
  }
  if(c.kind==='combination'){
   const [a,b]=c.stems.map(positions);
   const fs=combos.filter(f=>a.some(p=>f.positions.includes(p))&&b.some(p=>f.positions.includes(p)));
   return {...c,formationIds:fs.map(f=>f.id),matched:observed(fs.length)};
  }
  if(c.kind==='month-clash'){
   // The opposing branch is given by the core clash pair; this chapter's
   // source clause is Chen-Xu, not a generic all-clashes interpretation.
   const fs=monthClashes.filter(f=>f.branches?.includes(c.branch)||structure.month.branch==='진'&&c.branch==='술');
   return {...c,positions:fs.map(f=>f.positions),matched:observed(fs.length)};
  }
  throw Error('unknown mixed use clause');
 };
 const reviews=mixedRules.filter(r=>r.day===structure.dayMaster.stem&&r.month===structure.month.branch).map(r=>{
  const clauses=r.clauses.map(evaluate),matched=clauses.some(c=>c.matched===false)?false:clauses.every(c=>c.matched===true)?true:null;
  const groupIds=clauses.flatMap(c=>c.kind==='group'?c.formationIds:[]);
  const requiredPositions=r.participants.flatMap(positions);
  const allowed=new Set(r.participants),blockers=[];
  if(!structure.completeHour)blockers.push('missing-hour');
  if(participants.some(p=>p.stem&&!allowed.has(p.stem)))blockers.push('additional-projection');
  if(monthGroups.some(f=>!groupIds.includes(f.id)))blockers.push('additional-month-group');
  if(monthClashes.length||groups.filter(f=>groupIds.includes(f.id)).some(f=>f.disruptions?.some(d=>d.type==='branch.clash')))blockers.push('month-or-group-clash');
  if(combos.some(f=>f.positions.some(p=>requiredPositions.includes(p))))blockers.push('participant-combination');
  const candidateIds=unique(participants.filter(p=>allowed.has(p.stem)||groupIds.some(id=>p.id==='group:'+id)).map(p=>p.candidateId).filter(Boolean));
  const primaryIds=ids.filter(c=>candidateIds.includes(c.id)&&c.family===r.primary).map(c=>c.id);
  return {id:r.id,reading:r.reading,mechanism:r.mechanism,clauses,matched,blockers,candidateIds,primaryFamily:r.primary??null,primaryIds,
   interpretationConfirmed:false};
 });
 const active=reviews.filter(r=>r.matched===true);
 const positive=active.filter(r=>['aligned','opposed-to-aligned'].includes(r.reading));
 const negative=active.filter(r=>['opposed','aligned-to-opposed'].includes(r.reading));
 // A matched adverse source motif is a reason to withhold a research
 // preference, not a verdict of failure. Conflicting positives do not
 // cancel the adverse motif without independent resolution.
 const eligible=positive.filter(r=>r.blockers.length===0);
 let hypothesis=null;
 if(structure.completeHour&&!negative.length&&eligible.length===1){
  const r=eligible[0];hypothesis={ruleId:r.id,reading:r.reading,candidateIds:r.candidateIds,primaryFamily:r.primaryIds.length?r.primaryFamily:null,primaryIds:r.primaryIds,confirmed:false};
 }
 return {...base,status:!structure.completeHour?'partial':negative.length?'adverse-or-conflicting-motif':hypothesis?'source-relationship-hypothesis':'diagnostic',
  participants,pairs,reviews,hypothesis,negativeRuleIds:negative.map(r=>r.id),positiveRuleIds:positive.map(r=>r.id)};
}
export function refineMixedPreference(prior,mixed,selection){
 const base={...prior,policy:'month-family-preference-v4'};
 if(mixed.status==='adverse-or-conflicting-motif')return {...base,status:'abstained',reason:'mixed-source-adverse-or-conflicting-motif',hypothesis:null};
 const h=mixed.hypothesis;
 if(!h?.primaryFamily||!h.primaryIds.length)return base;
 if(prior.hypothesis&&prior.hypothesis.family!==h.primaryFamily)return {...base,status:'abstained',reason:'mixed-source-versus-prior',hypothesis:null};
 return {...base,status:'hypothesis',reason:null,hypothesis:{family:h.primaryFamily,candidateIds:[...h.primaryIds],
  anchorStems:unique(selection.candidates.filter(c=>h.primaryIds.includes(c.id)).flatMap(c=>c.stems)),
  grounds:['source-scoped-mixed-use',h.ruleId],exactTenGodResolved:false,effectivePatternResolved:false,selectionAuthority:false,confirmed:false}};
}
