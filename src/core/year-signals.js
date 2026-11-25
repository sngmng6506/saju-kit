import { prepareYearContext } from './year-context.js';
import { solarTermInstant } from './calendar.js';
import { SajuError } from './error.js';
import { branchPairRelations } from './relations.js';
import { BRANCHES, pillarFromIndex } from './ganji.js';

// A relation is a textual traditional correspondence, not a prediction.
const POSITIONS = ['year', 'month', 'day', 'hour'];

// Yeokma convention: natal year/day branch's three-harmony group -> horse branch.
// This is a traditional correspondence, not evidence of an actual relocation.
const YEOKMA_BY_BRANCH = {
  신: '인', 자: '인', 진: '인',
  인: '신', 오: '신', 술: '신',
  사: '해', 유: '해', 축: '해',
  해: '사', 묘: '사', 미: '사',
};

/** Traditional yeokma (驛馬) branch for one natal year/day branch. */
export function getYeokmaBranch(natalBranch) {
  if (!BRANCHES.includes(natalBranch)) {
    throw new SajuError('branch', '역마 기준 지지는 12지 중 하나여야 합니다.');
  }
  return YEOKMA_BY_BRANCH[natalBranch];
}


function validateYear(year) {
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new SajuError('year-range', '연도는 1900년부터 2100년까지의 정수여야 합니다.');
  }
}

/** Returns only traditional branch relation names. No auspiciousness is inferred. */
export function branchRelation(left, right) {
  if (!BRANCHES.includes(left) || !BRANCHES.includes(right)) {
    throw new SajuError('branch', '지지는 12지 중 하나여야 합니다.');
  }
  const relations = branchPairRelations(left, right);
  if (relations.some(r => r.type === 'branch.clash')) return 'clash';
  if (relations.some(r => r.type === 'branch.sixHarmony')) return 'combine';
  return null;
}

/** The annual pillar effective *after Ipchun* in this Gregorian year. */
export function getSeun(year) {
  validateYear(year);
  const start = solarTermInstant(year, 2);
  return {
    year,
    pillar: pillarFromIndex(year - 1984),
    startsAt: { y: start.y, m: start.m, d: start.d, hh: start.hh, mm: start.mm },
  };
}

/**
 * Neutral annual signals. No scores, move recommendations, or event predictions.
 * Year means the annual pillar after Ipchun; Jan/early Feb may still be prior pillar.
 */
export function getYearSignals({ saju, daeun, year } = {}) {
  const {seun,band}=prepareYearContext({saju,daeun,year},getSeun);

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
    const relation = branchRelation(seun.pillar.branch, band.branch);
    if (relation) {
      add(relation === 'clash' ? 'SEUN_DAEUN_CLASH' : 'SEUN_DAEUN_COMBINE',
        'daeun', 'daeun', relation,
        { seunBranch: seun.pillar.branch, daeunBranch: band.branch, daeunPillar: band.text });
    }
  }
  // Year-pillar and day-pillar yeokma conventions remain separate even when
  // both resolve to the same branch. No weights or good/bad conclusions.
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
  return { year, seun, daeun: band ? { ...band } : null, signals };
}
