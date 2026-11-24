import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeStructuralStrength} from '../src/index.js';
const p=text=>({stem:text[0],branch:text[1],text});
const chart=(year,month,day,hour=null)=>({pillars:{year:p(year),month:p(month),day:p(day),hour:hour===null?null:p(hour)}});
const opts={policy:'strength-structural-v3',birthBasis:'verified-chart'};
const run=saju=>analyzeStructuralStrength({saju,...opts});

test('distributed roots and concentrated opposition are preserved simultaneously',()=>{
 const r=run(chart('무술','갑자','정미','경술'));
 assert.equal(r.hypothesis.evidence.season,'adverse');
 assert.deepEqual(r.hypothesis.evidence.substantialRootPositions,['year','hour']);
 assert.ok(r.hypothesis.strongGrounds.includes('distributed-substantial-roots'));
 assert.ok(r.hypothesis.evidence.localAnchoredPaths.length>0);
 assert.ok(r.hypothesis.evidence.localAnchoredPaths.every(p=>p.confirmed===false));
 assert.ok(r.hypothesis.conflicts.includes('root-support-versus-concentrated-burden'));
 assert.equal(r.direction,null);
});
test('rooted wealth can oppose strong central roots without forcing weak',()=>{
 const r=run(chart('기미','기사','갑인','병인'));
 assert.deepEqual(r.hypothesis.evidence.centralPrincipalPositions,['day']);
 assert.ok(r.hypothesis.strongGrounds.includes('distributed-substantial-roots'));
 assert.ok(r.hypothesis.evidence.concentratedBurdenCategories.includes('wealth'));
 assert.ok(r.hypothesis.conflicts.includes('root-support-versus-concentrated-burden'));
 assert.equal(r.direction,null);
});
test('unopposed deep roots and rootless adverse charts yield different hypotheses',()=>{
 const a=run(chart('갑인','을묘','갑인','임자'));
 assert.equal(a.direction,'strong');
 const b=run(chart('경신','경신','갑신','경신'));
 assert.equal(b.hypothesis.evidence.substantialRootPositions.length,0);
 assert.ok(b.hypothesis.weakGrounds.includes('shallow-or-absent-roots-adverse-season'));
 assert.equal(b.direction,'weak');
 const c=run(chart('병자','갑오','신해','신묘'));
 assert.equal(c.hypothesis.evidence.dayRootPositions.length,0);
 assert.equal(c.hypothesis.strongGrounds.length,0);
});
test('transition month retains disagreement rather than claiming seasonal command',()=>{
 const r=run(chart('갑신','임진','병자','무인'));
 assert.equal(r.hypothesis.evidence.season,'mixed');
 assert.equal(r.hypothesis.evidence.seasonalSupport,true);
 assert.equal(r.hypothesis.evidence.principalSupport,false);
});
test('partial and provisional cannot emit full-chart direction',()=>{
 const saju=chart('무술','갑자','정미');
 const r=run(saju);
 assert.equal(r.status,'partial');assert.equal(r.direction,null);
 assert.ok(r.caveats.includes('missing-hour'));
 const provisional=analyzeStructuralStrength({saju,...opts,birthBasis:'provisional-chart'});
 assert.equal(provisional.status,'provisional');assert.equal(provisional.hypothesis,null);
 assert.throws(()=>analyzeStructuralStrength({saju}),{code:'strength-policy'});
 assert.throws(()=>analyzeStructuralStrength({...opts,saju,birthBasis:'unknown'}),{code:'strength-birth-basis'});
 assert.throws(()=>run(chart('갑축','을묘','갑진')));
});
test('deterministic, immutable, no final strength or special pattern',()=>{
 const saju=chart('경신','임자','갑인','병오');saju.privateMarker='private';
 const before=JSON.stringify(saju),r=run(saju);
 assert.deepEqual(run(saju),r);assert.equal(JSON.stringify(saju),before);
 assert.ok(!JSON.stringify(r).includes('privateMarker'));
 assert.equal(r.specialPatternAssessment,'not-assessed');
 assert.equal('category' in r,false);assert.equal('score' in r,false);assert.equal('quantitative' in r,false);
});
