import { SOLAR_TERM_MIN_YEAR, SOLAR_TERMS } from '../data/solar-terms.js';
import { LUNAR_MONTHS } from '../data/lunar-months.js';
import { koreaOffsetMin } from './clock.js';
import { SajuError } from './error.js';
import { BRANCHES, STEMS, mod, pillarFromIndex } from './ganji.js';

export const BIRTH_MIN = { y: 1900, m: 1, d: 1 };
export const BIRTH_MAX = { y: 2100, m: 12, d: 31 };
const JEOL_INDEXES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
const JEOL_BRANCH = {
  0: 1, 2: 2, 4: 3, 6: 4, 8: 5, 10: 6, 12: 7, 14: 8, 16: 9, 18: 10, 20: 11, 22: 0,
};
const DAY_ANCHOR = Date.UTC(2000, 0, 1);

function pad(value, width = 2) {
  return String(value).padStart(width, '0');
}

export function instantKey(y, m, d, hh, mm) {
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}`;
}

export function dateKey(y, m, d) {
  return y * 10000 + m * 100 + d;
}

function shiftWall(y, m, d, hh, mm, deltaMin) {
  const shifted = new Date(Date.UTC(y, m - 1, d, hh, mm + deltaMin));
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth() + 1,
    d: shifted.getUTCDate(),
    hh: shifted.getUTCHours(),
    mm: shifted.getUTCMinutes(),
  };
}

export function solarTermLabel(year, index) {
  if (year < SOLAR_TERM_MIN_YEAR || year > SOLAR_TERM_MIN_YEAR + SOLAR_TERMS.length - 1) {
    throw new SajuError('range', '절기 표 범위 밖의 해입니다.');
  }
  return SOLAR_TERMS[year - SOLAR_TERM_MIN_YEAR][index];
}

export function solarTermInstant(year, index) {
  const [monthDay, hourMinute] = solarTermLabel(year, index).split(' ');
  const [m, d] = monthDay.split('-').map(Number);
  const [hh, mm] = hourMinute.split(':').map(Number);
  return { y: year, m, d, hh, mm, key: instantKey(year, m, d, hh, mm) };
}

function validDate(y, m, d) {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function inBirthRange(y, m, d) {
  const key = dateKey(y, m, d);
  return key >= dateKey(BIRTH_MIN.y, BIRTH_MIN.m, BIRTH_MIN.d) && key <= dateKey(BIRTH_MAX.y, BIRTH_MAX.m, BIRTH_MAX.d);
}

function addDays(y, m, d, days) {
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
}

function findLunarMonth(year, month, leap) {
  return LUNAR_MONTHS.find((item) => item[0] === year && item[1] === month && item[2] === (leap ? 1 : 0));
}

export function lunarToSolar(year, month, day, leap = false) {
  const found = findLunarMonth(year, month, leap);
  if (!found) throw new SajuError('lunar-date', '없는 음력 달입니다.');
  const days = found[6];
  if (day < 1 || day > days) throw new SajuError('lunar-date', '없는 음력 날짜입니다.');
  return addDays(found[3], found[4], found[5], day - 1);
}

export function solarToLunar(y, m, d) {
  const key = dateKey(y, m, d);
  let found = null;
  for (const item of LUNAR_MONTHS) {
    const start = dateKey(item[3], item[4], item[5]);
    if (start <= key) found = item;
    else break;
  }
  if (!found) throw new SajuError('range', '음력으로 바꿀 수 있는 날짜가 아닙니다.');
  const start = Date.UTC(found[3], found[4] - 1, found[5]);
  const target = Date.UTC(y, m - 1, d);
  const day = Math.round((target - start) / 86400000) + 1;
  if (day < 1 || day > found[6]) throw new SajuError('range', '음력으로 바꿀 수 있는 날짜가 아닙니다.');
  return { year: found[0], month: found[1], day, leap: found[2] === 1 };
}

function latestJeol(key) {
  const year = Number(key.slice(0, 4));
  let best = null;
  for (const candidate of [year - 1, year, year + 1]) {
    for (const index of JEOL_INDEXES) {
      const term = solarTermInstant(candidate, index);
      if (term.key <= key && (!best || term.key > best.key)) best = { ...term, index };
    }
  }
  if (!best) throw new SajuError('range', '절기를 찾지 못했습니다.');
  return best;
}

function jeolOnDate(y, m, d) {
  const key = dateKey(y, m, d);
  for (const year of [y - 1, y, y + 1]) {
    for (const index of JEOL_INDEXES) {
      const term = solarTermInstant(year, index);
      if (dateKey(term.y, term.m, term.d) === key) return true;
    }
  }
  return false;
}

function pillarsAt(y, m, d, hh, mm) {
  const key = instantKey(y, m, d, hh, mm);
  const lichun = solarTermInstant(y, 2);
  const sajuYear = key >= lichun.key ? y : y - 1;
  const year = pillarFromIndex(sajuYear - 1984);
  const jeol = latestJeol(key);
  const yearStemIndex = mod(sajuYear - 1984, 10);
  const inMonthStem = (yearStemIndex % 5) * 2 + 2;
  const branchIndex = JEOL_BRANCH[jeol.index];
  const stemIndex = mod(inMonthStem + mod(branchIndex - 2, 12), 10);
  const month = { stem: STEMS[stemIndex], branch: BRANCHES[branchIndex], text: STEMS[stemIndex] + BRANCHES[branchIndex] };
  const dayNumber = Math.round((Date.UTC(y, m - 1, d) - DAY_ANCHOR) / 86400000);
  const day = pillarFromIndex(54 + dayNumber);
  return { year, month, day };
}

function samePillars(left, right) {
  return left.year.text === right.year.text && left.month.text === right.month.text;
}

function resolveClock(y, m, d, hh, mm) {
  if (hh == null) {
    if (jeolOnDate(y, m, d)) {
      throw new SajuError('time-required', '절입일이라 태어난 시각이 있어야 연주와 월주를 정합니다.');
    }
    const offset = koreaOffsetMin(y, m, d, 12);
    if (offset !== 540) {
      const legal = shiftWall(y, m, d, 12, 0, 540 - offset);
      const asUtc9 = pillarsAt(y, m, d, 12, 0);
      const asLegal = pillarsAt(legal.y, legal.m, legal.d, legal.hh, legal.mm);
      if (!samePillars(asUtc9, asLegal)) {
        throw new SajuError('time-required', '이 날짜는 당시 표준시와 협정세계시+9의 연주·월주가 갈립니다. 태어난 시각이 필요합니다.');
      }
    }
    return pillarsAt(y, m, d, 12, 0);
  }
  if (hh === 23) {
    throw new SajuError('day-boundary', '23시는 일주 경계를 정하기 전에 계산하지 않습니다.');
  }
  const offset = koreaOffsetMin(y, m, d, hh);
  if (offset !== 540) {
    const legal = shiftWall(y, m, d, hh, mm, 540 - offset);
    const asUtc9 = pillarsAt(y, m, d, hh, mm);
    const asLegal = pillarsAt(legal.y, legal.m, legal.d, legal.hh, legal.mm);
    if (!samePillars(asUtc9, asLegal)) {
      throw new SajuError('clock-policy-open', '당시 법정시와 협정세계시+9의 연주·월주가 달라 계산하지 않습니다.');
    }
  }
  return pillarsAt(y, m, d, hh, mm);
}

export function getSaju({
  y, m, d, hh = null, mm = null, calendar = 'solar', leapMonth = false, options,
} = {}) {
  if (options && (options.trueSolarTime || options.dayBoundary || options.tzCorrection)) {
    throw new SajuError('option-open', '시간 보정과 자시 옵션은 아직 쓰지 않습니다.');
  }
  if (calendar !== 'solar' && calendar !== 'lunar') {
    throw new SajuError('calendar', '달력은 양력 또는 음력입니다.');
  }
  if (leapMonth && calendar !== 'lunar') {
    throw new SajuError('leap-month', '윤달은 음력 입력에서만 고릅니다.');
  }
  if ((hh == null) !== (mm == null)) {
    throw new SajuError('time', '시와 분을 함께 넣거나 둘 다 비웁니다.');
  }
  if (hh != null && (!Number.isInteger(hh) || hh < 0 || hh > 23 || !Number.isInteger(mm) || mm < 0 || mm > 59)) {
    throw new SajuError('time', '시각이 올바르지 않습니다.');
  }
  if (!validDate(y, m, d)) throw new SajuError('date', '없는 날짜입니다.');

  let solar = { y, m, d };
  let lunar = null;
  if (calendar === 'lunar') {
    solar = lunarToSolar(y, m, d, leapMonth);
    lunar = { year: y, month: m, day: d, leap: leapMonth };
  }
  if (!inBirthRange(solar.y, solar.m, solar.d)) {
    throw new SajuError('range', '1900년 1월 1일부터 2100년 12월 31일까지 계산합니다.');
  }
  if (!lunar) lunar = solarToLunar(solar.y, solar.m, solar.d);
  const pillars = resolveClock(solar.y, solar.m, solar.d, hh, mm);
  return {
    pillars: { ...pillars, hour: null },
    solar,
    lunar,
    hourOmitted: '시주와 경도·서머타임 보정은 아직 계산하지 않습니다.',
  };
}
