import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeElementStructure, analyzeOrdinaryStrength, analyzeDayMasterStrength } from '../src/index.js';
import { ordinaryDecision } from '../src/features/strength-ordinary-v2/index.js';
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(y,m,d,h=null)=>({pillars:{year:p(y),month:p(m),day:p(d),hour:h===null?null:p(h)}});
const options={policy:'strength-ordinary-v2',birthBasis:'verified-chart'};
const run=saju=>analyzeOrdinaryStrength({saju,...options});

test('element profiles partition stems and hidden occurrences, without counting a root twice',()=>{
 const saju=chart('임자','을묘','갑진','갑인');
 const s=analyzeElementStructure({saju});
 assert.equal(s.profiles.length,5);
 assert.equal(s.profiles.reduce((n,p)=>n+p.visible.length,0),4);
 assert.equal(s.profiles.reduce((n,p)=>n+p.principalPositions.length,0),4);
 const wood=s.profiles.find(p=>p.element==='wood');
 assert.equal(wood.roots.filter(r=>r.position==='month').length,1);
 assert.equal(wood.roots.find(r=>r.position==='month').matches.length,2);
 for(const profile of s.profiles)assert.equal(new Set(profile.roots.map(r=>r.position)).size,profile.roots.length);
 assert.equal(s.interactionAssessment,'observed-only');
 assert.ok(s.edges.some(e=>e.from==='water'&&e.to==='wood'&&e.type==='generate'));
 assert.ok(s.edges.some(e=>e.from==='wood'&&e.to==='earth'&&e.type==='control'));
 assert.ok(s.mediations.some(m=>m.from==='wood'&&m.via==='fire'&&m.to==='earth'));
 assert.ok(!s.edges.some(e=>e.from===e.to));
 for(const edge of s.edges){
   assert.ok(s.profiles.find(p=>p.element===edge.from).present);
   assert.ok(s.profiles.find(p=>p.element===edge.to).present);
 }
});
test('formation and clash evidence retains positions without modifying roots',()=>{
 const s=analyzeElementStructure({saju:chart('갑신','병인','갑진','임자')});
 const clash=s.clashes.find(c=>c.positions.includes('year')&&c.positions.includes('month'));
 assert.ok(clash);
 assert.ok(clash.affectedRoots.some(r=>r.element==='wood'&&r.position==='month'));
 assert.ok(s.profiles.find(p=>p.element==='wood').roots.some(r=>r.position==='month'));
 const group=s.formations.find(f=>f.type==='branch.threeHarmony');
 assert.equal(group.associatedElement,'water');
 assert.equal(group.transformationConfirmed,null);
 assert.equal(group.occurrences.length,3);
});
test('rooted opposition is distinguished by category and retains quantitative baseline',()=>{
 const saju=chart('경신','신사','병진','을미');
 const a=run(saju),v1=analyzeDayMasterStrength({saju,policy:'strength-hybrid-v1',birthBasis:'verified-chart'});
 assert.equal(v1.evidence.qualitativeRule.category,'strong');
 assert.equal(a.qualitative.category,'weak');
 assert.ok(a.qualitative.counts.wealth.rootedStems>=2);
 assert.deepEqual(a.quantitative,v1.quantitative);
 assert.equal(a.category,null); // numeric sensitivity still disagrees
 assert.ok(a.caveats.includes('formation-effects-unmodeled'));
 assert.equal(a.specialPatternAssessment,'not-assessed');
});
test('extremes are ordinary strength degrees, not special pattern classifications',()=>{
 assert.deepEqual(ordinaryDecision('strong',{stableCategory:'strong',min:85,max:97},true),{status:'candidate',category:'very-strong'});
 assert.deepEqual(ordinaryDecision('weak',{stableCategory:'weak',min:2,max:15},true),{status:'candidate',category:'very-weak'});
 assert.deepEqual(ordinaryDecision('weak',{stableCategory:'weak',min:2,max:15.01},true),{status:'candidate',category:'weak'});
 assert.deepEqual(ordinaryDecision('mixed',{stableCategory:'weak',min:2,max:15},true),{status:'unresolved',category:null});
 assert.deepEqual(ordinaryDecision('strong',{stableCategory:'strong',min:85,max:97},false),{status:'partial',category:null});
 const a=run(chart('기축','을묘','갑인','임자'));
 assert.ok(a.caveats.includes('formation-effects-unmodeled'));
 assert.notEqual(a.status,'review-required');
});
test('explicit policy, provisional and partial contract, deterministic and private',()=>{
 const saju=chart('임자','을묘','갑진');
 saju.privateMarker='private-marker';
 const before=JSON.stringify(saju),a=run(saju);
 assert.equal(a.status,'partial');assert.equal(a.category,null);
 assert.equal(a.quantitative.baseline.missingWeight,25);
 assert.equal(a.structure.completeHour,false);
 assert.ok(a.caveats.includes('missing-hour'));
 assert.deepEqual(run(saju),a);assert.equal(JSON.stringify(saju),before);
 assert.ok(!JSON.stringify(a).includes('private-marker'));
 assert.throws(()=>analyzeOrdinaryStrength({saju}),{code:'strength-policy'});
 assert.throws(()=>analyzeOrdinaryStrength({...options,saju:chart('갑축','을묘','갑진')}));
 const p=analyzeOrdinaryStrength({...options,saju,birthBasis:'provisional-chart'});
 assert.equal(p.status,'provisional');assert.equal(p.structure,null);assert.equal(p.quantitative,null);
});
