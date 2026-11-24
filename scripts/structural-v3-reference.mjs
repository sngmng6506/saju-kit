import { chartFromReference } from './strength-reference.mjs';
import { analyzeStructuralStrength } from '../src/features/strength-structural-v3/index.js';

export function evaluateStructuralV3(fixture){
 const rows=fixture.cases.map(c=>{
  const r=analyzeStructuralStrength({saju:chartFromReference(c.pillars),policy:'strength-structural-v3',birthBasis:'verified-chart'});
  return {id:c.id,reference:c.reference,direction:r.direction,strongGrounds:r.hypothesis.strongGrounds,
    weakGrounds:r.hypothesis.weakGrounds,conflicts:r.hypothesis.conflicts};
 });
 const matrix={strong:{strong:0,weak:0,abstained:0},weak:{strong:0,weak:0,abstained:0}};
 for(const row of rows)if(['strong','weak'].includes(row.reference))matrix[row.reference][row.direction??'abstained']++;
 const agrees=matrix.strong.strong+matrix.weak.weak,disagrees=matrix.strong.weak+matrix.weak.strong;
 return {version:'strength-structural-v3',fixtureVersion:fixture.version,total:rows.length,
  metrics:{agrees,disagrees,abstained:matrix.strong.abstained+matrix.weak.abstained,matrix},rows};
}
