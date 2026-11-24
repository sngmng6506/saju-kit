import {chartFromReference} from './strength-reference.mjs';
import {analyzeMultiaxisStrengthV2} from '../src/features/strength-multiaxis-v2/index.js';
export function evaluateMultiaxisV2(fixture){
 const rows=fixture.cases.map(c=>{
  const r=analyzeMultiaxisStrengthV2({saju:chartFromReference(c.pillars),policy:'strength-multiaxis-v2',birthBasis:'verified-chart'});
  return {id:c.id,reference:c.reference,old:r.baselineDirection,new:r.direction,grounds:r.decision.grounds,conflicts:r.decision.conflicts};
 });
 const directional=rows.filter(r=>['strong','weak'].includes(r.reference));
 const counts=key=>[directional.filter(r=>r[key]===r.reference).length,directional.filter(r=>r[key]&&r[key]!==r.reference).length,directional.filter(r=>!r[key]).length];
 return {total:rows.length,old:counts('old'),new:counts('new'),rows};
}
