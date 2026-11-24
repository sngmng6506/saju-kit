import test from 'node:test';
import assert from 'node:assert/strict';
import { getCombinationSignals, COMBINATION_GROUPS } from '../src/features/movement-v6/combination-formation.js';
import { getSaju } from '../src/core/calendar.js';
import { getDaeun } from '../src/features/movement-v6/daeun.js';
import { getYearTimeline } from '../src/features/movement-v6/year-timeline.js';
import { summarizeMovementSignals, MOVEMENT_SIGNAL_WEIGHTS } from '../src/features/movement-v6/movement-presentation.js';

const natal = (month,day,year='오',hour=null) => ({
  year:{branch:year},month:{branch:month},day:{branch:day},hour:hour ? {branch:hour} : null,
});
const band = (branch,fromYear=2030) => ({branch,fromYear});
const run = ({month,day,year='오',hour=null,daeun=null,previousDaeun=null,seun='해',at=2030}) =>
  getCombinationSignals({natal:natal(month,day,year,hour),band:daeun,previousBand:previousDaeun,seun:{branch:seun},year:at});
const match = (signals,key) => signals.filter(signal=>signal.key===key);

test('삼합·방합 각각 네 조합을 고정하고 서로 중복된 글자가 없다',()=>{
  assert.equal(COMBINATION_GROUPS.SAMHAP.length,4);
  assert.equal(COMBINATION_GROUPS.BANGHAP.length,4);
  for(const group of [...COMBINATION_GROUPS.SAMHAP,...COMBINATION_GROUPS.BANGHAP]){
    assert.equal(group.branches.length,3);
    assert.equal(new Set(group.branches).size,3);
  }
});

test('새 대운이 월지·일지와 삼합 완성: 전환 첫해에만 검출',()=>{
  const args={month:'신',day:'자',year:'오',daeun:band('진'),previousDaeun:band('묘',2020),seun:'해'};
  const atTransition=run(args);
  assert.equal(match(atTransition,'DAEUN_SAMHAP_FORMED').length,1);
  assert.equal(match(atTransition,'DAEUN_SAMHAP_FORMED')[0].details.group,'신자진 수국');
  assert.equal(match(run({...args,at:2031}),'DAEUN_SAMHAP_FORMED').length,0);
  assert.ok(summarizeMovementSignals(atTransition).score>=3 && summarizeMovementSignals(atTransition).score<=5);
});

test('새 대운이 월지·일지와 방합 완성: 전환 첫해에만 검출',()=>{
  const r=run({month:'인',day:'묘',year:'오',daeun:band('진'),previousDaeun:band('유',2020),seun:'해'});
  const matchItems=match(r,'DAEUN_BANGHAP_FORMED');
  assert.equal(matchItems.length,1);
  assert.equal(matchItems[0].details.group,'인묘진 목방합');
});

test('세운이 삼합·방합의 마지막 글자를 완성할 때 검출',()=>{
  const samhap=run({month:'신',day:'자',seun:'진',year:'오'});
  assert.equal(match(samhap,'SEUN_SAMHAP_FORMED').length,1);
  const banghap=run({month:'인',day:'묘',seun:'진',year:'오'});
  assert.equal(match(banghap,'SEUN_BANGHAP_FORMED').length,1);
});

test('원국+대운+세운 조합으로 세운이 완성한 삼합을 검출',()=>{
  const r=run({month:'신',day:'오',daeun:band('자',2020),seun:'진'});
  assert.equal(match(r,'SEUN_SAMHAP_FORMED').length,1);
  assert.equal(match(r,'DAEUN_SAMHAP_FORMED').length,0);
});

test('완성된 삼합에 세운이 들어와도 다시 신규 형성하지 않는다',()=>{
  const r=run({month:'신',day:'자',daeun:band('진',2030),previousDaeun:band('묘',2020),seun:'진'});
  assert.equal(match(r,'DAEUN_SAMHAP_FORMED').length,1);
  assert.equal(match(r,'SEUN_SAMHAP_FORMED').length,0);
  const maintained=run({month:'신',day:'자',year:'진',daeun:band('묘'),previousDaeun:band('해',2020),seun:'해'});
  assert.ok(maintained.some(x=>x.key==='DAEUN_SAMHAP_MAINTAINED'));
  assert.equal(match(maintained,'DAEUN_SAMHAP_FORMED').length,0);
});

test('두 글자는 부분 구성으로만 표시하고 완성으로 판정하지 않는다',()=>{
  const r=run({month:'신',day:'오',daeun:band('진'),previousDaeun:band('묘',2020),seun:'해'});
  assert.ok(r.some(x=>x.key==='DAEUN_SAMHAP_PARTIAL'));
  assert.equal(match(r,'DAEUN_SAMHAP_FORMED').length,0);
  const s=run({month:'신',day:'오',seun:'진'});
  assert.ok(s.some(x=>x.key==='SEUN_SAMHAP_PARTIAL'));
  assert.equal(match(s,'SEUN_SAMHAP_FORMED').length,0);
});

test('월지·일지가 포함되지 않은 합은 핵심 검출에서 제외한다',()=>{
  const r=run({month:'오',day:'미',year:'신',hour:'자',seun:'진'});
  assert.equal(match(r,'SEUN_SAMHAP_FORMED').length,0);
});

test('완성 구성 지지와 세운의 충은 합 해체로 단정하지 않고 참고 신호로 남긴다',()=>{
  const r=run({month:'신',day:'자',daeun:band('진',2030),seun:'오',at:2031});
  const clashes=match(r,'SEUN_SAMHAP_CLASH');
  assert.equal(clashes.length,1);
  assert.deepEqual(clashes[0].details.clashedBranches,['자']);
  assert.equal(summarizeMovementSignals(r).score,0);
});

test('새 삼합·방합 완성 4종은 세운 10점 대운 5점으로 반영', () => {
  for (const [key, args] of [
    ['DAEUN_SAMHAP_FORMED', { month:'신', day:'자', year:'오', daeun:band('진'), previousDaeun:band('묘',2020), seun:'해' }],
    ['DAEUN_BANGHAP_FORMED', { month:'인', day:'묘', year:'오', daeun:band('진'), previousDaeun:band('유',2020), seun:'해' }],
    ['SEUN_SAMHAP_FORMED', { month:'신', day:'자', year:'오', seun:'진' }],
    ['SEUN_BANGHAP_FORMED', { month:'인', day:'묘', year:'오', seun:'진' }],
  ]) {
    const signals = run(args);
    assert.equal(match(signals, key).length, 1);
    const expected = key.startsWith('SEUN_') ? 10 : 5;
    assert.equal(MOVEMENT_SIGNAL_WEIGHTS[key], expected);
    const scored = summarizeMovementSignals(signals);
    // Other, independently formed groups (including king-branch banhap)
    // may also contribute in this year, so test this group's points directly.
    assert.ok(scored.score >= expected);
    assert.deepEqual(scored.contributions.filter(c => c.key === key).map(c => [c.points, c.group]),
      [[expected, match(signals, key)[0].details.group]]);
  }
  assert.equal(MOVEMENT_SIGNAL_WEIGHTS.SEUN_BRANCH_CLASH.month, 25);
  assert.equal(MOVEMENT_SIGNAL_WEIGHTS.SEUN_BRANCH_CLASH.day, 25);
});

test('합국 점수 배정용 신호는 이름뿐인 객체를 허용하지 않는다', () => {
  assert.throws(() => summarizeMovementSignals([
    { key: 'SEUN_SAMHAP_FORMED', details: {} },
  ]), error => error.code === 'signal-input');
});

test('같은 합국 신호 중복은 한 번만, 다른 합국은 각각 점수화', () => {
  const group = (key, name) => ({ key, details: { group: name } });
  const first = group('SEUN_SAMHAP_FORMED', '신자진 수국');
  const second = group('SEUN_SAMHAP_FORMED', '인오술 화국');
  const scored = summarizeMovementSignals([first, first, second]);
  assert.equal(scored.score, 20);
  assert.equal(scored.contributions.length, 2);
  assert.deepEqual(scored.contributions.map(c => c.group), ['신자진 수국', '인오술 화국']);
});

test('부분합·유지·합국 충은 완성과 구분해 점수 0', () => {
  const sample = (key) => ({ key, details: { group:'신자진 수국' } });
  const scored = summarizeMovementSignals([
    sample('SEUN_SAMHAP_PARTIAL'),
    sample('DAEUN_SAMHAP_MAINTAINED'),
    sample('SEUN_SAMHAP_CLASH'),
    sample('SEUN_BANGHAP_PARTIAL'),
    sample('DAEUN_BANGHAP_MAINTAINED'),
    sample('SEUN_BANGHAP_CLASH'),
  ]);
  assert.equal(scored.score, 0);
  assert.deepEqual(scored.contributions, []);
});


test('왕지를 포함한 삼합 반합은 세운 +5, 대운 +3, 가합은 0점', () => {
  const annual=run({month:'신',day:'오',year:'미',seun:'자'});
  assert.equal(match(annual,'SEUN_SAMHAP_BANHAP').length,1);
  assert.deepEqual(match(annual,'SEUN_SAMHAP_BANHAP')[0].details.pair,['신','자']);
  assert.equal(summarizeMovementSignals(annual).score,5);
  const decade=run({month:'신',day:'오',year:'미',daeun:band('자'),previousDaeun:band('묘',2020),seun:'해'});
  assert.equal(match(decade,'DAEUN_SAMHAP_BANHAP').length,1);
  assert.equal(summarizeMovementSignals(decade).score,3);
  assert.equal(match(run({month:'신',day:'오',year:'미',daeun:band('자'),previousDaeun:band('묘',2020),seun:'해',at:2031}),'DAEUN_SAMHAP_BANHAP').length,0);
  const gahap=run({month:'신',day:'오',year:'미',seun:'진'});
  assert.equal(match(gahap,'SEUN_SAMHAP_PARTIAL').length,1);
  assert.equal(summarizeMovementSignals(gahap).score,0);
});
test('반합 짝 변화 신규, 같은 해 완성 삼합과 중복 금지', () => {
  const changed=run({month:'자',day:'오',year:'미',daeun:band('진'),previousDaeun:band('신',2020),seun:'해'});
  assert.equal(match(changed,'DAEUN_SAMHAP_BANHAP').length,1);
  assert.equal(summarizeMovementSignals(changed).score,3);
  const completed=run({month:'신',day:'오',year:'미',daeun:band('자'),previousDaeun:band('묘',2020),seun:'진'});
  assert.equal(match(completed,'DAEUN_SAMHAP_BANHAP').length,0);
  assert.equal(match(completed,'SEUN_SAMHAP_FORMED').length,1);
  assert.ok(summarizeMovementSignals(completed).score>=1 && summarizeMovementSignals(completed).score<=10);
  assert.equal(summarizeMovementSignals(run({month:'신',day:'자',year:'오',seun:'신'})).score,0);
});
test('왕지 반합 부정확한 신호 차단',()=>{
  const [valid]=match(run({month:'신',day:'오',year:'미',seun:'자'}),'SEUN_SAMHAP_BANHAP');
  for(const d of [{...valid.details,wangji:'진'}, {...valid.details,pair:['신','진']}, {...valid.details,natalBranches:{year:'신'}}])
    assert.throws(()=>summarizeMovementSignals([{...valid,details:d}]),e=>e.code==='signal-input');
});
