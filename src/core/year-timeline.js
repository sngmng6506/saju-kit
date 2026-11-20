import { SajuError } from './error.js';
import { getYearSignals } from './year-signals.js';
import { explainYearSignals } from './year-explanation.js';
import { summarizeMovementSignals, MOVEMENT_INDEX_VERSION } from './movement-presentation.js';

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const DEFAULT_END_AGE = 80;

/**
 * Annual traditional saju relationships from the first daeun year to
 * the inclusive ending Korean counting age (default 80).
 *
 * The birth year is derived from the verified getDaeun() age/year mapping:
 * birthYear = firstBand.fromYear - daeun.startAge + 1.
 * An explicit current year is not needed. This is not an event prediction.
 */
export function getYearTimeline(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      ['anchorYear', 'yearsBefore', 'yearsAfter'].some(key => Object.prototype.hasOwnProperty.call(input, key))) {
    throw new SajuError('timeline-input', '타임라인은 대운 시작부터 종료 나이까지를 조회합니다.');
  }
  const { saju, daeun, endAge = DEFAULT_END_AGE } = input;
  const first = daeun?.pillars?.[0];
  const startAge = daeun?.startAge;
  if (daeun?.ageSystem !== '세는나이' || !Number.isInteger(startAge) || startAge < 1 || !first
      || !Number.isInteger(first.fromYear) || first.fromAge !== startAge) {
    throw new SajuError('daeun-input', '대운의 시작 나이와 첫 구간이 필요합니다.');
  }
  if (!Number.isInteger(endAge) || endAge < startAge || endAge > 120) {
    throw new SajuError('timeline-range', '종료 나이는 대운 시작 나이 이상 120세 이하 정수여야 합니다.');
  }
  const birthYear = first.fromYear - startAge + 1;
  const fromYear = first.fromYear;
  const toYear = birthYear + endAge - 1;
  if (!Number.isInteger(birthYear) || fromYear < MIN_YEAR || toYear > MAX_YEAR) {
    throw new SajuError('timeline-range', '분석 연도가 지원 범위 1900~2100년을 벗어납니다.');
  }

  // Validate every year as a whole. A missing daeun band or bad chart is
  // an error, never a silently skipped or guessed year.
  const years = [];
  for (let age = startAge; age <= endAge; age += 1) {
    const year = birthYear + age - 1;
    const calculated = getYearSignals({ saju, daeun, year });
    const explained = explainYearSignals(calculated);
    years.push({
      age,
      year,
      seun: calculated.seun,
      daeun: calculated.daeun,
      signals: calculated.signals,
      display: summarizeMovementSignals(calculated.signals),
      explanation: {
        items: explained.items,
        notes: explained.notes,
        interpretation: explained.interpretation,
      },
    });
  }

  return {
    birthYear,
    startAge,
    endAge,
    ageSystem: '세는나이',
    fromYear,
    toYear,
    years,
    metadata: {
      calendarYearRange: [MIN_YEAR, MAX_YEAR],
      seunBoundary: 'ipchun',
      daeunBoundary: 'korean-counting-age-calendar-year',
      interpretation: 'traditional-relationships-only-v1',
      ranked: false,
      movementIndex: MOVEMENT_INDEX_VERSION,
    },
  };
}
