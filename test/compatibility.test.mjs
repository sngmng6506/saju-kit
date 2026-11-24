import test from 'node:test';
import assert from 'node:assert/strict';
import { getDayPillar,getSaju,stemInfo,branchElement,elementRelation,stemCombination,branchPairRelations,branchRelation,analyzeBranchGroups,analyzeCompatibility } from '../src/index.js';
const stems=[...'갑을병정무기경신임계'],branches=[...'자축인묘진사오미신유술해'];
const pillars=Array.from({length:60},(_,i)=>({stem:stems[i%10],branch:branches[i%12],text:stems[i%10]+branches[i%12]}));
test('civil day API uses the same anchor, handles solar-term date without time',()=>{
  assert.equal(getDayPillar({y:2000,m:1,d:1}).text,'무오');
  assert.equal(getDayPillar({y:2000,m:2,d:4}).text,getSaju({y:2000,m:2,d:4,hh:12,mm:0}).pillars.day.text);
  assert.throws(()=>getSaju({y:2000,m:2,d:4}),{code:'time-required'});
  for(const d of [{y:1900,m:2,d:29},{y:2101,m:1,d:1},{y:2024,m:4,d:31}])assert.throws(()=>getDayPillar(d));
  assert.equal(getDayPillar({y:2024,m:2,d:29}).text,pillars[(pillars.findIndex(p=>p.text===getDayPillar({y:2024,m:2,d:28}).text)+1)%60].text);
});
test('modern Tokyo does not inherit historical Korean clock',()=>{
  const birth={y:1987,m:6,d:15,hh:12,mm:0};
  assert.equal(getSaju(birth).pillars.hour,null);
  assert.ok(getSaju({...birth,timezone:'Asia/Tokyo'}).pillars.hour);
  assert.throws(()=>getSaju({y:1969,m:12,d:31,timezone:'Asia/Tokyo'}),{code:'timezone-range'});
  assert.throws(()=>getSaju({...birth,timezone:'UTC'}),{code:'timezone'});
  assert.throws(()=>getSaju({...birth,timezone:'Asia/Tokyo',calendar:'lunar'}),{code:'calendar'});
  assert.throws(()=>getSaju({...birth,timezone:'Asia/Tokyo',hh:23}),{code:'day-boundary'});
});
test('element and harmony lookup contracts',()=>{
  assert.deepEqual(stemInfo('갑'),{element:'wood',yinYang:'yang'});
  assert.equal(branchElement('자'),'water');
  assert.equal(stemCombination('갑','기').associatedElement,'earth');
  assert.equal(stemCombination('갑','갑'),null);
  assert.equal(elementRelation('wood','fire').direction,'left-to-right');
  assert.equal(elementRelation('fire','wood').direction,'right-to-left');
  assert.equal(branchRelation('자','오'),'clash');
  assert.equal(branchRelation('자','축'),'combine');
  assert.equal(branchRelation('신','자'),null);
  assert.deepEqual(branchPairRelations('신','자').find(r=>r.type==='branch.threeHarmonyCandidate').missing,['진']);
  assert.equal(branchPairRelations('신','진').find(r=>r.type==='branch.threeHarmonyCandidate').includesCardinal,false);
  assert.equal(analyzeBranchGroups(['신','자','자']).length,0);
  assert.equal(analyzeBranchGroups(['신','자','진'])[0].transformationConfirmed,null);
  assert.equal(analyzeBranchGroups(['인','묘','진'])[0].type,'branch.seasonalHarmony');
  assert.throws(()=>branchPairRelations('invalid','자'));
});
test('all 3600 day pairs: symmetric neutral types; element direction inverts',()=>{
  for(const a of pillars)for(const b of pillars){
    const x=analyzeCompatibility({left:a,right:b}),y=analyzeCompatibility({left:b,right:a});
    assert.deepEqual(x.signals.map(s=>s.type),y.signals.map(s=>s.type));
    const l=x.signals.at(-1),r=y.signals.at(-1);
    assert.equal(l.left,r.right);
    assert.equal(l.direction==='none'?'none':l.direction==='left-to-right'?'right-to-left':'left-to-right',r.direction);
    assert.equal('score' in x,false);
  }
  assert.throws(()=>analyzeCompatibility({left:{stem:'갑',branch:'축',text:'갑축'},right:pillars[0]}),{code:'pillar'});
  assert.throws(()=>analyzeCompatibility({left:pillars[0],right:pillars[0],scope:'full'}),{code:'scope'});
});
