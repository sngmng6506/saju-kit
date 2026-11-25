// Development source replay: evidence coverage is not predictive or efficacy accuracy.
const STATES=['supported','opposed','conflicting','unresolved'];
const COLLECTIONS={objective:'objectiveReview.objectives',food:'killingStrategies.food',mediation:'killingStrategies.mediation',dualRoles:'killingWealth.dualRoles',mediationContacts:'killingWealth.mediationContacts',outputDrain:'resourceStrategies.outputDrain',killingSupply:'resourceStrategies.killingSupply',officerContext:'resourceStrategies.officerContext'};
const key=(r,w)=>JSON.stringify([r,w]);
const get=(o,path)=>path.split('.').reduce((v,k)=>v?.[k],o);
const unique=xs=>[...new Set(xs)].sort();
export function validateRoleSourcePacket(packet){
 const errors=[],seen=new Set(),charts=new Set();
 if(packet.version!=='role-policy-source-replay-v1'||packet.independentGold!==0||!Array.isArray(packet.cases)||!packet.cases.length)return ['packet-contract'];
 for(const c of packet.cases){
  const chart=JSON.stringify(c.pillars);
  if(!c.id||seen.has(c.id)||charts.has(chart)||!Array.isArray(c.pillars)||c.pillars.length!==4||
   c.pillars.some(p=>typeof p!=='string'||p.length!==2)||!c.source?.startsWith('https://')||!c.locator||!c.reading||
   !['strong','weak','not-stated'].includes(c.direction)||!['ordinary-review','disputed-special-scope','disputed-interpretation','cross-family-scope-gap'].includes(c.scope)||
   !Array.isArray(c.probes)){errors.push('case-contract:'+c.id);continue;}
  seen.add(c.id);charts.add(chart);
  if(!c.probes.length&&c.scope!=='cross-family-scope-gap')errors.push('no-probes:'+c.id);
  const ids=new Set();
  for(const p of c.probes){
   if(!p.id||ids.has(p.id)||!Object.hasOwn(COLLECTIONS,p.collection)||!p.match||!Object.keys(p.match).length||
    !Object.values(p.match).every(v=>typeof v==='string')||!['literal-chart-endpoints','interpreted-endpoints'].includes(p.basis)||
    !(p.objective===null||typeof p.objective==='string'))errors.push('probe-contract:'+c.id+':'+p.id);
   ids.add(p.id);
  }
 }
 return errors;
}
function summarizePremises(ps){
 if(!Array.isArray(ps))return [];
 return ps.map(p=>({id:p.id,state:p.state}));
}
function inspectCandidate(q,m,probe){
 const path=COLLECTIONS[probe.collection],rows=get(m.rolePriority,path);
 if(!Array.isArray(rows))return {error:'collection-unavailable',rows:[]};
 const witnesses=new Map(q.rules.flatMap(r=>r.witnesses.map(w=>[key(r.id,w.id),w])));
 const matches=rows.filter(x=>Object.entries(probe.match).every(([k,v])=>{
  const w=x.route?witnesses.get(key(x.route.ruleId,x.route.witnessId)):null;
  return (k.startsWith('role.')?get(w?.roles,k.slice(5)):get(x,k))===v;
 }));
 const projected=[];
 for(const x of matches){
  const os=probe.collection==='objective'?[x]:x.objectives??[];
  const selected=probe.objective===null?[x]:os.filter(o=>(o.objective??o.id)===probe.objective);
  if(!selected.length)continue;
  for(const o of selected){
   const status=o.conditionalStatus;
   const ps=summarizePremises(o.premises);
   projected.push({candidateId:q.candidateId,route:x.route??null,anchorId:x.anchorId??null,
    participants:Object.fromEntries(Object.entries(x).filter(([k,v])=>k.endsWith('Id')&&typeof v==='string')),
    status,premises:ps,unresolvedRequirements:o.unresolvedRequirements??x.unresolvedRequirements??[],
    effectConfirmed:o.effectConfirmed,actualDemand:o.actualDemand??null,
    invalid:!STATES.includes(status)||ps.some(p=>!STATES.includes(p.state))||o.effectConfirmed!==null||o.actualDemand!=null});
  }
 }
 return {rows:projected,error:null};
}
function authorityIssues(result){
 const d=result?.decisionReview;
 if(!d)return ['decision-missing'];
 const decisions=[d.pattern,d.purity,...(d.candidates??[]).flatMap(c=>Object.values(c.decisions??{}))];
 const issues=[];
 if(!['abstained','unavailable'].includes(d.status))issues.push('decision-status:'+d.status);
 if(d.selectionAuthority!==false||decisions.some(x=>!x||x.authorized!==false||x.value!==null)||
  Object.values(d.release?.axes??{}).some(x=>x.authorized!==false))issues.push('authority-leak');
 if(result.selectionAuthority!==false||['formed','broken','rescued','selectedPattern','assistantGod','patternUsefulGod','usefulElement'].some(k=>result[k]!==null))issues.push('top-level-authority-leak');
 if(result.efficacyReview?.status==='invalid-evidence')issues.push('invalid-efficacy');
 return issues;
}
export function evaluateRoleSourceCase(c,result,{partial=false}={}){
 const errors=authorityIssues(result),m=result?.efficacyReview?.mechanismReview;
 const active=(result?.reviews??[]).filter(q=>q.family===c.family&&q.status!=='out-of-scope');
 const map=new Map((m?.candidates??[]).map(q=>[q.candidateId,q]));
 if(m&&map.size!==m.candidates.length)errors.push('duplicate-candidate');
 const direction=result?.regulationStrength?.direction??null;
 const directionStatus=c.direction==='not-stated'?'not-labelled':partial?'not-compared-partial':
  direction===c.direction?'aligned-direction':direction==='strong'||direction==='weak'?'opposed-direction':'unresolved-direction';
 const probes=c.probes.map(p=>{
  const rows=[];
  for(const q of active){
   const v=map.get(q.candidateId);
   if(!v){errors.push('missing-candidate:'+q.candidateId);continue;}
   const r=inspectCandidate(q,v,p);
   if(r.error)errors.push(p.id+':'+r.error);
   rows.push(...r.rows);
  }
  if(rows.some(r=>r.invalid))errors.push(p.id+':invalid-projection');
  if(partial&&rows.some(r=>r.premises.some(p=>['day-capacity-hypothesis','day-capacity-for-control','weak-day-mediation-motive'].includes(p.id)&&p.state!=='unresolved')))errors.push(p.id+':partial-day-promotion');
  const states=unique(rows.map(r=>r.status));
  // No existential winner or averaged status across candidates.
  return {id:p.id,basis:p.basis,objective:p.objective,coverage:rows.length?'observed':active.length?'route-or-objective-gap':'family-scope-gap',
   states,rows,conditionalAgreement:null,effectAgreement:null};
 });
 const blockers={};
 for(const d of [result?.decisionReview?.pattern,result?.decisionReview?.purity,...(result?.decisionReview?.candidates??[]).flatMap(c=>Object.values(c.decisions??{}))])for(const b of d?.blockers??[])blockers[b]=(blockers[b]??0)+1;
 const root=m?.roleCapacity?.occurrences??[];
 return {id:c.id,scope:c.scope,family:c.family,source:c.source,locator:c.locator,partial,direction,directionStatus,
  activeCandidates:active.map(q=>q.candidateId),probes,blockers,
  context:{rootedVisibleIds:root.filter(o=>o.layer==='visible'&&o.axes?.anySubstantial===true).map(o=>o.id),
   commandStatus:m?.monthCommandReview?.status??null,rootStatus:m?.rootContext?.status??null},decisionStatus:result?.decisionReview?.status??null,errors,effectAgreement:null};
}
export function summarizeRoleSourceReplay(packet,rows){
 const errors=validateRoleSourcePacket(packet),expected=packet.cases.flatMap(c=>[key(c.id,false),key(c.id,true)]);
 const actual=rows.map(r=>key(r.id,r.partial));
 if(expected.length!==actual.length||new Set(actual).size!==actual.length||expected.some(k=>!actual.includes(k)))errors.push('case-variant-coverage');
 const counts={},directionCounts={},transitions={},blockers={};
 for(const r of rows){
  for(const e of r.errors??[])errors.push(r.id+':'+(r.partial?'partial:':'full:')+e);
  const c=packet.cases.find(c=>c.id===r.id);
  if(!c||!Array.isArray(r.probes)||r.probes.length!==c.probes.length||new Set(r.probes.map(p=>p.id)).size!==c.probes.length||c.probes.some(p=>!r.probes.some(x=>x.id===p.id)))errors.push(r.id+':probe-coverage');
  if(r.partial)continue;
  directionCounts[r.directionStatus]=(directionCounts[r.directionStatus]??0)+1;
  for(const p of r.probes??[]){const k=p.basis+':'+p.coverage;counts[k]=(counts[k]??0)+1;}
  for(const [b,n] of Object.entries(r.blockers??{}))blockers[b]=(blockers[b]??0)+n;
  const partial=rows.find(x=>x.id===r.id&&x.partial);
  for(const p of r.probes??[]){
   const q=partial?.probes?.find(x=>x.id===p.id);if(!q)continue;
   const k=p.coverage+' -> '+q.coverage;transitions[k]=(transitions[k]??0)+1;
  }
 }
 return {version:packet.version,expectedCases:packet.cases.length,expectedVariants:expected.length,executedVariants:rows.length,
  expectedFullProbes:packet.cases.reduce((n,c)=>n+c.probes.length,0),coverageCounts:counts,directionCounts,partialCoverageTransitions:transitions,
  blockerCounts:blockers,errors,independentGold:0,conditionalAccuracy:null,effectAccuracy:null,rows};
}
