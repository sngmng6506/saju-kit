import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeInteractionContext, analyzeInteractionSensitivity, analyzeOrdinaryStrength } from '../src/index.js';
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(y,m,d,h=null)=>({pillars:{year:p(y),month:p(m),day:p(d),hour:h===null?null:p(h)}});
const run=saju=>analyzeInteractionSensitivity({saju,policy:'interaction-sensitivity-v1',birthBasis:'verified-chart'});

test('full groups use three distinct actual occurrences and suppress only their own pair candidates',()=>{
 const r=analyzeInteractionContext({saju:chart('갑신','병자','무진','임자')});
 const groups=r.formations.filter(f=>f.type==='branch.threeHarmony');
 assert.equal(groups.length,2);
 assert.deepEqual(groups.map(g=>g.positions),[['year','month','day'],['year','day','hour']]);
 assert.deepEqual(groups.map(g=>g.contiguous),[true,false]);
 assert.deepEqual(groups.map(g=>g.cardinalIsMonth),[true,false]);
 assert.ok(groups.every(g=>g.transformationConfirmed===null));
 assert.ok(!r.formations.some(f=>f.type==='branch.threeHarmonyCandidate'&&f.associatedElement==='water'));
 assert.equal(new Set(r.formations.map(f=>f.id)).size,r.formations.length);
});
test('cardinal half harmony and incomplete noncardinal pair stay distinct',()=>{
 const a=run(chart('갑신','병자','무오'));
 const half=a.context.formations.find(f=>f.type==='branch.threeHarmonyCandidate'&&f.associatedElement==='water');
 assert.equal(half.complete,false);assert.equal(half.cardinalIsMonth,true);
 assert.ok(half.disruptions.some(d=>d.type==='branch.clash'));
 assert.equal(a.formationScenarios.find(s=>s.id===half.id).status,'simulated');
 const b=run(chart('갑신','병진','무오'));
 const candidate=b.context.formations.find(f=>f.type==='branch.threeHarmonyCandidate'&&f.associatedElement==='water');
 assert.equal(candidate.cardinalPositions.length,0);
 assert.equal(b.formationScenarios.find(s=>s.id===candidate.id).reason,'incomplete-without-cardinal');
});
test('competing formations share actual slots and do not cross stem/branch layers',()=>{
 const r=analyzeInteractionContext({saju:chart('갑인','기해','갑오','무술')});
 const stem=r.formations.filter(f=>f.layer==='stem');
 assert.ok(stem.length>=2);
 assert.ok(stem.some(f=>f.overlaps.some(o=>o.kind==='same-target')));
 const six=r.formations.find(f=>f.type==='branch.sixHarmony');
 const group=r.formations.find(f=>f.type==='branch.threeHarmony');
 assert.ok(six.overlaps.some(o=>o.id===group.id&&o.kind==='different-target'));
 assert.ok(!six.overlaps.some(o=>o.id.startsWith('stem.')));
});
test('clash endpoint roots record alternative roots without declaring removal',()=>{
 const r=run(chart('갑신','병인','갑진','갑인'));
 const c=r.context.clashes.find(c=>c.positions.includes('year')&&c.positions.includes('month'));
 const root=c.endpoints.find(e=>e.position==='month').roots.find(r=>r.element==='wood');
 assert.equal(root.soleSubstantialRoot,false);
 assert.ok(root.alternativeRoots.some(a=>a.position==='hour'));
 const s=r.clashScenarios.find(s=>s.clashId===c.id&&s.position==='month');
 assert.ok(!s.unavailable.some(v=>v.element==='wood'));
 assert.equal(r.context.effectsConfirmed,false);
});
test('sole root access can change structural direction, without removing quantitative mass',()=>{
 const r=run(chart('경신','갑인','갑자','임오'));
 const c=r.context.clashes.find(c=>c.positions.includes('year')&&c.positions.includes('month'));
 const root=c.endpoints.find(e=>e.position==='month').roots.find(r=>r.element==='wood');
 assert.equal(root.soleSubstantialRoot,true);
 const s=r.clashScenarios.find(s=>s.clashId===c.id&&s.position==='month');
 assert.ok(s.unavailable.some(v=>v.element==='wood'&&v.position==='month'));
 assert.ok(s.unavailable.some(v=>v.element==='wood'&&v.position==='day'));
 assert.deepEqual(s.qualitative.counts.peer.principalBranches,r.baseline.qualitative.counts.peer.principalBranches);
});
test('formation stress respects reference stem, unspecified target and known-hour bounds',()=>{
 const a=run(chart('기축','을묘','갑인','임자'));
 const f=a.context.formations.find(f=>f.layer==='stem'&&f.positions.includes('day'));
 assert.equal(a.formationScenarios.find(s=>s.id===f.id).reason,'day-master-reference-would-change');
 const b=run(chart('갑오','신미','무진'));
 const six=b.context.formations.find(f=>f.type==='branch.sixHarmony');
 assert.equal(b.formationScenarios.find(s=>s.id===six.id).reason,'unspecified-target');
 const c=run(chart('갑신','병자','무진'));
 assert.equal(c.status,'partial');
 for(const s of c.formationScenarios.filter(s=>s.status==='simulated')){
  assert.ok(s.range.min>=0&&s.range.max<=100&&s.range.min<=s.range.max);
  assert.ok(s.delta.min>=-100&&s.delta.max<=100);
 }
 for(const s of c.clashScenarios)assert.equal(s.conditionalDecision.category,null);
});
test('sensitivity never mutates chart or changes frozen ordinary baseline',()=>{
 const saju=chart('갑신','병자','무진','임자');saju.privateMarker='private';
 const before=JSON.stringify(saju);
 const v2=()=>analyzeOrdinaryStrength({saju,policy:'strength-ordinary-v2',birthBasis:'verified-chart'});
 const baseline=v2(),r=run(saju);
 assert.deepEqual(run(saju),r);assert.deepEqual(v2(),baseline);assert.equal(JSON.stringify(saju),before);
 assert.equal(r.baseline.category,baseline.category);
 assert.ok(!JSON.stringify(r).includes('privateMarker'));
 assert.equal(r.assessment,'hypothetical-only');
 assert.throws(()=>analyzeInteractionSensitivity({saju}),{code:'strength-policy'});
 const partial=analyzeInteractionSensitivity({saju,policy:'interaction-sensitivity-v1',birthBasis:'provisional-chart'});
 assert.equal(partial.status,'provisional');assert.equal(partial.context,null);
});
