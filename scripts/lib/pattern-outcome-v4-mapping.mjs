import {mapOutcomeReferenceV3} from './pattern-outcome-v3-mapping.mjs';
export function mapOutcomeReferenceV4(row){
 const v3=mapOutcomeReferenceV3(row);
 return {...v3,probes:v3.probes.map(p=>{
  if(p.ruleId!==null)return p;
  const ruleId=p.gap==='conditional-output-support'&&row.family==='resource'?'resource-output-regulation':
   p.gap==='controller-regulation-not-rescue'&&row.family==='blade'?'blade-food-regulation':null;
  return {...p,ruleId};
 })};
}
