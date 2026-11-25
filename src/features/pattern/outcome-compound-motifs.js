// Source-scoped conjunctions, independent of the general graph's overlap
// heuristic. A matched conjunction is not a sufficient classical condition.
const SOURCE='https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yong-shen-cheng-bai-jiu-ying';
const CHANGE='https://www.kaucim.ai/bazi/ziping-zhenquan/lun-yong-shen-yin-cheng-de-bai-yin-bai-de-cheng';
const definitions=[
 {id:'officer-wealth-with-hurting',family:'officer',left:'officer-wealth',right:'officer-hurting',pairs:[['target','target']],source:SOURCE,
  conditions:['wealth-effective','officer-effective','hurting-effective']},
 {id:'wealth-officer-with-officer-injury',family:'wealth',left:'wealth-officer',right:'wealth-secondary-officer-damage',pairs:[['helper','target']],anchor:['target','anchorBindings'],source:SOURCE,
  conditions:['wealth-and-officer-effective','output-injury-effective']},
 {id:'killing-food-with-resource-obstruction',family:'killing',left:'killing-food',right:'killing-resource-blocks-food',pairs:[['target','target'],['helper','food']],source:SOURCE,
  conditions:['food-control-effective','resource-obstruction-effective']},
 {id:'resource-killing-with-wealth-damage',family:'resource',left:'resource-killing',right:'resource-wealth',pairs:[['target','target']],source:SOURCE,
  conditions:['killing-resource-route-effective','wealth-damage-effective']},
 {id:'resource-output-with-wealth',family:'resource',left:'resource-output-regulation',right:'resource-wealth',pairs:[],anchor:['anchorBindings','target'],source:SOURCE,
  conditions:['day-and-resource-strong','output-route-effective','wealth-interference-effective']},
 {id:'resource-excess-regulation-with-killing',family:'resource',left:'resource-wealth-regulation',right:'resource-killing',pairs:[['target','target']],source:CHANGE,
  conditions:['resource-excess','wealth-regulation-effective','killing-resource-route-effective','relative-priority-resolved']}
];
const ref=(ruleId,w)=>({ruleId,witnessId:w.id});
function anchorMatches(def,a,b){
 if(!def.anchor)return true;
 const [l,r]=def.anchor;
 return l==='anchorBindings'?(a.anchorBindings??[]).some(x=>x.anchorId===b.roles[r]):
  (b.anchorBindings??[]).some(x=>x.anchorId===a.roles[l]);
}
export function observeCompoundMotifs(review,completeHour){
 if(review.status==='out-of-scope')return [];
 const rows=definitions.filter(d=>d.family===review.family);
 return rows.map(d=>{
  const left=review.rules.find(r=>r.id===d.left),right=review.rules.find(r=>r.id===d.right);
  const witnesses=(left?.witnesses??[]).flatMap(a=>(right?.witnesses??[]).flatMap(b=>{
   if(!d.pairs.every(([l,r])=>a.roles[l]!==undefined&&a.roles[l]===b.roles[r])||!anchorMatches(d,a,b))return [];
   return [{left:ref(d.left,a),right:ref(d.right,b),matchedRolePairs:d.pairs.map(([l,r])=>({leftRole:l,rightRole:r,occurrenceId:a.roles[l]})),
    anchorBindingRequired:!!d.anchor,effective:null}];
  }));
  return {id:d.id,source:d.source,leftRuleId:d.left,rightRuleId:d.right,witnesses,
   observed:witnesses.length?true:!left||!right||!completeHour?null:false,
   unresolvedConditions:[...d.conditions],conditionResolved:false,outcomeConfirmed:null};
 });
}
