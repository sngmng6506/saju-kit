import { stemIndex, branchIndex, stemInfo, elementRelation } from '../core/elements.js';
import { stemCombination, branchPairRelations } from '../core/relations.js';
import { SajuError } from '../core/error.js';

function validateDay(pillar) {
  if (!pillar || typeof pillar !== 'object' || Array.isArray(pillar)
    || stemIndex(pillar.stem) % 2 !== branchIndex(pillar.branch) % 2
    || pillar.text !== pillar.stem + pillar.branch) {
    throw new SajuError('pillar', '유효한 일주 간지가 필요합니다.');
  }
}

function pillarOnly({ stem, branch, text }) {
  return { stem, branch, text };
}

/** Day-only neutral signals. Consumers define scores and localized presentation. */
export function analyzeCompatibility({ left, right, scope = 'day' } = {}) {
  if (scope !== 'day') throw new SajuError('scope', '현재 일주 비교만 지원합니다.');
  validateDay(left);
  validateDay(right);
  const leftElement = stemInfo(left.stem).element;
  const rightElement = stemInfo(right.stem).element;
  const combine = stemCombination(left.stem, right.stem);
  const signals = [
    ...(combine ? [combine] : []),
    ...branchPairRelations(left.branch, right.branch),
  ];
  const relation = elementRelation(leftElement, rightElement);
  signals.push({
    type: 'element.' + relation.type,
    direction: relation.direction,
    left: leftElement,
    right: rightElement,
  });
  return {
    version: 'day-relations-v1',
    scope,
    left: pillarOnly(left),
    right: pillarOnly(right),
    signals,
  };
}
