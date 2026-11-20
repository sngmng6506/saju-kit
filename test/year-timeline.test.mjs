import assert from 'node:assert/strict';
import test from 'node:test';
import { getSaju, getDaeun, getYearSignals, explainYearSignals, getYearTimeline } from '../src/index.js';

function sample(hasHour = true) {
  const birth = { y: 2000, m: 1, d: 1, ...(hasHour ? { hh: 12, mm: 0 } : {}) };
  const saju = getSaju(birth);
  const daeun = getDaeun({ saju, gender: '여', birth });
  return { saju, daeun };
}

test('기준 연도는 과거 10년·현재·미래 10년을 겹침 없이 정확히 구분한다', () => {
  const { saju, daeun } = sample();
  const result = getYearTimeline({ saju, daeun, anchorYear: 2026 });
  assert.deepEqual(result.past.map(x => x.year), Array.from({ length: 10 }, (_, i) => 2016 + i));
  assert.equal(result.current.year, 2026);
  assert.deepEqual(result.future.map(x => x.year), Array.from({ length: 10 }, (_, i) => 2027 + i));
  assert.equal(result.past.length + result.future.length + 1, 21);
  assert.deepEqual(result.metadata, {
    calendarYearRange: [1900, 2100], seunBoundary: 'ipchun',
    interpretation: 'traditional-relationships-only-v1', ranked: false,
  });
});

test('개별 연도 API와 타임라인의 원시 관계·한국어 설명이 정확히 일치한다', () => {
  const { saju, daeun } = sample();
  const timeline = getYearTimeline({ saju, daeun, anchorYear: 2026, yearsBefore: 3, yearsAfter: 4 });
  for (const row of [...timeline.past, timeline.current, ...timeline.future]) {
    const base = getYearSignals({ saju, daeun, year: row.year });
    const explanation = explainYearSignals(base);
    assert.deepEqual(row.seun, base.seun);
    assert.deepEqual(row.daeun, base.daeun);
    assert.deepEqual(row.signals, base.signals);
    assert.deepEqual(row.explanation.items, explanation.items);
    assert.deepEqual(row.explanation.notes, explanation.notes);
    assert.equal(row.explanation.interpretation, explanation.interpretation);
    assert.ok(!('score' in row) && !('level' in row) && !('recommendation' in row));
  }
});

test('시주가 없는 결과는 모든 연도에 결측을 유지하고 유효한 신호만 설명한다', () => {
  const { saju, daeun } = sample(false);
  const timeline = getYearTimeline({ saju, daeun, anchorYear: 2026, yearsBefore: 2, yearsAfter: 2 });
  for (const row of [...timeline.past, timeline.current, ...timeline.future]) {
    assert.ok(row.signals.some(s => s.key === 'HOUR_UNKNOWN'));
    assert.ok(row.explanation.items.some(s => s.key === 'HOUR_UNKNOWN'));
    assert.ok(!row.signals.some(s => s.target === 'hour' && s.key !== 'HOUR_UNKNOWN'));
  }
});

test('0년 조회 수, 입력 객체 불변 및 같은 입력의 결정성을 지킨다', () => {
  const { saju, daeun } = sample();
  const before = JSON.stringify({ saju, daeun });
  const input = { saju, daeun, anchorYear: 2026, yearsBefore: 0, yearsAfter: 0 };
  const a = getYearTimeline(input);
  assert.equal(a.past.length, 0);
  assert.equal(a.future.length, 0);
  assert.equal(a.current.year, 2026);
  assert.deepEqual(getYearTimeline(input), a);
  assert.equal(JSON.stringify({ saju, daeun }), before);
});

test('달력 경계와 잘못된 조회 기간은 부분 결과 없이 오류를 반환한다', () => {
  const { saju, daeun } = sample();
  const base = { saju, daeun, anchorYear: 2026 };
  for (const anchorYear of [1899, 2101, NaN, 2026.5, '2026', null]) {
    assert.throws(() => getYearTimeline({ ...base, anchorYear }), e => e.code === 'year-range');
  }
  for (const yearsBefore of [-1, 1.5, 51, '10', NaN]) {
    assert.throws(() => getYearTimeline({ ...base, yearsBefore }), e => e.code === 'timeline-range');
  }
  for (const yearsAfter of [-1, 51, '0']) {
    assert.throws(() => getYearTimeline({ ...base, yearsAfter }), e => e.code === 'timeline-range');
  }
  assert.throws(() => getYearTimeline({ ...base, anchorYear: 1900 }), e => e.code === 'timeline-range');
  assert.throws(() => getYearTimeline({ ...base, anchorYear: 2100 }), e => e.code === 'timeline-range');
  assert.throws(() => getYearTimeline({ ...base, anchorYear: 2100, yearsBefore: 0, yearsAfter: 0 }),
    e => e.code === 'daeun-range');
  assert.throws(() => getYearTimeline({ ...base, anchorYear: 1900, yearsBefore: 0, yearsAfter: 0 }),
    e => e.code !== 'timeline-range');
});

test('대운 계산이 부족한 기간은 조용히 누락하지 않고 원래 오류를 전달한다', () => {
  const { saju, daeun } = sample();
  assert.throws(() => getYearTimeline({ saju, daeun, anchorYear: 2090, yearsBefore: 10, yearsAfter: 10 }),
    e => e.code === 'daeun-range');
});

test('사주 미입력이나 대운 미입력을 임의 원국으로 대체하지 않는다', () => {
  const { saju, daeun } = sample();
  assert.throws(() => getYearTimeline({ saju, anchorYear: 2026 }), e => e.code === 'daeun-input');
  assert.throws(() => getYearTimeline({ daeun, anchorYear: 2026 }), e => e.code === 'pillar');
});
