import { BRANCHES, STEMS } from './ganji.js';
import { SajuError } from './error.js';

// v1: 여(餘) → 중(中) → 정(正/본기) ordering.
// Includes transitional stems for 자·묘·유 and 무(戊) for 해.
// This is an explicitly versioned convention, not a universal school standard.
const HIDDEN = [
  [['임', 'residual'], ['계', 'principal']],                           // 자
  [['계', 'residual'], ['신', 'middle'], ['기', 'principal']],           // 축
  [['무', 'residual'], ['병', 'middle'], ['갑', 'principal']],           // 인
  [['갑', 'residual'], ['을', 'principal']],                           // 묘
  [['을', 'residual'], ['계', 'middle'], ['무', 'principal']],           // 진
  [['무', 'residual'], ['경', 'middle'], ['병', 'principal']],           // 사
  [['병', 'residual'], ['기', 'middle'], ['정', 'principal']],           // 오
  [['정', 'residual'], ['을', 'middle'], ['기', 'principal']],           // 미
  [['무', 'residual'], ['임', 'middle'], ['경', 'principal']],           // 신
  [['경', 'residual'], ['신', 'principal']],                           // 유
  [['신', 'residual'], ['정', 'middle'], ['무', 'principal']],           // 술
  [['무', 'residual'], ['갑', 'middle'], ['임', 'principal']],           // 해
];

export const HIDDEN_STEMS_VERSION = 'kr-residual-middle-principal-v1';

/** Copy of the selected convention's hidden stems in residual→middle→principal order. */
export function getHiddenStems(branch) {
  const index = BRANCHES.indexOf(branch);
  if (index < 0) throw new SajuError('branch', '올바른 지지가 아닙니다.');
  return HIDDEN[index].map(([stem, role]) => ({
    stem,
    role,
    element: ['wood', 'fire', 'earth', 'metal', 'water'][Math.floor(STEMS.indexOf(stem) / 2)],
    yinYang: STEMS.indexOf(stem) % 2 === 0 ? 'yang' : 'yin',
  }));
}
