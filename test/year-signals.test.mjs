import assert from 'node:assert/strict';
import test from 'node:test';
import { branchRelation, getSeun, getYearSignals, getSaju, getDaeun } from '../src/index.js';

const CLASH = [['자', '오'], ['축', '미'], ['인', '신'], ['묘', '유'], ['진', '술'], ['사', '해']];
const COMBINE = [['자', '축'], ['인', '해'], ['묘', '술'], ['진', '유'], ['사', '신'], ['오', '미']];

test('육충·육합의 12쌍은 대칭이고 나머지 관계는 추측하지 않는다', () => {
  for (const [a, b] of CLASH) {
    assert.equal(branchRelation(a, b), 'clash');
    assert.equal(branchRelation(b, a), 'clash');
  }
  for (const [a, b] of COMBINE) {
    assert.equal(branchRelation(a, b), 'combine');
    assert.equal(branchRelation(b, a), 'combine');
  }
  assert.equal(branchRelation('자', '자'), null);
  assert.equal(branchRelation('자', '인'), null);
  assert.throws(() => branchRelation('?', '오'), (e) => e.code === 'branch');
});

test('세운은 갑자 1984년을 기준으로 60년 주기로 순환한다', () => {
  assert.equal(getSeun(1984).pillar.text, '갑자');
  assert.equal(getSeun(2000).pillar.text, '경진');
  assert.equal(getSeun(2044).pillar.text, '갑자');
  for (let year = 1900; year <= 2040; year += 1) {
    assert.deepEqual(getSeun(year).pillar, getSeun(year + 60).pillar);
  }
  assert.deepEqual(getSeun(2000).startsAt, { y: 2000, m: 2, d: 4, hh: 21, mm: 40 });
  for (const y of [1899, 2101, 2026.5, NaN, '2026']) {
    assert.throws(() => getSeun(y), (e) => e.code === 'year-range');
  }
});

test('입춘 전후 실제 연주는 전년도/당해 세운 간지와 일치한다', () => {
  const prev = getSaju({ y: 2000, m: 2, d: 4, hh: 21, mm: 39 });
  const next = getSaju({ y: 2000, m: 2, d: 4, hh: 21, mm: 40 });
  assert.deepEqual(prev.pillars.year, getSeun(1999).pillar);
  assert.deepEqual(next.pillars.year, getSeun(2000).pillar);
});

test('대운 시작 전과 시작 첫해·마지막 해·다음 구간 전환을 구별한다', () => {
  const birth = { y: 2000, m: 1, d: 1, hh: 12, mm: 0 };
  const saju = getSaju(birth);
  const daeun = getDaeun({ saju, gender: '여', birth });
  assert.equal(daeun.pillars[0].fromYear, 2001);
  const first = getYearSignals({ saju, daeun, year: 2000 });
  assert.equal(first.daeun, null);
  assert.equal(first.signals[0].key, 'NO_DAEUN_BAND');
  const start = getYearSignals({ saju, daeun, year: 2001 });
  assert.equal(start.signals[0].key, 'DAEUN_TRANSITION');
  assert.equal(start.daeun.text, daeun.pillars[0].text);
  const last = getYearSignals({ saju, daeun, year: 2010 });
  assert.ok(!last.signals.some((s) => s.key === 'DAEUN_TRANSITION'));
  const second = getYearSignals({ saju, daeun, year: 2011 });
  assert.equal(second.signals[0].key, 'DAEUN_TRANSITION');
});

test('원국의 동일 지지는 위치별 신호로 보존하며 시주 미입력은 명시한다', () => {
  const birth = { y: 2000, m: 1, d: 1, hh: 12, mm: 0 };
  const saju = getSaju(birth);
  const daeun = getDaeun({ saju, gender: '남', birth });
  const fake = {
    ...saju,
    pillars: {
      year: { stem: '갑', branch: '오', text: '갑오' },
      month: { stem: '병', branch: '오', text: '병오' },
      day: { stem: '기', branch: '축', text: '기축' },
      hour: null,
    },
  };
  const signals = getYearSignals({ saju: fake, daeun, year: 1984 }).signals;
  assert.deepEqual(signals.filter(s => s.key === 'SEUN_BRANCH_CLASH').map(s => s.target), ['year', 'month']);
  assert.deepEqual(signals.filter(s => s.key === 'SEUN_BRANCH_COMBINE').map(s => s.target), ['day']);
  assert.equal(signals.find(s => s.key === 'HOUR_UNKNOWN').target, 'hour');
  assert.equal(signals.every(s => !('score' in s) && !('level' in s)), true);
});

test('대운 간지와 세운 간지 관계를 별도로 계산한다', () => {
  const birth = { y: 2000, m: 1, d: 1, hh: 12, mm: 0 };
  const saju = getSaju(birth);
  const real = getDaeun({ saju, gender: '여', birth });
  const modified = { ...real, pillars: real.pillars.map(p => ({ ...p })) };
  const index = modified.pillars.findIndex(p => p.fromYear <= 2044 && 2044 <= p.toYear);
  modified.pillars[index] = { ...modified.pillars[index], stem: '갑', branch: '오', text: '갑오' };
  const r = getYearSignals({ saju, daeun: modified, year: 2044 });
  assert.equal(r.seun.pillar.text, '갑자');
  assert.ok(r.signals.some(s => s.key === 'SEUN_DAEUN_CLASH' && s.source === 'daeun'));
});

test('동일 입력은 결정적이고 입력 오류는 조용히 무시하지 않는다', () => {
  const birth = { y: 2000, m: 1, d: 1, hh: 12, mm: 0 };
  const saju = getSaju(birth);
  const daeun = getDaeun({ saju, gender: '남', birth });
  const a = getYearSignals({ saju, daeun, year: 2026 });
  assert.deepEqual(a, getYearSignals({ saju, daeun, year: 2026 }));
  assert.throws(() => getYearSignals({ saju, year: 2026 }), (e) => e.code === 'daeun-input');
  assert.throws(() => getYearSignals({ saju: {}, daeun, year: 2026 }), (e) => e.code === 'pillar');
  const bad = { ...daeun, pillars: daeun.pillars.map(p => ({ ...p })) };
  bad.pillars[1].fromYear += 1;
  assert.throws(() => getYearSignals({ saju, daeun: bad, year: 2026 }), (e) => e.code === 'daeun-input');
  const badPillar = { ...saju, pillars: { ...saju.pillars, day: { stem: '갑', branch: '축', text: '갑축' } } };
  assert.throws(() => getYearSignals({ saju: badPillar, daeun, year: 2026 }), (e) => e.code === 'pillar');
});
