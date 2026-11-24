import {chartFromReference} from './strength-reference.mjs';
import {analyzeMultiaxisStrengthV2} from '../src/features/strength-multiaxis-v2/index.js';
import {analyzeStructuralStrength} from '../src/features/strength-structural-v3/index.js';
import {analyzeQuantitativeStrength} from '../src/features/strength-quantitative-v3/index.js';
export function evaluateRanYuan(fixture){
 const rows=fixture.cases.map(c=>{
  const saju=chartFromReference(c.pillars),birthBasis='verified-chart';
  const a=analyzeMultiaxisStrengthV2({saju,birthBasis,policy:'strength-multiaxis-v2'});
  return {id:c.id,reference:c.reference,v1:a.baselineDirection,v2:a.direction,
   structural:analyzeStructuralStrength({saju,birthBasis,policy:'strength-structural-v3'}).direction,
   quantitative:analyzeQuantitativeStrength({saju,birthBasis,policy:'strength-quantitative-v3'}).direction,
   roots:a.axes.rootCapacity,grounds:a.decision.grounds,conflicts:a.decision.conflicts};
 });
 const labeled=rows.filter(r=>['strong','weak'].includes(r.reference));
 return {rows,counts:Object.fromEntries(['v1','v2','structural','quantitative'].map(k=>[k,[labeled.filter(r=>r[k]===r.reference).length,labeled.filter(r=>r[k]&&r[k]!==r.reference).length,labeled.filter(r=>!r[k]).length]]))};
}
