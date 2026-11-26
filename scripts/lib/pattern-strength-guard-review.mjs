import {buildClaimPacket,adjudicateClaims} from './pattern-outcome-claim-evaluation.mjs';
import {strengthGuardIds} from '../../src/features/pattern/outcome-strength-guard-contract.js';
import {synthesizeContextualStrength} from '../../src/features/pattern/outcome-strength-synthesis.js';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const day='visible:day';
export function buildStrengthGuardPacket(intake){
 const tasks=intake.candidates.flatMap(c=>strengthGuardIds.map(guard=>({id:JSON.stringify([c.id,day,guard]),chartId:c.id,target:{kind:'strength-guard',actor:day,guard}})));
 const p=buildClaimPacket(intake,{version:'p1-5d-claim-draft-v1',tasks});
 return {...p,scope:'source-guard-review-not-independent-gold',instructions:{...p.instructions,guardPolicy:'Review each condition independently of the final strength direction. Do not choose guards to fit a verdict. Do not infer a negative sign from silence.'}};
}
// Existing historical sources may supply a review queue, not gold.
// Do not copy evidence snippets, previous labels or model results.
export function retrospectiveGuardIntake(audit){
 if(audit?.version!==1||!Array.isArray(audit.entries))throw Error('audit-contract');
 return {version:'p1-5b-intake-v1',candidates:audit.entries.filter(a=>a.basis==='explicit'&&a.scope==='natal'&&a.formation==='ordinary'&&a.verification!=='unreviewed').map(a=>({
  id:JSON.stringify([a.fixture,a.id]),pillars:a.pillars,source:{work:'Historical source collection: '+a.fixture,commentator:a.author,edition:'Verify edition at the cited source',chapter:a.locator,passage:a.locator,url:a.url}
 }))};
}
export function compileReviewedGuardRestrictions(packet,digest,batches){
 const base={selectionAuthority:false,independentGoldCases:0,independenceExternallyVerified:false};
 if(!packet||!Array.isArray(packet.charts)||!Array.isArray(packet.tasks)||!packet.charts.length)return {...base,status:'invalid-review',rows:[]};
 const expected=packet.charts.flatMap(c=>strengthGuardIds.map(guard=>({id:JSON.stringify([c.id,day,guard]),chartId:c.id,target:{kind:'strength-guard',actor:day,guard}})));
 if(!same(packet.tasks,expected)||new Set(packet.charts.map(c=>c.id)).size!==packet.charts.length)return {...base,status:'invalid-review',rows:[]};
 const review=adjudicateClaims(packet,digest,batches);
 if(review.status!=='reviewed-pending-external-check')return {...base,status:review.status,review,rows:[]};
 const rows=packet.charts.map(c=>{
  const tasks=packet.tasks.filter(t=>t.chartId===c.id);
  const conditions=tasks.map(t=>{
   const r=review.rows.find(r=>r.taskId===t.id);
   return {guard:t.target.guard,status:r.status,label:r.agreedLabel};
  });
  return {chartId:c.id,conditions,restrictions:conditions.filter(r=>r.label!==null).map(r=>({targetId:'day:stem',guard:r.guard,value:r.label==='yes'}))};
 });
 return {...base,status:'reviewed-pending-external-check',review,rows};
}
function readDay(result){
 if(result?.status!=='diagnostic'||result.completeHour!==true||result.selectionAuthority!==false||result.effective!==null||result.actualStrengthState!=='unresolved')throw Error('synthesis-contract:'+result?.reason);
 const matches=result.rows.filter(r=>r.targetId==='day:stem');
 if(matches.length!==1)throw Error('day-actor');
 const r=matches[0];
 if(r.analysis.status==='unavailable')return {status:'unavailable',strongPossible:null,weakPossible:null};
 if(r.analysis.status!=='diagnostic')throw Error('analysis-contract');
 const states=id=>{
  const t=r.analysis.targets.find(t=>t.id===id);
  if(!Array.isArray(t?.possibleStates))throw Error('state-inventory');
  return t.possibleStates;
 };
 const s=states(r.strongPropositionId),w=states(r.weakPropositionId);
 if(!s.length||!w.length){
  if(s.length!==w.length||r.scenarioFeasible!==false)throw Error('feasibility-contract');
  return {status:'incompatible-constraints',strongPossible:null,weakPossible:null};
 }
 return {status:'diagnostic',strongPossible:s.includes('supported'),weakPossible:w.includes('supported'),strongStates:s,weakStates:w};
}
// A trusted local replay adapter supplies the chart-derived input, not
// engine conclusions or source labels. Restrictions are only hypotheses.
export function replayReviewedGuards(packet,digest,batches,buildInput){
 const review=compileReviewedGuardRestrictions(packet,digest,batches);
 const base={selectionAuthority:false,actualAccuracy:null,independentGoldCases:0,independenceExternallyVerified:false,review};
 if(review.status!=='reviewed-pending-external-check')return {...base,status:review.status,rows:[]};
 const rows=review.rows.map(r=>{
  try{
   const chart=packet.charts.find(c=>c.id===r.chartId);
   const input=buildInput([...chart.pillars]);
   const baseline=synthesizeContextualStrength({...input,policy:'indirect-support',scenarioRestrictions:[]});
   const restricted=synthesizeContextualStrength({...input,policy:'indirect-support',scenarioRestrictions:r.restrictions});
   if(!same(baseline.packet,restricted.packet)||!same(baseline.judgments,restricted.judgments)||!same(baseline.ruleResults,restricted.ruleResults))throw Error('baseline-proof-changed');
   const a=readDay(baseline),b=readDay(restricted);
   if(a.status==='diagnostic'&&b.status==='diagnostic'&&[...b.strongStates].some(s=>!a.strongStates.includes(s))||
    a.status==='diagnostic'&&b.status==='diagnostic'&&[...b.weakStates].some(s=>!a.weakStates.includes(s)))throw Error('restriction-expanded-state-space');
   return {...r,status:b.status,baseline:a,restricted:b,actualStrengthState:'unresolved'};
  }catch(e){return {...r,status:'invalid-evidence',reason:String(e?.message??e)};}
 });
 return {...base,status:rows.some(r=>r.status==='invalid-evidence')?'invalid-evidence':'diagnostic-unverified-review',rows,
  summary:{charts:rows.length,withRestrictions:rows.filter(r=>r.restrictions.length>0).length,invalid:rows.filter(r=>r.status==='invalid-evidence').length,
   incompatible:rows.filter(r=>r.status==='incompatible-constraints').length,unavailable:rows.filter(r=>r.status==='unavailable').length,
   reducedAmbiguity:rows.filter(r=>r.baseline?.strongPossible&&r.baseline?.weakPossible&&r.restricted?.status==='diagnostic'&&r.restricted.strongPossible!==r.restricted.weakPossible).length}};
}
