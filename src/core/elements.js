import { STEMS, BRANCHES } from './ganji.js';
import { SajuError } from './error.js';

const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'];
const BRANCH_ELEMENTS = [
  'water', 'earth', 'wood', 'wood', 'earth', 'fire',
  'fire', 'earth', 'metal', 'metal', 'earth', 'water',
];

export function stemIndex(stem) {
  const index = STEMS.indexOf(stem);
  if (index < 0) throw new SajuError('stem', '올바른 천간이 아닙니다.');
  return index;
}

export function branchIndex(branch) {
  const index = BRANCHES.indexOf(branch);
  if (index < 0) throw new SajuError('branch', '올바른 지지가 아닙니다.');
  return index;
}

export function stemInfo(stem) {
  const index = stemIndex(stem);
  return {
    element: ELEMENTS[Math.floor(index / 2)],
    yinYang: index % 2 === 0 ? 'yang' : 'yin',
  };
}

export function branchElement(branch) {
  return BRANCH_ELEMENTS[branchIndex(branch)];
}

/** Direction is relative to the two arguments, not a favorable/unfavorable judgment. */
export function elementRelation(left, right) {
  const a = ELEMENTS.indexOf(left);
  const b = ELEMENTS.indexOf(right);
  if (a < 0 || b < 0) throw new SajuError('element', '올바른 오행이 아닙니다.');
  const delta = (b - a + 5) % 5;
  return {
    type: ['same', 'generate', 'control', 'control', 'generate'][delta],
    direction: delta === 0 ? 'none' : delta <= 2 ? 'left-to-right' : 'right-to-left',
  };
}
