import { stemIndex, branchIndex } from './elements.js';
import { SajuError } from './error.js';

// Associated elements describe traditional correspondences only.
// 午未's associated element is intentionally unspecified; schools differ.
const STEM_COMBINES = [
  ['갑', '기', 'earth'], ['을', '경', 'metal'], ['병', '신', 'water'],
  ['정', '임', 'wood'], ['무', '계', 'fire'],
];
const SIX = [
  ['자', '축', 'earth'], ['인', '해', 'wood'], ['묘', '술', 'fire'],
  ['진', '유', 'metal'], ['사', '신', 'water'], ['오', '미', null],
];
const CLASH = [
  ['자', '오'], ['축', '미'], ['인', '신'],
  ['묘', '유'], ['진', '술'], ['사', '해'],
];
// The middle branch is the cardinal branch (왕지).
const THREE = [
  ['신', '자', '진', 'water'], ['해', '묘', '미', 'wood'],
  ['인', '오', '술', 'fire'], ['사', '유', '축', 'metal'],
];
const SEASON = [
  ['인', '묘', '진', 'wood'], ['사', '오', '미', 'fire'],
  ['신', '유', '술', 'metal'], ['해', '자', '축', 'water'],
];

function pairMatches(group, a, b) {
  const members = group.slice(0, 2);
  return a !== b && members.includes(a) && members.includes(b);
}

export function stemCombination(left, right) {
  stemIndex(left);
  stemIndex(right);
  const hit = STEM_COMBINES.find(group => pairMatches(group, left, right));
  return hit ? {
    type: 'stem.combine',
    members: hit.slice(0, 2),
    associatedElement: hit[2],
    transformationConfirmed: null,
  } : null;
}

/** Detect all applicable pair signals. Two branches cannot complete a three-branch group. */
export function branchPairRelations(left, right) {
  branchIndex(left);
  branchIndex(right);
  const out = [];
  const six = SIX.find(group => pairMatches(group, left, right));
  if (six) {
    out.push({
      type: 'branch.sixHarmony',
      members: six.slice(0, 2),
      associatedElement: six[2],
      transformationConfirmed: null,
    });
  }
  const clash = CLASH.find(group => pairMatches(group, left, right));
  if (clash) out.push({ type: 'branch.clash', members: clash.slice() });

  for (const [type, groups] of [
    ['branch.threeHarmonyCandidate', THREE],
    ['branch.seasonalHarmonyCandidate', SEASON],
  ]) {
    const hit = groups.find(group =>
      left !== right && group.slice(0, 3).includes(left) && group.slice(0, 3).includes(right));
    if (!hit) continue;
    const members = hit.slice(0, 3);
    out.push({
      type,
      members,
      matched: members.filter(branch => branch === left || branch === right),
      missing: members.filter(branch => branch !== left && branch !== right),
      associatedElement: hit[3],
      includesCardinal: left === hit[1] || right === hit[1],
      transformationConfirmed: null,
    });
  }
  return out;
}

/** All three distinct branches present; not a ruling about transformation. */
export function analyzeBranchGroups(branches) {
  if (!Array.isArray(branches)) throw new SajuError('branch', '지지 배열이 필요합니다.');
  for (const branch of branches) branchIndex(branch);
  const found = new Set(branches);
  const out = [];
  for (const [type, groups] of [
    ['branch.threeHarmony', THREE],
    ['branch.seasonalHarmony', SEASON],
  ]) {
    for (const group of groups) {
      const members = group.slice(0, 3);
      if (members.every(branch => found.has(branch))) {
        out.push({
          type,
          members,
          associatedElement: group[3],
          transformationConfirmed: null,
        });
      }
    }
  }
  return out;
}
