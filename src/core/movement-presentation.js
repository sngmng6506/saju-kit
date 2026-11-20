import { SajuError } from './error.js';

export const MOVEMENT_INDEX_VERSION = 'movement-signal-index-v1';

/**
 * Pure UI signal-density index. NOT a good/bad fortune, probability of moving,
 * predictive confidence, or independent traditional-school score.
 *
 * Weights are explicitly arbitrary product display conventions; they must
 * not be described as derived from classical texts or validation studies.
 * Only annual changes count. Natal yeokma and missing hour do not earn points.
 */
const WEIGHTS = Object.freeze({
  SEUN_BRANCH_CLASH: Object.freeze({ year: 10, month: 15, day: 20, hour: 10 }),
  SEUN_DAEUN_CLASH: 15,
  YEOKMA_SEUN: 20,
  YEOKMA_DAEUN: 10,
  DAEUN_TRANSITION: 10,
});

const PRESENTATION = Object.freeze([
  { min: 0, icon: '🔎', comment: '두드러진 이동 관련 신호가 적어요.' },
  { min: 20, icon: '🌱', comment: '일부 변화 관련 신호가 보여요.' },
  { min: 40, icon: '🚶', comment: '전통 명리에서 이동과 연결하는 신호가 보여요.' },
  { min: 70, icon: '🔄', comment: '여러 이동·변화 관련 신호가 겹쳐 보여요.' },
]);

/**
 * Annotate an annual year row with a display score, emoji, and one-line text.
 * The numeric value measures selected relationship signals only.
 */
export function summarizeMovementSignals(signals) {
  if (!Array.isArray(signals)) {
    throw new SajuError('signal-input', '이동 신호 배열이 필요합니다.');
  }
  const contributions = [];
  const seen = new Set();
  let score = 0;
  for (const signal of signals) {
    if (!signal || typeof signal !== 'object' || typeof signal.key !== 'string') {
      throw new SajuError('signal-input', '관계 신호 구조가 잘못되었습니다.');
    }
    let weight = 0;
    let identity = signal.key;
    if (signal.key === 'SEUN_BRANCH_CLASH') {
      weight = WEIGHTS.SEUN_BRANCH_CLASH[signal.target] ?? 0;
      identity += ':' + signal.target;
    } else if (signal.key === 'SEUN_DAEUN_CLASH') {
      weight = WEIGHTS.SEUN_DAEUN_CLASH;
    } else if (signal.key === 'YEOKMA_SEUN' || signal.key === 'YEOKMA_DAEUN') {
      if (!['year', 'day'].includes(signal.details?.basis)) {
        throw new SajuError('signal-input', '역마 기준이 올바르지 않습니다.');
      }
      weight = WEIGHTS[signal.key];
      identity += ':' + signal.details.basis;
    } else if (signal.key === 'DAEUN_TRANSITION') {
      weight = WEIGHTS.DAEUN_TRANSITION;
    }
    if (weight && !seen.has(identity)) {
      seen.add(identity);
      contributions.push({ key: signal.key, target: signal.target, basis: signal.details?.basis ?? null, points: weight });
      score += weight;
    }
  }
  score = Math.min(100, score);
  const presentation = [...PRESENTATION].reverse().find(p => score >= p.min);
  return {
    score,
    icon: presentation.icon,
    comment: presentation.comment,
    scoreLabel: '이동·변화 신호 지수',
    version: MOVEMENT_INDEX_VERSION,
    caveat: '이 점수는 선택한 명리 관계의 표시용 지수이며, 실제 이사 확률이나 이사에 유리한 정도가 아닙니다.',
    contributions,
  };
}
