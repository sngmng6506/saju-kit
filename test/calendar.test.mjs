import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { daeunSu, getDaeun, getSaju, lunarToSolar, solarToLunar } from '../src/index.js';
import { solarTermLabel } from '../src/core/calendar.js';
import { SajuError } from '../src/core/error.js';

const official = JSON.parse(readFileSync(new URL('./fixtures/kasi-solar-terms.json', import.meta.url), 'utf8'));
const lunarFixture = JSON.parse(readFileSync(new URL('./fixtures/kasi-lunar.json', import.meta.url), 'utf8'));

function minutesApart(got, want) {
  const toMin = (label) => {
    const [monthDay, hourMinute] = label.split(' ');
    const [month, day] = monthDay.split('-').map(Number);
    const [hour, minute] = hourMinute.split(':').map(Number);
    return ((month * 31 + day) * 24 + hour) * 60 + minute;
  };
  return Math.abs(toMin(got) - toMin(want));
}

test('2004년 월력요항 24절기와 분이 같다', () => {
  official['2004'].forEach((want, index) => {
    assert.equal(solarTermLabel(2004, index), want);
  });
});

test('2000년과 2016년 월력요항과 1분 이내다', () => {
  for (const year of ['2000', '2016']) {
    official[year].forEach((want, index) => {
      assert.ok(minutesApart(solarTermLabel(Number(year), index), want) <= 1, `${year} ${index}`);
    });
  }
  assert.equal(solarTermLabel(2000, 2), '02-04 21:40');
  assert.equal(solarTermLabel(2016, 2), '02-04 18:46');
});

test('음력 초하루가 월력요항과 같다', () => {
  for (const row of lunarFixture) {
    const [year, month, day, leap] = row.lunar;
    const [sy, sm, sd] = row.solar;
    assert.deepEqual(lunarToSolar(year, month, day, leap), { y: sy, m: sm, d: sd });
    const back = solarToLunar(sy, sm, sd);
    assert.equal(back.year, year);
    assert.equal(back.month, month);
    assert.equal(back.day, day);
    assert.equal(back.leap, leap);
  }
});

test('2000-01-01 정오는 기묘년 병자월 무오일이다', () => {
  const result = getSaju({ y: 2000, m: 1, d: 1, hh: 12, mm: 0 });
  assert.equal(result.pillars.year.text, '기묘');
  assert.equal(result.pillars.month.text, '병자');
  assert.equal(result.pillars.day.text, '무오');
  assert.equal(result.pillars.hour.text, '무오');
  assert.equal(result.lunar.year, 1999);
  assert.equal(result.lunar.month, 11);
  assert.equal(result.lunar.day, 25);
});

test('현대 한국 표준시의 시주 경계와 일간별 시간 천간을 계산한다', () => {
  // 2000-01-01은 무오일이다: 00시 임자, 01시 계축, 03시 갑인, 21시 계해.
  const expected = [[0, '임자'], [1, '계축'], [2, '계축'], [3, '갑인'], [21, '계해'], [22, '계해']];
  for (const [hh, text] of expected) {
    assert.equal(getSaju({ y: 2000, m: 1, d: 1, hh, mm: 0 }).pillars.hour.text, text, String(hh));
  }
  assert.equal(getSaju({ y: 2000, m: 1, d: 2 }).pillars.hour, null);
  assert.throws(() => getSaju({ y: 2000, m: 1, d: 1, hh: 23, mm: 59 }), (e) => e.code === 'day-boundary');
});

test('과거 비표준 법정시의 시주는 추측하지 않고 생략한다', () => {
  const result = getSaju({ y: 1955, m: 4, d: 15, hh: 12, mm: 0 });
  assert.equal(result.pillars.hour, null);
  assert.match(result.hourOmitted, /법정시/);
});

test('입춘 시각에 연주와 월주가 바뀐다', () => {
  const before = getSaju({ y: 2000, m: 2, d: 4, hh: 21, mm: 39 });
  const at = getSaju({ y: 2000, m: 2, d: 4, hh: 21, mm: 40 });
  assert.equal(before.pillars.year.text, '기묘');
  assert.equal(before.pillars.month.text, '정축');
  assert.equal(at.pillars.year.text, '경진');
  assert.equal(at.pillars.month.text, '무인');
  assert.equal(before.pillars.day.text, at.pillars.day.text);
});

test('시각이 없는 절입일은 연주를 추측하지 않는다', () => {
  assert.throws(() => getSaju({ y: 2000, m: 2, d: 4 }), (error) => error.code === 'time-required');
});

test('23시는 일주 경계를 정하기 전에 거부한다', () => {
  assert.throws(() => getSaju({ y: 2000, m: 1, d: 2, hh: 23, mm: 0 }), (error) => error.code === 'day-boundary');
});

test('서머타임 절입 시각은 법정시와 협정세계시+9가 갈리면 거부한다', () => {
  const [monthDay, hourMinute] = solarTermLabel(1987, 14).split(' ');
  const [month, day] = monthDay.split('-').map(Number);
  const [hour, minute] = hourMinute.split(':').map(Number);
  assert.throws(
    () => getSaju({ y: 1987, m: month, d: day, hh: hour, mm: minute }),
    (error) => error.code === 'clock-policy-open',
  );
  const midday = getSaju({ y: 1987, m: 6, d: 15, hh: 12, mm: 0 });
  assert.equal(midday.pillars.hour, null);
});

test('1955년 4월 15일 정오는 30분 오프셋이어도 절과 멀어 계산된다', () => {
  const result = getSaju({ y: 1955, m: 4, d: 15, hh: 12, mm: 0 });
  assert.equal(result.pillars.hour, null);
  assert.ok(result.pillars.year.text);
});

test('지원 범위 밖과 없는 윤달은 오류다', () => {
  assert.throws(() => getSaju({ y: 1899, m: 12, d: 31 }), (error) => error instanceof SajuError);
  assert.throws(() => lunarToSolar(2016, 5, 1, true), (error) => error.code === 'lunar-date');
});

test('정수일 1사2입', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 19, 20, 21, 25, 32].map(daeunSu), [1, 1, 1, 1, 1, 2, 6, 7, 7, 8, 11]);
});

test('2000-01-01의 대운수는 여 2, 남 8이다', () => {
  const saju = getSaju({ y: 2000, m: 1, d: 1, hh: 12, mm: 0 });
  const birth = { y: 2000, m: 1, d: 1, hh: 12, mm: 0 };
  const female = getDaeun({ saju, gender: '여', birth });
  const male = getDaeun({ saju, gender: '남', birth });
  assert.equal(female.direction, '순행');
  assert.equal(female.days, 5);
  assert.equal(female.startAge, 2);
  assert.equal(female.ageSystem, '세는나이');
  assert.equal(female.pillars.length, 10);
  assert.deepEqual(female.pillars[0], {
    stem: '정', branch: '축', text: '정축', fromAge: 2, toAge: 11, fromYear: 2001, toYear: 2010,
  });
  assert.deepEqual(female.pillars[1], {
    stem: '무', branch: '인', text: '무인', fromAge: 12, toAge: 21, fromYear: 2011, toYear: 2020,
  });
  assert.equal(male.direction, '역행');
  assert.equal(male.days, 25);
  assert.equal(male.startAge, 8);
  assert.deepEqual(male.pillars[0], {
    stem: '을', branch: '해', text: '을해', fromAge: 8, toAge: 17, fromYear: 2007, toYear: 2016,
  });
  assert.deepEqual(male.pillars[1], {
    stem: '갑', branch: '술', text: '갑술', fromAge: 18, toAge: 27, fromYear: 2017, toYear: 2026,
  });
  assert.equal(female.pillars[9].fromAge, 92);
  assert.equal(female.pillars[9].toYear - female.pillars[9].fromYear, 9);
});

test('절입일 2000-01-06 정오는 순행 10, 역행 1이다', () => {
  const saju = getSaju({ y: 2000, m: 1, d: 6, hh: 12, mm: 0 });
  const birth = { y: 2000, m: 1, d: 6, hh: 12, mm: 0 };
  assert.equal(saju.pillars.month.text, '정축');
  const female = getDaeun({ saju, gender: '여', birth });
  const male = getDaeun({ saju, gender: '남', birth });
  assert.equal(female.startAge, 10);
  assert.equal(female.pillars[0].text, '무인');
  assert.equal(female.pillars[0].fromYear, 2009);
  assert.equal(female.pillars[0].toYear, 2018);
  assert.equal(male.startAge, 1);
  assert.equal(male.pillars[0].text, '병자');
  assert.equal(male.pillars[0].fromYear, 2000);
  assert.equal(male.pillars[0].toYear, 2009);
});

test('역행이 갑자 월주 앞이면 계해로 넘어간다', () => {
  const saju = getSaju({ y: 1989, m: 1, d: 1, hh: 12, mm: 0 });
  const birth = { y: 1989, m: 1, d: 1, hh: 12, mm: 0 };
  assert.equal(saju.pillars.month.text, '갑자');
  const female = getDaeun({ saju, gender: '여', birth });
  assert.equal(female.direction, '역행');
  assert.equal(female.pillars[0].text, '계해');
  assert.equal(female.pillars[0].fromYear, 1989 + female.startAge - 1);
});

test('성별이 없으면 대운 방향을 추측하지 않는다', () => {
  const saju = getSaju({ y: 2000, m: 1, d: 1, hh: 12, mm: 0 });
  assert.throws(() => getDaeun({ saju, gender: '모름', birth: { y: 2000, m: 1, d: 1, hh: 12, mm: 0 } }), (error) => error.code === 'gender');
});
