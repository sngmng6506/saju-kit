import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMovementTimeline } from '../src/features/movement-v6/movement-overview.js';
import { getSaju } from '../src/core/calendar.js';
import { getDaeun } from '../src/features/movement-v6/daeun.js';
import { getYearTimeline } from '../src/features/movement-v6/year-timeline.js';

const rows = (values, start = 2000) => values.map((score, index) =>
  ({ year: start + index, display: { score } }));

test('최소·최대 원점수를 0·100으로 정규화하고 원본 점수는 변경하지 않는다', () => {
  const input = rows([10,20,30,15]);
  const unchanged = JSON.stringify(input);
  const result = analyzeMovementTimeline(input);
  assert.deepEqual(result.relative, [0,50,100,25]);
  assert.equal(result.minRaw, 10);
  assert.equal(result.maxRaw, 30);
  assert.equal(JSON.stringify(input), unchanged);
  assert.deepEqual(analyzeMovementTimeline(input), result);
});

test('전부 0이거나 모두 같은 점수면 100점을 만들지 않는다', () => {
  for (const scores of [[0,0,0],[20,20,20]]) {
    const result = analyzeMovementTimeline(rows(scores));
    assert.equal(result.hasContrast, false);
    assert.deepEqual(result.relative,[0,0,0]);
    assert.deepEqual(result.highlights,[]);
  }
});

test('점수가 높은 인접 연도는 하나의 시기로 묶고 과거·미래를 같이 고려한다', () => {
  const input = rows([0,10,90,85,0,80,0,75,70,0,50,0], 2018);
  const result = analyzeMovementTimeline(input);
  assert.deepEqual(result.highlights.map(x => [x.fromYear,x.toYear]), [
    [2020,2021],[2023,2023],[2025,2026],
  ]);
  assert.equal(result.highlights[0].peakYear,2020);
  assert.equal(result.highlights[0].peakRelative,100);
});

test('동률에서 앞선 시기를 안정적으로 선정하며 다섯 개 초과 구간을 보존한다', () => {
  const input = rows([0,90,0,90,0,90,0,90,0,90,0,90,0]);
  const result = analyzeMovementTimeline(input);
  assert.equal(result.highlights.length,6);
  assert.deepEqual(result.highlights.map(x => x.peakYear),[2001,2003,2005,2007,2009,2011]);
});

test('잘못된 자료와 중간에 비는 연도는 거부한다', () => {
  assert.throws(() => analyzeMovementTimeline([]),TypeError);
  assert.throws(() => analyzeMovementTimeline(rows([0,-2])),TypeError);
  assert.throws(() => analyzeMovementTimeline([{year:2000,display:{score:2}},{year:2002,display:{score:5}}]),TypeError);
});

test('실제 대운~80세 계산 결과에서 상대 지수와 전체 강한 시기를 구성한다', () => {
  const birth={y:1997,m:6,d:28,hh:8,mm:0};
  const saju=getSaju(birth);
  const daeun=getDaeun({saju,gender:'남',birth});
  const timeline=getYearTimeline({saju,daeun,endAge:80});
  const state=JSON.stringify(timeline.years.map(x=>x.display.score));
  const result=analyzeMovementTimeline(timeline.years);
  assert.equal(result.relative.length,timeline.years.length);
  assert.ok(result.relative.every(x=>x>=0&&x<=100&&Number.isInteger(x)));
  assert.ok(result.highlights.length<=timeline.years.length);
  assert.equal(state,JSON.stringify(timeline.years.map(x=>x.display.score)));
  for(const period of result.highlights) {
    assert.ok(period.startIndex<=period.peakIndex&&period.peakIndex<=period.endIndex);
    assert.equal(timeline.years[period.peakIndex].year,period.peakYear);
  }
});
