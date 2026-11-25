// Shared identity and aggregation for nominal scenario contributions.
// The day stem has no quantitative contribution; branch IDs are elemental.
export function contributionMasses(scenario){
 const masses=new Map();
 for(const c of scenario.contributions){
  const id=c.role===null?c.slot.slice(0,-4)+':stem':c.slot.slice(0,-6)+':branch:'+c.element;
  masses.set(id,(masses.get(id)||0)+c.units);
 }
 return masses;
}
