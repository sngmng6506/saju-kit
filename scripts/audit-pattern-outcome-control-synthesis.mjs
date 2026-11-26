import {readFileSync} from 'node:fs';
import {replayModeledCoverage,controls,routeControls} from './lib/pattern-modeled-consequence-coverage.mjs';
import {inspectProofObligations,summarizeObligationTargets} from './lib/pattern-outcome-proof-obligations.mjs';
if(process.argv.length!==2)throw Error('development-only audit accepts no external inputs');
const packets=['pattern-outcome-role-policy-source-v1','pattern-modeled-consequence-source-contrast-v1'];
const cases=packets.flatMap(packet=>JSON.parse(readFileSync(new URL('../test/fixtures/'+packet+'.json',import.meta.url),'utf8')).cases.map(c=>({...c,population:'development'})))
 .concat([...controls,...routeControls].map(c=>({...c,population:'synthetic'})));
const rows=[],errors=[];
for(const c of cases)for(const completeHour of [true,false]){
 try{
  const r=replayModeledCoverage(c.pillars,completeHour),q=r.controlSynthesis,status=completeHour?'diagnostic':'partial';
  if(r.invalid.length||q.status!==status||q.selectionAuthority!==false||q.effective!==null||q.summary.actualControlConfirmed!==0)throw Error('synthesis-contract');
  const expected=r.synthesis.actions.filter(a=>a.kind==='control');
  if(expected.length!==q.actions.length||q.actions.some(a=>!expected.some(b=>b.edgeId===a.edgeId&&b.actualEffect.propositionId===a.originalEffectPropositionId)||
   a.actualControlState!=='unresolved'||a.actualReliefState!=='unresolved'||a.selectionAuthority!==false||a.effective!==null||
   !completeHour&&[a.possibleState,a.invariantState,a.directContextState,a.residualContextState].some(s=>s!=='unresolved')))throw Error('action-contract');
  const inspect=k=>inspectProofObligations(q,q.actions.map(a=>({propositionId:a[k],sign:'for'})),completeHour?'complete':'partial');
  const direct=inspect('directContextPropositionId'),residual=inspect('residualContextPropositionId');
  if(direct.status!==status||residual.status!==status)throw Error('proof-frontier');
  rows.push({id:c.id,population:c.population,completeHour,summary:q.summary,actions:q.actions.map(a=>({edgeId:a.edgeId,
   possibleState:a.possibleState,invariantState:a.invariantState,directContextState:a.directContextState,residualContextState:a.residualContextState,
   sideReports:a.sideReports,routeReports:a.routeReports,contact:a.contact,actualControlState:a.actualControlState})),
   directObligations:direct.targets,residualObligations:residual.targets});
 }catch(e){errors.push({id:c.id,completeHour,error:e.message});}
}
const populations=Object.fromEntries(['development','synthetic'].map(p=>{
 const rs=rows.filter(r=>r.population===p&&r.completeHour);
 const count=k=>rs.reduce((n,r)=>n+r.summary[k],0);
 return [p,{charts:rs.length,...Object.fromEntries(['controls','possible','invariant','directContext','residualContext','actualControlConfirmed'].map(k=>[k,count(k)])),
  directObligations:summarizeObligationTargets(rs.flatMap(r=>r.directObligations)),
  residualObligations:summarizeObligationTargets(rs.flatMap(r=>r.residualObligations))}];
}));
console.log(JSON.stringify({version:'p1-relative-control-synthesis-audit-v1',scope:'exposed-development-and-synthetic-not-independent-gold',
 variants:rows.length,expectedVariants:cases.length*2,populations,independentGoldCases:0,selectionAuthority:false,errors,rows},null,2));
if(errors.length||rows.length!==cases.length*2)process.exitCode=1;
