import {chartFromReference} from './strength-reference.mjs';
import {analyzeMultiaxisStrengthV3} from '../src/features/strength-multiaxis-v3/index.js';
export function evaluateMultiaxisV3(fixture){
 const rows=fixture.cases.map(c=>{
  const r=analyzeMultiaxisStrengthV3({saju:chartFromReference(c.pillars),policy:'strength-multiaxis-v3',birthBasis:'verified-chart'});
  return {id:c.id,reference:c.reference,old:r.baselineDirection,new:r.direction,grounds:r.decision.grounds,conflicts:r.decision.conflicts};
 });
 const labeled=rows.filter(r=>['strong','weak'].includes(r.reference));
 const counts=k=>[labeled.filter(r=>r[k]===r.reference).length,labeled.filter(r=>r[k]&&r[k]!==r.reference).length,labeled.filter(r=>!r[k]).length];
 return {rows,old:counts('old'),new:counts('new')};
}
