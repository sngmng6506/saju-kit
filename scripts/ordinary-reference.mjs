import { chartFromReference } from './strength-reference.mjs';
import { analyzeDayMasterStrength } from '../src/features/strength-hybrid-v1/index.js';
import { analyzeOrdinaryStrength } from '../src/features/strength-ordinary-v2/index.js';
import { analyzeInteractionSensitivity } from '../src/features/interaction-sensitivity-v1/index.js';

// Direction only: degrees collapse into their direction; mixed is not 中和.
const direction=c=>c==='very-strong'?'strong':c==='very-weak'?'weak':c;
function metric(rows,key){
 const matrix={strong:{strong:0,weak:0,mixed:0,abstained:0},weak:{strong:0,weak:0,mixed:0,abstained:0}};
 for(const r of rows){
  if(!['strong','weak'].includes(r.reference))continue;
  const value=direction(r[key])??'abstained';
  matrix[r.reference][value]++;
 }
 const n=Object.values(matrix).reduce((sum,r)=>sum+Object.values(r).reduce((a,b)=>a+b,0),0);
 const abstained=matrix.strong.abstained+matrix.weak.abstained;
 const agrees=matrix.strong.strong+matrix.weak.weak;
 return {n,classified:n-abstained,agrees,disagrees:n-abstained-agrees,abstained,matrix};
}
export function evaluateOrdinaryReferences(fixture){
 const seen=new Set();
 const rows=fixture.cases.map(c=>{
  const key=c.pillars.join(' ');
  if(seen.has(key))throw Error('duplicate chart: '+c.id);
  seen.add(key);
  const saju=chartFromReference(c.pillars),birthBasis='verified-chart';
  const a=analyzeDayMasterStrength({saju,birthBasis,policy:'strength-hybrid-v1'});
  const b=analyzeOrdinaryStrength({saju,birthBasis,policy:'strength-ordinary-v2'});
  const sensitivity=analyzeInteractionSensitivity({saju,birthBasis,policy:'interaction-sensitivity-v1'});
  if(JSON.stringify(a.quantitative)!==JSON.stringify(b.quantitative))throw Error('unexpected quantitative drift');
  const f=sensitivity.formationScenarios.filter(s=>s.status==='simulated');
  return {id:c.id,reference:c.reference,v1:a.category,v2:b.category,v1Structural:a.evidence.qualitativeRule.category==='unresolved'?null:a.evidence.qualitativeRule.category,
    v2Structural:b.qualitative.category,range:{min:b.quantitative.min,max:b.quantitative.max},stable:b.quantitative.stableCategory,
    v1Status:a.status,v2Status:b.status,v1Flags:a.reviewFlags,v2Caveats:b.caveats,
    formationSensitive:f.some(s=>s.quantitativeCategoryChanged),clashSensitive:sensitivity.clashScenarios.some(s=>s.structuralDirectionChanged)};
 });
 return {fixtureVersion:fixture.version,total:rows.length,metrics:Object.fromEntries(['v1','v2','v1Structural','v2Structural'].map(k=>[k,metric(rows,k)])),rows};
}
