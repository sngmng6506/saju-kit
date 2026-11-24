import {chartFromReference} from './strength-reference.mjs';
import {analyzeMultiaxisStrengthV2} from '../src/features/strength-multiaxis-v2/index.js';
import {analyzeMultiaxisStrengthV3} from '../src/features/strength-multiaxis-v3/index.js';

export const variants=['baseline','without-route-ground','without-central-root-ground','without-root-minimum','without-wealth-exposure-gate','without-concentrated-pressure-veto','without-resource-weak-veto','without-output-control','without-conditional-resource-gate'];
const categories=['output','wealth','officer'];
export function decideAblation(base,integrated,variant){
 if(!variants.includes(variant))throw Error('unknown ablation');
 const e=base.decision.evidence,root=base.axes.rootCapacity;
 const strongRoot=base.detail.root.centralPrincipal.length>0&&(variant==='without-root-minimum'||root.min>=40);
 const weakRoot=root.max<=20&&base.detail.environment.centralBurden.length>0&&base.detail.environment.scenarios.every(r=>r.pressureDominates);
 const local=variant==='without-wealth-exposure-gate'?e.localAnchoredResources:e.unchallengedResources;
 const support=local.length>0&&(variant==='without-root-minimum'||root.min>0)&&e.supportDominates;
 const rows=integrated.decision.evidence.rows;
 const route=variant!=='without-route-ground'&&(variant==='without-root-minimum'||root.min>0)&&rows.every(r=>{
  const conditional=variant==='without-conditional-resource-gate'?r.conditionalResource>=0:r.conditionalResource>0;
  const burden=variant==='without-output-control'?{...r.burden,output:r.nominalOutput}:r.burden;
  return conditional&&categories.every(k=>r.support>burden[k]);
 });
 // Recompute v2 conflicts from v2 grounds before adding v3 route evidence.
 const priorStrong=(variant!=='without-central-root-ground'&&strongRoot)||support;
 const conflict=(priorStrong&&e.concentratedBurdenCategories.length>0&&variant!=='without-concentrated-pressure-veto')||
  (weakRoot&&local.length>0&&variant!=='without-resource-weak-veto')||(weakRoot&&(priorStrong||route));
 return conflict?null:priorStrong||route?'strong':weakRoot?'weak':null;
}
export function evaluateAblations(fixture){
 const rows=fixture.cases.map(c=>{
  const saju=chartFromReference(c.pillars),birthBasis='verified-chart';
  const base=analyzeMultiaxisStrengthV2({saju,birthBasis,policy:'strength-multiaxis-v2'});
  const integrated=analyzeMultiaxisStrengthV3({saju,birthBasis,policy:'strength-multiaxis-v3'});
  const results=Object.fromEntries(variants.map(v=>[v,decideAblation(base,integrated,v)]));
  if(results.baseline!==integrated.direction)throw Error('baseline mismatch '+c.id);
  return {id:c.id,reference:c.reference,results};
 });
 const labeled=rows.filter(r=>['strong','weak'].includes(r.reference));
 const metrics=Object.fromEntries(variants.map(v=>[v,{
  agree:labeled.filter(r=>r.results[v]===r.reference).length,
  disagree:labeled.filter(r=>r.results[v]&&r.results[v]!==r.reference).length,
  abstain:labeled.filter(r=>!r.results[v]).length,
  changed:rows.filter(r=>r.results[v]!==r.results.baseline).map(r=>r.id)
 }]));
 return {rows,metrics};
}
