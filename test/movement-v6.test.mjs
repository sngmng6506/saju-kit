import test from 'node:test';
import assert from 'node:assert/strict';
import { getSaju, solarTermInstant } from '../src/core/calendar.js';
import { getDaeun, daeunSuMinutes } from '../src/features/movement-v6/daeun.js';
import { getYearSignals, getYeokmaBranch } from '../src/features/movement-v6/year-signals.js';
import { summarizeMovementSignals } from '../src/features/movement-v6/movement-presentation.js';
import { getYearTimeline } from '../src/features/movement-v6/year-timeline.js';

test('분 단위 1사2입, 2일/5일 경계',()=>{
  assert.equal(daeunSuMinutes(0),1);
  assert.equal(daeunSuMinutes(5*1440-1),1);
  assert.equal(daeunSuMinutes(5*1440),2);
  assert.equal(daeunSuMinutes(8*1440),3);
  assert.throws(()=>daeunSuMinutes(-1));
});
test('정확한 출생시각과 출생시간 미상 범위를 분리한다',()=>{
  const birth={y:1997,m:6,d:28,hh:8,mm:30};
  const saju=getSaju(birth);
  const exact=getDaeun({saju,gender:'남',birth});
  assert.equal(exact.precision,'minute');
  assert.deepEqual(exact.startAgeRange,[exact.startAge,exact.startAge]);
  const unknownBirth={y:1997,m:6,d:28};
  const unknown=getDaeun({saju:getSaju(unknownBirth),gender:'남',birth:unknownBirth});
  assert.equal(unknown.precision,'unknown');
  assert.ok(unknown.startAge>=unknown.startAgeRange[0]&&unknown.startAge<=unknown.startAgeRange[1]);
});
test('같은 날짜라도 다른 정확 시각은 절기까지 분 차이가 달라진다',()=>{
  const atOne={y:1997,m:6,d:28,hh:8,mm:0};
  const atTwo={...atOne,hh:9};
  const first=getDaeun({saju:getSaju(atOne),gender:'남',birth:atOne});
  const second=getDaeun({saju:getSaju(atTwo),gender:'남',birth:atTwo});
  assert.equal(Math.abs(first.minutes-second.minutes),60);
});
test('절입 당일의 이전/이후 시각을 다른 경계로 분리한다',()=>{
  const term=[4,6,8,10,12,14,16,18,20,22]
    .map(index=>solarTermInstant(2026,index))
    .find(value=>value.hh>=2&&value.hh<=20);
  assert.ok(term);
  const termMs=Date.UTC(term.y,term.m-1,term.d,term.hh,term.mm);
  const asBirth=ms=>{
    const dt=new Date(ms);
    return {y:dt.getUTCFullYear(),m:dt.getUTCMonth()+1,d:dt.getUTCDate(),hh:dt.getUTCHours(),mm:dt.getUTCMinutes()};
  };
  const before=asBirth(termMs-30*60000);
  const after=asBirth(termMs+30*60000);
  const previous=getDaeun({saju:getSaju(before),gender:'남',birth:before});
  const next=getDaeun({saju:getSaju(after),gender:'남',birth:after});
  assert.equal(previous.minutes,30);
  assert.ok(next.minutes>20*1440);
});
test('연지·일지 역마가 같을 때는 연지 가산만 기록',()=>{
  const horse=()=>({key:'YEOKMA_SEUN',details:{basis:'year',matchedBranch:'인'}});
  const day=()=>({key:'YEOKMA_SEUN',details:{basis:'day',matchedBranch:'인'}});
  const score=summarizeMovementSignals([horse(),day()]);
  assert.equal(score.score,20);
  assert.equal(score.contributions.length,1);
});
test('연지·일지 역마가 서로 다르면 두 기준을 반영',()=>{
  const score=summarizeMovementSignals([
    {key:'YEOKMA_SEUN',details:{basis:'year',matchedBranch:'인'}},
    {key:'YEOKMA_SEUN',details:{basis:'day',matchedBranch:'사'}},
  ]);
  assert.equal(score.score,30);
});
test('대운 월일지 충 배경·첫해·동일 대상 세운 충 중복 할인',()=>{
  const b=(transition)=>({key:'DAEUN_BRANCH_CLASH',target:'month',details:{transition}});
  assert.equal(summarizeMovementSignals([b(false)]).score,8);
  assert.equal(summarizeMovementSignals([b(true)]).score,15);
  assert.equal(summarizeMovementSignals([b(false),{key:'SEUN_BRANCH_CLASH',target:'month'}]).score,29);
});