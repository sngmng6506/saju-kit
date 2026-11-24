// Diagnostic priority of review, not a confirmed useful element.
// No new weights: compare strict category ordering over the entire scenario grid.
const GROUPS={weak:['output','wealth','officer'],strong:['peer','resource']};
const RULES={
 weak:{
  output:[['resource','control-output-and-generate-day']],
  wealth:[['peer','control-wealth-and-assist-day']],
  officer:[['resource','officer-generates-resource-which-generates-day']]
 },
 strong:{
  peer:[['officer','control-peer'],['output','drain-peer']],
  resource:[['wealth','control-resource'],['output','drain-day-despite-resource']]
 }
};
const key=r=>[r.positionProfile,r.roleProfile,r.rootProfile,r.seasonProfile,r.seasonBasis].join(':');
function validateRows(rows,group){
 if(!Array.isArray(rows)||!rows.length||new Set(rows.map(key)).size!==rows.length)throw Error('invalid priority scenario grid');
 for(const r of rows)for(const c of group)if(!Number.isSafeInteger(r.mass?.[c])||r.mass[c]<0)throw Error('invalid priority category mass');
}
function inspect(rows,group){
 const possible=new Set(),ties=rows.filter(r=>{
  const max=Math.max(...group.map(c=>r.mass[c]));
  const leaders=group.filter(c=>r.mass[c]===max);
  leaders.forEach(c=>possible.add(c));
  return leaders.length!==1||max===0;
 }).length;
 return {scenarioCount:rows.length,possibleLeaders:group.filter(c=>possible.has(c)),
  tiedScenarios:ties,dominant:ties===0&&possible.size===1?[...possible][0]:null};
}
export function reviewBalancePriority(branch,standard,neutral){
 const direction=branch.assumedDirection,group=GROUPS[direction];
 if(!group)throw Error('invalid balance direction');
 validateRows(standard,group);validateRows(neutral,group);
 const neutralKeys=new Set(neutral.map(key));
 if(standard.length!==neutral.length||standard.some(r=>!neutralKeys.has(key(r))))throw Error('unmatched priority scenario grid');
 const a=inspect(standard,group),b=inspect(neutral,group);
 const dominant=a.dominant!==null&&a.dominant===b.dominant?a.dominant:null;
 const review=(dominant===null?[]:RULES[direction][dominant]).map(([category,mechanism])=>{
  const candidate=branch.candidates.find(c=>c.category===category);
  if(!candidate)throw Error('missing balance candidate');
  return {category,element:candidate.element,mechanism,presence:candidate.presence,
   unclashedSubstantialRoot:candidate.evidence.unclashedSubstantialRoot,
   activeReviewRelations:candidate.interactions.filter(e=>e.candidatePresent&&e.counterpartPresent).map(e=>e.code),
   effective:null};
 });
 // Mechanism focus is narrower than the original candidates. Absence or
 // damaged roots do not rule out a supplement, and do not establish efficacy.
 const status=dominant===null?'unstable-dominance':review.length>1?'multiple-mechanisms':
  review[0].presence==='absent'?'hypothetical-supplement':
  !review[0].unclashedSubstantialRoot?'limited-root-evidence':'single-mechanism-review';
 return {assumedDirection:direction,standard:a,neutral:b,dominantCategory:dominant,
  status,reviewFocus:review,otherCandidates:branch.candidates.filter(c=>!review.some(x=>x.category===c.category)).map(c=>({category:c.category,element:c.element})),
  ranking:null,selectedElement:null,confirmed:false};
}
