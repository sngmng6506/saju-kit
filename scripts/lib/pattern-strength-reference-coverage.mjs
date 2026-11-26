import {normalizeExposurePillars} from './pattern-outcome-exposure.mjs';
const key=x=>JSON.stringify(x),directional=x=>['strong','weak'].includes(x);
const nonblank=x=>typeof x==='string'&&x.trim().length>0;
const group=(rows,fn)=>Object.fromEntries([...new Set(rows.map(fn))].sort().map(k=>[k,rows.filter(r=>fn(r)===k).length]));
// Retrospective source labels are not independent gold. A chapter family
// or role participant is never converted into a strength or efficacy label.
export function buildReferenceCoverageCohort(audit,patterns){
 if(audit?.version!==1||!Array.isArray(audit.entries)||patterns?.version!=='pattern-classical-v2'||!Array.isArray(patterns.cases))throw Error('reference-contract');
 const seen=new Set(),ids=new Set(),rows=[];
 for(const a of audit.entries){
  const p=normalizeExposurePillars(a?.pillars),id=key([a?.fixture,a?.id]);
  if(!p?.complete||!p.sexagenary||!directional(a.reference)||!['fixture','id','author','url','locator','evidence','review'].every(k=>nonblank(a[k]))||
   !['explicit','inferred','ambiguous'].includes(a.basis)||!['natal','luck-modified','element-only','ambiguous'].includes(a.scope)||
   !['ordinary','dependent','uncertain'].includes(a.formation)||!['unreviewed','electronic-text-checked','scan-checked'].includes(a.verification)||ids.has(id)||seen.has(key(p.pillars)))throw Error('strength-reference:'+id);
  ids.add(id);seen.add(key(p.pillars));
  const primary=a.basis==='explicit'&&a.scope==='natal'&&a.formation==='ordinary'&&a.verification!=='unreviewed';
  rows.push({id,pillars:p.pillars,reference:a.reference,cohort:primary?'primary':'secondary',author:a.author,verification:a.verification,
   source:{fixture:a.fixture,id:a.id,url:a.url,locator:a.locator,review:a.review,basis:a.basis,scope:a.scope,formation:a.formation}});
 }
 const patternRows=patterns.cases.map(c=>{
  const p=normalizeExposurePillars(c.pillars),a=c.annotation;
  if(!nonblank(c.id)||!p?.complete||!a||!['chapter-family-only','review-only'].includes(a.scope))throw Error('pattern-reference:'+c.id);
  return {id:c.id,pillars:p.pillars,scope:a.scope,sourceSelectedFamily:a.sourceSelectedFamily??null,formed:a.formed??null,assistant:a.selectedAssistantStem??null};
 });
 if(new Set(patternRows.map(r=>r.id)).size!==patternRows.length)throw Error('pattern-id');
 const primary=rows.filter(r=>r.cohort==='primary');
 return {rows,inventory:{strength:rows.length,primary:primary.length,secondary:rows.length-primary.length,primaryDirections:group(primary,r=>r.reference),primaryVerification:group(primary,r=>r.verification),
  pattern:patternRows.length,patternScopes:group(patternRows,r=>r.scope),patternSelectedFamily:patternRows.filter(r=>r.sourceSelectedFamily!==null).length,
  patternFormationLabels:patternRows.filter(r=>r.formed!==null).length,patternAssistantLabels:patternRows.filter(r=>r.assistant!==null).length,
  exactChartOverlap:patternRows.filter(r=>seen.has(key(r.pillars))).map(r=>r.id)},independentGoldCases:0};
}
// The day-master's literal observations, not a strength prediction.
// This function does not receive a source reference label.
export function observeReferenceBasis(prior,root){
 const actors=prior?.stemForce?.occurrences?.filter(a=>a.dayReference===true&&a.layer==='visible')??[];
 const rows=root?.occurrences?.filter(a=>a.id==='visible:day')??[];
 if(prior?.completeHour!==true||root?.status!=='diagnostic'||root.completeHour!==true||root.selectionAuthority!==false||root.rootEffectConfirmed!==null||actors.length!==1||rows.length!==1||actors[0].id!==rows[0].id)throw Error('day-basis-contract');
 const a=actors[0],r=rows[0];
 if(!Array.isArray(r.uncontestedRootIds)||!Array.isArray(r.contestedRootIds)||typeof r.seasonal?.seasonSupport!=='boolean'||typeof r.seasonal?.principalSupport!=='boolean'||!Array.isArray(a.controlReceived)||!Array.isArray(a.outputAndControl))throw Error('day-basis-fields');
 return {seasonSupport:r.seasonal.seasonSupport,principalSupport:r.seasonal.principalSupport,
  substantialRootObserved:r.uncontestedRootIds.length+r.contestedRootIds.length>0,
  uncontestedRootObserved:r.uncontestedRootIds.length>0,localControlObserved:a.controlReceived.some(e=>e.local),
  localDrainObserved:a.outputAndControl.some(e=>e.local&&e.type==='generate')};
}
// Only a possibility/expressivity result, not agreement or accuracy.
// All baseline actual strengths must remain unresolved.
export function observeSynthesisCoverage(synthesis){
 if(synthesis?.status!=='diagnostic'||synthesis.completeHour!==true||synthesis.selectionAuthority!==false||synthesis.effective!==null||synthesis.actualStrengthState!=='unresolved'||synthesis.summary?.actualEffectsConfirmed!==0)throw Error('synthesis-contract');
 const rows=synthesis.rows.filter(r=>r.targetId==='day:stem');
 if(rows.length!==1||rows[0].actualStrengthState!=='unresolved')throw Error('day-synthesis-contract');
 const r=rows[0];
 if(r.analysis.status==='unavailable')return {status:'unavailable',strongPossible:null,weakPossible:null};
 if(r.analysis.status!=='diagnostic')throw Error('day-analysis-contract');
 const read=id=>{
  const t=r.analysis.targets.filter(t=>t.id===id);
  if(t.length!==1||!Array.isArray(t[0].possibleStates)||!t[0].possibleStates.length||t[0].possibleStates.some(s=>!['supported','opposed','conflicting','unresolved'].includes(s)))throw Error('target-state-contract');
  return t[0].possibleStates.includes('supported');
 };
 return {status:'diagnostic',strongPossible:read(r.strongPropositionId),weakPossible:read(r.weakPropositionId)};
}
// Literal demand/exposure and rooted operation are different predicates.
 // Reuse the existing burden graph; do not fabricate a weak-strength rule.
export function observeBurdenObligations(burden,synthesis){
 if(burden?.status!=='diagnostic'||burden.completeHour!==true||burden.selectionAuthority!==false||burden.effective!==null||burden.actualMagnitudeComparison!=='unresolved')throw Error('burden-contract');
 const coverage=observeSynthesisCoverage(synthesis);
 const a=burden.analysis,day='day:stem';
 if(a?.status!=='diagnostic'||a.selectionAuthority!==false||a.actualMagnitudeComparison!=='unresolved'||!Array.isArray(a.rows)||!Array.isArray(a.actionRows))throw Error('burden-analysis-contract');
 const rows=a.rows.filter(r=>r.targetId===day);
 const sr=synthesis.rows.find(r=>r.targetId===day);
 if(rows.length!==1||rows[0].supportPropositionId!==sr.support||!Array.isArray(rows[0].groups)||rows[0].groups.length!==3)throw Error('burden-day-binding');
 const frontier=a.frontier;
 if(!['diagnostic','unavailable'].includes(frontier?.status))throw Error('burden-frontier-contract');
 const frontiers=new Map((frontier.frontiers??[]).map(f=>[f.id,f.terms]));
 if(frontiers.size!==(frontier.frontiers??[]).length)throw Error('duplicate-frontier');
 const possible=id=>{
  if(frontier.status==='unavailable')return null;
  const terms=frontiers.get(id);
  if(!Array.isArray(terms))throw Error('missing-frontier:'+id);
  return terms.length>0;
 };
 const groups=['incoming-control','outgoing-generation','outgoing-control'].map((kind,i)=>{
  const matches=rows[0].groups.filter(g=>g.kind===kind),g=matches[0];
  if(matches.length!==1||g.propositionId!==[sr.control,sr.drain,sr.expenditure][i]||!Array.isArray(g.actionIds)||new Set(g.actionIds).size!==g.actionIds.length)throw Error('burden-group-binding');
  const actions=a.actionRows.filter(x=>kind==='incoming-control'?x.kind==='control'&&x.to===day:x.from===day&&x.kind===(kind==='outgoing-generation'?'generate':'control'));
  if(actions.length!==g.actionIds.length||actions.some(x=>!g.actionIds.includes(x.id)||x.actualOperationState!=='unresolved')||new Set(actions.map(x=>x.id)).size!==actions.length)throw Error('burden-action-binding');
  const rooted=possible(g.propositionId);
  if(rooted!==null&&rooted!==actions.some(x=>possible(x.propositionId)))throw Error('burden-frontier-parity');
  return {kind,literalCandidates:actions.length,rootedBasisPossible:rooted,
   state:rooted===null?'unevaluated':rooted?'rooted-basis-possible':actions.length?'literal-without-rooted-basis':'no-literal-candidate'};
 });
 const directSeeds=synthesis.packet.rules.filter(r=>r.conclusion.propositionId===sr.direct&&r.conclusion.sign==='for').length;
 const support=possible(sr.support);
 const control=groups[0],drain=groups[1],expenditure=groups[2];
 const obligations=[];
 if(coverage.status==='diagnostic'){
  if(!coverage.strongPossible)obligations.push(directSeeds?'strong-alternative-not-expressible':'direct-root-required-by-strong-alternative');
  if(!coverage.weakPossible){
   if(control.state==='literal-without-rooted-basis')obligations.push('incoming-control-rooted-source-gate');
   if(drain.state==='literal-without-rooted-basis')obligations.push('outgoing-generation-rooted-source-gate');
   if(expenditure.literalCandidates)obligations.push('wealth-demand-not-a-weakness-premise');
   if(!control.literalCandidates&&!drain.literalCandidates)obligations.push('no-local-control-or-drain-candidate');
  }
 }
 return {status:frontier.status,directSeeds,supportBasisPossible:support,groups,obligations,actualMagnitudeComparison:'unresolved'};
}
export function summarizeReferenceCoverage(cohort,observations){
 const byId=new Map(observations.map(o=>[o.id,o]));
 if(byId.size!==observations.length||cohort.rows.length!==byId.size||cohort.rows.some(r=>!byId.has(r.id)))throw Error('observation-coverage');
 const rows=cohort.rows.map(r=>{
  const o=byId.get(r.id);
  if(o.error)return {...r,status:'invalid-evidence',reason:o.error,...(o.basis?{basis:o.basis}:{})};
  const b=o.basis,s=o.synthesis;
  if(!b||['seasonSupport','principalSupport','substantialRootObserved','uncontestedRootObserved','localControlObserved','localDrainObserved'].some(k=>typeof b[k]!=='boolean'))throw Error('basis-coverage');
  if(s!==undefined&&s!==null&&(!['diagnostic','unavailable'].includes(s.status)||s.status==='diagnostic'&&[s.strongPossible,s.weakPossible].some(v=>typeof v!=='boolean')||s.status==='unavailable'&&(s.strongPossible!==null||s.weakPossible!==null)))throw Error('possibility-contract');
  const directionClass=s?.status==='diagnostic'?(s.strongPossible?(s.weakPossible?'both-directions':'strong-only'):(s.weakPossible?'weak-only':'neither-direction')):'unevaluated';
  const possibility=s?.status==='diagnostic'?(r.reference==='strong'?s.strongPossible:s.weakPossible):null;
  if(s?.status==='diagnostic'&&typeof possibility!=='boolean')throw Error('possibility-contract');
  return {...r,status:'diagnostic',basis:b,synthesis:s??null,referenceDirectionExpressible:possibility,directionClass,obligations:o.obligations??null};
 });
 const primary=rows.filter(r=>r.cohort==='primary'&&r.status==='diagnostic');
 const distribution=rs=>Object.fromEntries(['both-directions','strong-only','weak-only','neither-direction','unevaluated'].map(k=>[k,rs.filter(r=>r.directionClass===k).length]));
 return {version:'p3-strength-reference-coverage-v1',inventory:cohort.inventory,independentGoldCases:0,selectionAuthority:false,actualAccuracy:null,
  directionDistribution:distribution(rows.filter(r=>r.status==='diagnostic')),
  primary:{evaluated:primary.length,directionDistribution:distribution(primary),offSeasonStrong:primary.filter(r=>r.reference==='strong'&&!r.basis.seasonSupport).length,
   seasonSupportedWeak:primary.filter(r=>r.reference==='weak'&&r.basis.seasonSupport).length,
   strongWithoutSubstantialRoot:primary.filter(r=>r.reference==='strong'&&!r.basis.substantialRootObserved).length,
   weakWithoutLocalControlOrDrain:primary.filter(r=>r.reference==='weak'&&!r.basis.localControlObserved&&!r.basis.localDrainObserved).length,
   expressible:primary.filter(r=>r.referenceDirectionExpressible===true).length,notExpressible:primary.filter(r=>r.referenceDirectionExpressible===false).length,
   unevaluatedPossibility:primary.filter(r=>r.referenceDirectionExpressible===null).length},
  referenceGaps:rows.filter(r=>r.status==='diagnostic'&&r.referenceDirectionExpressible===false).map(r=>({id:r.id,cohort:r.cohort,reference:r.reference,directionClass:r.directionClass,obligations:r.obligations})),
  invalid:rows.filter(r=>r.status==='invalid-evidence').length,rows,limitations:['retrospective-labels-not-independent','possibility-not-prediction','literal-chart-not-birth-verification','no-effect-authority']};
}
