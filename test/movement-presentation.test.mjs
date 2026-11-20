import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeMovementSignals, MOVEMENT_INDEX_VERSION } from '../src/index.js';

const signal = (key, target='year', basis=null) => ({
  key, target, details: basis ? { basis } : {},
});

test('변화 신호가 없는 해는 0점과 중립 코멘트를 표시한다', () => {
  const a = summarizeMovementSignals([
    signal('YEOKMA_NATAL'), signal('SEUN_BRANCH_COMBINE'),
    signal('HOUR_UNKNOWN'), signal('NO_DAEUN_BAND'),
  ]);
  assert.equal(a.score, 0);
  assert.equal(a.version, MOVEMENT_INDEX_VERSION);
  assert.match(a.comment, /신호가 적어요/);
  assert.ok(a.icon);
  assert.match(a.caveat, /이사 확률/);
});
test('동일 신호 중복은 점수를 중복 가산하지 않고 연지·일지 기준은 구분한다', () => {
  const a = summarizeMovementSignals([
    signal('YEOKMA_SEUN', 'year', 'year'),
    signal('YEOKMA_SEUN', 'year', 'year'),
    signal('YEOKMA_SEUN', 'year', 'day'),
    signal('YEOKMA_DAEUN', 'daeun', 'year'),
    signal('SEUN_BRANCH_CLASH', 'day'),
    signal('SEUN_BRANCH_CLASH', 'day'),
    signal('SEUN_BRANCH_CLASH', 'month'),
    signal('DAEUN_TRANSITION', 'daeun'),
  ]);
  assert.equal(a.score, 95);
  assert.equal(a.contributions.length, 6);
  assert.match(a.comment, /겹쳐/);
});
test('100점 상한, 기준 버전, 입력 불변성을 유지한다', () => {
  const raw = [
    signal('YEOKMA_SEUN', 'year', 'year'), signal('YEOKMA_SEUN', 'year', 'day'),
    signal('YEOKMA_DAEUN', 'daeun', 'year'), signal('YEOKMA_DAEUN', 'daeun', 'day'),
    signal('SEUN_BRANCH_CLASH', 'year'), signal('SEUN_BRANCH_CLASH', 'month'),
    signal('SEUN_BRANCH_CLASH', 'day'), signal('SEUN_BRANCH_CLASH', 'hour'),
    signal('SEUN_DAEUN_CLASH', 'daeun'), signal('DAEUN_TRANSITION', 'daeun'),
  ];
  const original = JSON.stringify(raw);
  const a = summarizeMovementSignals(raw);
  assert.equal(a.score, 100);
  assert.deepEqual(summarizeMovementSignals(raw), a);
  assert.equal(JSON.stringify(raw), original);
  assert.ok(!('probability' in a) && !('lucky' in a));
});
test('잘못된 입력이나 역마 기준은 오류 처리한다', () => {
  for (const input of [null, {}, 'hi', [null], [{ key: null }]]) {
    assert.throws(() => summarizeMovementSignals(input), e => e.code === 'signal-input');
  }
  assert.throws(() => summarizeMovementSignals([signal('YEOKMA_SEUN', 'year', 'month')]),
    e => e.code === 'signal-input');
});
