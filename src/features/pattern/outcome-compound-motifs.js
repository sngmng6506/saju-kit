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

 // 財去印存食 and 生不足之煞: exact bound threat, rescue and supply
 // are a conjunction, not a sufficient condition for beneficial wealth.
export function observeKillingWealthDualRole(review,completeHour){
 if(review.status==='out-of-scope'||review.family!=='killing')return [];
 const rescue=review.rules.find(r=>r.id==='killing-wealth-removes-resource'&&r.kind==='rescue');
 const damage=review.rules.find(r=>r.id==='killing-resource-blocks-food'&&r.kind==='damage');
 const feed=review.rules.find(r=>r.id==='killing-wealth'&&r.kind==='damage');
 const has=(w,from,to,kind)=>w.edges.some(e=>e.from===from&&e.to===to&&e.kind===kind);
 const witnesses=[];
 if(rescue&&damage&&feed&&rescue.threatRuleId===damage.id)for(const w of rescue.witnesses){
  const t=damage.witnesses.find(t=>t.id===w.threatWitnessId);
  const {helper,obstacle,food,target}=w.roles;
  if(!t||![helper,obstacle,food,target].every(x=>typeof x==='string'&&x)||new Set([helper,obstacle,food,target]).size!==4||
    !Object.entries(t.roles).every(([k,v])=>w.roles[k]===v)||
    !has(t,obstacle,food,'control')||!has(t,food,target,'control')||!has(w,helper,obstacle,'control'))continue;
  for(const f of feed.witnesses){
   if(f.roles.obstacle!==helper||f.roles.target!==target||!has(f,helper,target,'generate'))continue;
   witnesses.push({left:ref(rescue.id,w),right:ref(feed.id,f),boundThreat:ref(damage.id,t),
    matchedRolePairs:[{leftRole:'helper',rightRole:'obstacle',occurrenceId:helper},{leftRole:'target',rightRole:'target',occurrenceId:target}],
    paths:{resourceObstructsOutput:{from:obstacle,to:food,kind:'control'},outputControlsKilling:{from:food,to:target,kind:'control'},
     wealthControlsResource:{from:helper,to:obstacle,kind:'control'},wealthGeneratesKilling:{from:helper,to:target,kind:'generate'}},
    alternativeInterpretations:['wealth-feeds-uncontrolled-killing','wealth-relieves-output-obstruction-and-supplies-insufficient-killing'],
    killingDeficiencyConfirmed:null,outputRestored:null,netEffectConfirmed:null,effective:null});
  }
 }
 return [{id:'killing-wealth-rescue-with-killing-supply',source:'https://changxianyi.com/guji/ziping/wz-20260914/chapter-040/',
  leftRuleId:'killing-wealth-removes-resource',rightRuleId:'killing-wealth',witnesses,
  observed:witnesses.length?true:completeHour&&rescue&&damage&&feed?false:null,
  unresolvedConditions:['killing-deficiency','wealth-effective-against-resource','output-control-restored','day-capacity','net-killing-pressure'],
  conditionResolved:false,outcomeConfirmed:null}];
}
