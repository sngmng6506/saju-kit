import {readFileSync} from 'node:fs';
import {analyzeStemForceEvidence} from '../src/core/stem-force.js';
import {observeRelativeForce} from '../src/core/relative-force.js';
import {analyzeFormationEvidence} from '../src/core/formation-evidence.js';
import {observeRootContext} from '../src/features/pattern/outcome-root-context.js';
import {observeGroundedSupply} from '../src/features/pattern/outcome-grounded-supply.js';
import {observeInterpositionReview} from '../src/features/pattern/outcome-interposition-review.js';
import {observePressureDependencyReview} from '../src/features/pattern/outcome-pressure-dependency.js';
// Fixed exposed development packets. Never accept prospective inputs.
if(process.argv.length!==2)throw Error('development-only audit accepts no external inputs');
const packets=['pattern-outcome-role-policy-source-v1','pattern-modeled-consequence-source-contrast-v1'];
const cases=packets.flatMap(packet=>JSON.parse(readFileSync(new URL('../test/fixtures/'+packet+'.json',import.meta.url),'utf8')).cases.map(c=>({...c,packet})));
const rows=[],errors=[];
for(const c of cases)for(const completeHour of [true,false]){
 try{
  const saju={pillars:Object.fromEntries(['year','month','day','hour'].map((p,i)=>[p,!completeHour&&i===3?null:{stem:c.pillars[i][0],branch:c.pillars[i][1],text:c.pillars[i]}]))};
  const stemForce=analyzeStemForceEvidence({saju}),prior={completeHour,stemForce,relativeForce:observeRelativeForce(stemForce)};
  const root=observeRootContext(prior,analyzeFormationEvidence({saju})),supply=observeGroundedSupply(prior,root),interposition=observeInterpositionReview(prior,root,supply);
  const pressure=observePressureDependencyReview(prior,root,supply,interposition);
  if(pressure.status!==(completeHour?'diagnostic':'partial'))throw Error('pressure-contract');
  const actions=[];
  for(const p of pressure.pressures){
   const d=p.comparisonDiagnostics;
   if(!p.comparison){if(d!==null)throw Error('hidden-diagnostic');continue;}
   if(!d||d.contrast!==p.contrast||d.forceComparison!==null||Object.keys(p.comparison).some(k=>d.views[k].relation!==p.comparison[k])||
    (!completeHour&&Object.values(d.views).some(v=>v.possibleRelations!==null||v.invariantRelation!==null)))throw Error('diagnostic-contract');
   const c=d.contextual;
   if(!c||c.status!==pressure.status||c.forceComparison!==null||c.actualControlState!=='unresolved'||c.selectionAuthority!==false||
    !completeHour&&c.sides.some(q=>q.challengeState!=='unresolved'))throw Error('contextual-contract');
   actions.push({pressureId:p.id,contrast:p.contrast,reason:d.reason,controllerDominanceUnmet:d.controllerDominanceUnmet,
    contextual:c.sides.map(q=>({side:q.side,rootCounterState:q.rootCounterState,resourceCounterState:q.resourceCounterState,challengeState:q.challengeState})),
    views:Object.fromEntries(Object.entries(d.views).map(([k,v])=>[k,{relation:v.relation,leftOnly:v.leftOnly,rightOnly:v.rightOnly,unknown:v.unknown,possibleRelations:v.possibleRelations,invariantRelation:v.invariantRelation}]))});
  }
  rows.push({id:c.id,packet:c.packet,completeHour,actions});
 }catch(e){errors.push({id:c.id,completeHour,error:e.message});}
}
const complete=rows.filter(r=>r.completeHour).flatMap(r=>r.actions),partial=rows.filter(r=>!r.completeHour).flatMap(r=>r.actions);
const count=(xs,fn)=>Object.fromEntries([...new Set(xs.map(fn))].sort().map(k=>[k,xs.filter(x=>fn(x)===k).length]));
const unstable=complete.filter(a=>a.contrast==='direction-not-stable');
console.log(JSON.stringify({version:'p1-relative-force-sensitivity-audit-v1',scope:'development-only-abstract-axis-completions',
 charts:cases.length,variants:rows.length,completeActions:complete.length,partialActions:partial.length,
 contrasts:count(complete,a=>a.contrast),unstableReasons:count(unstable,a=>a.reason),
 sensitivityRelations:count(complete,a=>a.views.sensitivity.relation),
 invariantRelations:count(complete,a=>a.views.sensitivity.invariantRelation??'not-invariant'),
 unresolvedInvariant:count(complete.filter(a=>a.views.sensitivity.relation==='unresolved'),a=>a.views.sensitivity.invariantRelation??'not-invariant'),
 contextualCoverage:{rootCounter:complete.filter(a=>a.contextual.some(q=>q.rootCounterState==='supported')).length,
 resourceCounter:complete.filter(a=>a.contextual.some(q=>q.resourceCounterState==='supported')).length,
 seasonOrderChallenged:complete.filter(a=>a.contextual.some(q=>q.challengeState==='supported')).length,
 mixedSeasonOrderChallenged:unstable.filter(a=>a.reason==='known-opposing-axes'&&a.contextual.some(q=>q.challengeState==='supported')).length},
 independentGoldCases:0,selectionAuthority:false,errors,rows},null,2));
if(errors.length||rows.length!==cases.length*2)process.exitCode=1;
