// Source-scoped structural subclauses, not sufficient classical conditions.
// Roles: exact monthly anchor, day reference, or visible ten-god participants.
// A rescue extends a specific damage witness without replacing its participants.
const W=['정재','편재'],I=['정인','편인'],O=['정관','편관'],E=['식신','상관'],B=['비견','겁재'];
const s=(id,roles,edges,unresolved)=>({id,kind:'support',roles,edges,unresolved});
const d=(id,roles,edges,unresolved)=>({id,kind:'damage',roles,edges,unresolved});
const r=(id,threat,roles,edges,unresolved)=>({id,kind:'rescue',threat,roles,edges,unresolved});
export const OUTCOME_SOURCE='https://www.tianyashuku.com/yijing/9643/814110.html';
export function outcomeRules(family){
 const table={
 officer:[
  s('officer-wealth',{helper:W,target:'anchor'},[['helper','target','generate']],['wealth-and-officer-effective','month-disruption-absence']),
  s('officer-resource',{target:'anchor',helper:I},[['target','helper','generate']],['resource-protects-officer','month-disruption-absence']),
  d('officer-hurting',{obstacle:['상관'],target:'anchor'},[['obstacle','target','control']],['hurting-effective']),
  d('officer-killing-mix',{obstacle:['편관'],target:'anchor'},[],['actual-mixing','officer-and-killing-relative-force']),
  r('officer-resource-rescue','officer-hurting',{helper:I},[['helper','obstacle','control']],['resource-effective','officer-preserved']),
  r('officer-combine-killing','officer-killing-mix',{helper:B},[['helper','obstacle','combine']],['combination-effective','officer-preserved'])
 ],
 wealth:[
  s('wealth-officer',{target:'anchor',helper:['정관']},[['target','helper','generate']],['wealth-strong','officer-effective']),
  s('wealth-food',{helper:['식신'],target:'anchor'},[['helper','target','generate']],['day-capacity','food-effective']),
  d('wealth-peer',{obstacle:B,target:'anchor'},[['obstacle','target','control']],['wealth-light','peer-heavy']),
  d('wealth-killing',{target:'anchor',obstacle:['편관']},[['target','obstacle','generate']],['killing-uncontrolled']),
  r('wealth-food-mediation','wealth-peer',{helper:E},[['obstacle','helper','generate'],['helper','target','generate']],['mediation-effective','wealth-preserved']),
  r('wealth-officer-rescue','wealth-peer',{helper:['정관']},[['helper','obstacle','control']],['officer-effective','wealth-preserved']),
  r('wealth-food-controls-killing','wealth-killing',{helper:['식신']},[['helper','obstacle','control'],['helper','target','generate']],['food-effective','wealth-preserved']),
  r('wealth-combine-killing','wealth-killing',{helper:B},[['helper','obstacle','combine']],['combination-effective','wealth-preserved'])
 ],
 resource:[
  s('resource-officer',{helper:['정관'],target:'anchor'},[['helper','target','generate']],['officer-resource-effective']),
  s('resource-killing',{helper:['편관'],target:'anchor'},[['helper','target','generate']],['resource-light','killing-effective']),
  d('resource-wealth',{obstacle:W,target:'anchor'},[['obstacle','target','control']],['resource-light','wealth-effective']),
  r('resource-peer-rescue','resource-wealth',{helper:['겁재']},[['helper','obstacle','control']],['peer-effective','resource-preserved']),
  r('resource-combine-wealth','resource-wealth',{helper:B},[['helper','obstacle','combine']],['combination-effective','resource-preserved'])
 ],
 food:[
  s('food-wealth',{target:'anchor',helper:W},[['target','helper','generate']],['food-and-wealth-effective']),
  d('food-owl',{obstacle:['편인'],target:'anchor'},[['obstacle','target','control']],['owl-effective']),
  r('food-wealth-rescue','food-owl',{helper:W},[['helper','obstacle','control'],['target','helper','generate']],['wealth-effective','food-preserved'])
 ],
 killing:[
  s('killing-food',{helper:['식신'],target:'anchor',day:'day'},[['helper','target','control'],['target','day','control'],['day','helper','generate']],['day-capacity','food-killing-balance']),
  d('killing-wealth',{obstacle:W,target:'anchor'},[['obstacle','target','generate']],['killing-uncontrolled']),
  d('killing-resource-blocks-food',{obstacle:I,food:['식신'],target:'anchor'},[['obstacle','food','control'],['food','target','control']],['resource-protects-killing','food-control-blocked']),
  r('killing-wealth-removes-resource','killing-resource-blocks-food',{helper:W},[['helper','obstacle','control']],['wealth-effective','food-control-preserved','wealth-does-not-worsen-killing'])
 ],
 'hurting-officer':[
  s('hurting-wealth',{target:'anchor',helper:W},[['target','helper','generate']],['hurting-and-wealth-effective']),
  s('hurting-resource',{helper:I,target:'anchor'},[['helper','target','control']],['hurting-strong','resource-rooted']),
  d('hurting-officer-conflict',{target:'anchor',obstacle:['정관']},[['target','obstacle','control']],['metal-water-exception','effective-conflict']),
  d('hurting-wealth-killing',{target:'anchor',wealth:W,obstacle:['편관']},[['target','wealth','generate'],['wealth','obstacle','generate']],['killing-pressure','day-capacity']),
  r('hurting-combine-killing','hurting-wealth-killing',{helper:B},[['helper','obstacle','combine']],['combination-effective','wealth-preserved'])
 ],
 blade:[
  s('blade-controller',{target:'day',controller:O},[['controller','target','control']],['blade-controller-effective','wealth-or-resource-support']),
  d('blade-controller-damage',{target:'day',controller:O,obstacle:E},[['controller','target','control'],['obstacle','controller','control']],['controller-damaged']),
  r('blade-resource-rescue','blade-controller-damage',{helper:I},[['helper','obstacle','control']],['resource-heavy','controller-preserved'])
 ],
 peer:[
  s('peer-officer',{target:'day',controller:['정관']},[['controller','target','control']],['peer-regulation','wealth-or-resource-support']),
  s('peer-wealth-output',{target:'day',helper:E,wealth:W},[['target','helper','generate'],['helper','wealth','generate']],['peer-output-wealth-effective']),
  d('peer-officer-hurting',{target:'day',controller:['정관'],obstacle:['상관']},[['controller','target','control'],['obstacle','controller','control']],['officer-damaged']),
  d('peer-wealth-killing',{target:'day',wealth:W,obstacle:['편관']},[['wealth','obstacle','generate'],['obstacle','target','control']],['killing-uncontrolled']),
  r('peer-combine-hurting','peer-officer-hurting',{helper:I},[['helper','obstacle','combine']],['combination-effective','officer-preserved']),
  r('peer-combine-killing','peer-wealth-killing',{helper:B},[['helper','obstacle','combine']],['combination-effective','wealth-preserved'])
 ]};
 return table[family]??[];
}
