import {patternFamily} from './candidate-source.js';
const source='https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yong-shen-bian-hua';
const full=new Set(['complete-three','complete-seasonal']);
const sorted=xs=>[...new Set(xs)].sort();
const observed=(n,complete)=>n>0?true:complete?false:null;
// Literal hidden stems, projected stems and aggregate slots remain distinct.
// No additional actor, independent supply budget or transformed natal chart.
export function observeBranchAccessContext(prior,access,formation){
 const complete=prior.completeHour;
 const base={version:'outcome-branch-access-context-v1',completeHour:complete,selectionAuthority:false,accessConfirmed:null,transformationConfirmed:null};
 const invalid=()=>({...base,status:'invalid-evidence',hidden:[],formations:[]});
 if(!formation||formation.completeHour!==complete||access.completeHour!==complete)return invalid();
 const actors=prior.stemForce.occurrences,visible=actors.filter(o=>o.layer==='visible'&&!o.dayReference);
 const literals=actors.filter(o=>o.layer==='hidden'),byId=new Map(literals.map(o=>[o.id,o]));
 const branch=formation.formations.filter(f=>f.layer==='branch'),byFormation=new Map(branch.map(f=>[f.id,f]));
 if(byFormation.size!==branch.length||byId.size!==literals.length||access.hidden.length!==literals.length||new Set(access.hidden.map(h=>h.id)).size!==literals.length)return invalid();
 const groups=new Map(access.groups.map(g=>[g.formationId,g]));
 if(groups.size!==access.groups.length||groups.size!==branch.filter(f=>full.has(f.classification)&&f.flags.structurallyComplete&&f.target!==null).length)return invalid();
 for(const g of access.groups){
  const f=byFormation.get(g.formationId);
  if(!f||!full.has(f.classification)||!f.flags.structurallyComplete||f.target!==g.element||JSON.stringify([...f.positions].sort())!==JSON.stringify([...g.positions].sort()))return invalid();
 }
 const hidden=[];
 for(const h of access.hidden){
  const o=byId.get(h.id);
  if(!o||o.position!==h.position||o.stem!==h.stem||o.hiddenRole!==h.role||h.slot!=='branch:'+h.position)return invalid();
  const exact=visible.filter(v=>v.stem===o.stem).map(v=>v.id);
  if(JSON.stringify(sorted(exact))!==JSON.stringify(sorted(h.exactVisibleProjections)))return invalid();
  const same=visible.filter(v=>v.element===o.element&&v.stem!==o.stem).map(v=>v.id);
  const localClashIds=formation.clashes.filter(c=>c.positions.includes(o.position)).map(c=>c.id);
  const local=branch.filter(f=>f.positions.includes(o.position));
  const ownSlotRoot=o.roots.filter(r=>r.position===o.position&&r.match==='exact-stem'&&r.role!=='residual'&&!r.clashExposed);
  hidden.push({occurrenceId:o.id,slot:h.slot,position:o.position,stem:o.stem,element:o.element,tenGod:o.tenGod,hiddenRole:h.role,
   exactProjectionIds:exact,sameElementOtherStemIds:same,exactProjectionObserved:observed(exact.length,complete),
   localClashIds,formationIds:local.map(f=>f.id),ownSlotSubstantialRootObserved:ownSlotRoot.length>0,
   accessHypothesis:!complete?'partial':localClashIds.length?'local-clash-review':exact.length?'exact-projection-observed':h.role==='principal'?'local-principal-context':h.role==='middle'?'local-middle-context':'local-residual-context',
   literalAccessConfirmed:null,independentSupplyConfirmed:null});
 }
 const formations=branch.map(f=>{
  const g=groups.get(f.id),positions=f.positions;
  const retained=hidden.filter(h=>positions.includes(h.position)&&h.element!==f.target&&h.hiddenRole!=='residual');
  const roots=f.roots.filter(r=>r.role!=='residual'&&!r.clashExposed);
  const external=f.visible.filter(v=>!v.isDayMaster&&v.outsideUnclashedRoots.length).map(v=>'visible:'+v.position);
  const clashIds=f.clashOverlap.map(c=>c.id),competingIds=f.competingOverlaps.map(c=>c.id);
  const sameTargetOverlapIds=f.sameTargetOverlaps.map(c=>c.id);
  const supply=f.flags.monthSupports&&f.flags.seasonSupports&&roots.length>0&&external.length>0;
  return {formationId:f.id,classification:f.classification,groupId:g?.id??null,positions:[...positions],includesMonth:positions.includes('month'),
   associatedElement:f.target,structurallyComplete:f.flags.structurallyComplete,monthSupports:f.flags.monthSupports,seasonSupports:f.flags.seasonSupports,
   clashIds,competingIds,sameTargetOverlapIds,targetRootPositions:sorted(roots.map(r=>r.position)),externalRootedProjectionIds:external,
   originalNonTargetSubstantialIds:retained.map(h=>h.occurrenceId),
   accessHypothesis:!complete?'partial':!g?'contact-only-not-aggregate':clashIds.length||competingIds.length?'disrupted-group-review':supply?'target-supply-context':'complete-group-supply-review',
   monthReplacementConfirmed:null,transformationConfirmed:null,independentSupplyConfirmed:null};
 });
 return {...base,status:complete?'diagnostic':'partial',hidden,formations,limitations:['literal-hidden-not-free-stem','exact-projection-not-effective-access','six-harmony-and-pairs-not-aggregate-actors','no-automatic-opening-by-clash']};
}
// Source clauses are scoped to the named day/month and exact positions.
// 月令用神變化 is not a claim that literal elements physically disappear.
export function observeMonthChange(prior,branchContext,monthBranch){
 const complete=prior.completeHour;
 const base={version:'outcome-month-change-context-v1',source,selectionAuthority:false,selectedPattern:null,transformationConfirmed:null,originalPreserved:null};
 const invalid=()=>({...base,status:'invalid-evidence',original:null,projectionAlternatives:[],formationAlternatives:[],sourceClauses:[]});
 if(branchContext.status==='invalid-evidence')return invalid();
 const month=branchContext.hidden.filter(h=>h.position==='month'),principal=month.find(h=>h.hiddenRole==='principal');
 const day=prior.stemForce.occurrences.find(o=>o.dayReference);
 const cs=prior.selection.candidates;
 if(!principal||!day||!cs.some(c=>c.id==='principal:'+principal.stem))return invalid();
 const original={candidateId:'principal:'+principal.stem,occurrenceId:principal.occurrenceId,stem:principal.stem,family:patternFamily(principal.tenGod),exactProjectionIds:principal.exactProjectionIds,preserved:null};
 const projectionAlternatives=month.filter(h=>h.hiddenRole!=='principal'&&h.exactProjectionIds.length).map(h=>({
  candidateId:'projected:'+h.stem,occurrenceId:h.occurrenceId,stem:h.stem,family:patternFamily(h.tenGod),projectionIds:h.exactProjectionIds,
  basis:principal.exactProjectionIds.length?'co-projected-month-stems':'alternate-month-stem-projected',selected:false
 }));
 if(projectionAlternatives.some(a=>!cs.some(c=>c.id===a.candidateId)))return invalid();
 const formationAlternatives=branchContext.formations.filter(f=>f.includesMonth).map(f=>{
  const c=cs.find(c=>c.kind==='month-formation'&&c.formationId===f.formationId);
  return {formationId:f.formationId,groupId:f.groupId,candidateId:c?.id??null,classification:f.classification,element:f.associatedElement,
   possibleTenGods:c?.possibleTenGods??[],possibleFamilies:sorted((c?.possibleTenGods??[]).map(patternFamily).filter(Boolean)),
   basis:f.groupId?'complete-month-group':'month-contact-only',context:f.accessHypothesis,originalRetained:null,selected:false};
 });
 if(formationAlternatives.some(f=>f.groupId&&!f.candidateId))return invalid();
 const visible=prior.stemForce.occurrences.filter(o=>o.layer==='visible'&&!o.dayReference);
 const ids=s=>visible.filter(o=>o.stem===s).map(o=>o.id);
 const presence=s=>observed(ids(s).length,complete);
 const sourceClauses=[];
 const groupIds=element=>formationAlternatives.filter(f=>f.groupId&&f.classification==='complete-three'&&f.element===element).map(f=>f.formationId);
 const add=(id,conditions,interpretation,refs=[])=>{
  const vals=conditions.map(c=>c.observed);
  sourceClauses.push({id,conditions,interpretation,formationIds:refs,matched:vals.includes(false)?false:vals.every(v=>v===true)?true:null,
   interpretationConfirmed:null});
 };
 const present=s=>({kind:'visible-stem',stem:s,ids:ids(s),observed:presence(s)});
 const absent=s=>({kind:'absent-visible-stem',stem:s,ids:ids(s),observed:presence(s)===null?null:!presence(s)});
 const group=element=>({kind:'complete-month-three-harmony',element,ids:groupIds(element),observed:observed(groupIds(element).length,complete)});
 if(day.stem==='기'&&monthBranch==='신')add('ji-shen-output-to-wealth',[absent('경'),present('임')],'wealth-change-review');
 if(day.stem==='정'&&monthBranch==='해')add('ding-hai-officer-to-resource',[group('wood')],'resource-change-review',groupIds('wood'));
 if(day.stem==='병'&&monthBranch==='인'){
  add('bing-yin-resource-to-peer',[group('fire'),absent('갑')],'peer-change-review',groupIds('fire'));
  add('bing-yin-resource-preservation',[group('fire'),{kind:'any-visible-stem',stems:['갑','임'],ids:[...ids('갑'),...ids('임')],observed:observed(ids('갑').length+ids('임').length,complete)}],'original-resource-preservation-review',groupIds('fire'));
 }
 if(day.stem==='병'&&monthBranch==='신'){
  add('bing-shen-wealth-to-killing',[group('water'),absent('경'),present('임')],'killing-change-review',groupIds('water'));
  add('bing-shen-wealth-preservation',[present('임'),present('무')],'original-wealth-preservation-review');
 }
 // Contradictory textual clauses are retained. Never choose on count.
 return {...base,status:complete?'diagnostic':'partial',original,projectionAlternatives,formationAlternatives,sourceClauses,
  limitations:['source-clauses-not-sufficient-conditions','original-and-change-coexist','no-special-pattern-selection','no-literal-element-rewrite']};
}
export function observeBranchRouteAccess(review,context){
 const base={candidateId:review.candidateId,selectionAuthority:false,effective:null};
 if(review.status==='out-of-scope')return {...base,status:'out-of-scope',routes:[]};
 if(context.status==='invalid-evidence')return {...base,status:'invalid-evidence',routes:[]};
 const hidden=new Map(context.hidden.map(h=>[h.occurrenceId,h])),groups=new Map(context.formations.filter(f=>f.groupId).map(f=>[f.groupId,f]));
 const routes=[];
 for(const r of review.rules)for(const w of r.witnesses){
  const mandatory=sorted([...Object.values(w.roles),...w.edges.flatMap(e=>[e.from,e.to])]);
  const alternatives=(w.anchorBindings??[]).map(b=>({anchorId:b.anchorId,ids:sorted([b.anchorId,b.targetId,...(b.edge?[b.edge.from,b.edge.to]:[])].filter(Boolean))}));
  const read=ids=>({hidden:ids.filter(id=>hidden.has(id)).map(id=>({id,slot:hidden.get(id).slot,hypothesis:hidden.get(id).accessHypothesis})),
   groups:ids.filter(id=>groups.has(id)).map(id=>({id,hypothesis:groups.get(id).accessHypothesis}))});
  const primary=read(mandatory);
  const alt=alternatives.map(a=>({anchorId:a.anchorId,...read(a.ids)}));
  if([...mandatory,...alternatives.flatMap(a=>a.ids)].some(id=>id.startsWith('hidden:')&&!hidden.has(id)||id.startsWith('group:')&&!groups.has(id)))return {...base,status:'invalid-evidence',routes:[]};
  if(!primary.hidden.length&&!primary.groups.length&&!alt.some(a=>a.hidden.length||a.groups.length))continue;
  routes.push({ruleId:r.id,witnessId:w.id,mandatory:primary,anchorAlternatives:alt,accessConfirmed:null,effective:null});
 }
 return {...base,status:context.completeHour?'diagnostic':'partial',routes};
}
