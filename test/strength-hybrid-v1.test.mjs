import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeDayMasterStrength, getSaju, analyzeNatalStructure } from '../src/index.js';
import { classifyElement, collectEvidence } from '../src/features/strength-hybrid-v1/evidence.js';
import { stableCategory } from '../src/features/strength-hybrid-v1/quantitative.js';
import { qualitativeRule, decide } from '../src/features/strength-hybrid-v1/index.js';

const options={policy:'strength-hybrid-v1',birthBasis:'verified-chart'};
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(y,m,d,h=null)=>({pillars:{year:p(y),month:p(m),day:p(d),hour:h===null?null:p(h)}});
const analyze=saju=>analyzeDayMasterStrength({saju,...options});
const elements=['wood','fire','earth','metal','water'];
test('five categories follow independent generating and controlling cycles',()=>{
  for(let i=0;i<5;i++)for(let j=0;j<5;j++){
    assert.equal(classifyElement(elements[i],elements[j]),['peer','output','wealth','officer','resource'][(j-i+5)%5]);
  }
});
test('input and policy contract; provisional chart never produces an assessment',()=>{
  const saju=chart('갑인','을묘','갑진');
  assert.throws(()=>analyzeDayMasterStrength({saju}),{code:'strength-policy'});
  assert.throws(()=>analyzeDayMasterStrength({saju,policy:options.policy}),{code:'strength-birth-basis'});
  assert.throws(()=>analyzeDayMasterStrength({...options,saju:chart('갑축','을묘','갑진')}));
  assert.throws(()=>analyzeDayMasterStrength(null),{code:'strength-input'});
  const r=analyzeDayMasterStrength({...options,saju,birthBasis:'provisional-chart'});
  assert.equal(r.status,'provisional');assert.equal(r.category,null);
  assert.equal(r.quantitative,null);assert.equal(r.evidence,null);
});
test('roots count positions once, preserve polarity and separate resource',()=>{
  const e=collectEvidence(chart('임자','을묘','갑진','갑인'));
  const month=e.roots.find(x=>x.position==='month');
  assert.equal(month.grade,'substantial');assert.equal(month.matches.length,2);
  assert.equal(e.roots.find(x=>x.position==='year').grade,'none');
  assert.equal(e.roots.find(x=>x.position==='day').grade,'minor');
  assert.equal(e.counters.R,2);
  assert.equal(e.stems.length,3);
  assert.equal(e.stems.find(x=>x.position==='year').category,'resource');
  assert.equal(e.stems.find(x=>x.position==='year').anchor,'substantial');
  assert.equal(e.month.category,'peer');
  assert.equal(e.month.commandResolved,false);
});
test('middle root at central position is substantial; other middle root minor',()=>{
  const e=collectEvidence(chart('계해','계해','갑자','계해'));
  assert.equal(e.roots.find(x=>x.position==='month').grade,'substantial');
  assert.equal(e.roots.find(x=>x.position==='year').grade,'minor');
  assert.equal(e.roots.find(x=>x.position==='hour').grade,'minor');
  assert.equal(e.month.category,'resource');
});
test('all qualitative rules and precedence are explicit',()=>{
  const c=(Mplus,R,Rcentral,S,P)=>({Mplus,R,Rcentral,S,P});
  for(const [input,id,category] of [
    [c(true,1,true,1,0),'Q1','strong'],
    [c(false,2,true,1,2),'Q2','strong'],
    [c(false,0,false,1,2),'Q3','weak'],
    [c(true,0,false,0,3),'Q4','weak'],
    [c(false,1,true,1,2),'Q5','mixed'],
    [c(false,0,false,2,1),'Q0','unresolved'],
    [c(true,1,true,1,3),'Q1','strong'],
  ])assert.deepEqual(qualitativeRule(input),{id,category});
});
test('threshold boundaries and final gate never let a number override structure',()=>{
  for(const [min,max,expected] of [[7000,8400,'strong'],[6999,8400,null],[1600,3000,'weak'],[1600,3001,null],[4001,5999,'mixed'],[4000,5999,null],[4001,6000,null],[3500,6500,null]])assert.equal(stableCategory(min,max),expected);
  assert.deepEqual(decide('strong','weak',true,[]),{status:'unresolved',category:null});
  assert.deepEqual(decide('strong','strong',true,[]),{status:'candidate',category:'strong'});
  assert.deepEqual(decide('weak','weak',false,['missing-hour']),{status:'partial',category:null});
  assert.deepEqual(decide('strong','strong',false,['missing-hour','branch-formation']),{status:'review-required',category:null});
});
test('quantitative profiles use seven slots once and exact integer mass',()=>{
  const saju=chart('갑인','을묘','갑진','임자');
  const r=analyze(saju),q=r.quantitative;
  assert.equal(q.scenarios.length,9);
  assert.equal(q.baseline.positionProfile,'balanced');assert.equal(q.baseline.roleProfile,'base');
  // Independent arithmetic: 5 + 5.4 + 10 + 30 + 8.4 + 10 + 15.
  assert.equal(q.baseline.lower,83.8);assert.equal(q.baseline.upper,83.8);
  for(const s of q.scenarios){
    assert.equal(s.knownWeight,100);assert.equal(s.missingWeight,0);
    assert.equal(Math.round(Object.values(s.categories).reduce((a,b)=>a+b,0)*100),10000);
    assert.equal(s.lower,s.upper);
    assert.ok(s.lower>=q.min&&s.upper<=q.max);
  }
  assert.equal(q.thresholdSensitivity.length,3);
});
test('unknown hour bounds include every valid hour completion, without renormalizing',()=>{
  const birth={y:1997,m:6,d:28,timezone:'Asia/Tokyo'};
  const partial=analyze(getSaju(birth));
  assert.equal(partial.category,null);
  assert.equal(partial.quantitative.baseline.knownWeight,75);
  assert.equal(partial.quantitative.baseline.missingWeight,25);
  assert.ok(partial.reviewFlags.includes('missing-hour'));
  for(let hh=0;hh<=22;hh++){
    const full=analyze(getSaju({...birth,hh,mm:0}));
    for(let i=0;i<9;i++){
      const a=partial.quantitative.scenarios[i],b=full.quantitative.scenarios[i];
      assert.ok(b.lower>=a.lower&&b.upper<=a.upper);
    }
  }
});
test('review gates identify day combination, group, month cardinal candidate and clash',()=>{
  const fixtures=[
    [chart('기축','을묘','갑인','임자'),'day-stem-combination'],
    [chart('갑인','병오','무술','임자'),'branch-formation'],
    [chart('갑인','병오','무진','임자'),'branch-formation'],
    [chart('갑신','병인','갑진','임자'),'root-or-month-clash'],
    [chart('경신','경신','갑신','경신'),'possible-special-pattern'],
  ];
  for(const [saju,flag] of fixtures){
    const r=analyze(saju);assert.ok(r.reviewFlags.includes(flag),flag);
    assert.equal(r.status,'review-required');assert.equal(r.category,null);
  }
});
test('deterministic result, no private input echo, no mutation and no automatic yongsin',()=>{
  const saju=getSaju({y:2000,m:1,d:1,hh:12,mm:0});saju.privateMarker='private-marker';
  const before=JSON.stringify(saju),natal=analyzeNatalStructure({saju});
  const r=analyze(saju);assert.deepEqual(r,analyze(saju));
  assert.equal(JSON.stringify(saju),before);assert.deepEqual(analyzeNatalStructure({saju}),natal);
  assert.ok(!JSON.stringify(r).includes('private-marker'));assert.equal('yongsin' in r,false);
  assert.ok(r.quantitative.min>=0&&r.quantitative.max<=100);
});

test('calendar-derived candidate regressions, not expert-labelled reference cases',()=>{
  const fixtures=[
    [{y:1990,m:8,d:10,hh:12},'mixed','Q5',40.1,50.5],
    [{y:1990,m:9,d:10,hh:4},'weak','Q3',17,27.5],
    [{y:1993,m:8,d:20,hh:8},'strong','Q1',73.5,79.05],
  ];
  for(const [birth,category,rule,min,max] of fixtures){
    const result=analyze(getSaju({...birth,mm:0,timezone:'Asia/Tokyo'}));
    assert.equal(result.status,'candidate');
    assert.equal(result.category,category);
    assert.equal(result.evidence.qualitativeRule.id,rule);
    assert.equal(result.quantitative.min,min);
    assert.equal(result.quantitative.max,max);
    assert.deepEqual(result.reviewFlags,[]);
  }
});
