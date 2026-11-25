import {mapOutcomeReferenceV2} from './pattern-outcome-v2-mapping.mjs';
// Map by semantic gap and family, never by a particular chart or output.
export function mapOutcomeReferenceV3(row){
 const v2=mapOutcomeReferenceV2(row);
 return {...v2,probes:v2.probes.map(p=>{
  if(p.ruleId!==null)return p;
  const ruleId=p.gap==='secondary-role-protection'&&['wealth','resource'].includes(row.family)?
   row.family+'-secondary-officer-resource-rescue':
   p.gap==='support-loss-not-anchor-destruction'&&row.family==='officer'?'officer-wealth-resource-support-loss':null;
  return {...p,ruleId};
 })};
}
