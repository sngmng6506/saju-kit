import {readFileSync} from 'node:fs';
import {analyzePatternOutcomeV10,PATTERN_OUTCOME_V10_VERSION} from '../src/index.js';
const read=n=>JSON.parse(readFileSync(new URL('../test/fixtures/'+n,import.meta.url),'utf8'));
const source=read('pattern-outcome-mechanism-source-v1.json'),prospective=read('pattern-outcome-prospective-v1.json');
const rows=[],errors=[];
for(const [population,cases] of [['development-source-assertions',source.cases],['prospective-unlabeled',prospective.cases.filter(c=>c.eligible)]]){
 for(const c of cases)try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const a=analyzePatternOutcomeV10({saju,birthBasis:'verified-chart',policy:PATTERN_OUTCOME_V10_VERSION}),ms=a.efficacyReview.mechanismReview.candidates;
  const familyIds=new Set(a.reviews.filter(q=>q.family===c.family).map(q=>q.candidateId));
  const probes=(c.probes??[]).map(p=>{
   const hits=ms.filter(q=>familyIds.has(q.candidateId)).flatMap(q=>q.edges.filter(e=>e.from===p.from&&e.to===p.to&&e.kind===p.kind).map(e=>({candidateId:q.candidateId,status:e.status})));
   return {...p,hits,status:!hits.length?'uncovered':new Set(hits.map(h=>h.status)).size===1?hits[0].status:'candidate-dependent'};
  });
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
   return !a||a.selectionAuthority!==false||a.selectedPlan!==null||a.netEffectConfirmed!==null||a.samples.length!==a.feasibleCount||a.samples.length>a.sampleLimit||a.examined>a.visitLimit||new Set(a.samples.map(p=>p.id)).size!==a.samples.length||a.reviewFrontierIds.some(id=>!a.samples.some(p=>p.id===id))||a.samples.some(p=>p.netEffectConfirmed!==null||p.anchorAssignments.some(b=>b.accessConfirmed!==null));
  }));
  if(invalid||invalidFlow||invalidAllocations)errors.push({id:c.id,error:'invalid-evidence-or-authority'});
  rows.push({id:c.id,population,probes,candidates:ms.map(m=>({candidateId:m.candidateId,joint:m.joint}))});
 }catch(e){errors.push({id:c.id,error:e.message});}
}
const counts={},flowCounts={},allocationCounts={};for(const r of rows){for(const p of r.probes)counts[p.status]=(counts[p.status]??0)+1;
 for(const c of r.candidates)for(const k of ['observed','supportedOnly']){const f=c.joint.search?.[k]?.plan?.flow;if(f){const id=k+':'+f.status;flowCounts[id]=(flowCounts[id]??0)+1;}
 const a=c.joint.search?.[k]?.allocationReview;if(a){const id=k+':'+a.status;allocationCounts[id]=(allocationCounts[id]??0)+1;}}}
console.log(JSON.stringify({scope:'source action assertions vs hypotheses; not accuracy',expectedSourceProbes:source.cases.flatMap(c=>c.probes).length,counts,flowCounts,allocationCounts,independentGold:0,errors,rows},null,2));
if(errors.length)process.exitCode=1;
