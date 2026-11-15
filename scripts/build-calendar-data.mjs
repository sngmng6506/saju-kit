/**
 * 절기·음력 월 시작표를 만든다. 런타임 의존성은 아니다.
 *
 * 절기 시각은 manseryeok 2.0.0 (MIT)이 담은 천문 계산이다.
 * 그 계산은 6tail/lunar-javascript 값을 분 보정으로 쓴다.
 * 만든 뒤 한국천문연구원 월력요항 2000·2004·2016과 대조한다.
 * 2004년은 24절기가 분까지 같아야 하고, 2000·2016은 1분 이내여야 한다.
 *
 *   npm run build-data
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSolarTerm, lunarToSolar } from 'manseryeok';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIN_YEAR = 1899;
const MAX_YEAR = 2101;

function kstLabel(year, index) {
  const ms = getSolarTerm(year, index).date.getTime() + 9 * 3600 * 1000;
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

function minutesApart(got, want) {
  const toMin = (label) => {
    const [md, hm] = label.split(' ');
    const [m, d] = md.split('-').map(Number);
    const [hh, mm] = hm.split(':').map(Number);
    return ((m * 31 + d) * 24 + hh) * 60 + mm;
  };
  return Math.abs(toMin(got) - toMin(want));
}

const official = JSON.parse(readFileSync(join(root, 'test/fixtures/kasi-solar-terms.json'), 'utf8'));
const rows = [];
for (let year = MIN_YEAR; year <= MAX_YEAR; year += 1) {
  const labels = [];
  for (let index = 0; index < 24; index += 1) labels.push(kstLabel(year, index));
  rows.push(labels);
}

for (const [year, wants] of Object.entries(official)) {
  const labels = rows[Number(year) - MIN_YEAR];
  wants.forEach((want, index) => {
    const gap = minutesApart(labels[index], want);
    const limit = year === '2004' ? 0 : 1;
    if (gap > limit) {
      throw new Error(`${year} 절기 ${index} 차이 ${gap}분: ${labels[index]} / 월력요항 ${want}`);
    }
  });
}

function hasLunarYear(year) {
  try {
    for (let month = 1; month <= 12; month += 1) lunarToSolar(year, month, 1, false);
    return true;
  } catch {
    return false;
  }
}

let lunarMin = MIN_YEAR;
while (lunarMin <= MAX_YEAR && !hasLunarYear(lunarMin)) lunarMin += 1;
let lunarMax = MAX_YEAR;
while (lunarMax >= lunarMin && !hasLunarYear(lunarMax)) lunarMax -= 1;
if (lunarMax < 2100 || lunarMin > 1899) {
  throw new Error(`음력 표 범위가 1899–2100을 덮지 못합니다: ${lunarMin}–${lunarMax}`);
}

const lunar = [];
for (let year = lunarMin; year <= lunarMax; year += 1) {
  for (let month = 1; month <= 12; month += 1) {
    for (const leap of [false, true]) {
      let start;
      try {
        start = lunarToSolar(year, month, 1, leap);
      } catch {
        if (!leap) throw new Error(`음력 ${year}-${month} 초하루가 없습니다.`);
        continue;
      }
      let days = 29;
      try {
        lunarToSolar(year, month, 30, leap);
        days = 30;
      } catch {
        days = 29;
      }
      lunar.push([year, month, leap ? 1 : 0, start.year, start.month, start.day, days]);
    }
  }
}
lunar.sort((a, b) => a[3] - b[3] || a[4] - b[4] || a[5] - b[5] || a[2] - b[2]);

const checks = JSON.parse(readFileSync(join(root, 'test/fixtures/kasi-lunar.json'), 'utf8'));
for (const row of checks) {
  const [y, m, d, leap] = row.lunar;
  const found = lunar.find((item) => item[0] === y && item[1] === m && item[2] === (leap ? 1 : 0));
  if (!found) throw new Error(`음력 표에 ${y}-${m} 윤${leap}가 없습니다.`);
  const [sy, sm, sd] = row.solar;
  const start = Date.UTC(found[3], found[4] - 1, found[5]);
  const target = Date.UTC(sy, sm - 1, sd);
  const offset = Math.round((target - start) / 86400000) + 1;
  if (offset !== d) {
    throw new Error(`음력 ${y}-${m}-${d} 기대 ${sy}-${sm}-${sd}, 표의 초하루는 ${found[3]}-${found[4]}-${found[5]}`);
  }
}

const solarText = `/**
 * 자동 생성. 직접 고치지 말고 \`npm run build-data\`를 다시 실행한다.
 *
 * 1899–2101년 24절기. 각 시각은 협정세계시+9로 적은 시:분이다.
 * 순서: 소한, 대한, 입춘, 우수, 경칩, 춘분, 청명, 곡우, 입하, 소만, 망종, 하지,
 * 소서, 대서, 입추, 처서, 백로, 추분, 한로, 상강, 입동, 소설, 대설, 동지.
 *
 * 출처: manseryeok 2.0.0 (MIT, yhj1024). 그 표는 6tail/lunar-javascript (MIT)의
 * 천문 계산을 분 단위로 보정한 값이다. 런타임에는 이 파일을 조회만 한다.
 * 한국천문연구원 월력요항과 대조한 결과는 test/fixtures/kasi-solar-terms.json 이다.
 */
export const SOLAR_TERM_MIN_YEAR = ${MIN_YEAR};
export const SOLAR_TERM_MAX_YEAR = ${MAX_YEAR};
export const SOLAR_TERMS = [
${rows.map((labels) => `  [${labels.map((label) => `'${label}'`).join(', ')}],`).join('\n')}
];
`;

const lunarText = `/**
 * 자동 생성. 직접 고치지 말고 \`npm run build-data\`를 다시 실행한다.
 *
 * [음력년, 월, 윤달 1/0, 양력년, 양력월, 양력일, 그 달의 일수]
 * 초하루는 양력 날짜다. 출처는 manseryeok 2.0.0의 KASI 음력 표다.
 * 대조: test/fixtures/kasi-lunar.json
 */
export const LUNAR_MONTHS = [
${lunar.map((item) => `  [${item.join(', ')}],`).join('\n')}
];
`;

writeFileSync(join(root, 'src/data/solar-terms.js'), solarText);
writeFileSync(join(root, 'src/data/lunar-months.js'), lunarText);
console.log(`절기 ${rows.length}년, 음력 월 ${lunar.length}개`);
