import test from 'node:test';
import assert from 'node:assert/strict';
import { branchRelationsV2, analyzeBranchGroupsV2, analyzeNatalRelations, analyzeCrossChartRelations, analyzeNatalContext, branchPairRelations, getSaju } from '../src/index.js';
const branches=[...'자축인묘진사오미신유술해'];
const stems=[...'갑을병정무기경신임계'];
const p=(stem,branch)=>({stem,branch,text:stem+branch});
const chart=(year,month,day,hour=null)=>({pillars:{year,month,day,hour}});
const match=(pairs,a,b)=>a!==b&&pairs.some(s=>s.includes(a)&&s.includes(b));
const sample=chart(p('갑','인'),p('기','사'),p('경','신'),p('임','신'));
const types=(a,b)=>branchRelationsV2(a,b).map(x=>x.type);

test('all 144 ordered branch pairs: independent tables, coexistence and legacy preservation',()=>{
 const sets={'branch.break':['자유','축진','인해','묘오','사신','미술'],'branch.harm':['자미','축오','인사','묘진','신해','유술'],'branch.wonjin':['자미','축오','인유','묘신','진해','사술'],'branch.mutualPunishment':['자묘'],'branch.punishmentCandidate':['인사','사신','신인','축술','술미','미축']};
 for(const a of branches)for(const b of branches){
  const result=branchRelationsV2(a,b),ts=result.map(x=>x.type);
  assert.deepEqual(result,branchRelationsV2(b,a));
  assert.deepEqual(result.slice(0,branchPairRelations(a,b).length),branchPairRelations(a,b));
  for(const [type,pairs] of Object.entries(sets))assert.equal(ts.includes(type),match(pairs,a,b),type+a+b);
  assert.equal(ts.includes('branch.selfPunishment'),a===b&&'진오유해'.includes(a));
  assert.equal(new Set(ts).size,ts.length);
 }
 assert.throws(()=>branchRelationsV2('invalid','자'));
 assert.ok(types('사','신').includes('branch.sixHarmony')&&types('사','신').includes('branch.break')&&types('사','신').includes('branch.punishmentCandidate'));
});
test('directed punishment edges are distinct from complete three-branch sets',()=>{
 for(const group of ['인사신','축술미']){
  const [a,b,c]=group;
  for(const [from,to] of [[a,b],[b,c],[c,a]]){
   const result=branchRelationsV2(to,from).find(x=>x.type==='branch.punishmentCandidate');
   assert.equal(result.from,from);assert.equal(result.to,to);
   assert.equal(result.missing.length,1);
  }
  assert.ok(analyzeBranchGroupsV2([a,b,c]).some(s=>s.type==='branch.threePunishment'));
  assert.ok(!analyzeBranchGroupsV2([a,a,b]).some(s=>s.type==='branch.threePunishment'));
 }
});
test('natal positions, adjacency, full-group occurrence duplicates and self punishment',()=>{
 const r=analyzeNatalRelations({saju:sample});
 assert.equal(r.pairs.length,6);
 assert.equal(r.pairs.filter(p=>p.adjacent).length,3);
 assert.equal(r.pairs.find(p=>p.left==='year'&&p.right==='hour').distance,3);
 assert.equal(r.groups.find(g=>g.type==='branch.threePunishment').occurrences.length,4);
 const self=chart(p('갑','진'),p('병','진'),p('무','오'));
 assert.equal(analyzeNatalRelations({saju:self}).pairs.filter(p=>p.branchSignals.some(s=>s.type==='branch.selfPunishment')).length,1);
 assert.equal(analyzeNatalRelations({saju:chart(sample.pillars.year,sample.pillars.month,sample.pillars.day)}).pairs.length,3);
 assert.throws(()=>analyzeNatalRelations({saju:chart(p('갑','축'),sample.pillars.month,sample.pillars.day)}));
});
test('cross-chart 16/12/9 pairs and no inferred merged natal groups',()=>{
 const partial=chart(sample.pillars.year,sample.pillars.month,sample.pillars.day);
 assert.equal(analyzeCrossChartRelations({left:sample,right:sample}).pairs.length,16);
 assert.equal(analyzeCrossChartRelations({left:sample,right:partial}).pairs.length,12);
 assert.equal(analyzeCrossChartRelations({left:partial,right:partial}).pairs.length,9);
 const same=chart(p('갑','진'),p('병','진'),p('무','오'));
 const result=analyzeCrossChartRelations({left:same,right:same});
 assert.ok(result.pairs.some(p=>p.repeatedBranch));
 assert.ok(result.pairs.every(p=>!p.branchSignals.some(s=>s.type==='branch.selfPunishment')));
 assert.equal('groups' in result,false);assert.equal('score' in result,false);
});
test('root and projection evidence distinguish exact stem from same element and invert consistently',()=>{
 const saju=chart(p('갑','인'),p('을','묘'),p('갑','진'));
 const r=analyzeNatalContext({saju});
 assert.equal(r.completeHour,false);
 assert.equal(r.month.season,'spring');assert.equal(r.month.principalStem,'을');
 assert.equal(r.month.principalTenGod,'겁재');
 const day=r.rootEvidence.find(v=>v.position==='day');
 assert.ok(day.matches.some(h=>h.position==='month'&&h.stem==='갑'&&h.match==='exact-stem'&&h.role==='residual'));
 assert.ok(day.matches.some(h=>h.position==='month'&&h.stem==='을'&&h.match==='same-element'));
 for(const v of r.rootEvidence)for(const h of v.matches){
   assert.ok(r.projectionEvidence.find(x=>x.position===h.position&&x.stem===h.stem&&x.role===h.role).matches.some(x=>x.position===v.position&&x.stem===v.stem&&x.match===h.match));
 }
 assert.equal(r.rootEvidence.length,3);assert.ok(!('score' in r)&&!('strong' in r)&&!('yongsin' in r));
});
test('real chart, deterministic, no input mutation or unrelated birth metadata',()=>{
 for(const hh of [null,12]){
  const saju=getSaju({y:2000,m:1,d:1,hh,mm:hh===null?null:0});saju.privateMarker='private-marker';
  const before=JSON.stringify(saju);
  for(const f of [analyzeNatalContext,analyzeNatalRelations]){
   const result=f({saju});assert.deepEqual(f({saju}),result);assert.ok(!JSON.stringify(result).includes('private-marker'));
  }
  assert.equal(JSON.stringify(saju),before);
 }
});
