import { solarTermInstant } from '../../core/calendar.js';
import { SOLAR_TERM_MIN_YEAR, SOLAR_TERM_MAX_YEAR } from '../../data/solar-terms.js';
import { koreaOffsetMin } from '../../core/clock.js';
import { SajuError } from '../../core/error.js';
import { prepareDaeun, yearBands, daeunSu, daeunDirection } from '../../core/daeun.js';
export { daeunSu, daeunDirection };
const JEOL_INDEXES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

const MINUTES_PER_DAY = 1440;
function koreaWallMinuteInstant({ y, m, d, hh, mm }, timezone) {
  const offset = timezone === 'Asia/Tokyo' ? 540 : koreaOffsetMin(y, m, d, hh);
  // Solar terms are stored as KST wall-clock instants; adjust historical
  // civil time and DST to the same KST frame before computing intervals.
  return Date.UTC(y, m - 1, d, hh, mm) + (540 - offset) * 60000;
}
function termInstant(term) {
  return Date.UTC(term.y, term.m - 1, term.d, term.hh, term.mm);
}
function jeolInstants(year) {
  const instants = [];
  for (const candidate of [year - 1, year, year + 1]) {
    if (candidate < SOLAR_TERM_MIN_YEAR || candidate > SOLAR_TERM_MAX_YEAR) continue;
    for (const index of JEOL_INDEXES) instants.push(termInstant(solarTermInstant(candidate, index)));
  }
  return [...new Set(instants)].sort((a, b) => a - b);
}
/** Extend integer 1사2입 to exact elapsed minutes: 3d=1y, 2d residual rounds up. */
export function daeunSuMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new SajuError('daeun-minutes', '절입 차이는 0분 이상의 값이어야 합니다.');
  }
  return Math.max(1, Math.floor((minutes + MINUTES_PER_DAY) / (3 * MINUTES_PER_DAY)));
}
function countJeolMinutes(solar, clock, forward, timezone) {
  const birth = koreaWallMinuteInstant({ ...solar, ...clock }, timezone);
  const terms = jeolInstants(solar.y);
  const boundary = forward ? terms.find(instant => instant > birth)
    : [...terms].reverse().find(instant => instant <= birth);
  if (boundary == null) throw new SajuError('range', '절입 시각을 찾지 못했습니다.');
  return Math.round(Math.abs(boundary - birth) / 60000);
}

/** Explicit minute-based movement-v6 policy; does not change the legacy root getDaeun. */
export function getDaeun(input = {}) {
  const { checked, forward } = prepareDaeun(input);
  const { birth } = input;
  const timezone = birth.timezone ?? 'Asia/Seoul';
  if (birth.period) {
    const { start, end } = birth.period;
    const valid = value => Array.isArray(value) && value.length === 2 && Number.isInteger(value[0]) && value[0] >= 0 && value[0] <= 22 && Number.isInteger(value[1]) && value[1] >= 0 && value[1] <= 59;
    if (!valid(start) || !valid(end) || start[0]*60+start[1] > end[0]*60+end[1] || birth.hh == null || birth.hh*60+birth.mm < start[0]*60+start[1] || birth.hh*60+birth.mm > end[0]*60+end[1]) throw new SajuError('daeun-period','출생 시간대가 올바르지 않습니다.');
  }
  // For unknown / period-only birth time, preserve the midpoint estimate
  // but expose the possible range instead of silently asserting precision.
  const hasExactTime = birth.hh != null && birth.mm != null && !birth.period;
  const period = birth.period;
  const sampleClock = birth.hh == null ? { hh: 12, mm: 0 } : { hh: birth.hh, mm: birth.mm };
  const minutes = countJeolMinutes(checked.solar, sampleClock, forward, timezone);
  const bounds = period ? [{ hh: period.start[0], mm: period.start[1] },
    { hh: period.end[0], mm: period.end[1] }]
    : hasExactTime ? [sampleClock]
    : [{ hh: 0, mm: 0 }, { hh: 23, mm: 59 }];
  const starts = bounds.map(clock => daeunSuMinutes(countJeolMinutes(checked.solar, clock, forward, timezone)));
  const startAgeRange = [Math.min(...starts), Math.max(...starts)];
  const days = minutes / MINUTES_PER_DAY;
  const startAge = daeunSuMinutes(minutes);
  return {
    direction: forward ? '순행' : '역행',
    startAge,
    days,
    minutes,
    precision: hasExactTime ? 'minute' : period ? 'period' : 'unknown',
    startAgeRange,
    ageSystem: '세는나이',
    pillars: yearBands({
      month: checked.pillars.month,
      forward,
      startAge,
      birthYear: checked.solar.y,
    }),
  };
}
