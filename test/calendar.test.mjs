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
  assert.equal(result.pillars.hour, null);
  assert.equal(result.lunar.year, 1999);
  assert.equal(result.lunar.month, 11);
  assert.equal(result.lunar.day, 25);
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
  assert.equal(male.direction, '역행');
  assert.equal(male.days, 25);
  assert.equal(male.startAge, 8);
  assert.equal(getDaeun({ saju, gender: '여', birth }).year, undefined);
});

test('절입일 2000-01-06 정오는 순행 10, 역행 1이다', () => {
  const saju = getSaju({ y: 2000, m: 1, d: 6, hh: 12, mm: 0 });
  const birth = { y: 2000, m: 1, d: 6, hh: 12, mm: 0 };
  assert.equal(saju.pillars.month.text, '정축');
  assert.equal(getDaeun({ saju, gender: '여', birth }).startAge, 10);
  assert.equal(getDaeun({ saju, gender: '남', birth }).startAge, 1);
});

test('성별이 없으면 대운 방향을 추측하지 않는다', () => {
  const saju = getSaju({ y: 2000, m: 1, d: 1, hh: 12, mm: 0 });
  assert.throws(() => getDaeun({ saju, gender: '모름', birth: { y: 2000, m: 1, d: 1, hh: 12, mm: 0 } }), (error) => error.code === 'gender');
});
