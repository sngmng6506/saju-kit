import { branchIndex } from './elements.js';
import { branchPairRelations, analyzeBranchGroups } from './relations.js';
import { SajuError } from './error.js';

export const EXTENDED_RELATIONS_VERSION = 'branch-relations-v2-kr';
const BREAK = ['자유','축진','인해','묘오','사신','미술'];
const HARM = ['자미','축오','인사','묘진','신해','유술'];
const WONJIN = ['자미','축오','인유','묘신','진해','사술'];
const SELF = ['진','오','유','해'];
// Preserve traditional direction; the presence of an edge is unordered.
// The group ID is structural, not a disputed interpretive label.
const TRIADS = [
  { id:'in-sa-sin', branches:['인','사','신'] },
  { id:'chuk-sul-mi', branches:['축','술','미'] },
];

function pairMatch(pair, a, b) {
  return a !== b && pair.includes(a) && pair.includes(b);
}

/**
 * Pair lookup only. Repeated self-punishment branches require two actual
 * occurrences supplied by the caller. A triad edge is not a completed triad.
 * No cancellation, transformation, auspiciousness or effect strength inferred.
 */
export function branchRelationsV2(left, right) {
  branchIndex(left);
  branchIndex(right);
  const signals = branchPairRelations(left, right);
  for (const [type, pairs] of [['branch.break',BREAK],['branch.harm',HARM],['branch.wonjin',WONJIN]]) {
    const hit = pairs.find(pair=>pairMatch(pair,left,right));
    if (hit) signals.push({type,members:[...hit]});
  }
  if (left === right && SELF.includes(left)) {
    signals.push({type:'branch.selfPunishment',members:[left,right],requiresDistinctOccurrences:true});
  }
  if (pairMatch('자묘',left,right)) {
    signals.push({type:'branch.mutualPunishment',members:['자','묘']});
  }
  for (const group of TRIADS) {
    const from = group.branches.find((branch,i)=>pairMatch([branch,group.branches[(i+1)%3]],left,right));
    if (from !== undefined) {
      const to = group.branches[(group.branches.indexOf(from)+1)%3];
      signals.push({type:'branch.punishmentCandidate',group:group.id,members:group.branches.slice(),
        matched:[from,to],missing:group.branches.filter(branch=>branch!==from&&branch!==to),from,to});
    }
  }
  return signals;
}

/** Full groups require all three distinct branches; self-punishment is a pair observation. */
export function analyzeBranchGroupsV2(branches) {
  if (!Array.isArray(branches)) throw new SajuError('branch','지지 배열이 필요합니다.');
  const result = analyzeBranchGroups(branches);
  const present = new Set(branches);
  for (const group of TRIADS) {
    if (group.branches.every(branch=>present.has(branch))) {
      result.push({type:'branch.threePunishment',group:group.id,members:group.branches.slice()});
    }
  }
  return result;
}
