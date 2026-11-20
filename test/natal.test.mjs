import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeNatalStructure, getSaju, tenGodForStem } from '../src/index.js';

// Independent expected ten-god rows for ten day masters, target stems in
// 갑 을 병 정 무 기 경 신 임 계 order. These are reference tables, not computed
// from analyzeNatalStructure.
const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const TEN_GOD_REFERENCE = [
  ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'],
  ['겁재','비견','상관','식신','정재','편재','정관','편관','정인','편인'],
  ['편인','정인','비견','겁재','식신','상관','편재','정재','편관','정관'],
  ['정인','편인','겁재','비견','상관','식신','정재','편재','정관','편관'],
  ['편관','정관','편인','정인','비견','겁재','식신','상관','편재','정재'],
  ['정관','편관','정인','편인','겁재','비견','상관','식신','정재','편재'],
  ['편재','정재','편관','정관','편인','정인','비견','겁재','식신','상관'],
  ['정재','편재','정관','편관','정인','편인','겁재','비견','상관','식신'],
  ['식신','상관','편재','정재','편관','정관','편인','정인','비견','겁재'],
  ['상관','식신','정재','편재','정관','편관','정인','편인','겁재','비견'],
];

test('전체 10×10 천간 십성 대조표와 일치한다', () => {
  for (let i = 0; i < STEMS.length; i += 1) {
    for (let j = 0; j < STEMS.length; j += 1) {
      assert.equal(tenGodForStem(STEMS[i], STEMS[j]), TEN_GOD_REFERENCE[i][j],
        STEMS[i] + ' 일간 / ' + STEMS[j] + ' 천간');
    }
  }
});

test('천간 오행과 음양·12지지 표면 오행을 고정된 대응표로 반환한다', () => {
  const saju = {
    pillars: {
      year: { stem: '갑', branch: '자', text: '갑자' },
      month: { stem: '을', branch: '축', text: '을축' },
      day: { stem: '병', branch: '인', text: '병인' },
      hour: { stem: '정', branch: '묘', text: '정묘' },
    },
  };
  const r = analyzeNatalStructure({ saju });
  assert.deepEqual(r.dayMaster, { stem: '병', element: 'fire', yinYang: 'yang' });
  assert.deepEqual(r.pillars.year, {
    stem: { element: 'wood', yinYang: 'yang', tenGod: '편인' },
    branch: { element: 'water' },
  });
  assert.deepEqual(r.pillars.month, {
    stem: { element: 'wood', yinYang: 'yin', tenGod: '정인' },
    branch: { element: 'earth' },
  });
  assert.deepEqual(r.pillars.day, {
    stem: { element: 'fire', yinYang: 'yang', tenGod: '비견' },
    branch: { element: 'wood' },
  });
  assert.deepEqual(r.pillars.hour, {
    stem: { element: 'fire', yinYang: 'yin', tenGod: '겁재' },
    branch: { element: 'wood' },
  });
  assert.deepEqual(r.elementCounts, { wood: 4, fire: 2, earth: 1, metal: 0, water: 1 });
  assert.deepEqual(r.metadata, { basis: 'visible-stems-and-branches-v1', completeHour: true });
});

test('시주가 없으면 null을 보존하고 표면 오행은 총 여섯 글자다', () => {
  const saju = getSaju({ y: 2000, m: 1, d: 1 });
  const r = analyzeNatalStructure({ saju });
  assert.equal(r.pillars.hour, null);
  assert.equal(r.metadata.completeHour, false);
  assert.equal(Object.values(r.elementCounts).reduce((a, b) => a + b, 0), 6);
  assert.equal(r.pillars.day.stem.tenGod, '비견');
  assert.ok(!('score' in r) && !('strong' in r) && !('yongsin' in r));
});

test('시주를 제공하면 표면 오행 여덟 글자가 누적된다', () => {
  const saju = getSaju({ y: 2000, m: 1, d: 1, hh: 12, mm: 0 });
  const r = analyzeNatalStructure({ saju });
  assert.equal(Object.values(r.elementCounts).reduce((a, b) => a + b, 0), 8);
  assert.equal(r.metadata.completeHour, true);
});

test('동일 출생 시각의 양력·음력 원국 분석은 동일하다', () => {
  const a = getSaju({ y: 2000, m: 1, d: 1, hh: 12, mm: 0 });
  const b = getSaju({ y: 1999, m: 11, d: 25, calendar: 'lunar', hh: 12, mm: 0 });
  assert.deepEqual(analyzeNatalStructure({ saju: a }), analyzeNatalStructure({ saju: b }));
});

test('연월일 간지 누락, 임의 지지, 비정상 60갑자를 거부한다', () => {
  const valid = getSaju({ y: 2000, m: 1, d: 1, hh: 12, mm: 0 });
  assert.throws(() => analyzeNatalStructure({}), e => e.code === 'saju-input');
  assert.throws(() => analyzeNatalStructure({ saju: { pillars: {} } }), e => e.code === 'pillar');
  assert.throws(() => analyzeNatalStructure({ saju: {
    pillars: { ...valid.pillars, day: { stem: '갑', branch: '축', text: '갑축' } },
  } }), e => e.code === 'pillar');
  assert.throws(() => analyzeNatalStructure({ saju: {
    pillars: { ...valid.pillars, month: { stem: '무', branch: '없음', text: '무없음' } },
  } }), e => e.code === 'branch');
  assert.throws(() => analyzeNatalStructure({ saju: {
    pillars: { ...valid.pillars, hour: undefined },
  } }), e => e.code === 'pillar');
  assert.throws(() => tenGodForStem('없음', '갑'), e => e.code === 'stem');
  assert.throws(() => tenGodForStem('갑', '없음'), e => e.code === 'stem');
});

test('입력 원국을 변경하지 않으며 두 번 계산한 결과는 동일하다', () => {
  const saju = getSaju({ y: 2000, m: 1, d: 1, hh: 12, mm: 0 });
  const snapshot = JSON.stringify(saju);
  const a = analyzeNatalStructure({ saju });
  assert.deepEqual(analyzeNatalStructure({ saju }), a);
  assert.equal(JSON.stringify(saju), snapshot);
});
