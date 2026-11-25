import {readFileSync} from 'node:fs';
import {evaluateMechanismSourceCase,summarizeMechanismSource} from './lib/pattern-outcome-mechanism-source.mjs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const read=n=>JSON.parse(readFileSync(new URL('../test/fixtures/'+n,import.meta.url),'utf8'));
const source=read('pattern-outcome-mechanism-source-v2.json'),prospective=read('pattern-outcome-prospective-v1.json');
const rows=[],errors=[];
const edgeKey=e=>JSON.stringify(e.kind==='combine'?[e.kind,...[e.from,e.to].sort()]:[e.kind,e.from,e.to]);
const refKey=x=>JSON.stringify([x.ruleId,x.witnessId]);
// Probe presence in a sample is structural coverage, not effect agreement.
// A truncated search cannot establish absence from all possible allocations.
export function inspectProbeAllocations(probe,review,joint,mode){
 const a=joint.search?.[mode]?.allocationReview;
 if(!a)return {candidateId:review.candidateId,status:'unavailable',matches:[],effectAgreement:null};
 const expected=edgeKey(probe),entries=new Map(review.rules.flatMap(r=>r.witnesses.map(w=>[refKey({ruleId:r.id,witnessId:w.id}),{r,w}])));
 const matches=[];
 for(const p of a.samples){
  const origins=[];
  for(const x of [p.support,...p.rescues]){
   const entry=entries.get(refKey(x));if(!entry)throw Error('invalid plan route');
   const {r,w}=entry;
   const threat=r.kind==='rescue'?entries.get(refKey({ruleId:r.threatRuleId,witnessId:w.threatWitnessId})):null;
   if(r.kind==='rescue'&&!threat)throw Error('invalid plan threat');
   if(threat?.w.edges.some(e=>edgeKey(e)===expected))origins.push({route:x.witnessId,origin:'bound-threat'});
   if(w.edges.some(e=>edgeKey(e)===expected)&&!threat?.w.edges.some(e=>edgeKey(e)===expected))origins.push({route:x.witnessId,origin:'witness'});
   for(const b of p.anchorAssignments.filter(b=>refKey(b.route)===refKey(x)&&b.edge&&edgeKey(b.edge)===expected))
    origins.push({route:x.witnessId,origin:threat?'bound-threat-anchor':'anchor-option',hypothesis:b.hypothesis??null});
  }
  if(origins.length)matches.push({sampleId:p.id,frontier:a.reviewFrontierIds.includes(p.id),origins});
 }
 return {candidateId:review.candidateId,status:matches.length?'sample-observed':!a.exhaustive?'search-incomplete':!a.samples.length?'no-enumerated-allocation':'not-in-enumerated-allocations',
  examined:a.examined,exhaustive:a.exhaustive,sampleCount:a.samples.length,matches,effectAgreement:null};
}

for(const [population,cases] of [['development-source-assertions',source.cases],['prospective-unlabeled',prospective.cases.filter(c=>c.eligible)]]){
 for(const c of cases)try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const a=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION}),ms=a.efficacyReview.mechanismReview.candidates;
  const active=a.reviews.filter(q=>q.family===c.family&&q.status!=='out-of-scope');
  const probes=population==='development-source-assertions'?evaluateMechanismSourceCase(c,a).map(p=>({...p,
   allocations:active.flatMap(q=>['observed','supportedOnly'].map(mode=>({mode,...inspectProbeAllocations(p,q,ms.find(m=>m.candidateId===q.candidateId).joint,mode)})))})):[];
  const invalid=a.decisionReview.status!=='abstained'||ms.some(m=>m.joint.status==='invalid-evidence'||m.joint.selectionAuthority!==false||m.joint.formed!==null||m.joint.broken!==null||m.joint.rescued!==null);
  const invalidFlow=ms.some(m=>['observed','supportedOnly'].some(k=>{
   const p=m.joint.search?.[k]?.plan;if(!p)return false;
   const f=p.flow;
   return !f||f.selectionAuthority!==false||f.netEffectConfirmed!==null||f.allThreatsResolved!==null||
    f.contacts.some(c=>c.effectConfirmed!==null)||f.sharedRelations.some(x=>x.independentSupplyConfirmed!==null)||
    f.routes.some(r=>r.netEffectConfirmed!==null||r.anchorOptions.some(a=>a.selected!==null));
  }));
  const invalidAllocations=ms.some(m=>['observed','supportedOnly'].some(k=>{
   const a=m.joint.search?.[k]?.allocationReview;if(!m.joint.search)return false;
   return !a||a.selectionAuthority!==false||a.selectedPlan!==null||a.netEffectConfirmed!==null||a.samples.length!==a.feasibleCount||a.samples.length>a.sampleLimit||a.examined>a.visitLimit||new Set(a.samples.map(p=>p.id)).size!==a.samples.length||a.reviewFrontierIds.some(id=>!a.samples.some(p=>p.id===id))||a.samples.some(p=>p.netEffectConfirmed!==null||p.anchorAssignments.some(b=>b.accessConfirmed!==null||k==='supportedOnly'&&b.hypothesis!=='supported'));
  }));
  if(invalid||invalidFlow||invalidAllocations)errors.push({id:c.id,error:'invalid-evidence-or-authority'});
  rows.push({id:c.id,population,probes,candidates:ms.map(m=>({candidateId:m.candidateId,joint:m.joint}))});
 }catch(e){errors.push({id:c.id,error:e.message});}
}
const counts={},flowCounts={},allocationCounts={};for(const r of rows){for(const p of r.probes)counts[p.status]=(counts[p.status]??0)+1;
 for(const c of r.candidates)for(const k of ['observed','supportedOnly']){const f=c.joint.search?.[k]?.plan?.flow;if(f){const id=k+':'+f.status;flowCounts[id]=(flowCounts[id]??0)+1;}
 const a=c.joint.search?.[k]?.allocationReview;if(a){const id=k+':'+a.status;allocationCounts[id]=(allocationCounts[id]??0)+1;}}}
const sourceSummary=summarizeMechanismSource(source,rows.filter(r=>r.population==='development-source-assertions'));
if(!sourceSummary.gatePassed||rows.length!==source.cases.length+prospective.cases.filter(c=>c.eligible).length)errors.push({error:'source-or-case-coverage'});
console.log(JSON.stringify({sourceSummary,scope:'source action assertions vs hypotheses; not accuracy',expectedSourceProbes:source.cases.flatMap(c=>c.probes).length,counts,flowCounts,allocationCounts,independentGold:0,errors,rows},null,2));
if(errors.length)process.exitCode=1;
