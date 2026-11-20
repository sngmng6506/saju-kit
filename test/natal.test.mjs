import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeNatalStructure, findHiddenStemOccurrences, getHiddenStems, HIDDEN_STEMS_VERSION, getSaju, tenGodForStem } from '../src/index.js';

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
    branch: { element: 'water', hiddenStems: [
      { stem: '임', role: 'residual', element: 'water', yinYang: 'yang', tenGod: '편관' },
      { stem: '계', role: 'principal', element: 'water', yinYang: 'yin', tenGod: '정관' },
    ] },
  });
  assert.deepEqual(r.pillars.month, {
    stem: { element: 'wood', yinYang: 'yin', tenGod: '정인' },
    branch: { element: 'earth', hiddenStems: [
      { stem: '계', role: 'residual', element: 'water', yinYang: 'yin', tenGod: '정관' },
      { stem: '신', role: 'middle', element: 'metal', yinYang: 'yin', tenGod: '정재' },
      { stem: '기', role: 'principal', element: 'earth', yinYang: 'yin', tenGod: '상관' },
    ] },
  });
  assert.deepEqual(r.pillars.day, {
    stem: { element: 'fire', yinYang: 'yang', tenGod: '비견' },
    branch: { element: 'wood', hiddenStems: [
      { stem: '무', role: 'residual', element: 'earth', yinYang: 'yang', tenGod: '식신' },
      { stem: '병', role: 'middle', element: 'fire', yinYang: 'yang', tenGod: '비견' },
      { stem: '갑', role: 'principal', element: 'wood', yinYang: 'yang', tenGod: '편인' },
    ] },
  });
  assert.deepEqual(r.pillars.hour, {
    stem: { element: 'fire', yinYang: 'yin', tenGod: '겁재' },
    branch: { element: 'wood', hiddenStems: [
      { stem: '갑', role: 'residual', element: 'wood', yinYang: 'yang', tenGod: '편인' },
      { stem: '을', role: 'principal', element: 'wood', yinYang: 'yin', tenGod: '정인' },
    ] },
  });
  assert.deepEqual(r.elementCounts, { wood: 4, fire: 2, earth: 1, metal: 0, water: 1 });
  assert.deepEqual(r.metadata, { basis: 'visible-stems-and-branches-v1', completeHour: true,
    hiddenStemsBasis: HIDDEN_STEMS_VERSION });
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

test('지장간 표 12개를 여기→중기→정기 순서로 정확히 유지한다', () => {
  const reference = {
    자: ['임', '계'], 축: ['계', '신', '기'], 인: ['무', '병', '갑'],
    묘: ['갑', '을'], 진: ['을', '계', '무'], 사: ['무', '경', '병'],
    오: ['병', '기', '정'], 미: ['정', '을', '기'], 신: ['무', '임', '경'],
    유: ['경', '신'], 술: ['신', '정', '무'], 해: ['무', '갑', '임'],
  };
  for (const [branch, stems] of Object.entries(reference)) {
    const entries = getHiddenStems(branch);
    assert.deepEqual(entries.map(x => x.stem), stems, branch);
    assert.deepEqual(entries.map(x => x.role), stems.length === 2
      ? ['residual', 'principal'] : ['residual', 'middle', 'principal'], branch);
    assert.ok(entries.every(x => ['wood','fire','earth','metal','water'].includes(x.element)));
  }
  assert.throws(() => getHiddenStems('x'), e => e.code === 'branch');
  const original = getHiddenStems('축');
  original[0].stem = '갑';
  assert.equal(getHiddenStems('축')[0].stem, '계', '테이블을 외부에서 수정할 수 없어야 함');
});

test('지장간 십성은 동일 일간의 천간 십성과 일관되며 표면 오행 집계에 포함하지 않는다', () => {
  const saju = getSaju({ y: 2000, m: 1, d: 1, hh: 12, mm: 0 });
  const result = analyzeNatalStructure({ saju });
  for (const position of ['year', 'month', 'day', 'hour']) {
    const branch = result.pillars[position].branch;
    const hidden = getHiddenStems(saju.pillars[position].branch);
    assert.equal(branch.hiddenStems.length, hidden.length);
    for (let i = 0; i < hidden.length; i += 1) {
      assert.equal(branch.hiddenStems[i].tenGod,
        tenGodForStem(saju.pillars.day.stem, hidden[i].stem));
    }
  }
  assert.equal(Object.values(result.elementCounts).reduce((a,b) => a+b,0),8);
  assert.equal(result.metadata.hiddenStemsBasis, HIDDEN_STEMS_VERSION);
});

test('시주 미입력 상태에서도 지장간은 연월일지만 계산한다', () => {
  const saju = getSaju({ y: 2000, m: 1, d: 1 });
  const result = analyzeNatalStructure({ saju });
  assert.equal(result.pillars.hour, null);
  assert.ok(result.pillars.year.branch.hiddenStems.length > 0);
  assert.equal(Object.values(result.elementCounts).reduce((a,b) => a+b,0),6);
});

test('지장간에 동일 천간의 출현 위치만 보고 강약/통근 결론은 내리지 않는다', () => {
  const saju = { pillars: {
    year: { stem: '갑', branch: '자', text: '갑자' },
    month: { stem: '갑', branch: '인', text: '갑인' },
    day: { stem: '갑', branch: '진', text: '갑진' },
    hour: null,
  } };
  assert.deepEqual(findHiddenStemOccurrences({ saju, stem: '갑' }), [
    { position: 'month', branch: '인', stem: '갑', role: 'principal' },
  ]);
  assert.deepEqual(findHiddenStemOccurrences({ saju, stem: '계' }), [
    { position: 'year', branch: '자', stem: '계', role: 'principal' },
    { position: 'day', branch: '진', stem: '계', role: 'middle' },
  ]);
  assert.deepEqual(findHiddenStemOccurrences({ saju, stem: '정' }), []);
  assert.throws(() => findHiddenStemOccurrences({ saju, stem: '?' }), e => e.code === 'stem');
  const original = JSON.stringify(saju);
  findHiddenStemOccurrences({ saju, stem: '갑' });
  assert.equal(JSON.stringify(saju), original);
});
