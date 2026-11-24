import {chartFromReference} from './strength-reference.mjs';
import {analyzeStructuralStrength} from '../src/features/strength-structural-v3/index.js';
import {analyzeQuantitativeStrength} from '../src/features/strength-quantitative-v3/index.js';
import {analyzeMultiaxisStrength} from '../src/features/strength-multiaxis-v1/index.js';

function metrics(rows,key){
 const matrix={strong:{strong:0,weak:0,abstained:0},weak:{strong:0,weak:0,abstained:0}};
 for(const r of rows)if(['strong','weak'].includes(r.reference))matrix[r.reference][r[key]??'abstained']++;
 return {agrees:matrix.strong.strong+matrix.weak.weak,disagrees:matrix.strong.weak+matrix.weak.strong,
  abstained:matrix.strong.abstained+matrix.weak.abstained,matrix};
}
export function evaluateWeiReferences(fixture){
 const rows=fixture.cases.map(c=>{
  const saju=chartFromReference(c.pillars),birthBasis='verified-chart';
  const a=analyzeStructuralStrength({saju,birthBasis,policy:'strength-structural-v3'});
  const b=analyzeQuantitativeStrength({saju,birthBasis,policy:'strength-quantitative-v3'});
  const d=analyzeMultiaxisStrength({saju,birthBasis,policy:'strength-multiaxis-v1'});
  return {id:c.id,source:c.source,kind:c.kind,reference:c.reference,formationDependent:c.formationDependent,
    structural:a.direction,quantitative:b.direction,multiaxis:d.direction,axes:d.axes,grounds:d.detail.grounds,
    centralBurden:d.detail.environment.centralBurden,interactionThreats:d.detail.interactions.length,
    allPressureDominates:d.detail.environment.scenarios.every(r=>r.pressureDominates)};
 });
 const summarize=rs=>Object.fromEntries(['structural','quantitative','multiaxis'].map(k=>[k,metrics(rs,k)]));
 return {fixtureVersion:fixture.version,total:rows.length,metrics:summarize(rows),
   byKind:Object.fromEntries(['teaching','commentary'].map(k=>[k,summarize(rows.filter(r=>r.kind===k))])),
   withoutFormationDependent:summarize(rows.filter(r=>!r.formationDependent)),rows};
}
