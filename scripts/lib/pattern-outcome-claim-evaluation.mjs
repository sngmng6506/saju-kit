import {rootEvidencePredicates,validRootEvidenceTarget} from '../../src/features/pattern/outcome-root-evidence-contract.js';
import {strengthGuardIds,strengthGuardDefinitions} from '../../src/features/pattern/outcome-strength-guard-contract.js';
// Source claim comparison is not physical-force validation. Never compare
// actual-operation claims to modeled tendency, route existence or clearance.
import {normalizeExposurePillars} from './pattern-outcome-exposure.mjs';
const text=x=>typeof x==='string'&&x.trim().length>0;
const key=x=>JSON.stringify(x);
const same=(a,b)=>key(a)===key(b);
const exact=(x,fields)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===fields.length&&fields.every(k=>Object.hasOwn(x,k));
const actor=x=>['visible:year','visible:month','visible:day','visible:hour'].includes(x);
const states=['supported','opposed','conflicting','unresolved'];
const labels=['yes','no','undetermined','disputed'];
const kinds=['action-effect','route-relief','pair-restriction','pair-transformation','pair-retention','branch-context','role-context','unspecified','strength-guard','root-condition'];
const pairKinds=kinds.filter(k=>k.startsWith('pair-'));
const unsupported=['branch-context','role-context','unspecified','strength-guard','root-condition'];
const sourceFields=['work','commentator','edition','chapter','passage','url'];
const elements=['wood','fire','earth','metal','water'];
const element=(p)=>elements[Math.floor('갑을병정무기경신임계'.indexOf(p[0])/2)];
function relation(chart,from,to){
 const pos=id=>['year','month','day','hour'].indexOf(id.split(':')[1]);
 const a=elements.indexOf(element(chart[pos(from)])),b=elements.indexOf(element(chart[pos(to)]));
 return (b-a+5)%5===1?'generate':(b-a+5)%5===2?'control':null;
}
function validTarget(t,p){
 if(!t||!kinds.includes(t.kind))return false;
 if(t.kind==='root-condition')return validRootEvidenceTarget(t);
 if(t.kind==='strength-guard')return exact(t,['kind','actor','guard'])&&actor(t.actor)&&strengthGuardIds.includes(t.guard);
 if(t.kind==='action-effect')return exact(t,['kind','from','to','relation'])&&actor(t.from)&&actor(t.to)&&t.from!==t.to&&['generate','control'].includes(t.relation)&&relation(p,t.from,t.to)===t.relation;
 if(t.kind==='route-relief')return exact(t,['kind','route','helper','controller','target'])&&['protection','mediation'].includes(t.route)&&[t.helper,t.controller,t.target].every(actor)&&new Set([t.helper,t.controller,t.target]).size===3&&relation(p,t.controller,t.target)==='control'&&(t.route==='protection'?relation(p,t.helper,t.controller)==='control':relation(p,t.controller,t.helper)==='generate'&&relation(p,t.helper,t.target)==='generate');
 if(pairKinds.includes(t.kind)){
  if(!exact(t,['kind','participants'])||!Array.isArray(t.participants)||t.participants.length!==2||!t.participants.every(actor)||new Set(t.participants).size!==2||!same(t.participants,[...t.participants].sort()))return false;
  const stems=t.participants.map(id=>p[['year','month','day','hour'].indexOf(id.split(':')[1])][0]);
  const a='갑을병정무기경신임계'.indexOf(stems[0]),b='갑을병정무기경신임계'.indexOf(stems[1]);
  return (a+5)%10===b;
 }
 return exact(t,['kind','description'])&&text(t.description);
}
export function buildClaimPacket(intake,draft){
 if(!exact(intake,['version','candidates'])||intake.version!=='p1-5b-intake-v1'||!Array.isArray(intake.candidates)||!intake.candidates.length||
  !exact(draft,['version','tasks'])||draft.version!=='p1-5d-claim-draft-v1'||!Array.isArray(draft.tasks)||!draft.tasks.length)throw Error('packet-contract');
 const charts=new Map(),seenCharts=new Set();
 for(const c of intake.candidates){
  const n=normalizeExposurePillars(c?.pillars);
  if(!exact(c,['id','pillars','source'])||!text(c.id)||charts.has(c.id)||!n?.complete||!n.sexagenary||seenCharts.has(key(n.pillars))||
   !exact(c.source,sourceFields)||!sourceFields.every(k=>text(c.source[k])))throw Error('chart-contract');
  charts.set(c.id,{id:c.id,pillars:n.pillars,source:{...c.source}});seenCharts.add(key(n.pillars));
 }
 const tasks=[],ids=new Set(),targets=new Set(),covered=new Set();
 for(const t of draft.tasks){
  const c=charts.get(t?.chartId);
  if(!exact(t,['id','chartId','target'])||!text(t.id)||ids.has(t.id)||!c||!validTarget(t.target,c.pillars)||targets.has(key([t.chartId,t.target])))throw Error('task-contract:'+String(t?.id));
  ids.add(t.id);targets.add(key([t.chartId,t.target]));covered.add(t.chartId);tasks.push({id:t.id,chartId:t.chartId,target:t.target});
 }
 if(covered.size!==charts.size)throw Error('missing-chart-task');
 return {version:'p1-5d-claim-packet-v1',scope:'prospective-source-claims-not-independent-gold',charts:[...charts.values()],tasks,
  instructions:{chartScope:'ordinary | special-or-formation-dependent | uncertain; cite a rationale separately',
   claim:'Does the named source establish the exact proposition for the natal chart? yes/no/undetermined/disputed. No means explicit denial, never source silence. For unspecified or aggregate claims record unresolved if no exact proposition is established.',
   independence:'Do not consult collector readings, model output, previous labels or evaluation reports. Review target identity and scope; if incorrect use undetermined and explain. No claim of independent gold.',
   ...(tasks.some(t=>t.target.kind==='root-condition')?{rootConditions:rootEvidencePredicates,rootEvidence:'Exact natal source condition only. Literal contact, branch-wide damage, strength verdict, and silence do not establish slot retention or actor access. Relief of a clash is not preservation of every constituent. Canonical target inventory is verified by the root review adapter.'}:{}),
   ...(tasks.some(t=>t.target.kind==='strength-guard')?{strengthGuards:strengthGuardDefinitions,guardEvidence:'Quote the explicit source condition for the exact actor and natal scope. A final strong/weak verdict, structural proxy, luck-period claim, or source silence does not establish a guard. A determinate label requires explicit-condition evidence; the schema checks declarations, not the truth of the quotation.'}:{})}};
}
export function claimReviewTemplate(packet,digest){
 return {version:'p1-5d-claim-review-v1',packetDigest:digest,reviewerId:'',noEngineOutputConsulted:null,noPriorLabelsConsulted:null,priorExposure:'unknown',
  charts:packet.charts.map(c=>({chartId:c.id,scope:null,rationale:''})),
  responses:packet.tasks.map(t=>({taskId:t.id,label:null,sourceLocator:'',rationale:'',...(['strength-guard','root-condition'].includes(t.target.kind)?{evidenceBasis:null,sourceExcerpt:''}:{})}))};
}
export function adjudicateClaims(packet,digest,batches){
 const base={independentGoldCases:0,independenceExternallyVerified:false,selectionAuthority:false,expectedCharts:packet.charts.length,expectedTasks:packet.tasks.length};
 if(!Array.isArray(batches)||batches.length<2)return {...base,status:'pending',rows:[],errors:[]};
 const errors=[],ids=new Set(),chartIds=new Set(packet.charts.map(c=>c.id)),taskIds=new Set(packet.tasks.map(t=>t.id)),guardTasks=new Set(packet.tasks.filter(t=>['strength-guard','root-condition'].includes(t.target.kind)).map(t=>t.id)),valid=[];
 for(const b of batches){
  const id=text(b?.reviewerId)?b.reviewerId.trim().toLowerCase():null;
  if(!exact(b,['version','packetDigest','reviewerId','noEngineOutputConsulted','noPriorLabelsConsulted','priorExposure','charts','responses'])||
   b.version!=='p1-5d-claim-review-v1'||b.packetDigest!==digest||!id||ids.has(id)||b.noEngineOutputConsulted!==true||b.noPriorLabelsConsulted!==true||
   !['none-declared','prior-source-exposure','unknown'].includes(b.priorExposure)||!Array.isArray(b.charts)||!Array.isArray(b.responses)){errors.push('review-contract:'+String(id));continue;}
  ids.add(id);const c=new Map(),r=new Map();
  for(const x of b.charts){
   if(!exact(x,['chartId','scope','rationale'])||!chartIds.has(x.chartId)||c.has(x.chartId)||!['ordinary','special-or-formation-dependent','uncertain'].includes(x.scope)||!text(x.rationale)){errors.push('chart-review:'+String(x?.chartId));continue;}
   c.set(x.chartId,x.scope);
  }
  for(const x of b.responses){
   const guard=guardTasks.has(x?.taskId);
   if(!exact(x,['taskId','label','sourceLocator','rationale',...(guard?['evidenceBasis','sourceExcerpt']:[])])||!taskIds.has(x.taskId)||r.has(x.taskId)||!labels.includes(x.label)||!text(x.sourceLocator)||!text(x.rationale)){errors.push('claim-review:'+String(x?.taskId));continue;}
   if(guard&&(!['explicit-condition','verdict-only','structural-proxy','scope-mismatch','source-silent','ambiguous'].includes(x.evidenceBasis)||typeof x.sourceExcerpt!=='string'||
    ['yes','no'].includes(x.label)&&(x.evidenceBasis!=='explicit-condition'||!text(x.sourceExcerpt)))){errors.push('guard-evidence:'+x.taskId);continue;}
   r.set(x.taskId,x.label);
  }
  if(c.size!==chartIds.size||r.size!==taskIds.size)errors.push('review-coverage:'+id);
  valid.push({c,r});
 }
 if(errors.length)return {...base,status:'invalid-review',rows:[],errors};
 const rows=packet.tasks.map(t=>{
  const scopes=valid.map(v=>v.c.get(t.chartId)),values=valid.map(v=>v.r.get(t.id));
  const agreed=values.every(v=>v===values[0]),ordinary=scopes.every(v=>v==='ordinary');
  const status=!agreed?'disagreement':!ordinary?'scope-review-required':!['yes','no'].includes(values[0])?'unresolved-agreement':'determinate-agreement-pending-external-check';
  return {taskId:t.id,chartId:t.chartId,status,scopes,labels:values,agreedLabel:status==='determinate-agreement-pending-external-check'?values[0]:null};
 });
 return {...base,status:'reviewed-pending-external-check',rows,errors};
}
const pick=(xs,pred)=>{
 if(!Array.isArray(xs))return {error:'missing-inventory'};
 const found=xs.filter(pred);return found.length>1?{error:'duplicate-identity'}:{row:found[0]??null};
};
const missing=reason=>({status:'model-scope-gap',reason,state:null});
const invalid=reason=>({status:'invalid-model-output',reason,state:null});
const prediction=(state,diagnostic)=>states.includes(state)?{status:'mapped',state,diagnostic}:invalid('invalid-state');
// The current V10 release is abstention-only. Non-unresolved actual fields
// are a contract violation, not a correct prediction on this release.
const nativeEnvelope=n=>n?.version==='pattern-outcome-decision-v10'&&n.completeHour===true&&n.efficacyReview?.status==='diagnostic'&&n.decisionReview?.status==='abstained'&&n.selectionAuthority===false&&n.efficacyReview?.mechanismReview?.actionSynthesis?.status==='diagnostic'&&Array.isArray(n.efficacyReview.mechanismReview.actionSynthesis.actions)&&['selectedPattern','formed','broken','rescued','assistantGod','patternUsefulGod','usefulElement'].every(k=>n[k]===null);
export function readClaimPrediction(target,native){
 if(!nativeEnvelope(native))return invalid('native-scope-or-authority');
 if(unsupported.includes(target.kind))return missing('unmapped-source-scope');
 const m=native.efficacyReview.mechanismReview;
 const a=m.actionSynthesis.actions;
 if(target.kind==='action-effect'){
  const edgeId=target.from+'>'+target.to,p=pick(a,q=>q.edgeId===edgeId);
  if(p.error)return invalid(p.error);if(!p.row)return missing('exact-edge-not-projected');
  const r=p.row,j=r.actualEffect;
  if(r.from!==target.from||r.to!==target.to||r.kind!==target.relation||j?.kind!=='actual-action-effective'||j.subject!==edgeId||j.level!=='effect-hypothesis'||j.state!=='unresolved')return invalid('action-contract');
  return prediction(j.state,{structural:r.structural?.state??null,direct:r.direct?.state??null,combined:r.combined?.state??null});
 }
 if(target.kind==='route-relief'){
  const edgeId=target.controller+'>'+target.target,id=key([target.route,...[target.helper,target.controller,target.target].map(x=>x.split(':')[1]+':stem')]);
  const p=pick(a,q=>q.edgeId===edgeId);if(p.error)return invalid(p.error);if(!p.row)return missing('pressure-edge-not-projected');
  const q=pick(p.row.interposition?.visibleRoutes,r=>r.pathId===id);
  if(q.error)return invalid(q.error);if(!q.row)return missing('exact-route-not-projected');
  if(q.row.actualReliefState!=='unresolved')return invalid('route-authority');
  return prediction(q.row.actualReliefState,{channel:q.row.proof?.state??null});
 }
 const id=key(target.participants),p=pick(m.combinationPolicyReview?.pairs,q=>q.pairId===id);
 if(p.error)return invalid(p.error);if(!p.row)return missing('exact-pair-not-projected');
 if(!Array.isArray(p.row.participantIds)||!same([...p.row.participantIds].sort(),target.participants))return invalid('pair-binding');
 const state=p.row[{'pair-restriction':'actualRestrictionState','pair-transformation':'actualTransformationState','pair-retention':'actualRetentionState'}[target.kind]];
 if(state!=='unresolved')return invalid('pair-authority');
 return prediction(state,{contactHypothesis:p.row.contactHypothesis??null});
}
// Distinguish coverage, agreement, conflict and scope; fixed denominator
// keeps abstentions and unmapped claims visible. Generic scoring can be
// tested on hypothetical signed predictions without promoting V10.
export function compareClaim(label,p){
 if(!['yes','no'].includes(label))return 'reference-unresolved';
 if(p.status!=='mapped')return p.status;
 if(p.state==='unresolved')return 'model-abstention';
 if(p.state==='conflicting')return 'model-conflict';
 if(!['supported','opposed'].includes(p.state))return 'invalid-model-output';
 return (label==='yes')===(p.state==='supported')?'agreement':'disagreement';
}
export function evaluateClaimComparisons(packet,digest,batches,nativeRows){
 const review=adjudicateClaims(packet,digest,batches),base={independentGoldCases:0,selectionAuthority:false,executionAuthenticityVerified:false};
 if(review.status!=='reviewed-pending-external-check')return {...base,status:review.status,review,rows:[]};
 if(!Array.isArray(nativeRows))return {...base,status:'invalid-model-output',rows:[]};
 const charts=new Map(packet.charts.map(c=>[c.id,c])),models=new Map();
 for(const r of nativeRows){
  const c=charts.get(r?.chartId),n=normalizeExposurePillars(r?.pillars);
  if(!exact(r,['chartId','pillars','native'])||!c||models.has(r.chartId)||!n||!same(n.pillars,c.pillars)||!nativeEnvelope(r.native))return {...base,status:'invalid-model-output',rows:[]};
  models.set(r.chartId,r.native);
 }
 if(models.size!==charts.size)return {...base,status:'invalid-model-output',rows:[]};
 const rows=packet.tasks.map((t,i)=>{
  const ref=review.rows[i],p=readClaimPrediction(t.target,models.get(t.chartId));
  return {taskId:t.id,chartId:t.chartId,kind:t.target.kind,referenceStatus:ref.status,referenceLabel:ref.agreedLabel,prediction:p,
   comparison:compareClaim(ref.agreedLabel,p)};
 });
 const count=xs=>Object.fromEntries(['reference-unresolved','model-scope-gap','invalid-model-output','model-abstention','model-conflict','agreement','disagreement'].map(k=>[k,xs.filter(r=>r.comparison===k).length]));
 const counts=count(rows),determinate=rows.filter(r=>r.referenceLabel!==null).length,resolved=counts.agreement+counts.disagreement;
 return {...base,status:rows.some(r=>r.prediction.status==='invalid-model-output')?'invalid-model-output':'diagnostic-unverified-input',rows,counts,
  mappingCounts:Object.fromEntries(['mapped','model-scope-gap','invalid-model-output'].map(k=>[k,rows.filter(r=>r.prediction.status===k).length])),
  byKind:Object.fromEntries([...new Set(rows.map(r=>r.kind))].map(k=>[k,count(rows.filter(r=>r.kind===k))])),
  denominators:{allTasks:rows.length,determinateReferenceTasks:determinate,resolvedComparableTasks:resolved},
  diagnosticCoverage:determinate?resolved/determinate:null,diagnosticAgreement:resolved?counts.agreement/resolved:null};
}
