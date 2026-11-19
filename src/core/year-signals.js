import { solarTermInstant } from './calendar.js';
import { SajuError } from './error.js';
import { BRANCHES, STEMS, pillarFromIndex } from './ganji.js';

// A relation is a textual traditional correspondence, not a prediction.
const CLASH_PAIRS = [['자', '오'], ['축', '미'], ['인', '신'], ['묘', '유'], ['진', '술'], ['사', '해']];
const COMBINE_PAIRS = [['자', '축'], ['인', '해'], ['묘', '술'], ['진', '유'], ['사', '신'], ['오', '미']];

const pairKey = (a, b) => [a, b].sort((x, y) => BRANCHES.indexOf(x) - BRANCHES.indexOf(y)).join(':');
const clashes = new Set(CLASH_PAIRS.map(([a, b]) => pairKey(a, b)));
const combines = new Set(COMBINE_PAIRS.map(([a, b]) => pairKey(a, b)));
const POSITIONS = ['year', 'month', 'day', 'hour'];

function validateYear(year) {
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new SajuError('year-range', '연도는 1900년부터 2100년까지의 정수여야 합니다.');
  }
}

function validatePillar(pillar, key) {
  const si = STEMS.indexOf(pillar?.stem);
  const bi = BRANCHES.indexOf(pillar?.branch);
  if (si < 0 || bi < 0 || si % 2 !== bi % 2 || pillar.text !== pillar.stem + pillar.branch) {
    throw new SajuError('pillar', key + ' 간지가 올바르지 않습니다.');
  }
}

/** Returns only traditional branch relation names. No auspiciousness is inferred. */
export function branchRelation(left, right) {
  if (!BRANCHES.includes(left) || !BRANCHES.includes(right)) {
    throw new SajuError('branch', '지지는 12지 중 하나여야 합니다.');
  }
  const pair = pairKey(left, right);
  if (clashes.has(pair)) return 'clash';
  if (combines.has(pair)) return 'combine';
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
    const relation = branchRelation(seun.pillar.branch, band.branch);
    if (relation) {
      add(relation === 'clash' ? 'SEUN_DAEUN_CLASH' : 'SEUN_DAEUN_COMBINE',
        'daeun', 'daeun', relation,
        { seunBranch: seun.pillar.branch, daeunBranch: band.branch, daeunPillar: band.text });
    }
  }
  return { year, seun, daeun: band ? { ...band } : null, signals };
}
