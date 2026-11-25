import {mapOutcomeReferenceV4} from './pattern-outcome-v4-mapping.mjs';
// Evaluation-only source motif to method mapping. No chart IDs in runtime.
export function mapOutcomeReferenceV5(row){
 const v4=mapOutcomeReferenceV4(row);
 return {...v4,probes:v4.probes.map(p=>{
  if(p.ruleId!==null||row.family!=='peer'||p.gap!=='peer-officer-killing-clear')return p;
  const ruleId=p.id==='peer-officer-killing-clear'?'peer-combine-killing-preserve-officer':
   p.id==='peer-food-protect-officer'?'peer-food-controls-killing-preserve-officer':null;
  return {...p,ruleId};
 })};
}
