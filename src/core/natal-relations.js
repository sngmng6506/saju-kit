import { validateNatalPillars } from './natal.js';
import { stemInfo, elementRelation, branchElement } from './elements.js';
import { stemCombination } from './relations.js';
import { branchRelationsV2, analyzeBranchGroupsV2, EXTENDED_RELATIONS_VERSION } from './extended-relations.js';

const POSITIONS = ['year','month','day','hour'];

function occurrences(saju) {
  const pillars = validateNatalPillars(saju);
  return POSITIONS.flatMap((position,index)=>{
    const p = pillars[position];
    return p === null ? [] : [{position,index,stem:p.stem,branch:p.branch}];
  });
}

function comparePair(left,right) {
  const combine = stemCombination(left.stem,right.stem);
  const l = stemInfo(left.stem).element, r = stemInfo(right.stem).element;
  return {left:left.position,right:right.position,
    stems:[left.stem,right.stem],branches:[left.branch,right.branch],
    stemSignals:combine?[combine]:[],
    stemElementRelation:elementRelation(l,r),
    branchElementRelation:elementRelation(branchElement(left.branch),branchElement(right.branch)),
    branchSignals:branchRelationsV2(left.branch,right.branch)};
}

export function analyzeNatalRelations({saju}={}) {
  const present=occurrences(saju),pairs=[];
  for(let i=0;i<present.length;i++)for(let j=i+1;j<present.length;j++){
    const left=present[i],right=present[j],distance=right.index-left.index;
    pairs.push({...comparePair(left,right),distance,adjacent:distance===1});
  }
  const groups=analyzeBranchGroupsV2(present.map(p=>p.branch)).map(group=>({
    ...group,occurrences:present.filter(p=>group.members.includes(p.branch)).map(({position,branch})=>({position,branch})),
  }));
  return {version:'natal-relations-v1',relationPolicy:EXTENDED_RELATIONS_VERSION,completeHour:present.length===4,
    positions:present.map(p=>p.position),pairs,groups};
}

/**
 * Cross-chart relations only. A pair of charts is not a single natal chart:
 * no synthetic eight-branch group, intra-chart self-punishment, or score.
 * A repeated branch across charts is recorded as repetition rather than
 * a claim that either individual has natal self-punishment.
 */
export function analyzeCrossChartRelations({left,right}={}) {
  const a=occurrences(left),b=occurrences(right);
  const pairs=a.flatMap(l=>b.map(r=>{
    const pair=comparePair(l,r);
    return {...pair,repeatedBranch:l.branch===r.branch,
      branchSignals:pair.branchSignals.filter(signal=>signal.type!=='branch.selfPunishment')};
  }));
  return {version:'cross-chart-relations-v1',relationPolicy:EXTENDED_RELATIONS_VERSION,
    completeHour:{left:a.length===4,right:b.length===4},pairs};
}
