import { SajuError } from './error.js';
import { getYearSignals } from './year-signals.js';
import { explainYearSignals } from './year-explanation.js';

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const DEFAULT_WINDOW = 10;
const MAX_WINDOW = 50;

function checkWindow(anchorYear, yearsBefore, yearsAfter) {
  if (!Number.isInteger(anchorYear) || anchorYear < MIN_YEAR || anchorYear > MAX_YEAR) {
    throw new SajuError('year-range', '기준 연도는 1900~2100년의 정수여야 합니다.');
  }
  if (![yearsBefore, yearsAfter].every(n => Number.isInteger(n) && n >= 0 && n <= MAX_WINDOW)) {
    throw new SajuError('timeline-range', '과거·미래 연도 수는 각각 0~50 사이의 정수여야 합니다.');
  }
  if (anchorYear - yearsBefore < MIN_YEAR || anchorYear + yearsAfter > MAX_YEAR) {
    throw new SajuError('timeline-range', '조회 범위는 1900~2100년 안에 있어야 합니다.');
  }
}

/**
 * Analyze years on either side of an explicit anchor year.
 *
 * Past = anchorYear-yearsBefore ... anchorYear-1 (ascending)
 * Current = anchorYear
 * Future = anchorYear+1 ... anchorYear+yearsAfter (ascending).
 *
 * This is traditional branch-relation data, NOT a ranking or move prediction.
 * No clock or persistence: the caller supplies the anchor year explicitly.
 * Fails as a whole if one year cannot be calculated (including daeun limits).
 */
export function getYearTimeline({
  saju, daeun, anchorYear, yearsBefore = DEFAULT_WINDOW, yearsAfter = DEFAULT_WINDOW,
} = {}) {
  checkWindow(anchorYear, yearsBefore, yearsAfter);

  const readYear = year => {
    const calculated = getYearSignals({ saju, daeun, year });
    const explained = explainYearSignals(calculated);
    return {
      year,
      seun: calculated.seun,
      daeun: calculated.daeun,
      signals: calculated.signals,
      explanation: {
        items: explained.items,
        notes: explained.notes,
        interpretation: explained.interpretation,
      },
    };
  };

  const past = [];
  for (let year = anchorYear - yearsBefore; year < anchorYear; year += 1) {
    past.push(readYear(year));
  }
  const current = readYear(anchorYear);
  const future = [];
  for (let year = anchorYear + 1; year <= anchorYear + yearsAfter; year += 1) {
    future.push(readYear(year));
  }

  return {
    anchorYear,
    yearsBefore,
    yearsAfter,
    past,
    current,
    future,
    metadata: {
      calendarYearRange: [MIN_YEAR, MAX_YEAR],
      seunBoundary: 'ipchun',
      interpretation: 'traditional-relationships-only-v1',
      ranked: false,
    },
  };
}
