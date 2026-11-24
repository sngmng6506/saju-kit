import { SajuError } from '../../core/error.js';
import { BRANCHES } from '../../core/ganji.js';
import { COMBINATION_GROUPS } from './combination-formation.js';

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
  DAEUN_BRANCH_CLASH: { title: '대운과 원국 월지·일지의 충', relation: 'clash', source: 'daeun',
    render: s => `대운 지지 ${s.details.daeunBranch}와 원국 ${POSITION_LABELS[s.target]} ${s.details.natalBranch}가 육충입니다.` +
      (s.details.transition ? ' 새 대운 진입 첫해입니다.' : ' 해당 대운이 유지되는 해입니다.') },
  SEUN_DAEUN_CLASH: { title: '세운과 대운 지지의 충', relation: 'clash', source: 'daeun',
    render: (s) => `세운 지지 ${s.details.seunBranch}와 대운 지지 ${s.details.daeunBranch}가 육충 관계입니다.` },
  SEUN_DAEUN_COMBINE: { title: '세운과 대운 지지의 합', relation: 'combine', source: 'daeun',
    render: (s) => `세운 지지 ${s.details.seunBranch}와 대운 지지 ${s.details.daeunBranch}가 육합 관계입니다.` },
  JISAL_NATAL: { title: '원국의 지살 글자', relation: 'jisal', source: 'natal',
    render: (s) => `${BASIS_LABELS[s.details.basis]} ${s.details.basisBranch} 기준 지살 글자 ${s.details.jisalBranch}가 원국 ${POSITION_LABELS[s.target]}에 있습니다.` },
  JISAL_DAEUN: { title: '대운의 지살 글자', relation: 'jisal', source: 'daeun',
    render: (s) => `${BASIS_LABELS[s.details.basis]} ${s.details.basisBranch} 기준 지살 글자 ${s.details.jisalBranch}가 대운에 나타납니다.` },
  JISAL_SEUN: { title: '세운의 지살 글자', relation: 'jisal', source: 'calendar',
    render: (s) => `${BASIS_LABELS[s.details.basis]} ${s.details.basisBranch} 기준 지살 글자 ${s.details.jisalBranch}가 해당 연도 세운에 나타납니다.` },
  YEOKMA_NATAL: { title: '원국의 역마 글자', relation: 'yeokma', source: 'natal',
    render: (s) => `${BASIS_LABELS[s.details.basis]} ${s.details.basisBranch} 기준 역마 글자 ${s.details.yeokmaBranch}가 원국 ${POSITION_LABELS[s.target]}에 있습니다.` },
  YEOKMA_DAEUN: { title: '대운의 역마 글자', relation: 'yeokma', source: 'daeun',
    render: (s) => `${BASIS_LABELS[s.details.basis]} ${s.details.basisBranch} 기준 역마 글자 ${s.details.yeokmaBranch}가 대운에 나타납니다.` },
  YEOKMA_SEUN: { title: '세운의 역마 글자', relation: 'yeokma', source: 'calendar',
    render: (s) => `${BASIS_LABELS[s.details.basis]} ${s.details.basisBranch} 기준 역마 글자 ${s.details.yeokmaBranch}가 해당 연도 세운에 나타납니다.` },
});


const COMBINATION_DEFINITIONS = {};
for (const type of ['SAMHAP', 'BANGHAP']) {
  const label = type === 'SAMHAP' ? '삼합' : '방합';
  for (const source of ['DAEUN', 'SEUN']) {
    const sourceLabel = source === 'DAEUN' ? '새 대운' : '해당 연도 세운';
    for (const [suffix, noun] of [
      ['FORMED', '완성'], ['BANHAP', '왕지 반합 신규 형성'], ['PARTIAL', '부분 구성'],
      ...(source === 'DAEUN' ? [['MAINTAINED','기존 구조 유지']] : [['CLASH','기존 합국 구성 지지에 충']]),
    ]) {
      const key = source + '_' + type + '_' + suffix;
      COMBINATION_DEFINITIONS[key] = {
        title: sourceLabel + '으로 ' + label + ' ' + noun,
        source: source === 'DAEUN' ? 'daeun' : 'calendar',
        relation: type.toLowerCase(),
        render: s => {
          const d = s.details;
          const pillars = Object.entries(d.natalBranches)
            .map(([position, branch]) => POSITION_LABELS[position] + ' ' + branch).join('·');
          if (suffix === 'BANHAP') {
            return d.group + '에서 왕지 ' + d.wangji + '가 포함된 ' + d.pair.join('·') +
              ' 반합이 ' + sourceLabel + '으로 새로 성립했습니다. 원국 관여 위치: ' + pillars + '.';
          }
          if (suffix === 'MAINTAINED') {
            return d.group + '의 세 글자 구성이 이전 대운과 새 대운에서 모두 유지됩니다. 원국 관여 위치: ' + pillars + '.';
          }
          if (suffix === 'CLASH') {
            return d.group + '의 구성 지지 ' + d.clashedBranches.join('·') +
              '에 세운 ' + d.seunBranch + '가 육충 관계를 이룹니다. 원국 관여 위치: ' + pillars + '.';
          }
          return d.group + '에 ' + sourceLabel + ' 지지 ' + d.triggerBranch +
            '가 참여해 ' + (suffix === 'FORMED' ? '세 글자가 모두 갖춰졌습니다.' : '두 글자가 갖춰졌습니다.') +
            ' 원국 관여 위치: ' + pillars + '.';
        },
      };
    }
  }
}


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
  if (!signal || typeof signal !== 'object' || Array.isArray(signal) || !(hasOwn(DEFINITIONS, signal.key) || hasOwn(COMBINATION_DEFINITIONS, signal.key))) {
    throw new SajuError('signal-input', '지원하지 않는 관계 신호입니다.');
  }
  const definition = DEFINITIONS[signal.key] ?? COMBINATION_DEFINITIONS[signal.key];
  if (signal.source !== definition.source || signal.relation !== definition.relation
      || !hasOwn(POSITION_LABELS, signal.target)
      || !signal.details || typeof signal.details !== 'object' || Array.isArray(signal.details)) {
    throw new SajuError('signal-input', '관계 신호의 구조가 잘못되었습니다.');
  }
  const d = signal.details;
  if (signal.key.startsWith('SEUN_BRANCH_')) {
    if (!['year', 'month', 'day', 'hour'].includes(signal.target)) throw new SajuError('signal-input', '원국 위치가 올바르지 않습니다.');
    checkBranch(d.seunBranch); checkBranch(d.natalBranch);
  } else if (signal.key === 'DAEUN_BRANCH_CLASH') {
    if (!['month','day'].includes(signal.target) || typeof d.transition !== 'boolean') {
      throw new SajuError('signal-input', '대운 직접 충 대상과 전환 여부가 올바르지 않습니다.');
    }
    checkBranch(d.daeunBranch); checkBranch(d.natalBranch);
  } else if (signal.key.startsWith('SEUN_DAEUN_')) {
    if (signal.target !== 'daeun') throw new SajuError('signal-input', '대운 위치가 올바르지 않습니다.');
    checkBranch(d.seunBranch); checkBranch(d.daeunBranch);
  } else if (hasOwn(COMBINATION_DEFINITIONS, signal.key)) {
    const type = signal.key.includes('_SAMHAP_') ? 'SAMHAP' : 'BANGHAP';
    const group = COMBINATION_GROUPS[type].find(g => g.name === d.group);
    const source = signal.key.startsWith('DAEUN_') ? 'daeun' : 'calendar';
    const target = source === 'daeun' ? 'daeun' : 'year';
    if (!group || signal.source !== source || signal.target !== target
        || !Array.isArray(d.branches) || d.branches.join(':') !== group.branches.join(':')
        || !d.natalBranches || typeof d.natalBranches !== 'object'
        || Array.isArray(d.natalBranches)
        || !Number.isInteger(d.effectiveYear)
        || typeof d.seunBranch !== 'string') {
      throw new SajuError('signal-input', '삼합·방합 구조가 올바르지 않습니다.');
    }
    checkBranch(d.seunBranch);
    for (const [position, branch] of Object.entries(d.natalBranches)) {
      if (!['year','month','day','hour'].includes(position) || !group.branches.includes(branch)) {
        throw new SajuError('signal-input', '삼합·방합 원국 위치가 올바르지 않습니다.');
      }
    }
    if (!('month' in d.natalBranches) && !('day' in d.natalBranches)) {
      throw new SajuError('signal-input', '월지·일지 관여가 없는 합국입니다.');
    }
    if (signal.key.endsWith('_FORMED') || signal.key.endsWith('_PARTIAL') || signal.key.endsWith('_BANHAP')) {
      checkBranch(d.triggerBranch);
      if (!group.branches.includes(d.triggerBranch)) throw new SajuError('signal-input', '합국 트리거가 올바르지 않습니다.');
    }
    if (signal.key.endsWith('_BANHAP')) {
      if (type !== 'SAMHAP' || d.wangji !== group.branches[1]
          || !Array.isArray(d.pair) || d.pair.length !== 2 || new Set(d.pair).size !== 2
          || !d.pair.includes(d.wangji) || !d.pair.includes(d.triggerBranch)
          || d.pair.some(branch => !group.branches.includes(branch))
          || !['month','day'].some(position => d.pair.includes(d.natalBranches[position]))) {
        throw new SajuError('signal-input', '왕지 반합 구성이 올바르지 않습니다.');
      }
    }
    if (signal.key.endsWith('_CLASH')) {
      if (!Array.isArray(d.clashedBranches) || !d.clashedBranches.length ||
          d.clashedBranches.some(branch => !group.branches.includes(branch))) {
        throw new SajuError('signal-input', '합국 충 관계가 올바르지 않습니다.');
      }
    }
  } else if (signal.key.startsWith('YEOKMA_') || signal.key.startsWith('JISAL_')) {
    const isJisal = signal.key.startsWith('JISAL_');
    if (!hasOwn(BASIS_LABELS, d.basis)) throw new SajuError('signal-input', '신살 기준이 올바르지 않습니다.');
    checkBranch(d.basisBranch);
    const expectedBranch = isJisal ? d.jisalBranch : d.yeokmaBranch;
    checkBranch(expectedBranch); checkBranch(d.matchedBranch);
    if (expectedBranch !== d.matchedBranch) throw new SajuError('signal-input', '신살 지지가 서로 다릅니다.');
    const targets = signal.key.endsWith('_NATAL') ? ['year', 'month', 'day', 'hour']
      : signal.key.endsWith('_SEUN') ? ['year'] : ['daeun'];
    if (!targets.includes(signal.target)) throw new SajuError('signal-input', '신살 비교 위치가 올바르지 않습니다.');
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
