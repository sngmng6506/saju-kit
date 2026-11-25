// The strength policy owns its directional hypothesis. This adapter never
// upgrades it to effective force, excess, deficiency or pattern authority.
export function projectRegulationStrength(result,completeHour){
 if(!completeHour)return {policy:'strength-decision-v1',status:'partial-not-assessed',direction:null,grounds:[],conflicts:[],confirmed:false};
 if(!result)return {policy:'strength-decision-v1',status:'unavailable',direction:null,grounds:[],conflicts:[],confirmed:false};
 return {policy:result.version,status:result.status,direction:result.direction??null,
  grounds:[...(result.decision?.grounds??[])],conflicts:[...(result.decision?.conflicts??[])],
  rootCapacity:result.axes?.rootCapacity??null,confirmed:false};
}
export function regulationConditions(strength,{requiresStrong=false}={}){
 const direction=strength.direction;
 const dayCapacity=requiresStrong?
  direction==='strong'?'supporting-hypothesis':direction==='weak'?'opposing-hypothesis':'unresolved':'not-required-by-this-template';
 return {dayCapacity,excess:null,deficiency:null,effectiveRegulation:null,
  controllerPreserved:null,confirmed:false};
}
