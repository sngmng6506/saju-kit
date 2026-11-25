import { elementRelation, stemInfo } from '../../core/elements.js';
import { getHiddenStems } from '../../core/hidden-stems.js';
import { analyzeNatalContext } from '../../core/natal-context.js';
import { analyzeNatalRelations } from '../../core/natal-relations.js';
import { validateNatalPillars } from '../../core/natal.js';

export const CATEGORIES = Object.freeze(['peer','resource','output','wealth','officer']);
export const isSupport = category => category === 'peer' || category === 'resource';

export function classifyElement(day, target) {
  const {type,direction} = elementRelation(day,target);
  if (type === 'same') return 'peer';
  if (type === 'generate') return direction === 'left-to-right' ? 'output' : 'resource';
  return direction === 'left-to-right' ? 'wealth' : 'officer';
}

const POSITIONS = ['year','month','day','hour'];
const ROOT_ORDER = ['month','day','hour','year'];
const ROLE_ORDER = ['principal','middle','residual'];

export function collectEvidence(saju) {
  const pillars = validateNatalPillars(saju);
  const context = analyzeNatalContext({saju});
  const relations = analyzeNatalRelations({saju});
  const classify = element => classifyElement(context.dayMaster.element,element);
  const roots = ROOT_ORDER.filter(position=>pillars[position]!==null).map(position=>{
    const matches = context.rootEvidence.find(item=>item.position==='day').matches.filter(item=>item.position===position);
    const role = ROLE_ORDER.find(value=>matches.some(item=>item.role===value)) ?? null;
    const substantial = role==='principal' || (role==='middle' && ['month','day'].includes(position));
    return {position,branch:pillars[position].branch,matches,role,
      grade:substantial?'substantial':role?'minor':'none'};
  });
  const stems = context.rootEvidence.filter(item=>item.position!=='day').map(item=>{
    const category = classify(stemInfo(item.stem).element);
    const anchor = item.matches.some(match=>match.role!=='residual')?'substantial':item.matches.length?'minor':'none';
    return {...item,category,anchor};
  });
  const branches = POSITIONS.filter(position=>pillars[position]!==null).map(position=>{
    const branch = pillars[position].branch;
    const hiddenStems = getHiddenStems(branch).map(item=>({...item,category:classify(item.element)}));
    return {position,branch,hiddenStems,category:hiddenStems.find(item=>item.role==='principal').category};
  });
  const month = {...context.month,category:classify(context.month.principalElement),
    earthTransition:['진','술','축','미'].includes(context.month.branch),commandResolved:false};
  const substantial = roots.filter(root=>root.grade==='substantial');
  const anchored = stems.filter(stem=>stem.anchor==='substantial');
  const burdens = [...anchored.filter(stem=>!isSupport(stem.category)).map(stem=>({slot:stem.position+'Stem',category:stem.category})),
    ...branches.filter(branch=>!isSupport(branch.category)).map(branch=>({slot:branch.position+'Branch',category:branch.category}))];
  return {dayMaster:context.dayMaster,month,roots,stems,branches,projections:context.projectionEvidence,relations,
    counters:{Mplus:isSupport(month.category),R:substantial.length,
      Rcentral:substantial.some(root=>root.position==='month'||root.position==='day'),
      S:anchored.filter(stem=>isSupport(stem.category)).length,P:burdens.length,burdens}};
}
