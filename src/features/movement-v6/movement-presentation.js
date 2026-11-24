import { SajuError } from '../../core/error.js';
import { COMBINATION_GROUPS } from './combination-formation.js';

export const MOVEMENT_INDEX_VERSION = 'movement-signal-index-v6-daeun-day-horse';

/**
 * Product-only display index, not a probability or empirically validated score.
 * Score natal month/day clashes and year-branch-based yeokma/jisal in the
 * annual and decadal pillars. A source branch is not itself an extra score.
 * Other branch relations stay available as non-scoring context.
 */
export const MOVEMENT_SIGNAL_WEIGHTS = Object.freeze({
  SEUN_BRANCH_CLASH: Object.freeze({ month: 25, day: 25 }),
  DAEUN_BRANCH_CLASH: Object.freeze({ month: 8, day: 8, transitionBonus: 7 }),
  YEOKMA_SEUN: 20,
  YEOKMA_DAEUN: 8,
  YEOKMA_DAY_SEUN: 10,
  YEOKMA_DAY_DAEUN: 4,
  JISAL_SEUN: 15,
  JISAL_DAEUN: 5,
  // Only genuinely new three-branch completions with month/day participation.
  // Partial, maintained, and clashed combinations do not earn points.
  SEUN_SAMHAP_FORMED: 10,
  DAEUN_SAMHAP_FORMED: 5,
  SEUN_BANGHAP_FORMED: 10,
  DAEUN_BANGHAP_FORMED: 5,
  SEUN_SAMHAP_BANHAP: 5,
  DAEUN_SAMHAP_BANHAP: 3,
});

const PRESENTATION = Object.freeze([
  { min: 0, icon: '🔎', comment: '두드러진 이동 관련 신호가 적어요.' },
  { min: 15, icon: '🌱', comment: '일부 변화 관련 신호가 보여요.' },
  { min: 30, icon: '🚶', comment: '전통 명리에서 이동과 연결하는 신호가 보여요.' },
  { min: 50, icon: '🔄', comment: '여러 이동·변화 관련 신호가 겹쳐 보여요.' },
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
  const fullOrHalf = signal => /^(SEUN|DAEUN)_(SAMHAP|BANGHAP)_(FORMED|BANHAP)$/.test(signal.key);
  // A luck branch completing multiple different groups is one triggering event.
  // Prefer a full formation over a half formation; deterministic on ties.
  const winnerByTrigger = new Map();
  for (const signal of signals) {
    if (!signal || typeof signal.key !== 'string' || !fullOrHalf(signal)
        || typeof signal.details?.triggerBranch !== 'string') continue;
    const bucket = signal.key.split('_')[0] + ':' + signal.details.triggerBranch;
    const weight = MOVEMENT_SIGNAL_WEIGHTS[signal.key] ?? 0;
    const previous = winnerByTrigger.get(bucket);
    const identity = signal.key + ':' + (signal.details?.group ?? '');
    if (!previous || weight > previous.weight || (weight === previous.weight && identity < previous.identity)) {
      winnerByTrigger.set(bucket, { identity, weight });
    }
  }
  for (const signal of signals) {
    if (!signal || typeof signal !== 'object' || typeof signal.key !== 'string') {
      throw new SajuError('signal-input', '관계 신호 구조가 잘못되었습니다.');
    }
    let weight = 0;
    let identity = signal.key;
    if (signal.key === 'SEUN_BRANCH_CLASH') {
      weight = MOVEMENT_SIGNAL_WEIGHTS.SEUN_BRANCH_CLASH[signal.target] ?? 0;
      identity += ':' + signal.target;
    } else if (signal.key === 'DAEUN_BRANCH_CLASH') {
      const value = MOVEMENT_SIGNAL_WEIGHTS.DAEUN_BRANCH_CLASH[signal.target];
      if (!Number.isInteger(value) || typeof signal.details?.transition !== 'boolean') {
        throw new SajuError('signal-input', '대운 월지·일지 충 근거가 올바르지 않습니다.');
      }
      weight = value + (signal.details.transition ? MOVEMENT_SIGNAL_WEIGHTS.DAEUN_BRANCH_CLASH.transitionBonus : 0);
      // Same target and year clash from both luck layers: preserve both facts,
      // but halve the smaller daeun contribution instead of double counting.
      if (signals.some(other => other.key === 'SEUN_BRANCH_CLASH' && other.target === signal.target)) {
        weight = Math.ceil(weight / 2);
      }
      identity += ':' + signal.target;
    } else if (['YEOKMA_SEUN', 'YEOKMA_DAEUN', 'JISAL_SEUN', 'JISAL_DAEUN'].includes(signal.key)) {
      const basis = signal.details?.basis;
      if ((signal.key.startsWith('JISAL_') && basis !== 'year')
          || (signal.key.startsWith('YEOKMA_') && !['year', 'day'].includes(basis))) {
        throw new SajuError('signal-input', '역마·지살 기준이 올바르지 않습니다.');
      }
      if (signal.key.startsWith('YEOKMA_') && basis === 'day') {
        weight = MOVEMENT_SIGNAL_WEIGHTS[signal.key === 'YEOKMA_SEUN' ? 'YEOKMA_DAY_SEUN' : 'YEOKMA_DAY_DAEUN'];
        // When both bases resolve to the same horse branch, keep the year
        // basis weight and expose the day basis as non-scoring context.
        if (signals.some(other => other.key === signal.key && other.details?.basis === 'year'
            && other.details?.matchedBranch === signal.details?.matchedBranch)) weight = 0;
      } else {
        weight = MOVEMENT_SIGNAL_WEIGHTS[signal.key];
      }
      identity += ':' + basis;
    } else if (Object.hasOwn(MOVEMENT_SIGNAL_WEIGHTS, signal.key)) {
      // A completed 삼합/방합 is identifiable by its group and the luck
      // layer that completed it. Distinct groups remain distinct signals.
      const group = signal.details?.group;
      if (typeof group !== 'string' || !group) {
        throw new SajuError('signal-input', '완성된 삼합·방합의 조합 정보가 필요합니다.');
      }
      if (signal.key.endsWith('_BANHAP')) {
        const definition = COMBINATION_GROUPS.SAMHAP.find(item => item.name === group);
        const pair = signal.details?.pair;
        if (!definition || signal.details.wangji !== definition.branches[1]
            || !Array.isArray(pair) || pair.length !== 2 || new Set(pair).size !== 2
            || !pair.includes(signal.details.wangji) || !pair.includes(signal.details.triggerBranch)
            || pair.some(branch => !definition.branches.includes(branch))
            || !['month','day'].some(position => pair.includes(signal.details.natalBranches?.[position]))) {
          throw new SajuError('signal-input', '왕지 반합 점수 근거가 올바르지 않습니다.');
        }
      }
      weight = MOVEMENT_SIGNAL_WEIGHTS[signal.key];
      identity += ':' + group;
      if (fullOrHalf(signal)) {
        const trigger = signal.details?.triggerBranch;
        const bucket = signal.key.split('_')[0] + ':' + trigger;
        const winner = winnerByTrigger.get(bucket);
        if (typeof trigger === 'string' && winner && winner.identity !== identity) weight = 0;
        if (weight && signal.details?.quality?.interruptedBySeun) weight = Math.max(1, Math.floor(weight * 0.75));
      }
    }
    if (weight && !seen.has(identity)) {
      seen.add(identity);
      const contribution = { key: signal.key, target: signal.target, basis: signal.details?.basis ?? null, points: weight };
      if (signal.key.endsWith('_FORMED') || signal.key.endsWith('_BANHAP')) contribution.group = signal.details.group;
      if (signal.key.endsWith('_BANHAP')) {
        contribution.pair = [...signal.details.pair];
        contribution.wangji = signal.details.wangji;
      }
      if (fullOrHalf(signal) && signal.details.quality) contribution.quality = { ...signal.details.quality };
      contributions.push(contribution);
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
