import { validateNatalPillars, tenGodForStem } from './natal.js';
import { stemInfo, branchElement, elementRelation } from './elements.js';
import { getHiddenStems, HIDDEN_STEMS_VERSION } from './hidden-stems.js';

const POSITIONS=['year','month','day','hour'];
const SEASONS={spring:['인','묘','진'],summer:['사','오','미'],autumn:['신','유','술'],winter:['해','자','축']};

/**
 * Structural observations only; no weighted root strength, seasonal
 * commander (司令), favorable element, or strong/weak determination.
 */
export function analyzeNatalContext({saju}={}) {
  const pillars=validateNatalPillars(saju);
  const present=POSITIONS.filter(position=>pillars[position]!==null);
  const visible=present.map(position=>({position,stem:pillars[position].stem,...stemInfo(pillars[position].stem)}));
  const hidden=present.flatMap(position=>getHiddenStems(pillars[position].branch).map(entry=>({
    position,branch:pillars[position].branch,...entry,
  })));
  const dayMaster={stem:pillars.day.stem,...stemInfo(pillars.day.stem)};
  // Same-element/opposite-polarity matches remain distinguishable from exact matches.
  const match=(v,h)=>v.stem===h.stem?'exact-stem':v.element===h.element?'same-element':null;
  const rootEvidence=visible.map(v=>({
    position:v.position,stem:v.stem,
    matches:hidden.flatMap(h=>{
      const kind=match(v,h);
      return kind?[{position:h.position,branch:h.branch,stem:h.stem,role:h.role,match:kind}]:[];
    }),
  }));
  const projectionEvidence=hidden.map(h=>({
    position:h.position,branch:h.branch,stem:h.stem,role:h.role,
    matches:visible.flatMap(v=>{
      const kind=match(v,h);
      return kind?[{position:v.position,stem:v.stem,match:kind}]:[];
    }),
  }));
  const monthBranch=pillars.month.branch;
  const monthHidden=hidden.filter(h=>h.position==='month');
  const principal=monthHidden.find(h=>h.role==='principal');
  const season=Object.keys(SEASONS).find(key=>SEASONS[key].includes(monthBranch));
  return {version:'natal-context-v1',completeHour:present.length===4,hiddenStemsBasis:HIDDEN_STEMS_VERSION,
    dayMaster,month:{branch:monthBranch,season,branchElement:branchElement(monthBranch),
      principalStem:principal.stem,principalElement:principal.element,
      principalTenGod:tenGodForStem(dayMaster.stem,principal.stem),
      principalToDay:elementRelation(principal.element,dayMaster.element),
      hiddenStems:monthHidden.map(({stem,role,element})=>({stem,role,element,tenGod:tenGodForStem(dayMaster.stem,stem)}))},
    rootEvidence,projectionEvidence};
}
