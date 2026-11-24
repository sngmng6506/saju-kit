import { chartFromReference } from './strength-reference.mjs';
import { analyzeDayMasterStrength } from '../src/features/strength-hybrid-v1/index.js';
import { analyzeStructuralStrength } from '../src/features/strength-structural-v3/index.js';
import { analyzeQuantitativeStrength } from '../src/features/strength-quantitative-v3/index.js';
function metric(rows,key){
 const matrix={strong:{strong:0,weak:0,abstained:0},weak:{strong:0,weak:0,abstained:0}};
 for(const r of rows)if(['strong','weak'].includes(r.reference))matrix[r.reference][r[key]??'abstained']++;
 return {agrees:matrix.strong.strong+matrix.weak.weak,disagrees:matrix.strong.weak+matrix.weak.strong,
   abstained:matrix.strong.abstained+matrix.weak.abstained,matrix};
}
export function evaluateQuantitativeV3(fixture){
 const rows=fixture.cases.map(c=>{
  const saju=chartFromReference(c.pillars),birthBasis='verified-chart';
  const old=analyzeDayMasterStrength({saju,birthBasis,policy:'strength-hybrid-v1'}).quantitative;
  const a=analyzeStructuralStrength({saju,birthBasis,policy:'strength-structural-v3'});
  const b=analyzeQuantitativeStrength({saju,birthBasis,policy:'strength-quantitative-v3'});
  const q=b.quantitative;
  return {id:c.id,reference:c.reference,oldRange:[old.min,old.max],oldDirection:['strong','weak'].includes(old.stableCategory)?old.stableCategory:null,
    structural:a.direction,newRange:[q.min,q.max],quantitative:b.direction,scenarioCount:q.scenarioCount,
    intersection:a.direction&&a.direction===b.direction?a.direction:null};
 });
 return {fixtureVersion:fixture.version,total:rows.length,metrics:Object.fromEntries(['oldDirection','structural','quantitative','intersection'].map(k=>[k,metric(rows,k)])),rows};
}
