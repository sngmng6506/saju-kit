import test from 'node:test';
import assert from 'node:assert/strict';
import { explainYearSignals, getSaju, getDaeun, getYearSignals } from '../src/index.js';

function setup() {
  const birth = { y: 2000, m: 1, d: 1, hh: 12, mm: 0 };
  const saju = getSaju(birth);
  const daeun = getDaeun({ saju, gender: '여', birth });
  return { saju, daeun };
}

test('설명은 기존 신호와 1:1 대응하며 합충·역마 근거와 원국 위치를 유지한다', () => {
  const { saju, daeun } = setup();
  const result = getYearSignals({ saju, daeun, year: 2026 });
  const explained = explainYearSignals(result);
  assert.equal(explained.year, 2026);
  assert.equal(explained.seunPillar, result.seun.pillar.text);
  assert.deepEqual(explained.items.map(i => i.key), result.signals.map(i => i.key));
  assert.deepEqual(explained.items.map(i => i.target), result.signals.map(i => i.target));
  assert.deepEqual(explained.items.map(i => i.details), result.signals.map(i => i.details));
  assert.ok(explained.items.every(i => typeof i.description === 'string' && i.description.length > 0));
  assert.match(explained.notes[0], /이사/);
  assert.match(explained.notes[1], /입춘/);
  assert.equal(explained.interpretation, 'traditional-relationships-only-v1');
});

test('연지 기준과 일지 기준 역마가 일치해도 별도 설명으로 남는다', () => {
  const { saju, daeun } = setup();
  const fake = { pillars: { ...saju.pillars,
    year: { stem: '갑', branch: '자', text: '갑자' },
    day: { stem: '무', branch: '진', text: '무진' } } };
  const raw = getYearSignals({ saju: fake, daeun, year: 2022 });
  const explained = explainYearSignals(raw);
  const horse = explained.items.filter(i => i.key === 'YEOKMA_SEUN');
  assert.equal(horse.length, 2);
  assert.deepEqual(horse.map(i => i.details.basis), ['year', 'day']);
  assert.match(horse[0].description, /연지/);
  assert.match(horse[1].description, /일지/);
});

test('시주 모름과 대운 시작 이전을 임의 판단 없이 설명한다', () => {
  const { saju, daeun } = setup();
  const partial = { pillars: { ...saju.pillars, hour: null } };
  const raw = getYearSignals({ saju: partial, daeun, year: 2000 });
  const described = explainYearSignals(raw);
  assert.ok(described.items.some(i => i.key === 'HOUR_UNKNOWN' && i.description.includes('제외')));
  assert.ok(described.items.some(i => i.key === 'NO_DAEUN_BAND'));
});

test('설명은 결정적이며 원본 신호를 수정하지 않는다', () => {
  const { saju, daeun } = setup();
  for (const year of [2016, 2022, 2026, 2028, 2030]) {
    const raw = getYearSignals({ saju, daeun, year });
    const before = JSON.stringify(raw);
    assert.deepEqual(explainYearSignals(raw), explainYearSignals(raw));
    assert.equal(JSON.stringify(raw), before);
    const result = explainYearSignals(raw);
    assert.ok(!('score' in result) && !('level' in result) && !('recommendation' in result));
    assert.ok(!JSON.stringify(result).includes('손 없는 날'));
    assert.ok(!JSON.stringify(result).includes('방위'));
  }
});

test('지원하지 않는 신호 또는 위조된 기준·위치를 설명하지 않는다', () => {
  const { saju, daeun } = setup();
  const raw = getYearSignals({ saju, daeun, year: 2022 });
  const fake = signal => ({ ...raw, signals: [signal] });
  assert.throws(() => explainYearSignals({}), e => e.code === 'signal-input');
  assert.throws(() => explainYearSignals(fake({ key: 'UNKNOWN' })), e => e.code === 'signal-input');
  assert.throws(() => explainYearSignals(fake({
    key: 'YEOKMA_SEUN', source: 'calendar', target: 'year', relation: 'yeokma',
    details: { basis: 'month', basisBranch: '자', yeokmaBranch: '인', matchedBranch: '인' },
  })), e => e.code === 'signal-input');
  assert.throws(() => explainYearSignals(fake({
    key: 'YEOKMA_SEUN', source: 'calendar', target: 'year', relation: 'yeokma',
    details: { basis: 'year', basisBranch: '자', yeokmaBranch: '인', matchedBranch: '오' },
  })), e => e.code === 'signal-input');
  assert.throws(() => explainYearSignals(fake({
    key: 'SEUN_BRANCH_CLASH', source: 'natal', target: '__proto__', relation: 'clash',
    details: { seunBranch: '자', natalBranch: '오' },
  })), e => e.code === 'signal-input');
});
