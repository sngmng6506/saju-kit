import { stemInfo,branchElement,elementRelation,stemIndex,branchIndex } from '../../core/elements.js';
import { getHiddenStems } from '../../core/hidden-stems.js';
import { tenGodForStem,validateNatalPillars } from '../../core/natal.js';
import { stemCombination } from '../../core/relations.js';
import { branchRelationsV2,analyzeBranchGroupsV2 } from '../../core/extended-relations.js';
import { SajuError } from '../../core/error.js';
const POSITIONS=['year','month','day','hour'];
const LAYERS=['daeun','seun'];
const groupKey=g=>g.type+':'+g.members.join('');
const checkPillar=p=>{
 if(!p||typeof p!=='object'||stemIndex(p.stem)%2!==branchIndex(p.branch)%2||p.text!==p.stem+p.branch)throw new SajuError('pillar','운의 간지가 올바르지 않습니다.');
 return {stem:p.stem,branch:p.branch,text:p.text};
};
function describePillar(p,dayStem){
 const stem={stem:p.stem,...stemInfo(p.stem),tenGod:tenGodForStem(dayStem,p.stem)};
 return {pillar:{...p},stem,branch:{branch:p.branch,element:branchElement(p.branch),
  hiddenStems:getHiddenStems(p.branch).map(h=>({...h,tenGod:tenGodForStem(dayStem,h.stem)}))}};
}
function compare(a,b){
 const stem=stemCombination(a.pillar.stem,b.pillar.stem);
 return {left:a.id,right:b.id,stemCombination:stem,stemRelation:elementRelation(stemInfo(a.pillar.stem).element,stemInfo(b.pillar.stem).element),
  branchRelation:elementRelation(branchElement(a.pillar.branch),branchElement(b.pillar.branch)),
  branchSignals:branchRelationsV2(a.pillar.branch,b.pillar.branch),effectsConfirmed:false};
}
function groupObservations(natal,transits){
 const group=(items)=>analyzeBranchGroupsV2(items.map(x=>x.pillar.branch)).map(g=>({...g,occurrences:items.filter(x=>g.members.includes(x.pillar.branch)).map(x=>({id:x.id,branch:x.pillar.branch}))}));
 const base=group(natal);
 const baseKeys=new Set(base.map(groupKey));
 const all=group([...natal,...transits]);
 return {natal:base,combined:all.map(g=>{
  const requiredTransitLayers=LAYERS.filter(layer=>transits.some(t=>t.id===layer)&&
   !group([...natal,...transits.filter(t=>t.id!==layer)]).some(x=>groupKey(x)===groupKey(g)));
  return {...g,newMembership:!baseKeys.has(groupKey(g)),requiredTransitLayers,effectsConfirmed:false};
 })};
}
export function observeTransitEvidence({saju,daeun=null,seun}={}){
 const pillars=validateNatalPillars(saju);
 const natal=POSITIONS.filter(p=>pillars[p]!==null).map(id=>({id,pillar:checkPillar(pillars[id])}));
 const transits=[...(daeun===null?[]:[{id:'daeun',pillar:checkPillar(daeun)}]),{id:'seun',pillar:checkPillar(seun)}];
 return {completeHour:pillars.hour!==null,layers:transits.map(t=>({id:t.id,...describePillar(t.pillar,pillars.day.stem)})),
  pairs:[...transits.flatMap(t=>natal.map(n=>compare(t,n))),...(transits.length===2?[compare(transits[0],transits[1])]:[])],
  groups:groupObservations(natal,transits),effectsConfirmed:false};
}
// No favorable/unfavorable labels: compare arrivals to conditional anchors.
// Exact stems are preserved separately from elemental matches.
export function compareTransitAnchors(authority,transit){
 return authority.branches.map(b=>({assumedDirection:b.assumedDirection,
  hypotheses:b.hypotheses.map(h=>{
   const sourceStems=[...new Set(h.origins.filter(o=>o.method==='seasonal-source').map(o=>o.stem))];
   const byElement=new Map(h.relations.map(r=>[r.element,r.relation]));
   const layers=transit.layers.map(l=>{
    const arrivals=[{location:'stem',stem:l.stem.stem,element:l.stem.element},
     ...l.branch.hiddenStems.map(x=>({location:'hidden-stem',stem:x.stem,element:x.element,role:x.role}))];
    return {id:l.id,arrivals:arrivals.map(a=>({...a,relationToAnchor:byElement.get(a.element),exactSourceStem:sourceStems.includes(a.stem)})),
     branchElement:{element:l.branch.element,relationToAnchor:byElement.get(l.branch.element)}};
   });
   return {element:h.element,origins:h.origins,layers,favorable:null,unfavorable:null,effectsConfirmed:false};
  }),confirmed:false}));
}
