import {chartFromReference} from './strength-reference.mjs';
import {analyzeMultiaxisStrength} from '../src/features/strength-multiaxis-v1/index.js';
export function evaluateMultiaxis(fixture){
 const rows=fixture.cases.map(c=>{
  const r=analyzeMultiaxisStrength({saju:chartFromReference(c.pillars),policy:'strength-multiaxis-v1',birthBasis:'verified-chart'});
  return {id:c.id,reference:c.reference,direction:r.direction,axes:r.axes,grounds:r.detail.grounds,
    centralBurden:r.detail.environment.centralBurden,interactionThreats:r.detail.interactions.length};
 });
 const matrix={strong:{strong:0,weak:0,abstained:0},weak:{strong:0,weak:0,abstained:0}};
 for(const r of rows)if(['strong','weak'].includes(r.reference))matrix[r.reference][r.direction??'abstained']++;
 return {fixtureVersion:fixture.version,total:rows.length,matrix,agrees:matrix.strong.strong+matrix.weak.weak,
   disagrees:matrix.strong.weak+matrix.weak.strong,abstained:matrix.strong.abstained+matrix.weak.abstained,rows};
}
