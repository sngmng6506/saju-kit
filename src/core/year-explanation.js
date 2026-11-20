import { SajuError } from './error.js';
import { BRANCHES } from './ganji.js';

const POSITION_LABELS = Object.freeze({ year: '연지', month: '월지', day: '일지', hour: '시지', daeun: '대운' });
const BASIS_LABELS = Object.freeze({ year: '연지', day: '일지' });

const DEFINITIONS = Object.freeze({
  DAEUN_TRANSITION: { title: '대운 구간 전환', relation: 'transition', source: 'daeun',
    render: (s) => `대운 구간이 ${s.details.fromYear}년에 시작하여 ${s.details.toYear}년까지 이어집니다.` },
  NO_DAEUN_BAND: { title: '대운 시작 이전', relation: 'missing', source: 'daeun',
    render: () => '현재 채택한 대운 시작 나이에 도달하기 전의 연도입니다.' },
  HOUR_UNKNOWN: { title: '시주 정보 미확정', relation: 'unknown', source: 'natal',
    render: () => '시주가 계산되지 않아 시지 관련 관계는 제외했습니다.' },
  SEUN_BRANCH_CLASH: { title: '세운과 원국 지지의 충', relation: 'clash', source: 'natal',
    render: (s) => `세운 지지 ${s.details.seunBranch}와 원국 ${POSITION_LABELS[s.target]} ${s.details.natalBranch}가 육충 관계입니다.` },
  SEUN_BRANCH_COMBINE: { title: '세운과 원국 지지의 합', relation: 'combine', source: 'natal',
    render: (s) => `세운 지지 ${s.details.seunBranch}와 원국 ${POSITION_LABELS[s.target]} ${s.details.natalBranch}가 육합 관계입니다.` },
  SEUN_DAEUN_CLASH: { title: '세운과 대운 지지의 충', relation: 'clash', source: 'daeun',
    render: (s) => `세운 지지 ${s.details.seunBranch}와 대운 지지 ${s.details.daeunBranch}가 육충 관계입니다.` },
  SEUN_DAEUN_COMBINE: { title: '세운과 대운 지지의 합', relation: 'combine', source: 'daeun',
    render: (s) => `세운 지지 ${s.details.seunBranch}와 대운 지지 ${s.details.daeunBranch}가 육합 관계입니다.` },
  YEOKMA_NATAL: { title: '원국의 역마 글자', relation: 'yeokma', source: 'natal',
    render: (s) => `${BASIS_LABELS[s.details.basis]} ${s.details.basisBranch} 기준 역마 글자 ${s.details.yeokmaBranch}가 원국 ${POSITION_LABELS[s.target]}에 있습니다.` },
  YEOKMA_DAEUN: { title: '대운의 역마 글자', relation: 'yeokma', source: 'daeun',
    render: (s) => `${BASIS_LABELS[s.details.basis]} ${s.details.basisBranch} 기준 역마 글자 ${s.details.yeokmaBranch}가 대운에 나타납니다.` },
  YEOKMA_SEUN: { title: '세운의 역마 글자', relation: 'yeokma', source: 'calendar',
    render: (s) => `${BASIS_LABELS[s.details.basis]} ${s.details.basisBranch} 기준 역마 글자 ${s.details.yeokmaBranch}가 해당 연도 세운에 나타납니다.` },
});

const NOTES = Object.freeze([
  '이는 전통 명리의 간지 관계를 설명한 것이며, 실제 이사 발생이나 이사에 유리한 시기를 예측하지 않습니다.',
  '세운 간지는 해당 연도 입춘부터 적용됩니다. 입춘 전 날짜에는 전년도 세운이 적용될 수 있습니다.',
]);

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function checkBranch(branch) {
  if (!BRANCHES.includes(branch)) throw new SajuError('signal-input', '설명할 지지 정보가 올바르지 않습니다.');
}

function checkSignal(signal) {
  if (!signal || typeof signal !== 'object' || Array.isArray(signal) || !hasOwn(DEFINITIONS, signal.key)) {
    throw new SajuError('signal-input', '지원하지 않는 관계 신호입니다.');
  }
  const definition = DEFINITIONS[signal.key];
  if (signal.source !== definition.source || signal.relation !== definition.relation
      || !hasOwn(POSITION_LABELS, signal.target)
      || !signal.details || typeof signal.details !== 'object' || Array.isArray(signal.details)) {
    throw new SajuError('signal-input', '관계 신호의 구조가 잘못되었습니다.');
  }
  const d = signal.details;
  if (signal.key.startsWith('SEUN_BRANCH_')) {
    if (!['year', 'month', 'day', 'hour'].includes(signal.target)) throw new SajuError('signal-input', '원국 위치가 올바르지 않습니다.');
    checkBranch(d.seunBranch); checkBranch(d.natalBranch);
  } else if (signal.key.startsWith('SEUN_DAEUN_')) {
    if (signal.target !== 'daeun') throw new SajuError('signal-input', '대운 위치가 올바르지 않습니다.');
    checkBranch(d.seunBranch); checkBranch(d.daeunBranch);
  } else if (signal.key.startsWith('YEOKMA_')) {
    if (!hasOwn(BASIS_LABELS, d.basis)) throw new SajuError('signal-input', '역마 기준이 올바르지 않습니다.');
    checkBranch(d.basisBranch); checkBranch(d.yeokmaBranch); checkBranch(d.matchedBranch);
    if (d.yeokmaBranch !== d.matchedBranch) throw new SajuError('signal-input', '역마 지지가 서로 다릅니다.');
    const targets = signal.key === 'YEOKMA_NATAL' ? ['year', 'month', 'day', 'hour']
      : signal.key === 'YEOKMA_SEUN' ? ['year'] : ['daeun'];
    if (!targets.includes(signal.target)) throw new SajuError('signal-input', '역마 비교 위치가 올바르지 않습니다.');
  } else if (signal.key === 'HOUR_UNKNOWN') {
    if (signal.target !== 'hour') throw new SajuError('signal-input', '시주 결측 위치가 올바르지 않습니다.');
  } else {
    if (signal.target !== 'daeun') throw new SajuError('signal-input', '대운 위치가 올바르지 않습니다.');
    if (signal.key === 'DAEUN_TRANSITION'
      && (!Number.isInteger(d.fromYear) || !Number.isInteger(d.toYear) || d.toYear - d.fromYear !== 9)) {
      throw new SajuError('signal-input', '대운 구간이 올바르지 않습니다.');
    }
  }
  return definition;
}

/**
 * Deterministic Korean description layer for getYearSignals() results.
 * No prediction, ranking, score, auspicious-day or direction advice.
 */
export function explainYearSignals(yearResult) {
  if (!Number.isInteger(yearResult?.year) || yearResult.year < 1900 || yearResult.year > 2100
      || !Array.isArray(yearResult?.signals) || !yearResult.seun?.pillar?.text) {
    throw new SajuError('signal-input', '연도별 관계 계산 결과가 필요합니다.');
  }
  const items = yearResult.signals.map((signal) => {
    const definition = checkSignal(signal);
    return {
      key: signal.key,
      title: definition.title,
      description: definition.render(signal),
      source: signal.source,
      target: signal.target,
      relation: signal.relation,
      details: { ...signal.details },
    };
  });
  return {
    year: yearResult.year,
    seunPillar: yearResult.seun.pillar.text,
    items,
    notes: [...NOTES],
    interpretation: 'traditional-relationships-only-v1',
  };
}
