import { SajuError } from '../../core/error.js';
import { BRANCHES, STEMS } from '../../core/ganji.js';
import { branchRelation, getSeun, getYeokmaBranch } from '../../core/year-signals.js';
import { branchGroupDefinitions } from '../../core/relations.js';
import { getCombinationSignals } from './combination-formation.js';
export { branchRelation, getSeun, getYeokmaBranch };
const POSITIONS = ['year', 'month', 'day', 'hour'];
const THREE_GROUPS = branchGroupDefinitions().three;

/** Jisal is the birth/growth branch of the natal branch's three-harmony group. */
export function getJisalBranch(natalBranch) {
  if (!BRANCHES.includes(natalBranch)) throw new SajuError('branch','지살 기준 지지는 12지 중 하나여야 합니다.');
  return THREE_GROUPS.find(group => group.branches.includes(natalBranch)).branches[0];
}

function validatePillar(pillar, key) {
  const si = STEMS.indexOf(pillar?.stem);
  const bi = BRANCHES.indexOf(pillar?.branch);
  if (si < 0 || bi < 0 || si % 2 !== bi % 2 || pillar.text !== pillar.stem + pillar.branch) {
    throw new SajuError('pillar', key + ' 간지가 올바르지 않습니다.');
  }
}

function validateDaeun(daeun) {
  if (!Array.isArray(daeun?.pillars) || daeun.pillars.length !== 10) {
    throw new SajuError('daeun-input', '10개 대운 구간이 필요합니다.');
  }
  let previous = null;
  for (const band of daeun.pillars) {
    validatePillar(band, '대운');
    if (!Number.isInteger(band.fromYear) || !Number.isInteger(band.toYear)
        || band.toYear - band.fromYear !== 9
        || (previous && band.fromYear !== previous.toYear + 1)) {
      throw new SajuError('daeun-input', '대운 구간은 겹침 없이 연속한 10년이어야 합니다.');
    }
    previous = band;
  }
}

/**
 * Neutral annual signals. No scores, move recommendations, or event predictions.
 * Year means the annual pillar after Ipchun; Jan/early Feb may still be prior pillar.
 */
export function getYearSignals({ saju, daeun, year } = {}) {
  const seun = getSeun(year);
  for (const position of POSITIONS) {
    const pillar = saju?.pillars?.[position];
    if (position === 'hour' && pillar == null) continue;
    validatePillar(pillar, '원국 ' + position);
  }
  validateDaeun(daeun);
  const bands = daeun.pillars;
  const band = bands.find((item) => item.fromYear <= year && year <= item.toYear);
  if (!band && year > bands[bands.length - 1].toYear) {
    throw new SajuError('daeun-range', '대운 계산 구간 이후의 연도입니다.');
  }

  const signals = [];
  const add = (key, source, target, relation, details) => {
    signals.push({ key, source, target, relation, details });
  };
  if (!band) {
    add('NO_DAEUN_BAND', 'daeun', 'daeun', 'missing', { year });
  } else if (year === band.fromYear) {
    add('DAEUN_TRANSITION', 'daeun', 'daeun', 'transition',
      { fromYear: band.fromYear, toYear: band.toYear, pillar: band.text });
  }

  for (const position of POSITIONS) {
    const natal = saju.pillars[position];
    if (natal == null) {
      add('HOUR_UNKNOWN', 'natal', 'hour', 'unknown', { year });
      continue;
    }
    const relation = branchRelation(seun.pillar.branch, natal.branch);
    if (relation) {
      add(relation === 'clash' ? 'SEUN_BRANCH_CLASH' : 'SEUN_BRANCH_COMBINE',
        'natal', position, relation,
        { seunBranch: seun.pillar.branch, natalBranch: natal.branch });
    }
  }
  if (band) {
    for (const target of ['month', 'day']) {
      const natalBranch = saju.pillars[target].branch;
      if (branchRelation(band.branch, natalBranch) === 'clash') {
        add('DAEUN_BRANCH_CLASH', 'daeun', target, 'clash', {
          daeunBranch: band.branch, natalBranch, transition: year === band.fromYear,
          fromYear: band.fromYear,
        });
      }
    }
    const relation = branchRelation(seun.pillar.branch, band.branch);
    if (relation) {
      add(relation === 'clash' ? 'SEUN_DAEUN_CLASH' : 'SEUN_DAEUN_COMBINE',
        'daeun', 'daeun', relation,
        { seunBranch: seun.pillar.branch, daeunBranch: band.branch, daeunPillar: band.text });
    }
  }
  // Both year-branch and day-branch yeokma traditions are tracked.
  // Identical target horse branches are de-duplicated in the scoring layer.
  for (const basis of ['year', 'day']) {
    const basisBranch = saju.pillars[basis].branch;
    const yeokmaBranch = getYeokmaBranch(basisBranch);
    const details = { basis, basisBranch, yeokmaBranch };

    for (const position of POSITIONS) {
      const natal = saju.pillars[position];
      if (natal?.branch === yeokmaBranch) {
        add('YEOKMA_NATAL', 'natal', position, 'yeokma',
          { ...details, matchedBranch: natal.branch });
      }
    }
    if (band?.branch === yeokmaBranch) {
      add('YEOKMA_DAEUN', 'daeun', 'daeun', 'yeokma',
        { ...details, matchedBranch: band.branch, daeunPillar: band.text });
    }
    if (seun.pillar.branch === yeokmaBranch) {
      add('YEOKMA_SEUN', 'calendar', 'year', 'yeokma',
        { ...details, matchedBranch: seun.pillar.branch });
    }
  }
  // Jisal remains year-branch based, distinct from yeokma's dual bases.
  for (const basis of ['year']) {
    const basisBranch = saju.pillars[basis].branch;
    const jisalBranch = getJisalBranch(basisBranch);
    const details = { basis, basisBranch, jisalBranch };
    for (const position of POSITIONS) {
      const natal = saju.pillars[position];
      if (natal?.branch === jisalBranch) {
        add('JISAL_NATAL', 'natal', position, 'jisal',
          { ...details, matchedBranch: natal.branch });
      }
    }
    if (band?.branch === jisalBranch) {
      add('JISAL_DAEUN', 'daeun', 'daeun', 'jisal',
        { ...details, matchedBranch: band.branch, daeunPillar: band.text });
    }
    if (seun.pillar.branch === jisalBranch) {
      add('JISAL_SEUN', 'calendar', 'year', 'jisal',
        { ...details, matchedBranch: seun.pillar.branch });
    }
  }
  const previousBand = band && year === band.fromYear
    ? bands.find(item => item.toYear === year - 1) ?? null : null;
  signals.push(...getCombinationSignals({
    natal: saju.pillars, band, previousBand, seun: seun.pillar, year,
  }));
  return { year, seun, daeun: band ? { ...band } : null, signals };
}
