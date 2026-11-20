import assert from 'node:assert/strict';
import test from 'node:test';
import { getSaju, getDaeun, getYearSignals, explainYearSignals, getYearTimeline } from '../src/index.js';

function fixture(gender = '여', hour = true) {
  const birth = { y: 2000, m: 1, d: 1, ...(hour ? { hh: 12, mm: 0 } : {}) };
  const saju = getSaju(birth);
  return { saju, daeun: getDaeun({ saju, gender, birth }) };
}

test('첫 대운 시작 나이부터 80세까지 매년 연속 계산한다', () => {
  const { saju, daeun } = fixture();
  const t = getYearTimeline({ saju, daeun });
  assert.equal(t.birthYear, 2000);
  assert.equal(t.startAge, 2);
  assert.equal(t.endAge, 80);
  assert.equal(t.fromYear, 2001);
  assert.equal(t.toYear, 2079);
  assert.equal(t.years.length, 79);
  assert.deepEqual(t.years.map(x => x.age), Array.from({ length: 79 }, (_, i) => i + 2));
  assert.deepEqual(t.years.map(x => x.year), Array.from({ length: 79 }, (_, i) => i + 2001));
  assert.equal(t.ageSystem, '세는나이');
});
test('역행은 남성의 대운 시작 나이에 맞춰 계산한다', () => {
  const { saju, daeun } = fixture('남');
  const t = getYearTimeline({ saju, daeun });
  assert.equal(t.startAge, 8);
  assert.equal(t.fromYear, 2007);
  assert.equal(t.toYear, 2079);
  assert.equal(t.years.length, 73);
});
test('모든 연도 결과가 기존 단일 연도 계산과 일치한다', () => {
  const { saju, daeun } = fixture();
  const t = getYearTimeline({ saju, daeun, endAge: 30 });
  for (const row of t.years) {
    const raw = getYearSignals({ saju, daeun, year: row.year });
    const text = explainYearSignals(raw);
    assert.equal(row.year, t.birthYear + row.age - 1);
    assert.deepEqual(row.signals, raw.signals);
    assert.deepEqual(row.daeun, raw.daeun);
    assert.deepEqual(row.seun, raw.seun);
    assert.deepEqual(row.explanation.items, text.items);
    assert.deepEqual(row.explanation.notes, text.notes);
  }
});
test('시주 없을 때 원국 시지를 추측하지 않는다', () => {
  const { saju, daeun } = fixture('여', false);
  for (const row of getYearTimeline({ saju, daeun, endAge: 8 }).years) {
    assert.ok(row.signals.some(x => x.key === 'HOUR_UNKNOWN'));
    assert.ok(!row.signals.some(x => x.target === 'hour' && x.key !== 'HOUR_UNKNOWN'));
  }
});
test('종료 나이 지정과 결과 결정성 및 입력 불변성을 검증한다', () => {
  const { saju, daeun } = fixture();
  const t = getYearTimeline({ saju, daeun, endAge: 2 });
  assert.equal(t.years.length, 1);
  const before = JSON.stringify({ saju, daeun });
  assert.deepEqual(getYearTimeline({ saju, daeun, endAge: 30 }),
    getYearTimeline({ saju, daeun, endAge: 30 }));
  assert.equal(JSON.stringify({ saju, daeun }), before);
});
test('잘못된 나이와 범위 밖 연도를 오류 처리한다', () => {
  const { saju, daeun } = fixture();
  for (const endAge of [1, 121, 80.5, NaN, null, '80']) {
    assert.throws(() => getYearTimeline({ saju, daeun, endAge }), e => e.code === 'timeline-range');
  }
  assert.throws(() => getYearTimeline({ saju, daeun, endAge: 102 }),
    e => e.code === 'timeline-range');
  assert.throws(() => getYearTimeline({ saju, daeun: {} }), e => e.code === 'daeun-input');
  assert.throws(() => getYearTimeline({ saju, daeun: { ...daeun, startAge: 6 } }),
    e => e.code === 'daeun-input');
  assert.throws(() => getYearTimeline({ daeun }), e => e.code === 'pillar');
});
test('과거-미래 10년 방식으로 넘긴 옵션은 무시하지 않고 거부한다', () => {
  const { saju, daeun } = fixture();
  // Old API args must not be silently ignored by the new age-based contract.
  assert.throws(() => getYearTimeline({ saju, daeun, anchorYear: 2026 }),
    e => e.code === 'timeline-input');
});
