import { dateKey, getSaju, solarTermInstant } from './calendar.js';
import { SajuError } from './error.js';
import { BRANCHES, STEMS, isYangStem, mod, pillarFromIndex } from './ganji.js';

const JEOL_INDEXES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
const BAND_COUNT = 10;

/** 정수 일수의 1사2입. 0은 1로 올리고 상한은 두지 않는다. */
export function daeunSu(days) {
  if (!Number.isInteger(days) || days < 0) {
    throw new SajuError('daeun-days', '대운 일수는 0 이상의 정수입니다.');
  }
  const quotient = Math.floor(days / 3);
  const remainder = days % 3;
  const age = remainder === 2 ? quotient + 1 : quotient;
  return age === 0 ? 1 : age;
}

function jeolDates(year) {
  const dates = [];
  for (const candidate of [year - 1, year, year + 1]) {
    for (const index of JEOL_INDEXES) {
      const term = solarTermInstant(candidate, index);
      dates.push({ y: term.y, m: term.m, d: term.d, key: dateKey(term.y, term.m, term.d) });
    }
  }
  dates.sort((a, b) => a.key - b.key);
  const unique = [];
  for (const date of dates) {
    if (!unique.length || unique[unique.length - 1].key !== date.key) unique.push(date);
  }
  return unique;
}

function dayDistance(later, earlier) {
  const end = Date.UTC(later.y, later.m - 1, later.d);
  const start = Date.UTC(earlier.y, earlier.m - 1, earlier.d);
  return Math.round((end - start) / 86400000);
}

function countJeolDays(solar, forward) {
  const birth = { y: solar.y, m: solar.m, d: solar.d, key: dateKey(solar.y, solar.m, solar.d) };
  const dates = jeolDates(solar.y);
  if (forward) {
    const next = dates.find((date) => date.key > birth.key);
    if (!next) throw new SajuError('range', '다음 절을 찾지 못했습니다.');
    return dayDistance(next, birth);
  }
  const previous = [...dates].reverse().find((date) => date.key <= birth.key);
  if (!previous) throw new SajuError('range', '이전 절을 찾지 못했습니다.');
  return dayDistance(birth, previous);
}

function pillarIndex(stem, branch) {
  const stemIndex = STEMS.indexOf(stem);
  const branchIndex = BRANCHES.indexOf(branch);
  if (stemIndex < 0 || branchIndex < 0 || stemIndex % 2 !== branchIndex % 2) {
    throw new SajuError('pillar', '월주 간지가 올바르지 않습니다.');
  }
  const k = mod((5 * (branchIndex - stemIndex)) / 2, 6);
  return stemIndex + 10 * k;
}

/** 세는나이 a살은 출생 양력 연도 + a − 1. 구간은 양력 해 단위다. */
function yearBands({ month, forward, startAge, birthYear }) {
  const step = forward ? 1 : -1;
  const monthIndex = pillarIndex(month.stem, month.branch);
  const pillars = [];
  for (let i = 0; i < BAND_COUNT; i += 1) {
    const fromAge = startAge + i * 10;
    const toAge = fromAge + 9;
    pillars.push({
      ...pillarFromIndex(monthIndex + step * (i + 1)),
      fromAge,
      toAge,
      fromYear: birthYear + fromAge - 1,
      toYear: birthYear + toAge - 1,
    });
  }
  return pillars;
}

export function daeunDirection({ yearStem, gender } = {}) {
  if (gender !== '남' && gender !== '여') {
    throw new SajuError('gender', '성별은 남 또는 여입니다.');
  }
  if (!STEMS.includes(yearStem)) {
    throw new SajuError('year-stem', '연간이 올바르지 않습니다.');
  }
  const forward = (isYangStem(yearStem) && gender === '남') || (!isYangStem(yearStem) && gender === '여');
  return forward ? '순행' : '역행';
}

export function getDaeun({ saju, gender, birth } = {}) {
  if (gender !== '남' && gender !== '여') {
    throw new SajuError('gender', '성별은 남 또는 여입니다.');
  }
  if (!saju?.pillars?.year?.stem || !birth || !Number.isInteger(birth.y)) {
    throw new SajuError('daeun-input', '사주와 양력 생일이 필요합니다.');
  }
  const checked = getSaju({
    y: birth.y,
    m: birth.m,
    d: birth.d,
    hh: birth.hh ?? null,
    mm: birth.mm ?? null,
    calendar: 'solar',
    timezone: birth.timezone ?? 'Asia/Seoul',
  });
  for (const key of ['year', 'month', 'day']) {
    if (checked.pillars[key].text !== saju.pillars[key]?.text) {
      throw new SajuError('saju-mismatch', '사주와 생일로 계산한 연월일주가 다릅니다.');
    }
  }
  if (saju.pillars.hour != null && checked.pillars.hour?.text !== saju.pillars.hour.text) {
    throw new SajuError('saju-mismatch', '사주와 생일로 계산한 시주가 다릅니다.');
  }
  const forward = daeunDirection({ yearStem: saju.pillars.year.stem, gender }) === '순행';
  const days = countJeolDays(checked.solar, forward);
  const startAge = daeunSu(days);
  return {
    direction: forward ? '순행' : '역행',
    startAge,
    days,
    ageSystem: '세는나이',
    pillars: yearBands({
      month: checked.pillars.month,
      forward,
      startAge,
      birthYear: checked.solar.y,
    }),
  };
}
