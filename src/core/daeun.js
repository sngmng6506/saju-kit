import { dateKey, getSaju, solarTermInstant } from './calendar.js';
import { SajuError } from './error.js';
import { STEMS, isYangStem } from './ganji.js';

const JEOL_INDEXES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

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
  });
  if (checked.pillars.year.stem !== saju.pillars.year.stem) {
    throw new SajuError('saju-mismatch', '사주의 연간과 생일로 계산한 연간이 다릅니다.');
  }
  const forward = daeunDirection({ yearStem: saju.pillars.year.stem, gender }) === '순행';
  const days = countJeolDays(checked.solar, forward);
  return {
    direction: forward ? '순행' : '역행',
    startAge: daeunSu(days),
    days,
  };
}
